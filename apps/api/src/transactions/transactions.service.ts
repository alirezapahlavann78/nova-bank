import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { BudgetsService } from '../budgets/budgets.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService, private readonly notificationsService: NotificationsService, private readonly budgetsService: BudgetsService) {}

  async findAll(userId: string, query: any) {
    const where: any = { userId };
    if (query.accountId) where.accountId = query.accountId;
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.type) where.type = query.type;
    if (query.fromDate || query.toDate) {
      where.transactionDate = {};
      if (query.fromDate) where.transactionDate.gte = new Date(query.fromDate);
      if (query.toDate) where.transactionDate.lte = new Date(query.toDate);
    }

    const page = query.page ? Number(query.page) : 1;
    const limit = query.limit ? Number(query.limit) : 20;

    const [data, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        include: { account: { select: { id: true, name: true, type: true, currency: true } }, category: { select: { id: true, name: true, nameEn: true, type: true, icon: true } } },
        orderBy: { transactionDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return { data, page, limit, total, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string, userId: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id, userId },
      include: { account: { select: { id: true, name: true, type: true, currency: true } }, category: { select: { id: true, name: true, nameEn: true, type: true, icon: true } } },
    });
    if (!transaction) throw new NotFoundException('Transaction not found');
    return transaction;
  }

  async create(userId: string, dto: CreateTransactionDto) {
    const [account, category] = await Promise.all([
      this.prisma.account.findFirst({ where: { id: dto.accountId, userId } }),
      this.prisma.category.findFirst({ where: { id: dto.categoryId } }),
    ]);

    if (!account) throw new NotFoundException('Account not found');
    if (!category) throw new NotFoundException('Category not found');
    if (!account.isActive) throw new ForbiddenException('Cannot create transaction for inactive account');

    const transactionDate = new Date(dto.transactionDate);

    const transaction = await this.prisma.transaction.create({
      data: { userId, accountId: dto.accountId, categoryId: dto.categoryId, type: dto.type as any, amount: dto.amount, description: dto.description, transactionDate },
      include: { account: { select: { id: true, name: true, type: true, currency: true } }, category: { select: { id: true, name: true, nameEn: true, type: true, icon: true } } },
    });

    if (dto.type === 'INCOME') {
      await this.prisma.account.update({ where: { id: dto.accountId }, data: { balance: { increment: dto.amount } } });
    } else if (dto.type === 'EXPENSE') {
      await this.prisma.account.update({ where: { id: dto.accountId }, data: { balance: { decrement: dto.amount } } });
      this.budgetsService.checkBudgetAlerts(userId, transactionDate, dto.amount).catch(() => {});
    }

    const preferences = await this.notificationsService.getPreferences(userId);
    if (preferences.transactionAlerts) {
      await this.notificationsService.createNotification(
        userId,
        'TRANSACTION_CREATED',
        'تراکنش جدید',
        `تراکنش ${dto.type === 'INCOME' ? 'درآمد' : 'هزینه'} به مبلغ ${dto.amount} ایجاد شد.`,
        { transactionId: transaction.id },
      );
    }

    return transaction;
  }

  async update(id: string, userId: string, dto: UpdateTransactionDto) {
    const existing = await this.prisma.transaction.findFirst({ where: { id, userId }, include: { account: { select: { id: true, balance: true } } } });
    if (!existing) throw new NotFoundException('Transaction not found');

    const data: any = {};
    if (dto.amount !== undefined) data.amount = dto.amount;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.transactionDate !== undefined) data.transactionDate = new Date(dto.transactionDate);

    const updated = await this.prisma.transaction.update({
      where: { id },
      data,
      include: { account: { select: { id: true, name: true, type: true, currency: true } }, category: { select: { id: true, name: true, nameEn: true, type: true, icon: true } } },
    });

    return updated;
  }

  async remove(id: string, userId: string) {
    const existing = await this.prisma.transaction.findFirst({ where: { id, userId } });
    if (!existing) throw new NotFoundException('Transaction not found');
    await this.prisma.transaction.delete({ where: { id } });
    return { success: true };
  }
}