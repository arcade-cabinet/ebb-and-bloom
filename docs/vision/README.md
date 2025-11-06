# Vision Documentation - Ebb & Bloom

**Executive Summary**: A procedural, raycasted 3D world simulation game with infinite generation, reactive ecology, resource harvesting, crafting (materials → alloys), and emergent villages/quests. DOS-era-inspired aesthetic, modern-smoothed. Mobile-first viability.

**Status**: Vision extracted from Grok conversation archive. Current implementation is 2D tile-based; vision evolved to raycasted 3D.

---

## Quick Read (5 Minutes)

### Core Fantasy
Explore → harvest → craft (materials → alloys) → build → influence ecology → encounter emergent villages/quests/fauna

### World Look
Raycasted 3D aesthetic reminiscent of DOS-era worlds (Wolfenstein-style), smoothed and modernized with lighting, interpolation, and post-processing. Not voxel-chunky.

### Core Verbs
- **Explore**: Stride through procedurally generated chunks
- **Harvest**: Gather resources via touch/gesture
- **Craft**: Materials combine into alloys through magnetic snapping (affinity-based)
- **Build**: Structures emerge from resource combinations
- **Influence**: Actions reshape ecosystems and societies
- **Encounter**: Villages, quests, wildlife emerge from simulation rules
- **Ecology**: Reactive world that adapts to playstyle

### Simulation Bias
The world reacts to player stewardship vs. exploitation. No punishment—just consequences that mirror playstyle.

### Platform Bias
Mobile-first viability important, but fun > framework. Evaluate Ionic/Vue/Capacitor vs. React/Expo + Three Fiber without dogma.

---

## Vision Stages (Chronological)

1. **[01_initial_design.md](./01_initial_design.md)** - Initial 2D tile-based concept ("EvoForge")
2. **[02_snapping_permutations_complexity.md](./02_snapping_permutations_complexity.md)** - Affinity system and infinite permutations
3. **[03_mobile_platform_integration.md](./03_mobile_platform_integration.md)** - Capacitor/Ionic Vue pivot
4. **[04_raycast_renderer_choice.md](./04_raycast_renderer_choice.md)** - Evolution to raycasted 3D
5. **[05_ecology_and_reactivity.md](./05_ecology_and_reactivity.md)** - Reactive world systems
6. **[06_materials_to_alloys_crafting.md](./06_materials_to_alloys_crafting.md)** - Crafting system deep dive
7. **[07_villages_quests_emergence.md](./07_villages_quests_emergence.md)** - Emergent villages and quests
8. **[09_mobile_perf_constraints.md](./09_mobile_perf_constraints.md)** - Performance targets
9. **[10_vertical_slice_plan.md](./10_vertical_slice_plan.md)** - MVP scope

---

## Key Decisions

### Rendering
- **Vision**: Raycasted 3D (Wolfenstein-style) with modern smoothing
- **Current**: 2D tile-based (Phaser)
- **Status**: Deferred - needs performance validation on mobile

### Physics
- **Vision**: Rapier (Rust-origin, WASM/JS bindings)
- **Current**: None (2D tile-based)
- **Status**: Deferred - evaluate when moving to 3D

### Platform
- **Vision**: Mobile-first (Ionic/Vue/Capacitor or React/Expo)
- **Current**: Vue/Capacitor implemented
- **Status**: Verified

### Core Loop
- **Vision**: Explore → harvest → craft → build → influence → encounter
- **Current**: Basic movement, snapping, pollution tracking
- **Status**: Partial - missing villages, quests

---

## Open Questions

1. **Rendering Path**: Raycasted 3D vs. low-poly mesh tiles for mobile performance?
2. **Physics Integration**: When to introduce Rapier vs. staying 2D?
3. **Village Emergence**: How do villages/quests emerge from simulation rules?
4. **Content Pipeline**: How to author/procedurally generate villages and quests?

---

## Manifest

See [manifest.json](./manifest.json) for machine-readable tracking of all vision stages, decisions, and open questions.

---

**Last Updated**: 2025-01-XX  
**Source**: Grok conversation archive (`memory-bank/archive/Grok-Procedural_Pixel_World_Evolution_Game.md`)

