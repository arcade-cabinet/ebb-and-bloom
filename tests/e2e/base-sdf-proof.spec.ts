import { test, expect } from '@playwright/test';

test.describe('Base SDF Renderer Proof', () => {
  test('should render complex, textured primitives without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error' && /shader|webgl|compile/i.test(msg.text())) {
        errors.push(msg.text());
      }
    });

    await page.goto('/demos/proof');
    
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 20000 });
    
    await page.waitForTimeout(3000);
    
    expect(await canvas.screenshot()).toMatchSnapshot('base-sdf-proof.png', { threshold: 0.3 });

    expect(errors).toEqual([]);
  });
});
