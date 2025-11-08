import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for Gen0 rendering tests
 * Records videos and snapshots for visual regression testing
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    video: 'retain-on-failure', // Record video for all tests, keep on failure
    screenshot: 'only-on-failure',
    // Slow down actions for better visibility
    actionTimeout: 10000,
    // Viewport for consistent rendering
    viewport: { width: 1920, height: 1080 },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // Process-compose manages servers (recommended approach)
  // Run: process-compose up dev-backend dev-frontend
  // Then Playwright will reuse existing servers
  // Fallback: Playwright can auto-start servers if not running (for CI)
  webServer: [
    // Backend server (required for API calls)
    {
      command: 'cd ../../packages/backend && pnpm dev',
      url: 'http://localhost:3001/health',
      reuseExistingServer: true, // Always reuse if process-compose is running
      timeout: 120 * 1000,
      stdout: 'pipe',
      stderr: 'pipe',
    },
    // Frontend server
    {
      command: 'pnpm dev',
      url: 'http://localhost:5173',
      reuseExistingServer: true, // Always reuse if process-compose is running
      timeout: 120 * 1000,
      stdout: 'pipe',
      stderr: 'pipe',
    },
  ],
});

