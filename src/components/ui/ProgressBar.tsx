import { motion } from 'framer-motion';
import { cn } from '../../utils';

interface ProgressBarProps {
  value: number; // 0..1
  label: string;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  tone?: 'ocean' | 'aqua' | 'gradient' | 'white';
  className?: string;
}

const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-3.5' };
const fills = {
  ocean: 'bg-ocean-500',
  aqua: 'bg-aqua-500',
  gradient: 'bg-ocean-gradient',
  white: 'bg-surface',
};

export function ProgressBar({ value, label, showValue, size = 'md', tone = 'gradient', className }: ProgressBarProps) {
  const v = Math.max(0, Math.min(1, value));
  return (
    <div className={className}>
      {showValue && (
        <div className="mb-1.5 flex items-center justify-between text-sm">
          <span className="font-medium text-ink-600">{label}</span>
          <span className="font-semibold tabular-nums text-ink-900">{Math.round(v * 100)}%</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(v * 100)}
        className={cn('w-full overflow-hidden rounded-full', tone === 'white' ? 'bg-white/25' : 'bg-ink-100', heights[size])}
      >
        <motion.div
          className={cn('h-full rounded-full', fills[tone])}
          initial={{ width: 0 }}
          animate={{ width: `${v * 100}%` }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}
