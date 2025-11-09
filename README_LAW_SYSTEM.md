# README: Law-Based Universe Architecture

## 🌌 A Deterministic Universe from First Principles

This game generates **entire scientifically consistent universes** from a single seed using mathematical laws.

**No AI content generation. No hardcoded data. Just physics, chemistry, and biology.**

---

## Quick Start

```typescript
import { generateUniverse } from './src/generation/UniverseGenerator';

// One seed → Complete universe
const universe = generateUniverse("azure mountain wind");

console.log(universe.star);        // G-type star, 1.05 solar masses
console.log(universe.planets);      // 5 planets, 1 habitable
console.log(universe.habitablePlanet); // Earth-like world with O₂/N₂ atmosphere
```

**Same seed = same universe. Always. Deterministic.**

---

## The Core Idea

### Traditional Game Design
```
Designer creates content → Player experiences it → Game ends
```

### Our Approach
```
Player provides seed → Laws extrapolate universe → Infinite unique worlds
```

---

## The Laws

**Everything emerges from 6 types of laws:**

### 1. **Physics** (`src/laws/physics.ts`)
- Newton's laws of motion
- Universal gravitation: F = Gm₁m₂/r²
- Orbital mechanics (Kepler's laws)
- Thermodynamics (energy conservation, blackbody radiation)
- Fluid dynamics (atmospheric retention)

### 2. **Stellar** (`src/laws/stellar.ts`)
- Initial Mass Function (stellar formation)
- Mass-luminosity relation: L ∝ M^3.5
- Habitable zone calculation
- Condensation sequence (frost line, planet types)

### 3. **Biology** (`src/laws/biology.ts`)
- Kleiber's Law: Metabolism ∝ M^0.75
- Allometric scaling (heart rate, lifespan)
- Square-cube law (structural limits)
- Respiratory and thermal constraints

### 4. **Ecology** (`src/laws/ecology.ts`)
- Carrying capacity
- Lotka-Volterra (predator-prey dynamics)
- Trophic efficiency (10% rule)
- Home range scaling

### 5. **Taxonomy** (`src/laws/taxonomy.ts`)
- Linnaean classification
- Binomial nomenclature
- Systematic naming from traits

### 6. **Social** (`src/laws/social.ts`)
- Service's typology (Band/Tribe/Chiefdom/State)
- Dunbar's number (~150 relationships)
- Hierarchy formation
- Division of labor

---

## What This Enables

### Current (Gen0-5)
- **Gen0**: Planetary formation
- **Gen1**: Life emergence
- **Gen2**: Social creatures
- **Gen3**: Tools & structures
- **Gen4**: Civilization
- **Gen5**: Culture

### Future (Gen6+) - NOW POSSIBLE!
- **Gen6**: **Scientific Discovery** - Creatures discover the laws!
- **Gen7**: **Space Age** - Design rockets, calculate orbits
- **Gen8**: **Interplanetary** - Colonize moons, terraform planets
- **Gen9**: **Stellar Engineering** - Dyson swarms, star lifting
- **Gen10**: **Interstellar** - Generation ships to nearby stars
- **Gen11+**: **Transcendence** - Digital consciousness, post-biological

---

## The Periodic Table

**Real chemistry from first principles.**

Every element has:
- Physical properties (density, melting/boiling points)
- Chemical properties (electronegativity, bond energies)
- Cosmic abundance (from stellar nucleosynthesis)

This determines:
- What planets are made of
- What atmospheres can form
- What life chemistry is possible
- What tools can be crafted

See: `src/tables/periodic-table.ts`

---

## Example: "azure mountain wind"

**Input**: Three words

**Output**:
```
Star: G-type, 1.05 M☉, 1.2 L☉, 5850 K
Planets:
  1. Rocky, 0.4 AU (too hot)
  2. Rocky, 1.2 AU (HABITABLE! 288K, O₂/N₂ atmosphere)
  3. Ice giant, 3.5 AU
  4. Gas giant, 8 AU

Life on Planet 2:
  - 15 species from ecological niches
  - "Xerocursor mesocarnivoruus" (Desert Runner)
  - Mass: 45 kg
  - Metabolism: 110 W (from Kleiber's Law)
  - Population: 800 (from carrying capacity)
  
Society:
  - Governance: Chiefdom (from Service typology)
  - Surplus: 30%
  - Hierarchy: Chief + nobles + commoners
```

**All from seed + laws. Zero AI calls.**

---

## File Structure

```
packages/game/src/
├── laws/
│   ├── physics.ts          # Motion, gravity, thermodynamics
│   ├── stellar.ts          # Star evolution, habitable zones
│   ├── biology.ts          # Allometric scaling, constraints
│   ├── ecology.ts          # Populations, predator-prey
│   ├── social.ts           # Governance, hierarchy
│   ├── taxonomy.ts         # Classification, naming
│   └── index.ts            # Unified export
│
├── tables/
│   ├── physics-constants.ts    # G, c, k_B, σ
│   ├── periodic-table.ts       # All 92 elements
│   ├── linguistic-roots.ts     # Latin/Greek naming
│   └── index.ts
│
└── generation/
    └── UniverseGenerator.ts    # Main engine
```

---

## Documentation

**Start here:**
1. `docs/LAW_BASED_ARCHITECTURE.md` - Complete overview
2. `docs/LAW_IMPLEMENTATION_SUMMARY.md` - Technical details
3. `src/laws/physics.ts` - Simplest laws to understand
4. `src/generation/UniverseGenerator.ts` - How it all comes together

---

## Why This Matters

### Educational
- Teaches real physics (Kepler's laws, Newton's laws)
- Teaches real chemistry (periodic table, bonding)
- Teaches real biology (allometric scaling)
- Teaches real sociology (Service's typology)

### Scientific
- All relationships are real scientific equations
- No fake physics or approximations
- Based on 300+ years of scientific research

### Infinite
- Every seed generates a unique universe
- Trillions of possible worlds
- Never plays the same twice

### Deterministic
- Same seed = same universe
- Essential for multiplayer
- Essential for speedruns
- Essential for testing

### Moddable
- Change constants → different physics
- Change laws → different universe rules
- Educational tool for "what if" scenarios

---

## The Vision

**A game that teaches science by letting you live in a scientifically accurate universe.**

From atoms to galaxies.  
From prokaryotes to post-biological intelligence.  
From stone tools to Dyson spheres.  

All emergent. All deterministic. All from one seed.

---

## Get Started

```bash
# Install dependencies
pnpm install

# Generate a universe
pnpm --filter game dev

# Then in the game:
# Enter any seed → Watch universe unfold
```

---

## Learn More

- Read the laws: `src/laws/*.ts`
- Read the docs: `docs/LAW_BASED_ARCHITECTURE.md`
- Try different seeds and see what emerges

**This is not a game with content. This is a universe with laws.**

---

*"Give me matter and motion, and I will construct the universe."* - René Descartes

*We did.*
