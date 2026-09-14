import { Controller, Get, UseGuards, Request, Query } from '@nestjs/common';
import { CreditProfileService } from './credit-profile.service';
import { CreditEngineService } from './credit-engine.service';
import { EligibilityEngineService } from './credit-eligibility.service';
import { CreditAuditService } from './credit-audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('credit')
@UseGuards(JwtAuthGuard)
export class CreditController {
  constructor(
    private readonly creditProfileService: CreditProfileService,
    private readonly creditEngineService: CreditEngineService,
    private readonly eligibilityEngineService: EligibilityEngineService,
    private readonly creditAuditService: CreditAuditService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('profile')
  async getProfile(@Request() req: any) {
    return this.creditProfileService.getProfile(req.user.id);
  }

  @Get('score')
  async getScore(@Request() req: any) {
    return this.creditEngineService.getScore(req.user.id);
  }

  @Get('score-history')
  async getScoreHistory(@Request() req: any) {
    const profile = await this.creditProfileService.getProfile(req.user.id);
    return profile!.scoreHistory || [];
  }

  @Get('eligibility')
  async checkEligibility(
    @Request() req: any,
    @Query('amount') amount?: string,
    @Query('currency') currency?: string,
    @Query('duration') duration?: string,
  ) {
    const requestedAmount = parseInt(amount || '0', 10);
    const currencyCode = currency || 'IRT';
    const durationMonths = parseInt(duration || '12', 10);
    return this.eligibilityEngineService.evaluateEligibility(req.user.id, requestedAmount, currencyCode, durationMonths);
  }

  @Get('financial-health')
  async getFinancialHealth(@Request() req: any) {
    const inputs = await this.creditEngineService.gatherFinancialData(req.user.id);
    const scoreResult = await this.creditEngineService.getScore(req.user.id);

    const [activeLoans, overdueInstallments, pendingInstallments] = await Promise.all([
      this.prisma.loan.findMany({
        where: { userId: req.user.id, status: { in: ['ACTIVE', 'APPROVED'] } },
        select: { remainingBalance: true },
      }),
      this.prisma.loanInstallment.findMany({
        where: { userId: req.user.id, status: 'OVERDUE' },
        select: { remainingAmount: true },
      }),
      this.prisma.loanInstallment.findMany({
        where: { userId: req.user.id, status: { in: ['PENDING', 'DUE'] } },
        select: { totalAmount: true },
      }),
    ]);

    const totalDebt = activeLoans.reduce((sum: number, l: any) => sum + (l.remainingBalance ?? 0), 0);
    const overdueAmount = overdueInstallments.reduce((sum: number, i: any) => sum + (i.remainingAmount ?? 0), 0);
    const monthlyLoanPayments = pendingInstallments.reduce((sum: number, i: any) => sum + (i.totalAmount ?? 0), 0);

    return {
      totalDebt,
      monthlyLoanPayments,
      overdueAmount,
      activeLoans: activeLoans.length,
      creditScore: scoreResult.score,
      creditBand: scoreResult.band,
      debtToIncome: inputs.totalIncome > 0 ? totalDebt / inputs.totalIncome : 0,
    };
  }

  @Get('audit')
  async getAudit(@Request() req: any, @Query('limit') limit?: string) {
    return this.creditAuditService.getAuditTrail(req.user.id, { limit: limit ? parseInt(limit, 10) : undefined });
  }
}
