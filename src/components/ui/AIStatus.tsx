import { AnimatePresence, motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '../../utils';

interface Stage {
  id: string;
  label: string;
  icon?: string;
}

interface AIStatusProps {
  stages: readonly Stage[];
  /** index of the stage currently running; stages.length means done */
  current: number;
  doneLabel?: string;
  className?: string;
}

/** Contextual AI progress — replaces a generic "Loading…". */
export function AIStatus({ stages, current, doneLabel = 'Ready', className }: AIStatusProps) {
  const done = current >= stages.length;
  return (
    <div className={cn('rounded-2xl border border-ocean-100 bg-ocean-soft p-5 sm:p-6', className)} role="status" aria-live="polite">
      <ol className="space-y-3">
        {stages.map((s, i) => {
          const state = i < current ? 'done' : i === current ? 'active' : 'pending';
          return (
            <motion.li
              key={s.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: state === 'pending' ? 0.45 : 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.25 }}
              className="flex items-center gap-3"
            >
              <span
                className={cn(
                  'relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm transition-colors duration-300',
                  state === 'done' && 'bg-aqua-500 text-white',
                  state === 'active' && 'bg-white text-ocean-600 shadow-soft',
                  state === 'pending' && 'bg-white/70 text-ink-400',
                )}
              >
                {state === 'done' ? <Check className="h-4 w-4" aria-hidden /> : <span aria-hidden>{s.icon ?? i + 1}</span>}
                {state === 'active' && <span className="absolute inset-0 animate-ring rounded-full border-2 border-ocean-400" aria-hidden />}
              </span>
              <span className={cn('text-[15px]', state === 'active' ? 'font-semibold text-ink-900' : 'text-ink-600')}>
                {s.label}
                {state === 'active' && <span className="text-ink-400">…</span>}
                {state === 'done' && <span className="sr-only"> — done</span>}
              </span>
            </motion.li>
          );
        })}
      </ol>
      <AnimatePresence>
        {done && (
          <motion.p
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-leaf-500 px-3 py-1.5 text-sm font-semibold text-white"
          >
            <Check className="h-4 w-4" aria-hidden /> {doneLabel}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
