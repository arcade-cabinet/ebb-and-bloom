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

test.describe('Demo 1: Basic Primitives Showcase', () => {
  test.beforeAll(async () => {
    await ensureScreenshotsDir();
  });

  test('should capture all 21 primitives screenshot', async ({ page }) => {
    test.setTimeout(60000);
    
    await page.goto('/demos/primitives-showcase');
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    const showAllBtn = page.getByTestId('show-all-btn');
    await expect(showAllBtn).toBeVisible();
    await showAllBtn.click();
    await page.waitForTimeout(2000);
    
    const primitiveCountText = await page.locator('text=/Primitives: \\d+/').textContent();
    expect(primitiveCountText).toContain('Primitives: 21');
    
    await page.screenshot({
      path: 'screenshots/demo-1-primitives.png',
      fullPage: false
    });
    
    const title = page.locator('text=/SDF Primitives Showcase/');
    await expect(title).toBeVisible();
    
    expect(true).toBe(true);
  });
});
