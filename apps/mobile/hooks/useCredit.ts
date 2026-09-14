import { useState, useCallback, useEffect } from 'react';
import { getCreditScore, getCreditScoreHistory, checkEligibility, getFinancialHealth, getCreditProfile, CreditScoreResponse, EligibilityResponse, FinancialHealthResponse, CreditProfileResponse } from '../services/lending';

export function useCreditScore(accessToken: string) {
  const [data, setData] = useState<CreditScoreResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    setIsLoading(true);
    getCreditScore(accessToken)
      .then(setData)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, [accessToken]);

  return { data, isLoading, error };
}

export function useCreditScoreHistory(accessToken: string) {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    setIsLoading(true);
    getCreditScoreHistory(accessToken)
      .then(setData)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, [accessToken]);

  return { data, isLoading, error };
}

export function useCreditProfile(accessToken: string) {
  const [data, setData] = useState<CreditProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    setIsLoading(true);
    getCreditProfile(accessToken)
      .then(setData)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, [accessToken]);

  return { data, isLoading, error };
}

export function useFinancialHealth(accessToken: string) {
  const [data, setData] = useState<FinancialHealthResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    setIsLoading(true);
    getFinancialHealth(accessToken)
      .then(setData)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, [accessToken]);

  return { data, isLoading, error };
}

export function useCheckEligibility(accessToken: string) {
  const [data, setData] = useState<EligibilityResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const check = useCallback(async (amount: number, currency = 'IRT', duration = 12) => {
    if (!accessToken) throw new Error('No access token');
    setIsLoading(true);
    try {
      const result = await checkEligibility(accessToken, amount, currency, duration);
      setData(result);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  return { data, isLoading, error, check };
}
