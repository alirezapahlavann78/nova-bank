import { Test } from '@nestjs/testing';
import { ToolManagerService } from '../src/ai/tools/tool-manager.service';
import { AccountsService } from '../src/accounts/accounts.service';
import { TransactionsService } from '../src/transactions/transactions.service';
import { BudgetsService } from '../src/budgets/budgets.service';
import { GoalsService } from '../src/goals/goals.service';
import { NotificationsService } from '../src/notifications/notifications.service';
import { ReportsService } from '../src/reports/reports.service';
import { TransfersService } from '../src/transfers/transfers.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';

describe('ToolManagerService', () => {
  let service: ToolManagerService;

  const mockAccountsService = { findAll: jest.fn(), findOne: jest.fn() };
  const mockTransactionsService = { findAll: jest.fn() };
  const mockBudgetsService = { findAll: jest.fn(), create: jest.fn() };
  const mockGoalsService = { findAll: jest.fn(), create: jest.fn() };
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
      ],
    }).compile();

    service = module.get<ToolManagerService>(ToolManagerService);
    jest.clearAllMocks();
  });

  describe('tool registration', () => {
    it('should register all 12 tools', () => {
      const tools = service.getToolDefinitions();
      expect(tools.length).toBe(12);
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
