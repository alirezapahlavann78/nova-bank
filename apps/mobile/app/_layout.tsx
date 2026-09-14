import "../global.css";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect, useRef } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { vars } from "nativewind";
import { GradientBackground, GlassSurface } from "../components/ui";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../theme";
import { AppTypography } from "../components/AppTypography";

function RootLayoutNav() {
  const segments = useSegments();
  const router = useRouter();
  const { isAuthenticated, isLoading, initialize } = useAuth();
  const theme = useTheme();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    void initialize();
  }, [initialize]);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuthGroup) {
      router.replace("/(tabs)/dashboard");
    }
  }, [isAuthenticated, isLoading, segments, router]);

  if (isLoading) {
    return (
      <GradientBackground>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <GlassSurface radius="xxl" intensity={65} elevated style={{ padding: 30 }}>
            <ActivityIndicator size="large" color={theme.tint} />
            <Text
              style={{
                marginTop: 16,
                color: theme.textSecondary,
                fontSize: 14.5,
                fontWeight: "600",
              }}
            >
              در حال آماده‌سازی...
            </Text>
          </GlassSurface>
        </View>
      </GradientBackground>
    );
  }

  return (
    <AppTypography>
      <Slot />
    </AppTypography>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <ThemeVariableProvider>
        <RootLayoutNav />
      </ThemeVariableProvider>
    </SafeAreaProvider>
  );
}

export function ThemeVariableProvider({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const grayScale =
    theme.mode === "dark"
      ? {
          "--color-gray-50": "11 18 32",
          "--color-gray-100": "17 24 39",
          "--color-gray-200": "30 41 59",
          "--color-gray-300": "51 65 85",
          "--color-gray-400": "100 116 139",
          "--color-gray-500": "148 163 184",
          "--color-gray-600": "203 213 225",
          "--color-gray-700": "226 232 240",
          "--color-gray-800": "241 245 249",
          "--color-gray-900": "248 250 252",
        }
      : {
          "--color-gray-50": "248 250 252",
          "--color-gray-100": "241 245 249",
          "--color-gray-200": "226 232 240",
          "--color-gray-300": "203 213 225",
          "--color-gray-400": "148 163 184",
          "--color-gray-500": "100 116 139",
          "--color-gray-600": "71 85 105",
          "--color-gray-700": "51 65 85",
          "--color-gray-800": "30 41 59",
          "--color-gray-900": "15 23 42",
        };

  return <View style={[styles.root, vars(grayScale)]}>{children}</View>;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
