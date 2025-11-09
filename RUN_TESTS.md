# 🧪 HOW TO RUN TESTS

**REAL tests on the REAL system. No shortcuts.**

---

## Prerequisites

```bash
cd /Users/jbogaty/src/ebb-and-bloom
pnpm install
```

---

## 1. Quick Validation (30 seconds)

### Test Genesis Synthesis (CLI)
```bash
cd packages/game
pnpm exec tsx src/cli/test-genesis-synthesis.ts
```

**Expected output:**
```
10 seeds tested:
✅ Technological civilizations: 10/10 (100%)
✅ GENESIS SYNTHESIS OPERATIONAL
```

**If this fails:** Genesis engine broken, fix before browser tests.

---

## 2. Simple Browser Test (30 seconds)

### Start Dev Server
```bash
cd packages/game
pnpm dev
```

### Open in Browser
http://localhost:5173/test-simple.html

**Expected:**
```
Starting test...
Engine created!
Synthesis complete!

Results:
  Complexity: 9
  Activity: 10/10
  ...

✅ TEST PASSED
```

**If this fails:** Check browser console (F12) for errors.

---

## 3. Full E2E Tests (10-15 minutes)

### Run All Tests
```bash
cd packages/game
pnpm test:e2e
```

**What happens:**
1. Starts dev server automatically
2. Opens headless browser
3. Runs all test suites
4. Reports results

**Expected duration:** 10-15 minutes (synthesis is REAL!)

### Run Specific Suite
```bash
# Fast tests (~1 min)
pnpm test:e2e genesis-synthesis

# Slow tests (~4-5 min each)
pnpm test:e2e universe-activity-map
pnpm test:e2e full-user-flow
```

---

## 4. Visual Test Mode (Interactive)

### UI Mode
```bash
cd packages/game
pnpm test:e2e:ui
```

**What you see:**
- Browser window opens
- You can see tests running
- Click individual tests
- See live DOM
- Inspect failures

**Great for debugging!**

---

## 5. Debug Mode (Step Through)

### Debug Single Test
```bash
cd packages/game
pnpm test:e2e:debug
```

**What happens:**
- Browser opens with DevTools
- Tests run slowly
- You can pause/inspect
- See every step

**Use when test fails.**

---

## Expected Test Results

### Genesis Synthesis (1-2 min)
```
✓ should synthesize complete civilization (18s)
✓ should produce technological civilization (16s)
✓ should be deterministic (32s)

3 passed (1m 6s)
```

### Universe Activity Map (4-5 min)
```
✓ should load main menu (2s)
✓ should initialize universe view (3s)
✓ should show progress during synthesis (5s)
✓ should complete synthesis and render point cloud (228s) ← REAL
✓ should detect civilizations (230s)
✓ should have interactive camera controls (3s)
✓ should have no JavaScript errors (232s)

7 passed (4m 43s)
```

### Full User Flow (4-5 min)
```
✓ complete user flow: menu → universe → exploration (242s) ← REAL
✓ user reads Quick Start guide (1s)
✓ user views About information (1s)
✓ user sees console welcome message (1s)

4 passed (4m 5s)
```

**Total:** 14/14 passing in 10-15 minutes

---

## Why Tests Take So Long

### It's REAL Synthesis
```
125 regions × 1-2 sec each = 2-4 minutes
└─ Each region:
   ├─ Big Bang → Particles
   ├─ Nucleosynthesis → Atoms
   ├─ Stellar formation → Heavy elements (10K stars sampled!)
   ├─ Molecular clouds → Organics
   ├─ Planetary accretion
   ├─ Abiogenesis → Life
   ├─ Evolution → Multicellular (Cope's Rule!)
   ├─ Cognition → Intelligence
   ├─ Society → Groups
   └─ Technology → Tools

NO SHORTCUTS. This is the REAL simulation.
```

---

## Troubleshooting

### "Test timed out"
**Normal if < 5 minutes.** Synthesis is slow.  
**Problem if > 5 minutes.** Check:
```bash
# Open test-simple.html to isolate
http://localhost:5173/test-simple.html

# Check console for errors (F12)
```

### "Cannot connect to server"
```bash
# Make sure dev server is running
cd packages/game
pnpm dev

# In another terminal:
pnpm test:e2e
```

### "Module not found"
```bash
# Clean build
rm -rf dist node_modules/.vite
pnpm install
pnpm build
```

### "Test failed with assertion error"
```bash
# Run in UI mode to see what's wrong
pnpm test:e2e:ui

# Or debug mode
pnpm test:e2e:debug
```

---

## CI/CD

### GitHub Actions
Add to `.github/workflows/test.yml`:
```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    timeout-minutes: 20
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Install Playwright browsers
        run: cd packages/game && pnpm exec playwright install --with-deps
      
      - name: Run E2E tests
        run: cd packages/game && pnpm test:e2e
      
      - name: Upload test results
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: test-results
          path: packages/game/test-results/
```

---

## What Gets Tested

### ✅ REAL System Components
- Genesis Synthesis Engine (all 11 epochs)
- Universe Activity Map (point cloud)
- BabylonJS rendering
- DOM manipulation
- Event handlers
- Async operations
- Module imports
- TypeScript compilation
- Vite bundling

### ✅ REAL Laws
- Salpeter IMF (stellar masses)
- Cope's Rule (body size growth)
- Kleiber's Law (metabolism)
- Lotka-Volterra (populations)
- All 57 law files

### ✅ REAL User Experience
- Page navigation
- Button clicks
- Progress updates
- Results display
- Error handling
- Console output

### ❌ NOT Tested (No Shortcuts)
- Mocked functions
- Test doubles
- Simplified algorithms
- Fake data
- Stub implementations

---

## Quick Reference

```bash
# CLI test (30 sec)
pnpm exec tsx src/cli/test-genesis-synthesis.ts

# Browser test (30 sec)
http://localhost:5173/test-simple.html

# E2E tests (10-15 min)
pnpm test:e2e

# UI mode (interactive)
pnpm test:e2e:ui

# Debug mode (step through)
pnpm test:e2e:debug

# Specific suite
pnpm test:e2e genesis-synthesis
pnpm test:e2e universe-activity-map
pnpm test:e2e full-user-flow
```

---

**REAL TESTS.**  
**REAL SYSTEM.**  
**REAL RESULTS.**

**No shortcuts. That's how we know it works.**
