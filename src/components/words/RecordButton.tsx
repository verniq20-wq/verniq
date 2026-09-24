import { Mic, Play, Square, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { record, speak, stopSpeaking, type Recording } from '../../platform/voice';
import { cn } from '../../utils';

interface Props {
  value?: string;
  onChange: (audio: string | undefined) => void;
  label?: string;
}

/** Record up to 20 seconds of pronunciation, play it back, or remove it. */
export function RecordButton({ value, onChange, label = 'Record pronunciation' }: Props) {
  const [rec, setRec] = useState<Recording | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => () => {
    clearInterval(timer.current);
    rec?.cancel();
  }, [rec]);

  const start = async () => {
    setError(null);
    try {
      const r = await record();
      setRec(r);
      setSeconds(0);
      timer.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch (e) {
      setError(e instanceof Error && /denied|allowed/i.test(e.message) ? 'Microphone permission was not given.' : e instanceof Error ? e.message : 'Could not start recording.');
    }
  };

  const stop = async () => {
    if (!rec) return;
    clearInterval(timer.current);
    const audio = await rec.stop();
    setRec(null);
    if (audio.length > 700_000) {
      setError('That clip is too long. Keep it under about 15 seconds.');
      return;
    }
    onChange(audio);
  };

  useEffect(() => {
    if (rec && seconds >= 20) void stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {rec ? (
          <button type="button" onClick={() => void stop()} className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-rose-600 px-4 font-semibold text-white">
            <Square className="h-4 w-4 fill-current" aria-hidden /> Stop · 0:{String(seconds).padStart(2, '0')}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => void start()}
            className={cn('inline-flex min-h-[44px] items-center gap-2 rounded-xl px-4 font-semibold', value ? 'bg-ink-100 text-ink-700 hover:bg-ink-200' : 'bg-ocean-50 text-ocean-700 hover:bg-ocean-100')}
          >
            <Mic className="h-4 w-4" aria-hidden /> {value ? 'Record again' : label}
          </button>
        )}
        {value && !rec && (
          <>
            <button
              type="button"
              onClick={() => void stopSpeaking().then(() => speak('', 'hi', { audio: value }))}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-aqua-50 px-4 font-semibold text-aqua-800 hover:bg-aqua-100"
            >
              <Play className="h-4 w-4 fill-current" aria-hidden /> Play
            </button>
            <button type="button" onClick={() => onChange(undefined)} aria-label="Remove recording" className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-ink-500 hover:bg-ink-100">
              <Trash2 className="h-4 w-4" aria-hidden />
            </button>
          </>
        )}
      </div>
      {error && <p className="mt-1.5 text-xs text-rose-600">{error}</p>}
    </div>
  );
}
