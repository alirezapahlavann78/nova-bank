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

export type Currency = 'IRT' | 'USD' | 'EUR';
export type TransactionType = 'income' | 'expense' | 'transfer';
export type AccountType = 'cash' | 'bank' | 'wallet' | 'credit';
export type BudgetPeriod = 'weekly' | 'monthly' | 'yearly';
export type GoalStatus = 'active' | 'completed' | 'paused';
export type SubscriptionTier = 'FREE' | 'SMART' | 'PRO' | 'BUSINESS';
export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

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
  currency: Currency;
  targetDate: string;
  isCompleted: boolean;
  isActive: boolean;
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
