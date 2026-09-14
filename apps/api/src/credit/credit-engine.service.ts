import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export const SCORING_VERSION = '1.0';

export type ScoreBand = 'POOR' | 'FAIR' | 'GOOD' | 'VERY_GOOD' | 'EXCELLENT';

export interface ScoreResult {
  score: number;
  band: ScoreBand;
  reasons: string[];
}

export interface FinancialInputs {
  totalIncome: number;
  totalExpenses: number;
  totalAccountBalance: number;
  totalActiveLoanBalance: number;
  repaymentDelinquencyCount: number;
}

@Injectable()
export class CreditEngineService {
  constructor(private readonly prisma: PrismaService) {}

  async gatherFinancialData(userId: string): Promise<FinancialInputs> {
    const [accounts, transactions, loans, installments] = await Promise.all([
      this.prisma.account.findMany({
        where: { userId, isActive: true },
        select: { balance: true },
      }),
      this.prisma.transaction.findMany({
        where: { userId, type: { in: ['INCOME', 'EXPENSE'] } },
        select: { type: true, amount: true },
      }),
      this.prisma.loan.findMany({
        where: { userId, status: { in: ['ACTIVE', 'APPROVED'] } },
        select: { remainingBalance: true },
      }),
      this.prisma.loanInstallment.findMany({
        where: {
          userId,
          status: { in: ['OVERDUE', 'PARTIALLY_PAID'] },
        },
        select: { id: true },
      }),
    ]);

    const totalAccountBalance = accounts.reduce((sum, a) => sum + (a.balance ?? 0), 0);
    const totalIncome = transactions.filter((t) => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions.filter((t) => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);
    const totalActiveLoanBalance = loans.reduce((sum, l) => sum + (l.remainingBalance ?? 0), 0);

    return {
      totalIncome: totalIncome || 0,
      totalExpenses: totalExpenses || 0,
      totalAccountBalance,
      totalActiveLoanBalance,
      repaymentDelinquencyCount: installments.length,
    };
  }

  calculateScore(inputs: FinancialInputs): ScoreResult {
    const reasons: string[] = [];
    let score = 500;

    if (inputs.totalAccountBalance > 0) {
      score += 100;
      reasons.push('positive_account_balance');
    } else if (inputs.totalAccountBalance < 0) {
      score -= 50;
      reasons.push('negative_account_balance');
    }

    const netCashFlow = inputs.totalIncome - inputs.totalExpenses;
    if (netCashFlow > 0) {
      score += 100;
      reasons.push('positive_cash_flow');
    } else if (netCashFlow < 0) {
      score -= 50;
      reasons.push('negative_cash_flow');
    } else if (inputs.totalIncome > 0) {
      score += 50;
      reasons.push('income_present');
    }

    if (inputs.totalIncome > 0) {
      const utilization = inputs.totalActiveLoanBalance / inputs.totalIncome;
      if (utilization < 0.3) {
        score += 80;
        reasons.push('low_debt_to_income');
      } else if (utilization < 0.5) {
        score += 30;
        reasons.push('moderate_debt_to_income');
      } else {
        score -= 40;
        reasons.push('high_debt_to_income');
      }
    }

    if (inputs.repaymentDelinquencyCount > 0) {
      score -= 30 * inputs.repaymentDelinquencyCount;
      reasons.push('repayment_delinquency');
    } else {
      score += 40;
      reasons.push('clean_repayment_history');
    }

    if (inputs.totalActiveLoanBalance > 0 && inputs.totalAccountBalance > inputs.totalActiveLoanBalance) {
      score += 30;
      reasons.push('healthy_coverage_ratio');
    }

    score = Math.max(300, Math.min(850, score));

    const band = this.getScoreBand(score);

    return { score, band, reasons };
  }

  getScoreBand(score: number): ScoreBand {
    if (score < 500) return 'POOR';
    if (score < 600) return 'FAIR';
    if (score < 700) return 'GOOD';
    if (score < 800) return 'VERY_GOOD';
    return 'EXCELLENT';
  }

  async getScore(userId: string): Promise<ScoreResult & { previousScore: number | null; calculatedAt: Date | null }> {
    const profile = await this.prisma.creditProfile.findUnique({
      where: { userId },
      include: { scoreHistory: { orderBy: { calculatedAt: 'desc' }, take: 5 } },
    });

    if (!profile) {
      const inputs = await this.gatherFinancialData(userId);
      const result = this.calculateScore(inputs);
      return { ...result, previousScore: null, calculatedAt: null };
    }

    const previous = profile.scoreHistory.length > 1 ? profile.scoreHistory[1].score : null;
    return {
      score: profile.internalScore,
      band: profile.scoreBand as ScoreBand,
      reasons: profile.scoreHistory[0]?.reason ? [profile.scoreHistory[0].reason] : [],
      previousScore: previous,
      calculatedAt: profile.lastCalculatedAt,
    };
  }

  async recalculate(userId: string): Promise<ScoreResult & { previousScore: number | null }> {
    const inputs = await this.gatherFinancialData(userId);
    const { score, band, reasons } = this.calculateScore(inputs);

    const profile = await this.prisma.creditProfile.findUnique({
      where: { userId },
      select: { id: true, internalScore: true },
    });

    const previousScore = profile?.internalScore ?? null;

    await this.prisma.creditProfile.upsert({
      where: { userId },
      create: {
        userId,
        internalScore: score,
        scoreBand: band as any,
        scoringVersion: SCORING_VERSION,
        lastCalculatedAt: new Date(),
        totalDebt: inputs.totalActiveLoanBalance,
        utilization: inputs.totalIncome > 0 ? inputs.totalActiveLoanBalance / inputs.totalIncome : 0,
      },
      update: {
        internalScore: score,
        scoreBand: band as any,
        scoringVersion: SCORING_VERSION,
        lastCalculatedAt: new Date(),
        totalDebt: inputs.totalActiveLoanBalance,
        utilization: inputs.totalIncome > 0 ? inputs.totalActiveLoanBalance / inputs.totalIncome : 0,
      },
    });

    const profileRecord = await this.prisma.creditProfile.findUnique({ where: { userId } });
    if (profileRecord) {
      await this.prisma.creditScoreHistory.create({
        data: {
          userId,
          creditProfileId: profileRecord.id,
          score,
          previousScore,
          reason: reasons.join(','),
        },
      });
    }

    return { score, band, reasons, previousScore };
  }
}
