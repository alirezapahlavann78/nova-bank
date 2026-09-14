import React from "react";
import { View, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { radius, spacing, useTheme } from "../../../theme";
import { NovaIcon, NovaIconName } from "./Icon";
import { Typography } from "./Typography";

export type StatusType =
  | "success"
  | "pending"
  | "failed"
  | "cancelled"
  | "warning"
  | "info"
  | "neutral"
  | "processing";

export interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const statusMeta: Record<StatusType, { label: string; icon: NovaIconName; colorToken: "success" | "warning" | "danger" | "tint" | "textSecondary" }> = {
  success: { label: "موفق", icon: "checkmark-circle", colorToken: "success" },
  pending: { label: "در انتظار", icon: "time", colorToken: "warning" },
  failed: { label: "ناموفق", icon: "close-circle", colorToken: "danger" },
  cancelled: { label: "??? ???", icon: "ban", colorToken: "danger" },
  warning: { label: "هشدار", icon: "warning", colorToken: "warning" },
  info: { label: "اطلاع‌رسانی", icon: "information-circle", colorToken: "tint" },
  neutral: { label: "خنثی", icon: "ellipse", colorToken: "textSecondary" },
  processing: { label: "در حال پردازش", icon: "sync", colorToken: "tint" },
};

export function StatusBadge({
  status,
  label,
  compact = false,
  style,
  testID,
}: StatusBadgeProps) {
  const theme = useTheme();
  const meta = statusMeta[status];
  const color = theme[meta.colorToken];
  const resolvedLabel = label ?? meta.label;

  return (
    <View
      testID={testID}
      accessibilityLabel={resolvedLabel}
      style={[
        styles.badge,
        compact ? styles.compact : styles.full,
        { backgroundColor: color + "18", borderColor: color + "55" },
        style,
      ]}
    >
      <NovaIcon name={meta.icon} size="xs" color={color} style={styles.icon} />
      <Typography variant={compact ? "caption" : "bodySmall"} color={color}>
        {resolvedLabel}
      </Typography>
    </View>
  );
}

export interface StatusPillProps {
  label: string;
  tone?: "neutral" | "info" | "positive" | "warning" | "negative";
  style?: StyleProp<ViewStyle>;
}

export function StatusPill({ label, tone = "neutral", style }: StatusPillProps) {
  const status: StatusType =
    tone === "positive" ? "success"
    : tone === "warning" ? "warning"
    : tone === "negative" ? "failed"
    : tone === "info" ? "info"
    : "neutral";
  return <StatusBadge status={status} label={label} compact style={style} />;
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: radius.chip,
  },
  compact: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
  },
  full: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  icon: { lineHeight: undefined },
});
