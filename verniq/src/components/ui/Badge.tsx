import type { ReactNode } from 'react';
import { cn } from '../../utils';

type Tone = 'ocean' | 'aqua' | 'sun' | 'leaf' | 'amber' | 'rose' | 'ink';

const tones: Record<Tone, string> = {
  ocean: 'bg-ocean-50 text-ocean-700 ring-ocean-100',
  aqua: 'bg-aqua-50 text-aqua-700 ring-aqua-100',
  sun: 'bg-sun-50 text-sun-700 ring-sun-100',
  leaf: 'bg-leaf-50 text-leaf-700 ring-leaf-100',
  amber: 'bg-amber-50 text-amber-700 ring-amber-100',
  rose: 'bg-rose-50 text-rose-700 ring-rose-100',
  ink: 'bg-ink-100 text-ink-600 ring-ink-200',
};

export function Badge({ tone = 'ocean', icon, children, className }: { tone?: Tone; icon?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset', tones[tone], className)}>
      {icon}
      {children}
    </span>
  );
}
