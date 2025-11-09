# End-to-End Tests

**REAL TESTS. NO SHORTCUTS. NO MOCKS.**

These tests exercise the ACTUAL system as users experience it.

---

## Test Suites

### 1. Genesis Synthesis (`genesis-synthesis.spec.ts`)
**Tests the core synthesis engine in the browser.**

- ✅ Complete civilization synthesis from seed
- ✅ Technological level reached
- ✅ Determinism (same seed = same result)
- ⏱️ ~30 seconds per test

### 2. Universe Activity Map (`universe-activity-map.spec.ts`)
**Tests the full visualization system.**

- ✅ Main menu loads
- ✅ Universe view initializes
- ✅ Progress updates during synthesis
- ✅ Point cloud renders
- ✅ Civilizations detected
- ✅ Camera controls work
- ✅ No JavaScript errors
- ⏱️ ~4 minutes per test (REAL synthesis!)

### 3. Full User Flow (`full-user-flow.spec.ts`)
**Tests complete user journey from menu to cosmos.**

- ✅ Menu → Universe navigation
- ✅ Synthesis completion
- ✅ Results display
- ✅ Interactive controls
- ✅ Console messages
- ⏱️ ~4-5 minutes (full experience)

---

## Running Tests

### All Tests
```bash
cd packages/game
pnpm test:e2e
```

### Specific Suite
```bash
pnpm test:e2e genesis-synthesis
pnpm test:e2e universe-activity-map
pnpm test:e2e full-user-flow
```

### With UI (Watch Mode)
```bash
pnpm test:e2e:ui
```

### Debug Mode
```bash
pnpm test:e2e:debug
```

---

## What These Tests Verify

### No Shortcuts
- ❌ No mocked functions
- ❌ No test-only code paths
- ❌ No simplified algorithms
- ✅ REAL Genesis Synthesis (Big Bang → Present)
- ✅ REAL Salpeter IMF
- ✅ REAL Cope's Rule
- ✅ REAL Kleiber's Law

### Full System
- ✅ TypeScript compilation
- ✅ Module bundling (Vite)
- ✅ Browser rendering (BabylonJS)
- ✅ DOM manipulation
- ✅ Event handling
- ✅ Async operations
- ✅ Performance under load

### User Experience
- ✅ Page loads
- ✅ Navigation works
- ✅ Progress indicators update
- ✅ Results display correctly
- ✅ Controls are interactive
- ✅ No console errors

---

## Expected Results

### Genesis Synthesis Test
```
✅ Should synthesize civilization: PASS (15-30s)
✅ Should produce technological level: PASS (15-30s)  
✅ Should be deterministic: PASS (30-60s)

Total: 3/3 passing
Time: ~1-2 minutes
```

### Universe Activity Map Test
```
✅ Should load main menu: PASS (2s)
✅ Should initialize universe: PASS (5s)
✅ Should show progress: PASS (10s)
✅ Should complete synthesis: PASS (180-240s) ← THE BIG ONE
✅ Should detect civilizations: PASS (180-240s)
✅ Should have camera controls: PASS (5s)
✅ Should have no errors: PASS (180-240s)

Total: 7/7 passing
Time: ~4-5 minutes (synthesis is REAL)
```

### Full User Flow Test
```
✅ Complete user flow: PASS (240-300s)
✅ Quick Start guide: PASS (2s)
✅ About information: PASS (2s)
✅ Console welcome: PASS (2s)

Total: 4/4 passing
Time: ~4-5 minutes
```

---

## Why These Tests Take Time

### Synthesis is REAL
Each test that synthesizes regions runs:
- 125 regions × 1-2 sec each = 2-4 minutes
- Each region: Big Bang → 13.8 Gyr simulation
- Each epoch: particles → atoms → stars → planets → life → civilization
- NO shortcuts taken

### This is GOOD
- Proves system works end-to-end
- Validates performance is acceptable
- Catches integration bugs
- Tests user experience accurately

---

## CI/CD Integration

### GitHub Actions
```yaml
- name: E2E Tests
  run: |
    cd packages/game
    pnpm install
    pnpm build
    pnpm test:e2e
  timeout-minutes: 15
```

### Expected Duration
- Genesis tests: 1-2 minutes
- Universe tests: 4-5 minutes  
- Full flow tests: 4-5 minutes
- **Total: ~10-12 minutes**

### Parallelization
Can run test files in parallel:
```bash
pnpm test:e2e --workers=3
```

But each test still takes full time (REAL synthesis).

---

## Debugging Failed Tests

### Test Stuck at "Synthesizing"
**This is NORMAL.**  
Real synthesis takes 2-4 minutes.  
Wait for timeout or check:
```javascript
// In test:
await page.pause(); // Opens inspector
```

### Test Shows "Error"
Check console output:
```typescript
page.on('console', msg => console.log(msg.text()));
page.on('pageerror', err => console.error(err));
```

### Visual Debugging
```bash
pnpm test:e2e:debug
```
Opens browser with DevTools.

---

## What Success Looks Like

### Terminal Output
```
Running 3 tests using 1 worker

  ✓ genesis-synthesis.spec.ts:10:1 › should synthesize civilization (18s)
  ✓ genesis-synthesis.spec.ts:45:1 › should produce technological (16s)
  ✓ genesis-synthesis.spec.ts:75:1 › should be deterministic (32s)

  3 passed (1m 6s)
```

### Browser (UI Mode)
- Green checkmarks
- All assertions pass
- No red errors
- Final state shows civilizations

---

## Test Coverage

### What's Tested
- ✅ Genesis Synthesis Engine
- ✅ Universe Activity Map
- ✅ Point cloud rendering
- ✅ Progress indicators
- ✅ Camera controls
- ✅ User navigation
- ✅ Console output
- ✅ Error handling

### What's NOT Tested (Yet)
- ⏳ Click to zoom (not implemented)
- ⏳ Time animation (not implemented)
- ⏳ Game mode trigger (not implemented)
- ⏳ Multi-level zoom (not implemented)

---

## Adding New Tests

### Template
```typescript
test('should do something real', async ({ page }) => {
  test.setTimeout(300000); // 5 min if synthesis involved
  
  await page.goto('/universe.html');
  
  // Test REAL functionality
  // NO mocks, NO shortcuts
  
  await page.waitForFunction(() => {
    // Wait for REAL completion
  });
  
  // Verify REAL results
  expect(something).toBe(real);
});
```

### Guidelines
1. Test real user actions only
2. Use real timeouts (synthesis takes time)
3. Verify actual output (not test doubles)
4. Check console for errors
5. Validate DOM state matches reality

---

**These are REAL tests.**  
**They test the REAL system.**  
**They take REAL time.**  
**They catch REAL bugs.**

**No shortcuts. That's the point.**
