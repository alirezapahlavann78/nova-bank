import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AssetSummary, AssetDetail, PaginatedResponse } from '@nova-bank/types';
import { MockMarketDataProvider } from './market-data/mock-market-data.provider';

@Injectable()
export class AssetsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mockMarketDataProvider: MockMarketDataProvider,
  ) {}

  async findAll(query: any = {}): Promise<PaginatedResponse<AssetDetail>> {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));

    const where: any = {};
    if (query.symbol) where.symbol = { contains: query.symbol, mode: 'insensitive' };
    if (query.assetType) where.assetType = query.assetType;
    if (query.isActive !== undefined) where.isActive = query.isActive;

    const [data, total] = await Promise.all([
      this.prisma.asset.findMany({
        where,
        orderBy: { symbol: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.asset.count({ where }),
    ]);

    const assets = await Promise.all(
      data.map(async (a: any) => {
        const marketData = await this.mockMarketDataProvider.getAsset(a.symbol);
        return this.mapAssetDetail(a, marketData);
      }),
    );

    return {
      data: assets,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string): Promise<AssetDetail> {
    const asset = await this.prisma.asset.findUnique({ where: { id } });
    if (!asset) throw new NotFoundException('Asset not found');
    const marketData = await this.mockMarketDataProvider.getAsset(asset.symbol);
    return this.mapAssetDetail(asset, marketData);
  }

  async findBySymbol(symbol: string, exchange?: string): Promise<AssetDetail | null> {
    const where: any = { symbol };
    if (exchange) where.exchange = exchange;
    const asset = await this.prisma.asset.findFirst({ where });
    if (!asset) return null;
    const marketData = await this.mockMarketDataProvider.getAsset(asset.symbol);
    return this.mapAssetDetail(asset, marketData);
  }

  private mapAssetDetail(asset: any, marketData: AssetDetail | null): AssetDetail {
    return {
      id: asset.id,
      symbol: asset.symbol,
      name: asset.name,
      assetType: asset.assetType,
      exchange: asset.exchange ?? undefined,
      currency: asset.currency,
      isin: asset.isin ?? undefined,
      isActive: asset.isActive,
      currentPrice: marketData?.currentPrice,
      previousPrice: marketData?.previousPrice,
      priceTimestamp: marketData?.priceTimestamp,
      createdAt: asset.createdAt.toISOString(),
      updatedAt: asset.updatedAt.toISOString(),
    };
  }

  private mapAssetSummary(asset: any): AssetSummary {
    return {
      id: asset.id,
      symbol: asset.symbol,
      name: asset.name,
      assetType: asset.assetType,
      exchange: asset.exchange ?? undefined,
      currency: asset.currency,
      isin: asset.isin ?? undefined,
      isActive: asset.isActive,
      createdAt: asset.createdAt.toISOString(),
      updatedAt: asset.updatedAt.toISOString(),
    };
  }
}
