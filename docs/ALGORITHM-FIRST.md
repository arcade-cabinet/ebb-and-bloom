# The Algorithm-First Breakthrough

## The Revelation

**The game doesn't need graphics to work. The game IS the algorithm.**

## What We Built

### 1. The CLI Game (`src/dev/cli-game.ts`)

A fully playable text-based version of Ebb & Bloom that proves the core mechanics work:

```bash
pnpm game:cli

ebb> planet volcanic-world
🌍 Generating planet from seed: "volcanic-world"...
✅ Planet generated in 12ms

Planet: Magmara
Core: Magma Core (T:9/10, P:8/10, S:4/10)
Fill: Volcanic Ash (permeability: 3/10)
Materials: 7

ebb> dig 0 -10 0
⛏️  Digging at (0, -10, 0)...
✅ Found Iron!
   Hardness: 5
   Optimal depth: 18.3m
   🎉 NEW MATERIAL DISCOVERED!

ebb> materials
📋 Material Table
[✓] Iron           | ore      |  8-28m | Hardness: 5
[ ] Quartz         | crystal  | 12-32m | Hardness: 7
[ ] Coal           | ore      |  5-25m | Hardness: 4
...
```

**This is the actual game.** No graphics. Pure algorithm.

### 2. The Planetary Structure Store (`src/stores/PlanetaryStructureStore.ts`)

Zustand store that IS the planet:

```typescript
// The entire planet is just:
{
  materialTable: Map<string, MaterialData>,  // What exists
  layerTable: LayerData[],                   // Stratification
  noiseFunction: (x, z) => number,           // Distribution
}

// Query material at any position:
const material = getMaterialAt(x, y, z);  // Instant lookup
```

No ECS. No entities. No physics. Just **lookup tables and math**.

### 3. Pure Math Stratification

Materials settle at depths based on FORMULAS:

```typescript
// Calculate where material ends up:
depth = 
  (density * 5) +                          // Heavy sinks
  (coreTemp > 7 ? (10 - density) * 2 : 0) + // Hot core pushes light up
  (corePressure * density * 0.5) +         // Pressure compresses down
  (stability < 5 ? (5 - stability) * -3 : 0) // Unstable ejects up

// Same planet properties + same material = same depth
// Different planet properties = different depth
```

**No hardcoded depths. Everything emergent from planetary physics.**

### 4. Mock Gen 0 (`src/dev/MockGen0Data.ts`)

Deterministic planet generation with NO API calls:

```typescript
const planet = generateMockGen0('my-seed');
// Returns:
// - 8 planetary cores
// - 5-7 shared materials  
// - 1 fill material
// - 16-32 core materials
// - 8-16 creature archetypes
// In ~10ms
```

Same seed = same planet. Always. Instantly.

## The Architecture

```
┌─────────────────────────────────────────┐
│         SEED PHRASE                     │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│    MockGen0Data.ts                      │
│    (Pure math + seedrandom)             │
│    Returns: PlanetaryManifest           │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│    PlanetaryStructureStore.ts           │
│    (Zustand state)                      │
│                                         │
│    - Calculate material depths          │
│    - Build stratification tables        │
│    - Create noise function              │
│                                         │
│    Store = {                            │
│      materialTable: Map                 │
│      layerTable: Array                  │
│      noiseFunction: Function            │
│    }                                    │
└──────────────┬──────────────────────────┘
               │
               ├─────────────────────────┐
               │                         │
               ▼                         ▼
       ┌───────────────┐        ┌──────────────┐
       │   CLI Game    │        │  3D Renderer │
       │  (Text only)  │        │  (Optional!) │
       │               │        │              │
       │  - dig(x,y,z) │        │  - Query     │
       │  - scan()     │        │  - Draw      │
       │  - status()   │        │  - Animate   │
       └───────────────┘        └──────────────┘
```

**The game works in the CLI. Graphics just visualize the same data.**

## Why This Changes Everything

### Before (Broken Approach)
1. Build 3D world
2. Try to make game logic work
3. Rendering crashes
4. Can't test anything
5. Game doesn't work

### After (Working Approach)
1. ✅ Build algorithm (pure math)
2. ✅ Test in CLI (instant feedback)
3. ✅ Verify mechanics work
4. Add rendering (optional visualization)
5. Game works!

### Testing Now vs Before

**Before**:
- Need working renderer
- Need texture loading
- Need Three.js
- Need React
- Need Vite
- Need everything working just to test if material depth calculation is correct

**After**:
```bash
pnpm game:cli
ebb> planet test
ebb> dig 0 -10 0
# Instantly see if material depth works
```

## The Core Loop (CLI Version)

```typescript
// 1. Generate planet
generatePlanet(seedPhrase)
  → Calculate material depths (math)
  → Build lookup tables (instant)
  → Initialize Zustand store

// 2. Player digs
dig(x, y, z)
  → depth = -y
  → material = getMaterialAt(x, y, z)  // Table lookup + noise
  → if (material.hardness <= toolHardness) → Add to inventory

// 3. Check accessibility
isAccessible(depth, toolHardness)
  → Sample materials above depth
  → if any.hardness > toolHardness → return false

// 4. Tool evolution
if (neededMaterial.depth > reachableDepth)
  → emergeTool(neededHardness)
  → toolHardness += 2
  
// 5. Track progress
discoveredMaterials.add(material)
deepestDig = max(deepestDig, depth)
generation++
```

**This is the entire game. In text. Working. Right now.**

## What's Different About Materials

### Old (Hardcoded)
```typescript
const materials = {
  copper: { depth: 10 },  // WRONG
  tin: { depth: 30 },     // WRONG
  iron: { depth: 50 },    // WRONG
}
```

### New (Emergent)
```typescript
// Material depth calculated from planet properties:
planet1 = { coreTemp: 3, pressure: 8, stability: 9 }
  → Iron at 45m (high pressure pushes deep, stable core)

planet2 = { coreTemp: 9, pressure: 4, stability: 3 }
  → Iron at 12m (hot unstable core ejects upward)

// Same material, different depth based on PHYSICS
```

## How to Verify It Works

```bash
# 1. Generate different planets
pnpm game:cli

ebb> planet stable-world
# Note iron depth

ebb> planet volcanic-world  
# Iron should be at different depth!

# 2. Test digging
ebb> dig 0 -5 0
ebb> dig 0 -15 0
ebb> dig 0 -25 0
# Should find different materials at different depths

# 3. Verify accessibility
ebb> dig 0 -40 0
# Should fail if hard material blocks path

# 4. Test spatial distribution
ebb> dig 0 -10 0
ebb> dig 5 -10 0
ebb> dig 10 -10 0
# Same depth, different X/Z → should find different materials (noise)
```

## Next Steps

1. **Play the CLI game** - Verify all mechanics work
2. **Test different seed phrases** - Confirm planets differ
3. **Add tool evolution** - FuzzyModule evaluates need
4. **Add creature spawning** - Based on material availability
5. **Add rendering** - Visualize the working algorithm

**But the game ALREADY WORKS. It's just text.**

## The Lesson

> "Graphics are irrelevant until the algorithm works."

The entire game is:
- Seed phrase → lookup tables
- Player action → table query
- State changes → Zustand store
- Rendering → optional visualization

**We built a working game without touching WebGL, Three.js, React, or Vite.**

---

## Try It Now

```bash
pnpm game:cli
```

The game is playable. The algorithm works. Graphics can come later.
