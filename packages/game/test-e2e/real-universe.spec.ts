/**
 * REAL E2E TEST: The Actual Universe View
 * 
 * Tests universe.html as a real user would experience it.
 * NO shortcuts, NO test harnesses, REAL system.
 */

import { test, expect } from '@playwright/test';

test.describe('Real Universe Experience', () => {
  test.setTimeout(300000); // 5 minutes - REAL synthesis takes time
  
  test('user opens universe and sees synthesis progress', async ({ page }) => {
    // Collect all console output to verify synthesis is running
    const logs: string[] = [];
    page.on('console', msg => {
      const text = msg.text();
      logs.push(text);
      // Print to test output so we can see what's happening
      if (text.includes('[Genesis]') || text.includes('[UniverseActivityMap]')) {
        console.log(`[BROWSER] ${text}`);
      }
    });
    
    // Collect errors
    const errors: string[] = [];
    page.on('pageerror', err => {
      errors.push(err.message);
      console.error(`[ERROR] ${err.message}`);
    });
    
    console.log('\n=== NAVIGATING TO UNIVERSE ===\n');
    await page.goto('/universe.html');
    
    // Canvas should appear immediately
    await expect(page.locator('#renderCanvas')).toBeVisible();
    console.log('✓ Canvas visible');
    
    // UI panel should appear
    await expect(page.locator('#ui')).toBeVisible();
    await expect(page.locator('#ui h2')).toContainText('UNIVERSE ACTIVITY MAP');
    console.log('✓ UI panel visible');
    
    // Progress element should exist
    await expect(page.locator('#progress')).toBeVisible();
    console.log('✓ Progress bar visible');
    
    // Wait for progress to update (synthesis starting)
    console.log('\n=== WAITING FOR SYNTHESIS START ===\n');
    await page.waitForFunction(() => {
      const text = document.getElementById('progressText')?.textContent || '';
      return text !== 'Initializing...' && text.length > 0;
    }, { timeout: 10000 });
    
    let progressText = await page.locator('#progressText').textContent();
    console.log(`Progress: ${progressText}`);
    
    // Should show estimation status
    expect(progressText).toMatch(/Creating|Estimating/);
    
    // Wait 10 seconds and check progress updates
    console.log('\n=== CHECKING PROGRESS UPDATES ===\n');
    await page.waitForTimeout(10000);
    
    const progressText2 = await page.locator('#progressText').textContent();
    console.log(`Progress after 10s: ${progressText2}`);
    
    // Progress should have updated (showing region count)
    expect(progressText2).toMatch(/region \d+/);
    
    // Wait for synthesis to complete (THE REAL TEST - 2-3 minutes)
    console.log('\n=== WAITING FOR SYNTHESIS COMPLETE (2-3 min) ===\n');
    
    await page.waitForFunction(() => {
      const text = document.getElementById('progressText')?.textContent || '';
      return text.includes('Complete') || text.includes('Error');
    }, { timeout: 240000 }); // 4 minutes max
    
    const finalProgressText = await page.locator('#progressText').textContent();
    console.log(`Final progress: ${finalProgressText}`);
    
    // Should complete successfully
    expect(finalProgressText).toContain('Complete');
    expect(finalProgressText).not.toContain('Error');
    
    // No JavaScript errors should have occurred
    console.log(`\nJavaScript errors: ${errors.length}`);
    expect(errors.length).toBe(0);
    
    // Controls should be visible
    await expect(page.locator('#controls')).toBeVisible();
    console.log('✓ Controls visible');
    
    // Status panel should show data
    await expect(page.locator('#status')).toBeVisible();
    
    const regionCount = await page.locator('#regionCount').textContent();
    const activeCount = await page.locator('#activeCount').textContent();
    const civCount = await page.locator('#civCount').textContent();
    
    console.log(`\n=== FINAL RESULTS ===`);
    console.log(`Regions: ${regionCount}`);
    console.log(`Active: ${activeCount}`);
    console.log(`Civilizations: ${civCount}`);
    
    // Should have synthesized 125 regions
    expect(parseInt(regionCount!)).toBe(125);
    
    // Should have found activity
    expect(parseInt(activeCount!)).toBeGreaterThan(0);
    
    // Should have found civilizations
    expect(parseInt(civCount!)).toBeGreaterThan(0);
    
    // Console should show completion
    expect(logs.some(log => log.includes('Universe rendered'))).toBe(true);
    
    console.log('\n✅ REAL UNIVERSE TEST PASSED\n');
  });
  
  test('user can interact with camera controls', async ({ page }) => {
    await page.goto('/universe.html');
    
    // Wait for synthesis to complete
    await page.waitForFunction(() => {
      const text = document.getElementById('progressText')?.textContent || '';
      return text.includes('Complete');
    }, { timeout: 240000 });
    
    // Get initial camera position
    const initialPos = await page.locator('#cameraPos').textContent();
    console.log(`Initial camera: ${initialPos}`);
    
    // Click toggle rotation
    await page.getByText('⏯ Rotation').click();
    console.log('✓ Toggled rotation off');
    
    await page.waitForTimeout(1000);
    
    // Position shouldn't change (rotation off)
    const posAfterToggle = await page.locator('#cameraPos').textContent();
    
    // Click reset camera
    await page.getByText('🎯 Reset Camera').click();
    console.log('✓ Reset camera');
    
    await page.waitForTimeout(500);
    
    const posAfterReset = await page.locator('#cameraPos').textContent();
    console.log(`After reset: ${posAfterReset}`);
    
    // Camera position should be valid
    expect(posAfterReset).toMatch(/[-\d]+, [-\d]+, [-\d]+/);
  });
});

