# BACKEND ARCHITECTURE: REST Systems

## The Real Truth

Backend doesn't have a "game loop" running every frame.

Backend is **stateless REST API** that responds to requests.

---

## What a "System" Actually Is

### NOT this (game loop system):
```typescript
class MaterialSystem {
  update(deltaTime) {
    // Runs every frame - WRONG for backend
  }
}
```

### THIS (REST resource):
```typescript
// Material System = REST API for materials
fastify.get('/api/game/:id/materials', async (req, reply) => {
  const { id } = req.params;
  const game = games.get(id);
  
  return {
    materials: game.getMaterials(),
  };
});

fastify.get('/api/game/:id/materials/:x/:y/:z', async (req, reply) => {
  const { id, x, y, z } = req.params;
  const game = games.get(id);
  
  return {
    material: game.getMaterialAt(x, y, z),
  };
});
```

---

## Backend Architecture

```
Backend REST API
├── Game Management
│   ├── POST   /api/game/create
│   ├── GET    /api/game/:id
│   └── DELETE /api/game/:id
│
├── Time Advancement
│   ├── POST /api/game/:id/cycle
│   └── POST /api/game/:id/generation
│
├── Material System (REST Resource)
│   ├── GET /api/game/:id/materials
│   └── GET /api/game/:id/materials/:x/:y/:z
│
├── Creature System (REST Resource)
│   ├── GET  /api/game/:id/creatures
│   ├── GET  /api/game/:id/creatures/:id
│   └── POST /api/game/:id/creatures/:id/evolve
│
├── Tool System (REST Resource)
│   ├── GET  /api/game/:id/tools
│   └── POST /api/game/:id/tools/evaluate
│
├── Building System (REST Resource)
│   ├── GET  /api/game/:id/buildings
│   └── POST /api/game/:id/buildings/construct
│
├── Pack System (REST Resource)
│   ├── GET  /api/game/:id/packs
│   └── POST /api/game/:id/packs/form
│
└── Tribe System (REST Resource)
    ├── GET  /api/game/:id/tribes
    └── POST /api/game/:id/tribes/form
```

---

## How It Actually Works

### 1. Client Requests Game State
```bash
GET /api/game/123/creatures
```

### 2. Backend Computes State On-Demand
```typescript
fastify.get('/api/game/:id/creatures', async (req) => {
  const game = games.get(req.params.id);
  
  // Compute creatures NOW (not continuously)
  const creatures = game.getCreatures();
  
  return { creatures };
});
```

### 3. Client Requests Action
```bash
POST /api/game/123/generation
```

### 4. Backend Executes Action
```typescript
fastify.post('/api/game/:id/generation', async (req) => {
  const game = games.get(req.params.id);
  
  // Execute game logic NOW
  game.advanceGeneration();
  
  // Return new state
  return {
    state: game.getState(),
    events: game.getEvents(),
  };
});
```

---

## GameEngine is NOT a Game Loop

### NOT this:
```typescript
class GameEngine {
  update(deltaTime) {
    // Runs every frame - WRONG
    this.creatures.update(deltaTime);
    this.materials.update(deltaTime);
  }
}

// Game loop
setInterval(() => {
  engine.update(16.67); // 60 FPS
}, 16.67);
```

### THIS:
```typescript
class GameEngine {
  // State container
  private state: GameState;
  
  // Methods called by REST API
  advanceGeneration() {
    // Execute game logic ONCE
    this.state.generation++;
    
    // Process events
    this.processGeneration();
    
    // Return
  }
  
  getCreatures() {
    // Return current creatures
    return this.state.creatures;
  }
  
  getMaterialAt(x, y, z) {
    // Calculate on demand
    return calculateMaterial(x, y, z, this.state);
  }
}
```

---

## REST Systems = Endpoints

### Material System
```typescript
// GET /api/game/:id/materials
// Returns all materials
export function getMaterials(gameId: string) {
  const game = games.get(gameId);
  return game.state.materials;
}

// GET /api/game/:id/materials/:x/:y/:z
// Query material at position
export function getMaterialAt(gameId: string, x, y, z) {
  const game = games.get(gameId);
  return calculateMaterialAtPosition(game.state, x, y, z);
}
```

### Creature System
```typescript
// GET /api/game/:id/creatures
export function getCreatures(gameId: string) {
  const game = games.get(gameId);
  return game.state.creatures;
}

// POST /api/game/:id/creatures/:id/evolve
export function evolveCreature(gameId: string, creatureId: string) {
  const game = games.get(gameId);
  game.evolveCreature(creatureId);
  return game.state.creatures.get(creatureId);
}
```

### Tool System
```typescript
// GET /api/game/:id/tools
export function getTools(gameId: string) {
  const game = games.get(gameId);
  return game.state.tools;
}

// POST /api/game/:id/tools/evaluate
export function evaluateToolEmergence(gameId: string) {
  const game = games.get(gameId);
  const shouldEmerge = game.evaluateToolNeed();
  
  if (shouldEmerge) {
    const tool = game.createTool();
    return { emerged: true, tool };
  }
  
  return { emerged: false };
}
```

---

## Backend File Structure

```
packages/backend/src/
├── server.ts                 # Fastify app + routes
├── engine/
│   └── GameEngine.ts        # State container + methods
├── resources/               # REST resources (systems)
│   ├── materials.ts         # Material endpoints
│   ├── creatures.ts         # Creature endpoints
│   ├── tools.ts             # Tool endpoints
│   ├── buildings.ts         # Building endpoints
│   ├── packs.ts             # Pack endpoints
│   └── tribes.ts            # Tribe endpoints
├── logic/                   # Game logic (pure functions)
│   ├── material-calc.ts     # Material calculations
│   ├── evolution.ts         # Evolution logic
│   ├── tool-emergence.ts    # Tool emergence logic
│   └── fuzzy/              # Fuzzy logic modules
└── types/
    └── game-state.ts        # Type definitions
```

---

## Example: Tool Emergence via REST

### Client POSTs:
```bash
POST /api/game/123/tools/evaluate
```

### Server Handler:
```typescript
// src/server.ts
fastify.post('/api/game/:id/tools/evaluate', async (req, reply) => {
  return toolResource.evaluateEmergence(req.params.id);
});
```

### Resource Implementation:
```typescript
// src/resources/tools.ts
export async function evaluateEmergence(gameId: string) {
  const game = games.get(gameId);
  
  // Calculate pressures
  const materialPressure = calculateMaterialPressure(game.state);
  const creatureCapability = getAverageCapability(game.state.creatures);
  
  // Fuzzy logic evaluation
  const fuzzy = new ToolEmergenceFuzzy();
  const desirability = fuzzy.evaluate(materialPressure, creatureCapability);
  
  if (desirability > THRESHOLD) {
    // Create tool
    const tool = createTool(game.state);
    game.state.tools.push(tool);
    
    // Send message (for other systems)
    game.dispatch({
      type: 'TOOL_CREATED',
      data: { tool },
    });
    
    return { emerged: true, tool };
  }
  
  return { emerged: false, desirability };
}
```

---

## The Truth

**Backend = REST API server**

**Systems = REST resources/endpoints**

**No game loop running every frame**

**State updated on API calls**

**Yuka/Fuzzy logic = computational functions called by endpoints**

---

## What This Means

1. **No continuous update loop** - Only responds to HTTP requests
2. **Stateless** - Game state in memory or DB
3. **Systems are endpoints** - `/api/game/:id/creatures` IS the creature system
4. **Logic is pure functions** - Called by endpoints as needed
5. **Yuka/Fuzzy are tools** - Used for calculations, not autonomous agents

---

## Correct Backend Structure

```typescript
// server.ts
const app = Fastify();

// Game management
app.post('/api/game/create', createGame);
app.get('/api/game/:id', getGame);

// Material system (REST resource)
app.get('/api/game/:id/materials', getMaterials);
app.get('/api/game/:id/materials/:x/:y/:z', getMaterialAt);

// Creature system (REST resource)
app.get('/api/game/:id/creatures', getCreatures);
app.post('/api/game/:id/creatures/:id/evolve', evolveCreature);

// Tool system (REST resource)
app.get('/api/game/:id/tools', getTools);
app.post('/api/game/:id/tools/evaluate', evaluateToolEmergence);

// Time advancement
app.post('/api/game/:id/cycle', advanceCycle);
app.post('/api/game/:id/generation', advanceGeneration);
```

**Each endpoint = One system operation**

**No background processing**

**Pure request/response**

This is the backend.
