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
        vayro: {
          lime: '#CBF932',
          limeHover: '#B5F20D',
          limeLight: '#E8FBA2',
          limeBadge: '#EAF9AF',
          dark: '#111622',
          darker: '#0B0F17',
          cardDark: '#161C2A',
          cardBorderDark: '#232A3B',
          bg: '#FAFAF8',
          card: '#FFFFFF',
          textDark: '#0E131F',
          textMuted: '#64748B',
          inputBg: '#F3F4F6',
        },
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#b9dffe',
          300: '#7cc5fd',
          400: '#36a7fa',
          500: '#0c8cee',
          600: '#006ecb',
          700: '#0157a4',
          800: '#064b86',
          900: '#0a3f6f',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'vayro': '0 10px 30px -5px rgba(0, 0, 0, 0.05)',
        'vayro-dark': '0 20px 40px -10px rgba(0, 0, 0, 0.4)',
        'lime-glow': '0 0 25px -4px rgba(203, 249, 50, 0.4)',
      }
    },
  },
  plugins: [],
}
