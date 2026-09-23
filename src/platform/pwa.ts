/**
 * Installable web app support: service-worker registration, update
 * notifications and the browser's "Install app" prompt.
 * Not used inside the native Android app (its files are already on the device).
 */
import { useSyncExternalStore } from 'react';
import { isNative } from '.';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PwaState {
  /** A new version is downloaded and waiting */
  needRefresh: boolean;
  /** All files are cached — the app works offline */
  offlineReady: boolean;
  /** The browser offered an install prompt */
  canInstall: boolean;
  /** Running as an installed app (standalone window) */
  installed: boolean;
}

let state: PwaState = {
  needRefresh: false,
  offlineReady: false,
  canInstall: false,
  installed:
    typeof window !== 'undefined' &&
    (window.matchMedia?.('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true),
};
const listeners = new Set<() => void>();
let deferredPrompt: BeforeInstallPromptEvent | null = null;
let updateSW: ((reload?: boolean) => Promise<void>) | null = null;

function set(patch: Partial<PwaState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

export async function initPwa() {
  if (isNative || typeof window === 'undefined') return;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    set({ canInstall: true });
  });
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    set({ canInstall: false, installed: true });
  });

  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;
  const { registerSW } = await import('virtual:pwa-register');
  updateSW = registerSW({
    onNeedRefresh: () => set({ needRefresh: true }),
    onOfflineReady: () => set({ offlineReady: true }),
  });
}

/** Show the browser install dialog. Returns true if the user installed. */
export async function promptInstall(): Promise<boolean> {
  if (!deferredPrompt) return false;
  await deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;
  set({ canInstall: false });
  return outcome === 'accepted';
}

export function applyUpdate() {
  void updateSW?.(true);
}

export function dismissUpdate() {
  set({ needRefresh: false });
}

export function acknowledgeOfflineReady() {
  set({ offlineReady: false });
}

export function usePwa(): PwaState {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state,
    () => state,
  );
}

/** iPhone/iPad Safari has no install prompt; users add to home screen from the Share menu. */
export const isIosSafari =
  typeof navigator !== 'undefined' && /iphone|ipad|ipod/i.test(navigator.userAgent) && !/crios|fxios/i.test(navigator.userAgent);
