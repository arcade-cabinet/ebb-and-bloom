/**
 * DEBUG BROWSER ERRORS
 * 
 * Use Playwright to capture browser console logs and find the real errors.
 */

import { test, expect } from '@playwright/test';

test.describe('Browser Error Debugging', () => {
  
  test('capture browser console logs and errors', async ({ page }) => {
    const logs: string[] = [];
    const errors: string[] = [];
    
    // Capture console logs
    page.on('console', (msg) => {
      logs.push(`${msg.type()}: ${msg.text()}`);
      console.log(`BROWSER ${msg.type().toUpperCase()}: ${msg.text()}`);
    });
    
    // Capture JavaScript errors
    page.on('pageerror', (error) => {
      errors.push(error.message);
      console.log(`BROWSER ERROR: ${error.message}`);
      console.log(`STACK: ${error.stack}`);
    });
    
    // Navigate to demo and wait for errors
    console.log('Navigating to periodic table demo...');
    await page.goto('/demos/periodic-table');
    
    // Wait a bit for any async errors
    await page.waitForTimeout(3000);
    
    // Log all captured errors
    console.log(`\n=== CAPTURED ${logs.length} LOGS ===`);
    logs.forEach(log => console.log(log));
    
    console.log(`\n=== CAPTURED ${errors.length} ERRORS ===`);
    errors.forEach(error => console.log(error));
    
    // Check if page is actually blank
    const bodyText = await page.locator('body').textContent();
    console.log(`\nBODY TEXT LENGTH: ${bodyText?.length || 0}`);
    console.log(`BODY CONTENT: ${bodyText?.substring(0, 200) || 'EMPTY'}`);
    
    // Look for any visible elements
    const visibleElements = await page.locator('*:visible').count();
    console.log(`VISIBLE ELEMENTS: ${visibleElements}`);
    
    // Check if React app div exists
    const appDiv = await page.locator('#root, #app, [data-reactroot]').count();
    console.log(`REACT APP CONTAINERS: ${appDiv}`);
  });

  test('check main game loads', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('pageerror', (error) => {
      errors.push(error.message);
      console.log(`MAIN GAME ERROR: ${error.message}`);
    });
    
    console.log('Testing main game route...');
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    const bodyText = await page.locator('body').textContent();
    console.log(`MAIN GAME BODY LENGTH: ${bodyText?.length || 0}`);
    
    if (errors.length > 0) {
      console.log('MAIN GAME HAS ERRORS:', errors);
    } else {
      console.log('MAIN GAME LOADS WITHOUT ERRORS');
    }
  });

});