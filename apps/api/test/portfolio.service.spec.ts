import { Test, TestingModule } from '@nestjs/testing';
import { PortfolioService } from '../src/investments/portfolio.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { MockMarketDataProvider } from '../src/investments/market-data/mock-market-data.provider';

describe('PortfolioService', () => {
  let service: PortfolioService;
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
      investmentAccount: {
        findMany: jest.fn(),
      },
      holding: {
        findMany: jest.fn(),
        count: jest.fn(),
      },
      investmentTransaction: {
        findMany: jest.fn(),
      },
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PortfolioService,
        { provide: PrismaService, useValue: prisma },
        { provide: MockMarketDataProvider, useValue: mockMarketDataProvider },
      ],
    }).compile();

    service = module.get<PortfolioService>(PortfolioService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getOverview', () => {
    it('should calculate total portfolio value, invested capital, cash balance, and P/L', async () => {
      const holding = {
        id: 'h1',
        userId: 'user1',
        accountId: 'acc1',
        assetId: 'a1',
        quantity: 100,
        averageCost: 150,
        totalCost: 15000,
        currentValue: 19250,
        unrealizedPL: 4250,
        unrealizedPLPercentage: 28.33,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        asset: { id: 'a1', symbol: 'AAPL', name: 'Apple', assetType: 'STOCK', currency: 'USD' },
        account: { id: 'acc1' },
      };

      prisma.investmentAccount.findMany.mockResolvedValue([
        { id: 'acc1', cashBalance: 5000, holdings: [holding] },
        { id: 'acc2', cashBalance: 3000, holdings: [] },
      ]);
      prisma.holding.findMany.mockResolvedValue([holding]);
      mockMarketDataProvider.getAsset.mockReturnValue(null);

      const result = await service.getOverview('user1');

      expect(result.totalPortfolioValue).toBe(27250);
      expect(result.totalInvestedCapital).toBe(15000);
      expect(result.totalCashBalance).toBe(8000);
      expect(result.totalUnrealizedPL).toBe(4250);
      expect(result.returnPercentage).toBeCloseTo(28.33, 1);
    });
  });

  describe('getHoldings', () => {
    it('should return paginated holdings with current prices', async () => {
      prisma.holding.findMany.mockResolvedValue([
        {
          id: 'h1',
          userId: 'user1',
          accountId: 'acc1',
          assetId: 'a1',
          quantity: 100,
          averageCost: 150,
          totalCost: 15000,
          currentValue: 19250,
          unrealizedPL: 4250,
          unrealizedPLPercentage: 28.33,
          lastUpdated: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          asset: { id: 'a1', symbol: 'AAPL', name: 'Apple', assetType: 'STOCK', currency: 'USD' },
          account: { id: 'acc1' },
        },
      ]);
      prisma.holding.count.mockResolvedValue(1);
      mockMarketDataProvider.getAsset.mockResolvedValue({
        symbol: 'AAPL',
        currentPrice: 192.5,
        previousPrice: 190,
      });

      const result = await service.getHoldings('user1', { page: 1, limit: 50 });

      expect(result.data.length).toBe(1);
      expect(result.data[0].currentPrice).toBe(192.5);
      expect(result.data[0].marketValue).toBe(19250);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('getAssetAllocation', () => {
    it('should calculate allocation by asset, asset type, and account', async () => {
      prisma.holding.findMany.mockResolvedValue([
        {
          id: 'h1',
          userId: 'user1',
          accountId: 'acc1',
          quantity: 100,
          totalCost: 15000,
          currentValue: 19250,
          asset: { id: 'a1', symbol: 'AAPL', name: 'Apple', assetType: 'STOCK' },
          account: { id: 'acc1' },
        },
        {
          id: 'h2',
          userId: 'user1',
          accountId: 'acc2',
          quantity: 50,
          totalCost: 5000,
          currentValue: 3900,
          asset: { id: 'a2', symbol: 'MSFT', name: 'Microsoft', assetType: 'STOCK' },
          account: { id: 'acc2' },
        },
      ]);
      mockMarketDataProvider.getAsset.mockReturnValue(null);

      const result = await service.getAssetAllocation('user1');

      const totalValue = 19250 + 3900;
      expect(result.byAsset.length).toBe(2);
      expect(result.byAssetType.length).toBe(1);
      expect(result.byAccount.length).toBe(2);
      expect(result.byAssetType[0].value).toBe(totalValue);
      expect(result.byAssetType[0].percentage).toBeCloseTo(100, 0);
    });
  });

  describe('getPerformance', () => {
    it('should return performance points over date range', async () => {
      prisma.investmentTransaction.findMany.mockResolvedValue([]);
      prisma.holding.findMany.mockResolvedValue([]);

      const result = await service.getPerformance('user1', {
        fromDate: '2024-01-01T00:00:00Z',
        toDate: '2024-12-31T23:59:59Z',
      });

      expect(result.points).toBeDefined();
      expect(result.startDate).toBeDefined();
      expect(result.endDate).toBeDefined();
    });
  });
});
