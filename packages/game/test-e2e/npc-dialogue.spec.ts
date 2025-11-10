/**
 * NPC DIALOGUE TEST
 * 
 * Tests NPC interaction system:
 * - Clicking NPCs to open dialogue
 * - Role-based greetings
 * - Dialogue options
 * - Closing dialogue
 */

import { test, expect } from '@playwright/test';

test.describe('NPC Dialogue System', () => {
  test('can find and interact with NPCs', async ({ page }) => {
    await page.goto('http://localhost:5173/game.html?seed=v1-test-dialogue');
    
    // Wait for game ready
    await page.waitForSelector('#hud', { state: 'visible', timeout: 15000 });
    
    // Check NPCs spawned
    const hudText = await page.locator('#biome').textContent();
    console.log('HUD:', hudText);
    
    // Should show NPC count
    expect(hudText).toContain('NPCs:');
    
    // Extract NPC count
    const npcMatch = hudText!.match(/NPCs: (\d+)/);
    if (npcMatch) {
      const npcCount = parseInt(npcMatch[1]);
      console.log('NPC count:', npcCount);
      expect(npcCount).toBeGreaterThan(0);
    }
  });
  
  test('clicking on screen without pointer lock attempts NPC interaction', async ({ page }) => {
    await page.goto('http://localhost:5173/game.html?seed=v1-test-npc-click');
    
    await page.waitForSelector('#hud', { state: 'visible', timeout: 15000 });
    
    // Click on canvas (should try to interact OR lock pointer)
    await page.click('canvas', { position: { x: 400, y: 300 } });
    await page.waitForTimeout(500);
    
    // Either dialogue UI appeared OR pointer got locked
    const dialogueVisible = await page.evaluate(() => {
      const dialogue = document.querySelector('#dialogue-ui') as HTMLDivElement;
      return dialogue && dialogue.style.display === 'block';
    });
    
    const pointerLocked = await page.evaluate(() => {
      return document.pointerLockElement !== null;
    });
    
    // One of these should be true
    const interactionHappened = dialogueVisible || pointerLocked;
    expect(interactionHappened).toBe(true);
    
    console.log('Dialogue visible:', dialogueVisible);
    console.log('Pointer locked:', pointerLocked);
  });
  
  test('dialogue UI has proper structure', async ({ page }) => {
    await page.goto('http://localhost:5173/game.html?seed=v1-test-dialogue-ui');
    
    await page.waitForSelector('#hud', { state: 'visible', timeout: 15000 });
    
    // Check dialogue UI exists (even if hidden)
    const dialogueUI = await page.evaluate(() => {
      return document.querySelector('#dialogue-ui') !== null;
    });
    
    expect(dialogueUI).toBe(true);
    
    // Check structure
    const hasHeader = await page.evaluate(() => {
      return document.querySelector('#dialogue-header') !== null;
    });
    
    const hasText = await page.evaluate(() => {
      return document.querySelector('#dialogue-text') !== null;
    });
    
    const hasOptions = await page.evaluate(() => {
      return document.querySelector('#dialogue-options') !== null;
    });
    
    expect(hasHeader).toBe(true);
    expect(hasText).toBe(true);
    expect(hasOptions).toBe(true);
    
    console.log('✅ Dialogue UI structure complete');
  });
});

