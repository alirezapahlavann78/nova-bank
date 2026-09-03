import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginatedResponse, InvestmentTransactionSummary } from '@nova-bank/types';
import { HoldingsService } from './holdings.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class InvestmentTransactionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly holdingsService: HoldingsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async findAll(userId: string, query: any = {}): Promise<PaginatedResponse<any>> {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 50));

    const where: any = { userId };
    if (query.accountId) where.accountId = query.accountId;
    if (query.assetId) where.assetId = query.assetId;
    if (query.transactionType) where.transactionType = query.transactionType;
    if (query.fromDate || query.toDate) {
      where.transactionDate = {};
      if (query.fromDate) where.transactionDate.gte = new Date(query.fromDate);
      if (query.toDate) where.transactionDate.lte = new Date(query.toDate);
    }

    const [data, total] = await Promise.all([
      this.prisma.investmentTransaction.findMany({
        where,
        include: { asset: true, account: true },
        orderBy: { transactionDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.investmentTransaction.count({ where }),
    ]);

    return {
      data: data.map((t: any) => this.mapTransaction(t)),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string, userId: string) {
    const tx = await this.prisma.investmentTransaction.findFirst({
      where: { id, userId },
      include: { asset: true, account: true },
    });
    if (!tx) throw new NotFoundException('Investment transaction not found');
    return this.mapTransaction(tx);
  }

  async create(userId: string, dto: any) {
    const account = await this.prisma.investmentAccount.findFirst({ where: { id: dto.accountId, userId } });
    if (!account) throw new NotFoundException('Investment account not found');
    if (account.status !== 'ACTIVE') throw new BadRequestException('Account is not active');

    if (['BUY', 'SELL', 'DIVIDEND'].includes(dto.transactionType) && !dto.assetId) {
      throw new BadRequestException('Asset ID is required for this transaction type');
    }

    if (dto.assetId) {
      const asset = await this.prisma.asset.findUnique({ where: { id: dto.assetId } });
      if (!asset || !asset.isActive) throw new NotFoundException('Asset not found or inactive');
    }

    return await this.prisma.$transaction(async (tx: any) => {
      const transaction = await tx.investmentTransaction.create({
        data: {
          userId,
          accountId: dto.accountId,
          assetId: dto.assetId,
          transactionType: dto.transactionType,
          quantity: dto.quantity,
          price: dto.price,
          amount: dto.amount,
          fees: dto.fees ?? 0,
          currency: dto.currency || 'USD',
          transactionDate: new Date(dto.transactionDate),
          reference: dto.reference,
          notes: dto.notes,
        },
        include: { asset: true, account: true },
      });

      if (dto.assetId) {
        await this.holdingsService.updateHoldingsAfterTransaction(
          userId,
          dto.accountId,
          dto.assetId,
          dto.transactionType,
          dto.quantity,
          dto.price,
          dto.amount,
          dto.fees ?? 0,
        );
      } else {
        await this.updateAccountBalance(dto.accountId, dto.transactionType, dto.amount, dto.fees ?? 0);
      }

      if (dto.transactionType === 'DIVIDEND') {
        await this.notificationsService.checkDividendNotifications(userId, transaction);
      }

      return this.mapTransaction(transaction);
    });
  }

  private async updateAccountBalance(
    accountId: string,
    transactionType: string,
    amount: number,
    fees: number,
  ) {
    const account = await this.prisma.investmentAccount.findUnique({ where: { id: accountId } });
    if (!account) return;

    const cashEffect = this.calculateCashEffect(transactionType, amount, fees);
    await this.prisma.investmentAccount.update({
      where: { id: accountId },
      data: { cashBalance: { increment: cashEffect } },
    });
  }

  private calculateCashEffect(transactionType: string, amount: number, fees: number): number {
    switch (transactionType) {
      case 'DEPOSIT':
        return amount;
      case 'WITHDRAWAL':
      case 'FEE':
        return -amount;
      case 'DIVIDEND':
      case 'INTEREST':
        return amount;
      case 'BUY':
        return -(amount + fees);
      case 'SELL':
        return amount - fees;
      default:
        return 0;
    }
  }

  private mapTransaction(tx: any): any {
    return {
      id: tx.id,
      userId: tx.userId,
      accountId: tx.accountId,
      assetId: tx.assetId,
      transactionType: tx.transactionType,
      quantity: tx.quantity ? Number(tx.quantity) : undefined,
      price: tx.price ? Number(tx.price) : undefined,
      amount: Number(tx.amount),
      fees: Number(tx.fees ?? 0),
      currency: tx.currency,
      transactionDate: tx.transactionDate.toISOString(),
      reference: tx.reference,
      notes: tx.notes,
      asset: tx.asset
        ? {
            id: tx.asset.id,
            symbol: tx.asset.symbol,
            name: tx.asset.name,
            assetType: tx.asset.assetType,
          }
        : undefined,
      createdAt: tx.createdAt.toISOString(),
      updatedAt: tx.updatedAt.toISOString(),
    };
  }
}
