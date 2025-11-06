import { test, expect } from '@playwright/test';

test.describe('Ebb & Bloom Game Startup', () => {
  test('should load the game without errors', async ({ page }) => {
    // Navigate to the game
    await page.goto('/');
    
    // Check that the page title is correct
    await expect(page).toHaveTitle(/Ebb.*Bloom/);
    
    // Wait for the game canvas to load
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 30000 });
    
    // Check that Phaser has initialized
    const phaserGame = await page.evaluate(() => {
      return typeof window.Phaser !== 'undefined';
    });
    expect(phaserGame).toBeTruthy();
    
    // Verify no critical console errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Wait a bit to collect any errors
    await page.waitForTimeout(3000);
    
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
    
    // Wait for the game to initialize
    await page.waitForTimeout(5000);
    
    // Check that BitECS world exists
    const ecsWorldExists = await page.evaluate(() => {
      // This would check for your actual ECS world instance
      return typeof window.ecsWorld !== 'undefined';
    });
    
    // Note: You'll need to expose your ECS world to window in dev mode
    // Or use a different method to verify ECS initialization
    console.log('ECS World check:', ecsWorldExists);
  });

  test('should handle touch input on mobile', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Touch test only relevant on mobile');
    
    await page.goto('/');
    
    // Wait for game to load
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    
    // Simulate touch interaction
    await canvas.tap();
    
    // Verify touch was handled (you'll need to implement touch feedback)
    // This is a placeholder - implement based on your touch handling
    await page.waitForTimeout(1000);
  });
});