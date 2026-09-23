import { Square, Volume2 } from 'lucide-react';
import { cn } from '../../utils';

interface AudioButtonProps {
  playing: boolean;
  onPlay: () => void;
  onStop: () => void;
  label: string;
  variant?: 'solid' | 'soft' | 'compact';
  className?: string;
}

/** Play / stop control with an animated equaliser while playing. */
export function AudioButton({ playing, onPlay, onStop, label, variant = 'soft', className }: AudioButtonProps) {
  const styles = {
    solid: 'min-h-[48px] px-5 bg-aqua-600 text-white hover:bg-aqua-500 shadow-soft',
    soft: 'min-h-[44px] px-4 bg-aqua-50 text-aqua-700 hover:bg-aqua-100',
    compact: 'min-h-[36px] px-3 text-sm bg-aqua-50 text-aqua-700 hover:bg-aqua-100',
  };
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        if (playing) onStop();
        else onPlay();
      }}
      aria-pressed={playing}
      className={cn(
        'inline-flex items-center gap-2 rounded-xl font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aqua-500 focus-visible:ring-offset-2',
        styles[variant],
        className,
      )}
    >
      {playing ? (
        <>
          <span aria-hidden className="flex h-4 items-end gap-[2px]">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className="w-[3px] animate-wave rounded-full bg-current" style={{ height: '100%', animationDelay: `${i * 120}ms` }} />
            ))}
          </span>
          <span>Playing</span>
          <Square className="h-3.5 w-3.5 fill-current" aria-hidden />
          <span className="sr-only">— stop {label}</span>
        </>
      ) : (
        <>
          <Volume2 className="h-4 w-4" aria-hidden />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}
