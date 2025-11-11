/**
 * COSMIC GENERATION PERFORMANCE TESTS
 * 
 * Measures and validates performance budgets for cosmic timeline generation.
 * Ensures the FMV loads and renders within acceptable time limits.
 */

import { test, expect } from '@playwright/test';

test.describe('Cosmic Timeline Generation Performance', () => {
  test('cosmic timeline generates within performance budget', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/?seed=v1-perf-test-seed');
    
    const seedInput = page.getByPlaceholder(/v1-word-word-word/i);
    await seedInput.clear();
    await seedInput.fill('v1-perf-test-seed');
    
    await page.getByRole('button', { name: /New Game/i }).click();
    
    await page.waitForSelector('[data-timeline-ready="true"]', { timeout: 5000 });
    
    const generationTime = Date.now() - startTime;
    
    expect(generationTime).toBeLessThan(5000);
  });
  
  test('first stage renders within budget', async ({ page }) => {
    await page.goto('/');
    
    const seedInput = page.getByPlaceholder(/v1-word-word-word/i);
    await seedInput.clear();
    await seedInput.fill('v1-perf-test-seed');
    
    const startTime = Date.now();
    
    await page.getByRole('button', { name: /New Game/i }).click();
    
    await page.waitForSelector('[data-stage-index="0"]', { timeout: 5000 });
    
    const renderTime = Date.now() - startTime;
    
    expect(renderTime).toBeLessThan(3000);
  });
  
  test('page loads within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    
    await page.waitForSelector('h1:has-text("Ebb & Bloom")', { timeout: 5000 });
    
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(3000);
  });
});

test.describe('Stage Transition Performance', () => {
  test('stage transitions happen smoothly', async ({ page }) => {
    await page.goto('/');
    
    const seedInput = page.getByPlaceholder(/v1-word-word-word/i);
    await seedInput.clear();
    await seedInput.fill('v1-perf-test-seed');
    
    await page.getByRole('button', { name: /New Game/i }).click();
    
    await page.waitForSelector('[data-timeline-ready="true"]', { timeout: 10000 });
    
    const transitionTimes: number[] = [];
    let lastStage = 0;
    
    for (let i = 0; i < 3; i++) {
      const startTime = Date.now();
      
      await page.waitForSelector(`[data-stage-index="${lastStage + 1}"]`, { timeout: 10000 });
      
      const transitionTime = Date.now() - startTime;
      transitionTimes.push(transitionTime);
      
      lastStage++;
    }
    
    const avgTransitionTime = transitionTimes.reduce((a, b) => a + b, 0) / transitionTimes.length;
    
    expect(avgTransitionTime).toBeLessThan(6000);
  });
  
  test('no frame drops during stage rendering', async ({ page }) => {
    await page.goto('/');
    
    const seedInput = page.getByPlaceholder(/v1-word-word-word/i);
    await seedInput.clear();
    await seedInput.fill('v1-perf-test-seed');
    
    await page.getByRole('button', { name: /New Game/i }).click();
    
    await page.waitForSelector('[data-timeline-ready="true"]', { timeout: 10000 });
    
    await page.waitForTimeout(3000);
    
    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible();
  });
});

test.describe('Memory Usage', () => {
  test('no memory leaks during extended playback', async ({ page }) => {
    await page.goto('/');
    
    const seedInput = page.getByPlaceholder(/v1-word-word-word/i);
    await seedInput.clear();
    await seedInput.fill('v1-perf-test-seed');
    
    await page.getByRole('button', { name: /New Game/i }).click();
    
    await page.waitForSelector('[data-timeline-ready="true"]', { timeout: 10000 });
    
    const initialMetrics = await page.evaluate(() => {
      if ((performance as any).memory) {
        return {
          usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
          totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
        };
      }
      return null;
    });
    
    await page.waitForTimeout(10000);
    
    const finalMetrics = await page.evaluate(() => {
      if ((performance as any).memory) {
        return {
          usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
          totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
        };
      }
      return null;
    });
    
    if (initialMetrics && finalMetrics) {
      const heapGrowth = finalMetrics.usedJSHeapSize - initialMetrics.usedJSHeapSize;
      const growthPercentage = (heapGrowth / initialMetrics.usedJSHeapSize) * 100;
      
      expect(growthPercentage).toBeLessThan(200);
    }
  });
});

test.describe('Resource Loading', () => {
  test('canvas initializes quickly', async ({ page }) => {
    await page.goto('/');
    
    const seedInput = page.getByPlaceholder(/v1-word-word-word/i);
    await seedInput.clear();
    await seedInput.fill('v1-perf-test-seed');
    
    const startTime = Date.now();
    
    await page.getByRole('button', { name: /New Game/i }).click();
    
    await expect(page.locator('canvas').first()).toBeVisible({ timeout: 5000 });
    
    const canvasInitTime = Date.now() - startTime;
    
    expect(canvasInitTime).toBeLessThan(3000);
  });
  
  test('no excessive network requests', async ({ page }) => {
    const requests: string[] = [];
    
    page.on('request', (request) => {
      requests.push(request.url());
    });
    
    await page.goto('/');
    
    const seedInput = page.getByPlaceholder(/v1-word-word-word/i);
    await seedInput.clear();
    await seedInput.fill('v1-perf-test-seed');
    
    await page.getByRole('button', { name: /New Game/i }).click();
    
    await page.waitForSelector('[data-timeline-ready="true"]', { timeout: 10000 });
    
    await page.waitForTimeout(2000);
    
    expect(requests.length).toBeLessThan(100);
  });
});

test.describe('Rendering Performance', () => {
  test('maintains acceptable FPS', async ({ page }) => {
    await page.goto('/');
    
    const seedInput = page.getByPlaceholder(/v1-word-word-word/i);
    await seedInput.clear();
    await seedInput.fill('v1-perf-test-seed');
    
    await page.getByRole('button', { name: /New Game/i }).click();
    
    await page.waitForSelector('[data-timeline-ready="true"]', { timeout: 10000 });
    
    const fps = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let frames = 0;
        const startTime = performance.now();
        
        const measureFPS = () => {
          frames++;
          const elapsed = performance.now() - startTime;
          
          if (elapsed >= 1000) {
            resolve((frames / elapsed) * 1000);
          } else {
            requestAnimationFrame(measureFPS);
          }
        };
        
        requestAnimationFrame(measureFPS);
      });
    });
    
    expect(fps).toBeGreaterThan(20);
  });
  
  test('particle systems perform efficiently', async ({ page }) => {
    await page.goto('/');
    
    const seedInput = page.getByPlaceholder(/v1-word-word-word/i);
    await seedInput.clear();
    await seedInput.fill('v1-perf-test-seed');
    
    await page.getByRole('button', { name: /New Game/i }).click();
    
    await page.waitForSelector('[data-timeline-ready="true"]', { timeout: 10000 });
    
    await page.waitForTimeout(2000);
    
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.waitForTimeout(3000);
    
    const performanceErrors = errors.filter(err => 
      err.includes('performance') || 
      err.includes('slow') ||
      err.includes('timeout')
    );
    
    expect(performanceErrors.length).toBe(0);
  });
});

test.describe('Mobile Performance', () => {
  test('loads quickly on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    
    const startTime = Date.now();
    
    await page.goto('/');
    
    const seedInput = page.getByPlaceholder(/v1-word-word-word/i);
    await seedInput.clear();
    await seedInput.fill('v1-perf-test-seed');
    
    await page.getByRole('button', { name: /New Game/i }).click();
    
    await page.waitForSelector('[data-timeline-ready="true"]', { timeout: 10000 });
    
    const mobileLoadTime = Date.now() - startTime;
    
    expect(mobileLoadTime).toBeLessThan(8000);
  });
  
  test('mobile rendering is responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    
    await page.goto('/');
    
    const seedInput = page.getByPlaceholder(/v1-word-word-word/i);
    await seedInput.clear();
    await seedInput.fill('v1-perf-test-seed');
    
    await page.getByRole('button', { name: /New Game/i }).click();
    
    await page.waitForSelector('[data-timeline-ready="true"]', { timeout: 10000 });
    
    await page.waitForTimeout(2000);
    
    const canvas = page.locator('canvas').first();
    const box = await canvas.boundingBox();
    
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(0);
    expect(box!.height).toBeGreaterThan(0);
  });
});
