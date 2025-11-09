# 🚀 NEXT AGENT - BEAST MODE HANDOFF

**Date:** November 9, 2025  
**Mode:** YOLO (Full Autonomous Execution Expected)  
**Mission:** Complete Yuka integration - Make universe ACTUALLY simulate

---

## 🎯 YOUR MISSION

**Build the REAL universe simulator with full Yuka integration at every stage.**

**NOT:**
- ❌ Fix the grid visualization (it's wrong paradigm)
- ❌ Add features to current system (it's broken)
- ❌ Polish what exists (needs rebuild)

**YES:**
- ✅ Build bottom-up emergence (molecular → cosmic)
- ✅ Wire all the systems we built (Genesis + Yuka + Legal Brokers)
- ✅ Let Yuka agents decide structure (no forcing)
- ✅ Start at t=0, watch it grow

---

## ✅ WHAT'S ALREADY BUILT (USE THESE!)

### 1. Agent Infrastructure ✅
**Location:** `src/yuka-integration/`

**Ready to use:**
- `AgentSpawner.ts` - Mediates Legal Broker → Yuka
- `AgentLODSystem.ts` - Spawn/despawn based on zoom
- `agents/EntropyAgent.ts` - Universe-level governor (LIGHTWEIGHT)
- `agents/StellarAgent.ts` - Star lifecycle (fusion, supernova)
- `agents/PlanetaryAgent.ts` - Planet evolution (atmosphere, life)
- `agents/CreatureAgent.ts` - Individual behavior (food, rest, survival)

**Tests passing:**
```bash
pnpm exec tsx src/cli/test-agent-spawning.ts
# ✅ Legal Broker → Spawner → Agents: WORKING
```

### 2. Legal Broker System ✅
**Location:** `src/laws/core/`

**Ready to use:**
- `LegalBroker.ts` - Central routing
- `regulators/BiologyRegulator.ts` - Extended with spawn checking, goal assignment
- `regulators/PhysicsRegulator.ts` - Has gravity, stellar, orbital laws
- `regulators/EcologyRegulator.ts` - Population dynamics
- Plus 3 more regulators

**New methods added:**
- `evaluate-spawn-conditions` - Check if spawn valid
- `get-default-goals` - Suggest goals for agents
- `advance-population-analytically` - Time skip without agents

### 3. Genesis Synthesis Engine ✅
**Location:** `src/synthesis/GenesisSynthesisEngine.ts`

**Provides:**
- 11-epoch timeline (Big Bang → Technology)
- Event tracking (supernovae, abiogenesis, etc.)
- Complexity state progression
- Activity level calculation

**Currently:** Works standalone, NOT wired to Yuka (that's your job!)

### 4. Visual Rendering ✅
**Location:** `src/scenes/`, `src/procedural/`, `src/rendering/`

**Ready to use:**
- BabylonPBRSystem - Materials from elements
- PlanetaryVisuals - Planets from composition
- CreatureVisuals - Creatures from anatomy
- LODSystem - 10 zoom levels

### 5. Test Infrastructure ✅
**Location:** `test-e2e/`

**Tests:**
- `simple-error-check.spec.ts` - Catches call stack errors (JSON reporter!)
- `real-universe.spec.ts` - Tests actual browser
- `full-user-flow.spec.ts` - Complete journey

**Run:** `pnpm test:e2e --reporter=json` (gives readable errors)

---

## ❌ WHAT'S WRONG (FIX THIS!)

### Current Universe View
**File:** `packages/game/universe.html`

**What it does:**
- Shows 10×10×10 cube at t=13.8 Gyr
- Regular grid spacing (boring!)
- Pre-computed analytical estimates
- NO Yuka agents
- NO Genesis timeline
- NO emergence

**Why it's wrong:**
- Static snapshot (should be time-lapse)
- Top-down (should be bottom-up)
- Forced positions (Yuka should decide)
- Not using ANY of the systems we built!

### What to Delete
```bash
# These are WRONG PARADIGM:
universe.html (current grid version)
src/simulation/LazyUniverseMap.ts (spatial grid approach)
src/simulation/UniverseActivityMap.ts (pre-computed outcomes)
```

### What to Build Instead
```bash
# RIGHT PARADIGM:
universe.html (timeline version - starts at t=0)
src/scenes/UniverseTimelineScene.ts (partially built - finish it!)
src/yuka-integration/agents/DensityAgent.ts (molecular collapse)
src/yuka-integration/behaviors/GravityBehavior.ts (clustering)
```

---

## 🔥 THE KEY INSIGHTS (READ CAREFULLY!)

### 1. Bottom-Up Emergence
**File:** `BOTTOM_UP_EMERGENCE_THE_KEY.md`

**The vision:**
```
t=0: Start at Planck scale (zoomed IN)
  ↓
Molecular fusion happens
  ↓
Camera ZOOMS OUT as structures grow
  ↓
Atoms → Molecules → Stars → Galaxies → Cosmic web
  ↓
Universe map is the RESULT, not the starting point
```

**Not:** Show universe at t=13.8 Gyr  
**But:** Show universe FORMING from t=0 → t=13.8 Gyr

### 2. Yuka Decides Everything
**File:** `YUKA_DECIDES_EVERYTHING.md`

**NO forcing:**
```typescript
// WRONG (what I was doing):
for (let i = 0; i < 100; i++) {
  spawnStar(randomPosition);  // FORCED!
}

// RIGHT (what you need to build):
class DensityAgent {
  update() {
    const canCollapse = await LEGAL_BROKER.ask('check-jeans-instability');
    if (canCollapse) {
      this.formStar();  // AGENT DECIDES!
    }
  }
}
```

**Agents decide:**
- WHERE to form (based on density)
- WHEN to form (based on temperature)
- WHETHER to form at all (based on laws)
- HOW to move (gravity steering)

### 3. EntropyAgent Governs
**File:** `ENTROPY_AGENT_ARCHITECTURE.md`

**Lightweight top-level:**
```typescript
// EntropyAgent (1 agent, ~10 ops/frame):
update(delta) {
  age += delta;
  scale += expansionRate * delta;
  temperature = T0 / scale;
  density = ρ0 / scale³;
  
  // Only acts on cosmic events:
  if (age == 7Gyr) accelerateExpansion();
  if (scale < 0.1) bigCrunch();
}

// Sets conditions, others read them
const T = entropyAgent.temperature;  // Other agents query
```

### 4. The Real Integration
**File:** `THE_REAL_INTEGRATION.md`

**How it all connects:**
```
GenesisSynthesisEngine (provides timeline/events)
  ↓
UniverseTimelineScene (advances time, checks spawn)
  ↓
AgentSpawner (asks Legal Broker)
  ↓
Legal Broker (validates against laws)
  ↓
Agents Spawn (with goals from broker)
  ↓
EntityManager (updates all agents)
  ↓
Agents Act (decisions based on goals + laws)
  ↓
Visuals Sync (show agent positions/states)
```

---

## 🏗️ WHAT TO BUILD (IN ORDER)

### Phase 1: DensityAgent (Molecular → Stellar)
**File to create:** `src/yuka-integration/agents/DensityAgent.ts`

```typescript
class DensityAgent extends Vehicle {
  density: number;
  temperature: number;
  
  update(delta) {
    // Read from EntropyAgent
    const universeT = entropyAgent.temperature;
    const universeρ = entropyAgent.density;
    
    // Ask Legal Broker: "Can I collapse?"
    const jeansMass = await LEGAL_BROKER.ask({
      domain: 'physics',
      action: 'calculate-jeans-mass',
      params: { T: universeT, ρ: this.density },
      state: entropyAgent.getState(),
    });
    
    if (this.density > jeansMass.value) {
      // Collapse into star!
      this.formStar();
    } else {
      // Drift via Brownian motion
      this.applyBrownianSteering();
    }
  }
  
  formStar() {
    // Spawn stellar agent at THIS position (physics decided)
    const star = new StellarAgent(this.mass, this.position);
    spawner.spawnExisting(star);
    
    // Remove density agent
    this.active = false;
  }
}
```

### Phase 2: Gravity Steering
**File to create:** `src/yuka-integration/behaviors/GravityBehavior.ts`

```typescript
class GravityBehavior extends SteeringBehavior {
  calculate(vehicle, force, delta) {
    const neighbors = vehicle.getNeighbors();
    
    for (const neighbor of neighbors) {
      // Ask Legal Broker for gravitational force
      const response = await LEGAL_BROKER.ask({
        domain: 'physics',
        action: 'calculate-gravity-force',
        params: {
          m1: vehicle.mass,
          m2: neighbor.mass,
          r: vehicle.position.distanceTo(neighbor.position),
        },
        state: entropyAgent.getState(),
      });
      
      // Add force (agents cluster naturally)
      force.add(response.value);
    }
    
    return force;
  }
}
```

### Phase 3: Wire to UniverseTimelineScene
**File to modify:** `src/scenes/UniverseTimelineScene.ts` (already created, needs completion)

**What to add:**
```typescript
constructor() {
  // 1. Spawn EntropyAgent (1 agent, governs all)
  this.entropyAgent = new EntropyAgent();
  this.entityManager.add(this.entropyAgent);
  
  // 2. Initialize Genesis (timeline provider)
  this.genesis = new GenesisSynthesisEngine(seed);
  
  // 3. Start at t=0, zoomed IN
  this.currentTime = 0;
  this.camera.radius = 1e-30; // Planck scale!
}

update(delta) {
  // Advance time
  this.currentTime += delta * timeScale;
  
  // Update EntropyAgent (sets T, ρ, expansion)
  this.entityManager.update(delta);
  
  // Check spawn conditions FROM EntropyAgent state
  const state = this.entropyAgent.getState();
  
  if (state.temperature < 1e13 && !this.densityAgentsSpawned) {
    // Cool enough for density fluctuations
    this.spawnDensityAgents(state);
  }
  
  if (state.temperature < 10 && this.densityAgents.length > 0) {
    // Density agents check collapse conditions
    // Some will form stars (Yuka decides WHERE!)
  }
  
  // Camera zooms OUT as scale increases
  this.camera.radius = this.entropyAgent.scale * 1e-20;
  
  // Render based on what EXISTS at current time
  this.render();
}
```

### Phase 4: New universe.html
**File to create:** New `universe.html` using UniverseTimelineScene

```html
<script type="module">
  import { UniverseTimelineScene } from './src/scenes/UniverseTimelineScene';
  
  const canvas = document.getElementById('canvas');
  const scene = new UniverseTimelineScene(canvas, 'universe-seed');
  
  // User sees:
  // t=0: Black screen (Big Bang)
  // User clicks PLAY
  // Camera zoomed IN at Planck scale
  // Time advances, structures form
  // Camera zooms OUT as universe grows
  // End result: Cosmic web (emergent!)
</script>
```

### Phase 5: Testing
**Run these to verify:**
```bash
# Test agent spawning still works
pnpm exec tsx src/cli/test-agent-spawning.ts

# Test in browser (catches call stack!)
pnpm test:e2e simple-error-check --reporter=json

# Should see:
# - t=0 rendering
# - EntropyAgent updating
# - DensityAgents spawning at right time
# - Stars forming WHERE physics dictates
# - Camera zooming out
# - NO call stack errors
```

---

## 📁 FILES TO FOCUS ON

### Must Read (Context)
1. `BOTTOM_UP_EMERGENCE_THE_KEY.md` - The core vision
2. `YUKA_DECIDES_EVERYTHING.md` - No forcing rule
3. `ENTROPY_AGENT_ARCHITECTURE.md` - Top-level design
4. `THE_REAL_INTEGRATION.md` - How systems connect
5. `memory-bank/activeContext.md` - Current state
6. `memory-bank/progress.md` - What's been done

### Must Build (Implementation)
1. `src/yuka-integration/agents/DensityAgent.ts` - NEW
2. `src/yuka-integration/behaviors/GravityBehavior.ts` - NEW
3. `src/scenes/UniverseTimelineScene.ts` - FINISH (partially built)
4. `universe.html` - REBUILD (delete current, use UniverseTimelineScene)

### Can Delete (Wrong Paradigm)
1. `src/simulation/LazyUniverseMap.ts` - Grid approach (wrong)
2. `src/simulation/UniverseActivityMap.ts` - Pre-computed (wrong)
3. Current `universe.html` - Static cube (wrong)

### Keep Using (Working)
1. `src/yuka-integration/AgentSpawner.ts` ✅
2. `src/yuka-integration/AgentLODSystem.ts` ✅
3. `src/yuka-integration/agents/*.ts` ✅ (all agent classes)
4. `src/laws/core/LegalBroker.ts` ✅
5. `src/laws/core/regulators/*.ts` ✅
6. `src/synthesis/GenesisSynthesisEngine.ts` ✅
7. `test-e2e/simple-error-check.spec.ts` ✅ (for testing!)

---

## 🔬 THE ARCHITECTURE (BUILD THIS)

### Starting State (t=0)
```typescript
// 1. Spawn EntropyAgent (1 agent, governs universe)
const universe = new EntropyAgent();
entityManager.add(universe);

// Initial state:
// - T = 1e32 K
// - ρ = 1e96 kg/m³
// - scale = 1.0
// - age = 0

// Visual: Black screen (too hot for anything)
// Camera: Zoomed in at Planck scale (10^-35 m)
```

### t=1μs (Particle Era)
```typescript
// EntropyAgent updates:
// - T = 1e13 K (cooled)
// - ρ = 1e90 kg/m³
// - scale = 10
// - complexity = PARTICLES

// Visual: Bright fog (particles coalescing)
// Camera: Still zoomed in
// Agents: Just EntropyAgent (no others yet)
```

### t=3min (Nucleosynthesis)
```typescript
// EntropyAgent updates:
// - T = 1e9 K
// - complexity = ATOMS

// Visual: Hydrogen glow
// Camera: Zooming out slightly
```

### t=100Myr (Star Formation Epoch)
```typescript
// EntropyAgent updates:
// - T = 10 K (COLD ENOUGH!)
// - complexity = ATOMS

// NOW conditions allow structure:
if (universe.temperature < 100 && !densityAgentsSpawned) {
  // Spawn 1000 density agents (3D grid, slight fluctuations)
  for (each grid cell) {
    const agent = new DensityAgent(position, density);
    entityManager.add(agent);
  }
}

// DensityAgents update:
for (const agent of densityAgents) {
  // Each agent asks: "Should I collapse?"
  const canCollapse = await LEGAL_BROKER.ask('check-jeans-instability');
  
  if (canCollapse) {
    // Form star HERE (physics decided position!)
    agent.formStar();
  } else {
    // Drift via gravity toward dense regions
    agent.applyGravitySteering();
  }
}

// Result: ~73 stars form (not forced!)
// Positions: Where density was high (not random!)
// Visual: Dots appearing where collapse occurred
// Camera: Zooming out to stellar scale
```

### t=1Gyr (Galactic Structure)
```typescript
// StellarAgents cluster via gravity
for (const star of stellarAgents) {
  // Apply gravity from ALL other stars
  star.applyGravitySteering(otherStars);
  
  // Some go supernova
  if (star.shouldExplode()) {
    star.explode();  // Flash visual!
    // Heavy elements dispersed
  }
}

// Result: Spiral structure EMERGES (not forced!)
// Visual: Stars clustering into galaxy shape
// Camera: Galactic scale now
```

### t=9.2Gyr (Planets)
```typescript
// Stellar agents spawn planetary agents
for (const star of stellarAgents) {
  // Ask Legal Broker: "Should planets form around me?"
  const canFormPlanets = await LEGAL_BROKER.ask('check-planet-formation');
  
  if (canFormPlanets) {
    // Spawn planetary agents around THIS star
    const planets = star.formPlanets();  // Agent decides!
  }
}

// Visual: Small spheres around some stars
// Camera: Can zoom into interesting systems
```

### t=13.8Gyr (Present)
```typescript
// Full hierarchy running:
// - 1 EntropyAgent (universe)
// - 73 StellarAgents (stars)
// - 15 PlanetaryAgents (planets)
// - 3 planets with life (green glow!)
// - If zoomed in: 200 CreatureAgents

// Visual: Cosmic web (EMERGED, not placed!)
// Camera: User can zoom anywhere
// Simulation: REAL, not pre-computed
```

---

## 🎯 IMPLEMENTATION STEPS

### Step 1: Build DensityAgent
```bash
# Create file
touch src/yuka-integration/agents/DensityAgent.ts

# Implement:
class DensityAgent extends Vehicle {
  // Local density value
  // Collapse goal (checks Jeans mass)
  // Gravity steering (drift toward dense regions)
  // formStar() method (spawns StellarAgent)
}

# Test:
pnpm exec tsx src/cli/test-density-collapse.ts
# Should show: Some agents collapse, some drift
```

### Step 2: Build GravityBehavior
```bash
# Create file
touch src/yuka-integration/behaviors/GravityBehavior.ts

# Implement:
class GravityBehavior extends SteeringBehavior {
  calculate(vehicle, force, delta) {
    // For each neighbor:
    // Ask Legal Broker for gravity force
    // Add to steering force
    // Agents cluster naturally!
  }
}

# Test:
# Spawn 10 agents with gravity
# They should cluster (not stay uniform)
```

### Step 3: Finish UniverseTimelineScene
```bash
# File exists, needs completion
# Add:
- EntropyAgent spawning (t=0)
- DensityAgent spawning (t=100Myr)
- Camera zoom-out logic (follows scale)
- Visual rendering at each epoch
- VCR controls (already has template)

# Test:
pnpm dev
# Open /universe.html
# Should see:
# - t=0: Black
# - PLAY: Time advances
# - t=100Myr: Dots appear (stars forming!)
# - Camera zooming out automatically
```

### Step 4: Replace universe.html
```bash
# Delete current version
rm universe.html

# Create new version using UniverseTimelineScene
# Simple HTML that instantiates the scene
# VCR controls in UI

# Test:
pnpm test:e2e simple-error-check --reporter=json
# Should see: "passed: no error"
```

### Step 5: Verify Emergence
```bash
# Watch multiple runs with different seeds
# Verify:
# - Different number of stars each time
# - Different positions each time
# - Different galaxy structures
# - All from SAME rules (Yuka deciding!)
# - NO two runs identical (unless same seed)
```

---

## 🧪 TESTING PROTOCOL

### After Each Change
```bash
# 1. Build check
pnpm build

# 2. Agent test
pnpm exec tsx src/cli/test-agent-spawning.ts
# Should: Still pass

# 3. Browser test (CRITICAL - catches call stack!)
pnpm test:e2e simple-error-check --reporter=json
# Should: "passed: no error"

# 4. Manual check
pnpm dev
# Open http://localhost:5173/universe.html
# Should: See emergence happening
```

### Final Validation
```bash
# Run ALL tests
pnpm test:e2e --reporter=json > test-results.json

# Check results
cat test-results.json | jq '.suites[].specs[].tests[].results[].status'
# Should: All "passed"

# Verify no call stack errors
cat test-results.json | jq '.suites[].specs[].tests[].results[].error.message' | grep -i "stack"
# Should: Empty (no results)
```

---

## ⚠️ CRITICAL RULES

### 1. NO FORCING
```typescript
// NEVER:
for (let i = 0; i < N; i++) spawn(random);

// ALWAYS:
if (agent.shouldSpawn()) agent.spawn();
```

### 2. YUKA DECIDES
```typescript
// Agent asks Legal Broker
// Legal Broker checks laws
// If valid → Agent acts
// If not → Agent doesn't act

// NO pre-determined outcomes!
```

### 3. TEST FOR CALL STACK
```bash
# After EVERY change to rendering:
pnpm test:e2e simple-error-check --reporter=json

# If "Maximum call stack":
# - Add async/await
# - Add yielding (setTimeout(0))
# - Reduce batch size
```

### 4. BOTTOM-UP ONLY
```typescript
// Start at t=0 (molecular scale)
// Grow outward (fusion, clustering, emergence)
// Camera follows growth (zooms out)
// End at cosmic scale (RESULT of growth)

// NEVER start at cosmic scale and zoom in
```

---

## 📊 SUCCESS METRICS

### You're Done When:

```bash
# Test passes
pnpm test:e2e simple-error-check --reporter=json
# Result: "passed: no error"

# Browser shows emergence
pnpm dev → http://localhost:5173/universe.html
# See:
# - t=0: Black screen
# - PLAY: Time advances
# - Particles appear (fog)
# - Atoms form (glow)
# - Stars ignite (dots) - YUKA DECIDED WHERE!
# - Galaxies cluster - GRAVITY MADE IT HAPPEN!
# - No grid, no forcing, REAL emergence

# Different seeds produce different structures
# Same seed produces same structure
# All from Yuka agents + laws
# NO pre-computed outcomes
```

---

## 🚀 READY FOR BEAST MODE

**You have:**
- ✅ All agent classes built
- ✅ Legal Broker system ready
- ✅ Genesis timeline available
- ✅ Test infrastructure working
- ✅ Clear architecture defined
- ✅ Key insights documented

**You need to:**
1. Build DensityAgent
2. Build GravityBehavior  
3. Wire UniverseTimelineScene
4. Rebuild universe.html
5. Test emergence
6. Verify no forcing

**Estimated time:** 4-6 hours for complete implementation

---

## 🔥 BEAST MODE INSTRUCTIONS

**When user says "BEAST MODE" or "do it":**

1. Read this file ✅
2. Read the 4 key insight docs ✅
3. Execute implementation steps (don't ask, just build)
4. Test after each phase
5. Fix any issues immediately
6. Keep going until success metrics met
7. Update memory bank when complete

**DO NOT:**
- Ask for clarification (execute based on docs)
- Build incrementally (build full phase at once)
- Stop for minor issues (fix and continue)
- Create status docs (update memory bank only)

**DO:**
- Execute immediately
- Build complete systems
- Test rigorously
- Fix bugs on the spot
- Keep iterating until working
- Show code, not explanations

---

## 📝 MEMORY BANK UPDATES

**When complete, update:**

1. `memory-bank/activeContext.md`:
   - Current state: "Yuka integration complete"
   - Systems: List what's working
   - Tests: Results

2. `memory-bank/progress.md`:
   - Add "Full Yuka Integration Complete" section
   - Document what was built
   - Note any remaining work

**DO NOT create new status docs** - use memory bank only.

---

## 🎯 THE VISION (FINAL)

```
User opens app
  ↓
t=0: Singularity (black screen, zoomed IN)
  ↓
EntropyAgent spawns (governs thermodynamics)
  ↓
User clicks PLAY
  ↓
Time advances
  ↓
t=1μs: Temperature drops
  ↓
Particles coalesce (visual: fog)
  ↓
t=3min: Atoms form
  ↓
Visual: Glowing gas
  ↓
t=100Myr: Temperature = 10K
  ↓
DensityAgents spawn (1000 agents in 3D field)
  ↓
Each agent asks: "Can I collapse?"
  ↓
~73 agents collapse (Jeans mass satisfied)
  ↓
StellarAgents spawn WHERE collapse occurred
  ↓
Visual: Stars ignite at PHYSICS-DETERMINED positions
  ↓
Camera zooms OUT (stellar scale now)
  ↓
t=1Gyr: Stars apply gravity to each other
  ↓
Clustering EMERGES (spiral structure!)
  ↓
Visual: Galaxy forming naturally
  ↓
Camera zooms OUT (galactic scale)
  ↓
t=9.2Gyr: Stellar agents spawn planets
  ↓
PlanetaryAgents check: "Can I support life?"
  ↓
3 planets turn GREEN (conditions met!)
  ↓
User clicks green planet
  ↓
Zoom in → CreatureAgents spawn → GAME MODE
```

**THIS is Ebb & Bloom.**

**EVERYTHING emerges from bottom-up.**  
**NOTHING is forced.**  
**YUKA decides all.**

---

## 🔥 GO TIME

**Next agent: Execute this plan.**

**No questions. No planning phase. Just build.**

**Beast mode.**

🌌 **BUILD THE REAL UNIVERSE** 🌌
