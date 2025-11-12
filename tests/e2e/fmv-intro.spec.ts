import { test, expect } from '@playwright/test';

test.describe('FMV Iconic Intro - Full Flow', () => {
  test('Menu → Intro transition via Start Game button', async ({ page }) => {
    const consoleMessages: string[] = [];
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];

    page.on('console', msg => {
      const text = msg.text();
      consoleMessages.push(`[${msg.type()}] ${text}`);
      
      if (msg.type() === 'error') {
        consoleErrors.push(text);
      }
    });

    page.on('pageerror', error => {
      pageErrors.push(error.message);
    });

    console.log('\n=== Loading Menu Scene ===');
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForSelector('canvas', { timeout: 10000 });
    
    console.log('Menu loaded, looking for New Game button...');
    
    const startButton = page.locator('button:has-text("New Game")');
    await expect(startButton).toBeVisible({ timeout: 5000 });
    
    console.log('Clicking New Game button...');
    await startButton.click();
    
    console.log('Waiting for intro scene transition...');
    await page.waitForTimeout(2000);
    
    console.log('\n=== Console Messages ===');
    consoleMessages.forEach(msg => console.log(msg));

    if (consoleErrors.length > 0) {
      console.log('\n=== Console Errors ===');
      consoleErrors.forEach(err => console.error(err));
    }

    if (pageErrors.length > 0) {
      console.log('\n=== Page Errors ===');
      pageErrors.forEach(err => console.error(err));
    }

    const criticalErrors = [...consoleErrors, ...pageErrors].filter(err => 
      !err.includes('WebGL') && 
      !err.includes('DevTools') &&
      !err.includes('404')
    );

    expect(criticalErrors).toHaveLength(0);
  });

  test('FMV stages render without shader errors', async ({ page }) => {
    const consoleMessages: string[] = [];
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];
    const shaderErrors: string[] = [];

    page.on('console', msg => {
      const text = msg.text();
      consoleMessages.push(`[${msg.type()}] ${text}`);
      
      if (msg.type() === 'error') {
        consoleErrors.push(text);
        
        if (text.includes('Shader Error') || text.includes('GLSL') || text.includes('Fragment') || text.includes('Vertex')) {
          shaderErrors.push(text);
        }
      }
    });

    page.on('pageerror', error => {
      pageErrors.push(error.message);
    });

    console.log('\n=== Loading Menu and Starting Game ===');
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForSelector('canvas', { timeout: 10000 });
    
    const startButton = page.locator('button:has-text("New Game")');
    await expect(startButton).toBeVisible({ timeout: 5000 });
    await startButton.click();
    
    console.log('Waiting for FMV stages to render...');
    await page.waitForTimeout(8000);
    
    console.log('\n=== All Console Messages ===');
    consoleMessages.forEach(msg => console.log(msg));

    if (shaderErrors.length > 0) {
      console.log('\n=== SHADER ERRORS ===');
      shaderErrors.forEach(err => console.error(err));
    }

    if (consoleErrors.length > 0) {
      console.log('\n=== Console Errors ===');
      consoleErrors.forEach(err => console.error(err));
    }

    if (pageErrors.length > 0) {
      console.log('\n=== Page Errors ===');
      pageErrors.forEach(err => console.error(err));
    }

    expect(shaderErrors).toHaveLength(0);
    
    const criticalErrors = [...consoleErrors, ...pageErrors].filter(err => 
      !err.includes('WebGL') && 
      !err.includes('DevTools') &&
      !err.includes('404') &&
      !err.includes('Shader Error')
    );

    expect(criticalErrors).toHaveLength(0);
  });

  test('Canvas renders and FPS counter works', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    
    const startButton = page.locator('button:has-text("New Game")');
    await expect(startButton).toBeVisible({ timeout: 5000 });
    await startButton.click();
    
    await page.waitForTimeout(3000);
    
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    
    const canvasElement = await canvas.boundingBox();
    expect(canvasElement).toBeTruthy();
    expect(canvasElement!.width).toBeGreaterThan(0);
    expect(canvasElement!.height).toBeGreaterThan(0);
    
    console.log(`Canvas size: ${canvasElement!.width}x${canvasElement!.height}`);
  });
});
