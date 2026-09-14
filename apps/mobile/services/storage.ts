import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Platform-aware secure storage.
 *
 * `expo-secure-store` is NOT available on web (it throws on the first call),
 * which previously made login/register throw right AFTER a successful API
 * response — the token was issued but the user stayed on the auth screen.
 *
 * On web we transparently fall back to AsyncStorage (backed by localStorage).
 */
const isWeb = Platform.OS === 'web';

export async function setSecureItem(key: string, value: string): Promise<void> {
  if (isWeb) {
    await AsyncStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

export async function getSecureItem(key: string): Promise<string | null> {
  if (isWeb) {
    return AsyncStorage.getItem(key);
  }
  return SecureStore.getItemAsync(key);
}

export async function deleteSecureItem(key: string): Promise<void> {
  if (isWeb) {
    await AsyncStorage.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}
