import { useEffect, useState, useCallback } from 'react';
import { getPayments, getPayment, PaymentSummaryResponse } from '../services/payments';

export function usePayments(accessToken: string) {
  const [data, setData] = useState<PaymentSummaryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPayments = useCallback(async () => {
    if (!accessToken) return;
    setIsLoading(true);
    try {
      setData(await getPayments(accessToken));
      setError(null);
    } catch (fetchError) {
      setError(fetchError as Error);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void fetchPayments();
  }, [fetchPayments]);

  return { data, isLoading, error, refetch: fetchPayments };
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
