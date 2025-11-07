# THE CYCLE IS THE FUNDAMENTAL UNIT

## Not Generations - CYCLES

A **cycle** = one day/night period

A **generation** = many cycles (maybe 100? 365? 1000?)

The game loop runs on **CYCLES**, not generations.

---

## The Actual Time Structure

```
Gen 0: Initialize
Gen 1: Cycles 1-1000     (Surface adaptation)
Gen 2: Cycles 1001-2000  (Tool emergence)
Gen 3: Cycles 2001-3000  (Pack formation)
Gen 4: Cycles 3001-4000  (Tribal civilization)
Gen 5: Cycles 4001-5000  (Religion emerges)
Gen 6: Cycles 5001-6000  (Democracy/Inner core)
```

**Each generation = 1000 cycles**

Or maybe:
```
Gen 1: 100 cycles (fast early evolution)
Gen 2: 200 cycles (tool emergence takes time)
Gen 3: 500 cycles (social structures develop)
Gen 4: 1000 cycles (civilization matures)
Gen 5: 2000 cycles (religion is slow)
Gen 6: 5000 cycles (democracy requires patience)
```

**Total game: ~9000 cycles**

---

## What Happens Each Cycle?

### Cycle Tick (The Actual Simulation Loop)

```typescript
// src/world/simulation.ts

export class Simulation {
  public cycle: number = 0;
  public generation: number = 0;
  
  /**
   * Advance one day/night cycle
   * This is the FUNDAMENTAL game tick
   */
  public advanceCycle(): CycleEvents {
    this.cycle++;
    
    const events: CycleEvents = {
      cycle: this.cycle,
      generation: this.generation,
      day: this.cycle % 2 === 0,
      events: [],
    };
    
    // 1. Creatures consume resources (every cycle)
    const consumption = this.consumeResources();
    events.events.push(...consumption);
    
    // 2. Creatures move/act (every cycle)
    const actions = this.executeCreatureActions();
    events.events.push(...actions);
    
    // 3. Check for immediate events (deaths, births)
    const immediate = this.checkImmediateEvents();
    events.events.push(...immediate);
    
    // 4. Update pressures (every cycle, affects next evolution)
    this.updatePressures();
    
    // 5. Check if generation advances
    if (this.shouldAdvanceGeneration()) {
      this.advanceGeneration();
      events.generationAdvanced = true;
    }
    
    return events;
  }
  
  /**
   * Advance one generation (triggered by cycle count)
   */
  private advanceGeneration(): void {
    this.generation++;
    
    // Evolution happens at generation boundaries
    this.evolveCreatures();
    this.evaluateToolEmergence();
    this.evaluateBuildingEmergence();
    this.evaluateReligionEmergence();
    this.updateGovernance();
  }
  
  private shouldAdvanceGeneration(): boolean {
    // Gen 1: Every 100 cycles
    if (this.generation === 0) return this.cycle >= 100;
    
    // Gen 2: Every 200 cycles
    if (this.generation === 1) return this.cycle >= 300;
    
    // Gen 3: Every 500 cycles
    if (this.generation === 2) return this.cycle >= 800;
    
    // etc.
    return false;
  }
}
```

---

## The Two Commands

### Command 1: Advance Cycle (The Main Loop)

```
POST /world/advance-cycle
→ Executes: One day/night
→ Returns: Cycle events
```

**What happens:**
- Creatures eat (consume materials)
- Creatures act (forage, dig, build)
- Resources deplete
- Pressure updates
- Maybe generation advances

**Time:** Fast (1-10ms)

**Frequency:** Called repeatedly by CLI/frontend

---

### Command 2: Advance Generation (Skip Cycles)

```
POST /world/advance-generation
→ Executes: All remaining cycles in current generation
→ Returns: Generation summary
```

**What happens:**
- Runs `advanceCycle()` until generation advances
- Returns aggregated events

**Time:** Slow (100-1000ms, runs many cycles)

**Frequency:** Called when player wants to skip ahead

---

## CLI Modes Clarified

### Non-Blocking Mode (For Humans)

```bash
$ ebb play

Starting game from seed: "ancient-depths-42"

Gen 0 initialized...

Gen 1, Cycle 1 (Day):
→ Creatures forage for food (5 units consumed)
→ 3 creatures alive, avg excavation: 0.12

Gen 1, Cycle 2 (Night):
→ Creatures rest
→ Population stable

Gen 1, Cycle 3 (Day):
→ Creatures forage for food (5 units consumed)
→ Material "soil" remaining: 9980 units

[... cycle by cycle output ...]

Gen 1, Cycle 100:
→ GENERATION ADVANCED
→ Creatures evolved: excavation 0.12 → 0.18
→ Pressure: depth=0.8, scarcity=0.1

Gen 2, Cycle 101 (Day):
→ Creatures dig deeper...
```

**Cycles advance automatically, player watches.**

---

### Blocking Mode (For AI/Testing)

```bash
# Advance one cycle
$ ebb cycle
Gen 1, Cycle 1: 5 units consumed, 3 creatures alive

# Advance N cycles
$ ebb cycle --count 10
Gen 1, Cycles 1-10: 50 units consumed, 3 creatures alive

# Advance entire generation
$ ebb generation
Gen 1 complete: 100 cycles, 500 units consumed, 5 creatures alive

# Advance to specific cycle
$ ebb cycle --to 50
Gen 1, Cycle 50: ...
```

**Player controls time explicitly.**

---

## API Endpoints Updated

### Cycle Control

```
POST /world/advance-cycle
Body: { count: 1 }  // Optional: advance N cycles
Response: {
  cycle: 42,
  generation: 1,
  day: true,
  events: [
    { type: "CONSUMPTION", material: "soil", amount: 5 },
    { type: "CREATURE_ACTION", creature: "creature-1", action: "forage" }
  ],
  generationAdvanced: false,
  state: { ... }
}

POST /world/advance-generation
Response: {
  fromCycle: 1,
  toCycle: 100,
  fromGen: 1,
  toGen: 2,
  summary: {
    cyclesRun: 100,
    materialsConsumed: { soil: 500, sand: 200 },
    creaturesEvolved: 3,
    toolsEmerged: 0,
  },
  state: { ... }
}
```

---

## State Tracking Updated

```typescript
interface WorldState {
  cycle: number;              // Current cycle (0-9000)
  generation: number;         // Current generation (0-6)
  
  // Per-cycle granularity (too much to store all)
  currentCycleData: {
    cycle: number;
    consumption: { [material: string]: number };
    actions: CreatureAction[];
    deaths: number;
    births: number;
  };
  
  // Per-generation snapshots (store these)
  generations: Array<{
    number: number;
    startCycle: number;
    endCycle: number;
    cycleCount: number;
    
    // Aggregated over all cycles in generation
    totalConsumption: { [material: string]: number };
    avgCreatureStats: CreatureStats;
    eventsCount: number;
    
    // End-of-generation state
    finalState: SimulationState;
  }>;
}
```

**Don't store every cycle - too much data.**

**Store:**
- Current cycle data (live)
- Generation summaries (historical)
- Key events only

---

## Event Stream

### Real-Time Cycle Events

```javascript
// WebSocket /events

// Every cycle
{ type: "CYCLE", cycle: 42, generation: 1, day: true }

// Significant events
{ type: "MATERIAL_DEPLETED", material: "soil", cycle: 78 }
{ type: "CREATURE_DIED", creature: "creature-2", cycle: 92 }

// Generation boundary
{ type: "GENERATION_ADVANCED", from: 1, to: 2, cycle: 100 }
{ type: "TOOL_EMERGED", tool: "stone-digger", cycle: 100 }
```

**Stream filters:**
- All cycles (verbose)
- Significant events only (normal)
- Generations only (minimal)

---

## Performance Considerations

### Cycle Rate

**How fast can cycles run?**

- Simulation: 1-10ms per cycle (pure math)
- With events: +1-5ms (MessageDispatcher)
- With state updates: +1-5ms (Zustand)

**Total: ~5-20ms per cycle**

**Real-time rate:**
- 50-200 cycles per second
- Full generation (100 cycles) = 0.5-2 seconds
- Full game (9000 cycles) = 45-180 seconds (fast!)

**Could run entire game in 1-3 minutes.**

---

## CLI Speed Controls

```bash
# Real-time (1 cycle per second)
$ ebb play --speed 1

# Fast (10 cycles per second)
$ ebb play --speed 10

# Max speed (no delay)
$ ebb play --speed max

# Step through
$ ebb play --step
[Press Enter for next cycle]

# Skip to generation
$ ebb play --skip-to-gen 3
```

---

## The Game Loop

```typescript
// Non-blocking CLI mode

async function runGameLoop() {
  while (true) {
    // Advance cycle
    const result = await fetch('/world/advance-cycle', { method: 'POST' });
    const data = await result.json();
    
    // Display
    console.log(`Cycle ${data.cycle} (${data.day ? 'Day' : 'Night'})`);
    for (const event of data.events) {
      console.log(`→ ${formatEvent(event)}`);
    }
    
    // Check ending
    if (data.state.ending) {
      console.log(`\n=== GAME OVER ===`);
      console.log(`Ending: ${data.state.ending}`);
      break;
    }
    
    // Speed control
    await sleep(1000 / speed); // Configurable delay
  }
}
```

---

## Summary

**The CYCLE is the fundamental unit.**

- **1 cycle** = 1 day/night = 1 simulation tick
- **1 generation** = 100-5000 cycles
- **6 generations** = ~9000 cycles total

**Primary API command:**
```
POST /world/advance-cycle
```

**Secondary command (convenience):**
```
POST /world/advance-generation
```

**The game runs cycle-by-cycle.**

**Generations are MILESTONES reached after N cycles.**

**This is the actual time structure.**
