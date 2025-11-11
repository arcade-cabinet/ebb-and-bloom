# Browser E2E Tests - Expectation-Based Testing

## Philosophy

**These tests validate EXPECTATIONS, not current implementation.**

The goal is NOT to fit tests to the code. The goal is that **tests GATE the code** and verify **EVERYTHING is actually working** as expected.

## Test Structure

### `smoke.spec.ts` - Basic Expectations
Tests fundamental game functionality:
- Page loads correctly
- Menu displays and navigates
- Canvas renders
- Game initializes without critical errors
- HUD displays
- Pause menu works

### `player-movement.spec.ts` - Player Movement Expectations
Tests player behavior expectations:
- Player spawns on terrain at correct height
- WASD movement works smoothly
- All movement directions respond
- Diagonal movement works correctly
- Player maintains ground level when moving
- Mouse look rotates camera
- Jump works when spacebar is pressed
- Performance remains acceptable during movement

### `world-interaction.spec.ts` - World Interaction Expectations
Tests world system expectations:
- World initializes without critical errors
- Terrain renders and is visible
- Player spawns outside settlement edges
- World updates continuously without crashing
- Terrain chunks load as player moves
- Performance remains acceptable during extended play
- Multiple simultaneous inputs work correctly

## Running Tests

```bash
# Run all browser tests
just test-browser

# Run with UI (headed browser)
just test-browser-ui

# Generate new tests using codegen
just test-codegen

# View test report
just test-report
```

## Writing New Tests

When writing new browser tests:

1. **Start with EXPECTATION**: What should the feature do?
2. **Test the EXPECTATION**: Verify the expected behavior
3. **Gate the code**: If the test fails, the feature is broken

### Example

```typescript
test('EXPECTATION: Feature X should do Y', async ({ page }) => {
  // EXPECTATION: Clear statement of what should happen
  
  // Setup
  await page.goto('/');
  
  // Action
  await page.click('button');
  
  // EXPECTATION: Verify expected behavior
  await expect(page.locator('.result')).toHaveText('Expected Result');
  
  // EXPECTATION: No errors occurred
  const errors = await collectErrors(page);
  expect(errors.length).toBe(0);
});
```

## Key Principles

1. **Tests gate code**: If a test fails, the feature is broken
2. **Test expectations**: What SHOULD happen, not what currently happens
3. **Verify behavior**: Test actual user-visible behavior
4. **Error handling**: Verify no critical errors occur
5. **Performance**: Verify acceptable performance during operations

## Notes

- Some tests may not work perfectly in headless mode (e.g., pointer lock)
- Filter out non-critical errors (WebGL warnings, favicon, etc.)
- Use timeouts appropriately for async operations
- Tests should be deterministic and repeatable
