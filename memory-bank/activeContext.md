# Active Context - Ebb & Bloom

**Version**: 7.0.0  
**Date**: 2025-01-XX  
**Status**: Foundation Complete, Frontend Integration Needed, Stage 2 Not Started

---

## 🎯 CURRENT STATE - CRYSTAL CLEAR

### Foundation Status: ✅ **100% COMPLETE**
- ✅ **React Three Fiber + Miniplex ECS** - Fully operational
- ✅ **All 10+ Evolutionary Systems** - Implemented and functional
- ✅ **Texture Pipeline** - 141 AmbientCG textures integrated
- ✅ **Camera System** - Spore-style dynamic third-person
- ✅ **Brand Identity** - DaisyUI + Tailwind + custom theme
- ✅ **AI Dev Tools** - OpenAI/Freesound integration complete

### Frontend Status: 🟡 **40% COMPLETE**
- ✅ **6 UI Components** - EvolutionUI, TraitEvolutionDisplay, NarrativeDisplay, CreatureRenderer, BuildingRenderer, TerrainRenderer
- ⚠️ **Critical Issue**: Components use mock data, not connected to ECS
- ⚠️ **Critical Issue**: `useEntities` hooks not properly bound
- ❌ **Missing**: Catalyst Creator UI (players can't select traits)
- ❌ **Missing**: Onboarding flow (user feedback: "VERY clunky")

### Stage 2 Features: ❌ **0% COMPLETE**
- ❌ **Combat System** - Not implemented (Conquest playstyle not viable)
- ❌ **Content Expansion** - Only 5 recipes, 10 traits, 4 biomes (needs 15+/15+/5+)
- ❌ **UX Polish** - No onboarding, no tutorials, no catalyst creator

### Testing Status: 🟡 **43% PASSING (31/72 tests)**
- ✅ **3 Test Files Passing**: GameClock, GameClockIsolated, SporeStyleCamera
- ❌ **6 Test Files Failing**: GeneticSynthesis (7), RawMaterials (8), TextureSystem (8), CreatureArchetype (8), EcosystemIntegration (10), worldCore (unknown)
- **Issue**: Many systems lack comprehensive tests

### Performance Optimizations: 🟡 **PARTIAL**
- ✅ **Terrain System** - FBM noise heightmaps implemented
- ✅ **ECS Architecture** - Cache-friendly Miniplex implementation
- ✅ **Fog System** - Basic fog implemented (exponential fog in `src/App.tsx`)
- ❌ **Instanced Rendering** - NOT implemented (rocks/shrubs/grass should use InstancedMesh)
- ❌ **Sky Dome** - NOT implemented (no sky gradient/clouds)
- ❌ **LOD System** - NOT implemented (no distance-based detail reduction)
- ❌ **Viewport Culling** - NOT implemented (renders all entities)
- ❌ **Sprite Pooling** - NOT applicable (3D, not 2D sprites)

### Multi-Platform Features: 🟡 **PARTIAL**
- ✅ **Capacitor Integration** - Mobile framework operational
- ✅ **React Three Fiber** - Cross-platform 3D rendering
- ❌ **Platform Detection** - NOT implemented (no PlatformContext)
- ❌ **Responsive Design** - NOT fully implemented (no screen size adaptation)
- ❌ **Input System Switching** - NOT implemented (no unified touch/keyboard/gamepad)
- ❌ **Screen Orientation** - NOT implemented (no orientation handling)

---

## 🚨 CRITICAL GAPS (BLOCKING PLAYABILITY)

**Total Gaps Identified**: 17 (7 critical, 5 moderate, 5 minor)  
**Must Fix in Stage 2**: 12 gaps  
**Can Defer to Stage 3+**: 5 gaps

### CRITICAL GAPS (Must Fix in Stage 2)

**1. Frontend Integration** - **IMMEDIATE PRIORITY**
- **Status**: Components exist but not connected to ECS
- **Impact**: UI shows mock data, not real evolution
- **Action**: Connect `useEntities` hooks to ECS, replace mock data with real queries
- **Effort**: 3-5 days
- **Files**: `src/components/EvolutionUI.tsx`, `src/components/TraitEvolutionDisplay.tsx`, `src/components/NarrativeDisplay.tsx`

**2. Test Failures** - **IMMEDIATE PRIORITY**
- **Status**: 41/72 tests failing (57% failure rate)
- **Impact**: CI/CD confidence, unknown system reliability
- **Action**: Fix failing tests, add missing test coverage
- **Effort**: 2-3 days
- **Files**: All test files in `src/test/`

**3. Catalyst Creator UI** - **BLOCKING**
- **Status**: Not implemented
- **Impact**: Players can't select traits to start game
- **Action**: Build trait selection interface with 10 Evo Points allocation
- **Effort**: 1-2 weeks
- **Priority**: Stage 2 Sprint 1

**4. Onboarding Flow** - **BLOCKING**
- **Status**: Not implemented
- **Impact**: "VERY clunky" user experience, new players don't understand game
- **Action**: Build first-time player experience with gesture tutorials
- **Effort**: 1-2 weeks
- **Priority**: Stage 2 Sprint 1

**5. Combat System** - **BLOCKING**
- **Status**: Not implemented
- **Impact**: Conquest playstyle not viable, core loop incomplete
- **Action**: Implement Health/Combat/Momentum components, CombatSystem, gesture-based attacks
- **Effort**: 2 weeks
- **Priority**: Stage 2 Sprint 3-4

**6. Content Expansion** - **BLOCKING**
- **Status**: Limited content (5 recipes, 10 traits, 4 biomes)
- **Impact**: Repetitive after 10 minutes, low replayability
- **Action**: Expand to 15+ recipes, 15+ traits, 5+ biomes
- **Effort**: 2 weeks
- **Priority**: Stage 2 Sprint 5-6

**7. Visual Feedback** - **MODERATE**
- **Status**: No particle effects, limited haptics
- **Impact**: Game feels unresponsive
- **Action**: Add particles, haptic integration
- **Effort**: 1 week
- **Priority**: Stage 2 Sprint 1-2

### MODERATE GAPS (Should Fix in Stage 2)

**8. Mobile Controls Integration** - Buttons exist but not functional
**9. Real-time Data Binding** - Components use test/mock data
**10. Performance Validation** - Not tested on real devices
**11. Testing Coverage** - Many systems lack comprehensive tests
**12. Performance Optimizations** - Missing instanced rendering, sky/fog, LOD, viewport culling

### MINOR GAPS (Can Defer to Stage 3+)

**13. Audio System** - Deferred to Stage 5
**14. Visual Effects/Shaders** - Deferred to Stage 5
**15. Nova Cycles** - Deferred to Stage 3
**16. Villages & Quests** - Deferred to Stage 4
**17. File Naming Inconsistency** - Minor cosmetic issue

---

## 📋 IMMEDIATE NEXT STEPS (THIS WEEK)

### Step 1: Fix Test Failures (Days 1-3)
**Goal**: Get all tests passing, restore CI/CD confidence

**Tasks**:
1. Fix `TextureSystem.test.ts` - Network error mock issue
2. Fix `GeneticSynthesis.test.ts` - 7 failing tests
3. Fix `RawMaterialsSystem.test.ts` - 8 failing tests
4. Fix `CreatureArchetypeSystem.test.ts` - 8 failing tests
5. Fix `EcosystemIntegration.test.ts` - 10 failing tests
6. Validate `worldCore.test.ts` status

**Command**: `pnpm test` (should pass all 72 tests)

### Step 2: Connect Frontend to ECS (Days 4-5)
**Goal**: UI displays real evolution data, not mock data

**Tasks**:
1. Fix `useEntities` hooks in `EvolutionUI.tsx`
2. Connect `TraitEvolutionDisplay` to real creature data from ECS
3. Connect `NarrativeDisplay` to `HaikuNarrativeSystem` (replace test data)
4. Connect `CreatureRenderer` to ECS entity queries
5. Connect `BuildingRenderer` to `BuildingSystem`
6. Connect `TerrainRenderer` to `TerrainSystem`

**Validation**: Dev server shows real creatures evolving, real haikus, real terrain

### Step 3: Validate Dev Server (Day 6)
**Goal**: Ensure dev server runs without errors

**Tasks**:
1. Run `pnpm dev`
2. Verify texture system initializes (or shows clear error)
3. Verify ecosystem starts successfully
4. Verify UI displays real data (after Step 2)
5. Check browser console for errors

**Command**: `pnpm dev` (should start cleanly)

---

## 🎯 STAGE 2 SPRINT PLAN (8-12 WEEKS)

### Sprint 1-2: UX Polish (Weeks 1-2)
**Goal**: Smooth onboarding, catalyst creator, tutorials

**Deliverables**:
- ✅ Catalyst Creator UI (trait selection, 10 Evo Points)
- ✅ Onboarding flow (first-time player experience)
- ✅ Gesture tutorials (interactive tutorials)
- ✅ Visual feedback (particles, haptics)

**Success Criteria**:
- 90%+ players complete 10-minute tutorial
- Catalyst creator functional
- All gestures have tutorials

### Sprint 3-4: Combat System (Weeks 3-4)
**Goal**: Wisp clashes, gesture attacks, all playstyles viable

**Deliverables**:
- ✅ Combat System (Health/Combat/Momentum components)
- ✅ Gesture-based attacks (swipe, pinch, hold)
- ✅ Wisp clashes (momentum-based combat)
- ✅ Loot system (rewards from combat)

**Success Criteria**:
- All 3 playstyles viable (Harmony/Conquest/Frolick)
- Combat feels responsive
- All tests passing

### Sprint 5-6: Content Expansion (Weeks 5-6)
**Goal**: 15+ recipes, 15+ traits, 5+ biomes

**Deliverables**:
- ✅ 15+ snap recipes (currently 5)
- ✅ 15+ traits (currently 10)
- ✅ 5+ biomes (currently 4)
- ✅ Visual polish (enhanced feedback)

**Success Criteria**:
- Content variety prevents repetition
- All new content tested
- Balance validated

### Sprint 7-8: Performance & Polish (Weeks 7-8)
**Goal**: 60 FPS, device testing, bug fixes

**Deliverables**:
- ✅ 60 FPS on mid-range Android
- ✅ Device testing (3+ real Android devices)
- ✅ Bug fixes (all critical issues resolved)
- ✅ Performance optimizations (instanced rendering, LOD, viewport culling)
- ✅ Final polish (visual effects, haptics)

**Success Criteria**:
- 60 FPS maintained
- <150MB RAM, <3s load time
- All critical bugs fixed
- Tested on 3+ devices

---

## 📊 CURRENT METRICS

### Foundation: ✅ **100% Complete**
- Architecture: React Three Fiber + Miniplex ECS ✅
- Backend Systems: All 10+ systems operational ✅
- Texture Pipeline: 141 textures integrated ✅
- Camera System: Spore-style dynamic ✅
- Brand Identity: Complete design system ✅

### Frontend: 🟡 **40% Complete**
- UI Components: 6/6 exist ✅
- ECS Integration: 0% (not connected) ❌
- Real Data Display: 0% (using mock data) ❌
- Catalyst Creator: Not implemented ❌
- Onboarding: Not implemented ❌

### Stage 2 Features: ❌ **0% Complete**
- Combat System: Not started ❌
- Content Expansion: Not started ❌
- UX Polish: Not started ❌
- Performance Validation: Not started ❌

### Testing: 🟡 **43% Passing (31/72)**
- Passing: 31 tests (3 test files) ✅
- Failing: 41 tests (6 test files) ❌
- Coverage: Needs expansion 🟡

### Performance Optimizations: 🟡 **20% Complete**
- Terrain Generation: ✅ Implemented
- ECS Architecture: ✅ Implemented
- Instanced Rendering: ❌ NOT implemented
- Sky/Fog: ❌ NOT implemented
- LOD System: ❌ NOT implemented
- Viewport Culling: ❌ NOT implemented

### Multi-Platform Features: 🟡 **30% Complete**
- Capacitor: ✅ Implemented
- React Three Fiber: ✅ Implemented
- Platform Detection: ❌ NOT implemented
- Responsive Design: ❌ NOT fully implemented
- Input Switching: ❌ NOT implemented
- Screen Orientation: ❌ NOT implemented

---

## 🔗 CRITICAL REFERENCES

### Memory Bank Files (AUTHORITATIVE)
- **This File**: `memory-bank/activeContext.md` - Current state and next steps
- **Progress**: `memory-bank/progress.md` - Detailed completion status
- **Tech Context**: `memory-bank/techContext.md` - Technology stack and architecture
- **Product Context**: `memory-bank/productContext.md` - Game vision and design
- **Stage 2 Scope**: `memory-bank/STAGE_2_COMPLETE_SCOPE.md` - Detailed Stage 2 requirements
- **System Patterns**: `memory-bank/systemPatterns.md` - ECS patterns and conventions

### Implementation Files
- **App Entry**: `src/App.tsx` - Main application entry point
- **UI Components**: `src/components/` - All React UI components
- **Systems**: `src/systems/` - All ECS systems
- **Tests**: `src/test/` - All test files

### Documentation (Reference Only)
- **Vision**: `docs/VISION.md` - Game vision (reference)
- **Roadmap**: `docs/ROADMAP.md` - Development phases (reference)
- **Architecture**: `docs/ARCHITECTURE.md` - System architecture (reference)
- **Evolutionary Systems**: `docs/EVOLUTIONARY_SYSTEMS.md` - System documentation
- **Camera System**: `docs/CAMERA_SYSTEM.md` - Camera design
- **Performance**: `docs/vision/09_mobile_perf_constraints.md` - Performance targets

---

## ⚠️ IMPORTANT NOTES

### Technology Stack (LOCKED)
- **Platform**: React 19.2.0 + TypeScript 5.7.2
- **3D Rendering**: React Three Fiber 9.4.0 + Three.js 0.170.0
- **ECS**: Miniplex 2.0.0 (NOT BitECS - architecture changed)
- **State**: Zustand 5.0.8 (NOT Pinia - architecture changed)
- **Mobile**: Capacitor 6.1.2
- **UI**: DaisyUI 5.4.7 + Tailwind CSS 4.1.17

### Architecture Changes
- **Changed**: Vue/Phaser → React Three Fiber (completed)
- **Changed**: BitECS → Miniplex ECS (completed)
- **Changed**: Pinia → Zustand (completed)
- **Current**: 3D rendering (React Three Fiber), NOT 2D tiles
- **Future**: Raycast 3D migration (Stage 3, conditional)

### Critical Decisions
- **Rendering**: Currently 3D (R3F), raycast deferred to Stage 3
- **State Management**: Zustand (read-only from ECS)
- **Mobile First**: Touch controls, haptic feedback, 60 FPS target
- **Production Gating**: No fallbacks, fail fast if assets missing

### Grok Document Implementation Status
**Grok-TypeScript_Procedural_Open-World_Scene.md**:
- ✅ **Implemented**: Terrain generation (FBM noise), procedural buildings, entity AI
- ❌ **NOT Implemented**: Instanced rendering, sky dome, fog, billboard grass, Poisson sampling
- 📝 **Documented**: Performance targets in `docs/vision/09_mobile_perf_constraints.md`

**Grok-Multi-Platform_React_Three_Fiber_Development.md**:
- ✅ **Implemented**: React Three Fiber setup, Capacitor integration
- ❌ **NOT Implemented**: Platform detection, responsive design patterns, input switching, Zustand event tracking
- 📝 **Documented**: Architecture in `docs/ARCHITECTURE.md`, performance in `docs/vision/09_mobile_perf_constraints.md`

**Missing Features** (from Grok docs, not yet implemented):
- Instanced rendering for performance (rocks/shrubs/grass)
- Sky dome with gradient and clouds
- Fog system for depth perception
- Billboard grass rendering
- Poisson disk sampling for vegetation placement
- Platform detection and responsive adaptation
- Unified input system (touch/keyboard/gamepad)
- Zustand event tracking store

---

## ✅ SUCCESS CRITERIA

### Immediate (This Week)
- [ ] All 72 tests passing
- [ ] Frontend connected to ECS (real data display)
- [ ] Dev server runs without errors

### Stage 2 Complete (8-12 weeks)
- [ ] Smooth onboarding flow (90%+ completion)
- [ ] Catalyst creator functional
- [ ] Combat system working (all playstyles viable)
- [ ] Content expansion (15+ recipes, 15+ traits, 5+ biomes)
- [ ] 60 FPS on mid-range Android
- [ ] All tests passing (90%+ coverage)
- [ ] Tested on 3+ real devices
- [ ] Performance optimizations (instanced rendering, LOD, viewport culling)

---

**Last Updated**: 2025-01-XX  
**Version**: 7.0.0 (Grok Document Status Integrated)  
**Status**: Foundation Complete, Frontend Integration Needed  
**Next Review**: After test fixes and frontend integration
