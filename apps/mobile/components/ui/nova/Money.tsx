import React from "react";
import { Text, type StyleProp, type TextStyle } from "react-native";
import { typography, useTheme } from "../../../theme";
import { Skeleton } from "./State";

export type MoneySize = "sm" | "md" | "lg" | "xl" | "display";
export type MoneyTone = "default" | "positive" | "negative";
export type CurrencyCode = "IRT" | "USD" | "EUR" | string;

export interface MoneyAmountProps {
  value?: number | string | null;
  children?: React.ReactNode;
  currency?: CurrencyCode;
  compact?: boolean;
  showCurrency?: boolean;
  size?: MoneySize;
  tone?: MoneyTone;
  loading?: boolean;
  unavailable?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<TextStyle>;
  testID?: string;
}

const sizeStyles = {
  sm: { fontSize: 13, lineHeight: 20 },
  md: { fontSize: 15, lineHeight: 23 },
  lg: { fontSize: 20, lineHeight: 28 },
  xl: { fontSize: 26, lineHeight: 34 },
  display: { fontSize: 34, lineHeight: 42 },
} as const;

const currencyMeta: Record<string, { label: string; position: "start" | "end" }> = {
  IRT: { label: "تومان", position: "end" },
  USD: { label: "$", position: "start" },
  EUR: { label: "€", position: "start" },
};

function formatValue(value: number | string, compact: boolean): string {
  if (typeof value === "string") return value;
  if (!Number.isFinite(value)) return "—";
  try {
    return new Intl.NumberFormat("en-US", {
      notation: compact ? "compact" : "standard",
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return value.toLocaleString("en-US");
  }
}

export function MoneyAmount({
  value,
  children,
  currency,
  compact = false,
  showCurrency = Boolean(currency),
  size = "md",
  tone = "default",
  loading = false,
  unavailable = false,
  accessibilityLabel,
  style,
  testID,
}: MoneyAmountProps) {
  const theme = useTheme();
  const color =
    tone === "positive"
      ? theme.success
      : tone === "negative"
        ? theme.danger
        : theme.textPrimary;
  const resolvedValue =
    unavailable || value === null || value === undefined ? "—" : formatValue(value, compact);
  const meta = currency ? currencyMeta[currency] : undefined;
  const displayValue =
    showCurrency && meta
      ? meta.position === "start"
        ? `${meta.label} ${resolvedValue}`
        : `${resolvedValue} ${meta.label}`
      : resolvedValue;
  const content = children ?? displayValue;
  const resolvedAccessibilityLabel =
    accessibilityLabel ?? (typeof content === "string" ? content : "مبلغ نامشخص");

  if (loading) {
    return (
      <Skeleton
        width={size === "display" ? 160 : 100}
        height={sizeStyles[size].lineHeight}
      />
    );
  }

  return (
    <Text
      testID={testID}
      accessibilityLabel={resolvedAccessibilityLabel}
      style={[
        typography.numeric,
        sizeStyles[size],
        {
          color,
          writingDirection: "ltr",
          textAlign: "left",
          fontVariant: ["tabular-nums"],
        },
        style,
      ]}
    >
      {content}
    </Text>
  );
}

export interface MoneyTextProps {
  children?: React.ReactNode;
  size?: MoneySize;
  tone?: MoneyTone;
  style?: StyleProp<TextStyle>;
  className?: string;
}

export function MoneyText({ children, size, tone, style }: MoneyTextProps) {
  return (
    <MoneyAmount size={size} tone={tone} style={style}>
      {children}
    </MoneyAmount>
  );
}
