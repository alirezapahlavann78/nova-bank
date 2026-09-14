import AsyncStorage from '@react-native-async-storage/async-storage';
import { postAuth, postWithAuth, AuthTokensResponse, REFRESH_TOKEN_KEY } from './api';
import { setSecureItem, getSecureItem, deleteSecureItem } from './storage';

const ACCESS_TOKEN_SECURE_KEY = '@nova_bank_access_token';
const ACCESS_TOKEN_LEGACY_KEY = '@nova_bank_access_token_memory';

export interface LoginInput {
  phone: string;
  password: string;
}

export interface RegisterInput {
  phone: string;
  password: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

export async function login(input: LoginInput): Promise<AuthTokensResponse> {
  const response = await postAuth<AuthTokensResponse>('/auth/login', {
    phone: input.phone,
    password: input.password,
  });

  await setSecureItem(REFRESH_TOKEN_KEY, response.refreshToken);
  await setSecureItem(ACCESS_TOKEN_SECURE_KEY, response.accessToken);
  await AsyncStorage.removeItem(ACCESS_TOKEN_LEGACY_KEY);

  return response;
}

export async function register(input: RegisterInput): Promise<AuthTokensResponse> {
  const response = await postAuth<AuthTokensResponse>('/auth/register', {
    phone: input.phone,
    password: input.password,
    email: input.email,
    firstName: input.firstName,
    lastName: input.lastName,
  });

  await setSecureItem(REFRESH_TOKEN_KEY, response.refreshToken);
  await setSecureItem(ACCESS_TOKEN_SECURE_KEY, response.accessToken);
  await AsyncStorage.removeItem(ACCESS_TOKEN_LEGACY_KEY);

  return response;
}

export async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = await getSecureItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) {
    return null;
  }

  try {
    // The server rotates the refresh token: persist the NEW one, otherwise
    // the next refresh would replay an already-revoked token.
    const response = await postAuth<{ accessToken: string; refreshToken: string }>(
      '/auth/refresh',
      { refreshToken },
    );

    await setSecureItem(ACCESS_TOKEN_SECURE_KEY, response.accessToken);
    await AsyncStorage.removeItem(ACCESS_TOKEN_LEGACY_KEY);
    if (response.refreshToken) {
      await setSecureItem(REFRESH_TOKEN_KEY, response.refreshToken);
    }
    return response.accessToken;
  } catch {
    await logout();
    return null;
  }
}

export async function logout(): Promise<void> {
  const accessToken = await getAccessToken();
  const refreshToken = await getSecureItem(REFRESH_TOKEN_KEY);

  if (accessToken && refreshToken) {
    try {
      await postWithAuth('/auth/logout', {}, accessToken);
    } catch {
      // ignore logout errors
    }
  }

  await deleteSecureItem(REFRESH_TOKEN_KEY);
  await deleteSecureItem(ACCESS_TOKEN_SECURE_KEY);
  await AsyncStorage.removeItem(ACCESS_TOKEN_LEGACY_KEY);
}

export async function getAccessToken(): Promise<string | null> {
  const accessToken = await getSecureItem(ACCESS_TOKEN_SECURE_KEY);
  if (accessToken) return accessToken;

  const legacyAccessToken = await AsyncStorage.getItem(ACCESS_TOKEN_LEGACY_KEY);
  if (!legacyAccessToken) return null;

  await setSecureItem(ACCESS_TOKEN_SECURE_KEY, legacyAccessToken);
  await AsyncStorage.removeItem(ACCESS_TOKEN_LEGACY_KEY);
  return legacyAccessToken;
}
