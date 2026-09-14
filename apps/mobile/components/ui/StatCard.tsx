import React from "react";
import { View, StyleSheet } from "react-native";
import { spacing, useTheme } from "../../theme";
import { CardSurface, MoneyAmount, NovaIcon, Typography } from "./nova";
import type { StatCardProps } from "./Glass.types";

export function StatCard({ label, value, delta, style }: StatCardProps) {
  const theme = useTheme();
  const isPositive = delta !== undefined && delta >= 0;

  return (
    <CardSurface style={style}>
      <Typography variant="bodySmall" color={theme.textSecondary}>
        {label}
      </Typography>
      <View style={styles.row}>
        <MoneyAmount value={value} size="lg" />
        {delta !== undefined ? (
          <View style={styles.delta}>
            <NovaIcon
              name={isPositive ? "arrow-up" : "arrow-down"}
              size="xs"
              color={isPositive ? theme.success : theme.danger}
            />
            <Typography
              variant="bodySmall"
              color={isPositive ? theme.success : theme.danger}
            >
              {isPositive ? "+" : ""}
              {delta}%
            </Typography>
          </View>
        ) : null}
      </View>
    </CardSurface>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  delta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
});
