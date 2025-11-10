# Ebb & Bloom Engine - Complete API

**Version:** 1.1.0  
**Last Updated:** November 10, 2025

---

## Overview

Governor-based world simulation engine. Everything emerges from 15 autonomous governors that decide creature behavior, which drives procedural synthesis of visuals.

**Core Architecture:**
```
Governors (DECIDE) → Synthesis (CREATE) → World (EMERGES)
```

---

## 1. GOVERNORS (Decision Makers)

### 1.1 Physics Governors

#### GravityBehavior
```typescript
import { GravityBehavior } from 'ebb-and-bloom-engine';

const gravity = new GravityBehavior();
gravity.scale = 1e10; // Scale for game units
agent.steering.add(gravity);
```

**What it does:** Applies gravitational forces between all massive entities.

**Parameters:**
- `scale: number` - G scaling for game-friendly effects
- `minDistance: number` - Prevent singularities
- `maxForce: number` - Cap maximum force

---

#### TemperatureBehavior  
```typescript
import { TemperatureBehavior } from 'ebb-and-bloom-engine';

const temp = new TemperatureBehavior();
const action = temp.evaluate(ambientTemp, bodyTemp);
// action: -1 (seek warmth) to +1 (seek cold)
```

**What it does:** Fuzzy logic for thermal responses.

---

### 1.2 Biological Governors

#### MetabolismSystem
```typescript
import { MetabolismSystem } from 'ebb-and-bloom-engine';

// Setup
agent.energy = 100;
agent.maxEnergy = 100;
agent.mass = 50; // kg

// Each frame
MetabolismSystem.update(agent, deltaTime);
// Automatically drains energy based on Kleiber's Law
```

**What it does:** Energy depletion based on body mass (M = 70·mass^0.75)

---

#### LifecycleStateMachine
```typescript
import { LifecycleStateMachine } from 'ebb-and-bloom-engine';

const lifecycle = new LifecycleStateMachine(agent);
agent.stateMachine = lifecycle;

// Each frame
lifecycle.update(deltaTime);
// Automatically transitions: Juvenile → Adult → Elder
```

**What it does:** Age-based state transitions with allometric thresholds.

---

#### ReproductionSystem
```typescript
import { ReproductionEvaluator, SeekMateGoal, ReproductionSystem } from 'ebb-and-bloom-engine';

// Setup
agent.brain.addEvaluator(new ReproductionEvaluator());
agent.canReproduce = true;

// Each frame
ReproductionSystem.update(agent, deltaTime);
// Handles cooldowns, mate-seeking when ready
```

---

#### GeneticsSystem
```typescript
import { GeneticsSystem } from 'ebb-and-bloom-engine';

const offspring = GeneticsSystem.inherit(parent1, parent2);
// offspring.genome contains inherited traits + mutations
```

---

#### CognitiveSystem
```typescript
import { CognitiveSystem } from 'ebb-and-bloom-engine';

const brainMass = CognitiveSystem.brainMass(bodyMass);
const eq = CognitiveSystem.encephalizationQuotient(bodyMass, brainMass);
const learningRate = CognitiveSystem.learningRate(eq);
```

---

### 1.3 Ecological Governors

#### FlockingGovernor
```typescript
import { FlockingGovernor } from 'ebb-and-bloom-engine';

const flocking = new FlockingGovernor({
    alignmentWeight: 1.0,
    cohesionWeight: 0.9,
    separationWeight: 0.3,
    maxNeighbors: 150 // Dunbar's number
});

flocking.applyTo(agent, 15); // 15m neighborhood radius
```

---

#### PredatorPreyBehavior
```typescript
import { PredatorPreyBehavior } from 'ebb-and-bloom-engine';

agent.role = 'predator'; // or 'prey'
agent.steering.add(new PredatorPreyBehavior());
// Predators pursue, prey flee automatically
```

---

#### TerritorialBehavior
```typescript
import { TerritorialBehavior } from 'ebb-and-bloom-engine';

const territory = new TerritorialBehavior(centerX, centerZ, radius);
const intensity = territory.evaluate(intruderX, intruderZ, resourceValue, threat);
// Returns defense intensity 0-1
```

---

#### ForagingBehavior
```typescript
import { ForagingEvaluator, ForageGoal } from 'ebb-and-bloom-engine';

agent.brain.addEvaluator(new ForagingEvaluator());
// Automatically forages when energy < 50%
```

---

#### MigrationBehavior
```typescript
import { MigrationBehavior } from 'ebb-and-bloom-engine';

const migration = new MigrationBehavior(summerPos, winterPos);
agent.steering.add(migration);
// Migrates when resources drop below threshold
```

---

### 1.4 Social Governors

#### HierarchyBehavior
```typescript
import { HierarchyBehavior } from 'ebb-and-bloom-engine';

// Initialize hierarchy for group
HierarchyBehavior.initializeHierarchy(agents);

// Add to individual
agent.steering.add(new HierarchyBehavior());
// Dominants approach, subordinates defer
```

---

#### WarfareBehavior
```typescript
import { WarfareBehavior } from 'ebb-and-bloom-engine';

agent.resourceScarcity = 0.7;
agent.populationPressure = 0.8;
agent.group = 'tribe_1';
agent.steering.add(new WarfareBehavior());
// Attacks enemy groups when scarcity high
```

---

#### CooperationBehavior
```typescript
import { CooperationBehavior } from 'ebb-and-bloom-engine';

agent.steering.add(new CooperationBehavior());
// Reciprocal altruism - helps those who helped before
```

---

## 2. SYNTHESIS (Visual Creation)

### 2.1 Molecular Synthesis

```typescript
import { MolecularSynthesis, MolecularComposition, BodyPlan } from 'ebb-and-bloom-engine';

const synthesis = new MolecularSynthesis();

const composition: MolecularComposition = {
    protein: 0.45,  // Muscle bulk
    calcium: 0.15,  // Bone structure
    lipid: 0.15,    // Fat
    chitin: 0.0,    // Exoskeleton
    keratin: 0.08,  // Horns/claws
    water: 0.15,
    minerals: 0.02
};

const bodyPlan: BodyPlan = {
    segments: 3,
    symmetry: 'bilateral',
    appendages: 4,
    spine: true
};

const mesh = synthesis.generateFromComposition(composition, mass, bodyPlan);
// Returns THREE.Group with geometry driven by molecular %
```

**Molecular Rules:**
- **Protein ↑** = More muscle cylinders, bulkier body
- **Calcium ↑** = More bone segments, larger head
- **Chitin ↑** = Segmented exoskeleton, faceted geometry
- **Lipid ↑** = Fatter body taper
- **Keratin ↑** = Horns, spikes, protrusions

---

### 2.2 Pigmentation Synthesis

```typescript
import { PigmentationSynthesis, DietaryInput, Environment } from 'ebb-and-bloom-engine';

const pigments = new PigmentationSynthesis();

const diet: DietaryInput = {
    plantMatter: 0.8,   // Carotenoids
    animalMatter: 0.2,  // Porphyrins
    minerals: 0.1
};

const environment: Environment = {
    vegetation: 0.7,    // Forest
    rockColor: 0.3,     // Brown rocks
    uvIntensity: 0.6,   // Moderate UV
    temperature: 290    // K
};

const color = pigments.generateColor(diet, environment, genetics);
const pattern = pigments.generatePattern(environment, genetics);
// Returns THREE.Color and THREE.Texture for camouflage
```

**Pigment Rules:**
- **Plant diet** = Carotenoids (yellow/orange/red)
- **Meat diet** = Porphyrins (red from blood)
- **High UV** = Melanin (dark for protection)
- **Forest** = Green camouflage
- **Desert** = Brown/tan camouflage
- **High genetics** = Spots, stripes patterns

---

### 2.3 Structure Synthesis

```typescript
import { StructureSynthesis, MaterialAvailability } from 'ebb-and-bloom-engine';

const synthesis = new StructureSynthesis();

const materials: MaterialAvailability = {
    wood: 0.7,
    stone: 0.5,
    bone: 0.3,
    fiber: 0.6,
    clay: 0.4
};

const tool = synthesis.generateTool('digging_stick', materials);
const structure = synthesis.generateStructure('burrow', materials, scale);
// Returns THREE.Group composed from available materials
```

**Tool Types:**
- `digging_stick` - Wood shaft + stone point
- `gathering_pole` - Long pole + hook
- `wading_spear` - Shaft + sharp tip
- `striking_stone` - Handheld rock

**Structure Types:**
- `burrow` - Underground chamber
- `platform` - Tree nest
- `stiltwork` - Water platform
- `windbreak` - Ground shelter

---

### 2.4 Complete Creature Generation

```typescript
import { CreatureMeshGenerator, CreatureTraits, BiomeContext } from 'ebb-and-bloom-engine';

const generator = new CreatureMeshGenerator();

const traits: CreatureTraits = {
    mass: 50,
    locomotion: 'cursorial',
    diet: 'herbivore',
    socialBehavior: 'pack',
    age: 3,
    genetics: 0.7
};

const biome: BiomeContext = {
    vegetation: 0.8,     // Forest
    rockColor: 0.2,
    uvIntensity: 0.3,
    temperature: 285
};

const mesh = generator.generate(traits, biome);
// Returns fully synthesized creature mesh:
// - Molecular composition from traits
// - Geometry from molecules
// - Coloring from diet + biome
// - Patterns from genetics
// - Age effects applied
```

---

## 3. SPAWNERS (World Generation)

### 3.1 ChunkManager
```typescript
import { ChunkManager } from 'ebb-and-bloom-engine';
import { EntityManager } from 'yuka';

const chunks = new ChunkManager(scene, seed, entityManager);

// Load chunks around position
chunks.update(playerX, playerZ);

// Query terrain
const height = chunks.getTerrainHeight(x, z);
const biome = chunks.getBiomeAt(x, z);

// Query settlements
const settlement = chunks.getNearestSettlement(x, z);
```

**Features:**
- 7x7 chunk streaming (49 active)
- SimplexNoise terrain generation
- 11 biomes (Whittaker diagram)
- Automatic chunk recycling

---

### 3.2 BiomeSystem
```typescript
import { BiomeSystem } from 'ebb-and-bloom-engine';

const biomes = new BiomeSystem(seed);
const biome = biomes.getBiome(temperature, moisture);
// Returns: ocean, beach, desert, grassland, forest, etc.
```

---

### 3.3 VegetationSpawner
```typescript
import { VegetationSpawner } from 'ebb-and-bloom-engine';

const vegetation = new VegetationSpawner(scene, seed);
vegetation.spawnInChunk(chunkX, chunkZ, biome, terrainHeightFunc);
// Spawns instanced trees filtered by steepness + clearance
```

---

### 3.4 CreatureSpawner
```typescript
import { CreatureSpawner } from 'ebb-and-bloom-engine';

const creatures = new CreatureSpawner(scene, entityManager, seed);
creatures.spawnInChunk(chunkX, chunkZ, biome);

// Each frame
creatures.update(deltaTime);
// Governors handle all behavior automatically
```

---

### 3.5 NPCSpawner
```typescript
import { NPCSpawner } from 'ebb-and-bloom-engine';

const npcs = new NPCSpawner(scene, entityManager, seed);
npcs.spawnInSettlement(settlement);
// NPCs with daily schedules
```

---

### 3.6 SettlementPlacer
```typescript
import { SettlementPlacer } from 'ebb-and-bloom-engine';

const settlements = new SettlementPlacer(seed);
settlements.placeInRegion(x, z, biome, terrainFunc, existingSettlements);
```

---

## 4. SYSTEMS (Infrastructure)

### 4.1 ToolSystem
```typescript
import { ToolSystem } from 'ebb-and-bloom-engine';

const tools = new ToolSystem(scene);

// Creature creates tool (driven by CognitiveSystem governor)
const tool = tools.createTool('digging_stick', position, creatureId, materials);

// Each frame
tools.update(deltaTime); // Handles degradation

// Query
const nearbyTools = tools.getToolsNear(position, radius);
```

---

### 4.2 StructureBuildingSystem
```typescript
import { StructureBuildingSystem } from 'ebb-and-bloom-engine';

const structures = new StructureBuildingSystem(scene);

// Creature starts project (driven by CooperationBehavior governor)
const projectId = structures.startProject('burrow', position, creatureId);

// Creatures contribute
structures.contribute(projectId, creatureId, workAmount);

// Each frame
structures.update(deltaTime); // Completes projects, degrades structures
```

---

## 5. UTILITIES

### 5.1 EnhancedRNG
```typescript
import { EnhancedRNG } from 'ebb-and-bloom-engine';

const rng = new EnhancedRNG('v1-seed-word-word');

// Basic
const value = rng.uniform(0, 1);      // 0-1
const int = rng.uniformInt(1, 10);   // 1-10
const bool = rng.boolean();          // true/false

// Distributions
const gauss = rng.normal(0, 1);      // Gaussian
const poisson = rng.poisson(5);      // Poisson
const choice = rng.choice(['a', 'b', 'c']); // Random element
```

---

### 5.2 Seed Management
```typescript
import { validateSeed, generateSeed } from 'ebb-and-bloom-engine';

const isValid = validateSeed('v1-green-valley-breeze'); // true
const newSeed = generateSeed(); // Generates v1-word-word-word
```

---

## 6. CONSTANTS

```typescript
import { 
    BIOLOGICAL_CONSTANTS,
    ECOLOGICAL_CONSTANTS,
    SOCIAL_CONSTANTS,
    PHYSICS_CONSTANTS
} from 'ebb-and-bloom-engine';

// Examples
BIOLOGICAL_CONSTANTS.KLEIBER_COEFFICIENT; // 70
ECOLOGICAL_CONSTANTS.DUNBARS_NUMBER; // 150
SOCIAL_CONSTANTS.BAND_MAX_POPULATION; // 50
PHYSICS_CONSTANTS.G; // 6.674e-11
```

---

## 7. COMPLETE EXAMPLE: Creating a Living World

```typescript
import { 
    ChunkManager,
    CreatureSpawner,
    EntityManager
} from 'ebb-and-bloom-engine';
import * as THREE from 'three';
import { EntityManager as YukaEntityManager } from 'yuka';

// Setup
const scene = new THREE.Scene();
const entityManager = new YukaEntityManager();
const seed = 'v1-green-valley-breeze';

// World generation
const chunks = new ChunkManager(scene, seed, entityManager);
const creatures = new CreatureSpawner(scene, entityManager, seed);

// Spawn
chunks.update(0, 0); // Load initial chunks
creatures.spawnInChunk(0, 0, 'grassland');

// Game loop
function update(deltaTime) {
    // Update all entities (governors handle behavior)
    entityManager.update(deltaTime);
    
    // Update creature systems
    creatures.update(deltaTime);
    
    // Render
    renderer.render(scene, camera);
}
```

**Result:**
- Terrain with biomes ✅
- Creatures with autonomous behavior ✅
- Governors decide everything ✅
- Synthesis creates visuals ✅
- NO PREFABS ✅

---

## 8. ARCHITECTURE PRINCIPLES

### Engine Does:
- ✅ Generate world from seed
- ✅ Provide governors that decide behavior
- ✅ Synthesize visuals from decisions
- ✅ Handle agent updates
- ✅ Export clean API

### Engine Does NOT:
- ❌ Handle input (game's job)
- ❌ Manage camera (game's job)
- ❌ Render (game uses THREE.js)
- ❌ UI/HUD (game's job)

### Game Does:
- ✅ Create scene, camera, renderer
- ✅ Handle player input
- ✅ Call engine.update()
- ✅ Render using THREE.js
- ✅ UI/HUD overlay

---

## 9. TESTING

```bash
# Run all tests
npm test

# Type check
npm run type-check

# Specific tests
npm run test:governors
npm run test:synthesis
npm run test:spawners
```

---

## 10. MIGRATION FROM PREFABS

**DFU Approach (Unity):**
- Prefab creatures
- Predefined meshes
- Hardcoded stats
- Manual placement

**Ebb & Bloom Approach (Governors):**
- Governors decide traits
- Synthesis creates meshes
- Stats from biology
- Emergent placement

**Example Translation:**

**DFU:**
```csharp
// Prefab approach
GameObject rat = Instantiate(ratPrefab);
rat.transform.position = spawnPos;
```

**Ebb & Bloom:**
```typescript
// Governor approach
const agent = new Vehicle();
agent.mass = 2; // kg (rat-sized)
agent.diet = 'omnivore';
agent.steering.add(new PredatorPreyBehavior());
agent.stateMachine = new LifecycleStateMachine(agent);

// Synthesis creates the visuals
const mesh = molecularSynthesis.generate(
    traitsFromGovernors(agent),
    mass,
    bodyPlan
);
```

---

**STATUS:** Engine API complete and documented. Ready for game implementation.

