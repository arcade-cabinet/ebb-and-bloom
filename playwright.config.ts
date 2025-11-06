import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for Ebb & Bloom
 * Supports multiple environments: local, CI, Copilot MCP server, background agents
 */
export default defineConfig({
  // Test directory
  testDir: './tests/e2e',
  
  // Global test timeout
  timeout: 30000,
  
  // Expect timeout for assertions
  expect: {
    timeout: 5000
  },
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter configuration
  reporter: [
    ['html', { open: 'never' }],
    ['json', { outputFile: 'playwright-report/results.json' }],
    // GitHub Actions reporter for CI
    ...(process.env.CI ? [['github']] : []),
    // Line reporter for local development
    ...(!process.env.CI ? [['line']] : []),
  ],
  
  // Global setup and teardown
  globalSetup: './tests/e2e/global-setup.ts',
  
  // Shared settings for all projects
  use: {
    // Base URL for the game (will be overridden per environment)
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173',
    
    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
    
    // Take screenshot on failure
    screenshot: 'only-on-failure',
    
    // Record video on failure
    video: 'retain-on-failure',
    
    // Global timeout for actions
    actionTimeout: 10000,
    
    // Ignore HTTPS errors
    ignoreHTTPSErrors: true,
    
    // Viewport size (mobile game focus)
    viewport: { width: 375, height: 667 }, // iPhone SE size
  },

  // Project configurations for different environments and devices
  projects: [
    // Desktop Chromium (for development and debugging)
    {
      name: 'desktop-chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
      testIgnore: ['**/mobile-only/**'],
    },

    // Mobile Chrome (primary target - mobile game)
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5'],
      },
    },

    // Mobile Safari (iOS testing)
    {
      name: 'mobile-safari',
      use: {
        ...devices['iPhone 12'],
      },
    },

    // Headless for CI and background agents
    {
      name: 'headless-chromium',
      use: {
        ...devices['Desktop Chrome'],
        headless: true,
        viewport: { width: 375, height: 667 },
      },
      testIgnore: ['**/visual/**'], // Skip visual tests in headless
    },

    // Visual regression testing (when needed)
    {
      name: 'visual-testing',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
      testMatch: ['**/visual/**'],
    },
  ],

  // Local dev server (for Vite)
  webServer: process.env.CI || process.env.PLAYWRIGHT_SKIP_SERVER ? undefined : {
    command: 'pnpm dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },

  // Output directory
  outputDir: 'playwright-results/',
  
  // Global test configuration
  globalTimeout: 600000, // 10 minutes for full test suite
  
  // Test metadata
  metadata: {
    project: 'Ebb & Bloom Mobile Game',
    framework: 'Vue 3 + Phaser 3 + BitECS',
    testEnvironment: process.env.NODE_ENV || 'development',
  },
});