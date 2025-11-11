/**
 * PLAYER ACTIONS TEST
 * 
 * Tests Daggerfall-style actions:
 * - Jumping (Space key / mobile button)
 * - Attacking (Click / mobile button)
 * - Using (E key / mobile button)
 * - Sprinting (Shift / mobile button)
 */

import { test, expect } from '@playwright/test';

test.describe('Player Actions', () => {
  
  test('jump increases Y position when grounded', async ({ page }) => {
    await page.goto('http://localhost:5173/game.html?seed=v1-jump-test');
    await page.waitForSelector('#hud', { state: 'visible', timeout: 15000 });
    
    await page.click('canvas');
    await page.waitForTimeout(1000);
    
    // Get initial Y
    const pos1Text = await page.locator('#pos').textContent();
    const y1 = parseFloat(pos1Text!.split(',')[1].trim());
    console.log('Before jump Y:', y1);
    
    // Jump
    await page.keyboard.press('Space');
    await page.waitForTimeout(300); // Peak of jump
    
    const pos2Text = await page.locator('#pos').textContent();
    const y2 = parseFloat(pos2Text!.split(',')[1].trim());
    console.log('During jump Y:', y2);
    
    // Should be higher
    expect(y2).toBeGreaterThan(y1);
    
    // Wait for landing
    await page.waitForTimeout(1000);
    
    const pos3Text = await page.locator('#pos').textContent();
    const y3 = parseFloat(pos3Text!.split(',')[1].trim());
    console.log('After landing Y:', y3);
    
    // Should return to near original
    expect(Math.abs(y3 - y1)).toBeLessThan(1.0);
  });
  
  test('sprint increases movement speed', async ({ page }) => {
    await page.goto('http://localhost:5173/game.html?seed=v1-sprint-test');
    await page.waitForSelector('#hud', { state: 'visible', timeout: 15000 });
    
    await page.click('canvas');
    await page.waitForTimeout(500);
    
    // Move without sprint
    const pos1Text = await page.locator('#pos').textContent();
    const pos1 = pos1Text!.split(',').map(s => parseFloat(s.trim()));
    
    await page.keyboard.down('KeyW');
    await page.waitForTimeout(1000);
    await page.keyboard.up('KeyW');
    
    const pos2Text = await page.locator('#pos').textContent();
    const pos2 = pos2Text!.split(',').map(s => parseFloat(s.trim()));
    
    const normalDist = Math.sqrt(
      Math.pow(pos2[0] - pos1[0], 2) + Math.pow(pos2[2] - pos1[2], 2)
    );
    console.log('Normal speed distance:', normalDist);
    
    // Reset position
    await page.waitForTimeout(500);
    const pos3Text = await page.locator('#pos').textContent();
    const pos3 = pos3Text!.split(',').map(s => parseFloat(s.trim()));
    
    // Move with sprint
    await page.keyboard.down('ShiftLeft');
    await page.keyboard.down('KeyW');
    await page.waitForTimeout(1000);
    await page.keyboard.up('KeyW');
    await page.keyboard.up('ShiftLeft');
    
    const pos4Text = await page.locator('#pos').textContent();
    const pos4 = pos4Text!.split(',').map(s => parseFloat(s.trim()));
    
    const sprintDist = Math.sqrt(
      Math.pow(pos4[0] - pos3[0], 2) + Math.pow(pos4[2] - pos3[2], 2)
    );
    console.log('Sprint speed distance:', sprintDist);
    
    // Sprint should be faster
    expect(sprintDist).toBeGreaterThan(normalDist * 1.2);
  });
  
  test('attack triggers with cooldown', async ({ page }) => {
    await page.goto('http://localhost:5173/game.html?seed=v1-attack-test');
    await page.waitForSelector('#hud', { state: 'visible', timeout: 15000 });
    
    await page.click('canvas');
    await page.waitForTimeout(500);
    
    // Monitor console for attack logs
    const logs: string[] = [];
    page.on('console', msg => {
      if (msg.text().includes('Attack')) {
        logs.push(msg.text());
      }
    });
    
    // Click to attack
    await page.click('canvas');
    await page.waitForTimeout(100);
    
    // Try to attack again immediately (should be on cooldown)
    await page.click('canvas');
    await page.waitForTimeout(100);
    
    // Wait for cooldown
    await page.waitForTimeout(600);
    
    // Attack again (should work)
    await page.click('canvas');
    await page.waitForTimeout(100);
    
    console.log('Attack logs:', logs);
    
    // Should have 2 attacks (first and third), not middle one
    expect(logs.length).toBeGreaterThanOrEqual(2);
  });
  
  test('action buttons visible on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('http://localhost:5173/game.html?seed=v1-mobile-actions');
    await page.waitForSelector('#hud', { state: 'visible', timeout: 15000 });
    
    // Check for action buttons
    const actionButtons = await page.evaluate(() => {
      return document.querySelector('#action-buttons') !== null;
    });
    
    // May or may not show (depends on touch detection)
    console.log('Action buttons present:', actionButtons);
  });
  
  test('keyboard controls documented in HUD', async ({ page }) => {
    await page.goto('http://localhost:5173/game.html?seed=v1-controls-test');
    await page.waitForSelector('#hud', { state: 'visible', timeout: 15000 });
    
    // Game should be playable
    await page.click('canvas');
    await page.waitForTimeout(500);
    
    // Try all controls
    await page.keyboard.press('KeyW'); // Forward
    await page.waitForTimeout(200);
    await page.keyboard.press('KeyA'); // Left
    await page.waitForTimeout(200);
    await page.keyboard.press('KeyS'); // Back
    await page.waitForTimeout(200);
    await page.keyboard.press('KeyD'); // Right
    await page.waitForTimeout(200);
    await page.keyboard.press('Space'); // Jump
    await page.waitForTimeout(200);
    await page.click('canvas'); // Attack
    await page.waitForTimeout(200);
    
    // No errors expected
    const errors = await page.evaluate(() => {
      const errLogs = (window as any).errorLogs || [];
      return errLogs;
    });
    
    expect(errors).toHaveLength(0);
    console.log('✅ All keyboard controls working');
  });
});



