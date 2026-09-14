import { Test, TestingModule } from '@nestjs/testing';
import { EligibilityEngineService } from '../src/credit/credit-eligibility.service';
import { CreditEngineService } from '../src/credit/credit-engine.service';
import { PrismaService } from '../src/prisma/prisma.service';

describe('EligibilityEngineService', () => {
  let service: EligibilityEngineService;
  let prisma: jest.Mocked<PrismaService>;
  let creditEngine: { getScore: jest.Mock };

  beforeEach(async () => {
    creditEngine = { getScore: jest.fn() };
    prisma = {
      loan: { findMany: jest.fn().mockResolvedValue([]) },
      creditProfile: { findUnique: jest.fn() },
      account: { findMany: jest.fn() },
      transaction: { findMany: jest.fn() },
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EligibilityEngineService,
        PrismaService,
        { provide: PrismaService, useValue: prisma },
        { provide: CreditEngineService, useValue: creditEngine },
      ],
    }).compile();

    service = module.get<EligibilityEngineService>(EligibilityEngineService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('evaluateEligibility', () => {
    it('should reject when score below 550', async () => {
      creditEngine.getScore.mockResolvedValue({ score: 450, band: 'POOR' });

      const result = await service.evaluateEligibility('user-1', 100000, 'IRT', 12);
      expect(result.eligible).toBe(false);
      expect(result.maxEligibleAmount).toBe(0);
      expect(result.riskLevel).toBe('BLOCKED');
      expect(result.reasons).toContain('score_below_minimum');
    });

    it('should approve when score is 720 and debt-to-income is low', async () => {
      creditEngine.getScore.mockResolvedValue({ score: 720, band: 'GOOD' });
      prisma.loan.findMany.mockResolvedValue([{ remainingBalance: 5000 }]);

      const result = await service.evaluateEligibility('user-1', 100000, 'IRT', 12);
      expect(result.eligible).toBe(true);
      expect(result.maxEligibleAmount).toBeGreaterThan(0);
    });

    it('should set MEDIUM risk when score between 600-699', async () => {
      creditEngine.getScore.mockResolvedValue({ score: 650, band: 'FAIR' });

      const result = await service.evaluateEligibility('user-1', 100000, 'IRT', 12);
      expect(result.riskLevel).toBe('MEDIUM');
      expect(result.reasons).toContain('score_moderate');
    });

    it('should set HIGH risk when score between 550-599', async () => {
      creditEngine.getScore.mockResolvedValue({ score: 580, band: 'POOR' });

      const result = await service.evaluateEligibility('user-1', 100000, 'IRT', 12);
      expect(result.riskLevel).toBe('HIGH');
      expect(result.reasons).toContain('score_needs_improvement');
    });

    it('should set LOW risk when score is 750+ and debt is low', async () => {
      creditEngine.getScore.mockResolvedValue({ score: 750, band: 'VERY_GOOD' });
      prisma.loan.findMany.mockResolvedValue([]);

      const result = await service.evaluateEligibility('user-1', 1000000, 'IRT', 12);
      expect(result.riskLevel).toBe('LOW');
    });

    it('should flag HIGH risk when debt exceeds threshold', async () => {
      creditEngine.getScore.mockResolvedValue({ score: 700, band: 'GOOD' });
      prisma.loan.findMany.mockResolvedValue([{ remainingBalance: 600000000 }]);

      const result = await service.evaluateEligibility('user-1', 100000, 'IRT', 12);
      expect(result.riskLevel).toBe('HIGH');
      expect(result.reasons).toContain('debt_exceeds_threshold');
    });

    it('should cap maxEligibleAmount at requested amount', async () => {
      creditEngine.getScore.mockResolvedValue({ score: 800, band: 'EXCELLENT' });
      prisma.loan.findMany.mockResolvedValue([]);

      const result = await service.evaluateEligibility('user-1', 50000, 'IRT', 12);
      expect(result.maxEligibleAmount).toBeLessThanOrEqual(50000);
    });
  });
});
