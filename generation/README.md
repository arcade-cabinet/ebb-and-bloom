# Generation Package

**World generation logic - NOT engine code.**

Spawners/Generators decide WHAT to spawn and WHERE based on seeds and prefabs.
The engine just renders what's generated.

## Structure

```
generation/
├── spawners/          # All DFU-compatible spawners (proven 30-year-old logic)
│   ├── ChunkManager.ts           # Terrain chunk generation
│   ├── BiomeSystem.ts            # Biome determination
│   ├── CreatureSpawner.ts        # Creature spawning
│   ├── SettlementPlacer.ts       # Settlement placement
│   ├── VegetationSpawner.ts      # Vegetation spawning
│   ├── BuildingPrefab.ts         # Building prefab definitions
│   ├── BuildingSpawner.ts        # Building mesh spawning (DFU-compatible)
│   └── ...
│
└── README.md
```

## Philosophy

**Engine = Rendering + Physics + Coordination**
**Generation = What to spawn + Where to spawn + How to generate**

- Engine doesn't decide what spawns
- Generation uses prefabs/templates for definitions
- Generation uses generators/spawners to create instances
- Engine just renders the results

**Spawners and Generators are the same thing** - they both create/instantiate things.

## Usage

```typescript
import { ChunkManager } from '../generation/spawners/ChunkManager';
import { SettlementPlacer } from '../generation/spawners/SettlementPlacer';
import { BuildingPrefabRegistry } from '../generation/spawners/BuildingPrefab';
import { BuildingSpawner } from '../generation/spawners/BuildingSpawner';

// DFU spawners use prefabs (proven logic)
const prefab = BuildingPrefabRegistry.get(BuildingType.HOUSE);
const mesh = BuildingSpawner.generate(prefab, position, rotation);

const chunkManager = new ChunkManager(scene, seed, entityManager);
const settlementPlacer = new SettlementPlacer(scene, seed);

// Engine just renders
terrainSystem.update(playerX, playerZ);
```
