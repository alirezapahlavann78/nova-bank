import React from "react";
import {
  Pressable,
  ActivityIndicator,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { layout, radius, spacing, useTheme } from "../../../theme";
import { NovaIcon, NovaIconName } from "./Icon";
import { Typography } from "./Typography";

export type ButtonVariant = "primary" | "secondary" | "tertiary" | "destructive" | "icon";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps {
  children?: React.ReactNode;
  label?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: NovaIconName;
  iconPosition?: "start" | "end";
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  testID?: string;
}

export function Button({
  children,
  label,
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "start",
  loading = false,
  disabled = false,
  fullWidth = false,
  onPress,
  style,
  accessibilityLabel,
  testID,
}: ButtonProps) {
  const theme = useTheme();
  const inactive = disabled || loading;
  const content = children ?? label;
  const height = size === "sm" ? layout.minimumTouchTarget : size === "md" ? 48 : 54;
  const resolvedVariant = variant === "icon" && !content ? "icon" : variant;

  const variantStyle = (() => {
    if (resolvedVariant === "primary") {
      return { backgroundColor: theme.tint, borderColor: theme.tint };
    }
    if (resolvedVariant === "secondary") {
      return { backgroundColor: "transparent", borderColor: theme.tint };
    }
    if (resolvedVariant === "destructive") {
      return { backgroundColor: theme.danger, borderColor: theme.danger };
    }
    if (resolvedVariant === "icon") {
      return { backgroundColor: "transparent", borderColor: "transparent" };
    }
    return { backgroundColor: "transparent", borderColor: "transparent" };
  })();

  const textColor =
    resolvedVariant === "primary" || resolvedVariant === "destructive"
      ? "#ffffff"
      : resolvedVariant === "secondary"
        ? theme.tint
        : theme.textPrimary;

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? (typeof content === "string" ? content : undefined)}
      accessibilityState={{ disabled, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        variantStyle,
        {
          minHeight: height,
          opacity: inactive ? 0.55 : pressed ? 0.82 : 1,
        },
        fullWidth ? styles.fullWidth : null,
        style,
      ]}
    >
      <View style={styles.row}>
        {loading ? (
          <ActivityIndicator size="small" color={textColor} />
        ) : (
          <>
            {icon && iconPosition === "start" ? (
              <NovaIcon name={icon} size="sm" color={textColor} style={styles.startIcon} />
            ) : null}
            {content ? <Typography variant="button" color={textColor}>{content}</Typography> : null}
            {icon && iconPosition === "end" ? (
              <NovaIcon name={icon} size="sm" color={textColor} style={styles.endIcon} />
            ) : null}
          </>
        )}
      </View>
    </Pressable>
  );
}

export interface IconButtonProps {
  icon: NovaIconName;
  onPress?: () => void;
  size?: number;
  color?: string;
  disabled?: boolean;
  accessibilityLabel: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function IconButton({
  icon,
  onPress,
  size = layout.minimumTouchTarget,
  color,
  disabled,
  accessibilityLabel,
  style,
  testID,
}: IconButtonProps) {
  const theme = useTheme();
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.iconButton,
        { width: size, height: size, opacity: disabled ? 0.55 : pressed ? 0.82 : 1 },
        style,
      ]}
    >
      <NovaIcon name={icon} size={size * 0.45} color={color ?? theme.textPrimary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.input,
    borderWidth: 1,
    paddingHorizontal: spacing.xxl,
    justifyContent: "center",
    alignItems: "center",
  },
  fullWidth: { alignSelf: "stretch" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  startIcon: { marginEnd: spacing.sm },
  endIcon: { marginStart: spacing.sm },
  iconButton: {
    borderRadius: radius.pill,
    justifyContent: "center",
    alignItems: "center",
  },
});
