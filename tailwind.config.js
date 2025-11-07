import { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      // Ebb & Bloom Brand Colors
      colors: {
        // Primary evolutionary theme
        'ebb-indigo': {
          50: '#f7fafc',
          100: '#edf2f7', 
          200: '#e2e8f0',
          300: '#cbd5e0',
          400: '#a0aec0',
          500: '#4A5568', // Primary ebb color
          600: '#2d3748',
          700: '#1a202c',
          800: '#171923',
          900: '#0f1419'
        },
        'bloom-emerald': {
          50: '#f0fff4',
          100: '#c6f6d5',
          200: '#9ae6b4', 
          300: '#68d391',
          400: '#48bb78',
          500: '#38A169', // Primary bloom color
          600: '#2f855a',
          700: '#276749',
          800: '#22543d',
          900: '#1c4532'
        },
        'trait-gold': {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#D69E2E', // Primary trait color
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f'
        },
        'echo-silver': {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#A0AEC0', // Primary echo color
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827'
        },
        // Environmental colors
        'pollution-red': {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca', 
          300: '#fca5a5',
          400: '#f87171',
          500: '#E53E3E', // Environmental pressure
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d'
        },
        'mutation-purple': {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#805AD5', // Genetic synthesis
          600: '#9333ea',
          700: '#7c3aed',
          800: '#6b21a8',
          900: '#581c87'
        }
      },
      
      // Typography with Google Fonts
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'ui-monospace', 'monospace'],
        'display': ['Playfair Display', 'Georgia', 'serif']
      },
      
      // Animation for evolutionary themes
      animation: {
        'trait-emerge': 'trait-emerge 2s ease-in-out',
        'evolution-pulse': 'evolution-pulse 3s ease-in-out infinite',
        'pack-form': 'pack-form 1.5s ease-out',
        'shock-wave': 'shock-wave 0.8s cubic-bezier(0.4, 0, 0.6, 1)',
        'organic-breathe': 'organic-breathe 4s ease-in-out infinite',
        'data-flow': 'data-flow 2s linear infinite'
      },
      
      keyframes: {
        'trait-emerge': {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '50%': { transform: 'scale(1.05)', opacity: '0.8' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        'evolution-pulse': {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.7' },
          '50%': { transform: 'scale(1.02)', opacity: '1' }
        },
        'pack-form': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        'shock-wave': {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(1.3)', opacity: '0' }
        },
        'organic-breathe': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.01)' }
        },
        'data-flow': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        }
      },
      
      // Custom spacing for evolution UI
      spacing: {
        'trait': '2.5rem',    // Standard trait display spacing
        'generation': '4rem',  // Generation milestone spacing
        'ecosystem': '6rem'    // Major ecosystem element spacing
      },
      
      // Custom border radius for organic feeling
      borderRadius: {
        'organic': '1rem 2rem 1rem 2rem',
        'evolution': '0.5rem 1.5rem 0.5rem 1.5rem'
      }
    }
  },
  plugins: [
    require('daisyui'),
    require('@tailwindcss/typography')
  ],
  
  // DaisyUI theme configuration
  daisyui: {
    themes: [
      {
        'ebb-bloom': {
          'primary': '#38A169',        // Bloom emerald
          'primary-content': '#ffffff',
          'secondary': '#4A5568',      // Ebb indigo  
          'secondary-content': '#ffffff',
          'accent': '#D69E2E',         // Trait gold
          'accent-content': '#000000',
          'neutral': '#A0AEC0',        // Echo silver
          'neutral-content': '#000000',
          'base-100': '#ffffff',       // Pure white
          'base-200': '#f7fafc',
          'base-300': '#edf2f7',
          'base-content': '#1a202c',
          'info': '#3182CE',           // Haptic blue  
          'info-content': '#ffffff',
          'success': '#48BB78',        // Success green
          'success-content': '#ffffff',
          'warning': '#ED8936',        // Warning orange
          'warning-content': '#ffffff',
          'error': '#E53E3E',          // Error crimson
          'error-content': '#ffffff',
          
          // Custom evolutionary variables
          '--ebb-color': '#4A5568',
          '--bloom-color': '#38A169', 
          '--trait-color': '#D69E2E',
          '--echo-color': '#A0AEC0',
          '--pollution-color': '#E53E3E',
          '--mutation-color': '#805AD5'
        }
      }
    ],
    base: true,
    styled: true,
    utils: true,
    logs: false,
    rtl: false
  }
};

export default config;