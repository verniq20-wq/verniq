import type { LanguageCode } from '../types';
import { sleep } from '../utils';

const BCP47: Partial<Record<LanguageCode, string>> = { hi: 'hi-IN', en: 'en-IN' };

/**
 * Speak text aloud.
 *
 * Hindi and English use the device's built-in speech voices when available.
 * Tribal-language voice packs are not connected yet, so playback for those
 * languages is simulated (timing only) until the Verniq voice model is wired in.
 */
export async function playAudio(text: string, lang: LanguageCode, signal?: AbortSignal): Promise<{ simulated: boolean }> {
  const tag = BCP47[lang];
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : undefined;
  const voice = tag && synth?.getVoices().find((v) => v.lang === tag);

  if (synth && tag && voice) {
    await new Promise<void>((resolve) => {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = tag;
      u.voice = voice;
      u.rate = 0.9;
      u.onend = () => resolve();
      u.onerror = () => resolve();
      signal?.addEventListener('abort', () => {
        synth.cancel();
        resolve();
      });
      synth.speak(u);
    });
    return { simulated: false };
  }

  const ms = Math.min(4000, 900 + text.length * 45);
  try {
    await sleep(ms, signal);
  } catch {
    /* aborted */
  }
  return { simulated: true };
}

export function stopAudio() {
  window.speechSynthesis?.cancel();
}
