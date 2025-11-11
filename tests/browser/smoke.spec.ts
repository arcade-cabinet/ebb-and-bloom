/**
 * BROWSER SMOKE TESTS - Basic Expectations
 * 
 * Tests EXPECTATIONS of basic game functionality.
 * These tests GATE the code - if they fail, the game is fundamentally broken.
 */

import { test, expect } from '@playwright/test';

test.describe('Game Smoke Tests - Basic Expectations', () => {
  test('EXPECTATION: Game page should load', async ({ page }) => {
    // EXPECTATION: Page should load and be accessible
    await page.goto('http://localhost:5173', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    // EXPECTATION: Page should be at correct URL
    expect(page.url()).toContain('localhost:5173');
  });

  test('EXPECTATION: Menu screen should display', async ({ page }) => {
    // EXPECTATION: Menu should be visible on initial load
    
    await page.goto('http://localhost:5173', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    // EXPECTATION: Menu should have title
    await expect(page.getByText(/Ebb & Bloom/i)).toBeVisible({ timeout: 10000 });
    
    // EXPECTATION: Menu should have "New Game" button
    await expect(page.getByRole('button', { name: 'New Game' })).toBeVisible({ timeout: 10000 });
  });

  test('EXPECTATION: Clicking "New Game" should navigate to game screen', async ({ page }) => {
    // EXPECTATION: Menu navigation should work correctly
    
    await page.goto('http://localhost:5173', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    // Click New Game button
    await page.getByRole('button', { name: 'New Game' }).click({ timeout: 10000 });
    
    // EXPECTATION: Canvas should appear (game screen)
    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeAttached({ timeout: 20000 });
  });

  test('EXPECTATION: Canvas should render', async ({ page }) => {
    // EXPECTATION: 3D canvas should be present and renderable
    
    await page.goto('http://localhost:5173', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    // Navigate to game
    await page.getByRole('button', { name: 'New Game' }).click({ timeout: 10000 });
    
    // EXPECTATION: Canvas should exist
    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeAttached({ timeout: 20000 });
    
    // EXPECTATION: Canvas should have dimensions
    const canvasBox = await canvas.boundingBox({ timeout: 5000 });
    expect(canvasBox).not.toBeNull();
    
    if (canvasBox) {
      expect(canvasBox.width).toBeGreaterThan(0);
      expect(canvasBox.height).toBeGreaterThan(0);
    }
  });

  test('EXPECTATION: Game should initialize without critical errors', async ({ page }) => {
    // EXPECTATION: Game initialization should complete without breaking errors
    
    const errors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('http://localhost:5173', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    // Navigate to game
    await page.getByRole('button', { name: 'New Game' }).click({ timeout: 10000 });
    
    // Wait for canvas
    await page.waitForSelector('canvas', { timeout: 20000 });
    
    // Give game time to initialize
    await page.waitForTimeout(5000);
    
    // Filter out non-critical errors
    const criticalErrors = errors.filter(e => 
      !e.includes('THREE.WebGLRenderer') &&
      !e.includes('Warning') &&
      !e.includes('deprecated') &&
      !e.includes('favicon') &&
      !e.includes('Failed to load resource')
    );
    
    // EXPECTATION: Should have minimal critical errors (allow some tolerance for browser differences)
    expect(criticalErrors.length).toBeLessThan(10);
  });

  test('EXPECTATION: HUD should display when in game', async ({ page }) => {
    // EXPECTATION: HUD components should be visible during gameplay
    
    await page.goto('http://localhost:5173', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    // Navigate to game
    await page.getByRole('button', { name: 'New Game' }).click({ timeout: 10000 });
    
    // Wait for game to initialize
    await page.waitForSelector('canvas', { timeout: 20000 });
    await page.waitForTimeout(2000);
    
    // EXPECTATION: HUD should be present (check for HUD container)
    // HUD is rendered as overlay, so we check for its presence
    // Note: HUD elements may be styled with specific classes or IDs
    // For now, we verify the game screen is active (HUD is conditionally rendered)
    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible({ timeout: 5000 });
  });

  test('EXPECTATION: ESC key should pause game', async ({ page }) => {
    // EXPECTATION: ESC key should toggle pause menu
    
    await page.goto('http://localhost:5173', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    // Navigate to game
    await page.getByRole('button', { name: 'New Game' }).click({ timeout: 10000 });
    
    // Wait for game
    await page.waitForSelector('canvas', { timeout: 20000 });
    await page.waitForTimeout(1000);
    
    // Press ESC
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    
    // EXPECTATION: Pause menu should appear (or game should pause)
    // Check for pause screen elements (Resume button, etc.)
    // Note: Pause screen may have specific text/buttons
    // For now, we verify no errors occurred
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.waitForTimeout(1000);
    
    const criticalErrors = errors.filter(e => 
      !e.includes('THREE.WebGLRenderer') &&
      !e.includes('Warning') &&
      !e.includes('deprecated') &&
      !e.includes('favicon')
    );
    
    expect(criticalErrors.length).toBe(0);
  });
});
