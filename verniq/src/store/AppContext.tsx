import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { DEMO_NOTIFICATIONS } from '../data/demo';
import * as lessonService from '../services/lessonService';
import { syncOfflineData } from '../services/syncService';
import type { ConnectivityStatus, LanguagePair, Lesson, NotificationItem, Toast } from '../types';
import { uid } from '../utils';

/** How connectivity is decided. `auto` follows the device; others are demo overrides. */
export type ConnectivityMode = 'auto' | 'offline' | 'sync-required';

interface Connectivity {
  status: ConnectivityStatus;
  mode: ConnectivityMode;
  syncProgress: number;
  syncUpdates: number;
  lastSyncedAt: number;
}

interface AppState {
  pair: LanguagePair;
  setPair: (pair: LanguagePair) => void;

  connectivity: Connectivity;
  setConnectivityMode: (mode: ConnectivityMode) => void;
  syncNow: () => Promise<void>;

  lessons: Lesson[];
  lessonsLoading: boolean;
  upsertLesson: (lesson: Lesson) => void;
  toggleOffline: (id: string) => Promise<void>;

  notifications: NotificationItem[];
  unreadCount: number;
  notify: (n: Omit<NotificationItem, 'id' | 'at' | 'read'>) => void;
  markAllRead: () => void;

  toasts: Toast[];
  toast: (t: Omit<Toast, 'id'>) => void;
  dismissToast: (id: string) => void;

  largeText: boolean;
  setLargeText: (v: boolean) => void;
}

const AppContext = createContext<AppState | null>(null);

function readPref<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`verniq:${key}`);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writePref(key: string, value: unknown) {
  try {
    localStorage.setItem(`verniq:${key}`, JSON.stringify(value));
  } catch {
    /* storage unavailable — preferences just won't persist */
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [pair, setPairState] = useState<LanguagePair>(() => readPref('pair', { source: 'hi', target: 'ho' }));
  const [largeText, setLargeTextState] = useState<boolean>(() => readPref('largeText', false));

  const [deviceOnline, setDeviceOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine));
  const [mode, setMode] = useState<ConnectivityMode>('auto');
  const [syncing, setSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncUpdates, setSyncUpdates] = useState(0);
  const [lastSyncedAt, setLastSyncedAt] = useState(() => Date.now() - 1000 * 60 * 42);

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [lessonsLoading, setLessonsLoading] = useState(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>(DEMO_NOTIFICATIONS);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const setPair = useCallback((p: LanguagePair) => {
    setPairState(p);
    writePref('pair', p);
  }, []);

  const setLargeText = useCallback((v: boolean) => {
    setLargeTextState(v);
    writePref('largeText', v);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('text-large', largeText);
  }, [largeText]);

  // Toasts
  const dismissToast = useCallback((id: string) => setToasts((ts) => ts.filter((t) => t.id !== id)), []);
  const toast = useCallback(
    (t: Omit<Toast, 'id'>) => {
      const id = uid('toast');
      setToasts((ts) => [...ts.slice(-2), { ...t, id }]);
      setTimeout(() => dismissToast(id), 4200);
    },
    [dismissToast],
  );

  const notify = useCallback((n: Omit<NotificationItem, 'id' | 'at' | 'read'>) => {
    setNotifications((list) => [{ ...n, id: uid('n'), at: Date.now(), read: false }, ...list].slice(0, 30));
  }, []);

  const markAllRead = useCallback(() => setNotifications((list) => list.map((n) => ({ ...n, read: true }))), []);

  // Connectivity
  useEffect(() => {
    const on = () => setDeviceOnline(true);
    const off = () => setDeviceOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  const syncingRef = useRef(false);
  const syncNow = useCallback(async () => {
    if (syncingRef.current) return;
    syncingRef.current = true;
    setSyncing(true);
    setSyncProgress(0);
    try {
      const res = await syncOfflineData((p, u) => {
        setSyncProgress(p);
        setSyncUpdates(u);
      });
      setLastSyncedAt(res.syncedAt);
      toast({ tone: 'success', title: 'Content synchronised', detail: `${res.updates} updates downloaded` });
      notify({ kind: 'sync', title: `${res.updates} updates synced`, detail: 'Everything is ready offline' });
    } finally {
      syncingRef.current = false;
      setSyncing(false);
    }
  }, [notify, toast]);

  const effectiveOnline = mode === 'auto' ? deviceOnline : mode === 'sync-required';
  const wasOnline = useRef(effectiveOnline);
  useEffect(() => {
    // Coming back online → sync automatically
    if (!wasOnline.current && effectiveOnline && mode === 'auto') void syncNow();
    wasOnline.current = effectiveOnline;
  }, [effectiveOnline, mode, syncNow]);

  const status: ConnectivityStatus = syncing
    ? 'syncing'
    : mode === 'sync-required'
      ? 'sync-required'
      : effectiveOnline
        ? 'online'
        : 'offline';

  const setConnectivityMode = useCallback(
    (m: ConnectivityMode) => {
      const goingBackOnline = m === 'auto' && mode !== 'auto' && deviceOnline;
      setMode(m);
      if (goingBackOnline) void syncNow();
    },
    [deviceOnline, mode, syncNow],
  );

  const syncFromRequired = useCallback(async () => {
    if (mode === 'sync-required') setMode('auto');
    await syncNow();
  }, [mode, syncNow]);

  // Lessons
  useEffect(() => {
    let alive = true;
    lessonService.getLessons().then((ls) => {
      if (!alive) return;
      setLessons(ls);
      setLessonsLoading(false);
    });
    return () => {
      alive = false;
    };
  }, []);

  const upsertLesson = useCallback((lesson: Lesson) => {
    setLessons((ls) => (ls.some((l) => l.id === lesson.id) ? ls.map((l) => (l.id === lesson.id ? lesson : l)) : [lesson, ...ls]));
  }, []);

  const toggleOffline = useCallback(
    async (id: string) => {
      const current = lessons.find((l) => l.id === id);
      if (!current) return;
      const updated = await lessonService.setSavedOffline(id, !current.savedOffline);
      if (updated) {
        upsertLesson(updated);
        toast({
          tone: 'success',
          title: updated.savedOffline ? 'Saved for offline teaching' : 'Removed from offline',
          detail: updated.topic,
        });
      }
    },
    [lessons, toast, upsertLesson],
  );

  const value = useMemo<AppState>(
    () => ({
      pair,
      setPair,
      connectivity: { status, mode, syncProgress, syncUpdates, lastSyncedAt },
      setConnectivityMode,
      syncNow: syncFromRequired,
      lessons,
      lessonsLoading,
      upsertLesson,
      toggleOffline,
      notifications,
      unreadCount: notifications.filter((n) => !n.read).length,
      notify,
      markAllRead,
      toasts,
      toast,
      dismissToast,
      largeText,
      setLargeText,
    }),
    [
      pair, setPair, status, mode, syncProgress, syncUpdates, lastSyncedAt, setConnectivityMode, syncFromRequired,
      lessons, lessonsLoading, upsertLesson, toggleOffline, notifications, notify, markAllRead, toasts, toast,
      dismissToast, largeText, setLargeText,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}
