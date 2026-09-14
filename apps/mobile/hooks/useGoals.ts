import { useCallback, useEffect, useState } from 'react';
import { getGoals, getGoal, GoalSummaryResponse } from '../services/goals';

export function useGoals(accessToken: string) {
  const [data, setData] = useState<GoalSummaryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchGoals = useCallback(async () => {
    if (!accessToken) return;
    setIsLoading(true);
    try {
      setData(await getGoals(accessToken));
      setError(null);
    } catch (fetchError) {
      setError(fetchError as Error);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void fetchGoals();
  }, [fetchGoals]);

  return { data, isLoading, error, refetch: fetchGoals };
}

export function useGoal(accessToken: string, id: string) {
  const [data, setData] = useState<GoalSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchGoal = useCallback(async () => {
    if (!accessToken || !id) return;
    setIsLoading(true);
    try {
      setData(await getGoal(accessToken, id));
      setError(null);
    } catch (fetchError) {
      setError(fetchError as Error);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, id]);

  useEffect(() => {
    void fetchGoal();
  }, [fetchGoal]);

  return { data, isLoading, error, refetch: fetchGoal };
}
