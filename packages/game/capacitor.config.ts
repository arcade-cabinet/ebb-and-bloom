import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ebbandbloom.app',
  appName: 'Ebb and Bloom',
  webDir: 'dist',
  // Native projects at workspace root (Capacitor standard structure)
  android: {
    path: '../../android'
  },
  ios: {
    path: '../../ios'
  },
  server: {
    androidScheme: 'https',
    hostname: '0.0.0.0',
    cleartext: true,
  },
  plugins: {
    Haptics: {
      enableOnAndroid: true,
    },
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: false,
      backgroundColor: '#1a202c',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: false,
    },
  },
};

export default config;

