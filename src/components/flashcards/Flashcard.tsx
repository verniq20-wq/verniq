import { motion } from 'framer-motion';
import { RotateCw } from 'lucide-react';
import type { FlashcardContent, LanguageCode } from '../../types';

export type FlashcardType = FlashcardContent['cards'][number];
import { languageName } from '../../data/languages';
import { AudioButton } from '../ui/AudioButton';
import { NumberVisual, Picture } from '../ui/Picture';

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
    <div className="relative h-[min(400px,58svh)] min-h-[340px] w-full [perspective:1200px] sm:h-[420px]">
      <motion.div
        className="relative h-full w-full [transform-style:preserve-3d]"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
      >
        {/* Front */}
        <div
          role="button"
          tabIndex={0}
          aria-label={`${card.english}. Hindi ${card.hindi}. ${lang} ${card.target || 'word not added yet'}. Press Enter to flip.`}
          onClick={onFlip}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onFlip();
            }
          }}
          className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center rounded-[28px] border border-ink-200 bg-surface p-5 shadow-lift sm:p-6 [backface-visibility:hidden] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ocean-200"
        >
          <CardVisual card={card} />
          <p className="mt-5 font-display text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">{card.english}</p>
          <p lang="hi" className="mt-0.5 text-xl text-ink-600 sm:text-2xl">
            {card.hindi}
          </p>
          {card.target ? (
            <p className="mt-0.5 text-xl font-bold text-ocean-600 sm:text-2xl">{card.target}</p>
          ) : (
            <p className="mt-1.5 rounded-full bg-ink-100 px-3 py-1 text-xs font-semibold text-ink-500">{lang} word not added yet</p>
          )}
          <div className="mt-4 flex gap-2">
            {card.target && (
              <AudioButton label={`Listen · ${lang}`} variant="compact" playing={playing === 'target'} onPlay={() => onPlay('target')} onStop={onStop} />
            )}
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
          className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center light-scope rounded-[28px] bg-ocean-gradient p-6 text-center sm:p-8 text-white shadow-lift [backface-visibility:hidden] [transform:rotateY(180deg)]"
        >
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-aqua-100">Ask the class</p>
          <p lang="hi" className="mt-4 font-display text-3xl font-bold leading-snug">
            यह क्या है?
          </p>
          <p className="mt-2 text-xl text-ocean-100">What is this? · {lang}</p>
          <div className="mt-8 flex h-28 w-28 items-center justify-center rounded-3xl bg-surface" aria-hidden>
            {card.visual.type === 'picture' ? (
              <Picture picture={card.visual.picture} size={72} />
            ) : (
              <span className="font-display text-6xl font-extrabold text-ocean-600">{card.visual.type === 'number' ? card.visual.value : card.visual.letter}</span>
            )}
          </div>
          <p className="mt-6 text-sm text-ocean-100">Let children answer in {lang} first, then Hindi.</p>
        </div>
      </motion.div>
    </div>
  );
}

function CardVisual({ card }: { card: FlashcardType }) {
  if (card.visual.type === 'number') return <NumberVisual value={card.visual.value} />;
  if (card.visual.type === 'letter')
    return (
      <span lang="hi" className="flex h-40 w-40 items-center justify-center rounded-[28%] bg-ocean-50 font-display text-[96px] font-extrabold leading-none text-ocean-600 sm:h-44 sm:w-44">
        {card.visual.letter}
      </span>
    );
  return <Picture picture={card.visual.picture} size={112} tile className="h-40 w-40 sm:h-44 sm:w-44" label={card.english} />;
}
