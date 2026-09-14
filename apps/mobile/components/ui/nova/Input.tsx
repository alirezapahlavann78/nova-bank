import React from "react";
import {
  View,
  TextInput,
  StyleSheet,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
  type TextInputProps,
} from "react-native";
import { radius, spacing, useTheme } from "../../../theme";
import { NovaIcon, NovaIconName } from "./Icon";
import { Typography } from "./Typography";

export interface InputProps extends Omit<TextInputProps, "style"> {
  label?: string;
  helper?: string;
  error?: string;
  disabled?: boolean;
  icon?: NovaIconName;
  textDirection?: "rtl" | "ltr" | "auto";
  containerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
}

export const Input = React.forwardRef<TextInput, InputProps>(function Input(
  {
    label,
    helper,
    error,
    disabled,
    icon,
    textDirection = "rtl",
    containerStyle,
    style,
    accessibilityLabel,
    ...props
  },
  ref,
) {
  const theme = useTheme();
  const isLTR = textDirection === "ltr";
  const borderColor = error ? theme.danger : disabled ? theme.divider : theme.divider;

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <Typography variant="bodySmall" color={theme.textSecondary} style={styles.label}>
          {label}
        </Typography>
      ) : null}
      <View
        style={[
          styles.field,
          { borderColor, backgroundColor: disabled ? theme.divider : theme.solidSurface },
        ]}
      >
        {icon ? <NovaIcon name={icon} size="sm" color={theme.textSecondary} style={styles.icon} /> : null}
        <TextInput
          {...props}
          ref={ref}
          editable={!disabled}
          placeholderTextColor={theme.textMuted}
          accessibilityLabel={accessibilityLabel ?? label}
          accessibilityState={{ disabled }}
          style={[
            styles.input,
            {
              color: disabled ? theme.textSecondary : theme.textPrimary,
              writingDirection: isLTR ? "ltr" : "rtl",
              textAlign: isLTR ? "left" : "right",
            },
            style,
          ]}
        />
      </View>
      {error ? (
        <Typography variant="caption" color={theme.danger} style={styles.message}>
          {error}
        </Typography>
      ) : helper ? (
        <Typography variant="caption" color={theme.textSecondary} style={styles.message}>
          {helper}
        </Typography>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  label: {
    textAlign: "right",
  },
  field: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.input,
    borderWidth: 1,
    paddingHorizontal: spacing.xxl,
    backgroundColor: "rgba(255,255,255,0.86)",
  },
  icon: {
    marginEnd: spacing.md,
  },
  input: {
    flex: 1,
    minHeight: 44,
    fontSize: 15,
  },
  message: {
    textAlign: "right",
  },
});
