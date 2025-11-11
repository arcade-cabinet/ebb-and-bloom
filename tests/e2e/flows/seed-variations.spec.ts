/**
 * ENHANCED SEED FLOW TESTS
 * 
 * Comprehensive tests for different seed formats and validation:
 * - Three-word seeds (v1-word-word-word)
 * - Numeric seeds
 * - Mixed alphanumeric
 * - Copy/paste functionality
 * - Shuffle functionality
 * - Invalid seed handling
 */

import { test, expect } from '@playwright/test';

test.describe('Three-Word Seed Format', () => {
  test('accepts valid three-word seed', async ({ page }) => {
    await page.goto('/');
    
    const seedInput = page.getByPlaceholder(/v1-word-word-word/i);
    await seedInput.clear();
    await seedInput.fill('v1-red-star-dance');
    
    await expect(page.getByText(/Invalid seed format/i)).not.toBeVisible();
    
    const newGameButton = page.getByRole('button', { name: /New Game/i });
    await expect(newGameButton).toBeEnabled();
  });
  
  test('accepts seed with different word combinations', async ({ page }) => {
    await page.goto('/');
    
    const validSeeds = [
      'v1-ancient-mountain-rise',
      'v1-calm-lake-drift',
      'v1-fierce-fire-burn',
      'v1-dark-nebula-glow',
      'v1-bright-sun-shine',
    ];
    
    for (const seed of validSeeds) {
      const seedInput = page.getByPlaceholder(/v1-word-word-word/i);
      await seedInput.clear();
      await seedInput.fill(seed);
      
      await expect(page.getByText(/Invalid seed format/i)).not.toBeVisible();
      
      const newGameButton = page.getByRole('button', { name: /New Game/i });
      await expect(newGameButton).toBeEnabled();
    }
  });
  
  test('starts game with three-word seed', async ({ page }) => {
    await page.goto('/');
    
    const seedInput = page.getByPlaceholder(/v1-word-word-word/i);
    await seedInput.clear();
    await seedInput.fill('v1-blue-ocean-flow');
    
    await page.getByRole('button', { name: /New Game/i }).click();
    
    await expect(page.locator('canvas').first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Invalid Seed Formats', () => {
  test('rejects seed without version prefix', async ({ page }) => {
    await page.goto('/');
    
    const seedInput = page.getByPlaceholder(/v1-word-word-word/i);
    await seedInput.clear();
    await seedInput.fill('red-star-dance');
    
    await expect(page.getByText(/Invalid seed format/i)).toBeVisible();
    
    const newGameButton = page.getByRole('button', { name: /New Game/i });
    await expect(newGameButton).toBeDisabled();
  });
  
  test('rejects seed with wrong version', async ({ page }) => {
    await page.goto('/');
    
    const seedInput = page.getByPlaceholder(/v1-word-word-word/i);
    await seedInput.clear();
    await seedInput.fill('v2-red-star-dance');
    
    await expect(page.getByText(/Invalid seed format/i)).toBeVisible();
    
    const newGameButton = page.getByRole('button', { name: /New Game/i });
    await expect(newGameButton).toBeDisabled();
  });
  
  test('rejects seed with only two words', async ({ page }) => {
    await page.goto('/');
    
    const seedInput = page.getByPlaceholder(/v1-word-word-word/i);
    await seedInput.clear();
    await seedInput.fill('v1-red-star');
    
    await expect(page.getByText(/Invalid seed format/i)).toBeVisible();
    
    const newGameButton = page.getByRole('button', { name: /New Game/i });
    await expect(newGameButton).toBeDisabled();
  });
  
  test('rejects seed with four words', async ({ page }) => {
    await page.goto('/');
    
    const seedInput = page.getByPlaceholder(/v1-word-word-word/i);
    await seedInput.clear();
    await seedInput.fill('v1-red-star-dance-moon');
    
    await expect(page.getByText(/Invalid seed format/i)).toBeVisible();
    
    const newGameButton = page.getByRole('button', { name: /New Game/i });
    await expect(newGameButton).toBeDisabled();
  });
  
  test('rejects seed with uppercase letters', async ({ page }) => {
    await page.goto('/');
    
    const seedInput = page.getByPlaceholder(/v1-word-word-word/i);
    await seedInput.clear();
    await seedInput.fill('v1-Red-Star-Dance');
    
    await expect(page.getByText(/Invalid seed format/i)).toBeVisible();
    
    const newGameButton = page.getByRole('button', { name: /New Game/i });
    await expect(newGameButton).toBeDisabled();
  });
  
  test('rejects seed with numbers', async ({ page }) => {
    await page.goto('/');
    
    const seedInput = page.getByPlaceholder(/v1-word-word-word/i);
    await seedInput.clear();
    await seedInput.fill('v1-red123-star456-dance789');
    
    await expect(page.getByText(/Invalid seed format/i)).toBeVisible();
    
    const newGameButton = page.getByRole('button', { name: /New Game/i });
    await expect(newGameButton).toBeDisabled();
  });
  
  test('rejects seed with special characters', async ({ page }) => {
    await page.goto('/');
    
    const seedInput = page.getByPlaceholder(/v1-word-word-word/i);
    await seedInput.clear();
    await seedInput.fill('v1-red!-star@-dance#');
    
    await expect(page.getByText(/Invalid seed format/i)).toBeVisible();
    
    const newGameButton = page.getByRole('button', { name: /New Game/i });
    await expect(newGameButton).toBeDisabled();
  });
  
  test('rejects empty seed', async ({ page }) => {
    await page.goto('/');
    
    const seedInput = page.getByPlaceholder(/v1-word-word-word/i);
    await seedInput.clear();
    await seedInput.fill('');
    
    await expect(page.getByText(/Invalid seed format/i)).toBeVisible();
    
    const newGameButton = page.getByRole('button', { name: /New Game/i });
    await expect(newGameButton).toBeDisabled();
  });
});

test.describe('Shuffle Functionality', () => {
  test('shuffle generates valid seed', async ({ page }) => {
    await page.goto('/');
    
    const shuffleButton = page.getByTitle(/Shuffle seed/i);
    await expect(shuffleButton).toBeVisible();
    
    const seedInput = page.getByPlaceholder(/v1-word-word-word/i);
    const initialSeed = await seedInput.inputValue();
    
    await shuffleButton.click();
    
    await page.waitForTimeout(100);
    const newSeed = await seedInput.inputValue();
    
    expect(newSeed).not.toBe(initialSeed);
    
    expect(newSeed).toMatch(/^v1-[a-z]+-[a-z]+-[a-z]+$/);
    
    const newGameButton = page.getByRole('button', { name: /New Game/i });
    await expect(newGameButton).toBeEnabled();
  });
  
  test('multiple shuffles generate different seeds', async ({ page }) => {
    await page.goto('/');
    
    const shuffleButton = page.getByTitle(/Shuffle seed/i);
    const seedInput = page.getByPlaceholder(/v1-word-word-word/i);
    
    const seeds = new Set<string>();
    
    for (let i = 0; i < 5; i++) {
      await shuffleButton.click();
      await page.waitForTimeout(100);
      
      const seed = await seedInput.inputValue();
      seeds.add(seed);
      
      expect(seed).toMatch(/^v1-[a-z]+-[a-z]+-[a-z]+$/);
    }
    
    expect(seeds.size).toBeGreaterThan(1);
  });
  
  test('shuffled seed starts game successfully', async ({ page }) => {
    await page.goto('/');
    
    const shuffleButton = page.getByTitle(/Shuffle seed/i);
    await shuffleButton.click();
    
    await page.waitForTimeout(100);
    
    await page.getByRole('button', { name: /New Game/i }).click();
    
    await expect(page.locator('canvas').first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Copy/Paste Functionality', () => {
  test('copy button copies seed to clipboard', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    
    await page.goto('/');
    
    const seedInput = page.getByPlaceholder(/v1-word-word-word/i);
    const seed = await seedInput.inputValue();
    
    const copyButton = page.getByTitle(/Copy seed/i);
    await copyButton.click();
    
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toBe(seed);
    
    await expect(page.getByTestId('CheckIcon')).toBeVisible();
  });
  
  test('paste valid seed into input', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    
    await page.goto('/');
    
    const testSeed = 'v1-test-paste-seed';
    
    await page.evaluate((seed) => {
      navigator.clipboard.writeText(seed);
    }, testSeed);
    
    const seedInput = page.getByPlaceholder(/v1-word-word-word/i);
    await seedInput.clear();
    await seedInput.focus();
    
    await page.keyboard.press('Control+V');
    
    await page.waitForTimeout(100);
    
    const inputValue = await seedInput.inputValue();
    expect(inputValue).toBe(testSeed);
    
    const newGameButton = page.getByRole('button', { name: /New Game/i });
    await expect(newGameButton).toBeEnabled();
  });
});

test.describe('Seed Persistence', () => {
  test('seed persists across page reloads', async ({ page }) => {
    await page.goto('/');
    
    const seedInput = page.getByPlaceholder(/v1-word-word-word/i);
    const originalSeed = await seedInput.inputValue();
    
    await page.reload();
    
    await expect(seedInput).toBeVisible();
    const reloadedSeed = await seedInput.inputValue();
    
    expect(reloadedSeed).toBe(originalSeed);
  });
});

test.describe('Seed URL Parameter', () => {
  test('accepts seed from URL parameter', async ({ page }) => {
    await page.goto('/?seed=v1-url-test-seed');
    
    const seedInput = page.getByPlaceholder(/v1-word-word-word/i);
    await expect(seedInput).toBeVisible();
    
    const seedValue = await seedInput.inputValue();
    expect(seedValue).toBe('v1-url-test-seed');
    
    const newGameButton = page.getByRole('button', { name: /New Game/i });
    await expect(newGameButton).toBeEnabled();
  });
  
  test('invalid URL seed shows error', async ({ page }) => {
    await page.goto('/?seed=invalid-seed');
    
    const seedInput = page.getByPlaceholder(/v1-word-word-word/i);
    await expect(seedInput).toBeVisible();
    
    await expect(page.getByText(/Invalid seed format/i)).toBeVisible();
    
    const newGameButton = page.getByRole('button', { name: /New Game/i });
    await expect(newGameButton).toBeDisabled();
  });
});
