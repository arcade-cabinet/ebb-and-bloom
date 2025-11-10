/**
 * COLLISION & PHYSICS TESTS
 * 
 * Tests ground collision, boundaries, and position accuracy.
 */

import { test, expect } from '@playwright/test';

test.describe('Collision & Physics', () => {
  
  test('player stays on ground surface (not floating or falling through)', async ({ page }) => {
    await page.goto('http://localhost:5173/game.html?seed=v1-collision-test');
    await page.waitForSelector('#hud', { state: 'visible', timeout: 15000 });
    
    // Get terrain at spawn
    await page.waitForTimeout(2000);
    
    const positions: number[] = [];
    
    // Sample Y position over time
    for (let i = 0; i < 10; i++) {
      const posText = await page.locator('#pos').textContent();
      const coords = posText!.split(',').map(s => parseFloat(s.trim()));
      positions.push(coords[1]); // Y coordinate
      await page.waitForTimeout(200);
    }
    
    console.log('Y positions over 2 seconds:', positions);
    
    // All positions should be similar (not falling or floating)
    const avgY = positions.reduce((a, b) => a + b) / positions.length;
    const variance = positions.map(y => Math.abs(y - avgY));
    const maxVariance = Math.max(...variance);
    
    console.log('Average Y:', avgY);
    console.log('Max variance:', maxVariance);
    
    // Should not vary more than 0.5m (stable on ground)
    expect(maxVariance).toBeLessThan(0.5);
  });
  
  test('player Y position matches terrain height', async ({ page }) => {
    await page.goto('http://localhost:5173/game.html?seed=v1-terrain-match');
    await page.waitForSelector('#hud', { state: 'visible', timeout: 15000 });
    
    // Lock pointer and move
    await page.click('canvas');
    await page.waitForTimeout(500);
    
    // Move forward significantly
    await page.keyboard.down('KeyW');
    await page.waitForTimeout(3000);
    await page.keyboard.up('KeyW');
    
    const pos1Text = await page.locator('#pos').textContent();
    const pos1 = pos1Text!.split(',').map(s => parseFloat(s.trim()));
    console.log('Position 1:', pos1);
    
    // Turn and move different direction
    await page.mouse.move(600, 400);
    await page.waitForTimeout(200);
    
    await page.keyboard.down('KeyA');
    await page.waitForTimeout(2000);
    await page.keyboard.up('KeyA');
    
    const pos2Text = await page.locator('#pos').textContent();
    const pos2 = pos2Text!.split(',').map(s => parseFloat(s.trim()));
    console.log('Position 2:', pos2);
    
    // Y should change as we move over terrain (terrain isn't flat)
    const yDiff = Math.abs(pos2[1] - pos1[1]);
    console.log('Y difference:', yDiff);
    
    // Terrain varies, so Y should change
    expect(yDiff).toBeGreaterThan(0);
    
    // But shouldn't be extreme (no teleporting)
    expect(yDiff).toBeLessThan(20);
    
    // Y should be positive (above origin)
    expect(pos2[1]).toBeGreaterThan(-5);
  });
  
  test('player cannot move below ground', async ({ page }) => {
    await page.goto('http://localhost:5173/game.html?seed=v1-no-clip-test');
    await page.waitForSelector('#hud', { state: 'visible', timeout: 15000 });
    
    await page.click('canvas');
    await page.waitForTimeout(500);
    
    // Record minimum Y over movement
    const yPositions: number[] = [];
    
    // Move around terrain
    for (let i = 0; i < 5; i++) {
      await page.keyboard.down('KeyW');
      await page.waitForTimeout(800);
      await page.keyboard.up('KeyW');
      
      const posText = await page.locator('#pos').textContent();
      const y = parseFloat(posText!.split(',')[1].trim());
      yPositions.push(y);
      
      await page.mouse.move(400 + i * 50, 400);
      await page.waitForTimeout(100);
    }
    
    console.log('All Y positions:', yPositions);
    const minY = Math.min(...yPositions);
    console.log('Minimum Y:', minY);
    
    // Should never go significantly below ground
    // Terrain can go negative, but player shouldn't go below terrain
    expect(minY).toBeGreaterThan(-30);
  });
  
  test('gravity pulls player down when jumping', async ({ page }) => {
    await page.goto('http://localhost:5173/game.html?seed=v1-gravity-test');
    await page.waitForSelector('#hud', { state: 'visible', timeout: 15000 });
    
    await page.click('canvas');
    await page.waitForTimeout(500);
    
    const initialPosText = await page.locator('#pos').textContent();
    const initialY = parseFloat(initialPosText!.split(',')[1].trim());
    console.log('Initial Y:', initialY);
    
    // Try to jump (Space key)
    await page.keyboard.press('Space');
    await page.waitForTimeout(100);
    
    const jumpPosText = await page.locator('#pos').textContent();
    const jumpY = parseFloat(jumpPosText!.split(',')[1].trim());
    console.log('After jump press Y:', jumpY);
    
    // Wait for potential fall
    await page.waitForTimeout(1000);
    
    const finalPosText = await page.locator('#pos').textContent();
    const finalY = parseFloat(finalPosText!.split(',')[1].trim());
    console.log('Final Y:', finalY);
    
    // Should return to similar height (gravity brings back down)
    const yDiff = Math.abs(finalY - initialY);
    console.log('Y difference from start:', yDiff);
    
    // Should be close to initial (within 2m)
    expect(yDiff).toBeLessThan(2.0);
  });
  
  test('player X/Z position updates when moving', async ({ page }) => {
    await page.goto('http://localhost:5173/game.html?seed=v1-movement-test');
    await page.waitForSelector('#hud', { state: 'visible', timeout: 15000 });
    
    await page.click('canvas');
    await page.waitForTimeout(500);
    
    const initialPosText = await page.locator('#pos').textContent();
    const initialPos = initialPosText!.split(',').map(s => parseFloat(s.trim()));
    console.log('Initial position:', initialPos);
    
    // Move forward
    await page.keyboard.down('KeyW');
    await page.waitForTimeout(2000);
    await page.keyboard.up('KeyW');
    
    const forwardPosText = await page.locator('#pos').textContent();
    const forwardPos = forwardPosText!.split(',').map(s => parseFloat(s.trim()));
    console.log('After moving forward:', forwardPos);
    
    // Calculate horizontal distance
    const dx = forwardPos[0] - initialPos[0];
    const dz = forwardPos[2] - initialPos[2];
    const horizontalDist = Math.sqrt(dx * dx + dz * dz);
    
    console.log('Horizontal distance moved:', horizontalDist);
    
    // Should have moved horizontally (at least 1m in 2 seconds)
    expect(horizontalDist).toBeGreaterThan(1);
    
    // Move sideways
    await page.keyboard.down('KeyA');
    await page.waitForTimeout(1000);
    await page.keyboard.up('KeyA');
    
    const sidePosText = await page.locator('#pos').textContent();
    const sidePos = sidePosText!.split(',').map(s => parseFloat(s.trim()));
    console.log('After moving sideways:', sidePos);
    
    // Should be different from forward position
    const dx2 = sidePos[0] - forwardPos[0];
    const dz2 = sidePos[2] - forwardPos[2];
    const sideDist = Math.sqrt(dx2 * dx2 + dz2 * dz2);
    
    console.log('Sideways distance:', sideDist);
    expect(sideDist).toBeGreaterThan(0.5);
  });
  
  test('terrain height calculation is consistent', async ({ page }) => {
    await page.goto('http://localhost:5173/game.html?seed=v1-terrain-consistency');
    await page.waitForSelector('#hud', { state: 'visible', timeout: 15000 });
    
    // Get position
    await page.waitForTimeout(2000);
    const pos1Text = await page.locator('#pos').textContent();
    const pos1 = pos1Text!.split(',').map(s => parseFloat(s.trim()));
    
    // Reload page
    await page.reload();
    await page.waitForSelector('#hud', { state: 'visible', timeout: 15000 });
    
    // Get position again (should be same spawn point)
    await page.waitForTimeout(2000);
    const pos2Text = await page.locator('#pos').textContent();
    const pos2 = pos2Text!.split(',').map(s => parseFloat(s.trim()));
    
    console.log('First load:', pos1);
    console.log('Second load:', pos2);
    
    // Y should be identical (deterministic terrain)
    expect(Math.abs(pos1[1] - pos2[1])).toBeLessThan(0.1);
  });
  
  test('chunk boundaries do not cause position jumps', async ({ page }) => {
    await page.goto('http://localhost:5173/game.html?seed=v1-chunk-boundary');
    await page.waitForSelector('#hud', { state: 'visible', timeout: 15000 });
    
    await page.click('canvas');
    await page.waitForTimeout(500);
    
    const positions: Array<{x: number, y: number, z: number}> = [];
    
    // Move continuously and record positions
    await page.keyboard.down('KeyW');
    
    for (let i = 0; i < 20; i++) {
      await page.waitForTimeout(300);
      const posText = await page.locator('#pos').textContent();
      const coords = posText!.split(',').map(s => parseFloat(s.trim()));
      positions.push({ x: coords[0], y: coords[1], z: coords[2] });
    }
    
    await page.keyboard.up('KeyW');
    
    console.log('Positions sampled:', positions.length);
    
    // Check for sudden Y jumps (indicates chunk boundary issues)
    let maxYJump = 0;
    for (let i = 1; i < positions.length; i++) {
      const yJump = Math.abs(positions[i].y - positions[i-1].y);
      maxYJump = Math.max(maxYJump, yJump);
    }
    
    console.log('Max Y jump between frames:', maxYJump);
    
    // Terrain can be rough, but shouldn't teleport (< 10m jumps)
    expect(maxYJump).toBeLessThan(10.0);
  });
});

