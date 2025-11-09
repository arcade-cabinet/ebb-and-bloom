/**
 * BROWSER ERROR DETECTION TEST
 * 
 * Properly captures ALL browser errors including call stack explosions.
 * This is what we SHOULD have been doing all along.
 */

import { test, expect } from '@playwright/test';

test.describe('Browser Error Detection', () => {
  test.setTimeout(120000); // 2 minutes
  
  test('should load universe without ANY browser errors', async ({ page }) => {
    // CAPTURE EVERYTHING
    const pageErrors: Error[] = [];
    const consoleErrors: string[] = [];
    const consoleWarnings: string[] = [];
    const consoleAll: Array<{type: string, text: string}> = [];
    
    // Page errors (uncaught exceptions, including call stack)
    page.on('pageerror', (error) => {
      pageErrors.push(error);
      console.error(`\n🔴 PAGE ERROR DETECTED:`);
      console.error(`   Message: ${error.message}`);
      console.error(`   Stack: ${error.stack}`);
    });
    
    // Console errors
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      
      consoleAll.push({ type, text });
      
      if (type === 'error') {
        consoleErrors.push(text);
        console.error(`\n🔴 CONSOLE ERROR: ${text}`);
      }
      
      if (type === 'warning' && !text.includes('DevTools')) {
        consoleWarnings.push(text);
        console.warn(`⚠️  CONSOLE WARNING: ${text}`);
      }
      
      // Log important messages
      if (text.includes('[LazyUniverseMap]') || 
          text.includes('[Genesis]') ||
          text.includes('Error') ||
          text.includes('exceeded')) {
        console.log(`[BROWSER] ${text}`);
      }
    });
    
    console.log('\n=== LOADING UNIVERSE ===\n');
    
    try {
      await page.goto('/universe.html', { 
        waitUntil: 'domcontentloaded',
        timeout: 30000 
      });
      
      console.log('✓ Page loaded');
      
      // Wait for initialization to start
      await page.waitForTimeout(2000);
      
      // Check for immediate errors
      if (pageErrors.length > 0) {
        console.error(`\n❌ PAGE ERRORS DETECTED (${pageErrors.length}):`);
        pageErrors.forEach((err, i) => {
          console.error(`\n${i+1}. ${err.message}`);
          console.error(`   ${err.stack?.split('\n')[0]}`);
        });
        throw new Error(`Page errors detected: ${pageErrors[0].message}`);
      }
      
      // Get progress status
      const progressText = await page.locator('#progressText').textContent();
      console.log(`Progress: ${progressText}`);
      
      // Wait for completion OR error
      console.log('\n=== WAITING FOR COMPLETION ===\n');
      
      const result = await Promise.race([
        // Wait for complete
        page.waitForFunction(() => {
          const text = document.getElementById('progressText')?.textContent || '';
          return text.includes('Complete');
        }, { timeout: 60000 }),
        
        // Wait for error
        page.waitForFunction(() => {
          const text = document.getElementById('progressText')?.textContent || '';
          return text.includes('Error');
        }, { timeout: 60000 }),
        
        // Timeout
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout waiting for completion')), 60000)
        ),
      ]).catch(err => {
        console.error(`\n❌ TIMEOUT OR ERROR: ${err.message}`);
        return 'timeout';
      });
      
      const finalProgress = await page.locator('#progressText').textContent();
      console.log(`\nFinal progress: ${finalProgress}`);
      
      // Report all collected errors
      console.log(`\n=== ERROR SUMMARY ===`);
      console.log(`Page errors: ${pageErrors.length}`);
      console.log(`Console errors: ${consoleErrors.length}`);
      console.log(`Console warnings: ${consoleWarnings.length}`);
      
      if (pageErrors.length > 0) {
        console.log(`\nPAGE ERRORS:`);
        pageErrors.forEach(err => {
          console.log(`  - ${err.message}`);
        });
      }
      
      if (consoleErrors.length > 0) {
        console.log(`\nCONSOLE ERRORS:`);
        consoleErrors.forEach(err => {
          console.log(`  - ${err}`);
        });
      }
      
      // ASSERTIONS
      expect(pageErrors.length, 
        `Found ${pageErrors.length} page errors. First: ${pageErrors[0]?.message}`
      ).toBe(0);
      
      expect(consoleErrors.length,
        `Found ${consoleErrors.length} console errors. First: ${consoleErrors[0]}`  
      ).toBe(0);
      
      expect(finalProgress).toContain('Complete');
      
      console.log('\n✅ NO ERRORS DETECTED - SYSTEM WORKING\n');
      
    } catch (error) {
      console.error(`\n💥 TEST CAUGHT ERROR: ${error}`);
      
      // Print all captured info
      console.log(`\nCaptured ${pageErrors.length} page errors`);
      console.log(`Captured ${consoleErrors.length} console errors`);
      console.log(`Captured ${consoleAll.length} total console messages`);
      
      throw error;
    }
  });
});
