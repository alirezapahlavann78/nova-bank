import type { StyleProp, ViewStyle, FocusEvent, BlurEvent } from 'react-native';

export interface GlassInputProps {
  label?: string;
  icon?: string;
  error?: string;
  className?: string;
  containerStyle?: StyleProp<ViewStyle>;
  onFocus?: (e: FocusEvent) => void;
  onBlur?: (e: BlurEvent) => void;
  onChangeText?: (text: string) => void;
  [key: string]: unknown;
}

export interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

export interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export interface SecondaryButtonProps {
  label: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export interface BackButtonProps {
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export interface TabBarProps {
  active: string;
  onTabPress?: (tab: string) => void;
  style?: StyleProp<ViewStyle>;
}

export interface SectionHeaderProps {
  title: string;
  action?: string;
  onAction?: () => void;
}

export interface StatCardProps {
  label: string;
  value: string | number;
  delta?: number;
  style?: StyleProp<ViewStyle>;
}
