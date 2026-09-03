export type UserId = string;
export type AccountId = string;
export type TransactionId = string;
export type CategoryId = string;
export type BudgetId = string;
export type GoalId = string;
export type TransferId = string;
export type BankId = string;
export type CardId = string;
export type NotificationId = string;
export type SubscriptionId = string;
export type InvestmentAccountId = string;
export type AssetId = string;
export type HoldingId = string;
export type InvestmentTransactionId = string;
export type WatchlistId = string;
export type WatchlistItemId = string;

export type Currency = 'IRT' | 'USD' | 'EUR';
export type TransactionType = 'income' | 'expense' | 'transfer';
export type AccountType = 'cash' | 'bank' | 'wallet' | 'credit';
export type BudgetPeriod = 'weekly' | 'monthly' | 'yearly';
export type GoalStatus = 'active' | 'completed' | 'paused';
export type GoalType = 'SAVINGS' | 'INVESTMENT';
export type SubscriptionTier = 'FREE' | 'SMART' | 'PRO' | 'BUSINESS';
export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type InvestmentAccountType = 'BROKERAGE' | 'RETIREMENT' | 'SAVINGS_INVESTMENT' | 'OTHER';
export type InvestmentAccountStatus = 'ACTIVE' | 'SUSPENDED' | 'CLOSED';
export type AssetType = 'STOCK' | 'ETF' | 'BOND' | 'MUTUAL_FUND' | 'CRYPTO' | 'CASH' | 'OTHER';
export type InvestmentTransactionType = 'BUY' | 'SELL' | 'DIVIDEND' | 'DEPOSIT' | 'WITHDRAWAL' | 'FEE' | 'INTEREST' | 'OTHER';

export interface PaginationQuery {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}

export interface UserSummary {
  id: string;
  phone: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  locale: string;
  timezone: string;
}

export interface BankSummary {
  id: string;
  code: string;
  name: string;
  nameEn: string;
}

export interface AccountSummary {
  id: string;
  userId: string;
  bankId?: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: Currency;
  isActive: boolean;
}

export interface BankDetail {
  id: string;
  code: string;
  name: string;
  nameEn: string;
  isActive: boolean;
}

export interface AccountDetail extends AccountSummary {
  createdAt: string;
  updatedAt: string;
  bank?: BankDetail;
}

export interface CardSummary {
  id: string;
  userId: string;
  accountId: string;
  name: string;
  last4: string;
  cardType: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CardDetail extends CardSummary {
  account?: {
    id: string;
    name: string;
    type: AccountType;
    balance: number;
    currency: Currency;
  };
}

export type CardType = 'DEBIT' | 'CREDIT' | 'PREPAID';
export type CategoryType = 'INCOME' | 'EXPENSE';
export type TransactionTypeAPI = 'INCOME' | 'EXPENSE' | 'TRANSFER';

export interface CategorySummary {
  id: string;
  userId?: string;
  name: string;
  nameEn: string;
  icon?: string;
  type: CategoryType;
  isSystem: boolean;
  isActive: boolean;
}

export interface TransactionSummary {
  id: string;
  userId: string;
  accountId: string;
  categoryId: string;
  type: TransactionTypeAPI;
  amount: number;
  description?: string;
  transactionDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionDetail extends TransactionSummary {
  account?: {
    id: string;
    name: string;
    type: AccountType;
    currency: Currency;
  };
  category?: {
    id: string;
    name: string;
    nameEn: string;
    type: CategoryType;
    icon?: string;
  };
}

export interface TransferSummary {
  id: string;
  userId: string;
  sourceAccountId: string;
  destinationAccountId: string;
  amount: number;
  currency: Currency;
  description?: string;
  transactionDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecurringTransactionSummary {
  id: string;
  userId: string;
  accountId: string;
  categoryId: string;
  type: TransactionTypeAPI;
  amount: number;
  currency: Currency;
  description?: string;
  frequency: RecurringFrequency;
  startDate: string;
  endDate?: string;
  nextRunAt: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReportSummary {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
  activeAccountCount: number;
}

export interface ReportIncomeExpensePeriod {
  period: string;
  income: number;
  expense: number;
}

export interface ReportByCategoryItem {
  category?: {
    id: string;
    name: string;
    nameEn: string;
    type: CategoryType;
  };
  total: number;
}

export interface BudgetSummary {
  id: string;
  userId: string;
  categoryId?: string;
  name: string;
  amount: number;
  spent: number;
  currency: Currency;
  period: BudgetPeriod;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GoalSummary {
  id: string;
  userId: string;
  name: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  remaining: number;
  percentageComplete: number;
  currency: Currency;
  targetDate: string;
  isCompleted: boolean;
  isActive: boolean;
  goalType: 'SAVINGS' | 'INVESTMENT';
  createdAt: string;
  updatedAt: string;
}

export interface ReportOverview {
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
  transactionCount: number;
}

export interface ReportTrend {
  period: string;
  income: number;
  expense: number;
  netCashFlow: number;
}

export interface CategoryBreakdownItem {
  category?: {
    id: string;
    name: string;
    nameEn: string;
    type: CategoryType;
  };
  amount: number;
  percentage: number;
  transactionCount: number;
}

export interface BudgetPerformanceItem {
  budget: {
    id: string;
    name: string;
    amount: number;
    period: BudgetPeriod;
  };
  spent: number;
  remaining: number;
  percentageUsed: number;
  exceeded: boolean;
}

export interface GoalProgressItem {
  goal: {
    id: string;
    name: string;
    targetAmount: number;
    targetDate: string;
  };
  current: number;
  remaining: number;
  percentageComplete: number;
  completed: boolean;
}

export type NotificationType = 'BUDGET_WARNING' | 'BUDGET_EXCEEDED' | 'GOAL_MILESTONE' | 'GOAL_COMPLETED' | 'TRANSACTION_CREATED' | 'TRANSFER_COMPLETED' | 'SYSTEM';

export interface NotificationSummary {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, any>;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPreferenceSummary {
  id: string;
  userId: string;
  budgetAlerts: boolean;
  goalAlerts: boolean;
  transactionAlerts: boolean;
  transferAlerts: boolean;
  systemAlerts: boolean;
  pushEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export type AIMessageRole = 'system' | 'user' | 'assistant' | 'tool';
export type AIToolRiskLevel = 'read' | 'action_low' | 'action_high';
export type AIToolConfirmationState = 'pending' | 'confirmed' | 'cancelled';
export type AIAgentExecutionStatus = 'running' | 'completed' | 'failed' | 'cancelled';
export type AIToolExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface AIToolParameter {
  name: string;
  type: 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object';
  description: string;
  required: boolean;
  enum?: string[];
  items?: AIToolParameter;
  properties?: AIToolParameter[];
}

export interface AIToolDefinition {
  name: string;
  description: string;
  parameters: AIToolParameter[];
  riskLevel: AIToolRiskLevel;
  confirmationRequired: boolean;
  permission: string;
  userScoping: boolean;
}

export interface AIToolCall {
  id: string;
  toolName: string;
  arguments: Record<string, any>;
  confirmationState?: AIToolConfirmationState;
}

export interface AIToolResult {
  toolCallId: string;
  toolName: string;
  success: boolean;
  data?: any;
  error?: string;
  confirmationState: AIToolConfirmationState;
}

export interface AISystemInstructions {
  basePrompt: string;
  riskGuidelines: string;
  confirmationProtocol: string;
}

export interface AIAgentCapability {
  name: string;
  description: string;
  tools: string[];
}

export interface AIAgentMetadata {
  id: string;
  name: string;
  description: string;
  version: string;
  isEnabled: boolean;
  capabilities: AIAgentCapability[];
  modelConfig: {
    provider: string;
    model: string;
    maxTokens: number;
    temperature: number;
  };
  systemInstructions: AISystemInstructions;
  createdAt: string;
  updatedAt: string;
}

export interface AIProviderResponse {
  content: string;
  toolCalls: AIToolCall[];
  usage: AIUsageMetadata;
  provider: string;
  model: string;
}

export interface AIUsageMetadata {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  provider?: string;
}

export interface AIChatRequestDto {
  message: string;
  conversationId?: string;
  agentId?: string;
}

export interface AIChatRequest {
  message: string;
  conversationId?: string;
  agentId?: string;
}

export interface AIConfirmationRequestDto {
  toolCallId: string;
  conversationId?: string;
  confirmed: boolean;
}

export interface AIConfirmationRequest {
  toolCallId: string;
  conversationId?: string;
  confirmed: boolean;
}

export interface AIToolExecutionSummary {
  toolName: string;
  success: boolean;
  data?: any;
  error?: string;
}

export interface AIChatResponse {
  content: string;
  conversationId: string;
  agent: {
    id: string;
    name: string;
    version: string;
  };
  toolExecutions: AIToolExecutionSummary[];
  pendingConfirmations: AIToolCall[];
  usage?: AIUsageMetadata;
  isComplete: boolean;
}

export interface AIToolExecutionLog {
  id: string;
  toolName: string;
  riskLevel: AIToolRiskLevel;
  status: AIToolExecutionStatus;
  confirmationState: AIToolConfirmationState;
  durationMs?: number;
  input: Record<string, any>;
  output?: any;
  error?: string;
}

export interface AIConversationSummary {
  id: string;
  agentId: string;
  agentName: string;
  title: string | null;
  startedAt: string;
  endedAt: string | null;
  isActive: boolean;
  messageCount: number;
  lastMessageAt: string | null;
}

export interface AIMessageSummary {
  id: string;
  conversationId: string;
  role: AIMessageRole;
  content: string | null;
  toolCalls: AIToolCall[];
  toolResults: AIToolResult[];
  tokenUsage: number;
  createdAt: string;
}

export interface AIAuditLogEntry {
  requestId: string;
  userId: string;
  agentId: string;
  model: string;
  timestamp: string;
  toolCalls: AIToolCallLog[];
  toolResults: AIToolResultLog[];
  executionDurationMs: number;
  success: boolean;
  error?: string;
  confirmationState: AIToolConfirmationState;
}

export interface AIToolCallLog {
  toolName: string;
  arguments: Record<string, any>;
  confirmationState: AIToolConfirmationState;
}

export interface AIToolResultLog {
  toolName: string;
  success: boolean;
  confirmationState: AIToolConfirmationState;
  durationMs?: number;
}

export interface InvestmentAccountSummary {
  id: string;
  userId: string;
  accountNumber?: string;
  brokerName?: string;
  accountType: InvestmentAccountType;
  baseCurrency: Currency;
  cashBalance: number;
  totalValue: number;
  status: InvestmentAccountStatus;
  createdAt: string;
  updatedAt: string;
}

export interface InvestmentAccountDetail extends InvestmentAccountSummary {
  holdings?: HoldingSummary[];
}

export interface AssetSummary {
  id: string;
  symbol: string;
  name: string;
  assetType: AssetType;
  exchange?: string;
  currency: Currency;
  isin?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AssetDetail extends AssetSummary {
  currentPrice?: number;
  previousPrice?: number;
  priceTimestamp?: string;
}

export interface HoldingSummary {
  id: string;
  userId: string;
  accountId: string;
  assetId: string;
  quantity: number;
  averageCost: number;
  totalCost: number;
  currentValue: number;
  unrealizedPL: number;
  unrealizedPLPercentage: number;
  lastUpdated: string;
  createdAt: string;
  updatedAt: string;
}

export interface HoldingDetail extends HoldingSummary {
  asset?: AssetSummary;
  account?: InvestmentAccountSummary;
}

export interface InvestmentTransactionSummary {
  id: string;
  userId: string;
  accountId: string;
  assetId?: string;
  transactionType: InvestmentTransactionType;
  quantity?: number;
  price?: number;
  amount: number;
  fees: number;
  currency: Currency;
  transactionDate: string;
  reference?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvestmentTransactionDetail extends InvestmentTransactionSummary {
  asset?: AssetSummary;
  account?: InvestmentAccountSummary;
}

export interface WatchlistSummary {
  id: string;
  userId: string;
  name: string;
  description?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WatchlistDetail extends WatchlistSummary {
  items?: WatchlistItemDetail[];
}

export interface WatchlistItemDetail {
  id: string;
  userId: string;
  watchlistId: string;
  assetId: string;
  accountId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvestmentGoalSummary {
  id: string;
  userId: string;
  name: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  currency: Currency;
  targetDate: string;
  isCompleted: boolean;
  isActive: boolean;
  goalType: 'SAVINGS' | 'INVESTMENT';
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioOverview {
  totalPortfolioValue: number;
  totalInvestedCapital: number;
  totalCashBalance: number;
  totalUnrealizedPL: number;
  returnPercentage: number;
}

export interface AssetAllocationItem {
  asset: { id: string; symbol: string; name: string; assetType: AssetType };
  value: number;
  percentage: number;
}

export interface PortfolioPerformancePoint {
  date: string;
  totalValue: number;
  dailyChange: number;
  cumulativeReturn: number;
}

export interface PortfolioPerformanceResponse {
  points: PortfolioPerformancePoint[];
  startDate: string;
  endDate: string;
}

export interface AIAgentSummary {
  id: string;
  name: string;
  description: string;
  version: string;
  isEnabled: boolean;
  capabilities: AIAgentCapability[];
}
