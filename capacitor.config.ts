import { CapacitorConfig } from '@capacitor/core';

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
    }
  }
};

export default config;
