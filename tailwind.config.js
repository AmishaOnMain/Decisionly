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
        forest: {
          50: '#F0F6F4',
          100: '#DDECE8',
          200: '#BFDDD6',
          300: '#94C5B9',
          400: '#5EAD9C',
          500: '#3D917F',
          600: '#2E7465',
          700: '#265D52',
          800: '#224B43',
          900: '#1D3F38',
          950: '#112622',
        },
        cream: {
          50: '#FAF8F4',
          100: '#F5F1E8',
          200: '#EBE2D3',
          300: '#DECDBD',
          400: '#CFB5A0',
          500: '#B89981',
        },
        amber: {
          50: '#FFFDF5',
          100: '#FEF8E7',
          200: '#FDEFC6',
          300: '#FBE29B',
          400: '#F7CE64',
          500: '#EAA023',
          600: '#D58615',
          700: '#B16310',
          800: '#8E4D12',
          900: '#754013',
        },
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
          amber: '#EAA023',
          rose: '#f43f5e',
        },
        surface: {
          light: '#ffffff',
          lightMuted: '#F5F1E8',
          lightBorder: '#E5DFD5',
          dark: '#0F171A',
          darkCard: '#152226',
          darkMuted: '#0D1417',
          darkBorder: 'rgba(255, 255, 255, 0.07)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      boxShadow: {
        'glow-brand': '0 0 25px -5px rgba(139, 92, 246, 0.35)',
        'glow-accent': '0 0 25px -5px rgba(6, 182, 212, 0.35)',
      },
    },
  },
  plugins: [],
};
