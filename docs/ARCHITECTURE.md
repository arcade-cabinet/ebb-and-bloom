# Ebb & Bloom - Architecture

**Version**: 2.0  
**Last Updated**: 2025-01-09

---

## Core Philosophy

**"Everything is Squirrels"**: Base archetypes evolve through environmental pressure into infinite variations.

**NO hardcoded progression. NO arbitrary unlocks. NO predetermined outcomes.**

---

## Generational Architecture

### Generation 0: Planetary Genesis (PARTIAL - IN PROGRESS)

**Purpose**: Create physical reality from seed.

**Input**: Seed phrase (3 words) → seedrandom → Deterministic planet

**Components**:
1. ✅ **Accretion Simulation** - Yuka physics-based planetary formation with debris field
2. ✅ **Layer Assembly** - Core (inner/outer) → Mantle → Crust (physics-derived boundaries)
3. ✅ **Planetary Physics** - Radius, mass, rotation period from angular momentum
4. ✅ **Material Distribution** - Materials distributed to layers based on density
5. ✅ **Moon Calculation** - Orbital mechanics for moon generation
6. ✅ **Core Type Selection** - 8 types (Molten, Iron, Diamond, Living Wood, Water, Ice, Void, Dual) - Physics-based selection
7. ✅ **Hydrosphere/Atmosphere** - Surface layers generated from composition and temperature
8. ✅ **Primordial Wells** - Life spawn points (3-12 per planet) with energy levels and composition

**Status**: ✅ COMPLETE - All components implemented with full test coverage (`AccretionSimulation.ts`)
- ✅ Unit tests: Core type, hydrosphere, atmosphere, primordial wells, moons (20 tests)
- ✅ Integration tests: GameEngine initialization with WARP/WEFT (12 tests)
- ✅ API tests: `/api/game/:id/gen0/render` endpoint (10 tests)
- ✅ Frontend tests: GameScene data loading and API integration (15 tests)
- ✅ E2E tests: Complete flow from seed to rendering (3 tests)

---

### Generation 1: ECS Archetypes

**Purpose**: Initialize world with base archetypes (Daggerfall-style prefabs)

**Components**:
- 8 creatures spawn near Primordial Wells
- Materials spawn per planetary layers
- Terrain from planetary geology
- No tools (creatures start tool-less)
- No buildings (creatures start nomadic)

**Status**: ⚠️ Works but uses hardcoded values

---

### Generation 2+: Yuka Sphere Coordination

**Purpose**: ALL evolution driven by Yuka AI responding to environmental pressure

**Yuka Sphere Network**:
- **Creature Sphere**: Trait evolution, reproduction, morphology
- **Tool Sphere**: Archetype emergence, capability unlocks
- **Material Sphere**: Accessibility updates, synthesis
- **Building Sphere**: Construction, social unlocks

**Inter-Sphere Communication**:
- Spheres signal each other with pressure/capability changes
- Decisions coordinated (no contradictions)
- Feedback loops create emergent complexity

**Status**: ⚠️ Creature/Material work, Tool/Building not integrated

---

## The Yuka Sphere System

### Core Principle

After Gen 1, **EVERYTHING is Yuka decisions** responding to:
- Environmental physics (depth, hardness, gravity - immutable)
- Player actions (pressure source)
- Other Yuka spheres (collaborative evolution)

### Example: Bronze Age Emergence

```
Gen 1 (ECS):
  Copper: 7m depth, 5.8 hardness (from Gen 0 planetary layers)
  Tin: 12m depth, 7.2 hardness (from Gen 0)
  Stone tools: 0m reach, 4.0 hardness

Gen 2 (Yuka):
  Material Sphere: "Copper exists but inaccessible (tool reach 0m, ore at 7m)"
  Tool Sphere: "Need EXTRACTOR with reach > 7m, hardness > 5.8"
  Creature Sphere: "Current manipulation 0.4 < required 0.5"
  Decision: Evolve creature manipulation first

Gen 3-4 (Yuka):
  Creature manipulation now 0.7
  Tool Sphere: "Creatures ready - emerge EXTRACTOR Gen 2"
  EXTRACTOR: reach 3m, hardness 5.0 (still can't reach copper)
  More pressure builds...

Gen 5-7 (Yuka):
  Tool Sphere: "Evolve EXTRACTOR Gen 3"
  EXTRACTOR: reach 8m, hardness 6.0
  Material Sphere: "Copper NOW accessible!"
  Copper harvesting begins

Gen 8-10 (Yuka):
  Copper + Tin available
  Tool Sphere: "TRANSFORMER can create alloys"
  Bronze synthesis emerges
  Tool Sphere: "Bronze enables better tools"
  Bronze Age achieved
```

**NO hardcoded "Level 5 = Bronze Age"**. Emerged from physical reality + Yuka coordination.

---

## Tool Archetypes

### 8 Fundamental Categories

1. **ASSEMBLER** - Joins things (hammer, needle, mortar)
2. **DISASSEMBLER** - Breaks things (axe, knife, saw)
3. **TRANSFORMER** - Changes form (furnace, mill, loom)
4. **EXTRACTOR** - Gets from depths (shovel, drill, pump)
5. **CARRIER** - Moves things (basket, cart, rope)
6. **MEASURER** - Understands things (scale, compass, clock)
7. **PROTECTOR** - Shields things (armor, walls, shelter)
8. **RECORDER** - Preserves knowledge (writing, maps) - **Enables culture**

### Emergence Conditions

- **EXTRACTOR**: Material depth > 5m
- **RECORDER**: Social > 0.8 AND generation > 5
- **ASSEMBLER**: Social > 0.4, multiple materials available
- **PROTECTOR**: Territorial conflict > 0.6

### Property-Based Capabilities

**NOT hardcoded**. Derived from properties:

```typescript
// Hardness determines what can be broken
if (tool.properties.hardness > 7.0 && tool.archetype === DISASSEMBLER) {
  capabilities.push('break_stone', 'cut_metal');
}

// Reach determines accessibility
if (tool.properties.reach > 2.0 && tool.archetype === EXTRACTOR) {
  capabilities.push('deep_mining');
}

// Precision determines assembly quality
if (tool.properties.precision > 0.8 && tool.archetype === ASSEMBLER) {
  capabilities.push('fine_assembly', 'complex_construction');
}
```

### Tool-Creature Co-Evolution

Tools inform creatures ("need manipulation 0.8 for better tools")  
Creatures inform tools ("creatures ready for Gen 3 tools now")

**Status**: ⚠️ ToolArchetypeSystem complete, not integrated with YukaSphereCoordinator

---

## Consciousness System

### Core Concept

**Player is transferable awareness**, not bound to one creature.

**Can**:
- Possess any creature
- Release to Yuka (full auto mode)
- Transfer on death (no game over)
- Preserve knowledge via RECORDER tools

### Knowledge Persistence

```
Player possesses creature A
  → Creature A dies
  → Consciousness transfers to creature B
  → IF RECORDER tools exist: Knowledge preserved
  → IF NOT: Knowledge lost
```

**RECORDER tools enable**:
- Knowledge storage
- Cultural transmission
- Religion emergence
- Governance emergence

**Status**: ✅ Backend complete, ❌ No UI

---

## Deconstruction System

### Reverse Synthesis

**Gen 3 creature dies**:
```
Gen 3 creature (complex)
  → Extract Gen 2 synthesized components (manipulator, coordinator, armor)
  → Extract Gen 1 archetypes (flesh, bone, hide)
  → Extract raw materials (organic matter)
```

**Property-Based Usage**:
- Hardness → armor potential
- Volume → container potential
- Organic → food potential

**NO loot tables**. Usage derived from physical properties.

**Status**: ✅ Complete

---

## Supporting Systems

### Pack Social System
- Pack formation based on proximity & social trait
- Role assignment (alpha, scout, gatherer)
- Loyalty calculation & pack splitting
- Migration coordination
- **Status**: ✅ Complete

### Combat System
- Health, Combat, Momentum components
- Trait-driven combat styles (toxic, defensive, evasive)
- Death triggers deconstruction
- **Status**: ⚠️ Complete but not triggered by Yuka

### Environmental Pressure System
- Pollution tracking (sources, spread, decay)
- Shock events (environmental crises)
- Pressure calculation for Yuka
- **Status**: ✅ Complete

### Population Dynamics System
- Population tracking & growth
- Carrying capacity
- Generation turnover
- **Status**: ✅ Complete

### Genetic Synthesis System
- Trait blending from parents
- Morphology generation from traits
- Mutation application
- **Status**: ✅ Complete

### Haiku Narrative System
- Procedural haiku generation
- Jaro-Winkler diversity guard
- Event-driven storytelling
- **Status**: ✅ Complete

### Gesture & Haptic Systems
- Touch input (tap, long-press, swipe, pinch)
- Haptic feedback patterns
- Event-driven haptics
- **Status**: ✅ Complete

### Camera System
- Spore-style dynamic third-person
- Auto-targeting
- Zoom presets (intimate, observe, ecosystem)
- **Status**: ✅ Complete

### Terrain System
- Procedural heightmap generation
- FBM (Fractal Brownian Motion)
- Chunk-based streaming
- **Status**: ⚠️ Complete but needs Gen 0 for geology

### Texture System
- AmbientCG texture loading
- Material assignment
- ECS integration
- **Status**: ✅ Complete

---

## Technology Stack (UPDATED 2025-11-08)

- **Game Logic**: GameEngine (internal API, direct function calls)
- **Rendering**: BabylonJS (3D engine + GUI)
- **UI**: BabylonJS GUI (NO DOM, cross-platform native)
- **AI**: Yuka (Gen0-6 systems, fuzzy logic, steering behaviors)
- **State**: GameEngine state (no React, no Zustand)
- **Platform**: Capacitor (Web, iOS, Android)
- **Storage**: @capacitor/preferences (cross-platform)
- **File Loading**: @capacitor/filesystem (platform-aware)
- **Routing**: Hash-based routing (Capacitor-compatible)
- **Events**: Custom EventEmitter (browser-compatible)
- **Seed**: seedrandom (deterministic RNG)
- **Design**: Constants system (COLORS, FONTS, LAYOUT)

### Frontend Architecture Decision: BabylonJS

**Decision**: Using BabylonJS instead of React Three Fiber + UIKit

**Rationale**:
- **Unified Architecture**: Single library for 3D rendering + GUI (no library boundary friction)
- **Built-in Raycasting**: Advanced `scene.pick()` system for coordinate queries and 3D interaction
- **Procedural Generation Tools**: Built-in noise functions, procedural textures, terrain tools
- **Mature GUI System**: Production-ready BabylonJS GUI with comprehensive controls
- **Performance**: Optimized for complex scenes (LOD, culling, mobile optimization)
- **Enterprise Maturity**: Proven in production, stable API, comprehensive documentation

**Key Features**:
- `AdvancedDynamicTexture` - Full-screen GUI container
- `Rectangle` - Panels with styling (background, cornerRadius, opacity)
- `Button` - Interactive buttons with text
- `TextBlock` - Text rendering with CSS fonts (Lora, Inter, JetBrains Mono)
- Built-in raycasting for 3D interaction
- Procedural texture generation for planetary surfaces

**Migration**: Greenfield frontend means minimal migration cost. All UI elements use BabylonJS GUI styling (no generated images for buttons/panels/text).

---

## File Structure (UPDATED 2025-11-08)

```
packages/
├── game/         # ✅ UNIFIED PACKAGE (Frontend + Backend)
│   ├── src/
│   │   ├── engine/        # GameEngine (internal API)
│   │   ├── gen0-6/        # Generation systems (Yuka AI)
│   │   ├── scenes/        # BabylonJS scenes
│   │   ├── gen-systems/   # WARP/WEFT data loaders
│   │   ├── planetary/     # Physics systems
│   │   ├── seed/          # Seed management
│   │   ├── utils/         # Cross-platform utilities
│   │   │   ├── storage.ts    # @capacitor/preferences wrapper
│   │   │   ├── router.ts     # Hash-based routing
│   │   │   └── EventEmitter.ts # Browser-compatible events
│   │   ├── constants/     # Design system
│   │   │   └── design.ts     # Colors, fonts, layout
│   │   ├── schemas/       # Type re-exports
│   │   └── index.ts       # Entry point
│   ├── data/archetypes/   # Gen0-6 WARP/WEFT data
│   ├── public/            # Assets (bundled for web/iOS/Android)
│   │   ├── data/          # Archetypes (for web fetch)
│   │   ├── fonts/         # Google Fonts CSS
│   │   ├── textures/      # AmbientCG materials
│   │   └── ui/            # UI assets
│   ├── test-backend/      # Backend tests
│   ├── test-frontend/     # Frontend tests
│   └── test-e2e/          # E2E tests (Playwright)
├── gen/          # AI archetype generation
│   └── src/
│       ├── workflows/  # WARP/WEFT agent
│       └── schemas/    # Zod schemas (exported)
└── shared/       # Schemas only (DB removed)
    └── src/schemas/
```

---

## What Works

ECS, creature evolution, packs, pollution, haikus, camera, haptics, gestures, deconstruction, rendering.

Tests: 57/57 passing.

---

## What's Broken

- NO Gen 0 (planetary genesis)
- Tool Sphere not integrated
- Building Sphere not integrated
- Inter-sphere communication missing
- Material accessibility static
- Hardcoded values everywhere
- Game loop incomplete (Gen 1-2 works, Gen 3+ doesn't)

---

## Critical Path

1. **Generation 0** - ✅ COMPLETE - All components implemented (Core Type Selection, Hydrosphere/Atmosphere, Primordial Wells)
2. **Tool Sphere** - Integrate with YukaSphereCoordinator
3. **Inter-Sphere Communication** - Spheres signal each other
4. **Material Refactor** - Remove hardcoding
5. **Building Integration** - Connect to Yuka
6. **Player Influence** - Evo Points system, Influence Panel
7. **Essential UI** - Pause, Save/Load, Settings

---

**See source code in `src/systems/` for implementation details.**

