import { Test, TestingModule } from '@nestjs/testing';
import { LoanCalculationService } from '../src/lending/loan-calculator.service';

describe('LoanCalculationService', () => {
  let service: LoanCalculationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoanCalculationService],
    }).compile();

    service = module.get<LoanCalculationService>(LoanCalculationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateLoan', () => {
    it('should calculate zero-interest loan', () => {
      const result = service.calculateLoan({
        principal: 120000,
        annualInterestRate: 0,
        durationMonths: 12,
        startDate: new Date('2024-01-01'),
        currency: 'IRT',
      });

      expect(result.principal).toBe(120000);
      expect(result.interestAmount).toBe(0);
      expect(result.totalPayable).toBe(120000);
      expect(result.installmentAmount).toBe(10000);
      expect(result.installments.length).toBe(12);
      expect(result.installments[0].installmentNumber).toBe(1);
      expect(result.installments[11].installmentNumber).toBe(12);
    });

    it('should calculate loan with interest', () => {
      const result = service.calculateLoan({
        principal: 100000,
        annualInterestRate: 12,
        durationMonths: 12,
        startDate: new Date('2024-01-01'),
        currency: 'IRT',
      });

      expect(result.principal).toBe(100000);
      expect(result.interestAmount).toBeGreaterThan(0);
      expect(result.totalPayable).toBe(100000 + result.interestAmount);
      expect(result.installments.length).toBe(12);

      const totalFromInstallments = result.installments.reduce((sum, i) => sum + i.totalAmount, 0);
      expect(totalFromInstallments).toBe(result.totalPayable);
    });

    it('should generate monthly due dates', () => {
      const result = service.calculateLoan({
        principal: 1000000,
        annualInterestRate: 18,
        durationMonths: 6,
        startDate: new Date('2024-01-15'),
        currency: 'IRT',
      });

      expect(result.installments[0].dueDate.getMonth()).toBe(1);
      expect(result.installments[0].dueDate.getDate()).toBe(15);
      expect(result.installments[5].dueDate.getMonth()).toBe(6);
    });

    it('should ensure minimum installment amount of 1', () => {
      const result = service.calculateLoan({
        principal: 5,
        annualInterestRate: 0,
        durationMonths: 3,
        startDate: new Date('2024-01-01'),
        currency: 'IRT',
      });

      result.installments.forEach((inst) => {
        expect(inst.totalAmount).toBeGreaterThanOrEqual(1);
      });
    });

    it('should amortize correctly with declining principal', () => {
      const result = service.calculateLoan({
        principal: 120000,
        annualInterestRate: 12,
        durationMonths: 3,
        startDate: new Date('2024-01-01'),
        currency: 'IRT',
      });

      expect(result.installments[0].principalAmount).toBeLessThan(result.installments[1].principalAmount);

      const totalPrincipal = result.installments.reduce((sum, i) => sum + i.principalAmount, 0);
      expect(totalPrincipal).toBe(result.principal);
    });
  });
});
