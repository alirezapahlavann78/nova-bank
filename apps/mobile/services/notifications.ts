import { getWithAuth, patchWithAuth, postWithAuth, ApiResponse } from './api';

export interface NotificationSummaryResponse {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPreferencesResponse {
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

export async function getNotifications(accessToken: string, page?: number, limit?: number, isRead?: boolean, type?: string): Promise<{ data: NotificationSummaryResponse[]; page: number; limit: number; total: number; totalPages: number }> {
  const params = new URLSearchParams();
  if (page) params.set('page', String(page));
  if (limit) params.set('limit', String(limit));
  if (isRead !== undefined) params.set('isRead', String(isRead));
  if (type) params.set('type', type);
  const query = params.toString();
  return getWithAuth(`/notifications${query ? `?${query}` : ''}`, accessToken);
}

export async function getNotification(accessToken: string, id: string): Promise<NotificationSummaryResponse> {
  return getWithAuth<NotificationSummaryResponse>(`/notifications/${id}`, accessToken);
}

export async function markAsRead(accessToken: string, id: string): Promise<ApiResponse> {
  return patchWithAuth<ApiResponse>(`/notifications/${id}/read`, {}, accessToken);
}

export async function markAllAsRead(accessToken: string): Promise<ApiResponse> {
  return patchWithAuth<ApiResponse>('/notifications/read-all', {}, accessToken);
}

export async function deleteNotification(accessToken: string, id: string): Promise<ApiResponse> {
  return postWithAuth<ApiResponse>(`/notifications/${id}`, {}, accessToken);
}

export async function getNotificationPreferences(accessToken: string): Promise<NotificationPreferencesResponse> {
  return getWithAuth<NotificationPreferencesResponse>('/notifications/preferences', accessToken);
}

export async function updateNotificationPreferences(accessToken: string, data: {
  budgetAlerts?: boolean;
  goalAlerts?: boolean;
  transactionAlerts?: boolean;
  transferAlerts?: boolean;
  systemAlerts?: boolean;
  pushEnabled?: boolean;
}): Promise<NotificationPreferencesResponse> {
  return patchWithAuth<NotificationPreferencesResponse>('/notifications/preferences', data, accessToken);
}