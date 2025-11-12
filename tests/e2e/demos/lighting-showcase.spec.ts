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

test.describe('Demo 5: R3F Lighting Integration Showcase', () => {
  test.beforeAll(async () => {
    await ensureScreenshotsDir();
  });

  test('should display lighting controls and capture lighting setup screenshots', async ({ page }) => {
    test.setTimeout(90000);
    
    await page.goto('/demos/lighting-showcase');
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    const title = page.locator('text=/Lighting Showcase/');
    await expect(title).toBeVisible();
    
    const directionalToggle = page.getByTestId('toggle-directional');
    await expect(directionalToggle).toBeVisible();
    
    const pointToggle = page.getByTestId('toggle-point');
    await expect(pointToggle).toBeVisible();
    
    const spotToggle = page.getByTestId('toggle-spot');
    await expect(spotToggle).toBeVisible();
    
    const directionalPreset = page.getByTestId('preset-directional-only');
    await expect(directionalPreset).toBeVisible();
    await directionalPreset.click();
    await page.waitForTimeout(2000);
    
    await page.screenshot({
      path: 'screenshots/demo-5-lighting-directional.png',
      fullPage: false
    });
    
    const pointPreset = page.getByTestId('preset-point-only');
    await pointPreset.click();
    await page.waitForTimeout(2000);
    
    await page.screenshot({
      path: 'screenshots/demo-5-lighting-point.png',
      fullPage: false
    });
    
    const spotPreset = page.getByTestId('preset-spot-only');
    await spotPreset.click();
    await page.waitForTimeout(2000);
    
    await page.screenshot({
      path: 'screenshots/demo-5-lighting-spot.png',
      fullPage: false
    });
    
    const combinedPreset = page.getByTestId('preset-combined');
    await combinedPreset.click();
    await page.waitForTimeout(2000);
    
    await page.screenshot({
      path: 'screenshots/demo-5-lighting-combined.png',
      fullPage: false
    });
    
    const setupText = page.locator('text=/Active Setup:/');
    await expect(setupText).toBeVisible();
    
    expect(true).toBe(true);
  });
});
