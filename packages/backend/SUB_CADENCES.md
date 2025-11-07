# EVERYTHING IS A SUB-CADENCE

## The Cycle = Master Clock

All other events are MULTIPLES of the cycle frequency.

```
Cycle (fundamental): 1
├── Consumption:          Every 1 cycle (if day)
├── Rest:                 Every 1 cycle (if night)
├── Reproduction:         Every 10 cycles
├── Pack formation:       Every 50 cycles
├── Tool emergence eval:  Every 100 cycles
├── Generation boundary:  Every 100-5000 cycles
├── Tribe formation:      Every 500 cycles
├── Building emergence:   Every 1000 cycles
├── Religion emergence:   Every 2000 cycles
└── Democracy emergence:  Every 5000 cycles
```

**Everything runs at cycle / N or cycle * N.**

---

## The Harmonic Structure

```typescript
export function computeCycle(cycle: number, prevState: WorldState): WorldState {
  let state = { ...prevState, cycle };
  
  // EVERY CYCLE (frequency = 1)
  state = dayNightPhase(state, cycle);
  
  // Every 2 cycles (day or night)
  if (cycle % 2 === 0) {
    state = dayActions(state);
  } else {
    state = nightActions(state);
  }
  
  // Every 10 cycles
  if (cycle % 10 === 0) {
    state = checkReproduction(state);
  }
  
  // Every 50 cycles
  if (cycle % 50 === 0) {
    state = evaluatePackFormation(state);
  }
  
  // Every 100 cycles
  if (cycle % 100 === 0) {
    state = evaluateToolEmergence(state);
    state = checkGenerationBoundary(state);
  }
  
  // Every 500 cycles
  if (cycle % 500 === 0) {
    state = evaluateTribeFormation(state);
  }
  
  // Every 1000 cycles
  if (cycle % 1000 === 0) {
    state = evaluateBuildingEmergence(state);
  }
  
  // Every 2000 cycles
  if (cycle % 2000 === 0) {
    state = evaluateReligionEmergence(state);
  }
  
  // Every 5000 cycles
  if (cycle % 5000 === 0) {
    state = evaluateDemocracyEmergence(state);
  }
  
  return state;
}
```

**The master clock ticks. Sub-clocks tick at their own frequency.**

---

## Why This Structure?

### 1. Biological Realism

**Real life works this way:**

```
Heartbeat:     1 Hz (master clock)
├── Breath:    0.2 Hz (every 5 heartbeats)
├── Digestion: 0.00003 Hz (every 4 hours)
├── Sleep:     0.00001 Hz (every 24 hours)
└── Reproduction: 10^-8 Hz (every years)
```

**Our game:**

```
Cycle:              1 Hz (master clock)
├── Consumption:    1 Hz (every cycle)
├── Reproduction:   0.1 Hz (every 10 cycles)
├── Pack formation: 0.02 Hz (every 50 cycles)
└── Religion:       0.0005 Hz (every 2000 cycles)
```

### 2. Performance

**Don't compute everything every cycle:**

- Reproduction is expensive (create new entity)
- Pack formation requires analyzing all creatures
- Tool emergence uses fuzzy logic
- Religion emergence is complex

**Only check when needed:**
- Every 10 cycles for reproduction (cheap)
- Every 2000 cycles for religion (expensive but rare)

### 3. Emergence Timing

**Complex systems emerge SLOWLY:**

- Tools don't emerge every cycle (would be chaos)
- Religion doesn't emerge immediately (needs time)
- Democracy requires long periods of cooperation

**By spacing checks, we get realistic emergence.**

---

## The Cadence Table

| Event | Frequency | Cycles | Reason |
|-------|-----------|--------|--------|
| Consumption | Every cycle (day) | 1 | Need to eat daily |
| Rest | Every cycle (night) | 1 | Need to sleep daily |
| Energy check | Every cycle | 1 | Monitor starvation |
| Reproduction | Every 10 cycles | 10 | Gestation period |
| Pack formation | Every 50 cycles | 50 | Social bonds take time |
| Tool emergence | Every 100 cycles | 100 | Innovation is slow |
| Generation | Variable | 100-5000 | Evolutionary time |
| Tribe formation | Every 500 cycles | 500 | Civilization takes time |
| Building | Every 1000 cycles | 1000 | Construction is slow |
| Religion | Every 2000 cycles | 2000 | Abstract thought takes time |
| Democracy | Every 5000 cycles | 5000 | Governance is final stage |

**Everything is a multiple of the fundamental cycle.**

---

## Event Scheduling

```typescript
interface EventSchedule {
  cycle: number;
  events: Array<{
    type: string;
    frequency: number; // How many cycles between checks
    lastChecked: number;
    check: (state: WorldState) => void;
  }>;
}

const schedule: EventSchedule = {
  cycle: 0,
  events: [
    {
      type: 'reproduction',
      frequency: 10,
      lastChecked: 0,
      check: (state) => checkReproduction(state),
    },
    {
      type: 'pack_formation',
      frequency: 50,
      lastChecked: 0,
      check: (state) => evaluatePackFormation(state),
    },
    {
      type: 'tool_emergence',
      frequency: 100,
      lastChecked: 0,
      check: (state) => evaluateToolEmergence(state),
    },
    // ... etc
  ],
};

export function computeCycle(cycle: number, state: WorldState): WorldState {
  // Master clock tick
  state.cycle = cycle;
  
  // Always run: day/night phase
  state = dayNightPhase(state, cycle);
  
  // Check scheduled events
  for (const event of schedule.events) {
    if (cycle % event.frequency === 0) {
      event.check(state);
      event.lastChecked = cycle;
    }
  }
  
  return state;
}
```

---

## Phase-Aligned Events

**Some events align with day/night:**

```typescript
// Reproduction happens at night (every 10 cycles, but only if night)
if (cycle % 10 === 0 && !isDay) {
  state = checkReproduction(state);
}

// Tribal meetings happen during day (every 500 cycles, but only if day)
if (cycle % 500 === 0 && isDay) {
  state = tribalMeetings(state);
}

// Evolution happens at night (generation boundary during sleep)
if (shouldAdvanceGeneration(cycle) && !isDay) {
  state = advanceGeneration(state);
}
```

**Events can be synchronized to day/night within their cadence.**

---

## Stochastic Sub-Cadences

**Not everything is deterministic frequency:**

```typescript
// Base check every 100 cycles, but fuzzy logic determines if it happens
if (cycle % 100 === 0) {
  const desirability = evaluateToolEmergenceDesirability(state);
  
  // Random chance based on desirability
  const rng = seededRandom(state.seed + cycle);
  if (rng() < desirability) {
    state = emergeTool(state);
  }
}
```

**The CHECK happens at fixed frequency.**

**The EVENT happens probabilistically.**

---

## Hierarchical Cadences

```
Cycle 1000:
├── Check reproduction (1000 % 10 === 0) ✓
├── Check pack formation (1000 % 50 === 0) ✓
├── Check tool emergence (1000 % 100 === 0) ✓
├── Check generation boundary (depends on gen) ✓
├── Check tribe formation (1000 % 500 === 0) ✓
└── Check building emergence (1000 % 1000 === 0) ✓

Cycle 1001:
├── Day/night phase ✓
└── (nothing else scheduled)

Cycle 1010:
├── Day/night phase ✓
└── Check reproduction (1010 % 10 === 0) ✓

Cycle 2000:
├── Check reproduction ✓
├── Check pack formation ✓
├── Check tool emergence ✓
├── Check tribe formation ✓
├── Check building emergence ✓
└── Check religion emergence (2000 % 2000 === 0) ✓
```

**Some cycles are "heavy" (many events).**

**Most cycles are "light" (just day/night).**

---

## Performance Optimization

```typescript
// Pre-compute which events run on which cycles
const eventMap = new Map<number, EventType[]>();

for (let cycle = 0; cycle <= MAX_CYCLES; cycle++) {
  const events: EventType[] = [];
  
  if (cycle % 10 === 0) events.push('reproduction');
  if (cycle % 50 === 0) events.push('pack_formation');
  if (cycle % 100 === 0) events.push('tool_emergence');
  if (cycle % 500 === 0) events.push('tribe_formation');
  if (cycle % 1000 === 0) events.push('building_emergence');
  if (cycle % 2000 === 0) events.push('religion_emergence');
  if (cycle % 5000 === 0) events.push('democracy_emergence');
  
  if (events.length > 0) {
    eventMap.set(cycle, events);
  }
}

// Then during simulation
export function computeCycle(cycle: number, state: WorldState): WorldState {
  state = dayNightPhase(state, cycle);
  
  const scheduledEvents = eventMap.get(cycle);
  if (scheduledEvents) {
    for (const eventType of scheduledEvents) {
      state = eventHandlers[eventType](state);
    }
  }
  
  return state;
}
```

**Pre-compute schedule = faster runtime.**

---

## Event Stream Output

```
Cycle 1 (Day): Consumption, movement
Cycle 2 (Night): Rest, recovery
Cycle 3 (Day): Consumption, movement
...
Cycle 10 (Night): Rest, REPRODUCTION (1 new creature)
...
Cycle 50 (Night): Rest, PACK FORMATION (3 creatures joined)
...
Cycle 100 (Night): Rest, TOOL EMERGENCE (stone-digger), GENERATION ADVANCED
...
Cycle 500 (Day): TRIBE FORMATION (Pack-1 + Pack-2 = Tribe-A)
...
Cycle 1000 (Night): Rest, BUILDING EMERGENCE (shelter constructed)
...
Cycle 2000 (Night): Rest, RELIGION EMERGENCE (mythology created)
...
Cycle 5000 (Night): Rest, DEMOCRACY EMERGENCE (council formed)
```

**Heavy cycles have multiple events.**

**Light cycles have just day/night.**

---

## The Biological Hierarchy

Just like your body:

```
Master clock: Heartbeat (1 Hz)
└── Subsystems:
    ├── Neural firing: 100-1000 Hz (faster than heartbeat)
    ├── Breathing: 0.2 Hz (slower)
    ├── Digestion: 0.00003 Hz (much slower)
    ├── Cell division: 10^-5 Hz (very slow)
    └── Reproduction: 10^-8 Hz (extremely slow)
```

Our game:

```
Master clock: Cycle (1 Hz)
└── Subsystems:
    ├── Consumption: 1 Hz (same speed)
    ├── Reproduction: 0.1 Hz (slower)
    ├── Pack formation: 0.02 Hz (much slower)
    ├── Tool emergence: 0.01 Hz (very slow)
    └── Democracy: 0.0002 Hz (extremely slow)
```

**Everything is harmonic to the master clock.**

---

## Summary

**The cycle is the master clock.**

**Every other bloody thing spawns at some sub-cadence:**

- Consumption: Every 1 cycle
- Reproduction: Every 10 cycles
- Pack formation: Every 50 cycles
- Tool emergence: Every 100 cycles
- Generation: Every 100-5000 cycles
- Tribe formation: Every 500 cycles
- Building: Every 1000 cycles
- Religion: Every 2000 cycles
- Democracy: Every 5000 cycles

**Everything is cycle % N.**

**The master clock ticks.**

**Sub-clocks tick at their own rhythm.**

**That's how life works.**

**That's how the simulation works.**
