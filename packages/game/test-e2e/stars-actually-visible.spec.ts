import { test, expect } from '@playwright/test';

test('stars are actually visible on screen', async ({ page }) => {
  // Go directly to stellar epoch
  await page.goto('http://localhost:5173/simulation.html?start=stellar-epoch&speed=1000');
  
  // Wait for page load
  await page.waitForLoadState('networkidle');
  
  // Wait a bit for simulation to start
  await page.waitForTimeout(2000);
  
  // Get console logs
  const logs: string[] = [];
  page.on('console', msg => {
    logs.push(`[${msg.type()}] ${msg.text()}`);
  });
  
  // Get errors
  const errors: string[] = [];
  page.on('pageerror', err => {
    errors.push(`ERROR: ${err.message}`);
  });
  
  // Wait more for stars to spawn
  await page.waitForTimeout(5000);
  
  // Take screenshot
  await page.screenshot({ path: 'test-results/stars-visible.png', fullPage: true });
  
  // Print all logs
  console.log('\n=== CONSOLE LOGS ===');
  logs.forEach(log => console.log(log));
  
  console.log('\n=== ERRORS ===');
  errors.forEach(err => console.log(err));
  
  // Check star count in console
  const starCount = await page.evaluate(() => {
    return (window as any).universe?.spawner?.getAgents?.(1)?.length || 0;
  });
  
  console.log('\n=== STAR COUNT ===', starCount);
  
  // Check if splash is hidden
  const splashHidden = await page.locator('#splash').evaluate(el => {
    return window.getComputedStyle(el).opacity === '0';
  });
  
  console.log('Splash hidden:', splashHidden);
  
  // Check if canvas exists and has size
  const canvasInfo = await page.locator('#universe-canvas').evaluate(el => {
    const canvas = el as HTMLCanvasElement;
    return {
      width: canvas.width,
      height: canvas.height,
      visible: canvas.offsetWidth > 0 && canvas.offsetHeight > 0
    };
  });
  
  console.log('Canvas info:', canvasInfo);
  
  // FAIL THE TEST to see output
  expect(errors.length).toBe(0);
  expect(starCount).toBeGreaterThan(0);
});

