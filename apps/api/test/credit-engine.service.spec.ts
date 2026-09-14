import { Test, TestingModule } from '@nestjs/testing';
import { CreditEngineService, SCORING_VERSION } from '../src/credit/credit-engine.service';
import { PrismaService } from '../src/prisma/prisma.service';

describe('CreditEngineService', () => {
  let service: CreditEngineService;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    prisma = {
      account: { findMany: jest.fn() },
      transaction: { findMany: jest.fn() },
      loan: { findMany: jest.fn() },
      loanInstallment: { findMany: jest.fn() },
      creditProfile: { findUnique: jest.fn(), upsert: jest.fn(), create: jest.fn() },
      creditScoreHistory: { create: jest.fn() },
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [CreditEngineService, PrismaService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<CreditEngineService>(CreditEngineService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateScore', () => {
    it('should calculate EXCELLENT score for excellent financials', () => {
      const result = service.calculateScore({
        totalIncome: 10000,
        totalExpenses: 5000,
        totalAccountBalance: 5000,
        totalActiveLoanBalance: 1000,
        repaymentDelinquencyCount: 0,
      });
      expect(result.score).toBeGreaterThanOrEqual(700);
      expect(result.band).toBe('EXCELLENT');
      expect(result.reasons).toContain('positive_account_balance');
      expect(result.reasons).toContain('positive_cash_flow');
      expect(result.reasons).toContain('low_debt_to_income');
      expect(result.reasons).toContain('clean_repayment_history');
      expect(result.reasons).toContain('healthy_coverage_ratio');
    });

    it('should calculate POOR score for poor financials', () => {
      const result = service.calculateScore({
        totalIncome: 2000,
        totalExpenses: 3000,
        totalAccountBalance: -1000,
        totalActiveLoanBalance: 1500,
        repaymentDelinquencyCount: 2,
      });
      expect(result.score).toBeLessThan(500);
      expect(result.band).toBe('POOR');
      expect(result.reasons).toContain('negative_account_balance');
      expect(result.reasons).toContain('negative_cash_flow');
      expect(result.reasons).toContain('repayment_delinquency');
    });

    it('should clamp score to minimum 300', () => {
      const result = service.calculateScore({
        totalIncome: 0,
        totalExpenses: 5000,
        totalAccountBalance: -5000,
        totalActiveLoanBalance: 10000,
        repaymentDelinquencyCount: 10,
      });
      expect(result.score).toBe(300);
    });

    it('should cling score to maximum 850', () => {
      const result = service.calculateScore({
        totalIncome: 100000,
        totalExpenses: 1000,
        totalAccountBalance: 50000,
        totalActiveLoanBalance: 0,
        repaymentDelinquencyCount: 0,
      });
      expect(result.score).toBeLessThanOrEqual(850);
    });
  });

  describe('getScoreBand', () => {
    it('should return POOR for score < 500', () => {
      expect(service.getScoreBand(300)).toBe('POOR');
      expect(service.getScoreBand(499)).toBe('POOR');
    });

    it('should return FAIR for 500-599', () => {
      expect(service.getScoreBand(500)).toBe('FAIR');
      expect(service.getScoreBand(599)).toBe('FAIR');
    });

    it('should return GOOD for 600-699', () => {
      expect(service.getScoreBand(600)).toBe('GOOD');
      expect(service.getScoreBand(699)).toBe('GOOD');
    });

    it('should return VERY_GOOD for 700-799', () => {
      expect(service.getScoreBand(700)).toBe('VERY_GOOD');
      expect(service.getScoreBand(799)).toBe('VERY_GOOD');
    });

    it('should return EXCELLENT for >= 800', () => {
      expect(service.getScoreBand(800)).toBe('EXCELLENT');
      expect(service.getScoreBand(850)).toBe('EXCELLENT');
    });
  });

  describe('getScore', () => {
    it('should return null previousScore when no profile exists', async () => {
      prisma.creditProfile.findUnique.mockResolvedValue(null);
      prisma.account.findMany.mockResolvedValue([]);
      prisma.transaction.findMany.mockResolvedValue([]);
      prisma.loan.findMany.mockResolvedValue([]);
      prisma.loanInstallment.findMany.mockResolvedValue([]);

      const result = await service.getScore('user-1');
      expect(result.previousScore).toBeNull();
      expect(result.calculatedAt).toBeNull();
      expect(result.score).toBeDefined();
      expect(result.band).toBeDefined();
    });

    it('should return profile data when profile exists', async () => {
      prisma.creditProfile.findUnique.mockResolvedValue({
        internalScore: 750,
        scoreBand: 'VERY_GOOD',
        lastCalculatedAt: new Date(),
        scoreHistory: [
          { id: '1', score: 750, reason: 'current' },
          { id: '2', score: 720, reason: 'previous' },
        ],
      } as any);

      const result = await service.getScore('user-1');
      expect(result.score).toBe(750);
      expect(result.band).toBe('VERY_GOOD');
      expect(result.previousScore).toBe(720);
    });
  });

  describe('recalculate', () => {
    it('should create a new profile if none exists', async () => {
      prisma.creditProfile.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce({ id: 'profile-1' } as any);
      prisma.account.findMany.mockResolvedValue([]);
      prisma.transaction.findMany.mockResolvedValue([]);
      prisma.loan.findMany.mockResolvedValue([]);
      prisma.loanInstallment.findMany.mockResolvedValue([]);

      const result = await service.recalculate('user-1');
      expect(prisma.creditProfile.upsert).toHaveBeenCalled();
      expect(prisma.creditScoreHistory.create).toHaveBeenCalled();
      expect(result.score).toBeDefined();
      expect(result.band).toBeDefined();
    });
  });
});
