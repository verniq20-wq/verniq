# VERNIQ

**Learning in the language they understand.**

Verniq helps primary-school teachers teach children in their mother tongue. It combines curriculum-aligned AI lessons, Hindi ↔ tribal-language translation, real-time voice translation, bilingual worksheets, picture flashcards, audio and offline-first teaching in one calm, tablet-friendly interface.

This repository contains the web frontend.

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

React 19 · TypeScript · Vite · Tailwind CSS 3 · Framer Motion · Lucide icons · React Router 7

## Deployment

`npm run build` outputs a static site to `dist/`. Single-page-app fallbacks are included for Netlify (`public/_redirects`) and Vercel (`vercel.json`).
