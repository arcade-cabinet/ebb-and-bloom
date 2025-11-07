import { expect, Page, test } from '@playwright/test';

// Helper function to wait for ECS initialization
async function waitForECSInitialization(page: Page, timeout = 10000) {
  await page.waitForFunction(() => {
    return typeof (window as any).ecsInitialized !== 'undefined' && (window as any).ecsInitialized === true;
  }, { timeout });
}

test.describe('Ebb & Bloom Game Startup', () => {
  test('should load the game without errors', async ({ page }) => {
    // Collect console errors from the start (before navigation)
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Navigate to the game
    await page.goto('/');

    // Take screenshot of initial load
    await page.screenshot({ path: 'playwright-results/01-initial-load.png', fullPage: true });

    // Check that the page title is correct
    await expect(page).toHaveTitle(/Ebb\s*&\s*Bloom/);

    // Wait for the game canvas to load
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 30000 });

    // Take screenshot after canvas loads
    await page.screenshot({ path: 'playwright-results/02-canvas-loaded.png', fullPage: true });

    // Check that React Three Fiber has initialized (canvas should be present)
    const hasCanvas = await page.evaluate(() => {
      return document.querySelector('canvas') !== null;
    });
    expect(hasCanvas).toBeTruthy();

    // Wait for ECS initialization to complete
    await waitForECSInitialization(page);

    // Take screenshot after ECS initialization
    await page.screenshot({ path: 'playwright-results/03-ecs-initialized.png', fullPage: true });

    // Filter out acceptable errors (like dev server warnings)
    const criticalErrors = errors.filter(error =>
      !error.includes('DevTools') &&
      !error.includes('[HMR]') &&
      !error.includes('404') &&
      !error.includes('favicon')
    );

    expect(criticalErrors).toHaveLength(0);
  });

  test('should render mobile-friendly viewport', async ({ page }) => {
    await page.goto('/');

    // Check viewport meta tag for mobile
    const viewportMeta = page.locator('meta[name="viewport"]');
    await expect(viewportMeta).toHaveAttribute('content', /width=device-width/);

    // Verify responsive design works
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    // Take screenshot of mobile viewport
    await page.screenshot({ path: 'playwright-results/04-mobile-viewport.png', fullPage: true });

    // Check that canvas scales appropriately
    const canvasSize = await canvas.boundingBox();
    expect(canvasSize?.width).toBeLessThanOrEqual(375);
  });

  test('should initialize ECS world', async ({ page }) => {
    await page.goto('/');

    // Wait for ECS world to be initialized (exposed in dev mode)
    await waitForECSInitialization(page);

    // Take screenshot of ECS initialization
    await page.screenshot({ path: 'playwright-results/05-ecs-world.png', fullPage: true });

    // Check that Miniplex ECS world exists
    const ecsWorldExists = await page.evaluate(() => {
      return typeof (window as any).ecsWorld !== 'undefined';
    });

    expect(ecsWorldExists).toBeTruthy();
  });

  test('should handle touch input on mobile', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Touch test only relevant on mobile');

    await page.goto('/');

    // Wait for game to load
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    // Wait for ECS initialization to complete
    await waitForECSInitialization(page);

    // Take screenshot before touch
    await page.screenshot({ path: 'playwright-results/06-before-touch.png', fullPage: true });

    // Simulate touch interaction
    await canvas.tap();

    // Wait a moment for interaction to process
    await page.waitForTimeout(500);

    // Take screenshot after touch
    await page.screenshot({ path: 'playwright-results/07-after-touch.png', fullPage: true });

    // Verify canvas is still visible after touch (basic interaction test)
    await expect(canvas).toBeVisible();
  });

  test('should render 3D scene correctly', async ({ page }) => {
    await page.goto('/');

    // Wait for canvas and ECS
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 30000 });
    await waitForECSInitialization(page);

    // Wait for scene to render (give it a moment)
    await page.waitForTimeout(2000);

    // Take screenshot of 3D scene
    await page.screenshot({ path: 'playwright-results/08-3d-scene.png', fullPage: true });

    // Check that canvas has content (not just blank)
    const canvasContent = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return false;
      const ctx = canvas.getContext('2d');
      if (!ctx) return false;
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      // Check if canvas has any non-transparent pixels
      for (let i = 3; i < imageData.data.length; i += 4) {
        if (imageData.data[i] > 0) return true; // Alpha channel > 0
      }
      return false;
    });

    // Canvas should have some content (React Three Fiber should be rendering)
    expect(canvasContent).toBeTruthy();
  });

  test('should handle window resize', async ({ page }) => {
    await page.goto('/');

    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    await waitForECSInitialization(page);

    // Get initial canvas size
    const initialSize = await canvas.boundingBox();

    // Resize window
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForTimeout(500); // Wait for resize to process

    // Take screenshot after resize
    await page.screenshot({ path: 'playwright-results/09-after-resize.png', fullPage: true });

    // Canvas should still be visible
    await expect(canvas).toBeVisible();

    // Canvas size should have changed
    const newSize = await canvas.boundingBox();
    expect(newSize?.width).not.toBe(initialSize?.width);
  });
});
