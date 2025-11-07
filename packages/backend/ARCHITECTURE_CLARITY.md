# ARCHITECTURE CLARITY: ECS vs Yuka

## The Fundamental Confusion

**WORLD.md describes**: Yuka entities with goals, FSM, fuzzy logic making DECISIONS

**What we built**: ECS systems processing data in loops

**These are NOT the same thing.**

---

## What Each System Actually Is

### ECS (Entity Component System)
**Purpose**: Data storage and queries

```typescript
// ECS Entity = Data container
const creature = {
  id: 'creature-1',
  transform: { x: 10, y: 0, z: 5 },
  traits: { mobility: 0.7, intelligence: 0.5 },
  health: 100,
};

// ECS System = Data processor
class CreatureSystem {
  update(entities) {
    for (const entity of entities) {
      // Process data
      entity.transform.x += entity.traits.mobility;
    }
  }
}
```

**ECS is**: Storage, queries, iteration
**ECS is NOT**: Decision making, AI, behavior

---

### Yuka (AI/Behavior System)
**Purpose**: Decision making and behavior

```typescript
// Yuka Entity = AI agent with goals
const creature = new YUKA.GameEntity();

creature.steering.add(new YUKA.WanderBehavior());

const goal = new GameGoalEvaluator(GoalType.SURVIVE);
goal.calculateDesirability(context); // Makes DECISION

creature.brain.setGoal(goal); // AI decides what to do
```

**Yuka is**: Goals, decisions, behaviors, AI
**Yuka is NOT**: Data storage, queries

---

## The Correct Architecture

### Layer 1: Data (ECS)
**What exists**

```typescript
// Miniplex ECS stores WHAT exists
const world = new World({
  creature: {
    id: string,
    traits: CreatureTraits,
    position: Vector3,
  },
  material: {
    id: string,
    depth: number,
    hardness: number,
  },
});

// Query what exists
const creatures = world.with('creature');
const materials = world.with('material');
```

### Layer 2: Behavior (Yuka)
**How it behaves**

```typescript
// Yuka entities decide HOW to behave
const creatureAgent = new YUKA.GameEntity();

// Goals (what it wants)
const surviveGoal = new CompositeGoal('Survive');
surviveGoal.addSubgoal(new ForageGoal());
surviveGoal.addSubgoal(new EvadeGoal());

// FSM (what state it's in)
const fsm = new StateMachine();
fsm.addState('IDLE', idleState);
fsm.addState('FORAGING', foragingState);
fsm.transitionTo('FORAGING');

// Fuzzy logic (should it do X?)
const fuzzy = new FuzzyModule();
const shouldEvolve = fuzzy.evaluate(pressure, capability);

creatureAgent.brain = { goals, fsm, fuzzy };
```

### Layer 3: Coordination (MessageDispatcher)
**How they communicate**

```typescript
// Entities send messages to each other
MessageDispatcher.dispatch({
  type: 'TOOL_CREATED',
  from: 'tool-sphere',
  to: 'material-sphere',
  data: { toolHardness: 5 },
});

// Material sphere receives and reacts
materialSphere.handleMessage((msg) => {
  if (msg.type === 'TOOL_CREATED') {
    updateAccessibility(msg.data.toolHardness);
  }
});
```

---

## What WORLD.md Actually Describes

**Not this** (ECS systems):
```typescript
class MaterialSystem {
  update(entities) {
    // Process all materials every frame
  }
}
```

**But this** (Yuka-driven entities):
```typescript
// Material is a Yuka entity with GOALS
const materialEntity = new YUKA.GameEntity();

materialEntity.brain = {
  goals: [
    new GameGoalEvaluator(GoalType.MAINTAIN_COHESION),
    new GameGoalEvaluator(GoalType.ATTRACT_AFFINITY),
  ],
  
  steering: [
    new CohesionBehavior(),  // Attracts to similar materials
    new SeparationBehavior(), // Maintains spacing
  ],
};

// Material DECIDES where to move based on goals
materialEntity.update(deltaTime);
```

---

## The Backend Should Actually Be

### Core Game Loop
```typescript
class GameEngine {
  private ecsWorld: World;           // Data storage
  private yukaManager: EntityManager; // AI agents
  private dispatcher: MessageDispatcher; // Communication
  
  update(deltaTime: number) {
    // 1. Yuka agents make decisions
    this.yukaManager.update(deltaTime);
    
    // 2. Decisions update ECS data
    this.syncYukaToECS();
    
    // 3. Messages coordinate between agents
    this.dispatcher.dispatchDelayed();
    
    // 4. Query ECS for state
    return this.getState();
  }
}
```

### Example: Tool Emergence

**NOT** an ECS system that runs every frame:
```typescript
class ToolSystem {
  update() {
    // Check if tool should emerge (runs every frame - WRONG)
    if (Math.random() < probability) {
      createTool();
    }
  }
}
```

**BUT** a Yuka entity that evaluates goals:
```typescript
// Tool Sphere is a Yuka entity
const toolSphere = new YUKA.GameEntity();

toolSphere.brain = {
  fuzzy: new ToolEmergenceFuzzy(),
  
  evaluateGoal(context) {
    const desirability = this.fuzzy.evaluate(
      context.materialPressure,
      context.creatureCapability
    );
    
    if (desirability > THRESHOLD) {
      // Send message to create tool
      dispatcher.dispatch({
        type: 'TOOL_SHOULD_EMERGE',
        data: { desirability },
      });
    }
  }
};

// Tool Sphere evaluates WHEN IT MAKES SENSE, not every frame
```

---

## What This Means for Backend

### Current (Wrong)
```
Backend
├── ECS Systems (process data every frame)
├── Stores (Zustand state)
└── REST API
```

### Correct
```
Backend
├── ECS Layer (data storage)
│   └── Miniplex World (entities, components)
├── Yuka Layer (decision making)
│   ├── GameEntity instances
│   ├── Goal evaluators
│   ├── Fuzzy modules
│   ├── FSM instances
│   └── Steering behaviors
├── Message Layer (coordination)
│   └── MessageDispatcher
└── REST API (exposes state)
```

---

## Concrete Example: Material System

### Old Way (ECS system)
```typescript
class RawMaterialsSystem {
  update(entities) {
    // Process materials every frame
    for (const material of entities) {
      // Do something?
    }
  }
}
```

### New Way (Yuka entities)
```typescript
// Each material is a Yuka entity
class MaterialEntity extends YUKA.GameEntity {
  constructor(materialData) {
    super();
    
    // Goals (what it wants)
    this.goals = [
      new CohesionGoal(materialData.affinityTypes),
    ];
    
    // Steering (how it moves)
    this.steering.add(new CohesionBehavior());
    this.steering.add(new SeparationBehavior());
    
    // Message handling (how it reacts)
    this.handleMessage = (msg) => {
      if (msg.type === 'TOOL_CREATED') {
        this.updateAccessibility(msg.data);
      }
    };
  }
}

// Materials managed by Yuka EntityManager
const materialManager = new YUKA.EntityManager();
materials.forEach(m => {
  materialManager.add(new MaterialEntity(m));
});

// Yuka updates agents (they make decisions)
materialManager.update(deltaTime);
```

---

## The Real Backend Architecture

```typescript
class GameEngine {
  // Data layer (what exists)
  private ecs: {
    creatures: Map<string, CreatureData>,
    materials: Map<string, MaterialData>,
    buildings: Map<string, BuildingData>,
  };
  
  // Behavior layer (how it behaves)
  private yuka: {
    creatureAgents: YUKA.EntityManager,
    materialAgents: YUKA.EntityManager,
    sphereAgents: YUKA.EntityManager,
  };
  
  // Communication layer (how they coordinate)
  private dispatcher: MessageDispatcher;
  
  update(deltaTime: number) {
    // 1. Yuka agents evaluate goals and make decisions
    this.yuka.creatureAgents.update(deltaTime);
    this.yuka.materialAgents.update(deltaTime);
    this.yuka.sphereAgents.update(deltaTime);
    
    // 2. Process messages (agents coordinate)
    this.dispatcher.update();
    
    // 3. Sync decisions to ECS data
    this.syncAgentsToData();
  }
  
  getState() {
    // Return ECS data (what exists now)
    return this.ecs;
  }
}
```

---

## The Mistake We Made

We built **ECS systems** that process data.

We should have built **Yuka entities** that make decisions.

ECS is just the **database**. Yuka is the **AI**.

---

## Next Steps

1. **Keep ECS for data storage** (Miniplex stores what exists)
2. **Add Yuka layer for behavior** (Agents make decisions)
3. **Wire MessageDispatcher** (Agents coordinate)
4. **Backend exposes data** (REST API queries ECS)

The backend doesn't need ECS "systems" that run every frame.
It needs Yuka agents that evaluate goals and send messages.

---

## Summary

**ECS**: "There is a creature at position (10, 0, 5) with mobility 0.7"
**Yuka**: "This creature's goal is to forage. Should I move left or right? Let me evaluate..."
**MessageDispatcher**: "Tool created! Material sphere, update accessibility."

**Backend's job**: Manage Yuka agents, let them make decisions, expose resulting data via API.

**Not**: Run ECS systems every frame processing data.
