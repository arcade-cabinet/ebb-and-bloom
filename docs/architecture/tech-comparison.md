# Technology Comparison - Ebb & Bloom

**Version**: 1.0.0  
**Date**: 2025-01-XX  
**Purpose**: Evaluate technology choices for mobile-first procedural world simulation

---

## Rendering: Raycast vs. Low-Poly vs. 2D

### Option A: Raycasted 3D (Vision)
**Approach**: Wolfenstein-style raycasting with modern smoothing

**Pros**:
- ✅ Efficient (seed-driven, no asset bloat)
- ✅ Feels vast without VRAM suck
- ✅ Procedural: Seed ties to evo history
- ✅ Mobile-friendly: ~100 rays per frame (60FPS mobile)
- ✅ DOS-era aesthetic (matches vision)

**Cons**:
- ❌ Limited verticality (2.5D, not full 3D)
- ❌ Complex lighting (needs custom shaders)
- ❌ Performance unproven on mobile (needs validation)
- ❌ Gesture controls need refinement (swipe-turn, pinch-zoom)

**Performance**:
- **Target**: ~100 rays per frame, ~1ms/frame (JS port)
- **Mobile**: Unproven (needs real device testing)
- **Memory**: Seed-driven (no asset storage)

**Recommendation**: **Deferred** - Validate performance on mid-range Android before committing

---

### Option B: Low-Poly Mesh Tiles
**Approach**: Three.js/Babylon.js with low-poly meshes

**Pros**:
- ✅ Full 3D (true verticality)
- ✅ Mature engines (Three.js, Babylon.js)
- ✅ Good mobile performance (WebGL acceleration)
- ✅ Rich ecosystem (plugins, shaders)

**Cons**:
- ❌ Asset pipeline complexity (mesh generation)
- ❌ Larger bundle size (~200KB+ for Three.js)
- ❌ Less "DOS-era" aesthetic
- ❌ More complex world generation (mesh creation)

**Performance**:
- **Target**: 60 FPS on mid-range Android (proven)
- **Mobile**: Good (WebGL acceleration)
- **Memory**: Higher (mesh data)

**Recommendation**: **Alternative** - Consider if raycast performance insufficient

---

### Option C: 2D Tile-Based (Current)
**Approach**: Phaser 3 with tile-based rendering

**Pros**:
- ✅ Proven performance (60 FPS mobile)
- ✅ Simple implementation (current codebase)
- ✅ Low memory footprint
- ✅ Fast iteration

**Cons**:
- ❌ Doesn't match vision (raycasted 3D)
- ❌ Limited depth perception
- ❌ Less immersive

**Performance**:
- **Target**: 60 FPS on mid-range Android (achieved)
- **Mobile**: Excellent (proven)
- **Memory**: Low (<150MB)

**Recommendation**: **Current** - Keep until raycast performance validated

---

## Physics: Rapier vs. Alternatives

### Option A: Rapier (Vision)
**Approach**: Rust-origin physics engine, WASM/JS bindings

**Pros**:
- ✅ High performance (Rust-native)
- ✅ Deterministic (important for procedural)
- ✅ Good mobile performance (WASM)
- ✅ Modern API (clean, well-documented)

**Cons**:
- ❌ WASM overhead (initialization time)
- ❌ Less mature ecosystem (fewer examples)
- ❌ Learning curve (Rust concepts)

**Performance**:
- **Target**: 60 FPS with 100+ rigid bodies
- **Mobile**: Good (WASM acceleration)
- **Memory**: Moderate (WASM heap)

**Recommendation**: **Deferred** - Evaluate when moving to 3D/raycast

---

### Option B: Cannon.js / Ammo.js
**Approach**: JavaScript physics engines

**Pros**:
- ✅ Pure JS (no WASM overhead)
- ✅ Mature ecosystem (many examples)
- ✅ Easy integration (npm install)

**Cons**:
- ❌ Lower performance (JS vs. Rust)
- ❌ Less deterministic (floating-point precision)
- ❌ Larger bundle size

**Performance**:
- **Target**: 60 FPS with 50+ rigid bodies
- **Mobile**: Moderate (JS performance)
- **Memory**: Higher (JS objects)

**Recommendation**: **Alternative** - Consider if Rapier performance insufficient

---

### Option C: No Physics (Current)
**Approach**: Tile-based collision (no physics engine)

**Pros**:
- ✅ Simple (no physics engine)
- ✅ Fast (no physics calculations)
- ✅ Deterministic (tile-based)

**Cons**:
- ❌ Limited interactions (no dynamic objects)
- ❌ Doesn't match vision (3D raycast needs physics)

**Performance**:
- **Target**: 60 FPS (achieved)
- **Mobile**: Excellent (no physics overhead)
- **Memory**: Low (no physics data)

**Recommendation**: **Current** - Keep until 3D/raycast implemented

---

## Platform: Ionic/Vue/Capacitor vs. React/Expo

### Option A: Ionic/Vue/Capacitor (Current)
**Approach**: Vue 3 + Ionic + Capacitor

**Pros**:
- ✅ Mobile-first framework (Ionic components)
- ✅ Native plugin support (Capacitor)
- ✅ Web fallback (PWA)
- ✅ Good performance on mobile
- ✅ Current implementation (working)

**Cons**:
- ❌ Vue learning curve (if not familiar)
- ❌ Ionic component overhead (~50KB)
- ❌ Less flexible (Ionic-specific components)

**Performance**:
- **Target**: 60 FPS mobile (achieved)
- **Mobile**: Good (native plugins)
- **Memory**: Moderate (Ionic components)

**Recommendation**: **Current** - Keep unless performance issues

---

### Option B: React/Expo + Three Fiber
**Approach**: React Native + Expo + React-Three-Fiber

**Pros**:
- ✅ Declarative 3D (React-Three-Fiber)
- ✅ Rich ecosystem (React plugins)
- ✅ Good performance (React Native)
- ✅ Cross-platform (iOS + Android)

**Cons**:
- ❌ Larger bundle size (~500KB+ for React)
- ❌ More complex setup (Expo config)
- ❌ Less "mobile-first" (desktop-focused)

**Performance**:
- **Target**: 60 FPS mobile (proven)
- **Mobile**: Good (React Native)
- **Memory**: Higher (React overhead)

**Recommendation**: **Alternative** - Consider if Vue performance insufficient

---

## Recommendation Summary

### Initial Prototype Stack

**Rendering**: **2D Tile-Based (Phaser)** - Keep current until raycast performance validated
- **Why**: Proven performance, simple implementation
- **When to Revisit**: After Stage 2, validate raycast on real devices

**Physics**: **None (Tile-Based)** - Keep current until 3D/raycast implemented
- **Why**: No physics needed for 2D tiles
- **When to Revisit**: When implementing raycast 3D

**Platform**: **Ionic/Vue/Capacitor** - Keep current
- **Why**: Mobile-first, native plugins, working implementation
- **When to Revisit**: If performance issues arise

### Future Stack (Stage 2+)

**Rendering**: **Raycasted 3D** - Validate performance first
- **Why**: Matches vision, efficient, procedural
- **Validation**: Real device testing on mid-range Android

**Physics**: **Rapier** - Evaluate when moving to 3D
- **Why**: High performance, deterministic, modern API
- **Validation**: Performance benchmarks vs. Cannon.js

**Platform**: **Ionic/Vue/Capacitor** - Keep unless issues
- **Why**: Current implementation working, mobile-first
- **Revisit**: Only if performance or ecosystem issues

---

## Constraints & Tradeoffs

### Mobile Performance
- **Constraint**: 60 FPS on mid-range Android (Snapdragon 700+)
- **Tradeoff**: Raycast 3D vs. 2D tiles (performance vs. vision)
- **Decision**: Validate raycast performance before committing

### Bundle Size
- **Constraint**: APK <15MB (currently 4MB)
- **Tradeoff**: Feature richness vs. bundle size
- **Decision**: Keep lean, add features incrementally

### Development Velocity
- **Constraint**: Fast iteration, AI handoff-friendly
- **Tradeoff**: Framework complexity vs. flexibility
- **Decision**: Keep current stack (Vue/Capacitor) for speed

---

## Open Questions

1. **Raycast Performance**: Can raycast achieve 60 FPS on mid-range Android?
2. **Physics Need**: Is physics required for raycast 3D, or can we use tile-based collision?
3. **Bundle Size**: How much can we add before exceeding 15MB APK?
4. **Development Speed**: Will React/Expo be faster than Vue/Capacitor for 3D?

---

**Last Updated**: 2025-01-XX  
**Next Review**: After raycast performance validation

