import { Test, TestingModule } from '@nestjs/testing';
import { InvestmentTransactionsService } from '../src/investments/investment-transactions.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { HoldingsService } from '../src/investments/holdings.service';
import { NotificationsService } from '../src/notifications/notifications.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('InvestmentTransactionsService', () => {
  let service: InvestmentTransactionsService;
  let prisma: jest.Mocked<PrismaService>;
  let mockHoldingsService: jest.Mocked<HoldingsService>;
  let mockNotificationsService: jest.Mocked<NotificationsService>;

  beforeEach(async () => {
    mockHoldingsService = {
      updateHoldingsAfterTransaction: jest.fn(),
      recalculateForAccount: jest.fn(),
    } as any;

    mockNotificationsService = {
      checkDividendNotifications: jest.fn(),
    } as any;

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

  describe('findAll', () => {
    it('should return paginated transactions scoped to user', async () => {
      const mockTx = [
        {
          id: 'tx1',
          userId: 'user1',
          accountId: 'acc1',
          assetId: 'asset1',
          transactionType: 'BUY',
          quantity: 100,
          price: 195,
          amount: 19500,
          fees: 5,
          currency: 'USD',
          transactionDate: new Date(),
          reference: 'REF001',
          notes: 'Test buy',
          createdAt: new Date(),
          updatedAt: new Date(),
          asset: { id: 'asset1', symbol: 'AAPL', name: 'Apple', assetType: 'STOCK' },
        },
      ];
      prisma.investmentTransaction.findMany.mockResolvedValue(mockTx);
      prisma.investmentTransaction.count.mockResolvedValue(1);

      const result = await service.findAll('user1', { page: 1, limit: 50 });

      expect(result.data.length).toBe(1);
      expect(result.meta.total).toBe(1);
      expect(result.data[0].userId).toBe('user1');
      expect(prisma.investmentTransaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user1' },
        }),
      );
    });

    it('should filter by transaction type', async () => {
      prisma.investmentTransaction.findMany.mockResolvedValue([]);
      prisma.investmentTransaction.count.mockResolvedValue(0);

      await service.findAll('user1', { transactionType: 'DIVIDEND' });

      expect(prisma.investmentTransaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: 'user1',
            transactionType: 'DIVIDEND',
          }),
        }),
      );
    });

    it('should filter by date range', async () => {
      prisma.investmentTransaction.findMany.mockResolvedValue([]);
      prisma.investmentTransaction.count.mockResolvedValue(0);

      await service.findAll('user1', {
        fromDate: '2024-01-01T00:00:00Z',
        toDate: '2024-12-31T23:59:59Z',
      });

      expect(prisma.investmentTransaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            transactionDate: expect.objectContaining({
              gte: new Date('2024-01-01T00:00:00Z'),
              lte: new Date('2024-12-31T23:59:59Z'),
            }),
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException for missing transaction', async () => {
      prisma.investmentTransaction.findFirst.mockResolvedValue(null);
      await expect(service.findOne('missing', 'user1')).rejects.toThrow('Investment transaction not found');
    });
  });

  describe('create', () => {
    it('should throw NotFoundException for missing account', async () => {
      prisma.investmentAccount.findFirst.mockResolvedValue(null);
      await expect(service.create('user1', {
        accountId: 'missing',
        transactionType: 'DEPOSIT',
        amount: 1000,
        transactionDate: '2024-01-15T00:00:00.000Z',
      })).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for inactive account', async () => {
      prisma.investmentAccount.findFirst.mockResolvedValue({ id: 'acc1', status: 'CLOSED' });
      await expect(service.create('user1', {
        accountId: 'acc1',
        transactionType: 'DEPOSIT',
        amount: 1000,
        transactionDate: '2024-01-15T00:00:00.000Z',
      })).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for BUY without assetId', async () => {
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

    it('should create transaction successfully for DEPOSIT', async () => {
      prisma.investmentAccount.findFirst.mockResolvedValue({ id: 'acc1', status: 'ACTIVE' });

      const txMock = {
        investmentTransaction: {
          create: jest.fn().mockResolvedValue({
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
          }),
        },
        investmentAccount: {
          update: jest.fn(),
        },
      };
      prisma.$transaction.mockImplementation(async (callback: any) => callback(txMock));

      const result = await service.create('user1', {
        accountId: 'acc1',
        transactionType: 'DEPOSIT',
        amount: 1000,
        transactionDate: '2024-01-15T00:00:00.000Z',
      });

      expect(result.id).toBe('tx1');
      expect(result.transactionType).toBe('DEPOSIT');
    });

    it('should validate asset exists before creating BUY transaction', async () => {
      prisma.investmentAccount.findFirst.mockResolvedValue({ id: 'acc1', status: 'ACTIVE' });
      prisma.asset.findUnique.mockResolvedValue(null);
      await expect(service.create('user1', {
        accountId: 'acc1',
        assetId: 'missing',
        transactionType: 'BUY',
        quantity: 100,
        price: 195,
        amount: 19500,
        transactionDate: '2024-01-15T00:00:00.000Z',
      })).rejects.toThrow(NotFoundException);
    });

    it('should trigger dividend notification for DIVIDEND transaction', async () => {
      prisma.investmentAccount.findFirst.mockResolvedValue({ id: 'acc1', status: 'ACTIVE' });
      const asset = { id: 'asset1', symbol: 'AAPL', isActive: true };
      prisma.asset.findUnique.mockResolvedValue(asset);
      const createdTx = {
        id: 'tx1',
        userId: 'user1',
        accountId: 'acc1',
        assetId: 'asset1',
        transactionType: 'DIVIDEND',
        amount: 50,
        fees: 0,
        currency: 'USD',
        transactionDate: new Date('2024-06-15'),
        createdAt: new Date(),
        updatedAt: new Date(),
        asset,
      };
      const txMock = {
        investmentTransaction: { create: jest.fn().mockResolvedValue(createdTx) },
      };
      prisma.$transaction.mockImplementation(async (callback: any) => callback(txMock));

      await service.create('user1', {
        accountId: 'acc1',
        assetId: 'asset1',
        transactionType: 'DIVIDEND',
        amount: 50,
        currency: 'USD',
        transactionDate: '2024-06-15T00:00:00.000Z',
      });

      expect(mockNotificationsService.checkDividendNotifications).toHaveBeenCalledWith('user1', createdTx);
    });
  });

  describe('calculateCashEffect', () => {
    it('should correctly increment cash for DEPOSIT', async () => {
      prisma.investmentAccount.findFirst.mockResolvedValue({ id: 'acc1', status: 'ACTIVE' });
      prisma.investmentAccount.findUnique.mockResolvedValue({ id: 'acc1', cashBalance: 0 } as any);

      const txMock = {
        investmentTransaction: {
          create: jest.fn().mockResolvedValue({
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
          }),
        },
      };
      prisma.$transaction.mockImplementation(async (callback: any) => callback(txMock));

      await service.create('user1', {
        accountId: 'acc1',
        transactionType: 'DEPOSIT',
        amount: 1000,
        transactionDate: '2024-01-15T00:00:00.000Z',
      });

      expect(prisma.investmentAccount.update).toHaveBeenCalledWith({
        where: { id: 'acc1' },
        data: { cashBalance: { increment: 1000 } },
      });
    });

    it('should correctly decrement cash for WITHDRAWAL', async () => {
      prisma.investmentAccount.findFirst.mockResolvedValue({ id: 'acc1', status: 'ACTIVE' });
      prisma.investmentAccount.findUnique.mockResolvedValue({ id: 'acc1', cashBalance: 0 } as any);

      const txMock = {
        investmentTransaction: {
          create: jest.fn().mockResolvedValue({
            id: 'tx1',
            userId: 'user1',
            accountId: 'acc1',
            transactionType: 'WITHDRAWAL',
            amount: 500,
            fees: 0,
            currency: 'USD',
            transactionDate: new Date('2024-01-15'),
            createdAt: new Date(),
            updatedAt: new Date(),
          }),
        },
      };
      prisma.$transaction.mockImplementation(async (callback: any) => callback(txMock));

      await service.create('user1', {
        accountId: 'acc1',
        transactionType: 'WITHDRAWAL',
        amount: 500,
        transactionDate: '2024-01-15T00:00:00.000Z',
      });

      expect(prisma.investmentAccount.update).toHaveBeenCalledWith({
        where: { id: 'acc1' },
        data: { cashBalance: { increment: -500 } },
      });
    });
  });
});
