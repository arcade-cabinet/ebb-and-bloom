import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    include: [
      'tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'engine/**/__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
    ],
    exclude: ['**/node_modules/**', '**/dist/**'],
    globals: true,
    environment: 'happy-dom', // 2-3x faster than jsdom, supports React+MUI
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: [
        'agents/**/*.ts',
        'engine/**/*.ts',
        'game/**/*.{ts,tsx}',
        'generation/**/*.ts',
      ],
      exclude: [
        '**/*.d.ts',
        '**/*.config.ts',
        '**/index.ts',
        '**/types/**',
        'tests/**',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@engine': resolve(__dirname, './engine'),
      '@agents': resolve(__dirname, './agents'),
      '@generation': resolve(__dirname, './generation'),
    },
  },
});

