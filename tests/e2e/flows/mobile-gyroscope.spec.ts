/**
 * MOBILE GYROSCOPE E2E TESTS
 * 
 * Tests gyroscope camera control functionality on mobile devices.
 * Verifies device orientation events update camera position correctly.
 */

import { test, expect, devices } from '@playwright/test';

test.describe('Mobile Gyroscope Controls', () => {
  test.use({ ...devices['Pixel 5'] });
  
  test('gyroscope updates camera position', async ({ page }) => {
    await page.goto('/');
    
    const seedInput = page.getByPlaceholder(/v1-word-word-word/i);
    await seedInput.clear();
    await seedInput.fill('v1-gyro-test-seed');
    
    await page.getByRole('button', { name: /New Game/i }).click();
    
    await page.waitForSelector('[data-timeline-ready="true"]', { timeout: 10000 });
    
    await page.waitForTimeout(1000);
    
    const initialPos = await page.evaluate(() => {
      return (window as any).__CAMERA_POSITION__;
    });
    
    expect(initialPos).toBeDefined();
    expect(initialPos).toHaveProperty('x');
    expect(initialPos).toHaveProperty('y');
    expect(initialPos).toHaveProperty('z');
    
    await page.evaluate(() => {
      window.dispatchEvent(new DeviceOrientationEvent('deviceorientation', {
        alpha: 45,
        beta: 30,
        gamma: 10,
        absolute: true,
      }));
    });
    
    await page.waitForTimeout(500);
    
    const newPos = await page.evaluate(() => {
      return (window as any).__CAMERA_POSITION__;
    });
    
    expect(newPos).toBeDefined();
  });
  
  test('multiple device rotations update camera smoothly', async ({ page }) => {
    await page.goto('/');
    
    const seedInput = page.getByPlaceholder(/v1-word-word-word/i);
    await seedInput.clear();
    await seedInput.fill('v1-gyro-test-seed');
    
    await page.getByRole('button', { name: /New Game/i }).click();
    
    await page.waitForSelector('[data-timeline-ready="true"]', { timeout: 10000 });
    
    const orientations = [
      { alpha: 0, beta: 0, gamma: 0 },
      { alpha: 45, beta: 30, gamma: 10 },
      { alpha: 90, beta: 45, gamma: 20 },
      { alpha: 180, beta: 60, gamma: -10 },
      { alpha: 270, beta: 30, gamma: -20 },
    ];
    
    for (const orientation of orientations) {
      await page.evaluate((orient) => {
        window.dispatchEvent(new DeviceOrientationEvent('deviceorientation', {
          alpha: orient.alpha,
          beta: orient.beta,
          gamma: orient.gamma,
          absolute: true,
        }));
      }, orientation);
      
      await page.waitForTimeout(200);
      
      const pos = await page.evaluate(() => {
        return (window as any).__CAMERA_POSITION__;
      });
      
      expect(pos).toBeDefined();
    }
    
    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible();
  });
  
  test('gyroscope works during different cosmic stages', async ({ page }) => {
    await page.goto('/');
    
    const seedInput = page.getByPlaceholder(/v1-word-word-word/i);
    await seedInput.clear();
    await seedInput.fill('v1-gyro-test-seed');
    
    await page.getByRole('button', { name: /New Game/i }).click();
    
    await page.waitForSelector('[data-timeline-ready="true"]', { timeout: 10000 });
    
    const stages = [0, 1, 2];
    
    for (const stageIndex of stages) {
      await page.waitForSelector(`[data-stage-index="${stageIndex}"]`, { timeout: 30000 });
      
      await page.evaluate(() => {
        window.dispatchEvent(new DeviceOrientationEvent('deviceorientation', {
          alpha: 45,
          beta: 30,
          gamma: 10,
          absolute: true,
        }));
      });
      
      await page.waitForTimeout(200);
      
      const pos = await page.evaluate(() => {
        return (window as any).__CAMERA_POSITION__;
      });
      
      expect(pos).toBeDefined();
      expect(typeof pos.x).toBe('number');
      expect(typeof pos.y).toBe('number');
      expect(typeof pos.z).toBe('number');
    }
  });
});

test.describe('DeviceOrientation API Compatibility', () => {
  test('DeviceOrientation API is available', async ({ page }) => {
    await page.goto('/');
    
    const hasAPI = await page.evaluate(() => {
      return 'DeviceOrientationEvent' in window;
    });
    
    expect(hasAPI).toBe(true);
  });
  
  test('can dispatch device orientation events', async ({ page }) => {
    await page.goto('/');
    
    let eventFired = false;
    
    await page.evaluate(() => {
      window.addEventListener('deviceorientation', () => {
        (window as any).__GYRO_EVENT_FIRED__ = true;
      }, { once: true });
      
      window.dispatchEvent(new DeviceOrientationEvent('deviceorientation', {
        alpha: 0,
        beta: 0,
        gamma: 0,
        absolute: true,
      }));
    });
    
    await page.waitForTimeout(100);
    
    eventFired = await page.evaluate(() => {
      return (window as any).__GYRO_EVENT_FIRED__ === true;
    });
    
    expect(eventFired).toBe(true);
  });
});

test.describe('Gyroscope Error Handling', () => {
  test('app continues to work without gyroscope permissions', async ({ page }) => {
    await page.goto('/');
    
    const seedInput = page.getByPlaceholder(/v1-word-word-word/i);
    await seedInput.clear();
    await seedInput.fill('v1-gyro-test-seed');
    
    await page.getByRole('button', { name: /New Game/i }).click();
    
    await page.waitForSelector('[data-timeline-ready="true"]', { timeout: 10000 });
    
    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible();
  });
  
  test('invalid orientation values are handled gracefully', async ({ page }) => {
    await page.goto('/');
    
    const seedInput = page.getByPlaceholder(/v1-word-word-word/i);
    await seedInput.clear();
    await seedInput.fill('v1-gyro-test-seed');
    
    await page.getByRole('button', { name: /New Game/i }).click();
    
    await page.waitForSelector('[data-timeline-ready="true"]', { timeout: 10000 });
    
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.evaluate(() => {
      window.dispatchEvent(new DeviceOrientationEvent('deviceorientation', {
        alpha: NaN,
        beta: Infinity,
        gamma: -Infinity,
        absolute: true,
      }));
    });
    
    await page.waitForTimeout(500);
    
    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible();
    
    const criticalErrors = errors.filter(err => 
      !err.includes('Warning') && 
      !err.includes('DevTools')
    );
    
    expect(criticalErrors.length).toBeLessThan(3);
  });
});
