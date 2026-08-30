import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';

@Injectable()
export class BudgetsService {
  constructor(private readonly prisma: PrismaService, private readonly notificationsService: NotificationsService) {}

  async findAll(userId: string, query: any) {
    const where: any = { userId, isActive: true };
    if (query.period) where.period = query.period;
    if (query.categoryId) where.categoryId = query.categoryId;

    const budgets = await this.prisma.budget.findMany({
      where,
      include: { category: { select: { id: true, name: true, nameEn: true, type: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return Promise.all(
      budgets.map(async (budget: any) => {
        const spent = await this.calculateSpent(budget);
        return {
          id: budget.id,
          userId: budget.userId,
          categoryId: budget.categoryId,
          name: budget.name,
          amount: budget.amount,
          spent,
          remaining: budget.amount - spent,
          percentageUsed: budget.amount > 0 ? (spent / budget.amount) * 100 : 0,
          exceeded: spent > budget.amount,
          currency: budget.currency,
          period: budget.period,
          startDate: budget.startDate.toISOString(),
          endDate: budget.endDate.toISOString(),
          isActive: budget.isActive,
          createdAt: budget.createdAt.toISOString(),
          updatedAt: budget.updatedAt.toISOString(),
          category: budget.category,
        };
      }),
    );
  }

  async findOne(id: string, userId: string) {
    const budget = await this.prisma.budget.findFirst({ where: { id, userId }, include: { category: { select: { id: true, name: true, nameEn: true, type: true } } } });
    if (!budget) throw new NotFoundException('Budget not found');

    const spent = await this.calculateSpent(budget);
    return {
      id: budget.id,
      userId: budget.userId,
      categoryId: budget.categoryId,
      name: budget.name,
      amount: budget.amount,
      spent,
      remaining: budget.amount - spent,
      percentageUsed: budget.amount > 0 ? (spent / budget.amount) * 100 : 0,
      exceeded: spent > budget.amount,
      currency: budget.currency,
      period: budget.period,
      startDate: budget.startDate.toISOString(),
      endDate: budget.endDate.toISOString(),
      isActive: budget.isActive,
      createdAt: budget.createdAt.toISOString(),
      updatedAt: budget.updatedAt.toISOString(),
      category: budget.category,
    };
  }

  async create(userId: string, dto: CreateBudgetDto) {
    if (dto.categoryId) {
      const category = await this.prisma.category.findFirst({ where: { id: dto.categoryId, userId: { equals: userId } } });
      if (!category) {
        throw new ForbiddenException('Category not found or does not belong to user');
      }
    }

    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);
    if (endDate < startDate) {
      throw new ForbiddenException('endDate must be after startDate');
    }

    return this.prisma.budget.create({
      data: {
        userId,
        categoryId: dto.categoryId,
        name: dto.name,
        amount: dto.amount,
        currency: dto.currency as any,
        period: dto.period as any,
        startDate,
        endDate,
      },
      include: { category: { select: { id: true, name: true, nameEn: true, type: true } } },
    });
  }

  async update(id: string, userId: string, dto: UpdateBudgetDto) {
    const budget = await this.prisma.budget.findFirst({ where: { id, userId } });
    if (!budget) throw new NotFoundException('Budget not found');

    const data: any = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.amount !== undefined) data.amount = dto.amount;
    if (dto.period !== undefined) data.period = dto.period;
    if (dto.startDate !== undefined) data.startDate = new Date(dto.startDate);
    if (dto.endDate !== undefined) data.endDate = new Date(dto.endDate);
    if (dto.categoryId !== undefined) {
      if (dto.categoryId) {
        const category = await this.prisma.category.findFirst({ where: { id: dto.categoryId, userId: { equals: userId } } });
        if (!category) throw new ForbiddenException('Category not found or does not belong to user');
      }
      data.categoryId = dto.categoryId;
    }
    if (dto.isActive !== undefined) data.isActive = dto.isActive;

    return this.prisma.budget.update({
      where: { id },
      data,
      include: { category: { select: { id: true, name: true, nameEn: true, type: true } } },
    });
  }

  async remove(id: string, userId: string) {
    const budget = await this.prisma.budget.findFirst({ where: { id, userId } });
    if (!budget) throw new NotFoundException('Budget not found');

    await this.prisma.budget.update({ where: { id }, data: { isActive: false } });
    return { success: true };
  }

  async checkBudgetAlerts(userId: string, transactionDate: Date, amount: number) {
    const preferences = await this.notificationsService.getPreferences(userId);
    if (!preferences.budgetAlerts) return;

    const budgets = await this.prisma.budget.findMany({
      where: {
        userId,
        isActive: true,
        startDate: { lte: transactionDate },
        endDate: { gte: transactionDate },
      },
      include: { category: { select: { id: true, name: true, nameEn: true, type: true } } },
    });

    for (const budget of budgets) {
      const spent = await this.calculateSpent(budget);
      const newSpent = spent + amount;
      const percentage = budget.amount > 0 ? (newSpent / budget.amount) * 100 : 0;

      if (percentage >= 80 && percentage < 100) {
        const hasWarning = await this.notificationsService.hasNotification(userId, 'BUDGET_WARNING', 'budgetId', budget.id);
        if (!hasWarning) {
          await this.notificationsService.createNotification(
            userId,
            'BUDGET_WARNING',
            'هشدار بودجه',
            `هزینه‌های شما برای بودجه "${budget.name}" به ${Math.round(percentage)}% رسیده است.`,
            { budgetId: budget.id, percentage: Math.round(percentage) },
          );
        }
      }

      if (newSpent >= budget.amount) {
        const hasExceeded = await this.notificationsService.hasNotification(userId, 'BUDGET_EXCEEDED', 'budgetId', budget.id);
        if (!hasExceeded) {
          await this.notificationsService.createNotification(
            userId,
            'BUDGET_EXCEEDED',
            'بودجه بیشتر شد',
            `بودجه "${budget.name}" بیشتر از حد مجاز استفاده شده است.`,
            { budgetId: budget.id },
          );
        }
      }
    }
  }

  private async calculateSpent(budget: any): Promise<number> {
    const where: any = {
      userId: budget.userId,
      type: 'EXPENSE',
      transactionDate: {
        gte: budget.startDate,
        lte: budget.endDate,
      },
    };
    if (budget.categoryId) {
      where.categoryId = budget.categoryId;
    }

    const result = await this.prisma.transaction.aggregate({ where, _sum: { amount: true } });
    return result._sum.amount ?? 0;
  }
}