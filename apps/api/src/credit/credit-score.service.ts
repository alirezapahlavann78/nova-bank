import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreditEngineService } from './credit-engine.service';
import { CreditAuditService } from './credit-audit.service';

@Injectable()
export class CreditScoreService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly creditEngineService: CreditEngineService,
    private readonly creditAuditService: CreditAuditService,
  ) {}

  async calculateAndUpdate(userId: string, requestId?: string): Promise<{ score: number; band: string; previousScore: number | null }> {
    const inputs = await this.creditEngineService.gatherFinancialData(userId);
    const result = this.creditEngineService.calculateScore(inputs);
    const previousScore = await this.creditEngineService.recalculate(userId);

    await this.creditAuditService.logAction(userId, 'CREDIT_SCORE_CALCULATED', 'COMPLETED', {
      requestId,
      metadata: { score: result.score, band: result.band, reasons: result.reasons },
    });

    return { score: result.score, band: result.band, previousScore: previousScore.previousScore };
  }

  async getHistory(userId: string, limit = 20) {
    const profile = await this.prisma.creditProfile.findUnique({ where: { userId } });
    if (!profile) return [];

    return this.prisma.creditScoreHistory.findMany({
      where: { userId },
      orderBy: { calculatedAt: 'desc' },
      take: limit,
    });
  }
}
