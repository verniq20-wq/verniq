import { motion } from 'framer-motion';
import { Loader2, Mic, Square, Volume2 } from 'lucide-react';
import type { VoicePhase } from '../../types';
import { cn } from '../../utils';

interface MicButtonProps {
  phase: VoicePhase;
  onStart: () => void;
  onStop: () => void;
  level: number;
}

/** Large central microphone with a pulsing ring while listening. */
export function MicButton({ phase, onStart, onStop, level }: MicButtonProps) {
  const listening = phase === 'listening';
  const busy = phase === 'understanding' || phase === 'translating';
  const speaking = phase === 'speaking';

  const label = listening ? 'Stop and translate' : busy ? 'Translating' : speaking ? 'Playing translation' : 'Start speaking';

  return (
    <div className="relative flex items-center justify-center">
      {listening && (
        <>
          <span aria-hidden className="absolute h-28 w-28 animate-ring rounded-full border-2 border-aqua-300" />
          <span aria-hidden className="absolute h-28 w-28 animate-ring rounded-full border-2 border-aqua-300 [animation-delay:0.6s]" />
          <motion.span
            aria-hidden
            className="absolute h-28 w-28 rounded-full bg-aqua-400/25"
            animate={{ scale: 1 + level * 0.35 }}
            transition={{ duration: 0.12 }}
          />
        </>
      )}
      <motion.button
        type="button"
        whileTap={{ scale: 0.95 }}
        onClick={listening ? onStop : onStart}
        disabled={busy || speaking}
        aria-label={label}
        aria-pressed={listening}
        className={cn(
          'relative flex h-28 w-28 items-center justify-center rounded-full text-white transition-[background-color,box-shadow] duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/70 focus-visible:ring-offset-4 focus-visible:ring-offset-ocean-800',
          listening ? 'bg-aqua-500 shadow-glow' : 'bg-white/15 ring-1 ring-inset ring-white/30 hover:bg-white/25',
          (busy || speaking) && 'cursor-default',
        )}
      >
        {listening ? (
          <Square className="h-9 w-9 fill-current" aria-hidden />
        ) : busy ? (
          <Loader2 className="h-10 w-10 animate-spin" aria-hidden />
        ) : speaking ? (
          <Volume2 className="h-10 w-10" aria-hidden />
        ) : (
          <Mic className="h-11 w-11" aria-hidden />
        )}
      </motion.button>
    </div>
  );
}
