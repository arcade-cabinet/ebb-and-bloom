/**
 * MOBILE DEVICE TESTING
 * 
 * Tests mobile-specific features including touch interactions and responsive layouts.
 * Device-specific tests (gyroscope, etc.) should use the mobile projects in playwright.config.ts
 */

import { test, expect } from '@playwright/test';
import { TEST_SEEDS } from '../fixtures/seeds';

test.describe('Mobile Responsive Layout', () => {
  test('portrait mode menu layout', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 }); // iPhone X portrait

    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Ebb & Bloom' })).toBeVisible();

    // All elements should be visible in portrait
    const seedInput = page.getByPlaceholder(/v1-word-word-word/i);
    const newGameButton = page.getByRole('button', { name: /New Game/i });
    const settingsButton = page.getByRole('button', { name: /Settings/i });

    await expect(seedInput).toBeVisible();
    await expect(newGameButton).toBeVisible();
    await expect(settingsButton).toBeVisible();
  });

  test('landscape mode menu layout', async ({ page }) => {
    await page.setViewportSize({ width: 812, height: 375 }); // iPhone X landscape

    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Ebb & Bloom' })).toBeVisible();

    // All elements should be visible in landscape
    const seedInput = page.getByPlaceholder(/v1-word-word-word/i);
    const newGameButton = page.getByRole('button', { name: /New Game/i });

    await expect(seedInput).toBeVisible();
    await expect(newGameButton).toBeVisible();
  });

  test('tablet menu layout', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad

    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Ebb & Bloom' })).toBeVisible();

    // Should have more space on tablet
    const seedInput = page.getByPlaceholder(/v1-word-word-word/i);
    const box = await seedInput.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(200);
  });
});

test.describe('Touch Interactions', () => {
  test.beforeEach(async ({ page }) => {
    // Set to mobile viewport for touch tests
    await page.setViewportSize({ width: 375, height: 812 });
  });

  test('touch navigation on menu', async ({ page }) => {
    await page.goto('/');

    // Wait for menu
    await expect(page.getByRole('heading', { name: 'Ebb & Bloom' })).toBeVisible();

    // Tap shuffle button
    const shuffleButton = page.getByTitle(/Shuffle seed/i);
    await shuffleButton.tap();

    // Wait for seed change
    await page.waitForTimeout(200);

    // Seed should have changed
    const seedInput = page.getByPlaceholder(/v1-word-word-word/i);
    const seed = await seedInput.inputValue();
    expect(seed).toMatch(/^v1-[a-z]+-[a-z]+-[a-z]+$/);
  });

  test('touch to start game', async ({ page }) => {
    await page.goto('/');

    const seedInput = page.getByPlaceholder(/v1-word-word-word/i);
    
    // Tap to focus and type
    await seedInput.tap();
    await seedInput.fill(TEST_SEEDS.deterministic);

    // Tap New Game button
    const newGameButton = page.getByRole('button', { name: /New Game/i });
    await newGameButton.tap();

    // Should load game
    await expect(page.locator('canvas').first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Device Orientation API', () => {
  test('DeviceOrientation API is available', async ({ page }) => {
    await page.goto('/');

    // Check if DeviceOrientation API exists
    const hasAPI = await page.evaluate(() => {
      return 'DeviceOrientationEvent' in window;
    });

    expect(hasAPI).toBe(true);
  });

  test('can dispatch device orientation events', async ({ page }) => {
    await page.goto('/');

    // Enter seed and start game
    const seedInput = page.getByPlaceholder(/v1-word-word-word/i);
    await seedInput.clear();
    await seedInput.fill(TEST_SEEDS.deterministic);
    await page.getByRole('button', { name: /New Game/i }).click();

    // Wait for game/FMV to start
    await expect(page.locator('canvas').first()).toBeVisible({ timeout: 10000 });

    // Simulate device orientation changes
    await page.evaluate(() => {
      const events = [
        { alpha: 0, beta: 0, gamma: 0 },
        { alpha: 45, beta: 30, gamma: 10 },
        { alpha: 90, beta: 60, gamma: 20 },
      ];

      events.forEach((orientation) => {
        window.dispatchEvent(new DeviceOrientationEvent('deviceorientation', {
          alpha: orientation.alpha,
          beta: orientation.beta,
          gamma: orientation.gamma,
          absolute: true,
        }));
      });
    });

    // Canvas should still be rendering without errors
    await expect(page.locator('canvas').first()).toBeVisible();
  });
});

test.describe('Mobile Performance', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 }); // Mobile viewport
  });

  test('game loads within reasonable time on mobile viewport', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');
    
    const seedInput = page.getByPlaceholder(/v1-word-word-word/i);
    await seedInput.fill(TEST_SEEDS.deterministic);
    await page.getByRole('button', { name: /New Game/i }).click();

    await expect(page.locator('canvas').first()).toBeVisible({ timeout: 15000 });

    const loadTime = Date.now() - startTime;
    
    // Should load within 15 seconds
    expect(loadTime).toBeLessThan(15000);
  });

  test('no excessive console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');
    
    const seedInput = page.getByPlaceholder(/v1-word-word-word/i);
    await seedInput.fill(TEST_SEEDS.deterministic);
    await page.getByRole('button', { name: /New Game/i }).click();

    await expect(page.locator('canvas').first()).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(3000);

    // Filter out non-critical errors
    const criticalErrors = errors.filter(err => 
      !err.includes('Warning') && 
      !err.includes('DevTools') &&
      !err.includes('404')
    );

    expect(criticalErrors.length).toBeLessThan(5);
  });
});
