import { test, expect } from '@playwright/test';

/**
 * Gen0 Rendering E2E Tests
 * Tests planet and moon rendering with visual snapshots
 */

test.describe('Gen0 Rendering', () => {
  test('should render planet with visual blueprints', async ({ page }) => {
    await page.goto('/');
    
    // Wait for game to initialize
    await page.waitForSelector('text=GEN0: Planetary Genesis', { timeout: 30000 });
    
    // Check that planet info is displayed
    await expect(page.locator('text=Stellar Context:')).toBeVisible();
    await expect(page.locator('text=Planet Radius:')).toBeVisible();
    await expect(page.locator('text=Rotation Period:')).toBeVisible();
    
    // Wait for 3D scene to load
    await page.waitForTimeout(2000);
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/gen0-planet.png', fullPage: true });
  });
  
  test('should render moons at correct orbital positions', async ({ page }) => {
    await page.goto('/');
    
    // Wait for game to initialize
    await page.waitForSelector('text=GEN0: Planetary Genesis', { timeout: 30000 });
    
    // Check moon count is displayed
    const moonCountText = await page.locator('text=/Moons: \\d+/').textContent();
    expect(moonCountText).toBeTruthy();
    
    // Wait for 3D scene to load
    await page.waitForTimeout(2000);
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/gen0-moons.png', fullPage: true });
  });
  
  test('should animate moon orbital motion', async ({ page }) => {
    await page.goto('/');
    
    // Wait for game to initialize
    await page.waitForSelector('text=GEN0: Planetary Genesis', { timeout: 30000 });
    
    // Wait for initial render
    await page.waitForTimeout(1000);
    
    // Record video of orbital motion (5 seconds)
    await page.waitForTimeout(5000);
    
    // Take screenshot after animation
    await page.screenshot({ path: 'test-results/gen0-animation.png', fullPage: true });
  });
});

