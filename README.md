# VERNIQ

**Learning in the language they understand.**

Verniq helps primary-school teachers teach children in their mother tongue. It combines curriculum-aligned AI lessons, Hindi ↔ tribal-language translation, real-time voice translation, bilingual worksheets, picture flashcards, audio and offline-first teaching in one calm, tablet-friendly interface.

Verniq runs in three ways, all from the same code:

| | How teachers get it | Offline |
| --- | --- | --- |
| **Web app** | Open the website | After the first visit |
| **Installable app (PWA)** | Open the website → "Install Verniq" (Chrome/Edge/Android) or Share → "Add to Home Screen" (iPhone/iPad) | Yes — the whole app is cached on the device |
| **Android app** | Install `verniq.apk` | Yes — the app is packaged inside the APK |

## Screens

| Route | Screen | What it does |
| --- | --- | --- |
| `/` | Home | Today's lesson, quick actions, classroom language, class snapshot |
| `/lessons` | Lessons | Search and filter lessons, save them for offline use |
| `/lessons/:id/play` | Lesson player | Distraction-free classroom mode, step by step, with audio |
| `/live` | Verniq Live | Push-to-talk voice translation between teacher and students |
| `/studio` | AI Lesson Studio | Generate a full lesson and regenerate single sections |
| `/materials` | Materials | Bilingual worksheet generator and flashcard studio |
| `/progress` | Progress | Class progress, topic mastery, students who need attention |
| `/settings` | Settings | Profile, language packs, accessibility, offline and sync |

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check and production build into dist/
npm run preview    # serve the production build
npm run lint
```

Requires Node 20+.

## Apps

### Installable web app (PWA)

`npm run build` also produces a service worker and web manifest (via `vite-plugin-pwa`). After the first visit the app, fonts and icons are cached, so Verniq opens and works with no internet. When a new version is deployed, teachers see an "Update" banner. Settings → *Verniq app* shows an install button when the browser supports it.

### Android app (Capacitor)

The `android/` folder is a native Android project that packages the web build.

```bash
npm run android:sync   # build the web app and copy it into android/
npm run android:open   # open in Android Studio
npm run android:apk    # build a debug APK → android/app/build/outputs/apk/debug/app-debug.apk
```

Building locally needs JDK 21 and the Android SDK (Android Studio includes both).

You don't need to build it yourself: every push to `main` runs the **Android APK** GitHub Action (`.github/workflows/android.yml`). It uploads `verniq.apk` to the **android-latest** release on the repository's Releases page.

App ID: `app.verniq.teacher` · min Android 7.0 (API 24) · target API 36. For a Play Store release, create a signing key and run `./gradlew bundleRelease` in `android/`.

Icons and splash screens come from `assets/` and were generated with `@capacitor/assets`.

## Demo mode

Until a backend is connected, Verniq runs in **demo mode**:

- Lessons, translations, worksheets and flashcards come from sample data in `src/data/demo.ts`, returned after short, realistic delays.
- The Live screen does **not** record the microphone; it replays sample classroom phrases so the full interaction can be tried.
- Hindi playback uses the device's built-in speech voice when available. Tribal-language playback is simulated until a voice model is connected.
- A "Demo data" badge is shown in the top bar, and Settings has controls to simulate offline and sync-required states.

**Tribal-language content in the demo is illustrative.** Every Ho word and sentence is marked "review pending" and must be validated by native speakers before classroom use.

## Connecting a backend

All data access goes through replaceable functions in `src/services/`. The UI only depends on their signatures:

| Function | File |
| --- | --- |
| `getLessons()`, `generateLesson()`, `regenerateSection()`, `setSavedOffline()` | `lessonService.ts` |
| `translateText()`, `startVoiceSession()` | `translationService.ts` |
| `generateWorksheet()`, `generateFlashcards()` | `materialsService.ts` |
| `syncOfflineData()` | `syncService.ts` |
| `playAudio()` | `audioService.ts` |

Copy `.env.example` to `.env`, set `VITE_VERNIQ_API_URL`, and replace the body of each function with an API call. `DEMO_MODE` in `src/services/config.ts` turns off automatically when the URL is set.

## Project structure

```text
src/
├── components/
│   ├── ui/            Design system: Button, Card, Badge, Modal, Select, Tabs, Toaster,
│   │                  ProgressBar, AudioButton, Waveform, LanguageSelector, AIStatus,
│   │                  OfflineIndicator, empty / error / skeleton states
│   ├── layout/        App shell, sidebar, top bar, bottom nav, notifications
│   ├── dashboard/     Today's lesson, quick actions, language status
│   ├── lesson/        Lesson card
│   ├── live/          Microphone button
│   ├── worksheet/     Worksheet generator and printable preview
│   └── flashcards/    Flashcard and flashcard studio
├── platform/          PWA install/update + native Android integration
├── pages/             One file per route (lazy-loaded except Home)
├── hooks/             useAudio, useShell
├── services/          Replaceable data and AI functions (demo implementations)
├── store/             App state: language pair, connectivity, lessons, toasts
├── data/              Languages and demo content
├── types/             Shared TypeScript types
└── utils/             Small helpers
```

## Design system

- **Colours** (see `tailwind.config.js`): `ocean` (primary, deep ocean blue), `aqua` (secondary, turquoise), `sun` (warm educational accent), `ink` (neutrals), and status colours `leaf` (success), `amber` (warning) and `rose` (error). The ocean → aqua gradient is used sparingly: today's lesson, the live stage and the logo.
- **Type**: Plus Jakarta Sans for headings, Inter for body text, Noto Sans Devanagari for Hindi and Ho.
- **Motion**: Framer Motion, 150–300 ms ease-out transitions, and the device's reduce-motion setting is respected.
- **Connectivity states**: 🟢 Online · 🟡 Syncing · 🔵 Offline ready · 🔴 Sync required. Offline is presented as a normal mode, not an error.

## Accessibility

- Touch targets are at least 44 px, and important classroom controls are larger.
- Everything works with a keyboard: a skip link, focus rings, arrow keys in tabs, the lesson player and flashcards, and the Space bar to talk on the Live screen.
- Dialogs trap focus and close with Escape. Toasts and AI progress are announced to screen readers.
- Status is never shown by colour alone; each state has an icon and a label.
- Settings has a larger-text option for reading from a distance.

## Tech

React 19 · TypeScript · Vite · Tailwind CSS 3 · Framer Motion · Lucide icons · React Router 7 · vite-plugin-pwa (Workbox) · Capacitor 8

## Deployment

**Railway:** `railway.json` builds with `npm run build` and starts `server.mjs` (`npm start`) — a small dependency-free Node server that serves `dist/` with SPA fallback, gzip, and cache headers that keep app updates working. Health check: `/healthz`.

Any static host works too: `npm run build` outputs the site to `dist/`. SPA fallbacks are included for Netlify (`public/_redirects`) and Vercel (`vercel.json`).
