# Ebb & Bloom Engine

Governor-based world simulation engine with molecular synthesis.

---

## What is this?

The **engine** is a complete world simulation system based on Daggerfall Unity's architecture, but using governors + synthesis instead of prefabs.

**Main API:** `WorldManager`

```typescript
import { WorldManager } from 'ebb-and-bloom-engine';

const world = new WorldManager();
world.initialize({ seed, scene, camera });

// Game loop
function update(delta) {
    world.update(delta);
    // Governors handle all creature behavior
    // Synthesis creates all visuals
    // Player collision automatic
}
```

---

## Architecture

### Governors (15) - Autonomous Decision Makers
Located in `governors/`

**Physics (2):**
- GravityBehavior
- TemperatureBehavior

**Biology (5):**
- MetabolismSystem
- LifecycleStateMachine
- ReproductionSystem
- GeneticsSystem
- CognitiveSystem

**Ecology (5):**
- FlockingGovernor
- PredatorPreyBehavior
- TerritorialBehavior
- ForagingBehavior
- MigrationBehavior

**Social (3):**
- HierarchyBehavior
- WarfareBehavior
- CooperationBehavior

---

### Synthesis (6) - Visual Creation
Located in `procedural/`

1. **MolecularSynthesis** - Protein/calcium/chitin → geometry deformations
2. **PigmentationSynthesis** - Diet + environment → biological pigments
3. **StructureSynthesis** - Materials → simple structures
4. **BuildingArchitect** - Governance type → building complexity
5. **InteriorGenerator** - Room layouts + furniture
6. **WeaponSynthesis** - Materials → weapons

---

### Core Systems (5) - DFU-Based
Located in `core/`

1. **WorldManager** - Central coordinator (DFU: GameManager)
2. **TerrainSystem** - Chunk streaming (DFU: StreamingWorld)
3. **PlayerController** - Movement + collision (DFU: PlayerMotor)
4. **CreatureManager** - Spawning + governor integration
5. **CityPlanner** - Social governor-driven city layouts

---

### Spawners - World Generation
Located in `spawners/`

- **ChunkManager** - 7x7 chunk streaming (DFU pattern)
- **BiomeSystem** - 11 biomes (Whittaker diagram)
- **VegetationSpawner** - Instanced trees
- **CreatureSpawner** - Governor-driven creatures
- **NPCSpawner** - Daily schedules
- **SettlementPlacer** - Law-based placement
- **WaterSystem** - Animated shaders

---

### Systems - Infrastructure
Located in `systems/`

- **ToolSystem** - Tool creation + knowledge transfer
- **StructureBuildingSystem** - Cooperative construction
- **TradeSystem** - Economic exchange
- **WorkshopSystem** - Crafting
- **PackFormationSystem** - Social groups
- And more...

---

## Key Differences from DFU

| Feature | Daggerfall Unity | Ebb & Bloom |
|---------|-----------------|-------------|
| Creatures | Billboard sprites (fixed) | Molecular synthesis (infinite) |
| NPCs | Sprite variants (576 combos) | Pigmentation synthesis (infinite) |
| Buildings | RMB prefabs (500 blocks) | Architecture synthesis (infinite) |
| Behavior | Unity NavMesh | Yuka governors (autonomous) |
| Coloring | Fixed sprites | Diet + environment → pigments |
| Variation | Artist-limited | Chemistry-unlimited |

---

## Testing

```bash
# All tests
npm test

# Specific suites
npx vitest run tests/unit/governors.test.ts
npx vitest run tests/unit/synthesis.test.ts
npx vitest run tests/integration/world.test.ts

# Coverage
npm test -- --coverage
```

**Current:** 45/52 tests passing (87%)

---

## Files

- **68 TypeScript files**
- **~10,000 lines of code**
- **977 lines of tests**
- **15 governors**
- **6 synthesis systems**
- **5 core systems**

---

## See Also

- `../ENGINE.md` - Complete API documentation
- `../DFU_ARCHITECTURE_STUDY.md` - How we replicated DFU
- `governors/README.md` - Governor architecture details
- `../game/` - Game built using this engine

---

**The engine is ready. Build games with it.**

