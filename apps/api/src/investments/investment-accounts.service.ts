import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationQuery, PaginatedResponse, InvestmentAccountSummary } from '@nova-bank/types';

@Injectable()
export class InvestmentAccountsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string, query: any = {}): Promise<PaginatedResponse<InvestmentAccountSummary>> {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));

    const where: any = { userId };
    if (query.status) where.status = query.status;
    if (query.accountType) where.accountType = query.accountType;

    const [data, total] = await Promise.all([
      this.prisma.investmentAccount.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.investmentAccount.count({ where }),
    ]);

    return {
      data: data.map((a: any) => this.mapAccount(a)),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string, userId: string): Promise<InvestmentAccountSummary & { holdings?: any[] }> {
    const account = await this.prisma.investmentAccount.findFirst({
      where: { id, userId },
      include: { holdings: { include: { asset: true } } },
    });
    if (!account) throw new NotFoundException('Investment account not found');
    return this.mapAccountWithHoldings(account);
  }

  async create(userId: string, dto: any) {
    const data: any = {
      userId,
      accountType: dto.accountType || 'BROKERAGE',
      baseCurrency: dto.baseCurrency || 'USD',
      status: dto.status || 'ACTIVE',
    };
    if (dto.accountNumber) data.accountNumber = dto.accountNumber;
    if (dto.brokerName) data.brokerName = dto.brokerName;

    const account = await this.prisma.investmentAccount.create({ data });
    return this.mapAccount(account);
  }

  async update(id: string, userId: string, dto: any) {
    const account = await this.prisma.investmentAccount.findFirst({ where: { id, userId } });
    if (!account) throw new NotFoundException('Investment account not found');

    const data: any = {};
    if (dto.accountNumber !== undefined) data.accountNumber = dto.accountNumber;
    if (dto.brokerName !== undefined) data.brokerName = dto.brokerName;
    if (dto.accountType !== undefined) data.accountType = dto.accountType;
    if (dto.baseCurrency !== undefined) data.baseCurrency = dto.baseCurrency;
    if (dto.status !== undefined) data.status = dto.status;

    const updated = await this.prisma.investmentAccount.update({ where: { id }, data });
    return this.mapAccount(updated);
  }

  async remove(id: string, userId: string) {
    const account = await this.prisma.investmentAccount.findFirst({ where: { id, userId } });
    if (!account) throw new NotFoundException('Investment account not found');

    await this.prisma.investmentAccount.update({ where: { id }, data: { status: 'CLOSED' } });
    return { success: true };
  }

  private mapAccount(account: any): InvestmentAccountSummary {
    return {
      id: account.id,
      userId: account.userId,
      accountNumber: account.accountNumber ?? undefined,
      brokerName: account.brokerName ?? undefined,
      accountType: account.accountType,
      baseCurrency: account.baseCurrency,
      cashBalance: Number(account.cashBalance ?? 0),
      totalValue: Number(account.totalValue ?? 0),
      status: account.status,
      createdAt: account.createdAt.toISOString(),
      updatedAt: account.updatedAt.toISOString(),
    };
  }

  private mapAccountWithHoldings(account: any) {
    const mapped = this.mapAccount(account);
    return {
      ...mapped,
      holdings: (account.holdings || []).map((h: any) => ({
        id: h.id,
        userId: h.userId,
        accountId: h.accountId,
        assetId: h.assetId,
        quantity: Number(h.quantity),
        averageCost: Number(h.averageCost),
        totalCost: Number(h.totalCost),
        currentValue: Number(h.currentValue),
        unrealizedPL: Number(h.unrealizedPL),
        unrealizedPLPercentage: Number(h.unrealizedPLPercentage),
        lastUpdated: h.lastUpdated.toISOString(),
        asset: h.asset
          ? {
              id: h.asset.id,
              symbol: h.asset.symbol,
              name: h.asset.name,
              assetType: h.asset.assetType,
              exchange: h.asset.exchange,
              currency: h.asset.currency,
              isin: h.asset.isin,
              isActive: h.asset.isActive,
            }
          : undefined,
        createdAt: h.createdAt.toISOString(),
        updatedAt: h.updatedAt.toISOString(),
      })),
    };
  }
}
