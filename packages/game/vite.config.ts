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
    // Build simulation.html as the main entry point
    rollupOptions: {
      input: resolve(__dirname, 'simulation.html'),
    },
  },
});

