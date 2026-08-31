import { ToolManagerService } from '../src/ai/tools/tool-manager.service';
import { AccountsService } from '../src/accounts/accounts.service';
import { TransactionsService } from '../src/transactions/transactions.service';
import { BudgetsService } from '../src/budgets/budgets.service';
import { GoalsService } from '../src/goals/goals.service';
import { NotificationsService } from '../src/notifications/notifications.service';
import { ReportsService } from '../src/reports/reports.service';
import { TransfersService } from '../src/transfers/transfers.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { Test } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('ToolManager Security', () => {
  let service: ToolManagerService;

  const mockPrisma = {};
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

  it('should not allow AI to inject an arbitrary userId', async () => {
    mockAccountsService.findAll.mockResolvedValue([]);

    await expect(
      service.executeTool('getAccounts', { userId: 'attacker-user-id' }, 'real-user', 'req-1'),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should not allow cross-user account access via tool arguments', async () => {
    mockAccountsService.findOne.mockRejectedValue(new Error('Account not found'));

    const result = await service.executeTool('getAccountBalance', { accountId: 'victim-account' }, 'attacker-user', 'req-1');
    expect(result.error).toBeDefined();
    expect(mockAccountsService.findOne).toHaveBeenCalledWith('victim-account', 'attacker-user');
  });

  it('should prevent access to undefined/unknown tools', async () => {
    await expect(
      service.executeTool('deleteAllData', {}, 'user-1', 'req-1'),
    ).rejects.toThrow(NotFoundException);
  });

  it('should require confirmation for action_high tools', () => {
    const tool = service.getTool('createTransfer');
    expect(tool?.riskLevel).toBe('action_high');
    expect(tool?.confirmationRequired).toBe(true);
    expect(tool?.userScoping).toBe(true);
  });

  it('should not require confirmation for read tools', () => {
    const readTools = ['getAccounts', 'getTransactions', 'getBudgets', 'getGoals', 'getReports', 'getNotifications', 'getTransactionSummary'];
    readTools.forEach((name) => {
      const tool = service.getTool(name);
      expect(tool?.riskLevel).toBe('read');
      expect(tool?.confirmationRequired).toBe(false);
    });
  });

  it('should enforce userId is always from context for action tools', async () => {
    mockTransfersService.create.mockResolvedValue({ id: 'transfer-1' });

    const result = await service.executeTool(
      'createTransfer',
      {
        sourceAccountId: 'acc-1',
        destinationAccountId: 'acc-2',
        amount: 5000,
        currency: 'IRT',
        transactionDate: '2025-01-15T10:00:00Z',
      },
      'legitimate-user',
      'req-1',
    );

    const createCall = mockTransfersService.create.mock.calls[0];
    expect(createCall[0]).toBe('legitimate-user');
    expect(result.error).toBeUndefined();
    expect(result.data).toHaveProperty('id', 'transfer-1');
  });

  it('should reject userId parameter in action tool arguments', async () => {
    mockTransfersService.create.mockResolvedValue({ id: 'transfer-1' });

    await expect(
      service.executeTool(
        'createTransfer',
        {
          userId: 'injected-user',
          sourceAccountId: 'acc-1',
          destinationAccountId: 'acc-2',
          amount: 5000,
          currency: 'IRT',
          transactionDate: '2025-01-15T10:00:00Z',
        },
        'legitimate-user',
        'req-1',
      ),
    ).rejects.toThrow(ForbiddenException);
  });
});
