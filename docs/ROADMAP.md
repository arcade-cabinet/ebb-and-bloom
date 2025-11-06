# Roadmap - Ebb & Bloom

**Version**: 2.0.0  
**Date**: 2025-01-XX  
**Status**: Frozen - Development Roadmap Committed

---

## Development Phases

### Stage 1: Foundation ✅ COMPLETE
**Status**: Core systems implemented, 57/57 tests passing

**Completed**:
- ✅ ECS Architecture (BitECS)
- ✅ 10 Trait Components with synergies
- ✅ Resource Snapping System (affinity-based)
- ✅ Pack System (formation, loyalty, roles)
- ✅ Pollution & Shock System
- ✅ Behavior Profiling (Harmony/Conquest/Frolick)
- ✅ Haptic System (20+ patterns)
- ✅ Gesture System (7 gesture types)
- ✅ World Generation (Perlin noise, chunk-based)
- ✅ CI/CD Pipeline (automated builds)
- ✅ Mobile Framework (Vue/Capacitor/Ionic)

**Current State**: 2D tile-based (Phaser 3) - interim foundation for raycast 3D migration

---

### Stage 2: Core Gameplay Expansion 🎯 IN PROGRESS
**Timeline**: 8-12 weeks  
**Goal**: Playable vertical slice with core loop

#### Sprint 1-2: UX Polish (2 weeks)
- **Onboarding Flow**: First-time player experience
- **Gesture Tutorials**: Interactive tutorials for all gestures
- **Catalyst Creator UI**: Trait selection, Evo point allocation
- **Visual Feedback**: Particle effects, haptic sync, UI polish
- **Device Testing**: Real hardware validation (60 FPS, touch, haptics)

#### Sprint 3-4: Combat System (2 weeks)
- **Wisp Clashes**: Momentum-based combat
- **Gesture Attacks**: Swipe clashes, pinch siphons
- **Affinity Resonance**: Combat mechanics tied to affinities
- **Loot System**: Rewards from combat encounters

#### Sprint 5-6: Content Expansion (2 weeks)
- **Recipe Expansion**: Add 5+ new recipes
- **Trait Expansion**: Add 5+ new traits
- **Biome Expansion**: Add 2+ new biomes
- **Visual Polish**: Enhanced feedback for all systems

---

### Stage 3: Raycast 3D Migration 🎯 PLANNED
**Timeline**: 4-6 weeks  
**Goal**: Migrate from 2D tiles to raycasted 3D

#### Performance Validation (1 week)
- **Raycast POC**: Test performance on mid-range Android
- **Benchmark**: 60 FPS target validation
- **Decision Point**: Proceed with raycast or stay 2D

#### Raycast Implementation (3-4 weeks)
- **Raycast Engine**: Custom or raycast.js integration
- **Heightmap Generation**: Perlin noise for ebb/bloom ridges
- **Gesture Controls**: Swipe-turn, pinch-zoom, tap-stride
- **Visual Style**: Pseudo-3D slice rendering
- **Particle Effects**: Blue wisps (flow), red sparks (heat)

#### Migration & Testing (1 week)
- **ECS Integration**: Connect raycast to BitECS
- **Performance Optimization**: Viewport culling, LOD
- **Device Testing**: Real hardware validation
- **Fallback Plan**: Keep 2D if performance insufficient

---

### Stage 4: Content Expansion 🎯 PLANNED
**Timeline**: 4-6 weeks  
**Goal**: Expand content variety and depth

#### Recipes & Traits (2 weeks)
- **10+ More Recipes**: Expand snapping combinations
- **5+ More Traits**: Add new trait types
- **Synergy Expansion**: More trait combinations
- **Balance Tuning**: Test recipe/trait balance

#### Biomes & Creatures (2 weeks)
- **10+ Biomes**: Expand biome variety
- **20+ Creatures**: Add more creature types
- **Ecosystem Depth**: More complex interactions
- **Visual Variety**: More sprite variety

#### Villages & Quests (2 weeks)
- **Village Emergence**: Procedural village spawning
- **Quest Generation**: Emergent quest system
- **Pack Quests**: Dispatch packs on missions
- **Reputation System**: Track player actions

---

### Stage 5: Polish & Launch 🎯 PLANNED
**Timeline**: 4-6 weeks  
**Goal**: Production-ready release

#### Audio System (2 weeks)
- **Procedural Soundscapes**: Ambient audio
- **Event-Driven SFX**: Snap sounds, haptic sync
- **Playstyle-Aware Music**: Adapts to behavior profile

#### Visual Effects (2 weeks)
- **Shaders**: Pollution haze, water flow
- **Particle Systems**: Enhanced snap effects
- **Lighting**: Dynamic lighting for raycast
- **Post-Processing**: FXAA, color grading

#### Balance & Tuning (1-2 weeks)
- **Playtesting**: Real player feedback
- **Balance Adjustments**: Recipe/trait tuning
- **Performance Optimization**: Final polish
- **Bug Fixes**: Critical issues

#### Launch Preparation (1 week)
- **App Store Assets**: Screenshots, descriptions
- **Marketing Materials**: Trailer, press kit
- **Community Setup**: Discord, subreddit
- **Release**: Google Play / App Store launch

---

## Milestones

### MVP (Stage 2 Complete)
- ✅ Core loop playable (10-minute demo)
- ✅ Combat system working
- ✅ Content expansion complete
- ✅ UX flow smooth
- ✅ Catalyst creator functional

### Beta (Stage 4 Complete)
- ✅ Content expanded (20+ recipes, 15+ traits)
- ✅ Villages & quests working
- ✅ Balance tuned
- ✅ Performance validated

### Launch (Stage 5 Complete)
- ✅ Raycast 3D migrated (or 2D polished)
- ✅ Audio system implemented
- ✅ Visual effects complete
- ✅ Production-ready release

---

## Success Metrics

### Stage 2 (MVP)
- **Session Length**: 20-60 minutes average
- **Return Rate**: 70%+ linger rate
- **Performance**: 60 FPS on mid-range Android
- **Completion**: 30%+ unlock all traits

### Stage 4 (Beta)
- **Content Variety**: 20+ recipes, 15+ traits
- **Replayability**: Players reset willingly
- **Balance**: All playstyles viable
- **Engagement**: 50%+ trigger all shock types

### Stage 5 (Launch)
- **Technical Quality**: <1% crash rate
- **Emotional Resonance**: Players share haikus
- **Community**: Active seed sharing
- **Retention**: 60%+ return after first week

---

## Risk Mitigation

### Raycast Performance Risk
- **Risk**: Raycast may not achieve 60 FPS on mobile
- **Mitigation**: Performance validation before full migration
- **Fallback**: Stay 2D, enhance with shaders/effects

### Content Variety Risk
- **Risk**: Procedural generation may feel repetitive
- **Mitigation**: Extensive playtesting, diversity guards
- **Fallback**: Add hand-authored content seeds

### Balance Risk
- **Risk**: One playstyle may dominate
- **Mitigation**: Continuous playtesting, Yuka adaptation
- **Fallback**: Manual balance adjustments

---

## Open Questions

1. **Raycast Performance**: Can raycast achieve 60 FPS on mid-range Android?
3. **Village Emergence**: How do villages spawn and evolve from simulation rules?
4. **Combat Balance**: How to balance combat without punishing frolick players?
5. **Content Pipeline**: How to ensure infinite variety without repetition?

---

**Last Updated**: 2025-01-XX  
**Version**: 2.0.0 (Roadmap Committed)  
**Status**: Frozen - Master Roadmap Document

