# SELF-SUSTAINING LOGIC: YUKA BUILDS ON ITSELF

## The Critical Transition Point

There's a moment early in the simulation where **we stop driving and Yuka takes over**.

We provide:
- Archetypes (Gen 1)
- Environment (Gen 0 accretion)
- Yuka systems (Goals, Fuzzy, FSM, MessageDispatcher)

Then **we step back**.

From that point forward, **Yuka's logic builds on its own logic**.

Tools don't emerge because we scripted them.

**Tools emerge because Yuka detected pressure and decided they were necessary.**

Tribes don't form because we programmed tribe formation at Gen 4.

**Tribes form because Yuka evaluated cooperation and found it beneficial.**

Religion doesn't appear because we hardcoded belief systems.

**Religion emerges because Yuka recognized patterns in the unknown and created explanatory frameworks.**

---

## What We Provide (The Foundation)

### 1. Archetypes

```typescript
const CURSORIAL_FORAGER = {
  traits: {
    locomotion: 'cursorial',
    foraging: 'surface',
    social: 'solitary',
    excavation: 0.2,
    maxReach: 50,
  },
  needs: {
    energy: { min: 0, max: 100, decay: 1.0 },
    rest: { min: 0, max: 100, decay: 0.5 },
  },
  capabilities: {
    canClimb: false,
    canSwim: false,
    canDig: true,
    canCooperate: false,  // Not yet
  }
};
```

**We define WHAT creatures can do initially.**

**We do NOT define what they will become.**

### 2. Environment

```typescript
// Accretion simulation generates planet
const planet = await AccretionAPI.simulate({
  seed: 'game123',
  stellarSystem: { /* physics-based */ },
  debrisField: { /* realistic composition */ }
});

// Result: Real materials at real depths
planet.queryCoordinate(45, 120);
// Returns: {
//   limestone: { depth: 0, hardness: 3.0, quantity: 1000 },
//   basalt: { depth: 50, hardness: 6.0, quantity: 5000 },
//   iron: { depth: 6371000, hardness: 8.0, quantity: 1000000 }
// }
```

**We provide REAL constraints.**

**We do NOT script how creatures respond.**

### 3. Yuka Systems

```typescript
// Goal hierarchy
const brain = new CompositeGoal();
brain.addSubgoal(new ManageEnergyGoal());
brain.addSubgoal(new ManageRestGoal());
brain.addSubgoal(new SurvivalGoal());

// Fuzzy logic
const fuzzy = new FuzzyModule();
fuzzy.addFLV('material_pressure', 0, 1);
fuzzy.addFLV('tool_desirability', 0, 1);
fuzzy.addRule('IF pressure IS high THEN tool_desirability IS high');

// State machine
const fsm = new StateMachine();
fsm.addState('idle', new IdleState());
fsm.addState('foraging', new ForagingState());
fsm.addTransition('idle', 'foraging', 'hungry');
```

**We provide the RULES for decision-making.**

**We do NOT decide FOR them.**

---

## What Yuka Does (Self-Sustaining)

### Gen 1: Yuka Explores

```typescript
// We DON'T script:
const squirrel = new Creature(CURSORIAL_FORAGER);
squirrel.position = { lat: 45, lon: 120 };

// Yuka DECIDES:
const brain = squirrel.brain;

// Cycle 1
brain.update(squirrel, planet, deltaTime);
// Evaluates: energy = 80, rest = 90
// Decision: Wander (explore)
// Action: Move to (45.1, 120.2)

// Cycle 10
brain.update(squirrel, planet, deltaTime);
// Evaluates: energy = 30, rest = 90
// Decision: Find food (urgent)
// Action: Query materials, pathfind to limestone

// Cycle 15
brain.update(squirrel, planet, deltaTime);
// Evaluates: energy = 95, rest = 20
// Decision: Rest (tired)
// Action: Find shelter, sleep

// Cycle 100
brain.update(squirrel, planet, deltaTime);
// Evaluates: All needs met
// Decision: Explore (curiosity)
// Action: Move to new coordinate
```

**We never said "wander then find food then rest".**

**Yuka evaluated priorities and decided.**

---

### Gen 2: Yuka Forms Packs (Emergent)

```typescript
// We DON'T script pack formation

// Yuka DETECTS opportunity:
const fuzzy = new PackFormationFuzzy();

// Cycle 500: Two squirrels nearby
fuzzy.setValue('nearby_creatures', 2);
fuzzy.setValue('resources_available', 0.4);  // Moderate scarcity
fuzzy.defuzzify('pack_desirability');

const desirability = fuzzy.getValue('pack_desirability');
// Returns: 0.7 (high)

// Yuka DECIDES to form pack
if (desirability > 0.6) {
  const pack = new Pack([squirrel1, squirrel2]);
  
  // Add flocking behaviors
  squirrel1.steering.add(new CohesionBehavior([squirrel1, squirrel2]));
  squirrel2.steering.add(new CohesionBehavior([squirrel1, squirrel2]));
  
  // Now they move together
}

// Cycle 600: Pack encounters more creatures
if (pack.members.length < 5 && nearbyCreatures.length > 0) {
  // Yuka evaluates: Should we grow pack?
  fuzzy.setValue('pack_size', pack.members.length);
  fuzzy.setValue('nearby_creatures', nearbyCreatures.length);
  fuzzy.defuzzify('recruitment_desirability');
  
  if (fuzzy.getValue('recruitment_desirability') > 0.5) {
    pack.recruit(nearbyCreatures[0]);
  }
}
```

**We provided FuzzyModule and proximity queries.**

**Yuka detected that packs were beneficial and formed them.**

**Emergent behavior.**

---

### Gen 3: Yuka Invents Tools (Emergent)

```typescript
// We DON'T script tool creation

// Yuka DETECTS pressure:
const fuzzy = new ToolEmergenceFuzzy();

// Query all coordinates
const allCoords = planet.navGraph.getAllNodes();
let accessible = 0;
let inaccessible = 0;

for (const coord of allCoords) {
  for (const material of coord.materials) {
    const canReach = material.depth <= squirrel.maxReach &&
                     material.hardness <= squirrel.maxHardness;
    
    if (canReach) accessible++;
    else inaccessible++;
  }
}

const materialPressure = inaccessible / (accessible + inaccessible);
// Returns: 0.71 (71% of materials are unreachable!)

// Yuka EVALUATES
fuzzy.setValue('material_pressure', materialPressure);
fuzzy.setValue('creature_capability', squirrel.excavation);
fuzzy.defuzzify('tool_desirability');

const toolDesirability = fuzzy.getValue('tool_desirability');
// Returns: 0.85 (very high!)

// Yuka DECIDES to create tool
if (toolDesirability > 0.7) {
  const tool = new Tool('digging_stick', {
    excavation: +0.3,
    cost: 'wood',
    durability: 100,
  });
  
  squirrel.inventory.add(tool);
  
  // Now squirrel can reach deeper materials
  // maxReach: 50 → 50
  // excavation: 0.2 → 0.5 (with tool)
  // Can now harvest basalt at depth 50, hardness 6.0!
}
```

**We provided FuzzyModule and material queries.**

**Yuka detected that 71% of materials were unreachable.**

**Yuka decided tools were necessary.**

**Yuka created the tool.**

**Emergent technology.**

---

### Gen 4: Yuka Forms Tribes (Yuka Logic Building on Yuka Logic)

```typescript
// We DON'T script tribe formation

// Yuka's PREVIOUS logic (packs) feeds into NEW logic (tribes)

// Pack has existed for 1000 cycles
const pack = existingPack;

// Yuka DETECTS new pressure:
const fuzzy = new TribeFormationFuzzy();

// Pack is large
fuzzy.setValue('pack_size', pack.members.length);  // 12

// Resources are concentrated
const territoryNodes = planet.navGraph.getConnectedRegion(pack.position, 1000);
const resources = territoryNodes.reduce((sum, node) => 
  sum + node.materials.reduce((s, m) => s + m.quantity, 0), 0);

fuzzy.setValue('resource_density', resources / territoryNodes.length);

// Tool usage is common
const toolUsers = pack.members.filter(m => m.inventory.length > 0);
fuzzy.setValue('tool_adoption', toolUsers.length / pack.members.length);  // 0.8

// Yuka EVALUATES
fuzzy.defuzzify('tribe_desirability');

const tribeDesirability = fuzzy.getValue('tribe_desirability');
// Returns: 0.92 (very high!)

// Yuka DECIDES to form tribe
if (tribeDesirability > 0.8) {
  const tribe = new Tribe({
    members: pack.members,
    territory: territoryNodes,
    resources: new SharedResourcePool(),
  });
  
  // Add tribe-level goals to all members
  for (const member of tribe.members) {
    member.brain.addSubgoal(new TribeCooperationGoal(tribe));
  }
  
  // Now creatures coordinate via MessageDispatcher
  dispatcher.registerEntity(tribe);
}
```

**We provided FuzzyModule and pack data.**

**Yuka detected that packs were large enough to benefit from organization.**

**Yuka's PREVIOUS emergence (packs, tools) created CONDITIONS for NEW emergence (tribes).**

**Self-sustaining logic.**

---

### Gen 5: Yuka Builds Structures (Yuka Logic Building on Yuka Logic on Yuka Logic)

```typescript
// We DON'T script building construction

// Yuka's PREVIOUS logic (tribes, tools, territory) feeds into NEW logic (buildings)

// Tribe has existed for 2000 cycles
const tribe = existingTribe;

// Yuka DETECTS new pressure:
const fuzzy = new BuildingEmergenceFuzzy();

// Tribe is large
fuzzy.setValue('tribe_size', tribe.members.length);  // 50

// Resources are abundant but dispersed
const resourceNodes = tribe.territory.filter(n => 
  n.materials.some(m => m.quantity > 100)
);
fuzzy.setValue('resource_dispersion', resourceNodes.length / tribe.territory.length);

// Weather impacts survival (day/night cycles)
const cyclesSurvived = tribe.cycleCount;
const cyclesDied = tribe.deathCount;
fuzzy.setValue('survival_pressure', cyclesDied / cyclesSurvived);

// Yuka EVALUATES
fuzzy.defuzzify('building_desirability');

const buildingDesirability = fuzzy.getValue('building_desirability');
// Returns: 0.88 (very high!)

// Yuka DECIDES to build shelter
if (buildingDesirability > 0.8) {
  const building = new Building({
    type: 'shelter',
    location: tribe.center,
    materials_needed: {
      wood: 1000,
      stone: 500,
    },
    benefits: {
      rest_rate: +50,  // Faster rest
      survival_rate: +0.2,  // 20% better survival
    }
  });
  
  // Add building goal to tribe
  tribe.goals.add(new ConstructBuildingGoal(building));
  
  // Creatures now gather materials and deposit at building site
  for (const member of tribe.members) {
    member.brain.addSubgoal(new ContributeToBuildingGoal(building));
  }
}
```

**We provided FuzzyModule and tribe data.**

**Yuka detected that survival pressure was high.**

**Yuka's PREVIOUS emergence (tribes, tools, territory) created CONDITIONS for NEW emergence (buildings).**

**Yuka's logic built on Yuka's logic.**

---

### Gen 6: Yuka Creates Religion & Democracy (Pure Emergence)

```typescript
// We DEFINITELY DON'T script religion or governance

// Yuka's ENTIRE HISTORY feeds into this

// Tribe has faced multiple challenges
const tribe = existingTribe;

// Yuka DETECTS patterns:
const unknownEvents = [
  { type: 'comet_impact', understood: false, fear: 0.9 },
  { type: 'volcanic_eruption', understood: false, fear: 0.8 },
  { type: 'mass_extinction', understood: false, fear: 1.0 },
];

// Yuka creates EXPLANATORY FRAMEWORK
const fuzzy = new BeliefEmergenceFuzzy();

fuzzy.setValue('unknown_events', unknownEvents.length);
fuzzy.setValue('average_fear', unknownEvents.reduce((s, e) => s + e.fear, 0) / unknownEvents.length);
fuzzy.setValue('tribe_cohesion', tribe.cohesion);

fuzzy.defuzzify('belief_system_desirability');

const beliefDesirability = fuzzy.getValue('belief_system_desirability');
// Returns: 0.95 (extremely high!)

// Yuka CREATES BELIEF SYSTEM
if (beliefDesirability > 0.9) {
  const religion = new BeliefSystem({
    name: 'The Great Cycle',
    explanations: {
      'comet_impact': 'The Sky Gods are angry',
      'volcanic_eruption': 'The Earth Mother is speaking',
      'mass_extinction': 'The Cycle demands balance',
    },
    rituals: [
      { type: 'offering', frequency: 'daily', fearReduction: 0.3 },
      { type: 'prayer', frequency: 'before_action', fearReduction: 0.1 },
    ],
  });
  
  tribe.beliefSystem = religion;
  
  // Creatures now perform rituals
  for (const member of tribe.members) {
    member.brain.addSubgoal(new PerformRitualGoal(religion));
  }
}

// SIMULTANEOUSLY: Large tribe needs coordination
const fuzzy2 = new GovernanceEmergenceFuzzy();

fuzzy2.setValue('tribe_size', tribe.members.length);  // 200+
fuzzy2.setValue('resource_conflicts', tribe.conflicts.length);
fuzzy2.setValue('decision_complexity', tribe.decisions.length);

fuzzy2.defuzzify('governance_desirability');

const governanceDesirability = fuzzy2.getValue('governance_desirability');
// Returns: 0.91 (very high!)

// Yuka CREATES GOVERNANCE SYSTEM
if (governanceDesirability > 0.9) {
  const democracy = new GovernanceSystem({
    type: 'consensus',
    decisionMaking: (tribe, proposal) => {
      // Vote via MessageDispatcher
      const votes = [];
      
      for (const member of tribe.members) {
        const vote = member.evaluateProposal(proposal);
        votes.push(vote);
      }
      
      const approval = votes.filter(v => v > 0.5).length / votes.length;
      
      return approval > 0.6;  // 60% approval needed
    },
  });
  
  tribe.governance = democracy;
}
```

**We provided FuzzyModule and event history.**

**Yuka detected PATTERNS in unknown events.**

**Yuka created EXPLANATORY FRAMEWORKS (religion).**

**Yuka detected COORDINATION needs.**

**Yuka created DECISION SYSTEMS (democracy).**

**Pure emergence from Yuka's own accumulated logic.**

---

## The Feedback Loop

```
Gen 0: Accretion (Physics)
    ↓ produces
Gen 1: Materials at depths (Real constraints)
    ↓ creatures query
Yuka Goal Evaluation (Find food, avoid death)
    ↓ creates pressure
Gen 2: Pack Formation (Yuka detects cooperation benefits)
    ↓ creates new entity
Packs (Yuka's logic #1)
    ↓ + material scarcity pressure
Gen 3: Tool Emergence (Yuka detects unreachable materials)
    ↓ creates new capability
Tools (Yuka's logic #2)
    ↓ + large pack size
Gen 4: Tribe Formation (Yuka detects organization benefits)
    ↓ creates new social structure
Tribes (Yuka's logic #3)
    ↓ + resource dispersion + survival pressure
Gen 5: Building Construction (Yuka detects optimization needs)
    ↓ creates new structures
Buildings (Yuka's logic #4)
    ↓ + unknown events + coordination needs
Gen 6: Religion & Democracy (Yuka detects pattern-seeking + decision complexity)
    ↓ creates new abstractions
Belief Systems & Governance (Yuka's logic #5)
    ↓ ALL feed back into
Next generation emergent behaviors (Yuka's logic #6, #7, #8...)
```

**Each emergence creates CONDITIONS for the next.**

**Yuka's logic builds on Yuka's logic.**

**We stopped driving after Gen 1.**

**Everything past that is YUKA.**

---

## Why This Is Critical

### Traditional Game Design

```typescript
// Gen 3: Tools (scripted)
if (generation === 3) {
  spawnTools();
}

// Gen 4: Tribes (scripted)
if (generation === 4) {
  formTribes();
}

// Gen 5: Buildings (scripted)
if (generation === 5) {
  constructBuildings();
}

// PROBLEM: No emergence
// PROBLEM: No causality
// PROBLEM: Feels scripted
// PROBLEM: Breaks if player disrupts timeline
```

### Our Design (Emergent)

```typescript
// Gen 3: Tools (emergent)
const toolDesirability = fuzzy.evaluate(materialPressure, creatureCapability);

if (toolDesirability > threshold) {
  // Tools emerge WHEN NEEDED
  // Not when scripted
}

// Gen 4: Tribes (emergent)
const tribeDesirability = fuzzy.evaluate(packSize, resourceDensity, toolAdoption);

if (tribeDesirability > threshold) {
  // Tribes form WHEN BENEFICIAL
  // Not when scripted
}

// Gen 5: Buildings (emergent)
const buildingDesirability = fuzzy.evaluate(tribeSize, survivalPressure, resourceDispersion);

if (buildingDesirability > threshold) {
  // Buildings appear WHEN OPTIMAL
  // Not when scripted
}

// BENEFIT: True emergence
// BENEFIT: Causal chain
// BENEFIT: Feels organic
// BENEFIT: Adapts to player disruption
```

---

## What We Test

We DON'T test: "Does tool emerge at Gen 3?"

We TEST: "Given material pressure X and creature capability Y, does Yuka decide tools are desirable?"

```typescript
// Test: Tool emergence logic
const fuzzy = new ToolEmergenceFuzzy();

// Scenario 1: Low pressure (90% materials accessible)
fuzzy.setValue('material_pressure', 0.1);
fuzzy.setValue('creature_capability', 0.5);
fuzzy.defuzzify('tool_desirability');

expect(fuzzy.getValue('tool_desirability')).toBeLessThan(0.3);
// Yuka: "Tools not needed"

// Scenario 2: High pressure (71% materials inaccessible)
fuzzy.setValue('material_pressure', 0.71);
fuzzy.setValue('creature_capability', 0.5);
fuzzy.defuzzify('tool_desirability');

expect(fuzzy.getValue('tool_desirability')).toBeGreaterThan(0.7);
// Yuka: "Tools necessary!"

// Scenario 3: Extreme pressure + weak creatures
fuzzy.setValue('material_pressure', 0.9);
fuzzy.setValue('creature_capability', 0.2);
fuzzy.defuzzify('tool_desirability');

expect(fuzzy.getValue('tool_desirability')).toBeGreaterThan(0.9);
// Yuka: "Tools URGENT!"
```

**We test YUKA'S DECISION LOGIC.**

**Not scripted events.**

---

## Summary

**We provide:**
- Archetypes (initial capabilities)
- Environment (real constraints from accretion)
- Yuka systems (Goals, Fuzzy, FSM, MessageDispatcher)

**Then we step back.**

**Yuka takes over:**
- Evaluates goals based on queries
- Detects pressures via fuzzy logic
- Forms packs when beneficial (emergent)
- Invents tools when needed (emergent)
- Creates tribes when optimal (emergent)
- Builds structures when pressured (emergent)
- Develops religion/democracy when complex (emergent)

**Each emergence feeds the next.**

**Yuka's logic builds on Yuka's logic.**

**Self-sustaining.**

**We never script Gen 3, 4, 5, 6.**

**Yuka figures it out based on accumulated logic.**

**That's the power.**

**That's why we trust the systems.**

**Past a very early point, it is literally relying on its own logic.**
