import { AnimatePresence, motion } from 'framer-motion';
import { Bell, BookOpen, CheckCircle2, Mic, RefreshCw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useApp } from '../../store/AppContext';
import type { NotificationItem } from '../../types';
import { cn, timeAgo } from '../../utils';
import { IconButton } from '../ui/Button';

const KIND_ICON: Record<NotificationItem['kind'], { icon: typeof Bell; cls: string }> = {
  success: { icon: CheckCircle2, cls: 'bg-leaf-50 text-leaf-600' },
  sync: { icon: RefreshCw, cls: 'bg-ocean-50 text-ocean-600' },
  voice: { icon: Mic, cls: 'bg-aqua-50 text-aqua-600' },
  lesson: { icon: BookOpen, cls: 'bg-sun-50 text-sun-600' },
};

export function NotificationPanel() {
  const { notifications, unreadCount, markAllRead } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
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
      <IconButton label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`} onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <Bell className="h-[22px] w-[22px]" />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-sun-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount}
          </span>
        )}
      </IconButton>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            className="absolute right-0 top-12 z-40 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-ink-200 bg-surface shadow-lift"
          >
            <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
              <h2 className="text-base font-bold">Notifications</h2>
              {unreadCount > 0 && (
                <button type="button" onClick={markAllRead} className="rounded-lg px-2 py-1 text-sm font-semibold text-ocean-600 hover:bg-ocean-50">
                  Mark all read
                </button>
              )}
            </div>
            <ul className="max-h-[60vh] divide-y divide-ink-100 overflow-y-auto">
              {notifications.map((n) => {
                const { icon: Icon, cls } = KIND_ICON[n.kind];
                return (
                  <li key={n.id} className={cn('flex gap-3 px-5 py-4', !n.read && 'bg-ocean-50/40')}>
                    <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', cls)}>
                      <Icon className="h-[18px] w-[18px]" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-ink-900">{n.title}</p>
                      {n.detail && <p className="text-sm text-ink-500">{n.detail}</p>}
                      <p className="mt-1 text-xs text-ink-400">{timeAgo(n.at)}</p>
                    </div>
                    {!n.read && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-ocean-500" aria-label="Unread" />}
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
