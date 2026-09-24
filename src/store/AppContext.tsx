/**
 * UI state shared across screens: toasts, the notification list and
 * accessibility preferences. Data and sync live in DataContext.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { NotificationItem, Toast } from '../types';
import { uid } from '../utils';

interface AppState {
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
    /* storage unavailable */
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [largeText, setLargeTextState] = useState<boolean>(() => readPref('largeText', false));
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => readPref('notifications', []));
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    document.documentElement.classList.toggle('text-large', largeText);
  }, [largeText]);

  useEffect(() => writePref('notifications', notifications.slice(0, 30)), [notifications]);

  const setLargeText = useCallback((v: boolean) => {
    setLargeTextState(v);
    writePref('largeText', v);
  }, []);

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

  const value = useMemo<AppState>(
    () => ({
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
    [notifications, notify, markAllRead, toasts, toast, dismissToast, largeText, setLargeText],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}
