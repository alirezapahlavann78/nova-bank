import { ToolManagerService } from '../src/ai/tools/tool-manager.service';
import { AccountsService } from '../src/accounts/accounts.service';
import { TransactionsService } from '../src/transactions/transactions.service';
import { BudgetsService } from '../src/budgets/budgets.service';
import { GoalsService } from '../src/goals/goals.service';
import { NotificationsService } from '../src/notifications/notifications.service';
import { ReportsService } from '../src/reports/reports.service';
import { TransfersService } from '../src/transfers/transfers.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { InvestmentAccountsService } from '../src/investments/investment-accounts.service';
import { AssetsService } from '../src/investments/assets.service';
import { HoldingsService } from '../src/investments/holdings.service';
import { InvestmentTransactionsService } from '../src/investments/investment-transactions.service';
import { PortfolioService } from '../src/investments/portfolio.service';
import { WatchlistsService } from '../src/investments/watchlists.service';
import { PaymentsService } from '../src/payments/payments.service';
import { BeneficiariesService } from '../src/beneficiaries/beneficiaries.service';
import { PaymentTemplatesService } from '../src/payment-templates/payment-templates.service';
import { ScheduledPaymentsService } from '../src/scheduled-payments/scheduled-payments.service';
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
  const mockInvestmentAccountsService = { findAll: jest.fn(), findOne: jest.fn() };
  const mockAssetsService = { findAll: jest.fn(), findOne: jest.fn() };
  const mockHoldingsService = { findAll: jest.fn(), findOne: jest.fn() };
  const mockInvestmentTransactionsService = { findAll: jest.fn(), create: jest.fn() };
  const mockPortfolioService = { getOverview: jest.fn(), getHoldings: jest.fn(), getPerformance: jest.fn(), getAssetAllocation: jest.fn() };
  const mockWatchlistsService = { findAll: jest.fn(), create: jest.fn() };
  const mockPaymentsService = { findAll: jest.fn(), findOne: jest.fn(), create: jest.fn() };
  const mockBeneficiariesService = { findAll: jest.fn() };
  const mockPaymentTemplatesService = { findAll: jest.fn() };
  const mockScheduledPaymentsService = { findAll: jest.fn() };

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
        { provide: PaymentsService, useValue: mockPaymentsService },
        { provide: BeneficiariesService, useValue: mockBeneficiariesService },
        { provide: PaymentTemplatesService, useValue: mockPaymentTemplatesService },
        { provide: ScheduledPaymentsService, useValue: mockScheduledPaymentsService },
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

  it('should require confirmation for createPayment action_high tool', () => {
    const tool = service.getTool('createPayment');
    expect(tool?.riskLevel).toBe('action_high');
    expect(tool?.confirmationRequired).toBe(true);
    expect(tool?.userScoping).toBe(true);
    expect(tool?.permission).toBe('payment:action:create');
  });

  it('should inject correct userId for payment tools', async () => {
    mockPaymentsService.create.mockResolvedValue({ id: 'pay-1', amount: 5000 });

    const result = await service.executeTool(
      'createPayment',
      {
        type: 'DOMESTIC_TRANSFER',
        amount: 5000,
        currency: 'IRT',
        sourceAccountId: 'acc-1',
        destinationType: 'ACCOUNT',
        destinationValue: '123456',
      },
      'legitimate-user',
      'req-1',
    );

    expect(mockPaymentsService.create).toHaveBeenCalledWith('legitimate-user', expect.objectContaining({
      type: 'DOMESTIC_TRANSFER',
      amount: 5000,
    }));
  });

  it('should prevent userId injection in createPayment', async () => {
    await expect(
      service.executeTool(
        'createPayment',
        {
          userId: 'attacker',
          type: 'DOMESTIC_TRANSFER',
          amount: 5000,
          currency: 'IRT',
          sourceAccountId: 'acc-1',
          destinationType: 'ACCOUNT',
          destinationValue: '123456',
        },
        'legitimate-user',
        'req-1',
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should not require confirmation for payment read tools', () => {
    const readTools = ['getPayments', 'getBeneficiaries', 'getPaymentTemplates', 'getScheduledPayments'];
    readTools.forEach((name) => {
      const tool = service.getTool(name);
      expect(tool?.riskLevel).toBe('read');
      expect(tool?.confirmationRequired).toBe(false);
      expect(tool?.userScoping).toBe(true);
    });
  });
});
