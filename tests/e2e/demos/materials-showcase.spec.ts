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

test.describe('Demo 2: Materials System Showcase', () => {
  test.beforeAll(async () => {
    await ensureScreenshotsDir();
  });

  test('should capture chemical elements screenshot', async ({ page }) => {
    test.setTimeout(60000);
    
    await page.goto('/demos/materials-showcase');
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    const elementsBtn = page.getByTestId('elements-btn');
    await expect(elementsBtn).toBeVisible();
    await elementsBtn.click();
    await page.waitForTimeout(2000);
    
    const title = page.locator('text=/Material System Showcase/');
    await expect(title).toBeVisible();
    
    await page.screenshot({
      path: 'screenshots/demo-2-materials-elements.png',
      fullPage: false
    });
    
    expect(true).toBe(true);
  });

  test('should capture biome materials screenshot', async ({ page }) => {
    test.setTimeout(60000);
    
    await page.goto('/demos/materials-showcase');
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    const biomesBtn = page.getByTestId('biomes-btn');
    await expect(biomesBtn).toBeVisible();
    await biomesBtn.click();
    await page.waitForTimeout(2000);
    
    const title = page.locator('text=/Material System Showcase/');
    await expect(title).toBeVisible();
    
    await page.screenshot({
      path: 'screenshots/demo-2-materials-biomes.png',
      fullPage: false
    });
    
    expect(true).toBe(true);
  });
});
