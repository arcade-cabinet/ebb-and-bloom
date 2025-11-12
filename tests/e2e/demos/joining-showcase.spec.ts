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

test.describe('Demo 3: Coordinate Targeting & Foreign Body Joining Showcase', () => {
  test.beforeAll(async () => {
    await ensureScreenshotsDir();
  });

  test('should navigate to joining showcase and display operations', async ({ page }) => {
    test.setTimeout(60000);
    
    await page.goto('/demos/joining-showcase');
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    const title = page.locator('text=/SDF Joining Showcase/');
    await expect(title).toBeVisible();
    
    const operationInfo = page.getByTestId('operation-info');
    await expect(operationInfo).toBeVisible();
  });

  test('should capture union operation screenshot', async ({ page }) => {
    test.setTimeout(60000);
    
    await page.goto('/demos/joining-showcase');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    const unionBtn = page.getByTestId('operation-union-btn');
    await expect(unionBtn).toBeVisible();
    await unionBtn.click();
    await page.waitForTimeout(2000);
    
    const operationInfo = page.getByTestId('operation-info');
    const operationName = await operationInfo.locator('h6').textContent();
    expect(operationName).toContain('Union');
    
    await page.screenshot({
      path: 'screenshots/demo-3-joining-union.png',
      fullPage: false
    });
  });

  test('should capture subtract operation screenshot', async ({ page }) => {
    test.setTimeout(60000);
    
    await page.goto('/demos/joining-showcase');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    const subtractBtn = page.getByTestId('operation-subtract-btn');
    await expect(subtractBtn).toBeVisible();
    await subtractBtn.click();
    await page.waitForTimeout(2000);
    
    const operationInfo = page.getByTestId('operation-info');
    const operationName = await operationInfo.locator('h6').textContent();
    expect(operationName).toContain('Subtract');
    
    await page.screenshot({
      path: 'screenshots/demo-3-joining-subtract.png',
      fullPage: false
    });
  });

  test('should capture smooth-union operation screenshot', async ({ page }) => {
    test.setTimeout(60000);
    
    await page.goto('/demos/joining-showcase');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    const smoothUnionBtn = page.getByTestId('operation-smooth-union-btn');
    await expect(smoothUnionBtn).toBeVisible();
    await smoothUnionBtn.click();
    await page.waitForTimeout(2000);
    
    const operationInfo = page.getByTestId('operation-info');
    const operationName = await operationInfo.locator('h6').textContent();
    expect(operationName).toContain('Smooth Union');
    
    await page.screenshot({
      path: 'screenshots/demo-3-joining-smoothunion.png',
      fullPage: false
    });
  });

  test('should verify all operation buttons are present', async ({ page }) => {
    test.setTimeout(60000);
    
    await page.goto('/demos/joining-showcase');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    const unionBtn = page.getByTestId('operation-union-btn');
    const subtractBtn = page.getByTestId('operation-subtract-btn');
    const intersectBtn = page.getByTestId('operation-intersect-btn');
    const smoothUnionBtn = page.getByTestId('operation-smooth-union-btn');
    const smoothSubtractBtn = page.getByTestId('operation-smooth-subtract-btn');
    
    await expect(unionBtn).toBeVisible();
    await expect(subtractBtn).toBeVisible();
    await expect(intersectBtn).toBeVisible();
    await expect(smoothUnionBtn).toBeVisible();
    await expect(smoothSubtractBtn).toBeVisible();
  });

  test('should switch between operations correctly', async ({ page }) => {
    test.setTimeout(60000);
    
    await page.goto('/demos/joining-showcase');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    const operationInfo = page.getByTestId('operation-info');
    
    const unionBtn = page.getByTestId('operation-union-btn');
    await unionBtn.click();
    await page.waitForTimeout(1000);
    let operationName = await operationInfo.locator('h6').textContent();
    expect(operationName).toContain('Union');
    
    const subtractBtn = page.getByTestId('operation-subtract-btn');
    await subtractBtn.click();
    await page.waitForTimeout(1000);
    operationName = await operationInfo.locator('h6').textContent();
    expect(operationName).toContain('Subtract');
    
    const intersectBtn = page.getByTestId('operation-intersect-btn');
    await intersectBtn.click();
    await page.waitForTimeout(1000);
    operationName = await operationInfo.locator('h6').textContent();
    expect(operationName).toContain('Intersect');
  });

  test('should toggle rotation', async ({ page }) => {
    test.setTimeout(60000);
    
    await page.goto('/demos/joining-showcase');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    const rotationBtn = page.getByTestId('toggle-rotation-btn');
    await expect(rotationBtn).toBeVisible();
    
    const initialText = await rotationBtn.textContent();
    expect(initialText).toContain('Enable Rotation');
    
    await rotationBtn.click();
    await page.waitForTimeout(1000);
    
    const updatedText = await rotationBtn.textContent();
    expect(updatedText).toContain('Stop Rotation');
  });
});
