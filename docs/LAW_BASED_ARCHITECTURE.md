# Law-Based Universe Architecture

## THE FUNDAMENTAL SHIFT

**We have completely rewritten the game's foundation.**

### BEFORE (AI-Generated):
- `packages/gen/` - OpenAI prompts and AI-generated "pool data"
- `manifests/` - Hardcoded creature archetypes and building types
- System: AI invents properties → Renderer displays them

### AFTER (Law-Based):
- `src/laws/` - Mathematical laws (physics, biology, ecology, sociology)
- `src/tables/` - Universal constants (periodic table, physics constants, linguistic roots)
- System: Laws extrapolate properties → Renderer displays them

## THE ARCHITECTURE

```
Seed (3 words)
    ↓
Random Number Generator (deterministic)
    ↓
Physical Laws (gravity, thermodynamics, orbital mechanics)
    ↓
Chemical Laws (periodic table, bonding, phase transitions)
    ↓
Stellar Laws (star formation, habitable zones, luminosity)
    ↓
Planetary Laws (accretion, composition, atmospheres)
    ↓
Biological Laws (allometry, metabolism, scaling)
    ↓
Ecological Laws (carrying capacity, predator-prey, niches)
    ↓
Taxonomic Laws (Linnaean classification, naming)
    ↓
Social Laws (Service typology, Dunbar's number, hierarchy)
    ↓
Complete Universe (deterministic, replayable, scientifically rigorous)
```

## CORE PRINCIPLE

**Everything is a law.**

A "law" is a pure deterministic function: `Input → Output`

```typescript
// Physical law
const gravity = (m1, m2, r) => G * m1 * m2 / r²;

// Biological law
const metabolism = (mass) => 70 * mass^0.75;

// Taxonomic law (yes, this is also just a function!)
const kingdom = (chemistry) => chemistry.backbone === 'C' ? 'Animalia' : 'Silicae';

// Social law
const governanceType = (pop, surplus) => {
  if (pop < 50) return 'Band';
  if (pop < 500) return 'Tribe';
  if (pop < 5000) return 'Chiefdom';
  return 'State';
};
```

**All the same type. All deterministic. All applied in sequence.**

## FILE STRUCTURE

```
packages/game/src/
├── laws/
│   ├── physics.ts          # Universal constants, gravity, thermodynamics
│   ├── stellar.ts          # Star evolution, habitable zones
│   ├── biology.ts          # Allometric scaling, Kleiber's Law
│   ├── ecology.ts          # Carrying capacity, Lotka-Volterra
│   ├── social.ts           # Service typology, Dunbar's number
│   ├── taxonomy.ts         # Linnaean classification
│   └── index.ts            # Complete law system
│
├── tables/
│   ├── physics-constants.ts    # G, c, k_B, etc.
│   ├── periodic-table.ts       # All 92 elements with properties
│   ├── linguistic-roots.ts     # Latin/Greek roots for naming
│   └── index.ts
│
└── generation/
    └── (to be built)
```

## THE LAWS

### 1. Physics (`laws/physics.ts`)

**Newton's Laws**: F = ma, action-reaction  
**Gravity**: F = Gm₁m₂/r²  
**Orbital Mechanics**: Kepler's laws, escape velocity, Hill sphere  
**Thermodynamics**: Energy conservation, entropy, ideal gas law, blackbody radiation  
**Fluid Dynamics**: Atmospheric retention (Jeans escape), pressure gradients

**These never change. They're the same everywhere in the universe.**

### 2. Stellar Evolution (`laws/stellar.ts`)

**IMF (Initial Mass Function)**: Distribution of stellar masses  
**Mass-Luminosity**: L ∝ M^3.5  
**Lifetime**: t ∝ M^-2.5  
**Habitable Zone**: Where liquid water can exist  
**Condensation Sequence**: What materials condense at what temperatures  
**Frost Line**: Where gas giants can form

**From these laws, we generate entire solar systems.**

### 3. Biology (`laws/biology.ts`)

**Kleiber's Law**: Metabolism ∝ M^0.75  
**Heart Rate**: HR ∝ M^-0.25  
**Lifespan**: L ∝ M^0.25  
**Square-Cube Law**: Structural limits from geometry  
**Respiratory Constraints**: Diffusion limits, when circulatory systems needed  
**Thermoregulation**: Surface area/volume, heat loss

**These constrain what life forms are physically possible.**

### 4. Ecology (`laws/ecology.ts`)

**Carrying Capacity**: K = Productivity / Metabolism  
**Lotka-Volterra**: Predator-prey dynamics  
**Competition**: Competitive exclusion, niche differentiation  
**Trophic Dynamics**: 10% rule, energy pyramids  
**Home Range**: Territory ∝ M^1.02 (herbivores), M^1.36 (carnivores)

**These determine population sizes and species interactions.**

### 5. Taxonomy (`laws/taxonomy.ts`)

**Linnaean Classification**: Kingdom → Phylum → Class → Order → Family → Genus → Species  
**Binomial Nomenclature**: Genus + species (e.g., "Cursor mesocarnivorus")  
**Common Names**: Generated from traits (e.g., "Greater Desert Runner")

**Just like physics, these are deterministic mapping functions.**

### 6. Social Organization (`laws/social.ts`)

**Service's Typology**: Band → Tribe → Chiefdom → State (by population and surplus)  
**Dunbar's Number**: ~150 stable relationships (cognitive limit)  
**Hierarchy Levels**: log₂(population/50)  
**Gini Coefficient**: Measure of inequality  
**Carneiro's Circumscription**: Geography + surplus → hierarchy

**Social structures emerge from population size and resource distribution.**

## THE PERIODIC TABLE (`tables/periodic-table.ts`)

**Complete element data:**
- Atomic number, mass, electron configuration
- Physical properties (density, melting point, boiling point)
- Chemical properties (electronegativity, ionization energy, bond energies)
- Cosmic abundance (from stellar nucleosynthesis)

**This determines:**
- What planets are made of
- What atmospheres can form
- What life chemistry is possible
- What tools can be made

## LINGUISTIC ROOTS (`tables/linguistic-roots.ts`)

**Latin and Greek roots for systematic naming:**

**Locomotion**: cursor (runner), dendro (tree), fossor (digger), hydro (water), aero (air)  
**Diet**: herbivor (plant-eater), carnivor (meat-eater), omnivor (all-eater)  
**Size**: micro, parvo, meso, macro, mega, giganto  
**Habitat**: xero (desert), silvo (forest), oro (mountain), littoro (coastal)

**Archaeological Industries**: Oldowan, Acheulean, Mousterian, Upper Paleolithic, Neolithic, Bronze Age, Iron Age

**Names are generated, not invented:**
```typescript
locomotion = "cursorial"
diet = "carnivore"
size = "meso" (10kg)
habitat = "desert"

genus = "Xerocursor" (desert runner)
species = "mesocarnivoruus" (medium carnivore)
scientific = "Xerocursor mesocarnivoruus"
common = "Desert Runner"
```

## WHAT WE DELETED

**Deleted entirely (not archived):**
- ❌ `packages/gen/` (AI prompt system)
- ❌ `manifests/evolutionary-archetypes.json` (hardcoded creatures)
- ❌ `manifests/production-assets.json` (hardcoded resources)
- ❌ All AI generation calls

**Why delete, not archive?**
Because we're making a **decisive break** with the old architecture. This is not a "maybe we'll come back to this" situation. The law-based approach is fundamentally better:

1. **Scientifically rigorous**: Real physics, not guesses
2. **Infinitely scalable**: Any seed = new universe
3. **Educational**: Teaches real science
4. **Deterministic**: Same seed = same universe (multiplayer, testing, speedruns)
5. **Lightweight**: ~100KB of laws vs. MB of JSON
6. **Moddable**: Change constants = different physics

## THE NEW GENERATIONS

### Gen0: Stellar System Formation
**Laws**: Physics, Stellar, Chemistry  
**Output**: Star + planets with real composition, atmospheres, gravity, temperature

### Gen1: Life Emergence
**Laws**: Biology, Chemistry  
**Output**: Life chemistry (C/H₂O, Si, NH₃), body plans from environmental constraints

### Gen2: Creature Evolution
**Laws**: Biology, Ecology, Taxonomy  
**Output**: Species with scientific names, population dynamics, predator-prey relationships

### Gen3: Tool Development
**Laws**: Material properties, cognitive capacity  
**Output**: Tool progression (Oldowan → Acheulean → ...), archaeological classifications

### Gen4: Social Organization
**Laws**: Social, Dunbar's number  
**Output**: Governance (Band → Tribe → Chiefdom → State), stratification, specialization

### Gen5: Cultural Complexity
**Laws**: Social, Cognitive  
**Output**: Language, art, ritual, trade networks

### Gen6+: Scientific Discovery & Space Age
**New capability**: Creatures discover the laws we're using!  
They can predict outcomes, design spacecraft, terraform planets, transcend biology.

## THE VISION

**One seed → Entire universe → Scientific discovery → Space colonization → Transcendence**

"azure mountain wind" generates:
- G-type star (Sun-like)
- Rocky planet at 1.2 AU (habitable zone)
- O₂/N₂ atmosphere (retained via Jeans escape)
- Carbon-based life (temperature allows water)
- 15 species of creatures (niches filled by ecological laws)
- Pack-forming cursorial carnivores (population dynamics)
- Tool progression (available materials: stone, wood, bone)
- Chiefdom government (population = 800, surplus = 0.3)
- Scientific revolution (discover gravity, periodic table)
- Space age (calculate escape velocity, design rockets)
- Interstellar expansion (generation ships to nearby stars)
- Digital transcendence (upload consciousness)

**All from three words and mathematical laws.**

## IMPLEMENTATION STATUS

### ✅ COMPLETED
- [x] Core physics laws
- [x] Stellar evolution laws
- [x] Biological scaling laws
- [x] Ecological dynamics laws
- [x] Social organization laws
- [x] Taxonomic classification laws
- [x] Complete periodic table
- [x] Linguistic root system
- [x] Documentation

### 🚧 IN PROGRESS
- [ ] Universe generator (applies laws in sequence)
- [ ] Planet formation simulation
- [ ] Life chemistry determination
- [ ] Creature generation from niches
- [ ] Tool and structure emergence
- [ ] Refactor existing Gen0-5 to use laws

### 📋 TODO
- [ ] Gen6-10 design (scientific discovery → space → transcendence)
- [ ] Extrapolation engines (seed → complete models)
- [ ] Multi-scale rendering (celestial → planetary → surface)
- [ ] Performance optimization
- [ ] Comprehensive testing

## FOR OTHER DEVELOPERS

**If you're reading this and confused:**

1. Read this doc top to bottom
2. Look at `src/laws/physics.ts` - see how laws are just functions
3. Look at `src/laws/taxonomy.ts` - see how naming is deterministic
4. Look at `src/laws/social.ts` - see how societies emerge from population math

**The key insight:**
```typescript
// This is how the old system worked:
AI.generate("creature") → {name: "Bob", speed: 5, diet: "meat"}

// This is how the new system works:
Planet → Environment → Niche → BiologicalLaws → Creature {
  mass: 50kg,
  speed: AllometricScaling.speed(50kg, gravity),
  metabolism: AllometricScaling.metabolism(50kg),
  scientificName: TaxonomicLaws.classify(traits)
}
```

**Everything is calculated, nothing is invented.**

## QUESTIONS?

This is a radical architectural change. The old AI-based system is gone. We're building a law-based universe from first principles.

If anything is unclear, ask. But the direction is set: **deterministic laws all the way down.**
