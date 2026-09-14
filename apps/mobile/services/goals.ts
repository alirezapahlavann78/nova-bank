import { getWithAuth, postWithAuth, patchWithAuth, deleteWithAuth, ApiResponse } from './api';

export interface GoalSummaryResponse {
  id: string;
  userId: string;
  name: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  remaining: number;
  percentageComplete: number;
  currency: string;
  targetDate: string;
  isCompleted: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function getGoals(accessToken: string): Promise<GoalSummaryResponse[]> {
  return getWithAuth<GoalSummaryResponse[]>('/goals', accessToken);
}

export async function getGoal(accessToken: string, id: string): Promise<GoalSummaryResponse> {
  return getWithAuth<GoalSummaryResponse>(`/goals/${id}`, accessToken);
}

export async function createGoal(accessToken: string, data: {
  name: string;
  description?: string;
  targetAmount: number;
  currency?: string;
  targetDate: string;
}): Promise<GoalSummaryResponse> {
  return postWithAuth<GoalSummaryResponse>('/goals', data, accessToken);
}

export async function updateGoal(accessToken: string, id: string, data: {
  name?: string;
  description?: string;
  targetAmount?: number;
  currency?: string;
  targetDate?: string;
  isActive?: boolean;
}): Promise<GoalSummaryResponse> {
  return patchWithAuth<GoalSummaryResponse>(`/goals/${id}`, data, accessToken);
}

export async function deleteGoal(accessToken: string, id: string): Promise<ApiResponse> {
  return deleteWithAuth<ApiResponse>(`/goals/${id}`, accessToken);
}

export async function addGoalProgress(accessToken: string, id: string, amount: number): Promise<GoalSummaryResponse> {
  return postWithAuth<GoalSummaryResponse>(`/goals/${id}/progress`, { amount }, accessToken);
}
