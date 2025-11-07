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

## Dev Tools & AI Infrastructure

### Vercel AI SDK Integration

**Current State** (`ai` package v5.0.89):
- ✅ **Installed**: `@ai-sdk/openai`, `ai` package
- ✅ **Configured**: `src/config/ai-models.ts` - Single source of truth for model constants
- ✅ **Workflows Exist**: `src/dev/MasterEvolutionPipeline.ts`, `src/dev/EvolutionaryAgentWorkflows.ts`
- ❌ **NOT USED IN GAME**: AI workflows only for asset generation, NOT runtime gameplay

**What Exists**:

1. **AI Models Config** (`src/config/ai-models.ts`):
```typescript
export const AI_MODELS = {
  TEXT_GENERATION: 'gpt-5',
  IMAGE_GENERATION: 'gpt-image-1',
  CREATURE_DESIGN: 'gpt-5',
  BUILDING_ENGINEERING: 'gpt-5',
  MATERIAL_SCIENCE: 'gpt-5',
  NARRATIVE_GENERATION: 'gpt-5',
  SYSTEM_ARCHITECTURE: 'gpt-5'
};
```

2. **Master Evolution Pipeline** (`src/dev/MasterEvolutionPipeline.ts`):
   - Cascading AI workflow for asset generation
   - Uses `generateText` and `generateObject` from Vercel AI SDK
   - Generates evolutionary archetypes, creature specs, building assemblies
   - Outputs JSON manifests to `manifests/` directory
   - **Idempotent**: Checks if files exist before regenerating
   - **Run via**: `pnpm evolution:pipeline`

3. **Evolutionary Agent Workflows** (`src/dev/EvolutionaryAgentWorkflows.ts`):
   - Universal evolutionary framework design
   - Defines `EvolutionarySystem` interface (creature, tool, building, social, material, environment)
   - Uses Vercel AI SDK for agent-based generation
   - **NOT INTEGRATED**: Exists but not wired to game runtime

**What's MISSING (Critical for Gen 0)**:

1. **Parent-Child AI Workflow Orchestrator**:
   - NO implementation of Creative Director (parent workflow)
   - NO implementation of Core Specialists (child workflows)
   - NO parallel execution of child workflows (8 cores simultaneously)
   - NO manifest communication protocol

2. **Runtime AI Integration**:
   - AI workflows are DEV-TIME only (asset generation)
   - NO runtime AI calls during gameplay
   - NO dynamic content generation based on seed phrase
   - Gen 0 requires RUNTIME AI to generate planetary cores from seed

**Fix Required**:

**Create `src/ai/workflows/` directory**:
- `creative-director.ts` - Parent workflow (cores + shared materials + fill material)
- `core-specialist.ts` - Child workflow (unique materials + creatures per core)
- `workflow-orchestrator.ts` - Manages parent → 8 parallel children

**Use Vercel AI SDK streaming**:
```typescript
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

// Parent workflow
export async function generatePlanetaryCores(seedPhrase: string) {
  const { textStream } = await streamText({
    model: openai('gpt-4'),
    prompt: `Generate 8 planetary cores from seed: "${seedPhrase}"...`,
  });
  
  for await (const chunk of textStream) {
    // Stream cores as they're generated
  }
}

// Child workflows (parallel)
export async function generateCoreContent(coreManifest: CoreManifest) {
  const results = await Promise.all([
    generateUniqueMaterials(coreManifest),
    generateCreatureArchetypes(coreManifest)
  ]);
  return results;
}
```

**Integrate with `PlanetaryPhysicsSystem`**:
- System calls `workflow-orchestrator.ts` on Gen 0 init
- Streams results into ECS entities
- Caches manifests for deterministic replay (seedrandom)

---

### Meshy Integration (3D Model Generation)

**Current State**:
- ✅ **Ported from otter-river-rush**: Complete Meshy client library in `src/dev/meshy/`
- ✅ **Modules Exist**:
  - `base-client.ts` - HTTP client for Meshy API
  - `text_to_3d.ts` - Text → 3D model generation
  - `retexture.ts` - Texture generation/replacement
  - `rigging.ts` - Automatic rigging for animation
  - `animations.ts` - Animation generation
  - `index.ts` - Unified exports
- ❌ **NOT INTEGRATED**: Exists but not used in game

**What's MISSING**:

1. **Meshy Model Config** (analogous to `ai-models.ts`):
   - Create `src/config/meshy-models.ts`
   - Define Meshy API endpoints, model types, style presets

2. **Integration with AI Workflows**:
   - Parent workflow generates Meshy prompts for cores
   - Child workflows generate Meshy prompts for creatures/materials
   - Meshy client generates 3D models asynchronously
   - Models cached in `public/generated/models/`

3. **Runtime Model Loading**:
   - `CreatureRenderer` loads Meshy-generated models
   - `MaterialRenderer` uses Meshy textures
   - `BuildingRenderer` uses Meshy architectural models

**Fix Required**:

**Create `src/config/meshy-models.ts`**:
```typescript
export const MESHY_CONFIG = {
  API_KEY: import.meta.env.VITE_MESHY_API_KEY,
  STYLE_PRESETS: {
    CREATURE: 'organic-detailed',
    MATERIAL: 'pbr-realistic',
    BUILDING: 'low-poly-stylized'
  },
  CACHE_DIR: 'public/generated/models/'
};
```

**Update `creative-director.ts`**:
```typescript
import { MeshyClient } from '../dev/meshy';

export async function generateCoreVisuals(coreManifest: CoreManifest) {
  const meshy = new MeshyClient();
  
  const meshyPrompt = `Planetary core: ${coreManifest.description}`;
  const modelId = await meshy.generateModel(meshyPrompt);
  
  return { ...coreManifest, meshyModelId: modelId };
}
```

**Integrate with `CreatureArchetypeSystem`**:
- Load Meshy models instead of procedural meshes (optional fallback)
- Cache models for performance

---

### GameDevCLI (Asset Management)

**Current State** (`src/dev/GameDevCLI.ts`):
- ✅ **CLI Tool**: Uses `commander` for command-line interface
- ✅ **Commands**:
  - `pnpm dev:setup` - Initial setup
  - `pnpm dev:creature` - Creature asset generation
  - `pnpm dev:audio` - Audio library management
  - `pnpm dev:ui` - UI element generation
- ✅ **Asset Manifest Management**: Reads/writes `manifests/` JSON files
- ❌ **INCOMPLETE**: Some commands stubbed out

**What Works**:
- Manifest parsing (`GameAssetManifest` interface)
- Texture asset management (`TextureAsset`)
- Audio manifest integration

**What's MISSING**:
- Integration with Meshy workflows
- Automatic asset validation
- Asset dependency resolution (e.g., creature needs texture + mesh + audio)

**Fix Required**:
- Expand `GameDevCLI` to orchestrate FULL asset pipeline:
  1. Generate manifests (AI workflows)
  2. Generate 3D models (Meshy)
  3. Generate textures (AmbientCG downloader)
  4. Generate audio (Freesound API)
  5. Validate all assets exist
  6. Build game-ready asset bundles

---

### Process Compose Integration

**Current State**:
- ✅ **File Exists**: `process-compose.yml`
- ✅ **Documented**: `memory-bank/agent-collaboration.md`
- ❌ **NOT ACTIVELY USED**: No evidence of parallel process execution

**Available Processes** (from `process-compose.yml`):
- `dev-server` - Vite dev server
- `test-watch` - Vitest in watch mode
- `type-check` - TypeScript validation

**What's MISSING**:
- AI workflow processes (parent/child orchestration)
- Background asset generation
- Parallel test execution

**Fix Required**:
- Add processes for Gen 0 workflows:
  ```yaml
  processes:
    gen0-parent:
      command: tsx src/ai/workflows/creative-director.ts
    gen0-child-1:
      command: tsx src/ai/workflows/core-specialist.ts --core-id 1
      depends_on: gen0-parent
    # ... repeat for cores 2-8
  ```

---

## Custom Hooks & React Integration

### Existing Hooks

**1. `usePlatformEvents` (`src/hooks/usePlatformEvents.ts`)**:
- **Purpose**: Initializes platform event listeners (resize, orientation, input mode changes)
- **Integration**: Dispatches to `EvolutionDataStore` via Zustand
- **Status**: ✅ Working
- **Usage**: Called once in `App.tsx`

**Key Features**:
- Detects platform (web/iOS/Android/desktop) via Capacitor
- Listens to window resize, orientation change
- Updates Zustand store with platform state
- Determines input mode (touch/mouse/keyboard/gamepad)

**2. `useResponsiveScene` (`src/hooks/useResponsiveScene.ts`)**:
- **Purpose**: Adapts R3F scene (camera, viewport, object scales) based on platform/screen
- **Integration**: Reads from `EvolutionDataStore`, modifies Three.js camera
- **Status**: ✅ Working
- **Usage**: Called in 3D scene components

**Key Features**:
- Adjusts camera FOV (wider on mobile, narrower on desktop)
- Scales 3D objects for small screens
- Responsive viewport adaptation

**3. Texture Hooks** (`src/systems/TextureSystem.ts`):
- `useMaterial(query)` - Generic material query
- `useWoodMaterial(variant)` - Wood materials
- `useStoneMaterial(variant)` - Stone materials
- `useFabricMaterial(variant)` - Fabric materials
- `useMetalMaterial(variant)` - Metal materials

**Status**: ✅ Working, used in renderers

**What's MISSING**:

1. **`useYukaEntity` Hook**:
   - Purpose: Bind React component to Yuka entity lifecycle
   - Usage: `const { vehicle, goals, fsm } = useYukaEntity(entityId);`
   - Benefit: Reactive updates when Yuka entity changes

2. **`useECSQuery` Hook**:
   - Purpose: Reactive ECS queries in React components
   - Usage: `const creatures = useECSQuery(world.with('creature', 'transform'));`
   - Benefit: Replace polling with reactive subscriptions

3. **`useWorldScore` Hook**:
   - Purpose: Subscribe to world score metrics
   - Usage: `const { violence, harmony, speed } = useWorldScore();`
   - Benefit: Real-time ending detection UI

**Fix Required**:
- Create these hooks for cleaner React ↔ ECS/Yuka integration

---

## Zustand Stores (State Management)

### Current Store: `EvolutionDataStore`

**Purpose**: UI-only state synchronized FROM ECS, never writes TO it.

**What It Stores**:
1. **Platform State**:
   - Platform type (web/iOS/Android/desktop)
   - Screen dimensions, orientation, aspect ratio
   - Input mode (touch/mouse/keyboard/gamepad)

2. **Evolution Snapshots**:
   - `GenerationSnapshot[]` - Historical generation data
   - `EvolutionEvent[]` - Significant evolution events
   - `CreatureSnapshot[]` - Per-generation creature states
   - `MaterialSnapshot[]` - Per-generation material states

3. **Event History**:
   - Unified event system (`PlatformEvent | GestureEvent`)
   - Last 1000 events stored
   - Used for gesture recognition, analytics

4. **Analysis Cache**:
   - Evolution rate, diversity index, population trend
   - Dominant traits, emergent species
   - Computed metrics for UI display

**Actions**:
- `recordGenerationSnapshot()` - Called by ECS at end of generation
- `recordEvolutionEvent()` - Called when significant events occur
- `dispatchPlatformEvent()` - Platform changes
- `dispatchGestureEvent()` - Touch/mouse/keyboard input
- `setInputMode()` - Input mode switching
- `updateScreen()` - Screen resize/orientation
- `analyzeEvolutionTrends()` - Compute metrics
- `exportToFile()` - Export logs for analysis
- `clearHistory()` - Reset state

**Persistence**:
- Uses Zustand's `persist` middleware
- Storage: `localStorage` (browser) or Capacitor Storage (native)
- Key: `ebb-bloom-evolution-data`

**What's GOOD**:
- ✅ Clean separation: ECS → Store → UI (read-only)
- ✅ Platform-aware state management
- ✅ Persistence for evolution history
- ✅ Gesture event tracking

**What's MISSING**:

1. **World Score Store**:
   - Track violence, harmony, exploitation, innovation, speed scores
   - Detect ending thresholds (Mutualism, Parasitism, Domination, Transcendence)
   - Subscribe to MessageDispatcher for score updates

2. **UI State Store** (separate from ECS data):
   - Modal state (pause menu, settings, discoveries)
   - Camera state (position, target, zoom)
   - Selection state (selected creature, building, material)
   - Tutorial state (onboarding progress)

3. **Save/Load Store**:
   - Save game state to file
   - Load game state from file
   - Auto-save intervals
   - Multiple save slots

**Fix Required**:

**Create `src/stores/WorldScoreStore.ts`**:
```typescript
interface WorldScoreState {
  scores: {
    violence: number;      // Combat events, extinctions
    harmony: number;       // Alliances, coexistence
    exploitation: number;  // Resource depletion, pollution
    innovation: number;    // Tools, buildings, discoveries
    speed: number;         // Generations to milestones
  };
  endingThreshold: EndingType | null;
  detectEnding: () => EndingType | null;
}
```

**Create `src/stores/UIStateStore.ts`**:
```typescript
interface UIStateState {
  modals: {
    pauseMenu: boolean;
    settings: boolean;
    discoveries: boolean;
    worldMap: boolean;
  };
  camera: {
    position: Vector3;
    target: Vector3;
    zoom: number;
  };
  selection: {
    type: 'creature' | 'building' | 'material' | null;
    id: string | null;
  };
}
```

---

## Utilities & Supporting Systems

### Logger (`src/utils/Logger.ts`)

**Current State**:
- ✅ **Browser-compatible**: Uses `pino` with browser support
- ✅ **Persistent**: Logs stored in `localStorage`
- ✅ **Game-specific methods**: `terrain()`, `creature()`, `yuka()`, `r3f()`, `performance()`
- ✅ **Export functionality**: `exportLogs()` for analysis

**What Works**:
- Structured logging with context
- Log levels (debug, info, warn, error)
- Evolution data persistence
- Performance metrics tracking

**What's MISSING**:
- Integration with Yuka `MessageDispatcher` (log all messages)
- Log filtering by system/entity type
- Remote logging (send to analytics service)

**Fix Required**:
- Add `log.message()` for Yuka MessageDispatcher events
- Add log filtering: `log.filter('creature')` → only creature logs

---

### Freesound Client (`src/utils/FreesoundClient.ts`)

**Current State**:
- ✅ **Complete API Client**: Search, download, tag-based queries
- ✅ **Procedural Audio Generator**: Generate soundscapes from tags
- ✅ **Audio Manifest Manager**: Manage audio asset metadata
- ❌ **NOT INTEGRATED**: Exists but not used in game

**Classes**:
1. `FreesoundClient` - API wrapper
2. `ProceduralAudioGenerator` - Generate audio from evolutionary events
3. `AudioManifestManager` - Manage audio manifests

**What's MISSING**:
- Integration with `HaikuNarrativeSystem` (audio for haikus)
- Integration with event messaging (audio cues for discoveries)
- Integration with creature archetypes (creature sounds)
- Integration with environmental system (ambient soundscapes)

**Fix Required**:
- Wire to event system: Discovery → Sound effect
- Add audio to haikus (narrator voice)
- Add creature vocalizations (procedural animal sounds)

---

### Audio System (`src/audio/evoMorph.ts`)

**Current State**:
- ✅ **Audio morphing**: Smooth transitions between audio states
- ❌ **INCOMPLETE**: Basic implementation, not integrated

**What's MISSING**:
- Integration with evolution events
- Creature sound morphing (as traits evolve)
- Environmental ambience based on biome

---

### Combat Components (`src/world/CombatComponents.ts`)

**Current State**:
- ✅ **Defined**: Component interfaces for combat
- ❌ **NOT USED**: `CombatSystem` exists but never triggers

**Components**:
- `CombatStats` - Health, attack, defense
- `CombatBehavior` - Aggression, tactics
- `CombatTarget` - Current target entity

**Fix Required**:
- Integrate with Yuka FSM (IDLE → FIGHTING state)
- Integrate with pack coordination (group combat)
- Integrate with world score (violence metric)

---

## Scripts & Build Tools

### Texture Downloader (`src/build/ambientcg-downloader.ts`)

**Current State**:
- ✅ **Working**: Downloads PBR textures from AmbientCG
- ✅ **Used**: `pnpm setup:textures` command
- ✅ **Output**: `public/textures/` directory

**What It Does**:
- Downloads wood, stone, fabric, metal textures
- Organizes by category
- Caches to avoid re-downloads

**What's MISSING**:
- Integration with Meshy retexturing
- Automatic texture assignment to materials
- Texture quality presets (mobile vs. desktop)

---

### Grok Extractor (`scripts/extract-grok-chat.js`)

**Current State**:
- ✅ **Utility**: Extracts memory bank context from Grok conversations
- ✅ **Used**: Generated `memory-bank/` files from conversation history

**Purpose**: Convert AI chat logs into structured documentation

**Not needed for game runtime**, but useful for documentation maintenance.

---

## Testing Infrastructure

### Test Setup (`src/test/setup.ts`)

**Current State**:
- ✅ **Vitest Configuration**: Happy-dom for DOM simulation
- ✅ **Test Utilities**: Mock ECS world, mock Three.js
- ✅ **Coverage**: 57/57 tests passing (as of last run)

**Test Files**:
- `CreatureArchetypeSystem.test.ts` - Creature spawning
- `EcosystemIntegration.test.ts` - Full system integration
- `EvolutionUI.integration.test.tsx` - UI components
- `GameClock.test.ts` - Time management
- `GeneticSynthesis.test.ts` - Trait blending
- `RawMaterialsSystem.test.ts` - Material distribution
- `SporeStyleCamera.test.ts` - Camera system
- `TextureSystem.test.tsx` - Texture loading
- `WorldContext.test.tsx` - React context

**What's GOOD**:
- ✅ System-level tests (not just unit tests)
- ✅ Integration tests for React components
- ✅ ECS system mocking for isolation

**What's MISSING**:

1. **Yuka Integration Tests**:
   - Test goal trees, fuzzy modules, FSMs
   - Test MessageDispatcher communication
   - Test steering behaviors (Cohesion, Alignment, Separation)

2. **Gen 0 Tests**:
   - Test planetary physics generation
   - Test AI workflow orchestration
   - Test parent-child manifest communication

3. **Ending Detection Tests**:
   - Test world score tracking
   - Test ending threshold detection
   - Test each ending type (Mutualism, Parasitism, Domination, Transcendence)

**Fix Required**:
- Add test suites for missing systems
- Add E2E tests (full gameplay loop Gen 1 → Gen 10)

---

## Package.json Scripts

**Current Scripts**:
```json
{
  "dev": "vite --host 0.0.0.0",
  "build": "vite build",
  "preview": "vite preview",
  "test": "vitest run",
  "test:watch": "vitest",
  "test:ui": "vitest --ui",
  "test:coverage": "vitest --coverage",
  "setup:textures": "tsx src/build/ambientcg-downloader.ts",
  "dev:cli": "tsx src/dev/GameDevCLI.ts",
  "evolution:pipeline": "tsx src/dev/MasterEvolutionPipeline.ts",
  "evolution:archetypes": "tsx src/dev/EvolutionaryAgentWorkflows.ts",
  "evolution:validate": "pnpm test && pnpm build"
}
```

**What's MISSING**:
- `gen0:generate` - Run Gen 0 AI workflows (parent + children)
- `gen0:validate` - Validate Gen 0 manifests
- `assets:sync` - Sync all assets (textures, models, audio)
- `deploy:mobile` - Build for Capacitor (iOS/Android)

**Fix Required**:
- Add Gen 0 workflow scripts
- Add asset validation scripts
- Add mobile deployment scripts

---

## Dependencies Audit

### Core Dependencies (Game Runtime)

**ECS & Rendering**:
- ✅ `miniplex@2.0.0` - ECS
- ✅ `miniplex-react@2.0.1` - React integration
- ✅ `@react-three/fiber@9.4.0` - React Three.js
- ✅ `@react-three/drei@10.7.6` - R3F helpers
- ✅ `three@0.170.0` - 3D rendering

**UI & Platform**:
- ✅ `@react-three/uikit@1.0.57` - 3D UI
- ✅ `@capacitor/core@6.1.2` - Cross-platform
- ✅ `@capacitor/haptics@6.0.1` - Haptic feedback
- ✅ `@capacitor/device@7.0.2` - Device info

**AI & Game Logic**:
- ✅ `yuka@0.7.8` - AI behaviors
- ✅ `ai@5.0.89` - Vercel AI SDK
- ✅ `@ai-sdk/openai@2.0.64` - OpenAI integration
- ✅ `openai@6.8.1` - OpenAI API client

**State & Utils**:
- ✅ `zustand@5.0.8` - State management
- ✅ `seedrandom` - MISSING (not in package.json!)
- ✅ `simplex-noise@4.0.3` - Noise generation
- ✅ `fast-simplex-noise@4.0.0` - Fast noise

**CRITICAL MISSING**:
- ❌ `seedrandom` - Required for deterministic Gen 0
- ❌ `@vercel/ai` - May be needed for advanced streaming

**Fix Required**:
```bash
pnpm add seedrandom @types/seedrandom
```

---

## File Structure Review

**Current Structure**:
```
src/
├── systems/         # 19 ECS systems ✅
├── components/      # 8 React renderers ✅
├── stores/          # 1 Zustand store ✅
├── hooks/           # 2 custom hooks ✅
├── utils/           # 3 utility modules ✅
├── world/           # 2 ECS schema files ✅
├── contexts/        # 1 React context ✅
├── config/          # 1 AI models config ✅
├── dev/             # 4 dev tools + meshy/ ✅
├── build/           # 1 texture downloader ✅
├── audio/           # 1 audio morph (incomplete) ⚠️
├── test/            # 9 test files ✅
└── generated/       # Empty (for AI-generated assets) ❌
```

**What's MISSING (Directories to Create)**:

```
src/
├── ai/
│   └── workflows/
│       ├── creative-director.ts      # Parent workflow
│       ├── core-specialist.ts        # Child workflow
│       └── workflow-orchestrator.ts  # Parallel execution
├── goals/           # Yuka goal implementations
│   ├── CreatureGoals.ts
│   ├── MaterialGoals.ts
│   ├── ToolGoals.ts
│   └── BuildingGoals.ts
├── fuzzy/           # Yuka fuzzy logic modules
│   ├── ToolEmergenceFuzzy.ts
│   ├── MaterialAffinityFuzzy.ts
│   └── BuildingNeedFuzzy.ts
└── messaging/       # MessageDispatcher integration
    ├── MessageTypes.ts
    ├── EventLog.ts
    └── InterSphereMessaging.ts
```

---

## Critical Path Summary

**To bring the game BACK TO LIFE, this is the order of operations**:

### Phase 0: Foundation (CRITICAL BLOCKER)
1. ✅ Install missing dependencies (`seedrandom`)
2. ✅ Create `src/ai/workflows/` directory structure
3. ✅ Port Meshy integration to `src/config/meshy-models.ts`
4. ✅ Create `src/goals/`, `src/fuzzy/`, `src/messaging/` directories

### Phase 1: Gen 0 Implementation
1. Create `creative-director.ts` (parent workflow using Vercel AI SDK)
2. Create `core-specialist.ts` (child workflow using Vercel AI SDK)
3. Create `workflow-orchestrator.ts` (parallel execution)
4. Create `PlanetaryPhysicsSystem.ts` (orchestrates AI workflows)
5. Refactor `RawMaterialsSystem` to consume Gen 0 data

### Phase 2: Yuka Expansion
1. Expand `YukaAgent` component (add goals, fsm, fuzzy, vision, memory, triggers, tasks)
2. Create Yuka goal implementations (`src/goals/`)
3. Create Yuka fuzzy modules (`src/fuzzy/`)
4. Refactor `YukaSphereCoordinator` to use `GoalEvaluator` instead of manual loops

### Phase 3: Inter-Sphere Communication
1. Create `src/messaging/MessageTypes.ts` (define all message types)
2. Create `src/messaging/InterSphereMessaging.ts` (MessageDispatcher wrapper)
3. Create `src/messaging/EventLog.ts` (event log entity + UI)
4. Integrate MessageDispatcher into all spheres

### Phase 4: Tool & Building Integration
1. Uncomment Tool Sphere in `YukaSphereCoordinator`
2. Implement `toolSphereDecisions()` using FuzzyModule
3. Complete Building Sphere implementation
4. Wire Tool → Material, Building → Tribe messaging

### Phase 5: Player Feedback Systems
1. Create `WorldScoreStore.ts` (track ending metrics)
2. Create `EventMessagingSystem.ts` (ECS → UI event log)
3. Create Event Log UI component (UIKit)
4. Create `EndingDetectionSystem.ts` (detect victory conditions)

### Phase 6: Endings
1. Design ending thresholds (Mutualism, Parasitism, Domination, Transcendence)
2. Implement ending detection logic
3. Create ending cinematics (camera paths, particle effects)
4. Integrate haiku generation for ending poems

### Phase 7: Polish
1. Replace renderer polling with reactive queries
2. Integrate Freesound audio
3. Add missing tests (Yuka, Gen 0, Endings)
4. Mobile deployment scripts

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

