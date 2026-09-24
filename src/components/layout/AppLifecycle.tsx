import { AnimatePresence, motion } from 'framer-motion';
import { RefreshCw, X } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { initNative } from '../../platform';
import { acknowledgeOfflineReady, applyUpdate, dismissUpdate, usePwa } from '../../platform/pwa';
import { useApp } from '../../store/AppContext';
import { Button } from '../ui/Button';

/**
 * App-level lifecycle: native back button / splash screen, the
 * "ready to work offline" message, and the "new version available" banner.
 */
export function AppLifecycle() {
  const navigate = useNavigate();
  const { toast } = useApp();
  const { needRefresh, offlineReady } = usePwa();

  useEffect(() => {
    void initNative(() => navigate(-1));
  }, [navigate]);

  useEffect(() => {
    if (!offlineReady) return;
    toast({ tone: 'success', title: 'Verniq is ready to work offline', detail: 'You can now teach without internet on this device.' });
    acknowledgeOfflineReady();
  }, [offlineReady, toast]);

  return (
    <AnimatePresence>
      {needRefresh && (
        <motion.div
          role="status"
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          className="fixed inset-x-3 top-3 z-[65] mx-auto flex max-w-lg items-center gap-3 rounded-2xl border border-ocean-100 bg-surface p-3 pl-4 shadow-lift"
        >
          <RefreshCw className="h-5 w-5 shrink-0 text-ocean-600" aria-hidden />
          <p className="min-w-0 flex-1 text-sm">
            <span className="font-semibold text-ink-900">A new version of Verniq is ready.</span>{' '}
            <span className="text-ink-500">Your saved lessons stay on this device.</span>
          </p>
          <Button size="sm" onClick={applyUpdate}>
            Update
          </Button>
          <button type="button" onClick={dismissUpdate} aria-label="Later" className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100">
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
