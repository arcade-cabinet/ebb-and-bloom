import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: './dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  optimizeDeps: {
    exclude: ['@react-three/rapier']
  },
  worker: {
    format: 'es'
  },
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
    allowedHosts: true,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5000,
      clientPort: 5000,
      overlay: false,
      timeout: 30000
    },
    fs: {
      strict: false
    },
    watch: {
      ignored: [
        '**/tsconfig*.json',
        '**/node_modules/**',
        '**/.git/**',
        '**/dist/**',
        '**/android/**',
        '**/docs/**',
        '**/memory-bank/**',
        '**/playwright-report/**',
        '**/test-results/**',
        '**/*.md'
      ],
      // Reduce file watching overhead
      usePolling: false,
      interval: 1000
    }
  },
  preview: {
    port: 5000,
    host: '0.0.0.0',
    strictPort: true
  }
});

