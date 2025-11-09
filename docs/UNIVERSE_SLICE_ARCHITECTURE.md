# Universe Slice Architecture

## THE BREAKTHROUGH

**There are TWO systems:**

1. **Universe Simulator** - Deterministic, no seeds, Big Bang → Heat Death
2. **Game** - Slices of universe, seeds as coordinates, player agency

---

## The Universe Simulator (The Foundation)

### What It Is

**ONE universe. NO seeds. Pure physics.**

```typescript
class UniverseSimulator {
  // Start at t=0 (Big Bang)
  // Initial conditions = Physical constants (G, c, h, etc.)
  // NO randomness - pure deterministic physics
  
  constructor() {
    this.t = 0; // Big Bang
    this.state = INITIAL_CONDITIONS; // From physics constants
  }
  
  // Advance time
  step(dt: number) {
    // Apply ALL laws
    this.state = LAWS.physics.apply(this.state, dt);
    this.state = LAWS.stellar.apply(this.state, dt);
    this.state = LAWS.planetary.apply(this.state, dt);
    // etc.
    
    this.t += dt;
  }
  
  // Fast-forward to any time
  advanceTo(targetTime: number) {
    while (this.t < targetTime) {
      this.step(this.intelligentTimeStep());
    }
  }
  
  // The entire universe at time t
  getStateAt(t: number, spatialCoordinates?: [x, y, z]) {
    // Deterministic - same t always gives same state
    return this.calculateState(t, spatialCoordinates);
  }
}
```

**Key: This is DETERMINISTIC. No RNG. Just laws.**

The universe unfolds the SAME WAY every time because **physics is physics**.

---

## Seeds as Spacetime Coordinates

**Seeds DON'T generate universes.**  
**Seeds LOCATE slices OF the universe.**

```typescript
/**
 * Seed = Spacetime coordinates
 * 
 * "red-moon-dance" → WHERE and WHEN to look in the universe
 */
interface UniverseSlice {
  // Spatial coordinates (which region of space?)
  galaxy: [number, number, number]; // Galactic coordinates
  star: number; // Which star in this region?
  planet: number; // Which planet around this star?
  
  // Temporal coordinate (when to start observing?)
  t_start: number; // Seconds since Big Bang
  
  // Derived from seed via hash function
  seed: string; // "red-moon-dance"
}

function seedToCoordinates(seed: string): UniverseSlice {
  const rng = seedrandom(seed); // Hash function, not RNG!
  
  return {
    // These are LOOKUP COORDINATES, not random generation
    galaxy: [
      rng() * 1e5, // x coordinate in universe (light-years)
      rng() * 1e5, // y
      rng() * 1e5, // z
    ],
    star: Math.floor(rng() * 1e11), // Which of ~100 billion stars?
    planet: Math.floor(rng() * 10), // Which planet?
    t_start: 13.8e9 * 365.25 * 86400 - rng() * 1e9 * 365.25 * 86400, // Start time
    seed,
  };
}
```

**The Game:**
```typescript
// Player picks seed
const seed = "red-moon-dance";

// Seed → Coordinates
const slice = seedToCoordinates(seed);

// Look up what EXISTS at those coordinates
const universe = new UniverseSimulator();
universe.advanceTo(slice.t_start);
const localState = universe.getStateAt(slice.t_start, slice.galaxy);

// Extract THIS planet's state
const star = localState.stars[slice.star];
const planet = star.planets[slice.planet];

// NOW player can guide evolution on THIS planet
const game = new EvolutionGame(planet, slice.t_start);
```

---

## The Two Modes

### UNIVERSE MODE (Spectator)

**VCR Controls:**
- Play/Pause
- Fast-forward (10^3x, 10^6x, 10^9x)
- Rewind (recalculate from earlier time)
- Jump to time

**What You See:**
- Entire universe evolving
- Galaxies forming
- Stars being born
- Planets accreting
- Life emerging (green dots)
- Civilizations rising (lights on planets)

**No player agency. Pure observation.**

**Use case:** 
- Educational tool
- Screensaver mode
- "What does the universe do?"

### GAME MODE (Actor)

**Player Agency:**
- Choose slice (seed)
- Guide evolution on ONE planet
- Make decisions (tool choice, social structure, etc.)
- Compete with AI-controlled lineages
- Win/lose conditions

**What You See:**
- Zoomed into YOUR planet
- YOUR creatures highlighted
- Decisions you make matter
- Time flows at YOUR pace

**Use case:**
- Actual gameplay
- Strategy/competition
- Creative expression
- "Shape this world"

---

## How Seeds Work (The Insight)

### Old Way (WRONG)
```typescript
// Seed generates random universe
const universe = generateUniverse(seed); // Different each seed
```

**Problem:** Each seed is ISOLATED. No connection. Arbitrary.

### New Way (RIGHT)
```typescript
// Universe is FIXED and deterministic
const universe = new UniverseSimulator(); // Always same

// Seed finds LOCATION in universe
const slice = findSlice(seed);

// Extract state at that location
const planet = universe.getAt(slice.galaxy, slice.star, slice.planet, slice.t_start);
```

**Advantage:** 
- **Same universe** for all players
- **Multiplayer possible** (different planets, same universe)
- **Deterministic** (seed always finds same slice)
- **Meaningful** (you're exploring REAL coordinates, not random generation)

---

## Implementation

### Step 1: Deterministic Universe (No Seeds)

```typescript
// Initial conditions from PHYSICS CONSTANTS ONLY
const INITIAL_CONDITIONS = {
  // Big Bang parameters (from observation)
  density: /* from CMB data */,
  temperature: /* from nucleosynthesis */,
  expansionRate: /* from Hubble constant */,
  
  // Quantum fluctuations (deterministic pattern, not random!)
  fluctuationSpectrum: /* from inflation theory */,
};

// Universe unfolds deterministically
const universe = simulateFrom(INITIAL_CONDITIONS, t_target);
```

### Step 2: Spatial Indexing

```typescript
/**
 * Find star at coordinates
 * 
 * Universe has ~10^22 stars total
 * Indexed by spatial position
 */
function findStar(coords: [x, y, z]): Star {
  // Deterministic placement from structure formation
  const galaxyDensity = structureFormation(coords, t_current);
  const starDensity = stellarDensity(coords, galaxyDensity);
  
  // Is there a star at these exact coordinates?
  // Deterministic check (not random!)
  if (starDensity > threshold(coords)) {
    return generateStar(coords); // Star properties from position
  }
  
  return null; // Empty space
}
```

### Step 3: Seed as Query

```typescript
/**
 * Seed = Database query
 * "Find me an interesting planet"
 */
function findInterestingSlice(seed: string): UniverseSlice {
  const hash = hashSeed(seed); // Deterministic hash
  
  // Search universe for interesting conditions
  let coords = hashToCoords(hash);
  
  while (!isInteresting(coords)) {
    coords = nextCoords(coords); // Deterministic iteration
  }
  
  return {
    coords,
    t_start: optimalStartTime(coords),
  };
}

function isInteresting(coords): boolean {
  const state = universe.getAt(coords);
  
  // Interesting = has life-capable planet
  return state.star && 
         state.habitablePlanets.length > 0 &&
         state.biosphere !== null;
}
```

---

## The Game Loop

### Universe Mode
```typescript
// Watch universe evolve
while (true) {
  universe.step(playerSpeed); // 1x, 100x, 1000000x
  render(universe.state); // Render everything
  
  if (player.clicksPlanet) {
    // Zoom into slice
    enterGameMode(clickedPlanet);
  }
}
```

### Game Mode
```typescript
// Play within slice
const slice = seedToSlice("red-moon-dance");
const planet = universe.getAt(slice.coords, slice.t_start);

while (true) {
  // Player makes decisions
  const decision = await player.decide();
  
  // Apply to LOCAL timeline (forks from universe)
  planet.applyDecision(decision);
  planet.step(deltaTime);
  
  render(planet);
  
  if (player.clicksZoomOut) {
    // Return to universe view
    enterUniverseMode();
  }
}
```

---

## Why This Is Perfect

✅ **Universe is ONE thing** - deterministic, calculable, shareable
✅ **Seeds are coordinates** - meaningful, not arbitrary
✅ **Multiplayer ready** - same universe, different slices
✅ **Educational** - can explore "what if you were born HERE instead?"
✅ **Scalable** - universe simulator can run headless, game connects to it
✅ **Moddable** - change physics constants = different universe

---

## The Ultimate Vision

**Universe Simulator (Backend):**
- Runs headless
- Simulates ALL of spacetime
- Deterministic from Big Bang
- Indexable by coordinates
- **The source of truth**

**Game Client (Frontend):**
- Connects to universe
- Requests slice via seed
- Gets planet state
- Renders and allows interaction
- **View into the larger whole**

**Players realize:**
"Holy shit, I'm not playing a random world. I'm playing coordinates [47583, 92847, 17384] at t=13.8Gyr+500Myr. This EXISTS in the simulation. Other players are at different coordinates in the SAME universe."

---

## Implementation Priority

1. ✅ **Laws library** (DONE - 20 files, 5,500+ lines)
2. 🔨 **Universe simulator** (deterministic, no seeds)
3. 🔨 **Coordinate system** (seed → spacetime position)
4. 🔨 **Slice extractor** (get planet state at coordinates)
5. 🔨 **Game mode** (player agency within slice)
6. 🔨 **Universe mode** (VCR controls, full cosmos view)

**This is not a game with physics.**
**This is the universe, with a game interface.**


