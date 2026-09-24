import { MathOperations, Plant } from '@phosphor-icons/react';
import { SUBJECT_STYLE } from '../../data/subjects';
import type { Subject } from '../../types';
import { cn } from '../../utils';

/** Rounded subject tile: a duotone icon, or a letter for language subjects. */
export function SubjectIcon({ subject, size = 'md', className }: { subject: Subject; size?: 'sm' | 'md'; className?: string }) {
  const s = SUBJECT_STYLE[subject];
  const box = size === 'sm' ? 'h-10 w-10 rounded-xl text-base' : 'h-12 w-12 rounded-2xl text-xl sm:h-14 sm:w-14 sm:text-2xl';
  const iconSize = size === 'sm' ? 22 : 28;
  return (
    <span className={cn('flex shrink-0 items-center justify-center font-display font-bold', box, s.tint, s.color, className)} aria-hidden>
      {s.glyph ??
        (subject === 'Mathematics' ? <MathOperations size={iconSize} weight="duotone" /> : <Plant size={iconSize} weight="duotone" />)}
    </span>
  );
}
