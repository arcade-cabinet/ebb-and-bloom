# THE ACTUAL ARCHITECTURE

## Logical Domains

### `src/world/` - The Simulation
Pure mathematical state machines. No REST, no UI, no tracking.

```
src/world/
├── planetary/
│   ├── composition.ts    # getMaterialAt(x, y, z)
│   ├── layers.ts         # Layer definitions
│   └── noise.ts          # Noise functions
├── creatures/
│   ├── traits.ts         # Trait system
│   ├── capability.ts     # What can they do?
│   └── evolution.ts      # How do they evolve?
├── materials/
│   ├── properties.ts     # Material definitions
│   ├── accessibility.ts  # canReach()
│   └── depletion.ts      # Resource consumption
├── tools/
│   ├── emergence.ts      # Fuzzy logic
│   └── effects.ts        # What do tools do?
├── simulation.ts         # Core simulation loop
└── index.ts              # Exports
```

**The world doesn't know about:**
- HTTP
- REST
- Zustand
- Players
- UI

**The world only knows:**
- State
- Queries
- Commands
- Time

---

### `src/state/` - Parameter Tracking (Zustand)
Tracks **EVERYTHING** from Gen 0 → Gen 6.

```typescript
interface WorldState {
  // Core progression
  generation: number;              // 0-6
  cycle: number;                   // Day/night within generation
  
  // Gen 0 data (generated once)
  gen0: {
    seed: string;
    planetRadius: number;
    stratification: Layer[];
    coreMaterials: Material[];
    fillProperties: FillMaterial;
  };
  
  // Per-generation snapshots
  generations: Array<{
    number: number;
    
    // Creature metrics
    creatures: {
      count: number;
      avgTraits: Traits;
      maxCapability: Capability;
      population: number;
    };
    
    // Material metrics
    materials: {
      accessible: number;
      depleted: number;
      remaining: { [type: string]: number };
      pressures: { depth: number; hardness: number };
    };
    
    // Emergence metrics
    tools: string[];
    buildings: string[];
    packs: number;
    tribes: number;
    
    // Evolutionary metrics
    evolutionRate: number;
    traitDiversity: number;
    speciation: number;
    
    // Resource metrics
    consumptionRate: number;
    depletionRate: number;
    scarcityPressure: number;
    
    // Social metrics
    cooperation: number;
    conflict: number;
    alliances: number;
    wars: number;
    
    // Events
    events: GameEvent[];
  }>;
  
  // Derived metrics (computed from history)
  trends: {
    evolutionAcceleration: number;
    resourceDepletion: number;
    violenceTrajectory: number;
    harmonyTrajectory: number;
    innovationRate: number;
  };
  
  // Score (computed from all generations)
  score: {
    speed: number;        // How fast through gens?
    violence: number;     // How much conflict?
    exploitation: number; // How much depletion?
    harmony: number;      // How much cooperation?
    innovation: number;   // How many tools/buildings?
  };
  
  // Ending detection
  ending: EndingType | null;
}
```

**The state tracks EVERYTHING across ALL 6 generations.**

---

### `src/api/` - RESTful Interface
HTTP interface to query world and state.

```
src/api/
├── routes/
│   ├── world.ts          # Query simulation
│   ├── state.ts          # Query tracked state
│   ├── actions.ts        # Command simulation
│   └── analysis.ts       # Query derived metrics
└── server.ts             # Fastify app
```

**Endpoints:**

```
World Queries (query simulation):
GET  /api/world/materials/query?x=X&y=Y&z=Z
GET  /api/world/creatures/:id
GET  /api/world/pressure

State Queries (query Zustand):
GET  /api/state/generation/:gen
GET  /api/state/trends
GET  /api/state/score
GET  /api/state/history

Actions (command simulation):
POST /api/actions/advance-generation
POST /api/actions/advance-cycle
POST /api/actions/nudge-trait

Analysis (derived):
GET  /api/analysis/ending
GET  /api/analysis/warnings
GET  /api/analysis/recommendations
```

---

## The Game: Gen 0 → Gen 6

### Why 6 Generations?

Each generation represents a major evolutionary/civilizational stage:

```
Gen 0: Planetary Genesis
- AI generates planet, materials, creatures from seed
- No evolution yet, just initial conditions

Gen 1: Surface Adaptation
- Creatures evolve basic traits
- Access surface materials only
- Population growth

Gen 2: Tool Emergence
- First tools emerge (stone-digger, wood-cutter)
- Access shallow materials
- Pack formation begins

Gen 3: Deep Excavation
- Advanced tools (metal-extractor, deep-drill)
- Access deep materials
- Tribal formation

Gen 4: Civilization
- Buildings emerge (shelters, workshops)
- Inter-tribal dynamics
- Resource competition intensifies

Gen 5: Crisis Point
- Surface/shallow materials depleted
- Must reach deep materials or collapse
- Conflict OR cooperation decision point

Gen 6: Resolution
- Either: Transcendence (mastered deep materials)
- Or: Mutualism (tribes cooperate sustainably)
- Or: Domination (one tribe wins)
- Or: Collapse (starvation/extinction)
```

**The game IS the arc from Gen 0 → Gen 6.**

---

## Zustand State Management

### Not Just UI State

Zustand isn't tracking "what modal is open" - it's tracking:

```typescript
// Every generation:
- 200+ creature stats
- 50+ material states
- 100+ events
- 20+ derived metrics

// Across 6 generations:
- 1200+ creature data points
- 300+ material snapshots
- 600+ events
- 120+ metrics

// Plus:
- Trends computed from all generations
- Predictions based on trajectories
- Warnings derived from patterns
- Score aggregated from everything
```

**Zustand is the TIME SERIES DATABASE of the game.**

---

## File Structure

```
packages/backend/
├── src/
│   ├── world/              # Simulation (pure math)
│   │   ├── planetary/
│   │   ├── creatures/
│   │   ├── materials/
│   │   ├── tools/
│   │   ├── evolution/
│   │   └── simulation.ts
│   │
│   ├── state/              # Zustand tracking
│   │   ├── WorldState.ts   # Main state definition
│   │   ├── metrics.ts      # What gets tracked
│   │   ├── trends.ts       # Derived computations
│   │   ├── scoring.ts      # Score calculation
│   │   └── endings.ts      # Ending detection
│   │
│   └── api/                # REST interface
│       ├── routes/
│       │   ├── world.ts
│       │   ├── state.ts
│       │   ├── actions.ts
│       │   └── analysis.ts
│       └── server.ts
│
└── test/
    ├── world/              # Test simulation
    ├── state/              # Test tracking
    └── integration/        # Test full Gen 0-6 runs
```

---

## The Flow

### 1. Game Starts (Gen 0)
```typescript
// AI generates planet from seed
const gen0 = await generateGen0(seedPhrase);

// Initialize Zustand state
worldState.set({
  generation: 0,
  gen0: gen0,
  generations: [],
});

// Initialize simulation
simulation.initialize(gen0);
```

### 2. Generation Advances (Gen 1-6)
```typescript
// Player or CLI: POST /api/actions/advance-generation

// Simulation executes
simulation.advanceGeneration();

// Capture snapshot
const snapshot = {
  number: simulation.generation,
  creatures: simulation.getCreatureStats(),
  materials: simulation.getMaterialStats(),
  tools: simulation.tools,
  events: simulation.events,
  // ... everything
};

// Store in Zustand
worldState.update(state => ({
  generation: simulation.generation,
  generations: [...state.generations, snapshot],
  trends: computeTrends(state.generations),
  score: computeScore(state.generations),
}));
```

### 3. Query State
```typescript
// GET /api/state/generation/3
// Returns full snapshot of Gen 3

// GET /api/state/trends
// Returns:
{
  evolutionAcceleration: 0.15,  // Speeding up
  resourceDepletion: 0.67,      // Depleting fast
  violenceTrajectory: 0.45,     // Conflict increasing
  harmonyTrajectory: 0.23,      // Cooperation decreasing
}
```

### 4. Ending Detection
```typescript
// GET /api/analysis/ending
// Checks if Gen 6 reached or conditions met

if (state.generation === 6 || detectEarlyEnding(state)) {
  return {
    ending: detectEnding(state.score, state.trends),
    finalScore: state.score,
    reason: explainEnding(state),
  };
}
```

---

## Why This Structure?

### 1. Domain Separation
- **World** = pure simulation logic
- **State** = tracking across time
- **API** = interface

### 2. Zustand as Time Series DB
- Not just "UI state"
- Full historical record
- Trend analysis
- Prediction

### 3. RESTful Access
- CLI queries state
- Frontend queries state
- Analysis tools query state
- All hit same API

### 4. Gen 0-6 Arc
- Clear progression
- 6 major stages
- Definite endings
- Reasonable runtime (~30-60 min?)

---

## What Gets Built

### Phase 1: World Simulation
```
src/world/
- Planetary math ✅
- Creature evolution
- Material depletion
- Tool emergence
- simulation.ts (core loop)
```

### Phase 2: State Tracking
```
src/state/
- WorldState.ts (Zustand schema)
- Snapshot capture on each generation
- Trend computation
- Score calculation
```

### Phase 3: REST API
```
src/api/
- World query endpoints
- State query endpoints
- Action endpoints
- Analysis endpoints
```

### Phase 4: Gen 0 AI
```
src/gen0/
- AI workflow for planetary generation
- Integrate with simulation initialization
- Store in state.gen0
```

---

## Summary

**`src/world/`** = The simulation (doesn't know about REST/Zustand)

**`src/state/`** = Zustand tracking everything Gen 0-6

**`src/api/`** = RESTful interface to both

**The game** = Journey from Gen 0 → Gen 6, tracked in Zustand, queried via REST

**Zustand** = Not UI state, it's the TIME SERIES DATABASE of ALL game parameters

That's it.
