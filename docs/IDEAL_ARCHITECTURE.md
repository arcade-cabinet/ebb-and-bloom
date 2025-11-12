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
interface SeedMetadata {
  version: string;        // e.g., "v1"
  phrase: string;         // e.g., "cosmic-dawn-hope"
  
  // Note: NO timestamps or dates. Seed persistence is deterministic.
  // UI can display creation/play time from other sources if needed,
  // but seed storage itself has no time-based data.
}

export class ThreeWordSeedStore {
  private storageKey = 'ebb-bloom-seed';
  
  /**
   * Save seed to localStorage (deterministic - no timestamps)
   */
  save(seed: string): void {
    const [version, ...words] = seed.split('-');
    const metadata: SeedMetadata = {
      version,
      phrase: words.join('-')
    };
    localStorage.setItem(this.storageKey, JSON.stringify(metadata));
  }
  
  /**
   * Load seed from localStorage
   * Returns null if no seed exists or version incompatible
   */
  load(): string | null {
    const stored = localStorage.getItem(this.storageKey);
    if (!stored) return null;
    
    const metadata: SeedMetadata = JSON.parse(stored);
    
    // Check version compatibility
    if (!this.isVersionCompatible(metadata.version)) {
      console.warn(`Seed version ${metadata.version} incompatible, discarding`);
      return null;
    }
    
    return `${metadata.version}-${metadata.phrase}`;
  }
  
  /**
   * Generate new random 3-word seed with version prefix
   * Uses crypto.getRandomValues() for non-deterministic secure randomness
   * This is the ONLY place non-deterministic RNG is allowed (seed initialization)
   */
  generate(): string {
    const wordList = ['cosmic', 'stellar', 'quantum', 'nebula', 'dawn', 'hope', 'ember', 'twilight' /* ... 100+ words */];
    
    // Use crypto.getRandomValues() for secure random seed generation
    // This is acceptable because we're creating the INITIAL seed, not using it
    const randomBytes = new Uint32Array(3);
    crypto.getRandomValues(randomBytes);
    
    const words = [
      wordList[randomBytes[0] % wordList.length],
      wordList[randomBytes[1] % wordList.length],
      wordList[randomBytes[2] % wordList.length]
    ];
    
    return `v1-${words.join('-')}`;
  }
  
  /**
   * Check if seed version is compatible with current game version
   */
  private isVersionCompatible(version: string): boolean {
    // Only v1 seeds supported currently
    return version === 'v1';
  }
  
  /**
   * Upgrade seed to new version (future use)
   */
  upgrade(oldSeed: string): string | null {
    // Future: handle v1 → v2 migration
    return null;
  }
  
  /**
   * Clear saved seed
   */
  clear(): void {
    localStorage.removeItem(this.storageKey);
  }
}

// game/state/GameState.ts
interface GameState {
  seed: string;                                    // Current world seed
  seedStore: ThreeWordSeedStore;                  // Persistence layer
  
  initializeWorld(seed: string): void;            // Initialize from seed
  getScopedRNG(namespace: string): EnhancedRNG;  // Get scoped RNG
  
  saveSeed(): void;                               // Persist current seed
  loadSeed(): string | null;                      // Load persisted seed
}

// engine/rng/RNGRegistry.ts (existing)
class RNGRegistry {
  private globalSeed: string | null = null;
  private scopedGenerators: Map<string, EnhancedRNG> = new Map();
  
  setSeed(seed: string): void;
  getScopedRNG(namespace: string): EnhancedRNG;
  reset(): void;                                  // Clear all scoped RNGs
}
```

### Seed Lifecycle

```
1. NEW GAME:
   User enters seed OR generates random seed
     ↓
   GameState.initializeWorld(seed)
     ↓
   rngRegistry.setSeed(seed)
     ↓
   seedStore.save(seed)
     ↓
   All systems use scoped RNGs

2. LOAD GAME:
   seedStore.load() → seed
     ↓
   GameState.initializeWorld(seed)
     ↓
   rngRegistry.setSeed(seed)
     ↓
   World regenerates deterministically

3. VERSION UPGRADE (Future):
   seedStore.load() → old v1 seed
     ↓
   seedStore.upgrade(v1 seed) → v2 seed
     ↓
   GameState.initializeWorld(v2 seed)
```

### Rules

1. **Single Source of Truth**: GameState.seed is the ONLY seed
2. **No Direct Math.random()**: All randomness through rngRegistry (EXCEPT seed generation)
3. **Seed Generation Exception**: ThreeWordSeedStore.generate() uses crypto.getRandomValues() for secure initial seed creation
4. **Deterministic Namespaces**: Same namespace = same RNG sequence
5. **Versioned Seeds**: Include version prefix (e.g., "v1-cosmic-dawn-hope")
6. **Persistence**: Save/load through ThreeWordSeedStore
7. **Version Compatibility**: Check compatibility on load, discard incompatible seeds
8. **No Timestamps**: Use deterministic counters/sequence numbers, not Date.now()

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
  name: string;
  priority: number;                                    // Execution order (lower = earlier)
  
  update(world: World, dt: number): void;              // Tick update
  processIntent(intent: GovernorIntent, world: World): void;  // Handle player/AI intent
}

// Governors read/write ECS components
class PhysicsGovernor implements Governor {
  name = 'physics';
  priority = 1;  // Run first
  
  update(world: World, dt: number) {
    const entities = world.with('physics', 'position');
    for (const entity of entities) {
      // Apply physics laws (gravity, collision, etc.)
    }
  }
  
  processIntent(intent: GovernorIntent, world: World) {
    if (intent.action === 'smite') {
      // Apply force to entities in area
    }
  }
}
```

### Controller Contracts

```typescript
// engine/ecs/controllers/PlayerGovernorController.ts
interface GovernorController {
  submitIntent(intent: GovernorIntent): Promise<IntentResult>;
  getEnergyBudget(): number;
  getAvailableActions(): GovernorAction[];
}

class PlayerGovernorController implements GovernorController {
  constructor(
    private executor: GovernorActionExecutor,
    private energyBudget: number = 100
  ) {}
  
  async submitIntent(intent: GovernorIntent): Promise<IntentResult> {
    // Validate energy cost
    const cost = this.calculateCost(intent);
    if (cost > this.energyBudget) {
      return { success: false, reason: 'Insufficient energy' };
    }
    
    // Execute through law-based executor
    const result = await this.executor.execute(intent);
    
    // Deduct energy on success
    if (result.success) {
      this.energyBudget -= cost;
    }
    
    return result;
  }
  
  getEnergyBudget(): number {
    return this.energyBudget;
  }
  
  getAvailableActions(): GovernorAction[] {
    // Returns actions player can afford
    return this.executor.getAllActions().filter(
      action => action.cost <= this.energyBudget
    );
  }
  
  private calculateCost(intent: GovernorIntent): number {
    // Cost determined by laws, not arbitrary
    return this.executor.calculateCost(intent);
  }
}

// engine/ecs/controllers/RivalAIController.ts
class RivalAIController implements GovernorController {
  constructor(
    private executor: GovernorActionExecutor,
    private energyBudget: number = 100,
    private strategy: AIStrategy
  ) {}
  
  async submitIntent(intent: GovernorIntent): Promise<IntentResult> {
    // Same implementation as player - IDENTICAL CODE PATH
    // This enforces fair competition
  }
  
  // AI uses same energy budget and costs as player
  // No cheating possible
}
```

### Service Contracts

```typescript
// engine/ecs/services/MaterialDataProvider.ts
interface DataProvider<T> {
  get(id: string): T | undefined;
  getAll(): T[];
  query(filter: (item: T) => boolean): T[];
}

class MaterialDataProvider implements DataProvider<Material> {
  constructor(private registry: MaterialRegistry) {}
  
  get(id: string): Material | undefined {
    return this.registry.get(id);
  }
  
  getAll(): Material[] {
    return Object.values(this.registry.listAll());
  }
  
  query(filter: (item: Material) => boolean): Material[] {
    return this.getAll().filter(filter);
  }
  
  // Additional domain-specific queries
  getByElement(element: string): Material | undefined {
    return this.get(`element-${element.toLowerCase()}`);
  }
  
  getByBiome(biome: BiomeType): Material | undefined {
    return this.get(`biome-${biome}`);
  }
}

// engine/ecs/services/BiomeDataProvider.ts
class BiomeDataProvider implements DataProvider<BiomeData> {
  constructor(private biomeSystem: BiomeSystem) {}
  
  get(id: string): BiomeData | undefined {
    // Lookup biome data by ID
  }
  
  getAll(): BiomeData[] {
    // Return all 11 biome types
  }
  
  query(filter: (item: BiomeData) => boolean): BiomeData[] {
    return this.getAll().filter(filter);
  }
  
  // Domain-specific queries
  getByTemperaturePrecipitation(temp: number, precip: number): BiomeData {
    return this.biomeSystem.whittakerDiagram(temp, precip);
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
interface ChunkCoords {
  x: number;
  z: number;
}

interface ChunkData {
  coords: ChunkCoords;
  biome: BiomeType;
  placements: LayerPlacement[];
  temperature: number;
  precipitation: number;
  elevation: number;
}

class ChunkManager {
  private activeChunks: Map<string, ChunkData>;
  private readonly gridSize: number = 7; // 7x7 streaming grid
  
  constructor(
    private rng: RNGRegistry,
    private biomeSystem: BiomeSystem,
    private spawners: Spawner[]
  ) {}
  
  generateChunk(chunkCoords: ChunkCoords): ChunkData {
    // Deterministic RNG scoped to chunk coordinates
    const rng = this.rng.getScopedRNG(`chunk-${chunkCoords.x}-${chunkCoords.z}`);
    
    // Classify biome based on temperature/precipitation
    const biome = this.biomeSystem.classify(chunkCoords, rng);
    
    // Generate placements from all registered spawners
    const placements: LayerPlacement[] = [];
    for (const spawner of this.spawners) {
      const spawnerPlacements = spawner.generate(rng, biome, chunkCoords);
      placements.push(...spawnerPlacements);
    }
    
    return {
      coords: chunkCoords,
      biome: biome.type,
      placements,
      temperature: biome.temperature,
      precipitation: biome.precipitation,
      elevation: biome.elevation
    };
  }
  
  updateActiveGrid(centerChunk: ChunkCoords): void {
    // Maintain 7x7 grid around center
    const halfGrid = Math.floor(this.gridSize / 2);
    
    for (let x = -halfGrid; x <= halfGrid; x++) {
      for (let z = -halfGrid; z <= halfGrid; z++) {
        const coords = {
          x: centerChunk.x + x,
          z: centerChunk.z + z
        };
        
        const key = `${coords.x},${coords.z}`;
        if (!this.activeChunks.has(key)) {
          const chunk = this.generateChunk(coords);
          this.activeChunks.set(key, chunk);
        }
      }
    }
    
    // Remove chunks outside grid
    this.pruneDistantChunks(centerChunk, halfGrid);
  }
  
  private pruneDistantChunks(center: ChunkCoords, radius: number): void {
    for (const [key, chunk] of this.activeChunks) {
      const dx = Math.abs(chunk.coords.x - center.x);
      const dz = Math.abs(chunk.coords.z - center.z);
      if (dx > radius || dz > radius) {
        this.activeChunks.delete(key);
      }
    }
  }
}
```

### BiomeSystem Architecture

```typescript
// engine/ecs/systems/BiomeSystem.ts
enum BiomeType {
  OCEAN = 'ocean',
  BEACH = 'beach',
  DESERT = 'desert',
  GRASSLAND = 'grassland',
  FOREST = 'forest',
  RAINFOREST = 'rainforest',
  SAVANNA = 'savanna',
  TUNDRA = 'tundra',
  TAIGA = 'taiga',
  SNOW = 'snow',
  MOUNTAIN = 'mountain'
}

interface BiomeClassification {
  type: BiomeType;
  temperature: number;      // 0-1 range
  precipitation: number;    // 0-1 range
  elevation: number;        // 0-1 range
}

class BiomeSystem {
  constructor(private genesis: GenesisConstants) {}
  
  classify(coords: ChunkCoords, rng: EnhancedRNG): BiomeClassification {
    // Deterministic temperature/precipitation from chunk coords + seed
    const temperature = this.getTemperature(coords, rng);
    const precipitation = this.getPrecipitation(coords, rng);
    const elevation = this.getElevation(coords, rng);
    
    // Whittaker biome diagram classification
    const type = this.whittakerDiagram(temperature, precipitation, elevation);
    
    return {
      type,
      temperature,
      precipitation,
      elevation
    };
  }
  
  private getTemperature(coords: ChunkCoords, rng: EnhancedRNG): number {
    // Base temperature from cosmic genesis (galaxy position affects climate)
    const baseTemp = this.genesis.planetaryTemperature;
    
    // Latitude effect (distance from equator = chunk.z)
    const latitude = Math.abs(coords.z) / 100;
    const latitudeEffect = 1.0 - (latitude * 0.7);
    
    // Noise variation
    const noise = rng.noise2D(coords.x * 0.01, coords.z * 0.01);
    
    return Math.max(0, Math.min(1, baseTemp * latitudeEffect + noise * 0.2));
  }
  
  private getPrecipitation(coords: ChunkCoords, rng: EnhancedRNG): number {
    // Precipitation patterns from planetary water content
    const baseWater = this.genesis.planetaryWaterContent;
    
    // Noise-based weather patterns
    const noise = rng.noise2D(coords.x * 0.02, coords.z * 0.02);
    
    return Math.max(0, Math.min(1, baseWater + noise * 0.3));
  }
  
  private getElevation(coords: ChunkCoords, rng: EnhancedRNG): number {
    // Multi-octave noise for realistic terrain
    let elevation = 0;
    let amplitude = 1.0;
    let frequency = 0.005;
    
    for (let i = 0; i < 4; i++) {
      elevation += rng.noise2D(coords.x * frequency, coords.z * frequency) * amplitude;
      amplitude *= 0.5;
      frequency *= 2.0;
    }
    
    return Math.max(0, Math.min(1, elevation * 0.5 + 0.5));
  }
  
  private whittakerDiagram(temp: number, precip: number, elevation: number): BiomeType {
    // Elevation overrides (mountains, ocean)
    if (elevation > 0.8) return BiomeType.MOUNTAIN;
    if (elevation < 0.3) return BiomeType.OCEAN;
    if (elevation < 0.35) return BiomeType.BEACH;
    
    // Whittaker biome classification
    if (temp < 0.2) {
      return precip > 0.3 ? BiomeType.TUNDRA : BiomeType.SNOW;
    } else if (temp < 0.4) {
      return precip > 0.5 ? BiomeType.TAIGA : BiomeType.TUNDRA;
    } else if (temp < 0.6) {
      if (precip < 0.3) return BiomeType.DESERT;
      if (precip < 0.6) return BiomeType.GRASSLAND;
      return BiomeType.FOREST;
    } else {
      if (precip < 0.3) return BiomeType.DESERT;
      if (precip < 0.5) return BiomeType.SAVANNA;
      if (precip < 0.7) return BiomeType.FOREST;
      return BiomeType.RAINFOREST;
    }
  }
}
```

### Deterministic Factory Pattern

All spawners must implement deterministic factories:

```typescript
// engine/ecs/systems/spawners/base.ts
interface DeterministicFactory<T> {
  create(rng: EnhancedRNG, ...params: any[]): T;
  validate(output: T): boolean;
}

interface ComponentArchetype {
  components: {
    physics?: PhysicsComponent;
    chemistry?: ChemistryComponent;
    biology?: BiologyComponent;
    visual?: VisualComponent;
    governance?: GovernanceComponent;
  };
  placement: LayerPlacement;
  metadata: {
    seed: string;              // World seed used to generate this entity
    biome: BiomeType;          // Biome where entity was spawned
    spawner: string;           // Spawner that created this entity
    sequenceNumber: number;    // Deterministic counter from spawner (not timestamp)
  };
}

abstract class BaseSpawner implements Spawner, DeterministicFactory<ComponentArchetype[]> {
  abstract name: string;
  private sequenceCounter: number = 0;  // Deterministic counter, NOT timestamp
  
  generate(rng: EnhancedRNG, biome: BiomeType, chunk: ChunkCoords): ComponentArchetype[] {
    const archetypes = this.create(rng, biome, chunk);
    
    // Add deterministic sequence numbers (not timestamps)
    for (const archetype of archetypes) {
      archetype.metadata.sequenceNumber = this.sequenceCounter++;
      
      // Validate archetype
      if (!this.validate(archetype)) {
        throw new Error(`Invalid archetype from ${this.name}`);
      }
    }
    
    return archetypes;
  }
  
  abstract create(rng: EnhancedRNG, biome: BiomeType, chunk: ChunkCoords): ComponentArchetype[];
  
  validate(archetype: ComponentArchetype): boolean {
    // Must have at least one component
    const hasComponent = Object.values(archetype.components).some(c => c !== undefined);
    
    // Must have valid placement
    const hasPlacement = archetype.placement && 
      archetype.placement.layer >= 0 && 
      archetype.placement.layer <= 3;
    
    // Must have metadata
    const hasMetadata = archetype.metadata && 
      archetype.metadata.seed && 
      archetype.metadata.spawner === this.name &&
      typeof archetype.metadata.sequenceNumber === 'number';
    
    return hasComponent && hasPlacement && hasMetadata;
  }
  
  /**
   * Reset sequence counter (for testing or world reset)
   */
  resetSequence(): void {
    this.sequenceCounter = 0;
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
