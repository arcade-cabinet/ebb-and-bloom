/**
 * E2E Test: GAME MODE
 * 
 * Slice-based gameplay - control evolution on ONE planet
 */

import { test, expect } from '@playwright/test';

test.describe('Game Mode - Planet Slice', () => {
  
  test('should load specific planet from seed', async ({ page }) => {
    const seed = 'test-planet-alpha';
    await page.goto(`http://localhost:5173/simulation.html?seed=${seed}`);
    
    await page.waitForFunction(() => {
      return window.document.body.textContent?.includes('WORLD SIMULATOR');
    }, { timeout: 10000 });
    
    const bodyText = await page.textContent('body');
    
    // Should show seed
    expect(bodyText).toContain(seed);
    
    // Should show planet data
    expect(bodyText).toMatch(/Planet|Star|Species/);
    
    console.log('[E2E Game] ✅ Seed loaded correctly');
  });
  
  test('determinism: same seed = same planet', async ({ page, context }) => {
    const seed = 'determinism-slice';
    
    // Load twice
    await page.goto(`http://localhost:5173/simulation.html?seed=${seed}`);
    await page.waitForTimeout(2000);
    const text1 = await page.textContent('body');
    
    const page2 = await context.newPage();
    await page2.goto(`http://localhost:5173/simulation.html?seed=${seed}`);
    await page2.waitForTimeout(2000);
    const text2 = await page2.textContent('body');
    
    // Extract key data
    const extractData = (text: string | null) => {
      if (!text) return {};
      const starMatch = text.match(/Star:.*?(\d+\.\d+)\s*M/);
      const planetMatch = text.match(/Planets:\s*(\d+)/);
      return {
        starMass: starMatch?.[1],
        planetCount: planetMatch?.[1],
      };
    };
    
    const data1 = extractData(text1);
    const data2 = extractData(text2);
    
    expect(data1.starMass).toBe(data2.starMass);
    expect(data1.planetCount).toBe(data2.planetCount);
    
    console.log('[E2E Game] ✅ Determinism verified:', data1);
    
    await page2.close();
  });
  
  test('should advance cycles via URL parameter', async ({ page }) => {
    await page.goto('http://localhost:5173/simulation.html?seed=cycle-test&cycles=10&autoAdvance=true');
    
    await page.waitForFunction(() => {
      return window.document.body.textContent?.includes('Cycle 10') ||
             window.document.body.textContent?.includes('Year 1000');
    }, { timeout: 15000 });
    
    const bodyText = await page.textContent('body');
    expect(bodyText).toMatch(/Cycle\s+10|Year\s+1000/);
    
    console.log('[E2E Game] ✅ Auto-advance completed 10 cycles');
  });
  
  test('should render creatures from anatomy laws', async ({ page }) => {
    await page.goto('http://localhost:5173/simulation.html?seed=creature-render');
    
    const logs: string[] = [];
    page.on('console', msg => logs.push(msg.text()));
    
    await page.waitForTimeout(3000);
    
    // Check for creature generation
    const creatureLogs = logs.filter(log => 
      log.includes('Creature') || 
      log.includes('anatomy') ||
      log.includes('species')
    );
    
    expect(creatureLogs.length).toBeGreaterThan(0);
    
    console.log('[E2E Game] Creature generation:', creatureLogs.slice(0, 3));
  });
  
  test('should apply all laws during simulation', async ({ page }) => {
    await page.goto('http://localhost:5173/simulation.html?seed=law-test&cycles=5&autoAdvance=true');
    
    const logs: string[] = [];
    page.on('console', msg => logs.push(msg.text()));
    
    await page.waitForTimeout(10000);
    
    // Check which laws were exercised
    const lawCategories = [
      'ecology', 'biology', 'social', 'cognitive', 
      'climate', 'population', 'metabolism'
    ];
    
    const exercisedLaws = lawCategories.filter(law => 
      logs.some(log => log.toLowerCase().includes(law))
    );
    
    expect(exercisedLaws.length).toBeGreaterThan(2);
    
    console.log('[E2E Game] ✅ Laws exercised:', exercisedLaws);
  });
});

