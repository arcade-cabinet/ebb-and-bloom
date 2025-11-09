# 🎮 Simulation URL Controls - Agent Self-Testing API

## URL Parameters

Control the simulation via URL for automated testing:

### Basic Parameters

```
?seed=wild-ocean-glow       # Set seed
?cycle=50                    # Start at cycle 50
?advanceTo=100              # Auto-advance to cycle 100
?autoplay=true              # Start playing automatically
?speed=5                    # Playback speed (cycles/sec)
```

### Combined Examples

```bash
# Test specific seed at cycle 50
http://localhost:5173/simulation.html?seed=test-123&cycle=50

# Auto-run to cycle 100
http://localhost:5173/simulation.html?seed=test-456&advanceTo=100

# Watch simulation play at 5 cycles/sec
http://localhost:5173/simulation.html?seed=wild-ocean&autoplay=true&speed=5

# Determinism test (same seed, same cycle)
http://localhost:5173/simulation.html?seed=test-123&cycle=50
# Run 3 times, should see IDENTICAL state
```

## JavaScript API

Control from browser console or Playwright:

```javascript
// Exposed on window.simulation
simulation.advanceCycle()           // Advance 1 cycle
simulation.resetCycle()             // Reset to cycle 0
simulation.jumpToCycle(75)          // Jump to specific cycle
simulation.getCurrentCycle()        // Get current cycle number
simulation.getSeed()                // Get current seed
simulation.getState()               // Get full world state
```

## Automated Testing Examples

### Playwright Test
```typescript
// Test determinism
const page = await browser.newPage();

// Run 1
await page.goto('http://localhost:5173/simulation.html?seed=test-123&cycle=50');
const state1 = await page.evaluate(() => simulation.getState());

// Run 2
await page.goto('http://localhost:5173/simulation.html?seed=test-123&cycle=50');
const state2 = await page.evaluate(() => simulation.getState());

// Should be identical
assert.deepEqual(state1, state2);
```

### Curl + Screenshot (Headless Chrome)
```bash
# Take screenshots at different cycles
for cycle in 0 10 20 50 100; do
  chromium --headless --screenshot="cycle-$cycle.png" \
    "http://localhost:5173/simulation.html?seed=test&cycle=$cycle"
done
```

### Node.js Validation Script
```javascript
const puppeteer = require('puppeteer');

async function testSeed(seed) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.goto(`http://localhost:5173/simulation.html?seed=${seed}&cycle=50`);
  
  const state = await page.evaluate(() => simulation.getState());
  
  console.log(`Seed: ${seed}`);
  console.log(`Species: ${state.creatures.length}`);
  console.log(`Prey: ${state.populations.prey}`);
  console.log(`Predators: ${state.populations.predator}`);
  
  await browser.close();
}

// Test multiple seeds
['test-1', 'test-2', 'test-3'].forEach(testSeed);
```

## Agent Self-Testing Workflow

### 1. Determinism Test
```bash
# URL with same seed/cycle should produce identical results
url="http://localhost:5173/simulation.html?seed=test-determinism&cycle=50"

# Run 3 times, capture state each time
# All 3 should match exactly
```

### 2. Population Stability Test
```bash
# Check populations don't explode or crash immediately
url="http://localhost:5173/simulation.html?seed=test-stability&advanceTo=100&autoplay=true"

# Watch for:
# - Populations > 0 throughout
# - No exponential explosion (>1,000,000)
# - Oscillations present (not flat line)
```

### 3. Event Frequency Test
```bash
# Run 100 cycles, count events
url="http://localhost:5173/simulation.html?seed=test-events&advanceTo=100"

# Expected:
# - Catastrophes: ~5 (5%)
# - Climate shifts: ~10 (10%)
# - Extinctions: 0-2 (rare)
```

### 4. Species Diversity Test
```bash
# Test 10 different seeds
for i in {1..10}; do
  curl "http://localhost:5173/simulation.html?seed=test-$i&cycle=0" | \
    grep "species" # Count species generated
done

# Expected: 3-5 species per seed (variety)
```

## Batch Testing Script

```bash
#!/bin/bash
# test-all-laws.sh

SERVER="http://localhost:5173/simulation.html"

echo "🧪 Testing Law-Based Generation"

# Test 1: Determinism
echo "Testing determinism..."
hash1=$(curl -s "$SERVER?seed=det-test&cycle=10" | md5sum)
hash2=$(curl -s "$SERVER?seed=det-test&cycle=10" | md5sum)
[ "$hash1" == "$hash2" ] && echo "✅ Determinism" || echo "❌ Determinism FAILED"

# Test 2: Different seeds produce different results
echo "Testing variety..."
hash_a=$(curl -s "$SERVER?seed=seed-a&cycle=0" | md5sum)
hash_b=$(curl -s "$SERVER?seed=seed-b&cycle=0" | md5sum)
[ "$hash_a" != "$hash_b" ] && echo "✅ Variety" || echo "❌ Seeds too similar"

# Test 3: Population stability
echo "Testing population stability..."
curl -s "$SERVER?seed=stable&advanceTo=50" | \
  grep -E "Prey: [0-9]+" && echo "✅ Stability" || echo "❌ Population crashed"

echo "Done!"
```

## Benefits for Agent

1. **No manual clicking** - URLs automate everything
2. **Scriptable** - Run tests in CI/CD
3. **Reproducible** - Share exact state via URL
4. **Fast iteration** - Test 100 seeds in seconds
5. **Proof of correctness** - Automated validation

## Ready to Test!

```bash
# Start server
cd packages/game && pnpm dev

# Test a seed
open "http://localhost:5173/simulation.html?seed=my-test&cycle=25"

# Or run automated tests
./test-all-laws.sh
```

**Now I can actually VALIDATE my own laws programmatically!** 🧪🎯
