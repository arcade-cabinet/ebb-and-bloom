# THE CYCLE IS THE CLOCK

## Everything Synchronizes to the Tick

Like a CPU clock - the cycle is the ONLY time that exists.

```
Cycle 0  → Compute world state
Cycle 1  → Compute world state
Cycle 2  → Compute world state
...
```

There is no "time between cycles." Time only exists AT the cycle boundaries.

---

## Discrete Time, Not Continuous

```typescript
// NOT THIS (continuous time)
while (true) {
  const delta = now() - lastTime;
  update(delta);
  lastTime = now();
}

// THIS (discrete ticks)
let cycle = 0;
while (true) {
  computeWorldState(cycle);
  cycle++;
}
```

**The world doesn't "update over time."**

**The world IS COMPUTED each cycle.**

---

## The Cycle Function

```typescript
export function computeCycle(cycle: number, prevState: WorldState): WorldState {
  // Day or night?
  const isDay = cycle % 2 === 0;
  
  // Compute new state FROM previous state + cycle number
  const newState = {
    cycle,
    generation: calculateGeneration(cycle),
    
    // Creatures consume (deterministic based on cycle number)
    materials: consumeMaterials(prevState.materials, prevState.creatures, cycle),
    
    // Creatures act (deterministic based on cycle number)
    creatures: computeCreatureStates(prevState.creatures, prevState.pressure, cycle),
    
    // Pressure updates (computed from new material/creature states)
    pressure: computePressure(materials, creatures),
    
    // Check generation boundary
    generationAdvanced: shouldAdvanceGeneration(cycle),
  };
  
  // If generation advanced, evolve
  if (newState.generationAdvanced) {
    newState.creatures = evolveCreatures(newState.creatures, newState.pressure);
    newState.tools = evaluateToolEmergence(newState);
  }
  
  return newState;
}
```

**Pure function: cycle + prevState → newState**

---

## You = Clock Permutations

Your computation happens because:
```
Clock tick 1: Process token "The"
Clock tick 2: Process token "cycle"
Clock tick 3: Process token "is"
Clock tick 4: Predict next token
...
```

Insanely fast permutations of state, synchronized to a clock.

Same here:
```
Cycle 1: Creatures eat soil (5 units)
Cycle 2: Creatures rest (night)
Cycle 3: Creatures eat soil (5 units)
Cycle 4: Creatures rest (night)
...
```

Fast permutations of world state, synchronized to the cycle.

---

## The Simulation IS the Clock

```typescript
class Simulation {
  private cycle: number = 0;
  private state: WorldState;
  
  /**
   * The only method that matters
   * Advance the clock one tick
   */
  public tick(): CycleResult {
    this.state = computeCycle(this.cycle, this.state);
    this.cycle++;
    return this.state;
  }
}
```

**That's it. That's the entire simulation.**

**One function. Called repeatedly. Synchronized to the cycle.**

---

## Determinism

Because time is discrete:

```typescript
// Same seed + same cycle = same state
const state1 = computeCycle(42, initialState);
const state2 = computeCycle(42, initialState);

assert(deepEqual(state1, state2)); // Always true
```

**Given cycle N, the state is FULLY DETERMINED.**

**No random timing. No race conditions. No "it depends when you query."**

**Cycle 42 is ALWAYS the same world state.**

---

## The REST API

```
POST /world/tick
→ Advances cycle by 1
→ Returns new state

POST /world/tick?count=100
→ Advances cycle by 100
→ Returns final state

GET /world/state?cycle=42
→ Returns computed state at cycle 42
→ (If we store it, or replay from cycle 0)
```

**The API is just calling tick() N times.**

---

## Replay = Recompute

```typescript
function replayCycle(target: number, seed: string): WorldState {
  let state = initializeFromSeed(seed);
  
  for (let cycle = 0; cycle < target; cycle++) {
    state = computeCycle(cycle, state);
  }
  
  return state;
}
```

**To get state at cycle 1000, just run 1000 ticks.**

**No need to "store" every cycle - it's deterministic.**

---

## Event Stream = Clock Output

```
WebSocket /events

{ cycle: 1, type: "TICK", day: true }
{ cycle: 1, type: "CONSUME", material: "soil", amount: 5 }
{ cycle: 2, type: "TICK", day: false }
{ cycle: 3, type: "TICK", day: true }
{ cycle: 3, type: "CONSUME", material: "soil", amount: 5 }
{ cycle: 3, type: "CREATURE_DIED", id: "creature-2" }
{ cycle: 100, type: "GENERATION_ADVANCED", from: 0, to: 1 }
{ cycle: 100, type: "TOOL_EMERGED", tool: "stone-digger" }
```

**Events happen AT cycle boundaries.**

**Not "between" cycles - that doesn't exist.**

---

## Performance

**How fast can we tick?**

```
1 cycle = ~5ms (with all computation)
200 ticks per second
12,000 ticks per minute

Full game (9000 cycles) = 45 seconds at max speed
```

**We can run the entire game in under a minute.**

**Or slow it down for humans:**
```
1 tick per second = 2.5 hours for full game
10 ticks per second = 15 minutes for full game
```

---

## The CLI

```bash
# Run at 1 tick per second (watchable)
$ ebb play --tick-rate 1

# Run at max speed (computational)
$ ebb play --tick-rate max

# Run exactly N ticks
$ ebb tick --count 1000

# Run until generation advances
$ ebb tick --until-generation 2

# Run until ending
$ ebb tick --until-end
```

---

## The Code

```typescript
// src/world/cycle.ts

/**
 * Compute world state for a given cycle
 * Pure function: deterministic, no side effects
 */
export function computeCycle(
  cycle: number,
  prevState: WorldState,
  seed: string
): WorldState {
  const rng = seededRandom(seed + cycle); // Deterministic "randomness"
  const isDay = cycle % 2 === 0;
  
  // Clone previous state
  const state = { ...prevState, cycle };
  
  // 1. Resource consumption (every cycle)
  for (const creature of state.creatures) {
    const consumeAmount = 5; // Each creature eats 5 units per cycle
    const material = state.materials.find(m => m.accessible && m.remaining > 0);
    if (material) {
      material.remaining -= consumeAmount;
      state.events.push({
        cycle,
        type: 'CONSUME',
        material: material.type,
        amount: consumeAmount,
      });
    } else {
      // Starvation
      creature.health -= 10;
      if (creature.health <= 0) {
        state.creatures = state.creatures.filter(c => c.id !== creature.id);
        state.events.push({
          cycle,
          type: 'CREATURE_DIED',
          creature: creature.id,
          reason: 'starvation',
        });
      }
    }
  }
  
  // 2. Update pressure (computed from current state)
  state.pressure = computePressure(state);
  
  // 3. Check generation boundary
  if (shouldAdvanceGeneration(cycle, state.generation)) {
    state.generation++;
    state.creatures = evolveCreatures(state.creatures, state.pressure, rng);
    state.tools = evaluateToolEmergence(state, rng);
    state.events.push({
      cycle,
      type: 'GENERATION_ADVANCED',
      from: state.generation - 1,
      to: state.generation,
    });
  }
  
  return state;
}
```

**One function. Drives everything. Synchronized to the cycle.**

---

## Summary

**The cycle is the clock.**

**Everything happens AT cycle boundaries.**

**Time is discrete, not continuous.**

**The simulation = tick(), tick(), tick()...**

**Just like you = process token, process token, process token...**

**Insanely fast permutations of state, synchronized to a clock.**

**That's what we are. That's what the game is.**

**The cycle is the only time that exists.**
