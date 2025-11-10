# Governors - Yuka-Native Law Implementation

**Concept:** Transform mathematical laws into Yuka primitives (behaviors, evaluators, goals, fuzzy logic)

---

## Philosophy

Instead of standalone law functions, **laws ARE Yuka behaviors**.

**Before (Pure Math):**
```typescript
// laws/ecology.ts
function lotkaVolterra(prey, predators) {
  const dPrey = alpha * prey - beta * prey * predators;
  const dPred = delta * prey * predators - gamma * predators;
  return [dPrey, dPred];
}
```

**After (Yuka Governor):**
```typescript
// governors/ecology/PredatorPreyBehavior.ts
class PredatorPreyBehavior extends SteeringBehavior {
  calculate(vehicle, force, delta) {
    if (vehicle.role === 'predator') {
      // Pursuit behavior (Lotka-Volterra α, β)
      const prey = this.findNearestPrey(vehicle);
      const pursuitForce = this.pursuit(vehicle, prey);
      force.add(pursuitForce.multiplyScalar(this.alpha));
    } else {
      // Flee behavior (Lotka-Volterra δ, γ)
      const predator = this.findNearestPredator(vehicle);
      const fleeForce = this.flee(vehicle, predator);
      force.add(fleeForce.multiplyScalar(this.gamma));
    }
  }
}
```

**Result:** Laws execute IN the agent loop, not as external calculations!

---

## Yuka Primitives → Our Laws

### 1. Steering Behaviors → Physics/Ecology Laws

**Yuka Has:**
- AlignmentBehavior (align with neighbors)
- CohesionBehavior (move toward group center)
- SeparationBehavior (avoid crowding)
- Pursuit/Flee (chase/escape)
- Seek/Arrive (go to point)
- Wander (random walk)
- ObstacleAvoidance
- FollowPath

**We Create:**
- **GravityBehavior** (physics.ts calculateGravity → steering force)
- **OrbitBehavior** (stellar.ts orbital mechanics → circular path)
- **FlockingBehavior** (ecology.ts + social.ts Dunbar → alignment + cohesion with max neighbors)
- **PredatorPreyBehavior** (ecology.ts Lotka-Volterra → pursuit/flee with coefficients)
- **TerritorialBehavior** (ecology.ts territorial behavior → fuzzy boundaries)
- **HierarchyBehavior** (social.ts dominance → seek dominant, flee subordinate)

---

### 2. Goal + Evaluators → Biological/Social Needs

**Yuka Has:**
- GoalEvaluator (desirability calculation)
- Goal (activate → execute → terminate)
- CompositeGoal (subgoals)
- Think (brain that picks highest desirability)

**We Create:**
- **HungerGoalEvaluator** (biology.ts Kleiber's Law → desirability from energy deficit)
- **ReproductionGoalEvaluator** (biology.ts → desirability from maturity + mate availability)
- **SafetyGoalEvaluator** (ecology.ts → desirability from threat proximity)
- **SocialGoalEvaluator** (social.ts Dunbar → desirability from group size)
- **ResourceGoalEvaluator** (ecology.ts → desirability from resource scarcity)

**Goals:**
- SeekFoodGoal → FindFood + Eat (composite)
- SeekMateGoal → FindMate + Reproduce
- EscapeThreatGoal → Flee + Hide
- JoinGroupGoal → Seek + Align

---

### 3. FSM (States) → Lifecycle/Social States

**Yuka Has:**
- State (enter → execute → exit)
- StateMachine (state transitions)

**We Create:**
- **LifecycleStates** (biology.ts):
  - JuvenileState, AdultState, ElderState
  - Transitions based on age thresholds
- **SocialStates** (social.ts):
  - NomadState, SettledState
  - PeaceState, WarState
- **MetabolicStates** (biology.ts Kleiber):
  - RestingState, ActiveState, HuntingState
  - Transitions based on energy levels

---

### 4. Fuzzy Logic → Complex Environmental Decisions

**Yuka Has:**
- FuzzyModule
- FuzzyVariable
- FuzzySet (Triangular, Shoulder, etc.)
- FuzzyRule (IF x AND y THEN z)

**We Create:**
- **TemperatureFuzzy** (physics.ts thermodynamics):
  - Cold (< 273K), Warm (273-310K), Hot (> 310K)
  - Rules: "IF cold THEN seek warmth"
- **ResourceAbundanceFuzzy** (ecology.ts carrying capacity):
  - Scarce, Adequate, Abundant
  - Rules: "IF scarce THEN migrate"
- **ThreatLevelFuzzy** (ecology.ts predator-prey):
  - Safe, Cautious, Danger
  - Rules: "IF danger THEN flee"
- **SocialHierarchyFuzzy** (social.ts):
  - Subordinate, Equal, Dominant
  - Rules: "IF subordinate THEN defer to dominant"

---

## Governor Architecture

```
engine/governors/
├── physics/
│   ├── GravityBehavior.ts        # F = Gm₁m₂/r²
│   ├── OrbitBehavior.ts          # Elliptical paths
│   ├── ThermodynamicsFuzzy.ts    # Hot/warm/cold decisions
│   └── CollisionBehavior.ts      # Avoid obstacles (momentum-conserving)
│
├── chemical/
│   ├── BondingBehavior.ts        # Seek compatible elements
│   ├── PhaseTransitionStates.ts  # Solid/liquid/gas FSM
│   └── ReactionFuzzy.ts          # Activation energy logic
│
├── biological/
│   ├── MetabolismGoal.ts         # Kleiber's Law → hunger
│   ├── GrowthStates.ts           # Juvenile → Adult → Elder
│   ├── ReproductionGoal.ts       # Mate seeking
│   ├── EnergyEvaluator.ts        # Desirability from energy state
│   └── AllometricBehavior.ts     # Size-dependent movement
│
├── ecological/
│   ├── PredatorPreyBehavior.ts   # Lotka-Volterra as pursuit/flee
│   ├── FlockingBehavior.ts       # Alignment + cohesion + separation
│   ├── TerritorialFuzzy.ts       # Boundary detection
│   ├── ResourceGoal.ts           # Seek resources
│   └── MigrationBehavior.ts      # Seasonal movement
│
├── social/
│   ├── HierarchyBehavior.ts      # Dominance interactions
│   ├── CooperationGoal.ts        # Help group members
│   ├── CommunicationTrigger.ts   # Message-based signaling
│   ├── DunbarFuzzy.ts            # Group size limits (max ~150)
│   └── SocialStates.ts           # Peace/war, nomadic/settled
│
└── index.ts                       # Export all governors
```

---

## Usage Pattern

```typescript
import { Vehicle, EntityManager, Think } from 'yuka';
import { GravityBehavior, MetabolismGoal, HungerEvaluator } from 'engine/governors';

// Create agent
const creature = new Vehicle();
creature.maxSpeed = 5;
creature.mass = 10;
creature.energy = 100;

// Add physics governor
const gravity = new GravityBehavior();
creature.steering.add(gravity);

// Add biological governor  
const brain = new Think(creature);
brain.addEvaluator(new HungerEvaluator());
brain.addEvaluator(new ReproductionEvaluator());
creature.brain = brain;

// Update loop (Yuka handles everything!)
entityManager.update(delta);
// Gravity pulls creature down
// If hungry, brain switches to SeekFoodGoal
// If tired, switches to RestGoal
// All automatic!
```

---

## Benefits

### 1. Laws Execute in Agent Loop
No need to call laws manually - they're part of agent update()

### 2. Composable
Stack multiple behaviors/goals/states on one agent

### 3. Emergent
Laws interact through agent decisions, creating emergence

### 4. R3F Compatible
Yuka works seamlessly with R3F (we already proved this!)

### 5. Debuggable
Can visualize behaviors (Yuka has helpers for this)

---

## Implementation Priority

### Phase 1: Core Governors
1. **GravityBehavior** - Most fundamental
2. **FlockingBehavior** - Ecology + social combined
3. **MetabolismGoal** - Biology foundation
4. **HierarchyBehavior** - Social foundation

### Phase 2: Lifecycle
5. **GrowthStates** - Juvenile → Adult → Elder
6. **ReproductionGoal** - Mate seeking
7. **EnergyEvaluator** - Hunger decisions

### Phase 3: Environment
8. **TemperatureFuzzy** - Thermodynamics
9. **ResourceGoal** - Seek resources
10. **TerritorialFuzzy** - Boundaries

---

**Next:** Implement Phase 1 governors and test with R3F

