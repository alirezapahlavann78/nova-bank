import React from "react";
import { View, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { layout, spacing, useTheme } from "../../../theme";
import { CardSurface, CriticalSurface } from "./Surface";
import { Typography } from "./Typography";
import { Button } from "./Button";
import { MoneyAmount } from "./Money";

export interface FormSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function FormSection({
  title,
  description,
  children,
  footer,
  style,
  testID,
}: FormSectionProps) {
  const theme = useTheme();
  return (
    <CardSurface testID={testID} style={style}>
      {title ? <Typography variant="sectionTitle">{title}</Typography> : null}
      {description ? (
        <Typography variant="bodySmall" color={theme.textSecondary} style={styles.description}>
          {description}
        </Typography>
      ) : null}
      <View style={styles.fields}>{children}</View>
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </CardSurface>
  );
}

export interface ReviewSummaryItem {
  label: string;
  value: React.ReactNode;
}

export interface ReviewSummaryProps {
  title?: string;
  items: ReviewSummaryItem[];
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function ReviewSummary({ title = "خلاصه بررسی", items, style, testID }: ReviewSummaryProps) {
  const theme = useTheme();
  return (
    <CardSurface testID={testID} style={style}>
      <Typography variant="sectionTitle">{title}</Typography>
      <View style={styles.reviewRows}>
        {items.map((item) => (
          <View key={item.label} style={styles.reviewRow}>
            <Typography variant="bodySmall" color={theme.textSecondary}>{item.label}</Typography>
            <View style={styles.reviewValue}>{item.value}</View>
          </View>
        ))}
      </View>
    </CardSurface>
  );
}

export interface ConfirmationSheetProps {
  title?: string;
  description?: string;
  amount?: number | string | null;
  currency?: string;
  target?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  destructive?: boolean;
  visible?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function ConfirmationSheet({
  title = "تأیید نهایی",
  description,
  amount,
  currency,
  target,
  confirmLabel = "تأیید",
  cancelLabel = "انصراف",
  onConfirm,
  onCancel,
  destructive = false,
  style,
  testID,
}: ConfirmationSheetProps) {
  const theme = useTheme();
  return (
    <CriticalSurface testID={testID} style={[styles.sheet, style]}>
      <Typography variant="sectionTitle">{title}</Typography>
      {description ? (
        <Typography variant="bodySmall" color={theme.textSecondary}>{description}</Typography>
      ) : null}
      {amount !== undefined ? (
        <MoneyAmount value={amount} currency={currency} size="lg" showCurrency />
      ) : null}
      {target ? (
        <Typography variant="bodySmall" color={theme.textSecondary}>{target}</Typography>
      ) : null}
      <View style={styles.actions}>
        <Button
          variant={destructive ? "destructive" : "primary"}
          label={confirmLabel}
          onPress={onConfirm}
          fullWidth
        />
        <Button variant="secondary" label={cancelLabel} onPress={onCancel} fullWidth />
      </View>
    </CriticalSurface>
  );
}

const styles = StyleSheet.create({
  description: { marginBottom: spacing.lg },
  fields: { gap: layout.formGap },
  footer: { marginTop: layout.footerGap },
  reviewRows: { marginTop: spacing.lg, gap: spacing.lg },
  reviewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.lg,
  },
  reviewValue: { flexShrink: 1 },
  sheet: { gap: spacing.md },
  actions: { gap: spacing.md, marginTop: spacing.lg },
});
