import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MockMarketDataProvider } from './market-data/mock-market-data.provider';

@Injectable()
export class WatchlistsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mockMarketDataProvider: MockMarketDataProvider,
  ) {}

  async findAll(userId: string, query: any = {}): Promise<any> {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));

    const [data, total] = await Promise.all([
      this.prisma.watchlist.findMany({
        where: { userId },
        include: { items: { include: { asset: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.watchlist.count({ where: { userId } }),
    ]);

    const watchlists = await Promise.all(
      data.map(async (w: any) => {
        const itemsWithPrices = await Promise.all(
          (w.items || []).map(async (item: any) => {
            const asset = item.asset;
            let currentPrice: number | null = null;
            let previousPrice: number | null = null;
            if (asset) {
              currentPrice = await this.mockMarketDataProvider.getCurrentPrice(asset.symbol);
              previousPrice = await this.mockMarketDataProvider.getPreviousPrice(asset.symbol);
            }
            const dailyChange = previousPrice && currentPrice && previousPrice > 0
              ? ((currentPrice - previousPrice) / previousPrice) * 100
              : 0;

            return {
              id: item.id,
              assetId: item.assetId,
              asset: asset
                ? {
                    id: asset.id,
                    symbol: asset.symbol,
                    name: asset.name,
                    assetType: asset.assetType,
                    exchange: asset.exchange,
                    currency: asset.currency,
                    isin: asset.isin,
                    isActive: asset.isActive,
                  }
                : undefined,
              currentPrice,
              dailyChange: Math.round(dailyChange * 10000) / 100,
              createdAt: item.createdAt.toISOString(),
              updatedAt: item.updatedAt.toISOString(),
            };
          }),
        );

        return {
          id: w.id,
          userId: w.userId,
          name: w.name,
          description: w.description,
          isDefault: w.isDefault,
          items: itemsWithPrices,
          createdAt: w.createdAt.toISOString(),
          updatedAt: w.updatedAt.toISOString(),
        };
      }),
    );

    return {
      data: watchlists,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string, userId: string) {
    const watchlist = await this.prisma.watchlist.findFirst({
      where: { id, userId },
      include: { items: { include: { asset: true } } },
    });
    if (!watchlist) throw new NotFoundException('Watchlist not found');
    return this.mapWatchlist(watchlist);
  }

  async create(userId: string, dto: any) {
    const existing = await this.prisma.watchlist.findFirst({ where: { userId, name: dto.name } });
    if (existing) throw new ConflictException('A watchlist with this name already exists');

    const watchlist = await this.prisma.watchlist.create({
      data: {
        userId,
        name: dto.name,
        description: dto.description,
        isDefault: dto.isDefault ?? false,
      },
    });
    return this.mapWatchlistSummary(watchlist);
  }

  async update(id: string, userId: string, dto: any) {
    const watchlist = await this.prisma.watchlist.findFirst({ where: { id, userId } });
    if (!watchlist) throw new NotFoundException('Watchlist not found');

    if (dto.name && dto.name !== watchlist.name) {
      const existing = await this.prisma.watchlist.findFirst({ where: { userId, name: dto.name, id: { not: id } } });
      if (existing) throw new ConflictException('A watchlist with this name already exists');
    }

    const updated = await this.prisma.watchlist.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        isDefault: dto.isDefault,
      },
      include: { items: { include: { asset: true } } },
    });
    return this.mapWatchlist(updated);
  }

  async remove(id: string, userId: string) {
    const watchlist = await this.prisma.watchlist.findFirst({ where: { id, userId } });
    if (!watchlist) throw new NotFoundException('Watchlist not found');

    await this.prisma.watchlist.delete({ where: { id } });
    return { success: true };
  }

  async addAsset(id: string, userId: string, dto: any) {
    const watchlist = await this.prisma.watchlist.findFirst({ where: { id, userId } });
    if (!watchlist) throw new NotFoundException('Watchlist not found');

    const asset = await this.prisma.asset.findUnique({ where: { id: dto.assetId } });
    if (!asset) throw new NotFoundException('Asset not found');

    const existing = await this.prisma.watchlistItem.findFirst({
      where: { watchlistId: id, assetId: dto.assetId, userId },
    });
    if (existing) throw new BadRequestException('Asset already in watchlist');

    await this.prisma.watchlistItem.create({
      data: {
        userId,
        watchlistId: id,
        assetId: dto.assetId,
        accountId: dto.accountId,
      },
    });
    return { success: true };
  }

  async removeAsset(id: string, userId: string, assetId: string) {
    const watchlist = await this.prisma.watchlist.findFirst({ where: { id, userId } });
    if (!watchlist) throw new NotFoundException('Watchlist not found');

    const item = await this.prisma.watchlistItem.findFirst({
      where: { watchlistId: id, assetId, userId },
    });
    if (!item) throw new NotFoundException('Asset not found in this watchlist');

    await this.prisma.watchlistItem.delete({ where: { id: item.id } });
    return { success: true };
  }

  private async mapWatchlist(watchlist: any) {
    const items = await Promise.all(
      (watchlist.items || []).map(async (item: any) => {
        const asset = item.asset;
        let currentPrice: number | null = null;
        let dailyChange = 0;
        if (asset) {
          const current = await this.mockMarketDataProvider.getCurrentPrice(asset.symbol);
          const previous = await this.mockMarketDataProvider.getPreviousPrice(asset.symbol);
          currentPrice = current;
          if (previous && current && previous > 0) {
            dailyChange = Math.round(((current - previous) / previous) * 10000) / 100;
          }
        }
        return {
          id: item.id,
          assetId: item.assetId,
          asset: asset
            ? {
                id: asset.id,
                symbol: asset.symbol,
                name: asset.name,
                assetType: asset.assetType,
                exchange: asset.exchange,
                currency: asset.currency,
                isin: asset.isin,
                isActive: asset.isActive,
              }
            : undefined,
          currentPrice,
          dailyChange,
          createdAt: item.createdAt.toISOString(),
          updatedAt: item.updatedAt.toISOString(),
        };
      }),
    );

    return {
      id: watchlist.id,
      userId: watchlist.userId,
      name: watchlist.name,
      description: watchlist.description,
      isDefault: watchlist.isDefault,
      items,
      createdAt: watchlist.createdAt.toISOString(),
      updatedAt: watchlist.updatedAt.toISOString(),
    };
  }

  private mapWatchlistSummary(watchlist: any) {
    return {
      id: watchlist.id,
      userId: watchlist.userId,
      name: watchlist.name,
      description: watchlist.description,
      isDefault: watchlist.isDefault,
      createdAt: watchlist.createdAt.toISOString(),
      updatedAt: watchlist.updatedAt.toISOString(),
    };
  }
}
