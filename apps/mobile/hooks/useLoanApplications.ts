import { useState, useEffect } from 'react';
import { getLoanApplications, LoanApplicationResponse } from '../services/lending';

export function useLoanApplications(accessToken: string) {
  const [data, setData] = useState<LoanApplicationResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    setIsLoading(true);
    getLoanApplications(accessToken)
      .then(setData)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, [accessToken]);

  return { data, isLoading, error };
}
