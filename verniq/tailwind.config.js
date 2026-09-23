/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary — deep ocean blue
        ocean: {
          50: '#EEF6FC',
          100: '#D6EAF8',
          200: '#ADD4F0',
          300: '#7AB8E4',
          400: '#4697D3',
          500: '#1F78BD',
          600: '#145F9E',
          700: '#114C80',
          800: '#0F3E68',
          900: '#0C2F50',
          950: '#081E35',
        },
        // Secondary — turquoise / aqua
        aqua: {
          50: '#EDFCFA',
          100: '#D0F7F1',
          200: '#A3EEE3',
          300: '#6BDFD0',
          400: '#34C8B8',
          500: '#16AC9E',
          600: '#0E8A80',
          700: '#0F6E67',
          800: '#115853',
          900: '#124946',
        },
        // Warm educational accent
        sun: {
          50: '#FFF8EB',
          100: '#FEEBC8',
          200: '#FDD68E',
          300: '#FBBC55',
          400: '#F9A12E',
          500: '#EE8414',
          600: '#D2650D',
          700: '#AE4A10',
        },
        // Neutral ink with a hint of blue
        ink: {
          50: '#F6F8FB',
          100: '#EDF1F6',
          200: '#DDE4EC',
          300: '#C3CDD9',
          400: '#93A1B3',
          500: '#677689',
          600: '#4C5A6C',
          700: '#3A4656',
          800: '#263140',
          900: '#162030',
        },
        leaf: { 50: '#EDF9F1', 100: '#D3F1DE', 500: '#2F9E5B', 600: '#23804A', 700: '#1D673C' },
        amber: { 50: '#FFF7E6', 100: '#FDEBC4', 500: '#D98A06', 600: '#B06F03', 700: '#8A5703' },
        rose: { 50: '#FDF0EF', 100: '#FADCD9', 500: '#D2544B', 600: '#B3423A', 700: '#8F352F' },
        canvas: '#F5F9FC',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Noto Sans Devanagari', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'Noto Sans Devanagari', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(12, 47, 80, 0.04), 0 2px 8px rgba(12, 47, 80, 0.05)',
        lift: '0 4px 12px rgba(12, 47, 80, 0.08), 0 12px 32px rgba(12, 47, 80, 0.08)',
        glow: '0 0 0 8px rgba(22, 172, 158, 0.12), 0 0 0 20px rgba(22, 172, 158, 0.06)',
      },
      backgroundImage: {
        'ocean-gradient': 'linear-gradient(135deg, #145F9E 0%, #1F78BD 45%, #16AC9E 100%)',
        'ocean-soft': 'linear-gradient(135deg, #EEF6FC 0%, #EDFCFA 100%)',
      },
      keyframes: {
        wave: {
          '0%, 100%': { transform: 'scaleY(0.3)' },
          '50%': { transform: 'scaleY(1)' },
        },
        ring: {
          '0%': { transform: 'scale(1)', opacity: '0.5' },
          '100%': { transform: 'scale(1.8)', opacity: '0' },
        },
      },
      animation: {
        wave: 'wave 1s ease-in-out infinite',
        ring: 'ring 1.8s ease-out infinite',
      },
    },
  },
  plugins: [],
};
