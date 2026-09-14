import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreditEngineService } from './credit-engine.service';

export type CreditRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'BLOCKED';

export interface EligibilityResult {
  eligible: boolean;
  maxEligibleAmount: number;
  riskLevel: CreditRiskLevel;
  reasons: string[];
}

@Injectable()
export class EligibilityEngineService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly creditEngineService: CreditEngineService,
  ) {}

  async evaluateEligibility(userId: string, requestedAmount: number, currency: string, durationMonths: number): Promise<EligibilityResult> {
    const scoreResult = await this.creditEngineService.getScore(userId);
    const score = scoreResult.score;

    const reasons: string[] = [];
    const activeLoans = await this.prisma.loan.findMany({
      where: { userId, status: { in: ['ACTIVE', 'APPROVED'] } },
      select: { remainingBalance: true },
    });
    const totalDebt = activeLoans.reduce((sum, l) => sum + (l.remainingBalance ?? 0), 0);

    let riskLevel: CreditRiskLevel = 'LOW';

    if (score < 550) {
      riskLevel = 'BLOCKED';
      reasons.push('score_below_minimum');
      return { eligible: false, maxEligibleAmount: 0, riskLevel, reasons };
    }

    if (score < 600) {
      riskLevel = 'HIGH';
      reasons.push('score_needs_improvement');
    } else if (score < 700) {
      riskLevel = 'MEDIUM';
      reasons.push('score_moderate');
    }

    if (totalDebt > 500000000) {
      riskLevel = 'HIGH';
      reasons.push('debt_exceeds_threshold');
    }

    const maxByScore = score < 600 ? 50000000 : score < 700 ? 200000000 : score < 800 ? 500000000 : 1000000000;
    const maxByDebtCapacity = Math.floor(maxByScore * 0.8);

    const maxEligibleAmount = Math.min(maxByScore, maxByDebtCapacity, requestedAmount);

    if (requestedAmount > maxByScore) {
      reasons.push('amount_exceeds_score_limit');
    }

    if (durationMonths > 60) {
      riskLevel = riskLevel === 'LOW' ? 'MEDIUM' : riskLevel;
      reasons.push('long_duration_risk');
    }

    const eligible = maxEligibleAmount > 0;

    return { eligible, maxEligibleAmount, riskLevel, reasons };
  }
}
