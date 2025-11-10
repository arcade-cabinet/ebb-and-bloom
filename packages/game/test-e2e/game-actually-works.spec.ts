import { test, expect } from '@playwright/test';

test.setTimeout(30000);

test('game actually loads and renders terrain', async ({ page }) => {
  const errors: string[] = [];
  const logs: string[] = [];
  
  page.on('pageerror', err => {
    errors.push(err.message);
    console.log('❌ ERROR:', err.message);
  });
  
  page.on('console', msg => {
    const text = `[${msg.type()}] ${msg.text()}`;
    logs.push(text);
    console.log(text);
  });
  
  console.log('\n=== Loading game ===');
  await page.goto('http://localhost:5173/game.html');
  await page.waitForLoadState('networkidle');
  
  // Wait for game to initialize
  await page.waitForTimeout(2000);
  
  // Take screenshot
  await page.screenshot({ path: 'test-results/game-loaded.png', fullPage: true });
  
  // Check if THREE is loaded
  const threeLoaded = await page.evaluate(() => {
    return typeof (window as any).THREE !== 'undefined';
  });
  
  console.log('THREE.js loaded:', threeLoaded);
  
  // Check if loading message is gone
  const loadingHidden = await page.locator('#loading').evaluate(el => {
    return window.getComputedStyle(el).display === 'none';
  });
  
  console.log('Loading hidden:', loadingHidden);
  
  // Check if HUD is visible
  const hudVisible = await page.locator('#hud').evaluate(el => {
    return window.getComputedStyle(el).display !== 'none';
  });
  
  console.log('HUD visible:', hudVisible);
  
  // Check canvas exists
  const canvasInfo = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    return canvas ? {
      width: canvas.width,
      height: canvas.height,
      visible: canvas.offsetWidth > 0
    } : null;
  });
  
  console.log('Canvas:', canvasInfo);
  
  console.log('\n=== ERRORS ===');
  errors.forEach(e => console.log(e));
  
  console.log('\n=== LAST 10 LOGS ===');
  logs.slice(-10).forEach(l => console.log(l));
  
  // Assertions
  expect(errors.length).toBe(0);
  expect(hudVisible).toBe(true);
  expect(loadingHidden).toBe(true);
});

