import { useEffect, useState } from 'react';
import { getGoals, getGoal, GoalSummaryResponse } from '../services/goals';

export function useGoals(accessToken: string) {
  const [data, setData] = useState<GoalSummaryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    getGoals(accessToken)
      .then(setData)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, [accessToken]);

  return { data, isLoading, error };
}

export function useGoal(accessToken: string, id: string) {
  const [data, setData] = useState<GoalSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!accessToken || !id) return;
    getGoal(accessToken, id)
      .then(setData)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, [accessToken, id]);

  return { data, isLoading, error };
}