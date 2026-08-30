import { useEffect, useState } from 'react';
import { getBudgets, getBudget, BudgetSummaryResponse } from '../services/budgets';

export function useBudgets(accessToken: string) {
  const [data, setData] = useState<BudgetSummaryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    getBudgets(accessToken)
      .then(setData)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, [accessToken]);

  return { data, isLoading, error };
}

export function useBudget(accessToken: string, id: string) {
  const [data, setData] = useState<BudgetSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!accessToken || !id) return;
    getBudget(accessToken, id)
      .then(setData)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, [accessToken, id]);

  return { data, isLoading, error };
}