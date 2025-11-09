/**
 * E2E Test: UNIVERSE MODE
 * 
 * Full cosmos simulation - Big Bang to present
 * VCR controls, time stepping, cosmic events
 */

import { test, expect } from '@playwright/test';

test.describe('Universe Mode - Full Cosmos', () => {
  
  test('should initialize universe at Big Bang', async ({ page }) => {
    await page.goto('http://localhost:5173/?mode=universe');
    
    const logs: string[] = [];
    page.on('console', msg => logs.push(msg.text()));
    
    await page.waitForTimeout(3000);
    
    // Check for universe initialization
    const universeLogs = logs.filter(log => log.includes('Universe') || log.includes('Big Bang'));
    expect(universeLogs.length).toBeGreaterThan(0);
    
    console.log('[E2E Universe] Initialization logs:', universeLogs.slice(0, 5));
  });
  
  test('should fast-forward through cosmic time', async ({ page }) => {
    await page.goto('http://localhost:5173/?mode=universe&fastForward=1000000000');
    
    await page.waitForFunction(() => {
      return window.document.body.textContent?.includes('Gyr') || 
             window.document.body.textContent?.includes('billion');
    }, { timeout: 10000 });
    
    const bodyText = await page.textContent('body');
    
    // Should show time progression
    expect(bodyText).toMatch(/\d+\.\d+ Gyr|billion years/);
    
    console.log('[E2E Universe] ✅ Time progression working');
  });
  
  test('should show cosmic events', async ({ page }) => {
    await page.goto('http://localhost:5173/?mode=universe');
    
    const logs: string[] = [];
    page.on('console', msg => {
      if (msg.text().includes('Star') || msg.text().includes('Galaxy') || msg.text().includes('Formation')) {
        logs.push(msg.text());
      }
    });
    
    await page.waitForTimeout(3000);
    
    // Check for cosmic structure formation
    expect(logs.length).toBeGreaterThan(0);
    
    console.log('[E2E Universe] Cosmic events:', logs.slice(0, 3));
  });
  
  test('VCR controls should work via URL', async ({ page }) => {
    // Pause
    await page.goto('http://localhost:5173/?mode=universe&paused=true');
    await page.waitForTimeout(1000);
    let bodyText = await page.textContent('body');
    const pausedTime1 = bodyText?.match(/\d+\.\d+ Gyr/)?.[0];
    
    await page.waitForTimeout(2000);
    bodyText = await page.textContent('body');
    const pausedTime2 = bodyText?.match(/\d+\.\d+ Gyr/)?.[0];
    
    // Time should not advance when paused
    if (pausedTime1 && pausedTime2) {
      expect(pausedTime1).toBe(pausedTime2);
      console.log('[E2E Universe] ✅ Pause works');
    }
  });
  
  test('should render galaxies as point clouds', async ({ page }) => {
    await page.goto('http://localhost:5173/?mode=universe&zoom=galactic');
    
    const logs: string[] = [];
    page.on('console', msg => logs.push(msg.text()));
    
    await page.waitForTimeout(3000);
    
    // Check for rendering
    const renderLogs = logs.filter(log => log.includes('render') || log.includes('galaxy'));
    expect(renderLogs.length).toBeGreaterThan(0);
    
    console.log('[E2E Universe] Rendering logs:', renderLogs.slice(0, 3));
  });
});

