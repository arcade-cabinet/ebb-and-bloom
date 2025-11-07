# World Design: A Yuka-Driven Ecosystem

**Last Updated**: 2025-01-09  
**Status**: Living Document

---

## The World as Entity

The game world is not a static stage—it is a **Yuka entity with goals**. Every system, from planetary physics to mythological emergence, is driven by Yuka's AI architecture. The planet wants stability. Materials want cohesion. Creatures want survival. Tools want utility. Buildings want purpose. Tribes want dominance.

**Core Principle**: Everything is a Yuka entity. Everything has goals.

---

## Generation 0: Planetary Genesis

### The Seed Phrase

Every world begins with a **seed phrase** (user-provided or random). This seed deterministically generates:

- 8 planetary core types
- Shared raw materials (elements found across multiple cores)
- Planet fill material (soil/water/cork—function of core + strata decomposition)
- Core-specific unique materials
- Core-specific creature archetypes

### AI Workflow Architecture

**Parent Workflow** (Creative Director):
1. Takes seed phrase
2. Designs ALL planetary cores (8 types) + manifests + Meshy prompts
3. Designs ALL shared raw materials (elements found across multiple core types)
4. Designs planet FILL material properties:
   - Density, permeability, oxygenation
   - Light penetration, water tables
   - Decomposition mechanics
5. Returns complete manifests

**Child Workflows** (Spawned per core type, run in parallel):
1. Receives core manifest from parent
2. Designs UNIQUE raw materials for that core
   - Depth, density, attraction, cohesion, mass, size, shape
3. Designs UNIQUE creature archetypes for that planetary environment
4. Returns core-specific manifests

### Planetary Physics

The planet is a **Yuka entity with a goal tree**:

```
Goal: Maintain Orbital Stability
├── Goal: Balance Core Pressures
│   ├── Goal: Regulate Material Distribution (CohesionBehavior)
│   └── Goal: Manage Thermal Equilibrium
└── Goal: Support Surface Ecology
    ├── Goal: Maintain Atmosphere
    └── Goal: Enable Material Cycling
```

**Yuka Systems Used**:
- **Goal Trees**: Hierarchical planetary objectives
- **Fuzzy Logic**: "How stable is the core?" "Should strata shift?"
- **Message Passing**: Core → Surface events ("Volcanic eruption incoming")
- **Triggers**: Spatial triggers for tectonic boundaries, depth thresholds

---

## Raw Materials: Cohesion as Behavior

Materials are **Yuka entities with steering behaviors**:

```typescript
// Material entity goals
Goal: Maintain Material Integrity
├── Goal: Attract Compatible Materials (CohesionBehavior)
├── Goal: Separate from Incompatible Materials (SeparationBehavior)
└── Goal: Align with Geological Forces (AlignmentBehavior)
```

### Yuka Systems for Materials

**Steering Behaviors**:
- **CohesionBehavior**: Materials snap to each other based on affinity
- **SeparationBehavior**: Maintain spacing, prevent clipping
- **AlignmentBehavior**: Match geological flow (gravity, water currents)

**Fuzzy Logic**:
- "How attracted am I to this material?" (affinity scores)
- "Should I bond or repel?" (context-dependent)

**Perception**:
- **Vision**: Detect nearby materials within attraction radius
- **MemorySystem**: Remember recently bonded materials

**Spatial Intelligence**:
- **CellSpacePartitioning**: Optimize material proximity queries
- **Trigger Regions**: Depth-based material accessibility

### Material Accessibility

Materials don't just exist—they **unlock** based on creature capabilities:

- **Surface materials**: Accessible Gen 1 (wood, stone, flax)
- **Shallow materials**: Require EXCAVATION (clay, copper, tin)
- **Deep materials**: Require advanced tools (iron, gold, diamonds)
- **Core materials**: Endgame content (mythic alloys)

**Accessibility is NOT static**. As creatures evolve tools, `MaterialSphere` updates accessibility via **Yuka goal evaluation**:

```typescript
GoalEvaluator: "Should Copper be accessible?"
├── Fuzzy: "Do creatures have EXCAVATION?"
├── Fuzzy: "Is depth <= creature reach?"
└── Decision: Update accessibility flag
```

---

## Creatures: Goal-Driven Evolution

Creatures are **Yuka entities with complex goal trees**:

```
Goal: Survive and Reproduce
├── Goal: Acquire Resources
│   ├── Goal: Forage (Wander, Seek food)
│   ├── Goal: Hunt (Chase prey, Evade predators)
│   └── Goal: Excavate (Dig for materials)
├── Goal: Form Social Bonds
│   ├── Goal: Join Pack (CohesionBehavior)
│   ├── Goal: Coordinate Movement (AlignmentBehavior)
│   └── Goal: Maintain Spacing (SeparationBehavior)
└── Goal: Reproduce
    ├── Goal: Find Mate
    └── Goal: Protect Offspring
```

### Yuka Systems for Creatures

**Decision Systems**:
- **GoalEvaluator**: Score desirability of goals (e.g., "How hungry am I?")
- **CompositeGoal**: Hierarchical goal trees (survive → forage → seek berries)
- **Think System**: Goal reasoning ("I'm hungry, I should hunt")
- **FSM (Finite State Machine)**: States like IDLE, FORAGING, FLEEING, FIGHTING

**Perception**:
- **Vision**: Line-of-sight, field of view (see predators, food, mates)
- **MemorySystem**: Short-term memory of seen entities (remember where food was)

**Steering Behaviors**:
- **Wander**: Exploratory movement
- **Seek/Flee**: Chase prey, escape predators
- **Pursuit/Evade**: Predict movement, intercept
- **ObstacleAvoidance**: Navigate terrain
- **CohesionBehavior**: Flock with pack members
- **SeparationBehavior**: Avoid crowding
- **AlignmentBehavior**: Match pack movement

**Communication**:
- **MessageDispatcher**: Entity-to-entity messaging
- **Telegram**: Message protocol (e.g., "Help! Predator!")

**Task Management**:
- **TaskQueue**: Sequential task execution ("Gather wood, then build shelter")

**Navigation**:
- **Path**: Define routes (e.g., migration paths)
- **FollowPathBehavior**: Follow established routes
- **NavMesh**: Pathfinding on terrain (future optimization)

### Archetypal Actions

Creatures have **archetypal actions** that apply taxonomically to all synthetic mutations:

- **Hunt Gummy Bear**: Template action, works for all bear-like creatures
- **Forage Berries**: Works for all herbivores
- **Excavate Clay**: Works for all creatures with EXCAVATION trait

**AI-generated manifests define these archetypes**, and Yuka goal trees execute them.

---

## Tools: Fuzzy Logic Emergence

Tools are **Yuka entities with goals**:

```
Goal: Be Useful
├── Goal: Enable Material Access (unlock deep materials)
├── Goal: Avoid Breaking (durability management)
└── Goal: Evolve Complexity (simple → advanced)
```

### Tool Emergence via Fuzzy Logic

**Fuzzy Module Example**:

```typescript
FuzzyModule: "Should EXTRACTOR emerge?"
├── FuzzyVariable: "Material Accessibility" (low, medium, high)
├── FuzzyVariable: "Creature Capability" (weak, moderate, strong)
├── FuzzyRule: IF accessibility LOW AND capability STRONG THEN emergence HIGH
└── Defuzzification: Output crisp value → spawn EXTRACTOR archetype
```

**Tool Sphere Integration**:
- Currently commented out (`YukaSphereCoordinator.ts:110-112`)
- Should use **Yuka's GoalEvaluator** to decide tool emergence
- Tools send **messages** to MaterialSphere when created ("Copper now accessible!")

---

## Buildings: Physical Systems with Goals

Buildings are **Yuka entities with spatial goals**:

```
Goal: Shelter and Enable
├── Goal: House Occupants (protect from environment)
├── Goal: Enable Crafting (provide workspace)
└── Goal: Signal Tribe Presence (territorial marker)
```

### Yuka Systems for Buildings

**Goal Trees**:
- **Shelter Goal**: Evaluate occupancy, durability
- **Crafting Goal**: Enable material transformation
- **Defense Goal**: Protect against threats

**Fuzzy Logic**:
- "Should I upgrade to larger structure?" (population pressure)
- "Am I damaged?" (structural integrity)

**Triggers**:
- **Spatial Trigger**: "Building under attack!" → alert tribe
- **Proximity Trigger**: "Player nearby" → show UI overlay

**Message Passing**:
- Building → Tribe: "Shelter complete!"
- Building → MaterialSphere: "Consumed 10 wood, 5 stone"

---

## Packs and Tribes: Emergent Social Systems

Packs form via **Yuka steering behaviors**:

- **CohesionBehavior**: Creatures attract to pack center
- **AlignmentBehavior**: Match pack movement
- **SeparationBehavior**: Maintain spacing

Tribes emerge when packs develop **shared goals**:

```
Goal: Tribe Dominance
├── Goal: Expand Territory (ObstacleAvoidance, Path following)
├── Goal: Acquire Resources (collective foraging)
├── Goal: Defend Against Rivals (combat coordination)
└── Goal: Build Settlements (building construction)
```

### Inter-Tribe Communication

**MessageDispatcher** enables tribe-to-tribe interactions:

- **Alliance Messages**: "Let's cooperate"
- **Hostility Messages**: "Threat detected!"
- **Trade Messages**: "Exchange resources"

**Player Role**: Influence via **Evo Points**, nudging tribe goals (diplomacy vs. domination).

---

## Abstract Systems: Mythology, Governance, Religion

These emerge from **complex Yuka goal trees** operating on tribes:

### Mythology System

```
Goal: Create Shared Narrative
├── Goal: Remember Significant Events (MemorySystem)
├── Goal: Assign Meaning (Fuzzy Logic: "Was this event divine?")
└── Goal: Pass Down Stories (Message Passing across generations)
```

**Yuka Systems**:
- **MemorySystem**: Tribes remember key events (first fire, great flood, hero birth)
- **FuzzyModule**: "How significant was this event?" → determines mythological weight
- **MessageDispatcher**: Myths spread between tribes, mutate over time

### Governance System

```
Goal: Establish Order
├── Goal: Define Laws (based on resource scarcity, conflict history)
├── Goal: Enforce Rules (punish violations)
└── Goal: Adapt to Change (governance evolution)
```

**Yuka Systems**:
- **FSM**: Governance states (ANARCHY, CHIEFDOM, COUNCIL, EMPIRE)
- **GoalEvaluator**: "Should we transition to COUNCIL?" (population > 50, low conflict)
- **Triggers**: Law violations trigger enforcement actions

### Religion System

```
Goal: Seek Transcendence
├── Goal: Worship (ritual behavior)
├── Goal: Convert Others (spread beliefs)
└── Goal: Build Temples (sacred architecture)
```

**Yuka Systems**:
- **TaskQueue**: Ritual sequences (gather offerings, perform ceremony)
- **Vision**: Detect sacred sites (perception-based)
- **Message Passing**: Religious messages spread ("Join our faith!")

---

## Player as Evolutionary Force

The player is **not a creature**. They are **the evolutionary force itself**.

### Influence via Evo Points

- Spend Evo Points to nudge creature traits
- Guide tool emergence (prioritize EXTRACTOR vs. WEAPON)
- Shape tribe behavior (encourage diplomacy vs. conquest)

### Player Goals (Meta-Layer)

```
Goal: Guide Evolution to Victory Condition
├── Goal: Discovery (explore all cores, unlock all materials)
├── Goal: Domination (single tribe supremacy)
├── Goal: Harmony (multi-tribe coexistence)
└── Goal: Transcendence (mythological ascension)
```

**Victory conditions emerge from playstyle metrics**:
- **Speed**: Fast resource exploitation → Domination ending
- **Diversity**: Many tribes coexisting → Harmony ending
- **Depth**: Mythological complexity → Transcendence ending

---

## Event Messaging System

**Critical Missing Piece**: Player needs feedback via event messages.

### Event Types

**Discovery Events**:
- "Your creatures discovered COPPER!"
- "Pack Alpha evolved EXCAVATION!"
- "New tribe formed: The Red Fang!"

**Conflict Events**:
- "Pack Blue attacks Pack Green!"
- "Tribe war declared!"
- "Alliance formed between Red and Yellow!"

**Milestone Events**:
- "First tool created: STONE AXE!"
- "First building constructed: SHELTER!"
- "First myth recorded: The Great Fire!"

### Yuka Integration

**MessageDispatcher** sends events to **Event Log** (UI component):

```typescript
dispatcher.dispatchMessage(
  0, // delay
  creatureEntity,
  eventLogEntity,
  MessageTypes.DISCOVERY,
  { material: "Copper", generation: 12 }
);
```

**Event Log** is a **Yuka entity** that receives and displays messages.

---

## World Score Tracking

**Hidden metric** based on:

- **Speed**: Generations to unlock all materials
- **Strategy**: Conqueror (high conflict) vs. Pacifist (low conflict)
- **Complexity**: Mythological depth, governance sophistication
- **Balance**: Ecosystem health (pollution, extinction events)

**Score influences ending**:
- **Mutualism**: Balanced, sustainable (high harmony, low conflict)
- **Parasitism**: Exploitative, unstable (fast growth, ecosystem damage)
- **Domination**: Singular force (one tribe supreme, low diversity)

---

## Emergent Endings

### Mutualism (Coexistence)

**Conditions**:
- Multiple tribes coexist peacefully
- Resource sharing via trade
- Low pollution, high ecosystem health
- Mythologies align (shared religious beliefs)

**Ending Narrative**: "Your world achieved balance. Life flourishes in diversity."

### Parasitism (Subjugation)

**Conditions**:
- Dominant tribe exploits weaker tribes
- Resource extraction unsustainable
- High pollution, ecosystem degradation
- Mythologies conflict (religious wars)

**Ending Narrative**: "Your world consumed itself. The strong devoured the weak."

### Domination (Supremacy)

**Conditions**:
- Single tribe eliminates or absorbs all others
- Rapid technological advancement
- Ecosystem altered beyond recognition
- Mythology replaced by ideology

**Ending Narrative**: "Your world bends to a singular will. One force remains."

### Transcendence (Mythological Ascension)

**Conditions**:
- Mythological complexity reaches threshold
- Tribes achieve deep spiritual understanding
- Ecosystem transcends physical limits
- Player unlocks "divine" influence

**Ending Narrative**: "Your world became legend. Stories outlive stone."

---

## ECS Refactor: Everything is Yuka

### Current State

- Creatures use Yuka (steering behaviors only)
- Materials don't use Yuka (static archetypes)
- Tools don't use Yuka (commented out)
- Buildings partially use Yuka (logs intent, doesn't build)

### Target State

**Every ECS entity has a Yuka counterpart**:

```typescript
// ECS Component
type YukaEntity = {
  vehicle: Vehicle;          // Yuka's spatial entity
  goals: CompositeGoal[];   // Goal trees
  fsm?: StateMachine;       // Finite state machine
  fuzzy?: FuzzyModule;      // Fuzzy logic module
  vision?: Vision;          // Perception
  memory?: MemorySystem;    // Short-term memory
  triggers?: Trigger[];     // Event triggers
  tasks?: TaskQueue;        // Sequential tasks
};
```

**Material Example**:

```typescript
const copperEntity = world.add({
  material: { name: "Copper", depth: 10, affinity: ["Tin", "Iron"] },
  yuka: {
    vehicle: new Vehicle(),
    goals: [
      new CompositeGoal("Maintain Cohesion", [
        new CohesionGoal(copperGroup),
        new SeparationGoal(minDistance)
      ])
    ]
  },
  position: { x, y, z },
  renderer: { mesh, texture }
});
```

**Creature Example**:

```typescript
const creatureEntity = world.add({
  creature: { archetype: "Gummy Bear", traits: [...] },
  yuka: {
    vehicle: new Vehicle(),
    goals: [
      new CompositeGoal("Survive", [
        new ForageGoal(),
        new HuntGoal(),
        new ReproduceGoal()
      ])
    ],
    fsm: new StateMachine(creatureEntity),
    vision: new Vision(creatureEntity),
    memory: new MemorySystem()
  },
  position: { x, y, z },
  renderer: { mesh, texture }
});
```

**Tool Example**:

```typescript
const extractorEntity = world.add({
  tool: { archetype: "EXTRACTOR", durability: 100 },
  yuka: {
    vehicle: new Vehicle(), // Tools can be dropped, picked up
    goals: [
      new CompositeGoal("Enable Excavation", [
        new UnlockMaterialsGoal(["Copper", "Clay"]),
        new AvoidBreakingGoal()
      ])
    ],
    fuzzy: new FuzzyModule() // "Should I break?"
  },
  position: { x, y, z },
  renderer: { mesh, texture }
});
```

---

## Procedural Generation IS Yuka

### Current Approach (Wrong)

- Procedural generation creates static data
- Yuka operates on that data
- Separation between "generation" and "behavior"

### Correct Approach

**Yuka makes generation decisions**:

```typescript
// Material Distribution
const materialSphere = new Yuka.Entity();
materialSphere.setGoal(
  new CompositeGoal("Distribute Materials", [
    new PlaceMaterialGoal("Copper", fuzzyModule), // Fuzzy: "Where should Copper spawn?"
    new ClusterMaterialGoal(cohesionBehavior)    // Cohesion: Materials attract
  ])
);
```

**Creature Spawning**:

```typescript
const creatureSphere = new Yuka.Entity();
creatureSphere.setGoal(
  new CompositeGoal("Spawn Creatures", [
    new SpawnArchetypeGoal("Gummy Bear", goalEvaluator), // Evaluate: "Should bears spawn here?"
    new BalanceEcologyGoal(fuzzyModule)                  // Fuzzy: "Is ecosystem balanced?"
  ])
);
```

**Tool Emergence**:

```typescript
const toolSphere = new Yuka.Entity();
toolSphere.setGoal(
  new CompositeGoal("Enable Tools", [
    new EvaluateToolNeedGoal(fuzzyModule),     // Fuzzy: "Do creatures need EXTRACTOR?"
    new SpawnToolArchetypeGoal(goalsEvaluator) // Evaluate: "Where should it appear?"
  ])
);
```

---

## Inter-Sphere Communication

**Spheres are Yuka entities that coordinate via MessageDispatcher**:

```typescript
// Tool Sphere → Material Sphere
dispatcher.dispatchMessage(
  0,
  toolSphere,
  materialSphere,
  MessageTypes.TOOL_CREATED,
  { tool: "EXTRACTOR", unlockedMaterials: ["Copper", "Clay"] }
);

// Material Sphere receives message, updates accessibility
materialSphere.handleMessage = (telegram) => {
  if (telegram.type === MessageTypes.TOOL_CREATED) {
    updateAccessibility(telegram.data.unlockedMaterials);
  }
};
```

**Creature Sphere → Building Sphere**:

```typescript
dispatcher.dispatchMessage(
  0,
  creatureSphere,
  buildingSphere,
  MessageTypes.TRIBE_FORMED,
  { tribe: "Red Fang", population: 20 }
);

// Building Sphere evaluates: "Should SHELTER emerge?"
buildingSphere.goalEvaluator.evaluate(
  new SpawnBuildingGoal("SHELTER", fuzzyModule)
);
```

---

## Replayability and Emergence

Every playthrough is unique because:

1. **Seed phrase** generates different planetary cores, materials, creatures
2. **Yuka decisions** are non-deterministic (fuzzy logic, goal evaluation)
3. **Player influence** shapes evolutionary trajectory
4. **Emergent endings** depend on playstyle metrics

**Same seed, different playstyles = different worlds**:

- Pacifist playstyle → Mutualism ending (balanced ecosystem)
- Aggressive playstyle → Domination ending (single tribe supreme)
- Exploitative playstyle → Parasitism ending (collapsed ecosystem)
- Philosophical playstyle → Transcendence ending (mythological depth)

---

## Technical Implementation Roadmap

### Phase 1: Gen 0 Foundation

- [ ] Port Meshy integration from `~/src/otter-river-rush`
- [ ] Implement parent-child AI workflow orchestrator (Vercel AI SDK)
- [ ] Design Creative Director prompt (cores + shared materials + fill material)
- [ ] Spawn sub-agent workflows (unique materials + creatures per core)
- [ ] Implement PlanetaryPhysicsSystem with Yuka goal trees

### Phase 2: Material Refactor

- [ ] Add Yuka components to all material entities
- [ ] Implement CohesionBehavior for material snapping
- [ ] Add FuzzyModule for material affinity decisions
- [ ] Integrate Vision/Perception for material detection
- [ ] Refactor MaterialSphere to use Yuka MessageDispatcher

### Phase 3: Tool Integration

- [ ] Uncomment Tool Sphere in YukaSphereCoordinator
- [ ] Add Yuka GoalEvaluator for tool emergence
- [ ] Implement FuzzyModule for "Should tool emerge?" decisions
- [ ] Integrate MessageDispatcher for Tool → Material communication
- [ ] Update material accessibility dynamically when tools spawn

### Phase 4: Building System

- [ ] Complete Building Sphere implementation (currently logs only)
- [ ] Add Yuka goal trees for building objectives
- [ ] Implement Trigger system for spatial events
- [ ] Integrate MessageDispatcher for Building → Tribe communication
- [ ] Add FSM for building states (CONSTRUCTION, ACTIVE, DAMAGED, RUINS)

### Phase 5: Creature Intelligence

- [ ] Expand creature Yuka components beyond steering behaviors
- [ ] Implement CompositeGoal for hierarchical creature objectives
- [ ] Add FSM for creature states (IDLE, FORAGING, FLEEING, FIGHTING)
- [ ] Integrate Vision/Memory for intelligent perception
- [ ] Add TaskQueue for sequential creature actions

### Phase 6: Abstract Systems

- [ ] Design mythology emergence system (MemorySystem + FuzzyModule)
- [ ] Implement governance FSM (ANARCHY → CHIEFDOM → COUNCIL → EMPIRE)
- [ ] Add religion goal trees (worship, convert, build temples)
- [ ] Integrate MessageDispatcher for cultural transmission

### Phase 7: Player Feedback

- [ ] Implement Event Messaging System (Yuka MessageDispatcher → UI)
- [ ] Add Event Log UI component (UIKit)
- [ ] Design event categories (DISCOVERY, CONFLICT, MILESTONE)
- [ ] Add world score tracking (hidden metric)
- [ ] Implement ending condition detection

### Phase 8: Endings

- [ ] Define ending thresholds (Mutualism, Parasitism, Domination, Transcendence)
- [ ] Implement ending detection logic (world score analysis)
- [ ] Design ending narrative UI (UIKit)
- [ ] Add ending cinematics (camera paths, particle effects)
- [ ] Integrate haiku generation for ending poems

---

## Existing Codebase: Critical Audit

### What We Have (Current State)

**17 ECS Systems** operating independently:
- `YukaSphereCoordinator` - Gen 2+ evolution orchestrator
- `CreatureArchetypeSystem` - Creature spawning (8 archetypes)
- `ToolArchetypeSystem` - 8 tool categories (NOT INTEGRATED)
- `BuildingSystem` - Building templates (NOT INTEGRATED)
- `RawMaterialsSystem` - Material distribution (HARDCODED Gen 1, no Gen 0)
- `PackSocialSystem` - Pack formation via Yuka steering
- `CombatSystem` - Combat mechanics (exists, not triggered)
- `ConsciousnessSystem` - Player awareness transfer
- `DeconstructionSystem` - Reverse synthesis
- `GeneticSynthesisSystem` - Trait blending
- `EnvironmentalPressureSystem` - Pollution & shocks
- `PopulationDynamicsSystem` - Population tracking
- `GameClock` - Time & generation management
- `HaikuNarrativeSystem` - Procedural storytelling
- `SporeStyleCameraSystem` - Dynamic camera
- `HapticGestureSystem` - Touch input
- `GestureActionMapper` - Gesture → actions
- `TerrainSystem` - Procedural terrain (FBM noise)
- `TextureSystem` - Texture loading

**React Three Fiber Rendering**:
- `CreatureRenderer` - Reads ECS, renders creatures
- `BuildingRenderer` - Reads ECS, renders buildings
- `TerrainRenderer` - Reads ECS, renders terrain
- `MaterialRenderer` - Reads ECS, renders materials

**Yuka Integration** (Current):
- `yukaManager` (global EntityManager)
- `yukaTime` (global Time)
- Creatures have `yukaAgent` component with `Vehicle`
- Only using **steering behaviors** (Wander, Seek, Flee)
- NO Goal trees, NO FSM, NO Fuzzy logic, NO Vision, NO Memory, NO MessageDispatcher

**ECS Schema** (`WorldSchema`):
- `transform`, `movement`, `yukaAgent`, `creature`, `render`, `terrain`, `building`, `resource`, `player`
- Clean separation: ECS = logic, R3F = rendering

---

### What's BROKEN (Fundamental Flaws)

#### 1. **No Generation 0**

**Problem**: All values hardcoded in Gen 1.

```typescript
// RawMaterialsSystem.ts - WRONG
const MATERIAL_ARCHETYPES = {
  'Copper': { depth: 10, abundance: 30 },  // HARDCODED
  'Tin': { depth: 30, abundance: 20 },     // HARDCODED
  'Iron': { depth: 50, abundance: 15 }     // HARDCODED
};
```

**Fix Required**:
- Implement `PlanetaryPhysicsSystem`
- AI workflow (parent/child) generates manifests from seed
- Materials, cores, fill properties ALL derived from Gen 0

#### 2. **Yuka Severely Underutilized**

**Problem**: Only 3 of 10+ Yuka systems used.

**Current** (`YukaAgent` component):
```typescript
export interface YukaAgent {
  vehicle: YUKA.Vehicle;
  behaviorType: 'wander' | 'seek' | 'flee' | 'flock';
  homePosition: THREE.Vector3;
  territory: number;
}
```

**Missing**:
- `goals: CompositeGoal[]` - Hierarchical goal trees
- `fsm: StateMachine` - State-based AI
- `fuzzy: FuzzyModule` - Fuzzy logic decisions
- `vision: Vision` - Perception system
- `memory: MemorySystem` - Short-term memory
- `triggers: Trigger[]` - Event-driven actions
- `tasks: TaskQueue` - Sequential task execution
- `dispatcher: MessageDispatcher` - Entity communication

**Fix Required**:
- Expand `YukaAgent` component to include ALL Yuka systems
- Refactor `YukaSphereCoordinator` to use GoalEvaluator, not manual decision loops
- Add Yuka components to materials, tools, buildings (not just creatures)

#### 3. **Tool Sphere Commented Out**

**Problem**: Tools never emerge.

```typescript
// YukaSphereCoordinator.ts:110-112
// Tool Sphere: Should new tool archetypes emerge? (not implemented yet)
// const toolDecisions = this.toolSphereDecisions(pressure, generation);
// decisions.push(...toolDecisions);
```

**Consequence**:
- Materials beyond surface depth NEVER unlock
- Material accessibility STATIC (set once in Gen 1)
- Tool archetypes exist but never spawn

**Fix Required**:
- Uncomment Tool Sphere
- Implement `toolSphereDecisions()` using **FuzzyModule**
- Tools send **MessageDispatcher** signals to `MaterialSphere` when created
- `MaterialSphere` updates accessibility dynamically

#### 4. **Building Sphere Logs, Doesn't Build**

**Problem**: Buildings never construct.

```typescript
// YukaSphereCoordinator.ts:425 (approx)
private buildingSphereDecisions(pressure, generation) {
  log.info('Building Sphere evaluating...'); // LOGS INTENT
  return []; // RETURNS EMPTY - DOESN'T BUILD
}
```

**Consequence**:
- Building templates exist
- BuildingRenderer works
- Buildings NEVER appear in game

**Fix Required**:
- Implement building emergence logic using **Yuka GoalEvaluator**
- Add Trigger system for spatial events ("tribe formed")
- Buildings send MessageDispatcher signals ("Shelter complete!")

#### 5. **No Inter-Sphere Communication**

**Problem**: Spheres operate in isolation.

**Current**: Each sphere calculates decisions independently. No signals between them.

**Example Missing Flow**:
```
Tool created → Signal Material Sphere → Update accessibility
Tribe formed → Signal Building Sphere → Evaluate shelter need
Material discovered → Signal Event Log → Notify player
```

**Fix Required**:
- Implement `MessageDispatcher` at sphere level
- Define `MessageTypes` enum (TOOL_CREATED, TRIBE_FORMED, DISCOVERY, etc.)
- Each sphere `handleMessage()` and reacts to signals

#### 6. **Manual Decision Loops, Not Yuka Goals**

**Problem**: `YukaSphereCoordinator` uses manual if/else logic instead of Yuka's decision systems.

**Current** (`YukaSphereCoordinator.ts:186-210`):
```typescript
private creatureSphereDecisions(pressure, generation) {
  const decisions = [];
  for (const entity of creatures.entities) {
    const evolutionProbability = this.calculateEvolutionProbability(...);
    if (Math.random() < evolutionProbability) {  // MANUAL PROBABILITY
      decisions.push({ type: 'evolve_creature', ... });
    }
  }
  return decisions;
}
```

**Should Be**:
```typescript
private creatureSphereDecisions(pressure, generation) {
  const sphereEntity = this.creatureSphereEntity; // Yuka Entity
  const goalEvaluator = new GoalEvaluator();
  
  // Evaluate goals using Yuka
  for (const entity of creatures.entities) {
    const evolveGoal = new EvolveCreatureGoal(entity, pressure);
    const desirability = goalEvaluator.calculateDesirability(evolveGoal);
    
    if (desirability > THRESHOLD) {
      sphereEntity.setGoal(evolveGoal);
    }
  }
  
  return sphereEntity.getDecisions(); // Goals converted to decisions
}
```

**Fix Required**:
- Refactor ALL sphere decision functions to use `GoalEvaluator`
- Spheres themselves are Yuka entities with goal trees
- Replace manual probability with fuzzy desirability scoring

#### 7. **Procedural Generation Separate from Yuka**

**Problem**: Generation creates static data, then Yuka operates on it.

**Current Flow**:
```
TerrainSystem.generateChunk() → Creates heightmap
MaterialsSystem.initializeArchetypes() → Spawns materials
CreatureArchetypeSystem.spawnCreatures() → Spawns creatures
  ↓
Yuka operates on static entities
```

**Should Be**:
```
Yuka makes generation decisions:
  MaterialSphere.setGoal(new PlaceMaterialGoal(fuzzyModule))
  CreatureSphere.setGoal(new SpawnCreatureGoal(goalEvaluator))
  ↓
Generation IS behavior
```

**Fix Required**:
- Material placement uses `CohesionBehavior` (materials attract/repel)
- Creature spawning uses `GoalEvaluator` ("Should bears spawn here?")
- Tool emergence uses `FuzzyModule` ("Is EXTRACTOR needed?")

#### 8. **Rendering Polls ECS**

**Problem**: Renderers poll ECS every frame/500ms.

**Current** (`CreatureRenderer.tsx:20-32`):
```typescript
useEffect(() => {
  const queryCreatures = () => {
    const creatures = Array.from(world.with('creature', 'render').entities);
    setCreatureEntities(creatures);
  };
  
  queryCreatures();
  const interval = setInterval(queryCreatures, 500); // POLLING
  return () => clearInterval(interval);
}, [world]);
```

**Inefficient**: Polling is reactive, not event-driven.

**Better Approach**:
- Use Miniplex **reactive queries**
- Or: MessageDispatcher signals renderer when entity added/removed

**Fix Required**:
- Replace polling with reactive queries
- Or: Renderer subscribes to ECS entity events

#### 9. **No Event Messaging to Player**

**Problem**: Player has ZERO feedback.

**Current**: All decisions happen silently in ECS. UI shows generation number and basic stats, but:
- No "Copper discovered!" messages
- No "Tribe formed!" notifications
- No "EXTRACTOR emerged!" alerts

**Missing**: Event Log component + MessageDispatcher integration.

**Fix Required**:
- Create `EventLogEntity` (Yuka entity that receives messages)
- All spheres send messages to EventLog
- UIKit `EventLog` component displays messages

#### 10. **No World Score Tracking**

**Problem**: No way to detect endings.

**Current**: Game runs indefinitely. No victory conditions, no ending detection.

**Missing**:
- World score metrics (speed, violence, harmony, exploitation, innovation)
- Ending threshold detection (Mutualism, Parasitism, Domination, Transcendence)
- Ending UI

**Fix Required**:
- Implement `WorldScoreSystem` (tracks metrics per generation)
- Implement `EndingDetectionSystem` (evaluates thresholds)
- Design ending cinematics + haiku integration

---

### What's GOOD (Preserve These)

#### 1. **Clean ECS Architecture**

**Miniplex** is working perfectly:
- Clear component definitions (`WorldSchema`)
- Systems query entities cleanly
- No performance issues

**Keep**: ECS as core architecture.

#### 2. **R3F Rendering Separation**

**React Three Fiber** is ONLY rendering, never writing to ECS:
- `CreatureRenderer`, `BuildingRenderer`, `TerrainRenderer` read-only
- Clean separation of concerns

**Keep**: R3F for rendering, ECS for logic.

#### 3. **UIKit Migration Complete**

**All pre-game UI** now uses `@react-three/uikit`:
- `SplashScreen`, `MainMenu`, `OnboardingFlow`, `CatalystCreator`, `TraitEvolutionDisplay`
- No DOM elements in Canvas (except legacy HUD components)

**Keep**: UIKit for ALL 3D-aware UI.

#### 4. **Yuka Foundation Exists**

**Yuka is initialized**:
- `yukaManager` (global EntityManager)
- `yukaTime` (global Time)
- Creatures have `yukaAgent` component
- `PackSocialSystem` uses steering behaviors (Cohesion, Alignment, Separation)

**Keep**: Yuka integration, just EXPAND it massively.

#### 5. **Procedural Systems Work**

**Terrain, textures, archetypes** all generate correctly:
- `TerrainSystem` uses FBM noise for heightmaps
- `TextureSystem` loads textures via hooks
- `CreatureArchetypeSystem` spawns 8 creature types
- `BuildingSystem` has 4 building templates
- `ToolArchetypeSystem` defines 8 tool categories

**Keep**: Procedural generation logic, just make it Yuka-driven.

#### 6. **GameClock and Generational Architecture**

**Time management** is solid:
- `GameClock` tracks generation, ticks
- `YukaSphereCoordinator` listens to generation changes
- Generational evolution loop triggers correctly

**Keep**: GameClock, just integrate with Yuka goal trees.

#### 7. **Genetic Synthesis System**

**Trait blending** works:
- `GeneticSynthesisSystem` blends parent traits
- 10 traits defined (Mobility, Manipulation, Excavation, etc.)
- Morphology adapts to trait values

**Keep**: Genetics, just tie to Yuka's GoalEvaluator for trait desirability.

#### 8. **Deconstructi System**

**Reverse synthesis** on death:
- Creatures decompose into raw materials
- Materials returned to world
- Closes the resource loop

**Keep**: Deconstruction, essential for resource race dynamics.

#### 9. **Haiku Narrative System**

**Procedural storytelling** exists:
- `HaikuNarrativeSystem` generates poems for events
- Haiku database with templates

**Keep**: Haiku generation, integrate with Event Messaging.

#### 10. **Consciousness System**

**Player awareness transfer**:
- `ConsciousnessSystem` allows player to "inhabit" creatures
- First-person perspective shift

**Keep**: Consciousness, unique mechanic for player agency.

---

### The Fundamental Paradigm Shift

**From**:
```
ECS Systems → Generate entities → Yuka steers them
```

**To**:
```
Yuka Entities → Make decisions (Goals, Fuzzy, FSM) → ECS executes
```

**Every system becomes a Yuka entity**:
- `MaterialSphere` is a Yuka entity with goals ("Distribute materials", "Update accessibility")
- `CreatureSphere` is a Yuka entity with goals ("Spawn creatures", "Evolve traits")
- `ToolSphere` is a Yuka entity with goals ("Evaluate tool need", "Spawn archetype")
- `BuildingSphere` is a Yuka entity with goals ("Assess shelter need", "Construct building")

**Spheres communicate via MessageDispatcher**:
- Tool created → Signal Material Sphere
- Tribe formed → Signal Building Sphere
- Material discovered → Signal Event Log

**Procedural generation IS Yuka**:
- Material placement uses `CohesionBehavior`
- Creature spawning uses `GoalEvaluator`
- Tool emergence uses `FuzzyModule`

---

### Migration Path: How to Get There

#### Phase 0: Gen 0 Foundation (CRITICAL BLOCKER)

**Before ANY refactor, implement Gen 0**:

1. Port Meshy integration from `~/src/otter-river-rush`
2. Design parent-child AI workflow (Vercel AI SDK)
3. Creative Director prompt (cores + shared materials + fill material)
4. Sub-agent spawning (unique materials + creatures per core)
5. Implement `PlanetaryPhysicsSystem` with Yuka goal trees
6. Refactor `RawMaterialsSystem` to consume Gen 0 data

**Why First**: Gen 0 defines EVERYTHING. Can't refactor without it.

#### Phase 1: Expand Yuka Components

**Update `YukaAgent` component**:

```typescript
export interface YukaAgent {
  vehicle: YUKA.Vehicle;
  goals?: YUKA.CompositeGoal[];
  fsm?: YUKA.StateMachine;
  fuzzy?: YUKA.FuzzyModule;
  vision?: YUKA.Vision;
  memory?: YUKA.MemorySystem;
  triggers?: YUKA.Trigger[];
  tasks?: YUKA.TaskQueue;
}
```

**Add to creatures first** (lowest risk):
- Implement `CompositeGoal` for hierarchical creature objectives
- Add `FSM` for creature states (IDLE, FORAGING, FLEEING, FIGHTING)
- Integrate `Vision`/`Memory` for perception

#### Phase 2: Yuka-fy Materials

**Add `YukaAgent` to material entities**:
- Implement `CohesionBehavior` for material snapping
- Add `FuzzyModule` for affinity decisions
- Integrate `Vision` for proximity detection
- Refactor `MaterialSphere` to use `GoalEvaluator`

#### Phase 3: Integrate Tool Sphere

**Uncomment Tool Sphere** in `YukaSphereCoordinator`:
- Implement `toolSphereDecisions()` using `FuzzyModule`
- Tools signal `MaterialSphere` via `MessageDispatcher`
- Material accessibility updates dynamically

#### Phase 4: Complete Building Sphere

**Finish Building Sphere** implementation:
- Add Yuka goal trees for building objectives
- Implement `Trigger` system for spatial events
- Buildings signal tribes via `MessageDispatcher`
- Add FSM for building states (CONSTRUCTION, ACTIVE, DAMAGED, RUINS)

#### Phase 5: Inter-Sphere Communication

**Implement `MessageDispatcher`** at sphere level:
- Define `MessageTypes` enum
- Each sphere `handleMessage()` and reacts
- Event Log subscribes to all messages

#### Phase 6: Refactor Decision Loops

**Replace manual logic** with Yuka:
- All sphere decision functions use `GoalEvaluator`
- Spheres themselves are Yuka entities
- Replace probabilities with fuzzy desirability scoring

#### Phase 7: Procedural Generation as Yuka

**Make generation Yuka-driven**:
- Material placement via `CohesionBehavior`
- Creature spawning via `GoalEvaluator`
- Tool emergence via `FuzzyModule`

#### Phase 8: Event Messaging & Endings

**Player feedback**:
- Event Log UI component
- World Score tracking
- Ending detection + cinematics

---

### Technical Debt

**Files to Refactor**:
- `src/systems/YukaSphereCoordinator.ts` - Replace manual loops with GoalEvaluator
- `src/systems/RawMaterialsSystem.ts` - Remove hardcoded values, consume Gen 0
- `src/systems/ToolArchetypeSystem.ts` - Integrate with YukaSphereCoordinator
- `src/systems/BuildingSystem.ts` - Complete implementation
- `src/world/ECSWorld.ts` - Expand `YukaAgent` component
- `src/components/*Renderer.tsx` - Replace polling with reactive queries

**Files to Create**:
- `src/systems/PlanetaryPhysicsSystem.ts` - Gen 0 foundation
- `src/systems/WorldScoreSystem.ts` - Track ending metrics
- `src/systems/EndingDetectionSystem.ts` - Detect victory conditions
- `src/systems/EventMessagingSystem.ts` - MessageDispatcher integration
- `src/config/meshy-models.ts` - AI model generation (port from otter-river-rush)
- `src/ai/workflows/creative-director.ts` - Parent AI workflow
- `src/ai/workflows/core-specialist.ts` - Child AI workflows

**Files to Delete**:
- None. Everything is useful, just needs expansion/refactor.

---

### Summary of Current vs. Target

| System | Current | Target | Change Required |
|--------|---------|--------|----------------|
| **Yuka Usage** | Steering behaviors only | ALL 10+ systems | Expand `YukaAgent`, add Goals/FSM/Fuzzy/Vision/Memory/Triggers/Tasks/MessageDispatcher |
| **Gen 0** | Doesn't exist | AI-generated manifests | Implement `PlanetaryPhysicsSystem` + parent-child AI workflows |
| **Material System** | Hardcoded values | Gen 0 derived | Refactor `RawMaterialsSystem` to consume Gen 0, add `CohesionBehavior` |
| **Tool Sphere** | Commented out | Fully integrated | Uncomment, implement `FuzzyModule` decisions, add `MessageDispatcher` |
| **Building Sphere** | Logs only | Fully functional | Implement emergence logic, add `Trigger` system |
| **Inter-Sphere Comms** | None | MessageDispatcher | Implement sphere-to-sphere messaging |
| **Decision Logic** | Manual if/else | Yuka GoalEvaluator | Refactor sphere decision functions |
| **Procedural Gen** | Static data | Yuka-driven | Make generation use Goals/Fuzzy/Cohesion |
| **Player Feedback** | None | Event messaging | Implement Event Log + MessageDispatcher |
| **Endings** | Don't exist | 4 emergent endings | Implement World Score + Ending Detection |
| **Rendering** | Polling | Reactive | Use Miniplex reactive queries |

---

## Summary: The Yuka World

This is not a simulation. It's a **living, breathing world** where every entity has desires, makes decisions, and communicates with others. Yuka isn't just AI for creatures—it's the **nervous system of the entire world**.

- **Planet**: Wants stability
- **Materials**: Want cohesion
- **Creatures**: Want survival
- **Tools**: Want utility
- **Buildings**: Want purpose
- **Tribes**: Want dominance
- **Myths**: Want immortality

The player doesn't control any of it directly. They **guide evolution**, **nudge systems**, and **watch emergent complexity unfold**.

The world doesn't have a script. It has **goals**. And those goals create **stories**.

That's Ebb and Bloom.

