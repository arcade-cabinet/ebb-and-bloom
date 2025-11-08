/**
 * Design System Constants
 * Single source of truth for all branding, colors, fonts, spacing
 * Cross-platform compatible (BabylonJS + Capacitor)
 */

/**
 * Color Palette
 * From design system - DO NOT hardcode these anywhere else
 */
export const COLORS = {
  // Primary
  background: {
    deep: '#1A202C',      // Deep indigo background
    space: '#050510',     // Deep space (rgba equivalent)
  },
  
  // Brand Colors
  ebb: {
    indigo: '#4A5568',    // Ebb indigo (panels, borders)
    darker: 'rgba(26, 32, 44, 0.95)', // Modal backgrounds
  },
  
  bloom: {
    emerald: '#38A169',   // Bloom emerald (primary actions)
  },
  
  seed: {
    gold: '#D69E2E',      // Seed gold (seed input, highlights)
  },
  
  // Neutrals
  neutral: {
    white: '#F7FAFC',     // Accent white (text)
    slate: '#A0AEC0',     // Muted slate (secondary text)
    gray: '#718096',      // Mid gray
  },
  
  // Semantic
  semantic: {
    success: '#38A169',   // Same as bloom emerald
    warning: '#D69E2E',   // Same as seed gold
    error: '#E53E3E',     // Red
    info: '#3182CE',      // Blue
  },
  
  // Space/Celestial
  space: {
    starlight: {
      warm: '#FFF6E5',    // Warm star light
      cool: '#E5F0FF',    // Cool star light
    },
    ambient: '#CCCCDD',   // Ambient space light
    fog: '#000000',       // Deep space fog
  },
} as const;

/**
 * Typography
 * Font families from Google Fonts CDN
 */
export const FONTS = {
  // Primary font families
  display: 'Playfair Display, serif',     // Titles, headings, haikus, poetic text
  sans: 'Work Sans, sans-serif',           // Body text, UI labels, buttons
  mono: 'JetBrains Mono, monospace',       // Seed codes, technical data, coordinates
  
  // Semantic font assignments
  title: 'Playfair Display, serif',
  body: 'Work Sans, sans-serif',
  button: 'Work Sans, sans-serif',
  code: 'JetBrains Mono, monospace',
  seed: 'JetBrains Mono, monospace',
  technical: 'JetBrains Mono, monospace',
} as const;

/**
 * Font Sizes
 */
export const FONT_SIZES = {
  // Headings
  h1: 32,
  h2: 24,
  h3: 20,
  h4: 18,
  
  // Body
  body: 16,
  bodySmall: 14,
  
  // UI
  button: 16,
  buttonLarge: 18,
  label: 14,
  caption: 12,
  
  // Technical
  code: 14,
  seed: 14,
} as const;

/**
 * Spacing
 */
export const SPACING = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  xxl: '32px',
  xxxl: '48px',
} as const;

/**
 * Border Radius
 */
export const RADIUS = {
  sm: 4,
  md: 8,
  lg: 10,
  xl: 15,
  full: 9999,
} as const;

/**
 * Layout
 */
export const LAYOUT = {
  // Button dimensions
  button: {
    width: '240px',
    height: '50px',
    widthSmall: '200px',
    heightSmall: '44px',
  },
  
  // Modal dimensions
  modal: {
    width: 0.7,      // 70% of screen
    height: 0.4,     // 40% of screen
    widthLarge: 0.8,
    heightLarge: 0.6,
  },
  
  // Panel dimensions
  panel: {
    width: '500px',
    padding: '40px',
  },
} as const;

/**
 * Animation Durations (milliseconds)
 */
export const DURATION = {
  instant: 0,
  fast: 150,
  normal: 300,
  slow: 500,
  splash: 2500,
} as const;

/**
 * Z-Index Layers
 */
export const Z_INDEX = {
  background: 0,
  content: 100,
  overlay: 500,
  modal: 1000,
  tooltip: 2000,
  notification: 3000,
} as const;

/**
 * Opacity Values
 */
export const OPACITY = {
  transparent: 0,
  faint: 0.1,
  light: 0.3,
  medium: 0.5,
  strong: 0.7,
  heavy: 0.9,
  opaque: 1,
} as const;

/**
 * Material Properties (PBR defaults)
 */
export const MATERIALS = {
  planet: {
    roughness: 0.7,
    metallic: 0.1,
    emissiveIntensity: 0.2,
  },
  
  moon: {
    roughness: 0.9,
    metallic: 0.0,
  },
  
  ui: {
    roughness: 0.3,
    metallic: 0.8,
  },
} as const;

