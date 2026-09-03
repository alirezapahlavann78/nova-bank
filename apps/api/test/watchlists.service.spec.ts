import { Test, TestingModule } from '@nestjs/testing';
import { WatchlistsService } from '../src/investments/watchlists.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { MockMarketDataProvider } from '../src/investments/market-data/mock-market-data.provider';
import { NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';

describe('WatchlistsService', () => {
  let service: WatchlistsService;
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
      watchlist: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      watchlistItem: {
        findFirst: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
      },
      asset: {
        findUnique: jest.fn(),
      },
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WatchlistsService,
        { provide: PrismaService, useValue: prisma },
        { provide: MockMarketDataProvider, useValue: mockMarketDataProvider },
      ],
    }).compile();

    service = module.get<WatchlistsService>(WatchlistsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return user-scoped watchlists', async () => {
      prisma.watchlist.findMany.mockResolvedValue([
        {
          id: 'w1',
          userId: 'user1',
          name: 'My Stocks',
          description: null,
          isDefault: false,
          items: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
      prisma.watchlist.count.mockResolvedValue(1);

      const result = await service.findAll('user1', { page: 1, limit: 20 });

      expect(result.data.length).toBe(1);
      expect(result.data[0].userId).toBe('user1');
      expect(prisma.watchlist.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user1' },
        }),
      );
    });
  });

  describe('create', () => {
    it('should throw ConflictException for duplicate name', async () => {
      prisma.watchlist.findFirst.mockResolvedValue({ id: 'existing', name: 'My List' });
      await expect(service.create('user1', { name: 'My List' })).rejects.toThrow(ConflictException);
    });

    it('should create watchlist successfully', async () => {
      prisma.watchlist.findFirst.mockResolvedValue(null);
      prisma.watchlist.create.mockResolvedValue({
        id: 'w1',
        userId: 'user1',
        name: 'My Stocks',
        description: null,
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.create('user1', { name: 'My Stocks' });
      expect(result.id).toBe('w1');
      expect(result.userId).toBe('user1');
    });
  });

  describe('addAsset', () => {
    it('should throw NotFoundException when watchlist does not exist', async () => {
      prisma.watchlist.findFirst.mockResolvedValue(null);
      await expect(service.addAsset('w1', 'user1', { assetId: 'a1' })).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when asset does not exist', async () => {
      prisma.watchlist.findFirst.mockResolvedValue({ id: 'w1', userId: 'user1' });
      prisma.asset.findUnique.mockResolvedValue(null);
      await expect(service.addAsset('w1', 'user1', { assetId: 'missing' })).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when asset already in watchlist', async () => {
      prisma.watchlist.findFirst.mockResolvedValue({ id: 'w1', userId: 'user1' });
      prisma.asset.findUnique.mockResolvedValue({ id: 'a1', symbol: 'AAPL' });
      prisma.watchlistItem.findFirst.mockResolvedValue({ id: 'item1' });
      await expect(service.addAsset('w1', 'user1', { assetId: 'a1' })).rejects.toThrow(BadRequestException);
    });

    it('should add asset to watchlist successfully', async () => {
      prisma.watchlist.findFirst.mockResolvedValue({ id: 'w1', userId: 'user1' });
      prisma.asset.findUnique.mockResolvedValue({ id: 'a1', symbol: 'AAPL' });
      prisma.watchlistItem.findFirst.mockResolvedValue(null);
      prisma.watchlistItem.create.mockResolvedValue({ success: true });

      const result = await service.addAsset('w1', 'user1', { assetId: 'a1' });
      expect(result.success).toBe(true);
    });
  });

  describe('removeAsset', () => {
    it('should throw NotFoundException when watchlist does not exist', async () => {
      prisma.watchlist.findFirst.mockResolvedValue(null);
      await expect(service.removeAsset('w1', 'user1', 'a1')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when asset not in watchlist', async () => {
      prisma.watchlist.findFirst.mockResolvedValue({ id: 'w1', userId: 'user1' });
      prisma.watchlistItem.findFirst.mockResolvedValue(null);
      await expect(service.removeAsset('w1', 'user1', 'missing')).rejects.toThrow(NotFoundException);
    });

    it('should remove asset from watchlist successfully', async () => {
      prisma.watchlist.findFirst.mockResolvedValue({ id: 'w1', userId: 'user1' });
      prisma.watchlistItem.findFirst.mockResolvedValue({ id: 'item1' });
      prisma.watchlistItem.delete.mockResolvedValue({ success: true });

      const result = await service.removeAsset('w1', 'user1', 'a1');
      expect(result.success).toBe(true);
    });
  });
});
