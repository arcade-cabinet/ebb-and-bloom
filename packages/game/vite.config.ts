import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // Build ALL entry points for Capacitor (iOS, Android, Desktop, Web)
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        universe: resolve(__dirname, 'universe.html'),
      },
    },
  },
});

