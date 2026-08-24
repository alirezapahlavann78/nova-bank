import { useCallback } from 'react';
import { useAuthStore } from '../stores/authStore';
import { login, register, logout, refreshAccessToken, getAccessToken } from '../services/auth';

export function useAuth() {
  const { user, accessToken, isAuthenticated, isLoading, setAuth, clearAuth, setLoading } =
    useAuthStore();

  const initialize = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getAccessToken();
      if (token) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          useAuthStore.getState().setAuth(
            { id: '', phone: '', locale: 'fa-IR', timezone: 'Asia/Tehran' },
            newToken,
          );
        } else {
          clearAuth();
        }
      } else {
        clearAuth();
      }
    } finally {
      setLoading(false);
    }
  }, [clearAuth, setLoading]);

  const handleLogin = useCallback(
    async (phone: string, password: string) => {
      const response = await login({ phone, password });
      setAuth(response.user, response.accessToken);
      return response;
    },
    [setAuth],
  );

  const handleRegister = useCallback(
    async (phone: string, password: string, email?: string, firstName?: string, lastName?: string) => {
      const response = await register({ phone, password, email, firstName, lastName });
      setAuth(response.user, response.accessToken);
      return response;
    },
    [setAuth],
  );

  const handleLogout = useCallback(async () => {
    await logout();
    clearAuth();
  }, [clearAuth]);

  return {
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    initialize,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
  };
}
