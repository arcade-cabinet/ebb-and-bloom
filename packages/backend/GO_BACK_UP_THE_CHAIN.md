# GO BACK UP THE CHAIN: FORWARD RECONSTRUCTION

## The Reverse Process

You can trace BACKWARDS to understand **what the squirrel used to be**.

Now trace FORWARDS to understand **how to be a squirrel again**.

---

## The Fundamental Loop

```
BACKWARD (What was I?)
Squirrel → Limestone → Ocean → Comet → Dust → Supernova

FORWARD (How do I rebuild?)
Supernova → Dust → Comet → Ocean → Limestone → Squirrel
                                      ↑            ↓
                                      ←────────────
                                    (death/reproduction)
```

**The squirrel is a TEMPORARY ORGANIZATION of materials.**

**It will DISORGANIZE (die).**

**To stay organized (alive), it must CONTINUOUSLY REBUILD.**

**To create new organization (reproduce), it must REORGANIZE materials into offspring.**

---

## Death: Going DOWN The Chain (Disorganization)

### Squirrel Dies

```typescript
// Cycle 2500: Squirrel dies
const deadSquirrel = {
  id: 'sq-001',
  status: 'dead',
  cycle: 2500,
  
  // What it WAS
  composition: {
    carbon: 3.5,
    calcium: 0.6,
    iron: 0.15,
    water: 3.0,
    nitrogen: 0.8,
    phosphorus: 0.3
  }
};

// Decomposition: Organization → Disorganization
function decompose(deadCreature: Creature, planet: Planet) {
  const location = deadCreature.position;
  
  // Return materials to environment
  for (const [material, amount] of Object.entries(deadCreature.composition)) {
    // Add material back to coordinate
    planet.addMaterial(location, material, amount);
  }
  
  // Now those materials are available for OTHER creatures
}

// Result:
planet.queryCoordinate(45, 120).materials
// Returns:
{
  limestone: { quantity: 1000 + 0.6 },  // Calcium returned
  iron_ore: { quantity: 500 + 0.15 },   // Iron returned
  organic_matter: { quantity: 100 + 3.5 },  // Carbon returned
  // Squirrel is GONE
  // But materials PERSIST
}
```

**Squirrel → Materials.**

**Organization → Disorganization.**

**Complex → Simple.**

**DOWN the chain.**

---

## Life: Going UP The Chain (Reorganization)

### New Squirrel Needs To Figure Out How To Be A Squirrel

```typescript
// Cycle 2600: New squirrel born
const newSquirrel = {
  id: 'sq-002',
  status: 'alive',
  cycle: 2600,
  age: 0,
  
  // Born with MINIMAL composition (from parent)
  composition: {
    carbon: 0.1,      // Tiny
    calcium: 0.01,    // Tiny
    iron: 0.001,      // Tiny
    water: 0.05,      // Tiny
    totalMass: 0.2    // 200g baby squirrel
  },
  
  // NEEDS to become a full squirrel
  targetComposition: {
    carbon: 3.5,      // NEEDS +3.4
    calcium: 0.6,     // NEEDS +0.59
    iron: 0.15,       // NEEDS +0.149
    water: 3.0,       // NEEDS +2.95
    totalMass: 7.5    // NEEDS to grow to 7.5kg
  }
};
```

**Baby squirrel is 200g.**

**Adult squirrel is 7.5kg.**

**NEEDS to gain 7.3kg of materials.**

**HOW?**

**Go UP the chain.**

---

## The Reconstruction Process

### Step 1: Yuka Evaluates Current State

```typescript
// Yuka queries: What do I need?
const needs = deriveNeeds(newSquirrel);

// Returns:
[
  {
    material: 'carbon',
    current: 0.1,
    target: 3.5,
    deficit: 3.4,  // URGENT
    sources: ['vegetation', 'wood', 'meat', 'organic_matter']
  },
  {
    material: 'calcium',
    current: 0.01,
    target: 0.6,
    deficit: 0.59,  // URGENT
    sources: ['limestone', 'bone']
  },
  {
    material: 'water',
    current: 0.05,
    target: 3.0,
    deficit: 2.95,  // URGENT
    sources: ['water', 'vegetation']
  }
]
```

**Yuka KNOWS what it needs.**

**Carbon, calcium, water.**

**3.4kg, 0.59kg, 2.95kg.**

---

### Step 2: Yuka Queries Environment

```typescript
// Query: Where can I get carbon?
const carbonSources = planet.navGraph.queryMaterialsWithin(
  newSquirrel.position,
  radius: 5000,
  material: ['vegetation', 'wood', 'organic_matter']
);

// Returns:
[
  {
    coordinate: { lat: 45, lon: 120 },
    material: 'vegetation',
    quantity: 500,
    depth: 0,  // Surface (accessible!)
    hardness: 1.0,  // Soft
    distance: 100  // meters away
  },
  {
    coordinate: { lat: 45, lon: 120 },
    material: 'organic_matter',  // FROM DEAD SQUIRREL!
    quantity: 3.5,
    depth: 0,
    hardness: 0.5,  // Very soft
    distance: 100
  }
]
```

**Yuka finds ORGANIC MATTER at (45, 120).**

**That's the DEAD SQUIRREL from earlier!**

**The old squirrel's carbon is AVAILABLE.**

---

### Step 3: Yuka Creates Goal

```typescript
// Goal: Consume carbon to grow
const goal = new ConsumeForGrowthGoal({
  material: 'carbon',
  target: 3.5,
  current: 0.1,
  source: {
    coordinate: { lat: 45, lon: 120 },
    material: 'organic_matter',
    available: 3.5
  }
});

// Desirability calculation
goal.calculateDesirability = () => {
  const deficit = 3.4 / 3.5;  // 97% deficit!
  return deficit;  // 0.97 (EXTREMELY HIGH)
};
```

**Goal: Eat the dead squirrel's remains.**

**Desirability: 0.97 (urgent!).**

---

### Step 4: Yuka Executes

```typescript
// Execute goal
goal.execute(newSquirrel, planet, deltaTime);

// Actions:
// 1. Pathfind to (45, 120)
const path = planet.navGraph.pathfind(newSquirrel.position, { lat: 45, lon: 120 });

// 2. Move along path
newSquirrel.followPath(path);

// 3. Arrived! Consume material
const consumed = planet.consumeMaterial({ lat: 45, lon: 120 }, 'organic_matter', 0.5);

// 4. Add to composition
newSquirrel.composition.carbon += consumed;  // 0.1 → 0.6

// 5. Update mass
newSquirrel.totalMass += consumed;  // 0.2 → 0.7 kg

// 6. Recalculate needs
const newNeeds = deriveNeeds(newSquirrel);
// Carbon deficit: 3.4 → 2.9 (progress!)
```

**Squirrel ATE the dead squirrel's carbon.**

**Reorganized it into its own body.**

**Growing UP the chain.**

---

### Step 5: Repeat For ALL Materials

```typescript
// Cycle 2601: Need calcium
goal = new ConsumeForGrowthGoal({
  material: 'calcium',
  target: 0.6,
  current: 0.01,
  source: { material: 'limestone', coordinate: { lat: 45, lon: 120 } }
});

// Execute: Eat limestone
newSquirrel.composition.calcium += 0.05;  // 0.01 → 0.06

// Cycle 2610: Need more carbon
goal = new ConsumeForGrowthGoal({
  material: 'carbon',
  target: 3.5,
  current: 0.6,
  source: { material: 'vegetation', coordinate: { lat: 45, lon: 121 } }
});

// Execute: Eat vegetation
newSquirrel.composition.carbon += 0.5;  // 0.6 → 1.1

// ... continues for 500 cycles ...

// Cycle 3100: Reached adult composition!
newSquirrel.composition = {
  carbon: 3.5,
  calcium: 0.6,
  iron: 0.15,
  water: 3.0,
  totalMass: 7.5
};

newSquirrel.status = 'adult';
```

**Over 500 cycles, squirrel consumed materials.**

**Reorganized them from environment into body.**

**Climbed UP the chain.**

**BECAME A SQUIRREL.**

---

## The Continuous Loop

### Even Adult Squirrels Must Maintain Organization

```typescript
// Adult squirrel (Cycle 3200)
const adultSquirrel = {
  composition: {
    carbon: 3.5,
    calcium: 0.6,
    iron: 0.15,
    water: 3.0
  }
};

// But materials DEPLETE
// Cycle 3201: Moved 1000m on granite
adultSquirrel.composition.carbon -= 0.3;  // Burned for energy
// 3.5 → 3.2

// Cycle 3210: More movement
adultSquirrel.composition.carbon -= 0.5;
// 3.2 → 2.7

// Cycle 3220: Carbon critically low!
adultSquirrel.composition.carbon = 1.0;  // DEFICIT!

// Yuka evaluates: I'm LOSING organization
const deficit = 3.5 - 1.0;  // Need 2.5kg carbon URGENTLY

// Goal: Restore carbon
const goal = new ConsumeForMaintenanceGoal({
  material: 'carbon',
  current: 1.0,
  target: 3.5,
  deficit: 2.5
});

// Execute: Find vegetation, consume it
planet.consumeMaterial(...);
adultSquirrel.composition.carbon += 2.5;
// 1.0 → 3.5 (restored!)
```

**Organization constantly DEGRADES.**

**Movement costs carbon.**

**Squirrel must continuously CLIMB UP to maintain organization.**

**This is BEING A SQUIRREL.**

---

## Reproduction: Creating New Organization

### When To Reproduce?

```typescript
// Yuka evaluates: Should I reproduce?
const fuzzy = new ReproductionFuzzy();

// Inputs
fuzzy.setValue('composition_surplus', (currentMass - targetMass) / targetMass);
// If squirrel has EXCESS materials (stored fat), reproduction is feasible

fuzzy.setValue('resource_availability', planet.queryResourceDensity(squirrel.position));
// If environment is RICH, offspring will survive

fuzzy.setValue('age', squirrel.age);
// If squirrel is MATURE, reproduction is desirable

fuzzy.defuzzify('reproduction_desirability');

const desirability = fuzzy.getValue('reproduction_desirability');

if (desirability > 0.7) {
  // Reproduce!
  const offspring = reproduce(squirrel);
}
```

### How To Reproduce?

```typescript
function reproduce(parent: Creature): Creature {
  // REORGANIZE parent's materials into offspring
  
  const offspringComposition = {
    carbon: 0.1,      // Take from parent
    calcium: 0.01,    // Take from parent
    iron: 0.001,      // Take from parent
    water: 0.05,      // Take from parent
    totalMass: 0.2
  };
  
  // DEDUCT from parent
  parent.composition.carbon -= 0.1;
  parent.composition.calcium -= 0.01;
  parent.composition.iron -= 0.001;
  parent.composition.water -= 0.05;
  parent.totalMass -= 0.2;
  
  // CREATE offspring
  const offspring = new Creature({
    archetype: parent.archetype,
    composition: offspringComposition,
    position: parent.position,
    born: currentCycle,
    parent: parent.id
  });
  
  // Offspring now needs to figure out how to be a squirrel
  // By going UP the chain (consuming materials)
  
  return offspring;
}
```

**Parent GIVES materials to offspring.**

**Offspring starts with MINIMAL organization.**

**Offspring must CLIMB UP the chain to become full squirrel.**

**Parent must CLIMB UP to restore materials.**

**The cycle continues.**

---

## The Complete Cycle

```
DEATH (DOWN the chain):
Adult Squirrel (7.5kg) → Dies → Decomposes
  ↓
Organic Matter (3.5kg carbon, 0.6kg calcium, etc.) → Returns to environment
  ↓
Materials available at coordinate (45, 120)

BIRTH (UP the chain):
Materials at coordinate (45, 120)
  ↓
Baby Squirrel (0.2kg) → Born with minimal composition
  ↓
Yuka evaluates: "I need 7.3kg more materials"
  ↓
Yuka queries: "Where can I find carbon/calcium/water?"
  ↓
Yuka finds: Organic matter (from dead squirrel) + vegetation + limestone
  ↓
Yuka creates goals: ConsumeForGrowthGoal
  ↓
Yuka executes: Pathfind → Move → Consume → Reorganize
  ↓
Over 500 cycles: 0.2kg → 7.5kg
  ↓
Adult Squirrel (7.5kg) → "Figured out how to be a squirrel"

MAINTENANCE (UP the chain continuously):
Adult Squirrel → Moves/Digs → Materials deplete
  ↓
Yuka evaluates: "I'm losing organization"
  ↓
Yuka creates goals: ConsumeForMaintenanceGoal
  ↓
Yuka executes: Find food → Consume → Restore
  ↓
Organization maintained → "Still a squirrel"

REPRODUCTION (Creating new UP chain):
Adult Squirrel → Has surplus materials
  ↓
Yuka evaluates: "Should I reproduce?"
  ↓
Fuzzy logic: "Yes (resources abundant, I'm mature)"
  ↓
Reorganize materials → Create offspring (0.2kg)
  ↓
Offspring must climb UP to become squirrel
  ↓
Cycle repeats
```

---

## Yuka's Role: Figuring Out How To Be A Squirrel

### The Challenge

**Squirrel is NOT a permanent object.**

**Squirrel is a PROCESS of maintaining organization.**

**If Yuka stops, squirrel DIES (goes DOWN the chain).**

**Yuka must continuously execute goals to CLIMB UP.**

### The Goals

```typescript
class FigureOutHowToBeASquirrelGoal extends CompositeGoal {
  update(squirrel: Creature, planet: Planet, deltaTime: number) {
    // 1. Evaluate current composition
    const needs = this.evaluateNeeds(squirrel);
    
    // 2. For each deficit, create goal
    for (const need of needs) {
      if (need.deficit > 0.1) {
        // Need material!
        this.addSubgoal(new ObtainMaterialGoal(need));
      }
    }
    
    // 3. Evaluate reproduction possibility
    if (this.shouldReproduce(squirrel, planet)) {
      this.addSubgoal(new ReproduceGoal());
    }
    
    // 4. Evaluate survival threats
    if (this.isThreatened(squirrel, planet)) {
      this.addSubgoal(new SurvivalGoal());
    }
    
    // 5. Execute highest priority subgoal
    this.subgoals.sort((a, b) => b.desirability - a.desirability);
    this.subgoals[0].execute(squirrel, planet, deltaTime);
  }
  
  evaluateNeeds(squirrel: Creature): Need[] {
    const needs: Need[] = [];
    
    for (const [material, target] of Object.entries(squirrel.targetComposition)) {
      const current = squirrel.composition[material];
      const deficit = target - current;
      
      if (deficit > 0) {
        needs.push({
          material,
          current,
          target,
          deficit,
          urgency: deficit / target,
          sources: this.getMaterialSources(material)
        });
      }
    }
    
    return needs;
  }
}
```

**Yuka FIGURES IT OUT.**

**Query needs → Query environment → Create goals → Execute.**

**Climb UP the chain.**

**Maintain organization.**

**BE A SQUIRREL.**

---

## API: Trace Forward (How To Rebuild)

```typescript
POST /api/game/:id/trace-rebuild

Body: {
  subject: 'creature',
  id: 'sq-002',
  targetComposition: {
    carbon: 3.5,
    calcium: 0.6,
    iron: 0.15
  }
}

Response: {
  currentComposition: {
    carbon: 1.0,
    calcium: 0.1,
    iron: 0.02
  },
  
  deficits: [
    {
      material: 'carbon',
      current: 1.0,
      target: 3.5,
      deficit: 2.5,
      urgency: 0.71  // 71% deficit
    },
    {
      material: 'calcium',
      current: 0.1,
      target: 0.6,
      deficit: 0.5,
      urgency: 0.83  // 83% deficit
    }
  ],
  
  sources: [
    {
      material: 'carbon',
      coordinate: { lat: 45, lon: 120 },
      type: 'organic_matter',
      available: 3.5,
      distance: 100,
      cost: 10,  // energy to reach
      feasible: true
    },
    {
      material: 'calcium',
      coordinate: { lat: 45, lon: 120 },
      type: 'limestone',
      available: 1000,
      distance: 100,
      cost: 10,
      feasible: true
    }
  ],
  
  rebuildPlan: [
    {
      step: 1,
      action: 'consume',
      material: 'carbon',
      source: { lat: 45, lon: 120, type: 'organic_matter' },
      amount: 2.5,
      cycles: 50,
      result: { carbon: 1.0 → 3.5 }
    },
    {
      step: 2,
      action: 'consume',
      material: 'calcium',
      source: { lat: 45, lon: 120, type: 'limestone' },
      amount: 0.5,
      cycles: 25,
      result: { calcium: 0.1 → 0.6 }
    }
  ],
  
  summary: "To rebuild to target composition, consume 2.5kg carbon (organic_matter at 45,120) and 0.5kg calcium (limestone at 45,120). Estimated 75 cycles."
}
```

**ONE API CALL TO GET THE REBUILD PLAN.**

**Yuka uses this to CREATE GOALS.**

---

## Summary

**DOWN the chain (death):**
- Squirrel → Materials
- Organization → Disorganization
- Complex → Simple

**UP the chain (life):**
- Materials → Squirrel
- Disorganization → Organization
- Simple → Complex

**The Process:**
1. Baby squirrel born with MINIMAL composition (0.2kg)
2. Yuka evaluates: "I need 7.3kg more materials to be a squirrel"
3. Yuka queries: "Where are carbon, calcium, water?"
4. Yuka creates goals: ConsumeForGrowthGoal
5. Yuka executes: Pathfind → Move → Consume → Reorganize
6. Over 500 cycles: Materials → Squirrel (0.2kg → 7.5kg)
7. Squirrel "figured out how to be a squirrel"

**Continuous maintenance:**
- Materials deplete (movement, activity)
- Yuka detects: "Losing organization"
- Yuka executes: Consume more materials
- Organization maintained: "Still a squirrel"

**Reproduction:**
- Reorganize parent's materials → offspring
- Offspring climbs UP the chain
- Parent climbs UP to restore
- Cycle continues

**The Fundamental Truth:**

**A squirrel isn't a thing.**

**A squirrel is a PROCESS.**

**The process of CLIMBING UP THE CHAIN.**

**Continuously reorganizing materials to maintain organization.**

**Yuka figures out HOW by querying, evaluating, and executing.**

**That's what it means to "figure out how to be a squirrel again."**
