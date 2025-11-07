# THE RIGHT API BREAKDOWN

## Not "One REST API" - Five Different APIs

Each serves different concerns, different consumers, different performance needs.

---

## API 1: WORLD QUERY API (Read Simulation)

**Purpose:** Query current simulation state

**Consumer:** CLI, Frontend, Analysis tools

**Performance:** Fast (pure computation, no side effects)

**Endpoints:**
```
GET /world/materials/query?x=X&y=Y&z=Z
→ Returns: Material at point

GET /world/materials/column?x=X&z=Z
→ Returns: Full column from surface to core

GET /world/materials/accessible
→ Returns: List of accessible materials

GET /world/creatures/:id
→ Returns: Creature traits and capability

GET /world/creatures/:id/capability
→ Returns: What this creature can reach

GET /world/pressure
→ Returns: Current evolutionary pressure

GET /world/tribes
→ Returns: All tribes and their states

GET /world/religion
→ Returns: Current religious state (or null)

GET /world/governance
→ Returns: Current governance type
```

**Implementation:**
```typescript
// src/api/world/query.ts
import { simulation } from '../../world/simulation.js';

export function registerWorldQueryRoutes(fastify: FastifyInstance) {
  fastify.get('/world/materials/query', async (request) => {
    const { x, y, z } = request.query;
    return simulation.planet.queryPoint(x, y, z);
  });
  
  fastify.get('/world/pressure', async () => {
    return simulation.calculatePressure();
  });
}
```

**No side effects. Pure queries.**

---

## API 2: WORLD COMMAND API (Mutate Simulation)

**Purpose:** Command simulation to change state

**Consumer:** CLI, Frontend (player actions)

**Performance:** Slow (executes simulation logic, has side effects)

**Endpoints:**
```
POST /world/advance-generation
→ Executes: Full generation advancement
→ Returns: New state + events

POST /world/advance-cycle
→ Executes: Single day/night cycle
→ Returns: New state + events

POST /world/consume
Body: { materialType, amount }
→ Executes: Consume material
→ Returns: Updated material state

POST /world/nudge-trait
Body: { creatureId, trait, amount }
→ Executes: Player influence on evolution
→ Returns: Updated creature state
```

**Implementation:**
```typescript
// src/api/world/command.ts
import { simulation } from '../../world/simulation.js';
import { eventDispatcher } from '../events/dispatcher.js';

export function registerWorldCommandRoutes(fastify: FastifyInstance) {
  fastify.post('/world/advance-generation', async () => {
    const events = simulation.advanceGeneration();
    
    // Broadcast events
    events.forEach(e => eventDispatcher.send(e));
    
    // Update state tracking
    await captureGenerationSnapshot(simulation.getState());
    
    return {
      generation: simulation.generation,
      events,
      state: simulation.getState(),
    };
  });
}
```

**Has side effects. Triggers events. Updates state.**

---

## API 3: STATE QUERY API (Read Historical Data)

**Purpose:** Query Zustand-tracked historical data

**Consumer:** CLI, Frontend, Analysis tools

**Performance:** Fast (read from Zustand, no computation)

**Endpoints:**
```
GET /state/generation/:gen
→ Returns: Full snapshot of that generation

GET /state/current
→ Returns: Current generation snapshot

GET /state/history
→ Returns: All generation snapshots (Gen 0-6)

GET /state/trends
→ Returns: Computed trends (acceleration, depletion, etc.)

GET /state/score
→ Returns: Current score breakdown

GET /state/timeline
→ Returns: Key events across all generations
```

**Implementation:**
```typescript
// src/api/state/query.ts
import { worldState } from '../../state/WorldState.js';

export function registerStateQueryRoutes(fastify: FastifyInstance) {
  fastify.get('/state/generation/:gen', async (request) => {
    const { gen } = request.params;
    const state = worldState.getState();
    return state.generations[parseInt(gen)];
  });
  
  fastify.get('/state/trends', async () => {
    const state = worldState.getState();
    return state.trends;
  });
}
```

**Reads from Zustand. No simulation queries.**

---

## API 4: EVENT STREAM API (Real-Time Events)

**Purpose:** Subscribe to real-time game events

**Consumer:** CLI (non-blocking mode), Frontend

**Performance:** Streaming (WebSocket or SSE)

**Endpoints:**
```
WebSocket: ws://host/events
→ Streams: Tool emerged, tribe formed, material depleted, etc.

GET /events/stream (SSE)
→ Streams: Server-Sent Events

GET /events/recent
→ Returns: Last N events (polling fallback)
```

**Implementation:**
```typescript
// src/api/events/stream.ts
import { eventDispatcher } from './dispatcher.js';

export function registerEventStreamRoutes(fastify: FastifyInstance) {
  fastify.get('/events/stream', async (request, reply) => {
    reply.raw.setHeader('Content-Type', 'text/event-stream');
    reply.raw.setHeader('Cache-Control', 'no-cache');
    reply.raw.setHeader('Connection', 'keep-alive');
    
    const listener = (event) => {
      reply.raw.write(`data: ${JSON.stringify(event)}\n\n`);
    };
    
    eventDispatcher.subscribe(listener);
    
    request.raw.on('close', () => {
      eventDispatcher.unsubscribe(listener);
    });
  });
}
```

**Real-time push. MessageDispatcher integration.**

---

## API 5: ANALYSIS API (Derived Insights)

**Purpose:** Compute derived insights from simulation + state

**Consumer:** CLI, Frontend (player feedback)

**Performance:** Medium (reads both simulation and state, does computation)

**Endpoints:**
```
GET /analysis/warnings
→ Returns: Dangers detected (depletion, stagnation, etc.)

GET /analysis/recommendations
→ Returns: Suggested player actions

GET /analysis/ending
→ Returns: Ending type (if detected) or null

GET /analysis/trajectory
→ Returns: Predicted outcome based on trends

GET /analysis/bottlenecks
→ Returns: Current blockers to progress
```

**Implementation:**
```typescript
// src/api/analysis/insights.ts
import { simulation } from '../../world/simulation.js';
import { worldState } from '../../state/WorldState.js';

export function registerAnalysisRoutes(fastify: FastifyInstance) {
  fastify.get('/analysis/warnings', async () => {
    const simState = simulation.getState();
    const stateData = worldState.getState();
    
    const warnings = [];
    
    // Check depletion
    if (simState.materials.filter(m => m.remaining < 100).length > 3) {
      warnings.push({
        type: 'DEPLETION',
        severity: 'HIGH',
        message: 'Multiple materials near depletion',
      });
    }
    
    // Check stagnation
    if (stateData.trends.evolutionAcceleration < 0.01) {
      warnings.push({
        type: 'STAGNATION',
        severity: 'MEDIUM',
        message: 'Evolution has stalled',
      });
    }
    
    return warnings;
  });
  
  fastify.get('/analysis/ending', async () => {
    const stateData = worldState.getState();
    
    if (stateData.generation === 6) {
      return detectEnding(stateData.score, stateData.trends);
    }
    
    return null;
  });
}
```

**Combines simulation + state. Interprets for player.**

---

## The Breakdown

```
┌──────────────────────────────────────────────────┐
│                   CONSUMERS                      │
│         (CLI, Frontend, Analysis Tools)          │
└─────────────┬────────────────────────────────────┘
              │
              ▼
┌──────────────────────────────────────────────────┐
│                  API LAYER                       │
├──────────────────────────────────────────────────┤
│  1. World Query API      → Read simulation       │
│  2. World Command API    → Mutate simulation     │
│  3. State Query API      → Read history          │
│  4. Event Stream API     → Real-time events      │
│  5. Analysis API         → Derived insights      │
└─────┬─────────────┬────────────────┬─────────────┘
      │             │                │
      ▼             ▼                ▼
┌─────────┐  ┌────────────┐  ┌──────────────┐
│  WORLD  │  │   STATE    │  │    EVENTS    │
│ (Yuka)  │  │ (Zustand)  │  │(MessageDisp) │
└─────────┘  └────────────┘  └──────────────┘
```

---

## Why This Breakdown?

### 1. Separation of Concerns
- **World Query** = pure functions, no side effects
- **World Command** = mutations, triggers events
- **State Query** = historical data, no simulation queries
- **Event Stream** = real-time push, no polling
- **Analysis** = interpretation layer, no raw data

### 2. Performance Optimization
- World Query: Cache, memoize
- World Command: Rate limit, queue
- State Query: Indexed reads
- Event Stream: Push only changes
- Analysis: Compute on-demand, cache results

### 3. Consumer Clarity
```typescript
// CLI wants to know: What material is here?
GET /world/materials/query?x=0&y=6000000&z=0

// CLI wants to know: How are we doing historically?
GET /state/trends

// CLI wants to act: Advance time
POST /world/advance-generation

// CLI wants feedback: Subscribe to events
WebSocket /events

// CLI wants guidance: What should I do?
GET /analysis/recommendations
```

### 4. Independent Evolution
- Can optimize World Query without touching State
- Can change State storage without touching World
- Can swap Event Stream transport (WS → SSE) independently
- Can enhance Analysis without touching simulation

---

## File Structure

```
packages/backend/src/api/
├── world/
│   ├── query.ts        # API 1: World Query
│   └── command.ts      # API 2: World Command
├── state/
│   └── query.ts        # API 3: State Query
├── events/
│   ├── dispatcher.ts   # MessageDispatcher wrapper
│   └── stream.ts       # API 4: Event Stream
├── analysis/
│   └── insights.ts     # API 5: Analysis
└── server.ts           # Fastify app (registers all)
```

---

## Example: CLI Using All 5 APIs

```bash
# API 1: Query simulation
$ curl /world/materials/query?x=0&y=6000000&z=0
{ material: "olivine", hardness: 6.5, accessible: true }

# API 3: Query historical state
$ curl /state/trends
{ evolutionAcceleration: 0.15, resourceDepletion: 0.67 }

# API 5: Get player guidance
$ curl /analysis/warnings
[{ type: "DEPLETION", severity: "HIGH", message: "Surface materials low" }]

# API 2: Execute command
$ curl -X POST /world/advance-generation
{ generation: 2, events: [...], state: {...} }

# API 4: Subscribe to events (WebSocket)
$ wscat -c ws://localhost:3000/events
< { type: "TOOL_EMERGED", data: { tool: "stone-digger" } }
```

---

## Summary

**Not one API - FIVE APIs:**

1. **World Query API** - Read simulation (pure)
2. **World Command API** - Mutate simulation (side effects)
3. **State Query API** - Read history (Zustand)
4. **Event Stream API** - Real-time push (MessageDispatcher)
5. **Analysis API** - Interpreted insights (simulation + state)

**Each API serves different:**
- Concerns
- Consumers
- Performance needs
- Data sources

**This is proper decomposition.**
**This is the right API breakdown.**
