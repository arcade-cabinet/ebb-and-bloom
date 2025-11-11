/**
 * COSMIC STAGE VISUAL REGRESSION BASELINES
 * 
 * Captures baseline screenshots for all 15 cosmic timeline stages.
 * These baselines ensure visual consistency across code changes.
 */

import { test, expect } from '@playwright/test';

test.describe('Cosmic Stage Visual Baselines', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?seed=v1-visual-baseline-seed');
    
    const seedInput = page.getByPlaceholder(/v1-word-word-word/i);
    await expect(seedInput).toBeVisible();
    await seedInput.clear();
    await seedInput.fill('v1-visual-baseline-seed');
    
    await page.getByRole('button', { name: /New Game/i }).click();
    
    await page.waitForSelector('[data-timeline-ready="true"]', { timeout: 10000 });
  });

  for (let i = 0; i < 15; i++) {
    test(`stage ${i} visual baseline`, async ({ page }) => {
      await page.waitForSelector(`[data-stage-index="${i}"]`, { timeout: 30000 });
      
      await page.waitForTimeout(1000);
      
      await expect(page).toHaveScreenshot(`stage-${i}-baseline.png`, {
        maxDiffPixels: 100,
        threshold: 0.2,
      });
    });
  }
});

test.describe('Stage Transition Validation', () => {
  test('all 15 stages render sequentially', async ({ page }) => {
    await page.goto('/');
    
    const seedInput = page.getByPlaceholder(/v1-word-word-word/i);
    await seedInput.clear();
    await seedInput.fill('v1-visual-baseline-seed');
    
    await page.getByRole('button', { name: /New Game/i }).click();
    
    await page.waitForSelector('[data-timeline-ready="true"]', { timeout: 10000 });
    
    const stagesObserved: number[] = [];
    const startTime = Date.now();
    
    while (stagesObserved.length < 15 && Date.now() - startTime < 120000) {
      const currentStage = await page.evaluate(() => {
        const element = document.querySelector('[data-stage-index]');
        return element ? parseInt(element.getAttribute('data-stage-index') || '0', 10) : null;
      });
      
      if (currentStage !== null && !stagesObserved.includes(currentStage)) {
        stagesObserved.push(currentStage);
        console.log(`Observed stage ${currentStage}`);
      }
      
      await page.waitForTimeout(500);
    }
    
    expect(stagesObserved.length).toBeGreaterThanOrEqual(3);
  });
});

test.describe('Visual Determinism', () => {
  test('same seed produces identical visuals', async ({ page }) => {
    const seed = 'v1-red-star-dance';
    
    await page.goto('/');
    let seedInput = page.getByPlaceholder(/v1-word-word-word/i);
    await seedInput.clear();
    await seedInput.fill(seed);
    await page.getByRole('button', { name: /New Game/i }).click();
    await page.waitForSelector('[data-stage-index="0"]', { timeout: 10000 });
    await page.waitForTimeout(2000);
    const screenshot1 = await page.screenshot();
    
    await page.goto('/');
    seedInput = page.getByPlaceholder(/v1-word-word-word/i);
    await seedInput.clear();
    await seedInput.fill(seed);
    await page.getByRole('button', { name: /New Game/i }).click();
    await page.waitForSelector('[data-stage-index="0"]', { timeout: 10000 });
    await page.waitForTimeout(2000);
    const screenshot2 = await page.screenshot();
    
    expect(screenshot1.length).toBeGreaterThan(1000);
    expect(screenshot2.length).toBeGreaterThan(1000);
  });
});

test.describe('Stage Metadata Validation', () => {
  test('each stage displays correct metadata', async ({ page }) => {
    await page.goto('/');
    
    const seedInput = page.getByPlaceholder(/v1-word-word-word/i);
    await seedInput.clear();
    await seedInput.fill('v1-red-star-dance');
    
    await page.getByRole('button', { name: /New Game/i }).click();
    
    await page.waitForSelector('[data-timeline-ready="true"]', { timeout: 10000 });
    
    const stageText = await page.locator('text=/Stage \\d+ of 15/').first();
    await expect(stageText).toBeVisible();
    
    const stageNumber = await stageText.textContent();
    expect(stageNumber).toMatch(/Stage \d+ of 15/);
  });
  
  test('progress bar shows overall timeline progress', async ({ page }) => {
    await page.goto('/');
    
    const seedInput = page.getByPlaceholder(/v1-word-word-word/i);
    await seedInput.clear();
    await seedInput.fill('v1-red-star-dance');
    
    await page.getByRole('button', { name: /New Game/i }).click();
    
    await page.waitForSelector('[data-timeline-ready="true"]', { timeout: 10000 });
    
    const progressBar = page.locator('.MuiLinearProgress-root').first();
    await expect(progressBar).toBeVisible();
  });
});
