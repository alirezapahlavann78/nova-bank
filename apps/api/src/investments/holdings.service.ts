import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HoldingSummary, PaginatedResponse } from '@nova-bank/types';
import { MockMarketDataProvider } from './market-data/mock-market-data.provider';

@Injectable()
export class HoldingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mockMarketDataProvider: MockMarketDataProvider,
  ) {}

  async findAll(userId: string, query: any = {}): Promise<PaginatedResponse<any>> {
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

    const holdings = await this.mapHoldingsWithPrices(data, userId);

    return {
      data: holdings,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string, userId: string) {
    const holding = await this.prisma.holding.findFirst({
      where: { id, userId },
      include: { asset: true, account: true },
    });
    if (!holding) throw new NotFoundException('Holding not found');
    return this.mapHoldingWithPrice(holding, userId);
  }

  async recalculateForAccount(accountId: string, userId: string) {
    const holdings = await this.prisma.holding.findMany({
      where: { accountId, userId },
      include: { asset: true },
    });

    for (const holding of holdings) {
      const currentPrice = await this.mockMarketDataProvider.getCurrentPrice(holding.asset.symbol);
      if (currentPrice !== null) {
        const currentValue = holding.quantity * currentPrice;
        const previousValue = holding.quantity * (holding.asset as any).previousPrice;
        const unrealizedPL = currentValue - holding.totalCost;
        const unrealizedPLPercentage = holding.totalCost > 0 ? (unrealizedPL / holding.totalCost) * 100 : 0;
        const dailyChange = previousValue > 0 ? ((currentValue - previousValue) / previousValue) * 100 : 0;

        await this.prisma.holding.update({
          where: { id: holding.id },
          data: {
            currentValue,
            unrealizedPL,
            unrealizedPLPercentage,
            lastUpdated: new Date(),
          },
        });
      }
    }

    const account = await this.prisma.investmentAccount.findUnique({
      where: { id: accountId, userId },
      include: { holdings: true },
    });

    if (account) {
      let totalValue = account.cashBalance;
      for (const h of account.holdings) {
        totalValue += h.currentValue;
      }
      await this.prisma.investmentAccount.update({
        where: { id: accountId },
        data: { totalValue },
      });
    }
  }

  async updateHoldingsAfterTransaction(
    userId: string,
    accountId: string,
    assetId: string | null | undefined,
    transactionType: string,
    quantity: number | null | undefined,
    price: number | null | undefined,
    amount: number,
    fees: number,
  ) {
    await this.prisma.$transaction(async (tx: any) => {
      if (transactionType === 'BUY' && assetId && quantity && price) {
        const totalCost = amount + fees;
        const existing = await tx.holding.findFirst({
          where: { userId, accountId, assetId },
        });

        if (existing) {
          const newQuantity = Number(existing.quantity) + quantity;
          const newTotalCost = Number(existing.totalCost) + totalCost;
          const averageCost = newTotalCost / newQuantity;
          const currentPrice = await this.mockMarketDataProvider.getCurrentPrice((await tx.asset.findUnique({ where: { id: assetId } })).symbol);
          const currentValue = newQuantity * (currentPrice ?? price);
          const unrealizedPL = currentValue - newTotalCost;
          const unrealizedPLPercentage = newTotalCost > 0 ? (unrealizedPL / newTotalCost) * 100 : 0;

          await tx.holding.update({
            where: { id: existing.id },
            data: {
              quantity: newQuantity,
              totalCost: newTotalCost,
              averageCost,
              currentValue,
              unrealizedPL,
              unrealizedPLPercentage,
              lastUpdated: new Date(),
            },
          });
        } else {
          await tx.holding.create({
            data: {
              userId,
              accountId,
              assetId,
              quantity,
              averageCost: totalCost / quantity,
              totalCost,
              currentValue: quantity * (price ?? 0),
              unrealizedPL: 0,
              unrealizedPLPercentage: 0,
              lastUpdated: new Date(),
            },
          });
        }

        await tx.investmentAccount.update({
          where: { id: accountId },
          data: { cashBalance: { decrement: totalCost } },
        });
      } else if (transactionType === 'SELL' && assetId && quantity && price) {
        const proceeds = amount - fees;
        const existing = await tx.holding.findFirst({
          where: { userId, accountId, assetId },
        });

        if (existing) {
          const newQuantity = Number(existing.quantity) - quantity;
          const soldCost = Number(existing.averageCost) * quantity;
          const remainingCost = Number(existing.totalCost) - soldCost;
          const remainingValue = newQuantity > 0 ? newQuantity * (price ?? 0) : 0;
          const unrealizedPL = remainingValue - remainingCost;
          const unrealizedPLPercentage = remainingCost > 0 ? (unrealizedPL / remainingCost) * 100 : 0;

          await tx.holding.update({
            where: { id: existing.id },
            data: {
              quantity: newQuantity,
              totalCost: remainingCost,
              currentValue: remainingValue,
              unrealizedPL,
              unrealizedPLPercentage,
              lastUpdated: new Date(),
            },
          });

          await tx.investmentAccount.update({
            where: { id: accountId },
            data: { cashBalance: { increment: proceeds } },
          });
        }
      } else if (transactionType === 'DIVIDEND' || transactionType === 'INTEREST') {
        await tx.investmentAccount.update({
          where: { id: accountId },
          data: { cashBalance: { increment: amount } },
        });
      } else if (transactionType === 'DEPOSIT') {
        await tx.investmentAccount.update({
          where: { id: accountId },
          data: { cashBalance: { increment: amount } },
        });
      } else if (transactionType === 'WITHDRAWAL' || transactionType === 'FEE') {
        await tx.investmentAccount.update({
          where: { id: accountId },
          data: { cashBalance: { decrement: amount } },
        });
      }
    });

    await this.recalculateForAccount(accountId, userId);
  }

  private async mapHoldingsWithPrices(holdings: any[], userId: string) {
    return Promise.all(holdings.map((h) => this.mapHoldingWithPrice(h, userId)));
  }

  private async mapHoldingWithPrice(holding: any, userId: string) {
    const currentPrice = await this.mockMarketDataProvider.getCurrentPrice(holding.asset?.symbol);
    const updatedValue = holding.asset ? Number(holding.quantity) * (currentPrice ?? 0) : Number(holding.currentValue);
    const updatedPL = updatedValue - Number(holding.totalCost);
    const updatedPLPct = Number(holding.totalCost) > 0 ? (updatedPL / Number(holding.totalCost)) * 100 : 0;

    return {
      id: holding.id,
      userId: holding.userId,
      accountId: holding.accountId,
      assetId: holding.assetId,
      quantity: Number(holding.quantity),
      averageCost: Number(holding.averageCost),
      totalCost: Number(holding.totalCost),
      currentValue: updatedValue,
      unrealizedPL: updatedPL,
      unrealizedPLPercentage: updatedPLPct,
      lastUpdated: holding.lastUpdated.toISOString(),
      asset: holding.asset
        ? {
            id: holding.asset.id,
            symbol: holding.asset.symbol,
            name: holding.asset.name,
            assetType: holding.asset.assetType,
            exchange: holding.asset.exchange,
            currency: holding.asset.currency,
            isin: holding.asset.isin,
            isActive: holding.asset.isActive,
            currentPrice,
          }
        : undefined,
      createdAt: holding.createdAt.toISOString(),
      updatedAt: holding.updatedAt.toISOString(),
    };
  }
}
