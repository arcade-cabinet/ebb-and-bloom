# Active Context

**Date:** November 11, 2025  
**Status:** ✅ Pino Logging Complete | 🔄 React Native Migration In Progress  
**Focus:** Migrating from Capacitor to React Native + Expo for native mobile performance

---

## Current Focus: React Native + Expo Migration

**What:** Full platform migration from web (Vite + Capacitor) to native (React Native + Expo)  
**Why:** True native mobile performance, better sensor integration, production-ready mobile deployment  
**Status:** Initial setup complete (`ebb-bloom-native/`), Android tooling installed

### Completed This Session

**Pino Structured Logging (Architect Approved):**
- ✅ All console.* calls replaced with module-scoped Pino loggers
- ✅ GovernorActionExecutor.execute() returns Promise<boolean>
- ✅ Intent success/failure fully traceable
- ✅ Conservation violations logged with structured data
- ✅ GenesisConstants warnings logged per-warning
- ✅ GameState.executeGovernorIntent propagates success boolean

**Production-Ready Logging:**
- Module-scoped loggers: genesis, ecs, world, intent, law, conservation, gameState
- Browser-compatible (pino-browser)
- Structured JSON logging with meaningful data
- Proper log levels (debug/info/warn/error)

**Phase 3 Implementation:**
- ✅ GovernorActionPort interface (unified player/AI API)
- ✅ GovernorActionExecutor (7 actions → ECS World)
- ✅ PlayerGovernorController (energy budget validation)
- ✅ GameState.executeGovernorIntent() wiring
- ✅ Conservation law integration (mass, charge, energy)

**Critical Bug Fixes:**
- ✅ Memory leak eliminated (React infinite render loop)
  - RenderLayer: Replaced 60fps polling with subscription
  - SceneManager: Added onSceneChange() event system
  - GameplayScene: Removed scene/camera from useEffect deps

**Documentation Created:**
- ✅ `docs/AI_HIERARCHY.md` - Creature AI vs Rival AI distinction
- ✅ `docs/COSMIC_PROVENANCE.md` - Complete material lineage system
- ✅ `docs/INTENT_API_PHILOSOPHY.md` - Fair competition through laws
- ✅ `docs/README.md` - Entry point, reading order, architecture
- ✅ `docs/SYNC_STATUS.md` - Documentation alignment tracker
- ✅ `.clinerules` - AI agent memory bank structure
- ✅ `replit.md` updated - References .clinerules, Phase 3 complete

---

## Recent Changes (November 11, 2025)

### Intent API Architecture (Phase 3)

**Created Files:**
```
engine/ecs/core/GovernorActionExecutor.ts  (187 lines)
game/controllers/PlayerGovernorController.ts  (22 lines)
```

**Modified Files:**
```
game/state/GameState.ts
  - Added governorExecutor field
  - Added executeGovernorIntent() method
  - Wired executor during initializeWorld()
```

### 7 Governor Actions Implemented

1. **smitePredator** (1000 energy)
   - Damages/removes predator entities
   - Conservation-law compliant (creates corpse)
   - Synchronizes Three.js scene

2. **nurtureFood** (500 energy)
   - Spawns vegetation with genesis properties
   - Temperature from genesis.getSurfaceTemperature()
   - Elements from cosmic metallicity

3. **shapeTerrain** (800 energy)
   - Modifies structural entity heights
   - Uses spatial queries (world.queryRadius)

4. **applyPressure** (600 energy)
   - Environmental stress (temperature/energy)
   - Affects biological entities

5. **selectPrey** (300 energy)
   - Placeholder for ecology integration

6. **formAlliance** (400 energy)
   - Placeholder for culture integration

7. **migrate** (700 energy)
   - Placeholder for ecology integration

---

## System Architecture State

### Current Stack (Bottom to Top)

```
COSMIC PROVENANCE
├─ GenesisConstants (universal coordinates, physics)
├─ CosmicProvenanceTimeline (galaxy age, metallicity)
└─ [TODO] PlanetaryAccretion (Core → Surface)
         ↓
ECS WORLD (Miniplex)
├─ World.ts (archetype storage, spatial queries)
├─ CoreComponents (Physics, Chemistry, Biology, Ecology)
├─ LawOrchestrator (11 systems: Thermodynamics, Metabolism, etc.)
└─ ConservationLedger (mass, charge, energy tracking)
         ↓
INTENT API ✅ COMPLETE
├─ GovernorActionPort (interface)
├─ GovernorActionExecutor (implementation)
├─ PlayerGovernorController (player impl)
└─ [TODO] RivalAIGovernorController (AI impl)
         ↓
GAME STATE (Zustand)
├─ initializeWorld() (seed → RNG → Genesis → ECS)
├─ executeGovernorIntent() ✅ NEW
└─ Three.js scene/camera refs
         ↓
UI LAYER (React + R3F)
├─ SceneManager (Menu → Intro → Gameplay)
├─ MenuScene (seed selection) ✅ WORKING
├─ IntroScene (cosmic FMV)
└─ GameplayScene (governor view)
```

---

## Active Patterns & Learnings

### Pattern: Subscription Over Polling

**Problem:** RenderLayer was forcing re-render 60fps by calling `getScenes()` which returned new array each time.

**Solution:** Event-driven subscription
```typescript
// SceneManager
private sceneChangeListeners: Set<() => void> = new Set();
onSceneChange(listener: () => void): () => void { ... }

// RenderLayer
const [scenes, setScenes] = useState(manager.getScenes());
useEffect(() => {
  const unsubscribe = manager.onSceneChange(() => {
    setScenes([...manager.getScenes()]);
  });
  return unsubscribe;
}, []);
```

**Result:** Only re-renders when scenes actually change (push/pop), not 60 times per second.

### Pattern: Intent Execution Pipeline

**Key Insight:** Both player and AI MUST use exact same code path.

```typescript
// Player
await gameState.executeGovernorIntent({
  action: 'smite_predator',
  target: wolfId,
  magnitude: 1.0
});

// Rival AI (future)
await gameState.executeGovernorIntent({
  action: 'smite_predator',
  target: playerCreatureId,
  magnitude: 1.0  // SAME MAGNITUDE
});

// Both go through GovernorActionExecutor.execute()
// Laws determine outcome, not intent source
```

**Critical:** Don't special-case player vs AI. Difference = who submits intent, not how it's processed.

### Pattern: Conservation Law Integration

**Every action must update ledger:**
```typescript
// When spawning entity
const newEntity = world.add({
  mass: 1,
  elementCounts: { 'C': 10, 'O': 5 }
});
// world.add() automatically updates ConservationLedger

// When removing entity
world.remove(entityId);
// world.remove() automatically deducts from ledger
```

**Don't:** Manually track conservation. Let World handle it.

---

## Next Steps

### Immediate: React Native + Expo Migration

1. **Complete Platform Migration**
   - Port ECS engine to React Native environment
   - Integrate React Three Fiber (Expo GL)
   - Set up Expo sensors (gyroscope, accelerometer, haptics)
   - Configure Android build
   - Test on device

### After Migration: Phase 4 (Creature AI)

1. **Delete Obsolete Generators**
   - Remove old generation/ spawners (replaced by ECS + Laws)
   - Clean up WorldManager remnants (if any)
   - Remove duplicate code

2. **Implement Creature AI (YUKA)**
   - Individual Goals (hunger, safety, reproduction)
   - StateMachines (idle → hunt → eat → rest)
   - SteeringBehaviors (seek, flee, wander)
   - Tool use learning (spear-making, fire)
   - **READ:** `docs/AI_HIERARCHY.md` before starting

3. **Implement Rival AI Controllers**
   - RivalAIGovernorController implements GovernorActionPort
   - Strategic decision-making (ecology evaluation)
   - Energy budget management
   - Territory awareness
   - **READ:** `docs/INTENT_API_PHILOSOPHY.md` before starting

---

## Known Issues

**None.** Zero LSP errors, server running smoothly, memory leak fixed.

---

## Important Decisions Made

### Decision: Tools Are Creature Synthesis, Not Separate AI

**Context:** Debated whether tools/structures need their own AI system.

**Decision:** No separate AI. Tools are FUNCTIONS of creature synthesis.
- Spear = creature capability × material availability
- Shelter = creature cooperation × learned behavior
- Tool competency is creature property

**Rationale:**
- Reduces AI complexity (fewer competing systems)
- Tools don't "act" - creatures use tools
- Aligns with "everything is a squirrel" (tools are just arranged atoms)

**Reference:** `docs/AI_HIERARCHY.md` section on tools

### Decision: Intent API Over Direct ECS Manipulation

**Context:** Could let player directly modify ECS entities.

**Decision:** All actions through GovernorActionPort → GovernorActionExecutor.
- Player submits intents
- AI submits intents
- Laws determine outcomes

**Rationale:**
- Provable fairness (same code path)
- Testability (can swap implementations)
- Extensibility (add new actions without breaking)

**Reference:** `docs/INTENT_API_PHILOSOPHY.md`

### Decision: Subscription Over Polling for React Re-renders

**Context:** RenderLayer was polling SceneManager 60fps.

**Decision:** Event-driven subscription (onSceneChange).

**Rationale:**
- Performance (only re-render when needed)
- Cleaner (explicit dependencies)
- Scalable (won't break with more scenes)

---

## Files Recently Modified

**Critical Files:**
- `engine/ecs/core/GovernorActionExecutor.ts` - NEW
- `game/controllers/PlayerGovernorController.ts` - NEW
- `game/state/GameState.ts` - Added executor integration
- `game/scenes/GameplayScene.tsx` - Fixed useEffect deps
- `game/core/RenderLayer.tsx` - Subscription pattern
- `game/scenes/SceneManager.ts` - Added onSceneChange()

**Documentation:**
- `docs/AI_HIERARCHY.md` - NEW (189 lines)
- `docs/COSMIC_PROVENANCE.md` - NEW (319 lines)
- `docs/INTENT_API_PHILOSOPHY.md` - NEW (374 lines)
- `docs/README.md` - NEW (340 lines)
- `docs/SYNC_STATUS.md` - NEW (status tracker)
- `.clinerules` - REWRITTEN (gold standard format)
- `replit.md` - Updated (Phase 3 complete, references .clinerules)

---

## Handoff Notes for Next Agent

**You are here:** Phase 3 Complete (Intent API integrated, memory leak fixed)

**Read these FIRST:**
1. `.clinerules` - Memory bank structure
2. `memory-bank/projectBrief.md` - Foundation
3. `memory-bank/progress.md` - What works
4. `docs/AI_HIERARCHY.md` - CRITICAL distinction

**Next phase:** Phase 4 (Delete obsolete code, implement Creature AI)

**Zero issues:** LSP clean, server running, no console errors

**Key insight:** Creature AI (individual organisms) is fundamentally different from Rival AI (strategic governors). Don't confuse them. Read AI_HIERARCHY.md.

---

---

## React Native Migration Notes

**Decision:** Abandoning Capacitor in favor of React Native + Expo
- **Reason:** True native performance vs webview wrapper
- **Created:** `ebb-bloom-native/` project directory
- **Tooling:** JDK 17, Android Studio, watchman installed
- **Next:** Port ECS engine, integrate Expo GL + Three.js

**Critical:** This is a FULL migration, not a proof-of-concept. All future work happens in React Native environment.

---

**Last Updated:** November 11, 2025, 17:30 UTC
