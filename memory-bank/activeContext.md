# Active Context - Ebb & Bloom

**Version**: 4.0.0  
**Date**: 2025-11-06  
**Status**: Stage 2 Development - Reflecting Authoritative Docs

---

## Current State ✅

**Sprint Goal**: Align memory-bank to authoritative docs/ folder ✅ **COMPLETE**

**What Just Happened**:
- ✅ Read AUTHORITATIVE docs (VISION.md, ARCHITECTURE.md, TECH_STACK.md, ROADMAP.md)
- ✅ Corrected misunderstanding: docs/ = source of truth, memory-bank/ = reflection
- ✅ Identified KEY MISALIGNMENT: docs say Zustand, code uses Pinia
- ✅ Updated memory-bank to accurately reflect authoritative vision
- ✅ Cleared memory-bank of incorrectly placed "authoritative" documents

**Status**: Memory-bank now REFLECTS authoritative docs. Ready for Stage 2 per ROADMAP.md.

---

## CLEAR NEXT STEPS

### CRITICAL ISSUE: Zustand vs Pinia Mismatch 🔴
**Problem**: 
- **docs/TECH_STACK.md says**: "Zustand 5.0+ (Locked)"  
- **Actual code uses**: Pinia 3.0.4 (in package.json, working great)
- **Impact**: Documentation lies about core architecture

**Resolution Needed**:
- EITHER: Install Zustand and migrate (rewrite gameStore.ts, test everything)
- OR: Update docs/TECH_STACK.md and docs/ARCHITECTURE.md to say Pinia
- **Recommendation**: Keep Pinia (working), update docs

---

### Stage 2 Development (Per ROADMAP.md)
**Timeline**: 8-12 weeks  
**Status**: Foundation complete (Stage 1 ✅), ready to begin

#### Sprint 1-2: UX Polish (2 weeks)
- Onboarding flow
- Gesture tutorials  
- Catalyst creator UI
- Particle effects + haptic sync
- Device testing

#### Sprint 3-4: Combat System (2 weeks)
- Wisp clashes (momentum-based)
- Gesture attacks (swipe/pinch)
- Affinity resonance
- Loot system

#### Sprint 5-6: Content Expansion (2 weeks)
- 5+ new recipes
- 5+ new traits
- 2+ new biomes
- Visual polish

---

---

### Stage 3: Raycast 3D Migration (Per ROADMAP.md)
**Timeline**: 4-6 weeks AFTER Stage 2  
**Status**: Vision committed in docs/VISION.md

#### Performance Validation (1 week) - DECISION GATE
- Build raycast POC
- Test on mid-range Android
- Benchmark: 60 FPS achievable?
- **Decision**: Proceed with raycast OR fallback to enhanced 2D

#### If Validation Passes (3-4 weeks)
- Raycast engine integration
- Heightmap generation
- Gesture controls (swipe-turn, pinch-zoom)
- ECS integration

#### If Validation Fails (fallback)
- Stay 2D, enhance with shaders/effects

---

---

## Key Insights from Authoritative Docs

### From docs/VISION.md (v2.0.0 - Frozen)
- **Core Vision**: Raycasted 3D world simulation, DOS-era aesthetic
- **Status**: "Vision committed. Current implementation is 2D tile-based (interim). Raycast 3D is the target."
- **Timeline**: "Stage 2+ (after performance validation)"
- **Rendering**: "Raycasted 3D" is the target vision, 2D is interim

### From docs/ARCHITECTURE.md (v2.0.0 - Frozen)
- **State Management**: Says "Zustand" but notes "Pinia (Vue-native state management)" in one section
- **ECS**: BitECS is core, rendering is read-only
- **Current Stage**: Stage 2 = Production 2D, Stage 3 = Raycast migration (conditional)

### From docs/TECH_STACK.md (v2.0.0 - Frozen)
- **State**: "Zustand 5.0+ (Locked)" ← MISMATCH WITH CODE
- **Rendering**: Phaser (current), Raycast (target)
- **Status**: "Vision committed, implementation Stage 2+"

### From docs/ROADMAP.md (v2.0.0 - Frozen)
- **Stage 1**: Complete ✅
- **Stage 2**: Core Gameplay Expansion (8-12 weeks)
- **Stage 3**: Raycast 3D Migration (4-6 weeks, conditional)
- **Stage 4**: Content Expansion
- **Stage 5**: Polish & Launch

---


---

## Implementation Priority (From ROADMAP.md)

### Stage 2: Core Gameplay Expansion (Current) 🎯
**Goal**: Playable vertical slice with core loop  
**Timeline**: 8-12 weeks

1. **UX Polish** (Sprints 1-2)
2. **Combat System** (Sprints 3-4)
3. **Content Expansion** (Sprints 5-6)

### Stage 3: Raycast 3D Migration (Next)
**Goal**: Migrate from 2D tiles to raycasted 3D  
**Timeline**: 4-6 weeks (conditional on performance validation)

### Stage 4: Content Expansion
**Goal**: Expand content variety and depth  
**Timeline**: 4-6 weeks
- 10+ more recipes
- 5+ more traits
- Villages & quests

### Stage 5: Polish & Launch
**Goal**: Production-ready release  
**Timeline**: 4-6 weeks
- Audio system
- Visual effects
- Balance & tuning
- App store launch

---

## Authoritative Vision (From docs/)

### Rendering Architecture
- **Vision** (docs/VISION.md): "Raycasted 3D" - committed vision
- **Status** (docs/VISION.md): "Current implementation is 2D tile-based (interim). Raycast 3D is the target."
- **Timeline** (docs/ROADMAP.md): Stage 3 (after Stage 2, conditional on performance)
- **Current**: Phaser 3 (2D) - interim foundation

### Brand Identity (Per docs/VISION.md)
- **Tagline**: "Shape Worlds. Traits Echo. Legacy Endures."
- **Approach**: Hybrid - Gameplay clarity + poetic resonance
- **Brand Voice**: Poetic for world/atmosphere, technical for systems, playful for onboarding

### Technology Stack (Per docs/TECH_STACK.md)
- **Platform**: Ionic/Vue/Capacitor (Locked)
- **ECS**: BitECS 0.3+ (Locked)
- **AI**: YukaJS 0.7+ (Locked)
- **State**: **Zustand 5.0+ (Locked)** ← MISMATCH: Code uses Pinia!
- **Rendering**: Phaser 3.87+ (current) → Raycast (target, Stage 3)

---

## Current Implementation Status (Per docs/ROADMAP.md)

### ✅ Stage 1: Foundation COMPLETE
- ECS Architecture (BitECS)
- 10 Trait Components with synergies
- Resource Snapping System (affinity-based)
- Pack System (formation, loyalty, roles)
- Pollution & Shock System
- Behavior Profiling (Harmony/Conquest/Frolick)
- Haptic System (20+ patterns)
- Gesture System (7 gesture types)
- World Generation (Perlin noise, chunk-based)
- CI/CD Pipeline
- Mobile Framework (Vue/Capacitor/Ionic)
- **57/57 Tests Passing** ✅

### 🎯 Stage 2: Core Gameplay Expansion (Current)
**Per ROADMAP.md: 8-12 weeks**

- Sprint 1-2: UX Polish
- Sprint 3-4: Combat System
- Sprint 5-6: Content Expansion

### ⏳ Stage 3: Raycast 3D Migration (Next)
**Per ROADMAP.md: 4-6 weeks** (conditional)

- Performance validation (1 week decision gate)
- Raycast implementation (3-4 weeks if validated)
- Migration & testing (1 week)
- **Fallback**: Stay 2D if performance insufficient

### ⏳ Stage 4-5: Content & Launch (Future)
- Stage 4: Content expansion (4-6 weeks)
- Stage 5: Polish & launch (4-6 weeks)

---

## Blockers: NONE

All prerequisites complete. Ready to begin Stage 2 implementation.

---

## Success Criteria (Per docs/ROADMAP.md)

### Stage 2 MVP Complete When:
- [ ] Core loop playable (10-minute demo)
- [ ] Combat system working
- [ ] Content expansion complete (more recipes/traits/biomes)
- [ ] UX flow smooth
- [ ] Catalyst creator functional

### Stage 2 Success Metrics (Per docs/ROADMAP.md):
- **Session Length**: 20-60 minutes average
- **Return Rate**: 70%+ linger rate
- **Performance**: 60 FPS on mid-range Android
- **Completion**: 30%+ unlock all traits

### Ready for Stage 3 (Raycast) When:
- [ ] Stage 2 100% complete per ROADMAP.md milestones
- [ ] Raycast POC performance validated (60 FPS on mid-range Android)
- [ ] Decision made: proceed with raycast OR enhanced 2D fallback

---

---

## CRITICAL: Zustand vs Pinia Mismatch

**The Issue**:
- docs/TECH_STACK.md says: "Zustand 5.0+ (Locked)"
- docs/ARCHITECTURE.md says: "Zustand (UI State - Read Only)"
- **Actual code**: Uses Pinia 3.0.4 (package.json, gameStore.ts)
- Zustand is NOT even installed!

**This MUST Be Resolved**:
- Update docs/ to say Pinia (recommended - code works great)
- OR install Zustand and migrate code (lots of work)

---

## References

- **AUTHORITATIVE DOCS**: `docs/` folder (VISION.md, ARCHITECTURE.md, TECH_STACK.md, ROADMAP.md)
- **Memory Bank**: Reflection of authoritative docs for AI context
- **Current Phase**: Stage 2 development per ROADMAP.md

---

**Last Updated**: 2025-11-06  
**Version**: 4.0.0 (Corrected to Reflect Authoritative Docs)  
**Status**: Memory-bank now properly reflects docs/ folder  
**Critical Issue**: Zustand vs Pinia mismatch must be resolved
