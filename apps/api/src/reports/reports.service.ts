import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(userId: string) {
    const [incomeResult, expenseResult, accountResult] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: { userId, type: 'INCOME' },
        _sum: { amount: true },
      }),
      this.prisma.transaction.aggregate({
        where: { userId, type: 'EXPENSE' },
        _sum: { amount: true },
      }),
      this.prisma.account.findMany({
        where: { userId, isActive: true },
        select: { balance: true },
      }),
    ]);

    const totalIncome = incomeResult._sum.amount ?? 0;
    const totalExpenses = expenseResult._sum.amount ?? 0;
    const totalBalance = accountResult.reduce((sum: number, acc: { balance: number }) => sum + acc.balance, 0);

    return {
      totalBalance,
      totalIncome,
      totalExpenses,
      netCashFlow: totalIncome - totalExpenses,
      activeAccountCount: accountResult.length,
    };
  }

  async getIncomeExpense(userId: string) {
    const transactions = await this.prisma.transaction.findMany({
      where: { userId, type: { in: ['INCOME', 'EXPENSE'] } },
      select: { type: true, amount: true, transactionDate: true },
      orderBy: { transactionDate: 'asc' },
    });

    const grouped = new Map<string, { income: number; expense: number }>();
    for (const tx of transactions) {
      const key = tx.transactionDate.toISOString().slice(0, 7);
      const entry = grouped.get(key) || { income: 0, expense: 0 };
      if (tx.type === 'INCOME') {
        entry.income += tx.amount;
      } else {
        entry.expense += tx.amount;
      }
      grouped.set(key, entry);
    }

    return Array.from(grouped.entries())
      .map(([period, values]) => ({ period, ...values }))
      .sort((a, b) => a.period.localeCompare(b.period));
  }

  async getByCategory(userId: string, query: any) {
    const where: any = { userId };
    if (query.type) where.type = query.type;
    if (query.fromDate || query.toDate) {
      where.transactionDate = {};
      if (query.fromDate) where.transactionDate.gte = new Date(query.fromDate);
      if (query.toDate) where.transactionDate.lte = new Date(query.toDate);
    }

    const transactions = await this.prisma.transaction.findMany({
      where,
      select: { categoryId: true, amount: true },
    });

    const grouped = new Map<string, { total: number; count: number }>();
    for (const tx of transactions) {
      const entry = grouped.get(tx.categoryId) || { total: 0, count: 0 };
      entry.total += tx.amount;
      entry.count += 1;
      grouped.set(tx.categoryId, entry);
    }

    const categories = await this.prisma.category.findMany({
      where: { id: { in: Array.from(grouped.keys()) } },
      select: { id: true, name: true, nameEn: true, type: true },
    });

    const total = Array.from(grouped.values()).reduce((sum, entry) => sum + entry.total, 0);

    return Array.from(grouped.entries()).map(([categoryId, values]) => {
      const category = categories.find((c: any) => c.id === categoryId);
      return {
        category: category
          ? { id: category.id, name: category.name, nameEn: category.nameEn, type: category.type }
          : undefined,
        total: values.total,
      };
    });
  }

  async getOverview(userId: string, query: any) {
    const where: any = { userId };
    if (query.fromDate || query.toDate) {
      where.transactionDate = {};
      if (query.fromDate) where.transactionDate.gte = new Date(query.fromDate);
      if (query.toDate) where.transactionDate.lte = new Date(query.toDate);
    }

    const [incomeResult, expenseResult, countResult] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: { ...where, type: 'INCOME' },
        _sum: { amount: true },
      }),
      this.prisma.transaction.aggregate({
        where: { ...where, type: 'EXPENSE' },
        _sum: { amount: true },
      }),
      this.prisma.transaction.count({ where }),
    ]);

    const totalIncome = incomeResult._sum.amount ?? 0;
    const totalExpenses = expenseResult._sum.amount ?? 0;

    return {
      totalIncome,
      totalExpenses,
      netCashFlow: totalIncome - totalExpenses,
      transactionCount: countResult,
    };
  }

  async getTrends(userId: string, query: any) {
    const where: any = { userId, type: { in: ['INCOME', 'EXPENSE'] } };
    if (query.fromDate || query.toDate) {
      where.transactionDate = {};
      if (query.fromDate) where.transactionDate.gte = new Date(query.fromDate);
      if (query.toDate) where.transactionDate.lte = new Date(query.toDate);
    }

    const transactions = await this.prisma.transaction.findMany({
      where,
      select: { type: true, amount: true, transactionDate: true },
      orderBy: { transactionDate: 'asc' },
    });

    const grouped = new Map<string, { income: number; expense: number }>();
    for (const tx of transactions) {
      const key = tx.transactionDate.toISOString().slice(0, 10);
      const entry = grouped.get(key) || { income: 0, expense: 0 };
      if (tx.type === 'INCOME') {
        entry.income += tx.amount;
      } else {
        entry.expense += tx.amount;
      }
      grouped.set(key, entry);
    }

    return Array.from(grouped.entries())
      .map(([period, values]) => ({ period, ...values, netCashFlow: values.income - values.expense }))
      .sort((a, b) => a.period.localeCompare(b.period));
  }

  async getCategoryBreakdown(userId: string, query: any) {
    const where: any = { userId, type: 'EXPENSE' };
    if (query.fromDate || query.toDate) {
      where.transactionDate = {};
      if (query.fromDate) where.transactionDate.gte = new Date(query.fromDate);
      if (query.toDate) where.transactionDate.lte = new Date(query.toDate);
    }

    const transactions = await this.prisma.transaction.findMany({
      where,
      select: { categoryId: true, amount: true },
    });

    const grouped = new Map<string, { amount: number; transactionCount: number }>();
    let totalAmount = 0;
    for (const tx of transactions) {
      const entry = grouped.get(tx.categoryId) || { amount: 0, transactionCount: 0 };
      entry.amount += tx.amount;
      entry.transactionCount += 1;
      grouped.set(tx.categoryId, entry);
      totalAmount += tx.amount;
    }

    const categories = await this.prisma.category.findMany({
      where: { id: { in: Array.from(grouped.keys()) } },
      select: { id: true, name: true, nameEn: true, type: true },
    });

    return Array.from(grouped.entries()).map(([categoryId, values]) => {
      const category = categories.find((c: any) => c.id === categoryId);
      const percentage = totalAmount > 0 ? (values.amount / totalAmount) * 100 : 0;
      return {
        category: category
          ? { id: category.id, name: category.name, nameEn: category.nameEn, type: category.type }
          : undefined,
        amount: values.amount,
        percentage,
        transactionCount: values.transactionCount,
      };
    });
  }

  async getBudgetPerformance(userId: string) {
    const budgets = await this.prisma.budget.findMany({
      where: { userId, isActive: true },
      include: { category: { select: { id: true, name: true, nameEn: true, type: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const result = [];
    for (const budget of budgets) {
      const where: any = {
        userId,
        type: 'EXPENSE',
        transactionDate: {
          gte: budget.startDate,
          lte: budget.endDate,
        },
      };
      if (budget.categoryId) {
        where.categoryId = budget.categoryId;
      }

      const spentResult = await this.prisma.transaction.aggregate({ where, _sum: { amount: true } });
      const spent = spentResult._sum.amount ?? 0;
      const remaining = budget.amount - spent;
      const percentageUsed = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

      result.push({
        budget: {
          id: budget.id,
          name: budget.name,
          amount: budget.amount,
          period: budget.period,
        },
        spent,
        remaining,
        percentageUsed,
        exceeded: spent > budget.amount,
      });
    }

    return result;
  }

  async getGoalProgress(userId: string) {
    const goals = await this.prisma.goal.findMany({
      where: { userId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    return goals.map((goal: any) => {
      const remaining = goal.targetAmount - goal.currentAmount;
      const percentageComplete = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
      return {
        goal: {
          id: goal.id,
          name: goal.name,
          targetAmount: goal.targetAmount,
          targetDate: goal.targetDate.toISOString(),
        },
        current: goal.currentAmount,
        remaining,
        percentageComplete,
        completed: goal.isCompleted,
      };
    });
  }
}