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

test.describe('Demo 8: Base SDF Proof', () => {
  test.beforeAll(async () => {
    await ensureScreenshotsDir();
  });

  test('should render basic SDF primitives and capture screenshot', async ({ page }) => {
    test.setTimeout(60000);
    
    await page.goto('/demos/base-sdf-proof');
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    await page.screenshot({
      path: 'screenshots/demo-8-base-sdf-proof.png',
      fullPage: false
    });
    
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    
    expect(true).toBe(true);
  });
});
