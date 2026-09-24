/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // Every colour is a CSS variable (src/theme.css) so the whole app can switch to dark mode.
      colors: {
        ocean: { 50: 'rgb(var(--c-ocean-50) / <alpha-value>)', 100: 'rgb(var(--c-ocean-100) / <alpha-value>)', 200: 'rgb(var(--c-ocean-200) / <alpha-value>)', 300: 'rgb(var(--c-ocean-300) / <alpha-value>)', 400: 'rgb(var(--c-ocean-400) / <alpha-value>)', 500: 'rgb(var(--c-ocean-500) / <alpha-value>)', 600: 'rgb(var(--c-ocean-600) / <alpha-value>)', 700: 'rgb(var(--c-ocean-700) / <alpha-value>)', 800: 'rgb(var(--c-ocean-800) / <alpha-value>)', 900: 'rgb(var(--c-ocean-900) / <alpha-value>)', 950: 'rgb(var(--c-ocean-950) / <alpha-value>)' },
        aqua: { 50: 'rgb(var(--c-aqua-50) / <alpha-value>)', 100: 'rgb(var(--c-aqua-100) / <alpha-value>)', 200: 'rgb(var(--c-aqua-200) / <alpha-value>)', 300: 'rgb(var(--c-aqua-300) / <alpha-value>)', 400: 'rgb(var(--c-aqua-400) / <alpha-value>)', 500: 'rgb(var(--c-aqua-500) / <alpha-value>)', 600: 'rgb(var(--c-aqua-600) / <alpha-value>)', 700: 'rgb(var(--c-aqua-700) / <alpha-value>)', 800: 'rgb(var(--c-aqua-800) / <alpha-value>)', 900: 'rgb(var(--c-aqua-900) / <alpha-value>)' },
        sun: { 50: 'rgb(var(--c-sun-50) / <alpha-value>)', 100: 'rgb(var(--c-sun-100) / <alpha-value>)', 200: 'rgb(var(--c-sun-200) / <alpha-value>)', 300: 'rgb(var(--c-sun-300) / <alpha-value>)', 400: 'rgb(var(--c-sun-400) / <alpha-value>)', 500: 'rgb(var(--c-sun-500) / <alpha-value>)', 600: 'rgb(var(--c-sun-600) / <alpha-value>)', 700: 'rgb(var(--c-sun-700) / <alpha-value>)' },
        ink: { 50: 'rgb(var(--c-ink-50) / <alpha-value>)', 100: 'rgb(var(--c-ink-100) / <alpha-value>)', 200: 'rgb(var(--c-ink-200) / <alpha-value>)', 300: 'rgb(var(--c-ink-300) / <alpha-value>)', 400: 'rgb(var(--c-ink-400) / <alpha-value>)', 500: 'rgb(var(--c-ink-500) / <alpha-value>)', 600: 'rgb(var(--c-ink-600) / <alpha-value>)', 700: 'rgb(var(--c-ink-700) / <alpha-value>)', 800: 'rgb(var(--c-ink-800) / <alpha-value>)', 900: 'rgb(var(--c-ink-900) / <alpha-value>)' },
        leaf: { 50: 'rgb(var(--c-leaf-50) / <alpha-value>)', 100: 'rgb(var(--c-leaf-100) / <alpha-value>)', 500: 'rgb(var(--c-leaf-500) / <alpha-value>)', 600: 'rgb(var(--c-leaf-600) / <alpha-value>)', 700: 'rgb(var(--c-leaf-700) / <alpha-value>)' },
        amber: { 50: 'rgb(var(--c-amber-50) / <alpha-value>)', 100: 'rgb(var(--c-amber-100) / <alpha-value>)', 500: 'rgb(var(--c-amber-500) / <alpha-value>)', 600: 'rgb(var(--c-amber-600) / <alpha-value>)', 700: 'rgb(var(--c-amber-700) / <alpha-value>)' },
        rose: { 50: 'rgb(var(--c-rose-50) / <alpha-value>)', 100: 'rgb(var(--c-rose-100) / <alpha-value>)', 500: 'rgb(var(--c-rose-500) / <alpha-value>)', 600: 'rgb(var(--c-rose-600) / <alpha-value>)', 700: 'rgb(var(--c-rose-700) / <alpha-value>)' },
        canvas: 'rgb(var(--c-canvas) / <alpha-value>)',
        surface: 'rgb(var(--c-surface) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['"Inter Variable"', 'Inter', 'system-ui', '"Noto Sans Devanagari Variable"', 'sans-serif'],
        display: ['"Plus Jakarta Sans Variable"', '"Inter Variable"', 'system-ui', '"Noto Sans Devanagari Variable"', 'sans-serif'],
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
        'ocean-soft': 'linear-gradient(135deg, rgb(var(--c-ocean-50)) 0%, rgb(var(--c-aqua-50)) 100%)',
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
