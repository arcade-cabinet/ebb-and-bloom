# GO DOWN THE CHAIN: BACKWARD TRACING

## The Fundamental Principle

**If you can't work out why something is the way it is, go down the chain.**

What did it used to be?

Where did it come from?

What was that made of?

**TRACE IT BACKWARDS.**

---

## Example: Why Does This Squirrel Have 0.3 Excavation?

### Current State (Cycle 2000)

```typescript
// Query creature
GET /api/game/123/creature/sq-001

{
  id: 'sq-001',
  archetype: 'cursorial_forager',
  cycle: 2000,
  traits: {
    excavation: 0.3  // ← WHY?
  }
}
```

**Can't work it out from current state alone.**

**GO DOWN THE CHAIN.**

---

### Step 1: What Is The Squirrel Made Of?

```typescript
GET /api/game/123/creature/sq-001/composition

{
  composition: {
    carbon: 3.5,    // kg
    calcium: 0.6,   // kg ← Bones
    iron: 0.15,     // kg ← Bone hardness
    water: 3.0,
    totalMass: 7.5
  },
  
  derivation: {
    excavation: "(calcium * 2.0 + iron * 0.5) / totalMass * 10",
    calculation: "(0.6 * 2.0 + 0.15 * 0.5) / 7.5 * 10 = 0.3"
  }
}
```

**Answer: 0.6kg calcium + 0.15kg iron = strong bones.**

**But WHERE did that calcium and iron come from?**

**GO DOWN THE CHAIN.**

---

### Step 2: What Did The Squirrel Used To Be?

```typescript
GET /api/game/123/creature/sq-001/material-history

{
  calcium: {
    totalConsumed: 0.6,
    sources: [
      {
        material: 'limestone',
        coordinate: { lat: 45, lon: 120 },
        amount: 0.6,
        cycle: 1050
      }
    ]
  },
  
  iron: {
    totalConsumed: 0.15,
    sources: [
      {
        material: 'iron_ore',
        coordinate: { lat: 45, lon: 123 },
        amount: 0.15,
        cycle: 1200
      }
    ]
  }
}
```

**Answer: The squirrel used to be limestone and iron ore.**

**Squirrel = reorganized limestone + iron ore.**

**But WHERE did limestone and iron ore come from?**

**GO DOWN THE CHAIN.**

---

### Step 3: What Was The Limestone Before It Was Limestone?

```typescript
GET /api/game/123/planet/coordinate/45/120/history

{
  coordinate: { lat: 45, lon: 120 },
  currentMaterials: [
    {
      type: 'limestone',
      depth: 0,
      quantity: 1000,
      formation: {
        type: 'marine_sedimentation',
        cycle: 500000000,  // 500M cycles ago
        source: 'calcium_carbonate_precipitation',
        precursor: 'ocean_water'
      }
    }
  ]
}
```

**Answer: Limestone used to be calcium carbonate dissolved in ocean water.**

**But WHERE did the ocean come from?**

**GO DOWN THE CHAIN.**

---

### Step 4: What Was The Ocean Before It Was An Ocean?

```typescript
GET /api/game/123/planet/formation/ocean

{
  formation: {
    type: 'comet_impacts',
    cycle: 500000000,
    events: [
      {
        id: 'comet-7823',
        mass: 10700,  // kg
        composition: {
          water: 10000,    // kg ← Ocean source
          calcium: 50,     // kg ← Limestone precursor
          silicates: 200
        },
        impactCoordinate: { lat: 45, lon: 120 },
        velocity: 15000  // m/s
      }
    ]
  }
}
```

**Answer: Ocean used to be water ice in Comet-7823.**

**Limestone's calcium used to be in the comet.**

**But WHERE did the comet come from?**

**GO DOWN THE CHAIN.**

---

### Step 5: What Was The Comet Before It Was A Comet?

```typescript
GET /api/game/123/planet/accretion/debris-field

{
  debrisField: {
    initialized: 4000000000,  // 4B cycles ago
    objects: [
      {
        id: 'comet-7823',
        type: 'icy_body',
        origin: 'outer_system',
        composition: {
          waterIce: 10000,
          calciumSilicates: 250
        },
        formation: {
          type: 'accretion',
          source: 'proto-planetary_disk',
          accreted_from: [
            { id: 'dust-grain-192837', mass: 0.001, material: 'water_ice' },
            { id: 'dust-grain-192838', mass: 0.001, material: 'water_ice' },
            // ... thousands more
            { id: 'dust-grain-485932', mass: 0.0001, material: 'calcium_silicate' }
          ]
        }
      }
    ]
  }
}
```

**Answer: Comet used to be thousands of dust grains in the proto-planetary disk.**

**Water ice grains + calcium silicate grains → accreted into comet.**

**But WHERE did the dust grains come from?**

**GO DOWN THE CHAIN.**

---

### Step 6: What Were The Dust Grains Before They Were Dust Grains?

```typescript
GET /api/game/123/stellar-system/formation

{
  stellarSystem: {
    star: {
      type: 'G2V',  // Sun-like
      mass: 1.0,    // solar masses
      formation: 4600000000  // 4.6B cycles ago
    },
    
    protoplanetaryDisk: {
      formation: 4600000000,
      composition: {
        hydrogen: 0.70,    // 70%
        helium: 0.28,      // 28%
        metals: 0.02       // 2% (includes calcium, iron, silicon, etc.)
      },
      
      metalSources: {
        calcium: {
          origin: 'supernova',
          supernovaCycle: 5000000000,  // 5B cycles ago (before this system)
          process: 'stellar_nucleosynthesis'
        },
        iron: {
          origin: 'supernova',
          supernovaCycle: 5000000000,
          process: 'Type_Ia_supernova_explosion'
        }
      }
    }
  }
}
```

**Answer: Dust grains used to be material ejected from a supernova 5 billion cycles ago.**

**Calcium was forged in a dying star's core.**

**Iron was created in a supernova explosion.**

**That material condensed into dust grains in the proto-planetary disk.**

---

## The Complete Chain

```
TODAY (Cycle 2000):
Squirrel has excavation = 0.3

↓ What is it made of?

Calcium (0.6kg) + Iron (0.15kg) in bones

↓ What did those used to be?

Limestone at (45, 120) + Iron ore at (45, 123)

↓ What was limestone before?

Calcium carbonate in ocean water

↓ What was ocean before?

Water ice + calcium silicates in Comet-7823

↓ What was comet before?

Dust grains in proto-planetary disk

↓ What were dust grains before?

Calcium + iron forged in a supernova 5B cycles ago

↓ Origin

Stellar nucleosynthesis → supernova → dust → comet → ocean → limestone → squirrel bones
```

**COMPLETE CAUSAL CHAIN.**

**Every link is addressable.**

**Every step is queryable.**

**GO DOWN THE CHAIN.**

---

## Another Example: Why Is This Squirrel Hungry?

### Current State

```typescript
GET /api/game/123/creature/sq-001/state

{
  energy: 20,      // ← LOW (max 100)
  hunger: 0.8,     // ← HIGH
  status: 'urgent_need_food'
}
```

**Why hungry?**

**GO DOWN THE CHAIN.**

---

### Step 1: What Depleted The Energy?

```typescript
GET /api/game/123/creature/sq-001/energy-history

{
  currentEnergy: 20,
  maxEnergy: 100,
  
  depletionHistory: [
    {
      cycle: 1990,
      activity: 'movement',
      distance: 1000,  // meters
      terrain: 'granite',
      cost: 30  // energy units
    },
    {
      cycle: 1992,
      activity: 'excavation',
      material: 'basalt',
      duration: 10,  // cycles
      cost: 50  // energy units
    }
  ],
  
  totalDepleted: 80,
  reason: "Movement on hard terrain (granite) + excavating hard material (basalt)"
}
```

**Answer: Squirrel moved across granite and excavated basalt.**

**Hard terrain + hard material = high energy cost.**

**But WHY was granite there? WHY was basalt hard?**

**GO DOWN THE CHAIN.**

---

### Step 2: Why Is Granite At That Location?

```typescript
GET /api/game/123/planet/coordinate/45/122/history

{
  currentMaterial: 'granite',
  hardness: 7.0,  // ← Hard!
  
  formation: {
    type: 'plutonic_intrusion',
    cycle: 1000000000,  // 1B cycles ago
    process: 'magma_cooling',
    source: 'mantle_upwelling',
    coolingRate: 'slow',  // → large crystals → hard
  }
}
```

**Answer: Granite formed from slow-cooling magma 1B cycles ago.**

**Slow cooling = large crystals = hard material = high excavation cost.**

**But WHY was there magma?**

**GO DOWN THE CHAIN.**

---

### Step 3: Why Was There Mantle Upwelling?

```typescript
GET /api/game/123/planet/tectonic-history

{
  tectonicActivity: {
    cycle: 1000000000,
    type: 'mantle_plume',
    cause: 'thermal_convection',
    source: 'core_heat',
    
    coreHeat: {
      source: 'radioactive_decay',
      isotopes: [
        { element: 'uranium-238', halfLife: 4500000000, contribution: 0.4 },
        { element: 'thorium-232', halfLife: 14000000000, contribution: 0.3 },
        { element: 'potassium-40', halfLife: 1250000000, contribution: 0.3 }
      ]
    }
  }
}
```

**Answer: Core heat from radioactive decay drove mantle convection.**

**Radioactive isotopes (uranium, thorium, potassium) decaying in the core.**

**But WHERE did those isotopes come from?**

**GO DOWN THE CHAIN.**

---

### Step 4: Where Did Uranium Come From?

```typescript
GET /api/game/123/stellar-system/element-origin/uranium

{
  element: 'uranium-238',
  origin: {
    process: 'r-process_nucleosynthesis',
    location: 'neutron_star_merger',
    cycle: 5000000000,  // 5B cycles ago (before solar system)
    
    event: {
      type: 'kilonova',
      neutronStars: [
        { mass: 1.4, solarMasses: true },
        { mass: 1.6, solarMasses: true }
      ],
      merger: {
        energy: 1e46,  // joules
        heavyElementsProduced: 1e28  // kg (including uranium)
      }
    }
  }
}
```

**Answer: Uranium was created in a neutron star merger 5B cycles ago.**

**Kilonova explosion produced heavy elements.**

**Those elements ended up in the proto-planetary disk.**

**Accreted into the planet's core.**

**Decayed over billions of years.**

**Heat from decay drove mantle convection.**

**Mantle plume rose, cooled into granite.**

**Squirrel walked across granite, depleted energy.**

**Squirrel is hungry NOW because of a neutron star collision 5 billion cycles ago.**

---

## The Complete Chain

```
5B cycles ago:
Neutron stars collide → kilonova → uranium created

4.6B cycles ago:
Uranium in proto-planetary disk → accretes into planet core

4B-present:
Uranium decays → heat → mantle convection

1B cycles ago:
Mantle plume rises → magma → slow cooling → granite forms at (45, 122)

Cycle 1990:
Squirrel walks across granite → high movement cost → energy depletes

Cycle 2000:
Squirrel energy = 20 (low) → hungry

WHY is squirrel hungry?
→ Walked on granite
  → Granite formed from slow-cooling magma
    → Magma from mantle upwelling
      → Mantle heat from uranium decay
        → Uranium from neutron star merger

GO DOWN THE CHAIN.
```

---

## API For Backward Tracing

```typescript
POST /api/game/:id/trace-origin

Body: {
  subject: 'creature',
  id: 'sq-001',
  property: 'excavation',
  depth: 'complete'  // How far back to trace
}

Response: {
  current: {
    subject: 'creature:sq-001',
    property: 'excavation',
    value: 0.3,
    cycle: 2000
  },
  
  chain: [
    {
      step: 1,
      description: "Excavation derived from bone composition",
      detail: {
        calcium: 0.6,
        iron: 0.15,
        formula: "(calcium * 2.0 + iron * 0.5) / totalMass * 10"
      }
    },
    {
      step: 2,
      description: "Calcium consumed from limestone",
      detail: {
        material: 'limestone',
        coordinate: { lat: 45, lon: 120 },
        amount: 0.6,
        cycle: 1050
      }
    },
    {
      step: 3,
      description: "Limestone formed from marine sedimentation",
      detail: {
        process: 'calcium_carbonate_precipitation',
        source: 'ocean_water',
        cycle: 500000000
      }
    },
    {
      step: 4,
      description: "Ocean formed from comet impacts",
      detail: {
        comet: 'comet-7823',
        water: 10000,
        calcium: 50,
        cycle: 500000000
      }
    },
    {
      step: 5,
      description: "Comet accreted from proto-planetary dust",
      detail: {
        dustGrains: 192837,
        totalMass: 10700,
        cycle: 4000000000
      }
    },
    {
      step: 6,
      description: "Calcium forged in supernova",
      detail: {
        process: 'stellar_nucleosynthesis',
        supernovaType: 'Type_II',
        cycle: 5000000000
      }
    }
  ],
  
  summary: "Excavation 0.3 traces back to calcium from supernova 5B cycles ago → dust → comet → ocean → limestone → squirrel bones"
}
```

**ONE API CALL TO TRACE THE ENTIRE CHAIN.**

---

## Why This Matters For Gameplay

### Player Debugging

```
Player: "Why is my squirrel so weak at digging?"

→ Query excavation
  excavation = 0.2 (low)

→ Trace origin
  Needs more calcium (only 0.3kg)

→ Query calcium sources
  Limestone at (45, 120) is depleted
  
→ Query other calcium sources
  Limestone at (50, 130) has 1000kg available
  
→ Query path to (50, 130)
  Path exists, 5km, cost: 500 energy
  
Player: "Ah! I need to travel 5km to better limestone deposits."
```

**Player can DEBUG their own situation by tracing the chain.**

### Emergent Strategy

```
Player discovers:
- Basalt requires excavation 0.3+
- Excavation 0.3 requires calcium 0.6kg
- Limestone provides calcium
- But limestone is rare at current location

Strategy emerges:
1. Migrate creatures to limestone-rich region
2. Consume limestone to boost calcium
3. Evolve excavation to 0.3
4. Return to basalt-rich region
5. Harvest basalt (previously inaccessible)

This strategy was NEVER scripted.
It emerged from TRACING THE CHAIN.
```

### World Understanding

```
Player explores:
"Why is this region volcanic?"

→ Query coordinate history
  Volcanic eruption at cycle 100M
  
→ Trace origin
  Mantle plume from core heat
  
→ Query core composition
  High uranium content
  
→ Trace origin
  Uranium from kilonova 5B cycles ago
  
Player: "Wow. The volcanic region exists because a neutron star exploded before the solar system formed."

DEEP UNDERSTANDING FROM TRACING THE CHAIN.
```

---

## Implementation

```typescript
// Backward tracing engine
class OriginTracer {
  trace(subject: string, property: string, depth: number = Infinity): ChainLink[] {
    const chain: ChainLink[] = [];
    let current = this.getCurrent(subject, property);
    
    while (depth > 0 && current) {
      // Get immediate precursor
      const precursor = this.getPrecursor(current);
      
      if (!precursor) break;  // Reached the end
      
      chain.push({
        from: precursor,
        to: current,
        process: this.getTransformation(precursor, current),
        cycle: current.cycle
      });
      
      current = precursor;
      depth--;
    }
    
    return chain;
  }
  
  private getPrecursor(current: TraceableEntity): TraceableEntity | null {
    switch (current.type) {
      case 'creature_trait':
        // Trait → composition
        return this.getComposition(current);
      
      case 'creature_composition':
        // Composition → consumed materials
        return this.getConsumedMaterials(current);
      
      case 'consumed_material':
        // Material → planetary location
        return this.getPlanetaryMaterial(current);
      
      case 'planetary_material':
        // Material → formation event
        return this.getFormationEvent(current);
      
      case 'formation_event':
        // Event → precursor materials
        return this.getPrecursorMaterials(current);
      
      case 'precursor_material':
        // Material → accretion
        return this.getAccretionSource(current);
      
      case 'accretion_source':
        // Accretion → stellar origin
        return this.getStellarOrigin(current);
      
      case 'stellar_origin':
        // End of chain (supernova, etc.)
        return null;
    }
  }
}
```

---

## Summary

**The Principle:**

**If you can't work it out, GO DOWN THE CHAIN.**

**What did it used to be?**

- Squirrel → limestone + iron ore
- Limestone → ocean water
- Ocean → comet ice
- Comet → dust grains
- Dust → supernova ejecta

**Every step is addressable.**

**Every transition is queryable.**

**Every property has an origin.**

**Nothing is arbitrary.**

**Nothing is magic.**

**Just trace it backwards.**

**GO DOWN THE CHAIN.**

**That's how you work it out.**
