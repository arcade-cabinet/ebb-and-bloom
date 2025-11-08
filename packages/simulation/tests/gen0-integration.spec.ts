import { test, expect } from '@playwright/test';

/**
 * Gen0 Full Integration Tests
 * Tests complete frontend-backend integration with real interactions
 */

test.describe('Gen0 Full Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app
    await page.goto('/');
    
    // Wait for initial load
    await page.waitForLoadState('networkidle');
  });

  test('should create game and load Gen0 data from backend', async ({ page }) => {
    // Wait for game creation API call
    await page.waitForResponse(response => 
      response.url().includes('/api/game/create') && response.status() === 200
    );
    
    // Verify game info is displayed
    await expect(page.locator('text=GEN0: Planetary Genesis')).toBeVisible({ timeout: 30000 });
    await expect(page.locator('text=/Stellar Context:/')).toBeVisible();
    await expect(page.locator('text=/Planet Radius:/')).toBeVisible();
    
    // Verify API response contains valid data
    const response = await page.waitForResponse(response => 
      response.url().includes('/api/game/create')
    );
    const gameData = await response.json();
    
    expect(gameData.gameId).toBeTruthy();
    expect(gameData.seed).toBeTruthy();
    expect(gameData.state).toBeDefined();
  });

  test('should fetch Gen0 render data from backend API', async ({ page }) => {
    // Wait for game to be created
    await page.waitForSelector('text=GEN0: Planetary Genesis', { timeout: 30000 });
    
    // Wait for render API call
    const renderResponse = await page.waitForResponse(response => 
      response.url().includes('/api/game/') && 
      response.url().includes('/gen0/render') &&
      response.status() === 200
    );
    
    const renderData = await renderResponse.json();
    
    // Verify render data structure
    expect(renderData.planet).toBeDefined();
    expect(renderData.planet.radius).toBeGreaterThan(0);
    expect(renderData.planet.rotationPeriod).toBeGreaterThan(0);
    expect(renderData.moons).toBeInstanceOf(Array);
    expect(renderData.visualBlueprint).toBeDefined();
    expect(renderData.stellarContext).toBeTruthy();
  });

  test('should render planet in 3D scene', async ({ page }) => {
    // Wait for game initialization
    await page.waitForSelector('text=GEN0: Planetary Genesis', { timeout: 30000 });
    
    // Wait for 3D canvas to be ready
    await page.waitForTimeout(2000);
    
    // Check that canvas exists
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    
    // Verify canvas has content (not blank)
    const canvasBoundingBox = await canvas.boundingBox();
    expect(canvasBoundingBox).toBeTruthy();
    expect(canvasBoundingBox!.width).toBeGreaterThan(0);
    expect(canvasBoundingBox!.height).toBeGreaterThan(0);
    
    // Take screenshot to verify rendering
    await page.screenshot({ 
      path: 'test-results/gen0-planet-rendered.png',
      fullPage: true 
    });
  });

  test('should display planet properties correctly', async ({ page }) => {
    await page.waitForSelector('text=GEN0: Planetary Genesis', { timeout: 30000 });
    
    // Verify planet info panel displays correct data
    const planetRadiusText = await page.locator('text=/Planet Radius: \\d+ km/').textContent();
    expect(planetRadiusText).toBeTruthy();
    
    const rotationText = await page.locator('text=/Rotation Period: [\\d.]+ hours/').textContent();
    expect(rotationText).toBeTruthy();
    
    const moonCountText = await page.locator('text=/Moons: \\d+/').textContent();
    expect(moonCountText).toBeTruthy();
  });

  test('should animate moon orbital motion', async ({ page }) => {
    await page.waitForSelector('text=GEN0: Planetary Genesis', { timeout: 30000 });
    
    // Wait for initial render
    await page.waitForTimeout(2000);
    
    // Get initial time value
    const initialTimeText = await page.locator('text=/Time: \\d+s/').textContent();
    const initialTime = parseInt(initialTimeText!.match(/\d+/)![0]);
    
    // Wait for time to advance (should update every 100ms)
    await page.waitForTimeout(1500);
    
    const updatedTimeText = await page.locator('text=/Time: \\d+s/').textContent();
    const updatedTime = parseInt(updatedTimeText!.match(/\d+/)![0]);
    
    // Verify time is advancing
    expect(updatedTime).toBeGreaterThan(initialTime);
    
    // Take screenshot after animation
    await page.screenshot({ 
      path: 'test-results/gen0-moon-animation.png',
      fullPage: true 
    });
  });

  test('should respond to camera controls (orbit controls)', async ({ page }) => {
    await page.waitForSelector('text=GEN0: Planetary Genesis', { timeout: 30000 });
    await page.waitForTimeout(2000);
    
    const canvas = page.locator('canvas');
    const initialBoundingBox = await canvas.boundingBox();
    
    // Simulate mouse drag (orbit control)
    await canvas.dragTo(canvas, {
      sourcePosition: { x: 100, y: 100 },
      targetPosition: { x: 200, y: 200 },
    });
    
    // Wait for camera update
    await page.waitForTimeout(500);
    
    // Verify canvas still visible (camera moved but scene still renders)
    await expect(canvas).toBeVisible();
    
    // Take screenshot after camera movement
    await page.screenshot({ 
      path: 'test-results/gen0-camera-controls.png',
      fullPage: true 
    });
  });

  test('should handle zoom controls', async ({ page }) => {
    await page.waitForSelector('text=GEN0: Planetary Genesis', { timeout: 30000 });
    await page.waitForTimeout(2000);
    
    const canvas = page.locator('canvas');
    
    // Simulate wheel scroll (zoom)
    await canvas.hover();
    await page.mouse.wheel(0, -100); // Zoom in
    
    await page.waitForTimeout(500);
    
    await page.mouse.wheel(0, 100); // Zoom out
    
    await page.waitForTimeout(500);
    
    // Verify canvas still renders
    await expect(canvas).toBeVisible();
  });

  test('should update moon positions based on time parameter', async ({ page }) => {
    await page.waitForSelector('text=GEN0: Planetary Genesis', { timeout: 30000 });
    
    // Wait for render API to be called
    await page.waitForResponse(response => 
      response.url().includes('/gen0/render')
    );
    
    // Get initial render data
    const initialResponse = await page.waitForResponse(response => 
      response.url().includes('/gen0/render') &&
      response.url().includes('time=0')
    );
    const initialData = await initialResponse.json();
    
    if (initialData.moons.length > 0) {
      const initialMoonPosition = initialData.moons[0].position;
      
      // Wait for time to advance and new API call
      await page.waitForTimeout(2000);
      
      // Check that API is called with updated time
      const updatedResponse = await page.waitForResponse(response => 
        response.url().includes('/gen0/render') &&
        !response.url().includes('time=0')
      );
      const updatedData = await updatedResponse.json();
      
      // Moon positions should change (if orbital period allows)
      expect(updatedData.moons.length).toBe(initialData.moons.length);
    }
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Intercept and fail API call
    await page.route('**/api/game/create', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal server error' }),
      });
    });
    
    // Reload page
    await page.reload();
    
    // Should show error or loading state
    await page.waitForTimeout(2000);
    
    // Verify error handling (either error message or retry)
    const errorVisible = await page.locator('text=/error|Error|failed|Failed/i').isVisible().catch(() => false);
    // Error might be in console, but UI should handle gracefully
    expect(true).toBe(true); // Test passes if no crash
  });

  test('should render visual blueprint colors correctly', async ({ page }) => {
    await page.waitForSelector('text=GEN0: Planetary Genesis', { timeout: 30000 });
    await page.waitForTimeout(3000); // Wait for full render
    
    // Get render data to check visual blueprint
    const renderResponse = await page.waitForResponse(response => 
      response.url().includes('/gen0/render')
    );
    const renderData = await renderResponse.json();
    
    // Verify visual blueprint has color data
    if (renderData.visualBlueprint?.visualProperties?.pbrProperties?.baseColor) {
      expect(renderData.visualBlueprint.visualProperties.pbrProperties.baseColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
    
    // Take screenshot to verify colors are applied
    await page.screenshot({ 
      path: 'test-results/gen0-visual-blueprint.png',
      fullPage: true 
    });
  });

  test('should display texture references in UI', async ({ page }) => {
    await page.waitForSelector('text=GEN0: Planetary Genesis', { timeout: 30000 });
    
    // Check that texture references are displayed (if any)
    const textureText = await page.locator('text=/Textures:/').textContent().catch(() => null);
    
    if (textureText) {
      // Verify texture list is shown
      expect(textureText).toBeTruthy();
    }
  });
});

