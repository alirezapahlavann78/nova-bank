import React from "react";
import { View, StyleSheet, I18nManager, type DimensionValue, type StyleProp, type ViewStyle } from "react-native";
import { radius, spacing, useTheme } from "../../../theme";
import { Typography } from "./Typography";

export interface ProgressBarProps {
  progress: number;
  tone?: "default" | "positive" | "negative";
  label?: string;
  value?: string;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function ProgressBar({
  progress,
  tone = "default",
  label,
  value,
  accessibilityLabel,
  style,
  testID,
}: ProgressBarProps) {
  const theme = useTheme();
  const clamped = Number.isFinite(progress) ? Math.min(100, Math.max(0, progress)) : 0;
  const color = tone === "positive" ? theme.success : tone === "negative" ? theme.danger : theme.tint;

  return (
    <View style={style}>
      {label || value ? (
        <View style={styles.header}>
          {label ? <Typography variant="bodySmall" color={theme.textSecondary}>{label}</Typography> : null}
          {value ? <Typography variant="bodySmall" color={theme.textPrimary}>{value}</Typography> : null}
        </View>
      ) : null}
      <View
        testID={testID}
        accessibilityRole="progressbar"
        accessibilityLabel={accessibilityLabel ?? label ?? "پیشرفت"}
        accessibilityValue={{ min: 0, max: 100, now: clamped }}
        style={[styles.track, { backgroundColor: theme.divider }]}
      >
        <View
          style={{
            width: `${clamped}%` as DimensionValue,
            height: "100%",
            borderRadius: radius.pill,
            backgroundColor: color,
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  track: {
    height: 8,
    borderRadius: radius.pill,
    overflow: "hidden",
    flexDirection: I18nManager.isRTL ? "row-reverse" : "row",
  },
});
