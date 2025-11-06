# Stage 01: Initial Design - "EvoForge" Concept

**Context from Chat Replay**: Lines 1-500 (Initial USER pitch → Grok refines into cohesive concept)  
**Key Evolution**: Raw idea → Structured design with core pillars

---

## Intent & Player Fantasy

A procedurally generated game for GitHub Pages:
- **Tile-based world** with magnetic snapping (BitECS)
- **Tiny pixel animals** with AI behavior (YukaJS)
- **Spore-like character creator** - traits affect gameplay not just looks
- **Resource gathering & terraforming** that makes the world react
- **No win condition** - endless evolution

---

## Mechanics & Systems

### 1. World Generation & Terraforming
- **64x64 grid** of 16x16 pixel tiles (scalable to 128x128)
- **Perlin noise** biomes: forests, rivers, plains
- **Magnetic Snapping via BitECS**:
  - Each tile = ECS entity with `BiomeType`, `AdjacencyRules`, `TerraformAffinity`
  - Incompatible snaps trigger "stress events"
  - Creates emergent puzzles

**Tech**: BitECS archetype storage, Canvas2D rendering (no WebGL bloat)

### 2. Critter AI & Ecosystem
- **50-200 pixel entities** (8x8 sprites)
- **YukaJS steering behaviors**: Flocking, pathfinding, needs-based FSM
- **Reactions**: Terraform pond → fish populate. Overhunt → predators evolve
- **Tiered Evolution**: Base archetypes → variants unlocked by "Eco Points"

**Tech**: Yuka FSMs (Idle → Forage → Flee), sprite atlas batching

### 3. Character Creator & Progression
- **10-minute editor**: Drag-drop modular pixel parts
- **10 Evo Points** to allocate to traits:
  - `Chainsaw Hands`: +2 points, fast woodcutting, scares critters
  - `Flipper Feet`: +1 point, swim speed, attracts fish
- **Traits affect gameplay**: Speed, carry capacity, unlock interactions
- **Mid-game evolution**: Earn points to swap traits

**Tech**: Grid-based editor (Konva.js or Canvas), IndexedDB saves

### 4. Pollution & Shocks (KEY ADDITION)
- **No win condition** - endless sandbox
- **Pollution Echo**: Every action leaves 0-100 scalar per tile/chunk
  - Chainsaw forest: +5 echo (wood bonus, critters flee)
  - Flood plain: +3 echo (aquatic boost, rivers murky)
- **World Growth Loop**: 2-5 min cycles, procedural decisions
  - High diversity → gentle growth (new variants)
  - Low diversity → stagnation (scarce resources)
- **Shocks**:
  - **40% pollution**: "Whispers" - animals evolve defenses, player adapts
  - **70% pollution**: "Tempest" - grid expands 20%, tile cascades, 50% critter cull, hyper-evolution

---

## Worldgen & Ecology

**Procgen Approach**:
- Perlin noise for biome generation
- Deterministic seeds (shareable worlds)
- Chunk-based loading (64x64 tiles per chunk)
- Adjacency rules via BitECS queries

**Constraints**:
- <5MB total assets (pixel art PNGs)
- 60FPS on mobile browsers
- Throttle AI updates to 100ms

---

## Progression & Economy

**Resources → Alloys**:
- Basic: Wood + Water = Mud
- Ore + Water = Alloy
- Scaling: Alloy + Power = Circuit → Circuit + Wood = Drill

**Tech Gates**:
- Evo Points unlock trait slots
- Trait synergies unlock new interactions
- Pollution thresholds unlock shock events

---

## UX/Camera/Controls

**Camera Scheme**: Top-down 2D view (Canvas2D)
- WASD/arrow keys for movement
- Mouse for terraforming tools (raycast from cursor to tile)
- Touch-friendly for mobile GitHub Pages

**Controls**: Basic keyboard/mouse/touch

---

## Technical Direction

**Renderer**: Canvas2D (no WebGL bloat)
**Physics**: None (tile-based)
**Engine Stack**: Vanilla JS + BitECS + YukaJS + Simplex-noise
**Platform**: GitHub Pages (static hosting)

---

## Scope/Constraints

**Mobile Perf**: Target 60FPS on mobile browsers
**Memory**: <5MB total assets
**Battery**: Throttle AI updates to 100ms

---

## Decision Log

- ✅ **BitECS for ECS**: Efficient archetype storage, O(1) queries
- ✅ **YukaJS for AI**: Lightweight steering behaviors, FSM support
- ✅ **Canvas2D rendering**: No WebGL bloat, GitHub Pages compatible
- ✅ **Perlin noise**: Deterministic, shareable seeds
- ✅ **No win condition**: Endless sandbox with shock events
- ✅ **Pollution system**: Scalar tracking per tile/chunk
- ✅ **IndexedDB saves**: No backend required

---

## Open Questions

- Exact trait synergies (Chainsaw + Flipper = ?)
- How magnetic snapping scales to complex permutations
- Visual style beyond "pixel art"
- Audio/haptics
- Mobile controls (touch vs keyboard)
- Multiplayer/sharing mechanics

---

**Next Stage**: Refinement of core mechanics and introduction of complexity scaling
