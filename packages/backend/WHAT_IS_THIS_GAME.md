# WHAT IS THIS GAME?

## Stop Thinking "ECS Because Games Need ECS"

This game is **not** about entities being processed by systems in a loop.

This game is **a mathematical model of a stratified sphere**.

---

## The Core Concept

### The Planet is a Mathematical Function

When you start a game, you create a **state machine** that:

1. **Projects a sphere** (the planet surface)
2. **Defines material stratification** (layers of materials at different depths)
3. **Allows you to drive a line down to the core** (raycast/query from surface to center)

At **any point (x, y, z)**, you can ask: **"What material is here?"**

The answer is **computed mathematically**, not looked up in a voxel grid.

---

## Example: Querying the Planet

### Request
```http
GET /api/game/abc123/materials/query?x=10&y=-5&z=3
```

### Backend Computation
```typescript
function getMaterialAt(x, y, z, gameState) {
  // Calculate depth from surface
  const surfaceY = gameState.planet.getTerrainHeight(x, z);
  const depth = surfaceY - y;
  
  // Find which material layer this depth falls into
  const layer = gameState.planet.stratification.find(layer => 
    depth >= layer.minDepth && depth <= layer.maxDepth
  );
  
  // Use noise function to determine exact material in this layer
  const noise = gameState.planet.noise(x, y, z, gameState.seed);
  const material = layer.selectMaterial(noise);
  
  return {
    x, y, z,
    depth,
    material: material.type,
    hardness: material.hardness,
    accessible: depth <= gameState.currentMaxReach,
  };
}
```

### Response
```json
{
  "x": 10,
  "y": -5,
  "z": 3,
  "depth": 5,
  "material": "limestone",
  "hardness": 3.2,
  "accessible": true
}
```

---

## What the Game Actually IS

### 1. Planetary State Machine
```typescript
interface PlanetState {
  seed: string;
  radius: number;
  
  // Material stratification (depth layers)
  stratification: Layer[];
  
  // Noise functions for terrain/distribution
  terrainNoise: NoiseFunction;
  materialNoise: NoiseFunction;
  
  // Physical properties
  gravity: number;
  dayLength: number; // seconds
}
```

### 2. Evolution State Machine
```typescript
interface EvolutionState {
  generation: number;
  
  // Creature archetypes and their traits
  creatures: Map<string, Creature>;
  
  // Environmental pressure (drives evolution)
  pressure: {
    materialAccessibility: number;
    resourceScarcity: number;
    competition: number;
  };
}
```

### 3. Emergence State Machine
```typescript
interface EmergenceState {
  // Tools that have emerged
  availableTools: Tool[];
  
  // Buildings that have been constructed
  buildings: Building[];
  
  // Social structures
  packs: Pack[];
  tribes: Tribe[];
  
  // Maximum depth/hardness accessible
  maxReach: number;
  maxHardness: number;
}
```

---

## The Backend is a Query Engine

### NOT a Game Loop
```typescript
// ❌ WRONG - This is NOT what we're doing
function gameLoop() {
  while (true) {
    updateCreatures();
    updateMaterials();
    updateBuildings();
    render();
  }
}
```

### YES - A Query Responder
```typescript
// ✅ CORRECT - This is what we ARE doing

// Query: "What material is at this position?"
app.get('/materials/query', (req) => {
  const { x, y, z } = req.query;
  return computeMaterialAt(x, y, z, gameState);
});

// Query: "Advance evolution one generation"
app.post('/generation/advance', (req) => {
  gameState.generation++;
  const evolved = evolveCreatures(gameState);
  const emerged = checkToolEmergence(gameState);
  return { generation: gameState.generation, evolved, emerged };
});

// Query: "Can this tribe build this building?"
app.post('/buildings/check', (req) => {
  const { tribeId, buildingType } = req.body;
  return canConstruct(tribeId, buildingType, gameState);
});
```

---

## Core Operations

### 1. Material Query (The Fundamental Operation)
**"Drive a line down to the core"**

```typescript
function raycastToCore(surfaceX, surfaceZ, gameState) {
  const surfaceY = gameState.planet.getTerrainHeight(surfaceX, surfaceZ);
  const core = { x: 0, y: 0, z: 0 }; // Planet center
  
  const materials = [];
  const step = 0.1; // Ray step size
  
  // Cast ray from surface to core
  for (let t = 0; t <= 1; t += step) {
    const point = lerp(
      { x: surfaceX, y: surfaceY, z: surfaceZ },
      core,
      t
    );
    
    const material = getMaterialAt(point.x, point.y, point.z, gameState);
    materials.push({ point, material });
  }
  
  return materials; // Full material column
}
```

### 2. Evolution Computation
```typescript
function evolveCreature(creatureId, gameState) {
  const creature = gameState.creatures.get(creatureId);
  
  // Calculate trait changes based on pressure
  const traitDelta = calculateTraitPressure(
    creature.traits,
    gameState.pressure,
    gameState.planet
  );
  
  // Apply random mutation
  const mutation = gaussianRandom(0, 0.1);
  
  const newTraits = {};
  for (const [trait, value] of Object.entries(creature.traits)) {
    newTraits[trait] = clamp(
      value + traitDelta[trait] + mutation,
      0,
      1
    );
  }
  
  return {
    ...creature,
    generation: gameState.generation,
    traits: newTraits,
  };
}
```

### 3. Tool Emergence (Fuzzy Logic)
```typescript
function checkToolEmergence(gameState) {
  // Calculate inputs
  const avgExcavation = getAverageCreatureTrait('excavation', gameState);
  const avgManipulation = getAverageCreatureTrait('manipulation', gameState);
  const materialPressure = countInaccessibleMaterials(gameState) / totalMaterials;
  
  // Fuzzy evaluation
  const fuzzy = new FuzzyModule();
  
  fuzzy.addFLV('excavation', 0, 1);
  fuzzy.addFLV('manipulation', 0, 1);
  fuzzy.addFLV('pressure', 0, 1);
  fuzzy.addFLV('desirability', 0, 1);
  
  fuzzy.addRule(
    'IF excavation IS high AND manipulation IS high AND pressure IS high THEN desirability IS high'
  );
  
  fuzzy.setValue('excavation', avgExcavation);
  fuzzy.setValue('manipulation', avgManipulation);
  fuzzy.setValue('pressure', materialPressure);
  
  fuzzy.defuzzify('desirability');
  const desirability = fuzzy.getValue('desirability');
  
  if (desirability > 0.7) {
    const tool = generateTool(gameState);
    gameState.tools.push(tool);
    return { emerged: true, tool };
  }
  
  return { emerged: false };
}
```

---

## REST Resources = Mathematical Queries

### Material Resource
```
GET /api/game/:id/materials/query?x=10&y=-5&z=3
→ Compute material at point

GET /api/game/:id/materials/raycast?x=10&z=3
→ Compute full material column from surface to core

GET /api/game/:id/materials/accessible
→ Compute all materials within current reach
```

### Evolution Resource
```
POST /api/game/:id/generation/advance
→ Compute next generation of all creatures

GET /api/game/:id/creatures
→ Return current creature states

POST /api/game/:id/creatures/:id/evolve
→ Compute evolution of specific creature
```

### Emergence Resource
```
POST /api/game/:id/tools/evaluate
→ Compute if tool should emerge (fuzzy logic)

GET /api/game/:id/buildings/available
→ Compute which buildings are constructible

POST /api/game/:id/packs/form
→ Compute pack formation from creatures
```

---

## The State Machine

```typescript
interface GameState {
  // Identity
  gameId: string;
  seed: string;
  
  // Time
  generation: number;
  cycle: number; // day/night
  
  // Planet (mathematical model)
  planet: {
    radius: number;
    gravity: number;
    dayLength: number;
    stratification: Layer[];
    terrainNoise: NoiseFunction;
    materialNoise: NoiseFunction;
  };
  
  // Evolution (trait tracking)
  creatures: Map<string, Creature>;
  pressure: EnvironmentalPressure;
  
  // Emergence (unlocked capabilities)
  tools: Tool[];
  buildings: Building[];
  packs: Pack[];
  tribes: Tribe[];
  
  // Computed properties
  maxReach: number;
  maxHardness: number;
  worldScore: number;
  
  // Events (message log)
  events: GameEvent[];
}
```

---

## Summary

**This game is NOT:**
- An ECS with systems processing entities in a loop
- A real-time simulation running at 60 FPS
- A voxel grid storing material data

**This game IS:**
- A mathematical model of a stratified sphere
- A state machine tracking evolution and emergence
- A query engine that computes answers on-demand
- A RESTful API that responds to questions about game state

**The fundamental operation:**
"At any point you can drive a line down to a core" - raycast through material layers, computed mathematically from seed + noise functions.

**The backend:**
A query responder that computes material composition, evolution, and emergence when asked.

**The frontend:**
A visualization that queries the backend and renders the results.

No game loop. No continuous processing. Just **mathematical state** that can be **queried on demand**.
