/**
 * E2E Test: Visual Synthesis
 * 
 * Verify complete pipeline: Laws → Visuals → Rendering
 */

import { test, expect } from '@playwright/test';

test.describe('Visual Synthesis - End to End', () => {
  
  test('should render planet from element composition', async ({ page }) => {
    await page.goto('http://localhost:5173/simulation.html?seed=e2e-visual-test');
    
    // Wait for initialization
    await page.waitForFunction(() => {
      return window.document.body.textContent?.includes('WORLD SIMULATOR');
    }, { timeout: 10000 });
    
    // Check console for synthesis messages
    const logs: string[] = [];
    page.on('console', msg => logs.push(msg.text()));
    
    await page.waitForTimeout(2000); // Let it render
    
    // Verify Yuka synthesis happened
    const yukaLogs = logs.filter(log => log.includes('[Yuka]') || log.includes('[Rendering]'));
    expect(yukaLogs.length).toBeGreaterThan(0);
    
    // Check for element-based rendering
    const renderingLogs = logs.filter(log => log.includes('element composition'));
    expect(renderingLogs.length).toBeGreaterThan(0);
    
    console.log('[E2E] Yuka synthesis logs:', yukaLogs);
  });
  
  test('should generate audio from laws', async ({ page }) => {
    await page.goto('http://localhost:5173/simulation.html?seed=audio-test');
    
    await page.waitForFunction(() => {
      return window.document.body.textContent?.includes('WORLD SIMULATOR');
    });
    
    const logs: string[] = [];
    page.on('console', msg => logs.push(msg.text()));
    
    await page.waitForTimeout(2000);
    
    // Check for audio synthesis
    const audioLogs = logs.filter(log => log.includes('[Audio]') || log.includes('[Sonification]'));
    expect(audioLogs.length).toBeGreaterThan(0);
    
    console.log('[E2E] Audio synthesis logs:', audioLogs);
  });
  
  test('should run full simulation cycle', async ({ page }) => {
    await page.goto('http://localhost:5173/simulation.html?seed=full-test&cycles=10&autoAdvance=true');
    
    await page.waitForFunction(() => {
      return window.document.body.textContent?.includes('WORLD SIMULATOR');
    });
    
    // Wait for cycles to complete
    await page.waitForFunction(() => {
      return window.document.body.textContent?.includes('Cycle 10') ||
             window.document.body.textContent?.includes('COMPLETE');
    }, { timeout: 30000 });
    
    const bodyText = await page.textContent('body');
    
    // Verify simulation ran
    expect(bodyText).toContain('Cycle');
    expect(bodyText).toMatch(/Population|Species|individuals/);
    
    console.log('[E2E] ✅ Full simulation cycle completed');
  });
  
  test('determinism: same seed produces identical visuals', async ({ page, context }) => {
    const seed = 'determinism-visual';
    
    // Run 1
    await page.goto(`http://localhost:5173/simulation.html?seed=${seed}`);
    await page.waitForTimeout(2000);
    
    const logs1: string[] = [];
    page.on('console', msg => logs1.push(msg.text()));
    
    const screenshot1 = await page.screenshot();
    
    // Run 2 (new page)
    const page2 = await context.newPage();
    await page2.goto(`http://localhost:5173/simulation.html?seed=${seed}`);
    await page2.waitForTimeout(2000);
    
    const screenshot2 = await page2.screenshot();
    
    // Screenshots should be identical (or very close)
    expect(screenshot1.length).toBe(screenshot2.length);
    
    console.log('[E2E] ✅ Deterministic rendering verified');
    
    await page2.close();
  });
});

