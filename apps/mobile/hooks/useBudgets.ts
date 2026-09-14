import { useCallback, useEffect, useState } from 'react';
import { getBudgets, getBudget, BudgetSummaryResponse } from '../services/budgets';

export function useBudgets(accessToken: string) {
  const [data, setData] = useState<BudgetSummaryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchBudgets = useCallback(async () => {
    if (!accessToken) return;
    setIsLoading(true);
    try {
      setData(await getBudgets(accessToken));
      setError(null);
    } catch (fetchError) {
      setError(fetchError as Error);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void fetchBudgets();
  }, [fetchBudgets]);

  return { data, isLoading, error, refetch: fetchBudgets };
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
