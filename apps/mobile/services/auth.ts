import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { postAuth, AuthTokensResponse, REFRESH_TOKEN_KEY } from './api';

const ACCESS_TOKEN_MEMORY_KEY = '@nova_bank_access_token_memory';
const API_BASE_URL = __DEV__
  ? 'http://localhost:3000/api/v1'
  : 'https://api.novabank.app/api/v1';

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

  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, response.refreshToken);
  await AsyncStorage.setItem(ACCESS_TOKEN_MEMORY_KEY, response.accessToken);

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

  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, response.refreshToken);
  await AsyncStorage.setItem(ACCESS_TOKEN_MEMORY_KEY, response.accessToken);

  return response;
}

export async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  if (!refreshToken) {
    return null;
  }

  try {
    const response = await postAuth<{ accessToken: string }>('/auth/refresh', {
      refreshToken,
    });

    await AsyncStorage.setItem(ACCESS_TOKEN_MEMORY_KEY, response.accessToken);
    return response.accessToken;
  } catch {
    await logout();
    return null;
  }
}

export async function logout(): Promise<void> {
  const accessToken = await AsyncStorage.getItem(ACCESS_TOKEN_MEMORY_KEY);
  const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);

  if (accessToken && refreshToken) {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
    } catch {
      // ignore logout errors
    }
  }

  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  await AsyncStorage.removeItem(ACCESS_TOKEN_MEMORY_KEY);
}

export async function getAccessToken(): Promise<string | null> {
  return AsyncStorage.getItem(ACCESS_TOKEN_MEMORY_KEY);
}
