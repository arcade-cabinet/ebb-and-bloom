import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  root: 'game',
  build: {
    outDir: 'dist',
    emptyOutDir: true
  },
  resolve: {
    alias: {
      '@engine': resolve(__dirname, './engine')
    }
  },
  server: {
    port: 5000,
    host: '0.0.0.0',
    strictPort: true,
    hmr: {
      clientPort: 5000
    }
  },
  preview: {
    port: 5000,
    host: '0.0.0.0',
    strictPort: true
  }
});

