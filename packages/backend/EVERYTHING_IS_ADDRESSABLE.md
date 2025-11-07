# EVERYTHING IS ADDRESSABLE: THE HISTORY PRINCIPLE

## The Core Philosophy

**A squirrel doesn't just "exist" with stats.**

A squirrel is **organic matter** that came from **somewhere**.

It consumed **materials** from the planet.

Those materials have a **formation history** from accretion.

The squirrel **IS** those materials, reorganized.

Its **needs** are derived from its **composition**.

Its **goals** emerge from its **needs**.

**Everything is traceable. Everything is addressable. Just look up its history.**

---

## The Traditional Way (Wrong)

```typescript
// Traditional: Magic spawn
function spawnSquirrel() {
  return {
    id: 'sq-001',
    species: 'squirrel',
    energy: 100,      // WHERE DID THIS COME FROM?
    hunger: 0,        // WHY 0?
    health: 100,      // ARBITRARY
    traits: {
      speed: 5,       // MADE UP
      strength: 3,    // MADE UP
      excavation: 0.2 // MADE UP
    }
  };
}

// Player asks: "Why does this squirrel have 0.2 excavation?"
// Developer: "¯\_(ツ)_/¯ We picked it for balance"
// NO HISTORY
// NO CAUSALITY
// ARBITRARY
```

---

## Our Way (Right)

### 1. Squirrel Has Material Composition

```typescript
interface Creature {
  id: string;
  archetype: Archetype;
  
  // Composition (what the creature IS)
  composition: {
    carbon: number;      // kg
    calcium: number;     // kg
    iron: number;        // kg
    phosphorus: number;  // kg
    water: number;       // kg
    // ... all materials
  };
  
  // History (where materials came from)
  materialHistory: {
    carbon: {
      consumed: 50,  // kg consumed over lifetime
      sources: [
        { coordinate: { lat: 45, lon: 120 }, material: 'vegetation', amount: 30, cycle: 100 },
        { coordinate: { lat: 45, lon: 121 }, material: 'wood', amount: 20, cycle: 150 },
      ]
    },
    calcium: {
      consumed: 2,
      sources: [
        { coordinate: { lat: 45, lon: 120 }, material: 'limestone', amount: 2, cycle: 105 },
      ]
    },
    // ... history for every material
  };
  
  // Traits derived from composition
  traits: {
    excavation: number;  // Derived from calcium + iron in bones
    speed: number;       // Derived from carbon + energy density
    strength: number;    // Derived from muscle mass (carbon + nitrogen)
  };
}
```

**Squirrel is NOT stats.**

**Squirrel IS materials from the planet.**

### 2. Traits Are Derived, Not Arbitrary

```typescript
function calculateTraits(creature: Creature): Traits {
  // Excavation = bone density + strength
  const boneStrength = (
    creature.composition.calcium * 2.0 +  // Calcium makes strong bones
    creature.composition.phosphorus * 1.5 +
    creature.composition.iron * 0.5       // Iron for hardness
  ) / creature.totalMass;
  
  const excavation = Math.min(1.0, boneStrength * 10);  // Normalize to 0-1
  
  // Speed = muscle mass + energy efficiency
  const muscleMass = creature.composition.carbon * 0.4;  // Muscles are ~40% carbon
  const energyDensity = creature.composition.lipids / creature.totalMass;
  
  const speed = Math.min(10, muscleMass * energyDensity * 5);
  
  // Strength = muscle mass + bone support
  const strength = Math.min(10, muscleMass * boneStrength);
  
  return { excavation, speed, strength };
}

// NOW we can answer: "Why does this squirrel have 0.2 excavation?"
// Query composition:
creature.composition.calcium = 0.5 kg
creature.composition.iron = 0.1 kg
creature.totalMass = 5 kg

// Calculate:
boneStrength = (0.5 * 2.0 + 0.1 * 0.5) / 5 = 0.21
excavation = 0.21 * 10 = 2.1 → capped at 1.0

// Answer: "Low calcium and iron content relative to body mass"
// Player: "How do I get more calcium?"
// System: "Consume limestone or bone material"
// TRACEABLE
```

### 3. Materials Have Formation History

```typescript
// Player queries: "Where did this calcium come from?"
creature.materialHistory.calcium.sources
// Returns:
[
  { 
    coordinate: { lat: 45, lon: 120 },
    material: 'limestone',
    amount: 2,
    cycle: 105
  }
]

// Player queries: "Why is limestone at (45, 120)?"
planet.queryCoordinate(45, 120).history
// Returns:
{
  material: 'limestone',
  depth: 0,
  formation: {
    type: 'marine_sedimentation',
    source: 'ocean_formed_by_comet_7823',
    cycle: 500000000,  // 500M cycles ago
    event: {
      type: 'comet_impact',
      comet: {
        id: 'comet-7823',
        composition: { water: 10000, carbon: 500, silicates: 200 },
        mass: 10700,  // kg
        velocity: 15000,  // m/s
        impactCycle: 500000000
      }
    }
  }
}

// Player: "Why was there a comet?"
planet.accretionHistory.events[7823]
// Returns:
{
  cycle: 500000000,
  type: 'comet_capture',
  object: {
    id: 'comet-7823',
    origin: 'outer_debris_field',
    trajectory: { ... },
    capturedBy: 'planetary_gravity',
  }
}

// COMPLETE TRACEABLE HISTORY
// From squirrel's bones → limestone → comet → debris field → accretion
```

---

## Query System

### API: Get Creature History

```typescript
GET /api/game/:id/creature/:creatureId/history

Response: {
  creature: {
    id: 'sq-001',
    archetype: 'cursorial_forager',
    born: 1000,
    currentCycle: 2000,
    age: 1000,  // cycles
  },
  
  composition: {
    carbon: 3.5,  // kg
    calcium: 0.5,
    iron: 0.1,
    water: 3.0,
    totalMass: 7.1
  },
  
  traits: {
    excavation: 0.21,
    speed: 5.2,
    strength: 3.8,
    derivation: {
      excavation: "Derived from (calcium: 0.5kg * 2.0 + iron: 0.1kg * 0.5) / totalMass: 7.1kg = 0.21",
      speed: "Derived from muscleMass: 1.4kg * energyDensity: 0.15 * 5 = 5.2",
      strength: "Derived from muscleMass: 1.4kg * boneStrength: 0.27 = 3.8"
    }
  },
  
  materialHistory: {
    carbon: {
      totalConsumed: 50,  // kg over lifetime
      sources: [
        {
          coordinate: { lat: 45, lon: 120 },
          material: 'vegetation',
          amount: 30,
          cycle: 1100,
          formation: {
            type: 'photosynthesis',
            carbonSource: 'atmospheric_co2',
            originatedFromVolcanicOutgassing: true,
            volcanicEvent: { cycle: 100000000 }
          }
        },
        {
          coordinate: { lat: 45, lon: 121 },
          material: 'wood',
          amount: 20,
          cycle: 1500,
          formation: {
            type: 'tree_growth',
            carbonSource: 'atmospheric_co2',
            originatedFromVolcanicOutgassing: true,
            volcanicEvent: { cycle: 100000000 }
          }
        }
      ],
      // Current composition (some consumed for energy)
      current: 3.5,
      consumedForEnergy: 46.5
    },
    
    calcium: {
      totalConsumed: 2,
      sources: [
        {
          coordinate: { lat: 45, lon: 120 },
          material: 'limestone',
          amount: 2,
          cycle: 1050,
          formation: {
            type: 'marine_sedimentation',
            source: 'ocean_formed_by_comet',
            comet: {
              id: 'comet-7823',
              impactCycle: 500000000,
              mass: 10700,
              composition: { water: 10000, silicates: 200, calcium: 50 }
            }
          }
        }
      ],
      current: 0.5,
      usedForBones: 1.5
    }
  },
  
  goals: [
    {
      type: 'ManageEnergyGoal',
      reason: "Energy depleting due to movement cost on granite terrain",
      desirability: 0.85,
      active: true
    },
    {
      type: 'ImproveExcavationGoal',
      reason: "71% of nearby materials require excavation > 0.21",
      desirability: 0.70,
      active: false,
      wouldBecomeActiveIf: "energy > 0.8 or tool with excavation boost available"
    }
  ]
}
```

**EVERYTHING is traceable.**

**EVERY value has a reason.**

**EVERY reason has a history.**

---

## Goals Are Derived From Composition

### Traditional: Hardcoded Goals

```typescript
// Traditional: Goals are scripts
const goals = [
  new FindFoodGoal(),    // Everyone has this (arbitrary)
  new RestGoal(),        // Everyone has this (arbitrary)
  new SurvivalGoal()     // Everyone has this (arbitrary)
];

// Player: "Why does my squirrel want food?"
// Developer: "Because it's alive?"
// NO CAUSALITY
```

### Our Way: Goals Emerge From Needs

```typescript
// Squirrel's composition determines needs
function deriveNeeds(creature: Creature): Need[] {
  const needs: Need[] = [];
  
  // Carbon depletes from movement (burned as fuel)
  const carbonDepletionRate = creature.traits.speed * 0.1;  // Faster = more burn
  
  if (carbonDepletionRate > 0) {
    needs.push({
      type: 'carbon',
      current: creature.composition.carbon,
      max: creature.composition.carbon * 1.5,  // Can store 50% more
      depletionRate: carbonDepletionRate,
      replenishment: ['vegetation', 'wood', 'meat'],
      urgency: (max, current) => 1 - (current / max)  // Urgent when low
    });
  }
  
  // Water depletes from activity
  const waterDepletionRate = creature.traits.speed * 0.05;
  
  needs.push({
    type: 'water',
    current: creature.composition.water,
    max: creature.composition.water * 1.2,
    depletionRate: waterDepletionRate,
    replenishment: ['water', 'vegetation'],
    urgency: (max, current) => 1 - (current / max)
  });
  
  // Calcium needed for bone maintenance
  const calciumDepletionRate = 0.001;  // Very slow
  
  needs.push({
    type: 'calcium',
    current: creature.composition.calcium,
    max: creature.composition.calcium * 1.1,
    depletionRate: calciumDepletionRate,
    replenishment: ['limestone', 'bone'],
    urgency: (max, current) => current < max * 0.8 ? 0.5 : 0  // Only urgent if < 80%
  });
  
  return needs;
}

// Goals are created from needs
function deriveGoals(creature: Creature, needs: Need[]): Goal[] {
  const goals: Goal[] = [];
  
  for (const need of needs) {
    // Create goal to satisfy need
    const goal = new SatisfyNeedGoal(need);
    
    // Desirability = urgency
    goal.calculateDesirability = () => need.urgency(need.max, need.current);
    
    goals.push(goal);
  }
  
  return goals;
}

// Now player asks: "Why does my squirrel want food?"
// Query creature needs:
creature.needs[0]
// Returns:
{
  type: 'carbon',
  current: 1.2,  // kg (low!)
  max: 5.25,
  depletionRate: 0.52,  // 0.52 kg/cycle
  urgency: 0.77  // HIGH
}

// Answer: "Carbon at 1.2kg / 5.25kg max = 23% (urgent!)"
// Player: "Why is carbon depleting?"
// Answer: "Speed: 5.2 * 0.1 = 0.52 kg/cycle depletion rate"
// Player: "Why is speed 5.2?"
// Answer: "muscleMass: 1.4kg * energyDensity: 0.15 * 5 = 5.2"
// COMPLETE CAUSALITY
```

---

## Evolution Is Material Pressure

### Traditional: Arbitrary Evolution

```typescript
// Traditional: Evolution is random mutations
function evolve(creature: Creature) {
  if (Math.random() < 0.1) {
    creature.traits.excavation += 0.1;  // Random boost
  }
}

// Player: "Why did my squirrel evolve excavation?"
// Developer: "Random chance"
// NO REASON
```

### Our Way: Evolution From Material Access

```typescript
function evaluateEvolutionPressure(creature: Creature, planet: Planet): EvolutionPressure[] {
  const pressures: EvolutionPressure[] = [];
  
  // Query materials in home range
  const homeRange = planet.navGraph.getRegion(creature.position, 5000);  // 5km radius
  
  let accessible = 0;
  let inaccessibleByDepth = 0;
  let inaccessibleByHardness = 0;
  
  for (const node of homeRange) {
    for (const material of node.materials) {
      const canReach = material.depth <= creature.traits.maxReach;
      const canDig = material.hardness <= creature.traits.maxHardness;
      
      if (canReach && canDig) {
        accessible++;
      } else if (!canReach) {
        inaccessibleByDepth++;
      } else if (!canDig) {
        inaccessibleByHardness++;
      }
    }
  }
  
  // Pressure to evolve excavation
  if (inaccessibleByHardness > accessible * 0.5) {
    pressures.push({
      trait: 'excavation',
      reason: `${inaccessibleByHardness} materials inaccessible due to hardness`,
      strength: inaccessibleByHardness / (accessible + inaccessibleByHardness),
      materials: {
        needed: ['basalt', 'granite', 'iron'],
        currentlyAccessible: ['limestone', 'sand', 'vegetation'],
        wouldBecomeAccessible: ['basalt'] // if excavation +0.1
      }
    });
  }
  
  // Pressure to evolve maxReach
  if (inaccessibleByDepth > accessible * 0.5) {
    pressures.push({
      trait: 'maxReach',
      reason: `${inaccessibleByDepth} materials inaccessible due to depth`,
      strength: inaccessibleByDepth / (accessible + inaccessibleByDepth),
      materials: {
        needed: ['deep_minerals', 'groundwater'],
        currentlyAccessible: ['surface_vegetation'],
        wouldBecomeAccessible: ['subsurface_minerals'] // if maxReach +10m
      }
    });
  }
  
  return pressures;
}

// Evolve based on pressure
function evolve(creature: Creature, planet: Planet) {
  const pressures = evaluateEvolutionPressure(creature, planet);
  
  // Sort by strength
  pressures.sort((a, b) => b.strength - a.strength);
  
  if (pressures.length === 0) {
    // No pressure, no evolution
    return;
  }
  
  const strongestPressure = pressures[0];
  
  if (strongestPressure.strength > 0.7) {
    // Strong pressure → evolve
    
    if (strongestPressure.trait === 'excavation') {
      creature.traits.excavation += 0.1;
      
      // Requires more calcium/iron for stronger bones
      creature.needs.calcium.max += 0.1;
      creature.needs.iron.max += 0.05;
    }
    
    if (strongestPressure.trait === 'maxReach') {
      creature.traits.maxReach += 10;  // +10m reach
      
      // Requires more muscle mass (carbon)
      creature.needs.carbon.max += 0.5;
    }
  }
}

// Now player asks: "Why did my squirrel evolve excavation?"
// Query evolution history:
GET /api/game/:id/creature/:creatureId/evolution

Response: {
  cycle: 1500,
  trait: 'excavation',
  before: 0.2,
  after: 0.3,
  reason: {
    pressure: 0.75,
    inaccessibleMaterials: 450,
    accessibleMaterials: 150,
    materialsNeeded: ['basalt', 'granite'],
    wouldBecomeAccessible: ['basalt at (45, 120)', 'basalt at (45, 121)']
  },
  cost: {
    calcium: { before: 0.5, after: 0.6, increase: +0.1 },
    iron: { before: 0.1, after: 0.15, increase: +0.05 }
  }
}

// COMPLETE CAUSALITY
// TRACEABLE DECISION
// MATERIAL JUSTIFICATION
```

---

## Tool Emergence Has Material History

```typescript
// Tool is created from materials
interface Tool {
  id: string;
  type: 'digging_stick';
  
  // Composition (what the tool IS)
  composition: {
    wood: 0.5,  // kg
    stone: 0.2   // kg (for tip)
  };
  
  // History (where materials came from)
  materialHistory: {
    wood: {
      coordinate: { lat: 45, lon: 121 },
      harvested: 1500,
      formation: {
        type: 'tree_growth',
        species: 'oak',
        age: 500  // cycles
      }
    },
    stone: {
      coordinate: { lat: 45, lon: 120 },
      harvested: 1502,
      formation: {
        type: 'volcanic_rock',
        event: 'volcanic_eruption',
        cycle: 100000000
      }
    }
  };
  
  // Traits derived from composition
  boost: {
    excavation: +0.3  // Derived from stone hardness
  };
  
  durability: 100;  // Derived from wood density + stone attachment
}

// Player: "Why does this tool give +0.3 excavation?"
// Query tool composition:
tool.composition.stone = 0.2 kg
tool.materialHistory.stone.formation.type = 'volcanic_rock'

// Lookup material properties:
planet.getMaterial('volcanic_rock').hardness = 6.0

// Calculate boost:
boost = stone.mass * stone.hardness * 0.25 = 0.2 * 6.0 * 0.25 = 0.3

// Answer: "Stone tip is volcanic rock (hardness 6.0), 0.2kg mass"
// TRACEABLE
```

---

## Buildings Have Material Requirements

```typescript
interface Building {
  id: string;
  type: 'shelter';
  
  // Composition (what was used to build it)
  composition: {
    wood: 1000,  // kg
    stone: 500,  // kg
    clay: 200    // kg
  };
  
  // History (where materials came from)
  materialHistory: {
    wood: [
      { coordinate: { lat: 45, lon: 120 }, amount: 500, contributor: 'sq-001', cycle: 2000 },
      { coordinate: { lat: 45, lon: 121 }, amount: 500, contributor: 'sq-002', cycle: 2005 }
    ],
    stone: [
      { coordinate: { lat: 45, lon: 120 }, amount: 500, contributor: 'sq-003', cycle: 2010 }
    ],
    clay: [
      { coordinate: { lat: 45, lon: 122 }, amount: 200, contributor: 'sq-004', cycle: 2015 }
    ]
  };
  
  // Benefits derived from composition
  benefits: {
    restRate: +50,  // Derived from shelter quality (wood insulation)
    survivalRate: +0.2  // Derived from structural integrity (stone foundation)
  };
  
  constructed: 2020;
}

// Player: "Why does this shelter give +50 rest rate?"
// Query building composition:
building.composition.wood = 1000 kg

// Calculate insulation:
insulation = wood.mass * wood.thermalResistance = 1000 * 0.05 = 50

// Answer: "1000kg of wood provides thermal insulation value 50"
// TRACEABLE
```

---

## The Ultimate Query: Full Causality Chain

```typescript
GET /api/game/:id/creature/:creatureId/explain/trait/excavation

Response: {
  trait: 'excavation',
  currentValue: 0.3,
  
  derivation: {
    formula: "(calcium * 2.0 + iron * 0.5) / totalMass * 10",
    inputs: {
      calcium: 0.6,  // kg
      iron: 0.15,    // kg
      totalMass: 7.5 // kg
    },
    calculation: "(0.6 * 2.0 + 0.15 * 0.5) / 7.5 * 10 = 0.3"
  },
  
  materialSources: {
    calcium: [
      {
        material: 'limestone',
        amount: 0.6,
        coordinate: { lat: 45, lon: 120 },
        consumed: 1050,
        formation: {
          type: 'marine_sedimentation',
          cycle: 500000000,
          event: {
            type: 'comet_impact',
            comet: {
              id: 'comet-7823',
              mass: 10700,
              composition: { water: 10000, calcium: 50 },
              origin: 'outer_debris_field',
              accretionCycle: 500000000
            }
          }
        }
      }
    ],
    iron: [
      {
        material: 'iron_ore',
        amount: 0.15,
        coordinate: { lat: 45, lon: 123 },
        consumed: 1200,
        formation: {
          type: 'core_intrusion',
          cycle: 4000000000,  // 4B cycles ago (planetary formation)
          event: {
            type: 'core_formation',
            phase: 'differentiation',
            accretion: {
              source: 'meteoric_iron',
              asteroids: [
                { id: 'ast-4521', mass: 500000, iron: 450000 },
                { id: 'ast-9832', mass: 300000, iron: 270000 }
              ]
            }
          }
        }
      }
    ]
  },
  
  evolutionHistory: [
    {
      cycle: 1500,
      change: { before: 0.2, after: 0.3 },
      reason: {
        pressure: 0.75,
        inaccessibleMaterials: ['basalt', 'granite'],
        futureAccessGained: ['basalt at 450 locations']
      },
      cost: {
        calcium: +0.1,
        iron: +0.05
      }
    }
  ],
  
  fullCausality: [
    "4B cycles ago: Planetary accretion begins",
    "4B cycles ago: Asteroids ast-4521 and ast-9832 collide with proto-planet",
    "4B cycles ago: Iron sinks to core during differentiation",
    "500M cycles ago: Comet-7823 impacts at (45, 120)",
    "500M cycles ago: Ocean forms, calcium sediments deposit as limestone",
    "Cycle 1000: Squirrel born from parent creatures",
    "Cycle 1050: Squirrel consumes limestone at (45, 120), gains 0.6kg calcium",
    "Cycle 1200: Squirrel consumes iron ore at (45, 123), gains 0.15kg iron",
    "Cycle 1500: Evolution pressure detected (75% materials inaccessible)",
    "Cycle 1500: Excavation evolves 0.2 → 0.3 due to calcium +0.1, iron +0.05",
    "Current: Excavation = (0.6 * 2.0 + 0.15 * 0.5) / 7.5 * 10 = 0.3"
  ]
}
```

**COMPLETE CAUSAL CHAIN.**

**FROM PLANETARY ACCRETION TO CURRENT TRAIT VALUE.**

**EVERYTHING IS ADDRESSABLE.**

**JUST LOOK UP ITS HISTORY.**

---

## Summary

**Traditional games:**
- Spawn squirrel with arbitrary stats
- "Why does it have these stats?" → "Balance"
- "Why does it want food?" → "Because it's alive"
- "Why did it evolve?" → "Random chance"
- **NO HISTORY. NO CAUSALITY. ARBITRARY.**

**Our game:**
- Squirrel is organic matter composed of planetary materials
- "Why does it have excavation 0.3?" → Query composition → calcium 0.6kg from limestone at (45,120) formed by comet impact
- "Why does it want food?" → Query needs → carbon depleting at 0.52kg/cycle due to speed 5.2 derived from muscle mass
- "Why did it evolve?" → Query pressure → 75% of materials inaccessible, basalt requires excavation 0.3+
- **COMPLETE HISTORY. FULL CAUSALITY. TRACEABLE.**

**The Philosophy:**
- Everything is materials
- Materials have formation history (accretion)
- Creatures are organized materials
- Traits derive from composition
- Needs derive from depletion
- Goals derive from needs
- Evolution derives from access pressure
- **EVERYTHING IS ADDRESSABLE. JUST LOOK UP ITS HISTORY.**

**No if/then/else.**

**No arbitrary decisions.**

**No magic numbers.**

**Just queries into a complete causal simulation.**

**That's the power.**
