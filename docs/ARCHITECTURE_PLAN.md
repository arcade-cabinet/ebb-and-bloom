# COMPREHENSIVE ARCHITECTURE PLAN
## Bringing Ebb & Bloom to Full Viability

**Last Updated**: 2025-01-09  
**Status**: Refactoring In Progress

---

## Executive Summary

This document outlines the **complete refactoring** needed to bring Ebb & Bloom from its current state to full gameplay viability, following the vision laid out in `WORLD.md`.

### Current State
- ✅ CLI game works (planetary generation, creature evolution, basic gameplay)
- ✅ Zustand stores handle core state (planetary structure, creature evolution)
- ✅ Basic Yuka integration (steering behaviors only)
- ❌ **Most Yuka systems unused** (Goals, FSM, Fuzzy, Vision, Memory, Triggers, Tasks, MessageDispatcher)
- ❌ **Manual decision loops** instead of Yuka AI
- ❌ **Tool/Building spheres incomplete**
- ❌ **No inter-sphere communication**
- ❌ **No rendering hooks** for future 3D

### Target State
- ✅ **Everything is Yuka** - All entities use goal trees, FSM, fuzzy logic
- ✅ **MessageDispatcher coordinates** - Spheres communicate via messages
- ✅ **AI workflows generate content** - OpenAI API creates unique planets/creatures/tools/buildings
- ✅ **Rendering hooks ready** - Pure data structures that 3D can query later
- ✅ **Full gameplay loop** - Gen 0 → Tools → Buildings → Tribes → Endings

---

## Phase 1: Core Infrastructure (CURRENT)

### 1.1 Yuka Integration Layer ✅ COMPLETE
**File**: `src/systems/YukaIntegration.ts`

Provides TypeScript wrappers for ALL Yuka systems:
- `GoalEvaluator` - Scores goal desirability (replaces manual if/else)
- `ToolEmergenceFuzzy` - Fuzzy logic for tool emergence
- `BuildingEmergenceFuzzy` - Fuzzy logic for building emergence
- `MessageDispatcher` - Inter-entity communication
- `StateMachine<T>` - FSM wrapper with state history
- `RenderingHookManager` - Pure data interface for 3D renderer

**Key Concept**: Everything is now pure data that can be:
1. Serialized to JSON for testing
2. Queried by 3D renderer later
3. Debugged via CLI

### 1.2 AI Workflow Runtime ✅ COMPLETE
**File**: `src/systems/AIWorkflowRuntime.ts`

Uses OpenAI API to generate game content at runtime:
- `generateGen0()` - Complete planetary manifest from seed
- `generateToolArchetype()` - Tools that fit current game state
- `generateBuildingTemplate()` - Buildings that match tribal needs
- `generateMyth()` - Mythological narratives

**Deterministic**: Uses seed parameter so same seed = same content

**Fallback**: If no API key, falls back to `MockGen0Data`

---

## Phase 2: System Refactoring (IN PROGRESS)

### 2.1 PlanetaryPhysicsSystem (NEW)
**File**: `src/systems/PlanetaryPhysicsSystem.ts` ❌ NOT CREATED YET

**Purpose**: Gen 0 foundation with Yuka goal trees

**Yuka Integration**:
```typescript
class PlanetaryPhysicsSystem {
  private yukaEntity: YUKA.GameEntity;
  private goals: CompositeGoal[];
  
  constructor() {
    this.yukaEntity = new YUKA.GameEntity();
    
    // Planet has GOALS
    this.goals = [
      new GameGoalEvaluator(GoalType.MAINTAIN_STABILITY),
      new GameGoalEvaluator(GoalType.BALANCE_PRESSURE),
      new GameGoalEvaluator(GoalType.REGULATE_TEMPERATURE),
    ];
  }
  
  update(delta: number) {
    // Yuka evaluates planetary goals each tick
    this.goals.forEach(goal => {
      const desirability = goal.calculateDesirability(context);
      if (desirability > THRESHOLD) {
        goal.activate();
      }
    });
    
    // Send messages about planetary changes
    MessageDispatcher.getInstance().dispatch({
      type: MessageType.GENERATION_ADVANCED,
      sender: 'planet',
      receiver: 'material-sphere',
      data: { stability: currentStability },
    });
  }
}
```

**Responsibilities**:
1. Call `AIWorkflowRuntime.generateGen0()` on initialization
2. Manage planetary goal trees
3. Send messages to MaterialSphere about accessibility changes
4. Provide query interface for terrain rendering

### 2.2 MaterialSphere Refactor
**File**: `src/systems/RawMaterialsSystem.ts` ❌ NEEDS REFACTOR

**Current Problem**: Hardcoded material depths, no Yuka integration

**Target**: Materials are Yuka entities with CohesionBehavior

```typescript
class MaterialEntity {
  yukaVehicle: YUKA.Vehicle;
  goals: Goal[];
  fsm: StateMachine<MaterialState>;
  
  constructor() {
    this.goals = [
      new GameGoalEvaluator(GoalType.MAINTAIN_COHESION),
      new GameGoalEvaluator(GoalType.ATTRACT_AFFINITY),
      new GameGoalEvaluator(GoalType.SEPARATE_INCOMPATIBLE),
    ];
    
    // Materials use steering behaviors!
    this.yukaVehicle.steering.add(new YUKA.CohesionBehavior());
    this.yukaVehicle.steering.add(new YUKA.SeparationBehavior());
  }
  
  handleMessage(message: GameMessage) {
    if (message.type === MessageType.TOOL_CREATED) {
      // Tool emerged → update accessibility
      this.updateAccessibility(message.data.toolHardness);
    }
  }
}
```

**Key Insight**: Material *placement* and *clustering* should use Yuka CohesionBehavior, not just random noise!

### 2.3 YukaSphereCoordinator Refactor
**File**: `src/systems/YukaSphereCoordinator.ts` ❌ NEEDS MAJOR REFACTOR

**Current Problem**: Manual if/else probability checks

**Target**: Use Yuka GoalEvaluator for ALL decisions

**Before** (Manual):
```typescript
private creatureSphereDecisions(pressure, generation) {
  const decisions = [];
  for (const entity of creatures.entities) {
    const evolutionProbability = this.calculateEvolutionProbability(...);
    if (Math.random() < evolutionProbability) {  // ❌ MANUAL
      decisions.push({ type: 'evolve_creature', ... });
    }
  }
  return decisions;
}
```

**After** (Yuka):
```typescript
private creatureSphereDecisions(context: GoalContext) {
  const sphereEntity = this.creatureSphereEntity; // Yuka Entity
  const goalEvaluator = new GoalEvaluator();
  
  for (const entity of creatures.entities) {
    const evolveGoal = new GameGoalEvaluator(GoalType.SURVIVE);
    const desirability = evolveGoal.calculateDesirability(context);
    
    if (desirability > THRESHOLD) {
      sphereEntity.setGoal(evolveGoal); // ✅ YUKA
      
      // Send message about decision
      MessageDispatcher.getInstance().dispatch({
        type: MessageType.CREATURE_EVOLVED,
        sender: 'creature-sphere',
        receiver: 'world',
        data: { creatureId: entity.id, desirability },
      });
    }
  }
}
```

### 2.4 Tool Sphere Integration
**File**: `src/systems/ToolArchetypeSystem.ts` ❌ EXISTS BUT NOT INTEGRATED

**Current Problem**: Tool Sphere commented out in YukaSphereCoordinator

**Target**: Uncomment and wire with FuzzyModule + MessageDispatcher

```typescript
private toolSphereDecisions(context: GoalContext) {
  const fuzzy = new ToolEmergenceFuzzy();
  
  const accessibility = context.pressures.material;
  const capability = this.getAverageCreatureCapability();
  
  const emergenceDesirability = fuzzy.evaluate(accessibility, capability);
  
  if (emergenceDesirability > 0.6) {
    // Generate tool via AI workflow
    const tool = await AIWorkflowRuntime.generateToolArchetype({
      generation: context.generation,
      materialPressure: accessibility,
      availableMaterials: this.getDiscoveredMaterials(),
      creatureCapabilities: capability,
    });
    
    // Create tool entity
    this.createToolEntity(tool);
    
    // Message MaterialSphere
    MessageDispatcher.getInstance().dispatch({
      type: MessageType.TOOL_CREATED,
      sender: 'tool-sphere',
      receiver: 'material-sphere',
      data: { tool, unlockedMaterials: this.calculateUnlocks(tool) },
    });
  }
}
```

### 2.5 Building Sphere Completion
**File**: `src/systems/BuildingSystem.ts` ❌ LOGS ONLY, DOESN'T BUILD

**Current Problem**: `buildingSphereDecisions()` returns empty array

**Target**: Use FuzzyModule + Triggers + MessageDispatcher

```typescript
class BuildingSphereCoordinator {
  private fuzzy: BuildingEmergenceFuzzy;
  private triggers: Map<string, YUKA.Trigger>;
  
  checkTriggers(context: GoalContext) {
    // Tribe formed → trigger building need evaluation
    if (context.tribeFormedThisCycle) {
      const trigger = new YUKA.Trigger();
      trigger.region = new YUKA.Sphere(tribe.location, tribe.radius);
      
      trigger.execute = () => {
        this.evaluateBuildingNeed(tribe);
      };
    }
  }
  
  async evaluateBuildingNeed(tribe: Tribe) {
    const desirability = this.fuzzy.evaluate(
      tribe.population / 100,  // Population pressure
      tribe.cohesion           // Social cohesion
    );
    
    if (desirability > 0.7) {
      // Generate building via AI
      const building = await AIWorkflowRuntime.generateBuildingTemplate({
        tribeName: tribe.name,
        population: tribe.population,
        culture: tribe.culture,
        availableMaterials: this.getAccessibleMaterials(tribe),
      });
      
      // Create building entity
      this.constructBuilding(building, tribe);
      
      // Message world
      MessageDispatcher.getInstance().dispatch({
        type: MessageType.BUILDING_CONSTRUCTED,
        sender: 'building-sphere',
        receiver: 'world',
        data: { building, tribe: tribe.name },
      });
    }
  }
}
```

---

## Phase 3: World Score & Endings (NEW SYSTEMS)

### 3.1 WorldScoreSystem
**File**: `src/systems/WorldScoreSystem.ts` ❌ NOT CREATED YET

**Purpose**: Track metrics that determine ending

```typescript
class WorldScoreSystem {
  private scores: WorldScore = {
    violence: 0,
    harmony: 0,
    exploitation: 0,
    innovation: 0,
    speed: 0,
  };
  
  constructor() {
    // Subscribe to relevant messages
    const dispatcher = MessageDispatcher.getInstance();
    
    // Violence tracking
    dispatcher.subscribe(MessageType.COMBAT, (msg) => {
      this.scores.violence += 0.1;
    });
    
    // Harmony tracking
    dispatcher.subscribe(MessageType.ALLIANCE_FORMED, (msg) => {
      this.scores.harmony += 0.3;
    });
    
    // Innovation tracking
    dispatcher.subscribe(MessageType.TOOL_CREATED, (msg) => {
      this.scores.innovation += 0.5;
    });
  }
  
  getScores(): Readonly<WorldScore> {
    return { ...this.scores };
  }
}
```

### 3.2 EndingDetectionSystem
**File**: `src/systems/EndingDetectionSystem.ts` ❌ NOT CREATED YET

**Purpose**: Detect when ending conditions are met

```typescript
class EndingDetectionSystem {
  detectEnding(scores: WorldScore, gameState: GameState): EndingType | null {
    // Mutualism: High harmony, low violence
    if (scores.harmony > 2.0 && scores.violence < 1.0) {
      return 'mutualism';
    }
    
    // Parasitism: High exploitation, ecosystem collapse
    if (scores.exploitation > 3.0 && gameState.extinctions.size > 3) {
      return 'parasitism';
    }
    
    // Domination: Single tribe supreme
    if (gameState.tribes.size === 1 && scores.violence > 2.0) {
      return 'domination';
    }
    
    // Transcendence: High innovation, complex society
    if (scores.innovation > 4.0 && gameState.buildings.size > 8) {
      return 'transcendence';
    }
    
    return null;
  }
  
  async generateEndingNarrative(ending: EndingType): Promise<string> {
    // Use AI to generate custom ending narrative
    return await AIWorkflowRuntime.generateMyth({
      tribeName: 'World',
      significantEvents: this.getSignificantEvents(),
      worldTheme: ending,
    });
  }
}
```

### 3.3 EventMessagingSystem
**File**: `src/systems/EventMessagingSystem.ts` ❌ NOT CREATED YET

**Purpose**: Translate MessageDispatcher messages to player-visible events

```typescript
class EventMessagingSystem {
  private eventLog: GameEvent[] = [];
  
  constructor() {
    const dispatcher = MessageDispatcher.getInstance();
    
    // Subscribe to all message types
    Object.values(MessageType).forEach(type => {
      dispatcher.subscribe(type, (msg) => {
        this.convertToEvent(msg);
      });
    });
  }
  
  private convertToEvent(message: GameMessage) {
    const event: GameEvent = {
      generation: currentGeneration,
      cycle: currentCycle,
      timeOfDay: currentPhase,
      type: this.mapMessageTypeToEventType(message.type),
      description: this.generateDescription(message),
      coordinates: message.data.position,
      participants: message.data.entities,
      data: message.data,
    };
    
    this.eventLog.push(event);
    
    // Also register with RenderingHookManager for visual feedback
    RenderingHookManager.getInstance().registerEvent(event);
  }
  
  getRecentEvents(count: number): GameEvent[] {
    return this.eventLog.slice(-count);
  }
}
```

---

## Phase 4: Rendering Hooks (FUTURE-PROOFING)

### 4.1 Rendering Hook Architecture

**Key Principle**: Game logic produces *pure data*, 3D renderer *queries* it

```
┌─────────────────────────────────────┐
│      GAME LOGIC (Pure Math)        │
│  - Planetary structure (tables)    │
│  - Creature evolution (traits)     │
│  - Yuka decisions (goals/FSM)      │
│  - World state (JSON)              │
└──────────────┬──────────────────────┘
               │
               │ Query Interface
               │
               ▼
┌─────────────────────────────────────┐
│   RenderingHookManager              │
│  - getVisibleEntities()            │
│  - getEntitiesByType()             │
│  - getMaterialAt(x, y, z)          │
│  - getCreatureAnimation(id)        │
└──────────────┬──────────────────────┘
               │
               │ (Future: 3D Renderer queries this)
               │
               ▼
┌─────────────────────────────────────┐
│      3D RENDERER (Future)           │
│  - React Three Fiber               │
│  - Procedural meshes               │
│  - Material shaders                │
│  - Animation system                │
└─────────────────────────────────────┘
```

### 4.2 RenderableEntity Specification

Every game entity exposes this interface:

```typescript
interface RenderableEntity {
  id: string;
  type: 'creature' | 'material' | 'building' | 'tool';
  
  // Spatial data (for renderer)
  position: Vector3;
  rotation: Vector3;
  scale: Vector3;
  
  // Visual properties (what to render)
  visual: {
    morphology?: CreatureMorphology;  // Procedural creature shape
    materialType?: string;            // 'stone', 'ore', 'crystal'
    buildingType?: string;            // 'shelter', 'workshop'
    color?: string;                   // Override color
    texture?: string;                 // Texture identifier
  };
  
  // Animation state (for procedural animation)
  animation: {
    state: string;      // 'idle', 'moving', 'attacking'
    speed: number;      // Animation speed multiplier
    loop: boolean;      // Should animation loop
  };
  
  // Visibility (for culling/LOD)
  visibility: {
    visible: boolean;   // Should be rendered
    lod: number;       // Level of detail (0-3)
    distance: number;  // Distance from camera
  };
}
```

### 4.3 Procedural Visual Generation

**When 3D is added**, visual generation will work like this:

```typescript
// Procedural creature mesh generation
function generateCreatureMesh(creature: Creature): THREE.Mesh {
  const morphology = calculateMorphology(creature.traits);
  
  // Traits determine visual properties
  const segments = Math.floor(creature.traits.size * 10 + 5);
  const limbLength = creature.traits.mobility * 2;
  const headSize = creature.traits.intelligence * 1.5;
  
  // Procedurally generate geometry
  const geometry = new THREE.BoxGeometry(
    morphology.width,
    morphology.height,
    morphology.depth,
    segments, segments, segments
  );
  
  // Apply displacement based on traits
  applyMorphologyDisplacement(geometry, morphology);
  
  // Material based on taxonomy
  const material = getMaterialForTaxonomy(creature.taxonomy);
  
  return new THREE.Mesh(geometry, material);
}

// Procedural material texture
function generateMaterialTexture(material: MaterialEntry): THREE.Texture {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  
  // Procedural texture based on material properties
  const baseColor = getMaterialColor(material.category);
  const roughness = material.hardness / 10;
  
  drawProceduralTexture(ctx, baseColor, roughness);
  
  return new THREE.CanvasTexture(canvas);
}
```

---

## Phase 5: Integration & Testing

### 5.1 System Integration Checklist

- [ ] PlanetaryPhysicsSystem created and integrated
- [ ] MaterialSphere refactored to use Yuka
- [ ] YukaSphereCoordinator refactored to use GoalEvaluator
- [ ] Tool Sphere uncommented and working
- [ ] Building Sphere completed
- [ ] WorldScoreSystem tracking all metrics
- [ ] EndingDetectionSystem detecting all 4 endings
- [ ] EventMessagingSystem converting messages to events
- [ ] MessageDispatcher wired to all systems
- [ ] RenderingHookManager providing query interface
- [ ] AI Workflows generating unique content per seed

### 5.2 Test Coverage

**Unit Tests** (per system):
- `PlanetaryPhysicsSystem.test.ts`
- `MaterialYukaIntegration.test.ts`
- `ToolSphereEmergence.test.ts`
- `BuildingSphereConstruction.test.ts`
- `MessageDispatcherFlow.test.ts`
- `FuzzyLogicDecisions.test.ts`

**Integration Tests**:
- `FullGameSimulation.test.ts` ✅ DONE (ComprehensiveGameSimulation.test.ts)
- `YukaSphereCoordination.test.ts`
- `AIWorkflowGeneration.test.ts`

**End-to-End Tests**:
- CLI game playthrough (manual)
- 30-generation simulation (automated)
- All 4 endings achievable (automated)

---

## Phase 6: Package Scripts Update

Update `package.json`:

```json
{
  "scripts": {
    // Existing
    "dev": "vite --host 0.0.0.0",
    "test": "vitest run",
    
    // New CLI modes
    "game:full": "tsx src/dev/comprehensive-game-cli.ts",
    "game:blocking": "tsx src/dev/comprehensive-game-cli.ts --blocking",
    
    // AI workflows
    "ai:gen0": "tsx src/systems/AIWorkflowRuntime.ts",
    
    // System testing
    "test:yuka": "vitest run -t Yuka",
    "test:integration": "vitest run -t Integration",
    "test:e2e": "vitest run src/test/ComprehensiveGameSimulation.test.ts",
    
    // Debugging
    "debug:messages": "tsx scripts/debug-message-flow.ts",
    "debug:goals": "tsx scripts/debug-goal-evaluation.ts"
  }
}
```

---

## Critical Path Summary

**Week 1** (Immediate):
1. ✅ Create YukaIntegration.ts (DONE)
2. ✅ Create AIWorkflowRuntime.ts (DONE)
3. ✅ Create ComprehensiveGameCLI (DONE)
4. ✅ Create ComprehensiveGameSimulation.test.ts (DONE)
5. ⏳ Create PlanetaryPhysicsSystem.ts (IN PROGRESS)
6. ⏳ Refactor MaterialSphere (IN PROGRESS)

**Week 2** (Core Systems):
1. Refactor YukaSphereCoordinator
2. Integrate Tool Sphere
3. Complete Building Sphere
4. Wire MessageDispatcher

**Week 3** (Gameplay):
1. Create WorldScoreSystem
2. Create EndingDetectionSystem
3. Create EventMessagingSystem
4. Test all 4 endings

**Week 4** (Future-Proofing):
1. Complete RenderingHookManager
2. Design procedural visual generation
3. Document 3D integration plan
4. Polish CLI experience

---

## Success Criteria

### Game is Complete When:
✅ Every system uses Yuka (not manual loops)
✅ MessageDispatcher coordinates all spheres
✅ AI generates unique content from seeds
✅ All 4 endings are achievable
✅ Full CLI game is playable and fun
✅ RenderingHookManager provides clean query interface
✅ 100+ tests pass
✅ Documentation is comprehensive

### 3D Rendering is Easy to Add When:
✅ All game logic is pure data (no rendering in logic)
✅ RenderingHookManager queries work
✅ Procedural generation algorithms are documented
✅ Visual properties are calculated from traits
✅ Spatial data is always up-to-date

---

## The Bottom Line

**Current**: Basic CLI game works, but systems are fragmented and manual

**Target**: Comprehensive Yuka-driven game with AI content generation and rendering hooks

**Effort**: ~4 weeks of focused refactoring

**Payoff**: 
- Complete, testable, algorithmic game
- Easy to add 3D rendering later
- AI-generated unique content
- Fully emergent gameplay

**Let's build this right.**
