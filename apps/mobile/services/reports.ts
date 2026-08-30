import { getWithAuth } from './api';

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
  category?: { id: string; name: string; nameEn: string; type: string };
  amount: number;
  percentage: number;
  transactionCount: number;
}

export interface BudgetPerformanceItem {
  budget: { id: string; name: string; amount: number; period: string };
  spent: number;
  remaining: number;
  percentageUsed: number;
  exceeded: boolean;
}

export interface GoalProgressItem {
  goal: { id: string; name: string; targetAmount: number; targetDate: string };
  current: number;
  remaining: number;
  percentageComplete: number;
  completed: boolean;
}

export async function getReportsOverview(accessToken: string, startDate?: string, endDate?: string): Promise<ReportOverview> {
  const params = new URLSearchParams();
  if (startDate) params.set('startDate', startDate);
  if (endDate) params.set('endDate', endDate);
  const query = params.toString();
  return getWithAuth<ReportOverview>(`/reports/overview${query ? `?${query}` : ''}`, accessToken);
}

export async function getReportsTrends(accessToken: string, startDate?: string, endDate?: string): Promise<ReportTrend[]> {
  const params = new URLSearchParams();
  if (startDate) params.set('startDate', startDate);
  if (endDate) params.set('endDate', endDate);
  const query = params.toString();
  return getWithAuth<ReportTrend[]>(`/reports/trends${query ? `?${query}` : ''}`, accessToken);
}

export async function getReportsCategoryBreakdown(accessToken: string, startDate?: string, endDate?: string): Promise<CategoryBreakdownItem[]> {
  const params = new URLSearchParams();
  if (startDate) params.set('startDate', startDate);
  if (endDate) params.set('endDate', endDate);
  const query = params.toString();
  return getWithAuth<CategoryBreakdownItem[]>(`/reports/category-breakdown${query ? `?${query}` : ''}`, accessToken);
}

export async function getReportsBudgetPerformance(accessToken: string): Promise<BudgetPerformanceItem[]> {
  return getWithAuth<BudgetPerformanceItem[]>('/reports/budget-performance', accessToken);
}

export async function getReportsGoalProgress(accessToken: string): Promise<GoalProgressItem[]> {
  return getWithAuth<GoalProgressItem[]>('/reports/goal-progress', accessToken);
}