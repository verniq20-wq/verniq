import { DEMO_PHRASES } from '../data/demo';
import type { LanguageCode, TranslationDirection, TranslationTurn, VoicePhase } from '../types';
import { sleep, uid } from '../utils';
import { DEMO_LATENCY_MS } from './config';

/** Translate a piece of text. Demo: looks the text up in the sample phrases. */
export async function translateText(text: string, from: LanguageCode, to: LanguageCode): Promise<string> {
  await sleep(DEMO_LATENCY_MS);
  const hit = DEMO_PHRASES.find((p) => p.sourceText === text);
  if (hit) return hit.translatedText;
  return `[${to.toUpperCase()} · demo] ${text} (${from}→${to})`;
}

export interface VoiceSessionCallbacks {
  onPhase: (phase: VoicePhase) => void;
  onPartialTranscript: (text: string) => void;
  onTurn: (turn: TranslationTurn) => void;
  onLevel?: (level: number) => void;
}

export interface VoiceSession {
  /** Stop listening and process what was heard. */
  stop: () => void;
  /** Cancel immediately, discarding the current utterance. */
  cancel: () => void;
}

let demoIndex = 0;

/**
 * Start a push-to-talk voice session.
 *
 * Demo: no microphone audio is recorded or sent anywhere. The session
 * replays sample classroom phrases so the full interaction can be tried.
 */
export function startVoiceSession(
  direction: TranslationDirection,
  pair: { teacher: LanguageCode; student: LanguageCode },
  cb: VoiceSessionCallbacks,
): VoiceSession {
  const controller = new AbortController();
  const pool = DEMO_PHRASES.filter((p) => p.direction === direction);
  const phrase = pool[demoIndex++ % pool.length];
  const words = phrase.sourceText.split(' ');
  let stopped = false;

  const run = async () => {
    try {
      cb.onPhase('listening');
      for (let i = 1; i <= words.length && !stopped; i++) {
        await sleep(380, controller.signal);
        cb.onPartialTranscript(words.slice(0, i).join(' '));
      }
      // Wait for the user to release / tap stop, or auto-stop after a pause.
      const started = Date.now();
      while (!stopped && Date.now() - started < 1200) {
        await sleep(100, controller.signal);
      }
      cb.onPartialTranscript(phrase.sourceText);
      cb.onPhase('understanding');
      await sleep(550, controller.signal);
      cb.onPhase('translating');
      await sleep(700, controller.signal);
      const [sourceLang, targetLang] =
        direction === 'teacher-to-student' ? [pair.teacher, pair.student] : [pair.student, pair.teacher];
      cb.onTurn({ id: uid('turn'), direction, sourceText: phrase.sourceText, translatedText: phrase.translatedText, sourceLang, targetLang, at: Date.now() });
      cb.onPhase('speaking');
      await sleep(1800, controller.signal);
      cb.onPhase('idle');
    } catch {
      cb.onPhase('idle');
    }
  };

  const levelTimer = setInterval(() => cb.onLevel?.(0.3 + Math.random() * 0.7), 120);
  controller.signal.addEventListener('abort', () => clearInterval(levelTimer));
  void run().finally(() => clearInterval(levelTimer));

  return {
    stop: () => {
      stopped = true;
    },
    cancel: () => controller.abort(),
  };
}
