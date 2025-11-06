# Technology Stack - Ebb & Bloom

**Version**: 2.0.0  
**Date**: 2025-01-XX  
**Status**: Frozen - Technology Decisions Committed

---

## Core Technology Decisions

### Rendering: Raycasted 3D (Target)
- **Vision**: Wolfenstein-style raycasting with modern smoothing
- **Current**: Phaser 3 (2D tile-based) - interim foundation
- **Target Library**: Custom raycast engine or raycast.js (~5KB)
- **Rationale**: Efficient, seed-driven, mobile-friendly, DOS-era aesthetic
- **Status**: Vision committed, implementation Stage 2+

### Physics: None (Current) → Rapier (Future)
- **Current**: Tile-based collision (no physics engine)
- **Future**: Rapier (Rust-origin, WASM/JS bindings) - if needed for raycast 3D
- **Rationale**: Deterministic, high performance, modern API
- **Status**: Deferred until raycast 3D migration

### Platform: Ionic/Vue/Capacitor (Locked)
- **Framework**: Vue 3.5+ with Composition API
- **UI**: Ionic Vue 8.7+ for mobile components
- **Native**: Capacitor 6.1+ for mobile bridge
- **Rationale**: Mobile-first, native plugins, web fallback, proven performance
- **Status**: Locked in - no changes planned

### ECS: BitECS (Locked)
- **Version**: BitECS 0.3+
- **Rationale**: High performance, cache-friendly, scales to thousands of entities
- **Status**: Locked in - core architecture

### AI: YukaJS (Locked)
- **Version**: Yuka 0.7+
- **Rationale**: Lightweight steering behaviors, FSM support, behavior profiling
- **Status**: Locked in - core to behavior system

### State: Zustand (Locked)
- **Version**: Zustand 5.0+
- **Rationale**: Lightweight (<1KB), no boilerplate, perfect for ECS → UI sync
- **Status**: Locked in - UI state management

---

## Complete Technology Stack

### Core Framework
```json
{
  "pnpm": "9.x",
  "typescript": "5.7+",
  "node": ">=20.x"
}
```

### Mobile Framework
```json
{
  "@capacitor/core": "6.1+",
  "@capacitor/android": "6.1+",
  "@ionic/vue": "8.7+",
  "vue": "3.5+"
}
```

### Game Engine & Architecture
```json
{
  "bitecs": "0.3+",
  "yuka": "0.7+",
  "zustand": "5.0+"
}
```

### Build & Dev Tools
```json
{
  "vite": "6.0+",
  "vitest": "2.1+",
  "@vitejs/plugin-vue": "latest"
}
```

### Rendering (Current Interim)
```json
{
  "phaser": "3.87+"
}
```

### Rendering (Target Vision)
```json
{
  "raycast-engine": "custom or raycast.js (~5KB)"
}
```

---

## Technology Rationale

### Why Raycast Over Full 3D?
- ✅ **Efficient**: Seed-driven, no asset bloat
- ✅ **Mobile-Friendly**: ~100 rays per frame (60FPS target)
- ✅ **Procedural**: Seed ties to evo history
- ✅ **Aesthetic**: DOS-era inspired, modern-smoothed
- ❌ **Not Full 3D**: Limited verticality (2.5D), but sufficient for vision

### Why Ionic/Vue/Capacitor?
- ✅ **Mobile-First**: Designed for touch, gestures, haptics
- ✅ **Native Plugins**: Haptics, filesystem, geolocation
- ✅ **Web Fallback**: PWA support, GitHub Pages deployment
- ✅ **Proven Performance**: 60 FPS achieved on mid-range Android
- ✅ **Developer Experience**: Fast iteration, AI handoff-friendly

### Why BitECS?
- ✅ **Performance**: Cache-friendly memory layout
- ✅ **Scalability**: Handles thousands of entities
- ✅ **Separation**: Clean data/logic separation
- ✅ **Future-Proof**: Extensible for complex gameplay

### Why YukaJS?
- ✅ **Lightweight**: Minimal overhead
- ✅ **Behavior Profiling**: Core to playstyle system
- ✅ **Steering Behaviors**: Flocking, pathfinding, FSM
- ✅ **Mobile-Friendly**: Throttled to 100ms updates

### Why Zustand?
- ✅ **Lightweight**: <1KB bundle size
- ✅ **No Boilerplate**: Simple API
- ✅ **Framework Agnostic**: Works with Vue
- ✅ **ECS Sync**: Perfect for one-way ECS → UI flow

---

## Version Constraints

### Locked Versions (No Changes Without Review)
- **BitECS**: 0.3+ (core architecture)
- **Yuka**: 0.7+ (behavior system)
- **Zustand**: 5.0+ (state management)
- **Capacitor**: 6.1+ (mobile bridge)
- **Vue**: 3.5+ (UI framework)

### Flexible Versions (Auto-Updated)
- **Vite**: Latest (build tool)
- **Vitest**: Latest (testing)
- **Ionic Vue**: Latest (UI components)
- **TypeScript**: Latest (type safety)

### Game Engine Versions (Manual Review)
- **Phaser**: 3.87+ (current interim)
- **Raycast Engine**: TBD (target vision)

---

## Platform Support

### Primary: Mobile (Android/iOS)
- **Android**: Minimum API 24 (Android 7.0)
- **iOS**: Minimum iOS 13+
- **Target Devices**: Mid-range (Snapdragon 700+, A12+)
- **Performance**: 60 FPS target

### Secondary: Web (PWA)
- **Browsers**: Chrome, Firefox, Safari (latest)
- **Deployment**: GitHub Pages, Capacitor PWA
- **Offline**: IndexedDB persistence

### Not Supported
- **Desktop**: Not a priority (mobile-first)
- **VR**: Future consideration (Stage 4+)

---

## Build & Deployment

### Development
```bash
pnpm install          # Install dependencies
pnpm dev             # Start dev server (HMR)
pnpm test            # Run tests
```

### Production
```bash
pnpm build           # Build for production
npx cap sync android # Sync to Android
npx cap open android # Open Android Studio
```

### CI/CD
- **GitHub Actions**: Automated builds on every commit
- **Renovate Bot**: Automated dependency updates
- **Test Coverage**: 57/57 tests passing
- **APK Build**: Automated on push/PR

---

## Performance Targets

### Frame Rate
- **Target**: 60 FPS on mid-range Android
- **Frame Time**: <16.67ms per frame
- **Breakdown**:
  - Rendering: 8-10ms
  - ECS Systems: 3-5ms
  - Yuka AI: 2-3ms (throttled to 100ms)
  - UI Updates: 1-2ms

### Memory
- **Target**: <150MB RAM
- **APK Size**: <15MB (currently 4MB)
- **Asset Size**: <5MB total (pixel art PNGs)

### Load Time
- **Target**: <3 seconds to playable
- **First Frame**: <1 second
- **World Gen**: <2 seconds (procedural)

### Battery
- **Target**: <10% drain per hour
- **Throttle**: AI updates to 100ms
- **Culling**: Only render visible tiles/chunks

---

## Technology Roadmap

### Stage 1 (Current) ✅
- Phaser 3 (2D tile-based) - interim foundation
- BitECS, YukaJS, Zustand - core systems
- Vue/Capacitor/Ionic - mobile framework

### Stage 2 (Next)
- Raycast engine evaluation (performance validation)
- Rapier physics evaluation (if needed)
- Combat system integration
- Ritual system integration

### Stage 3 (Future)
- Raycast 3D migration (if performance validated)
- Audio system (Web Audio API)
- Visual effects (shaders, particles)
- Content expansion (more recipes, traits)

### Stage 4+ (Stretch)
- Advanced rendering (WebGL2)
- WebAssembly (performance-critical systems)
- Cloud sync (optional cross-device saves)
- VR support (Oculus Quest)

---

**Last Updated**: 2025-01-XX  
**Version**: 2.0.0 (Technology Stack Committed)  
**Status**: Frozen - Master Technology Document

