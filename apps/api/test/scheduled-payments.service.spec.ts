import { Test, TestingModule } from '@nestjs/testing';
import { ScheduledPaymentsService } from '../src/scheduled-payments/scheduled-payments.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('ScheduledPaymentsService', () => {
  let service: ScheduledPaymentsService;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    prisma = {
      account: { findFirst: jest.fn() },
      scheduledPayment: { findMany: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn() },
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [ScheduledPaymentsService, PrismaService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<ScheduledPaymentsService>(ScheduledPaymentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create should throw NotFoundException for missing source account', async () => {
    prisma.account.findFirst.mockResolvedValue(null);
    await expect(service.create('1', { type: 'BILL_PAYMENT', amount: 1000, sourceAccountId: 'missing', destinationType: 'BILL', destinationValue: '123', frequency: 'MONTHLY', startDate: '2024-01-01' })).rejects.toThrow('Source account not found');
  });

  it('pause should throw NotFoundException for missing scheduled payment', async () => {
    prisma.scheduledPayment.findFirst.mockResolvedValue(null);
    await expect(service.pause('missing', '1')).rejects.toThrow('Scheduled payment not found');
  });

  it('update should throw NotFoundException for missing scheduled payment', async () => {
    prisma.scheduledPayment.findFirst.mockResolvedValue(null);
    await expect(service.update('missing', '1', { amount: 2000 })).rejects.toThrow('Scheduled payment not found');
  });

  it('update should throw BadRequestException for cancelled scheduled payment', async () => {
    prisma.scheduledPayment.findFirst.mockResolvedValue({ id: '1', status: 'CANCELLED' } as any);
    await expect(service.update('1', '1', { amount: 2000 })).rejects.toThrow('Cannot update cancelled scheduled payment');
  });

  it('update should successfully update an active scheduled payment', async () => {
    prisma.scheduledPayment.findFirst.mockResolvedValue({ id: '1', status: 'ACTIVE', amount: 1000 } as any);
    prisma.scheduledPayment.update.mockResolvedValue({ id: '1', status: 'ACTIVE', amount: 2000 } as any);
    const result = await service.update('1', '1', { amount: 2000 });
    expect(result.amount).toBe(2000);
    expect(prisma.scheduledPayment.update).toHaveBeenCalled();
  });
});
