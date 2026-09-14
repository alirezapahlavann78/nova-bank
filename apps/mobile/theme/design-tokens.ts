export const spacing = {
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  xxxl: 24,
  huge: 32,
  giant: 40,
  massive: 48,
} as const;

export const radius = {
  chip: 10,
  input: 14,
  row: 18,
  card: 22,
  sheet: 28,
  pill: 999,
} as const;

export const typography = {
  display: {
    fontSize: 34,
    lineHeight: 42,
    fontWeight: "800",
    fontFamily: "VazirmatnExtraBold",
  },
  pageTitle: {
    fontSize: 26,
    lineHeight: 34,
    fontWeight: "700",
    fontFamily: "VazirmatnBold",
  },
  sectionTitle: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "700",
    fontFamily: "VazirmatnBold",
  },
  cardTitle: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: "600",
    fontFamily: "VazirmatnSemiBold",
  },
  body: {
    fontSize: 15,
    lineHeight: 23,
    fontWeight: "400",
    fontFamily: "Vazirmatn",
  },
  bodySmall: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "400",
    fontFamily: "Vazirmatn",
  },
  caption: {
    fontSize: 11,
    lineHeight: 17,
    fontWeight: "400",
    fontFamily: "Vazirmatn",
  },
  button: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "600",
    fontFamily: "VazirmatnSemiBold",
  },
  numeric: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: "600",
    fontFamily: "VazirmatnSemiBold",
  },
} as const;

export const iconSize = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 28,
  xl: 32,
} as const;

export const layout = {
  pageHorizontalPadding: spacing.xxl,
  headerBottomSpacing: spacing.lg,
  sectionRhythm: spacing.xxxl,
  cardPadding: spacing.xl,
  rowGap: spacing.lg,
  formGap: 18,
  footerGap: spacing.xl,
  bottomContentPadding: spacing.massive,
  maxContentWidth: 720,
  minimumTouchTarget: 44,
} as const;

export type SpacingToken = keyof typeof spacing;
export type RadiusToken = keyof typeof radius;
export type TypographyVariant = keyof typeof typography;
export type IconSizeToken = keyof typeof iconSize;
