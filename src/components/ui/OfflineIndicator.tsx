import { AnimatePresence, motion } from 'framer-motion';
import { Check, RefreshCw, AlertCircle } from 'lucide-react';
import { STATUS_META } from './statusMeta';
import { useEffect, useRef, useState } from 'react';
import { useData } from '../../store/DataContext';
import { cn, timeAgo } from '../../utils';
import { Button } from './Button';


const OFFLINE_FEATURES = ['Lessons', 'Translation', 'Voice', 'Worksheets', 'Class records'];

/** The reassuring connection card — offline is a mode, not an error. */
export function OfflinePanel({ compact }: { compact?: boolean }) {
  const { sync, syncNow } = useData();
  const { status, pending, lastSyncedAt, error, localOnly } = sync;

  if (localOnly) {
    return (
      <div className="space-y-2">
        <p className="flex items-center gap-2 font-semibold text-ink-900">
          <span className="h-2.5 w-2.5 rounded-full bg-ocean-500" aria-hidden /> Saved on this device only
        </p>
        <p className="text-sm text-ink-600">Everything works offline. Create an account in Settings to back up your classes and use them on other devices.</p>
      </div>
    );
  }

  if (status === 'syncing') {
    return (
      <div className="space-y-2">
        <p className="flex items-center gap-2 font-semibold text-ink-900">
          <RefreshCw className="h-4 w-4 animate-spin text-amber-500" aria-hidden /> Syncing Verniq…
        </p>
        <p className="text-sm text-ink-500">{pending ? `Sending ${pending} ${pending === 1 ? 'change' : 'changes'}` : 'Checking for updates from your other devices'}</p>
      </div>
    );
  }

  if (status === 'sync-required') {
    return (
      <div className="space-y-3">
        <p className="flex items-center gap-2 font-semibold text-ink-900">
          <AlertCircle className="h-4 w-4 text-rose-500" aria-hidden /> Sync required
        </p>
        <p className="text-sm text-ink-600">{error ?? 'Some changes are waiting to be backed up.'} Your work is safe on this device.</p>
        <Button size="sm" onClick={() => void syncNow()} icon={<RefreshCw className="h-4 w-4" />}>
          Try again
        </Button>
      </div>
    );
  }

  if (status === 'offline') {
    return (
      <div>
        <p className="flex items-center gap-2 font-semibold text-ink-900">
          <span className="h-2.5 w-2.5 rounded-full bg-ocean-500" aria-hidden /> Offline mode
        </p>
        <p className="mt-1 text-sm text-ink-600">
          Verniq is ready to teach without internet.{pending ? ` ${pending} ${pending === 1 ? 'change' : 'changes'} will sync when you reconnect.` : ''}
        </p>
        <ul className={cn('mt-3 grid gap-1.5', compact ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3')}>
          {OFFLINE_FEATURES.map((f) => (
            <li key={f} className="flex items-center gap-1.5 text-sm text-ink-700">
              <Check className="h-4 w-4 text-aqua-600" aria-hidden /> {f}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div>
      <p className="flex items-center gap-2 font-semibold text-ink-900">
        <span className="h-2.5 w-2.5 rounded-full bg-leaf-500" aria-hidden /> Online · backed up
      </p>
      <p className="mt-1 text-sm text-ink-500">
        {lastSyncedAt ? `Last synced ${timeAgo(lastSyncedAt).toLowerCase()}.` : 'Not synced yet.'} Everything you save also works offline.
      </p>
      <Button size="sm" variant="outline" className="mt-3" onClick={() => void syncNow()} icon={<RefreshCw className="h-4 w-4" />}>
        Sync now
      </Button>
    </div>
  );
}

/** Pill in the top bar; opens a small panel with details. */
export function OfflineIndicator() {
  const { sync } = useData();
  const connectivity = { status: sync.localOnly ? ('offline' as const) : sync.status };
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const meta = STATUS_META[connectivity.status];
  const Icon = meta.icon;

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={`Connection: ${meta.label}. Show details`}
        className={cn(
          'inline-flex min-h-[40px] items-center gap-2 rounded-full px-3 text-sm font-semibold ring-1 ring-inset transition-colors',
          meta.pill,
        )}
      >
        <span className="relative flex h-2.5 w-2.5">
          {connectivity.status === 'syncing' && <span className={cn('absolute inset-0 animate-ping rounded-full opacity-60', meta.dot)} />}
          <span className={cn('relative h-2.5 w-2.5 rounded-full', meta.dot)} />
        </span>
        <Icon className={cn('hidden h-4 w-4 sm:block', connectivity.status === 'syncing' && 'animate-spin')} aria-hidden />
        <span className="hidden sm:inline">{meta.label}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            className="absolute right-0 top-12 z-40 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-ink-200 bg-surface p-5 shadow-lift"
          >
            <OfflinePanel compact />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
