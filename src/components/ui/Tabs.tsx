import { motion } from 'framer-motion';
import { useId, useRef, type ReactNode } from 'react';
import { cn } from '../../utils';

interface Tab<T extends string> {
  value: T;
  label: ReactNode;
  icon?: ReactNode;
}

interface TabsProps<T extends string> {
  tabs: Tab<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  className?: string;
  size?: 'md' | 'lg';
  /** Fill the available width with equal-width tabs */
  stretch?: boolean;
}

/** Segmented tabs with a sliding indicator and arrow-key navigation. */
export function Tabs<T extends string>({ tabs, value, onChange, label, className, size = 'md', stretch }: TabsProps<T>) {
  const group = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKey = (e: React.KeyboardEvent, i: number) => {
    let next = -1;
    if (e.key === 'ArrowRight') next = (i + 1) % tabs.length;
    if (e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = tabs.length - 1;
    if (next >= 0) {
      e.preventDefault();
      onChange(tabs[next].value);
      refs.current[next]?.focus();
    }
  };

  return (
    <div role="tablist" aria-label={label} className={cn(
        'max-w-full gap-1 overflow-x-auto rounded-2xl bg-ink-100 p-1 scrollbar-none',
        stretch ? 'grid w-full' : 'inline-flex',
        className,
      )}
      style={stretch ? { gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` } : undefined}>
      {tabs.map((t, i) => {
        const active = t.value === value;
        return (
          <button
            key={t.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            role="tab"
            type="button"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(t.value)}
            onKeyDown={(e) => onKey(e, i)}
            className={cn(
              'relative inline-flex shrink-0 items-center justify-center gap-2 rounded-xl font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-500',
              size === 'lg' ? 'min-h-[48px] px-3 text-[15px] sm:px-5' : 'min-h-[40px] px-3 text-sm sm:px-4',
              active ? 'text-ocean-700' : 'text-ink-500 hover:text-ink-800',
            )}
          >
            {active && (
              <motion.span
                layoutId={`tab-${group}`}
                className="absolute inset-0 rounded-xl bg-surface shadow-soft"
                transition={{ type: 'spring', stiffness: 500, damping: 40 }}
              />
            )}
            <span className="relative flex items-center gap-2">
              {t.icon}
              {t.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
