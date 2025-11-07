# Stage 04: Raycast Renderer Choice

**Context from Chat Replay**: Lines ~4000-4500 (3D discussion → Raycast POC)  
**Key Evolution**: 2D tile-based → Raycasted 3D aesthetic

---

## Intent & Player Fantasy

Evolution from 2D tile-based rendering to **raycasted 3D** aesthetic reminiscent of DOS-era worlds (Wolfenstein-style), smoothed and modernized. The catalyst's stride casts rays for the horizon, rendering "veins" as textured walls that "remember" snaps. Full 3D models would bloat procedural sprawl, but raycasting is efficient, seed-driven, and feels vast without VRAM suck.

---

## Mechanics & Systems

### Raycast Engine

**Core Concept**:
- Player casts rays from position
- Hit "walls" (high Perlin thresholds = thorn ridges or abyss rims)
- Output distances for pseudo-3D slice
- Later slice to Phaser canvas for pixel haze

**Why Raycast Over Full 3D**:
- ✅ Efficient (seed-driven, no asset bloat)
- ✅ Feels vast without VRAM suck
- ✅ Procedural: Seed ties to evo history (pollution + time hash = thornier ridges)
- ✅ Mobile-friendly: ~100 rays per frame (60FPS mobile)

**Why Not Full 3D Models**:
- ❌ Asset gen per chunk = nightmare on mobile
- ❌ VRAM bloat
- ❌ Not seed-driven (requires storage)

### Stride Mechanics

**Walking**: Third-person over-shoulder cam (Phaser camera follows with subtle gyro tilt for "under the skin" immersion), free-roam on procedural heightmap chunks (Perlin for ebb valleys/bloom ridges, 3D navmesh for Yuka pack flocking).

**Gestures Adapt**:
- **Swipe**: Fluid momentum (chainsaw burr-trails carve voxel scars)
- **Pinch**: "Dive" (vertical strata sink, haptics throb pressure)
- **No WASD grind**: Thumb-seed flow, with idle drift (world breathes, evos whisper)

---

## Worldgen & Ecology

**Procgen Approach**:
- Perlin heightmaps for ebb valleys + bloom ridges
- Raycast the strata (surface meadows to abyss "tunnels")
- Haptic on ray hits (throb when you "probe" a grudge knot)
- Yuka packs: Simplified sprites billboarded on the ray grid, evos morphing their "silhouettes" via affine transforms

**Raycast Integration**:
- Seed-driven: Deterministic reproducibility
- Pollution spikes thresholds for thornier ridges
- Affinity mods: Flow aff? Rays "bend" toward water blooms
- World remembers snaps: Flipper flood warps the ray-traced river into a tidal scar

---

## Progression & Economy

**POC Implementation**:
- Phaser with raycaster lib (like raycast.js, ~5KB)
- Stride a 5-chunk demo, swipe to "scar" the walls (procedural texture warp)
- Keeps the seed pure, no model bloat

**Technical Details**:
- 32x32 grid chunks, height 0-1 (0=meadow, 1=void)
- Raycast render: 100 rays over 60° FOV
- Color by distance (short = indigo ebb, long = emerald bloom)
- Touch controls: Swipe-turn, tap-stride

---

## UX/Camera/Controls

**Camera Scheme**:
- First-person raycast view (Wolfenstein-style)
- Gesture warp: Swipe mods angle, pinch scales FOV
- Gyro tilt for "under the skin" immersion (optional)

**Touch Controls**:
- Swipe to rotate (turn)
- Tap to stride forward/back
- Pinch to zoom (FOV scale)
- Long-press to probe (snap carve)

**Visual Style**:
- Pseudo-3D slice rendering
- Color gradients: Indigo ebb (close) → Emerald bloom (far)
- Void haze overlay (20% darken when void affinity high)
- Particle effects: Blue wisps (flow), red sparks (heat)

---

## Technical Direction

**Renderer**: Raycast engine (custom or raycast.js library)
**Physics**: None (raycast-based collision)
**Engine Stack**: Phaser + Raycast lib + BitECS + YukaJS
**Platform**: Mobile-first (Capacitor)

**POC Code Structure**:
```ts
class RayStride {
  private noise = new SimplexNoise();
  private resolution = 100; // Rays for FOV
  private fov = 60;
  private maxDist = 20;
  
  castRays(chunk: Chunk, pos: {x, y}, angle: number): number[]
  renderView(chunk: Chunk, pos: {x, y}, angle: number, graphics: Graphics)
  warpAngle(delta: number) // Swipe mods angle
  warpFov(delta: number)  // Pinch scales FOV
}
```

---

## Scope/Constraints

**Mobile Perf**:
- ~100 rays per frame (60FPS mobile)
- ~1ms/frame (JS port with simplex-noise)
- Haptic: Short ray hit = light throb (wall nudge)

**Memory**:
- Seed-driven (no asset storage)
- Chunk-based loading (32x32 grids)
- Procedural texture warps (no pre-baked)

**Battery**:
- Efficient raycast algorithm
- Distance-based updates (only render visible)
- Throttle haptics to significant events

---

## Decision Log

- ✅ **Raycast over full 3D**: Efficient, seed-driven, mobile-friendly
- ✅ **Wolfenstein-style aesthetic**: DOS-era inspired, modern-smoothed
- ✅ **Gesture-based controls**: Swipe-turn, pinch-zoom, tap-stride
- ✅ **Procedural texture warps**: World remembers snaps (tidal scars)
- ✅ **Phaser integration**: Embed raycast view in Phaser scene
- ⚠️ **Deferred**: Full implementation pending performance validation

---

## Open Questions

- Performance validation on mid-range Android devices
- Raycast lib choice (custom vs. raycast.js)
- Shader integration for FXAA haze on walls
- Yuka pack billboard integration in ray grid
- Gyro tilt implementation (optional vs. required)
- Vertical strata ("dive" mechanic) implementation

---

**Next Stage**: Ecology and reactivity systems refinement

**Note**: Current implementation remains 2D tile-based. This vision stage represents the evolution of the design, but has not been implemented yet.


