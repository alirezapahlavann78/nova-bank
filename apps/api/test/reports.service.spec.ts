import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from '../src/reports/reports.service';
import { PrismaService } from '../src/prisma/prisma.service';

describe('ReportsService', () => {
  let service: ReportsService;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    prisma = {
      transaction: {
        aggregate: jest.fn(),
        count: jest.fn(),
        findMany: jest.fn(),
      },
      account: {
        findMany: jest.fn(),
      },
      budget: {
        findMany: jest.fn(),
      },
      goal: {
        findMany: jest.fn(),
      },
      category: {
        findMany: jest.fn(),
      },
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [ReportsService, PrismaService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('getSummary should return summary', async () => {
    prisma.transaction.aggregate
      .mockResolvedValueOnce({ _sum: { amount: 100 } } as any)
      .mockResolvedValueOnce({ _sum: { amount: 50 } } as any);
    prisma.account.findMany.mockResolvedValue([{ balance: 150 }]);
    const result = await service.getSummary('1');
    expect(result.totalIncome).toBe(100);
    expect(result.totalExpenses).toBe(50);
    expect(result.netCashFlow).toBe(50);
  });
});