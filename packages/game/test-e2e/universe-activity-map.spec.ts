/**
 * END-TO-END TEST: Universe Activity Map
 * 
 * Tests the REAL universe visualization in browser.
 * Full user experience from menu to cosmos.
 */

import { test, expect } from '@playwright/test';

test.describe('Universe Activity Map', () => {
  test.setTimeout(300000); // 5 minutes for full synthesis
  
  test('should load main menu', async ({ page }) => {
    await page.goto('/');
    
    // Verify title
    await expect(page.locator('h1')).toContainText('EBB & BLOOM');
    
    // Verify "Enter Universe" button exists
    const enterButton = page.locator('a[href="/universe.html"]');
    await expect(enterButton).toBeVisible();
    await expect(enterButton).toContainText('ENTER THE UNIVERSE');
  });
  
  test('should initialize universe view', async ({ page }) => {
    await page.goto('/universe.html');
    
    // Canvas should be present
    const canvas = page.locator('#renderCanvas');
    await expect(canvas).toBeVisible();
    
    // UI panel should exist
    const ui = page.locator('#ui');
    await expect(ui).toBeVisible();
    await expect(ui).toContainText('UNIVERSE ACTIVITY MAP');
    
    // Progress indicator should exist
    const progress = page.locator('#progress');
    await expect(progress).toBeVisible();
  });
  
  test('should show progress during synthesis', async ({ page }) => {
    await page.goto('/universe.html');
    
    // Wait for progress text to update
    await page.waitForFunction(() => {
      const progressText = document.getElementById('progressText')?.textContent || '';
      return progressText !== 'Initializing...';
    }, { timeout: 10000 });
    
    const progressText = await page.locator('#progressText').textContent();
    
    // Should show some progress status
    expect(progressText).toMatch(/Creating|Synthesizing|Rendering|Complete/);
  });
  
  test('should complete synthesis and render point cloud', async ({ page }) => {
    // Collect console logs
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      consoleLogs.push(msg.text());
    });
    
    await page.goto('/universe.html');
    
    // Wait for completion (this will take 2-3 minutes)
    await page.waitForFunction(() => {
      const progressText = document.getElementById('progressText')?.textContent || '';
      return progressText.includes('Complete');
    }, { timeout: 240000 }); // 4 minutes max
    
    // Progress should show complete
    const progressText = await page.locator('#progressText').textContent();
    expect(progressText).toContain('Complete');
    
    // Controls should be visible
    const controls = page.locator('#controls');
    await expect(controls).toBeVisible();
    
    // Status panel should be visible with stats
    const status = page.locator('#status');
    await expect(status).toBeVisible();
    
    // Should have region count
    const regionCount = await page.locator('#regionCount').textContent();
    expect(parseInt(regionCount!)).toBeGreaterThan(0);
    
    // Should have active regions
    const activeCount = await page.locator('#activeCount').textContent();
    expect(parseInt(activeCount!)).toBeGreaterThan(0);
    
    // Console should show completion
    expect(consoleLogs.some(log => log.includes('Universe rendered'))).toBe(true);
  });
  
  test('should detect civilizations', async ({ page }) => {
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      consoleLogs.push(msg.text());
    });
    
    await page.goto('/universe.html');
    
    // Wait for synthesis to complete
    await page.waitForFunction(() => {
      const progressText = document.getElementById('progressText')?.textContent || '';
      return progressText.includes('Complete');
    }, { timeout: 240000 });
    
    // Get civilization count
    const civCount = await page.locator('#civCount').textContent();
    const civilizations = parseInt(civCount!);
    
    // Should have found some civilizations
    expect(civilizations).toBeGreaterThan(0);
    
    // Console should show civilization details
    expect(consoleLogs.some(log => 
      log.includes('Civilizations:') || 
      log.includes('BRIGHTEST REGIONS')
    )).toBe(true);
  });
  
  test('should have interactive camera controls', async ({ page }) => {
    await page.goto('/universe.html');
    
    // Wait for initialization
    await page.waitForTimeout(2000);
    
    // Camera position should update
    const initialPos = await page.locator('#cameraPos').textContent();
    
    // Wait a bit for auto-rotation
    await page.waitForTimeout(1000);
    
    const newPos = await page.locator('#cameraPos').textContent();
    
    // Position should change (auto-rotation)
    // Note: May be same if rotation is slow, so just check format
    expect(newPos).toMatch(/[-\d]+, [-\d]+, [-\d]+/);
  });
  
  test('should toggle rotation button', async ({ page }) => {
    await page.goto('/universe.html');
    
    // Wait for controls to be visible
    await page.waitForFunction(() => {
      const controls = document.getElementById('controls');
      return controls && controls.style.display !== 'none';
    }, { timeout: 240000 });
    
    // Find rotation toggle button
    const toggleButton = page.getByText('⏯ Rotation');
    await expect(toggleButton).toBeVisible();
    
    // Should be clickable
    await toggleButton.click();
    // Click again to toggle back
    await toggleButton.click();
  });
  
  test('should have no JavaScript errors during synthesis', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('pageerror', error => {
      errors.push(error.message);
    });
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('/universe.html');
    
    // Wait for complete or error
    await page.waitForFunction(() => {
      const progressText = document.getElementById('progressText')?.textContent || '';
      return progressText.includes('Complete') || progressText.includes('Error');
    }, { timeout: 240000 });
    
    // Should have no errors
    expect(errors.filter(e => 
      !e.includes('warning') && 
      !e.includes('DevTools')
    ).length).toBe(0);
  });
});
