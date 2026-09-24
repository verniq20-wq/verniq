import { forwardRef } from 'react';
import { languageName } from '../../data/languages';
import type { LanguageCode } from '../../types';
import { NumberVisual, Picture } from '../ui/Picture';
import type { FlashcardType } from './Flashcard';

/** Printable A4 sheet of cut-out cards (2 per row). Used for PDF export. */
export const FlashcardSheet = forwardRef<HTMLDivElement, { title: string; cards: FlashcardType[]; language: LanguageCode }>(function FlashcardSheet({ title, cards, language }, ref) {
  return (
    <div ref={ref} className="w-[760px] bg-white p-8">
      <h2 className="mb-4 font-display text-2xl font-extrabold text-ink-900">{title}</h2>
      <div className="grid grid-cols-2 gap-4">
        {cards.map((c) => (
          <div key={c.id} className="flex h-[250px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-ink-300 p-4 text-center">
            {c.visual.type === 'picture' ? (
              <Picture picture={c.visual.picture} size={96} />
            ) : c.visual.type === 'number' ? (
              <NumberVisual value={c.visual.value} size="sm" />
            ) : (
              <span lang="hi" className="font-display text-7xl font-extrabold text-ocean-600">
                {c.visual.letter}
              </span>
            )}
            <p className="mt-3 font-display text-xl font-extrabold text-ink-900">{c.english}</p>
            <p lang="hi" className="text-lg text-ink-600">
              {c.hindi}
            </p>
            <p className="text-lg font-bold text-ocean-600">{c.target || ' '}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-right text-[11px] text-ink-400">Hindi + {languageName(language)} · Made with Verniq</p>
    </div>
  );
});
