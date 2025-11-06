# Stage 1 Gap Analysis - Ebb & Bloom

**Version**: 1.0.0  
**Date**: 2025-11-06  
**Status**: Gap Analysis for Stage 1 Remediation

---

## Executive Summary

Stage 1 architecture is **solid (95% complete)** but has **7 critical gaps** and **5 moderate gaps** that must be addressed before Stage 2 can proceed smoothly.

**Critical Gaps**: Must fix in Stage 2 (blocking issues)  
**Moderate Gaps**: Should fix in Stage 2 (quality issues)  
**Minor Gaps**: Can defer to Stage 3+ (cosmetic/nice-to-have)

---

## CRITICAL GAPS (Must Fix in Stage 2)

### Gap 1: Zustand vs Pinia State Management 🔴

**Status**: CRITICAL ARCHITECTURE MISMATCH

**Issue**:
- Documentation claims Zustand architecture throughout
- Actual implementation uses Pinia
- `package.json` has Pinia but NOT Zustand
- All memory-bank docs reference Zustand

**Evidence**:
```bash
$ grep -r "zustand" package.json
# NO RESULTS

$ grep -r "pinia" package.json
"pinia": "^3.0.4"

$ cat src/stores/gameStore.ts
import { defineStore } from 'pinia';  // NOT Zustand!
```

**Impact**: Documentation lies about architecture

**Remediation Required**:
- **DECISION**: Keep Pinia OR migrate to Zustand
- **If Keep Pinia**: Update ALL docs to say Pinia (10+ files)
- **If Migrate to Zustand**: Install Zustand, rewrite gameStore.ts, test
- **Priority**: CRITICAL - must fix before Stage 2 PR merge

**Recommendation**: Keep Pinia (it's working), update docs

---

### Gap 2: Missing WorldCore.ts File 🔴

**Status**: CRITICAL DOCUMENTATION ERROR

**Issue**:
- Docs reference `src/game/core/WorldCore.ts` (doesn't exist)
- Actual file is `src/game/core/core.ts`
- Actual class is `WorldCore` but in wrong file name

**Evidence**:
```typescript
// GameScene.ts imports:
import { WorldCore } from './core/core';  // Correct

// But docs say:
memory-bank/techContext.md:
"WorldCore: src/game/core/WorldCore.ts"  // WRONG!
```

**Impact**: Documentation references non-existent files

**Remediation Required**:
- Audit ALL file path references in docs
- Update memory-bank/techContext.md
- Update any other docs with wrong paths
- **Priority**: HIGH - fix before Stage 2 documentation freeze

**Recommendation**: Rename `core.ts` to `WorldCore.ts` for clarity, update imports

---

### Gap 3: Rendering Architecture Confusion 🔴

**Status**: CRITICAL VISION CONFUSION

**Issue**:
- VISION.md says "Raycast 3D Committed"
- ARCHITECTURE.md says "Vision: Raycasted 3D - committed"
- activeContext.md says "Priority 4: Raycast 3D... deferred"
- ROADMAP.md has raycast in Stage 3, not Stage 2

**Impact**: Team doesn't know when raycast migration happens

**Remediation Required**:
- CLARIFY: "Committed" means vision goal, not implementation timeline
- UPDATE: All docs to say "Raycast 3D is Stage 3, pending validation"
- DEFINE: Interim 2D is production-ready for Stage 2
- **Priority**: CRITICAL - must resolve before Stage 2 scope finalized

**Recommendation**: See STAGE_2_COMPLETE_SCOPE.md (raycast deferred to Stage 3)

---

### Gap 4: Missing Catalyst Creator UI 🔴

**Status**: CRITICAL FEATURE GAP

**Issue**:
- Vision docs describe catalyst creator (trait selection UI)
- No implementation exists in current codebase
- Creator.vue exists but is minimal/placeholder
- Essential for onboarding and trait selection

**Evidence**:
```bash
$ cat src/views/Creator.vue
# Minimal placeholder, no trait selection logic
```

**Impact**: Players can't select traits (core feature missing)

**Remediation Required**:
- Implement full catalyst creator UI (Stage 2 Sprint 1)
- 10 Evo Points allocation system
- Visual trait previews
- Synergy recommendations
- **Priority**: CRITICAL - blocking Stage 2 playability

**Recommendation**: See STAGE_2_COMPLETE_SCOPE.md Section 1 (UX Polish)

---

### Gap 5: No Combat System 🔴

**Status**: CRITICAL FEATURE GAP

**Issue**:
- Combat documented in vision/04_raycast doc
- No implementation exists
- No Health/Combat/Momentum components
- No CombatSystem

**Impact**: Conquest playstyle not viable, core loop incomplete

**Remediation Required**:
- Implement combat system (Stage 2 Sprint 3-4)
- Add Health, Combat, Momentum components
- Create CombatSystem
- Gesture-based attacks (swipe, pinch, hold)
- **Priority**: CRITICAL - blocking Stage 2 completion

**Recommendation**: See STAGE_2_COMPLETE_SCOPE.md Section 2 (Combat System)

---

### Gap 6: Limited Content (Repetitive) 🔴

**Status**: CRITICAL PLAYABILITY GAP

**Issue**:
- Only 5 snap recipes
- Only 10 traits
- Only 4 biomes (water, grass, flower, ore)
- Players report repetitive experience after 10 minutes

**Impact**: Game feels shallow, low replayability

**Remediation Required**:
- Expand to 15+ recipes (Stage 2 Sprint 5)
- Expand to 15+ traits (Stage 2 Sprint 5)
- Expand to 5+ biomes (Stage 2 Sprint 6)
- **Priority**: HIGH - blocking Stage 2 "complete playable" criteria

**Recommendation**: See STAGE_2_COMPLETE_SCOPE.md Section 3 (Content Expansion)

---

### Gap 7: No Onboarding Flow 🔴

**Status**: CRITICAL UX GAP

**Issue**:
- User feedback: "VERY clunky"
- No first-time player experience
- No gesture tutorials
- No clear goals or progression indicators

**Impact**: New players don't understand how to play

**Remediation Required**:
- Create onboarding flow (Stage 2 Sprint 1)
- Interactive gesture tutorials
- Step-by-step guided experience
- **Priority**: CRITICAL - blocking Stage 2 playability

**Recommendation**: See STAGE_2_COMPLETE_SCOPE.md Section 1 (Onboarding Flow)

---

## MODERATE GAPS (Should Fix in Stage 2)

### Gap 8: Particle Effects Missing 🟡

**Status**: MODERATE POLISH GAP

**Issue**:
- Snaps have no visual feedback beyond text
- No particle effects for resource collection
- No pollution visual indicators
- Game feels unresponsive

**Remediation**: Add particle effects (Stage 2 Sprint 2)

---

### Gap 9: Haptic Feedback Not Integrated 🟡

**Status**: MODERATE MOBILE GAP

**Issue**:
- HapticSystem exists but not fully integrated
- Not all gestures have haptic feedback
- Combat doesn't have haptics (combat doesn't exist yet)

**Remediation**: Full haptic integration (Stage 2 Sprint 2, 4)

---

### Gap 10: Testing Coverage Gaps 🟡

**Status**: MODERATE QUALITY GAP

**Issue**:
- 57 tests passing (good)
- But combat system will need tests (doesn't exist yet)
- Content expansion needs balance tests
- No integration tests for full game loop

**Remediation**: Add tests for new systems (Stage 2 ongoing)

---

### Gap 11: Performance Not Validated on Real Devices 🟡

**Status**: MODERATE DEPLOYMENT GAP

**Issue**:
- 60 FPS target defined but not validated on real devices
- No mid-range Android testing done
- APK builds but not tested

**Remediation**: Device testing (Stage 2 Sprint 7)

---

### Gap 12: Documentation Sprawl 🟡

**Status**: MODERATE MAINTENANCE GAP

**Issue**:
- 60+ archived files still in codebase
- Multiple conflicting docs
- No single source of truth (until now)

**Remediation**: Continue documentation consolidation (this PR)

---

## MINOR GAPS (Can Defer to Stage 3+)

### Gap 13: Audio System

**Status**: Deferred to Stage 5

**Issue**: No audio system implemented

**Impact**: Low (mobile games often play with sound off)

---

### Gap 14: Visual Effects / Shaders

**Status**: Deferred to Stage 5

**Issue**: No pollution haze, water flow, or advanced visual effects

**Impact**: Low (2D interim rendering)

---

### Gap 15: Nova Cycles & Stardust Hops

**Status**: Deferred to Stage 3+

**Issue**: World-hopping mechanics not implemented

**Impact**: Medium (nice-to-have, not core loop)

---

### Gap 16: Villages & Quests

**Status**: Deferred to Stage 4+

**Issue**: Emergent content system not implemented

**Impact**: Medium (expands content, not core loop)

---

### Gap 17: File Naming Inconsistency

**Status**: Minor cosmetic issue

**Issue**: Mix of PascalCase and camelCase

**Impact**: Very low (doesn't affect functionality)

---

## Gap Prioritization

### Fix in Stage 2 (MUST)
1. **Gap 1**: Zustand/Pinia mismatch (CRITICAL)
2. **Gap 2**: WorldCore.ts file path (HIGH)
3. **Gap 3**: Rendering architecture confusion (CRITICAL)
4. **Gap 4**: Catalyst creator UI (CRITICAL)
5. **Gap 5**: Combat system (CRITICAL)
6. **Gap 6**: Content expansion (CRITICAL)
7. **Gap 7**: Onboarding flow (CRITICAL)
8. **Gap 8**: Particle effects (MODERATE)
9. **Gap 9**: Haptic integration (MODERATE)
10. **Gap 10**: Testing coverage (MODERATE)
11. **Gap 11**: Device testing (MODERATE)
12. **Gap 12**: Documentation cleanup (MODERATE)

### Fix in Stage 3+ (CAN DEFER)
13. **Gap 13**: Audio system
14. **Gap 14**: Visual effects/shaders
15. **Gap 15**: Nova Cycles & Stardust Hops
16. **Gap 16**: Villages & Quests
17. **Gap 17**: File naming

---

## Remediation Timeline

### Immediate (This PR)
- Fix Gap 1 (Zustand/Pinia decision)
- Fix Gap 2 (file paths)
- Fix Gap 3 (rendering architecture clarity)
- Fix Gap 12 (documentation consolidation)

### Stage 2 Sprint 1-2 (Weeks 1-2)
- Fix Gap 7 (onboarding flow)
- Fix Gap 4 (catalyst creator)
- Fix Gap 8 (particle effects)
- Fix Gap 9 (haptic integration)

### Stage 2 Sprint 3-4 (Weeks 3-4)
- Fix Gap 5 (combat system)
- Fix Gap 10 (testing coverage for combat)

### Stage 2 Sprint 5-6 (Weeks 5-6)
- Fix Gap 6 (content expansion)

### Stage 2 Sprint 7-8 (Weeks 7-8)
- Fix Gap 11 (device testing)
- Fix remaining issues

---

## Success Criteria: Stage 1 Gaps Resolved

### Before Stage 2 PR Merge
- ✅ Gap 1-3 resolved (architecture clarity)
- ✅ Gap 12 resolved (documentation aligned)

### After Stage 2 Complete
- ✅ Gap 4-11 resolved (all moderate + critical gaps)
- ⏳ Gap 13-17 deferred (documented in Stage 3+ scope)

---

## Conclusion

**Stage 1 Health**: 85% complete (solid foundation, critical gaps identified)

**Critical Gaps**: 7 (blocking Stage 2 completion)  
**Moderate Gaps**: 5 (impacting quality)  
**Minor Gaps**: 5 (nice-to-have)

**Total Gaps**: 17 identified, 12 must fix in Stage 2

**Remediation Plan**: See STAGE_2_COMPLETE_SCOPE.md for implementation details

---

**Version**: 1.0.0  
**Date**: 2025-11-06  
**Status**: Complete gap analysis, ready for remediation
