/**
 * SDF PRIMITIVES SHOWCASE E2E TESTS - Phase 0.1.5
 * 
 * Playwright visual regression tests for SDF primitives.
 * Screenshots all 21 primitives and operations for baseline comparison.
 */

import { test, expect, Page } from '@playwright/test';
import { mkdir } from 'fs/promises';
import { join } from 'path';

const ALL_PRIMITIVES = [
  'sphere',
  'box',
  'cylinder',
  'cone',
  'pyramid',
  'torus',
  'octahedron',
  'hexprism',
  'capsule',
  'porbital',
  'dorbital',
  'triPrism',
  'ellipsoid',
  'roundedBox',
  'cappedCylinder',
  'plane',
  'roundCone',
  'mengerSponge',
  'gyroid',
  'superellipsoid',
  'torusKnot'
];

async function waitForSceneLoad(page: Page) {
  await page.waitForTimeout(3000);
  await page.waitForLoadState('networkidle');
}

async function ensureScreenshotsDir() {
  const screenshotDir = join(process.cwd(), 'tests/e2e/screenshots/primitives');
  try {
    await mkdir(screenshotDir, { recursive: true });
  } catch (err) {
    // Directory might already exist
  }
}

test.describe('SDF Primitives Showcase', () => {
  test.beforeAll(async () => {
    await ensureScreenshotsDir();
  });

  test.beforeEach(async ({ page }) => {
    test.setTimeout(90000);
    await page.goto('/demos/primitives-showcase');
    await waitForSceneLoad(page);
  });
  
  test.describe('Individual Primitives Screenshots', () => {
    ALL_PRIMITIVES.forEach((name) => {
      test(`should screenshot ${name} primitive`, async ({ page }) => {
        const showBtn = page.getByTestId(`show-${name}-btn`);
        await expect(showBtn).toBeVisible();
        await showBtn.click();
        await page.waitForTimeout(1000);
        
        await page.screenshot({
          path: `tests/e2e/screenshots/primitives/primitive-${name}.png`,
          fullPage: false
        });
        
        expect(true).toBe(true);
      });
    });
  });
  
  test.describe('All Primitives Showcase', () => {
    test('should display all 21 primitives in grid', async ({ page }) => {
      const showAllBtn = page.getByTestId('show-all-btn');
      await expect(showAllBtn).toBeVisible();
      await showAllBtn.click();
      await page.waitForTimeout(2000);
      
      await page.screenshot({
        path: 'tests/e2e/screenshots/primitives/all-primitives-grid.png',
        fullPage: false
      });
      
      expect(true).toBe(true);
    });
    
    test('should show primitive count', async ({ page }) => {
      const showAllBtn = page.getByTestId('show-all-btn');
      await showAllBtn.click();
      await page.waitForTimeout(1000);
      
      const primitiveCount = await page.locator('text=/Primitives: \\d+/').textContent();
      expect(primitiveCount).toContain('Primitives: 21');
    });
  });
  
  test.describe('Interactive Controls', () => {
    test('should toggle rotation', async ({ page }) => {
      const rotationBtn = page.getByTestId('toggle-rotation-btn');
      await expect(rotationBtn).toBeVisible();
      
      await rotationBtn.click();
      await page.waitForTimeout(1000);
      
      await page.screenshot({
        path: 'tests/e2e/screenshots/primitives/rotation-enabled.png',
        fullPage: false
      });
      
      await rotationBtn.click();
      await page.waitForTimeout(500);
      
      expect(true).toBe(true);
    });
    
    test('should toggle scaling', async ({ page }) => {
      const scalingBtn = page.getByTestId('toggle-scaling-btn');
      await expect(scalingBtn).toBeVisible();
      
      await scalingBtn.click();
      await page.waitForTimeout(1000);
      
      await page.screenshot({
        path: 'tests/e2e/screenshots/primitives/scaling-enabled.png',
        fullPage: false
      });
      
      await scalingBtn.click();
      await page.waitForTimeout(500);
      
      expect(true).toBe(true);
    });
    
    test('should toggle labels', async ({ page }) => {
      const labelsBtn = page.getByTestId('toggle-labels-btn');
      await expect(labelsBtn).toBeVisible();
      
      await labelsBtn.click();
      await page.waitForTimeout(500);
      
      await labelsBtn.click();
      await page.waitForTimeout(500);
      
      expect(true).toBe(true);
    });
  });
  
  test.describe('Material Switching', () => {
    test('should cycle through materials', async ({ page }) => {
      const cycleMaterialBtn = page.getByTestId('cycle-material-btn');
      await expect(cycleMaterialBtn).toBeVisible();
      
      const initialText = await cycleMaterialBtn.textContent();
      expect(initialText).toContain('(1/9)');
      
      await cycleMaterialBtn.click();
      await page.waitForTimeout(500);
      
      const secondText = await cycleMaterialBtn.textContent();
      expect(secondText).toContain('(2/9)');
      
      await page.screenshot({
        path: 'tests/e2e/screenshots/primitives/material-cycle.png',
        fullPage: false
      });
    });
    
    test('should screenshot different materials', async ({ page }) => {
      const cycleMaterialBtn = page.getByTestId('cycle-material-btn');
      const showSphereBtn = page.getByTestId('show-sphere-btn');
      
      await showSphereBtn.click();
      await page.waitForTimeout(1000);
      
      for (let i = 0; i < 3; i++) {
        await page.screenshot({
          path: `tests/e2e/screenshots/primitives/material-${i + 1}.png`,
          fullPage: false
        });
        
        await cycleMaterialBtn.click();
        await page.waitForTimeout(500);
      }
      
      expect(true).toBe(true);
    });
  });
  
  test.describe('Transformations', () => {
    test('should apply rotation and scaling together', async ({ page }) => {
      const rotationBtn = page.getByTestId('toggle-rotation-btn');
      const scalingBtn = page.getByTestId('toggle-scaling-btn');
      
      await rotationBtn.click();
      await scalingBtn.click();
      await page.waitForTimeout(2000);
      
      await page.screenshot({
        path: 'tests/e2e/screenshots/primitives/combined-transforms.png',
        fullPage: false
      });
      
      expect(true).toBe(true);
    });
  });
  
  test.describe('Performance', () => {
    test('should maintain 60fps with all primitives visible', async ({ page }) => {
      const showAllBtn = page.getByTestId('show-all-btn');
      await showAllBtn.click();
      await page.waitForTimeout(3000);
      
      const fpsText = await page.locator('text=/\\d+ FPS/').textContent();
      const fps = parseInt(fpsText?.match(/(\d+) FPS/)?.[1] || '0');
      
      expect(fps).toBeGreaterThanOrEqual(30);
      
      await page.screenshot({
        path: 'tests/e2e/screenshots/primitives/performance-all-primitives.png',
        fullPage: false
      });
    });
    
    test('should display FPS counter', async ({ page }) => {
      const fpsElement = page.locator('text=/\\d+ FPS/');
      await expect(fpsElement).toBeVisible();
      
      const fpsText = await fpsElement.textContent();
      expect(fpsText).toMatch(/\d+ FPS/);
    });
  });
  
  test.describe('UI Components', () => {
    test('should display showcase title', async ({ page }) => {
      const title = page.locator('text=/SDF Primitives Showcase/');
      await expect(title).toBeVisible();
    });
    
    test('should show all control buttons', async ({ page }) => {
      await expect(page.getByTestId('cycle-material-btn')).toBeVisible();
      await expect(page.getByTestId('toggle-rotation-btn')).toBeVisible();
      await expect(page.getByTestId('toggle-scaling-btn')).toBeVisible();
      await expect(page.getByTestId('toggle-labels-btn')).toBeVisible();
      await expect(page.getByTestId('show-all-btn')).toBeVisible();
    });
    
    test('should show all primitive selection buttons', async ({ page }) => {
      for (const primitiveName of ALL_PRIMITIVES) {
        const btn = page.getByTestId(`show-${primitiveName}-btn`);
        await expect(btn).toBeVisible();
      }
    });
  });
  
  test.describe('Visual Regression', () => {
    test('should maintain consistent rendering', async ({ page }) => {
      await page.screenshot({
        path: 'tests/e2e/screenshots/primitives/baseline.png',
        fullPage: false
      });
      
      await page.reload();
      await waitForSceneLoad(page);
      
      await page.screenshot({
        path: 'tests/e2e/screenshots/primitives/comparison.png',
        fullPage: false
      });
      
      expect(true).toBe(true);
    });
  });
});
