import { useFonts, Vazirmatn_400Regular, Vazirmatn_500Medium, Vazirmatn_600SemiBold, Vazirmatn_700Bold, Vazirmatn_800ExtraBold } from '@expo-google-fonts/vazirmatn';
import { I18nManager, Text } from 'react-native';
import { useEffect } from 'react';

export function AppTypography({ children }: { children: React.ReactNode }) {
  const [loaded] = useFonts({
    Vazirmatn: Vazirmatn_400Regular,
    VazirmatnMedium: Vazirmatn_500Medium,
    VazirmatnSemiBold: Vazirmatn_600SemiBold,
    VazirmatnBold: Vazirmatn_700Bold,
    VazirmatnExtraBold: Vazirmatn_800ExtraBold,
  });

  useEffect(() => {
    I18nManager.allowRTL(true);
    I18nManager.forceRTL(true);
  }, []);

  if (!loaded) return null;
  const TextWithDefaults = Text as typeof Text & { defaultProps?: Record<string, unknown> };
  TextWithDefaults.defaultProps = {
    ...TextWithDefaults.defaultProps,
    style: [{ fontFamily: 'Vazirmatn', writingDirection: 'rtl', textAlign: 'right' }],
  };
  return <>{children}</>;
}

export const fontFamily = {
  regular: 'Vazirmatn',
  medium: 'VazirmatnMedium',
  semiBold: 'VazirmatnSemiBold',
  bold: 'VazirmatnBold',
  extraBold: 'VazirmatnExtraBold',
} as const;
