# Vision - Ebb & Bloom

**Version**: 2.0.0  
**Date**: 2025-01-XX  
**Status**: Frozen - Raycast 3D Vision Committed

---

## Core Vision

**Ebb & Bloom** is a procedural, raycasted 3D world simulation game with infinite generation, reactive ecology, resource harvesting, crafting (materials → alloys), and emergent villages/quests. DOS-era-inspired aesthetic (Wolfenstein-style), modern-smoothed with lighting, interpolation, and post-processing.

### Tagline
**"Shape Worlds. Traits Echo. Legacy Endures."**

**Approach**: Hybrid - Gameplay clarity + poetic resonance

**Rationale**: Clear gameplay verbs (Shape, Craft, Evolve) communicate what you DO, while poetic language (Echo, Remember, Legacy) captures the emotional resonance. Avoids pure mysticism while maintaining depth.

### Brand Voice
**Hybrid**: Poetic for world/atmosphere, technical for systems, playful for onboarding

---

## Player Fantasy

**Core Verbs**: Explore → harvest → craft (materials → alloys) → build → influence ecology → encounter emergent villages/quests/fauna

**World Look**: Raycasted 3D aesthetic reminiscent of DOS-era worlds (Wolfenstein-style), smoothed and modernized. Not voxel-chunky.

**Simulation Bias**: The world reacts to player stewardship vs. exploitation. No punishment—just consequences that mirror playstyle.

**Platform Bias**: Mobile-first viability is important, but fun > framework. Target: 60 FPS on mid-range Android (Snapdragon 700+).

---

## Core Mechanics

### 1. Magnetic Resource Snapping
- **Traditional crafting**: Open menu → select recipe → wait → close menu
- **Ebb & Bloom**: Place ore next to water → SNAP! They fuse into alloy
- **Affinity-Based**: 8-bit flags determine what combines (HEAT + FLOW = alloy)
- **Procedural Permutations**: Infinite combinations through affinity overlap
- **No Menus**: Touch to gather, swipe to place, world handles the rest
- **Scales with Player**: Demand-responsive world anticipates needs

### 2. Trait Inheritance Ecosystem
- **Proximity-Based**: Creatures near you evolve similar traits
  - Example: Your flipper feet → critters gain webbed paws
- **Dilution Mechanics**: Traits weaken 50% per generation
- **Hybrid Emergence**: Opposing traits create new forms
  - flow + void = tidal scar
  - heat + life = forge bloom
- **Behavioral Mirroring**: Your playstyle shapes creature AI
  - Harmony player → cooperative packs that gift resources
  - Conquest player → aggressive raiders that contest territory
  - Frolick player → whimsical herds that dance and explore

### 3. Procedural Haiku Journaling
- **Every significant moment** generates a haiku capturing emotional resonance
- **Jaro-Winkler Guard**: Prevents repetition (<20% similarity)
- **Procedural Metaphors**: Generated from action context
- **Persistent Journal**: Haikus capture significant moments

### 4. Touch as Language
- **Gestures aren't shortcuts—they ARE the game**
- **Swipe**: Stride, carve terrain (forward momentum)
- **Pinch**: Zoom, siphon resources (focus)
- **Hold**: Dispatch packs on quests (command)
- **Tap**: Collect, interact (light touch)
- **Double-Tap**: Quick action (urgency)
- **Drag**: Move inventory (deliberate)
- **Rotate**: Camera, inspect (perspective)

**Haptic Feedback = World's Heartbeat**:
- Light buzz for harmony blooms
- Heavy rumble for combat lashes
- Crescendo for major world transformations
- Heartbeat for world evolution

---

## Rendering Vision: Raycasted 3D

### Why Raycast Over Full 3D
- ✅ **Efficient**: Seed-driven, no asset bloat
- ✅ **Feels Vast**: Without VRAM suck
- ✅ **Procedural**: Seed ties to evo history (pollution + time hash = thornier ridges)
- ✅ **Mobile-Friendly**: ~100 rays per frame (60FPS mobile)
- ✅ **DOS-Era Aesthetic**: Wolfenstein-style, modern-smoothed

### Why Not Full 3D Models
- ❌ Asset gen per chunk = nightmare on mobile
- ❌ VRAM bloat
- ❌ Not seed-driven (requires storage)

### Implementation Approach
- **Raycast Engine**: Custom or raycast.js library (~5KB)
- **Heightmaps**: Perlin noise for ebb valleys + bloom ridges
- **Gesture Controls**: Swipe-turn, pinch-zoom, tap-stride
- **Visual Style**: Pseudo-3D slice rendering
  - Color gradients: Indigo ebb (close) → Emerald bloom (far)
  - Void haze overlay (20% darken when void affinity high)
  - Particle effects: Blue wisps (flow), red sparks (heat)

**Status**: Vision committed. Current implementation is 2D tile-based (interim). Raycast 3D is the target.

---

## World Generation

### Procedural Approach
- **Perlin Noise**: Organic terrain generation
- **Chunk-Based**: Infinite generation, streaming
- **Deterministic Seeds**: Shareable worlds
- **Heightmaps**: Ebb valleys + bloom ridges
- **Biome Synthesis**: Forests, rivers, plains, lava, void

### Village/Quest Emergence
- **Simulation Rules**: Not scripts
- **Behavior-Driven**: Village types adapt to playstyle
- **Procedural Generation**: No hand-authored content, infinite variety
- **Pack Quest System**: Mobile-native feature (dispatch packs on missions)

---

## Progression & Economy

### Resources → Alloys
- **Basic**: Wood + Water = Mud
- **Mid-Chain**: Ore + Water = Alloy → Alloy + Power = Circuit
- **Deep Chains**: Circuit + Wood + Heat = Drill → Drill + Geothermal = Piston Pump
- **Infinite Scaling**: Scales with player demands, not against

### Tech Gates
- **Evo Points**: Unlock trait slots (start 2, max 5)
- **Trait Synergies**: Unlock new interactions
- **Pollution Thresholds**: Unlock shock events
- **Demand Vectors**: World auto-expands snaps based on needs

---

## Player Experience Pillars

### Harmony Players (35%)
- **Motivation**: Create symbiotic ecosystems
- **Session**: 30-60 min, multiple times per week
- **Enjoys**: Pack cooperation, purity groves, serenity points
- **Avoids**: Combat, pollution, aggressive gameplay
- **World Response**: Cooperative critters, sustainable loops, faster Evo Points

### Conquest Players (30%)
- **Motivation**: Optimize yields, master systems
- **Session**: 45-90 min, daily grinding
- **Enjoys**: Aggressive resource gathering, high-risk snaps, territorial packs
- **Avoids**: Slow progression, low stakes
- **World Response**: Fortified resources, apex evolutions, faster shocks

### Frolick Players (25%)
- **Motivation**: Discover narrative, collect experiences
- **Session**: 20-45 min, irregular but dedicated
- **Enjoys**: Haiku journal, whimsy warps, cosmetics
- **Avoids**: Pressure, optimization, combat
- **World Response**: Delight events, whimsical traits, low-stakes exploration

### Hybrid Players (10%)
- **Motivation**: Variety and experimentation
- **Session**: Variable
- **Enjoys**: Trying different playstyles
- **System Support**: Fluid transitions between playstyles

---

## Design Pillars

### 1. Intimate Scale
- **80% Single World**: Deep immersion in one procedurally generated world
- **Quality over Quantity**: One world that evolves WITH you
- **Depth through Layers**: Surface exploration with procedural depth
- **Every Action Has Consequences**: World remembers your history

### 2. Tidal Rhythm
- **Growth and Decay**: Both are beautiful
- **Pollution isn't Punishment**: It's transformation
- **Shocks Mutate World**: Into new forms
- **Endless Evolution**: World transforms but never resets

### 3. Touch as Poetry
- **Gestures = Conducting World's Symphony**
- **No Buttons**: Only touch
- **Haptics Create Physical Bond**: World's heartbeat
- **One-Handed Portrait Play**: 60 FPS non-negotiable

### 4. Evolutionary Memory
- **Your Legacy Outlives You**: Traits inherit into ecosystem
- **Journal Persists**: Captures your story over time
- **Packs Quest Your Old Scars**: Haikus narrate your arc

### 5. Mobile-First Forever
- **Not a Port**: Designed for touch from day one
- **Gestures are Primary Input**: Not shortcuts
- **Haptics are Essential**: Not optional
- **Battery-Conscious**: Rendering optimizations
- **Lean APK**: Target <15MB (currently 4MB)

---

## Target Audience

### Primary: Mobile-First Gamers
- **Demographics**: Age 25-45, Android/iOS (mid-range devices)
- **Session Length**: 10-60 minutes
- **Play Style**: On commute, at lunch, evening wind-down
- **Psychographics**: 
  - Values quality over quantity
  - Appreciates thoughtful design
  - Seeks meditative experiences
  - Enjoys discovery over optimization
  - Prefers depth over breadth

### Commercial Release Goals
- **App Store Presence**: Google Play / App Store
- **Monetization**: Free with optional premium ($1.99 for exclusive traits, offline sync, premium haptics)
- **Community**: Seed sharing, haiku journals, strategy guides

---

## Success Metrics

### Player Engagement
- **Session Length**: 20-60 minutes average
- **Return Rate**: 70%+ linger rate (come back next session)
- **Completion**: 30%+ unlock all traits
- **Depth**: 50%+ trigger all shock types

### Technical Quality
- **Performance**: 60 FPS on mid-range Android (Snapdragon 700+)
- **Load Time**: <3 seconds to playable
- **Crash Rate**: <1% per session
- **Battery**: <10% drain per hour

### Emotional Resonance
- **"Ache" Factor**: Players report emotional connection to world
- **Replayability**: Players willingly reset for new cycles
- **Sharing**: Players share world seeds with friends
- **Journal**: Players screenshot and share haikus

---

## What Makes This Special

### Innovation #1: Magnetic Resource Snapping
No menus. Resources snap magnetically based on proximity and affinity. Scales infinitely through procedural permutations.

### Innovation #2: Trait Inheritance Ecosystem
Your traits don't just affect you—they shape the world. Creatures evolve similar traits, creating hybrid forms.

### Innovation #3: Procedural Haiku Journaling
Every significant moment generates a haiku. Jaro-Winkler guard prevents repetition. Journal persists across cycles.

### Innovation #4: Touch as Language
Gestures aren't shortcuts—they ARE the game. Haptics create physical bond with world events.

### Innovation #5: Behavior-Driven World
Yuka adapts and reacts based on player playstyle. No punishment—just consequences that mirror actions.

---

## Not This

❌ **NOT** an infinite universe explorer  
❌ **NOT** a collect-em-all progression grind  
❌ **NOT** a menu-driven crafting sim  
❌ **NOT** a desktop game ported to mobile  
❌ **NOT** a multiplayer competitive arena  
❌ **NOT** a 2D tile-based game (current implementation is interim)

---

## This Instead

✅ **Intimate**: One world you reshape over hours, not minutes  
✅ **Tidal**: Ebb (pollution/decay) and Bloom (growth/harmony) cycles  
✅ **Evolutionary**: Your traits inherit into the ecosystem  
✅ **Touch-First**: Gestures as primary language, haptics as heartbeat  
✅ **Endless Evolution**: World transforms continuously, never resets  
✅ **Raycasted 3D**: DOS-era aesthetic, modern-smoothed

---

## Current State vs. Vision

### Current Implementation (Interim)
- **Rendering**: 2D tile-based (Phaser 3)
- **Status**: Stage 1 complete, core systems implemented
- **Purpose**: Foundation for raycast 3D migration

### Vision (Target)
- **Rendering**: Raycasted 3D (Wolfenstein-style)
- **Status**: Vision committed, implementation pending
- **Timeline**: Stage 2+ (after performance validation)

---

## Open Questions (To Resolve)

1. **Raycast Performance**: Can raycast achieve 60 FPS on mid-range Android?
2. **Physics Integration**: Rapier vs. tile-based collision for raycast?
3. **Village Emergence**: How do villages spawn and evolve from simulation rules?
4. **Combat System**: How do wisp clashes work with gesture-based controls?

---

**Last Updated**: 2025-01-XX  
**Version**: 2.0.0 (Raycast 3D Vision Committed)  
**Status**: Frozen - Master Vision Document
