import { Injectable, Logger, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AccountsService } from '../../accounts/accounts.service';
import { TransactionsService } from '../../transactions/transactions.service';
import { BudgetsService } from '../../budgets/budgets.service';
import { GoalsService } from '../../goals/goals.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { ReportsService } from '../../reports/reports.service';
import { TransfersService } from '../../transfers/transfers.service';
import { InvestmentAccountsService } from '../../investments/investment-accounts.service';
import { AssetsService } from '../../investments/assets.service';
import { HoldingsService } from '../../investments/holdings.service';
import { InvestmentTransactionsService } from '../../investments/investment-transactions.service';
import { PortfolioService } from '../../investments/portfolio.service';
import { WatchlistsService } from '../../investments/watchlists.service';
import { ToolRegistration, ToolExecutionContext, ToolExecutionResult } from './interfaces/tool-execution-context.interface';

@Injectable()
export class ToolManagerService {
  private readonly logger = new Logger(ToolManagerService.name);
  private readonly tools = new Map<string, ToolRegistration>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly accountsService: AccountsService,
    private readonly transactionsService: TransactionsService,
    private readonly budgetsService: BudgetsService,
    private readonly goalsService: GoalsService,
    private readonly notificationsService: NotificationsService,
    private readonly reportsService: ReportsService,
    private readonly transfersService: TransfersService,
    private readonly investmentAccountsService: InvestmentAccountsService,
    private readonly assetsService: AssetsService,
    private readonly holdingsService: HoldingsService,
    private readonly investmentTransactionsService: InvestmentTransactionsService,
    private readonly portfolioService: PortfolioService,
    private readonly watchlistsService: WatchlistsService,
  ) {
    this.registerTools();
  }

  private registerTools(): void {
    const tools: ToolRegistration[] = [
      {
        name: 'getAccounts',
        description: 'Get all active accounts for the authenticated user',
        parameters: {
          type: 'object',
          properties: {},
        },
        handler: this.toolGetAccounts.bind(this),
        riskLevel: 'read',
        confirmationRequired: false,
        permission: 'financial:read:accounts',
        userScoping: true,
      },
      {
        name: 'getAccountBalance',
        description: 'Get the balance of a specific account by ID',
        parameters: {
          type: 'object',
          properties: {
            accountId: {
              type: 'string',
              description: 'The UUID of the account to check',
            },
          },
          required: ['accountId'],
        },
        handler: this.toolGetAccountBalance.bind(this),
        riskLevel: 'read',
        confirmationRequired: false,
        permission: 'financial:read:accounts',
        userScoping: true,
      },
      {
        name: 'getTransactions',
        description: 'List transactions for the authenticated user with optional filters',
        parameters: {
          type: 'object',
          properties: {
            type: { type: 'string', enum: ['INCOME', 'EXPENSE', 'TRANSFER'], description: 'Filter by transaction type' },
            accountId: { type: 'string', description: 'Filter by account UUID' },
            categoryId: { type: 'string', description: 'Filter by category UUID' },
            fromDate: { type: 'string', format: 'date-time', description: 'Start date ISO string' },
            toDate: { type: 'string', format: 'date-time', description: 'End date ISO string' },
            limit: { type: 'integer', description: 'Max results (default 20)', default: 20 },
          },
        },
        handler: this.toolGetTransactions.bind(this),
        riskLevel: 'read',
        confirmationRequired: false,
        permission: 'financial:read:transactions',
        userScoping: true,
      },
      {
        name: 'getTransactionSummary',
        description: 'Get a summary of transactions grouped by type and category',
        parameters: {
          type: 'object',
          properties: {
            fromDate: { type: 'string', format: 'date-time', description: 'Start date ISO string' },
            toDate: { type: 'string', format: 'date-time', description: 'End date ISO string' },
          },
        },
        handler: this.toolGetTransactionSummary.bind(this),
        riskLevel: 'read',
        confirmationRequired: false,
        permission: 'financial:read:transactions',
        userScoping: true,
      },
      {
        name: 'getBudgets',
        description: 'Get all budgets for the authenticated user',
        parameters: {
          type: 'object',
          properties: {},
        },
        handler: this.toolGetBudgets.bind(this),
        riskLevel: 'read',
        confirmationRequired: false,
        permission: 'financial:read:budgets',
        userScoping: true,
      },
      {
        name: 'getGoals',
        description: 'Get all active goals for the authenticated user',
        parameters: {
          type: 'object',
          properties: {},
        },
        handler: this.toolGetGoals.bind(this),
        riskLevel: 'read',
        confirmationRequired: false,
        permission: 'financial:read:goals',
        userScoping: true,
      },
      {
        name: 'getNotifications',
        description: 'Get recent notifications for the authenticated user',
        parameters: {
          type: 'object',
          properties: {
            isRead: { type: 'boolean', description: 'Filter by read status' },
            limit: { type: 'integer', description: 'Max results (default 20)', default: 20 },
          },
        },
        handler: this.toolGetNotifications.bind(this),
        riskLevel: 'read',
        confirmationRequired: false,
        permission: 'financial:read:notifications',
        userScoping: true,
      },
      {
        name: 'getReports',
        description: 'Get financial reports including summary, trends, and category breakdown',
        parameters: {
          type: 'object',
          properties: {
            reportType: {
              type: 'string',
              enum: ['summary', 'income-expense', 'by-category', 'overview', 'trends', 'category-breakdown', 'budget-performance', 'goal-progress'],
              description: 'Type of report to fetch',
            },
            fromDate: { type: 'string', format: 'date-time', description: 'Start date ISO string' },
            toDate: { type: 'string', format: 'date-time', description: 'End date ISO string' },
          },
          required: ['reportType'],
        },
        handler: this.toolGetReports.bind(this),
        riskLevel: 'read',
        confirmationRequired: false,
        permission: 'financial:read:reports',
        userScoping: true,
      },
      {
        name: 'createTransfer',
        description: 'Create an internal transfer between two of the authenticated user accounts',
        parameters: {
          type: 'object',
          properties: {
            sourceAccountId: { type: 'string', description: 'Source account UUID' },
            destinationAccountId: { type: 'string', description: 'Destination account UUID' },
            amount: { type: 'integer', description: 'Transfer amount (positive integer)' },
            currency: { type: 'string', enum: ['IRT', 'USD', 'EUR'], description: 'Currency code' },
            description: { type: 'string', description: 'Optional description' },
            transactionDate: { type: 'string', format: 'date-time', description: 'Transaction date ISO string' },
          },
          required: ['sourceAccountId', 'destinationAccountId', 'amount', 'transactionDate'],
        },
        handler: this.toolCreateTransfer.bind(this),
        riskLevel: 'action_high',
        confirmationRequired: true,
        permission: 'financial:action:transfer',
        userScoping: true,
      },
      {
        name: 'createBudget',
        description: 'Create a new budget for the authenticated user',
        parameters: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Budget name' },
            amount: { type: 'integer', description: 'Budget amount (positive integer)' },
            currency: { type: 'string', enum: ['IRT', 'USD', 'EUR'], description: 'Currency code' },
            period: { type: 'string', enum: ['WEEKLY', 'MONTHLY', 'YEARLY'], description: 'Budget period' },
            startDate: { type: 'string', format: 'date-time', description: 'Start date ISO string' },
            endDate: { type: 'string', format: 'date-time', description: 'End date ISO string' },
            categoryId: { type: 'string', description: 'Optional category UUID', nullable: true },
          },
          required: ['name', 'amount', 'period', 'startDate', 'endDate'],
        },
        handler: this.toolCreateBudget.bind(this),
        riskLevel: 'action_low',
        confirmationRequired: true,
        permission: 'financial:action:budget',
        userScoping: true,
      },
      {
        name: 'createGoal',
        description: 'Create a new savings goal for the authenticated user',
        parameters: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Goal name' },
            description: { type: 'string', description: 'Optional description' },
            targetAmount: { type: 'integer', description: 'Target amount (positive integer)' },
            currency: { type: 'string', enum: ['IRT', 'USD', 'EUR'], description: 'Currency code' },
            targetDate: { type: 'string', format: 'date-time', description: 'Target date ISO string' },
          },
          required: ['name', 'targetAmount', 'targetDate'],
        },
        handler: this.toolCreateGoal.bind(this),
        riskLevel: 'action_low',
        confirmationRequired: true,
        permission: 'financial:action:goal',
        userScoping: true,
      },
      {
        name: 'markNotificationRead',
        description: 'Mark a notification as read for the authenticated user',
        parameters: {
          type: 'object',
          properties: {
            notificationId: { type: 'string', description: 'Notification UUID' },
          },
          required: ['notificationId'],
        },
        handler: this.toolMarkNotificationRead.bind(this),
        riskLevel: 'action_low',
        confirmationRequired: true,
        permission: 'financial:action:notification',
        userScoping: true,
      },
      {
        name: 'getInvestmentAccounts',
        description: 'Get all investment accounts for the authenticated user',
        parameters: {
          type: 'object',
          properties: {
            status: { type: 'string', enum: ['ACTIVE', 'SUSPENDED', 'CLOSED'], description: 'Filter by account status' },
          },
        },
        handler: this.toolGetInvestmentAccounts.bind(this),
        riskLevel: 'read',
        confirmationRequired: false,
        permission: 'investment:read:accounts',
        userScoping: true,
      },
      {
        name: 'getPortfolio',
        description: 'Get portfolio overview including total value, invested capital, and P/L',
        parameters: {
          type: 'object',
          properties: {},
        },
        handler: this.toolGetPortfolio.bind(this),
        riskLevel: 'read',
        confirmationRequired: false,
        permission: 'investment:read:portfolio',
        userScoping: true,
      },
      {
        name: 'getHoldings',
        description: 'Get holdings for the authenticated user with optional filters',
        parameters: {
          type: 'object',
          properties: {
            accountId: { type: 'string', description: 'Filter by investment account UUID' },
            assetId: { type: 'string', description: 'Filter by asset UUID' },
          },
        },
        handler: this.toolGetHoldings.bind(this),
        riskLevel: 'read',
        confirmationRequired: false,
        permission: 'investment:read:holdings',
        userScoping: true,
      },
      {
        name: 'getInvestmentTransactions',
        description: 'List investment transactions for the authenticated user with optional filters',
        parameters: {
          type: 'object',
          properties: {
            accountId: { type: 'string', description: 'Filter by investment account UUID' },
            assetId: { type: 'string', description: 'Filter by asset UUID' },
            transactionType: { type: 'string', enum: ['BUY', 'SELL', 'DIVIDEND', 'DEPOSIT', 'WITHDRAWAL', 'FEE', 'INTEREST', 'OTHER'], description: 'Filter by transaction type' },
            fromDate: { type: 'string', format: 'date-time', description: 'Start date ISO string' },
            toDate: { type: 'string', format: 'date-time', description: 'End date ISO string' },
            limit: { type: 'integer', description: 'Max results (default 20)', default: 20 },
          },
        },
        handler: this.toolGetInvestmentTransactions.bind(this),
        riskLevel: 'read',
        confirmationRequired: false,
        permission: 'investment:read:transactions',
        userScoping: true,
      },
      {
        name: 'getPortfolioPerformance',
        description: 'Get portfolio performance over time with date range support',
        parameters: {
          type: 'object',
          properties: {
            fromDate: { type: 'string', format: 'date-time', description: 'Start date ISO string' },
            toDate: { type: 'string', format: 'date-time', description: 'End date ISO string' },
          },
        },
        handler: this.toolGetPortfolioPerformance.bind(this),
        riskLevel: 'read',
        confirmationRequired: false,
        permission: 'investment:read:performance',
        userScoping: true,
      },
      {
        name: 'getAssetAllocation',
        description: 'Get asset allocation breakdown by asset, asset type, and account',
        parameters: {
          type: 'object',
          properties: {},
        },
        handler: this.toolGetAssetAllocation.bind(this),
        riskLevel: 'read',
        confirmationRequired: false,
        permission: 'investment:read:allocation',
        userScoping: true,
      },
      {
        name: 'getWatchlists',
        description: 'Get all watchlists for the authenticated user',
        parameters: {
          type: 'object',
          properties: {},
        },
        handler: this.toolGetWatchlists.bind(this),
        riskLevel: 'read',
        confirmationRequired: false,
        permission: 'investment:read:watchlists',
        userScoping: true,
      },
      {
        name: 'getInvestmentGoals',
        description: 'Get all investment goals for the authenticated user',
        parameters: {
          type: 'object',
          properties: {},
        },
        handler: this.toolGetInvestmentGoals.bind(this),
        riskLevel: 'read',
        confirmationRequired: false,
        permission: 'investment:read:goals',
        userScoping: true,
      },
    ];

    for (const tool of tools) {
      this.tools.set(tool.name, tool);
    }
    this.logger.log(`Registered ${tools.length} AI tools`);
  }

  getToolDefinitions(): ToolRegistration[] {
    return Array.from(this.tools.values());
  }

  getTool(name: string): ToolRegistration | undefined {
    return this.tools.get(name);
  }

  getAllowedTools(agentTools: string[]): ToolRegistration[] {
    return agentTools
      .map((name) => this.tools.get(name))
      .filter((tool): tool is ToolRegistration => tool !== undefined);
  }

  async executeTool(
    toolName: string,
    args: Record<string, any>,
    userId: string,
    requestId: string,
  ): Promise<ToolExecutionResult> {
    const tool = this.tools.get(toolName);
    if (!tool) {
      throw new NotFoundException(`Tool '${toolName}' not found`);
    }

    const context: ToolExecutionContext = {
      userId,
      requestId,
      logger: {
        info: (msg: string) => this.logger.debug(`[Tool:${toolName}] ${msg}`),
        warn: (msg: string) => this.logger.warn(`[Tool:${toolName}] ${msg}`),
        error: (msg: string) => this.logger.error(`[Tool:${toolName}] ${msg}`),
      },
    };

    this.sanitizeArgs(args, tool, userId);

    context.logger.info(`Executing tool with args: ${JSON.stringify(this.redactSensitiveArgs(args))}`);

    try {
      const result = await tool.handler(context, args);
      context.logger.info(`Tool executed successfully`);
      return result;
    } catch (error) {
      context.logger.error(`Tool execution failed: ${error instanceof Error ? error.message : String(error)}`);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private sanitizeArgs(args: Record<string, any>, tool: ToolRegistration, userId: string): void {
    if (tool.userScoping) {
      if ('userId' in args) {
        throw new ForbiddenException('userId cannot be specified in tool arguments. User identity is derived from the authenticated request context.');
      }
      args.userId = userId;
    }

    if (!args || typeof args !== 'object') {
      args = {};
    }

    if (tool.parameters.required) {
      for (const required of tool.parameters.required) {
        if (!(required in args)) {
          throw new BadRequestException(`Missing required parameter: '${required}' for tool '${tool.name}'`);
        }
      }
    }

    if (args.userId !== undefined && args.userId !== userId) {
      throw new ForbiddenException('User ID mismatch detected. User identity is server-controlled.');
    }
  }

  private redactSensitiveArgs(args: Record<string, any>): Record<string, any> {
    const sensitiveKeys = ['password', 'token', 'secret', 'apiKey'];
    const redacted: Record<string, any> = {};
    for (const key of Object.keys(args || {})) {
      if (sensitiveKeys.includes(key.toLowerCase())) {
        redacted[key] = '[REDACTED]';
      } else {
        redacted[key] = args[key];
      }
    }
    return redacted;
  }

  private async toolGetAccounts(context: ToolExecutionContext, args: Record<string, any>): Promise<ToolExecutionResult> {
    const accounts = await this.accountsService.findAll(context.userId);
    return { data: accounts };
  }

  private async toolGetAccountBalance(context: ToolExecutionContext, args: Record<string, any>): Promise<ToolExecutionResult> {
    const account = await this.accountsService.findOne(args.accountId, context.userId);
    return { data: { id: account.id, name: account.name, balance: account.balance, currency: account.currency, type: account.type } };
  }

  private async toolGetTransactions(context: ToolExecutionContext, args: Record<string, any>): Promise<ToolExecutionResult> {
    const query: any = {};
    if (args.type) query.type = args.type;
    if (args.accountId) query.accountId = args.accountId;
    if (args.categoryId) query.categoryId = args.categoryId;
    if (args.fromDate) query.fromDate = args.fromDate;
    if (args.toDate) query.toDate = args.toDate;
    if (args.limit) query.limit = args.limit;

    const result = await this.transactionsService.findAll(context.userId, query);
    return { data: result };
  }

  private async toolGetTransactionSummary(context: ToolExecutionContext, args: Record<string, any>): Promise<ToolExecutionResult> {
    const query: any = {};
    if (args.fromDate) query.fromDate = args.fromDate;
    if (args.toDate) query.toDate = args.toDate;

    const [income, expenses, summary] = await Promise.all([
      this.reportsService.getIncomeExpense(context.userId),
      this.transactionsService.findAll(context.userId, query),
      this.reportsService.getSummary(context.userId),
    ]);

    return {
      data: {
        income,
        expenses,
        summary,
      },
    };
  }

  private async toolGetBudgets(context: ToolExecutionContext, args: Record<string, any>): Promise<ToolExecutionResult> {
    const budgets = await this.budgetsService.findAll(context.userId, {});
    return { data: budgets };
  }

  private async toolGetGoals(context: ToolExecutionContext, args: Record<string, any>): Promise<ToolExecutionResult> {
    const goals = await this.goalsService.findAll(context.userId);
    return { data: goals };
  }

  private async toolGetNotifications(context: ToolExecutionContext, args: Record<string, any>): Promise<ToolExecutionResult> {
    const query: any = {};
    if (args.isRead !== undefined) query.isRead = args.isRead;
    if (args.limit) query.limit = args.limit;

    const result = await this.notificationsService.findAll(context.userId, query);
    return { data: result };
  }

  private async toolGetReports(context: ToolExecutionContext, args: Record<string, any>): Promise<ToolExecutionResult> {
    const reportType = args.reportType;

    const queries: any = {};
    if (args.fromDate) queries.fromDate = args.fromDate;
    if (args.toDate) queries.toDate = args.toDate;

    let data: any;
    switch (reportType) {
      case 'summary':
        data = await this.reportsService.getSummary(context.userId);
        break;
      case 'income-expense':
        data = await this.reportsService.getIncomeExpense(context.userId);
        break;
      case 'by-category':
        data = await this.reportsService.getByCategory(context.userId, queries);
        break;
      case 'overview':
        data = await this.reportsService.getOverview(context.userId, queries);
        break;
      case 'trends':
        data = await this.reportsService.getTrends(context.userId, queries);
        break;
      case 'category-breakdown':
        data = await this.reportsService.getCategoryBreakdown(context.userId, queries);
        break;
      case 'budget-performance':
        data = await this.reportsService.getBudgetPerformance(context.userId);
        break;
      case 'goal-progress':
        data = await this.reportsService.getGoalProgress(context.userId);
        break;
      default:
        throw new BadRequestException(`Unknown report type: ${reportType}`);
    }

    return { data };
  }

  private async toolCreateTransfer(context: ToolExecutionContext, args: Record<string, any>): Promise<ToolExecutionResult> {
    const result = await this.transfersService.create(context.userId, {
      sourceAccountId: args.sourceAccountId,
      destinationAccountId: args.destinationAccountId,
      amount: args.amount,
      currency: args.currency,
      description: args.description,
      transactionDate: args.transactionDate,
    });
    return { data: result };
  }

  private async toolCreateBudget(context: ToolExecutionContext, args: Record<string, any>): Promise<ToolExecutionResult> {
    const result = await this.budgetsService.create(context.userId, {
      name: args.name,
      amount: args.amount,
      currency: args.currency,
      period: args.period,
      startDate: args.startDate,
      endDate: args.endDate,
      categoryId: args.categoryId,
    });
    return { data: result };
  }

  private async toolCreateGoal(context: ToolExecutionContext, args: Record<string, any>): Promise<ToolExecutionResult> {
    const result = await this.goalsService.create(context.userId, {
      name: args.name,
      description: args.description,
      targetAmount: args.targetAmount,
      currency: args.currency,
      targetDate: args.targetDate,
    });
    return { data: result };
  }

  private async toolMarkNotificationRead(context: ToolExecutionContext, args: Record<string, any>): Promise<ToolExecutionResult> {
    const result = await this.notificationsService.markAsRead(args.notificationId, context.userId);
    return { data: result };
  }

  private async toolGetInvestmentAccounts(context: ToolExecutionContext, args: Record<string, any>): Promise<ToolExecutionResult> {
    const query: any = {};
    if (args.status) query.status = args.status;
    const result = await this.investmentAccountsService.findAll(context.userId, query);
    return { data: result };
  }

  private async toolGetPortfolio(context: ToolExecutionContext, args: Record<string, any>): Promise<ToolExecutionResult> {
    const result = await this.portfolioService.getOverview(context.userId);
    return { data: result };
  }

  private async toolGetHoldings(context: ToolExecutionContext, args: Record<string, any>): Promise<ToolExecutionResult> {
    const query: any = {};
    if (args.accountId) query.accountId = args.accountId;
    if (args.assetId) query.assetId = args.assetId;
    const result = await this.portfolioService.getHoldings(context.userId, query);
    return { data: result };
  }

  private async toolGetInvestmentTransactions(context: ToolExecutionContext, args: Record<string, any>): Promise<ToolExecutionResult> {
    const query: any = {};
    if (args.accountId) query.accountId = args.accountId;
    if (args.assetId) query.assetId = args.assetId;
    if (args.transactionType) query.transactionType = args.transactionType;
    if (args.fromDate) query.fromDate = args.fromDate;
    if (args.toDate) query.toDate = args.toDate;
    if (args.limit) query.limit = args.limit;
    const result = await this.investmentTransactionsService.findAll(context.userId, query);
    return { data: result };
  }

  private async toolGetPortfolioPerformance(context: ToolExecutionContext, args: Record<string, any>): Promise<ToolExecutionResult> {
    const query: any = {};
    if (args.fromDate) query.fromDate = args.fromDate;
    if (args.toDate) query.toDate = args.toDate;
    const result = await this.portfolioService.getPerformance(context.userId, query);
    return { data: result };
  }

  private async toolGetAssetAllocation(context: ToolExecutionContext, args: Record<string, any>): Promise<ToolExecutionResult> {
    const result = await this.portfolioService.getAssetAllocation(context.userId);
    return { data: result };
  }

  private async toolGetWatchlists(context: ToolExecutionContext, args: Record<string, any>): Promise<ToolExecutionResult> {
    const result = await this.watchlistsService.findAll(context.userId, {});
    return { data: result };
  }

  private async toolGetInvestmentGoals(context: ToolExecutionContext, args: Record<string, any>): Promise<ToolExecutionResult> {
    const goals = await this.goalsService.findAllByType(context.userId, 'INVESTMENT');
    return { data: goals };
  }
}
