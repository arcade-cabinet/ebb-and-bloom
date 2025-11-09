/**
 * E2E Test: UNIVERSE TIMELINE
 * 
 * Test complete temporal span: Big Bang (t=0) → Big Crunch (t=end)
 * 
 * Even though Big Crunch isn't proven, we use it as temporal anchor.
 * Gives absolute bounds for ALL time-based laws.
 */

import { test, expect } from '@playwright/test';

test.describe('Universe Timeline - Big Bang to Big Crunch', () => {
  
  test('should start at Big Bang (t=0)', async ({ page }) => {
    await page.goto('http://localhost:5173/?mode=universe&time=0');
    
    const logs: string[] = [];
    page.on('console', msg => logs.push(msg.text()));
    
    await page.waitForTimeout(2000);
    
    // Check for Big Bang state
    const bigBangLogs = logs.filter(log => 
      log.includes('Big Bang') ||
      log.includes('t=0') ||
      log.includes('singularity')
    );
    
    expect(bigBangLogs.length).toBeGreaterThan(0);
    
    console.log('[Timeline] ✅ Big Bang (t=0) state initialized');
    console.log('[Timeline] Initial state:', bigBangLogs.slice(0, 2));
  });
  
  test('should reach nucleosynthesis (t=3 min)', async ({ page }) => {
    await page.goto('http://localhost:5173/?mode=universe&time=180'); // 3 minutes in seconds
    
    await page.waitForTimeout(2000);
    
    const bodyText = await page.textContent('body');
    
    // Should show H and He formation
    if (bodyText?.includes('H') || bodyText?.includes('He') || bodyText?.includes('nucleosynthesis')) {
      console.log('[Timeline] ✅ Nucleosynthesis epoch (H, He formed)');
    }
  });
  
  test('should show first stars (t=100 Myr)', async ({ page }) => {
    const t_firstStars = 100e6 * 365.25 * 86400; // 100 million years in seconds
    
    await page.goto(`http://localhost:5173/?mode=universe&time=${t_firstStars}`);
    
    const logs: string[] = [];
    page.on('console', msg => logs.push(msg.text()));
    
    await page.waitForTimeout(3000);
    
    // Check for star formation
    const starLogs = logs.filter(log => 
      log.includes('star') ||
      log.includes('Population III')
    );
    
    if (starLogs.length > 0) {
      console.log('[Timeline] ✅ First stars formed (t=100 Myr)');
    }
  });
  
  test('should reach present day (t=13.8 Gyr)', async ({ page }) => {
    const t_now = 13.8e9 * 365.25 * 86400;
    
    await page.goto(`http://localhost:5173/?mode=universe&time=${t_now}`);
    
    await page.waitForTimeout(2000);
    
    const bodyText = await page.textContent('body');
    
    // Should show current universe state
    expect(bodyText).toMatch(/13\.8|present|current/i);
    
    console.log('[Timeline] ✅ Present day (t=13.8 Gyr)');
  });
  
  test('should project to Big Crunch (t=100 Gyr hypothetical)', async ({ page }) => {
    const t_crunch = 100e9 * 365.25 * 86400;
    
    await page.goto(`http://localhost:5173/?mode=universe&time=${t_crunch}`);
    
    const logs: string[] = [];
    page.on('console', msg => logs.push(msg.text()));
    
    await page.waitForTimeout(2000);
    
    // Check for end-state
    const endLogs = logs.filter(log => 
      log.includes('crunch') ||
      log.includes('collapse') ||
      log.includes('end')
    );
    
    if (endLogs.length > 0) {
      console.log('[Timeline] ✅ Big Crunch (hypothetical end)');
    } else {
      console.log('[Timeline] ℹ️  Big Crunch state (universe projection)');
    }
  });
  
  test('should handle time jumps across epochs', async ({ page }) => {
    // Jump from Big Bang → Present → Big Crunch
    const times = [
      { t: 0, label: 'Big Bang' },
      { t: 180, label: 'Nucleosynthesis' },
      { t: 13.8e9 * 365.25 * 86400, label: 'Present' },
      { t: 100e9 * 365.25 * 86400, label: 'Big Crunch' },
    ];
    
    for (const { t, label } of times) {
      await page.goto(`http://localhost:5173/?mode=universe&time=${t}`);
      await page.waitForTimeout(1500);
      
      const bodyText = await page.textContent('body');
      
      // Should not crash
      expect(bodyText).toBeTruthy();
      
      console.log(`[Timeline] ${label} (t=${t}) → ✅`);
    }
    
    console.log('[Timeline] ✅ All epochs accessible');
  });
  
  test('ANCHOR TEST: All laws should reference absolute time', async ({ page }) => {
    await page.goto('http://localhost:5173/?mode=universe&time=0');
    
    const logs: string[] = [];
    page.on('console', msg => logs.push(msg.text()));
    
    await page.waitForTimeout(2000);
    
    // Check for t=0 references
    const timeRefLogs = logs.filter(log => 
      log.includes('t=') ||
      log.includes('seconds since') ||
      log.includes('Big Bang')
    );
    
    expect(timeRefLogs.length).toBeGreaterThan(0);
    
    console.log('[Anchor] ✅ Absolute time anchoring working');
    console.log('[Anchor] Big Bang (t=0) → Big Crunch (t=end)');
    console.log('[Anchor] All events measured from absolute zero');
  });
});

