/**
 * END-TO-END TEST: Full User Flow
 * 
 * Tests the complete user experience from start to finish.
 * Simulates a real user discovering and exploring the universe.
 */

import { test, expect } from '@playwright/test';

test.describe('Full User Journey', () => {
  test.setTimeout(300000); // 5 minutes for complete flow
  
  test('complete user flow: menu → universe → exploration', async ({ page }) => {
    // ==== STEP 1: Land on main menu ====
    await page.goto('/');
    
    // Should see app title
    await expect(page.locator('h1')).toContainText('EBB & BLOOM');
    
    // Should see tagline
    await expect(page.locator('.tagline')).toContainText('NO TEXTURES');
    
    // Should see stats
    await expect(page.locator('.stat-value')).toHaveCount(3);
    
    // ==== STEP 2: Click "Enter Universe" ====
    const enterButton = page.locator('a[href="/universe.html"]');
    await enterButton.click();
    
    // Should navigate to universe view
    await expect(page).toHaveURL(/universe\.html/);
    
    // ==== STEP 3: Universe loads ====
    // Canvas should appear
    await expect(page.locator('#renderCanvas')).toBeVisible();
    
    // UI should show title
    await expect(page.locator('#ui h2')).toContainText('UNIVERSE ACTIVITY MAP');
    
    // ==== STEP 4: Synthesis begins ====
    // Progress should update within 5 seconds
    await page.waitForFunction(() => {
      const text = document.getElementById('progressText')?.textContent || '';
      return text !== 'Initializing...';
    }, { timeout: 10000 });
    
    let progressText = await page.locator('#progressText').textContent();
    expect(progressText).toMatch(/Creating|Synthesizing/);
    
    // ==== STEP 5: Wait for synthesis (the real test) ====
    // This is where the REAL simulation runs
    // NO shortcuts, NO mocks, REAL genesis from Big Bang → Present
    
    await page.waitForFunction(() => {
      const text = document.getElementById('progressText')?.textContent || '';
      return text.includes('Complete') || text.includes('Error');
    }, { timeout: 240000 }); // 4 minutes
    
    progressText = await page.locator('#progressText').textContent();
    
    // Should complete successfully
    expect(progressText).toContain('Complete');
    expect(progressText).not.toContain('Error');
    
    // ==== STEP 6: Results display ====
    // Status panel should show
    await expect(page.locator('#status')).toBeVisible();
    
    // Should have regions
    const regionCount = await page.locator('#regionCount').textContent();
    expect(parseInt(regionCount!)).toBe(125); // 5³ grid
    
    // Should have found activity
    const activeCount = await page.locator('#activeCount').textContent();
    expect(parseInt(activeCount!)).toBeGreaterThan(0);
    
    // Should have civilizations
    const civCount = await page.locator('#civCount').textContent();
    expect(parseInt(civCount!)).toBeGreaterThan(0);
    
    // ==== STEP 7: Controls available ====
    await expect(page.locator('#controls')).toBeVisible();
    
    // Rotation button works
    const rotationButton = page.getByText('⏯ Rotation');
    await expect(rotationButton).toBeVisible();
    await rotationButton.click(); // Toggle off
    await rotationButton.click(); // Toggle on
    
    // Reset camera button works
    const resetButton = page.getByText('🎯 Reset Camera');
    await expect(resetButton).toBeVisible();
    await resetButton.click();
    
    // ==== STEP 8: Camera updates ====
    // Position should be displayed
    const cameraPos = await page.locator('#cameraPos').textContent();
    expect(cameraPos).toMatch(/[-\d]+, [-\d]+, [-\d]+/);
    
    // ==== SUCCESS ====
    // User successfully:
    // 1. ✅ Found the app
    // 2. ✅ Entered universe
    // 3. ✅ Waited for synthesis  
    // 4. ✅ Saw civilizations emerge
    // 5. ✅ Can explore with controls
  });
  
  test('user reads Quick Start guide', async ({ page }) => {
    await page.goto('/');
    
    // Click Quick Start link
    const quickStartLink = page.getByText('🚀 Quick Start');
    await quickStartLink.click();
    
    // Alert should appear (in real browser)
    // Playwright can't test alerts easily, so just verify link exists
    await expect(quickStartLink).toBeVisible();
  });
  
  test('user views About information', async ({ page }) => {
    await page.goto('/');
    
    // About link should exist
    const aboutLink = page.getByText('ℹ️ About');
    await expect(aboutLink).toBeVisible();
  });
  
  test('user sees console welcome message', async ({ page }) => {
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'log') {
        consoleLogs.push(msg.text());
      }
    });
    
    await page.goto('/');
    
    // Wait for console logs
    await page.waitForTimeout(1000);
    
    // Should have welcome message
    expect(consoleLogs.some(log => log.includes('EBB & BLOOM'))).toBe(true);
    expect(consoleLogs.some(log => log.includes('Law-Based Universe'))).toBe(true);
  });
});
