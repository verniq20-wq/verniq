import { motion } from 'framer-motion';
import { RotateCw } from 'lucide-react';
import type { Flashcard as FlashcardType, LanguageCode } from '../../types';
import { languageName } from '../../data/languages';
import { AudioButton } from '../ui/AudioButton';

interface FlashcardProps {
  card: FlashcardType;
  flipped: boolean;
  onFlip: () => void;
  targetLang: LanguageCode;
  playing: 'target' | 'hindi' | null;
  onPlay: (which: 'target' | 'hindi') => void;
  onStop: () => void;
}

/** A card that flips between picture+words and the classroom prompt side. */
export function Flashcard({ card, flipped, onFlip, targetLang, playing, onPlay, onStop }: FlashcardProps) {
  const lang = languageName(targetLang);
  return (
    <div className="relative h-[380px] w-full [perspective:1200px] sm:h-[420px]">
      <motion.div
        className="relative h-full w-full [transform-style:preserve-3d]"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
      >
        {/* Front */}
        <div
          role="button"
          tabIndex={0}
          aria-label={`${card.english}. Hindi ${card.hindi}. ${lang} ${card.target}. Press Enter to flip.`}
          onClick={onFlip}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onFlip();
            }
          }}
          className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center rounded-[28px] border border-ink-200 bg-white p-6 shadow-lift [backface-visibility:hidden] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ocean-200"
        >
          <span className="text-[96px] leading-none sm:text-[112px]" aria-hidden>
            {card.emoji}
          </span>
          <p className="mt-6 font-display text-3xl font-extrabold uppercase tracking-wide text-ink-900">{card.english}</p>
          <p lang="hi" className="mt-1 text-2xl text-ink-600">
            {card.hindi}
          </p>
          <p className="mt-1 text-2xl font-bold text-ocean-600">{card.target}</p>
          <div className="mt-5 flex gap-2">
            <AudioButton label={`Listen · ${lang}`} variant="compact" playing={playing === 'target'} onPlay={() => onPlay('target')} onStop={onStop} />
            <AudioButton label="हिन्दी" variant="compact" playing={playing === 'hindi'} onPlay={() => onPlay('hindi')} onStop={onStop} />
          </div>
          <span className="absolute right-4 top-4 inline-flex items-center gap-1 text-xs font-semibold text-ink-400">
            <RotateCw className="h-3.5 w-3.5" aria-hidden /> Tap to flip
          </span>
        </div>

        {/* Back */}
        <div
          aria-hidden={!flipped}
          onClick={onFlip}
          className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center rounded-[28px] bg-ocean-gradient p-8 text-center text-white shadow-lift [backface-visibility:hidden] [transform:rotateY(180deg)]"
        >
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-aqua-100">Ask the class</p>
          <p lang="hi" className="mt-4 font-display text-3xl font-bold leading-snug">
            यह क्या है?
          </p>
          <p className="mt-2 text-xl text-ocean-100">What is this? · {lang}</p>
          <div className="mt-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-white/15 text-5xl" aria-hidden>
            {card.emoji}
          </div>
          <p className="mt-6 text-sm text-ocean-100">Let children answer in {lang} first, then Hindi.</p>
        </div>
      </motion.div>
    </div>
  );
}
