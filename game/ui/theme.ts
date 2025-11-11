/**
 * MUI THEME CONFIGURATION
 * 
 * Aligned with DESIGN.md brand identity.
 * Dark theme optimized for game UI with Ebb & Bloom color palette.
 * Based on Material UI v7 theme system.
 */

import { createTheme } from '@mui/material/styles';

// Design System Colors (from DESIGN.md)
const colors = {
  // Primary
  ebbIndigo: '#4A5568',      // Backgrounds, cards
  bloomEmerald: '#38A169',    // Growth, success, primary actions
  traitGold: '#D69E2E',      // Highlights, evolution, discovery
  echoSilver: '#A0AEC0',     // Text, secondary UI
  
  // Environmental
  pollutionRed: '#E53E3E',    // Warnings, pressure
  mutationPurple: '#805AD5',  // Genetic synthesis
  
  // Interaction
  hapticBlue: '#3182CE',      // Touch feedback
  successGreen: '#48BB78',    // Positive evolution
  warningOrange: '#ED8936',   // Environmental alerts
  
  // Backgrounds
  backgroundDark: '#1A202C',  // Deep background
  backgroundPaper: 'rgba(26, 32, 44, 0.9)', // Paper/card background
  textPrimary: '#F7FAFC',     // Primary text
  textSecondary: '#A0AEC0',   // Secondary text
};

export const gameTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: colors.bloomEmerald,      // Bloom Emerald for primary actions
      contrastText: colors.textPrimary,
    },
    secondary: {
      main: colors.traitGold,         // Trait Gold for highlights
      contrastText: colors.textPrimary,
    },
    error: {
      main: colors.pollutionRed,       // Pollution Red for errors/warnings
    },
    warning: {
      main: colors.warningOrange,     // Warning Orange for alerts
    },
    info: {
      main: colors.hapticBlue,        // Haptic Blue for info
    },
    success: {
      main: colors.successGreen,       // Success Green for positive actions
    },
    background: {
      default: colors.backgroundDark,
      paper: colors.backgroundPaper,
    },
    text: {
      primary: colors.textPrimary,
      secondary: colors.echoSilver,
    },
  },
  typography: {
    // Base font: Inter for UI text, buttons, body copy
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: {
      fontFamily: '"Playfair Display", serif', // Titles, haikus, poetic text
      fontSize: '48px',
      fontWeight: 700,
      letterSpacing: '0.02em',
      color: colors.textPrimary,
    },
    h2: {
      fontFamily: '"Playfair Display", serif',
      fontSize: '32px',
      fontWeight: 600,
      letterSpacing: '0.02em',
      color: colors.textPrimary,
    },
    h3: {
      fontFamily: '"Playfair Display", serif',
      fontSize: '24px',
      fontWeight: 600,
      letterSpacing: '0.02em',
    },
    body1: {
      fontFamily: '"Inter", sans-serif',
      fontSize: '16px',
      color: colors.textPrimary,
    },
    body2: {
      fontFamily: '"Inter", sans-serif',
      fontSize: '14px',
      color: colors.echoSilver,
    },
    button: {
      fontFamily: '"Inter", sans-serif',
      textTransform: 'none',
      fontWeight: 500,
      letterSpacing: '0.05em',
      fontSize: '16px',
    },
    caption: {
      fontFamily: '"JetBrains Mono", monospace', // Numbers, data, technical info
      fontSize: '12px',
      color: colors.echoSilver,
    },
  },
  shape: {
    borderRadius: 10, // Rounded corners (Spore-inspired)
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '12px 24px',
          minHeight: 44, // Touch target: 44px minimum (mobile-aware)
          fontSize: '16px',
          fontWeight: 500,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
          },
        },
        contained: {
          backgroundColor: colors.bloomEmerald,
          color: colors.textPrimary,
          '&:hover': {
            backgroundColor: colors.successGreen,
          },
        },
        outlined: {
          borderColor: colors.bloomEmerald,
          borderWidth: 2,
          color: colors.bloomEmerald,
          '&:hover': {
            backgroundColor: 'rgba(56, 161, 105, 0.1)',
            borderColor: colors.successGreen,
          },
        },
        text: {
          color: colors.echoSilver,
          '&:hover': {
            backgroundColor: 'rgba(160, 174, 192, 0.1)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: colors.backgroundPaper,
          borderRadius: 10,
          border: `1px solid ${colors.ebbIndigo}`,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)', // Soft shadows (Spore-inspired)
        },
        elevation1: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
        },
        elevation4: {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
        },
        elevation8: {
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          '&.mono': {
            fontFamily: '"JetBrains Mono", monospace',
          },
        },
      },
    },
  },
});

// Export color constants for use in components
export const designColors = colors;

