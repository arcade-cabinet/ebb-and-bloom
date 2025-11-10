# Active Context - GOVERNORS Architecture

**Date:** November 10, 2025  
**Status:** 🚀 BREAKTHROUGH - Laws → Yuka Governors  
**Focus:** Transforming laws into first-class Yuka primitives

---

## 🎯 CURRENT MISSION: Governors

**User Insight:**
> "Between all of Yuka's examples (FSM, Fuzzy, Goal, Steering, etc.), we could directly port our laws TO engine/agents and create direct translations of all our rules INTO yuka. Create governors that first-class tie into R3F, Drei, Yuka."

**The Breakthrough:**
- Laws shouldn't be standalone functions
- Laws should BE Yuka behaviors/goals/evaluators
- Laws execute IN the agent loop automatically
- Perfect integration with R3F + Yuka

---

## What's Being Built

### Governors = Yuka-Native Laws

**Before (Pure Math):**
```typescript
// laws/ecology.ts
function lotkaVolterra(prey, predators) { ... }
```

**After (Yuka Governor):**
```typescript
// governors/ecological/PredatorPreyBehavior.ts
class PredatorPreyBehavior extends SteeringBehavior {
  calculate(vehicle, force) {
    // Lotka-Volterra AS steering (pursuit/flee)
  }
}
```

**Result:** Laws are LIVING behaviors, not dead formulas!

---

## Yuka Primitives → Our Laws

### Discovered Mappings:

**1. Steering Behaviors → Physics/Ecology**
- Gravity → GravityBehavior (custom)
- Orbits → OrbitBehavior (custom)
- Flocking → Ecology + Social (alignment/cohesion/separation + Dunbar)
- Predator-Prey → Pursuit/Flee (Lotka-Volterra coefficients)

**2. Goal + Evaluators → Biology/Ecology**
- Metabolism → HungerGoalEvaluator (Kleiber's Law)
- Reproduction → ReproductionGoalEvaluator
- Safety → SafetyGoalEvaluator (threat proximity)
- Resources → ResourceGoalEvaluator (carrying capacity)

**3. FSM (States) → Lifecycle/Social**
- Juvenile → Adult → Elder (biology)
- Nomadic → Settled (social)
- Peace → War (social)
- Resting → Active → Hunting (metabolism)

**4. Fuzzy Logic → Environment**
- Temperature (hot/warm/cold)
- Resource abundance (scarce/adequate/abundant)
- Threat level (safe/cautious/danger)
- Social rank (subordinate/equal/dominant)

---

## Implemented (So Far)

### ✅ Physics Governor
**GravityBehavior.ts**
- Newton's gravity as SteeringBehavior
- F = G * (m1 * m2) / r²
- Applies to all massive neighbors
- Configurable scale for game feel

### ✅ Ecological Governor
**FlockingBehavior.ts**
- Ecology laws (group behavior)
- Social laws (Dunbar's number = max 150 neighbors)
- Uses Yuka's built-in Alignment/Cohesion/Separation
- Configurable weights

### ✅ Biological Governor
**MetabolismGovernor.ts**
- Kleiber's Law (M = 70 * mass^0.75)
- HungerEvaluator (desirability from energy deficit)
- SeekFoodGoal (composite: find → move → eat)
- MetabolismSystem (depletes energy over time)

---

## In Progress

### ⏳ More Governors to Create:
1. **PredatorPreyBehavior** (Lotka-Volterra)
2. **LifecycleStates** (Juvenile/Adult/Elder FSM)
3. **ReproductionGoal** (mate seeking)
4. **TemperatureFuzzy** (thermodynamics)
5. **HierarchyBehavior** (social dominance)
6. **TerritorialFuzzy** (spatial boundaries)
7. **OrbitBehavior** (stellar mechanics)

---

## Structure

```
engine/governors/
├── README.md (philosophy & usage)
├── physics/
│   └── GravityBehavior.ts ✅
├── ecological/
│   └── FlockingBehavior.ts ✅
├── biological/
│   └── MetabolismGovernor.ts ✅
└── [more to come...]
```

---

## Usage Example

```typescript
import { Vehicle, EntityManager, Think } from 'yuka';
import { 
  GravityBehavior,
  FlockingGovernor,
  HungerEvaluator,
  SeekFoodGoal 
} from 'engine/governors';

// Create creature
const creature = new Vehicle();
creature.mass = 10;
creature.energy = 100;
creature.maxEnergy = 100;

// Add physics governor
const gravity = new GravityBehavior();
gravity.scale = 1e10; // Game-scale gravity
creature.steering.add(gravity);

// Add ecology governor
const flocking = new FlockingGovernor();
flocking.applyTo(creature, 10); // 10m neighborhood

// Add biology governor
const brain = new Think(creature);
brain.addEvaluator(new HungerEvaluator());
creature.brain = brain;

// In update loop:
MetabolismSystem.update(creature, delta); // Deplete energy
entityManager.update(delta); // Yuka handles rest!

// Creature will:
// - Be pulled by gravity
// - Flock with neighbors (max 150)
// - Get hungry when energy < 30%
// - Automatically switch to SeekFoodGoal
// - Find food, move to it, eat it
// - All emergent!
```

---

## Benefits

1. **Automatic Execution** - Laws run in agent loop
2. **Emergent** - Laws interact through agent decisions
3. **Composable** - Stack multiple governors
4. **R3F Compatible** - Works with existing R3F demos
5. **Debuggable** - Can visualize behaviors (Yuka helpers)
6. **Performant** - Yuka's optimized update loop

---

## Next Steps

1. Complete Phase 1 governors (4 more)
2. Export from engine/index.ts
3. Create R3F demo showing governors in action
4. Update documentation
5. Test with real agents

---

**Status:** Foundation governors implemented, architecture proven  
**Next:** Continue implementing remaining governors

---

See: `engine/governors/README.md` for complete architecture
