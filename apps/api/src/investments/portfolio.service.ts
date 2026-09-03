import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MockMarketDataProvider } from './market-data/mock-market-data.provider';

@Injectable()
export class PortfolioService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mockMarketDataProvider: MockMarketDataProvider,
  ) {}

  async getOverview(userId: string) {
    const accounts = await this.prisma.investmentAccount.findMany({
      where: { userId, status: 'ACTIVE' },
      include: { holdings: true },
    });

    const cashBalance = accounts.reduce((sum: number, a: any) => sum + Number(a.cashBalance), 0);

    const holdings = accounts.flatMap((a: any) =>
      a.holdings.map((h: any) => ({
        ...h,
        asset: h.assetId,
        accountId: a.id,
      })),
    );

    const holdingsWithPrices = await this.enrichHoldingsWithPrices(holdings);
    const totalHoldingsValue = holdingsWithPrices.reduce((sum: number, h: any) => sum + h.currentValue, 0);
    const totalInvested = holdingsWithPrices.reduce((sum: number, h: any) => sum + Number(h.totalCost), 0);
    const totalValue = cashBalance + totalHoldingsValue;
    const totalUnrealizedPL = totalHoldingsValue - totalInvested;
    const returnPercentage = totalInvested > 0 ? (totalUnrealizedPL / totalInvested) * 100 : 0;

    return {
      totalPortfolioValue: totalValue,
      totalInvestedCapital: totalInvested,
      totalCashBalance: cashBalance,
      totalUnrealizedPL,
      returnPercentage: Math.round(returnPercentage * 100) / 100,
    };
  }

  async getHoldings(userId: string, query: any = {}) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 50));

    const where: any = { userId };
    if (query.accountId) where.accountId = query.accountId;
    if (query.assetId) where.assetId = query.assetId;

    const [data, total] = await Promise.all([
      this.prisma.holding.findMany({
        where,
        include: { asset: true, account: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.holding.count({ where }),
    ]);

    const holdings = await this.enrichHoldingsWithPrices(data);

    return {
      data: holdings.map((h: any) => ({
        id: h.id,
        accountId: h.accountId,
        asset: {
          id: h.asset.id,
          symbol: h.asset.symbol,
          name: h.asset.name,
          assetType: h.asset.assetType,
          currency: h.asset.currency,
        },
        quantity: Number(h.quantity),
        averagePrice: Number(h.averageCost),
        currentPrice: h.currentPrice,
        marketValue: h.currentValue,
        totalCost: Number(h.totalCost),
        pl: Number(h.unrealizedPL),
        plPercentage: Number(h.unrealizedPLPercentage),
        lastUpdated: h.lastUpdated.toISOString(),
      })),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getAllHoldings(userId: string) {
    const holdings = await this.prisma.holding.findMany({
      where: { userId },
      include: { asset: true, account: true },
    });
    return this.enrichHoldingsWithPrices(holdings);
  }

  async getAssetAllocation(userId: string, query: any = {}) {
    const holdings = await this.prisma.holding.findMany({
      where: { userId },
      include: { asset: true, account: true },
    });

    const enriched = await this.enrichHoldingsWithPrices(holdings);
    const totalValue = enriched.reduce((sum: number, h: any) => sum + h.currentValue, 0);

    const byAsset: Record<string, any> = {};
    const byAssetType: Record<string, any> = {};
    const byAccount: Record<string, any> = {};

    for (const h of enriched) {
      const symbol = h.asset?.symbol || 'UNKNOWN';
      const assetType = h.asset?.assetType || 'UNKNOWN';
      const accountId = h.account?.id || 'unknown';

      if (!byAsset[symbol]) {
        byAsset[symbol] = {
          asset: { id: h.asset?.id, symbol, name: h.asset?.name, assetType },
          value: 0,
        };
      }
      byAsset[symbol].value += h.currentValue;

      if (!byAssetType[assetType]) {
        byAssetType[assetType] = { assetType, value: 0 };
      }
      byAssetType[assetType].value += h.currentValue;

      if (!byAccount[accountId]) {
        byAccount[accountId] = { accountId, value: 0 };
      }
      byAccount[accountId].value += h.currentValue;
    }

    const withPercent = (items: any[], valueKey = 'value') =>
      items.map((item) => ({
        ...item,
        percentage: totalValue > 0 ? Math.round((item[valueKey] / totalValue) * 10000) / 100 : 0,
      }));

    return {
      byAsset: withPercent(Object.values(byAsset)),
      byAssetType: withPercent(Object.values(byAssetType)),
      byAccount: withPercent(Object.values(byAccount)),
    };
  }

  async getPerformance(userId: string, query: any = {}) {
    const fromDate = query.fromDate ? new Date(query.fromDate) : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const toDate = query.toDate ? new Date(query.toDate) : new Date();

    const transactions = await this.prisma.investmentTransaction.findMany({
      where: {
        userId,
        transactionDate: { gte: fromDate, lte: toDate },
      },
      orderBy: { transactionDate: 'asc' },
    });

    const holdings = await this.prisma.holding.findMany({
      where: { userId },
      include: { asset: true, account: true },
    });

    const enriched = await this.enrichHoldingsWithPrices(holdings);
    const totalInvested = enriched.reduce((sum: number, h: any) => sum + Number(h.totalCost), 0);
    const currentValue = enriched.reduce((sum: number, h: any) => sum + h.currentValue, 0);

    const dailyMap = new Map<string, { invested: number; value: number }>();

    const txDates = transactions.map((t) => t.transactionDate.toISOString().slice(0, 10));
    for (const dateStr of txDates) {
      if (!dailyMap.has(dateStr)) {
        dailyMap.set(dateStr, { invested: 0, value: 0 });
      }
    }
    dailyMap.set(toDate.toISOString().slice(0, 10), { invested: 0, value: 0 });

    let cumulativeInvested = 0;
    for (const tx of transactions) {
      const dateStr = tx.transactionDate.toISOString().slice(0, 10);
      let entry = dailyMap.get(dateStr);
      if (!entry) {
        entry = { invested: 0, value: 0 };
        dailyMap.set(dateStr, entry);
      }
      if (['BUY', 'DEPOSIT'].includes(tx.transactionType)) {
        entry.invested += Number(tx.price || 0) * Number(tx.quantity || 0) + Number(tx.fees || 0);
      } else if (tx.transactionType === 'SELL') {
        entry.invested -= Number(tx.price || 0) * Number(tx.quantity || 0) + Number(tx.fees || 0);
      }
      cumulativeInvested += entry.invested;
    }

    const sortedDates = Array.from(dailyMap.keys()).sort();
    const points: any[] = [];

    for (let i = 0; i < sortedDates.length; i++) {
      const date = sortedDates[i];
      const entry = dailyMap.get(date)!;
      const valueToDate = currentValue;
      const dailyChange = i > 0 ? (valueToDate - (dailyMap.get(sortedDates[i - 1])?.value || 0)) / Math.max(valueToDate, 1) * 100 : 0;
      const cumulativeReturn = cumulativeInvested > 0 ? ((valueToDate - cumulativeInvested) / cumulativeInvested) * 100 : 0;

      points.push({
        date,
        totalValue: valueToDate,
        dailyChange,
        cumulativeReturn: Math.round(cumulativeReturn * 100) / 100,
      });
    }

    return {
      points,
      startDate: fromDate.toISOString(),
      endDate: toDate.toISOString(),
    };
  }

  private async enrichHoldingsWithPrices(holdings: any[]) {
    return Promise.all(
      holdings.map(async (h: any) => {
        const symbol = h.asset?.symbol;
        let currentPrice: number | null = null;
        let previousPrice: number | null = null;
        let currentValue = Number(h.currentValue);
        let unrealizedPL = Number(h.unrealizedPL);
        let unrealizedPLPercentage = Number(h.unrealizedPLPercentage);

        if (symbol) {
          const marketData = await this.mockMarketDataProvider.getAsset(symbol);
          currentPrice = marketData?.currentPrice ?? null;
          previousPrice = marketData?.previousPrice ?? null;
          if (currentPrice !== null) {
            currentValue = Number(h.quantity) * currentPrice;
            unrealizedPL = currentValue - Number(h.totalCost);
            unrealizedPLPercentage = Number(h.totalCost) > 0 ? (unrealizedPL / Number(h.totalCost)) * 100 : 0;
          }
        }

        return {
          ...h,
          currentPrice,
          previousPrice,
          currentValue,
          unrealizedPL,
          unrealizedPLPercentage,
          quantity: Number(h.quantity),
          totalCost: Number(h.totalCost),
        };
      }),
    );
  }
}
