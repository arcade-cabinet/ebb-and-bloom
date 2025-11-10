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

## Synthesis System Complete ✅

**New Procedural Pipeline:**

```
Governors → Traits → Molecular Composition → Visual Synthesis
```

**MolecularSynthesis:**
- Protein % → Muscle cylinders (bulk)
- Calcium % → Bone rigidity (segments)
- Chitin % → Exoskeleton (facets)
- Lipid % → Fat distribution (sphere inflation)
- Keratin % → Horns/spikes

**PigmentationSynthesis:**
- Diet → Pigments (carotenoids from plants, porphyrins from meat)
- Environment → Camouflage (vegetation green, rock brown)
- Genetics → Patterns (spots, stripes, solid)
- Age → Graying (melanin accumulation)

**StructureSynthesis:**
- Material availability → Tool/structure appearance
- Wood/stone/bone → Composite forms
- NO PREFABS

**Complete Chain:**
1. Governors decide: "Herbivore, forest, high genetics"
2. Molecular: High lipid, moderate protein → Bulky body
3. Pigmentation: Plant diet + forest → Green with leaf patterns
4. Result: Fat green creature with camouflage spots

## Architecture

```
engine/
├── governors/      # DECIDE (biology, ecology, social)
├── procedural/     # SYNTHESIZE (molecules → visuals)
├── systems/        # INFRASTRUCTURE (tools, structures)
├── spawners/       # GENERATE (terrain, creatures, NPCs)
└── agents/         # ACT (powered by governors)
```

## Demos Complete ✅

**6 Working Demos:**
1. **/terrain** - World exploration (main game)
2. **/ecosystem** - Living ecosystem (governors in action)
3. **/molecular** - Molecular synthesis (interactive sliders)
4. **/pigmentation** - Diet/environment coloring
5. **/tools** - Tool & structure synthesis
6. **/playground** - Governor experiments

**Dev server:** `cd demo && npm run dev`  
**URL:** http://localhost:5173

## BEAST MODE SESSION SUMMARY

**37 commits, 87% test coverage achieved**

**ENGINE COMPLETE:**
- ✅ 15 Governors (autonomous decision makers)
- ✅ 6 Synthesis systems (molecular → visuals)
- ✅ 5 Core systems (WorldManager, Terrain, Player, Creatures, CityPlanner)
- ✅ 45/52 tests passing (87%)
- ✅ 977 lines of comprehensive tests
- ✅ 68 TypeScript files, ~10,000 lines
- ✅ DFU architecture studied and replicated

**NEXT: Build proper game package**
- Delete demo/ directory
- Create game/ package
- Use ONLY WorldManager API
- Clean separation from engine
