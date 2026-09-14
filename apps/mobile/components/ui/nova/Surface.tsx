import React from "react";
import {
  View,
  Pressable,
  StyleSheet,
  Platform,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { BlurView } from "expo-blur";
import { layout, radius, spacing, useTheme } from "../../../theme";

export type SurfaceRadiusToken = keyof typeof radius | "xxl";

export interface SurfaceProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  className?: string;
  radius?: SurfaceRadiusToken;
  intensity?: number;
  elevated?: boolean;
}

export function BaseSurface({ children, style, testID }: SurfaceProps) {
  const theme = useTheme();
  return (
    <View
      testID={testID}
      style={[styles.base, { backgroundColor: theme.solidSurface }, style]}
    >
      {children}
    </View>
  );
}

export function ElevatedSurface({ children, style, testID }: SurfaceProps) {
  const theme = useTheme();
  return (
    <BaseSurface testID={testID} style={[styles.elevated, { backgroundColor: theme.solidSurface }, style]}>
      {children}
    </BaseSurface>
  );
}

export function CardSurface({ children, style, testID }: SurfaceProps) {
  const theme = useTheme();
  return (
    <BaseSurface
      testID={testID}
      style={[
        styles.card,
        {
          backgroundColor: theme.solidSurface,
          borderColor: theme.divider,
        },
        style,
      ]}
    >
      {children}
    </BaseSurface>
  );
}

export function InteractiveSurface({
  children,
  style,
  onPress,
  disabled,
  testID,
}: SurfaceProps & { onPress?: () => void; disabled?: boolean }) {
  const theme = useTheme();
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.card,
        styles.interactive,
        {
          backgroundColor: pressed ? theme.divider : theme.solidSurface,
          borderColor: theme.divider,
        },
        style,
      ]}
    >
      {children}
    </Pressable>
  );
}

export function GlassSurface({
  children,
  style,
  testID,
  radius: radiusToken = "card",
  intensity = 35,
  elevated = false,
}: SurfaceProps) {
  const theme = useTheme();
  const isAndroid = Platform.OS === "android";
  const borderRadius = radiusToken === "xxl" ? radius.sheet : radius[radiusToken];
  return (
    <View
      testID={testID}
      style={[
        styles.card,
        styles.glass,
        { borderRadius },
        elevated ? styles.elevatedGlass : null,
        style,
      ]}
    >
      <BlurView
        style={StyleSheet.absoluteFill}
        intensity={intensity}
        tint={theme.mode === "dark" ? "dark" : "light"}
        {...(isAndroid ? { blurMethod: "dimezisBlurView" as const } : {})}
      />
      <View style={styles.glassContent}>{children}</View>
    </View>
  );
}

export function CriticalSurface({ children, style, testID }: SurfaceProps) {
  const theme = useTheme();
  return (
    <BaseSurface
      testID={testID}
      style={[
        styles.card,
        styles.critical,
        {
          backgroundColor: theme.mode === "dark" ? "rgba(239,68,68,0.12)" : "rgba(254,242,242,0.96)",
          borderColor: theme.danger,
        },
        style,
      ]}
    >
      {children}
    </BaseSurface>
  );
}

export function ListSurface({ children, style, testID }: SurfaceProps) {
  return (
    <CardSurface testID={testID} style={[styles.list, style]}>
      {children}
    </CardSurface>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.card,
    padding: layout.cardPadding,
  },
  elevated: {
    shadowColor: "#0f172a",
    shadowOpacity: 0.10,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  card: {
    borderWidth: 1,
    borderRadius: radius.card,
    padding: layout.cardPadding,
    overflow: "hidden",
  },
  interactive: {
    minHeight: layout.minimumTouchTarget,
  },
  glass: {
    backgroundColor: "rgba(255,255,255,0.42)",
    borderColor: "rgba(255,255,255,0.48)",
  },
  elevatedGlass: {
    shadowColor: "#0f172a",
    shadowOpacity: 0.14,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  glassContent: {
    flex: 1,
  },
  critical: {
    borderWidth: 1.5,
  },
  list: {
    borderRadius: radius.row,
    padding: spacing.lg,
    gap: spacing.lg,
  },
});
