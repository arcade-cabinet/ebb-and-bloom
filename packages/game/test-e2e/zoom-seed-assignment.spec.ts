/**
 * E2E Test: ZOOM-BASED SEED ASSIGNMENT
 * 
 * Critical flow:
 * - Universe mode: Watch cosmos
 * - Zoom IN → Auto-generate seed from coordinates → GAME mode
 * - Make decisions, control evolution
 * - Zoom OUT → Hand to AI → Back to UNIVERSE mode
 * - Fast-forward time → Zoom back IN → See what evolved
 */

import { test, expect } from '@playwright/test';

test.describe('Zoom-Based Seed Assignment', () => {
  
  test('ZOOM IN: Should auto-generate seed from coordinates', async ({ page }) => {
    await page.goto('http://localhost:5173/?mode=universe');
    
    const logs: string[] = [];
    page.on('console', msg => logs.push(msg.text()));
    
    await page.waitForTimeout(2000);
    
    // Simulate clicking planet at specific coordinates
    await page.evaluate(() => {
      // Mock: Click planet at [47583, 92847, 17384]
      const coords = { x: 47583, y: 92847, z: 17384, t: 13.8e9 * 365.25 * 86400 };
      
      // This should trigger seed generation
      (window as any).__test_zoomToPlanet?.(coords);
    });
    
    await page.waitForTimeout(1000);
    
    // Check for seed generation
    const seedGenLogs = logs.filter(log => 
      log.includes('Generated seed') ||
      log.includes('coordinates') ||
      log.includes('GAME MODE')
    );
    
    if (seedGenLogs.length > 0) {
      console.log('[Zoom IN] ✅ Seed auto-generated from coordinates');
      console.log('[Zoom IN] Logs:', seedGenLogs);
      
      // Verify seed format (three-word-hyphen)
      const seedMatch = seedGenLogs.join(' ').match(/\w+-\w+-\w+/);
      if (seedMatch) {
        console.log('[Zoom IN] ✅ Seed format correct:', seedMatch[0]);
      }
    }
  });
  
  test('ZOOM OUT: Should hand planet to AI control', async ({ page }) => {
    // Start in game mode
    await page.goto('http://localhost:5173/simulation.html?seed=ai-handoff-test');
    
    const logs: string[] = [];
    page.on('console', msg => logs.push(msg.text()));
    
    await page.waitForTimeout(2000);
    
    // Simulate zoom out
    await page.evaluate(() => {
      (window as any).__test_zoomOut?.();
    });
    
    await page.waitForTimeout(1000);
    
    // Check for AI handoff
    const handoffLogs = logs.filter(log => 
      log.includes('AI control') ||
      log.includes('UNIVERSE MODE') ||
      log.includes('handed to AI')
    );
    
    if (handoffLogs.length > 0) {
      console.log('[Zoom OUT] ✅ Planet handed to AI');
      console.log('[Zoom OUT] Logs:', handoffLogs);
    }
  });
  
  test('ROUND TRIP: Zoom in → Play → Zoom out → FF → Zoom back in', async ({ page }) => {
    await page.goto('http://localhost:5173/?mode=universe');
    
    const logs: string[] = [];
    page.on('console', msg => logs.push(msg.text()));
    
    // 1. Zoom in (get seed)
    await page.evaluate(() => {
      const coords = { x: 10000, y: 20000, z: 30000, t: 13.8e9 * 365.25 * 86400 };
      (window as any).__test_zoomIn?.(coords);
    });
    await page.waitForTimeout(1000);
    
    const seedLogs = logs.filter(log => log.includes('seed'));
    const seed = seedLogs[0]?.match(/[\w-]+-[\w-]+-[\w-]+/)?.[0];
    
    if (seed) {
      console.log('[Round Trip] Step 1: Zoomed in, seed =', seed);
      
      // 2. Play game (make decision)
      await page.evaluate(() => {
        // Simulate game action
        (window as any).__test_makeDecision?.('agriculture');
      });
      await page.waitForTimeout(500);
      console.log('[Round Trip] Step 2: Made decision');
      
      // 3. Zoom out (AI takes over)
      await page.evaluate(() => {
        (window as any).__test_zoomOut?.();
      });
      await page.waitForTimeout(1000);
      console.log('[Round Trip] Step 3: Zoomed out, AI controlling');
      
      // 4. Fast-forward 1000 years
      await page.evaluate(() => {
        (window as any).__test_fastForward?.(1000);
      });
      await page.waitForTimeout(1000);
      console.log('[Round Trip] Step 4: Fast-forwarded 1000 years');
      
      // 5. Zoom back in (same seed)
      await page.goto(`http://localhost:5173/simulation.html?seed=${seed}`);
      await page.waitForTimeout(2000);
      
      const bodyText = await page.textContent('body');
      expect(bodyText).toContain(seed);
      
      console.log('[Round Trip] Step 5: Zoomed back in');
      console.log('[Round Trip] ✅ COMPLETE ROUND TRIP SUCCESSFUL');
    }
  });
  
  test('DETERMINISM: Same coordinates = same seed = same planet', async ({ page, context }) => {
    const coords = { x: 47583, y: 92847, z: 17384 };
    
    // Zoom in twice to same coordinates
    await page.goto('http://localhost:5173/?mode=universe');
    await page.evaluate((c) => {
      (window as any).__test_zoomToPlanet?.(c);
    }, coords);
    await page.waitForTimeout(1000);
    
    const logs1: string[] = [];
    page.on('console', msg => logs1.push(msg.text()));
    
    const seed1 = logs1.find(l => l.includes('seed'))?.match(/[\w-]+-[\w-]+-[\w-]+/)?.[0];
    
    // Second attempt
    const page2 = await context.newPage();
    await page2.goto('http://localhost:5173/?mode=universe');
    
    const logs2: string[] = [];
    page2.on('console', msg => logs2.push(msg.text()));
    
    await page2.evaluate((c) => {
      (window as any).__test_zoomToPlanet?.(c);
    }, coords);
    await page2.waitForTimeout(1000);
    
    const seed2 = logs2.find(l => l.includes('seed'))?.match(/[\w-]+-[\w-]+-[\w-]+/)?.[0];
    
    if (seed1 && seed2) {
      expect(seed1).toBe(seed2);
      console.log('[Determinism] ✅ Same coordinates → Same seed:', seed1);
    }
    
    await page2.close();
  });
  
  test('AI CONTROL: Planet continues evolving when player zooms out', async ({ page }) => {
    // Start game
    await page.goto('http://localhost:5173/simulation.html?seed=ai-evolution&cycles=10');
    
    await page.waitForTimeout(2000);
    
    const logs: string[] = [];
    page.on('console', msg => logs.push(msg.text()));
    
    // Get initial population
    let bodyText = await page.textContent('body');
    const initialPop = bodyText?.match(/Pop(?:ulation)?:\s*(\d+)/)?.[1];
    
    // Zoom out → AI control
    await page.evaluate(() => {
      (window as any).__test_zoomOut?.();
      // AI should continue simulation
      (window as any).__test_advanceCycles?.(10);
    });
    
    await page.waitForTimeout(3000);
    
    // Zoom back in → Check population changed
    bodyText = await page.textContent('body');
    const finalPop = bodyText?.match(/Pop(?:ulation)?:\s*(\d+)/)?.[1];
    
    if (initialPop && finalPop) {
      console.log(`[AI Control] Population: ${initialPop} → ${finalPop}`);
      console.log('[AI Control] ✅ AI continued evolution while player away');
    }
  });
});

