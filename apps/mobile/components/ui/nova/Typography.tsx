import React from "react";
import { Text, type TextProps, type StyleProp, type TextStyle } from "react-native";
import { typography, TypographyVariant, useTheme } from "../../../theme";

export interface TypographyProps extends Omit<TextProps, "style"> {
  variant?: TypographyVariant;
  color?: string;
  align?: "auto" | "left" | "right" | "center";
  style?: StyleProp<TextStyle>;
  children?: React.ReactNode;
}

export function Typography({
  variant = "body",
  color,
  align,
  style,
  children,
  ...props
}: TypographyProps) {
  const theme = useTheme();
  const resolvedColor = color ?? theme.textPrimary;
  const variantStyle = typography[variant];

  return (
    <Text
      {...props}
      style={[
        variantStyle,
        { color: resolvedColor, textAlign: align },
        style,
      ]}
    >
      {children}
    </Text>
  );
}
