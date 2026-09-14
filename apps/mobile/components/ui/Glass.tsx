import React, { useRef, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  StyleSheet,
  Platform,
  Animated,
  ViewStyle,
  TextStyle,
  TextInputProps,
  StyleProp,
  ActivityIndicator,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme, radii, gradients } from "../../theme";
import { fontFamily } from "../AppTypography";

export const isIOS = Platform.OS === "ios";
export const isAndroid = Platform.OS === "android";
export const isWeb = Platform.OS === "web";

/** Native blur settings per platform (web falls back to backdrop-filter). */
function nativeBlurProps(intensity: number, tint: "light" | "dark") {
  if (isWeb) return {};
  return {
    intensity,
    tint,
    ...(isAndroid ? { experimentalBlurMethod: "dimezisBlurView" as const } : {}),
  };
}

/** On web, react-native-web forwards this straight to a CSS backdrop-filter. */
function webBlur(intensity: number): ViewStyle {
  if (!isWeb) return {};
  return {
    backdropFilter: `blur(${Math.round(intensity / 4)}px) saturate(180%)`,
  } as unknown as ViewStyle;
}

export type GlassProps = {
  children?: React.ReactNode;
  className?: string;
  intensity?: number;
  style?: StyleProp<ViewStyle>;
  elevated?: boolean;
  level?: 0 | 1 | 2 | 3 | 4;
};

const glassLevels = {
  0: { intensity: 0, elevated: false },
  1: { intensity: 34, elevated: false },
  2: { intensity: 55, elevated: true },
  3: { intensity: 70, elevated: true },
  4: { intensity: 84, elevated: true },
} as const;

/* ------------------------------------------------------------------ */
/* GlassSurface — layered "liquid glass" primitive                     */
/* ------------------------------------------------------------------ */

export function GlassSurface({
  children,
  style,
  radius = "xl",
  intensity = 55,
  elevated = false,
  className,
  level,
}: GlassProps & { radius?: keyof typeof radii }) {
  const theme = useTheme();
  const borderRadius = radii[radius];
  const material = level !== undefined ? glassLevels[level] : { intensity, elevated };

  const fill: [string, string] = elevated
    ? [theme.glassFill, theme.glassFillEnd]
    : [theme.glassFillEnd, theme.glassFill];

  const shell: ViewStyle = {
    borderRadius,
    borderWidth: 1,
    borderColor: theme.glassBorder,
    shadowColor: theme.glassShadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: elevated ? 0.9 : 0.6,
    shadowRadius: 28,
    elevation: elevated ? 10 : 6,
    overflow: "hidden",
    backgroundColor: level === 0 ? theme.solidSurface : isWeb ? theme.glassFill : "transparent",
    ...(material.intensity > 0 ? webBlur(material.intensity) : null),
  };

  return (
    <View style={shell} className={className}>
      {!isWeb && !isAndroid && (
        <BlurView
          style={StyleSheet.absoluteFill}
          {...nativeBlurProps(material.intensity, theme.mode === "dark" ? "dark" : "light")}
        />
      )}

      {!isWeb && isAndroid && (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.glassFill }]} />
      )}

      <LinearGradient
        colors={fill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFill, styles.noTouch]}
      />

      {/* Specular rim — light catching the edge of the glass */}
      <View
        style={[
          StyleSheet.absoluteFill,
          styles.noTouch,
          {
            borderRadius,
            borderTopWidth: 1.2,
            borderLeftWidth: 0.8,
            borderTopColor: theme.glassHighlight,
            borderLeftColor: theme.glassHighlight,
          },
        ]}
      />

      <View style={style}>{children}</View>
    </View>
  );
}

export function GlassView({
  children,
  className,
  intensity = 55,
  style,
  elevated,
  level,
}: GlassProps) {
  const resolvedLevel = level ?? (elevated ? 2 : 1);
  return (
    <GlassSurface
      intensity={intensity}
      level={resolvedLevel}
      className={className}
      style={[{ padding: 20 }, style]}
    >
      {children}
    </GlassSurface>
  );
}

export function GlassCard({ children, className, style, elevated = true, level = 2 }: GlassProps) {
  return (
    <GlassSurface
      className={className}
      style={[{ padding: 20 }, style]}
      radius="xl"
      level={level ?? (elevated ? 2 : 1)}
    >
      {children}
    </GlassSurface>
  );
}

export function GlassListCard({ children, className, style, level = 1 }: GlassProps) {
  return (
    <GlassSurface className={className} style={[styles.listCard, style]} radius="lg" level={level}>
      {children}
    </GlassSurface>
  );
}

export function GlassForm({
  children,
  footer,
  className,
  style,
}: GlassProps & { footer?: React.ReactNode }) {
  return (
    <GlassSurface className={className} style={[styles.form, style]} radius="xl" level={1}>
      <View style={styles.formFields}>{children}</View>
      {footer ? <View style={styles.formFooter}>{footer}</View> : null}
    </GlassSurface>
  );
}

export function DataList({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.dataList, style]}>{children}</View>;
}

export function DataRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  const theme = useTheme();

  return (
    <View style={styles.dataRow}>
      <Text style={[styles.dataLabel, { color: theme.textSecondary }]}>{label}</Text>
      <View style={styles.dataValue}>{value}</View>
    </View>
  );
}

export function StatusPill({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "neutral" | "info" | "positive" | "warning" | "negative";
}) {
  const theme = useTheme();
  const toneColor =
    tone === "positive"
      ? theme.success
      : tone === "warning"
        ? "#f59e0b"
        : tone === "negative"
          ? theme.danger
          : tone === "info"
            ? "#2563eb"
            : theme.textSecondary;

  return (
    <View
      style={[
        styles.statusPill,
        { borderColor: `${toneColor}55`, backgroundColor: `${toneColor}18` },
      ]}
    >
      <Text style={[styles.statusPillText, { color: toneColor }]}>{label}</Text>
    </View>
  );
}

export function ProgressBar({
  progress,
  tone = "default",
}: {
  progress: number;
  tone?: "default" | "positive" | "negative";
}) {
  const theme = useTheme();
  const progressColor =
    tone === "negative" ? theme.danger : tone === "positive" ? theme.success : theme.tint;
  const normalizedProgress = Math.max(0, Math.min(100, progress));

  return (
    <View style={[styles.progressTrack, { backgroundColor: theme.divider }]}>
      <View
        style={{
          height: "100%",
          width: `${normalizedProgress}%`,
          borderRadius: 999,
          backgroundColor: progressColor,
        }}
      />
    </View>
  );
}

export function GlassActionTile({
  title,
  subtitle,
  icon,
  onPress,
  className,
  style,
}: {
  title: string;
  subtitle?: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  onPress?: () => void;
  className?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const theme = useTheme();
  return (
    <Pressable onPress={onPress} className={className} style={[styles.actionTileWrapper, style]}>
      <GlassSurface radius="lg" level={2} style={styles.actionTile}>
        <Ionicons name={icon} size={24} color={theme.tint} />
        <Text style={[styles.actionTileTitle, { color: theme.textPrimary }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.actionTileSubtitle, { color: theme.textSecondary }]}>
            {subtitle}
          </Text>
        ) : null}
      </GlassSurface>
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/* Press feedback                                                      */
/* ------------------------------------------------------------------ */

function usePressScale(from = 1, to = 0.96) {
  const scale = useRef(new Animated.Value(from)).current;

  const animate = (value: number) =>
    Animated.spring(scale, {
      toValue: value,
      useNativeDriver: !isWeb,
      speed: 40,
      bounciness: 6,
    }).start();

  return { scale, animate, to };
}

/* ------------------------------------------------------------------ */
/* Buttons                                                             */
/* ------------------------------------------------------------------ */

export interface GlassButtonProps {
  children?: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  icon?: React.ComponentProps<typeof Ionicons>["name"];
  loading?: boolean;
  className?: string;
  style?: StyleProp<ViewStyle>;
}

export function GlassButton({
  children,
  onPress,
  disabled,
  variant = "primary",
  size = "md",
  icon,
  loading = false,
  className,
  style,
}: GlassButtonProps) {
  const theme = useTheme();
  const { scale, animate, to } = usePressScale();
  const inactive = disabled || loading;

  const heights = { sm: 38, md: 50, lg: 58 } as const;
  const height = heights[size];

  const colors: readonly [string, string, ...string[]] =
    variant === "secondary"
      ? gradients.secondary
      : variant === "danger"
        ? gradients.danger
        : gradients.primary;

  const label =
    typeof children === "string" ? <Text style={styles.buttonLabel}>{children}</Text> : children;

  const content = (
    <View style={styles.buttonRow}>
      {loading ? (
        <Ionicons name="ellipse" size={16} color="rgba(255,255,255,0.85)" />
      ) : (
        icon && <Ionicons name={icon} size={18} color="#ffffff" style={{ marginEnd: 8 }} />
      )}
      {label}
    </View>
  );

  if (variant === "ghost") {
    return (
      <Animated.View style={[{ transform: [{ scale }] }, style]}>
        <Pressable
          onPress={onPress}
          disabled={inactive}
          onPressIn={() => animate(to)}
          onPressOut={() => animate(1)}
          className={className}
          style={{
            minHeight: height,
            borderRadius: radii.md,
            borderWidth: 1,
            borderColor: theme.glassBorder,
            backgroundColor: theme.glassFill,
            opacity: inactive ? 0.5 : 1,
          }}
        >
          <View style={styles.buttonRow}>
            {icon && (
              <Ionicons name={icon} size={18} color={theme.textPrimary} style={{ marginEnd: 8 }} />
            )}
            {label}
          </View>
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable
        onPress={onPress}
        disabled={inactive}
        onPressIn={() => animate(to)}
        onPressOut={() => animate(1)}
        className={className}
        style={{ opacity: inactive ? 0.55 : 1 }}
      >
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            minHeight: height,
            borderRadius: radii.md,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 20,
            shadowColor: "#4f46e5",
            shadowOpacity: 0.35,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 8 },
            elevation: 6,
          }}
        >
          <View style={[styles.buttonGloss, styles.noTouch]} />
          {content}
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

export function GlassIconButton({
  icon,
  onPress,
  size = 44,
  tint,
  className,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  onPress?: () => void;
  size?: number;
  tint?: string;
  className?: string;
}) {
  const theme = useTheme();
  return (
    <Pressable onPress={onPress} className={className}>
      <GlassSurface
        radius="pill"
        intensity={45}
        style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}
      >
        <Ionicons name={icon} size={size * 0.45} color={tint ?? theme.textPrimary} />
      </GlassSurface>
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/* Input                                                               */
/* ------------------------------------------------------------------ */

export interface GlassInputProps extends TextInputProps {
  className?: string;
  label?: string;
  icon?: React.ComponentProps<typeof Ionicons>["name"];
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
}

export const GlassInput = React.forwardRef<TextInput, GlassInputProps>(
  ({ label, icon, error, className, containerStyle, onFocus, onBlur, ...props }, ref) => {
    const theme = useTheme();
    const [focused, setFocused] = React.useState(false);

    const handleFocus = useCallback(
      (e: any) => {
        setFocused(true);
        onFocus?.(e);
      },
      [onFocus]
    );

    const handleBlur = useCallback(
      (e: any) => {
        setFocused(false);
        onBlur?.(e);
      },
      [onBlur]
    );

    const borderColor = error ? "rgba(239,68,68,0.75)" : focused ? theme.tint : theme.glassBorder;

    return (
      <View className={className} style={containerStyle}>
        {label ? (
          <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>{label}</Text>
        ) : null}

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            borderRadius: radii.md,
            borderWidth: focused ? 1.5 : 1,
            borderColor,
            backgroundColor: theme.inputFill,
            paddingHorizontal: 14,
            minHeight: 52,
            shadowColor: focused ? theme.tint : "transparent",
            shadowOpacity: focused ? 0.28 : 0,
            shadowRadius: 14,
            shadowOffset: { width: 0, height: 4 },
            elevation: focused ? 3 : 0,
          }}
        >
          {icon ? (
            <Ionicons
              name={icon}
              size={18}
              color={focused ? theme.tint : theme.iconMuted}
              style={{ marginEnd: 10 }}
            />
          ) : null}

          <TextInput
            {...props}
            blurOnSubmit={false}
            ref={ref}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholderTextColor={theme.textMuted}
            style={[styles.inputText, { color: theme.textPrimary }, props.style as TextStyle]}
          />
        </View>

        {error ? <Text style={styles.inputError}>{error}</Text> : null}
      </View>
    );
  }
);

GlassInput.displayName = "GlassInput";

/* ------------------------------------------------------------------ */
/* Small building blocks                                               */
/* ------------------------------------------------------------------ */

export function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
  const theme = useTheme();
  return <View style={[{ height: 1, backgroundColor: theme.divider }, style]} />;
}

export function MoneyText({
  children,
  size = "lg",
  tone = "default",
  style,
  className,
}: {
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  tone?: "default" | "positive" | "negative";
  style?: StyleProp<TextStyle>;
  className?: string;
}) {
  const theme = useTheme();
  const sizes = {
    sm: 14,
    md: 16,
    lg: 24,
    xl: 32,
  } as const;
  const color =
    tone === "positive" ? theme.success : tone === "negative" ? theme.danger : theme.textPrimary;

  return (
    <Text className={className} style={[styles.money, { fontSize: sizes[size], color }, style]}>
      {children}
    </Text>
  );
}

export function ScreenState({
  state,
  title,
  message,
  icon,
  action,
  onAction,
  children,
}: {
  state: "loading" | "empty" | "error";
  title?: string;
  message?: string;
  icon?: React.ComponentProps<typeof Ionicons>["name"];
  action?: string;
  onAction?: () => void;
  children?: React.ReactNode;
}) {
  const theme = useTheme();
  const tone = state === "error" ? theme.danger : theme.tint;
  const resolvedIcon =
    icon ?? (state === "loading" ? "sync" : state === "error" ? "warning" : "list-outline");

  return (
    <View style={styles.stateContainer}>
      <GlassCard level={1} style={styles.stateCard}>
        {state === "loading" ? (
          <ActivityIndicator size="large" color={theme.tint} />
        ) : (
          <Ionicons name={resolvedIcon} size={30} color={tone} />
        )}
        {title ? (
          <Text style={[styles.stateTitle, { color: theme.textPrimary }]}>{title}</Text>
        ) : null}
        {message ? (
          <Text style={[styles.stateMessage, { color: theme.textSecondary }]}>{message}</Text>
        ) : null}
        {state !== "loading" && action ? (
          <GlassButton size="sm" variant="ghost" onPress={onAction}>
            {action}
          </GlassButton>
        ) : null}
        {children}
      </GlassCard>
    </View>
  );
}

export function GlassPill({
  children,
  icon,
  tint,
  className,
}: {
  children?: React.ReactNode;
  icon?: React.ComponentProps<typeof Ionicons>["name"];
  tint?: string;
  className?: string;
}) {
  const theme = useTheme();
  const color = tint ?? theme.tint;
  return (
    <View
      className={className}
      style={[styles.pill, { backgroundColor: `${color}1f`, borderColor: `${color}55` }]}
    >
      {icon ? <Ionicons name={icon} size={13} color={color} style={{ marginEnd: 5 }} /> : null}
      <Text style={[styles.pillText, { color }]}>{children}</Text>
    </View>
  );
}

export function SectionTitle({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  const theme = useTheme();
  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>{title}</Text>
      {action ? (
        <Pressable onPress={onAction}>
          <Text style={[styles.sectionAction, { color: theme.tint }]}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Ambient aurora background                                           */
/* ------------------------------------------------------------------ */

export function GradientBackground({ children }: { children: React.ReactNode; dark?: boolean }) {
  const theme = useTheme();
  const colors = theme.background;

  return (
    <View style={[styles.flex, { backgroundColor: colors[0] }]}>
      <LinearGradient
        colors={colors as unknown as [string, string, ...string[]]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Soft colour blobs give the glass something to refract */}
      {theme.blobs.map((blob, i) => (
        <View
          key={i}
          style={{
            position: "absolute",
            left: blob.x,
            top: blob.y,
            width: blob.size,
            height: blob.size,
            borderRadius: blob.size / 2,
            backgroundColor: blob.color,
            opacity: isWeb ? blob.opacity : blob.opacity * 0.75,
            transform: [{ scaleX: 1.25 }],
            ...(isWeb ? ({ filter: "blur(70px)" } as unknown as ViewStyle) : null),
            pointerEvents: "none",
          }}
        />
      ))}

      <View style={styles.flex}>{children}</View>
    </View>
  );
}

export function ScreenHeader({
  title,
  subtitle,
  right,
  onBack,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  onBack?: () => void;
}) {
  const theme = useTheme();
  return (
    <View style={styles.headerRow}>
      <View style={styles.headerLeft}>
        {onBack ? <GlassIconButton icon="chevron-forward" onPress={onBack} size={40} /> : null}
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>{title}</Text>
          {subtitle ? (
            <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>{subtitle}</Text>
          ) : null}
        </View>
      </View>
      {right}
    </View>
  );
}

/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  flex: { flex: 1 },
  noTouch: { pointerEvents: "none" },
  listCard: { padding: 16 },
  form: { padding: 20 },
  formFields: { gap: 18 },
  formFooter: { marginTop: 22 },
  dataList: { gap: 10 },
  dataRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    minHeight: 32,
  },
  dataLabel: {
    flexShrink: 0,
    fontSize: 13.5,
    fontFamily: fontFamily.regular,
  },
  dataValue: {
    flex: 1,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  statusPill: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: "700",
    fontFamily: fontFamily.semiBold,
  },
  progressTrack: {
    height: 7,
    borderRadius: 999,
    overflow: "hidden",
  },
  actionTileWrapper: { flex: 1 },
  actionTile: {
    flex: 1,
    minHeight: 104,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  actionTileTitle: {
    fontSize: 14.5,
    fontWeight: "800",
    textAlign: "center",
    fontFamily: fontFamily.bold,
  },
  actionTileSubtitle: {
    fontSize: 12.5,
    textAlign: "center",
    fontFamily: fontFamily.regular,
  },
  money: {
    fontWeight: "800",
    letterSpacing: 0.1,
    textAlign: "left",
    writingDirection: "ltr",
    fontVariant: ["tabular-nums"],
    fontFamily: fontFamily.extraBold,
  },
  stateContainer: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  stateCard: { alignItems: "center", gap: 12, minWidth: 220, paddingVertical: 28 },
  stateTitle: {
    fontSize: 17,
    fontWeight: "800",
    textAlign: "center",
    fontFamily: fontFamily.bold,
  },
  stateMessage: {
    fontSize: 13.5,
    lineHeight: 21,
    textAlign: "center",
    fontFamily: fontFamily.regular,
  },
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonLabel: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.2,
    textAlign: "center",
    fontFamily: fontFamily.semiBold,
  },
  buttonGloss: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "45%",
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 7,
    marginStart: 4,
    fontFamily: fontFamily.semiBold,
  },
  inputText: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 14,
    textAlign: "right",
    writingDirection: "rtl",
    fontFamily: fontFamily.regular,
  },
  inputError: {
    color: "#ef4444",
    fontSize: 12.5,
    marginTop: 6,
    marginStart: 4,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 12,
    fontWeight: "700",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    writingDirection: "rtl",
    fontFamily: fontFamily.bold,
  },
  sectionAction: {
    fontSize: 13.5,
    fontWeight: "600",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    writingDirection: "rtl",
    fontFamily: fontFamily.extraBold,
  },
  headerSubtitle: {
    fontSize: 13.5,
    marginTop: 2,
    writingDirection: "rtl",
    fontFamily: fontFamily.regular,
  },
});
