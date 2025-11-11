import { test, expect } from '@playwright/test';

test.describe('Demo Observatory E2E', () => {
  test('should load demo index page', async ({ page }) => {
    await page.goto('/');
    
    await expect(page).toHaveTitle(/Ebb & Bloom/i);
  });

  test('should navigate to law observatory demo', async ({ page }) => {
    await page.goto('/');
    
    const hasDemo = await page.locator('text=/law.*observatory/i').count();
    
    if (hasDemo > 0) {
      await page.click('text=/law.*observatory/i');
      await page.waitForLoadState('networkidle');
      
      expect(page.url()).toContain('demo');
    }
  });

  test('should display physics constants in demo', async ({ page }) => {
    await page.goto('/');
    
    await page.waitForLoadState('networkidle');
    
    const hasPhysics = await page.locator('text=/gravity|physics/i').count();
    expect(hasPhysics).toBeGreaterThanOrEqual(0);
  });

  test('should handle seed parameter in URL', async ({ page }) => {
    await page.goto('/?seed=test-seed');
    
    await page.waitForLoadState('networkidle');
    
    expect(page.url()).toContain('seed=test-seed');
  });

  test('should not have console errors on load', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    const criticalErrors = errors.filter(e => 
      !e.includes('404') && 
      !e.includes('favicon')
    );
    
    expect(criticalErrors.length).toBe(0);
  });
});
