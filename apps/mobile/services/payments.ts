import { getWithAuth, postWithAuth, ApiResponse } from './api';

export interface PaymentSummaryResponse {
  id: string;
  userId: string;
  type: string;
  status: string;
  amount: number;
  currency: string;
  sourceAccountId: string;
  destinationType: string;
  destinationValue: string;
  destinationName?: string;
  description?: string;
  fees: number;
  reference?: string;
  internalReference?: string;
  riskLevel?: string;
  executedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BeneficiarySummaryResponse {
  id: string;
  userId: string;
  name: string;
  destinationType: string;
  destinationValue: string;
  bankCode?: string;
  bankName?: string;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentTemplateSummaryResponse {
  id: string;
  userId: string;
  name: string;
  type: string;
  amount?: number;
  sourceAccountId?: string;
  destinationType: string;
  destinationValue: string;
  beneficiaryId?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduledPaymentSummaryResponse {
  id: string;
  userId: string;
  templateId?: string;
  type: string;
  amount: number;
  currency: string;
  sourceAccountId: string;
  destinationType: string;
  destinationValue: string;
  status: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  nextRunAt: string;
  lastRunAt?: string;
  runCount: number;
  maxRuns?: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export async function getPayments(accessToken: string): Promise<PaymentSummaryResponse[]> {
  return getWithAuth<PaymentSummaryResponse[]>('/payments', accessToken);
}

export async function getPayment(accessToken: string, id: string): Promise<PaymentSummaryResponse> {
  return getWithAuth<PaymentSummaryResponse>(`/payments/${id}`, accessToken);
}

export async function createPayment(accessToken: string, data: {
  type: string;
  amount: number;
  currency?: string;
  sourceAccountId: string;
  destinationType: string;
  destinationValue: string;
  destinationName?: string;
  description?: string;
  fees?: number;
  idempotencyKey?: string;
}): Promise<PaymentSummaryResponse> {
  const { idempotencyKey, ...payment } = data;
  return postWithAuth<PaymentSummaryResponse>(
    '/payments',
    payment,
    accessToken,
    idempotencyKey ? { 'idempotency-key': idempotencyKey } : {},
  );
}

export async function cancelPayment(accessToken: string, id: string): Promise<ApiResponse> {
  return postWithAuth<ApiResponse>(`/payments/${id}/cancel`, {}, accessToken);
}

export interface PaymentAuditResponse {
  id: string;
  paymentId: string;
  userId: string;
  action: string;
  status: string;
  requestId?: string;
  failureReason?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export async function getPaymentAudit(accessToken: string, id: string): Promise<PaymentAuditResponse[]> {
  return getWithAuth<PaymentAuditResponse[]>(`/payments/${id}/audit`, accessToken);
}

export async function getBeneficiaries(accessToken: string): Promise<BeneficiarySummaryResponse[]> {
  return getWithAuth<BeneficiarySummaryResponse[]>('/beneficiaries', accessToken);
}

export async function createBeneficiary(accessToken: string, data: {
  name: string;
  destinationType: string;
  destinationValue: string;
  bankCode?: string;
  bankName?: string;
  isFavorite?: boolean;
}): Promise<BeneficiarySummaryResponse> {
  return postWithAuth<BeneficiarySummaryResponse>('/beneficiaries', data, accessToken);
}

export async function getPaymentTemplates(accessToken: string): Promise<PaymentTemplateSummaryResponse[]> {
  return getWithAuth<PaymentTemplateSummaryResponse[]>('/payment-templates', accessToken);
}

export async function getScheduledPayments(accessToken: string): Promise<ScheduledPaymentSummaryResponse[]> {
  return getWithAuth<ScheduledPaymentSummaryResponse[]>('/scheduled-payments', accessToken);
}

export async function createScheduledPayment(accessToken: string, data: {
  type: string;
  amount: number;
  currency?: string;
  sourceAccountId: string;
  destinationType: string;
  destinationValue: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  maxRuns?: number;
  description?: string;
  templateId?: string;
}): Promise<ScheduledPaymentSummaryResponse> {
  return postWithAuth<ScheduledPaymentSummaryResponse>('/scheduled-payments', data, accessToken);
}
