/**
 * SIMPLE ERROR CHECK
 * 
 * Just load the page and dump ALL errors to test output.
 * No fancy formatting. Just raw errors we can actually read.
 */

import { test } from '@playwright/test';

test('capture all browser errors plainly', async ({ page }) => {
  test.setTimeout(120000);
  
  const errors: string[] = [];
  
  // Page errors
  page.on('pageerror', err => {
    const msg = `PAGE ERROR: ${err.message}\n${err.stack}`;
    errors.push(msg);
    console.log('\n' + msg + '\n');
  });
  
  // Console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = `CONSOLE ERROR: ${msg.text()}`;
      errors.push(text);
      console.log('\n' + text + '\n');
    } else {
      // Print everything so we can see what's happening
      console.log(`[${msg.type()}] ${msg.text()}`);
    }
  });
  
  console.log('\nLoading /universe.html...\n');
  
  await page.goto('/universe.html');
  
  console.log('\nWaiting 30 seconds...\n');
  await page.waitForTimeout(30000);
  
  console.log('\n=== FINAL ERROR COUNT ===');
  console.log(`Total errors: ${errors.length}\n`);
  
  if (errors.length > 0) {
    console.log('ERRORS FOUND:');
    errors.forEach((err, i) => {
      console.log(`\n${i+1}. ${err}\n`);
    });
    throw new Error(`Found ${errors.length} errors`);
  }
  
  console.log('✅ No errors detected\n');
});
