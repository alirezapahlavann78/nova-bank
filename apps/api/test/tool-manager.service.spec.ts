import { Test } from '@nestjs/testing';
import { ToolManagerService } from '../src/ai/tools/tool-manager.service';
import { AccountsService } from '../src/accounts/accounts.service';
import { TransactionsService } from '../src/transactions/transactions.service';
import { BudgetsService } from '../src/budgets/budgets.service';
import { GoalsService } from '../src/goals/goals.service';
import { NotificationsService } from '../src/notifications/notifications.service';
import { ReportsService } from '../src/reports/reports.service';
import { TransfersService } from '../src/transfers/transfers.service';
import { InvestmentAccountsService } from '../src/investments/investment-accounts.service';
import { AssetsService } from '../src/investments/assets.service';
import { HoldingsService } from '../src/investments/holdings.service';
import { InvestmentTransactionsService } from '../src/investments/investment-transactions.service';
import { PortfolioService } from '../src/investments/portfolio.service';
import { WatchlistsService } from '../src/investments/watchlists.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';

describe('ToolManagerService', () => {
  let service: ToolManagerService;

  const mockAccountsService = { findAll: jest.fn(), findOne: jest.fn() };
  const mockTransactionsService = { findAll: jest.fn() };
  const mockBudgetsService = { findAll: jest.fn(), create: jest.fn() };
  const mockGoalsService = { findAll: jest.fn(), create: jest.fn(), findAllByType: jest.fn() };
  const mockNotificationsService = { findAll: jest.fn(), markAsRead: jest.fn() };
  const mockReportsService = {
    getSummary: jest.fn(),
    getIncomeExpense: jest.fn(),
    getByCategory: jest.fn(),
    getOverview: jest.fn(),
    getTrends: jest.fn(),
    getCategoryBreakdown: jest.fn(),
    getBudgetPerformance: jest.fn(),
    getGoalProgress: jest.fn(),
  };
  const mockTransfersService = { create: jest.fn() };
  const mockInvestmentAccountsService = { findAll: jest.fn(), findOne: jest.fn() };
  const mockAssetsService = { findAll: jest.fn(), findOne: jest.fn() };
  const mockHoldingsService = { findAll: jest.fn(), findOne: jest.fn() };
  const mockInvestmentTransactionsService = { findAll: jest.fn(), findOne: jest.fn() };
  const mockPortfolioService = { getOverview: jest.fn(), getHoldings: jest.fn(), getPerformance: jest.fn(), getAssetAllocation: jest.fn() };
  const mockWatchlistsService = { findAll: jest.fn(), findOne: jest.fn() };
  const mockPrisma = {};

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ToolManagerService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AccountsService, useValue: mockAccountsService },
        { provide: TransactionsService, useValue: mockTransactionsService },
        { provide: BudgetsService, useValue: mockBudgetsService },
        { provide: GoalsService, useValue: mockGoalsService },
        { provide: NotificationsService, useValue: mockNotificationsService },
        { provide: ReportsService, useValue: mockReportsService },
        { provide: TransfersService, useValue: mockTransfersService },
        { provide: InvestmentAccountsService, useValue: mockInvestmentAccountsService },
        { provide: AssetsService, useValue: mockAssetsService },
        { provide: HoldingsService, useValue: mockHoldingsService },
        { provide: InvestmentTransactionsService, useValue: mockInvestmentTransactionsService },
        { provide: PortfolioService, useValue: mockPortfolioService },
        { provide: WatchlistsService, useValue: mockWatchlistsService },
      ],
    }).compile();

    service = module.get<ToolManagerService>(ToolManagerService);
    jest.clearAllMocks();
  });

  describe('tool registration', () => {
    it('should register all 20 tools', () => {
      const tools = service.getToolDefinitions();
      expect(tools.length).toBe(20);
      const names = tools.map((t) => t.name);
      expect(names).toContain('getAccounts');
      expect(names).toContain('getAccountBalance');
      expect(names).toContain('getTransactions');
      expect(names).toContain('getTransactionSummary');
      expect(names).toContain('getBudgets');
      expect(names).toContain('getGoals');
      expect(names).toContain('getNotifications');
      expect(names).toContain('getReports');
      expect(names).toContain('createTransfer');
      expect(names).toContain('createBudget');
      expect(names).toContain('createGoal');
      expect(names).toContain('markNotificationRead');
      expect(names).toContain('getInvestmentAccounts');
      expect(names).toContain('getPortfolio');
      expect(names).toContain('getHoldings');
      expect(names).toContain('getInvestmentTransactions');
      expect(names).toContain('getPortfolioPerformance');
      expect(names).toContain('getAssetAllocation');
      expect(names).toContain('getWatchlists');
      expect(names).toContain('getInvestmentGoals');
    });
  });

  describe('executeTool - investment read tools', () => {
    it('should execute getInvestmentAccounts successfully', async () => {
      const mockAccounts = { data: [{ id: 'acc1', accountType: 'BROKERAGE', status: 'ACTIVE' }] };
      mockInvestmentAccountsService.findAll.mockResolvedValue(mockAccounts);

      const result = await service.executeTool('getInvestmentAccounts', {}, 'user-1', 'req-1');
      expect(result.data).toEqual(mockAccounts);
      expect(mockInvestmentAccountsService.findAll).toHaveBeenCalledWith('user-1', {});
    });

    it('should execute getPortfolio successfully', async () => {
      const mockPortfolio = { totalPortfolioValue: 50000, returnPercentage: 12.5 };
      mockPortfolioService.getOverview.mockResolvedValue(mockPortfolio);

      const result = await service.executeTool('getPortfolio', {}, 'user-1', 'req-1');
      expect(result.data).toEqual(mockPortfolio);
      expect(mockPortfolioService.getOverview).toHaveBeenCalledWith('user-1');
    });

    it('should execute getHoldings with accountId filter', async () => {
      const mockHoldings = { data: [{ id: 'h1', quantity: 100, currentValue: 5000 }] };
      mockPortfolioService.getHoldings.mockResolvedValue(mockHoldings);

      const result = await service.executeTool('getHoldings', { accountId: 'acc1' }, 'user-1', 'req-1');
      expect(result.data).toEqual(mockHoldings);
      expect(mockPortfolioService.getHoldings).toHaveBeenCalledWith('user-1', { accountId: 'acc1' });
    });

    it('should execute getInvestmentTransactions with filters', async () => {
      const mockTx = { data: [{ id: 'tx1', transactionType: 'BUY' }] };
      mockInvestmentTransactionsService.findAll.mockResolvedValue(mockTx);

      const result = await service.executeTool('getInvestmentTransactions', { transactionType: 'BUY', limit: 10 }, 'user-1', 'req-1');
      expect(result.data).toEqual(mockTx);
      expect(mockInvestmentTransactionsService.findAll).toHaveBeenCalledWith('user-1', { transactionType: 'BUY', limit: 10 });
    });

    it('should execute getPortfolioPerformance with date range', async () => {
      const mockPerf = { points: [{ date: '2024-01-01', totalValue: 50000 }] };
      mockPortfolioService.getPerformance.mockResolvedValue(mockPerf);

      const result = await service.executeTool('getPortfolioPerformance', { fromDate: '2024-01-01T00:00:00Z' }, 'user-1', 'req-1');
      expect(result.data).toEqual(mockPerf);
      expect(mockPortfolioService.getPerformance).toHaveBeenCalledWith('user-1', { fromDate: '2024-01-01T00:00:00Z' });
    });

    it('should execute getAssetAllocation successfully', async () => {
      const mockAllocation = { byAsset: [], byAssetType: [], byAccount: [] };
      mockPortfolioService.getAssetAllocation.mockResolvedValue(mockAllocation);

      const result = await service.executeTool('getAssetAllocation', {}, 'user-1', 'req-1');
      expect(result.data).toEqual(mockAllocation);
      expect(mockPortfolioService.getAssetAllocation).toHaveBeenCalledWith('user-1');
    });

    it('should execute getWatchlists successfully', async () => {
      const mockWatchlists = { data: [{ id: 'w1', name: 'My Stocks' }] };
      mockWatchlistsService.findAll.mockResolvedValue(mockWatchlists);

      const result = await service.executeTool('getWatchlists', {}, 'user-1', 'req-1');
      expect(result.data).toEqual(mockWatchlists);
      expect(mockWatchlistsService.findAll).toHaveBeenCalledWith('user-1', {});
    });

    it('should execute getInvestmentGoals successfully', async () => {
      const mockGoals = [{ id: 'g1', goalType: 'INVESTMENT', name: 'Retirement' }];
      mockGoalsService.findAllByType.mockResolvedValue(mockGoals);

      const result = await service.executeTool('getInvestmentGoals', {}, 'user-1', 'req-1');
      expect(result.data).toEqual(mockGoals);
      expect(mockGoalsService.findAllByType).toHaveBeenCalledWith('user-1', 'INVESTMENT');
    });
  });

  describe('investment tool security', () => {
    it('should prevent userId injection in investment tools', async () => {
      mockInvestmentAccountsService.findAll.mockResolvedValue({ data: [] });

      await expect(
        service.executeTool('getInvestmentAccounts', { userId: 'attacker' }, 'real-user', 'req-1'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should inject correct userId for investment tools', async () => {
      mockInvestmentAccountsService.findAll.mockResolvedValue({ data: [] });

      await service.executeTool('getPortfolio', {}, 'legitimate-user', 'req-1');
      expect(mockPortfolioService.getOverview).toHaveBeenCalledWith('legitimate-user');
    });

    it('should mark all investment tools as read risk level', () => {
      const tools = service.getToolDefinitions();
      const investmentTools = tools.filter((t: any) =>
        ['getInvestmentAccounts', 'getPortfolio', 'getHoldings', 'getInvestmentTransactions',
         'getPortfolioPerformance', 'getAssetAllocation', 'getWatchlists', 'getInvestmentGoals']
          .includes(t.name),
      );
      expect(investmentTools.length).toBe(8);
      investmentTools.forEach((tool: any) => {
        expect(tool.riskLevel).toBe('read');
        expect(tool.confirmationRequired).toBe(false);
        expect(tool.userScoping).toBe(true);
      });
    });
  });

  describe('executeTool - read tools', () => {
    it('should execute getAccounts successfully', async () => {
      const mockAccounts = [{ id: 'acc1', name: 'Test Account' }];
      mockAccountsService.findAll.mockResolvedValue(mockAccounts);

      const result = await service.executeTool('getAccounts', {}, 'user-1', 'req-1');
      expect(result.data).toEqual(mockAccounts);
      expect(mockAccountsService.findAll).toHaveBeenCalledWith('user-1');
    });

    it('should execute getAccountBalance with accountId', async () => {
      const mockAccount = { id: 'acc1', name: 'Test', balance: 1000 };
      mockAccountsService.findOne.mockResolvedValue(mockAccount);

      const result = await service.executeTool('getAccountBalance', { accountId: 'acc1' }, 'user-1', 'req-1');
      expect(result.data).toEqual({ id: 'acc1', name: 'Test', balance: 1000 });
      expect(mockAccountsService.findOne).toHaveBeenCalledWith('acc1', 'user-1');
    });

    it('should execute getReports for summary type', async () => {
      const mockSummary = { totalIncome: 1000, totalExpenses: 500 };
      mockReportsService.getSummary.mockResolvedValue(mockSummary);

      const result = await service.executeTool('getReports', { reportType: 'summary' }, 'user-1', 'req-1');
      expect(result.data).toEqual(mockSummary);
    });
  });

  describe('executeTool - error handling', () => {
    it('should throw NotFoundException for unknown tool', async () => {
      await expect(service.executeTool('unknownTool', {}, 'user-1', 'req-1')).rejects.toThrow(NotFoundException);
    });

    it('should handle tool execution errors gracefully', async () => {
      mockAccountsService.findAll.mockRejectedValue(new Error('DB connection failed'));

      const result = await service.executeTool('getAccounts', {}, 'user-1', 'req-1');
      expect(result.error).toBe('DB connection failed');
      expect(result.data).toBeNull();
    });
  });

  describe('security - user scoping', () => {
    it('should prevent userId injection in tool arguments', async () => {
      mockAccountsService.findAll.mockResolvedValue([]);

      await expect(
        service.executeTool('getAccounts', { userId: 'attacker-user-id' }, 'real-user', 'req-1'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should inject correct userId from context into tool args', async () => {
      mockAccountsService.findAll.mockResolvedValue([]);

      await service.executeTool('getAccounts', {}, 'legitimate-user', 'req-1');
      expect(mockAccountsService.findAll).toHaveBeenCalledWith('legitimate-user');
    });

    it('should reject userId mismatch', async () => {
      mockAccountsService.findAll.mockResolvedValue([]);

      await expect(
        service.executeTool('getAccounts', { userId: 'different-user' }, 'my-user', 'req-1'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException for missing required parameter', async () => {
      try {
        await service.executeTool('getAccountBalance', {}, 'user-1', 'req-1');
        fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });
  });

  describe('tool metadata', () => {
    it('should return tool definitions with risk levels', () => {
      const tools = service.getToolDefinitions();
      const transferTool = tools.find((t) => t.name === 'createTransfer');
      expect(transferTool?.riskLevel).toBe('action_high');
      expect(transferTool?.confirmationRequired).toBe(true);

      const accountsTool = tools.find((t) => t.name === 'getAccounts');
      expect(accountsTool?.riskLevel).toBe('read');
      expect(accountsTool?.confirmationRequired).toBe(false);
    });

    it('should get specific tool by name', () => {
      const tool = service.getTool('getBudgets');
      expect(tool).toBeDefined();
      expect(tool?.name).toBe('getBudgets');
    });

    it('should return undefined for non-existent tool', () => {
      expect(service.getTool('nonexistent')).toBeUndefined();
    });
  });
});
