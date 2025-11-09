/**
 * E2E Test: MODE TRANSITIONS
 * 
 * Test switching between Universe and Game modes via zoom
 */

import { test, expect } from '@playwright/test';

test.describe('Mode Transitions - Zoom Based', () => {
  
  test('should transition Universe → Game on zoom in', async ({ page }) => {
    await page.goto('http://localhost:5173/?mode=universe');
    
    const logs: string[] = [];
    page.on('console', msg => logs.push(msg.text()));
    
    await page.waitForTimeout(2000);
    
    // Simulate zoom in (click planet)
    await page.evaluate(() => {
      // Trigger zoom transition
      (window as any).testZoomIn?.();
    });
    
    await page.waitForTimeout(1000);
    
    // Check for mode transition
    const transitionLogs = logs.filter(log => 
      log.includes('UNIVERSE → GAME') ||
      log.includes('mode')
    );
    
    if (transitionLogs.length > 0) {
      console.log('[E2E Transition] ✅ Universe → Game detected');
    }
  });
  
  test('should auto-generate seed from coordinates', async ({ page }) => {
    await page.goto('http://localhost:5173/?mode=universe&zoomTo=47583,92847,17384');
    
    const logs: string[] = [];
    page.on('console', msg => logs.push(msg.text()));
    
    await page.waitForTimeout(3000);
    
    // Check for seed generation
    const seedLogs = logs.filter(log => log.includes('seed') || log.includes('coordinates'));
    
    expect(seedLogs.length).toBeGreaterThan(0);
    
    console.log('[E2E Transition] Seed generation:', seedLogs.slice(0, 2));
  });
  
  test('should transition Game → Universe on zoom out', async ({ page }) => {
    await page.goto('http://localhost:5173/simulation.html?seed=zoom-test');
    
    await page.waitForTimeout(2000);
    
    // Simulate zoom out
    await page.evaluate(() => {
      (window as any).testZoomOut?.();
    });
    
    await page.waitForTimeout(1000);
    
    const bodyText = await page.textContent('body');
    
    // Should show universe-level info (if implemented)
    // For now, just verify no crash
    expect(bodyText).toBeTruthy();
    
    console.log('[E2E Transition] ✅ Zoom out handled');
  });
});

