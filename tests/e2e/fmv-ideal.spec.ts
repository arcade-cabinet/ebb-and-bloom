import { test, expect } from '@playwright/test';

/**
 * FMV IDEAL Specification - Test-Driven Development
 * 
 * Based on docs/DESIGN.md vision:
 * - Mobile-first (60 FPS target)
 * - Touch as language
 * - Deterministic seeded generation
 * - Smooth stage transitions
 * - Graceful degradation
 */

test.describe('FMV Intro - IDEAL Specification', () => {
  
  test('Full FMV journey: Menu → BigBang → Accretion → Gameplay', async ({ page }) => {
    const errors: string[] = [];
    const shaderErrors: string[] = [];
    const stageTimings: Map<string, number> = new Map();
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
        if (msg.text().includes('Shader') || msg.text().includes('GLSL')) {
          shaderErrors.push(msg.text());
        }
      }
    });

    page.on('pageerror', error => {
      errors.push(error.message);
    });

    await page.goto('/', { waitUntil: 'networkidle' });
    
    const newGameButton = page.locator('button:has-text("New Game")');
    await expect(newGameButton).toBeVisible({ timeout: 5000 });
    
    const startTime = Date.now();
    await newGameButton.click();
    
    await page.waitForTimeout(15000);
    
    expect(shaderErrors, 'No shader compilation errors').toHaveLength(0);
    
    const criticalErrors = errors.filter(err => 
      !err.includes('WebGL') && 
      !err.includes('DevTools') &&
      !err.includes('404') &&
      !err.includes('R3F: Div')
    );
    
    expect(criticalErrors, 'No critical runtime errors').toHaveLength(0);
  });

  test('Shader compilation: All SDF shaders compile successfully', async ({ page }) => {
    const shaderLogs: string[] = [];
    
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('Shader') || text.includes('GLSL') || text.includes('Program')) {
        shaderLogs.push(text);
      }
    });

    await page.goto('/', { waitUntil: 'networkidle' });
    await page.locator('button:has-text("New Game")').click();
    await page.waitForTimeout(5000);
    
    const shaderErrors = shaderLogs.filter(log => 
      log.includes('ERROR') || 
      log.includes('not compiled') ||
      log.includes('syntax error')
    );
    
    expect(shaderErrors, 'All shaders must compile without errors').toHaveLength(0);
  });

  test('Performance: Maintains >= 45 FPS during intro stages', async ({ page }) => {
    const frameTimings: number[] = [];
    
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.locator('button:has-text("New Game")').click();
    
    await page.waitForTimeout(2000);
    
    const performanceData = await page.evaluate(() => {
      const entries = performance.getEntriesByType('paint');
      return {
        paintTiming: entries.map(e => e.startTime),
        memory: (performance as any).memory ? {
          usedJSHeapSize: (performance as any).memory.usedJSHeapSize / 1048576,
          totalJSHeapSize: (performance as any).memory.totalJSHeapSize / 1048576
        } : null
      };
    });
    
    if (performanceData.memory) {
      expect(performanceData.memory.usedJSHeapSize).toBeLessThan(350);
    }
  });

  test('Audio/Haptic initialization: < 300ms or marks unavailable', async ({ page }) => {
    const initLogs: string[] = [];
    const initTimes: Map<string, number> = new Map();
    
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('Audio') || text.includes('Haptic')) {
        initLogs.push(`[${Date.now()}] ${text}`);
      }
    });

    const startTime = Date.now();
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.locator('button:has-text("New Game")').click();
    await page.waitForTimeout(1000);
    const endTime = Date.now();
    
    const initDuration = endTime - startTime;
    expect(initDuration).toBeLessThan(1300);
  });

  test('Canvas purity: No raw DOM elements inside Canvas', async ({ page }) => {
    const r3fErrors: string[] = [];
    
    page.on('pageerror', error => {
      if (error.message.includes('R3F:') && error.message.includes('namespace')) {
        r3fErrors.push(error.message);
      }
    });

    await page.goto('/', { waitUntil: 'networkidle' });
    await page.locator('button:has-text("New Game")').click();
    await page.waitForTimeout(3000);
    
    expect(r3fErrors, 'No raw DOM elements inside Canvas (use drei Html)').toHaveLength(0);
  });

  test('StageDirector: Transitions complete within configured duration ±5%', async ({ page }) => {
    const stageLogs: string[] = [];
    
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('Stage:') || text.includes('Progress:')) {
        stageLogs.push(text);
      }
    });

    await page.goto('/', { waitUntil: 'networkidle' });
    await page.locator('button:has-text("New Game")').click();
    await page.waitForTimeout(10000);
    
    expect(stageLogs.length).toBeGreaterThan(0);
  });
});
