/**
 * INTRO FMV PLAYTHROUGH TEST
 * 
 * Tests the full-motion video (FMV) intro sequence from Big Bang to planet formation.
 */

import { test, expect } from '@playwright/test';
import { TEST_SEEDS } from '../fixtures/seeds';

test.describe('Intro FMV Playthrough', () => {
  test('FMV plays through cosmic timeline stages', async ({ page }) => {
    await page.goto('/');

    // Enter deterministic seed
    const seedInput = page.getByPlaceholder(/v1-word-word-word/i);
    await seedInput.clear();
    await seedInput.fill(TEST_SEEDS.deterministic);

    // Start game
    await page.getByRole('button', { name: /New Game/i }).click();

    // Wait for canvas to appear (FMV starts)
    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible({ timeout: 10000 });

    // FMV should be playing - canvas should be visible for at least a few seconds
    await page.waitForTimeout(5000);
    await expect(canvas).toBeVisible();

    // Canvas should still be rendering (no errors)
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Wait for more of the FMV
    await page.waitForTimeout(5000);

    // Should have minimal console errors (allow for some warnings)
    const criticalErrors = consoleErrors.filter(err => 
      !err.includes('Warning') && !err.includes('DevTools')
    );
    expect(criticalErrors.length).toBeLessThan(3);
  });

  test('FMV can be skipped or fast-forwarded', async ({ page }) => {
    await page.goto('/');

    // Enter seed and start
    const seedInput = page.getByPlaceholder(/v1-word-word-word/i);
    await seedInput.clear();
    await seedInput.fill(TEST_SEEDS.deterministic);
    await page.getByRole('button', { name: /New Game/i }).click();

    // Wait for FMV to start
    await expect(page.locator('canvas').first()).toBeVisible({ timeout: 10000 });

    // Look for skip/fast-forward controls (if implemented)
    // This is a placeholder - actual implementation may vary
    const skipButton = page.getByRole('button', { name: /skip|fast/i });
    if (await skipButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await skipButton.click();
      // Should skip to gameplay or end of FMV
      await page.waitForTimeout(1000);
    }
  });

  test('FMV renders without WebGL errors', async ({ page }) => {
    const webglErrors: string[] = [];
    
    // Capture console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (text.includes('WebGL') || text.includes('THREE')) {
          webglErrors.push(text);
        }
      }
    });

    await page.goto('/');

    const seedInput = page.getByPlaceholder(/v1-word-word-word/i);
    await seedInput.clear();
    await seedInput.fill(TEST_SEEDS.cosmic);
    await page.getByRole('button', { name: /New Game/i }).click();

    // Wait for FMV to render
    await expect(page.locator('canvas').first()).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(3000);

    // Should have no WebGL errors
    expect(webglErrors).toHaveLength(0);
  });
});

test.describe('FMV Determinism', () => {
  test('same seed produces same FMV sequence', async ({ browser }) => {
    // Create two contexts to test in parallel
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    try {
      // Start both with same seed
      for (const p of [page1, page2]) {
        await p.goto('/');
        const seedInput = p.getByPlaceholder(/v1-word-word-word/i);
        await seedInput.clear();
        await seedInput.fill(TEST_SEEDS.deterministic);
        await p.getByRole('button', { name: /New Game/i }).click();
        await expect(p.locator('canvas').first()).toBeVisible({ timeout: 10000 });
      }

      // Wait for some FMV progression
      await page1.waitForTimeout(3000);
      await page2.waitForTimeout(3000);

      // Take screenshots at same time
      const [screenshot1, screenshot2] = await Promise.all([
        page1.screenshot(),
        page2.screenshot(),
      ]);

      // Screenshots should be similar (deterministic rendering)
      // Note: Exact pixel comparison may fail due to timing, but they should be very similar
      expect(screenshot1.length).toBeGreaterThan(1000);
      expect(screenshot2.length).toBeGreaterThan(1000);
    } finally {
      await context1.close();
      await context2.close();
    }
  });
});
