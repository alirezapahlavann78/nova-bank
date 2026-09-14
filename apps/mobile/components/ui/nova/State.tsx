import React from "react";
import {
  View,
  ActivityIndicator,
  StyleSheet,
  type DimensionValue,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { radius, spacing, useTheme } from "../../../theme";
import { CardSurface } from "./Surface";
import { NovaIcon, NovaIconName } from "./Icon";
import { Typography } from "./Typography";
import { Button } from "./Button";

export interface StateProps {
  title?: string;
  message?: string;
  action?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function LoadingState({ title = "در حال بارگذاری", message, style, testID }: StateProps) {
  const theme = useTheme();
  return (
    <CardSurface testID={testID} style={[styles.container, style]}>
      <ActivityIndicator size="large" color={theme.tint} />
      <Typography variant="cardTitle" style={styles.title}>{title}</Typography>
      {message ? <Typography variant="bodySmall" color={theme.textSecondary}>{message}</Typography> : null}
    </CardSurface>
  );
}

export function EmptyState({
  title = "موردی یافت نشد",
  message,
  action,
  onAction,
  style,
  testID,
}: StateProps) {
  const theme = useTheme();
  return (
    <CardSurface testID={testID} style={[styles.container, style]}>
      <NovaIcon name="list-outline" size="lg" color={theme.textSecondary} />
      <Typography variant="cardTitle" style={styles.title}>{title}</Typography>
      {message ? <Typography variant="bodySmall" color={theme.textSecondary}>{message}</Typography> : null}
      {action ? <Button variant="secondary" size="sm" label={action} onPress={onAction} /> : null}
    </CardSurface>
  );
}

export function ErrorState({
  title = "خطا",
  message = "مشکلی پیش آمد؛ لطفاً دوباره تلاش کنید.",
  action,
  onAction,
  style,
  testID,
}: StateProps) {
  const theme = useTheme();
  return (
    <CardSurface testID={testID} style={[styles.container, style]}>
      <NovaIcon name="warning" size="lg" color={theme.danger} />
      <Typography variant="cardTitle" style={styles.title}>{title}</Typography>
      <Typography variant="bodySmall" color={theme.textSecondary}>{message}</Typography>
      {action ? <Button variant="secondary" size="sm" label={action} onPress={onAction} /> : null}
    </CardSurface>
  );
}

export function OfflineState({
  title = "آفلاین",
  message = "اتصال اینترنت برقرار نیست.",
  action,
  onAction,
  style,
  testID,
}: StateProps) {
  const theme = useTheme();
  return (
    <CardSurface testID={testID} style={[styles.container, style]}>
      <NovaIcon name="cloud-offline" size="lg" color={theme.warning} />
      <Typography variant="cardTitle" style={styles.title}>{title}</Typography>
      <Typography variant="bodySmall" color={theme.textSecondary}>{message}</Typography>
      {action ? <Button variant="secondary" size="sm" label={action} onPress={onAction} /> : null}
    </CardSurface>
  );
}

export function RefreshingState({ title = "در حال به‌روزرسانی", style, testID }: StateProps) {
  const theme = useTheme();
  return (
    <CardSurface testID={testID} style={[styles.inline, style]}>
      <ActivityIndicator size="small" color={theme.tint} />
      <Typography variant="bodySmall" color={theme.textSecondary}>{title}</Typography>
    </CardSurface>
  );
}

export interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  radiusToken?: keyof typeof radius;
  style?: StyleProp<ViewStyle>;
}

export function Skeleton({ width = "100%", height = 16, radiusToken = "row", style }: SkeletonProps) {
  const theme = useTheme();
  return (
    <View
      accessibilityLabel="اسکلتون بارگذاری"
      style={[
        {
          width,
          height,
          borderRadius: radius[radiusToken],
          backgroundColor: theme.divider,
        },
        style,
      ]}
    />
  );
}

export interface ScreenStateProps extends StateProps {
  state: "loading" | "empty" | "error" | "offline" | "refreshing";
  icon?: NovaIconName;
  children?: React.ReactNode;
}

export function ScreenState({ state, ...props }: ScreenStateProps) {
  if (state === "loading") return <LoadingState {...props} />;
  if (state === "empty") return <EmptyState {...props} />;
  if (state === "offline") return <OfflineState {...props} />;
  if (state === "refreshing") return <RefreshingState {...props} />;
  return <ErrorState {...props} />;
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xxxl,
    gap: spacing.md,
  },
  inline: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.lg,
  },
  title: { textAlign: "center" },
});
