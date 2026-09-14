import { getWithAuth, postWithAuth, patchWithAuth, deleteWithAuth, ApiResponse } from './api';

export interface BudgetSummaryResponse {
  id: string;
  userId: string;
  categoryId?: string;
  name: string;
  amount: number;
  spent: number;
  remaining: number;
  percentageUsed: number;
  exceeded: boolean;
  currency: string;
  period: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category?: { id: string; name: string; nameEn: string; type: string };
}

export async function getBudgets(accessToken: string): Promise<BudgetSummaryResponse[]> {
  return getWithAuth<BudgetSummaryResponse[]>('/budgets', accessToken);
}

export async function getBudget(accessToken: string, id: string): Promise<BudgetSummaryResponse> {
  return getWithAuth<BudgetSummaryResponse>(`/budgets/${id}`, accessToken);
}

export async function createBudget(accessToken: string, data: {
  name: string;
  amount: number;
  currency?: string;
  period: string;
  startDate: string;
  endDate: string;
  categoryId?: string;
}): Promise<BudgetSummaryResponse> {
  return postWithAuth<BudgetSummaryResponse>('/budgets', data, accessToken);
}

export async function updateBudget(accessToken: string, id: string, data: {
  name?: string;
  amount?: number;
  currency?: string;
  period?: string;
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  isActive?: boolean;
}): Promise<BudgetSummaryResponse> {
  return patchWithAuth<BudgetSummaryResponse>(`/budgets/${id}`, data, accessToken);
}

export async function deleteBudget(accessToken: string, id: string): Promise<ApiResponse> {
  return deleteWithAuth<ApiResponse>(`/budgets/${id}`, accessToken);
}
