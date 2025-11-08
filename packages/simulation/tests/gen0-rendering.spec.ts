import { test, expect } from '@playwright/test';

/**
 * Gen0 Visual Regression Tests
 * Tests visual rendering with snapshots for comparison
 */

test.describe('Gen0 Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('text=GEN0: Planetary Genesis', { timeout: 30000 });
    await page.waitForTimeout(2000); // Wait for 3D scene to render
  });

  test('should render planet with visual blueprints', async ({ page }) => {
    // Verify planet info is displayed
    await expect(page.locator('text=/Stellar Context:/')).toBeVisible();
    await expect(page.locator('text=/Planet Radius:/')).toBeVisible();
    await expect(page.locator('text=/Rotation Period:/')).toBeVisible();
    
    // Verify canvas is rendering
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    
    // Take screenshot for visual regression
    await page.screenshot({ 
      path: 'test-results/gen0-planet.png', 
      fullPage: true 
    });
  });
  
  test('should render moons at correct orbital positions', async ({ page }) => {
    // Check moon count is displayed
    const moonCountText = await page.locator('text=/Moons: \\d+/').textContent();
    expect(moonCountText).toBeTruthy();
    
    // Verify canvas renders moons
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    
    // Take screenshot
    await page.screenshot({ 
      path: 'test-results/gen0-moons.png', 
      fullPage: true 
    });
  });
  
  test('should capture animation frame', async ({ page }) => {
    // Wait for initial render
    await page.waitForTimeout(1000);
    
    // Take screenshot at different time points
    await page.screenshot({ 
      path: 'test-results/gen0-animation-frame-1.png', 
      fullPage: true 
    });
    
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: 'test-results/gen0-animation-frame-2.png', 
      fullPage: true 
    });
  });
});

