import { getWithAuth, postWithAuth, patchWithAuth, ApiResponse } from './api';

export interface InvestmentAccountSummaryResponse {
  id: string;
  userId: string;
  accountNumber?: string;
  brokerName?: string;
  accountType: string;
  baseCurrency: string;
  cashBalance: number;
  totalValue: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedInvestmentAccounts {
  data: InvestmentAccountSummaryResponse[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export async function getInvestmentAccounts(accessToken: string): Promise<PaginatedInvestmentAccounts> {
  return getWithAuth<PaginatedInvestmentAccounts>('/investments/accounts', accessToken);
}

export async function getInvestmentAccount(accessToken: string, id: string): Promise<InvestmentAccountSummaryResponse> {
  return getWithAuth<InvestmentAccountSummaryResponse>(`/investments/accounts/${id}`, accessToken);
}

export async function createInvestmentAccount(accessToken: string, data: {
  accountNumber?: string;
  brokerName?: string;
  accountType?: string;
  baseCurrency?: string;
  status?: string;
}): Promise<InvestmentAccountSummaryResponse> {
  return postWithAuth<InvestmentAccountSummaryResponse>('/investments/accounts', data, accessToken);
}

export async function updateInvestmentAccount(accessToken: string, id: string, data: {
  accountNumber?: string;
  brokerName?: string;
  accountType?: string;
  baseCurrency?: string;
  status?: string;
}): Promise<InvestmentAccountSummaryResponse> {
  return patchWithAuth<InvestmentAccountSummaryResponse>(`/investments/accounts/${id}`, data, accessToken);
}

export async function deleteInvestmentAccount(accessToken: string, id: string): Promise<ApiResponse> {
  return postWithAuth<ApiResponse>(`/investments/accounts/${id}`, {}, accessToken);
}

export interface PortfolioOverviewResponse {
  totalPortfolioValue: number;
  totalInvestedCapital: number;
  totalCashBalance: number;
  totalUnrealizedPL: number;
  returnPercentage: number;
}

export async function getPortfolioOverview(accessToken: string): Promise<PortfolioOverviewResponse> {
  return getWithAuth<PortfolioOverviewResponse>('/investments/portfolio', accessToken);
}

export async function getPortfolioOverviewLegacy(accessToken: string): Promise<PortfolioOverviewResponse> {
  return getWithAuth<PortfolioOverviewResponse>('/investments/portfolio/overview', accessToken);
}

export interface HoldingResponse {
  id: string;
  accountId: string;
  asset: { id: string; symbol: string; name: string; assetType: string; currency: string };
  quantity: number;
  averagePrice: number;
  currentPrice?: number;
  marketValue: number;
  totalCost: number;
  pl: number;
  plPercentage: number;
  lastUpdated: string;
}

export interface PaginatedHoldings {
  data: HoldingResponse[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export async function getHoldings(accessToken: string, params?: { accountId?: string; assetId?: string }): Promise<PaginatedHoldings> {
  const qs = new URLSearchParams();
  if (params?.accountId) qs.set('accountId', params.accountId);
  if (params?.assetId) qs.set('assetId', params.assetId);
  const endpoint = qs.toString() ? `/investments/portfolio/holdings?${qs.toString()}` : '/investments/portfolio/holdings';
  return getWithAuth<PaginatedHoldings>(endpoint, accessToken);
}

export interface InvestmentTransactionResponse {
  id: string;
  userId: string;
  accountId: string;
  assetId?: string;
  transactionType: string;
  quantity?: number;
  price?: number;
  amount: number;
  fees: number;
  currency: string;
  transactionDate: string;
  reference?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  asset?: { id: string; symbol: string; name: string; assetType: string };
}

export interface PaginatedTransactions {
  data: InvestmentTransactionResponse[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export async function getInvestmentTransactions(accessToken: string, params?: {
  accountId?: string;
  assetId?: string;
  transactionType?: string;
  fromDate?: string;
  toDate?: string;
  limit?: number;
}): Promise<PaginatedTransactions> {
  const qs = new URLSearchParams();
  if (params?.accountId) qs.set('accountId', params.accountId);
  if (params?.assetId) qs.set('assetId', params.assetId);
  if (params?.transactionType) qs.set('transactionType', params.transactionType);
  if (params?.fromDate) qs.set('fromDate', params.fromDate);
  if (params?.toDate) qs.set('toDate', params.toDate);
  if (params?.limit) qs.set('limit', String(params.limit));
  const endpoint = qs.toString() ? `/investments/transactions?${qs.toString()}` : '/investments/transactions';
  return getWithAuth<PaginatedTransactions>(endpoint, accessToken);
}

export interface PortfolioPerformanceResponse {
  points: { date: string; totalValue: number; dailyChange: number; cumulativeReturn: number }[];
  startDate: string;
  endDate: string;
}

export async function getPortfolioPerformance(accessToken: string, params?: { fromDate?: string; toDate?: string }): Promise<PortfolioPerformanceResponse> {
  const qs = new URLSearchParams();
  if (params?.fromDate) qs.set('fromDate', params.fromDate);
  if (params?.toDate) qs.set('toDate', params.toDate);
  const endpoint = qs.toString() ? `/investments/portfolio/performance?${qs.toString()}` : '/investments/portfolio/performance';
  return getWithAuth<PortfolioPerformanceResponse>(endpoint, accessToken);
}

export interface AssetAllocationResponse {
  byAsset: { asset: { id: string; symbol: string; name: string; assetType: string }; value: number; percentage: number }[];
  byAssetType: { assetType: string; value: number; percentage: number }[];
  byAccount: { accountId: string; value: number; percentage: number }[];
}

export async function getAssetAllocation(accessToken: string): Promise<AssetAllocationResponse> {
  return getWithAuth<AssetAllocationResponse>('/investments/portfolio/allocation', accessToken);
}

export interface WatchlistItemResponse {
  id: string;
  assetId: string;
  asset?: { id: string; symbol: string; name: string; assetType: string; exchange?: string; currency: string };
  currentPrice?: number;
  dailyChange: number;
  createdAt: string;
  updatedAt: string;
}

export interface WatchlistResponse {
  id: string;
  userId: string;
  name: string;
  description?: string;
  isDefault: boolean;
  items: WatchlistItemResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedWatchlists {
  data: WatchlistResponse[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export async function getWatchlists(accessToken: string): Promise<PaginatedWatchlists> {
  return getWithAuth<PaginatedWatchlists>('/investments/watchlists', accessToken);
}

export async function getWatchlist(accessToken: string, id: string): Promise<WatchlistResponse> {
  return getWithAuth<WatchlistResponse>(`/investments/watchlists/${id}`, accessToken);
}

export async function createWatchlist(accessToken: string, data: {
  name: string;
  description?: string;
}): Promise<WatchlistResponse> {
  return postWithAuth<WatchlistResponse>('/investments/watchlists', data, accessToken);
}

export async function updateWatchlist(accessToken: string, id: string, data: {
  name?: string;
  description?: string;
}): Promise<WatchlistResponse> {
  return patchWithAuth<WatchlistResponse>(`/investments/watchlists/${id}`, data, accessToken);
}

export async function deleteWatchlist(accessToken: string, id: string): Promise<ApiResponse> {
  return postWithAuth<ApiResponse>(`/investments/watchlists/${id}`, {}, accessToken);
}

export async function addWatchlistAsset(accessToken: string, watchlistId: string, data: {
  assetId: string;
  accountId?: string;
}): Promise<ApiResponse> {
  return postWithAuth<ApiResponse>(`/investments/watchlists/${watchlistId}/assets`, data, accessToken);
}

export async function removeWatchlistAsset(accessToken: string, watchlistId: string, assetId: string): Promise<ApiResponse> {
  return postWithAuth<ApiResponse>(`/investments/watchlists/${watchlistId}/assets/${assetId}`, {}, accessToken);
}
