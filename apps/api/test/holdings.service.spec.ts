import { Test, TestingModule } from '@nestjs/testing';
import { HoldingsService } from '../src/investments/holdings.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { MockMarketDataProvider } from '../src/investments/market-data/mock-market-data.provider';

describe('HoldingsService', () => {
  let service: HoldingsService;
  let prisma: jest.Mocked<PrismaService>;
  let mockMarketDataProvider: jest.Mocked<MockMarketDataProvider>;

  beforeEach(async () => {
    mockMarketDataProvider = {
      getCurrentPrice: jest.fn(),
      getPreviousPrice: jest.fn(),
      getAsset: jest.fn(),
      isAvailable: jest.fn(),
    } as any;

    prisma = {
      holding: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
      investmentAccount: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      $transaction: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HoldingsService,
        { provide: PrismaService, useValue: prisma },
        { provide: MockMarketDataProvider, useValue: mockMarketDataProvider },
      ],
    }).compile();

    service = module.get<HoldingsService>(HoldingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated holdings scoped to user', async () => {
      const mockHoldings = [
        {
          id: 'h1',
          userId: 'user1',
          accountId: 'acc1',
          assetId: 'asset1',
          quantity: 100,
          averageCost: 150,
          totalCost: 15000,
          currentValue: 19250,
          unrealizedPL: 4250,
          unrealizedPLPercentage: 28.33,
          lastUpdated: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          asset: { id: 'asset1', symbol: 'AAPL', name: 'Apple', assetType: 'STOCK', currency: 'USD' },
          account: { id: 'acc1' },
        },
      ];
      prisma.holding.findMany.mockResolvedValue(mockHoldings);
      prisma.holding.count.mockResolvedValue(1);
      mockMarketDataProvider.getCurrentPrice.mockResolvedValue(192.5);

      const result = await service.findAll('user1', { page: 1, limit: 50 });

      expect(result.data.length).toBe(1);
      expect(result.meta.total).toBe(1);
      expect(result.data[0].userId).toBe('user1');
      expect(prisma.holding.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user1' },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException for missing holding', async () => {
      prisma.holding.findFirst.mockResolvedValue(null);
      await expect(service.findOne('missing', 'user1')).rejects.toThrow('Holding not found');
    });

    it('should return holding with asset data', async () => {
      const mockHolding = {
        id: 'h1',
        userId: 'user1',
        accountId: 'acc1',
        assetId: 'asset1',
        quantity: 100,
        averageCost: 150,
        totalCost: 15000,
        currentValue: 19250,
        unrealizedPL: 4250,
        unrealizedPLPercentage: 28.33,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        asset: { id: 'asset1', symbol: 'AAPL', name: 'Apple', assetType: 'STOCK', currency: 'USD' },
        account: { id: 'acc1' },
      };
      prisma.holding.findFirst.mockResolvedValue(mockHolding);
      mockMarketDataProvider.getCurrentPrice.mockResolvedValue(192.5);

      const result = await service.findOne('h1', 'user1');
      expect(result.id).toBe('h1');
      expect(result.quantity).toBe(100);
    });
  });

  describe('recalculateForAccount', () => {
    it('should recalculate holdings and account total value', async () => {
      const mockHolding = {
        id: 'h1',
        userId: 'user1',
        accountId: 'acc1',
        assetId: 'asset1',
        quantity: 100,
        totalCost: 15000,
        currentValue: 19250,
        asset: { id: 'asset1', symbol: 'AAPL', previousPrice: 190 },
      };
      prisma.holding.findMany.mockResolvedValue([mockHolding]);
      mockMarketDataProvider.getCurrentPrice.mockResolvedValue(200);
      prisma.investmentAccount.findUnique.mockResolvedValue({
        id: 'acc1',
        userId: 'user1',
        cashBalance: 1000,
        holdings: [{ currentValue: 20000 }],
      } as any);
      prisma.holding.update.mockResolvedValue({} as any);
      prisma.investmentAccount.update.mockResolvedValue({} as any);

      await service.recalculateForAccount('acc1', 'user1');

      expect(mockMarketDataProvider.getCurrentPrice).toHaveBeenCalledWith('AAPL');
      expect(prisma.investmentAccount.update).toHaveBeenCalledWith({
        where: { id: 'acc1' },
        data: { totalValue: 21000 },
      });
    });
  });

  describe('updateHoldingsAfterTransaction - BUY', () => {
    it('should create new holding for BUY transaction when none exists', async () => {
      const txMock = {
        holding: {
          findFirst: jest.fn().mockResolvedValue(null),
          create: jest.fn().mockResolvedValue({ id: 'new-holding' }),
        },
        asset: {
          findUnique: jest.fn().mockResolvedValue({ symbol: 'AAPL' }),
        },
        investmentAccount: {
          update: jest.fn().mockResolvedValue({}),
        },
      };

      prisma.$transaction.mockImplementation(async (callback: any) => callback(txMock));
      mockMarketDataProvider.getCurrentPrice.mockResolvedValue(195);

      prisma.holding.findMany.mockResolvedValue([]);
      prisma.investmentAccount.findUnique.mockResolvedValue({
        id: 'acc1',
        userId: 'user1',
        cashBalance: 1000,
        holdings: [],
      } as any);
      prisma.holding.update.mockResolvedValue({} as any);
      prisma.investmentAccount.update.mockResolvedValue({} as any);

      await service.updateHoldingsAfterTransaction(
        'user1', 'acc1', 'asset1', 'BUY', 100, 195, 19500, 5,
      );

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(txMock.holding.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'user1',
            accountId: 'acc1',
            assetId: 'asset1',
            quantity: 100,
          }),
        }),
      );
    });

    it('should update existing holding for BUY transaction', async () => {
      const txMock = {
        holding: {
          findFirst: jest.fn().mockResolvedValue({
            id: 'h1',
            quantity: 50,
            totalCost: 7500,
            averageCost: 150,
          }),
          update: jest.fn().mockResolvedValue({}),
        },
        asset: {
          findUnique: jest.fn().mockResolvedValue({ symbol: 'AAPL' }),
        },
        investmentAccount: {
          update: jest.fn().mockResolvedValue({}),
        },
      };

      prisma.$transaction.mockImplementation(async (callback: any) => callback(txMock));
      mockMarketDataProvider.getCurrentPrice.mockResolvedValue(200);

      prisma.holding.findMany.mockResolvedValue([]);
      prisma.investmentAccount.findUnique.mockResolvedValue({
        id: 'acc1',
        userId: 'user1',
        cashBalance: 1000,
        holdings: [],
      } as any);
      prisma.holding.update.mockResolvedValue({} as any);
      prisma.investmentAccount.update.mockResolvedValue({} as any);

      await service.updateHoldingsAfterTransaction(
        'user1', 'acc1', 'asset1', 'BUY', 100, 195, 19500, 5,
      );

      expect(txMock.holding.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'h1' },
          data: expect.objectContaining({
            quantity: 150,
            totalCost: 27005,
          }),
        }),
      );
    });
  });

  describe('updateHoldingsAfterTransaction - SELL', () => {
    it('should reduce holdings for SELL transaction', async () => {
      const txMock = {
        holding: {
          findFirst: jest.fn().mockResolvedValue({
            id: 'h1',
            quantity: 100,
            averageCost: 150,
            totalCost: 15000,
          }),
          update: jest.fn().mockResolvedValue({}),
        },
        investmentAccount: {
          update: jest.fn().mockResolvedValue({}),
        },
      };

      prisma.$transaction.mockImplementation(async (callback: any) => callback(txMock));
      mockMarketDataProvider.getCurrentPrice.mockResolvedValue(200);

      prisma.holding.findMany.mockResolvedValue([]);
      prisma.investmentAccount.findUnique.mockResolvedValue({
        id: 'acc1',
        userId: 'user1',
        cashBalance: 1000,
        holdings: [],
      } as any);
      prisma.holding.update.mockResolvedValue({} as any);
      prisma.investmentAccount.update.mockResolvedValue({} as any);

      await service.updateHoldingsAfterTransaction(
        'user1', 'acc1', 'asset1', 'SELL', 50, 200, 10000, 5,
      );

      expect(txMock.holding.findFirst).toHaveBeenCalledWith({
        where: { userId: 'user1', accountId: 'acc1', assetId: 'asset1' },
      });
      expect(txMock.holding.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'h1' },
        }),
      );
    });
  });

  describe('updateHoldingsAfterTransaction - DEPOSIT', () => {
    it('should update account balance for DEPOSIT', async () => {
      const txMock = {
        investmentAccount: {
          update: jest.fn().mockResolvedValue({}),
        },
      };

      prisma.$transaction.mockImplementation(async (callback: any) => callback(txMock));

      prisma.holding.findMany.mockResolvedValue([]);
      prisma.investmentAccount.findUnique.mockResolvedValue({
        id: 'acc1',
        userId: 'user1',
        cashBalance: 1000,
        holdings: [],
      } as any);
      prisma.holding.update.mockResolvedValue({} as any);
      prisma.investmentAccount.update.mockResolvedValue({} as any);

      await service.updateHoldingsAfterTransaction(
        'user1', 'acc1', null, 'DEPOSIT', null, null, 1000, 0,
      );

      expect(prisma.$transaction).toHaveBeenCalled();
    });
  });
});
