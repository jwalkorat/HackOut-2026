/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#050811',
          900: '#070B16',
          850: '#0B1120',
          800: '#0F172A',
          750: '#152037',
          700: '#1E293B',
          600: '#334155',
        },
        cyan: {
          400: '#22D3EE',
          500: '#06B6D4',
          glow: 'rgba(6, 182, 212, 0.45)',
        },
        solar: {
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          glow: 'rgba(245, 158, 11, 0.45)',
        },
        wind: {
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          glow: 'rgba(16, 185, 129, 0.45)',
        },
        alert: {
          400: '#F87171',
          500: '#EF4444',
          600: '#DC2626',
          glow: 'rgba(239, 68, 68, 0.45)',
        }
      },
      fontFamily: {
        display: ['Outfit', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 25px -5px rgba(6, 182, 212, 0.35)',
        'glow-solar': '0 0 25px -5px rgba(245, 158, 11, 0.35)',
        'glow-wind': '0 0 25px -5px rgba(16, 185, 129, 0.35)',
        'glow-alert': '0 0 25px -5px rgba(239, 68, 68, 0.35)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 12s linear infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
