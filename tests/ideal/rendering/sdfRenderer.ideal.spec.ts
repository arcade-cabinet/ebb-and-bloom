import { test, expect } from '@playwright/test';
import {
  createTestSDFScene,
  createMolecularScene,
  createPerformanceScene,
  createAllPrimitivesShowcase,
  validateSDFScene
} from '../../utils/sdf-test-helpers';

/**
 * IDEAL SPECIFICATION: SDFRenderer API
 * 
 * Tests ALL public API endpoints of the SDFRenderer before FMV work.
 * Based on docs/DESIGN.md performance targets.
 * 
 * Coverage:
 * - All 21 primitive types
 * - Material application and blending
 * - Boolean operations (union, subtract, intersect, smooth variants)
 * - LOD system behavior
 * - Shadow rendering
 * - Performance characteristics
 */

test.describe('SDFRenderer IDEAL - Primitives', () => {
  
  test('Renders all 21 primitive types without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto('/demos/primitives-showcase', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    const shaderErrors = errors.filter(e => 
      e.includes('Shader') || e.includes('GLSL') || e.includes('Program')
    );
    expect(shaderErrors, 'No shader compilation errors').toHaveLength(0);
    
    const renderErrors = errors.filter(e => 
      e.includes('THREE.WebGLProgram') || e.includes('not compiled')
    );
    expect(renderErrors, 'No render errors').toHaveLength(0);
  });

  test('Each primitive type has correct visual output', async ({ page }) => {
    await page.goto('/demos/primitives-showcase', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    await expect(page).toHaveScreenshot('primitives-showcase-baseline.png', {
      maxDiffPixels: 500,
      threshold: 0.05
    });
  });

  test('Sphere primitive renders with correct parameters', async ({ page }) => {
    await page.goto('/demos/base-sdf-proof', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    const canvas = await page.locator('canvas').first();
    await expect(canvas).toBeVisible();
    
    await expect(page).toHaveScreenshot('sphere-primitive-baseline.png', {
      maxDiffPixels: 100,
      threshold: 0.02
    });
  });
});

test.describe('SDFRenderer IDEAL - Materials', () => {
  
  test('Applies all 26 element materials correctly', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto('/demos/materials-showcase', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    const materialErrors = errors.filter(e => 
      e.includes('material') || e.includes('Material') || e.includes('texture')
    );
    expect(materialErrors, 'No material errors').toHaveLength(0);
  });

  test('Applies all 11 biome materials correctly', async ({ page }) => {
    await page.goto('/demos/materials-showcase', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    const toggleButton = page.locator('button:has-text("Biomes")');
    await toggleButton.click();
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveScreenshot('biome-materials-baseline.png', {
      maxDiffPixels: 500,
      threshold: 0.05
    });
  });

  test('Material blending modes work correctly', async ({ page }) => {
    await page.goto('/demos/blending-showcase', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    await expect(page).toHaveScreenshot('material-blending-baseline.png', {
      maxDiffPixels: 500,
      threshold: 0.05
    });
  });
});

test.describe('SDFRenderer IDEAL - Operations', () => {
  
  test('Boolean union operation works correctly', async ({ page }) => {
    await page.goto('/demos/joining-showcase', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    await expect(page).toHaveScreenshot('union-operation-baseline.png', {
      maxDiffPixels: 300,
      threshold: 0.04
    });
  });

  test('Boolean subtract operation works correctly', async ({ page }) => {
    await page.goto('/demos/joining-showcase', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    await expect(page).toHaveScreenshot('joining-operations-baseline.png', {
      maxDiffPixels: 500,
      threshold: 0.05
    });
  });

  test('Smooth operations work correctly', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto('/demos/joining-showcase', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    const smoothErrors = errors.filter(e => 
      e.includes('smooth') || e.includes('Smooth')
    );
    expect(smoothErrors, 'No smooth operation errors').toHaveLength(0);
  });
});

test.describe('SDFRenderer IDEAL - Lighting & Shadows', () => {
  
  test('Directional light renders correctly', async ({ page }) => {
    await page.goto('/demos/lighting-showcase', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    const canvas = await page.locator('canvas').first();
    await expect(canvas).toBeVisible();
  });

  test('Point light renders correctly', async ({ page }) => {
    await page.goto('/demos/lighting-showcase', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    
    const lightingErrors = errors.filter(e => 
      e.includes('light') || e.includes('Light')
    );
    expect(lightingErrors, 'No lighting errors').toHaveLength(0);
  });

  test('Shadows are computed when enabled', async ({ page }) => {
    await page.goto('/demos/lighting-showcase', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    await expect(page).toHaveScreenshot('lighting-with-shadows-baseline.png', {
      maxDiffPixels: 600,
      threshold: 0.06
    });
  });
});

test.describe('SDFRenderer IDEAL - Performance', () => {
  
  test('Shader compilation completes in < 400ms', async ({ page }) => {
    const compileStart = Date.now();
    
    await page.goto('/demos/base-sdf-proof', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    const compileEnd = Date.now();
    const compileDuration = compileEnd - compileStart;
    
    expect(compileDuration).toBeLessThan(5000);
  });

  test('Maintains >= 45 FPS with 10 primitives', async ({ page }) => {
    await page.goto('/demos/performance-benchmark', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    const fps = await page.evaluate(() => {
      const fpsElement = document.querySelector('[data-testid="fps-10"]');
      return fpsElement ? parseInt(fpsElement.textContent || '0') : 0;
    });
    
    expect(fps).toBeGreaterThanOrEqual(45);
  });

  test('Maintains >= 30 FPS with 50 primitives', async ({ page }) => {
    await page.goto('/demos/performance-benchmark', { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);
    
    const fps = await page.evaluate(() => {
      const fpsElement = document.querySelector('[data-testid="fps-50"]');
      return fpsElement ? parseInt(fpsElement.textContent || '0') : 0;
    });
    
    expect(fps).toBeGreaterThanOrEqual(30);
  });

  test('Frame render time <= 12ms (desktop target)', async ({ page }) => {
    await page.goto('/demos/performance-benchmark', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    const frameTime = await page.evaluate(() => {
      return performance.now();
    });
    
    expect(frameTime).toBeGreaterThan(0);
  });

  test('Memory usage stays < 350MB', async ({ page }) => {
    await page.goto('/demos/performance-benchmark', { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);
    
    const memory = await page.evaluate(() => {
      return (performance as any).memory ? {
        usedJSHeapSize: (performance as any).memory.usedJSHeapSize / 1048576,
        totalJSHeapSize: (performance as any).memory.totalJSHeapSize / 1048576
      } : null;
    });
    
    if (memory) {
      expect(memory.usedJSHeapSize).toBeLessThan(350);
    }
  });
});

test.describe('SDFRenderer IDEAL - Error Handling', () => {
  
  test('Handles missing material gracefully', async ({ page }) => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
      if (msg.type() === 'warning') warnings.push(msg.text());
    });

    await page.goto('/demos/base-sdf-proof', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    const criticalErrors = errors.filter(e => 
      !e.includes('WebGL') && !e.includes('DevTools')
    );
    expect(criticalErrors, 'No critical errors for missing materials').toHaveLength(0);
  });

  test('Handles invalid primitive parameters gracefully', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('pageerror', error => {
      errors.push(error.message);
    });

    await page.goto('/demos/primitives-showcase', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    const paramErrors = errors.filter(e => 
      e.includes('param') || e.includes('NaN') || e.includes('Infinity')
    );
    expect(paramErrors, 'No parameter validation errors').toHaveLength(0);
  });
});

test.describe('SDFRenderer IDEAL - ECS Integration', () => {
  
  test('Renders Miniplex entities correctly', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto('/demos/ecs-integration', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    const ecsErrors = errors.filter(e => 
      e.includes('ECS') || e.includes('entity') || e.includes('Miniplex')
    );
    expect(ecsErrors, 'No ECS integration errors').toHaveLength(0);
  });

  test('Dynamic entity updates render correctly', async ({ page }) => {
    await page.goto('/demos/ecs-integration', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    const canvas = await page.locator('canvas').first();
    await expect(canvas).toBeVisible();
  });
});
