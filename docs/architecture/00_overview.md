# Architecture Overview - Ebb & Bloom

**Version**: 1.0.0  
**Date**: 2025-01-XX  
**Status**: Initial system decomposition

---

## System Decomposition

### Rendering Layer
- **Current**: Phaser 3 (Canvas/WebGL) - 2D tile-based
- **Vision**: Raycasted 3D (Wolfenstein-style) - deferred pending performance validation
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
- **Vision**: Emergent villages, quests, world-hopping
- **Key Constraint**: Infinite variety, no repetition

### Platform/Engine Wrapper
- **Current**: Vue/Capacitor/Ionic
- **Vision**: Mobile-first, web fallback
- **Key Constraint**: APK <15MB, 60 FPS mobile

---

## Architecture Principles

### ECS as Single Source of Truth
- **Rule**: All game state lives in BitECS components
- **Systems**: Modify components (pure logic)
- **Rendering**: Phaser reads from ECS (READ-ONLY)
- **UI**: Zustand reads from ECS (READ-ONLY)

### Data Flow Pattern
```
User Input → Systems (modify ECS) → Zustand (read) → UI Display
                                   → Phaser (read) → Rendering
```

**NEVER**: UI or Phaser modifying ECS directly

### Performance Strategy
- **Viewport Culling**: Only render visible tiles
- **Sprite Pooling**: Reuse sprites (no create/destroy in loop)
- **ECS Architecture**: Cache-friendly memory layout
- **Batch Updates**: Group component modifications
- **Throttle AI**: Yuka updates to 100ms

---

## System Interactions

### Rendering ↔ ECS
- Phaser queries ECS for entity positions/components
- Renders sprites based on component data
- No direct modification of ECS from rendering layer

### Simulation ↔ AI
- Yuka queries ECS for behavior profiles
- Adjusts steering behaviors based on player actions
- Spawns events based on playstyle (harmony/conquest/frolick)

### Crafting ↔ Ecology
- Snapping system queries ECS for resource affinities
- Pollution system tracks crafting actions
- Behavior profiling influences snap outcomes

### Persistence ↔ World
- Save system serializes ECS world state
- Load system deserializes and recreates entities
- Journal persists separately (haikus survive world hops)

---

## Technology Stack

### Current Implementation
- **Rendering**: Phaser 3.87+ (Canvas/WebGL)
- **ECS**: BitECS 0.3+
- **AI**: YukaJS (steering behaviors)
- **State**: Zustand (UI state management)
- **UI**: Vue 3.5+ (Ionic components)
- **Platform**: Capacitor 6.1+
- **Build**: Vite 6.0+

### Vision (Deferred)
- **Rendering**: Raycasted 3D (custom or raycast.js)
- **Physics**: Rapier (Rust-origin, WASM/JS bindings)
- **Platform**: Mobile-first (Ionic/Vue/Capacitor or React/Expo)

---

## Performance Targets

### Frame Rate
- **Target**: 60 FPS on mid-range Android (Snapdragon 700+)
- **Frame Time**: <16.67ms per frame
- **Breakdown**:
  - Rendering: 8-10ms
  - ECS Systems: 3-5ms
  - Yuka AI: 2-3ms (throttled to 100ms)
  - UI Updates: 1-2ms

### Memory
- **Target**: <150MB RAM
- **APK Size**: <15MB (currently 4MB)
- **Asset Size**: <5MB total (pixel art PNGs)

### Load Time
- **Target**: <3 seconds to playable
- **First Frame**: <1 second
- **World Gen**: <2 seconds (procedural)

### Battery
- **Target**: <10% drain per hour
- **Throttle**: AI updates to 100ms
- **Culling**: Only render visible tiles

---

## Scalability Considerations

### Entity Limits
- **Critters**: 50-200 active entities
- **Villages**: 5-10 per world
- **Quests**: 10-20 per world
- **Chain Depth**: 10-deep chains (performance guard)

### World Size
- **Current**: 64x64 grid (scalable to 128x128)
- **Vision**: Infinite generation, chunk-based loading
- **Constraint**: Chunk-based loading, cache generated chunks

### Content Scaling
- **Traits**: 10 base traits (expandable to 20+)
- **Snap Recipes**: 5 base recipes (infinite permutations)
- **Biomes**: 3 base biomes (expandable to 10+)
- **Critters**: 5 base types (expandable to 20+)

---

## Future Architecture (Stage 2+)

### Combat System
- New ECS components: Health, Combat, Momentum
- New system: CombatSystem
- Gesture integration (swipe clashes, pinch siphons)

### Ritual System
- New components: Ritual, Abyss, Rig
- New system: RitualSystem
- Yuka AI integration for pioneer waves

### Nova Cycles
- New components: NovaTimer, Journal
- New system: NovaCycleSystem
- Persistence layer (journal survives resets)

### Stardust Hops
- New components: WorldSeed, Constellation
- New system: HopSystem
- Cross-world state management

### Raycasted 3D
- New rendering system: Raycast engine
- Heightmap-based world generation
- Gesture-based camera controls

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

### Why Vue/Capacitor?
- Mobile-first framework
- Native plugin support
- Web fallback (PWA)
- Good performance on mobile

---

## Open Questions

1. **Rendering Path**: Raycasted 3D vs. low-poly mesh tiles for mobile performance?
2. **Physics Integration**: When to introduce Rapier vs. staying 2D?
3. **World Hopping**: Technical implementation of "stardust hops" and continuity?
4. **Content Pipeline**: How to author/procedurally generate villages and quests?
5. **Performance Validation**: Real device testing for raycast 3D performance?

---

**Last Updated**: 2025-01-XX  
**Next Review**: After Stage 2 implementation

