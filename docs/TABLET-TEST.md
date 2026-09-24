# Tablet test checklist

Run this on the target device class from SIH26042: a low-end Android tablet (2 GB RAM, Android 9 or later). Write down the result of each step (pass / fail / time taken).

## 1. Install
1. On the tablet, open the repository's **Releases → android-latest** and download `verniq.apk`.
2. Allow "Install unknown apps" for the browser when asked, and install.
3. Open Verniq. The splash screen should show, then the welcome screen within a few seconds.

## 2. First sync (with internet)
4. Create an account (or sign in). Complete setup: school, Class 1, Hindi → Ho, paste 5 student names.
5. Open every screen once from the menu: Home, Lessons, Live, Class, AI Studio, Materials, Progress, Words, Settings.
6. Settings → Offline & sync should say the device is online and nothing is waiting.

## 3. Offline (turn on airplane mode)
7. Close and reopen the app. It must open straight to Home.
8. AI Studio: create a lesson "Counting objects". Time from tapping *Create lesson* to the lesson appearing: ____ s.
9. Lesson player: go through all 5 steps; tap *Read aloud*; record results for 3 students.
10. Class → Attendance: mark everyone present, one absent.
11. Materials: generate a worksheet, save it, tap **PDF** — the share sheet should open with the PDF. Make flashcards and flip a card.
12. Words: search "dog", record the Ho word, save. Play it back from a flashcard.
13. Live: type a Hindi sentence and translate. Note the "ready in" time: ____ s (target ≤ 3 s).

## 4. Voice
14. Android Settings → System → Languages → Speech (or Google app → Settings → Voice → Offline speech recognition): download **Hindi**.
15. Still in airplane mode, Live → tap the microphone, say "एक कुत्ता पानी पीता है", tap again. Note the time from finishing speaking to hearing the output: ____ s.
16. Save a phrase with a Ho recording (Words → Phrasebook), then say that Hindi sentence in Live — the recording should play.

## 5. Back online
17. Turn airplane mode off. Within a minute Settings → Offline & sync should show everything synced.
18. Sign in on another device (or the website): the class, lesson, attendance, results, words and recordings should all be there.

## 6. Comfort
19. Rotate the tablet: layouts should fit in portrait and landscape with no sideways scrolling.
20. Settings → Appearance → Dark, and Larger text: check readability from 2 metres.
21. Use the app for 10 minutes: note any slowness, crashes or battery warnings.

Report failures with the step number, a screenshot, and the tablet model.
