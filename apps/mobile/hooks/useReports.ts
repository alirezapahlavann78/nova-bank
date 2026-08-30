import { useEffect, useState } from 'react';
import { getReportsOverview, getReportsTrends, getReportsCategoryBreakdown, getReportsBudgetPerformance, getReportsGoalProgress, ReportOverview, ReportTrend, CategoryBreakdownItem, BudgetPerformanceItem, GoalProgressItem } from '../services/reports';

export function useReportsOverview(accessToken: string) {
  const [data, setData] = useState<ReportOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    getReportsOverview(accessToken)
      .then(setData)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, [accessToken]);

  return { data, isLoading, error };
}

export function useReportsTrends(accessToken: string) {
  const [data, setData] = useState<ReportTrend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    getReportsTrends(accessToken)
      .then(setData)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, [accessToken]);

  return { data, isLoading, error };
}

export function useReportsCategoryBreakdown(accessToken: string) {
  const [data, setData] = useState<CategoryBreakdownItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    getReportsCategoryBreakdown(accessToken)
      .then(setData)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, [accessToken]);

  return { data, isLoading, error };
}

export function useReportsBudgetPerformance(accessToken: string) {
  const [data, setData] = useState<BudgetPerformanceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    getReportsBudgetPerformance(accessToken)
      .then(setData)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, [accessToken]);

  return { data, isLoading, error };
}

export function useReportsGoalProgress(accessToken: string) {
  const [data, setData] = useState<GoalProgressItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    getReportsGoalProgress(accessToken)
      .then(setData)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, [accessToken]);

  return { data, isLoading, error };
}