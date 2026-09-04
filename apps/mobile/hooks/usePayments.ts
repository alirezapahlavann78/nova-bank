import { useEffect, useState, useCallback } from 'react';
import { getPayments, getPayment, PaymentSummaryResponse } from '../services/payments';

export function usePayments(accessToken: string) {
  const [data, setData] = useState<PaymentSummaryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    setIsLoading(true);
    getPayments(accessToken)
      .then(setData)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, [accessToken]);

  return { data, isLoading, error };
}

export function usePayment(accessToken: string, id: string) {
  const [data, setData] = useState<PaymentSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPayment = useCallback(async () => {
    if (!accessToken || !id) return;
    setIsLoading(true);
    try {
      const result = await getPayment(accessToken, id);
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, id]);

  useEffect(() => {
    fetchPayment();
  }, [fetchPayment]);

  return { data, isLoading, error, refetch: fetchPayment };
}
