import { useCallback, useEffect, useRef, useState } from 'react';
import { speak, stopSpeaking, type SpeakResult } from '../platform/voice';
import type { LanguageCode } from '../types';

/** Tracks which clip (by key) is playing. Only one clip plays at a time. */
export function useAudio() {
  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const [lastVia, setLastVia] = useState<SpeakResult['via'] | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    void stopSpeaking();
    setPlayingKey(null);
  }, []);

  const play = useCallback(async (key: string, text: string, lang: LanguageCode, audio?: string) => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setPlayingKey(key);
    const res = await speak(text, lang, { audio, signal: ctrl.signal });
    if (!ctrl.signal.aborted) {
      setLastVia(res.via);
      setPlayingKey(null);
    }
    return res;
  }, []);

  useEffect(() => stop, [stop]);

  return { playingKey, play, stop, lastVia };
}
