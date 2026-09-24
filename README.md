# VERNIQ

**Learning in the language they understand.**

Verniq helps primary-school teachers teach children in their mother tongue. It plans curriculum-aligned lessons, translates between Hindi and the children's home language (starting with Ho), makes bilingual worksheets and picture flashcards, and keeps attendance and learning records — on a low-cost Android tablet, with or without internet.

| | How teachers get it | Offline |
| --- | --- | --- |
| **Web app** | Open the website | After the first visit |
| **Installable app (PWA)** | Open the website → "Install Verniq" (Chrome/Edge/Android) or Share → "Add to Home Screen" (iPhone/iPad) | Yes |
| **Android app** | Install `verniq.apk`, or publish `verniq-release.aab` on Google Play | Yes |

## What teachers can do

| Route | Screen | What it does |
| --- | --- | --- |
| — | Welcome & setup | Create an account (or use without one), then add the school, class, languages and students |
| `/` | Home | Today's lesson, quick actions, attendance today, class snapshot |
| `/studio` | AI Lesson Studio | Pick class, subject and topic → a five-part lesson matched to a curriculum outcome, with home-language key words. Rewrite any part |
| `/lessons` | Lessons | All lessons for the class; plan for today; edit; teach |
| `/lessons/:id/edit` | Lesson editor | Change topic, outcome, every script, step, time and material |
| `/lessons/:id/play` | Lesson player | Classroom mode, step by step, read-aloud; at the end, record each child's result |
| `/live` | Verniq Live | Speak or type; Verniq translates using the phrasebook and word list and speaks the result. Save corrections as phrases |
| `/class` | Class | Students (add, paste a list, edit, archive), one-tap attendance, results per outcome, class settings, more classes |
| `/materials` | Materials | Worksheets and flashcards from a lesson — edit, save, export a real PDF, print |
| `/progress` | Progress | Outcome mastery, attendance, who needs attention and why, CSV export |
| `/words` | Words | The home-language word list and phrasebook: add, correct, verify, record pronunciation |
| `/settings` | Settings | Profile, account, backup, sync, install, accessibility |

## How the "AI" works

Verniq's intelligence is built in (`engine/`) and runs on the device, so it works offline and never sends data to an outside AI service. It is deliberately explainable and never invents home-language words.

- **Curriculum library** (`curriculum.ts`): learning outcomes for Classes 1–5 in Mathematics, Hindi, English and EVS, each with topics, keywords and activity types. Foundational outcomes are mapped to the NIPUN Bharat Lakshya (Classes 1–3 literacy and numeracy targets), shown on lessons, worksheets and progress.
- **Lesson composer** (`composer.ts`): matches the topic to the best outcome (keywords + class), picks the vocabulary, and fills a bank of classroom activities (`activities.ts`) — introduction, explanation, activity, practice, assessment — with the topic, words and objects. "Try another idea" swaps in a different activity.
- **Translator** (`translator.ts`): 1) exact match in the teacher's phrasebook, 2) a very similar saved sentence, flagging the words that differ, 3) word-by-word from the word list, keeping unknown words as spoken and showing how many words were known. Corrections become phrases and are used word-for-word next time.
- **Materials** (`materials.ts`): worksheet questions (count, match, fill the sequence, circle, write, sort, true/false) and flashcards are generated from the lesson's words, so every answer is correct by construction.
- **Insights** (`insights.ts`): simple, stated rules on attendance and results (e.g. attendance under 75%, "not yet" on an outcome, fewer than 60% secure → plan revision).

**Home-language words.** The starter Ho list (`glossary.ts`) is marked *not checked* until a speaker confirms it. Teachers add and correct words in *Words*; their version replaces the starter word everywhere. Other languages start empty and are built up by the teacher.

**Recordings.** Speech synthesis does not exist for Ho, Mundari or Santali, so tribal-language audio is hand-recorded: teachers (or community speakers) record words in *Words*, sentences in the phrasebook, and the home-language version of any lesson line from the lesson itself. Recordings sync with the account and play offline.

**Sharing words.** *Words → Export CSV* writes the word list and phrasebook as a Hindi ↔ home-language parallel corpus; *Import* reads that file or any sheet with `hindi, english, <language>` columns — so lists collected with native speakers can move between teachers.

**Voice.** Speech recognition and text-to-speech use the device (browser Web Speech API; Android system engines through Capacitor plugins). Hindi and English are supported by those engines. There is no engine for tribal languages yet, so Verniq plays the teacher's own recording of a phrase when there is one, otherwise it reads the Devanagari with a Hindi voice and says so.

## Data, accounts and sync

- Everything is saved on the device first (IndexedDB), so the app is fully usable offline.
- With an account, changes are queued and sent to the server in batches; the server copy is pulled on start and on reconnect. Conflicts are resolved per record by the latest change. Queued changes are never lost when pulling.
- "Use without an account" keeps everything on the device; creating an account later (Settings) uploads it all.
- Settings → *Download backup* exports everything as JSON.

The server (`server/`) is a small Node app (Hono) that also serves the web app:

| Endpoint | |
| --- | --- |
| `POST /api/auth/signup`, `POST /api/auth/login` | Accounts (scrypt password hashes, signed 60-day tokens, rate-limited) |
| `GET/PATCH /api/me` | Teacher profile |
| `GET /api/bootstrap` | All of the teacher's records |
| `POST /api/sync` | Batched upserts/deletes with validation and ownership checks |
| `GET /healthz` | Health check |

It uses Postgres when `DATABASE_URL` is set and an embedded database (PGlite) otherwise. See `.env.example`.

## Getting started

```bash
npm install
npm run dev:server   # API + built app on http://localhost:3000 (embedded database)
npm run dev          # app with hot reload on http://localhost:5173 (proxies /api to :3000)
npm run build        # type-check, build the app into dist/ and the server into server/dist/
npm start            # run the production server
npm run typecheck
npm run lint
```

Requires Node 20+.

## Android app

The `android/` folder is a Capacitor project that packages the web build.

```bash
npm run android:sync   # build the web app and copy it into android/
npm run android:open   # open in Android Studio
npm run android:apk    # debug APK → android/app/build/outputs/apk/debug/app-debug.apk
```

Every push to `main` runs the **Android** GitHub Action. It builds the app against the live server and publishes to the **android-latest** release:

- `verniq.apk` — installable on any Android device.
- `verniq-release.aab` and `verniq-release.apk` — signed builds for Google Play (only when the signing secrets below are set). The version code is the build number.

### Play Store release

1. Create an upload key once (keep the file and passwords safe — Play needs the same key for every update):

   ```bash
   keytool -genkeypair -v -keystore verniq-upload.jks -alias verniq -keyalg RSA -keysize 2048 -validity 10000
   base64 -w0 verniq-upload.jks > verniq-upload.b64   # macOS: base64 -i verniq-upload.jks -o verniq-upload.b64
   ```

2. In GitHub → repository **Settings → Secrets and variables → Actions**, add:
   `VERNIQ_KEYSTORE_BASE64` (contents of `verniq-upload.b64`), `VERNIQ_KEYSTORE_PASSWORD`, `VERNIQ_KEY_ALIAS` (`verniq`), `VERNIQ_KEY_PASSWORD`.
3. Push to `main` (or run the workflow manually) and upload `verniq-release.aab` in the Play Console. Enable Play App Signing when asked.

The app asks for the microphone only (speech and recordings). App ID `app.verniq.teacher` · Android 7.0+ (API 24) · target API 36.

## Deployment (Railway)

`railway.json` builds with `npm run build` and starts `npm start`; health check `/healthz`. Add a **Postgres** database to the project and give the Verniq service:

- `DATABASE_URL` — a reference to the Postgres service's `DATABASE_URL`

The token-signing secret is created once and stored in the database automatically. To manage it yourself, set `AUTH_SECRET` (32+ random characters; changing it signs everyone out).

## Project structure

```text
engine/     Verniq engine: curriculum, glossary, translator, lesson composer, materials, insights
shared/     Record types and validation shared by app and server
server/     API server + static hosting (Hono, Postgres/PGlite)
src/
├── pages/         One file per screen
├── components/    ui/ (design system), layout/, lesson/, class/, worksheet/, flashcards/, words/, live/, dashboard/
├── store/         DataContext (records, account, sync) · AppContext (toasts, notifications, preferences)
├── data/          API client, IndexedDB store, languages
├── platform/      PWA, Android, voice, PDF export
├── hooks/         useClassroom, useAudio, useShell
└── utils/
android/    Capacitor Android project
```

## Design and accessibility

- Colours: `ocean` (primary), `aqua` (secondary), `sun` (accent), `ink` (neutrals), `leaf` / `amber` / `rose` for status. Lucide interface icons, Phosphor duotone illustrations, no emoji. Plus Jakarta Sans, Inter and Noto Sans Devanagari are bundled for offline use.
- Light and dark themes (Settings → Appearance: Light, Dark or follow the device). All colours are CSS variables in `src/theme.css`; worksheets, flashcard sheets and PDFs always render on white.
- Phone-first layout with a bottom bar; icon rail on tablets; full sidebar on desktop.
- Touch targets of 44 px or more, full keyboard support, focus-trapped dialogs, screen-reader announcements, status never by colour alone, larger-text option, reduced motion respected.

## Tech

React 19 · TypeScript · Vite · Tailwind CSS 3 · Framer Motion · React Router 7 · IndexedDB (idb) · vite-plugin-pwa · Capacitor 8 · Hono · Postgres / PGlite · zod · jsPDF
