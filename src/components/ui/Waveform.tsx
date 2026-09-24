import { cn } from '../../utils';

interface WaveformProps {
  active: boolean;
  bars?: number;
  className?: string;
  tone?: 'ocean' | 'aqua' | 'white';
}

const toneClass = { ocean: 'bg-ocean-500', aqua: 'bg-aqua-500', white: 'bg-surface' };

/** Decorative audio waveform. Hidden from assistive tech. */
export function Waveform({ active, bars = 24, className, tone = 'aqua' }: WaveformProps) {
  return (
    <div aria-hidden className={cn('flex h-12 items-center justify-center gap-[3px]', className)}>
      {Array.from({ length: bars }).map((_, i) => {
        const mid = Math.abs(i - bars / 2) / (bars / 2);
        const h = 20 + (1 - mid) * 80;
        return (
          <span
            key={i}
            className={cn('w-[3px] origin-center rounded-full transition-opacity duration-300', toneClass[tone], active ? 'animate-wave opacity-100' : 'opacity-30')}
            style={{
              height: `${h}%`,
              transform: active ? undefined : 'scaleY(0.15)',
              animationDelay: `${(i % 7) * 90}ms`,
              animationDuration: `${800 + (i % 5) * 140}ms`,
            }}
          />
        );
      })}
    </div>
  );
}
