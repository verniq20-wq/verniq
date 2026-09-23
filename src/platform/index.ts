/**
 * Platform integration: the same React app runs as
 *  - an installable web app (PWA) in any browser, and
 *  - a native Android app through Capacitor.
 */
import { Capacitor } from '@capacitor/core';

export const isNative = Capacitor.isNativePlatform();
export const platform = Capacitor.getPlatform(); // 'web' | 'android' | 'ios'

/** Native-only setup: status bar, splash screen, hardware back button. */
export async function initNative(navigateBack: () => void) {
  if (!isNative) return;
  const [{ App }, { StatusBar, Style }, { SplashScreen }] = await Promise.all([
    import('@capacitor/app'),
    import('@capacitor/status-bar'),
    import('@capacitor/splash-screen'),
  ]);

  try {
    await StatusBar.setStyle({ style: Style.Light });
    if (platform === 'android') await StatusBar.setBackgroundColor({ color: '#F5F9FC' });
  } catch {
    /* status bar not available */
  }

  // Android back button: go back inside the app, leave the app from the home screen
  await App.addListener('backButton', ({ canGoBack }) => {
    if (canGoBack && window.location.pathname !== '/') navigateBack();
    else void App.exitApp();
  });

  await SplashScreen.hide({ fadeOutDuration: 250 });
}
