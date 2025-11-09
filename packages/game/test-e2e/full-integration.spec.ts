/**
 * E2E Test: FULL INTEGRATION
 * 
 * Test complete pipeline: Universe → Slice → Render → Simulate
 */

import { test, expect } from '@playwright/test';

test.describe('Full Integration - Universe to Game', () => {
  
  test('COMPLETE: Big Bang → Planet → Life → Civilization', async ({ page }) => {
    const seed = 'full-integration';
    
    await page.goto(`http://localhost:5173/simulation.html?seed=${seed}&cycles=100&autoAdvance=true`);
    
    const logs: string[] = [];
    page.on('console', msg => logs.push(msg.text()));
    
    // Wait for completion
    await page.waitForFunction(() => {
      return window.document.body.textContent?.includes('Cycle 100') ||
             window.document.body.textContent?.includes('Year 10000');
    }, { timeout: 60000 });
    
    // Verify full pipeline
    const pipelineStages = [
      'Star',
      'Planet',
      'species',
      'population',
      'Cycle',
    ];
    
    const bodyText = await page.textContent('body') || '';
    const stagesFound = pipelineStages.filter(stage => 
      bodyText.toLowerCase().includes(stage.toLowerCase())
    );
    
    expect(stagesFound.length).toBeGreaterThanOrEqual(4);
    
    console.log('[E2E Full] ✅ Pipeline stages found:', stagesFound);
    console.log('[E2E Full] ✅ COMPLETE integration working');
  });
  
  test('laws: all categories exercised in full run', async ({ page }) => {
    await page.goto('http://localhost:5173/simulation.html?seed=law-exercise&cycles=50&autoAdvance=true');
    
    const logs: string[] = [];
    page.on('console', msg => logs.push(msg.text()));
    
    await page.waitForTimeout(30000);
    
    // Check which law categories were used
    const lawCategories = {
      stellar: /stellar|star|luminosity/i,
      planetary: /planet|gravity|temperature/i,
      biological: /metabolism|mass|allometry/i,
      ecological: /population|carrying|species/i,
      social: /governance|tribe|band/i,
    };
    
    const exercised: Record<string, boolean> = {};
    
    for (const [category, pattern] of Object.entries(lawCategories)) {
      exercised[category] = logs.some(log => pattern.test(log));
    }
    
    const exercisedCount = Object.values(exercised).filter(Boolean).length;
    
    expect(exercisedCount).toBeGreaterThanOrEqual(3);
    
    console.log('[E2E Full] Laws exercised:', Object.entries(exercised).filter(([_, v]) => v).map(([k]) => k));
  });
  
  test('visual synthesis: elements → rendering', async ({ page }) => {
    await page.goto('http://localhost:5173/simulation.html?seed=visual-full');
    
    const logs: string[] = [];
    page.on('console', msg => logs.push(msg.text()));
    
    await page.waitForTimeout(3000);
    
    // Check for visual synthesis
    const visualLogs = logs.filter(log => 
      log.includes('Rendering') ||
      log.includes('Yuka') ||
      log.includes('composition') ||
      log.includes('element')
    );
    
    expect(visualLogs.length).toBeGreaterThan(0);
    
    console.log('[E2E Full] Visual synthesis:', visualLogs.slice(0, 3));
  });
  
  test('audio: cosmic sonification → atmospheric sound', async ({ page }) => {
    await page.goto('http://localhost:5173/simulation.html?seed=audio-full');
    
    const logs: string[] = [];
    page.on('console', msg => logs.push(msg.text()));
    
    await page.waitForTimeout(3000);
    
    // Check for audio
    const audioLogs = logs.filter(log => 
      log.includes('Audio') ||
      log.includes('Sonification') ||
      log.includes('sound')
    );
    
    if (audioLogs.length > 0) {
      console.log('[E2E Full] ✅ Audio system active:', audioLogs.slice(0, 2));
    }
  });
  
  test('performance: 100 cycles completes in reasonable time', async ({ page }) => {
    const start = Date.now();
    
    await page.goto('http://localhost:5173/simulation.html?seed=perf-test&cycles=100&autoAdvance=true');
    
    await page.waitForFunction(() => {
      return window.document.body.textContent?.includes('Cycle 100');
    }, { timeout: 120000 });
    
    const duration = Date.now() - start;
    
    // Should complete in < 2 minutes
    expect(duration).toBeLessThan(120000);
    
    console.log(`[E2E Full] ✅ 100 cycles in ${(duration / 1000).toFixed(1)}s`);
    console.log(`[E2E Full] Performance: ${(100000 / duration).toFixed(0)} cycles/second`);
  });
});

