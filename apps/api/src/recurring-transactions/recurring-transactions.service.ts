import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRecurringTransactionDto } from './dto/create-recurring-transaction.dto';
import { UpdateRecurringTransactionDto } from './dto/update-recurring-transaction.dto';

@Injectable()
export class RecurringTransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.recurringTransaction.findMany({
      where: { userId, isActive: true },
      include: { account: { select: { id: true, name: true, type: true, currency: true } }, category: { select: { id: true, name: true, nameEn: true, type: true, icon: true } } },
      orderBy: { startDate: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const recurring = await this.prisma.recurringTransaction.findFirst({
      where: { id, userId },
      include: { account: { select: { id: true, name: true, type: true, currency: true } }, category: { select: { id: true, name: true, nameEn: true, type: true, icon: true } } },
    });
    if (!recurring) throw new NotFoundException('Recurring transaction not found');
    return recurring;
  }

  async create(userId: string, dto: CreateRecurringTransactionDto) {
    const account = await this.prisma.account.findFirst({ where: { id: dto.accountId, userId } });
    if (!account) throw new NotFoundException('Account not found');
    const category = await this.prisma.category.findFirst({ where: { id: dto.categoryId } });
    if (!category) throw new NotFoundException('Category not found');

    return this.prisma.recurringTransaction.create({
      data: { userId, accountId: dto.accountId, categoryId: dto.categoryId, type: dto.type as any, amount: dto.amount, currency: dto.currency as any, description: dto.description, frequency: dto.frequency as any, startDate: new Date(dto.startDate), endDate: dto.endDate ? new Date(dto.endDate) : undefined, nextRunAt: new Date(dto.startDate) },
      include: { account: { select: { id: true, name: true, type: true, currency: true } }, category: { select: { id: true, name: true, nameEn: true, type: true, icon: true } } },
    });
  }

  async update(id: string, userId: string, dto: UpdateRecurringTransactionDto) {
    const existing = await this.prisma.recurringTransaction.findFirst({ where: { id, userId } });
    if (!existing) throw new NotFoundException('Recurring transaction not found');

    const data: any = {};
    if (dto.amount !== undefined) data.amount = dto.amount;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.frequency !== undefined) data.frequency = dto.frequency;
    if (dto.endDate !== undefined) data.endDate = dto.endDate ? new Date(dto.endDate) : undefined;
    if (dto.nextRunAt !== undefined) data.nextRunAt = new Date(dto.nextRunAt);
    if (dto.isActive !== undefined) data.isActive = dto.isActive;

    return this.prisma.recurringTransaction.update({
      where: { id },
      data,
      include: { account: { select: { id: true, name: true, type: true, currency: true } }, category: { select: { id: true, name: true, nameEn: true, type: true, icon: true } } },
    });
  }

  async remove(id: string, userId: string) {
    const existing = await this.prisma.recurringTransaction.findFirst({ where: { id, userId } });
    if (!existing) throw new NotFoundException('Recurring transaction not found');
    await this.prisma.recurringTransaction.update({ where: { id }, data: { isActive: false } });
    return { success: true };
  }
}