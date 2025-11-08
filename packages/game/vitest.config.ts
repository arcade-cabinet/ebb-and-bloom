import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: [
      'test-backend/**/*.test.ts',
      'test-frontend/**/*.test.ts',
      'src/**/*.test.ts',
    ],
    setupFiles: ['./test-frontend/setup.ts'],
    testTimeout: 10000,
    hookTimeout: 10000,
    teardownTimeout: 5000,
    bail: 5,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'test-backend/',
        'test-frontend/',
        'dist/',
        '**/*.config.*',
      ],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});

