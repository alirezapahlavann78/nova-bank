import React from "react";
import { I18nManager, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { iconSize, IconSizeToken } from "../../../theme";

export type NovaIconName = React.ComponentProps<typeof Ionicons>["name"];

export interface NovaIconProps {
  name: NovaIconName;
  size?: IconSizeToken | number;
  color?: string;
  directional?: boolean;
  style?: any;
  testID?: string;
}

export function NovaIcon({
  name,
  size = "md",
  color,
  directional = false,
  style,
  testID,
}: NovaIconProps) {
  const resolvedSize = typeof size === "number" ? size : iconSize[size];
  const shouldMirror = directional && I18nManager.isRTL;

  return (
    <Ionicons
      name={name}
      size={resolvedSize}
      color={color}
      testID={testID}
      style={[styles.base, shouldMirror ? styles.mirrored : null, style]}
    />
  );
}

const styles = StyleSheet.create({
  base: { lineHeight: undefined },
  mirrored: { transform: [{ scaleX: -1 }] },
});
