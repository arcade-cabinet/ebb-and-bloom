# Stage 10: Vertical Slice Plan

**Context from Chat Replay**: Throughout (MVP scope, development stages)  
**Key Evolution**: Full vision → Scoped MVP for initial release

---

## Intent & Player Fantasy

Create a playable vertical slice that demonstrates core mechanics: Explore → harvest → craft → build → influence ecology. Target: 10-minute demo that hooks players, then expand based on feedback.

---

## Mechanics & Systems

### MVP Scope (Stage 1)

**Core Loop**:
- ✅ Character creator (10 Evo Points, 10 traits)
- ✅ Procedural world generation (64x64 grid, 3 biomes)
- ✅ Basic movement (touch/gesture)
- ✅ Resource snapping (ore + water = alloy)
- ✅ Pollution tracking (scalar per tile)
- ✅ Behavior profiling (harmony/conquest/frolick)
- ✅ Basic shocks (40% whisper, 70% tempest)

**Missing (Stage 2+)**:
- ❌ Combat system (wisp clashes)
- ❌ Ritual mechanics (abyss reclamation)
- ❌ Nova cycles (45-90 min resets)
- ❌ Stardust hops (world-hopping)
- ❌ Villages/quests (emergent content)
- ❌ Raycasted 3D (still 2D tile-based)

### Vertical Slice Goals

**10-Minute Demo**:
1. **Character Creation** (2 min): Allocate 10 Evo Points, choose traits
2. **First Stride** (3 min): Explore world, discover biomes, collect resources
3. **First Snap** (5 min): Combine ore + water → alloy, see pollution tick, experience first shock

**First Hour**:
- Complete 5-8 snap combinations
- Pollution rises to ~15%
- First trait inheritance triggers
- Pack forms near you (3 critters → 1 pack)
- First shock (40% pollution → whisper)

**First Session (1-2 hours)**:
- Build 3-5 packs with different roles
- Experience loyalty schism (pack splits)
- Complete 15-20 snap combinations
- Hit Tempest Shock (70% pollution)
- Unlock first synergy (Burr-tide or Vein Hunter)
- Journal contains 10-15 haikus

---

## Worldgen & Ecology

**MVP Worldgen**:
- 64x64 grid (scalable to 128x128)
- 3 biomes (forest, river, plain)
- Perlin noise generation
- Deterministic seeds (shareable)

**MVP Ecology**:
- 5 critter types (fish, squirrels, birds, etc.)
- Yuka steering behaviors (flocking, pathfinding)
- Basic evolution (harmony → allies, conquest → evasive)
- Pollution reactions (critters flee, evolve defenses)

---

## Progression & Economy

**MVP Progression**:
- 10 traits (chainsaw, flipper, etc.)
- 5 snap recipes (wood+water, ore+water, etc.)
- Basic Evo Points economy
- Trait synergies (2-3 combinations)

**MVP Economy**:
- Resource gathering (ore, wood, water)
- Basic snapping (3-snap chains max)
- Pollution tracking (scalar per tile)
- Behavior profiling (3 axes)

---

## UX/Camera/Controls

**MVP Controls**:
- Touch movement (swipe to move)
- Tap to harvest
- Long-press to inspect
- Pinch-zoom (if implemented)

**MVP UI**:
- Character creator modal
- Status toolbar (pollution, behavior)
- Snap tooltips (affinity hints)
- Journal (haiku log)

---

## Technical Direction

**MVP Stack**:
- **Rendering**: Phaser 3 (Canvas/WebGL)
- **ECS**: BitECS
- **AI**: YukaJS
- **State**: Zustand
- **Platform**: Vue/Capacitor
- **Build**: Vite

**MVP Performance**:
- 60 FPS on mid-range Android
- <3s load time
- <150MB RAM
- <10% battery per hour

---

## Scope/Constraints

**MVP Timeline**:
- **Week 1-2**: Core seed (world gen, movement, basic snaps)
- **Week 3-4**: Character creator, trait system
- **Week 5-6**: Ecology system, behavior profiling
- **Week 7-8**: Polish, testing, APK build

**MVP Constraints**:
- 3 biomes (expandable)
- 5 critters (expandable)
- 10 traits (expandable)
- 5 snap recipes (expandable)
- Basic shocks (2 thresholds)

---

## Decision Log

- ✅ **MVP First**: Vertical slice before full vision
- ✅ **10-Minute Demo**: Hook players quickly
- ✅ **Expandable**: All systems designed for expansion
- ✅ **Mobile-First**: Target 60 FPS on mid-range Android
- ✅ **Procedural Core**: Seed-driven, deterministic
- ⚠️ **Deferred**: Combat, rituals, world-hopping (Stage 2+)

---

## Open Questions

- What's the minimum viable vertical slice?
- Which features are must-have vs. nice-to-have?
- How to balance depth vs. breadth in MVP?
- What's the expansion plan post-MVP?
- How to gather player feedback effectively?

---

## Next Steps

1. **Complete MVP**: Implement vertical slice (8 weeks)
2. **Test & Iterate**: Gather feedback, refine mechanics
3. **Expand**: Add Stage 2 features (combat, rituals, world-hopping)
4. **Polish**: UI/UX improvements, performance optimization
5. **Release**: App store launch, community building

---

**Status**: MVP in progress. Current implementation has core systems (ECS, snapping, pollution, behavior profiling) but missing Stage 2 features (combat, rituals, world-hopping, raycast 3D).


