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

## BRIDGE ARCHITECTURE (30 Years of Innovation)

**Core Principle:** DFU spawners are GOOD code - we keep their proven 30-year-old logic intact and replace hardcoded MAPS.BSA data with governor-calculated data using scientific laws.

### The Architecture

```
Governors (Modern AI)          DFU Spawners (Proven Code)
--------------------           ------------------------
Use scientific laws       →    Receive intelligent data
Calculate from terrain    →    Spawn settlements/NPCs/creatures
No hardcoded data         →    Execute proven DFU logic
```

### Before & After

**OLD DFU Approach (Hardcoded):**
```typescript
population = MAPS.BSA.lookup(regionID)           // Hardcoded database
temperature = CLIMATE.BSA.lookup(x, z)           // Static data
settlement_type = LOCATION_TYPES[id]             // Predefined
npc_schedule = NPC_SCHEDULES[role]               // Fixed schedules
```

**NEW Approach (Governor-Based):**
```typescript
population = ecologyGovernor.calculateCarryingCapacity(terrain, climate)  // Laws
temperature = physicsGovernor.calculateTemperature(latitude, altitude)    // Laws
settlement_type = socialGovernor.determineGovernanceType(population)      // Laws
npc_schedule = socialGovernor.generateNPCSchedule(role, settlement)       // Laws
```

### The Bridge: GovernorDataProvider

The `GovernorDataProvider` interface defines how DFU spawners REQUEST data from governors:

```typescript
interface GovernorDataProvider {
  calculateSettlementPopulation(terrain, climate): number;
  determineGovernanceType(population, culture): GovernanceType;
  calculateCarryingCapacity(biome, area): number;
  generateNPCSchedule(role, settlement): Schedule;
  calculateResourceAvailability(terrain, season): ResourceAvailability;
}
```

### Key Insight

**We DON'T replace DFU spawners - they work perfectly!**
**We REPLACE their data source: MAPS.BSA → Governors (using laws)**

This means:
- BuildingSpawner (DFU) receives materials/size from governors → spawns buildings
- SettlementPlacer (DFU) receives population from governors → places settlements
- CreatureSpawner (DFU) receives density from governors → spawns creatures
- NPCSpawner (DFU) receives schedules from governors → spawns NPCs

### Implementation

1. **Spawners** (DFU-compatible, proven logic):
   - `BuildingSpawner` - Uses prefabs, executes DFU building generation
   - `SettlementPlacer` - Uses DFU grid patterns, proven placement logic
   - `CreatureSpawner` - Uses DFU instancing, proven spawn patterns
   - `NPCSpawner` - Uses DFU schedules, proven behavior patterns

2. **Governors** (Modern AI, scientific laws):
   - Calculate population using ecology laws (carrying capacity)
   - Determine governance using social laws (Service typology)
   - Generate schedules using social laws (Dunbar's number)
   - Calculate resources using ecology laws (biome productivity)

3. **The Bridge** (GovernorDataProvider):
   - Spawners call governors for data
   - Governors use laws to calculate
   - Spawners execute with governor data
   - NO MAPS.BSA hardcoded data needed!

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

