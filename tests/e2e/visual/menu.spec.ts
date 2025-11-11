/**
 * MENU VISUAL REGRESSION TEST
 * 
 * Takes screenshots of the menu screen for visual regression testing.
 */

import { test, expect } from '@playwright/test';

test.describe('Menu Visual Regression', () => {
  test('menu screen renders correctly', async ({ page }) => {
    await page.goto('/');

    // Wait for menu to load
    await expect(page.getByRole('heading', { name: 'Ebb & Bloom' })).toBeVisible();

    // Take full page screenshot
    await expect(page).toHaveScreenshot('menu-full.png', {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });

  test('menu with default seed', async ({ page }) => {
    await page.goto('/');

    // Wait for menu and seed to generate
    await expect(page.getByRole('heading', { name: 'Ebb & Bloom' })).toBeVisible();
    await page.waitForTimeout(500); // Wait for seed generation

    // Take screenshot
    await expect(page).toHaveScreenshot('menu-with-seed.png', {
      maxDiffPixels: 150,
      threshold: 0.2,
    });
  });

  test('menu seed input focused state', async ({ page }) => {
    await page.goto('/');

    const seedInput = page.getByPlaceholder(/v1-word-word-word/i);
    await seedInput.focus();

    // Take screenshot of focused state
    await expect(page).toHaveScreenshot('menu-seed-focused.png', {
      maxDiffPixels: 100,
    });
  });

  test('menu with invalid seed error', async ({ page }) => {
    await page.goto('/');

    const seedInput = page.getByPlaceholder(/v1-word-word-word/i);
    await seedInput.clear();
    await seedInput.fill('invalid');

    // Wait for error to appear
    await expect(page.getByText(/Invalid seed format/i)).toBeVisible();

    // Take screenshot
    await expect(page).toHaveScreenshot('menu-invalid-seed.png', {
      maxDiffPixels: 100,
    });
  });

  test('menu buttons hover state', async ({ page }) => {
    await page.goto('/');

    const newGameButton = page.getByRole('button', { name: /New Game/i });
    await newGameButton.hover();

    // Take screenshot of hover state
    await expect(page).toHaveScreenshot('menu-button-hover.png', {
      maxDiffPixels: 150,
    });
  });
});

test.describe('Menu Responsive Design', () => {
  test('menu on mobile portrait', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE

    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Ebb & Bloom' })).toBeVisible();

    await expect(page).toHaveScreenshot('menu-mobile-portrait.png', {
      fullPage: true,
      maxDiffPixels: 150,
    });
  });

  test('menu on mobile landscape', async ({ page }) => {
    await page.setViewportSize({ width: 667, height: 375 }); // iPhone SE landscape

    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Ebb & Bloom' })).toBeVisible();

    await expect(page).toHaveScreenshot('menu-mobile-landscape.png', {
      fullPage: true,
      maxDiffPixels: 150,
    });
  });

  test('menu on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad

    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Ebb & Bloom' })).toBeVisible();

    await expect(page).toHaveScreenshot('menu-tablet.png', {
      fullPage: true,
      maxDiffPixels: 150,
    });
  });
});
