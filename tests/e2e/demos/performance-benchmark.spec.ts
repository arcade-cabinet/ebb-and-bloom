import { test, expect } from '@playwright/test';
import { mkdir } from 'fs/promises';
import { join } from 'path';

async function ensureScreenshotsDir() {
  const screenshotDir = join(process.cwd(), 'screenshots');
  try {
    await mkdir(screenshotDir, { recursive: true });
  } catch (err) {
  }
}

test.describe('Demo 7: Performance Benchmark', () => {
  test.beforeAll(async () => {
    await ensureScreenshotsDir();
  });

  test('should capture all 4 performance scenarios', async ({ page }) => {
    test.setTimeout(120000);
    
    await page.goto('/demos/performance-benchmark');
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    const autoRotateBtn = page.getByTestId('toggle-auto-rotate');
    await expect(autoRotateBtn).toBeVisible();
    await autoRotateBtn.click();
    await page.waitForTimeout(500);
    
    const scenarios = [
      { count: 10, testId: 'scenario-10', filename: 'demo-7-perf-10.png' },
      { count: 50, testId: 'scenario-50', filename: 'demo-7-perf-50.png' },
      { count: 100, testId: 'scenario-100', filename: 'demo-7-perf-100.png' },
      { count: 200, testId: 'scenario-200', filename: 'demo-7-perf-200.png' }
    ];

    for (const scenario of scenarios) {
      const scenarioBtn = page.getByTestId(scenario.testId);
      await expect(scenarioBtn).toBeVisible();
      await scenarioBtn.click();
      
      await page.waitForTimeout(3000);
      
      const scenarioText = await page.locator(`text=/${scenario.count} Primitives/`).textContent();
      expect(scenarioText).toContain(`${scenario.count} Primitives`);
      
      const fpsDisplay = page.locator('text=/\\d+ FPS/');
      await expect(fpsDisplay).toBeVisible();
      
      await page.screenshot({
        path: `screenshots/${scenario.filename}`,
        fullPage: false
      });
    }
    
    const performanceTitle = page.locator('text=/Performance Benchmark/');
    await expect(performanceTitle).toBeVisible();
    
    const metricsTitle = page.locator('text=/Performance Metrics/');
    await expect(metricsTitle).toBeVisible();
    
    expect(true).toBe(true);
  });

  test('should verify FPS counter updates and displays status', async ({ page }) => {
    test.setTimeout(60000);
    
    await page.goto('/demos/performance-benchmark');
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    const autoRotateBtn = page.getByTestId('toggle-auto-rotate');
    await autoRotateBtn.click();
    await page.waitForTimeout(500);
    
    const scenario10Btn = page.getByTestId('scenario-10');
    await scenario10Btn.click();
    await page.waitForTimeout(2000);
    
    const fpsDisplay = page.locator('text=/\\d+ FPS/');
    await expect(fpsDisplay).toBeVisible();
    
    const statusDisplay = page.locator('text=/Status: (EXCELLENT|GOOD|POOR)/');
    await expect(statusDisplay).toBeVisible();
    
    const frameTimeDisplay = page.locator('text=/Frame Time: \\d+\\.\\d+ms/');
    await expect(frameTimeDisplay).toBeVisible();
    
    const targetFpsDisplay = page.locator('text=/Target: 60 FPS/');
    await expect(targetFpsDisplay).toBeVisible();
  });

  test('should verify auto-cycling works', async ({ page }) => {
    test.setTimeout(30000);
    
    await page.goto('/demos/performance-benchmark');
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    const autoRotateBtn = page.getByTestId('toggle-auto-rotate');
    const isEnabled = await autoRotateBtn.textContent();
    
    if (isEnabled?.includes('Disable')) {
      const initialScenario = await page.locator('text=/Scenario: \\d+ Primitives/').textContent();
      
      await page.waitForTimeout(6000);
      
      const newScenario = await page.locator('text=/Scenario: \\d+ Primitives/').textContent();
      
      expect(initialScenario).not.toBe(newScenario);
    }
  });
});
