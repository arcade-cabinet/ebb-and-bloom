# YUKA SYSTEMS: PROPER ASSIGNMENT

## Stop the ECS Bullshit

We have **3 actual components:**
1. **World Simulation** (`src/world/`) - Pure math, deterministic
2. **State Tracking** (`src/state/`) - Zustand, historical record
3. **REST Interface** (`src/api/`) - HTTP queries/commands

Let's map Yuka's 10+ systems to where they ACTUALLY belong.

---

## 1. GOALS & GOAL EVALUATOR

**What:** Hierarchical decision-making, desirability scoring

**Belongs in:** `src/world/` (simulation logic)

**Used for:**
- Tool emergence decisions
- Building emergence decisions
- Creature behavior priorities
- Tribe formation decisions

**Example:**
```typescript
// src/world/tools/emergence.ts
import { GoalEvaluator, CompositeGoal } from 'yuka';

export function evaluateToolEmergence(state: SimulationState): boolean {
  const evaluator = new GoalEvaluator();
  
  const excavateGoal = new ExcavateDeepGoal(state.materials, state.creatures);
  const desirability = evaluator.calculateDesirability(excavateGoal);
  
  return desirability > 0.7;
}
```

**NOT used for:** Rendering, UI, tracking

---

## 2. FUZZY MODULE

**What:** Fuzzy logic for ambiguous decisions

**Belongs in:** `src/world/` (simulation logic)

**Used for:**
- Tool emergence thresholds
- Religion emergence conditions
- Governance type selection
- Ending detection (simulation side)

**Example:**
```typescript
// src/world/religion/emergence.ts
import { FuzzyModule } from 'yuka';

export function evaluateReligionEmergence(state: SimulationState): boolean {
  const fuzzy = new FuzzyModule();
  
  // Input variables
  fuzzy.addFLV('danger', 0, 1)
    .addTriangle('low', 0, 0, 0.4)
    .addTriangle('high', 0.6, 1, 1);
  
  fuzzy.addFLV('depth', 0, 6371)
    .addTriangle('shallow', 0, 0, 2000)
    .addTriangle('deep', 2000, 6371, 6371);
  
  // Output variable
  fuzzy.addFLV('religiosity', 0, 1);
  
  // Rule: IF danger HIGH AND depth DEEP THEN religiosity HIGH
  fuzzy.addRule('IF danger IS high AND depth IS deep THEN religiosity IS high');
  
  fuzzy.setValue('danger', calculateDanger(state));
  fuzzy.setValue('depth', state.depthReached);
  
  fuzzy.defuzzify('religiosity');
  
  return fuzzy.getValue('religiosity') > 0.6;
}
```

**NOT used for:** Rendering, UI, tracking

---

## 3. FSM (Finite State Machine)

**What:** State transitions with enter/exit logic

**Belongs in:** `src/world/` (simulation logic)

**Used for:**
- Governance transitions (anarchy → chiefdom → council → democracy)
- Creature states (idle → foraging → fleeing)
- Building states (construction → active → damaged → ruins)

**Example:**
```typescript
// src/world/governance/fsm.ts
import { StateMachine, State } from 'yuka';

class GovernanceFSM extends StateMachine {
  constructor() {
    super();
    
    this.addState(new AnarchyState());
    this.addState(new ChiefdomState());
    this.addState(new CouncilState());
    this.addState(new DemocracyState());
  }
}

class AnarchyState extends State {
  execute(state: SimulationState) {
    // Check transition conditions
    if (state.tribes.length > 0) {
      this.stateMachine.changeTo('chiefdom');
    }
  }
}
```

**NOT used for:** HTTP state, session management, UI state

---

## 4. MESSAGE DISPATCHER

**What:** Inter-entity event messaging

**This is tricky. It's ACTUALLY the event bus between components.**

**Belongs in:** `src/api/events/` (cross-component communication)

**Used for:**
- Simulation → State: "Tool emerged" → Track in history
- Simulation → API: "Creature died" → Broadcast to clients
- API → Simulation: "Player nudge" → Influence parameters

**Example:**
```typescript
// src/api/events/dispatcher.ts
import { MessageDispatcher } from 'yuka';

enum MessageType {
  TOOL_EMERGED = 'tool_emerged',
  TRIBE_FORMED = 'tribe_formed',
  MATERIAL_DEPLETED = 'material_depleted',
  GENERATION_ADVANCED = 'generation_advanced',
}

class GameEventDispatcher {
  private dispatcher = new MessageDispatcher();
  
  // Simulation sends message
  sendToolEmerged(tool: Tool) {
    this.dispatcher.dispatchMessage(0, 'simulation', 'state', MessageType.TOOL_EMERGED, tool);
    this.dispatcher.dispatchMessage(0, 'simulation', 'api', MessageType.TOOL_EMERGED, tool);
  }
  
  // State receives message
  onToolEmerged(tool: Tool) {
    worldState.update(state => ({
      ...state,
      generations[state.generation].tools.push(tool.type)
    }));
  }
}
```

**This is the GLUE between simulation, state, and API.**

---

## 5. VISION & MEMORY SYSTEM

**What:** Creature perception and short-term memory

**Belongs in:** `src/world/creatures/` (simulation logic)

**Used for:**
- Do we even need this without 3D rendering?
- Maybe for creature-to-creature awareness?
- Probably NOT NEEDED for pure simulation

**Decision:** **SKIP IT** unless we add real-time creature interactions

---

## 6. STEERING BEHAVIORS (Cohesion, Separation, Alignment)

**What:** Flocking/movement behaviors

**Belongs in:** `src/world/creatures/` OR **SKIP IT**

**Do we need this?**
- For 3D rendering: YES (creatures move in space)
- For pure simulation: NO (we don't care about positions, just states)

**Decision:** **SKIP IT** for now, add later if we add 3D frontend

---

## 7. TRIGGERS

**What:** Spatial/temporal event detection

**Belongs in:** `src/state/` (pattern detection in tracked data)

**Used for:**
- Detect stagnation (no progress for N generations)
- Detect depletion danger (materials < threshold)
- Detect ending conditions

**Example:**
```typescript
// src/state/triggers.ts
import { Trigger } from 'yuka';

class StagnationTrigger extends Trigger {
  check(state: WorldState): boolean {
    const recentGens = state.generations.slice(-20);
    const progressDelta = recentGens[recentGens.length - 1].materials.accessible - 
                          recentGens[0].materials.accessible;
    
    return progressDelta < 0.05; // Less than 5% progress in 20 gens
  }
}

class DepletionTrigger extends Trigger {
  check(state: WorldState): boolean {
    const currentGen = state.generations[state.generation];
    return currentGen.materials.depleted > state.materials.length * 0.5;
  }
}
```

**This is for PATTERN DETECTION in tracked state, not spatial triggers.**

---

## 8. TASK QUEUE

**What:** Sequential action execution

**Belongs in:** `src/world/` OR **SKIP IT**

**Do we need this?**
- For creature AI: "Gather wood, then build shelter, then rest"
- For our simulation: We're not tracking individual creature tasks

**Decision:** **SKIP IT** - we care about population-level behaviors, not individual tasks

---

## 9. PATH & FOLLOW PATH BEHAVIOR

**What:** Pathfinding and route following

**Belongs in:** **SKIP IT**

**Why:** No spatial movement in pure simulation

---

## The Actual Yuka Usage Map

```
Component              | Yuka Systems Used
-----------------------|------------------------------------------
src/world/             | Goals, GoalEvaluator, FuzzyModule, FSM
src/state/             | Triggers (pattern detection)
src/api/events/        | MessageDispatcher (event bus)
src/frontend/ (later)  | Vision, Memory, Steering, Path (3D only)
```

---

## Component Architecture with Yuka

### Component 1: World Simulation
```
src/world/
├── creatures/
│   ├── evolution.ts        # GoalEvaluator for trait priorities
│   └── capability.ts       # Pure math
├── tools/
│   └── emergence.ts        # FuzzyModule for emergence decisions
├── buildings/
│   └── emergence.ts        # FuzzyModule for building needs
├── religion/
│   └── emergence.ts        # FuzzyModule for belief systems
├── governance/
│   └── fsm.ts              # FSM for governance transitions
└── simulation.ts           # Core loop (no Yuka here, just orchestration)
```

### Component 2: State Tracking (Zustand)
```
src/state/
├── WorldState.ts           # Zustand store definition
├── triggers/
│   ├── stagnation.ts       # Trigger for no progress
│   ├── depletion.ts        # Trigger for resource danger
│   └── ending.ts           # Trigger for ending conditions
├── metrics.ts              # Pure computation, no Yuka
└── trends.ts               # Pure computation, no Yuka
```

### Component 3: REST API
```
src/api/
├── events/
│   └── dispatcher.ts       # MessageDispatcher (event bus)
├── routes/
│   ├── world.ts            # Query simulation
│   ├── state.ts            # Query Zustand
│   ├── actions.ts          # Command simulation
│   └── events.ts           # Subscribe to MessageDispatcher
└── server.ts               # Fastify
```

### Component 4: Frontend (Future)
```
packages/frontend/src/
├── rendering/
│   ├── creatures.tsx       # Vision, Memory, Steering (Yuka 3D)
│   └── camera.tsx          # Path following
└── ui/
    └── status.tsx          # Queries API, no Yuka
```

---

## The Key Insight

**Yuka is NOT a monolithic "AI system."**

It's a **toolkit** with separate, independent systems:

- **Goals/Fuzzy/FSM** → Decision logic → `src/world/`
- **MessageDispatcher** → Event bus → `src/api/events/`
- **Triggers** → Pattern detection → `src/state/`
- **Steering/Vision/Memory** → 3D behaviors → `packages/frontend/` (later)

**Each Yuka system goes where it's ACTUALLY useful, not crammed into "ECS systems."**

---

## Updated File Structure

```
packages/backend/
├── src/
│   ├── world/                    # Pure simulation (Goals, Fuzzy, FSM)
│   │   ├── planetary/
│   │   ├── creatures/
│   │   │   ├── evolution.ts      # Uses GoalEvaluator
│   │   │   └── capability.ts
│   │   ├── materials/
│   │   ├── tools/
│   │   │   └── emergence.ts      # Uses FuzzyModule
│   │   ├── buildings/
│   │   │   └── emergence.ts      # Uses FuzzyModule
│   │   ├── religion/
│   │   │   └── emergence.ts      # Uses FuzzyModule
│   │   ├── governance/
│   │   │   └── fsm.ts            # Uses StateMachine
│   │   └── simulation.ts
│   │
│   ├── state/                    # Zustand tracking (Triggers)
│   │   ├── WorldState.ts
│   │   ├── triggers/
│   │   │   ├── stagnation.ts     # Uses Trigger
│   │   │   ├── depletion.ts      # Uses Trigger
│   │   │   └── ending.ts         # Uses Trigger
│   │   ├── metrics.ts
│   │   └── trends.ts
│   │
│   └── api/                      # REST interface (MessageDispatcher)
│       ├── events/
│       │   └── dispatcher.ts     # Uses MessageDispatcher
│       ├── routes/
│       │   ├── world.ts
│       │   ├── state.ts
│       │   ├── actions.ts
│       │   └── events.ts
│       └── server.ts
```

---

## Summary

**No more ECS.**

**3 Components:**
1. World (simulation)
2. State (tracking)
3. API (interface)

**Yuka Systems Assigned:**
- `src/world/` → Goals, GoalEvaluator, FuzzyModule, FSM
- `src/state/` → Triggers
- `src/api/events/` → MessageDispatcher
- Skip: Vision, Memory, Steering, Path, TaskQueue (3D only or not needed)

**Each Yuka system goes where it's actually useful.**

**No cramming everything into "ECS systems."**

That's the proper architecture.
