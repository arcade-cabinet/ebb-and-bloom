# Test Infrastructure Documentation

## Overview

Ebb & Bloom uses a comprehensive, multi-layered test infrastructure designed to ensure deterministic, reliable testing across all systems. The test suite is organized into four main categories:

### Test Structure

```
tests/
├── unit/              # Isolated component tests (300+ tests)
├── integration/       # Cross-system integration tests (29 tests)
├── e2e/              # End-to-end Playwright tests
│   ├── flows/        # User flow tests (seed-to-gameplay, etc.)
│   ├── visual/       # Visual regression tests
│   ├── demos/        # Demo mode tests
│   └── performance/  # E2E performance tests
├── performance/      # Vitest benchmarks
├── fixtures/         # Shared test setup utilities
├── factories/        # Test data generators
└── helpers/          # Utility functions
```

**Test Types:**

- **Unit Tests** (`tests/unit/`): Fast, isolated tests for individual components, governors, and systems
- **Integration Tests** (`tests/integration/`): Multi-system tests (GameState, determinism, performance)
- **E2E Tests** (`tests/e2e/`): Browser-based tests using Playwright for full user flows
- **Performance Benchmarks** (`tests/performance/`): Vitest benchmarks with performance budgets

**Key Infrastructure:**

- **Fixtures**: Auto-setup test utilities (RNG, audio mocking, haptics mocking)
- **Factories**: Consistent test data generation (cosmic objects, entities)
- **Helpers**: Shared assertion and utility functions
- **Global Setup**: Automatic RNG reset between tests (`tests/setup.ts`)

## Running Tests

### Quick Reference

```bash
# Unit + Integration tests
pnpm test              # Run all Vitest tests once
pnpm test:watch        # Run in watch mode
pnpm test:unit         # Run unit tests only
pnpm test:integration  # Run integration tests only

# E2E tests (Playwright)
pnpm test:e2e          # Run all E2E tests
pnpm test:e2e:ui       # Interactive UI mode
pnpm test:e2e:debug    # Debug mode with step-through
pnpm test:e2e:codegen  # Generate E2E tests from browser actions
pnpm test:e2e:report   # View HTML test report

# Performance benchmarks
pnpm test:coverage     # Run with coverage report
pnpm test:all          # Run ALL tests (unit + integration + e2e)
```

### Running Specific Tests

```bash
# Run specific test file
pnpm vitest tests/unit/governors/FlockingBehavior.test.ts

# Run tests matching pattern
pnpm vitest --reporter=verbose --run tests/integration/

# Run E2E tests for specific browser
pnpm playwright test --project=chromium
pnpm playwright test --project="Mobile Chrome"
```

## Using Fixtures

Fixtures provide automatic setup/teardown and mocking utilities. They are located in `tests/fixtures/`.

### RNG Fixture (Auto-Setup Globally)

The RNG fixture is **automatically set up globally** in `tests/setup.ts`. It resets the RNGRegistry before each test with the seed `'test-seed-default'`.

```typescript
import { describe, it, expect } from 'vitest';
import { createTestGenesis } from '../factories/cosmicFactories';
import { rngRegistry } from '../../engine/rng/RNGRegistry';

describe('My Test Suite', () => {
  it('uses global RNG automatically', () => {
    // RNG is already reset with 'test-seed-default'
    const genesis = createTestGenesis();
    expect(genesis).toBeDefined();
  });

  it('can use custom seed for specific tests', () => {
    // Change seed for this test only
    rngRegistry.setSeed('custom-seed');
    const genesis = createTestGenesis();
    
    // Reset to default seed (optional - done automatically after each test)
    rngRegistry.setSeed('test-seed-default');
  });

  it('can use withSeed helper for scoped seed changes', () => {
    const { withSeed } = setupRNGFixture();
    
    const result = withSeed('my-seed', () => {
      return createTestGenesis();
    });
    
    // Seed automatically resets to 'test-seed-default' after function
  });
});
```

**RNG Best Practices:**
- Never instantiate `EnhancedRNG` directly in tests - always use `rngRegistry.getScopedRNG(namespace)`
- Use deterministic seeds for reproducible tests
- Each test starts with a fresh RNG state automatically

### Audio Fixture

The audio fixture mocks the Web Audio API for testing audio systems without requiring a browser environment.

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setupAudioFixture } from '../fixtures/audioFixture';
import { CosmicAudioSonification } from '../../engine/audio/CosmicAudioSonification';
import { EnhancedRNG } from '../../engine/utils/EnhancedRNG';

describe('Audio System Tests', () => {
  const audioFixture = setupAudioFixture();

  it('creates audio nodes correctly', () => {
    const rng = new EnhancedRNG('audio-test');
    const sonification = new CosmicAudioSonification(rng);

    sonification.playSoundForStage('planck-epoch', 0.5);

    // Access mock audio context and nodes
    expect(audioFixture.mockAudioContext.createOscillator).toHaveBeenCalled();
    expect(audioFixture.mockNodes.length).toBeGreaterThan(0);
  });

  it('tracks audio connections', () => {
    // mockNodes array tracks all created nodes
    const oscillators = audioFixture.mockNodes.filter(n => n.type === 'oscillator');
    const gainNodes = audioFixture.mockNodes.filter(n => n.type === 'gain');
    
    expect(oscillators.length).toBeGreaterThan(0);
    expect(gainNodes.length).toBeGreaterThan(0);
  });
});
```

**Audio Fixture Features:**
- Complete Web Audio API mock (AudioContext, OscillatorNode, GainNode, etc.)
- Tracks all created audio nodes in `mockNodes` array
- Automatic reset before each test
- Supports parameter automation testing (setValueAtTime, linearRampToValueAtTime, etc.)

### Haptics Fixture

The haptics fixture mocks Capacitor's Haptics API for testing haptic feedback.

```typescript
import { describe, it, expect, vi } from 'vitest';
import { setupHapticsFixture } from '../fixtures/hapticsFixture';
import { CosmicHapticFeedback } from '../../engine/haptics/CosmicHapticFeedback';
import { EnhancedRNG } from '../../engine/utils/EnhancedRNG';

// Module-level mock (required)
const mockHaptics = {
  vibrate: vi.fn().mockResolvedValue(undefined),
  impact: vi.fn().mockResolvedValue(undefined),
  notification: vi.fn().mockResolvedValue(undefined),
};

vi.mock('@capacitor/haptics', () => ({
  Haptics: mockHaptics,
  ImpactStyle: { Light: 'LIGHT', Medium: 'MEDIUM', Heavy: 'HEAVY' },
  NotificationType: { Success: 'SUCCESS', Warning: 'WARNING', Error: 'ERROR' },
}));

describe('Haptics System Tests', () => {
  const hapticsFixture = setupHapticsFixture(mockHaptics);

  it('triggers haptic feedback for cosmic stages', () => {
    const rng = new EnhancedRNG('haptics-test');
    const haptics = new CosmicHapticFeedback(rng);

    haptics.triggerForStage('big-bang', 0.8);

    // Check that impact was called
    expect(mockHaptics.impact).toHaveBeenCalled();
  });

  it('provides call tracking helpers', () => {
    const impactCalls = hapticsFixture.getImpactCalls();
    const vibrateCalls = hapticsFixture.getVibrateCalls();
    
    expect(impactCalls.length).toBeGreaterThan(0);
  });
});
```

**Haptics Fixture Features:**
- Mocks Capacitor Haptics API (vibrate, impact, notification)
- Provides helper methods for call tracking
- Automatic mock clearing before each test
- Requires module-level mock setup (see example above)

## Using Factories

Factories provide consistent, reusable test data generation. They are located in `tests/factories/`.

### Cosmic Factories

Located in `tests/factories/cosmicFactories.ts`, these create cosmic domain objects.

```typescript
import { createTestGenesis, createTestTimeline, createTestStageContext } from '../factories/cosmicFactories';
import { rngRegistry } from '../../engine/rng/RNGRegistry';

describe('Using Cosmic Factories', () => {
  it('creates genesis with defaults', () => {
    const genesis = createTestGenesis();
    
    expect(genesis.hubbleConstant).toBeDefined();
    expect(genesis.cosmicMicrowaveTemp).toBeDefined();
  });

  it('creates genesis with custom RNG', () => {
    const customRNG = rngRegistry.getScopedRNG('custom-namespace');
    const genesis = createTestGenesis(customRNG);
    
    expect(genesis).toBeDefined();
  });

  it('creates genesis with overrides', () => {
    const genesis = createTestGenesis(undefined, {
      hubbleConstant: 72.0, // Custom value
    });
    
    expect(genesis.hubbleConstant).toBe(72.0);
  });

  it('creates timeline', () => {
    const timeline = createTestTimeline();
    
    const stages = timeline.getStages();
    expect(stages.length).toBe(14); // All cosmic stages
  });

  it('creates stage context for specific stage', () => {
    const { timeline, stage, index } = createTestStageContext(5);
    
    expect(index).toBe(5);
    expect(stage).toBeDefined();
    expect(timeline).toBeDefined();
  });
});
```

**Factory Functions:**

- `createTestGenesis(rng?, overrides?)`: Creates GenesisConstants with optional custom RNG and property overrides
- `createTestTimeline(rng?)`: Creates CosmicProvenanceTimeline with optional custom RNG
- `createTestStageContext(stageIndex, rng?)`: Creates timeline + specific stage by index

## Using Helpers

Helper utilities are located in `tests/helpers/testUtils.ts`.

```typescript
import { assertInRange, assertCloseTo, createTestCases } from '../helpers/testUtils';

describe('Using Test Helpers', () => {
  it('validates values are in range', () => {
    assertInRange(50, 0, 100); // Passes
    
    expect(() => {
      assertInRange(150, 0, 100); // Throws
    }).toThrow();
  });

  it('validates values are close to expected', () => {
    assertCloseTo(3.14159, Math.PI, 0.001); // Passes
    
    expect(() => {
      assertCloseTo(3.0, Math.PI, 0.001); // Throws
    }).toThrow();
  });

  it('creates parameterized test cases', () => {
    const cases = createTestCases([
      { seed: 'seed-1', expected: 42 },
      { seed: 'seed-2', expected: 84 },
    ]);
    
    expect(cases).toHaveLength(2);
  });
});
```

## Writing Parameterized Tests

Use Vitest's `it.each` or `test.each` for parameterized tests to reduce duplication.

### Basic Parameterized Tests

```typescript
import { describe, it, expect } from 'vitest';

describe('Parameterized Tests', () => {
  it.each([
    { input: 1, expected: 2 },
    { input: 2, expected: 4 },
    { input: 3, expected: 6 },
  ])('doubles $input to get $expected', ({ input, expected }) => {
    expect(input * 2).toBe(expected);
  });
});
```

### Parameterized Tests with Seeds

```typescript
import { describe, it, expect } from 'vitest';
import { rngRegistry } from '../../engine/rng/RNGRegistry';
import { createTestGenesis } from '../factories/cosmicFactories';

describe('Deterministic Cosmic Generation', () => {
  it.each([
    { seed: 'v1-alpha-beta-gamma', expectedMin: 60, expectedMax: 80 },
    { seed: 'v1-delta-epsilon-zeta', expectedMin: 60, expectedMax: 80 },
    { seed: 'v1-theta-iota-kappa', expectedMin: 60, expectedMax: 80 },
  ])('generates consistent Hubble constant for $seed', ({ seed, expectedMin, expectedMax }) => {
    rngRegistry.setSeed(seed);
    const genesis = createTestGenesis();
    
    expect(genesis.hubbleConstant).toBeGreaterThanOrEqual(expectedMin);
    expect(genesis.hubbleConstant).toBeLessThanOrEqual(expectedMax);
  });
});
```

### Edge Case Parameterized Tests

```typescript
describe('Edge Cases', () => {
  it.each([
    { value: 0, name: 'zero' },
    { value: Number.EPSILON, name: 'epsilon' },
    { value: Number.MAX_SAFE_INTEGER, name: 'max safe integer' },
    { value: Infinity, name: 'infinity' },
  ])('handles edge case: $name', ({ value, name }) => {
    // Test implementation
    expect(() => myFunction(value)).not.toThrow();
  });
});
```

## E2E Testing with Playwright

E2E tests are located in `tests/e2e/` and use Playwright for browser automation.

### Running E2E Tests

```bash
# Run all E2E tests
pnpm test:e2e

# Run in UI mode (interactive)
pnpm test:e2e:ui

# Run in debug mode
pnpm test:e2e:debug

# Generate tests using codegen
pnpm test:e2e:codegen

# View test report
pnpm test:e2e:report

# Run specific test file
pnpm playwright test tests/e2e/flows/intro-fmv.spec.ts

# Run tests for specific browser/device
pnpm playwright test --project=chromium
pnpm playwright test --project="Mobile Chrome"
pnpm playwright test --project="Mobile Safari"
```

### Writing E2E Tests

```typescript
import { test, expect } from '@playwright/test';
import { TEST_SEEDS } from '../fixtures/seeds';

test.describe('User Flow Tests', () => {
  test('complete seed-to-gameplay flow', async ({ page }) => {
    // Navigate to app
    await page.goto('/');

    // Enter seed
    const seedInput = page.getByPlaceholder(/v1-word-word-word/i);
    await seedInput.fill(TEST_SEEDS.deterministic);

    // Start game
    await page.getByRole('button', { name: /New Game/i }).click();

    // Wait for canvas (FMV starts)
    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible({ timeout: 10000 });

    // Verify no critical errors
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.waitForTimeout(5000);
    expect(consoleErrors.length).toBeLessThan(3);
  });
});
```

### Using Codegen to Generate Tests

Playwright Codegen allows you to record browser interactions and automatically generate test code:

```bash
# Start codegen
pnpm test:e2e:codegen

# This opens:
# 1. A browser window where you interact with your app
# 2. A Playwright Inspector window showing generated code

# Steps:
# 1. Navigate to http://localhost:5173
# 2. Click buttons, fill forms, etc.
# 3. Copy the generated code from Playwright Inspector
# 4. Paste into your test file
```

**Codegen Tips:**
- Use for discovering selectors (getByRole, getByPlaceholder, etc.)
- Record complex user flows
- Generate baseline visual regression tests
- Always review and clean up generated code

### Visual Regression Testing

Visual regression tests capture screenshots and compare them to baselines:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Visual Regression', () => {
  test('cosmic stage visuals match baseline', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to cosmic stage
    await page.getByRole('button', { name: /New Game/i }).click();
    await page.waitForTimeout(2000);
    
    // Take screenshot and compare to baseline
    await expect(page).toHaveScreenshot('cosmic-stage-bigbang.png', {
      maxDiffPixels: 100, // Allow minor rendering differences
    });
  });
});
```

**Visual Testing Tips:**
- First run creates baseline screenshots
- Subsequent runs compare against baselines
- Use `maxDiffPixels` or `threshold` to allow minor differences
- Update baselines with `pnpm playwright test --update-snapshots`
- Store baselines in version control

### Mobile Device Testing

Test on mobile devices using Playwright's device emulation:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Mobile Testing', () => {
  test('gyroscope controls work on mobile', async ({ page }) => {
    // Test runs on configured mobile devices (Pixel 5, iPhone 12)
    // See playwright.config.ts for device configuration
    
    await page.goto('/');
    await page.getByRole('button', { name: /New Game/i }).click();
    
    // Simulate device orientation
    await page.evaluate(() => {
      window.dispatchEvent(new DeviceOrientationEvent('deviceorientation', {
        alpha: 10,
        beta: 20,
        gamma: 30,
      }));
    });
    
    // Verify gyroscope response
    await page.waitForTimeout(1000);
  });
});
```

**Mobile Testing Features:**
- Pre-configured mobile viewports (Pixel 5, iPhone 12)
- Touch event simulation
- Device orientation simulation
- Mobile Safari and Chrome testing
- Haptics API testing (via mocks)

## Performance Benchmarks

Performance benchmarks are located in `tests/performance/` and use Vitest's benchmark feature.

### Running Benchmarks

```bash
# Run all benchmarks
pnpm vitest --run tests/performance/

# Run specific benchmark
pnpm vitest tests/performance/cosmic-generation.bench.ts

# Run with detailed output
pnpm vitest --reporter=verbose tests/performance/
```

### Writing Benchmarks

```typescript
import { describe, bench, beforeEach } from 'vitest';
import { GenesisConstants } from '../../engine/genesis/GenesisConstants';
import { rngRegistry } from '../../engine/rng/RNGRegistry';

describe('Performance Benchmarks', () => {
  beforeEach(() => {
    rngRegistry.reset();
    rngRegistry.setSeed('benchmark-seed');
  });

  bench('GenesisConstants creation', () => {
    const rng = rngRegistry.getScopedRNG('genesis-bench');
    new GenesisConstants(rng);
  }, { 
    iterations: 100,  // Run 100 times
    time: 1000        // Run for 1 second
  });

  bench('Full cosmic pipeline', () => {
    const rng = rngRegistry.getScopedRNG('pipeline-bench');
    const genesis = new GenesisConstants(rng);
    genesis.getTimeline();
  }, { 
    iterations: 50,
    time: 2000
  });
});
```

### Understanding Benchmark Results

Vitest outputs benchmark results in this format:

```
✓ tests/performance/cosmic-generation.bench.ts
  ✓ Cosmic Generation Performance
    name                              hz      min       max      mean       p75       p99      p995     p999     rme  samples
  · GenesisConstants creation    1,234   0.7123   12.3456    0.8102    0.8234    1.2345    1.4567   2.3456  ±1.23%      100
  · Full cosmic pipeline           234   3.4567   23.4567    4.2718    4.5678    5.6789    6.7890   8.9012  ±2.34%       50
```

**Metrics Explained:**
- **hz**: Operations per second (higher is better)
- **min**: Minimum execution time
- **max**: Maximum execution time
- **mean**: Average execution time
- **p75/p99/p995/p999**: Percentile measurements (75th, 99th, etc.)
- **rme**: Relative margin of error (lower is better)
- **samples**: Number of iterations

### Performance Budgets

Current performance budgets for key systems:

| System | Budget | Status |
|--------|--------|--------|
| GenesisConstants creation | < 10ms | ✅ Passing |
| CosmicProvenanceTimeline creation | < 100ms | ✅ Passing |
| Audio generation per stage | < 50ms | ✅ Passing |
| Haptic generation per stage | < 10ms | ✅ Passing |
| Full cosmic pipeline | < 150ms | ✅ Passing |

**Budget Monitoring:**
- Run benchmarks regularly to catch regressions
- Update budgets as optimization improves
- Flag tests that exceed budgets in CI

## Best Practices

### Test Organization

✅ **DO:**
- Place tests near related code (`engine/**/__tests__/`)
- Use descriptive test names: `it('generates consistent cosmic timeline for same seed')`
- Group related tests with `describe` blocks
- Use factories for consistent test data
- Leverage parameterized tests to reduce duplication

❌ **DON'T:**
- Create random test data - always use seeds
- Instantiate `EnhancedRNG` directly - use `rngRegistry.getScopedRNG()`
- Hardcode values - use factories and fixtures
- Write giant test files - split by feature/system
- Skip cleanup - fixtures handle it automatically

### Determinism

✅ **DO:**
- Always use `rngRegistry` for random number generation
- Use deterministic seeds in tests
- Test seed consistency with parameterized tests
- Verify same seed produces same results

❌ **DON'T:**
- Use `Math.random()` in any code (breaks determinism)
- Use time-based seeds in tests
- Skip RNG reset between tests (done automatically)

### Mocking

✅ **DO:**
- Use provided fixtures (audio, haptics) for mocking
- Mock external APIs (Capacitor, WebGL)
- Keep mocks simple and focused
- Clear mocks between tests (fixtures do this)

❌ **DON'T:**
- Mock internal engine code (test real implementations)
- Create complex mock hierarchies
- Forget to set up module-level mocks for Capacitor APIs

### Performance

✅ **DO:**
- Write fast unit tests (< 100ms each)
- Use benchmarks for performance-critical code
- Set and monitor performance budgets
- Run E2E tests in CI only (slow)

❌ **DON'T:**
- Add unnecessary waits in tests
- Run full E2E suite locally for every change
- Skip performance benchmarks

## Coverage

Current test coverage:

```
Unit Tests:           300+ tests passing
Integration Tests:    29/29 tests passing
E2E Tests:           Comprehensive coverage
Performance Tests:   All systems benchmarked

Code Coverage:       >80% lines, functions, statements
                     >75% branches
```

Run coverage report:

```bash
pnpm test:coverage      # Generate coverage report
pnpm test:coverage:ui   # Interactive coverage UI
```

Coverage thresholds are enforced in `vitest.config.ts`:
- Lines: 80%
- Functions: 80%
- Branches: 75%
- Statements: 80%

## Troubleshooting

### Common Issues

**RNG Not Deterministic:**
```typescript
// ❌ Wrong - creates new RNG instance
const rng = new EnhancedRNG('my-namespace');

// ✅ Correct - uses global registry
const rng = rngRegistry.getScopedRNG('my-namespace');
```

**Audio Tests Fail:**
```typescript
// Make sure to call setupAudioFixture in describe block
describe('Audio Tests', () => {
  const audioFixture = setupAudioFixture(); // ✅ Correct
  
  it('works', () => {
    // AudioContext is mocked
  });
});
```

**Haptics Tests Fail:**
```typescript
// ❌ Wrong - missing module-level mock
describe('Haptics Tests', () => {
  const hapticsFixture = setupHapticsFixture(mockHaptics);
});

// ✅ Correct - module-level mock first
const mockHaptics = { /* ... */ };
vi.mock('@capacitor/haptics', () => ({ /* ... */ }));

describe('Haptics Tests', () => {
  const hapticsFixture = setupHapticsFixture(mockHaptics);
});
```

**E2E Tests Timeout:**
```typescript
// Increase timeout for slow operations
await expect(canvas).toBeVisible({ timeout: 10000 }); // 10 seconds

// Or set test-level timeout
test('slow test', async ({ page }) => {
  test.setTimeout(60000); // 60 seconds
  // ...
});
```

### Getting Help

- Check existing tests for examples
- Review fixture/factory source code for usage patterns
- Run tests in watch mode for rapid feedback: `pnpm test:watch`
- Use Playwright UI mode for E2E debugging: `pnpm test:e2e:ui`
- Check test output for detailed error messages

## Further Reading

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library Documentation](https://testing-library.com/)
- [Deterministic Testing Guide](../../engine/genesis/README.md)
- [RNG Registry Documentation](../../engine/rng/RNGRegistry.ts)
