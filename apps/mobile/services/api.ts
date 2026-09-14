export const ACCESS_TOKEN_KEY = 'access_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';

export function getApiBaseUrl(): string {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/+$/, '');

  if (!apiUrl) {
    throw new Error('EXPO_PUBLIC_API_URL is not configured');
  }

  if (!/^https?:\/\//i.test(apiUrl)) {
    throw new Error('EXPO_PUBLIC_API_URL must be an absolute HTTP or HTTPS URL');
  }

  return apiUrl;
}

export function createIdempotencyKey(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

export type ApiError = {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
};

export type ApiResponse<T = any> = {
  data?: T;
  error?: {
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

  const response = await fetch(`${getApiBaseUrl()}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    // Support both API formats: {error:{message}} and Nest's {message, error, statusCode}
    const message: string =
      body?.error?.message ??
      (Array.isArray(body?.message) ? body.message.join('؛ ') : body?.message) ??
      'خطای غیرمنتظره رخ داد';
    const err = new Error(message) as Error & { statusCode?: number };
    err.statusCode = body?.statusCode ?? response.status;
    throw err;
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
  additionalHeaders: Record<string, string> = {},
): Promise<T> {
  return request<T>(
    endpoint,
    { method: 'POST', body: JSON.stringify(body), headers: additionalHeaders },
    accessToken,
  );
}

export async function deleteWithAuth<T>(
  endpoint: string,
  accessToken: string,
): Promise<T> {
  return request<T>(endpoint, { method: 'DELETE' }, accessToken);
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
