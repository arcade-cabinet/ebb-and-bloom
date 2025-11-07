# THE CIRCADIAN RHYTHM

## Day/Night = The Biological Clock

Humans exist synchronized to day/night cycles.
Creatures in this game exist synchronized to day/night cycles.

**The cycle isn't arbitrary - it's BIOLOGICAL.**

---

## What Happens During DAY

**Activity Phase:**

```typescript
function dayPhase(state: WorldState, cycle: number): WorldState {
  // DAY = Consumption, action, energy expenditure
  
  // 1. Creatures are ACTIVE
  for (const creature of state.creatures) {
    // Forage for food
    const food = findAccessibleMaterial(state.materials);
    if (food) {
      food.remaining -= creature.dailyConsumption;
      creature.energy += creature.dailyConsumption * 0.8; // 80% efficiency
    } else {
      creature.energy -= 20; // Starvation penalty
    }
    
    // Work (excavate, build, etc.)
    if (creature.energy > 50) {
      performWork(creature, state);
      creature.energy -= 10;
    }
    
    // Movement costs energy
    creature.energy -= 5;
  }
  
  // 2. Social interactions happen during day
  updatePackCohesion(state);
  resolveTerritorialDisputes(state);
  
  // 3. Environmental effects
  state.temperature = calculateDayTemp(state.planet);
  
  return state;
}
```

**Day = EXPENDITURE**

---

## What Happens During NIGHT

**Rest Phase:**

```typescript
function nightPhase(state: WorldState, cycle: number): WorldState {
  // NIGHT = Recovery, processing, consolidation
  
  // 1. Creatures SLEEP/REST
  for (const creature of state.creatures) {
    // Energy recovery (if they have food)
    if (creature.energy < 100) {
      creature.energy += 30; // Sleep restores energy
    }
    
    // Health regeneration
    if (creature.health < 100 && creature.energy > 50) {
      creature.health += 10;
    }
    
    // Memory consolidation (trait learning)
    if (creature.experience > 0) {
      creature.traits.intelligence += creature.experience * 0.01;
      creature.experience = 0; // Consolidated during sleep
    }
  }
  
  // 2. Reproduction happens at night (when safe/rested)
  if (cycle % 10 === 0) { // Every 10 cycles (5 days)
    attemptReproduction(state);
  }
  
  // 3. Predation reduced (both predators and prey rest)
  // 4. Environmental effects
  state.temperature = calculateNightTemp(state.planet);
  
  return state;
}
```

**Night = RECOVERY**

---

## The Cycle Implementation

```typescript
export function computeCycle(
  cycle: number,
  prevState: WorldState,
  seed: string
): WorldState {
  const isDay = cycle % 2 === 0; // Even = day, odd = night
  
  let state = { ...prevState, cycle };
  
  if (isDay) {
    state = dayPhase(state, cycle);
    state.events.push({ cycle, type: 'DAY_START' });
  } else {
    state = nightPhase(state, cycle);
    state.events.push({ cycle, type: 'NIGHT_START' });
  }
  
  // Check if generation boundary (happens regardless of day/night)
  if (shouldAdvanceGeneration(cycle, state.generation)) {
    state = advanceGeneration(state);
  }
  
  return state;
}
```

---

## Why This Matters

### 1. Biological Realism

**Creatures can't be active 24/7:**
- They need rest to recover energy
- They need sleep to consolidate learning
- They need darkness to reproduce safely

**Just like humans:**
- Work during day
- Sleep during night
- Can't function without rest

### 2. Resource Management

**Day/night creates natural pacing:**
- Can't consume resources continuously
- Must balance activity with recovery
- Energy becomes a constraint

**Without night:**
- Creatures would consume endlessly
- No recovery mechanism
- Unrealistic depletion rates

### 3. Social Dynamics

**Day = Social interactions**
- Pack coordination
- Territorial disputes
- Tribal meetings
- Building construction

**Night = Individual rest**
- Reduced social activity
- Recovery phase
- Reproduction
- Consolidation

### 4. Predator/Prey Dynamics (Future)

**Day = Visibility**
- Predators hunt
- Prey hide
- High danger

**Night = Darkness**
- Both rest
- Lower activity
- Safe reproduction

---

## The Rhythm Over Time

```
Cycle 1 (Day):    Forage, consume 50 units, energy spent
Cycle 2 (Night):  Rest, recover energy, reproduce
Cycle 3 (Day):    Forage, consume 50 units, energy spent
Cycle 4 (Night):  Rest, recover energy
...
Cycle 99 (Day):   Forage, consume 50 units
Cycle 100 (Night): Rest, GENERATION ADVANCES during sleep
Cycle 101 (Day):  Wake with evolved traits
```

**Evolution happens during sleep (night, generation boundary).**

**Just like memory consolidation in humans.**

---

## CLI Output

```bash
$ ebb play

Gen 0 initialized...

Cycle 1 (Day):
☀️  Creatures active (3 alive)
→ Foraged 15 units of soil
→ Energy: 60 → 45 (activity cost)

Cycle 2 (Night):
🌙 Creatures resting
→ Energy recovered: 45 → 75
→ 1 creature reproduced

Cycle 3 (Day):
☀️  Creatures active (4 alive)
→ Foraged 20 units of soil
→ Excavation work: +2m depth
→ Energy: 75 → 50

Cycle 4 (Night):
🌙 Creatures resting
→ Energy recovered: 50 → 80
→ Traits consolidated

...

Cycle 100 (Night):
🌙 Creatures resting
⚡ GENERATION ADVANCED (during sleep)
→ Creatures evolved while sleeping
→ Excavation trait: 0.15 → 0.23

Cycle 101 (Day):
☀️  Creatures wake with new capabilities
→ Can now reach 23m depth (was 15m)
```

**The rhythm is visible. Day/night matters.**

---

## State Structure

```typescript
interface WorldState {
  cycle: number;
  isDay: boolean;           // Current phase
  generation: number;
  
  creatures: Array<{
    id: string;
    energy: number;         // 0-100 (depletes during day, recovers at night)
    health: number;         // 0-100
    experience: number;     // Accumulated during day, consolidated at night
    traits: Traits;
    sleeping: boolean;      // True at night, false during day
  }>;
  
  dayNightCycle: {
    currentPhase: 'day' | 'night';
    temperature: number;    // Higher during day
    visibility: number;     // Higher during day
    activityLevel: number;  // Higher during day
  };
}
```

---

## Energy as Resource

```typescript
// Day: Spend energy
if (isDay && creature.energy > 20) {
  // Can forage
  forageFood(creature, state);
  creature.energy -= 10;
  
  // Can work
  if (creature.energy > 30) {
    excavate(creature, state);
    creature.energy -= 15;
  }
}

// Night: Recover energy
if (!isDay && creature.energy < 100) {
  creature.energy = Math.min(100, creature.energy + 30);
}

// Starvation
if (creature.energy <= 0) {
  creature.health -= 10;
  if (creature.health <= 0) {
    // Death
  }
}
```

**Energy forces the day/night rhythm.**

**Can't work without energy.**

**Can't recover energy without night.**

---

## The Biological Constraint

**Humans can't operate 24/7:**
- Need ~8 hours sleep per 24 hours
- ~33% of time is recovery
- Circadian rhythm is BIOLOGICAL

**Creatures can't operate continuously:**
- Need 1 night cycle per 2 cycles
- 50% of time is recovery
- Day/night rhythm is BIOLOGICAL

**This isn't a game mechanic - it's LIFE.**

---

## Generations During Sleep

**Why evolution happens at night:**

1. **Biological:** Trait changes happen during rest (like DNA repair)
2. **Safety:** Can't evolve while active (too vulnerable)
3. **Consolidation:** Experience accumulated during day → traits during night
4. **Natural:** Humans consolidate memory during sleep, creatures consolidate traits

**The generation boundary happens during a night cycle:**

```
Cycle 99 (Day):   Final activities before evolution
Cycle 100 (Night): Sleep → Evolution → Wake transformed
Cycle 101 (Day):  First day with new traits
```

**You go to sleep as one thing, wake up as another.**

---

## Summary

**The cycle = Circadian rhythm**

**Day = Activity, consumption, energy expenditure**

**Night = Rest, recovery, reproduction, consolidation**

**Evolution happens during sleep (generation boundaries)**

**Humans exist synchronized to day/night.**

**Creatures exist synchronized to day/night.**

**The cycle isn't arbitrary - it's BIOLOGICAL.**

**You can't escape the rhythm.**

**The clock is your heartbeat.**
