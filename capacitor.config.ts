import type { CapacitorConfig } from '@capacitor/cli';

/** Native Android app. The web build in dist/ is packaged inside the APK, so it works fully offline. */
const config: CapacitorConfig = {
  appId: 'app.verniq.teacher',
  appName: 'Verniq',
  webDir: 'dist',
  backgroundColor: '#F5F9FC',
  android: {
    allowMixedContent: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: false, // hidden by the app once the first screen is ready
      backgroundColor: '#145F9E',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#F5F9FC',
    },
  },
};

export default config;
