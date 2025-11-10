# Ebb & Bloom Engine

**Version:** 1.0.0  
**License:** MIT  
**Platform:** Web (TypeScript + React Three Fiber)

---

## What is This?

**Ebb & Bloom Engine** is a law-based universe simulation engine that generates deterministic, scientifically-grounded procedural worlds from three-word seeds.

Instead of using AI or hardcoded data, the engine implements **57 mathematical laws** from physics, biology, ecology, and social sciences to generate infinite unique universes.

---

## Core Principles

### 1. **Law-Based Generation**
Everything emerges from scientific laws:
- **Physics Laws** - Gravity, thermodynamics, orbital mechanics
- **Stellar Laws** - Star formation, stellar evolution, habitable zones
- **Biology Laws** - Kleiber's Law, allometric scaling
- **Ecology Laws** - Lotka-Volterra, carrying capacity
- **Social Laws** - Dunbar's number, Service typology
- **Taxonomy Laws** - Linnaean classification

### 2. **Deterministic**
Same seed → Same universe. Always.
```typescript
import { UniverseSimulator, EnhancedRNG } from '@ebb-and-bloom/engine';

// Same seed always produces same result
const sim1 = new UniverseSimulator({ seed: 'v1-green-valley-breeze' });
const sim2 = new UniverseSimulator({ seed: 'v1-green-valley-breeze' });

// sim1.getState() === sim2.getState() ✅
```

### 3. **Multi-Scale**
Simulates from quantum (Planck scale) to cosmic (universe-wide):
- **Quantum** - Particle physics
- **Atomic** - Chemistry, molecules
- **Planetary** - Geology, atmospheres
- **Stellar** - Stars, solar systems
- **Galactic** - Star clusters, spiral arms
- **Cosmic** - Universe structure

---

## Architecture

```
engine/
├── laws/              # 57 law files (8,500+ lines)
│   ├── physics.ts
│   ├── stellar.ts
│   ├── biology.ts
│   ├── ecology.ts
│   ├── social.ts
│   └── ... (52 more)
├── spawners/          # World generation
│   ├── ChunkManager.ts      # Terrain streaming (7x7 grid)
│   ├── BiomeSystem.ts       # 11 biome types
│   ├── SimplexNoise.ts      # Terrain heightmaps
│   ├── VegetationSpawner.ts # Trees (instanced)
│   ├── SettlementPlacer.ts  # Cities/towns/villages
│   ├── NPCSpawner.ts        # NPCs with schedules
│   ├── CreatureSpawner.ts   # Procedural creatures
│   └── WaterSystem.ts       # Animated water
├── agents/            # Yuka-based AI
│   ├── EntropyAgent.ts      # Universe thermodynamics
│   ├── StellarAgent.ts      # Star lifecycle
│   ├── PlanetaryAgent.ts    # Planet evolution
│   └── CreatureAgent.ts     # Individual behavior
├── simulation/        # Timeline engine
│   ├── UniverseSimulator.ts
│   ├── TimelineSimulator.ts
│   └── UniverseActivityMap.ts
├── synthesis/         # Genesis engine
│   └── GenesisSynthesisEngine.ts
├── utils/             # Core utilities
│   ├── EnhancedRNG.ts       # Deterministic RNG
│   └── seed-manager.ts      # Seed validation
├── tables/            # Universal constants
│   ├── periodic-table.ts
│   ├── physics-constants.ts
│   └── linguistic-roots.ts
└── index.ts           # Main API export
```

---

## Quick Start

### Installation
```bash
npm install @ebb-and-bloom/engine
```

### Basic Usage
```typescript
import { 
  UniverseSimulator,
  ChunkManager,
  BiomeSystem,
  EnhancedRNG
} from '@ebb-and-bloom/engine';

// 1. Create a deterministic RNG
const rng = new EnhancedRNG('v1-demo-seed');

// 2. Generate a universe
const sim = new UniverseSimulator({ seed: 'v1-cosmic-test' });
sim.advanceTime(13.8e9); // 13.8 billion years (Big Bang → Now)

const state = sim.getState();
console.log(state.stars.length); // Number of stars generated

// 3. Generate terrain chunks
const scene = new THREE.Scene();
const chunks = new ChunkManager(scene, 'v1-terrain-seed');
chunks.update(0, 0); // Load 7x7 chunk grid around (0,0)

// 4. Get biome at position
const biomes = new BiomeSystem('v1-biome-seed');
const biome = biomes.getBiome(100, 200, 15); // x, z, height
console.log(biome.type); // "grassland", "forest", "ocean", etc.
```

---

## Systems

### 1. World Spawners

#### ChunkManager
**Daggerfall-style terrain streaming**
- 7x7 chunk grid (49 chunks loaded)
- SimplexNoise heightmaps
- Automatic chunk recycling
- Deterministic per-chunk generation

```typescript
const chunks = new ChunkManager(scene, seed, entityManager);
chunks.update(playerX, playerZ); // Load chunks around player

const height = chunks.getTerrainHeight(x, z); // Get height at position
const settlement = chunks.getNearestSettlement(x, z); // Find nearby city
```

#### BiomeSystem
**11 biome types based on temperature + moisture**
- Ocean, Beach, Desert, Grassland, Forest
- Rainforest, Savanna, Taiga, Tundra, Snow, Mountain
- Uses Whittaker diagram for classification

```typescript
const biomes = new BiomeSystem(seed);
const biome = biomes.getBiome(x, z, height);
// Returns: { type, color, temperature, moisture }
```

#### VegetationSpawner
**Instanced tree rendering (1 draw call per type)**
- 5 tree types (oak, pine, palm, cactus, shrub)
- Steepness rejection (no trees on cliffs >50°)
- Settlement clearance (no trees in cities)
- Biome-specific placement

```typescript
const vegetation = new VegetationSpawner(scene, seed);
vegetation.spawnInChunk(chunkX, chunkZ, getBiome, getHeight, getSettlement);
```

#### SettlementPlacer
**Law-based city/town/village placement**
- Uses SocialLaws for population
- Terrain suitability evaluation
- Minimum distance constraints
- Procedural buildings

```typescript
const settlements = new SettlementPlacer(scene, seed);
settlements.placeInRegion(regionX, regionZ, getBiome, getHeight);

const nearest = settlements.getNearestSettlement(x, z);
// Returns: { name, type, population, buildings[] }
```

---

### 2. Simulation

#### UniverseSimulator
**Full timeline from Big Bang to Heat Death**
```typescript
const sim = new UniverseSimulator({ seed: 'v1-test' });

// Advance time (in years)
sim.advanceTime(1e9); // 1 billion years

// Get current state
const state = sim.getState();
console.log({
  age: state.age,
  stars: state.stars.length,
  planets: state.planets.length,
  civilizations: state.civilizations.length
});
```

#### TimelineSimulator
**Continuous time evolution**
```typescript
const timeline = new TimelineSimulator(seed);
timeline.step(); // Advance one timestep
const events = timeline.getEvents(); // Get major events
```

---

### 3. Laws

**57 law files implementing scientific formulas:**

#### Physics Laws
```typescript
import { 
  calculateGravity,
  calculateOrbitalVelocity,
  calculateHabitableZone
} from '@ebb-and-bloom/engine/laws';

const force = calculateGravity(mass1, mass2, distance);
const v = calculateOrbitalVelocity(mass, radius);
const [inner, outer] = calculateHabitableZone(starMass, luminosity);
```

#### Biology Laws
```typescript
import {
  calculateMetabolicRate,
  calculateLifespan,
  calculateReproductionRate
} from '@ebb-and-bloom/engine/laws';

const metabolicRate = calculateMetabolicRate(bodyMass); // Kleiber's Law
const lifespan = calculateLifespan(bodyMass); // Allometric scaling
```

#### Ecology Laws
```typescript
import {
  lotkaVolterra,
  calculateCarryingCapacity,
  calculateCompetition
} from '@ebb-and-bloom/engine/laws';

const [preyChange, predChange] = lotkaVolterra(prey, predators, alpha, beta);
const capacity = calculateCarryingCapacity(area, resources);
```

---

## Performance

### Benchmarks (from DFU assessment):
- **FPS:** 120 (constant)
- **Terrain:** 49 chunks (7x7 grid)
- **Trees:** 286 (instanced, 1 draw call per type)
- **NPCs:** 58 (Yuka AI, daily schedules)
- **Creatures:** 100 (Yuka behaviors)
- **Memory:** Efficient chunk recycling

### vs Daggerfall Unity:
- **Code size:** 23% of DFU (10,000 vs 43,000 lines)
- **Features:** 60-70% parity
- **Algorithms:** Better (SimplexNoise, instancing, laws)
- **Platform:** Web (DFU is Unity exe only)

---

## Philosophy

### Inspired by Daggerfall (1996)
- **Infinite worlds** - Procedural generation
- **Deterministic** - Same seed = same world
- **Chunk streaming** - 7x7 grid (exact DFU pattern)
- **Modular systems** - Independent, composable

### Enhanced for 2025
- **Law-based** - Scientific rigor, not random data
- **React Three Fiber** - Modern web rendering
- **Yuka AI** - Better than FSM
- **Mobile support** - Responsive, touch-friendly

---

## Roadmap

### Implemented ✅
- [x] 57 law files
- [x] Deterministic RNG (seedrandom)
- [x] ChunkManager (7x7 streaming)
- [x] BiomeSystem (11 types)
- [x] VegetationSpawner (steepness + clearance)
- [x] SettlementPlacer (law-based)
- [x] NPCSpawner (schedules)
- [x] CreatureSpawner (Kleiber's Law)
- [x] WaterSystem (animated shaders)
- [x] UniverseSimulator (timeline)

### Planned 🚧
- [ ] GameManager (state machine)
- [ ] Floating origin (>10km worlds)
- [ ] LOD system (performance)
- [ ] Collision mesh (proper physics)
- [ ] Advanced movement (climb, swim)
- [ ] Complete UI system
- [ ] Save/load

---

## Examples

See `src/demo/` for complete examples:
- `demo/terrain.tsx` - Terrain generation with R3F
- `demo/universe.tsx` - Full universe simulation
- `demo/game.tsx` - Complete game demo

---

## Contributing

See `CONTRIBUTING.md` for guidelines.

---

## License

MIT License - See `LICENSE` file

---

## Credits

**Inspired by:**
- Daggerfall (1996) - Bethesda Softworks
- Daggerfall Unity (2009-2025) - Community project
- Elite (1984) - Procedural generation pioneer
- No Man's Sky (2016) - Modern procedural universe

**Built with:**
- React Three Fiber - @pmndrs/react-three-fiber
- Three.js - threejs.org
- Yuka - mugen87/yuka
- SimplexNoise - fast-simplex-noise
- TypeScript - typescriptlang.org

---

**Made with ❤️ by the Ebb & Bloom community**

