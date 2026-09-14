import {
  BadRequestException,
  NotFoundException,
  RequestMethod,
} from '@nestjs/common';
import 'reflect-metadata';
import { LoansController } from '../src/lending/loans.controller';
import { LoansService } from '../src/lending/loans.service';
import { BudgetsController } from '../src/budgets/budgets.controller';
import { GoalsController } from '../src/goals/goals.controller';
import { PaymentsController } from '../src/payments/payments.controller';
import { PaymentsService } from '../src/payments/payments.service';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';

describe('Wave 0 financial contracts', () => {
  it('exposes loan payment as POST /loans/:id/pay with JWT and idempotency support', async () => {
    const service = { makePayment: jest.fn().mockResolvedValue({ id: 'payment' }) } as unknown as LoansService;
    const controller = new LoansController(service);
    const request = { user: { id: 'user-1' } };

    await expect(controller.payInstallment(request as any, 'loan-1', { amount: 0 }, 'key-1'))
      .rejects.toThrow(BadRequestException);

    await controller.payInstallment(request as any, 'loan-1', { amount: 1000 }, 'key-1');

    expect(service.makePayment).toHaveBeenCalledWith('user-1', 'loan-1', 1000, 'key-1');
    expect(Reflect.getMetadata('path', controller.payInstallment)).toBe(':id/pay');
    expect(Reflect.getMetadata('method', controller.payInstallment)).toBe(RequestMethod.POST);
    expect(Reflect.getMetadata('__guards__', LoansController)).toContain(JwtAuthGuard);
  });

  it('exposes destructive budget and goal removal as DELETE with ownership context', async () => {
    const budgetsService = { remove: jest.fn().mockResolvedValue({ success: true }) } as any;
    const goalsService = { remove: jest.fn().mockResolvedValue({ success: true }) } as any;
    const budgetsController = new BudgetsController(budgetsService);
    const goalsController = new GoalsController(goalsService);
    const request = { user: { id: 'user-1' } };

    await budgetsController.remove(request as any, 'budget-1');
    await goalsController.remove(request as any, 'goal-1');

    expect(budgetsService.remove).toHaveBeenCalledWith('budget-1', 'user-1');
    expect(goalsService.remove).toHaveBeenCalledWith('goal-1', 'user-1');
    expect(Reflect.getMetadata('path', budgetsController.remove)).toBe(':id');
    expect(Reflect.getMetadata('method', budgetsController.remove)).toBe(RequestMethod.DELETE);
    expect(Reflect.getMetadata('path', goalsController.remove)).toBe(':id');
    expect(Reflect.getMetadata('method', goalsController.remove)).toBe(RequestMethod.DELETE);
    expect(Reflect.getMetadata('__guards__', BudgetsController)).toContain(JwtAuthGuard);
    expect(Reflect.getMetadata('__guards__', GoalsController)).toContain(JwtAuthGuard);
  });

  it('passes payment idempotency key from the header to the payment service', async () => {
    const service = { create: jest.fn().mockResolvedValue({ id: 'payment-1' }) } as unknown as PaymentsService;
    const controller = new PaymentsController(service);
    const request = { user: { id: 'user-1' }, headers: { 'x-request-id': 'request-1' } };
    const dto = { type: 'DOMESTIC_TRANSFER', amount: 1000, sourceAccountId: 'account-1', destinationType: 'ACCOUNT', destinationValue: 'destination' };

    await controller.create(request as any, dto, 'key-1');

    expect(service.create).toHaveBeenCalledWith('user-1', dto, 'key-1', 'request-1');
    expect(Reflect.getMetadata('method', controller.create)).toBe(RequestMethod.POST);
    expect(Reflect.getMetadata('__guards__', PaymentsController)).toContain(JwtAuthGuard);
  });

  it('returns the completed payment for a duplicate idempotency key without re-executing it', async () => {
    const prisma: any = { account: { findFirst: jest.fn() }, $transaction: jest.fn() };
    const notificationsService: any = {};
    const paymentAuditService: any = {};
    const idempotencyService: any = {
      checkAndReserveWithHash: jest.fn().mockResolvedValue({
        status: 'COMPLETED',
        response: { id: 'existing-payment', status: 'COMPLETED' },
      }),
      markCompleted: jest.fn(),
      markFailed: jest.fn(),
    };
    const riskEngineService: any = {};
    const service = new PaymentsService(
      prisma,
      notificationsService,
      paymentAuditService,
      idempotencyService,
      riskEngineService,
    );
    const dto = {
      type: 'DOMESTIC_TRANSFER',
      amount: 1000,
      sourceAccountId: 'account-1',
      destinationType: 'ACCOUNT',
      destinationValue: 'destination',
    };

    await expect(service.create('user-1', dto, 'key-1', 'request-1'))
      .resolves.toEqual({ id: 'existing-payment', status: 'COMPLETED' });

    expect(idempotencyService.checkAndReserveWithHash).toHaveBeenCalledWith(
      'key-1',
      'user-1',
      'PAYMENT',
      expect.any(String),
    );
    expect(prisma.account.findFirst).not.toHaveBeenCalled();
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('processes, rejects, and deduplicates loan payments with ownership and terminal-state checks', async () => {
    const prisma: any = {
      loan: { findFirst: jest.fn() },
      $transaction: jest.fn(),
    };
    const creditAuditService: any = { logAction: jest.fn() };
    const service = new LoansService(prisma, {} as any, creditAuditService);
    const loan = { id: 'loan-1', userId: 'user-1', status: 'ACTIVE', currency: 'IRT' };
    prisma.loan.findFirst.mockResolvedValueOnce(loan);

    const transaction: any = {
      loanPayment: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: 'payment-1', amount: 1000 }),
      },
      loanInstallment: {
        findMany: jest.fn().mockResolvedValue([
          { id: 'installment-1', paidAmount: 0, remainingAmount: 1000, status: 'DUE' },
        ]),
        update: jest.fn(),
      },
      loan: {
        update: jest.fn(),
        findUnique: jest.fn().mockResolvedValue({ remainingBalance: 0, status: 'ACTIVE' }),
      },
    };
    prisma.$transaction.mockImplementationOnce(async (callback: any) => callback(transaction));

    await service.makePayment('user-1', 'loan-1', 1000, 'key-1');

    expect(prisma.loan.findFirst).toHaveBeenCalledWith({ where: { id: 'loan-1', userId: 'user-1' } });
    expect(transaction.loanPayment.findFirst).toHaveBeenCalledWith({ where: { idempotencyKey: 'key-1' } });
    expect(transaction.loanPayment.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        loanId: 'loan-1',
        amount: 1000,
        currency: 'IRT',
        status: 'COMPLETED',
        paymentDate: expect.any(Date),
        idempotencyKey: 'key-1',
      },
    });
    expect(transaction.loan.update).toHaveBeenCalledWith({
      where: { id: 'loan-1' },
      data: { remainingBalance: { decrement: 1000 } },
    });

    prisma.loan.findFirst.mockResolvedValueOnce(null);
    await expect(service.makePayment('user-1', 'missing-loan', 1000, 'key-1'))
      .rejects.toThrow(NotFoundException);

    prisma.loan.findFirst.mockResolvedValueOnce({ ...loan, status: 'COMPLETED' });
    await expect(service.makePayment('user-1', 'loan-1', 1000, 'key-1'))
      .rejects.toThrow(BadRequestException);

    prisma.loan.findFirst.mockResolvedValueOnce(loan);
    const duplicate = { id: 'payment-1', amount: 1000 };
    const duplicateTransaction: any = {
      loanPayment: { findFirst: jest.fn().mockResolvedValue(duplicate), create: jest.fn() },
      loanInstallment: { findMany: jest.fn() },
      loan: { update: jest.fn(), findUnique: jest.fn() },
    };
    prisma.$transaction.mockImplementationOnce(async (callback: any) => callback(duplicateTransaction));

    await expect(service.makePayment('user-1', 'loan-1', 1000, 'key-1')).resolves.toEqual(duplicate);
    expect(duplicateTransaction.loanPayment.create).not.toHaveBeenCalled();
    expect(duplicateTransaction.loan.update).not.toHaveBeenCalled();
  });
});
