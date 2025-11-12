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

test.describe('Demo 6: ECS Integration Showcase', () => {
  test.beforeAll(async () => {
    await ensureScreenshotsDir();
  });

  test('should capture ECS integration screenshot and verify entity count', async ({ page }) => {
    test.setTimeout(60000);
    
    await page.goto('/demos/ecs-integration');
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    const entityCount = page.getByTestId('entity-count');
    await expect(entityCount).toBeVisible();
    
    const countText = await entityCount.textContent();
    const count = parseInt(countText || '0', 10);
    expect(count).toBeGreaterThan(0);
    
    await page.waitForTimeout(2000);
    
    await page.screenshot({
      path: 'screenshots/demo-6-ecs-integration.png',
      fullPage: false
    });
    
    const title = page.locator('text=/ECS Integration Showcase/');
    await expect(title).toBeVisible();
    
    const addH2OBtn = page.getByTestId('add-h2o-btn');
    await expect(addH2OBtn).toBeVisible();
    
    const cycleMaterialsBtn = page.getByTestId('cycle-materials-btn');
    await expect(cycleMaterialsBtn).toBeVisible();
    
    expect(true).toBe(true);
  });
});
