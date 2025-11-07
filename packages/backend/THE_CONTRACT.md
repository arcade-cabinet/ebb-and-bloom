# THE FUNDAMENTAL CONTRACT: YUKA ALWAYS KNOWS WHAT TO DO NEXT

## The Design Philosophy

We provide **ARCHETYPES**.

Yuka builds **SYSTEMS**.

At **EVERY GENERATION**, for **ANY CREATURE**, Yuka must answer:

**"What should this squirrel do next?"**

If Yuka **CANNOT** answer that question → **WE FAILED**.

---

## What This Means

### We Don't Hardcode Behaviors

```typescript
// WRONG: Hardcoded behavior
class Squirrel {
  update() {
    if (this.hunger > 0.8) {
      this.findNuts();
    } else if (this.energy < 0.3) {
      this.sleep();
    } else {
      this.wander();
    }
  }
}

// This breaks at Gen 2 when squirrels evolve pack behavior
// This breaks at Gen 3 when tools emerge
// This breaks at Gen 4 when buildings appear
// We have to rewrite it EVERY generation
```

### We Provide Archetypes + Yuka Decides

```typescript
// RIGHT: Archetype + Yuka systems
const squirrelArchetype = {
  traits: {
    locomotion: 'cursorial',  // Can run/climb
    foraging: 'arboreal',     // Prefers trees
    social: 'solitary',       // Doesn't form packs
    excavation: 0.2,          // Weak digging
    maxReach: 50,             // Can reach 50m depth
  },
  
  needs: {
    energy: { min: 0, max: 100, decay: 1.0 },
    rest: { min: 0, max: 100, decay: 0.5 },
  },
  
  capabilities: {
    canClimb: true,
    canSwim: false,
    canDig: true,
    canCooperate: false,
  }
};

// Yuka builds goal hierarchy from archetype
class SquirrelGoalFactory {
  static createGoals(archetype: Archetype): CompositeGoal {
    const brain = new CompositeGoal();
    
    // Energy goal
    brain.addSubgoal(new ManageEnergyGoal({
      threshold: 0.3,
      foraging: archetype.traits.foraging,
      excavation: archetype.traits.excavation,
      maxReach: archetype.traits.maxReach,
    }));
    
    // Rest goal
    brain.addSubgoal(new ManageRestGoal({
      threshold: 0.2,
      restRate: 10,
    }));
    
    // Survival goal
    brain.addSubgoal(new SurvivalGoal({
      flee: true,
      visionRange: 100,
    }));
    
    return brain;
  }
}

// Now Yuka ALWAYS knows what to do:
const squirrel = new Creature(squirrelArchetype);
const brain = SquirrelGoalFactory.createGoals(squirrelArchetype);

brain.update(squirrel, planet, deltaTime);

// "What should this squirrel do next?"
// Yuka evaluates ALL goals, picks highest priority
```

---

## The Decision Chain

### 1. Archetype Defines Capabilities

```typescript
const archetype = {
  traits: {
    locomotion: 'cursorial',
    foraging: 'arboreal',
    excavation: 0.2,
    maxReach: 50,
  }
};
```

**"I am a creature that can run, climb trees, dig weakly, and reach 50m depth."**

### 2. Goals Are Built From Capabilities

```typescript
class ManageEnergyGoal extends CompositeGoal {
  constructor(params: { foraging: string, excavation: number, maxReach: number }) {
    super();
    
    if (params.foraging === 'arboreal') {
      this.addSubgoal(new FindTreesGoal());
    } else if (params.foraging === 'littoral') {
      this.addSubgoal(new FindWaterGoal());
    }
    
    this.addSubgoal(new ExcavateMaterialGoal({
      excavation: params.excavation,
      maxReach: params.maxReach,
    }));
  }
}
```

**"Based on my archetype, I should look for trees AND dig for materials."**

### 3. Goals Query Environment

```typescript
class FindTreesGoal extends Goal {
  calculateDesirability(creature: Creature, planet: Planet): number {
    // Query mesh for nearby tree nodes
    const currentNode = planet.navGraph.getNodeAt(creature.position);
    const nearbyNodes = planet.navGraph.getNeighborsWithin(currentNode, 1000);
    
    // Filter for arboreal materials
    const treeNodes = nearbyNodes.filter(n => 
      n.materials.some(m => m.type === 'wood' || m.type === 'vegetation')
    );
    
    if (treeNodes.length > 0) {
      return 1.0;  // Trees nearby!
    } else {
      return 0.0;  // No trees, try something else
    }
  }
}
```

**"I query the mesh. There ARE trees nearby. This goal is desirable."**

### 4. Goals Execute Actions

```typescript
class FindTreesGoal extends Goal {
  execute(creature: Creature, planet: Planet, deltaTime: number) {
    // Find nearest tree
    const currentNode = planet.navGraph.getNodeAt(creature.position);
    const treeNodes = planet.navGraph.getNeighborsWithin(currentNode, 1000)
      .filter(n => n.materials.some(m => m.type === 'wood'));
    
    const nearestTree = treeNodes[0];
    
    // Pathfind to tree
    const path = planet.navGraph.pathfind(currentNode, nearestTree);
    
    // Move along path
    creature.followPath(path, deltaTime);
    
    // Arrived?
    if (creature.position.distanceTo(nearestTree.position) < 1) {
      this.status = Goal.STATUS_COMPLETED;
      
      // Transition to harvesting
      this.transitionTo(new HarvestTreeGoal(nearestTree));
    }
  }
}
```

**"I pathfind to the tree. I move along the path. I arrive. I harvest."**

### 5. Environment Updates

```typescript
class HarvestTreeGoal extends Goal {
  execute(creature: Creature, planet: Planet, deltaTime: number) {
    // Query material at tree node
    const treeNode = this.targetNode;
    const woodMaterial = treeNode.materials.find(m => m.type === 'wood');
    
    if (!woodMaterial || woodMaterial.quantity === 0) {
      // Tree depleted!
      this.status = Goal.STATUS_FAILED;
      return;
    }
    
    // Harvest wood
    const harvestAmount = creature.traits.excavation * deltaTime * 10;
    woodMaterial.quantity -= harvestAmount;
    
    // Gain energy
    creature.energy += harvestAmount * woodMaterial.nutritionalValue;
    
    if (creature.energy >= creature.maxEnergy) {
      this.status = Goal.STATUS_COMPLETED;
    }
  }
}
```

**"I harvest wood. I gain energy. The tree depletes. I'm full."**

---

## At EVERY Generation, This Works

### Gen 0: Planet Formation
- **Archetype:** N/A (no creatures yet)
- **Yuka:** Accretion simulation (CohesionBehavior for gravity)
- **Question:** "Where should this asteroid go next?" → Towards mass center
- **Answer:** ✓ Yuka pathfinding with gravitational attraction

### Gen 1: Individual Creatures
- **Archetype:** Cursorial Forager, Littoral Harvester, Burrow Engineer, Arboreal Opportunist
- **Yuka:** Goal hierarchy (ManageEnergy, ManageRest, Survival)
- **Question:** "What should this squirrel do next?" → Find food or rest
- **Answer:** ✓ Yuka evaluates goals, queries mesh, pathfinds to food

### Gen 2: Pack Formation
- **Archetype:** Same, but some archetypes have `social: 'pack'`
- **Yuka:** Adds PackFormationGoal to goal hierarchy
- **Question:** "What should this wolf do next?" → Join/maintain pack
- **Answer:** ✓ Yuka evaluates pack proximity, uses flocking behaviors (Cohesion, Separation, Alignment)

### Gen 3: Tool Emergence
- **Archetype:** Same
- **Yuka:** FuzzyModule evaluates material pressure → tools emerge
- **Question:** "What should this squirrel do next?" → Use tool to reach deeper materials
- **Answer:** ✓ Yuka adds ToolUseGoal, queries tool inventory, uses tool to boost excavation

### Gen 4: Tribal Dynamics
- **Archetype:** Same, but packs → tribes
- **Yuka:** TribeGoal (territory, cooperation, resource sharing)
- **Question:** "What should this squirrel do next?" → Contribute to tribe goals
- **Answer:** ✓ Yuka evaluates tribe needs via MessageDispatcher, cooperates on tribe projects

### Gen 5: Building Construction
- **Archetype:** Same
- **Yuka:** BuildingGoal (design, gather materials, construct)
- **Question:** "What should this squirrel do next?" → Help build shelter
- **Answer:** ✓ Yuka pathfinds to building site, deposits materials, tracks construction progress

### Gen 6: Religion & Democracy
- **Archetype:** Same
- **Yuka:** BeliefGoal, GovernanceGoal
- **Question:** "What should this squirrel do next?" → Vote, worship, follow laws
- **Answer:** ✓ Yuka evaluates belief systems via FuzzyModule, follows tribal governance rules

---

## The Contract at Every Level

```typescript
// ALWAYS:

function whatShouldCreatureDoNext(
  creature: Creature,
  planet: Planet,
  generationffffffff: number
): Action {
  // 1. Query environment
  const currentNode = planet.navGraph.getNodeAt(creature.position);
  const materials = currentNode.materials;
  const neighbors = planet.navGraph.getNeighbors(currentNode);
  
  // 2. Evaluate ALL goals from archetype
  const goals = creature.brain.subgoals;  // Built from archetype
  
  for (const goal of goals) {
    goal.desirability = goal.calculateDesirability(creature, planet);
  }
  
  // 3. Pick highest priority goal
  goals.sort((a, b) => b.desirability - a.desirability);
  const activeGoal = goals[0];
  
  // 4. Execute goal
  activeGoal.execute(creature, planet, deltaTime);
  
  // 5. Return action
  return activeGoal.currentAction;
}

// This MUST return a valid action at ANY generation
// If it returns undefined → WE BROKE THE CONTRACT
```

---

## What Breaks The Contract

### ❌ Missing Environment Data

```typescript
// Creature wants to find food
const goal = new FindFoodGoal();

// Queries environment
const materials = planet.getMaterialsAt(creature.position);

// Returns: undefined (no data!)

// Yuka: "I don't know what to do. No materials here?"
// Contract BROKEN
```

**Fix:** Accretion ensures EVERY coordinate has material data.

### ❌ Missing Goal Evaluator

```typescript
// Gen 3: Tools emerge
const tool = new Tool('stick', { excavation: +0.3 });

// Creature has tool in inventory
creature.inventory.add(tool);

// But NO ToolUseGoal in goal hierarchy!

// Yuka: "I have this thing but I don't know what to do with it"
// Contract BROKEN
```

**Fix:** Goal hierarchy must expand at Gen 3 to include ToolUseGoal.

### ❌ Missing Pathfinding

```typescript
// Creature wants to reach food
const goal = new MoveToFoodGoal(foodPosition);

// Tries to pathfind
const path = planet.navGraph.pathfind(creature.position, foodPosition);

// Returns: [] (no path!)

// Yuka: "I can't get there. Stuck."
// Contract BROKEN
```

**Fix:** Navigation mesh must be fully connected (or goal fails gracefully and tries alternative).

### ❌ Missing State Transition

```typescript
// Creature FSM in "foraging" state
const fsm = creature.stateMachine;
fsm.currentState = 'foraging';

// Energy drops to 0
creature.energy = 0;

// But NO transition rule from "foraging" to "resting"!

// Yuka: "I'm exhausted but I can't stop foraging"
// Contract BROKEN
```

**Fix:** FSM must have transitions for ALL state combinations.

---

## How We Ensure The Contract Holds

### 1. Comprehensive Archetypes

Every archetype MUST define:
- Traits (locomotion, foraging, social, excavation, maxReach)
- Needs (energy, rest, reproduction)
- Capabilities (canClimb, canSwim, canDig, canCooperate)

**No gaps.**

### 2. Complete Goal Hierarchy

Goal factory MUST create goals for:
- Energy management
- Rest management
- Survival (flee from threats)
- Exploration (wander)
- Social (pack/tribe if capable)
- Tool use (if generation >= 3)
- Building (if generation >= 5)
- Governance (if generation >= 6)

**No missing goals.**

### 3. Queryable Environment

Planet MUST provide:
- Material data at EVERY coordinate
- Navigation mesh with pathfinding
- Neighbor queries
- Line-of-sight raycasting
- Terrain cost calculation

**No undefined queries.**

### 4. Complete State Machines

FSM MUST have transitions for:
- Idle → Foraging (when hungry)
- Foraging → Resting (when tired)
- Resting → Idle (when rested)
- Any → Fleeing (when threatened)
- Fleeing → Idle (when safe)

**No stuck states.**

### 5. Graceful Failures

When goal cannot be achieved:

```typescript
class FindFoodGoal extends Goal {
  execute(creature: Creature, planet: Planet, deltaTime: number) {
    const path = planet.navGraph.pathfind(creature.position, foodPosition);
    
    if (path.length === 0) {
      // Can't reach food!
      this.status = Goal.STATUS_FAILED;
      
      // Fallback: try different food source
      this.transitionTo(new ExploreGoal());
      
      return;
    }
    
    // ... normal execution
  }
}
```

**Goals fail gracefully and transition to fallback.**

---

## Testing The Contract

```typescript
// Test: Can Yuka decide at Gen 1?
const squirrel = new Creature(CURSORIAL_FORAGER);
const planet = generatePlanet('seed123');

for (let cycle = 0; cycle < 1000; cycle++) {
  const action = whatShouldCreatureDoNext(squirrel, planet, 1);
  
  if (action === undefined) {
    throw new Error(`Contract broken at Gen 1, cycle ${cycle}`);
  }
}

// Test: Can Yuka decide at Gen 3?
const squirrelWithTool = new Creature(CURSORIAL_FORAGER);
squirrelWithTool.inventory.add(new Tool('stick', { excavation: +0.3 }));

for (let cycle = 0; cycle < 1000; cycle++) {
  const action = whatShouldCreatureDoNext(squirrelWithTool, planet, 3);
  
  if (action === undefined) {
    throw new Error(`Contract broken at Gen 3, cycle ${cycle}`);
  }
}

// Test: Can Yuka decide at Gen 6?
const tribalSquirrel = new Creature(CURSORIAL_FORAGER);
tribalSquirrel.tribe = tribe1;

for (let cycle = 0; cycle < 1000; cycle++) {
  const action = whatShouldCreatureDoNext(tribalSquirrel, planet, 6);
  
  if (action === undefined) {
    throw new Error(`Contract broken at Gen 6, cycle ${cycle}`);
  }
}
```

**If tests pass → Contract holds → Yuka always knows what to do.**

---

## Summary

**The Fundamental Contract:**

At ANY generation, for ANY creature, Yuka MUST answer:

**"What should this squirrel do next?"**

**How:**
1. Archetype defines capabilities
2. Goal hierarchy built from archetype
3. Goals query environment (mesh + materials)
4. Goals evaluate desirability
5. Highest priority goal executes
6. Action taken
7. Environment updates
8. Repeat

**Requirements:**
- Complete archetypes (no missing traits)
- Complete goal hierarchy (no missing goals)
- Queryable environment (no undefined data)
- Connected navigation mesh (no unreachable areas)
- Complete state machines (no stuck states)
- Graceful failures (fallback goals)

**If ANY of these missing → Contract BROKEN → Yuka stuck.**

**We provide archetypes.**

**Yuka builds systems.**

**Systems ALWAYS provide an answer.**

**That's the contract.**
