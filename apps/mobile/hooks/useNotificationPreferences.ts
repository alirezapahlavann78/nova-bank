import { useEffect, useState } from 'react';
import { getNotificationPreferences, updateNotificationPreferences, NotificationPreferencesResponse } from '../services/notifications';

export function useNotificationPreferences(accessToken: string) {
  const [data, setData] = useState<NotificationPreferencesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    getNotificationPreferences(accessToken)
      .then(setData)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, [accessToken]);

  const update = async (updates: Partial<NotificationPreferencesResponse>) => {
    if (!accessToken) return;
    const updated = await updateNotificationPreferences(accessToken, updates);
    setData(updated);
    return updated;
  };

  return { data, isLoading, error, update };
}