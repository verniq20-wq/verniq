import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { cn } from '../../utils';

const icons = {
  success: <CheckCircle2 className="h-5 w-5 text-leaf-500" aria-hidden />,
  info: <Info className="h-5 w-5 text-ocean-500" aria-hidden />,
  warning: <AlertTriangle className="h-5 w-5 text-amber-500" aria-hidden />,
  error: <XCircle className="h-5 w-5 text-rose-500" aria-hidden />,
};

export function Toaster() {
  const { toasts, dismissToast } = useApp();
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex flex-col items-center gap-2 px-4 lg:bottom-6 lg:items-end lg:px-6"
    >
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            role="status"
            className={cn('pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border border-ink-200 bg-white p-4 shadow-lift')}
          >
            {icons[t.tone]}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink-900">{t.title}</p>
              {t.detail && <p className="mt-0.5 text-sm text-ink-500">{t.detail}</p>}
            </div>
            <button
              type="button"
              onClick={() => dismissToast(t.id)}
              aria-label="Dismiss notification"
              className="-m-1 rounded-lg p-1 text-ink-400 hover:bg-ink-100 hover:text-ink-700"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
