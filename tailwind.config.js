/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './client/index.html',
    './client/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },
        accent: {
          cyan: '#06b6d4',
          emerald: '#10b981',
          amber: '#f59e0b',
          rose: '#f43f5e',
        },
        surface: {
          light: '#ffffff',
          lightMuted: '#f8fafc',
          lightBorder: '#e2e8f0',
          dark: '#0f172a',
          darkCard: '#1e293b',
          darkMuted: '#090d16',
          darkBorder: '#334155',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'glow-brand': '0 0 25px -5px rgba(139, 92, 246, 0.35)',
        'glow-accent': '0 0 25px -5px rgba(6, 182, 212, 0.35)',
      },
    },
  },
  plugins: [],
};
