# DEATH AS FAILSAFE: STUCK ENTITY RESOLUTION

## The Core Principle

**If Yuka gets stuck and can't figure out what to do → DEATH.**

**Death resets the entity back DOWN the chain.**

**Materials return to environment.**

**Other entities can reorganize them.**

**No infinite loops. No crashes. Just decomposition.**

---

## Why This Is Critical

### The Problem: Emergent Confusion

```typescript
// Example: Creature evolves into invalid state
const creature = {
  archetype: 'cursorial_forager',
  traits: {
    excavation: 1.5,  // ← Wait, max is 1.0!
    speed: -2,        // ← NEGATIVE?!
    maxReach: NaN     // ← BROKEN
  }
};

// Yuka tries to evaluate goals
const goal = new FindFoodGoal();
goal.calculateDesirability(creature, planet);
// Returns: NaN (can't calculate with invalid traits)

// Yuka tries to query materials
const accessible = planet.queryAccessibleMaterials(creature);
// Returns: [] (maxReach is NaN, nothing is accessible)

// Yuka: "I don't know what to do. I'm stuck."

// TRADITIONAL APPROACH: Crash or infinite loop
// OUR APPROACH: SEEK DEATH
```

### The Solution: Death Escalation Chain

```
Level 1: SELF-DECOMPOSITION
  Entity attempts to fix itself by decomposing problematic parts

Level 2: PREDATION
  Planetary system summons predators to kill and consume stuck entity

Level 3: ENVIRONMENTAL SMITE
  Planetary system directly destroys entity via weather/disaster

Level 4: FORCED DELETION
  As last resort, entity is removed and materials forcibly returned
```

**Each level escalates if previous level fails.**

**Death is ALWAYS the eventual outcome.**

**Materials ALWAYS return to cycle.**

---

## Level 1: Self-Decomposition (Entity-Level)

### Tool Stuck: Decompose Back To Materials

```typescript
interface Tool {
  id: string;
  type: string;
  composition: MaterialComposition;
  stuck: boolean;  // ← Stuck flag
  stuckCycles: number;
  stuckReason: string;
}

// Example: Nail + Hammer → Nail_Hammer (CONFUSED STATE)
const nailHammer = {
  id: 'tool-999',
  type: 'nail_hammer',  // ← Yuka doesn't know what this is!
  composition: {
    wood: 0.5,   // From hammer handle
    iron: 0.2,   // From hammer head
    iron_nail: 0.05  // From nail
  },
  stuck: false,
  stuckCycles: 0,
  stuckReason: null
};

// Yuka tries to evaluate tool use
class UseToolGoal extends Goal {
  execute(creature: Creature, tool: Tool, planet: Planet) {
    // Query tool properties
    const properties = this.getToolProperties(tool.type);
    
    if (!properties) {
      // Yuka: "I don't know what a 'nail_hammer' does!"
      tool.stuck = true;
      tool.stuckReason = 'unknown_tool_type';
      tool.stuckCycles = 0;
      return;
    }
    
    // ... normal tool use
  }
}

// Every cycle, check stuck tools
class StuckToolDetector {
  update(tools: Tool[], deltaTime: number) {
    for (const tool of tools) {
      if (tool.stuck) {
        tool.stuckCycles++;
        
        // After 10 cycles stuck, decompose
        if (tool.stuckCycles > 10) {
          this.decomposeTool(tool);
        }
      }
    }
  }
  
  decomposeTool(tool: Tool) {
    console.log(`[FAILSAFE] Tool ${tool.id} stuck (${tool.stuckReason}), decomposing...`);
    
    // FLAG: stuck_destroy
    tool.status = 'stuck_destroy';
    
    // Find owner creature
    const creature = this.findToolOwner(tool);
    
    if (creature) {
      // Creature IMMEDIATELY decomposes tool
      // NO COST (free action)
      // NO PENALTIES (failsafe mode)
      
      const goal = new DecomposeToolGoal(tool);
      goal.freeCost = true;  // No energy cost
      goal.priority = 1.0;   // Highest priority
      
      creature.brain.addSubgoal(goal);
    } else {
      // No owner, just drop it on ground
      this.dropToolOnGround(tool);
    }
  }
}

// Decompose tool goal
class DecomposeToolGoal extends Goal {
  execute(creature: Creature, planet: Planet, deltaTime: number) {
    const tool = this.tool;
    
    // Break tool back into component materials
    // nail_hammer → nail + hammer
    // OR if can't separate → raw materials
    
    const components = this.tryToSeparate(tool);
    
    if (components.length > 1) {
      // Successfully separated
      console.log(`[FAILSAFE] Separated ${tool.type} into:`, components);
      
      for (const component of components) {
        // Add to creature inventory
        creature.inventory.add(component);
      }
    } else {
      // Can't separate, decompose to raw materials
      console.log(`[FAILSAFE] Decomposing ${tool.type} to raw materials`);
      
      for (const [material, amount] of Object.entries(tool.composition)) {
        // Add materials to planet at creature's location
        planet.addMaterial(creature.position, material, amount);
      }
    }
    
    // Remove tool from existence
    this.removeTool(tool);
    
    this.status = Goal.STATUS_COMPLETED;
  }
  
  tryToSeparate(tool: Tool): Tool[] {
    // Attempt to decompose to previous generation
    // nail_hammer → [nail, hammer]
    
    const history = tool.creationHistory;
    
    if (history && history.combinedFrom) {
      // Tool was created by combining other tools
      return history.combinedFrom;  // Return original tools
    }
    
    return [];  // Can't separate
  }
}
```

**Tool stuck → Decompose to previous generation or raw materials.**

**FREE action (no cost).**

**Materials return to cycle.**

---

### Building Stuck: Deconstruct Back To Materials

```typescript
interface Building {
  id: string;
  type: string;
  composition: MaterialComposition;
  constructionProgress: number;  // 0-1
  stuck: boolean;
  stuckCycles: number;
  stuckReason: string;
}

// Example: Tribe tries to build "sky_temple" (INVALID)
const skyTemple = {
  id: 'build-666',
  type: 'sky_temple',  // ← Yuka doesn't know what this is!
  composition: {
    wood: 5000,
    stone: 3000
  },
  constructionProgress: 0.5,  // Half built
  stuck: true,
  stuckReason: 'unknown_building_type'
};

class StuckBuildingDetector {
  update(buildings: Building[], deltaTime: number) {
    for (const building of buildings) {
      if (building.stuck) {
        building.stuckCycles++;
        
        // After 50 cycles stuck, deconstruct
        if (building.stuckCycles > 50) {
          this.deconstructBuilding(building);
        }
      }
    }
  }
  
  deconstructBuilding(building: Building) {
    console.log(`[FAILSAFE] Building ${building.id} stuck (${building.stuckReason}), deconstructing...`);
    
    // FLAG: stuck_destroy
    building.status = 'stuck_destroy';
    
    // Tribe decomposes building
    const tribe = this.findBuildingOwner(building);
    
    if (tribe) {
      // Create deconstruction goal for tribe
      const goal = new DeconstructBuildingGoal(building);
      goal.freeCost = true;
      goal.priority = 1.0;
      
      // All tribe members help deconstruct
      for (const member of tribe.members) {
        member.brain.addSubgoal(goal);
      }
    } else {
      // No tribe, building collapses naturally
      this.collapseBuilding(building);
    }
  }
}

class DeconstructBuildingGoal extends Goal {
  execute(creature: Creature, planet: Planet, deltaTime: number) {
    const building = this.building;
    
    // Return materials to construction site
    for (const [material, amount] of Object.entries(building.composition)) {
      const returnedAmount = amount * building.constructionProgress;
      
      planet.addMaterial(building.location, material, returnedAmount);
    }
    
    // Remove building
    this.removeBuilding(building);
    
    console.log(`[FAILSAFE] Deconstructed ${building.type}, returned ${building.constructionProgress * 100}% of materials`);
    
    this.status = Goal.STATUS_COMPLETED;
  }
}
```

**Building stuck → Deconstruct to materials.**

**Materials return to location.**

**Tribe can use them for something else.**

---

## Level 2: Predation (Ecosystem-Level)

### Creature Stuck: Flag As Sick, Summon Predators

```typescript
interface Creature {
  id: string;
  traits: Traits;
  stuck: boolean;
  stuckCycles: number;
  stuckReason: string;
  status: 'healthy' | 'sick' | 'dying' | 'dead';
}

// Example: Creature evolves invalid traits
const confusedCreature = {
  id: 'sq-999',
  traits: {
    excavation: NaN,  // ← BROKEN
    speed: -5,        // ← INVALID
    maxReach: Infinity  // ← NONSENSE
  },
  stuck: false,
  stuckCycles: 0,
  status: 'healthy'
};

// Yuka tries to evaluate goals
class CreatureGoalEvaluator {
  update(creature: Creature, planet: Planet) {
    try {
      // Try to calculate desirability
      const goals = creature.brain.subgoals;
      
      for (const goal of goals) {
        goal.desirability = goal.calculateDesirability(creature, planet);
        
        if (isNaN(goal.desirability) || !isFinite(goal.desirability)) {
          // Goal evaluation FAILED
          throw new Error(`Invalid desirability for ${goal.constructor.name}`);
        }
      }
    } catch (error) {
      // Yuka: "I can't evaluate goals. I'm stuck."
      console.log(`[FAILSAFE] Creature ${creature.id} stuck: ${error.message}`);
      
      creature.stuck = true;
      creature.stuckReason = error.message;
      creature.stuckCycles = 0;
    }
  }
}

class StuckCreatureDetector {
  update(creatures: Creature[], planet: Planet) {
    for (const creature of creatures) {
      if (creature.stuck) {
        creature.stuckCycles++;
        
        // After 10 cycles, flag as SICK
        if (creature.stuckCycles === 10) {
          this.flagAsSick(creature, planet);
        }
        
        // After 100 cycles, escalate to Level 3
        if (creature.stuckCycles > 100) {
          this.escalateToEnvironmentalSmite(creature, planet);
        }
      }
    }
  }
  
  flagAsSick(creature: Creature, planet: Planet) {
    console.log(`[FAILSAFE] Creature ${creature.id} flagged as SICK (stuck for 10 cycles)`);
    
    creature.status = 'sick';
    
    // Visual feedback: Creature lies down, mopes
    creature.animation = 'moping';
    creature.velocity = { x: 0, y: 0, z: 0 };  // Stops moving
    
    // PLANETARY SYSTEM TAKES OVER
    // Find nearest predator
    const predator = planet.findNearestPredator(creature.position);
    
    if (predator) {
      console.log(`[FAILSAFE] Summoning predator ${predator.id} to consume sick creature ${creature.id}`);
      
      // Override predator's goals
      const goal = new HuntSickPreyGoal(creature);
      goal.priority = 1.0;  // Highest priority
      goal.summonedByPlanetary = true;  // Flag for special handling
      
      predator.brain.clearSubgoals();  // Remove all other goals
      predator.brain.addSubgoal(goal);
    } else {
      console.log(`[FAILSAFE] No predators available, escalating...`);
      // Escalate immediately if no predators
      this.escalateToEnvironmentalSmite(creature, planet);
    }
  }
}

class HuntSickPreyGoal extends Goal {
  execute(predator: Creature, planet: Planet, deltaTime: number) {
    const prey = this.targetCreature;
    
    if (prey.status === 'dead') {
      // Already dead, goal complete
      this.status = Goal.STATUS_COMPLETED;
      return;
    }
    
    // Pathfind to prey
    const path = planet.navGraph.pathfind(predator.position, prey.position);
    
    if (path.length === 0) {
      // Can't reach prey, fail
      console.log(`[FAILSAFE] Predator ${predator.id} can't reach prey ${prey.id}`);
      this.status = Goal.STATUS_FAILED;
      return;
    }
    
    // Move towards prey
    predator.followPath(path, deltaTime);
    
    // Close enough to kill?
    const distance = predator.position.distanceTo(prey.position);
    
    if (distance < 1) {
      // KILL AND CONSUME
      console.log(`[FAILSAFE] Predator ${predator.id} killing sick prey ${prey.id}`);
      
      prey.status = 'dead';
      
      // Predator gains materials (goes UP the chain)
      for (const [material, amount] of Object.entries(prey.composition)) {
        predator.composition[material] += amount * 0.5;  // 50% efficiency
        
        // Rest returns to environment
        planet.addMaterial(prey.position, material, amount * 0.5);
      }
      
      // Remove prey
      planet.removeCreature(prey);
      
      console.log(`[FAILSAFE] Sick creature consumed, materials recycled`);
      
      this.status = Goal.STATUS_COMPLETED;
    }
  }
}
```

**Creature stuck → Flag as SICK.**

**Planetary system summons predators.**

**Predators kill and consume.**

**Materials return to cycle (via predator + environment).**

---

## Level 3: Environmental Smite (Planetary-Level)

### No Predators Or Predators Failed: Direct Destruction

```typescript
class PlanetarySmiteSystem {
  update(planet: Planet, deltaTime: number) {
    // Find all sick creatures that haven't been consumed
    const sickCreatures = planet.creatures.filter(c => 
      c.status === 'sick' && c.stuckCycles > 100
    );
    
    for (const creature of sickCreatures) {
      console.log(`[FAILSAFE] Predation failed for creature ${creature.id}, initiating SMITE`);
      
      // Choose smite method based on location
      const terrain = planet.getTerrainType(creature.position);
      
      if (terrain === 'land') {
        this.lightningStrike(creature, planet);
      } else if (terrain === 'water') {
        this.whirlpool(creature, planet);
      } else if (terrain === 'underground') {
        this.caveIn(creature, planet);
      }
    }
  }
  
  lightningStrike(creature: Creature, planet: Planet) {
    console.log(`[FAILSAFE] ⚡ LIGHTNING STRIKE on creature ${creature.id} at ${JSON.stringify(creature.position)}`);
    
    // Create weather event
    const lightning = {
      type: 'lightning',
      location: creature.position,
      cycle: planet.currentCycle,
      target: creature.id,
      damage: Infinity  // Instant death
    };
    
    planet.weatherEvents.push(lightning);
    
    // Visual effect (for frontend)
    planet.particleEffects.push({
      type: 'lightning_bolt',
      from: { ...creature.position, y: creature.position.y + 1000 },
      to: creature.position,
      duration: 0.2
    });
    
    // KILL creature
    creature.status = 'dead';
    
    // Decompose to materials (charred remains)
    for (const [material, amount] of Object.entries(creature.composition)) {
      planet.addMaterial(creature.position, material, amount);
    }
    
    // Remove creature
    planet.removeCreature(creature);
    
    console.log(`[FAILSAFE] Creature smited, materials returned to ${JSON.stringify(creature.position)}`);
  }
  
  whirlpool(creature: Creature, planet: Planet) {
    console.log(`[FAILSAFE] 🌊 WHIRLPOOL on creature ${creature.id} at ${JSON.stringify(creature.position)}`);
    
    // Create water vortex
    const whirlpool = {
      type: 'whirlpool',
      location: creature.position,
      cycle: planet.currentCycle,
      target: creature.id,
      duration: 10  // 10 cycles
    };
    
    planet.weatherEvents.push(whirlpool);
    
    // Visual effect
    planet.particleEffects.push({
      type: 'water_vortex',
      center: creature.position,
      radius: 10,
      duration: 10
    });
    
    // Creature drowns, sinks
    creature.status = 'dead';
    
    // Materials disperse in water
    for (const [material, amount] of Object.entries(creature.composition)) {
      // Spread over wider area (water disperses materials)
      const dispersalRadius = 100;  // meters
      
      for (let i = 0; i < 10; i++) {
        const randomOffset = {
          lat: creature.position.lat + (Math.random() - 0.5) * dispersalRadius,
          lon: creature.position.lon + (Math.random() - 0.5) * dispersalRadius
        };
        
        planet.addMaterial(randomOffset, material, amount / 10);
      }
    }
    
    planet.removeCreature(creature);
    
    console.log(`[FAILSAFE] Creature drowned, materials dispersed`);
  }
  
  caveIn(creature: Creature, planet: Planet) {
    console.log(`[FAILSAFE] 🪨 CAVE-IN on creature ${creature.id} at ${JSON.stringify(creature.position)}`);
    
    // Ceiling collapses
    const caveIn = {
      type: 'cave_in',
      location: creature.position,
      cycle: planet.currentCycle,
      target: creature.id
    };
    
    planet.weatherEvents.push(caveIn);
    
    // Visual effect
    planet.particleEffects.push({
      type: 'falling_rocks',
      center: creature.position,
      duration: 5
    });
    
    // Creature crushed
    creature.status = 'dead';
    
    // Materials buried under rubble
    for (const [material, amount] of Object.entries(creature.composition)) {
      // Bury at depth
      planet.addMaterial(creature.position, material, amount, { depth: 10 });
    }
    
    planet.removeCreature(creature);
    
    console.log(`[FAILSAFE] Creature crushed, materials buried`);
  }
}
```

**Predation failed → Planetary system directly smites.**

**Lightning, whirlpool, cave-in, etc.**

**Visual feedback (dramatic death).**

**Materials ALWAYS return to cycle.**

---

## Level 4: Forced Deletion (Last Resort)

```typescript
class ForcedDeletionSystem {
  update(planet: Planet) {
    // Find entities that are STILL stuck after smite attempts
    const unresolvedEntities = [
      ...planet.creatures.filter(c => c.stuckCycles > 200),
      ...planet.tools.filter(t => t.stuckCycles > 200),
      ...planet.buildings.filter(b => b.stuckCycles > 200)
    ];
    
    for (const entity of unresolvedEntities) {
      console.error(`[FAILSAFE] FORCED DELETION of ${entity.id} (stuck for ${entity.stuckCycles} cycles, all failsafes failed)`);
      
      // Log for debugging
      console.error(`[FAILSAFE] Entity state:`, JSON.stringify(entity, null, 2));
      
      // Force return materials
      if (entity.composition) {
        for (const [material, amount] of Object.entries(entity.composition)) {
          planet.addMaterial(entity.position, material, amount);
        }
      }
      
      // Force delete
      planet.forceDeleteEntity(entity);
      
      // Alert monitoring system
      planet.errors.push({
        type: 'forced_deletion',
        entity: entity.id,
        reason: entity.stuckReason,
        cycle: planet.currentCycle
      });
    }
  }
}
```

**All other failsafes failed → FORCE DELETE.**

**Materials forcibly returned.**

**Error logged for debugging.**

**Game continues.**

---

## Summary: The Death Escalation Chain

### Tool Stuck
```
Cycle 1: Tool stuck (unknown type)
Cycle 10: Decompose to previous generation or raw materials
Result: Materials returned, new tools can be crafted
```

### Building Stuck
```
Cycle 1: Building stuck (unknown type)
Cycle 50: Tribe deconstructs building
Result: Materials returned to construction site
```

### Creature Stuck
```
Cycle 1: Creature stuck (invalid traits)
Cycle 10: Flag as SICK, summon predators
Cycle 20: Predator arrives, kills, consumes
Result: Materials → predator (UP chain) + environment (DOWN chain)

IF NO PREDATORS:
Cycle 100: Planetary smite (lightning/whirlpool/cave-in)
Result: Materials return to environment

IF SMITE FAILS:
Cycle 200: Forced deletion
Result: Materials force-returned, error logged
```

---

## Benefits

### 1. No Infinite Loops
**Every stuck entity DIES eventually.**

### 2. Materials Always Recycle
**Death returns materials to environment.**

### 3. Visible Feedback
**Sick creatures mope, lightning strikes are dramatic.**

### 4. Emergent Cleanup
**Predators naturally remove sick creatures.**

### 5. Planetary Intervention
**If ecosystem can't handle it, planet does.**

### 6. Graceful Degradation
**System keeps running even if Yuka gets confused.**

### 7. Debugging Info
**Stuck entities log their state before deletion.**

---

## API Monitoring

```typescript
GET /api/game/:id/failsafes

Response: {
  active: [
    {
      entityId: 'sq-999',
      entityType: 'creature',
      stuckReason: 'Invalid trait: excavation = NaN',
      stuckCycles: 15,
      status: 'sick',
      failsafeLevel: 2,  // Predation
      action: 'Predator pred-001 en route'
    }
  ],
  
  history: [
    {
      cycle: 1500,
      entityId: 'tool-666',
      entityType: 'tool',
      stuckReason: 'Unknown tool type: nail_hammer',
      resolution: 'decomposed',
      failsafeLevel: 1
    },
    {
      cycle: 2000,
      entityId: 'sq-888',
      entityType: 'creature',
      stuckReason: 'Goal evaluation failed',
      resolution: 'consumed_by_predator',
      failsafeLevel: 2
    }
  ]
}
```

---

## The Philosophy

**"Seek the sweet release of death."**

**When Yuka doesn't know what to do → DEATH.**

**Death is not failure.**

**Death is RESET.**

**Materials return to cycle.**

**Other entities reorganize them.**

**The simulation continues.**

**No crashes.**

**No hangs.**

**Just the eternal cycle of decomposition and reorganization.**

**DOWN the chain, UP the chain, forever.**
