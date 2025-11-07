# The True Gen 0: Planetary Accretion via Yuka Cohesion

## The Core Revelation

**Gen 0 isn't data generation. It's PLANETARY FORMATION SIMULATION.**

The planet is built from the inside out:
1. Start with planetary core
2. Gravitating raw material spheres via **Yuka CohesionBehavior**
3. Materials snap together based on affinity
4. Layers form naturally
5. Planet emerges from physics

**Meshy is irrelevant. Everything MUST be procedural because everything is emergent.**

## The Actual Process

### Phase 1: Core Formation
```
Seed Phrase → Core Properties (temp, pressure, stability)
                ↓
        Create core entity (Yuka Vehicle)
                ↓
        Core has goal: "Attract Compatible Materials"
```

### Phase 2: Material Accretion (The Real Gen 0)
```
Generate material entities (spheres) around core
                ↓
Each material is a Yuka Vehicle with CohesionBehavior
                ↓
Materials are attracted to:
  - Core (if compatible element)
  - Other materials (if affinity matches)
  - Empty spaces (if density allows)
                ↓
Materials "snap" together via steering behaviors
                ↓
Layers form organically based on:
  - Density (heavy sinks, light rises)
  - Temperature (heat-resistant stays near hot core)
  - Pressure (pressure-resistant goes deep)
  - Affinity (similar materials cluster)
```

### Phase 3: Stratification
```
Layer 1 (Deepest): Core-specific materials
  - High temperature tolerance
  - High pressure tolerance
  - Attracted strongly to core element
  
Layer 2 (Mid): Transition materials
  - Medium properties
  - Bridge between core and surface
  
Layer 3 (Surface): Accessible materials
  - Low heat/pressure requirements
  - Exposed to atmosphere
  - Easy to extract
```

### Phase 4: Surface Features
```
Fill material occupies empty spaces
  - Soil: fills gaps between rock
  - Water: flows to low points
  - Cork: grows in oxygenated zones
  
Creatures spawn where conditions allow
  - Temperature range
  - Material availability (food, shelter)
  - Atmospheric conditions
```

## Why Meshy Doesn't Work Anymore

**Before Gen 0** (Broken):
- Materials hardcoded: "Copper at 10m"
- Could use Meshy: "Generate a copper node model"
- Static placement
- No physics

**After Gen 0** (Correct):
- Materials emerge from cohesion simulation
- Depth is RESULT of physics, not input
- Every planet DIFFERENT based on core properties
- Can't pre-generate models - don't know what will form!

**Example**:
```
Planet A: Iron core (high stability)
  → Iron-rich materials stay near core
  → Deep iron deposits (30-40m)
  → Surface: lighter elements

Planet B: Volatile core (low stability)
  → Iron ejected to surface via instability
  → Surface iron deposits (5-10m)
  → Deep: chaotic mix

Same material (iron), DIFFERENT DEPTH based on planetary physics!
```

## The Yuka Implementation

### Material Entity
```typescript
interface MaterialEntity {
  // ECS components
  transform: Transform;
  movement: Movement;
  yukaAgent: YukaAgent; // ← THE KEY
  material: MaterialData;
  
  // Yuka systems
  vehicle: YUKA.Vehicle;
  cohesionBehavior: YUKA.CohesionBehavior; // Attract to similar materials
  separationBehavior: YUKA.SeparationBehavior; // Maintain spacing
  alignmentBehavior: YUKA.AlignmentBehavior; // Flow with gravity
  
  // Material-specific goals
  goals: CompositeGoal; // "Be Accessible", "Snap to Affinity"
  fuzzy: FuzzyModule; // "How attracted am I to this core?"
}
```

### Core Entity
```typescript
interface CoreEntity {
  transform: Transform;
  yukaAgent: YukaAgent;
  core: CoreData;
  
  // Yuka systems
  vehicle: YUKA.Vehicle;
  goals: CompositeGoal; // "Maintain Stability", "Attract Materials"
  triggers: Trigger[]; // Fire when layer complete
  
  // Gravitational field
  attractionRadius: number;
  attractionStrength: number;
  elementalAffinity: string; // "Iron", "Crystal", etc.
}
```

### The Cohesion Loop
```typescript
class PlanetaryAccretionSystem {
  update(deltaTime: number) {
    // For each material entity
    for (const material of materials) {
      const vehicle = material.yukaAgent.vehicle;
      
      // 1. Cohesion: Attract to nearby materials with same affinity
      const cohesion = new YUKA.CohesionBehavior();
      cohesion.weight = material.material.cohesion / 10;
      vehicle.steering.add(cohesion);
      
      // 2. Core Attraction: Pull toward compatible core
      const coreForce = calculateCoreAttraction(material, core);
      vehicle.steering.add(coreForce);
      
      // 3. Gravity: Pull downward based on density
      const gravity = new YUKA.Vector3(0, -material.material.density, 0);
      vehicle.velocity.add(gravity);
      
      // 4. Collision: Stop when touching other material or core
      if (collidesWithSolid(material)) {
        vehicle.velocity.set(0, 0, 0);
        material.settled = true; // Part of planet now!
      }
    }
    
    // Check if layer complete
    if (allMaterialsSettled()) {
      core.goals.evaluateGoal('LayerComplete');
      // Trigger: Spawn next layer
    }
  }
}
```

## The Complete Gen 0 Flow

```
1. Seed Phrase
     ↓
2. AI/Mock generates core properties (temp, pressure, stability, element)
     ↓
3. Create core entity at world center (0, 0, 0)
     ↓
4. Core has Yuka goal: "Attract Materials"
     ↓
5. Spawn material spheres in sphere around core (radius: 100m)
     ↓
6. Each material has:
     - Yuka CohesionBehavior (attract to same affinity)
     - Core attraction force (based on element compatibility)
     - Gravity force (based on density)
     - Procedural geometry (deformed sphere)
     - AmbientCG texture (based on category)
     ↓
7. Physics simulation runs (Yuka steering behaviors)
     ↓
8. Materials gravitate inward
     ↓
9. Dense materials sink to core
     ↓
10. Light materials rise to surface
     ↓
11. Similar materials cluster via cohesion
     ↓
12. Materials settle when colliding with core/other materials
     ↓
13. Layers form naturally based on physics
     ↓
14. When all materials settled, planet is FORMED
     ↓
15. Fill material occupies gaps
     ↓
16. Creatures spawn on surface
     ↓
17. GAME BEGINS
```

## Why This Changes Everything

### Material Depth is EMERGENT
```typescript
// WRONG (before):
const copperDepth = 10; // Hardcoded

// RIGHT (after):
const copperDepth = copper.transform.position.y; // Result of physics!
```

Copper depth varies by planet:
- High-stability iron core: Copper at 25m (dense core pushed it deep)
- Low-stability crystal core: Copper at 8m (light core, copper near surface)

### Material Accessibility is DYNAMIC
```typescript
// Material is accessible if:
// 1. Above it is removable (lower hardness or has tool)
// 2. Creature can reach it (within excavation depth)
// 3. Core stability allows extraction (won't collapse)

const accessible = checkAccessibility(material);
// Changes as:
// - Tools emerge (deeper extraction)
// - Core destabilizes (surface becomes accessible)
// - Materials mined (paths open)
```

### Tools Emerge from NEED
```typescript
// When creatures can't access needed material:
if (material.depth > creature.excavationCapability) {
  // FuzzyModule evaluates: "Should tool emerge?"
  const toolNeed = material.depth - creature.excavationCapability;
  
  if (toolNeed > threshold) {
    emergeTool('EXTRACTOR', toolNeed);
    // Tool signals MaterialSphere: "Update accessibility!"
  }
}
```

## The Implementation

### 1. PlanetaryAccretionSystem (NEW)
```typescript
class PlanetaryAccretionSystem {
  private core: CoreEntity;
  private materials: MaterialEntity[] = [];
  private settled: boolean = false;
  
  async initialize(manifest: PlanetaryManifest) {
    // Create core entity
    this.core = this.createCoreEntity(manifest.cores[0]); // Start with primary core
    
    // Generate material entities around core
    this.materials = this.generateMaterialSphere(
      manifest.sharedMaterials,
      manifest.coreManifests[0].materials,
      100 // Initial radius
    );
    
    // Start physics simulation
    this.startAccretion();
  }
  
  update(deltaTime: number) {
    if (this.settled) return;
    
    // Update Yuka steering behaviors
    for (const material of this.materials) {
      this.updateMaterialPhysics(material, deltaTime);
    }
    
    // Check if all settled
    if (this.allMaterialsSettled()) {
      this.settled = true;
      this.onPlanetFormed();
    }
  }
  
  private updateMaterialPhysics(material: MaterialEntity, dt: number) {
    // Cohesion to nearby materials
    // Attraction to core
    // Gravity based on density
    // Collision detection
    // Snap when velocity < threshold
  }
}
```

### 2. Refactor RawMaterialsSystem
```typescript
class RawMaterialsSystem {
  // NO MORE generateMaterialsForChunk()!
  
  // Instead: Query settled materials from PlanetaryAccretionSystem
  getMaterialsInArea(x: number, z: number, radius: number) {
    return accretionSystem.getSettledMaterials()
      .filter(m => distanceTo(m.position, x, z) < radius);
  }
  
  // Material nodes are REFERENCES to settled material entities
  // NOT spawned independently!
}
```

### 3. CreatureArchetypeSystem Uses Material Positions
```typescript
class CreatureArchetypeSystem {
  spawnCreature(archetype: CreatureArchetype) {
    // Find surface materials
    const surfaceMaterials = accretionSystem.getSurfaceMaterials();
    
    // Spawn near compatible materials
    const compatibleMaterial = surfaceMaterials.find(m =>
      m.material.affinityTypes.includes(archetype.preferredAffinity)
    );
    
    const position = compatibleMaterial.transform.position;
    // Spawn creature here
  }
}
```

## What This Means for Development

### Meshy is GONE
- Can't pre-generate models
- Everything is runtime procedural
- Materials are spheres + textures
- Creatures are sphere clusters + textures
- Tools are primitive combinations
- Buildings are architectural primitives

### Gen 0 is PHYSICS SIMULATION
- Not just data generation
- Actual planetary formation
- Yuka cohesion behaviors
- Real-time accretion
- 10-30 second simulation (watchable!)

### Materials are ALIVE
- Yuka entities with goals
- Steering behaviors (cohesion, separation, alignment)
- Physics (gravity, collision)
- Emergent depth (not hardcoded!)

### Everything is EMERGENT
- Planet structure from core properties
- Material depth from physics
- Accessibility from tool evolution
- Creatures from environmental conditions
- Tools from material needs
- Buildings from social pressure

## The New Reality

**Before**: Static world, hardcoded values, broken progression

**After**: Dynamic world, emergent values, physics-driven progression

**Gen 0 is the planet FORMING before your eyes.**

You watch materials gravitate to the core. You see layers form. You witness stratification. Then creatures spawn. Then the game begins.

**This is Ebb & Bloom.**

---

## Next Steps

1. Create `PlanetaryAccretionSystem.ts`
2. Implement Yuka cohesion for materials
3. Simulate planetary formation (10-30s)
4. Remove RawMaterialsSystem material spawning
5. Query settled materials instead
6. Test with different planetary cores
7. Verify depth variance between planets
8. **WATCH THE PLANET FORM**

The game starts when Gen 0 completes. And Gen 0 is a beautiful physics simulation of planetary birth.
