import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ebbandbloom.app',
  appName: 'Ebb and Bloom',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    Haptics: {
      enableOnAndroid: true
    },
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: false, // We control hiding manually in component
      backgroundColor: "#1a202c", // Ebb Indigo 900
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: false
      // Note: fadeInDuration and fadeOutDuration are set in the component
      // when calling SplashScreen.hide()
    }
  }
};

export default config;
