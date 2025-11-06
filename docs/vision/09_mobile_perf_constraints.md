# Stage 09: Mobile Performance Constraints

**Context from Chat Replay**: Throughout (mobile-first focus, performance targets)  
**Key Evolution**: Web prototype → Mobile-optimized production targets

---

## Intent & Player Fantasy

Mobile-first viability is important, but fun > framework. Target 60 FPS on mobile devices. Use sprite pooling (no create/destroy in game loop). Implement viewport culling for large worlds. Battery-conscious rendering optimizations.

---

## Mechanics & Systems

### Performance Targets

**Frame Rate**:
- **Target**: 60 FPS on mid-range Android (Snapdragon 700+)
- **Frame Time**: <16.67ms per frame
- **Mobile Cap**: Browser 60FPS cap (native can hit 120FPS bursts)

**Memory**:
- **Target**: <150MB RAM
- **APK Size**: <15MB (currently 4MB!)
- **Asset Size**: <5MB total (pixel art PNGs)

**Load Time**:
- **Target**: <3 seconds to playable
- **First Frame**: <1 second
- **World Gen**: <2 seconds (procedural)

**Battery**:
- **Target**: <10% drain per hour
- **Throttle**: AI updates to 100ms
- **Culling**: Only render visible tiles

---

## Worldgen & Ecology

**Optimization Strategies**:

**Viewport Culling**:
- Only render visible tiles (not entire world)
- Distance-based updates (re-render chunks only when needed)
- Frustum culling for 3D raycast (if implemented)

**Sprite Pooling**:
- Reuse sprites instead of creating new
- No create/destroy in game loop
- Pre-allocate sprite pools on init

**ECS Performance**:
- Cache-friendly memory layout (BitECS archetypes)
- Batch component updates when possible
- Avoid entity lookup in hot paths

**Procedural Generation**:
- Chunk-based loading (load on demand)
- Deterministic seeds (no re-generation)
- Cache generated chunks (don't regenerate)

---

## Progression & Economy

**Performance Budget**:
- **Rendering**: 8-10ms per frame
- **ECS Systems**: 3-5ms per frame
- **Yuka AI**: 2-3ms per frame (throttled to 100ms)
- **UI Updates**: 1-2ms per frame
- **Total**: <16.67ms per frame (60 FPS)

**Scaling Considerations**:
- Limit active entities (50-200 critters)
- Limit active villages (5-10 per world)
- Limit active quests (10-20 per world)
- Cap chain depth (10-deep chains)

---

## UX/Camera/Controls

**Touch Optimization**:
- Gesture recognition: <50ms latency
- Haptic feedback: Throttled to significant events
- UI updates: Debounced (don't update every frame)

**Rendering Optimizations**:
- WebGL acceleration (Phaser)
- Pixel art rendering (no anti-aliasing)
- Distance-based LOD (if 3D raycast)
- Particle effects: Capped (max 100 particles)

---

## Technical Direction

**Rendering**:
- **Current**: Phaser Canvas/WebGL
- **Target**: 60 FPS on mid-range Android
- **Optimizations**: Viewport culling, sprite pooling, distance-based updates

**Physics**:
- **Current**: None (2D tile-based)
- **Future**: Rapier (if 3D raycast) - WASM/JS bindings, efficient
- **Performance**: Deterministic, cache-friendly

**Procgen**:
- **Current**: Perlin noise, chunk-based
- **Optimizations**: Cache generated chunks, deterministic seeds
- **Scaling**: Chunk-based loading, lazy generation

**Data**:
- **Current**: BitECS (cache-friendly)
- **Optimizations**: Batch updates, avoid lookups in hot paths
- **Scaling**: Archetype storage, efficient queries

---

## Scope/Constraints

**Mobile Constraints**:
- **RAM**: Limited (target <150MB)
- **CPU**: Mid-range (Snapdragon 700+)
- **GPU**: WebGL (hardware-accelerated)
- **Battery**: Limited (target <10% per hour)

**Performance Budget**:
- **Frame Time**: <16.67ms (60 FPS)
- **Memory**: <150MB RAM
- **Load Time**: <3 seconds
- **Battery**: <10% per hour

**Scaling Limits**:
- **Entities**: 50-200 critters
- **Villages**: 5-10 per world
- **Quests**: 10-20 per world
- **Chain Depth**: 10-deep chains

---

## Decision Log

- ✅ **60 FPS Target**: Non-negotiable for mobile
- ✅ **Sprite Pooling**: No create/destroy in game loop
- ✅ **Viewport Culling**: Only render visible tiles
- ✅ **ECS Architecture**: Cache-friendly memory layout
- ✅ **Throttle AI**: Yuka updates to 100ms
- ✅ **Chunk-Based Loading**: Load on demand, cache generated
- ✅ **WebGL Acceleration**: Hardware-accelerated rendering

---

## Open Questions

- Raycast performance on mobile (if implemented)?
- Rapier physics performance (if implemented)?
- Battery drain validation (real device testing)?
- Memory profiling (identify leaks)?
- Load time optimization (further improvements)?

---

**Next Stage**: Vertical slice plan and MVP scope

