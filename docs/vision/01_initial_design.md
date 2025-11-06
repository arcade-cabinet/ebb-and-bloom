# Stage 01: Initial Design - "EvoForge" Concept

**Lines**: 1-500 (Initial USER pitch → Grok refines into cohesive concept)  
**Key Evolution**: Raw idea → Structured design with core pillars

---

## Original Vision (USER)

A procedurally generated game for GitHub Pages:
- **Tile-based world** with magnetic snapping (BitECS)
- **Tiny pixel animals** with AI behavior (YukaJS) 
- **Spore-like character creator** - traits affect gameplay not just looks
- **Resource gathering & terraforming** that makes the world react
- **No win condition** - endless evolution

---

## Core Design Pillars (Established)

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

## Game Flow

```
START
  ↓
Character Creator (10 pts, traits)
  ↓
Spawn in procedural world
  ↓
┌─────────────────────────────────┐
│ CORE LOOP (Endless)             │
│  1. Terraform / Gather          │
│  2. World reacts (2-5min cycle) │
│  3. Critters evolve             │
│  4. Pollution accumulates       │
│  5. Shock events (40%/70%)      │
│  6. Earn Evo Points             │
│  7. Upgrade traits              │
└─────────────────────────────────┘
```

---

## Playstyle Profiling (Introduced)

**Yuka tracks player behavior** via rolling window (last 100 actions):

### Harmony Axis
- Balanced changes (plant after chop)
- Triggers: Symbiotic goals, critters cooperate

### Conquest Axis  
- Extractive chains (80% destructive)
- Triggers: Survivalism, predators bulk up, resources hide

### Frolick Axis
- Low-impact whimsy (wandering)
- Triggers: Delight events, rare non-resource traits

**No punishment** - just consequence. World mirrors your playstyle.

---

## Technical Foundation

**Core Stack**:
- **GitHub Pages** deployment
- **BitECS** - ECS architecture for tiles/entities
- **YukaJS** - AI steering/behaviors
- **Perlin noise** - Procedural world gen
- **IndexedDB** - Save persistence
- **Canvas2D** - Rendering (pixel art, retro-futuristic)
- **Vanilla JS** or minimal Phaser framework

**Performance Targets**:
- <5MB total assets (pixel art PNGs)
- 60FPS on mobile browsers
- Throttle AI updates to 100ms

---

## MVP Scope

**Start with**:
- 3 biomes
- 5 critter types
- 10 traits
- Basic snap mechanics (ore + water = alloy)

**Expand later**:
- More biomes, recipes, traits
- Advanced shock types
- Community seed sharing

---

## Key Concepts Established

1. **"You are the catalyst"** - Poetic narration of changes
2. **Magnetic snapping** - Core resource combination mechanic
3. **Procedural consequences not punishment** - Harmony/Conquest/Frolick
4. **Shocks as world transformation** - Not fail states, but resets
5. **Endless sandbox** - No win condition, just milestones
6. **Evo Points economy** - Trait progression system

---

## Questions Still Open (at this stage)

- Exact trait synergies (Chainsaw + Flipper = ?)
- How magnetic snapping scales to complex permutations
- Visual style beyond "pixel art"
- Audio/haptics
- Mobile controls (touch vs keyboard)
- Multiplayer/sharing mechanics

---

**Next Stage**: Refinement of core mechanics and introduction of complexity scaling
