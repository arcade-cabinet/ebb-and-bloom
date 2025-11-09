import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0', // Bind to all interfaces for cross-platform access
    port: 5173,
    // No proxy needed - all internal function calls
  },
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // Build SIMULATION mode (text reports, no 3D)
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'simulation.html'),
      },
    },
  },
});

