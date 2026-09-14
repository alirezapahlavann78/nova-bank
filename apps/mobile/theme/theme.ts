export const glass = {
  bgLight: 'rgba(255,255,255,0.55)',
  bgDark: 'rgba(255,255,255,0.07)',
  borderLight: 'rgba(255,255,255,0.45)',
  borderDark: 'rgba(255,255,255,0.12)',
  shadow: '0 8px 32px rgba(100,80,200,0.12)',
  blur: 20,
} as const;

export const inputTokens = {
  bgLight: 'rgba(255,255,255,0.70)',
  bgDark: 'rgba(255,255,255,0.09)',
  border: 'rgba(160,140,255,0.35)',
  focus: 'rgba(110,80,230,0.55)',
  radius: 14,
  height: 52,
  padding: '0 16px',
} as const;

export const accent = {
  300: '#c4b5fd',
  400: '#a78bfa',
  500: '#7c3aed',
  600: '#6d28d9',
} as const;

export const status = {
  success: 'hsl(155 60% 42%)',
  danger: 'hsl(4 70% 52%)',
  warning: 'hsl(38 90% 52%)',
} as const;
