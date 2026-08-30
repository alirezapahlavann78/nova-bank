import { Test, TestingModule } from '@nestjs/testing';
import { ReportsController } from '../src/reports/reports.controller';
import { ReportsService } from '../src/reports/reports.service';
import { PrismaService } from '../src/prisma/prisma.service';

describe('ReportsController', () => {
  let controller: ReportsController;
  let service: jest.Mocked<ReportsService>;

  beforeEach(async () => {
    service = {
      getSummary: jest.fn(),
      getIncomeExpense: jest.fn(),
      getByCategory: jest.fn(),
      getOverview: jest.fn(),
      getTrends: jest.fn(),
      getCategoryBreakdown: jest.fn(),
      getBudgetPerformance: jest.fn(),
      getGoalProgress: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [ReportsService, PrismaService, { provide: ReportsService, useValue: service }],
    }).compile();

    controller = module.get<ReportsController>(ReportsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('getOverview should call service', async () => {
    service.getOverview.mockResolvedValue({ totalIncome: 0, totalExpenses: 0, netCashFlow: 0, transactionCount: 0 } as any);
    const req = { user: { id: '1' } } as any;
    const result = await controller.getOverview(req, {});
    expect(service.getOverview).toHaveBeenCalledWith('1', {});
  });
});