import React from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { Button, IconButton } from "./Button";
import { ListSurface } from "./Surface";
import { FormSection } from "./Form";
import { SectionHeader } from "./SectionHeader";
import { PageHeader } from "./Page";
import { MoneyText } from "./Money";
import { StatusPill } from "./Status";
import { ProgressBar } from "./Progress";
import { ScreenState } from "./State";
import { NovaIconName } from "./Icon";

export interface GlassButtonProps {
  children?: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  icon?: NovaIconName;
  loading?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  className?: string;
  style?: StyleProp<ViewStyle>;
}

export function GlassButton({
  children,
  variant = "primary",
  size = "md",
  icon,
  loading,
  disabled,
  onPress,
  style,
}: GlassButtonProps) {
  const resolvedVariant =
    variant === "ghost" ? "tertiary" : variant === "danger" ? "destructive" : variant;
  return (
    <Button
      variant={resolvedVariant}
      size={size}
      icon={icon}
      loading={loading}
      disabled={disabled}
      onPress={onPress}
      style={style}
    >
      {children}
    </Button>
  );
}

export interface GlassIconButtonProps {
  icon: NovaIconName;
  onPress?: () => void;
  size?: number;
  tint?: string;
  className?: string;
}

export function GlassIconButton({ icon, onPress, size = 44, tint }: GlassIconButtonProps) {
  return (
    <IconButton
      icon={icon}
      onPress={onPress}
      size={size}
      color={tint}
      accessibilityLabel={icon}
    />
  );
}

export interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  onBack?: () => void;
}

export function ScreenHeader({ title, subtitle, right, onBack }: ScreenHeaderProps) {
  return (
    <PageHeader
      title={title}
      subtitle={subtitle}
      onBack={onBack}
      trailing={right}
    />
  );
}

export interface GlassListCardProps {
  children?: React.ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
  level?: number;
}

export function GlassListCard({ children, style }: GlassListCardProps) {
  return <ListSurface style={style}>{children}</ListSurface>;
}

export interface GlassFormProps {
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
}

export function GlassForm({ children, footer, style }: GlassFormProps) {
  return (
    <FormSection style={style} footer={footer}>
      {children}
    </FormSection>
  );
}

export interface SectionTitleProps {
  title: string;
  action?: string;
  onAction?: () => void;
}

export function SectionTitle({ title, action, onAction }: SectionTitleProps) {
  return <SectionHeader title={title} action={action} onAction={onAction} />;
}

export { MoneyText, StatusPill, ProgressBar, ScreenState };
