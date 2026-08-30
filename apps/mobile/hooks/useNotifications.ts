import { useEffect, useState } from 'react';
import { getNotifications, NotificationSummaryResponse } from '../services/notifications';

export function useNotifications(accessToken: string, page?: number, limit?: number, isRead?: boolean, type?: string) {
  const [data, setData] = useState<NotificationSummaryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });

  useEffect(() => {
    if (!accessToken) return;
    getNotifications(accessToken, page, limit, isRead, type)
      .then((result) => {
        setData(result.data);
        setMeta({ page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages });
      })
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, [accessToken, page, limit, isRead, type]);

  return { data, isLoading, error, meta };
}