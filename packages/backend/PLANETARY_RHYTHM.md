# PLANETS DICTATE RHYTHM

## Gen 0 Defines the Clock Speed

When the planet is generated, it defines:

```typescript
interface PlanetaryProperties {
  radius: number;           // 6371 km (Earth-like)
  mass: number;             // Affects gravity
  rotationPeriod: number;   // HOW FAST DOES IT SPIN?
  orbitalPeriod: number;    // HOW LONG IS A YEAR?
  axialTilt: number;        // Affects seasons
  gravity: number;          // Affects creature evolution
}
```

**The `rotationPeriod` IS THE CYCLE LENGTH.**

---

## Different Planets = Different Rhythms

### Earth-Like Planet
```typescript
{
  rotationPeriod: 24,  // hours
  // 1 cycle = 24 hours
  // Fast evolution: many cycles per year
}
```

### Slow Spinner (Venus-like)
```typescript
{
  rotationPeriod: 5832,  // hours (243 Earth days!)
  // 1 cycle = 243 days
  // Slow evolution: few cycles per year
  // Creatures must survive LONG days and LONG nights
}
```

### Fast Spinner (Jupiter-like)
```typescript
{
  rotationPeriod: 10,  // hours
  // 1 cycle = 10 hours
  // Rapid evolution: many cycles per day
  // Creatures need rapid metabolism
}
```

---

## The Rhythm Constraint

**The planet's rotation period determines:**

1. **How often creatures must eat**
   - Fast planet = frequent meals
   - Slow planet = long fasting periods

2. **How long they can rest**
   - Fast planet = short sleep cycles
   - Slow planet = hibernation-like rest

3. **Evolutionary pressure**
   - Fast rotation = adaptable, quick metabolism
   - Slow rotation = endurance, energy storage

4. **Social dynamics**
   - Fast cycles = rapid interactions
   - Slow cycles = long-term relationships

---

## Gen 0: AI Generates Rotation Period

```typescript
// src/gen0/planetary-generation.ts

async function generatePlanetaryCore(seed: string): Promise<PlanetaryCore> {
  const prompt = `
    Generate a planet from seed: "${seed}"
    
    Include:
    - Radius (km)
    - Mass (kg)
    - Rotation period (hours) - THIS DETERMINES THE RHYTHM OF ALL LIFE
    - Orbital period (hours)
    - Axial tilt (degrees)
    - Gravity (m/s²)
    
    The rotation period should be realistic but varied:
    - Fast spinners: 10-15 hours (harsh, rapid evolution)
    - Normal spinners: 20-30 hours (balanced)
    - Slow spinners: 100-1000 hours (extreme endurance required)
  `;
  
  const response = await openai.generateObject({
    model: 'gpt-4',
    prompt,
    schema: PlanetaryCoreSchema,
  });
  
  return response.object;
}
```

**The AI decides how fast the planet spins.**

**That decision affects EVERYTHING.**

---

## Cycle Implementation

```typescript
export function computeCycle(
  cycle: number,
  prevState: WorldState,
  seed: string
): WorldState {
  const planet = prevState.planet;
  const isDay = cycle % 2 === 0;
  
  // Cycle duration is defined by planet
  const cycleDuration = planet.rotationPeriod; // hours
  
  // Different planets = different energy dynamics
  const energyExpenditureRate = calculateEnergyRate(planet);
  const energyRecoveryRate = calculateRecoveryRate(planet);
  
  let state = { ...prevState, cycle };
  
  if (isDay) {
    // Day duration = half rotation period
    state = dayPhase(state, cycleDuration / 2, energyExpenditureRate);
  } else {
    // Night duration = half rotation period
    state = nightPhase(state, cycleDuration / 2, energyRecoveryRate);
  }
  
  return state;
}
```

---

## Energy Dynamics by Planet Type

### Fast Planet (10 hour rotation)

```typescript
// Creatures need to eat frequently
const dailyConsumption = 10; // units per cycle
const energyRecovery = 20;   // fast recovery during short nights

// 1 cycle = 10 hours (5 hour day, 5 hour night)
// Must eat every 10 hours
// Rapid metabolism
```

**Traits favored:**
- High metabolism
- Quick energy conversion
- Adaptability
- Speed over strength

### Normal Planet (24 hour rotation)

```typescript
// Balanced consumption
const dailyConsumption = 5;  // units per cycle
const energyRecovery = 30;   // normal recovery

// 1 cycle = 24 hours (12 hour day, 12 hour night)
// Must eat every 24 hours
// Balanced metabolism
```

**Traits favored:**
- Balanced traits
- Moderate metabolism
- Versatility

### Slow Planet (243 hour rotation)

```typescript
// Extreme endurance required
const dailyConsumption = 1;   // units per cycle (slow metabolism)
const energyRecovery = 50;    // deep recovery during long nights

// 1 cycle = 243 hours (~10 Earth days!)
// Must survive 121 hours of day, 121 hours of night
// Very slow metabolism
```

**Traits favored:**
- Extreme endurance
- Energy storage (fat reserves)
- Temperature resistance
- Patience

---

## The Starvation Clock

```typescript
function checkStarvation(creature: Creature, planet: PlanetaryProperties): boolean {
  const hoursSinceLastMeal = (currentCycle - creature.lastMealCycle) * planet.rotationPeriod;
  const maxFastingPeriod = creature.traits.endurance * planet.rotationPeriod * 2;
  
  return hoursSinceLastMeal > maxFastingPeriod;
}
```

**On a fast planet:**
- Rotation = 10 hours
- Max fasting = 20 hours (2 cycles)
- Must eat every 2 cycles or die

**On a slow planet:**
- Rotation = 243 hours
- Max fasting = 486 hours (2 cycles)
- Can survive for ~20 Earth days without food

**The planet's spin = the starvation clock.**

---

## Temperature Extremes

```typescript
function calculateTemperature(planet: PlanetaryProperties, isDay: boolean, cycle: number): number {
  const basTemp = 20; // °C
  const amplitude = 50; // °C variation
  
  // Longer days = more extreme temperatures
  const dayLength = planet.rotationPeriod / 2;
  const temperatureExtreme = amplitude * (dayLength / 12); // normalized to Earth
  
  if (isDay) {
    return basTemp + temperatureExtreme; // Can get VERY hot on slow planets
  } else {
    return basTemp - temperatureExtreme; // Can get VERY cold on slow planets
  }
}
```

**Fast planet (10 hour rotation):**
- Day: 20°C + 41.7°C = 61.7°C (hot but survivable)
- Night: 20°C - 41.7°C = -21.7°C (cold but survivable)

**Slow planet (243 hour rotation):**
- Day: 20°C + 1012.5°C = 1032.5°C (DEADLY)
- Night: 20°C - 1012.5°C = -992.5°C (DEADLY)

**Slow planets REQUIRE shelter/adaptation to survive day/night extremes.**

---

## Evolution Pressure by Rotation

### Fast Rotation Pressure
- Need rapid energy turnover
- Need quick decision-making
- Need adaptability
- Evolution favors: intelligence, speed, metabolism

### Slow Rotation Pressure
- Need energy storage
- Need extreme temperature resistance
- Need patience
- Evolution favors: endurance, excavation (to hide), social cooperation

---

## Generations Scale with Planet

```typescript
function calculateGenerationLength(planet: PlanetaryProperties, generation: number): number {
  // Base cycles per generation
  const baseCycles = [100, 200, 500, 1000, 2000, 5000];
  
  // Scale by rotation period
  const scaleFactor = planet.rotationPeriod / 24; // normalized to Earth
  
  return Math.floor(baseCycles[generation] / scaleFactor);
}
```

**Fast planet:**
- Gen 1 = 100 / 0.42 = 238 cycles (but each cycle is 10 hours)
- Total time: 2380 hours = 99 Earth days

**Slow planet:**
- Gen 1 = 100 / 10.1 = 10 cycles (but each cycle is 243 hours)
- Total time: 2430 hours = 101 Earth days

**Different cycle counts, but similar REAL TIME progression.**

---

## The Core Question

**On a slow-spinning planet:**
- Can creatures evolve fast enough to build shelter before the 121-hour day kills them?
- Can they excavate deep enough to escape temperature extremes?
- Does religion emerge because the day is so long it feels eternal?

**On a fast-spinning planet:**
- Can creatures adapt quickly enough to the rapid day/night cycle?
- Does intelligence evolve faster due to rapid environmental changes?
- Do tools emerge earlier because rapid cycles create more pressure?

**The planet's rotation dictates the evolutionary strategy.**

---

## State Tracking

```typescript
interface WorldState {
  planet: {
    rotationPeriod: number;  // THE FUNDAMENTAL CLOCK
    orbitalPeriod: number;
    gravity: number;
  };
  
  cycle: number;              // Current cycle count
  realTimeElapsed: number;    // cycle * rotationPeriod (hours)
  generation: number;
  
  // Creatures adapt to planetary rhythm
  creatures: Array<{
    metabolismRate: number;   // Determined by rotation period
    energyStorage: number;    // Higher on slow planets
    lastMealCycle: number;    // Track starvation clock
  }>;
}
```

---

## Summary

**The planet's rotation period = the fundamental clock.**

**Fast planets:**
- Short cycles (10 hours)
- Rapid evolution
- High metabolism
- Quick interactions
- Intelligence pressure

**Slow planets:**
- Long cycles (243 hours)
- Slow evolution
- Energy storage
- Extreme survival
- Endurance pressure

**The planet dictates the rhythm.**

**Life adapts to the spin.**

**Or dies trying.**
