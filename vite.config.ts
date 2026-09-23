import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Installable web app + offline support: the service worker precaches the whole app
    // (code, fonts, icons) so Verniq opens and works with no internet after the first visit.
    VitePWA({
      registerType: 'prompt',
      injectRegister: false,
      includeAssets: ['favicon.svg', 'icons/apple-touch-icon.png'],
      manifest: {
        id: '/',
        name: 'Verniq — Learning in their language',
        short_name: 'Verniq',
        description: 'AI-powered vernacular teaching and real-time translation for primary classrooms. Works offline.',
        lang: 'en-IN',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'any',
        theme_color: '#145F9E',
        background_color: '#F5F9FC',
        categories: ['education', 'productivity'],
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
          { name: 'Live translation', short_name: 'Live', url: '/live', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
          { name: 'Lessons', url: '/lessons', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
          { name: 'Create worksheet', short_name: 'Worksheet', url: '/materials?tab=worksheets', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
        ],
      },
      workbox: {
        // Latin + Devanagari font files only; other scripts are fetched on demand
        globPatterns: ['**/*.{js,css,html,svg,png}', 'assets/*-{latin,latin-ext,devanagari}-*.woff2'],
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
      },
    }),
  ],
})
