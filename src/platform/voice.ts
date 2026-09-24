/**
 * Voice: speech-to-text, text-to-speech and recording, on the web and in the
 * Android app. Hindi and English use the device's speech engines. There is no
 * speech engine for tribal languages yet, so for those Verniq plays audio the
 * teacher recorded, or reads the Devanagari text with a Hindi voice.
 */
import { isNative } from '.';
import type { LanguageCode } from '../types';

const BCP47: Partial<Record<LanguageCode, string>> = { hi: 'hi-IN', en: 'en-IN' };

// ─── Speech recognition ───────────────────────────────────────
interface WebRecognition {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
}

function webRecognitionCtor(): (new () => WebRecognition) | null {
  const w = window as unknown as { SpeechRecognition?: new () => WebRecognition; webkitSpeechRecognition?: new () => WebRecognition };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export async function canRecognize(lang: LanguageCode): Promise<boolean> {
  if (!BCP47[lang]) return false;
  if (isNative) {
    try {
      const { SpeechRecognition } = await import('@capacitor-community/speech-recognition');
      return (await SpeechRecognition.available()).available;
    } catch {
      return false;
    }
  }
  return !!webRecognitionCtor();
}

export interface Listening {
  /** Stop and deliver the final transcript */
  stop: () => void;
  cancel: () => void;
}

export interface ListenCallbacks {
  onPartial: (text: string) => void;
  onFinal: (text: string) => void;
  onError: (message: string) => void;
}

export async function listen(lang: LanguageCode, cb: ListenCallbacks): Promise<Listening> {
  const tag = BCP47[lang];
  if (!tag) throw new Error('Speech recognition is not available for this language.');

  if (isNative) {
    const { SpeechRecognition } = await import('@capacitor-community/speech-recognition');
    const perm = await SpeechRecognition.checkPermissions();
    if (perm.speechRecognition !== 'granted') {
      const req = await SpeechRecognition.requestPermissions();
      if (req.speechRecognition !== 'granted') throw new Error('Microphone permission was not given.');
    }
    let latest = '';
    let done = false;
    const handle = await SpeechRecognition.addListener('partialResults', (d: { matches: string[] }) => {
      latest = d.matches?.[0] ?? latest;
      cb.onPartial(latest);
    });
    const finish = async (deliver: boolean) => {
      if (done) return;
      done = true;
      await SpeechRecognition.stop().catch(() => undefined);
      await handle.remove();
      if (deliver) cb.onFinal(latest);
    };
    SpeechRecognition.start({ language: tag, partialResults: true, popup: false, maxResults: 1 })
      .then((r) => {
        if (r?.matches?.[0]) latest = r.matches[0];
      })
      .catch((e: unknown) => {
        if (!done) cb.onError(e instanceof Error ? e.message : 'Could not start listening.');
      });
    return { stop: () => void finish(true), cancel: () => void finish(false) };
  }

  const Ctor = webRecognitionCtor();
  if (!Ctor) throw new Error('This browser cannot recognise speech. Try Chrome, or type instead.');
  const rec = new Ctor();
  rec.lang = tag;
  rec.interimResults = true;
  rec.continuous = true;
  rec.maxAlternatives = 1;
  let finalText = '';
  let interim = '';
  let cancelled = false;
  rec.onresult = (e) => {
    interim = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const r = e.results[i];
      if (r.isFinal) finalText += `${r[0].transcript} `;
      else interim += r[0].transcript;
    }
    cb.onPartial(`${finalText}${interim}`.trim());
  };
  rec.onerror = (e) => {
    if (e.error === 'aborted' || cancelled) return;
    cb.onError(
      e.error === 'not-allowed'
        ? 'Microphone permission was not given.'
        : e.error === 'no-speech'
          ? 'No speech was heard. Try again a little closer to the device.'
          : e.error === 'network'
            ? 'This browser needs internet to recognise speech. Type instead — or use the Verniq Android app with Hindi downloaded for offline speech recognition (Android Settings → Languages → Speech).'
            : `Speech recognition stopped (${e.error}).`,
    );
  };
  rec.onend = () => {
    if (!cancelled) cb.onFinal(`${finalText}${interim}`.trim());
  };
  rec.start();
  return {
    stop: () => rec.stop(),
    cancel: () => {
      cancelled = true;
      rec.abort();
    },
  };
}

// ─── Speech synthesis ─────────────────────────────────────────
let currentAudio: HTMLAudioElement | null = null;

export async function stopSpeaking() {
  currentAudio?.pause();
  currentAudio = null;
  if (isNative) {
    const { TextToSpeech } = await import('@capacitor-community/text-to-speech');
    await TextToSpeech.stop().catch(() => undefined);
  } else {
    window.speechSynthesis?.cancel();
  }
}

export interface SpeakResult {
  /** How it was voiced */
  via: 'recording' | 'voice' | 'hindi-voice' | 'none';
}

/**
 * Speak `text`. For tribal languages a recorded clip is used when given,
 * otherwise the Devanagari text is read with a Hindi voice (approximate).
 */
export async function speak(text: string, lang: LanguageCode, opts: { audio?: string; signal?: AbortSignal } = {}): Promise<SpeakResult> {
  await stopSpeaking();
  if (opts.audio) {
    const a = new Audio(opts.audio);
    currentAudio = a;
    opts.signal?.addEventListener('abort', () => a.pause());
    await new Promise<void>((resolve) => {
      a.onended = () => resolve();
      a.onerror = () => resolve();
      a.onpause = () => resolve();
      void a.play().catch(() => resolve());
    });
    return { via: 'recording' };
  }
  const tag = BCP47[lang] ?? 'hi-IN';
  const via: SpeakResult['via'] = BCP47[lang] ? 'voice' : 'hindi-voice';
  if (!text.trim()) return { via: 'none' };

  if (isNative) {
    const { TextToSpeech } = await import('@capacitor-community/text-to-speech');
    opts.signal?.addEventListener('abort', () => void TextToSpeech.stop());
    try {
      await TextToSpeech.speak({ text, lang: tag, rate: 0.9, pitch: 1, volume: 1, category: 'playback' });
      return { via };
    } catch {
      return { via: 'none' };
    }
  }

  const synth = window.speechSynthesis;
  if (!synth) return { via: 'none' };
  const voices = synth.getVoices();
  const voice = voices.find((v) => v.lang === tag) ?? voices.find((v) => v.lang.startsWith(tag.slice(0, 2)));
  if (!voice && voices.length) return { via: 'none' };
  await new Promise<void>((resolve) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = tag;
    if (voice) u.voice = voice;
    u.rate = 0.9;
    u.onend = () => resolve();
    u.onerror = () => resolve();
    opts.signal?.addEventListener('abort', () => {
      synth.cancel();
      resolve();
    });
    synth.speak(u);
  });
  return { via };
}

// ─── Recording ────────────────────────────────────────────────
export interface Recording {
  stop: () => Promise<string>;
  cancel: () => void;
}

/** Record a short clip; resolves to a data URL. Limited to 20 seconds. */
export async function record(): Promise<Recording> {
  if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') throw new Error('Recording is not supported on this device.');
  const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
  const mime = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/ogg;codecs=opus', 'audio/webm'].find((m) => MediaRecorder.isTypeSupported(m));
  const rec = new MediaRecorder(stream, mime ? { mimeType: mime, audioBitsPerSecond: 32000 } : undefined);
  const chunks: Blob[] = [];
  rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
  rec.start();
  const release = () => stream.getTracks().forEach((t) => t.stop());
  const limit = setTimeout(() => rec.state === 'recording' && rec.stop(), 20000);
  const done = new Promise<string>((resolve, reject) => {
    rec.onstop = () => {
      clearTimeout(limit);
      release();
      const blob = new Blob(chunks, { type: rec.mimeType || 'audio/webm' });
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).replace(/^data:audio\/([a-z0-9.+-]+);codecs=([^;,]+);/i, 'data:audio/$1;codecs=$2;'));
      reader.onerror = () => reject(new Error('Could not read the recording.'));
      reader.readAsDataURL(blob);
    };
  });
  return {
    stop: () => {
      if (rec.state === 'recording') rec.stop();
      return done;
    },
    cancel: () => {
      clearTimeout(limit);
      if (rec.state === 'recording') rec.stop();
      release();
    },
  };
}
