# Architecture - Ebb & Bloom

**Version**: 2.0.0  
**Date**: 2025-01-XX  
**Status**: Frozen - Raycast 3D Architecture Committed

---

## System Architecture Overview

Ebb & Bloom uses a clean Entity-Component-System (ECS) architecture with BitECS, where game logic is completely separated from rendering (Raycast 3D) and UI state (Zustand).

```
┌─────────────────────────────────────────┐
│          Capacitor (Native Mobile)      │
├─────────────────────────────────────────┤
│           Ionic Vue (UI Layer)          │
│  ┌───────────────────────────────────┐  │
│  │   Raycast 3D (Rendering ONLY)    │  │
│  │      Reads from ECS  ←──┐         │  │
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
└─────────────────────────────────────────┘
```

### Core Principle: ECS as Single Source of Truth

**Rule**: All game state lives in BitECS components. Systems modify components. Raycast renderer and Zustand only READ, never WRITE.

---

## Rendering Architecture: 2D → Raycasted 3D

### Current State (Stage 2 - Production)
- **Implementation**: 2D tile-based (Phaser 3)
- **Status**: Production-ready for Stage 2 complete playable mobile game
- **Performance**: 60 FPS achieved on mid-range Android
- **Timeline**: Stage 2 (8-12 weeks) completes 2D implementation

### Vision: Raycast Engine (Stage 3 - Conditional)
- **Approach**: Wolfenstein-style raycasting with modern smoothing
- **Why**: Efficient, seed-driven, feels vast without VRAM suck
- **Mobile-Friendly**: ~100 rays per frame (60FPS target)
- **Aesthetic**: DOS-era inspired, modern-smoothed
- **Timeline**: Stage 3 (10 weeks) AFTER performance validation
- **Decision Gate**: Phase 1 performance validation is MANDATORY before commitment
- **Fallback**: Enhanced 2D with shaders (2 weeks if raycast fails)

### Target Implementation
- **Engine**: Custom raycast or raycast.js library (~5KB)
- **Heightmaps**: Perlin noise for ebb valleys + bloom ridges
- **Controls**: Gesture-based (swipe-turn, pinch-zoom, tap-stride)
- **Visual Style**: Pseudo-3D slice rendering
  - Color gradients: Indigo ebb (close) → Emerald bloom (far)
  - Void haze overlay (20% darken when void affinity high)
  - Particle effects: Blue wisps (flow), red sparks (heat)

### Data Flow
```
User Input → Systems (modify ECS) → Zustand (read) → UI Display
                                   → Raycast (read) → Rendering
```

**NEVER**: UI or Raycast modifying ECS directly

---

## System Decomposition

### Rendering Layer
- **Vision**: Raycasted 3D (Wolfenstein-style)
- **Current**: Phaser 3 (2D tile-based) - interim
- **Responsibility**: Visual representation only (READ-ONLY from ECS)
- **Key Constraint**: 60 FPS on mid-range Android

### World Generation
- **Approach**: Perlin noise, chunk-based, deterministic seeds
- **Current**: 64x64 grid, 3 biomes, tile-based
- **Vision**: Raycasted heightmaps, infinite generation, streaming
- **Key Constraint**: <3s load time, <2s world gen

### Simulation/Ecology
- **Approach**: BitECS (Entity-Component-System)
- **Systems**: Movement, Crafting, Snapping, Pack, Pollution, Behavior
- **AI**: YukaJS (steering behaviors, FSM)
- **Key Constraint**: <5ms per frame for ECS systems

### Crafting System
- **Approach**: Affinity-based magnetic snapping
- **Current**: Basic snapping (ore + water = alloy)
- **Vision**: Infinite permutations, demand-responsive scaling
- **Key Constraint**: 10-deep chain cap, batch queries

### Persistence/Saves
- **Approach**: IndexedDB (web) / Capacitor Filesystem (native)
- **Current**: Basic save/load
- **Vision**: Cross-world persistence, journal persistence
- **Key Constraint**: Async saves, <100ms save time

### Content Pipelines
- **Approach**: Procedural generation (no hand-authored content)
- **Current**: Basic world gen, critter spawning
- **Vision**: Emergent villages and quests
- **Key Constraint**: Infinite variety, no repetition

### Platform/Engine Wrapper
- **Current**: Vue/Capacitor/Ionic
- **Vision**: Mobile-first, web fallback
- **Key Constraint**: APK <15MB, 60 FPS mobile

---

## ECS Architecture (BitECS)

### Components (`src/ecs/components/`)

#### Core Components
```typescript
Position: { x: f32, y: f32 }
Velocity: { x: f32, y: f32 }
Inventory: { ore: ui16, water: ui16, alloy: ui16, ... }
Sprite: { textureKey: ui32 }
```

#### Trait Components (10 total)
```typescript
FlipperFeet: { level: ui8 }        // Water speed, flow affinity
ChainsawHands: { level: ui8 }     // Wood harvest, scares critters
DrillArms: { level: ui8 }          // Ore mining, reveals veins
WingGliders: { level: ui8 }        // Glide distance, aerial view
EchoSonar: { level: ui8 }          // Resource ping radius
BioLumGlow: { level: ui8 }         // Night vision, attracts critters
StorageSacs: { level: ui8 }        // Inventory capacity
FiltrationGills: { level: ui8 }    // Pollution resistance
ShieldCarapace: { level: ui8 }     // Damage reduction
ToxinSpines: { level: ui8 }         // Counter-attack
```

#### Social Components
```typescript
Pack: {
  leaderId: ui32,      // Entity ID of leader
  loyalty: f32,        // 0-1 loyalty to player
  size: ui8,           // Number of members
  affMask: ui32,       // Inherited affinity traits
  packType: ui8        // neutral/ally/rival
}

Critter: {
  species: ui8,        // fish/squirrel/bird/beaver
  packId: ui32,        // Pack entity ID (0 if solo)
  role: ui8,           // leader/specialist/follower
  inheritedTrait: ui8, // Diluted trait from player
  needState: ui8       // idle/foraging/fleeing
}
```

### Systems (`src/ecs/systems/`)

#### MovementSystem
- Applies velocity to position
- Handles friction and deceleration
- Delta-time based updates
- Query: `[Position, Velocity]`

#### CraftingSystem
- Recipe matching engine
- Resource validation
- Inventory updates
- Pollution tracking
- Query: `[Inventory]`

#### SnappingSystem
- Affinity-based resource combinatorics
- 8-bit flag matching (HEAT, FLOW, BIND, POWER, LIFE, METAL, VOID, WILD)
- Procedural haiku generation for snaps
- Query: `[Position, Inventory]`

#### PackSystem
- Formation logic (3-15 critters)
- Loyalty calculation (0-1 scale)
- Role assignment (leader/specialist/follower)
- Pack schism mechanics (split at <0.3 loyalty)
- Query: `[Pack, Position]` and `[Critter, Position]`

#### PollutionSystem
- Tracks global pollution (0-100%)
- Calculates shock thresholds (Whisper 40%, Tempest 70%, Collapse 90%)
- Playstyle-specific mutations
- Purity Grove mitigation
- Query: `[all entities]` (global state)

#### BehaviorSystem
- Profiles Harmony/Conquest/Frolick playstyle
- Rolling 100-action window
- World reaction modifiers
- No punishment - just consequences
- Query: `[player entity]` (behavior tracking)

---

## Performance Strategy

### Targets
- **60 FPS**: Steady on mid-range Android (Snapdragon 700+)
- **Frame Time**: <16.67ms per frame
- **Memory**: <150MB RAM
- **Load Time**: <3 seconds to playable
- **Battery**: <10% drain per hour

### Optimizations
1. **Viewport Culling**: Only render visible tiles/chunks
2. **Sprite Pooling**: Reuse sprites (no create/destroy in loop)
3. **ECS Architecture**: Cache-friendly memory layout
4. **Batch Updates**: Group component modifications
5. **Throttle AI**: Yuka updates to 100ms
6. **Chunk-Based Loading**: Load on demand, cache generated
7. **Raycast Efficiency**: ~100 rays per frame, distance-based LOD

---

## Technology Stack

### Core Framework
- **pnpm 9.x**: Package manager
- **TypeScript 5.7+**: Type safety
- **Node >= 20.x**: Runtime

### Mobile Framework
- **Capacitor 6.1+**: Native mobile bridge
- **Ionic Vue 8.7+**: Mobile UI components
- **Vue 3.5+**: Composition API

### Game Engine & Architecture
- **BitECS 0.3+**: High-performance ECS
- **Yuka 0.7+**: AI steering behaviors
- **Pinia 3.0+**: State management (Vue-integrated, NOT Zustand as originally planned)
- **Phaser 3.87+**: 2D rendering (production for Stage 2)
- **Raycast Engine**: Custom or raycast.js (Stage 3 target, conditional)

### Build & Dev Tools
- **Vite 6.0+**: Fast dev server
- **Vitest 2.1+**: Unit testing
- **GitHub Actions**: CI/CD automation
- **Renovate Bot**: Automated dependency updates

---

## Architecture Decisions

### Why BitECS?
- High performance (cache-friendly memory layout)
- Scales to thousands of entities
- Proper separation of data and logic
- Future-proof for complex gameplay

### Why Raycast Over Full 3D?
- Efficient (seed-driven, no asset bloat)
- Feels vast without VRAM suck
- Mobile-friendly (~100 rays per frame)
- DOS-era aesthetic (matches vision)

### Why Pinia over Zustand/Vuex?
- **Original Plan**: Zustand (framework-agnostic)
- **Actual Implementation**: Pinia (Vue-native state management)
- **Rationale**: Better Vue 3 Composition API integration
- **Benefits**: Type-safe, devtools support, modular stores
- **Perfect for**: ECS → UI sync with Vue components

### Why Vue/Capacitor?
- Mobile-first framework
- Native plugin support
- Web fallback (PWA)
- Good performance on mobile

---

## Future Architecture (Stage 2+)

### Combat System
- New ECS components: Health, Combat, Momentum
- New system: CombatSystem
- Gesture integration (swipe clashes, pinch siphons)

### Content Systems
- Recipe expansion (10+ recipes)
- Trait expansion (15+ traits)
- Biome expansion (5+ biomes)

### Raycasted 3D Migration
- Replace Phaser 2D with raycast engine
- Heightmap-based world generation
- Gesture-based camera controls
- Performance validation on mobile

---

**Last Updated**: 2025-01-XX  
**Version**: 2.0.0 (Raycast 3D Architecture Committed)  
**Status**: Frozen - Master Architecture Document
