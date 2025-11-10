/**
 * Design constants for UI
 * Colors, fonts, and theme values
 */

export const COLORS = {
  background: {
    deep: '#1A202C',
    space: '#050510',
  },
  ebb: {
    indigo: '#4A5568',
    darker: 'rgba(26, 32, 44, 0.95)',
  },
  bloom: {
    emerald: '#38A169',
  },
  seed: {
    amber: '#D69E2E',
  },
  neutral: {
    gray: '#718096',
    light: '#E2E8F0',
  },
  semantic: {
    error: '#F56565',
    warning: '#ED8936',
    success: '#48BB78',
    info: '#4299E1',
  },
  // Legacy compatibility
  primary: {
    ebb: '#4A5568',
    bloom: '#38A169',
  },
  accent: {
    bloom: '#38A169',
    seed: '#D69E2E',
  },
  text: {
    light: '#E2E8F0',
    dark: '#1A202C',
    muted: '#718096',
    primary: '#E2E8F0',
  },
  space: {
    deep: '#050510',
  },
};

export const FONTS = {
  display: 'Playfair Display, serif',
  sans: 'Work Sans, sans-serif',
  mono: 'JetBrains Mono, monospace',
  title: 'Playfair Display, serif',
  body: 'Work Sans, sans-serif',
  button: 'Work Sans, sans-serif',
  code: 'JetBrains Mono, monospace',
  seed: 'JetBrains Mono, monospace',
  // Legacy compatibility
  ui: 'Work Sans, sans-serif',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const SIZES = {
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 16,
  },
};
