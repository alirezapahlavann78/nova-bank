/**
 * NovaBank — Design tokens
 * "Liquid Glass" inspired visual language (iOS 26/27 aesthetic),
 * tuned to look great on BOTH iOS and Android and on web.
 */

export const palette = {
  // Brand
  indigo: "#4f46e5",
  indigoDeep: "#4338ca",
  violet: "#7c3aed",
  blue: "#2563eb",
  cyan: "#06b6d4",
  teal: "#0d9488",
  mint: "#34d399",

  // Semantic
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",

  // Neutrals
  white: "#ffffff",
  ink: "#0b1020",
  inkSoft: "#1e293b",
  slate: "#64748b",
} as const;

/** Aurora gradient stops used for the ambient app background. */
export const lightBackground = ["#eef2ff", "#e0f2fe", "#ecfeff", "#f5f3ff"] as const;
export const darkBackground = ["#070b1a", "#0b1226", "#0e1628", "#131024"] as const;

export interface Blob {
  color: string;
  opacity: number;
  size: number;
  x: number;
  y: number;
}

/** Blurred colour blobs that sit behind the glass for depth. */
export const lightBlobs: Blob[] = [
  { color: "#8b5cf6", opacity: 0.3, size: 320, x: -80, y: -40 },
  { color: "#22d3ee", opacity: 0.28, size: 300, x: 200, y: 120 },
  { color: "#6366f1", opacity: 0.24, size: 360, x: -40, y: 380 },
  { color: "#2dd4bf", opacity: 0.22, size: 260, x: 220, y: 560 },
];

export const darkBlobs: Blob[] = [
  { color: "#4f46e5", opacity: 0.45, size: 340, x: -90, y: -60 },
  { color: "#0891b2", opacity: 0.35, size: 300, x: 210, y: 100 },
  { color: "#7c3aed", opacity: 0.4, size: 380, x: -60, y: 360 },
  { color: "#0d9488", opacity: 0.28, size: 260, x: 200, y: 560 },
];

export const radii = {
  sm: 12,
  md: 16,
  lg: 22,
  xl: 28,
  xxl: 34,
  pill: 999,
} as const;

/** Gradient button fills. */
export const gradients = {
  primary: ["#6366f1", "#4f46e5", "#7c3aed"] as const,
  secondary: ["#06b6d4", "#0d9488"] as const,
  danger: ["#f87171", "#dc2626"] as const,
  gold: ["#fbbf24", "#f59e0b"] as const,
};

export type ThemeMode = "light" | "dark";

export interface Theme {
  mode: ThemeMode;
  /** Base translucent fill for glass surfaces. */
  glassFill: string;
  /** A second stop so surfaces can hold a subtle inner gradient. */
  glassFillEnd: string;
  /** Hairline highlight around the glass edge (the "specular" rim). */
  glassBorder: string;
  /** Bright inner rim on the top edge — reads as light hitting the glass. */
  glassHighlight: string;
  glassShadow: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  iconMuted: string;
  divider: string;
  tint: string;
  tabBar: string;
  tabBarBorder: string;
  inputFill: string;
  solidSurface: string;
  success: string;
  danger: string;
  warning: string;
  background: readonly string[];
  blobs: Blob[];
}

export const lightTheme: Theme = {
  mode: "light",
  glassFill: "rgba(255,255,255,0.62)",
  glassFillEnd: "rgba(255,255,255,0.38)",
  glassBorder: "rgba(255,255,255,0.75)",
  glassHighlight: "rgba(255,255,255,0.95)",
  glassShadow: "rgba(30,41,59,0.16)",
  textPrimary: "#0b1020",
  textSecondary: "#475569",
  textMuted: "#7c8798",
  iconMuted: "#94a3b8",
  divider: "rgba(15,23,42,0.08)",
  tint: palette.indigo,
  tabBar: "rgba(255,255,255,0.72)",
  tabBarBorder: "rgba(255,255,255,0.85)",
  inputFill: "rgba(255,255,255,0.55)",
  solidSurface: "rgba(255,255,255,0.90)",
  success: palette.success,
  danger: palette.danger,
  warning: palette.warning,
  background: lightBackground,
  blobs: lightBlobs,
};

export const darkTheme: Theme = {
  mode: "dark",
  glassFill: "rgba(30,41,59,0.55)",
  glassFillEnd: "rgba(15,23,42,0.35)",
  glassBorder: "rgba(148,163,184,0.22)",
  glassHighlight: "rgba(255,255,255,0.22)",
  glassShadow: "rgba(0,0,0,0.55)",
  textPrimary: "#f8fafc",
  textSecondary: "#cbd5e1",
  textMuted: "#94a3b8",
  iconMuted: "#64748b",
  divider: "rgba(255,255,255,0.10)",
  tint: "#8b93ff",
  tabBar: "rgba(15,23,42,0.78)",
  tabBarBorder: "rgba(255,255,255,0.10)",
  inputFill: "rgba(15,23,42,0.45)",
  solidSurface: "rgba(15,23,42,0.92)",
  success: palette.mint,
  danger: "#f87171",
  warning: palette.warning,
  background: darkBackground,
  blobs: darkBlobs,
};
