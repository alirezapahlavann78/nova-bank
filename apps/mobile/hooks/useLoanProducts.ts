import { useState, useCallback } from 'react';
import { getLoanProducts, LoanProductResponse } from '../services/lending';

export function useLoanProducts(accessToken: string) {
  const [data, setData] = useState<LoanProductResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProducts = useCallback(async () => {
    if (!accessToken) return;
    setIsLoading(true);
    try {
      const result = await getLoanProducts(accessToken);
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  return { data, isLoading, error, refetch: fetchProducts };
}
