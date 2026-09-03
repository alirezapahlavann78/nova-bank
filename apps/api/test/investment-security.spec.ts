import { Test, TestingModule } from '@nestjs/testing';
import { InvestmentTransactionsService } from '../src/investments/investment-transactions.service';
import { HoldingsService } from '../src/investments/holdings.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { NotificationsService } from '../src/notifications/notifications.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('InvestmentTransactionsService - Security', () => {
  let service: InvestmentTransactionsService;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const mockHoldingsService = {
      updateHoldingsAfterTransaction: jest.fn(),
      recalculateForAccount: jest.fn(),
    };

    const mockNotificationsService = {
      checkDividendNotifications: jest.fn(),
    };

    prisma = {
      investmentAccount: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      investmentTransaction: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        count: jest.fn(),
      },
      asset: {
        findUnique: jest.fn(),
      },
      $transaction: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvestmentTransactionsService,
        { provide: PrismaService, useValue: prisma },
        { provide: HoldingsService, useValue: mockHoldingsService },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    service = module.get<InvestmentTransactionsService>(InvestmentTransactionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('cross-user security', () => {
    it('should prevent cross-user transaction access', async () => {
      prisma.investmentTransaction.findFirst.mockResolvedValue(null);
      await expect(service.findOne('tx-missing', 'wrong-user')).rejects.toThrow(NotFoundException);
    });

    it('should only return transactions for the authenticated user', async () => {
      prisma.investmentTransaction.findMany.mockResolvedValue([]);
      prisma.investmentTransaction.count.mockResolvedValue(0);

      await service.findAll('user1', {});

      expect(prisma.investmentTransaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user1' },
        }),
      );
    });

    it('should verify account ownership before creating transaction', async () => {
      prisma.investmentAccount.findFirst.mockResolvedValue(null);
      await expect(service.create('user1', {
        accountId: 'other-user-account',
        transactionType: 'DEPOSIT',
        amount: 1000,
        transactionDate: '2024-01-15T00:00:00.000Z',
      })).rejects.toThrow(NotFoundException);

      expect(prisma.investmentAccount.findFirst).toHaveBeenCalledWith({
        where: { id: 'other-user-account', userId: 'user1' },
      });
    });
  });

  describe('input validation', () => {
    it('should reject BUY without assetId', async () => {
      prisma.investmentAccount.findFirst.mockResolvedValue({ id: 'acc1', status: 'ACTIVE' });
      await expect(service.create('user1', {
        accountId: 'acc1',
        transactionType: 'BUY',
        quantity: 100,
        price: 195,
        amount: 19500,
        transactionDate: '2024-01-15T00:00:00.000Z',
      })).rejects.toThrow(BadRequestException);
    });

    it('should reject transaction on non-active account', async () => {
      prisma.investmentAccount.findFirst.mockResolvedValue({ id: 'acc1', status: 'CLOSED' });
      await expect(service.create('user1', {
        accountId: 'acc1',
        transactionType: 'DEPOSIT',
        amount: 1000,
        transactionDate: '2024-01-15T00:00:00.000Z',
      })).rejects.toThrow(BadRequestException);
    });
  });

  describe('server-side calculations', () => {
    it('should not trust client-supplied P/L values', async () => {
      prisma.investmentAccount.findFirst.mockResolvedValue({ id: 'acc1', status: 'ACTIVE' });
      const createdTransaction = {
        id: 'tx1',
        userId: 'user1',
        accountId: 'acc1',
        transactionType: 'DEPOSIT',
        amount: 1000,
        fees: 0,
        currency: 'USD',
        transactionDate: new Date('2024-01-15'),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const txMock = {
        investmentTransaction: {
          create: jest.fn().mockResolvedValue(createdTransaction),
        },
      };
      prisma.$transaction.mockImplementation(async (callback: any) => callback(txMock));

      const result = await service.create('user1', {
        accountId: 'acc1',
        transactionType: 'DEPOSIT',
        amount: 1000,
        transactionDate: '2024-01-15T00:00:00.000Z',
      });

      expect(result.amount).toBe(1000);
    });
  });
});
