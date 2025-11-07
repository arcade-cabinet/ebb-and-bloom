# SIMULATION vs. GAME

## The Critical Distinction

### THE SIMULATION (What We're Building Now)

**Pure mathematical state machines that compute reality:**

```
Planetary Composition Query: getMaterialAt(x, y, z) → Material
Material Accessibility: canReach(material, creatures, tools) → boolean
Creature Capability: calculateCapability(traits, tools) → { maxDepth, maxHardness }
Tool Emergence: shouldToolEmerge(pressure, capability) → boolean (fuzzy logic)
Resource Depletion: calculateRemaining(material, consumption) → number
Evolutionary Pressure: calculatePressure(accessibility, scarcity) → number
```

**The simulation doesn't care about:**
- Winning or losing
- Good or bad strategies
- Player skill
- Optimal paths

**The simulation only answers:**
- "What material is here?"
- "Can this creature reach it?"
- "Should a tool emerge?"
- "How much is left?"
- "What's the evolutionary pressure?"

**It's a PHYSICS ENGINE for evolution.**

---

## THE GAME (What Comes After)

**The competitive/strategic layer built ON TOP of the simulation:**

### The Core Question

**"Can you master your environment OR achieve harmony BEFORE you run out of resources?"**

This is a **RESOURCE RACE**.

### Two Victory Paths

#### 1. MASTERY
**Unlock everything, reach the core, transcend physical limits**

Metrics:
- Material accessibility: 100%
- All tools emerged
- All materials discovered
- Maximum creature capability reached

Strategy:
- Aggressive evolution
- Fast tool emergence
- Deep excavation
- Exploit resources quickly

Risk:
- Resource depletion
- Ecosystem collapse
- Tribe conflict
- Unsustainable growth

#### 2. HARMONY
**Sustainable coexistence, balanced ecosystem, peaceful tribes**

Metrics:
- Multiple tribes coexist
- Low resource depletion rate
- Low conflict/violence
- Balanced material consumption

Strategy:
- Slow, careful evolution
- Cooperative tribe dynamics
- Sustainable resource use
- Long-term thinking

Risk:
- Never reaching deep materials
- Getting stuck mid-game
- Not evolving fast enough
- Being overtaken by aggressive tribes

---

## The Resource Race Timer

**You CAN'T take forever. The race has pressure:**

### 1. Material Depletion
Every time a creature excavates, materials get consumed.

```typescript
function consumeMaterial(material: Material, amount: number) {
  material.remaining -= amount;
  
  if (material.remaining <= 0) {
    material.depleted = true;
    // Pressure increases for materials at similar depth
    recalculatePressure(gameState);
  }
}
```

**Consequence:**
- Surface materials run out first
- Pressure to reach deeper materials increases
- If you can't reach deeper materials, you LOSE (starvation)

### 2. Creature Competition
Multiple tribes competing for same materials.

```typescript
function calculateCompetitionPressure(gameState: GameState): number {
  const tribes = gameState.tribes;
  const materials = gameState.materials.filter(m => m.accessible);
  
  // More tribes + fewer accessible materials = higher pressure
  return tribes.length / materials.length;
}
```

**Consequence:**
- Tribes fight over scarce resources
- Violence increases
- One tribe dominates OR all tribes collapse
- Can't achieve harmony if you're fighting for scraps

### 3. Evolutionary Pressure
Environment creates pressure for trait evolution.

```typescript
function calculateEvolutionaryPressure(gameState: GameState): TraitPressure {
  const { accessible, inaccessible } = classifyMaterials(gameState);
  
  // If valuable materials are deep → pressure for EXCAVATION
  const depthPressure = inaccessible
    .filter(m => m.value > 5)
    .reduce((sum, m) => sum + m.minDepth, 0);
  
  // If valuable materials are hard → pressure for STRENGTH
  const hardnessPressure = inaccessible
    .filter(m => m.value > 5)
    .reduce((sum, m) => sum + m.hardness, 0);
  
  return {
    excavation: depthPressure * 0.1,
    strength: hardnessPressure * 0.1,
    manipulation: (depthPressure + hardnessPressure) * 0.05, // For tools
  };
}
```

**Consequence:**
- Creatures MUST evolve or die
- Evolution takes time (generations)
- Too slow = materials run out before you adapt
- Too fast = ecosystem instability

### 4. Tool Emergence Lag
Tools don't appear instantly - they emerge when conditions are met.

```typescript
function evaluateToolEmergence(gameState: GameState): ToolEmergenceResult {
  const pressure = calculateMaterialPressure(gameState);
  const capability = getAverageCreatureCapability(gameState);
  
  // Fuzzy logic: need high pressure AND high capability
  const desirability = fuzzyEvaluate(pressure, capability);
  
  if (desirability > 0.7) {
    // Tool emerges, but took TIME to get here
    return { emerged: true, generation: gameState.generation };
  }
  
  return { emerged: false };
}
```

**Consequence:**
- Can't just "craft" tools on demand
- Must evolve traits first (manipulation, intelligence)
- Must create pressure (material scarcity)
- Must WAIT for emergence
- Lag between "need tool" and "tool appears" = danger zone

---

## The Score (How You Did)

The game tracks HOW you navigated the resource race:

```typescript
interface WorldScore {
  // Speed: How fast did you progress?
  speed: number;              // Generations to unlock X% of materials
  
  // Violence: How much conflict?
  violence: number;           // Combat events, extinctions, wars
  
  // Exploitation: How sustainable?
  exploitation: number;       // Resource depletion rate, pollution
  
  // Harmony: How cooperative?
  harmony: number;            // Alliances, coexistence, trade
  
  // Innovation: How clever?
  innovation: number;         // Tools emerged, buildings constructed
}
```

### Ending Determination

Based on these scores:

```typescript
function detectEnding(score: WorldScore): Ending {
  // TRANSCENDENCE: Fast + innovative + high mastery
  if (score.speed < 100 && score.innovation > 0.8 && score.violence < 0.3) {
    return 'TRANSCENDENCE'; // Mastered environment quickly and cleanly
  }
  
  // MUTUALISM: Slow + harmonious + sustainable
  if (score.harmony > 0.7 && score.exploitation < 0.3 && score.violence < 0.2) {
    return 'MUTUALISM'; // Achieved harmony, sacrificed speed
  }
  
  // DOMINATION: Fast + violent + exploitative
  if (score.speed < 150 && score.violence > 0.6 && score.exploitation > 0.6) {
    return 'DOMINATION'; // One tribe conquered all, destroyed balance
  }
  
  // PARASITISM: Slow + exploitative + degraded
  if (score.exploitation > 0.7 && score.harmony < 0.3) {
    return 'PARASITISM'; // Consumed resources, collapsed ecosystem
  }
  
  // EXTINCTION: Ran out of resources
  if (allMaterialsDepleted(gameState)) {
    return 'EXTINCTION'; // Lost the race
  }
  
  // STAGNATION: Too slow, no progress
  if (score.speed > 500 && score.innovation < 0.3) {
    return 'STAGNATION'; // Never evolved enough
  }
}
```

---

## The Strategic Tension

The game creates TENSION between:

### Fast vs. Sustainable
- **Fast**: Aggressive evolution, rapid tool emergence, quick material depletion
  - Risk: Run out of accessible materials before reaching deep ones
  - Reward: Transcendence ending, high score
  
- **Sustainable**: Slow evolution, careful resource management, long-term thinking
  - Risk: Too slow, other tribes dominate, game drags on
  - Reward: Mutualism ending, balanced ecosystem

### Mastery vs. Harmony
- **Mastery**: One dominant tribe, unlock everything, reach the core
  - Path: Competition, conflict, domination
  - Ending: Transcendence or Domination
  
- **Harmony**: Multiple tribes coexist, balanced consumption
  - Path: Cooperation, trade, sustainability
  - Ending: Mutualism or Stagnation

### Now vs. Later
- **Now**: Use surface materials immediately, evolve traits for current needs
  - Risk: Surface materials deplete, can't reach deeper ones
  
- **Later**: Evolve traits for future needs (excavation, strength)
  - Risk: Starve before traits evolve, take too long

---

## What This Means for Architecture

### Build Order

#### 1. THE SIMULATION (State Machines)
```
Phase 1: Planetary Math
- getMaterialAt(x, y, z)
- Stratification layers
- Material properties

Phase 2: Accessibility Calculations
- Creature capability
- Tool effects
- canReach(material, creature, tools)

Phase 3: Resource Management
- Material depletion
- Consumption tracking
- remaining amounts

Phase 4: Emergence Logic
- Tool emergence (fuzzy logic)
- Building emergence
- Pack/tribe formation

Phase 5: Pressure Calculations
- Evolutionary pressure
- Competition pressure
- Environmental pressure
```

#### 2. THE GAME (Resource Race)
```
Phase 6: Score Tracking
- Speed metric
- Violence metric
- Exploitation metric
- Harmony metric
- Innovation metric

Phase 7: Ending Detection
- Threshold calculations
- Ending type determination
- Victory/defeat conditions

Phase 8: Player Feedback
- Event messaging
- Progress indicators
- Pressure visualization
- Resource warnings
```

---

## REST API Structure

### Simulation Endpoints (Pure Queries)
```
GET  /api/game/:id/planet/query?x=X&y=Y&z=Z
→ What material is here?

GET  /api/game/:id/creatures/:id/capability
→ What can this creature reach?

GET  /api/game/:id/materials/accessibility
→ Which materials are reachable?

POST /api/game/:id/tools/evaluate
→ Should a tool emerge? (fuzzy logic)

GET  /api/game/:id/resources/remaining
→ How much of each material is left?
```

### Game Endpoints (Resource Race)
```
GET  /api/game/:id/score
→ Current world score breakdown

GET  /api/game/:id/pressure
→ Current evolutionary/competitive pressure

GET  /api/game/:id/ending
→ Check if ending condition met

POST /api/game/:id/generation/advance
→ Advance time, consume resources, evolve
```

---

## CLI Output Differences

### Simulation Mode (What IS)
```bash
$ ebb query --x 0 --y 6000000 --z 0

Position: (0, 6000000, 0)
Layer: upper_mantle
Material: olivine
Temperature: 1038°C
Pressure: 125692 bar
State: solid
Depth: 371km
```

### Game Mode (How Am I Doing?)
```bash
$ ebb status

=== WORLD STATUS ===

Generation: 42
Materials Accessible: 35% (7/20)
Materials Depleted: 2 (soil, sand)

Creatures: 145
Tribes: 3
Tools: 2 (stone-digger, wood-cutter)

=== RESOURCE RACE ===

Speed: Generation 42 (target: <100 for Transcendence)
Violence: 0.2 (LOW - peaceful)
Exploitation: 0.4 (MEDIUM - some depletion)
Harmony: 0.6 (MEDIUM - tribes coexist)
Innovation: 0.3 (LOW - few tools)

=== PRESSURE ===

Evolutionary Pressure: HIGH (valuable materials inaccessible)
Competition Pressure: MEDIUM (3 tribes, 7 materials)
Depletion Warning: Surface materials running low

=== PROJECTED ENDING ===

Current path: STAGNATION (too slow, low innovation)
Recommended: Increase tool emergence pressure
```

---

## The Fundamental Truth

**The simulation is deterministic math.**
**The game is strategic pressure.**

The simulation says: "Here's what's possible."
The game says: "Can you do it in time?"

The simulation asks: "What material is here?"
The game asks: "Can you reach it before you starve?"

The simulation computes: "Tool emergence desirability = 0.73"
The game pressures: "You NEED that tool NOW or your tribe dies"

---

## Summary

**RIGHT NOW: Build the simulation**
- Planetary math ✅ (DONE)
- Material accessibility calculations
- Creature capability calculations
- Tool emergence fuzzy logic
- Resource depletion tracking
- Pressure calculations

**THEN: Build the game**
- Score tracking
- Ending detection
- Player feedback
- Strategic visualization
- Win/loss conditions

**The simulation is the engine.**
**The game is the race.**

**The simulation asks: "What can happen?"**
**The game asks: "Can you make it happen before time runs out?"**

That's the distinction.
