import { motion } from 'framer-motion';
import { CloudOff, RotateCcw, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../../utils';
import { Button } from './Button';

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex flex-col items-center rounded-2xl border border-dashed border-ink-200 bg-white px-5 py-10 text-center sm:px-6 sm:py-12', className)}
    >
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-ocean-soft text-ocean-600 ring-1 ring-inset ring-ocean-100" aria-hidden>
        <Icon className="h-7 w-7" strokeWidth={1.75} />
      </span>
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="mt-1.5 max-w-sm text-[15px] text-ink-500">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </motion.div>
  );
}

export function ErrorState({
  title = 'Something went wrong.',
  description = 'Your saved lessons are still available offline.',
  onRetry,
  onContinueOffline,
  className,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  onContinueOffline?: () => void;
  className?: string;
}) {
  return (
    <div role="alert" className={cn('flex flex-col items-center rounded-2xl border border-rose-100 bg-rose-50/60 px-6 py-10 text-center', className)}>
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-rose-500 shadow-soft" aria-hidden>
        <CloudOff className="h-7 w-7" />
      </span>
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="mt-1.5 max-w-sm text-[15px] text-ink-600">{description}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {onRetry && (
          <Button onClick={onRetry} icon={<RotateCcw className="h-4 w-4" />}>
            Try again
          </Button>
        )}
        {onContinueOffline && (
          <Button variant="outline" onClick={onContinueOffline}>
            Continue offline
          </Button>
        )}
      </div>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn('animate-pulse rounded-xl bg-ink-100', className)} />;
}

export function PageHeader({
  title,
  description,
  eyebrow,
  action,
}: {
  title: string;
  description?: string;
  eyebrow?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <header className="mb-5 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
      <div>
        {eyebrow && <div className="eyebrow mb-2">{eyebrow}</div>}
        <h1 className="text-2xl font-extrabold leading-tight tracking-tight sm:text-[32px]">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-[15px] text-ink-500 sm:mt-1.5 sm:text-base">{description}</p>}
      </div>
      {action && <div className="flex shrink-0 flex-wrap gap-3">{action}</div>}
    </header>
  );
}
