# Universal Timeline Architecture

## The Insight

**Gen0, Gen1, Gen2... are ARBITRARY GAME DESIGN.**

**Reality has ONE timeline: Big Bang → Heat Death**

Everything emerges continuously. No boundaries. Just time + laws.

---

## The Old Way (WRONG)

```
Gen0: Planet formation (2 minutes of gameplay)
Gen1: Life appears (click button)
Gen2: Social creatures (click button)
Gen3: Tools (click button)
...
```

**Problems:**
- Arbitrary boundaries (why is Gen2 "social"?)
- Can't simulate between generations
- Forces discrete steps in continuous processes
- Can't answer "what happens in year 500,000?"
- Yuka thinks in "generations" not REALITY

---

## The New Way (RIGHT)

### Organize by TIMESCALE, not "generations"

```typescript
interface UniversalTimeline {
  // Absolute time since Big Bang
  t_bigBang: 0,
  t_current: number, // seconds since Big Bang
  
  // Local time (since star formation)
  t_stellar: number, // Age of star system
  t_planetary: number, // Age of planet
  t_biosphere: number, // Time since life began
  t_civilization: number, // Time since first society
}
```

### Laws Organized by Timescale

```
src/laws/
├── cosmological/        # 10^-43 s - 10^18 s
│   ├── big-bang.ts      # Initial conditions
│   ├── inflation.ts     # Expansion
│   ├── nucleosynthesis.ts # Element formation
│   └── structure-formation.ts # Galaxies, clusters
│
├── stellar/             # 10^6 - 10^10 years
│   ├── star-formation.ts
│   ├── main-sequence.ts
│   ├── stellar-death.ts
│   └── nucleosynthesis.ts # Heavy element creation
│
├── planetary/           # 10^6 - 10^10 years  
│   ├── accretion.ts
│   ├── differentiation.ts
│   ├── atmosphere.ts
│   └── magnetosphere.ts
│
├── chemical/            # 10^6 - 10^9 years
│   ├── prebiotic.ts
│   ├── organic-synthesis.ts
│   └── abiogenesis.ts
│
├── biological/          # 10^3 - 10^9 years
│   ├── evolution.ts
│   ├── allometry.ts
│   ├── biomechanics.ts
│   └── ecology.ts
│
├── cognitive/           # 10^3 - 10^7 years
│   ├── brain-evolution.ts
│   ├── intelligence.ts
│   ├── learning.ts
│   └── culture.ts
│
├── social/              # 10^2 - 10^4 years
│   ├── band-formation.ts
│   ├── tribal-dynamics.ts
│   ├── state-formation.ts
│   └── economics.ts
│
└── technological/       # 10^1 - 10^3 years
    ├── stone-age.ts
    ├── agriculture.ts
    ├── industrial.ts
    └── space-age.ts
```

---

## How It Works

### No "Advance Generation" Button

**Old:** Click button → Gen1 → Gen2 → Gen3

**New:** Time flows continuously

```typescript
class UniverseSimulation {
  // Universal time (seconds since Big Bang)
  t: number = 13.8e9 * 365.25 * 86400; // Current age of universe
  
  // Local clocks
  stellarAge: number; // Since star formed
  planetAge: number; // Since planet solidified
  biosphereAge: number; // Since first life
  
  step(deltaTime_seconds: number) {
    this.t += deltaTime_seconds;
    this.stellarAge += deltaTime_seconds;
    this.planetAge += deltaTime_seconds;
    // etc.
    
    // Laws determine what SHOULD exist at this time
    const state = this.calculateCurrentState();
    
    return state;
  }
  
  calculateCurrentState() {
    // What exists NOW, given timeline position?
    
    // Has star formed yet?
    if (this.stellarAge < 0) return { star: null };
    
    // Star properties evolve continuously
    const star = STELLAR_LAWS.atAge(this.stellarAge);
    
    // Has planet solidified?
    if (this.planetAge < PLANETARY_LAWS.solidificationTime(star)) {
      return { star, planet: 'forming' };
    }
    
    const planet = PLANETARY_LAWS.atAge(this.planetAge, star);
    
    // Has life emerged?
    if (this.biosphereAge < 0) {
      // Check if conditions permit abiogenesis
      if (CHEMICAL_LAWS.canFormLife(planet)) {
        this.biosphereAge = 0; // LIFE BEGINS NOW
      }
    }
    
    // Life evolves continuously
    const biosphere = this.biosphereAge >= 0 
      ? BIOLOGICAL_LAWS.atAge(this.biosphereAge, planet)
      : null;
    
    // Society emerges when intelligence threshold reached
    const society = biosphere?.maxIntelligence > COGNITIVE_LAWS.societyThreshold
      ? SOCIAL_LAWS.atAge(biosphere.socialAge, biosphere)
      : null;
    
    return { star, planet, biosphere, society };
  }
}
```

---

## Anchoring to Big Bang → Big Crunch

**Even though we don't KNOW the ultimate fate:**

```typescript
/**
 * Universal Constants (ANCHORS)
 */
export const UNIVERSAL_TIMELINE = {
  // Proven
  t_bigBang: 0,
  t_now: 13.8e9 * 365.25 * 86400, // ~13.8 billion years in seconds
  
  // Milestones (observed)
  t_firstStars: 1e8 * 365.25 * 86400, // 100 million years
  t_solarSystemFormation: 9.2e9 * 365.25 * 86400, // 9.2 billion years after BB
  t_earthFormation: 9.25e9 * 365.25 * 86400,
  t_firstLife_earth: 9.6e9 * 365.25 * 86400, // ~3.8 billion years ago
  
  // Future (extrapolated)
  t_sunDeath: 18.8e9 * 365.25 * 86400, // ~5 billion years from now
  t_lastStar: 100e12 * 365.25 * 86400, // ~100 trillion years (red dwarfs)
  t_heatDeath: 10e100 * 365.25 * 86400, // Heat death (or Big Crunch)
} as const;
```

**This gives us:**
1. **Absolute reference frame** (time since Big Bang)
2. **Physical anchors** (star formation timescales are KNOWN)
3. **Predictive power** (can simulate to end of universe)

---

## What This Enables

### Yuka Can Ask Time-Based Questions

**Instead of:** "What happens in Gen3?"

**Now:** "What exists at t = 13.8B years + 500,000 years?"

Then calculate:
- Stellar age: 4.6B + 500k = 4.6005B years
- Star luminosity at that age: `STELLAR_LAWS.luminosityAtAge(4.6005e9)`
- Planet temperature: `PLANETARY_LAWS.surfaceTemp(starLuminosity, orbitalRadius)`
- Life complexity: `BIOLOGICAL_LAWS.diversityAfterTime(500000, planet)`
- Social structure: `SOCIAL_LAWS.governanceAtPopulation(population(t))`

**Everything from continuous TIME, not discrete GENERATIONS.**

---

## Refactoring Plan

### Phase 1: Reorganize Law Files (NOW)
```
src/laws/
├── 00-universal/        # Constants, Big Bang, cosmology
├── 01-stellar/          # Star formation → death  
├── 02-planetary/        # Planet formation → geology
├── 03-chemical/         # Molecules → organic chemistry
├── 04-biological/       # Life → evolution
├── 05-cognitive/        # Brain → intelligence
├── 06-social/           # Individuals → societies
└── 07-technological/    # Tools → civilization
```

**Numbers = TIMESCALE ORDER, not "generations"**

### Phase 2: Timeline Simulator (NEXT)
```typescript
class TimelineSimulator {
  // Set initial conditions (Big Bang)
  constructor(seed: string) {
    this.t = 0;
    this.seed = seed;
    this.rng = new EnhancedRNG(seed);
  }
  
  // Fast-forward to any time
  advanceTo(targetTime_seconds: number) {
    while (this.t < targetTime_seconds) {
      const dt = this.calculateOptimalTimeStep();
      this.step(dt);
    }
  }
  
  // Intelligent time-stepping
  calculateOptimalTimeStep(): number {
    // Fast when nothing happening (early universe)
    // Slow when things complex (civilization)
    
    if (this.currentComplexity < 0.1) return 1e9 * 365.25 * 86400; // Billion year steps
    if (this.currentComplexity < 0.5) return 1e6 * 365.25 * 86400; // Million year steps
    if (this.civilizationExists) return 365.25 * 86400; // Year steps
    if (this.activeConflict) return 86400; // Day steps
    
    return 1; // Second steps (for real-time)
  }
}
```

### Phase 3: Remove "Generations" Completely

**Old terminology:**
- "Advance Generation" button
- "Gen2 Pack Formation"
- "Gen3 Tool Discovery"

**New terminology:**
- "Time Controls" (speed up / slow down)
- "Social Complexity: Band" (determined by time + population)
- "Technology Level: Stone Age" (determined by time + intelligence)

**Everything emerges from TIME + LAWS, not clicking through levels.**

---

## The Big Bang to Big Crunch Framework

Even though we don't know if Big Crunch happens, it gives us:

**1. Clear Start:** t = 0 (Big Bang)
**2. Clear End:** t = ∞ or t_crunch (pick one)
**3. Everything between:** Calculable from laws

```typescript
/**
 * Ultimate Fate of Universe
 * 
 * We don't KNOW, but we can model both scenarios:
 */
export const UltimateFate = {
  /**
   * Scenario A: Heat Death
   * - Universe expands forever
   * - Last star dies at t ~ 10^14 years
   * - Black holes evaporate at t ~ 10^100 years
   * - Final state: Cold, dark, maximum entropy
   */
  heatDeath: {
    t_lastStar: 1e14 * YEAR,
    t_lastBlackHole: 1e100 * YEAR,
    t_maxEntropy: Infinity,
  },
  
  /**
   * Scenario B: Big Crunch
   * - Expansion reverses
   * - Universe collapses back
   * - All matter/energy reunites
   * - Time ends
   */
  bigCrunch: {
    t_maximumExpansion: 50e9 * YEAR, // Hypothetical
    t_recollapse: 100e9 * YEAR, // Hypothetical
    t_crunch: 100e9 * YEAR, // TIME ITSELF ENDS
  },
  
  // Choose one for gameplay
  selectedFate: 'heat-death', // or 'big-crunch'
};
```

**By anchoring to Big Bang → (Heat Death OR Big Crunch), we have:**
- Absolute time reference
- Ultimate simulation bounds
- Physical meaning for ALL timestamps

---

## Immediate Refactor

Let me reorganize the laws RIGHT NOW by timescale:

<function_calls>
<invoke name="run_terminal_cmd">
<parameter name="command">cd /Users/jbogaty/src/ebb-and-bloom/packages/game/src/laws && mkdir -p 00-universal 01-stellar 02-planetary 03-chemical 04-biological 05-cognitive 06-social 07-technological
