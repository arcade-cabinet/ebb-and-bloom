# Ebb & Bloom - IDEAL Architecture Specification

**Version**: 1.0  
**Status**: Blueprint for Phase 4+ Refactoring  
**Purpose**: Define the target architecture for test-driven development

---

## Overview

This document specifies the **IDEAL architecture** - the target state toward which all refactoring and testing efforts should aim. Tests will be written against THIS architecture (even though code may not exist yet), then implementations will be refactored to match.

**Key Principle**: Tests define the blueprint. Code follows tests.

---

## 1. Code Organization (Phase 4 Consolidation)

### Current State (Broken)
```
agents/
  ├─ governors/          ❌ Wrong location
  ├─ tables/             ❌ Wrong location
  └─ controllers/        ❌ Wrong location

generation/
  ├─ spawners/           ❌ Wrong location
  ├─ chunk/              ❌ Wrong location
  └─ biome/              ❌ Wrong location
```

### IDEAL State (Target)
```
engine/
  ├─ ecs/
  │   ├─ governors/                    ✅ Governor systems
  │   │   ├─ PhysicsGovernor.ts
  │   │   ├─ BiologyGovernor.ts
  │   │   └─ ...11 total governors
  │   │
  │   ├─ constants/                    ✅ Law tables & constants
  │   │   ├─ PeriodicTable.ts
  │   │   ├─ PhysicsConstants.ts
  │   │   └─ ...law data
  │   │
  │   ├─ systems/                      ✅ ECS systems
  │   │   ├─ spawners/
  │   │   │   ├─ VegetationSpawner.ts
  │   │   │   ├─ CreatureSpawner.ts
  │   │   │   └─ ...procedural spawners
  │   │   ├─ ChunkManager.ts
  │   │   └─ BiomeSystem.ts
  │   │
  │   ├─ controllers/                  ✅ Intent controllers
  │   │   ├─ PlayerGovernorController.ts
  │   │   └─ RivalAIController.ts
  │   │
  │   └─ services/                     ✅ Data providers
  │       ├─ MaterialDataProvider.ts
  │       └─ BiomeDataProvider.ts
  │
  ├─ rendering/
  │   ├─ stage/                        ✅ Stage/Layer system
  │   │   ├─ StageSystem.ts
  │   │   ├─ LayerManager.ts
  │   │   └─ PlacementResolver.ts
  │   │
  │   ├─ sdf/
  │   │   ├─ renderer/                 ✅ SDF raymarching
  │   │   └─ materials/                ✅ Material registry
  │   │
  │   ├─ instanced/                    ✅ Particle systems
  │   │   └─ InstancedRenderer.tsx
  │   │
  │   ├─ assets/
  │   │   └─ ambientcg/                ✅ Texture integration
  │   │       ├─ TextureCache.ts
  │   │       └─ MaterialSynthesizer.ts
  │   │
  │   └─ RenderOrchestrator.ts         ✅ Facade coordinator
  │
  ├─ input/
  │   └─ gyroscope/                    ✅ Gyro camera control
  │       └─ GyroGovernorCamera.ts
  │
  ├─ rng/                              ✅ RNG system
  │   └─ RNGRegistry.ts
  │
  └─ stores/                           ✅ Persistence
      └─ worldSeed.ts                  ✅ Three-word seed storage
```

---

## 2. Single RNG Seed Architecture

### Flow Diagram
```
ThreeWordSeedStore (persistence)
  ↓
GameState.initializeWorld(seed: string)
  ↓
rngRegistry.setSeed(seed)
  ↓
Scoped RNG Generators (via ECS context injection)
  ├─ genesis-rng      → GenesisConstants
  ├─ chunk-{x}-{z}    → ChunkManager
  ├─ biome-{id}       → BiomeSystem  
  ├─ spawner-{type}   → VegetationSpawner, CreatureSpawner
  ├─ governor-{name}  → PhysicsGovernor, BiologyGovernor
  └─ render-{layer}   → StageSystem, MaterialRegistry
```

### Implementation Contract

```typescript
// engine/stores/worldSeed.ts
export class ThreeWordSeedStore {
  save(seed: string): void;
  load(): string | null;
  generate(): string; // Generates random 3-word seed
}

// game/state/GameState.ts
interface GameState {
  seed: string;
  initializeWorld(seed: string): void;
  getScopedRNG(namespace: string): EnhancedRNG;
}

// engine/rng/RNGRegistry.ts (existing)
class RNGRegistry {
  setSeed(seed: string): void;
  getScopedRNG(namespace: string): EnhancedRNG;
}
```

### Rules

1. **Single Source of Truth**: GameState.seed is the ONLY seed
2. **No Direct Math.random()**: All randomness through rngRegistry
3. **Deterministic Namespaces**: Same namespace = same RNG sequence
4. **Versioned Seeds**: Include version prefix (e.g., "v1-cosmic-dawn-hope")

---

## 3. Stage/Layer System Architecture

### Four Spatial Bands

```typescript
enum LayerDepth {
  FOREGROUND_MICRO = 0,   // 0-2m: Quantum/molecular scale
  NEARGROUND_LIFE = 1,    // 2-10m: Creatures, tools, buildings
  BACKGROUND_BIOME = 2,   // 10-50m: Terrain, vegetation, horizon
  SKY_COSMIC = 3          // 50m+: Atmosphere, celestial objects
}
```

### File Locations

```
engine/rendering/stage/
  ├─ StageSystem.ts              # Orchestrates layers
  ├─ LayerManager.ts             # Manages depth bands
  ├─ PlacementResolver.ts        # Resolves LayerPlacement intents
  └─ types.ts                    # LayerPlacement, StageDescriptor

engine/input/gyroscope/
  └─ GyroGovernorCamera.ts       # Device orientation → camera transform
```

### Data Flow

```
ChunkManager.generate(seed) → ChunkData { placements: LayerPlacement[] }
  ↓
BiomeSystem.classify() → BiomeType + LayerPlacement[]
  ↓
Spawners.generate() → LayerPlacement[]
  ↓
PlacementResolver.resolve() → ValidatedPlacement[]
  ↓
StageSystem.addToLayer(layer, placements)
  ↓
LayerManager.getPrimitives(layer) → SDFPrimitive[]
  ↓
SDFRenderer.renderLayer(layer, primitives)
```

### Integration with SDFRenderer

```typescript
// engine/rendering/stage/StageSystem.ts
class StageSystem {
  addToLayer(layer: LayerDepth, placements: LayerPlacement[]): void;
  getLayerPrimitives(layer: LayerDepth): SDFPrimitive[];
  setCamera(camera: GyroGovernorCamera): void;
  render(renderer: SDFRenderer): void;
}

// engine/rendering/sdf/renderer/SDFRenderer.tsx
interface SDFRenderer {
  renderLayer(
    layer: LayerDepth, 
    primitives: SDFPrimitive[],
    uniforms: LayerUniforms
  ): void;
}
```

---

## 4. Rendering Pipeline Integration

### RenderOrchestrator (Facade Pattern)

```
RenderOrchestrator
  ├─ StageSystem (layer organization)
  ├─ SDFRenderer (raymarching)
  ├─ MaterialRegistry (PBR materials)
  ├─ AmbientCGCache (texture assets)
  └─ InstancedRenderer (particles)
```

### File Structure

```
engine/rendering/
  ├─ RenderOrchestrator.ts           # Facade coordinator
  │
  ├─ stage/
  │   └─ StageSystem.ts
  │
  ├─ sdf/
  │   ├─ renderer/
  │   │   └─ SDFRenderer.tsx
  │   └─ materials/
  │       └─ MaterialRegistry.ts
  │
  ├─ instanced/
  │   └─ InstancedRenderer.tsx
  │
  └─ assets/
      └─ ambientcg/
          ├─ TextureCache.ts
          └─ MaterialSynthesizer.ts
```

### Material Flow

```
AmbientCG API → TextureCache → MaterialSynthesizer → MaterialRegistry → SDFRenderer
                     ↓
              Deterministic caching
              (seed-based atlas generation)
```

### Contract

```typescript
// engine/rendering/RenderOrchestrator.ts
class RenderOrchestrator {
  constructor(
    stage: StageSystem,
    sdfRenderer: SDFRenderer,
    materialRegistry: MaterialRegistry,
    textureCache: AmbientCGCache,
    instancedRenderer: InstancedRenderer
  );
  
  render(camera: Camera, scene: Scene): void;
  addPlacement(placement: LayerPlacement): void;
  getMaterial(id: string): Material;
}
```

---

## 5. ECS Integration

### Spawner Architecture

```typescript
// engine/ecs/systems/spawners/base.ts
interface Spawner {
  generate(
    rng: EnhancedRNG, 
    biome: BiomeType, 
    chunk: ChunkCoords
  ): ComponentArchetype[];
}

// Component archetype emitted by spawners
interface ComponentArchetype {
  components: {
    physics?: PhysicsComponent;
    chemistry?: ChemistryComponent;
    biology?: BiologyComponent;
    visual?: VisualComponent;
  };
  placement: LayerPlacement;
}
```

### Spawner Types

```
engine/ecs/systems/spawners/
  ├─ VegetationSpawner.ts     # Trees, plants, fungi
  ├─ CreatureSpawner.ts       # Animals, organisms
  ├─ StructureSpawner.ts      # Rocks, terrain features
  └─ SettlementSpawner.ts     # Buildings (late game)
```

### Governor Integration

```typescript
// engine/ecs/governors/base.ts
interface Governor {
  update(world: World, dt: number): void;
  processIntent(intent: GovernorIntent, world: World): void;
}

// Governors read/write ECS components
class PhysicsGovernor implements Governor {
  update(world: World, dt: number) {
    const entities = world.with('physics', 'position');
    for (const entity of entities) {
      // Apply physics laws
    }
  }
}
```

### Data Flow

```
PlayerGovernorController.submitIntent() → GovernorIntent
  ↓
GovernorActionExecutor.execute(intent)
  ↓
PhysicsGovernor.processIntent(intent)
  ↓
ECS World (component updates)
  ↓
StageSystem.sync(world) → Update layer placements
  ↓
Render pipeline
```

---

## 6. Procedural Generation Pipeline

### ChunkManager Architecture

```typescript
// engine/ecs/systems/ChunkManager.ts
class ChunkManager {
  constructor(
    rng: RNGRegistry,
    biomeSystem: BiomeSystem,
    spawners: Spawner[]
  );
  
  generateChunk(chunkCoords: ChunkCoords): ChunkData {
    const rng = this.rng.getScopedRNG(`chunk-${chunkCoords.x}-${chunkCoords.z}`);
    const biome = this.biomeSystem.classify(chunkCoords);
    
    const placements: LayerPlacement[] = [];
    for (const spawner of this.spawners) {
      placements.push(...spawner.generate(rng, biome, chunkCoords));
    }
    
    return { biome, placements };
  }
}
```

### BiomeSystem Architecture

```typescript
// engine/ecs/systems/BiomeSystem.ts
class BiomeSystem {
  classify(coords: ChunkCoords): BiomeType {
    const temperature = this.getTemperature(coords);
    const precipitation = this.getPrecipitation(coords);
    return this.whittakerDiagram(temperature, precipitation);
  }
  
  private whittakerDiagram(temp: number, precip: number): BiomeType {
    // 11 biome classifications
  }
}
```

### Integration Flow

```
GameState.initializeWorld(seed)
  ↓
ChunkManager.generateChunk({x: 0, z: 0})
  ↓
BiomeSystem.classify() → BiomeType.FOREST
  ↓
VegetationSpawner.generate() → [Tree placements...]
CreatureSpawner.generate() → [Creature placements...]
  ↓
StageSystem.addPlacements(placements)
  ↓
PlacementResolver.resolveCollisions()
  ↓
ECS World.addEntities(archetypes)
  ↓
Render
```

---

## 7. Testing Strategy

### IDEAL Test Structure

```
tests/ideal/
  ├─ architecture/
  │   ├─ codeOrganization.spec.ts      # File locations correct
  │   └─ singleSeed.spec.ts            # RNG flow correct
  │
  ├─ rendering/
  │   ├─ stageSystem.spec.ts           # Layer organization
  │   ├─ sdfRenderer.spec.ts           # Raymarching
  │   ├─ materialRegistry.spec.ts      # Materials
  │   └─ ambientcg.spec.ts             # Texture integration
  │
  ├─ ecs/
  │   ├─ spawners.spec.ts              # Procedural generation
  │   ├─ governors.spec.ts             # Governor systems
  │   └─ chunkManager.spec.ts          # Chunk streaming
  │
  └─ integration/
      ├─ seedDeterminism.spec.ts       # Same seed = same world
      └─ phase4Consolidation.spec.ts   # Correct file locations
```

### Test Approach

1. **Write tests against IDEAL architecture** (even if code doesn't exist)
2. **Tests will fail initially** (RED phase)
3. **Refactor code to match architecture** (consolidate files)
4. **Implement missing systems** (Stage/Layer, etc.)
5. **Fix implementations until tests pass** (GREEN phase)

---

## 8. Phase 4 Migration Checklist

### File Moves

```bash
# Governors
mv agents/governors/* → engine/ecs/governors/

# Constants
mv agents/tables/* → engine/ecs/constants/

# Spawners
mv generation/spawners/* → engine/ecs/systems/spawners/
mv generation/chunk/ChunkManager.ts → engine/ecs/systems/
mv generation/biome/BiomeSystem.ts → engine/ecs/systems/

# Controllers
mv agents/controllers/* → engine/ecs/controllers/
```

### New Files Needed

```bash
# Stage/Layer System
touch engine/rendering/stage/StageSystem.ts
touch engine/rendering/stage/LayerManager.ts
touch engine/rendering/stage/PlacementResolver.ts

# Gyroscope Camera
touch engine/input/gyroscope/GyroGovernorCamera.ts

# Seed Persistence
touch engine/stores/worldSeed.ts

# Render Orchestrator
touch engine/rendering/RenderOrchestrator.ts

# AmbientCG Integration
touch engine/rendering/assets/ambientcg/TextureCache.ts
touch engine/rendering/assets/ambientcg/MaterialSynthesizer.ts
```

### Update Imports

All import paths must be updated to reflect new locations.

---

## 9. Success Criteria

### Architecture
- ✅ All code in correct locations per this spec
- ✅ No circular dependencies
- ✅ Clear separation of concerns

### Single Seed
- ✅ One seed stored in GameState
- ✅ All RNG through rngRegistry.getScopedRNG()
- ✅ Same seed produces identical worlds

### Rendering
- ✅ Stage/Layer system organizing all rendering
- ✅ Four depth bands working correctly
- ✅ Gyroscope camera integrated
- ✅ SDFRenderer receiving layer primitives

### ECS
- ✅ Spawners emitting ComponentArchetypes
- ✅ Governors operating on ECS signals
- ✅ ChunkManager + BiomeSystem producing placements

### Tests
- ✅ All IDEAL tests passing
- ✅ Determinism verified (seed replay)
- ✅ Performance targets met

---

**This is the target architecture. All development should aim toward this state.**
