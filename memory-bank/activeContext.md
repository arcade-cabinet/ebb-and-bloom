# Active Context

**Last Updated**: 2025-01-09

---

## PRIMARY REFERENCE

**READ THIS FIRST**: `docs/WORLD.md` (2,005 lines)

**WORLD.md is THE comprehensive source of truth**:
- Complete world-building (Gen 0 → mythology)
- Full codebase audit (17 systems, 10 flaws, 10 strengths)
- Dev tools review (Vercel AI, Meshy, hooks, stores, utils)
- 7-phase resurrection roadmap

**This file (activeContext.md) ONLY tracks**:
- Immediate next steps
- Current blockers
- What's actively being worked on

---

## Current Focus: Phase 0 - Foundation

**CRITICAL BLOCKER**: No Generation 0 exists. Everything is hardcoded.

### Immediate Next Steps

1. **Install Missing Dependencies**:
   ```bash
   pnpm add seedrandom @types/seedrandom
   ```
   **Why**: Required for deterministic planetary generation from seed phrase.

2. **Create Directory Structure**:
   ```bash
   mkdir -p src/ai/workflows
   mkdir -p src/goals
   mkdir -p src/fuzzy
   mkdir -p src/messaging
   ```
   **Why**: Organization for Gen 0 AI workflows and Yuka expansion.

3. **Create Meshy Config**:
   - File: `src/config/meshy-models.ts`
   - Purpose: Meshy API integration (3D model generation)
   - Status: ❌ Not created

4. **Parent-Child AI Workflows** (CRITICAL):
   - `src/ai/workflows/creative-director.ts` - Parent workflow
   - `src/ai/workflows/core-specialist.ts` - Child workflow (per core)
   - `src/ai/workflows/workflow-orchestrator.ts` - Parallel execution
   - Status: ❌ Not created

5. **PlanetaryPhysicsSystem**:
   - File: `src/systems/PlanetaryPhysicsSystem.ts`
   - Purpose: Gen 0 foundation (calls AI workflows, generates manifests)
   - Status: ❌ Not created

---

## What's Broken (Preventing Work)

**Runtime Errors** (game won't load):
- ✅ `Platform is not defined` - FIXED (changed to `Capacitor.getPlatform()`)
- ✅ `useEvolutionDataStore` undefined - FIXED (added import)
- ✅ GestureActionMapper crashes - FIXED (added null checks)
- ✅ SplashScreen name collision - FIXED (aliased import)
- ✅ Font errors - FIXED (removed custom fonts)
- ⚠️ **Missing textures** - Run `pnpm setup:textures` FIRST
- ⚠️ **WebGL context lost** - Scene not initializing properly

**Can't assess game without it rendering**.

---

## Game Vision Summary (from WORLD.md)

**Genre**: Resource race with emergent endings

**Core Loop**:
1. Seed phrase → Gen 0 planetary physics
2. Creatures evolve → Tools emerge → Materials unlock
3. Tribes form → Compete for resources
4. World score tracks playstyle (violence, harmony, exploitation, innovation, speed)
5. Ending emerges: Mutualism, Parasitism, Domination, or Transcendence

**Yuka Role**: Everything is a Yuka entity with goals (planet, materials, creatures, tools, buildings, tribes, myths).

**Player Role**: Evolutionary force (guide, not control).

---

## Yuka Architecture Overhaul (from WORLD.md)

**Current**: Only 3 of 10+ Yuka systems used (steering behaviors only).

**Target**: ALL Yuka systems integrated:
- ✅ Vehicle (steering behaviors)
- ❌ CompositeGoal (hierarchical goal trees)
- ❌ GoalEvaluator (desirability scoring)
- ❌ FuzzyModule (fuzzy logic decisions)
- ❌ StateMachine (FSM for states)
- ❌ Vision (perception, line-of-sight)
- ❌ MemorySystem (short-term memory)
- ❌ Trigger (event-driven actions)
- ❌ TaskQueue (sequential tasks)
- ❌ MessageDispatcher (entity communication)
- ❌ CohesionBehavior (material snapping!)
- ❌ SeparationBehavior (spacing)
- ❌ AlignmentBehavior (group movement)

**See `docs/WORLD.md` sections**:
- "Yuka Capabilities We're NOT Using" (lines 46-79)
- "Yuka Severely Underutilized" (lines 780-807)
- "Manual Decision Loops, Not Yuka Goals" (lines 871-912)

---

## Critical Systems Status

**Gen 0**: ❌ Doesn't exist (BLOCKER)  
**Tool Sphere**: ❌ Commented out (line 110-112 of YukaSphereCoordinator)  
**Building Sphere**: ⚠️ Logs only, doesn't build (line 425+)  
**Inter-Sphere Messaging**: ❌ None (spheres isolated)  
**Event Log**: ❌ None (player has zero feedback)  
**World Score**: ❌ None (no ending detection)

**See `docs/WORLD.md` section**: "What's BROKEN (Fundamental Flaws)" (lines 760-1000)

---

## What Works (Preserve)

✅ ECS architecture (Miniplex clean)  
✅ R3F rendering separation (logic in ECS, rendering in R3F)  
✅ UIKit migration (all UI in Canvas)  
✅ Yuka foundation (exists, just underutilized)  
✅ Procedural systems (terrain, textures, archetypes)  
✅ GameClock (generational architecture)  
✅ Genetic synthesis (trait blending)  
✅ Deconstruction (reverse synthesis)  
✅ Haiku narrative (storytelling)  
✅ Consciousness (player awareness transfer)

**See `docs/WORLD.md` section**: "What's GOOD (Preserve These)" (lines 1003-1093)

---

## Resurrection Roadmap (from WORLD.md)

**Phase 0**: Foundation (CURRENT)
- Install dependencies
- Create directory structure
- Port Meshy config
- Set up AI workflow scaffolding

**Phase 1**: Gen 0 Implementation
- Creative Director workflow
- Core Specialist workflows
- PlanetaryPhysicsSystem
- Refactor RawMaterialsSystem

**Phase 2**: Yuka Expansion
- Expand YukaAgent component
- Create goal implementations
- Create fuzzy modules
- Refactor YukaSphereCoordinator

**Phase 3**: Inter-Sphere Communication
- MessageTypes enum
- InterSphereMessaging wrapper
- EventLog entity + UI
- Integrate into all spheres

**Phase 4**: Tool & Building Integration
- Uncomment Tool Sphere
- Implement FuzzyModule decisions
- Complete Building Sphere
- Wire messaging

**Phase 5**: Player Feedback
- WorldScoreStore
- EventMessagingSystem
- Event Log UI
- EndingDetectionSystem

**Phase 6**: Endings
- Define thresholds
- Implement detection
- Create cinematics
- Integrate haikus

**Phase 7**: Polish
- Reactive queries
- Freesound audio
- Missing tests
- Mobile deployment

**See `docs/WORLD.md` section**: "Critical Path Summary" (lines 1932-1984)

---

## Immediate Actions (Next Session)

1. ✅ Read `docs/WORLD.md` in full (understand complete vision)
2. ⬜ Install `seedrandom` dependency
3. ⬜ Create directory structure (`src/ai/workflows/`, `src/goals/`, `src/fuzzy/`, `src/messaging/`)
4. ⬜ Create `src/config/meshy-models.ts`
5. ⬜ Begin `creative-director.ts` (parent AI workflow using Vercel AI SDK)
6. ⬜ Begin `core-specialist.ts` (child AI workflow)
7. ⬜ Begin `workflow-orchestrator.ts` (parallel execution manager)
8. ⬜ Begin `PlanetaryPhysicsSystem.ts` (Gen 0 orchestrator)

**Goal**: Get Gen 0 foundation in place so refactoring can begin.

---

## Key Realizations (from Session)

1. **Yuka is the nervous system of the ENTIRE world** - not just creatures, but materials (CohesionBehavior!), tools (FuzzyModule!), buildings (Triggers!), tribes (MessageDispatcher!), and even the planet itself (goal trees!).

2. **Procedural generation IS Yuka** - Material placement uses CohesionBehavior. Creature spawning uses GoalEvaluator. Tool emergence uses FuzzyModule. Generation isn't separate from behavior.

3. **Game is a resource race with emergent endings** - Not a sandbox simulation. Player guides evolution, competes against Yuka-driven tribes, and playstyle determines one of 4 endings (Mutualism, Parasitism, Domination, Transcendence).

4. **No Gen 0 = foundation is broken** - ALL values are hardcoded (Copper at 10m depth, Tin at 30m, etc.). Can't refactor anything until Gen 0 generates these from seed.

5. **AI workflows exist but aren't integrated** - `MasterEvolutionPipeline.ts` and `EvolutionaryAgentWorkflows.ts` are DEV-TIME only. Need RUNTIME AI workflows for Gen 0 (parent-child orchestration via Vercel AI SDK).

6. **Documentation is now clean** - 11 core files, DRY principles, `WORLD.md` as comprehensive source of truth. Memory bank is production-quality.

---

## Remember

**Don't duplicate `WORLD.md` content here**. This file is for ACTIVE work only.

**For comprehensive details**:
- Vision → `docs/WORLD.md` (lines 1-733)
- Codebase audit → `docs/WORLD.md` (lines 716-1255)
- Dev tools → `docs/WORLD.md` (lines 1258-1884)
- Critical path → `docs/WORLD.md` (lines 1932-1984)

