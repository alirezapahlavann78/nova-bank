const API_BASE_URL = __DEV__
  ? 'http://localhost:3000/api/v1'
  : 'https://api.novabank.app/api/v1';

export const ACCESS_TOKEN_KEY = 'access_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';

export type ApiError = {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
};

export type AuthTokensResponse = {
  user: {
    id: string;
    phone: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    locale: string;
    timezone: string;
  };
  accessToken: string;
  refreshToken: string;
};

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  accessToken?: string,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({
      error: { code: 'UNKNOWN_ERROR', message: 'An unexpected error occurred' },
    }));
    throw new Error(error.error.message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export async function getWithAuth<T>(
  endpoint: string,
  accessToken: string,
): Promise<T> {
  return request<T>(endpoint, { method: 'GET' }, accessToken);
}

export async function postWithAuth<T>(
  endpoint: string,
  body: unknown,
  accessToken: string,
): Promise<T> {
  return request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }, accessToken);
}

export async function patchWithAuth<T>(
  endpoint: string,
  body: unknown,
  accessToken: string,
): Promise<T> {
  return request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body) }, accessToken);
}

export async function postAuth<T>(
  endpoint: string,
  body: unknown,
): Promise<T> {
  return request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) });
}
