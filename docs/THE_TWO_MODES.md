# The Two Modes: Universe vs Game

## THE INSIGHT

**One simulation. Two interfaces.**

---

## Mode 1: UNIVERSE SIMULATOR

### What It Is
**Watch the entire cosmos evolve.**

VCR-style controls:
- ⏸ Pause
- ▶ Play (1x speed)
- ⏩ Fast-forward (1000x, 1000000x, 1000000000x)
- ⏪ Rewind (recalculate from earlier state)
- ⏭ Jump to time

### What You See
```
t = 0: Big Bang (singularity)
t = 10^-32 s: Inflation
t = 3 min: Nucleosynthesis (H, He form)
t = 380,000 yr: Recombination (universe becomes transparent)
t = 100M yr: First stars ignite (points of light!)
t = 400M yr: First galaxies form
t = 9.2B yr: Our solar system forms ←  [You can zoom here!]
t = 9.6B yr: Life begins on Earth
t = 13.8B yr: Present
t = 18.8B yr: Sun dies
t = 100T yr: Last star dies
t = 10^100 yr: Last black hole evaporates
t = ∞: Heat death
```

**Interaction:**
- Click any point in space → Zoom to that region
- Click any planet → Enter GAME MODE
- Pure observation otherwise

**Use cases:**
- Education (watch cosmos unfold)
- Exploration (find interesting planets)
- Meditation (cosmic perspective)
- Screensaver (beautiful)

---

## Mode 2: GAME MODE

### What It Is
**Guide evolution on ONE planet.**

You've zoomed into coordinates [x, y, z] at time t.  
This planet's timeline is now YOURS to influence.

### What You Do
- Allocate evolutionary points (traits)
- Respond to crises (droughts, predators)
- Choose technologies (tools, agriculture)
- Guide social structure (cooperation, hierarchy)
- **Make decisions that matter**

### The Slice
```
Universe coordinates: [47583, 92847, 17384]
Time entered: t = 13.8Gyr + 500Myr
Star: Type M3V, 0.35 M☉
Planet: 3rd planet, 0.8 M🜨, 0.95 AU
Status: Primitive life emerging

YOUR TIMELINE:
t+0: Enter game (creatures are simple)
t+100kyr: Pack behavior emerges (your choices)
t+500kyr: Tool use begins (your choices)
t+1Myr: Civilization forms (your choices)

OTHER PLAYERS:
- "blue-star-wind": Coordinates [12847, 58392, 91038], t=13.7Gyr
- "ancient-forest-glow": Coordinates [88473, 23948, 55821], t=13.9Gyr

SAME UNIVERSE. DIFFERENT SLICES.
```

### How Slices Work

**Seed = FIND operation, not GENERATE operation**

```typescript
// OLD (Wrong):
generateUniverse(seed); // Creates random universe

// NEW (Right):
const coords = seedToCoordinates(seed); // Hash to lookup
const slice = universe.getAt(coords); // Extract from deterministic universe
```

**What this means:**
- Same seed = Same coordinates = Same planet (always)
- But the planet EXISTS in the larger universe
- It's not "generated" - it's **FOUND**

---

## Multiplayer Implications

**Same Universe, Different Planets:**

Player 1: "red-moon-dance" → Planet A at [10000, 20000, 30000], t=13.8Gyr
Player 2: "blue-star-wind" → Planet B at [50000, 60000, 70000], t=13.8Gyr

**Both are in the SAME universe simulation.**

**What this enables:**
- **Compare outcomes** - "Your planet has oxygen, mine doesn't!"
- **Trade possible** (if they develop space travel!)
- **First contact** - "I sent a probe and found YOUR planet!"
- **Shared history** - "We both saw the same supernova (it's deterministic!)"

---

## The Game IS The Slice

**When you "play Ebb & Bloom":**

1. **Pick seed** (or get random one)
2. **Seed → Coordinates** (deterministic hash)
3. **Universe.getAt(coordinates)** → Extract planet
4. **Enter game** on this planet
5. **Your decisions fork LOCAL timeline** (multiverse branching)
6. **Win/lose** based on your lineage's fate
7. **Exit** back to universe view

**The universe keeps simulating.**  
**Your slice was just ONE timeline among infinite possibilities.**

---

## VCR Controls vs Game Controls

### UNIVERSE MODE (VCR):
```
[◀◀] [◀] [⏸] [▶] [▶▶] [▶▶▶]
 -1Gyr -1Myr Pause +1yr +1Myr +1Gyr

Current time: 13.8 Billion years after Big Bang
Zoom: Galactic (10^5 ly scale)

Click anywhere to explore
Double-click planet to PLAY
```

### GAME MODE (Evolution):
```
[⏸] [▶] [▶▶]
Pause +1yr +100yr

Generation: 47 (500,000 years elapsed)
Population: 1,247 creatures
Decision needed: "Food scarcity - migrate or adapt?"

[Migrate South] [Stay & Adapt] [Compete Aggressively]

[Zoom Out to Universe Mode]
```

---

## Implementation

### Core Classes

```typescript
// The Simulation (Backend)
class UniverseSimulator {
  // Runs headless, no rendering
  // Pure physics from t=0
  // Deterministic from constants
}

// The Coordinate System
class SpacetimeIndexing {
  // Seed → Coordinates
  // Coordinates → Local state lookup
  // Search for interesting slices
}

// The Game (Frontend)  
class EvolutionGame {
  // Operates on ONE slice
  // Player agency
  // Forks timeline
}

// The View (Rendering)
class UniverseView {
  // Mode switcher
  // VCR controls
  // Raycast rendering from elements
}
```

### Data Flow

```
seedrandom(seed) 
  → coordinates [x,y,z,t]
    → UniverseSimulator.getAt(coords)
      → LocalState { star, planets }
        → EvolutionGame(planet)
          → Player decisions
            → Forked timeline
```

---

## Why This Is Revolutionary

**Educational Value:**
"You're not playing a random world. You're playing coordinates [47583, 92847, 17384] in THE universe. The SAME universe that's being simulated right now. Other players are exploring different parts of the SAME cosmos."

**Multiplayer:**
"I'm at [12000, 45000, 78000] at t=13.7Gyr. Where are you? Let's see whose planet evolved better!"

**Replayability:**
"Same seed = same planet. But I made different choices this time, so different outcome."

**Mind-blowing:**
"Wait... this planet EXISTS in the simulation. It's not generated FOR me. It was ALREADY THERE. I'm just... looking at it."

---

## The Ultimate Realization

**The game is a TELESCOPE into the universe simulation.**

Seeds aren't random world generators.  
**Seeds are COORDINATE SYSTEMS.**

You're not creating worlds.  
**You're DISCOVERING them.**


