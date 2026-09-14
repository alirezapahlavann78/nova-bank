import { useColorScheme } from 'nativewind';
import { darkTheme, lightTheme, Theme } from './tokens';
import { accent, glass, inputTokens, status } from './theme';

export * from './tokens';
export * from './design-tokens';
export { accent, glass, inputTokens, status };

/** Resolves the active design theme from the system/`dark` class colour scheme. */
export function useTheme(): Theme {
  const { colorScheme } = useColorScheme();
  return colorScheme === 'dark' ? darkTheme : lightTheme;
}
