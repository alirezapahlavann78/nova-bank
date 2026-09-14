import { createIdempotencyKey, getWithAuth, postWithAuth } from './api';

export interface LoanProductResponse {
  id: string;
  userId: string | null;
  name: string;
  description: string | null;
  minAmount: number;
  maxAmount: number;
  interestRate: number;
  durationMonths: number;
  installmentFrequency: string;
  currency: string;
  requiredScoreBand: string | null;
  status: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoanApplicationResponse {
  id: string;
  userId: string;
  loanProductId: string;
  requestedAmount: number;
  currency: string;
  durationMonths: number;
  purpose: string | null;
  status: string;
  eligibilityResult: Record<string, any> | null;
  riskLevel: string | null;
  scoringVersion: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  approvedAt: string | null;
  rejectedAt: string | null;
  rejectionReason: string | null;
  loanId: string | null;
  loan: { id: string; status: string; remainingBalance: number } | null;
  loanProduct: LoanProductResponse;
  createdAt: string;
  updatedAt: string;
}

export interface LoanResponse {
  id: string;
  userId: string;
  loanApplicationId: string;
  loanProductId: string;
  principal: number;
  interestAmount: number;
  totalPayable: number;
  remainingBalance: number;
  currency: string;
  status: string;
  interestRate: number;
  startDate: string;
  maturityDate: string;
  createdAt: string;
  updatedAt: string;
  product: LoanProductResponse;
  application: LoanApplicationResponse;
  installments: LoanInstallmentResponse[];
}

export interface LoanInstallmentResponse {
  id: string;
  userId: string;
  loanId: string;
  installmentNumber: number;
  dueDate: string;
  principalAmount: number;
  interestAmount: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: string;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LoanPaymentResponse {
  id: string;
  userId: string;
  loanId: string;
  installmentId: string | null;
  amount: number;
  currency: string;
  status: string;
  paymentDate: string | null;
  reference: string | null;
  idempotencyKey: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreditProfileResponse {
  id: string;
  userId: string;
  internalScore: number;
  scoreBand: string;
  totalDebt: number;
  activeLoans: number;
  repaymentHistory: string;
  utilization: number;
  scoringVersion: string;
  lastCalculatedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreditScoreResponse {
  score: number;
  band: string;
  reasons: string[];
  previousScore: number | null;
  calculatedAt: string | null;
}

export interface EligibilityResponse {
  eligible: boolean;
  maxEligibleAmount: number;
  riskLevel: string;
  reasons: string[];
}

export interface FinancialHealthResponse {
  creditScore: CreditScoreResponse;
  profile: CreditProfileResponse;
  totalActiveDebt: number;
  activeLoanCount: number;
  loans: Array<{
    id: string;
    principal: number;
    remainingBalance: number;
    status: string;
    interestRate: number;
    currency: string;
  }>;
}

export async function getLoanProducts(accessToken: string, activeOnly = true): Promise<LoanProductResponse[]> {
  const query = activeOnly !== undefined ? `?activeOnly=${activeOnly}` : '';
  return getWithAuth<LoanProductResponse[]>(`/loan-products${query}`, accessToken);
}

export async function getLoanProduct(accessToken: string, id: string): Promise<LoanProductResponse> {
  return getWithAuth<LoanProductResponse>(`/loan-products/${id}`, accessToken);
}

export async function getLoanApplications(accessToken: string): Promise<LoanApplicationResponse[]> {
  return getWithAuth<LoanApplicationResponse[]>('/loan-applications', accessToken);
}

export async function getLoanApplication(accessToken: string, id: string): Promise<LoanApplicationResponse> {
  return getWithAuth<LoanApplicationResponse>(`/loan-applications/${id}`, accessToken);
}

export async function createLoanApplication(accessToken: string, data: {
  loanProductId: string;
  requestedAmount: number;
  durationMonths: number;
  currency?: string;
  purpose?: string;
}): Promise<LoanApplicationResponse> {
  return postWithAuth<LoanApplicationResponse>('/loan-applications', data, accessToken);
}

export async function getLoans(accessToken: string): Promise<LoanResponse[]> {
  return getWithAuth<LoanResponse[]>('/loans', accessToken);
}

export async function getLoan(accessToken: string, id: string): Promise<LoanResponse> {
  return getWithAuth<LoanResponse>(`/loans/${id}`, accessToken);
}

export async function makeLoanPayment(
  accessToken: string,
  loanId: string,
  amount: number,
  idempotencyKey = createIdempotencyKey('loan-payment'),
): Promise<any> {
  return postWithAuth<any>(
    `/loans/${loanId}/pay`,
    { amount },
    accessToken,
    { 'idempotency-key': idempotencyKey },
  );
}

export async function activateLoan(accessToken: string, applicationId: string): Promise<any> {
  return postWithAuth<any>(`/loans/activate/${applicationId}`, {}, accessToken);
}

export async function activateLoanWithDate(accessToken: string, applicationId: string, startDate: string): Promise<any> {
  return postWithAuth<any>(`/loans/activate/${applicationId}`, { startDate }, accessToken);
}

export async function getCreditProfile(accessToken: string): Promise<CreditProfileResponse> {
  return getWithAuth<CreditProfileResponse>('/credit/profile', accessToken);
}

export async function getCreditScore(accessToken: string): Promise<CreditScoreResponse> {
  return getWithAuth<CreditScoreResponse>('/credit/score', accessToken);
}

export async function getCreditScoreHistory(accessToken: string): Promise<any[]> {
  return getWithAuth<any[]>('/credit/score-history', accessToken);
}

export async function checkEligibility(accessToken: string, amount: number, currency = 'IRT', duration = 12): Promise<EligibilityResponse> {
  return getWithAuth<EligibilityResponse>(`/credit/eligibility?amount=${amount}&currency=${currency}&duration=${duration}`, accessToken);
}

export async function getFinancialHealth(accessToken: string): Promise<FinancialHealthResponse> {
  return getWithAuth<FinancialHealthResponse>('/credit/financial-health', accessToken);
}
