/**
 * SEED TO GAMEPLAY FLOW TEST
 * 
 * Tests the full user journey from entering a seed to starting gameplay.
 */

import { test, expect } from '@playwright/test';
import { TEST_SEEDS } from '../fixtures/seeds';

test.describe('Seed to Gameplay Flow', () => {
  test('user can enter seed and start game', async ({ page }) => {
    await page.goto('/');

    // Wait for menu screen to load
    await expect(page.getByRole('heading', { name: 'Ebb & Bloom' })).toBeVisible();

    // Clear existing seed and enter test seed
    const seedInput = page.getByPlaceholder(/v1-word-word-word/i);
    await expect(seedInput).toBeVisible();
    await seedInput.clear();
    await seedInput.fill(TEST_SEEDS.deterministic);

    // Verify seed is accepted (no error)
    await expect(page.getByText(/Invalid seed format/i)).not.toBeVisible();

    // Click New Game button
    const newGameButton = page.getByRole('button', { name: /New Game/i });
    await expect(newGameButton).toBeEnabled();
    await newGameButton.click();

    // Wait for game screen to load (canvas should appear)
    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible({ timeout: 10000 });

    // Verify we're no longer on menu screen
    await expect(page.getByRole('heading', { name: 'Ebb & Bloom' })).not.toBeVisible();
  });

  test('invalid seed shows error and prevents starting', async ({ page }) => {
    await page.goto('/');

    // Enter invalid seed
    const seedInput = page.getByPlaceholder(/v1-word-word-word/i);
    await seedInput.clear();
    await seedInput.fill('invalid-seed');

    // Should show error
    await expect(page.getByText(/Invalid seed format/i)).toBeVisible();

    // New Game button should be disabled
    const newGameButton = page.getByRole('button', { name: /New Game/i });
    await expect(newGameButton).toBeDisabled();
  });

  test('shuffle generates valid seed', async ({ page }) => {
    await page.goto('/');

    // Click shuffle button
    const shuffleButton = page.getByTitle(/Shuffle seed/i);
    await expect(shuffleButton).toBeVisible();
    
    const seedInput = page.getByPlaceholder(/v1-word-word-word/i);
    const initialSeed = await seedInput.inputValue();
    
    await shuffleButton.click();
    
    // Wait for seed to change
    await page.waitForTimeout(100);
    const newSeed = await seedInput.inputValue();
    
    // Should be different
    expect(newSeed).not.toBe(initialSeed);
    
    // Should be valid format (v1-word-word-word)
    expect(newSeed).toMatch(/^v1-[a-z]+-[a-z]+-[a-z]+$/);
    
    // New Game button should be enabled
    const newGameButton = page.getByRole('button', { name: /New Game/i });
    await expect(newGameButton).toBeEnabled();
  });

  test('copy button copies seed to clipboard', async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    
    await page.goto('/');

    const seedInput = page.getByPlaceholder(/v1-word-word-word/i);
    const seed = await seedInput.inputValue();

    // Click copy button
    const copyButton = page.getByTitle(/Copy seed/i);
    await copyButton.click();

    // Check clipboard content
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toBe(seed);

    // Should show check icon briefly
    await expect(page.getByTestId('CheckIcon')).toBeVisible();
  });
});

test.describe('Parameterized Seed Tests', () => {
  test.describe.configure({ mode: 'parallel' });

  for (const [name, seed] of Object.entries(TEST_SEEDS)) {
    test(`full flow with ${name} seed`, async ({ page }) => {
      await page.goto('/');

      // Enter seed
      const seedInput = page.getByPlaceholder(/v1-word-word-word/i);
      await seedInput.clear();
      await seedInput.fill(seed);

      // Start game
      await page.getByRole('button', { name: /New Game/i }).click();

      // Should load game
      await expect(page.locator('canvas').first()).toBeVisible({ timeout: 10000 });
    });
  }
});
