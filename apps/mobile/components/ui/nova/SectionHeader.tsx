import React from "react";
import { View, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { spacing } from "../../../theme";
import { Typography } from "./Typography";
import { Button } from "./Button";

export interface SectionHeaderProps {
  title: string;
  action?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function SectionHeader({ title, action, onAction, style, testID }: SectionHeaderProps) {
  return (
    <View testID={testID} style={[styles.header, style]}>
      <Typography variant="sectionTitle" numberOfLines={1}>{title}</Typography>
      {action ? (
        <Button variant="tertiary" size="sm" label={action} onPress={onAction} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
});
