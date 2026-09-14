import React from "react";
import {
  ScrollView,
  View,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { layout, spacing, useTheme } from "../../../theme";
import { Typography } from "./Typography";
import { IconButton } from "./Button";
import { NovaIcon } from "./Icon";

export interface NovaPageProps {
  children: React.ReactNode;
  scroll?: boolean;
  safeArea?: boolean;
  background?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  keyboardShouldPersistTaps?: "always" | "never" | "handled";
  testID?: string;
}

export function PageBackground() {
  const theme = useTheme();
  return (
    <LinearGradient
      colors={theme.background as unknown as [string, string, string, string]}
      style={StyleSheet.absoluteFill}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    />
  );
}

export function NovaPage({
  children,
  scroll = true,
  safeArea = true,
  background = <PageBackground />,
  style,
  contentContainerStyle,
  keyboardShouldPersistTaps = "handled",
  testID,
}: NovaPageProps) {
  const content = (
    <View testID={testID} style={[styles.content, style]}>
      {children}
    </View>
  );

  if (!scroll) {
    return (
      <SafeAreaView style={styles.safeArea} edges={safeArea ? ["top", "bottom"] : []}>
        {background}
        {content}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={safeArea ? ["top", "bottom"] : []}>
      {background}
      <ScrollView
        contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        showsVerticalScrollIndicator={false}
      >
        {content}
      </ScrollView>
    </SafeAreaView>
  );
}

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  avatar?: React.ReactNode;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function PageHeader({
  title,
  subtitle,
  onBack,
  leading,
  trailing,
  avatar,
  loading = false,
  style,
  testID,
}: PageHeaderProps) {
  const theme = useTheme();
  return (
    <View testID={testID} style={[styles.header, style]}>
      <View style={styles.start}>
        {onBack ? (
          <IconButton
            icon="chevron-back"
            onPress={onBack}
            accessibilityLabel="بازگشت"
            color={theme.textPrimary}
          />
        ) : null}
        {leading}
        {avatar}
        <View style={styles.titleContainer}>
          <Typography variant="pageTitle" numberOfLines={1}>
            {title}
          </Typography>
          {subtitle ? (
            <Typography variant="bodySmall" color={theme.textSecondary} numberOfLines={1}>
              {subtitle}
            </Typography>
          ) : null}
        </View>
      </View>
      {trailing}
      {loading ? <NovaIcon name="sync" size="sm" color={theme.tint} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    maxWidth: layout.maxContentWidth,
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: layout.pageHorizontalPadding,
    paddingBottom: layout.bottomContentPadding,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.lg,
    marginBottom: layout.headerBottomSpacing,
    minHeight: layout.minimumTouchTarget,
  },
  start: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    flex: 1,
  },
  titleContainer: {
    flex: 1,
    gap: spacing.xs,
  },
});
