# ECS Package - Ebb & Bloom

**Purpose**: Entity-Component-System architecture using BitECS. This is the **CORE** of the game - all game state and logic lives here.

## Architecture Philosophy

**ECS = Single Source of Truth**

- **Components**: Pure data (Position, Velocity, Inventory, Traits, Pack, Critter)
- **Systems**: Pure logic that modifies components
- **Entities**: Just IDs (numbers) that link components together
- **World**: Container that holds all entities and components

**Rule**: Phaser and Zustand can only READ from ECS, never WRITE.

## Package Structure

```
ecs/
├── components/          # Data containers
│   ├── index.ts         # Core components (Position, Velocity, Inventory, Sprite)
│   └── traits.ts        # 10 trait components + synergy calculator
│
├── systems/             # Game logic (modify components)
│   ├── MovementSystem.ts      # Apply velocity to position
│   ├── CraftingSystem.ts      # Recipe matching & inventory updates
│   ├── SnappingSystem.ts      # Affinity-based resource combining
│   ├── PackSystem.ts          # Pack formation, loyalty, roles
│   ├── PollutionSystem.ts     # Global pollution tracking & shocks
│   └── BehaviorSystem.ts      # Playstyle profiling (Harmony/Conquest/Frolick)
│
├── entities/            # Entity factories
│   └── index.ts         # createPlayer(), createCritter(), etc.
│
└── world.ts             # ECS world creation & management
```

## How to Use

### 1. Create a World
```typescript
import { createWorld } from 'bitecs';
import { resetWorld } from './ecs/world';

const world = resetWorld(); // Creates fresh ECS world
```

### 2. Create an Entity
```typescript
import { createPlayer } from './ecs/entities';

const playerEid = createPlayer(world, x, y);
// Returns: entity ID (number)
```

### 3. Read Component Data
```typescript
import { Position, Velocity } from './ecs/components';

const x = Position.x[playerEid];
const y = Position.y[playerEid];
const vx = Velocity.x[playerEid];
```

### 4. Run Systems
```typescript
import { createMovementSystem } from './ecs/systems/MovementSystem';

const movementSystem = createMovementSystem();

// In game loop
function update(delta) {
  movementSystem(world, delta);
}
```

## Current Implementation

### Components (Fully Implemented) ✅
- **Position**: `{ x: f32, y: f32 }`
- **Velocity**: `{ x: f32, y: f32 }`
- **Inventory**: `{ ore: ui16, water: ui16, alloy: ui16, ... }`
- **Sprite**: `{ textureKey: ui32 }`
- **Pack**: `{ leaderId: ui32, loyalty: f32, size: ui8, affMask: ui32, packType: ui8 }`
- **Critter**: `{ species: ui8, packId: ui32, role: ui8, inheritedTrait: ui8, needState: ui8 }`
- **10 Trait Components**: FlipperFeet, ChainshawHands, DrillArms, etc.

### Systems (Fully Implemented) ✅
1. **MovementSystem** - Applies velocity to position with friction
2. **CraftingSystem** - Validates recipes, updates inventory
3. **SnappingSystem** - Affinity-based resource combining (8-bit flags)
4. **PackSystem** - Formation (3-15 critters), loyalty (0-1), roles, schism
5. **PollutionSystem** - Global tracking (0-100%), 3 shock types
6. **BehaviorSystem** - Playstyle profiling (rolling 100-action window)

### Tests ✅
- **57/57 passing**
- Components: 4 tests
- Systems: 53 tests total
- Coverage: Comprehensive

## Links

- **Vision**: [/docs/VISION.md](../docs/VISION.md) - Why we use ECS
- **Architecture**: [/docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md) - ECS data flow
- **Tech Context**: [/memory-bank/techContext.md](../memory-bank/techContext.md) - Implementation details
- **Progress**: [/memory-bank/PROGRESS_ASSESSMENT.md](../memory-bank/PROGRESS_ASSESSMENT.md) - Status

## Next Steps (Stage 2)

- Add Combat components (Health, Combat, Momentum)
- Add Ritual components (Ritual, Abyss, Rig)
- Add Nova components (NovaTimer, Journal)
- Implement corresponding systems

---

*Last Updated: 2025-11-06*  
*Package Status: Stage 1 Complete ✅*
