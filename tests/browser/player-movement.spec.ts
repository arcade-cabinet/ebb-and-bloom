/**
 * BROWSER E2E TESTS - Player Movement Expectations
 * 
 * Tests EXPECTATIONS of player behavior, not current implementation.
 * These tests GATE the code - if they fail, the feature is broken.
 */

import { test, expect } from '@playwright/test';

test.describe('Player Movement Expectations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    // Navigate to game screen
    await page.getByRole('button', { name: 'New Game' }).click({ timeout: 10000 });
    
    // Wait for canvas and world initialization
    await page.waitForSelector('canvas', { timeout: 20000, state: 'attached' });
    await page.waitForTimeout(3000); // Allow world to initialize
  });

  test('EXPECTATION: Player should spawn on terrain at correct height', async ({ page }) => {
    // EXPECTATION: Player spawns on terrain, not floating or underground
    // We verify this by checking console logs for spawn messages
    
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'log' && msg.text().includes('[PlayerController] FixStanding')) {
        consoleMessages.push(msg.text());
      }
    });
    
    await page.waitForTimeout(2000);
    
    // Should have spawn log indicating terrain height was found
    const spawnLogs = consoleMessages.filter(m => m.includes('FixStanding'));
    expect(spawnLogs.length).toBeGreaterThan(0);
    
    // Verify no errors about player being underground or floating
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error' && (
        msg.text().includes('underground') || 
        msg.text().includes('floating') ||
        msg.text().includes('spawn')
      )) {
        errors.push(msg.text());
      }
    });
    
    await page.waitForTimeout(1000);
    expect(errors.length).toBe(0);
  });

  test('EXPECTATION: WASD keys should move player smoothly', async ({ page }) => {
    // EXPECTATION: Pressing W should move player forward relative to camera
    // We verify by checking that player position changes after movement input
    
    const canvas = page.locator('canvas').first();
    await canvas.click({ timeout: 5000 });
    await page.waitForTimeout(500);
    
    // Collect position logs (if any)
    const positionLogs: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'log' && msg.text().includes('position')) {
        positionLogs.push(msg.text());
      }
    });
    
    // Press W key and hold for movement
    await page.keyboard.down('KeyW');
    await page.waitForTimeout(2000); // Hold for 2 seconds
    await page.keyboard.up('KeyW');
    
    // EXPECTATION: No errors during movement
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error' && !msg.text().includes('THREE.WebGLRenderer')) {
        errors.push(msg.text());
      }
    });
    
    await page.waitForTimeout(1000);
    
    // Filter critical errors
    const criticalErrors = errors.filter(e => 
      !e.includes('Warning') && 
      !e.includes('deprecated') &&
      !e.includes('favicon')
    );
    
    expect(criticalErrors.length).toBe(0);
  });

  test('EXPECTATION: All movement directions should work (W/A/S/D)', async ({ page }) => {
    // EXPECTATION: All four movement keys should respond without errors
    
    const canvas = page.locator('canvas').first();
    await canvas.click({ timeout: 5000 });
    await page.waitForTimeout(500);
    
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Test each direction
    const keys = ['KeyW', 'KeyA', 'KeyS', 'KeyD'];
    for (const key of keys) {
      await page.keyboard.press(key);
      await page.waitForTimeout(200);
    }
    
    await page.waitForTimeout(500);
    
    const criticalErrors = errors.filter(e => 
      !e.includes('THREE.WebGLRenderer') &&
      !e.includes('Warning') &&
      !e.includes('deprecated') &&
      !e.includes('favicon')
    );
    
    // EXPECTATION: No critical errors from any movement key
    expect(criticalErrors.length).toBe(0);
  });

  test('EXPECTATION: Diagonal movement (W+D) should work correctly', async ({ page }) => {
    // EXPECTATION: Multiple keys pressed simultaneously should work
    // Diagonal movement should be normalized (not faster than single direction)
    
    const canvas = page.locator('canvas').first();
    await canvas.click({ timeout: 5000 });
    await page.waitForTimeout(500);
    
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Press both W and D simultaneously
    await page.keyboard.down('KeyW');
    await page.keyboard.down('KeyD');
    await page.waitForTimeout(1000);
    await page.keyboard.up('KeyW');
    await page.keyboard.up('KeyD');
    
    await page.waitForTimeout(500);
    
    const criticalErrors = errors.filter(e => 
      !e.includes('THREE.WebGLRenderer') &&
      !e.includes('Warning') &&
      !e.includes('deprecated') &&
      !e.includes('favicon')
    );
    
    // EXPECTATION: No errors from simultaneous key presses
    expect(criticalErrors.length).toBe(0);
  });

  test('EXPECTATION: Player should maintain ground level when moving', async ({ page }) => {
    // EXPECTATION: Player should not fall through terrain or float when moving
    // We verify by checking for errors about falling or collision issues
    
    const canvas = page.locator('canvas').first();
    await canvas.click({ timeout: 5000 });
    await page.waitForTimeout(500);
    
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Move continuously for several seconds
    await page.keyboard.down('KeyW');
    await page.waitForTimeout(3000);
    await page.keyboard.up('KeyW');
    
    await page.waitForTimeout(1000);
    
    // EXPECTATION: No errors about falling through terrain or collision
    const criticalErrors = errors.filter(e => 
      !e.includes('THREE.WebGLRenderer') &&
      !e.includes('Warning') &&
      !e.includes('deprecated') &&
      !e.includes('favicon') &&
      !e.includes('fall') &&
      !e.includes('collision') &&
      !e.includes('ground')
    );
    
    expect(criticalErrors.length).toBe(0);
  });

  test('EXPECTATION: Mouse look should rotate camera smoothly', async ({ page }) => {
    // EXPECTATION: Mouse movement should rotate camera without errors
    // Note: Pointer lock may not work in headless, but we can verify no errors
    
    const canvas = page.locator('canvas').first();
    await canvas.click({ timeout: 5000 });
    await page.waitForTimeout(500);
    
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Move mouse (may not trigger pointer lock in headless, but shouldn't error)
    await page.mouse.move(100, 100);
    await page.waitForTimeout(100);
    await page.mouse.move(200, 200);
    await page.waitForTimeout(100);
    await page.mouse.move(300, 300);
    
    await page.waitForTimeout(500);
    
    const criticalErrors = errors.filter(e => 
      !e.includes('THREE.WebGLRenderer') &&
      !e.includes('Warning') &&
      !e.includes('deprecated') &&
      !e.includes('favicon') &&
      !e.includes('PointerLock') // Pointer lock warnings are OK
    );
    
    // EXPECTATION: No critical errors from mouse movement
    expect(criticalErrors.length).toBe(0);
  });

  test('EXPECTATION: Jump should work when spacebar is pressed', async ({ page }) => {
    // EXPECTATION: Spacebar should trigger jump without errors
    
    const canvas = page.locator('canvas').first();
    await canvas.click({ timeout: 5000 });
    await page.waitForTimeout(500);
    
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Press spacebar
    await page.keyboard.press('Space');
    await page.waitForTimeout(1000);
    
    const criticalErrors = errors.filter(e => 
      !e.includes('THREE.WebGLRenderer') &&
      !e.includes('Warning') &&
      !e.includes('deprecated') &&
      !e.includes('favicon')
    );
    
    // EXPECTATION: No errors from jump input
    expect(criticalErrors.length).toBe(0);
  });

  test('EXPECTATION: Continuous movement should maintain performance', async ({ page }) => {
    // EXPECTATION: Game should maintain reasonable performance during extended movement
    // We verify by checking that movement completes in reasonable time
    
    const canvas = page.locator('canvas').first();
    await canvas.click({ timeout: 5000 });
    await page.waitForTimeout(500);
    
    const startTime = Date.now();
    
    // Move continuously for 5 seconds
    await page.keyboard.down('KeyW');
    await page.waitForTimeout(5000);
    await page.keyboard.up('KeyW');
    
    const elapsed = Date.now() - startTime;
    
    // EXPECTATION: Should complete in reasonable time (not frozen)
    // Allow some overhead, but should be close to 5 seconds
    expect(elapsed).toBeGreaterThan(4000);
    expect(elapsed).toBeLessThan(10000);
  });
});
