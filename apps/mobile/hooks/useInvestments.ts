import { useEffect, useState } from 'react';
import {
  getInvestmentAccounts,
  getInvestmentAccount,
  getPortfolioOverview,
  getHoldings,
  getInvestmentTransactions,
  getPortfolioPerformance,
  getAssetAllocation,
  getWatchlists,
  getWatchlist,
  InvestmentAccountSummaryResponse,
  PaginatedInvestmentAccounts,
   PortfolioOverviewResponse,
   PaginatedHoldings,
   PaginatedTransactions,
  PortfolioPerformanceResponse,
  AssetAllocationResponse,
  WatchlistResponse,
  PaginatedWatchlists,
} from '../services/investments';

export function useInvestmentAccounts(accessToken: string) {
  const [data, setData] = useState<PaginatedInvestmentAccounts | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    getInvestmentAccounts(accessToken)
      .then(setData)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, [accessToken]);

  return { data, isLoading, error };
}

export function useInvestmentAccount(accessToken: string, id: string) {
  const [data, setData] = useState<InvestmentAccountSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!accessToken || !id) return;
    getInvestmentAccount(accessToken, id)
      .then(setData)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, [accessToken, id]);

  return { data, isLoading, error };
}

export function usePortfolioOverview(accessToken: string) {
  const [data, setData] = useState<PortfolioOverviewResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    getPortfolioOverview(accessToken)
      .then(setData)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, [accessToken]);

  return { data, isLoading, error };
}

export function useHoldings(accessToken: string, params?: { accountId?: string; assetId?: string }) {
  const [data, setData] = useState<PaginatedHoldings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    getHoldings(accessToken, params)
      .then(setData)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, [accessToken, JSON.stringify(params)]);

  return { data, isLoading, error };
}

export function useInvestmentTransactions(accessToken: string, params?: any) {
  const [data, setData] = useState<PaginatedTransactions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    getInvestmentTransactions(accessToken, params)
      .then(setData)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, [accessToken, JSON.stringify(params)]);

  return { data, isLoading, error };
}

export function usePortfolioPerformance(accessToken: string, params?: { fromDate?: string; toDate?: string }) {
  const [data, setData] = useState<PortfolioPerformanceResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    getPortfolioPerformance(accessToken, params)
      .then(setData)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, [accessToken, JSON.stringify(params)]);

  return { data, isLoading, error };
}

export function useAssetAllocation(accessToken: string) {
  const [data, setData] = useState<AssetAllocationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    getAssetAllocation(accessToken)
      .then(setData)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, [accessToken]);

  return { data, isLoading, error };
}

export function useWatchlists(accessToken: string) {
  const [data, setData] = useState<PaginatedWatchlists | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    getWatchlists(accessToken)
      .then(setData)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, [accessToken]);

  return { data, isLoading, error };
}

export function useWatchlist(accessToken: string, id: string) {
  const [data, setData] = useState<WatchlistResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!accessToken || !id) return;
    getWatchlist(accessToken, id)
      .then(setData)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, [accessToken, id]);

  return { data, isLoading, error };
}
