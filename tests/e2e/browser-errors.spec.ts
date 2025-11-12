import { test, expect } from '@playwright/test';

const DEMO_ROUTES = [
  '/demos/base-sdf-proof',
  '/demos/primitives-showcase',
  '/demos/materials-showcase',
  '/demos/joining-showcase',
  '/demos/blending-showcase',
  '/demos/lighting-showcase',
  '/demos/ecs-integration',
  '/demos/performance-benchmark'
];

test.describe('Browser Console Errors', () => {
  for (const route of DEMO_ROUTES) {
    test(`${route} should load without console errors`, async ({ page }) => {
      const consoleMessages: string[] = [];
      const consoleErrors: string[] = [];
      const pageErrors: string[] = [];

      // Capture console messages
      page.on('console', msg => {
        const text = msg.text();
        consoleMessages.push(`[${msg.type()}] ${text}`);
        
        if (msg.type() === 'error') {
          consoleErrors.push(text);
        }
      });

      // Capture page errors
      page.on('pageerror', error => {
        pageErrors.push(error.message);
      });

      // Navigate to the demo
      await page.goto(route, { waitUntil: 'networkidle' });

      // Wait for canvas to appear
      await page.waitForSelector('canvas', { timeout: 10000 });

      // Wait a bit for rendering
      await page.waitForTimeout(3000);

      // Log all captured messages
      console.log(`\n=== Console Messages for ${route} ===`);
      consoleMessages.forEach(msg => console.log(msg));

      // Log errors specifically
      if (consoleErrors.length > 0) {
        console.log(`\n=== Console Errors for ${route} ===`);
        consoleErrors.forEach(err => console.error(err));
      }

      if (pageErrors.length > 0) {
        console.log(`\n=== Page Errors for ${route} ===`);
        pageErrors.forEach(err => console.error(err));
      }

      // Check for critical errors (excluding WebGL context issues in headless)
      const criticalErrors = [...consoleErrors, ...pageErrors].filter(err => 
        !err.includes('WebGL') && 
        !err.includes('DevTools') &&
        !err.includes('404')
      );

      if (criticalErrors.length > 0) {
        console.error('\n=== CRITICAL ERRORS FOUND ===');
        criticalErrors.forEach(err => console.error(err));
      }

      // Test should fail if there are critical errors
      expect(criticalErrors).toHaveLength(0);
    });
  }
});
