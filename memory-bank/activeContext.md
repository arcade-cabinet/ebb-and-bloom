# Active Context

**Date:** November 10, 2025  
**Status:** Engine v1.0 + Governors Foundation

---

## Governors Architecture (NEW)

**What:** Transform 57 laws into Yuka primitives  
**Why:** Laws execute IN agent loop (not external calls)  
**How:** Behaviors, Goals, Evaluators, FSM, Fuzzy Logic

**Implemented (3):**
- `governors/physics/GravityBehavior.ts`
- `governors/ecological/FlockingBehavior.ts`  
- `governors/biological/MetabolismGovernor.ts`

**Remaining Work:**
1. PredatorPreyBehavior (Lotka-Volterra)
2. LifecycleStates (Juvenile/Adult/Elder FSM)
3. ReproductionGoal + Evaluator
4. TemperatureFuzzy (hot/warm/cold)
5. HierarchyBehavior (social dominance)
6. TerritorialFuzzy (spatial boundaries)
7. OrbitBehavior (stellar mechanics)
8. Export from engine/index.ts
9. Create R3F demo showing governors

**Pattern:** Study Yuka examples, implement law as proper Yuka primitive, test with R3F

---

## Current Structure

**Root:** README.md only ✅  
**Engine:** 17 directories (laws, spawners, agents, governors, etc.)  
**Demo:** R3F package (3 demos)  
**Docs:** 9 clean files

---

## Next Session

Continue implementing governors OR build R3F demos using existing 3.

See: `engine/governors/README.md`
