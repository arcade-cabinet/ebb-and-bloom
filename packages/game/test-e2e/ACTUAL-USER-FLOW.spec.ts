import { test, expect } from '@playwright/test';

test.setTimeout(60000); // 60 seconds

test('ACTUAL USER FLOW - click menu, see stars', async ({ page }) => {
  // Set up error/log listeners BEFORE any navigation
  const errors: string[] = [];
  const logs: string[] = [];
  
  page.on('pageerror', err => {
    const errMsg = `PAGEERROR: ${err.message}`;
    console.log('❌', errMsg);
    errors.push(errMsg);
  });
  
  page.on('console', msg => {
    const text = `[${msg.type()}] ${msg.text()}`;
    console.log(text);
    logs.push(text);
    if (msg.type() === 'error') {
      errors.push(text);
    }
  });
  
  page.on('requestfailed', req => {
    const msg = `REQUEST FAILED: ${req.url()}`;
    console.log('❌', msg);
    errors.push(msg);
  });
  
  console.log('\n=== STEP 1: Go to menu ===');
  await page.goto('http://localhost:5173/');
  await page.waitForLoadState('networkidle');
  
  // Screenshot menu
  await page.screenshot({ path: 'test-results/01-menu.png', fullPage: true });
  console.log('✓ Menu loaded');
  
  console.log('\n=== STEP 2: Click Stellar Formation ===');
  const stellarButton = page.locator('a:has-text("Stellar Formation")');
  await expect(stellarButton).toBeVisible();
  await stellarButton.click();
  
  console.log('\n=== STEP 3: Wait for simulation page ===');
  await page.waitForURL(/simulation\.html/);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'test-results/02-just-loaded.png', fullPage: true });
  console.log('✓ Simulation page loaded');
  
  console.log('\n=== STEP 4: Wait for splash to hide ===');
  const splash = page.locator('#splash');
  await page.waitForTimeout(2000); // Give it time
  await page.screenshot({ path: 'test-results/03-after-2sec.png', fullPage: true });
  
  const splashVisible = await splash.evaluate(el => {
    const style = window.getComputedStyle(el);
    return style.opacity !== '0' && style.display !== 'none';
  });
  console.log('Splash visible:', splashVisible);
  
  console.log('\n=== STEP 5: Wait and collect logs ===');
  await page.waitForTimeout(5000);
  
  console.log('\n=== CONSOLE LOGS (last 20) ===');
  logs.slice(-20).forEach(log => console.log(log));
  
  console.log('\n=== ERRORS ===');
  errors.forEach(err => console.log('ERROR:', err));
  
  console.log('\n=== STEP 6: Check if simulation is running ===');
  const universeState = await page.evaluate(() => {
    const universe = (window as any).universe;
    if (!universe) return { error: 'window.universe not defined' };
    
    return {
      age: universe.entropyAgent?.age,
      starCount: universe.spawner?.getAgents?.(1)?.length || 0,
      paused: universe.paused,
      phase: universe.entropyAgent?.phase,
      temperature: universe.entropyAgent?.temperature
    };
  });
  
  console.log('\n=== UNIVERSE STATE ===');
  console.log(JSON.stringify(universeState, null, 2));
  
  console.log('\n=== STEP 7: Check canvas ===');
  const canvasState = await page.evaluate(() => {
    const canvas = document.getElementById('universe-canvas') as HTMLCanvasElement;
    if (!canvas) return { error: 'Canvas not found' };
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return { error: 'No 2D context' };
    
    // Get pixel data from center of canvas
    const centerX = Math.floor(canvas.width / 2);
    const centerY = Math.floor(canvas.height / 2);
    const imageData = ctx.getImageData(centerX - 50, centerY - 50, 100, 100);
    
    // Count non-black pixels
    let nonBlackPixels = 0;
    for (let i = 0; i < imageData.data.length; i += 4) {
      const r = imageData.data[i];
      const g = imageData.data[i + 1];
      const b = imageData.data[i + 2];
      if (r > 0 || g > 0 || b > 0) {
        nonBlackPixels++;
      }
    }
    
    return {
      width: canvas.width,
      height: canvas.height,
      visible: canvas.offsetWidth > 0,
      nonBlackPixels,
      totalPixels: imageData.data.length / 4
    };
  });
  
  console.log('\n=== CANVAS STATE ===');
  console.log(JSON.stringify(canvasState, null, 2));
  
  // Final screenshot
  await page.screenshot({ path: 'test-results/04-final-state.png', fullPage: true });
  
  console.log('\n=== ASSERTIONS ===');
  
  // No JavaScript errors
  if (errors.length > 0) {
    console.log('❌ ERRORS FOUND:', errors);
  }
  expect(errors.length).toBe(0);
  
  // Universe exists
  expect(universeState).toHaveProperty('age');
  
  // Canvas has content
  if (canvasState.error) {
    console.log('❌ CANVAS ERROR:', canvasState.error);
  }
  expect(canvasState).not.toHaveProperty('error');
  
  console.log('\n=== TEST COMPLETE ===');
});

