import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoanCalculationService } from './loan-calculator.service';
import { VALID_LOAN_TRANSITIONS, TERMINAL_LOAN_STATES } from './lending-state-machine';
import { CreditAuditService } from '../credit/credit-audit.service';
import { randomUUID } from 'crypto';

@Injectable()
export class LoansService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly loanCalculationService: LoanCalculationService,
    private readonly creditAuditService: CreditAuditService,
  ) {}

  async findAll(userId: string) {
    return this.prisma.loan.findMany({
      where: { userId },
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const loan = await this.prisma.loan.findFirst({
      where: { id, userId },
      include: { product: true, application: true, installments: { orderBy: { installmentNumber: 'asc' } } },
    });
    if (!loan) throw new NotFoundException('Loan not found');
    return loan;
  }

  async activate(applicationId: string, userId: string, startDate?: string): Promise<any> {
    const application = await this.prisma.loanApplication.findFirst({
      where: { id: applicationId, userId },
      include: { loanProduct: true },
    });
    if (!application) throw new NotFoundException('Loan application not found');
    if (application.status !== 'APPROVED') {
      throw new BadRequestException('Only approved applications can be activated');
    }

    const existingLoan = await this.prisma.loan.findUnique({ where: { loanApplicationId: applicationId } });
    if (existingLoan) throw new BadRequestException('Loan already created for this application');

    const requestId = randomUUID();
    const loanStartDate = startDate ? new Date(startDate) : new Date();

    const calculation = this.loanCalculationService.calculateLoan({
      principal: application.requestedAmount,
      annualInterestRate: application.loanProduct.interestRate,
      durationMonths: application.durationMonths,
      startDate: loanStartDate,
      currency: application.currency,
    });

    const loan = await this.prisma.$transaction(async (tx: any) => {
      const createdLoan = await tx.loan.create({
        data: {
          userId,
          loanApplicationId: application.id,
          loanProductId: application.loanProductId,
          principal: calculation.principal,
          interestAmount: calculation.interestAmount,
          totalPayable: calculation.totalPayable,
          remainingBalance: calculation.totalPayable,
          currency: application.currency,
          status: 'APPROVED',
          startDate: loanStartDate,
          maturityDate: calculation.installments[calculation.installments.length - 1].dueDate,
        },
      });

      await tx.loanApplication.update({
        where: { id: application.id },
        data: { loanId: createdLoan.id },
      });

      for (const inst of calculation.installments) {
        await tx.loanInstallment.create({
          data: {
            userId,
            loanId: createdLoan.id,
            installmentNumber: inst.installmentNumber,
            dueDate: inst.dueDate,
            principalAmount: inst.principalAmount,
            interestAmount: inst.interestAmount,
            totalAmount: inst.totalAmount,
            paidAmount: 0,
            remainingAmount: inst.totalAmount,
            status: 'PENDING',
          },
        });
      }

      await tx.loan.update({
        where: { id: createdLoan.id },
        data: { status: 'ACTIVE' },
      });

      await this.creditAuditService.logAction(userId, 'LOAN_CREATED', 'APPROVED', {
        requestId,
        metadata: {
          principal: calculation.principal,
          interestAmount: calculation.interestAmount,
          totalPayable: calculation.totalPayable,
          installmentCount: calculation.installments.length,
        },
        loanId: createdLoan.id,
        loanApplicationId: application.id,
      });

      await this.creditAuditService.logAction(userId, 'LOAN_ACTIVATED', 'ACTIVE', {
        requestId,
        loanId: createdLoan.id,
      });

      await this.creditAuditService.logAction(userId, 'INSTALLMENT_GENERATED', 'CREATED', {
        requestId,
        metadata: { count: calculation.installments.length },
        loanId: createdLoan.id,
      });

      return createdLoan;
    });

    return this.prisma.loan.findUnique({
      where: { id: loan.id },
      include: { product: true, installments: { orderBy: { installmentNumber: 'asc' } } },
    });
  }

  async makePayment(userId: string, loanId: string, amount: number, idempotencyKey?: string): Promise<any> {
    const loan = await this.prisma.loan.findFirst({ where: { id: loanId, userId } });
    if (!loan) throw new NotFoundException('Loan not found');

    if (TERMINAL_LOAN_STATES.includes(loan.status)) {
      throw new BadRequestException(`Cannot make payment on loan in ${loan.status} state`);
    }

    return this.prisma.$transaction(async (tx: any) => {
      let payment = await tx.loanPayment.findFirst({
        where: idempotencyKey ? { idempotencyKey } : undefined,
      });
      if (payment) return payment;

      const dueInstallments = await tx.loanInstallment.findMany({
        where: { loanId, status: { in: ['DUE', 'PARTIALLY_PAID', 'OVERDUE'] } },
        orderBy: [{ dueDate: 'asc' }, { installmentNumber: 'asc' }],
      });

      if (dueInstallments.length === 0) {
        const pendingInstallments = await tx.loanInstallment.findMany({
          where: { loanId, status: 'PENDING' },
          orderBy: [{ dueDate: 'asc' }, { installmentNumber: 'asc' }],
        });
        if (pendingInstallments.length === 0) throw new BadRequestException('No installments due');
        dueInstallments.push(...pendingInstallments);
      }

      let remainingAmount = amount;
      const payments: any[] = [];

      for (const installment of dueInstallments) {
        if (remainingAmount <= 0) break;
        const paymentAmount = Math.min(remainingAmount, installment.remainingAmount);
        remainingAmount -= paymentAmount;

        const updatedPaid = installment.paidAmount + paymentAmount;
        const updatedRemaining = installment.remainingAmount - paymentAmount;
        const newStatus = updatedRemaining <= 0 ? 'PAID' : installment.status === 'OVERDUE' ? 'OVERDUE' : 'PARTIALLY_PAID';

        await tx.loanInstallment.update({
          where: { id: installment.id },
          data: {
            paidAmount: updatedPaid,
            remainingAmount: updatedRemaining,
            status: newStatus,
            paidAt: newStatus === 'PAID' ? new Date() : null,
          },
        });

        payments.push({ installmentId: installment.id, amount: paymentAmount });
      }

      const actualAmount = amount - remainingAmount;

      const loanPayment = await tx.loanPayment.create({
        data: {
          userId,
          loanId,
          amount: actualAmount,
          currency: loan.currency,
          status: 'COMPLETED',
          paymentDate: new Date(),
          idempotencyKey: idempotencyKey || null,
        },
      });

      await tx.loan.update({
        where: { id: loanId },
        data: { remainingBalance: { decrement: actualAmount } },
      });

      const loanAfter = await tx.loan.findUnique({ where: { id: loanId } });
      if (loanAfter && loanAfter.remainingBalance <= 0 && loanAfter.status === 'ACTIVE') {
        await tx.loan.update({
          where: { id: loanId },
          data: { status: 'COMPLETED' },
        });
        await this.creditAuditService.logAction(userId, 'LOAN_COMPLETED', 'COMPLETED', {
          requestId: idempotencyKey || randomUUID(),
          loanId,
        });
      }

      await this.creditAuditService.logAction(userId, 'LOAN_PAYMENT_COMPLETED', 'COMPLETED', {
        requestId: idempotencyKey || randomUUID(),
        metadata: { amount: actualAmount, overpayment: remainingAmount },
        loanId,
      });

      return loanPayment;
    });
  }

  async getInstallments(userId: string, loanId: string) {
    const loan = await this.prisma.loan.findFirst({ where: { id: loanId, userId } });
    if (!loan) throw new NotFoundException('Loan not found');
    return this.prisma.loanInstallment.findMany({
      where: { loanId },
      orderBy: { installmentNumber: 'asc' },
    });
  }

  async getDefaultedLoans(userId: string) {
    return this.prisma.loan.findMany({
      where: { userId, status: 'DEFAULTED' },
      include: { product: true },
    });
  }

  private isValidTransition(currentStatus: string, targetStatus: string): boolean {
    const allowed = VALID_LOAN_TRANSITIONS[currentStatus];
    return allowed ? allowed.includes(targetStatus) : false;
  }
}
