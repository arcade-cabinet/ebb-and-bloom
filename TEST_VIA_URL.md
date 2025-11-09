# Testing Via URL Parameters

## The Right Way

**DON'T build CLI tools.**  
**USE the BabylonJS simulation view with GET parameters.**

## Dev Server

```bash
cd packages/game && pnpm dev
```

## Test URLs

### Basic
```
http://localhost:5173/simulation.html?seed=test-world
```

### Auto-run
```
http://localhost:5173/simulation.html?seed=fast-test&cycles=100&autoAdvance=true
```

### Testing Laws
```
# Test Salpeter IMF (star masses)
http://localhost:5173/simulation.html?seed=star-test-1
http://localhost:5173/simulation.html?seed=star-test-2
# Check if masses differ correctly

# Test determinism
http://localhost:5173/simulation.html?seed=determinism-check
# Reload page - should be IDENTICAL

# Test population dynamics  
http://localhost:5173/simulation.html?seed=population&cycles=500&autoAdvance=true
# Watch species evolve
```

## CURL Interface

```bash
# Automated testing
for i in {1..100}; do
  curl -s "http://localhost:5173/simulation.html?seed=test-$i&cycles=10" &
done

# Check responses
curl "http://localhost:5173/simulation.html?seed=benchmark" | grep "Generation"
```

## Why This Is Better

✅ **Visual feedback** (see the simulation)
✅ **Interactive** (BabylonJS GUI controls)
✅ **Automatable** (GET parameters)
✅ **Shareable** (just URLs)
✅ **Real rendering** (tests the actual game view)

❌ CLI is text-only
❌ CLI doesn't test rendering
❌ CLI requires separate code path

## Full Law Exercise

The simulation.html already:
- Generates universe (stellar laws)
- Creates planets (planetary laws)
- Evolves creatures (biological laws)
- Runs population dynamics (ecology laws)
- Shows social progression (social laws)

**ALL integrated. ALL visible. ALL via URL.**


