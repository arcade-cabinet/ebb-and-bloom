# Active Context

**Date:** November 10, 2025  
**Status:** PLANETARY EXPLORATION FOCUSED 🌍

---

## FOCUS: ONE WORLD EXPLORATION

**What:** Three-word seed → Explore a living, evolving planet  
**Scale:** Planetary surface only (no universe/stellar)  
**Result:** 15 governors powering world evolution

### Active Governors (15)

**Physics (2):**
- ✅ `GravityBehavior` - Ground-level gravity
- ✅ `TemperatureFuzzy` - Weather/climate

**Biological (5):**
- ✅ `MetabolismGovernor` - Kleiber's Law
- ✅ `LifecycleStates` - Juvenile→Adult→Elder
- ✅ `ReproductionGovernor` - Mating + gestation
- ✅ `GeneticsSystem` - Heredity + mutation
- ✅ `CognitiveSystem` - Brain + learning

**Ecological (5):**
- ✅ `FlockingBehavior` - Group movement
- ✅ `PredatorPreyBehavior` - Lotka-Volterra
- ✅ `TerritorialFuzzy` - Spatial boundaries
- ✅ `ForagingBehavior` - Optimal foraging
- ✅ `MigrationBehavior` - Seasonal movement

**Social (3):**
- ✅ `HierarchyBehavior` - Dominance ranks
- ✅ `WarfareBehavior` - Group conflict
- ✅ `CooperationBehavior` - Reciprocal altruism

### Integration Complete

- ✅ All governors exported from `engine/index.ts`
- ✅ No TypeScript/linter errors
- ✅ Proper inheritance from Yuka base classes
- ✅ R3F demo created (`GovernorsDemo.tsx`)
- ✅ Laws vs Governors documented

---

## Eliminated Directories

**Universe/Stellar Scale (DELETED):**
- ❌ `engine/simulation/` - Universe timeline
- ❌ `engine/synthesis/` - Universe genesis  
- ❌ `engine/generation/` - Universe generators
- ❌ `engine/audio/` - Cosmic sonification
- ❌ `engine/physics/` - Star formation

**Focus:** One world, infinite depth

---

## Current Structure (CLEAN)

```
engine/ (59 files, 8,123 lines)
├── governors/      # 15 governors (biology, ecology, social, physics)
├── spawners/       # Terrain, biomes, vegetation, creatures, NPCs, settlements
├── systems/        # Infrastructure (tools, structures, trade, workshops)
├── agents/         # CreatureAgent (simple, uses governors)
├── procedural/     # CreatureMeshGenerator (simple composites)
├── core/           # GameEngine
├── tables/         # Constants
├── utils/          # RNG, seeds
└── types/          # TypeScript defs
```

**Demo:**
- TerrainDemo - Main game (world exploration)
- PlaygroundDemo - Governor experiments

---

## Cleanup Complete ✅

**Deleted:**
- engine/planetary/ (whole-planet scale)
- engine/ecology/ (redundant)
- engine/agents/AgentSpawner (complex)
- engine/agents/AgentLODSystem (complex)
- engine/agents/behaviors/ (duplicate)
- engine/procedural/YukaGuidedGeneration (abstract)

**Refactored:**
- CreatureSpawner → Uses governors directly
- CreatureMeshGenerator → Simple composites

**Result:**
- 59 files (clean)
- 8,123 lines (focused)
- 100% governor-driven
- Zero complexity

## Next Steps

1. Test in browser
2. Add tool/structure synthesis (from governors)
3. Improve creature mesh variety
4. Settlement AI
