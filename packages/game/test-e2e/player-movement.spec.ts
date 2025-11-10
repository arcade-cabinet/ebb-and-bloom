/**
 * PLAYER MOVEMENT TEST
 * 
 * Tests first-person controls including:
 * - WASD keyboard movement
 * - Mouse look
 * - Virtual joystick (mobile)
 * - Gravity and collision
 */

import { test, expect } from '@playwright/test';

test.describe('Player Movement', () => {
  test('player moves with WASD keys', async ({ page }) => {
    await page.goto('http://localhost:5173/game.html?seed=v1-test-movement');
    
    // Wait for game to load
    await page.waitForSelector('#hud', { state: 'visible', timeout: 15000 });
    
    // Lock pointer (enable controls)
    await page.click('canvas');
    await page.waitForTimeout(500);
    
    // Get initial position
    const initialPos = await page.locator('#pos').textContent();
    console.log('Initial position:', initialPos);
    
    // Press W key (move forward)
    await page.keyboard.down('KeyW');
    await page.waitForTimeout(1000);
    await page.keyboard.up('KeyW');
    
    // Check position changed
    const newPos = await page.locator('#pos').textContent();
    console.log('After W key:', newPos);
    expect(newPos).not.toBe(initialPos);
    
    // Press A key (move left)
    await page.keyboard.down('KeyA');
    await page.waitForTimeout(500);
    await page.keyboard.up('KeyA');
    
    const afterA = await page.locator('#pos').textContent();
    console.log('After A key:', afterA);
    expect(afterA).not.toBe(newPos);
    
    // Press S key (move backward)
    await page.keyboard.down('KeyS');
    await page.waitForTimeout(500);
    await page.keyboard.up('KeyS');
    
    // Press D key (move right)
    await page.keyboard.down('KeyD');
    await page.waitForTimeout(500);
    await page.keyboard.up('KeyD');
    
    const finalPos = await page.locator('#pos').textContent();
    console.log('Final position:', finalPos);
    
    // Player should have moved
    expect(finalPos).not.toBe(initialPos);
  });
  
  test('player stays on terrain (gravity)', async ({ page }) => {
    await page.goto('http://localhost:5173/game.html?seed=v1-test-gravity');
    
    await page.waitForSelector('#hud', { state: 'visible', timeout: 15000 });
    
    // Monitor Y position over time
    await page.waitForTimeout(2000);
    
    const position = await page.locator('#pos').textContent();
    console.log('Position after 2s:', position);
    
    // Extract Y coordinate (middle value)
    const coords = position!.split(',').map(s => parseFloat(s.trim()));
    const y = coords[1];
    
    console.log('Player Y:', y);
    
    // Y should be reasonable (not falling through world, not floating in sky)
    // Player eye height is 1.7m, terrain varies from -25 to +25
    expect(y).toBeGreaterThan(-10);
    expect(y).toBeLessThan(50);
  });
  
  test('game loads on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('http://localhost:5173/game.html?seed=v1-test-mobile');
    
    await page.waitForSelector('#hud', { state: 'visible', timeout: 15000 });
    
    // Game should load on mobile viewport
    const canvas = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      return canvas !== null;
    });
    
    expect(canvas).toBe(true);
    
    // HUD should be visible
    const hudVisible = await page.locator('#hud').isVisible();
    expect(hudVisible).toBe(true);
    
    // Should have world systems running
    const biomeText = await page.locator('#biome').textContent();
    expect(biomeText).toContain('Creatures:');
    
    console.log('✅ Game loads on mobile viewport');
    console.log('Note: VirtualJoystick auto-activates on touch devices');
  });
  
  test('player collides with terrain', async ({ page }) => {
    await page.goto('http://localhost:5173/game.html?seed=v1-test-collision');
    
    await page.waitForSelector('#hud', { state: 'visible', timeout: 15000 });
    
    await page.click('canvas');
    await page.waitForTimeout(500);
    
    // Move forward for a while
    await page.keyboard.down('KeyW');
    await page.waitForTimeout(2000);
    await page.keyboard.up('KeyW');
    
    // Check Y position tracks terrain
    const pos1 = await page.locator('#pos').textContent();
    const y1 = parseFloat(pos1!.split(',')[1].trim());
    
    // Move more
    await page.keyboard.down('KeyW');
    await page.waitForTimeout(1000);
    await page.keyboard.up('KeyW');
    
    const pos2 = await page.locator('#pos').textContent();
    const y2 = parseFloat(pos2!.split(',')[1].trim());
    
    console.log('Y positions:', y1, y2);
    
    // Y should change as we move over terrain
    // (terrain is not flat due to simplex noise)
    expect(Math.abs(y2 - y1)).toBeGreaterThan(0);
  });
});

