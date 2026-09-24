/**
 * Light / dark theme. "system" follows the device setting and updates live.
 * index.html applies the saved choice before the app loads, so there is no flash.
 */
import { isNative, platform } from '.';

export type ThemePref = 'system' | 'light' | 'dark';

const media = typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)') : null;

export function resolveTheme(pref: ThemePref): 'light' | 'dark' {
  return pref === 'system' ? (media?.matches ? 'dark' : 'light') : pref;
}

export function applyTheme(pref: ThemePref) {
  const mode = resolveTheme(pref);
  const root = document.documentElement;
  root.classList.toggle('dark', mode === 'dark');
  const bar = mode === 'dark' ? '#0B121B' : '#F5F9FC';
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', bar);
  if (isNative) {
    void import('@capacitor/status-bar')
      .then(async ({ StatusBar, Style }) => {
        await StatusBar.setStyle({ style: mode === 'dark' ? Style.Dark : Style.Light });
        if (platform === 'android') await StatusBar.setBackgroundColor({ color: bar });
      })
      .catch(() => undefined);
  }
  return mode;
}

/** Re-apply when the device switches between light and dark. Returns an unsubscribe function. */
export function watchSystemTheme(onChange: () => void) {
  media?.addEventListener('change', onChange);
  return () => media?.removeEventListener('change', onChange);
}
