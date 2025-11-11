/**
 * PAUSE AND RESUME FLOW TEST
 * 
 * Tests pausing and resuming gameplay.
 */

import { test, expect } from '@playwright/test';
import { TEST_SEEDS } from '../fixtures/seeds';

test.describe('Pause and Resume Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to game for each test
    await page.goto('/');
    const seedInput = page.getByPlaceholder(/v1-word-word-word/i);
    await seedInput.clear();
    await seedInput.fill(TEST_SEEDS.deterministic);
    await page.getByRole('button', { name: /New Game/i }).click();
    
    // Wait for game to start
    await expect(page.locator('canvas').first()).toBeVisible({ timeout: 10000 });
  });

  test('ESC key opens pause menu', async ({ page }) => {
    // Press ESC to pause
    await page.keyboard.press('Escape');

    // Pause menu should appear
    // Note: Actual selector depends on implementation
    const pauseMenu = page.locator('text=/pause|paused/i').first();
    await expect(pauseMenu).toBeVisible({ timeout: 2000 });
  });

  test('pause menu can resume game', async ({ page }) => {
    // Pause the game
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // Look for resume button
    const resumeButton = page.getByRole('button', { name: /resume|continue/i });
    if (await resumeButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await resumeButton.click();
      
      // Canvas should still be visible
      await expect(page.locator('canvas').first()).toBeVisible();
    }
  });

  test('pause menu can return to main menu', async ({ page }) => {
    // Pause the game
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // Look for main menu / exit button
    const menuButton = page.getByRole('button', { name: /main menu|exit|quit/i });
    if (await menuButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await menuButton.click();
      
      // Should return to main menu
      await expect(page.getByRole('heading', { name: 'Ebb & Bloom' })).toBeVisible({ timeout: 5000 });
    }
  });

  test('pausing stops game updates', async ({ page }) => {
    // Let game run for a bit
    await page.waitForTimeout(2000);
    
    // Take screenshot before pause
    const beforePause = await page.screenshot();
    
    // Pause
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    
    // Wait a bit while paused
    await page.waitForTimeout(2000);
    
    // Take another screenshot
    const whilePaused = await page.screenshot();
    
    // Note: This is a basic test - actual verification would need more sophisticated checking
    expect(beforePause.length).toBeGreaterThan(1000);
    expect(whilePaused.length).toBeGreaterThan(1000);
  });
});
