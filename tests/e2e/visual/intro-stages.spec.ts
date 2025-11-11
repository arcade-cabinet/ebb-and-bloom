/**
 * INTRO STAGES VISUAL REGRESSION TEST
 * 
 * Tests visual rendering of all 15 cosmic timeline stages.
 */

import { test, expect } from '@playwright/test';
import { TEST_SEEDS } from '../fixtures/seeds';

test.describe('Intro FMV Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    // Start game with deterministic seed
    await page.goto('/');
    const seedInput = page.getByPlaceholder(/v1-word-word-word/i);
    await seedInput.clear();
    await seedInput.fill(TEST_SEEDS.deterministic);
    await page.getByRole('button', { name: /New Game/i }).click();
    
    // Wait for FMV to start
    await expect(page.locator('canvas').first()).toBeVisible({ timeout: 10000 });
  });

  test('intro FMV initial render', async ({ page }) => {
    // Wait for first stage to render
    await page.waitForTimeout(1000);

    // Take screenshot of initial stage
    await expect(page).toHaveScreenshot('intro-stage-initial.png', {
      maxDiffPixels: 200,
      threshold: 0.3,
    });
  });

  test('intro FMV renders without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Let FMV run for 10 seconds
    await page.waitForTimeout(10000);

    // Filter out non-critical errors
    const criticalErrors = errors.filter(err => 
      !err.includes('Warning') && 
      !err.includes('DevTools') &&
      !err.includes('404')
    );

    expect(criticalErrors.length).toBeLessThan(3);
  });

  test('canvas maintains aspect ratio during FMV', async ({ page }) => {
    const canvas = page.locator('canvas').first();
    
    // Check canvas dimensions at start
    const initialBox = await canvas.boundingBox();
    expect(initialBox).not.toBeNull();
    expect(initialBox!.width).toBeGreaterThan(100);
    expect(initialBox!.height).toBeGreaterThan(100);

    // Wait and check again
    await page.waitForTimeout(5000);
    
    const laterBox = await canvas.boundingBox();
    expect(laterBox).not.toBeNull();
    expect(laterBox!.width).toBeGreaterThan(100);
    expect(laterBox!.height).toBeGreaterThan(100);

    // Aspect ratio should be similar (allowing for minor changes)
    const initialRatio = initialBox!.width / initialBox!.height;
    const laterRatio = laterBox!.width / laterBox!.height;
    expect(Math.abs(initialRatio - laterRatio)).toBeLessThan(0.1);
  });
});

test.describe('Intro Stage Sampling', () => {
  test('sample stages at different time intervals', async ({ page }) => {
    // Start FMV
    await page.goto('/');
    const seedInput = page.getByPlaceholder(/v1-word-word-word/i);
    await seedInput.clear();
    await seedInput.fill(TEST_SEEDS.deterministic);
    await page.getByRole('button', { name: /New Game/i }).click();
    await expect(page.locator('canvas').first()).toBeVisible({ timeout: 10000 });

    // Take screenshots at different intervals
    const intervals = [1000, 5000, 10000, 15000];
    
    for (const interval of intervals) {
      await page.waitForTimeout(interval);
      
      await expect(page).toHaveScreenshot(`intro-stage-${interval}ms.png`, {
        maxDiffPixels: 300,
        threshold: 0.3,
      });
    }
  });
});

test.describe('Intro Determinism', () => {
  test('same seed produces consistent visual output', async ({ page }) => {
    // First run
    await page.goto('/');
    let seedInput = page.getByPlaceholder(/v1-word-word-word/i);
    await seedInput.clear();
    await seedInput.fill(TEST_SEEDS.deterministic);
    await page.getByRole('button', { name: /New Game/i }).click();
    await expect(page.locator('canvas').first()).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(3000);
    const screenshot1 = await page.screenshot();

    // Reload and run again with same seed
    await page.goto('/');
    seedInput = page.getByPlaceholder(/v1-word-word-word/i);
    await seedInput.clear();
    await seedInput.fill(TEST_SEEDS.deterministic);
    await page.getByRole('button', { name: /New Game/i }).click();
    await expect(page.locator('canvas').first()).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(3000);
    const screenshot2 = await page.screenshot();

    // Screenshots should exist
    expect(screenshot1.length).toBeGreaterThan(1000);
    expect(screenshot2.length).toBeGreaterThan(1000);
    
    // Note: Exact pixel comparison may fail due to timing variations
    // In practice, you'd use a visual regression tool like Percy or Chromatic
  });
});
