import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EligibilityEngineService } from '../credit/credit-eligibility.service';
import { CreditAuditService } from '../credit/credit-audit.service';
import { CreditScoreService } from '../credit/credit-score.service';
import { VALID_APPLICATION_TRANSITIONS, TERMINAL_APPLICATION_STATES } from './application-state-machine';
import { randomUUID } from 'crypto';

@Injectable()
export class LoanApplicationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eligibilityEngineService: EligibilityEngineService,
    private readonly creditAuditService: CreditAuditService,
    private readonly creditScoreService: CreditScoreService,
  ) {}

  async findAll(userId: string) {
    return this.prisma.loanApplication.findMany({
      where: { userId },
      include: { loanProduct: true, loan: { select: { id: true, status: true, remainingBalance: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const application = await this.prisma.loanApplication.findFirst({
      where: { id, userId },
      include: { loanProduct: true, loan: true },
    });
    if (!application) throw new NotFoundException('Loan application not found');
    return application;
  }

  async create(userId: string, dto: { loanProductId: string; requestedAmount: number; durationMonths: number; currency?: string; purpose?: string }) {
    const product = await this.prisma.loanProduct.findUnique({ where: { id: dto.loanProductId } });
    if (!product) throw new NotFoundException('Loan product not found');
    if (!product.isActive || product.status !== 'ACTIVE') {
      throw new BadRequestException('Loan product is not available for application');
    }

    if (dto.requestedAmount < product.minAmount || dto.requestedAmount > product.maxAmount) {
      throw new BadRequestException(`Requested amount must be between ${product.minAmount} and ${product.maxAmount}`);
    }

    const requestId = randomUUID();
    const application = await this.prisma.loanApplication.create({
      data: {
        userId,
        loanProductId: dto.loanProductId,
        requestedAmount: dto.requestedAmount,
        durationMonths: dto.durationMonths,
        currency: (dto.currency || product.currency) as any,
        purpose: dto.purpose,
        status: 'DRAFT',
      },
    });

    await this.creditAuditService.logAction(userId, 'LOAN_APPLICATION_CREATED', 'DRAFT', {
      requestId,
      metadata: { productId: dto.loanProductId, amount: dto.requestedAmount, duration: dto.durationMonths },
      loanApplicationId: application.id,
    });

    return application;
  }

  async update(id: string, userId: string, dto: { purpose?: string; durationMonths?: number }) {
    const application = await this.prisma.loanApplication.findFirst({ where: { id, userId } });
    if (!application) throw new NotFoundException('Loan application not found');
    if (TERMINAL_APPLICATION_STATES.includes(application.status)) {
      throw new BadRequestException(`Cannot modify application in ${application.status} state`);
    }

    const data: any = { updatedAt: new Date() };
    if (dto.purpose !== undefined) data.purpose = dto.purpose;
    if (dto.durationMonths !== undefined) data.durationMonths = dto.durationMonths;

    return this.prisma.loanApplication.update({ where: { id }, data });
  }

  async submit(id: string, userId: string, requestId?: string) {
    const application = await this.prisma.loanApplication.findFirst({
      where: { id, userId },
      include: { loanProduct: true },
    });
    if (!application) throw new NotFoundException('Loan application not found');

    if (!this.isValidTransition(application.status, 'SUBMITTED')) {
      throw new BadRequestException(`Cannot submit application from ${application.status} state`);
    }

    const updated = await this.prisma.loanApplication.update({
      where: { id },
      data: { status: 'SUBMITTED', submittedAt: new Date() },
    });

    await this.creditAuditService.logAction(userId, 'LOAN_APPLICATION_SUBMITTED', 'SUBMITTED', {
      requestId: requestId || randomUUID(),
      metadata: { productId: application.loanProductId, amount: application.requestedAmount },
      loanApplicationId: application.id,
    });

    return updated;
  }

  async review(id: string, userId: string, decision: 'APPROVE' | 'REJECT', reason?: string, requestId?: string) {
    const application = await this.prisma.loanApplication.findFirst({
      where: { id, userId },
      include: { loanProduct: true },
    });
    if (!application) throw new NotFoundException('Loan application not found');

    if (application.status !== 'SUBMITTED' && application.status !== 'UNDER_REVIEW') {
      throw new BadRequestException(`Cannot review application from ${application.status} state`);
    }

    const newStatus = decision === 'APPROVE' ? 'APPROVED' : 'REJECTED';

    if (!this.isValidTransition(application.status, newStatus) && application.status !== 'SUBMITTED') {
      throw new BadRequestException(`Cannot transition from ${application.status} to ${newStatus}`);
    }

    await this.prisma.loanApplication.update({
      where: { id },
      data: {
        status: newStatus,
        reviewedAt: new Date(),
        approvedAt: decision === 'APPROVE' ? new Date() : undefined,
        rejectedAt: decision === 'REJECT' ? new Date() : undefined,
        rejectionReason: decision === 'REJECT' ? reason : undefined,
      },
    });

    const action = decision === 'APPROVE' ? 'LOAN_APPLICATION_APPROVED' : 'LOAN_APPLICATION_REJECTED';
    await this.creditAuditService.logAction(userId, action, newStatus, {
      requestId: requestId || randomUUID(),
      failureReason: decision === 'REJECT' ? reason : undefined,
      metadata: { productId: application.loanProductId, amount: application.requestedAmount, riskLevel: application.riskLevel },
      loanApplicationId: application.id,
    });

    return { status: newStatus, applicationId: application.id };
  }

  async cancel(id: string, userId: string, requestId?: string) {
    const application = await this.prisma.loanApplication.findFirst({ where: { id, userId } });
    if (!application) throw new NotFoundException('Loan application not found');

    if (!this.isValidTransition(application.status, 'CANCELLED')) {
      throw new BadRequestException(`Cannot cancel application from ${application.status} state`);
    }

    const updated = await this.prisma.loanApplication.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    await this.creditAuditService.logAction(userId, 'LOAN_APPLICATION_CANCELLED' as any, 'CANCELLED', {
      requestId: requestId || randomUUID(),
      loanApplicationId: application.id,
    });

    return updated;
  }

  private isValidTransition(currentStatus: string, targetStatus: string): boolean {
    const allowed = VALID_APPLICATION_TRANSITIONS[currentStatus];
    return allowed ? allowed.includes(targetStatus) : false;
  }
}
