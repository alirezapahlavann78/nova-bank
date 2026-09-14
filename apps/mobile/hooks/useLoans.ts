import { useState, useCallback, useEffect } from 'react';
import { getLoans, getLoan, makeLoanPayment as apiMakePayment, activateLoanWithDate, LoanResponse } from '../services/lending';

export function useLoans(accessToken: string) {
  const [data, setData] = useState<LoanResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    setIsLoading(true);
    getLoans(accessToken)
      .then(setData)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, [accessToken]);

  return { data, isLoading, error };
}

export function useLoan(accessToken: string, id: string) {
  const [data, setData] = useState<LoanResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchLoan = useCallback(async () => {
    if (!accessToken || !id) return;
    setIsLoading(true);
    try {
      const result = await getLoan(accessToken, id);
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, id]);

  useEffect(() => { fetchLoan(); }, [fetchLoan]);

  return { data, isLoading, error, refetch: fetchLoan };
}

export function useMakeLoanPayment(accessToken: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const makePayment = useCallback(async (loanId: string, amount: number, idempotencyKey?: string) => {
    if (!accessToken) throw new Error('No access token');
    setIsLoading(true);
    try {
      const result = await apiMakePayment(accessToken, loanId, amount, idempotencyKey);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  return { makePayment, isLoading, error };
}

export function useActivateLoan(accessToken: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const activate = useCallback(async (applicationId: string, startDate?: string) => {
    if (!accessToken) throw new Error('No access token');
    setIsLoading(true);
    try {
      if (startDate) {
        return await activateLoanWithDate(accessToken, applicationId, startDate);
      }
      return undefined;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  return { activate, isLoading, error };
}
