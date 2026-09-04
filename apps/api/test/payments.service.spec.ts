import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from '../src/payments/payments.service';
import { PaymentAuditService } from '../src/payments/payments-audit.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { NotificationsService } from '../src/notifications/notifications.service';
import { IdempotencyService } from '../src/common/idempotency.service';
import { RiskEngineService } from '../src/common/risk-engine.service';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let prisma: jest.Mocked<PrismaService>;
  let notificationsService: jest.Mocked<NotificationsService>;
  let idempotencyService: jest.Mocked<IdempotencyService>;
  let riskEngineService: jest.Mocked<RiskEngineService>;
  let paymentAuditService: jest.Mocked<PaymentAuditService>;

  beforeEach(async () => {
    prisma = {
      account: { findFirst: jest.fn(), update: jest.fn() },
      payment: { findFirst: jest.fn(), create: jest.fn(), findMany: jest.fn(), update: jest.fn() },
      paymentExecution: { create: jest.fn() },
      paymentAudit: { create: jest.fn(), findMany: jest.fn() },
      idempotencyKey: { findFirst: jest.fn(), updateMany: jest.fn() },
    } as any;

    notificationsService = {
      getPreferences: jest.fn(),
      createNotification: jest.fn(),
    } as any;

    idempotencyService = {
      checkAndReserve: jest.fn(),
      checkAndReserveWithHash: jest.fn(),
      markCompleted: jest.fn(),
      markFailed: jest.fn(),
    } as any;

    riskEngineService = {
      evaluate: jest.fn(),
    } as any;

    paymentAuditService = {
      logAction: jest.fn(),
      getAuditTrail: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        PrismaService,
        NotificationsService,
        IdempotencyService,
        RiskEngineService,
        PaymentAuditService,
        { provide: PrismaService, useValue: prisma },
        { provide: NotificationsService, useValue: notificationsService },
        { provide: IdempotencyService, useValue: idempotencyService },
        { provide: RiskEngineService, useValue: riskEngineService },
        { provide: PaymentAuditService, useValue: paymentAuditService },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findOne should throw NotFoundException for missing payment', async () => {
    prisma.payment.findFirst.mockResolvedValue(null);
    await expect(service.findOne('missing', '1')).rejects.toThrow('Payment not found');
  });

  it('create should throw NotFoundException for missing source account', async () => {
    prisma.account.findFirst.mockResolvedValue(null);
    await expect(service.create('1', { type: 'DOMESTIC_TRANSFER', amount: 1000, sourceAccountId: 'missing', destinationType: 'ACCOUNT', destinationValue: '123' })).rejects.toThrow('Source account not found');
  });

  it('create should throw ForbiddenException for inactive account', async () => {
    prisma.account.findFirst.mockResolvedValue({ id: '1', isActive: false, balance: 1000000 } as any);
    await expect(service.create('1', { type: 'DOMESTIC_TRANSFER', amount: 1000, sourceAccountId: '1', destinationType: 'ACCOUNT', destinationValue: '123' })).rejects.toThrow('Cannot pay from inactive account');
  });

  it('create should throw BadRequestException for insufficient balance', async () => {
    prisma.account.findFirst.mockResolvedValue({ id: '1', isActive: true, balance: 500 } as any);
    await expect(service.create('1', { type: 'DOMESTIC_TRANSFER', amount: 1000, sourceAccountId: '1', destinationType: 'ACCOUNT', destinationValue: '123' })).rejects.toThrow('Insufficient balance');
  });

  it('cancel should throw NotFoundException for missing payment', async () => {
    prisma.payment.findFirst.mockResolvedValue(null);
    await expect(service.cancel('missing', '1')).rejects.toThrow('Payment not found');
  });

  it('cancel should throw BadRequestException for non-completed payment', async () => {
    prisma.payment.findFirst.mockResolvedValue({ id: '1', status: 'PENDING' } as any);
    await expect(service.cancel('1', '1')).rejects.toThrow('Cannot transition from PENDING to REVERSED');
  });
});
