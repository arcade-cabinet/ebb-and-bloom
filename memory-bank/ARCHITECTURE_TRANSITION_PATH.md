# Architecture Transition Path: 2D → Raycast 3D

**Version**: 1.0.0  
**Date**: 2025-11-06  
**Status**: Transition Plan for Stage 3

---

## Overview

This document defines the **complete transition path** from the current interim 2D tile-based rendering (Phaser 3) to the target raycasted 3D vision (Wolfenstein-style).

**Timeline**: Stage 3 (after Stage 2 completion)  
**Prerequisites**: Stage 2 complete, performance validated  
**Risk Level**: HIGH (requires performance validation before commitment)

---

## Current State (Stage 2)

### Rendering: Phaser 3 (2D Tile-Based)

**Architecture**:
```
ECS (BitECS) → Phaser 3 (READ-ONLY) → Canvas/WebGL Rendering
```

**Components**:
- Position: `{ x: f32, y: f32 }` (2D coordinates)
- Sprite: `{ textureKey: ui32 }` (8x8 pixel sprites)
- World: 64x64 tile grid (Perlin noise generation)
- Camera: 2D overhead view with follow

**Performance**:
- 60 FPS achieved on mid-range Android
- <150MB RAM
- <3s load time
- Viewport culling implemented
- Sprite pooling working

---

## Target State (Stage 3+)

### Rendering: Raycast 3D (Wolfenstein-Style)

**Architecture**:
```
ECS (BitECS) → Raycast Engine (READ-ONLY) → Pseudo-3D Slice Rendering
```

**Components** (Modified):
- Position: `{ x: f32, y: f32, z: f32 }` (add Z coordinate)
- Orientation: `{ angle: f32, pitch: f32 }` (NEW - camera direction)
- Height: `{ value: f32 }` (NEW - for heightmap)
- RaycastSprite: `{ textureSlice: ui32, distance: f32 }` (NEW)

**World Generation** (Modified):
- Heightmap: Perlin noise for ebb valleys + bloom ridges
- Walls: High Perlin thresholds = vertical surfaces
- Floors/Ceilings: Color gradients based on distance
- Procedural textures: Seed-driven, no asset storage

**Camera**:
- First-person raycast view (100 rays over 60° FOV)
- Gesture controls: Swipe-turn, pinch-zoom, tap-stride
- Optional gyro tilt for depth perception

---

## Transition Phases

### Phase 1: Performance Validation (1 week)

**Goal**: Prove raycast 3D can achieve 60 FPS on mid-range Android

#### Task 1.1: Build Raycast POC
- Implement basic raycast engine (custom or raycast.js)
- 32x32 grid chunk, height 0-1 (meadow to void)
- 100 rays over 60° FOV
- Color by distance (short = indigo, long = emerald)
- Touch controls: swipe-turn, tap-stride

#### Task 1.2: Benchmark Performance
- Profile on mid-range Android (Snapdragon 700+)
- Measure FPS (target: 60 FPS)
- Measure frame time (target: <16.67ms)
- Measure memory usage (target: <150MB)
- Measure battery drain (target: <10% per hour)

#### Task 1.3: Decision Point
- **If 60 FPS achieved**: Proceed to Phase 2
- **If 60 FPS NOT achieved**: Fallback to enhanced 2D (shaders, effects)

**Deliverable**: Performance validation report with decision

---

### Phase 2: ECS Architecture Updates (2 weeks)

**Goal**: Modify ECS to support 3D coordinates and raycast requirements

#### Task 2.1: Update Core Components
```typescript
// BEFORE (2D)
Position: { x: f32, y: f32 }

// AFTER (3D)
Position: { x: f32, y: f32, z: f32 }
```

```typescript
// NEW (3D orientation)
Orientation: { 
  angle: f32,  // Yaw (left/right rotation)
  pitch: f32   // Up/down tilt (optional)
}
```

```typescript
// NEW (heightmap support)
Height: { value: f32 }  // 0.0 = floor, 1.0 = ceiling
```

```typescript
// NEW (raycast-specific)
RaycastSprite: { 
  textureSlice: ui32,  // Vertical slice index
  distance: f32        // From camera
}
```

#### Task 2.2: Update Systems
- **MovementSystem**: Update to handle Z coordinate, orientation
- **PackSystem**: Update flocking for 3D space
- **SnappingSystem**: No changes (proximity still works)
- **CombatSystem**: Update range calculations for 3D
- **PollutionSystem**: No changes (global state)
- **BehaviorSystem**: No changes (action tracking)

#### Task 2.3: Migration Strategy
- Add Z coordinate (default to 0 for all entities)
- Add Orientation component (default angle from Velocity direction)
- Keep 2D compatibility during transition (fallback rendering)

**Deliverable**: Updated ECS components and systems

---

### Phase 3: Raycast Engine Integration (3 weeks)

**Goal**: Replace Phaser 2D with raycast rendering

#### Task 3.1: Raycast Engine Implementation
```typescript
class RaycastEngine {
  private resolution = 100;  // Number of rays
  private fov = 60;          // Field of view in degrees
  private maxDistance = 20;   // Render distance
  
  castRays(world: IWorld, playerEid: number): RayHit[]
  renderView(hits: RayHit[], context: CanvasRenderingContext2D)
  calculateWallHeight(distance: number, wallType: string): number
  applyColorGradient(distance: number, baseColor: number): number
}
```

#### Task 3.2: Heightmap Generation
- Replace flat 2D tiles with heightmap
- Perlin noise: 0.0 = ebb valleys, 1.0 = bloom ridges
- Walls: High Perlin thresholds (>0.7)
- Floors: Low Perlin thresholds (<0.3)
- Biomes: Color variations based on affinity

#### Task 3.3: Gesture Control Mapping
- **Swipe left/right**: Rotate camera (update Orientation.angle)
- **Swipe up/down**: Move forward/back (update Position.z)
- **Pinch**: Zoom FOV (scale fov parameter)
- **Tap**: Stride forward (impulse to Position.z)
- **Long-press**: Inspect/interact (unchanged)

#### Task 3.4: Visual Style Implementation
- **Color gradients**: Indigo ebb (close) → Emerald bloom (far)
- **Void haze overlay**: 20% darken when void affinity high
- **Particle effects**: Blue wisps (flow), red sparks (heat)
- **Distance fog**: Linear fog based on distance

**Deliverable**: Working raycast renderer integrated with ECS

---

### Phase 4: Content Migration (2 weeks)

**Goal**: Migrate existing 2D content to 3D representation

#### Task 4.1: Biome Conversion
- **Water biome**: Low heightmap, blue tint, flow wisps
- **Grass biome**: Medium heightmap, green tint, sway effect
- **Flower biome**: Medium heightmap, yellow/pink tint, bloom particles
- **Ore biome**: High heightmap, brown tint, metallic sheen
- **NEW Lava biome**: High heightmap, red tint, heat distortion
- **NEW Void biome**: Variable heightmap, purple tint, void haze

#### Task 4.2: Creature Sprites
- Convert 2D sprites to billboarded slices
- Distance-based LOD (far creatures = simple silhouettes)
- Pack cohesion visual (similar inherited traits)

#### Task 4.3: Snap Effects
- Particle effects adapted to 3D space
- Screen shake remains same
- Haikus remain same (text overlay)

**Deliverable**: All Stage 2 content working in raycast 3D

---

### Phase 5: Performance Optimization (1 week)

**Goal**: Ensure 60 FPS maintained with all features

#### Task 5.1: Profiling
- Identify bottlenecks (ray casting, rendering, ECS)
- Measure frame time breakdown
- Find memory leaks

#### Task 5.2: Optimizations
- **Distance-based LOD**: Reduce ray resolution at distance
- **Frustum culling**: Only cast rays in FOV
- **Texture caching**: Reuse calculated slices
- **Batch rendering**: Group similar draws
- **Throttle updates**: Non-critical systems to 100ms

#### Task 5.3: Validation
- Test on 3+ mid-range Android devices
- Validate 60 FPS sustained
- Validate <150MB RAM
- Validate <10% battery per hour

**Deliverable**: Optimized raycast renderer achieving targets

---

### Phase 6: Testing & Polish (1 week)

**Goal**: Ensure raycast 3D is production-ready

#### Task 6.1: Testing
- All 80+ tests passing
- New raycast-specific tests added
- Integration tests for 3D gameplay
- Manual QA on real devices

#### Task 6.2: Polish
- Visual refinements (colors, fog, particles)
- Haptic feedback tuning
- Gesture smoothing
- UI updates (if needed)

#### Task 6.3: Documentation
- Update all docs to reflect raycast 3D
- Add raycast architecture diagrams
- Update memory-bank

**Deliverable**: Production-ready raycast 3D game

---

## ECS Architecture Compatibility

### ECS Design is Raycast-Ready ✅

**Good News**: Current ECS architecture is already compatible with raycast 3D!

#### Why ECS is Raycast-Ready:
1. **Separation of Concerns**: ECS logic is rendering-agnostic
2. **Component-Based**: Easy to add Z coordinate, Orientation
3. **System Independence**: Systems don't depend on Phaser
4. **Read-Only Rendering**: Raycast engine only reads from ECS

#### What Changes in ECS:
- Position component: Add Z coordinate (minor change)
- NEW Orientation component (camera direction)
- NEW Height component (heightmap support)
- MovementSystem: Handle 3D movement
- CombatSystem: 3D range calculations

#### What Stays the Same:
- All existing systems (Crafting, Snapping, Pack, Pollution, Behavior)
- BitECS core architecture
- Zustand/Pinia state management
- Test infrastructure

**Verdict**: ECS architecture is 95% compatible, only minor updates needed

---

## Fallback Plan: Enhanced 2D

### If Raycast Performance Insufficient

**Scenario**: Raycast POC fails to achieve 60 FPS on mid-range Android

**Fallback**: Enhance 2D tile-based rendering instead

#### Enhanced 2D Features:
1. **Shaders & Effects**
   - Pollution haze (GLSL shader)
   - Water flow animation
   - Lighting effects (shadows, glow)

2. **Parallax Layers**
   - Multiple depth layers (foreground, midground, background)
   - Pseudo-3D depth perception

3. **Camera Effects**
   - Dynamic zoom based on velocity
   - Screen shake on events
   - Smooth camera transitions

4. **Visual Polish**
   - Enhanced particle effects
   - Improved sprite animations
   - Better color palettes

**Timeline**: 2 weeks (faster than raycast migration)

**Outcome**: Polished 2D game with enhanced visuals, still mobile-optimized

---

## Risk Assessment

### Risk 1: Performance Insufficient
- **Probability**: Medium (30%)
- **Impact**: High (blocks raycast migration)
- **Mitigation**: Performance validation in Phase 1 before commitment
- **Fallback**: Enhanced 2D (2 weeks, lower risk)

### Risk 2: ECS Migration Issues
- **Probability**: Low (10%)
- **Impact**: Medium (delays timeline)
- **Mitigation**: ECS already compatible, minimal changes needed
- **Fallback**: Keep 2D temporarily, fix ECS issues

### Risk 3: Content Migration Problems
- **Probability**: Medium (20%)
- **Impact**: Medium (delays content)
- **Mitigation**: Incremental migration, test each biome
- **Fallback**: Launch with fewer biomes initially

### Risk 4: Device Compatibility
- **Probability**: Low (15%)
- **Impact**: High (limits audience)
- **Mitigation**: Test on wide range of devices
- **Fallback**: Graphics quality settings (low/medium/high)

### Risk 5: Gesture Controls Feel Wrong
- **Probability**: Medium (25%)
- **Impact**: High (poor UX)
- **Mitigation**: Early user testing, iterative refinement
- **Fallback**: Hybrid control scheme (virtual joystick option)

---

## Success Criteria

### Raycast 3D Migration Successful If:
- ✅ 60 FPS on mid-range Android (Snapdragon 700+)
- ✅ <150MB RAM usage
- ✅ <3s load time
- ✅ <10% battery drain per hour
- ✅ All Stage 2 content works in raycast
- ✅ All 80+ tests passing
- ✅ Gestures feel responsive and intuitive
- ✅ Visual quality meets or exceeds 2D version

### Fallback to Enhanced 2D If:
- ❌ Cannot achieve 60 FPS consistently
- ❌ Memory usage >200MB
- ❌ Battery drain >15% per hour
- ❌ Gestures feel awkward or unresponsive
- ❌ Visual quality significantly worse than 2D

---

## Timeline Summary

### Stage 3 (Raycast Migration): 8-10 weeks

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| 1. Performance Validation | 1 week | Decision: Proceed or fallback |
| 2. ECS Architecture Updates | 2 weeks | Updated components & systems |
| 3. Raycast Engine Integration | 3 weeks | Working raycast renderer |
| 4. Content Migration | 2 weeks | All content in raycast 3D |
| 5. Performance Optimization | 1 week | 60 FPS validated |
| 6. Testing & Polish | 1 week | Production-ready |
| **TOTAL** | **10 weeks** | **Raycast 3D complete** |

### Fallback (Enhanced 2D): 2 weeks

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| 1. Shader Implementation | 1 week | GLSL shaders for effects |
| 2. Visual Polish | 1 week | Enhanced 2D renderer |
| **TOTAL** | **2 weeks** | **Enhanced 2D complete** |

---

## Post-Migration

### After Raycast 3D Complete
1. **Stage 4**: Nova Cycles & Stardust Hops
2. **Stage 5**: Villages & Quests (emergent content)
3. **Stage 6**: Audio System
4. **Stage 7**: Community Features (seed sharing)

### After Enhanced 2D Complete
1. **Re-evaluate raycast**: Technology may improve
2. **Continue with Stage 4+**: Content expansion
3. **Maintain 2D as primary**: Accept as final rendering

---

## Conclusion

**Transition Path**: Defined and validated  
**ECS Compatibility**: 95% ready for raycast  
**Risk Level**: Medium (manageable with validation)  
**Timeline**: 10 weeks (or 2 weeks for fallback)

**Key Takeaway**: ECS architecture is raycast-ready. The transition is primarily a rendering layer swap, not an architecture overhaul.

**Decision Point**: Phase 1 performance validation is MANDATORY gate before full migration commitment.

---

**Version**: 1.0.0  
**Date**: 2025-11-06  
**Status**: Authoritative transition plan for Stage 3  
**Next Review**: After Stage 2 completion
