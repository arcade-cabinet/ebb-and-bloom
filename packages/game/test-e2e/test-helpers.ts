/**
 * E2E Test Helpers
 * 
 * Reusable utilities with timeout guards for all tests
 */

import { Page, expect } from '@playwright/test';

/**
 * Safe timeouts for different operations
 */
export const TIMEOUTS = {
  PAGE_LOAD: 45000,        // Page navigation
  SIMULATION_INIT: 30000,  // Universe generation
  CYCLE_ADVANCE: 5000,     // Single cycle advance
  BATCH_CYCLES: 120000,    // 100+ cycles
  RENDER: 10000,           // 3D rendering ready
  AUDIO_INIT: 5000,        // Audio context ready
  SHORT_WAIT: 2000,        // Quick check
};

/**
 * Wait for universe generation with timeout guard
 */
export async function waitForUniverseReady(page: Page, timeout = TIMEOUTS.SIMULATION_INIT) {
  try {
    await page.waitForFunction(() => {
      return window.document.body.textContent?.includes('Star') ||
             window.document.body.textContent?.includes('Planet') ||
             window.document.body.textContent?.includes('Ready');
    }, { timeout });
    
    console.log('[TestHelper] ✅ Universe ready');
    return true;
  } catch (e) {
    console.error('[TestHelper] ⚠️ Universe generation timeout');
    throw new Error(`Universe generation timeout after ${timeout}ms`);
  }
}

/**
 * Wait for cycles to complete with timeout guard
 */
export async function waitForCycles(page: Page, targetCycle: number, timeout = TIMEOUTS.BATCH_CYCLES) {
  try {
    await page.waitForFunction((cycle) => {
      const text = window.document.body.textContent || '';
      return text.includes(`Cycle ${cycle}`) || text.includes(`CYCLE ${cycle}`);
    }, targetCycle, { timeout });
    
    console.log(`[TestHelper] ✅ Reached cycle ${targetCycle}`);
    return true;
  } catch (e) {
    console.error(`[TestHelper] ⚠️ Cycle ${targetCycle} timeout`);
    throw new Error(`Cycle ${targetCycle} not reached after ${timeout}ms`);
  }
}

/**
 * Wait for 3D scene ready with timeout guard
 */
export async function waitFor3DSceneReady(page: Page, timeout = TIMEOUTS.RENDER) {
  try {
    await page.waitForFunction(() => {
      // Check for Babylon scene ready
      return (window as any).scene !== undefined ||
             (window as any).universeScene !== undefined;
    }, { timeout });
    
    console.log('[TestHelper] ✅ 3D Scene ready');
    return true;
  } catch (e) {
    console.error('[TestHelper] ⚠️ 3D Scene timeout');
    throw new Error(`3D scene not ready after ${timeout}ms`);
  }
}

/**
 * Collect console logs with timeout guard
 */
export async function collectLogs(page: Page, duration = TIMEOUTS.SHORT_WAIT): Promise<string[]> {
  const logs: string[] = [];
  
  page.on('console', msg => logs.push(msg.text()));
  
  await page.waitForTimeout(duration);
  
  return logs;
}

/**
 * Wait for specific text with timeout guard
 */
export async function waitForText(
  page: Page, 
  text: string | RegExp, 
  timeout = TIMEOUTS.PAGE_LOAD
) {
  try {
    const selector = typeof text === 'string' 
      ? `text=${text}`
      : `text=/${text.source}/`;
    
    await page.waitForSelector(selector, { timeout, state: 'visible' });
    
    console.log(`[TestHelper] ✅ Found: ${text}`);
    return true;
  } catch (e) {
    console.error(`[TestHelper] ⚠️ Text not found: ${text}`);
    throw new Error(`Text "${text}" not found after ${timeout}ms`);
  }
}

/**
 * Safe navigation with timeout and error handling
 */
export async function safeNavigate(page: Page, url: string, timeout = TIMEOUTS.PAGE_LOAD) {
  try {
    await page.goto(url, { 
      timeout,
      waitUntil: 'domcontentloaded', // Don't wait for all resources
    });
    
    console.log(`[TestHelper] ✅ Navigated to: ${url}`);
    return true;
  } catch (e) {
    console.error(`[TestHelper] ⚠️ Navigation timeout: ${url}`);
    throw new Error(`Navigation to ${url} timeout after ${timeout}ms`);
  }
}

/**
 * Wait for element with retry
 */
export async function waitForElementWithRetry(
  page: Page,
  selector: string,
  maxRetries = 3,
  timeout = TIMEOUTS.PAGE_LOAD
) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await page.waitForSelector(selector, { timeout: timeout / maxRetries });
      console.log(`[TestHelper] ✅ Found element: ${selector}`);
      return true;
    } catch (e) {
      if (i === maxRetries - 1) {
        throw new Error(`Element ${selector} not found after ${maxRetries} retries`);
      }
      console.warn(`[TestHelper] Retry ${i + 1}/${maxRetries} for ${selector}`);
      await page.waitForTimeout(1000);
    }
  }
}

/**
 * Check for errors in console
 */
export function checkForErrors(logs: string[]): string[] {
  const errors = logs.filter(log => 
    log.includes('Error') ||
    log.includes('Failed') ||
    log.includes('NaN') ||
    log.toLowerCase().includes('undefined is not')
  );
  
  if (errors.length > 0) {
    console.error('[TestHelper] ⚠️ Errors found:', errors.slice(0, 5));
  }
  
  return errors;
}

/**
 * Verify determinism by comparing multiple runs
 */
export async function verifyDeterminism(
  page: Page,
  url: string,
  extractData: (page: Page) => Promise<string>,
  runs = 3
): Promise<boolean> {
  const results: string[] = [];
  
  for (let i = 0; i < runs; i++) {
    await safeNavigate(page, url, TIMEOUTS.PAGE_LOAD);
    await waitForUniverseReady(page);
    
    const data = await extractData(page);
    results.push(data);
    
    console.log(`[Determinism] Run ${i + 1}/${runs} complete`);
  }
  
  // All results should be identical
  const allSame = results.every(r => r === results[0]);
  
  if (allSame) {
    console.log('[Determinism] ✅ PERFECT - All runs identical');
  } else {
    console.error('[Determinism] ❌ FAILED - Results differ:');
    results.forEach((r, i) => console.error(`  Run ${i + 1}: ${r.slice(0, 100)}...`));
  }
  
  return allSame;
}


