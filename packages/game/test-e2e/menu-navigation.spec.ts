import { test, expect } from '@playwright/test';

test('menu navigation actually works', async ({ page }) => {
  // Go to menu
  await page.goto('http://localhost:5173/');
  
  // Wait for page to load
  await page.waitForLoadState('networkidle');
  
  console.log('Page loaded:', await page.title());
  
  // Find the stellar formation link
  const stellarLink = page.locator('a:has-text("Stellar Formation")');
  console.log('Stellar link exists:', await stellarLink.count());
  
  // Check href
  const href = await stellarLink.getAttribute('href');
  console.log('Link href:', href);
  
  // Click it
  console.log('Clicking stellar formation link...');
  await stellarLink.click();
  
  // Wait for navigation
  await page.waitForURL(/simulation\.html/);
  
  console.log('Navigated to:', page.url());
  
  // Check we're on simulation page
  expect(page.url()).toContain('simulation.html');
  expect(page.url()).toContain('start=stellar-epoch');
});

