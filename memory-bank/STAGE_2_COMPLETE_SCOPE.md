# Stage 2 Complete Scope - Ebb & Bloom

**Version**: 1.0.0  
**Date**: 2025-11-06  
**Status**: AUTHORITATIVE - Single Source of Truth for Stage 2

---

## DECISION: STAGE 2 DOES NOT INCLUDE RAYCAST 3D

**Raycast 3D migration is deferred to Stage 3** pending performance validation.

Stage 2 focus is on making the interim 2D implementation a **complete, playable, polished mobile game**.

---

## Stage 2 Goal

**Create a fully actualized, complete, playable mobile version of Ebb & Bloom** using the current interim 2D tile-based rendering, with all core gameplay loops functional and polished.

**Timeline**: 8-12 weeks  
**Target**: Production-ready mobile game suitable for beta testing

---

## Stage 2 Deliverables (MANDATORY)

### 1. UX Polish & Onboarding (Sprints 1-2, 2 weeks)

#### Onboarding Flow
- ✅ **First-Time Player Experience**
  - Welcome screen with vision/goal explanation
  - Step-by-step guided tutorial
  - Interactive gesture training
  - Completion reward (bonus Evo Points)

- ✅ **Catalyst Creator UI**
  - Modal-based trait selection interface
  - 10 Evo Points allocation system
  - Visual trait previews (icons + descriptions)
  - Synergy recommendations
  - Confirmation/reset options

- ✅ **Interactive Tutorials**
  - Gesture: Swipe to move
  - Gesture: Tap to collect
  - Gesture: Long-press to inspect
  - Gesture: Pinch to zoom (if implemented)
  - Crafting: How snapping works
  - Pollution: Understanding consequences
  - Packs: Forming and managing critter packs

#### Visual Feedback Enhancements
- ✅ **Particle Effects**
  - Snap success particles (sparkles, glow)
  - Resource collection visual feedback
  - Pollution visual indicators
  - Pack formation effects

- ✅ **Haptic Integration**
  - Sync all gestures to haptic feedback
  - Combat haptics (when implemented)
  - Snap success vibration patterns
  - Shock event haptic sequences

- ✅ **UI Polish**
  - Smooth transitions between screens
  - Loading states (no blank screens)
  - Error states (clear messaging)
  - Success states (celebratory feedback)

- ✅ **Mobile-First Refinements**
  - Portrait orientation optimized
  - One-handed playability
  - Touch targets properly sized (min 44x44px)
  - Accessible color contrast
  - Clear information hierarchy

**Acceptance Criteria**:
- New player can complete 10-minute tutorial without confusion
- All gestures have visual + haptic feedback
- Catalyst creator allows trait selection and shows synergies
- No UI element is unclear or unresponsive

---

### 2. Combat System (Sprints 3-4, 2 weeks)

#### ECS Components
- ✅ **Health Component**
  ```typescript
  Health: { current: ui16, max: ui16, regen: f32 }
  ```

- ✅ **Combat Component**
  ```typescript
  Combat: { 
    damage: ui16, 
    range: f32, 
    cooldown: f32, 
    affinityMask: ui32 
  }
  ```

- ✅ **Momentum Component**
  ```typescript
  Momentum: { 
    value: f32,  // 0-100
    decay: f32   // per second
  }
  ```

#### CombatSystem Implementation
- ✅ **Wisp Clashes**
  - Proximity-based encounters (within range)
  - Momentum-driven damage calculation
  - Affinity resonance bonuses
  - Health reduction on hit

- ✅ **Gesture-Based Attacks**
  - Swipe: Direction-based lash (forward attack)
  - Pinch: Siphon (drain momentum from target)
  - Hold: Charge attack (build momentum)

- ✅ **Combat Mechanics**
  - Momentum builds with movement
  - Momentum drains with attacks
  - Affinity matching: bonus damage
  - Affinity opposing: reduced damage
  - Health regeneration when out of combat (5s cooldown)

- ✅ **Loot & Rewards**
  - Defeated wisps drop resources
  - Rare drops: trait fragments (boost trait levels)
  - Combat increases Conquest playstyle score
  - Pollution increase from combat

#### Integration
- ✅ **Phaser Rendering**
  - Visual attack effects (swipe trails, siphon beams)
  - Health bars above combatants
  - Damage numbers (floating text)
  - Victory/defeat animations

- ✅ **Haptic Feedback**
  - Hit confirmation (heavy rumble)
  - Dodge success (light buzz)
  - Lash attack (tension pattern)
  - Siphon (pulsing pattern)

- ✅ **Balance Testing**
  - Combat is optional (not forced)
  - Conquest playstyle is viable
  - Harmony players can avoid combat
  - Frolick players can flee easily

**Acceptance Criteria**:
- Combat encounters are clear and responsive
- All three playstyles can succeed (Harmony avoids, Conquest engages, Frolick flees)
- Gestures map to combat actions smoothly
- 60 FPS maintained during combat
- Balance tested: combat is rewarding but not required

---

### 3. Content Expansion (Sprints 5-6, 2 weeks)

#### Recipe Expansion
- ✅ **Add 5+ New Snap Recipes**
  - Advanced chains (3+ ingredients)
  - Rare combinations (multiple affinities)
  - Utility crafts (tools, buffs)
  - Visual variety (different particle effects)

- ✅ **Recipe Balance**
  - Difficulty scaling (early vs late game)
  - Resource distribution tuning
  - Pollution costs balanced
  - Harmony bonuses adjusted

#### Trait Expansion
- ✅ **Add 5+ New Traits**
  - Combat-focused traits (damage, defense)
  - Exploration traits (speed, vision)
  - Utility traits (carry capacity, efficiency)
  - Social traits (pack bonuses)

- ✅ **Trait Balance**
  - Evo Point costs balanced
  - Synergies tested
  - No "must-have" traits (all viable)
  - Visual evolution effects

#### Biome Expansion
- ✅ **Add 2+ New Biomes**
  - Unique visual style
  - Biome-specific resources
  - Unique creatures per biome
  - Different generation rules

- ✅ **Biome Variety**
  - Perlin noise variations
  - Color palette diversity
  - Resource spawn rates varied
  - Progression through biomes

#### Visual Enhancements
- ✅ **Snap Feedback**
  - Unique particle effects per recipe
  - Haiku display on snap
  - Screen shake on successful craft
  - Audio cues (placeholder or simple)

- ✅ **Trait Inheritance Visuals**
  - Critter appearance changes with inherited traits
  - Pack visual cohesion (similar traits)
  - Player visual evolution (cosmetic changes)

**Acceptance Criteria**:
- 15+ total snap recipes implemented
- 15+ total traits available
- 5+ biomes with distinct visuals
- Content variety prevents repetition in first hour
- All playstyles have viable progression paths

---

### 4. Performance & Polish (Sprints 7-8, 2 weeks)

#### Performance Optimization
- ✅ **60 FPS Target Maintained**
  - Profiling: Identify bottlenecks
  - Optimization: Fix performance issues
  - Validation: Test on mid-range Android devices

- ✅ **Memory Management**
  - Target: <150MB RAM usage
  - Sprite pooling verified working
  - Entity cleanup on dispose
  - No memory leaks

- ✅ **Load Time**
  - Target: <3s to playable
  - World generation optimized
  - Asset loading efficient
  - First frame < 1s

- ✅ **Battery Optimization**
  - Target: <10% drain per hour
  - Throttle non-critical updates
  - Efficient rendering (culling working)
  - No unnecessary wake locks

#### Device Testing
- ✅ **Android Testing**
  - Test on 3+ real devices
  - Test on different screen sizes
  - Test gestures on different touch screens
  - Test haptics on different devices

- ✅ **Compatibility**
  - Android 7.0+ (API 24+)
  - Mid-range devices (Snapdragon 700+)
  - Various screen densities (mdpi, hdpi, xhdpi, xxhdpi)

#### Final Polish
- ✅ **Bug Fixes**
  - All critical bugs resolved
  - All high-priority bugs resolved
  - Medium-priority bugs documented (fix later)

- ✅ **UI/UX Refinements**
  - No unclear UI elements
  - All text is readable
  - All buttons are responsive
  - All screens are polished

- ✅ **Testing**
  - All 57+ tests passing
  - New systems have tests
  - Integration tests added
  - Manual QA completed

**Acceptance Criteria**:
- 60 FPS maintained on mid-range Android
- <150MB RAM usage
- <3s load time
- All critical/high bugs fixed
- Tested on 3+ real Android devices
- 80%+ test coverage

---

## Stage 2 Success Metrics

### Technical Quality
- ✅ **Performance**: 60 FPS on mid-range Android (Snapdragon 700+)
- ✅ **Load Time**: <3 seconds to playable
- ✅ **Memory**: <150MB RAM active game state
- ✅ **Battery**: <10% drain per hour
- ✅ **Crash Rate**: <1% per session
- ✅ **Test Coverage**: 80%+ for all systems

### Player Experience
- ✅ **Session Length**: 20-60 minutes average
- ✅ **Return Rate**: 70%+ linger rate (come back next session)
- ✅ **Completion**: 30%+ unlock all traits in first session
- ✅ **Engagement**: 50%+ trigger first shock in first hour
- ✅ **Onboarding**: 90%+ complete tutorial without quitting

### Content Variety
- ✅ **Recipes**: 15+ snap recipes implemented
- ✅ **Traits**: 15+ traits available
- ✅ **Biomes**: 5+ biomes with distinct visuals
- ✅ **Creatures**: 10+ creature types (including pack variations)
- ✅ **Playstyles**: All 3 playstyles viable (Harmony, Conquest, Frolick)

### Mobile Playability
- ✅ **Gestures**: All 7 gesture types implemented and responsive
- ✅ **Haptics**: 20+ haptic patterns implemented
- ✅ **Portrait**: Optimized for one-handed play
- ✅ **Touch Targets**: All buttons min 44x44px
- ✅ **Accessibility**: Color contrast meets WCAG AA

---

## Stage 2 Completion Checklist

### Must Have (Blocking)
- [ ] Onboarding flow complete and tested
- [ ] Catalyst creator UI functional
- [ ] All 7 gestures have tutorials
- [ ] Combat system implemented (wisp clashes)
- [ ] 15+ snap recipes
- [ ] 15+ traits
- [ ] 5+ biomes
- [ ] 60 FPS on mid-range Android
- [ ] <3s load time
- [ ] All critical bugs fixed
- [ ] 80%+ test coverage
- [ ] Tested on 3+ real devices

### Should Have (High Priority)
- [ ] Particle effects for all snaps
- [ ] Haptic feedback for all gestures
- [ ] Health bars for combat
- [ ] Damage numbers (floating text)
- [ ] Victory/defeat animations
- [ ] Trait inheritance visuals
- [ ] Pack visual cohesion

### Nice to Have (Low Priority)
- [ ] Audio system (simple placeholder sounds)
- [ ] Advanced shaders (pollution haze)
- [ ] Cosmetic trait variations
- [ ] Journal export (share haikus)

---

## Stage 2 OUT OF SCOPE (Deferred to Stage 3+)

### Explicitly NOT in Stage 2
- ❌ **Raycast 3D Migration** - Stage 3, pending performance validation
- ❌ **Nova Cycles** (45-90min resets) - Stage 3+
- ❌ **Stardust Hops** (world-hopping) - Stage 3+
- ❌ **Ritual Mechanics** (abyss reclamation) - Stage 3+
- ❌ **Villages & Quests** (emergent content) - Stage 4+
- ❌ **Full Audio System** - Stage 5+
- ❌ **Advanced Visual Effects** - Stage 5+
- ❌ **Community Features** (seed sharing) - Stage 5+

---

## Stage 2 Risks & Mitigation

### Risk 1: Scope Creep
- **Risk**: Stage 2 scope expands beyond 8-12 weeks
- **Mitigation**: Strict adherence to Must Have list, defer "Should Have" if needed
- **Fallback**: Cut "Nice to Have" features entirely

### Risk 2: Performance Issues
- **Risk**: 60 FPS not maintained with new features
- **Mitigation**: Continuous profiling, early device testing
- **Fallback**: Reduce particle effects, simplify combat visuals

### Risk 3: Combat Balance
- **Risk**: Combat dominates playstyle, forcing all players into Conquest
- **Mitigation**: Extensive playtesting, balance adjustments
- **Fallback**: Make combat optional, add "pacifist mode"

### Risk 4: Content Repetition
- **Risk**: Expanded content still feels repetitive
- **Mitigation**: Procedural diversity guards (Jaro-Winkler for haikus, etc.)
- **Fallback**: Add hand-authored content seeds

### Risk 5: Device Compatibility
- **Risk**: Features work on high-end devices only
- **Mitigation**: Test on mid-range devices throughout development
- **Fallback**: Add graphics quality settings (low/medium/high)

---

## Stage 2 Timeline

### Sprint 1-2 (Weeks 1-2): UX Polish & Onboarding
- **Week 1**: Onboarding flow, catalyst creator UI
- **Week 2**: Interactive tutorials, visual feedback, haptics

### Sprint 3-4 (Weeks 3-4): Combat System
- **Week 3**: ECS components, CombatSystem implementation
- **Week 4**: Gesture-based attacks, visual effects, balance testing

### Sprint 5-6 (Weeks 5-6): Content Expansion
- **Week 5**: Recipe expansion, trait expansion
- **Week 6**: Biome expansion, visual enhancements

### Sprint 7-8 (Weeks 7-8): Performance & Polish
- **Week 7**: Performance optimization, device testing
- **Week 8**: Final polish, bug fixes, QA

### Sprint 9 (Week 9, Buffer): Contingency
- Address any blockers from Sprints 1-8
- Final testing and validation
- Documentation updates

---

## Stage 2 PR Merge Criteria

### Before Stage 2 PR Can Be Merged
- ✅ All "Must Have" items in checklist completed
- ✅ All 80+ tests passing (new systems have tests)
- ✅ 60 FPS validated on mid-range Android device
- ✅ All critical bugs resolved
- ✅ Code review completed
- ✅ Memory-bank updated to reflect completion
- ✅ Stage 3 planning document created

### Stage 2 PR Should Include
- ✅ All code changes (ECS systems, UI components, etc.)
- ✅ All test additions/updates
- ✅ Documentation updates (memory-bank, docs/)
- ✅ CI/CD configuration (if changed)
- ✅ APK build artifact (for testing)

---

## Post-Stage 2

### Immediate Next Steps (Stage 3 Planning)
1. **Raycast Performance Validation** (1 week)
   - Build raycast POC
   - Test on mid-range Android
   - Benchmark: 60 FPS achievable?
   - DECISION: Proceed with raycast or enhance 2D

2. **Stage 3 Scope Definition** (after raycast decision)
   - If raycast: Migration plan
   - If 2D: Enhanced visual effects plan
   - Nova Cycles implementation plan
   - Stardust Hops design

3. **Community Beta** (optional)
   - Release Stage 2 build to small beta group
   - Gather feedback on playability
   - Identify balance issues
   - Prioritize Stage 3 features based on feedback

---

## Conclusion

**Stage 2 Scope**: Fully defined and frozen  
**Timeline**: 8-12 weeks (9 sprints with buffer)  
**Goal**: Complete, playable, polished mobile game (2D)  
**Success**: Ready for beta testing, all core loops functional

**Raycast 3D**: Explicitly deferred to Stage 3 pending validation  
**Out of Scope**: Nova Cycles, World-Hopping, Villages, Full Audio

**Status**: ✅ AUTHORITATIVE - This is the single source of truth for Stage 2

---

**Version**: 1.0.0  
**Date**: 2025-11-06  
**Last Updated**: 2025-11-06  
**Next Review**: After Sprint 2 completion (Week 2)
