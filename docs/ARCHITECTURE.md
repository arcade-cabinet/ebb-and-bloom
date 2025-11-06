# Architecture - Ebb & Bloom

**Version**: 1.0.0  
**Date**: 2025-11-06  
**Stage**: Stage 1 Complete

## System Architecture Overview

Ebb & Bloom uses a clean Entity-Component-System (ECS) architecture with BitECS, where game logic is completely separated from rendering (Phaser) and UI state (Zustand).

```
┌───────────────────────────────────────┐
│    Capacitor (Native Mobile APIs)     │
├───────────────────────────────────────┤
│           Ionic Vue (UI Layer)        │
│  ┌─────────────────────────────────┐  │
│  │    Phaser (Rendering ONLY)      │  │
│  │      Reads from ECS  ←──┐       │  │
│  └──────────────────────────┼───────┘  │
│                             │          │
│  ┌──────────────────────────▼───────┐  │
│  │   BitECS (Game Logic)           │  │
│  │   - Components (data)           │  │
│  │   - Systems (logic)             │  │
│  │   - Entities (IDs)              │  │
│  └──────────────────────────────────┘  │
│           ▲                            │
│  ┌────────┴─────────────────────────┐  │
│  │  Zustand (UI State - Read Only) │  │
│  │   Syncs FROM ECS for display    │  │
│  └──────────────────────────────────┘  │
└───────────────────────────────────────┘
```

### Core Principle: ECS as Single Source of Truth

**Rule**: All game state lives in BitECS components. Systems modify components. Phaser and Zustand only READ, never WRITE.

---

## Implementation Details

See [techContext.md](/memory-bank/techContext.md) for complete technical details including:
- All ECS components and their structures
- All system implementations
- Performance optimizations
- CI/CD pipeline
- Testing infrastructure

See [PROGRESS_ASSESSMENT.md](/memory-bank/PROGRESS_ASSESSMENT.md) for:
- Implementation status by design doc
- System completion percentages
- Missing features (Stage 2+)
- Quality assessments

---

## Package Structure

```
src/
├── ecs/                    # Entity-Component-System (BitECS)
│   ├── components/         # Data containers
│   │   ├── index.ts        # Core: Position, Velocity, Inventory
│   │   └── traits.ts       # 10 trait components + synergies
│   ├── systems/            # Game logic
│   │   ├── MovementSystem.ts
│   │   ├── CraftingSystem.ts
│   │   ├── SnappingSystem.ts
│   │   ├── PackSystem.ts
│   │   ├── PollutionSystem.ts
│   │   └── BehaviorSystem.ts
│   ├── entities/           # Entity factories
│   │   └── index.ts        # createPlayer, createCritter
│   └── world.ts            # ECS world management
│
├── game/                   # Phaser rendering layer
│   ├── core/               # World generation
│   │   ├── perlin.ts       # Perlin noise generator
│   │   └── core.ts         # WorldCore (chunk management)
│   ├── player/             # (deprecated - migrated to ECS)
│   └── GameScene.ts        # Main game loop
│
├── systems/                # Cross-cutting systems
│   ├── HaikuScorer.ts      # Narrative diversity guard
│   ├── HapticSystem.ts     # Touch feedback
│   └── GestureSystem.ts    # Touch input
│
├── stores/                 # Zustand state management
│   └── gameStore.ts        # UI state (synced from ECS)
│
├── views/                  # Vue UI overlays
│   ├── Home.vue
│   ├── Creator.vue         # (placeholder)
│   ├── Log.vue
│   └── Tabs.vue
│
├── router/                 # Vue Router
│   └── index.ts
│
└── test/                   # Vitest test suites
    ├── components.test.ts
    ├── movement.test.ts
    ├── crafting.test.ts
    ├── haiku.test.ts
    ├── snapping.test.ts
    ├── pollution-behavior.test.ts
    └── pack.test.ts
```

---

## Design Decisions

### Why BitECS?
- High performance (cache-friendly memory layout)
- Scales to thousands of entities
- Proper separation of data and logic
- Future-proof for complex gameplay

### Why Phaser as Rendering Layer?
- Mature 2D engine with excellent WebGL
- Large community
- Good mobile performance
- Easy to keep separate from game logic

### Why Zustand over Redux/Vuex?
- Lightweight (< 1KB)
- No boilerplate
- Framework agnostic
- Perfect for ECS → UI sync

### Why pnpm over npm?
- 3x faster installs
- Strict dependency resolution
- Efficient disk usage

---

## Data Flow

### Game Loop
```
1. Input → GestureSystem detects touch
2. Systems modify ECS components:
   - MovementSystem updates Position/Velocity
   - CraftingSystem updates Inventory
   - PackSystem updates Pack/Critter
   - PollutionSystem updates global state
3. Zustand reads from ECS for UI display
4. Phaser reads from ECS for rendering
```

### Critical Rule: One-Way Data Flow
```
User Input → Systems (modify ECS) → Zustand (read) → UI Display
                                   → Phaser (read) → Rendering
```

**NEVER**: UI or Phaser modifying ECS directly

---

## Performance Strategy

### Implemented Optimizations
1. **Viewport Culling**: Only render visible tiles
2. **Sprite Pooling**: Reuse sprites instead of creating new
3. **Distance-Based Updates**: Re-render chunks only when needed
4. **ECS Architecture**: Cache-friendly data layout
5. **WebGL**: Hardware-accelerated rendering

### Targets
- 60 FPS on mid-range Android
- < 16.67ms frame time
- < 150MB RAM
- < 3s load time

---

## Testing Strategy

### 57/57 Tests Passing ✅

- **Components** (4): ECS component validation
- **Movement** (3): Position/velocity updates
- **Crafting** (3): Recipe matching
- **Haiku** (8): Similarity and diversity
- **Snapping** (6): Affinity-based combining
- **Pollution** (15): Shocks and playstyle
- **Pack** (18): Formation, loyalty, roles

### CI/CD Integration
- Tests run before every build
- Build blocks if tests fail
- Coverage tracked

---

## Future Architecture (Stage 2+)

### Combat System
- New ECS components: Health, Combat, Momentum
- New system: CombatSystem
- Gesture integration

### Ritual System
- New components: Ritual, Abyss, Rig
- New system: RitualSystem
- Yuka AI integration for pioneer waves

### Nova Cycles
- New components: NovaTimer, Journal
- New system: NovaCycleSystem
- Persistence layer

### Stardust Hops
- New components: WorldSeed, Constellation
- New system: HopSystem
- Cross-world state management

---

*For detailed technical specifications, see `/memory-bank/techContext.md`*  
*For implementation progress, see `/memory-bank/PROGRESS_ASSESSMENT.md`*  
*Last Updated: 2025-11-06*
