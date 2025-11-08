/**
 * Manual Screenshot Capture
 * 
 * This script captures screenshots of the application at various stages
 * to demonstrate the complete Gen0 flow visually.
 */

import { test, expect } from '@playwright/test';

test('Capture application screenshots', async ({ page }) => {
  // Capture console messages
  const consoleMessages: string[] = [];
  const consoleErrors: string[] = [];
  
  page.on('console', msg => {
    const text = msg.text();
    consoleMessages.push(text);
    if (msg.type() === 'error') {
      consoleErrors.push(text);
    }
  });
  
  // Step 1: Capture main menu
  await test.step('Main menu', async () => {
    await page.goto('/');
    await page.waitForTimeout(3000);
    
    await page.screenshot({ 
      path: 'test-results/screenshot-01-main-menu.png',
      fullPage: true 
    });
    
    console.log('📸 Main menu captured');
  });
  
  // Step 2: Open seed modal
  await test.step('Seed modal', async () => {
    const canvas = page.locator('#renderCanvas');
    const box = await canvas.boundingBox();
    
    if (box) {
      // Click "Start New" button
      const centerX = box.x + box.width / 2;
      const centerY = box.y + box.height / 2 - 50;
      await page.mouse.click(centerX, centerY);
      await page.waitForTimeout(1000);
      
      await page.screenshot({ 
        path: 'test-results/screenshot-02-seed-modal.png',
        fullPage: true 
      });
      
      console.log('📸 Seed modal captured');
    }
  });
  
  // Step 3: Enter seed
  await test.step('Seed entered', async () => {
    const canvas = page.locator('#renderCanvas');
    const box = await canvas.boundingBox();
    
    if (box) {
      // Click input field
      const inputX = box.x + box.width / 2;
      const inputY = box.y + box.height / 2 - 20;
      await page.mouse.click(inputX, inputY);
      await page.waitForTimeout(500);
      
      // Clear and type seed
      await page.keyboard.press('Control+A');
      await page.keyboard.type('v1-beautiful-world-demo');
      await page.waitForTimeout(500);
      
      await page.screenshot({ 
        path: 'test-results/screenshot-03-seed-entered.png',
        fullPage: true 
      });
      
      console.log('📸 Seed entered captured');
    }
  });
  
  // Step 4: Try to create world
  await test.step('Create world attempt', async () => {
    const canvas = page.locator('#renderCanvas');
    const box = await canvas.boundingBox();
    
    if (box) {
      // Click "Create World" button
      const createButtonX = box.x + box.width / 2;
      const createButtonY = box.y + box.height / 2 + 50;
      await page.mouse.click(createButtonX, createButtonY);
      
      // Wait for any navigation or errors
      await page.waitForTimeout(5000);
      
      await page.screenshot({ 
        path: 'test-results/screenshot-04-after-create-click.png',
        fullPage: true 
      });
      
      console.log('📸 After create world click captured');
      console.log('Current URL:', page.url());
    }
  });
  
  // Step 5: Try direct navigation to game scene
  await test.step('Direct game navigation', async () => {
    // Navigate directly to a game scene
    await page.goto('/#gameId=demo-game-12345');
    await page.waitForTimeout(5000);
    
    await page.screenshot({ 
      path: 'test-results/screenshot-05-game-scene-direct.png',
      fullPage: true 
    });
    
    console.log('📸 Game scene (direct navigation) captured');
  });
  
  // Step 6: Check console output
  await test.step('Console output', async () => {
    console.log('\n========================================');
    console.log('Console Messages:');
    console.log('========================================');
    consoleMessages.forEach(msg => console.log(msg));
    
    if (consoleErrors.length > 0) {
      console.log('\n========================================');
      console.log('Console Errors:');
      console.log('========================================');
      consoleErrors.forEach(err => console.error(err));
    }
  });
});
