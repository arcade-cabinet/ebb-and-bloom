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
    // Build main entry point (unified complete system)
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        // timeline.html and universe.html redirect to index.html
      },
    },
  },
});

