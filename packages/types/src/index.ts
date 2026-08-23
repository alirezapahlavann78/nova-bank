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
