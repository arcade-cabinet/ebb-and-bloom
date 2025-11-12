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

test.describe('Demo 4: Material Blending Showcase', () => {
  test.beforeAll(async () => {
    await ensureScreenshotsDir();
  });

  test('should capture replace blend mode screenshot', async ({ page }) => {
    test.setTimeout(60000);
    
    await page.goto('/demos/blending-showcase');
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    const replaceBtn = page.getByTestId('replace-btn');
    await expect(replaceBtn).toBeVisible();
    await replaceBtn.click();
    await page.waitForTimeout(2000);
    
    const title = page.getByTestId('showcase-title');
    await expect(title).toBeVisible();
    await expect(title).toHaveText('Material Blending Showcase');
    
    const currentMode = page.getByTestId('current-mode');
    await expect(currentMode).toContainText('REPLACE');
    
    await page.screenshot({
      path: 'screenshots/demo-4-blend-replace.png',
      fullPage: false
    });
    
    expect(true).toBe(true);
  });

  test('should capture mix blend mode screenshot', async ({ page }) => {
    test.setTimeout(60000);
    
    await page.goto('/demos/blending-showcase');
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    const mixBtn = page.getByTestId('mix-btn');
    await expect(mixBtn).toBeVisible();
    await mixBtn.click();
    await page.waitForTimeout(2000);
    
    const title = page.getByTestId('showcase-title');
    await expect(title).toBeVisible();
    
    const currentMode = page.getByTestId('current-mode');
    await expect(currentMode).toContainText('MIX');
    
    await page.screenshot({
      path: 'screenshots/demo-4-blend-mix.png',
      fullPage: false
    });
    
    expect(true).toBe(true);
  });

  test('should capture add blend mode screenshot', async ({ page }) => {
    test.setTimeout(60000);
    
    await page.goto('/demos/blending-showcase');
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    const addBtn = page.getByTestId('add-btn');
    await expect(addBtn).toBeVisible();
    await addBtn.click();
    await page.waitForTimeout(2000);
    
    const title = page.getByTestId('showcase-title');
    await expect(title).toBeVisible();
    
    const currentMode = page.getByTestId('current-mode');
    await expect(currentMode).toContainText('ADD');
    
    await page.screenshot({
      path: 'screenshots/demo-4-blend-add.png',
      fullPage: false
    });
    
    expect(true).toBe(true);
  });

  test('should capture multiply blend mode screenshot', async ({ page }) => {
    test.setTimeout(60000);
    
    await page.goto('/demos/blending-showcase');
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    const multiplyBtn = page.getByTestId('multiply-btn');
    await expect(multiplyBtn).toBeVisible();
    await multiplyBtn.click();
    await page.waitForTimeout(2000);
    
    const title = page.getByTestId('showcase-title');
    await expect(title).toBeVisible();
    
    const currentMode = page.getByTestId('current-mode');
    await expect(currentMode).toContainText('MULTIPLY');
    
    await page.screenshot({
      path: 'screenshots/demo-4-blend-multiply.png',
      fullPage: false
    });
    
    expect(true).toBe(true);
  });

  test('should display blend mode labels and descriptions', async ({ page }) => {
    test.setTimeout(60000);
    
    await page.goto('/demos/blending-showcase');
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const title = page.getByTestId('showcase-title');
    await expect(title).toBeVisible();
    await expect(title).toHaveText('Material Blending Showcase');
    
    const modeDescription = page.getByTestId('mode-description');
    await expect(modeDescription).toBeVisible();
    
    const blendModeToggle = page.getByTestId('blend-mode-toggle');
    await expect(blendModeToggle).toBeVisible();
    
    const replaceBtn = page.getByTestId('replace-btn');
    await expect(replaceBtn).toBeVisible();
    
    const mixBtn = page.getByTestId('mix-btn');
    await expect(mixBtn).toBeVisible();
    
    const addBtn = page.getByTestId('add-btn');
    await expect(addBtn).toBeVisible();
    
    const multiplyBtn = page.getByTestId('multiply-btn');
    await expect(multiplyBtn).toBeVisible();
    
    expect(true).toBe(true);
  });
});
