import { test, expect, Page } from '@playwright/test';

// Helper function to wait for ECS initialization
async function waitForECSInitialization(page: Page, timeout = 10000) {
  await page.waitForFunction(() => {
    return typeof (window as any).ecsInitialized !== 'undefined' && (window as any).ecsInitialized === true;
  }, { timeout });
}

test.describe('Ebb & Bloom Game Startup', () => {
  test('should load the game without errors', async ({ page }) => {
    // Collect console errors from the start
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Navigate to the game
    await page.goto('/');
    
    // Check that the page title is correct
    await expect(page).toHaveTitle(/Ebb.*Bloom/);
    
    // Wait for the game canvas to load
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 30000 });
    
    // Check that Phaser has initialized
    const phaserGame = await page.evaluate(() => {
      return typeof (window as any).Phaser !== 'undefined';
    });
    expect(phaserGame).toBeTruthy();
    
    // Wait for ECS initialization to complete
    await waitForECSInitialization(page);
    
    // Filter out acceptable errors (like dev server warnings)
    const criticalErrors = errors.filter(error => 
      !error.includes('DevTools') && 
      !error.includes('[HMR]') &&
      !error.includes('404')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });

  test('should render mobile-friendly viewport', async ({ page }) => {
    await page.goto('/');
    
    // Check viewport meta tag for mobile
    const viewportMeta = page.locator('meta[name="viewport"]');
    await expect(viewportMeta).toHaveAttribute('content', /width=device-width/);
    
    // Verify responsive design works
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    
    // Check that canvas scales appropriately
    const canvasSize = await canvas.boundingBox();
    expect(canvasSize?.width).toBeLessThanOrEqual(375);
  });

  test('should initialize ECS world', async ({ page }) => {
    await page.goto('/');
    
    // Wait for ECS world to be initialized (exposed in dev mode)
    await waitForECSInitialization(page);
    
    // Check that BitECS world exists
    const ecsWorldExists = await page.evaluate(() => {
      return typeof (window as any).ecsWorld !== 'undefined';
    });
    
    expect(ecsWorldExists).toBeTruthy();
  });

  test('should handle touch input on mobile', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Touch test only relevant on mobile');
    
    await page.goto('/');
    
    // Wait for game to load
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    
    // Wait for ECS initialization to complete
    await waitForECSInitialization(page);
    
    // Simulate touch interaction
    await canvas.tap();
    
    // Verify canvas is still visible after touch (basic interaction test)
    await expect(canvas).toBeVisible();
  });
});