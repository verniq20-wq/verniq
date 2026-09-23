import { useCallback, useEffect, useRef, useState } from 'react';
import { playAudio, stopAudio } from '../services/audioService';
import type { LanguageCode } from '../types';

/** Tracks which clip (by key) is playing. Only one clip plays at a time. */
export function useAudio() {
  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const [simulated, setSimulated] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    stopAudio();
    setPlayingKey(null);
  }, []);

  const play = useCallback(
    async (key: string, text: string, lang: LanguageCode) => {
      abortRef.current?.abort();
      stopAudio();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      setPlayingKey(key);
      const res = await playAudio(text, lang, ctrl.signal);
      if (!ctrl.signal.aborted) {
        setSimulated(res.simulated);
        setPlayingKey(null);
      }
    },
    [],
  );

  useEffect(() => stop, [stop]);

  return { playingKey, play, stop, simulated };
}
