# THE ACTUAL SEPARATION

## THE SIMULATION (No Concept of "Player")

Pure mathematical state machines. No UI, no interpretation, no judgment.

```typescript
// THE SIMULATION - Pure functions, no player concept

class PlanetarySimulation {
  // Query: What material is at this point?
  getMaterialAt(x: number, y: number, z: number): Material {
    const radius = distance(x, y, z, center);
    const layer = findLayer(radius);
    const noise = perlinNoise(x, y, z, seed);
    return selectMaterial(layer, noise);
  }
  
  // Query: Can this creature reach this material?
  canReach(creatureTraits: Traits, material: Material, tools: Tool[]): boolean {
    const capability = calculateCapability(creatureTraits, tools);
    return material.depth <= capability.maxDepth && 
           material.hardness <= capability.maxHardness;
  }
  
  // Command: Consume material
  consume(material: Material, amount: number): void {
    material.remaining -= amount;
  }
  
  // Query: Calculate pressure based on state
  calculatePressure(state: SimulationState): EvolutionaryPressure {
    const inaccessible = state.materials.filter(m => 
      !canReach(avgCreatureTraits(state), m, state.tools)
    );
    return {
      excavation: calculateDepthPressure(inaccessible),
      strength: calculateHardnessPressure(inaccessible),
    };
  }
  
  // Command: Advance time
  advanceGeneration(): void {
    this.generation++;
    evolveCreatures(this.state.pressure);
    evaluateToolEmergence(this.state);
    depleteResources(this.state);
    recalculatePressure(this.state);
  }
}
```

**The simulation has NO IDEA about:**
- Winning or losing
- Good or bad
- Score
- Endings
- Player satisfaction
- Strategy

**The simulation only knows:**
- State (what IS)
- Queries (ask about state)
- Commands (change state)
- Calculations (derived values from state)

---

## THE GAME LAYER (How Player Interacts)

Reads simulation state and INTERPRETS it for the player.

```typescript
// THE GAME LAYER - Interprets simulation for player

class GameInterface {
  private simulation: PlanetarySimulation;
  
  // INTERPRETATION: Convert simulation state to "score"
  getScore(): WorldScore {
    const state = this.simulation.getState();
    
    return {
      speed: state.generation,
      violence: countCombatEvents(state.events),
      exploitation: calculateDepletionRate(state.materials),
      harmony: countAlliances(state.tribes),
      innovation: state.tools.length + state.buildings.length,
    };
  }
  
  // INTERPRETATION: Detect patterns as "endings"
  checkEnding(): Ending | null {
    const state = this.simulation.getState();
    const score = this.getScore();
    
    // All this is INTERPRETATION of simulation state
    if (allMaterialsAccessible(state) && score.innovation > 0.8) {
      return 'TRANSCENDENCE';
    }
    
    if (score.harmony > 0.7 && score.violence < 0.2) {
      return 'MUTUALISM';
    }
    
    if (allMaterialsDepleted(state)) {
      return 'EXTINCTION';
    }
    
    return null;
  }
  
  // PRESENTATION: Format simulation state for display
  getStatus(): PlayerStatus {
    const state = this.simulation.getState();
    const pressure = this.simulation.calculatePressure(state);
    
    return {
      generation: state.generation,
      materialsAccessible: `${countAccessible(state)}/${state.materials.length}`,
      creaturesAlive: state.creatures.length,
      toolsAvailable: state.tools.length,
      pressure: formatPressure(pressure),
      warnings: detectWarnings(state),
    };
  }
  
  // PLAYER ACTION: Influence simulation (doesn't change rules, just nudges)
  spendEvoPoints(target: 'trait' | 'tool' | 'tribe', id: string): void {
    // This INFLUENCES simulation parameters but doesn't override physics
    if (target === 'trait') {
      this.simulation.nudgeTrait(id, 0.1); // Increase pressure slightly
    }
    // The simulation still decides IF it happens based on its rules
  }
}
```

---

## THE ARCHITECTURE

```
┌─────────────────────────────────────────────────┐
│                    PLAYER                       │
│          (Human making decisions)               │
└───────────────────┬─────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│               GAME LAYER                        │
│        (Interprets simulation for player)       │
│                                                 │
│  - Shows "score"                                │
│  - Detects "endings"                            │
│  - Presents "status"                            │
│  - Provides "warnings"                          │
│  - Accepts "player actions" → nudges            │
└───────────────────┬─────────────────────────────┘
                    │
                    │ queries & commands
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│              SIMULATION                         │
│        (Pure mathematical state machine)        │
│                                                 │
│  getMaterialAt(x, y, z) → Material              │
│  canReach(creature, material, tools) → boolean  │
│  consume(material, amount) → void               │
│  calculatePressure(state) → Pressure            │
│  advanceGeneration() → void                     │
│                                                 │
│  NO CONCEPT OF:                                 │
│  - Player                                       │
│  - Winning/losing                               │
│  - Score                                        │
│  - Good/bad                                     │
└─────────────────────────────────────────────────┘
```

---

## REST API CLARIFICATION

### Simulation Endpoints (Raw State Queries)
```
GET /api/game/:id/planet/query?x=X&y=Y&z=Z
→ Simulation returns: Material at point

GET /api/game/:id/materials
→ Simulation returns: All materials with properties

GET /api/game/:id/creatures/:id
→ Simulation returns: Creature traits

POST /api/game/:id/generation/advance
→ Simulation executes: advanceGeneration()
→ Simulation returns: New state

GET /api/game/:id/pressure
→ Simulation calculates: Pressure from current state
→ Simulation returns: Pressure values
```

**These are PURE simulation queries/commands. No interpretation.**

### Game Layer Endpoints (Interpreted Views)
```
GET /api/game/:id/ui/score
→ Game Layer reads simulation state
→ Game Layer computes score
→ Game Layer returns interpreted score

GET /api/game/:id/ui/ending
→ Game Layer reads simulation state
→ Game Layer detects patterns
→ Game Layer returns ending or null

GET /api/game/:id/ui/status
→ Game Layer reads simulation state
→ Game Layer formats for player
→ Game Layer returns player-friendly status

GET /api/game/:id/ui/warnings
→ Game Layer analyzes simulation state
→ Game Layer detects danger patterns
→ Game Layer returns warnings
```

**These are INTERPRETATIONS of simulation state for player consumption.**

---

## FILE STRUCTURE

```
packages/backend/src/
├── simulation/              # SIMULATION (no player concept)
│   ├── planetary/
│   │   ├── composition.ts   # getMaterialAt()
│   │   ├── layers.ts        # Layer definitions
│   │   └── noise.ts         # Noise functions
│   ├── creatures/
│   │   ├── traits.ts        # Trait definitions
│   │   └── capability.ts    # calculateCapability()
│   ├── materials/
│   │   ├── properties.ts    # Material definitions
│   │   ├── accessibility.ts # canReach()
│   │   └── depletion.ts     # consume()
│   ├── tools/
│   │   ├── definitions.ts   # Tool types
│   │   └── emergence.ts     # Fuzzy logic for emergence
│   ├── evolution/
│   │   ├── pressure.ts      # calculatePressure()
│   │   └── evolve.ts        # evolveCreatures()
│   └── GameState.ts         # Pure state container
│
└── game/                    # GAME LAYER (player interface)
    ├── scoring/
    │   ├── calculator.ts    # Calculate score from state
    │   └── metrics.ts       # Define what score means
    ├── endings/
    │   ├── detector.ts      # Detect ending patterns
    │   └── conditions.ts    # Define ending thresholds
    ├── ui/
    │   ├── status.ts        # Format state for display
    │   └── warnings.ts      # Detect danger patterns
    └── actions/
        └── influence.ts     # Player evo points → nudges
```

---

## CONCRETE EXAMPLE

### Simulation Code (No Player Awareness)
```typescript
// simulation/materials/accessibility.ts

export function canReach(
  creatureTraits: Traits, 
  material: Material, 
  tools: Tool[]
): boolean {
  const capability = calculateCapability(creatureTraits, tools);
  
  const depthOk = material.minDepth <= capability.maxDepth;
  const hardnessOk = material.hardness <= capability.maxHardness;
  
  return depthOk && hardnessOk;
}

// No concept of "good" or "bad"
// No concept of "player wants this"
// Just: CAN or CAN'T
```

### Game Layer Code (Player Interpretation)
```typescript
// game/ui/warnings.ts

export function detectWarnings(state: SimulationState): Warning[] {
  const warnings: Warning[] = [];
  
  // INTERPRETATION: Surface materials depleting = danger
  const surfaceMaterials = state.materials.filter(m => m.minDepth < 10);
  const depleting = surfaceMaterials.filter(m => m.remaining < 100);
  
  if (depleting.length > 0) {
    warnings.push({
      type: 'DEPLETION',
      severity: 'HIGH',
      message: 'Surface materials running low! Evolve excavation or face starvation.',
      affectedMaterials: depleting.map(m => m.type),
    });
  }
  
  // INTERPRETATION: Can't reach deep materials = danger
  const deepMaterials = state.materials.filter(m => m.minDepth > 50);
  const unreachable = deepMaterials.filter(m => 
    !canReach(avgCreatureTraits(state), m, state.tools)
  );
  
  if (unreachable.length > 5) {
    warnings.push({
      type: 'PROGRESS_BLOCKED',
      severity: 'MEDIUM',
      message: 'Many deep materials inaccessible. Evolve traits or wait for tools.',
      affectedMaterials: unreachable.map(m => m.type),
    });
  }
  
  return warnings;
}
```

**The simulation doesn't generate warnings. The game layer INTERPRETS state as warnings.**

---

## CLI DISTINCTION

### Simulation CLI (Raw Queries)
```bash
# Pure simulation query
$ ebb sim query --x 0 --y 6000000 --z 0

Material: olivine
Layer: upper_mantle
Depth: 371km
Hardness: 6.5
Remaining: 50000 units

# Pure simulation command
$ ebb sim advance

Generation advanced: 42 → 43
Creatures evolved: 12
Tools emerged: 0
Materials consumed: 45 units
```

### Game CLI (Player View)
```bash
# Interpreted for player
$ ebb status

=== GENERATION 43 ===

Materials: 7/20 accessible (35%)
⚠️  Surface materials depleting
⚠️  5 deep materials unreachable

Creatures: 145 alive
Pressure: HIGH (need excavation trait)

Score: Speed 43, Violence 0.2, Harmony 0.6
Projected: STAGNATION (too slow)

Recommendation: Spend Evo Points on excavation trait

# Player action (influences simulation)
$ ebb evolve --trait excavation --points 10

Spending 10 Evo Points...
Nudging excavation trait pressure +0.1
Simulation will respond based on its rules
```

---

## THE KEY INSIGHT

**The simulation is deterministic, amoral, and player-agnostic.**

It doesn't "want" anything.
It doesn't "care" if you win or lose.
It just IS.

**The game layer interprets simulation state through the lens of gameplay.**

It converts raw state into:
- Score (how well you're doing)
- Warnings (danger ahead)
- Recommendations (what to try)
- Endings (patterns detected)

**The player interacts with the GAME LAYER.**
**The game layer queries the SIMULATION.**
**The simulation knows nothing about the player.**

---

## ANALOGIES

### Physics Engine (Simulation) vs. Racing Game (Game Layer)

**Physics Engine (Simulation):**
- Car at position (x, y, z)
- Velocity vector (vx, vy, vz)
- Collision detection (did car hit wall?)
- Force calculations (acceleration, friction)

NO CONCEPT OF:
- "Winning" the race
- "Good" lap time
- "Fast" vs. "slow"
- Player skill

**Racing Game (Game Layer):**
- Reads car position → displays on screen
- Compares lap time to record → shows "NEW RECORD!"
- Detects car crossed finish line → "YOU WIN!"
- Ranks player against others → "1st place"

The physics engine doesn't know about laps or records.
The game interprets physics state as "racing."

### Our Case

**Simulation:**
- Material at (x, y, z)
- Creature capability
- Material accessibility
- Resource depletion
- Evolutionary pressure

NO CONCEPT OF:
- "Winning" or "losing"
- "Good" strategy
- Ending types
- Player satisfaction

**Game Layer:**
- Reads state → shows score
- Detects patterns → declares ending
- Analyzes trends → generates warnings
- Accepts input → nudges simulation

The simulation doesn't know about Mutualism or Transcendence.
The game interprets simulation patterns as "endings."

---

## WHAT THIS MEANS FOR DEVELOPMENT

### Build Simulation FIRST (Backend Package)
```
packages/backend/src/simulation/
- Planetary math ✅
- Material accessibility
- Creature capability
- Tool emergence
- Resource depletion
- Evolutionary pressure
- Time advancement

NO UI. NO INTERPRETATION. PURE MATH.
```

### Build Game Layer SECOND (Can be Frontend or Backend)
```
packages/backend/src/game/
- Score calculation
- Ending detection
- Warning generation
- Status formatting
- Player action handling

INTERPRETS simulation state for player.
```

### Build UI THIRD (Frontend Package)
```
packages/frontend/ or packages/cli/
- Displays game layer output
- Accepts player input
- Sends to game layer
- Game layer sends to simulation

PRESENTS game layer to human.
```

---

## SUMMARY

**SIMULATION = State machine (no player)**
- getMaterialAt()
- canReach()
- consume()
- calculatePressure()
- advanceGeneration()

**GAME LAYER = Interpreter (player interface)**
- getScore() → reads state, computes score
- checkEnding() → reads state, detects patterns
- getWarnings() → reads state, finds danger
- handlePlayerAction() → nudges simulation parameters

**UI = Presentation (human interface)**
- Displays game layer output
- Accepts human input
- Routes to game layer

**The simulation doesn't know you exist.**
**The game layer translates your existence into nudges.**
**The UI makes that translation visible.**

That's the ACTUAL separation.
