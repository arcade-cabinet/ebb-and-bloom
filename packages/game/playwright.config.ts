import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for E2E Tests
 * 
 * Supports two modes:
 * 1. Local testing: Standard Playwright test runner (pnpm test:e2e)
 * 2. MCP server: Use Playwright MCP server for manual testing/screenshots
 * 
 * For MCP server usage:
 * - Start dev server manually: pnpm dev
 * - Use playwright-browser_* tools from MCP server
 * - Navigate to http://localhost:5173
 * 
 * To disable auto-starting the web server (for MCP usage):
 * - Set PLAYWRIGHT_NO_SERVER=1 before running tests
 * - Example: PLAYWRIGHT_NO_SERVER=1 pnpm test:e2e
 */

// Check if we should start the web server (for local testing)
// If PLAYWRIGHT_NO_SERVER is set, skip starting the server (for MCP usage)
const shouldStartServer = !process.env.PLAYWRIGHT_NO_SERVER;

export default defineConfig({
  testDir: './test-e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1, // Retry once on failure
  workers: 1,
  reporter: 'html',
  timeout: 60000, // Increased to 60s for heavy simulations
  expect: {
    timeout: 15000, // Increased to 15s for assertions
  },
  globalTimeout: 900000, // 15 minutes total
  maxFailures: 5,

  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    navigationTimeout: 45000, // Increased for heavy pages
    actionTimeout: 15000, // Increased for complex interactions
  },

  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        headless: true, // Headless for CI/screenshot capture
      },
    },
  ],

  // Web server is optional - can be disabled for MCP server usage
  webServer: shouldStartServer ? {
    command: 'pnpm dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
    stderr: 'pipe',
    timeout: 120000,
  } : undefined,
});

