import { Test, TestingModule } from '@nestjs/testing';
import { IdempotencyService } from '../src/common/idempotency.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { ConflictException } from '@nestjs/common';

describe('IdempotencyService', () => {
  let service: IdempotencyService;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    prisma = {
      idempotencyKey: { findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), updateMany: jest.fn() },
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [IdempotencyService, PrismaService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<IdempotencyService>(IdempotencyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('checkAndReserve should create new key when none exists', async () => {
    prisma.idempotencyKey.findFirst.mockResolvedValue(null);
    const result = await service.checkAndReserve('key-1', 'user-1', 'PAYMENT');
    expect(result.status).toBe('NEW');
    expect(prisma.idempotencyKey.create).toHaveBeenCalled();
  });

  it('checkAndReserve should return completed response for existing completed key', async () => {
    prisma.idempotencyKey.findFirst.mockResolvedValue({ id: '1', key: 'key-1', userId: 'user-1', status: 'COMPLETED', response: { id: 'pay-1' } } as any);
    const result = await service.checkAndReserve('key-1', 'user-1', 'PAYMENT');
    expect(result.status).toBe('COMPLETED');
    expect(result.response).toEqual({ id: 'pay-1' });
  });

  it('checkAndReserve should throw ConflictException for pending key', async () => {
    prisma.idempotencyKey.findFirst.mockResolvedValue({ id: '1', key: 'key-1', userId: 'user-1', status: 'PENDING', expiresAt: new Date(Date.now() + 100000) } as any);
    await expect(service.checkAndReserve('key-1', 'user-1', 'PAYMENT')).rejects.toThrow(ConflictException);
  });

  it('checkAndReserveWithHash should throw ConflictException for hash mismatch', async () => {
    prisma.idempotencyKey.findFirst.mockResolvedValue({ id: '1', key: 'key-1', userId: 'user-1', requestHash: 'hash-a', status: 'COMPLETED', response: { id: 'pay-1' } } as any);
    await expect(
      service.checkAndReserveWithHash('key-1', 'user-1', 'PAYMENT', 'hash-b'),
    ).rejects.toThrow(ConflictException);
  });

  it('checkAndReserveWithHash should allow same hash for completed key', async () => {
    prisma.idempotencyKey.findFirst.mockResolvedValue({ id: '1', key: 'key-1', userId: 'user-1', requestHash: 'hash-a', status: 'COMPLETED', response: { id: 'pay-1' } } as any);
    const result = await service.checkAndReserveWithHash('key-1', 'user-1', 'PAYMENT', 'hash-a');
    expect(result.status).toBe('COMPLETED');
    expect(result.response).toEqual({ id: 'pay-1' });
  });

  it('markCompleted should update status and response', async () => {
    await service.markCompleted('key-1', 'user-1', { id: 'pay-1' });
    expect(prisma.idempotencyKey.updateMany).toHaveBeenCalledWith({
      where: { key: 'key-1', userId: 'user-1', status: 'PENDING' },
      data: { status: 'COMPLETED', response: { id: 'pay-1' } },
    });
  });
});
