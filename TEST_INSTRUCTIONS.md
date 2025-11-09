# 🧪 TESTING INSTRUCTIONS

**If stuck at "Initializing..."**

---

## Quick Test

```bash
cd packages/game
pnpm dev
```

**Open:** http://localhost:5173/test-simple.html

This will test Genesis Synthesis in isolation (no 3D, no point cloud, just text output).

**What you should see:**
```
Starting test...
Creating engine...
Engine created!
Running synthesis...
[Genesis logs...]
Synthesis complete!

Results:
  Complexity: 9
  Activity: 10/10
  Atoms: 11
  Molecules: 5
  Planets: 1-5
  Organisms: 20-50
  Species: 20-50
  Groups: 15-20
  Tools: 2

✅ TEST PASSED
```

**If this works:**
- Genesis engine is fine
- Issue is in Universe Activity Map or Babylon

**If this fails:**
- Check console for errors
- Check if LAWS are loading
- Check if EnhancedRNG is working

---

## Full Universe Test

**Open:** http://localhost:5173/universe.html

**Expected:**
1. "Initializing..." (instant)
2. "Creating cosmic grid..." (instant)
3. "Synthesizing universe (this will take 2-3 minutes)..." (progress bar)
4. Progress bar fills slowly
5. "Rendering point cloud..."
6. "✅ Complete!"

**If stuck at step 1:**
- Check browser console (F12)
- Look for JavaScript errors
- Check Network tab for failed loads

**If stuck at step 3:**
- This is NORMAL - synthesis takes 2-3 minutes
- Wait patiently
- Watch console for "[Genesis]" logs

---

## Console Debugging

**Open DevTools (F12) and run:**

```javascript
// Check if UniverseActivityMap loaded
typeof UniverseActivityMap

// Check if Genesis loaded  
import('./src/synthesis/GenesisSynthesisEngine').then(m => console.log(m))

// Check LAWS
import('./src/laws/index').then(m => console.log(m.LAWS))
```

---

## Common Issues

### "Module not found"
**Fix:** Check imports use `.ts` not `.js`

### "LAWS is undefined"
**Fix:** Check `src/laws/index.ts` exports correctly

### "Stuck at initializing"
**Cause:** Async initialization not awaited
**Fix:** Check `initialize()` function in universe.html

### "Progress bar at 0%"
**Cause:** Synthesis hasn't started
**Fix:** Check `map.synthesizeAll()` is being called

---

## Manual Test Steps

### 1. Test RNG
```bash
cd packages/game
pnpm exec tsx -e "
import { EnhancedRNG } from './src/utils/EnhancedRNG';
const rng = new EnhancedRNG('test');
console.log('Power law test:', rng.powerLaw(2.35, 0.08, 100));
"
```

**Expected:** Number between 0.08 and 100

### 2. Test Genesis
```bash
pnpm exec tsx src/cli/test-genesis-synthesis.ts
```

**Expected:** 10/10 technological civilizations

### 3. Test Activity Map (CLI)
```bash
pnpm exec tsx src/cli/demo-universe-activity.ts
```

**Expected:** Analysis of 27 regions with civilizations

---

## Performance Expectations

### Genesis Synthesis (per region)
- Fast: 0.5-1 sec (no console logging)
- Normal: 1-2 sec (with console logging)
- Slow: 2-3 sec (debug mode)

### Universe Activity Map (125 regions)
- Best case: 1-2 minutes
- Normal: 2-3 minutes
- Worst case: 4-5 minutes

### If taking longer:
- Check CPU usage (should be 100%)
- Check console for errors
- Check if synthesis is actually running

---

## What Success Looks Like

### test-simple.html
```
✅ TEST PASSED
Complexity: 9
Activity: 10/10
Civilizations emerging!
```

### universe.html
```
Point cloud visible
125 dots (mostly gold)
Auto-rotating
Stats showing: 125 civilizations
```

### Console
```
🌌 Universe rendered!
  Regions: 125
  Active: 125
  Civilizations: ~125

📍 BRIGHTEST REGIONS:
  1. (100, 0, 0) - Activity: 10.00/10
  2. (0, 100, 0) - Activity: 10.00/10
  ...
```

---

## If All Else Fails

```bash
# 1. Clean build
rm -rf dist node_modules/.vite
pnpm install
pnpm build

# 2. Test in isolation
pnpm exec tsx src/cli/test-genesis-synthesis.ts

# 3. Check dependencies
pnpm list @babylonjs/core
pnpm list seedrandom

# 4. Report issue with:
#    - Browser console output
#    - Network tab (check for 404s)
#    - Steps to reproduce
```

---

**Bottom line:** If test-simple.html works but universe.html doesn't, it's a Babylon/rendering issue, not a genesis issue.
