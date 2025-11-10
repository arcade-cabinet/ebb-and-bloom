# Ebb & Bloom Engine - Architecture

**Version:** 1.0.0  
**Last Updated:** November 10, 2025

---

## Overview

Governor-based universe simulation engine that generates deterministic procedural universes from three-word seeds using 17 Yuka-native governors.

**Core Principle:** Everything emerges from autonomous agents - no external law calls, all behaviors execute in agent loops.

---

## Engine Structure

```
engine/
├── governors/     # 17 Yuka-native governors (2,271 lines)
├── spawners/      # World generation (Daggerfall-inspired)
├── agents/        # Yuka AI integration
├── simulation/    # Timeline engine (Big Bang → Heat Death)
├── core/          # GameEngine classes
├── utils/         # EnhancedRNG, seed management
└── tables/        # Universal constants (6 tables)
```

---

## Governor System

### Philosophy
All agent behaviors implemented as Yuka primitives:
- **SteeringBehaviors** - Physics, ecology (continuous forces)
- **Goals + Evaluators** - Biology, social (decision-making)
- **StateMachines** - Lifecycle, social states
- **FuzzyLogic** - Environmental responses

### 17 Governors Organized by Domain
- **physics/** - Gravity, Orbit, Temperature, Stellar (4)
- **biological/** - Metabolism, Lifecycle, Reproduction, Genetics, Cognitive (5)
- **ecological/** - Flocking, PredatorPrey, Territory, Foraging, Migration (5)
- **social/** - Hierarchy, Warfare, Cooperation (3)

### Usage
```typescript
import { GravityBehavior, MetabolismSystem } from 'engine/governors';

// Add to agent
const agent = new Vehicle();
agent.steering.add(new GravityBehavior());

// Update each frame
MetabolismSystem.update(agent, deltaTime);
```

See: `engine/governors/README.md` for complete documentation

---

## World Generation (Daggerfall-Inspired)

### ChunkManager
**7x7 chunk streaming** (exact Daggerfall pattern)
- 49 chunks loaded around player
- Chunk recycling (max 81 in memory)
- SimplexNoise heightmaps (O(n²), superior to Perlin)
- Deterministic per-chunk generation

### BiomeSystem
**11 biome types** based on Whittaker diagram
- Temperature + moisture classification
- Ocean, Beach, Desert, Grassland, Forest
- Rainforest, Savanna, Taiga, Tundra, Snow, Mountain

### VegetationSpawner
**Instanced rendering** (1 draw call per tree type)
- DFU Pattern: Steepness rejection (no trees on cliffs >50°)
- DFU Pattern: Settlement clearance (no trees in cities)
- 5 tree types (oak, pine, palm, cactus, shrub)
- Biome-specific placement

### SettlementPlacer
**Law-based city placement**
- Uses SocialLaws for population
- Terrain suitability evaluation
- Procedural naming (linguistic roots)
- Villages, towns, cities

---

## Agent System (Yuka AI)

### AgentSpawner
Mediates between Legal Broker and Yuka entities:
1. Legal Broker validates spawn request
2. Spawner creates Yuka Vehicle
3. Assigns goals from laws
4. Adds to EntityManager

### AgentLODSystem
**Like visual LOD, but for simulation:**
- Cosmic zoom: Analytical advancement (no agents)
- Stellar zoom: Stellar agents spawn
- Planetary zoom: Planetary + creature agents

### Agent Types
- **CreatureAgent** - Individual behaviors (wander, seek, flee)
- **PlanetaryAgent** - Planet evolution (atmosphere, life)
- **EntropyAgent** - Universe thermodynamics (future)
- **StellarAgent** - Star lifecycle (future)

See: `docs/architecture/AGENT_LOD_ARCHITECTURE.md`

---

## Simulation System

### UniverseSimulator
**Full timeline** from Big Bang to Heat Death
```typescript
const sim = new UniverseSimulator({ seed: 'v1-test' });
sim.advanceTime(13.8e9); // 13.8 billion years
const state = sim.getState();
```

### GenesisSynthesisEngine
**Procedural universe generation**
- Big Bang → Nucleosynthesis → Star formation
- Planet formation → Life → Civilizations
- Activity tracking for visualization
- Event recording (supernovae, abiogenesis, etc.)

---

## Performance

### Benchmarks
- **FPS:** 120 constant
- **Chunks:** 49 (7x7 grid)
- **Trees:** 286 (instanced, filtered by steepness/clearance)
- **NPCs:** 58 (Yuka AI, daily schedules)
- **Creatures:** 100 (Kleiber's Law)
- **Memory:** ~15MB for full world

### vs Daggerfall Unity
- **Code:** 23% size (10k vs 43k lines)
- **Features:** 60-70% parity
- **Algorithms:** Superior (SimplexNoise, instancing, laws)
- **Platform:** Web (DFU is Unity exe)

---

## Key Patterns

### Deterministic RNG
```typescript
import { EnhancedRNG } from 'engine/utils/EnhancedRNG';

const rng = new EnhancedRNG('v1-seed-word-word');
const value = rng.uniform(0, 1);
const gaussian = rng.normal(0, 1);
```

### Chunk Streaming
```typescript
const chunks = new ChunkManager(scene, seed, entityManager);
chunks.update(playerX, playerZ); // Load 7x7 grid

const height = chunks.getTerrainHeight(x, z);
const settlement = chunks.getNearestSettlement(x, z);
```

---

## Documentation

- **README.md** - Quick start
- **ENGINE.md** - Complete API
- **docs/ARCHITECTURE.md** - This file
- **docs/LAW_SYSTEM.md** - Law catalog
- **docs/architecture/** - Specific systems

---

For implementation details, see docs in `docs/architecture/`:
- Agent LOD system
- Bottom-up emergence
- Yuka integration
- Legal Broker system

