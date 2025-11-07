# ECS ARCHITECTURE DEFINITION

## What ARE the Entities, Components, and Systems?

---

## ENTITIES (What exists in the game)

### Individual Game Objects

1. **Creature** - A single creature
2. **Material Deposit** - A chunk of material at a location  
3. **Building** - A constructed structure
4. **Tool** - An available tool archetype
5. **Pack** - A group of creatures
6. **Tribe** - An organized civilization
7. **Planet** - The world itself

---

## COMPONENTS (Data attached to entities)

### Creature Components
```typescript
{
  id: string,
  transform: { x, y, z, rotation },
  traits: {
    mobility: number,
    manipulation: number,
    excavation: number,
    social: number,
    intelligence: number,
    // ... 10 total
  },
  taxonomy: {
    class: string,
    order: string,
    family: string,
    genus: string,
    species: string,
  },
  health: number,
  generation: number,
  parentId: string | null,
  packId: string | null,
}
```

### Material Components
```typescript
{
  id: string,
  transform: { x, y, z },
  materialType: string,
  category: 'stone' | 'ore' | 'crystal' | 'organic' | 'liquid',
  hardness: number,
  density: number,
  abundance: number,
  discovered: boolean,
}
```

### Building Components
```typescript
{
  id: string,
  transform: { x, y, z, rotation },
  buildingType: 'shelter' | 'workshop' | 'storage' | 'temple',
  tribeId: string,
  health: number,
  constructed: number, // generation built
  materials: string[], // materials used
}
```

### Tool Components
```typescript
{
  id: string,
  toolType: 'digger' | 'cutter' | 'crusher' | 'extractor',
  hardness: number, // what it can break
  reach: number,    // depth it can access
  emergedGeneration: number,
  requiredTraits: { manipulation: number, intelligence: number },
}
```

### Pack Components
```typescript
{
  id: string,
  leaderId: string,
  memberIds: string[],
  territory: { center: Vector3, radius: number },
  cohesion: number,
  founded: number,
}
```

### Tribe Components
```typescript
{
  id: string,
  name: string,
  packIds: string[],
  buildingIds: string[],
  population: number,
  culture: 'peaceful' | 'aggressive' | 'neutral',
  territory: { center: Vector3, radius: number },
  founded: number,
}
```

---

## SYSTEMS (Logic that operates on entities)

### BACKEND Systems (REST Operations)

These are **NOT continuous loops**. They're **operations triggered by API calls**.

#### 1. Material System
**Endpoints**:
- `GET /api/game/:id/materials` → Query all materials
- `GET /api/game/:id/materials/:x/:y/:z` → Query material at position

**Operations**:
```typescript
function getMaterialAt(x, y, z, gameState) {
  // Calculate which material exists at position
  const depth = -y;
  const candidates = gameState.materials.filter(m => 
    depth >= m.minDepth && depth <= m.maxDepth
  );
  
  // Use noise function for distribution
  return selectMaterial(candidates, x, z, gameState.noiseFunction);
}
```

#### 2. Creature System
**Endpoints**:
- `GET /api/game/:id/creatures` → Query all creatures
- `POST /api/game/:id/creatures/:id/evolve` → Evolve creature

**Operations**:
```typescript
function evolveCreature(creatureId, gameState) {
  const creature = gameState.creatures.get(creatureId);
  
  // Calculate trait changes based on pressure
  const newTraits = calculateTraitEvolution(
    creature.traits,
    gameState.environmentalPressure
  );
  
  // Create evolved creature
  const evolved = {
    ...creature,
    id: `${creatureId}-gen${gameState.generation}`,
    generation: gameState.generation,
    traits: newTraits,
    parentId: creatureId,
  };
  
  gameState.creatures.set(evolved.id, evolved);
  return evolved;
}
```

#### 3. Tool System
**Endpoints**:
- `GET /api/game/:id/tools` → Query available tools
- `POST /api/game/:id/tools/evaluate` → Check if tool should emerge

**Operations**:
```typescript
function evaluateToolEmergence(gameState) {
  // Calculate pressures
  const materialPressure = calculateMaterialPressure(gameState);
  const capability = getAverageCreatureCapability(gameState.creatures);
  
  // Fuzzy logic evaluation
  const fuzzy = new ToolEmergenceFuzzy();
  const desirability = fuzzy.evaluate(materialPressure, capability);
  
  if (desirability > THRESHOLD) {
    const tool = createTool(gameState);
    gameState.tools.push(tool);
    return { emerged: true, tool };
  }
  
  return { emerged: false };
}
```

#### 4. Pack System
**Endpoints**:
- `GET /api/game/:id/packs` → Query all packs
- `POST /api/game/:id/packs/form` → Form pack from creatures

**Operations**:
```typescript
function formPack(creatureIds, gameState) {
  const creatures = creatureIds.map(id => gameState.creatures.get(id));
  
  // Check social trait threshold
  const avgSocial = creatures.reduce((sum, c) => sum + c.traits.social, 0) / creatures.length;
  
  if (avgSocial > 0.6) {
    const pack = {
      id: `pack-${gameState.packs.size}`,
      leaderId: creatures[0].id,
      memberIds: creatureIds,
      territory: calculateTerritory(creatures),
      cohesion: avgSocial,
      founded: gameState.generation,
    };
    
    gameState.packs.set(pack.id, pack);
    return pack;
  }
  
  return null;
}
```

#### 5. Building System
**Endpoints**:
- `GET /api/game/:id/buildings` → Query all buildings
- `POST /api/game/:id/buildings/construct` → Construct building

**Operations**:
```typescript
function constructBuilding(tribeId, buildingType, gameState) {
  const tribe = gameState.tribes.get(tribeId);
  
  // Check if tribe has resources
  if (canAffordBuilding(tribe, buildingType, gameState)) {
    const building = {
      id: `${tribeId}-building-${tribe.buildingIds.length}`,
      buildingType,
      tribeId,
      transform: calculateBuildingPosition(tribe),
      health: 100,
      constructed: gameState.generation,
      materials: consumeMaterials(tribe, buildingType, gameState),
    };
    
    gameState.buildings.set(building.id, building);
    tribe.buildingIds.push(building.id);
    
    return building;
  }
  
  return null;
}
```

#### 6. Generation System
**Endpoints**:
- `POST /api/game/:id/generation` → Advance generation

**Operations**:
```typescript
function advanceGeneration(gameState) {
  gameState.generation++;
  
  // Evolve all creatures
  const creatureIds = Array.from(gameState.creatures.keys());
  creatureIds.forEach(id => evolveCreature(id, gameState));
  
  // Evaluate tool emergence
  evaluateToolEmergence(gameState);
  
  // Check pack formations
  checkPackFormations(gameState);
  
  // Check tribal developments
  checkTribalDevelopments(gameState);
  
  // Calculate world score
  updateWorldScore(gameState);
  
  // Check ending conditions
  const ending = detectEnding(gameState);
  if (ending) {
    gameState.ending = ending;
  }
  
  return {
    generation: gameState.generation,
    events: gameState.events.slice(-20),
  };
}
```

---

## FRONTEND Systems (Game Loop)

If/when we add 3D frontend, THESE would have continuous update loops:

#### Rendering System
```typescript
function RenderingSystem(deltaTime) {
  // Query backend state
  const creatures = await fetch(`/api/game/${id}/creatures`);
  
  // Update 3D meshes
  creatures.forEach(creature => {
    const mesh = scene.getObjectByName(creature.id);
    mesh.position.copy(creature.transform);
  });
}
```

#### Camera System
```typescript
function CameraSystem(deltaTime) {
  // Follow player/selected entity
  camera.position.lerp(target.position, 0.1);
}
```

#### Animation System
```typescript
function AnimationSystem(deltaTime) {
  // Update creature animations based on state
  creatures.forEach(creature => {
    const animation = getAnimationForState(creature.state);
    animation.update(deltaTime);
  });
}
```

---

## The Architecture Split

### Backend (REST Server)
```
ECS = Data Storage
- Entities: Stored in memory (Map<id, entity>)
- Components: Properties on entities
- Systems: REST endpoints that compute on demand

No Game Loop
State updates on API calls
```

### Frontend (React + Three.js)
```
ECS = Rendering Loop
- Entities: 3D meshes in scene
- Components: Position, animation, visibility
- Systems: Update loops (60 FPS)

Game Loop: requestAnimationFrame
Queries backend for state
Renders based on backend data
```

---

## Example: Complete Flow

### 1. Backend State (ECS Data)
```typescript
gameState = {
  creatures: Map({
    'creature-1': {
      id: 'creature-1',
      transform: { x: 10, y: 0, z: 5 },
      traits: { mobility: 0.7, ... },
      health: 100,
    }
  }),
  materials: [...],
  buildings: [...],
}
```

### 2. Client Requests State
```typescript
// CLI
const response = await fetch('/api/game/123/creatures');
console.log(response.creatures); // Display in terminal

// Frontend
const response = await fetch('/api/game/123/creatures');
response.creatures.forEach(creature => {
  renderCreature(creature); // Draw 3D mesh
});
```

### 3. Client Requests Action
```typescript
// Advance generation
await fetch('/api/game/123/generation', { method: 'POST' });
```

### 4. Backend Executes (Systems Run)
```typescript
// Generation system executes ONCE
advanceGeneration(gameState);

// Creature system evolves all creatures
gameState.creatures.forEach(evolveCreature);

// Tool system checks emergence
evaluateToolEmergence(gameState);

// Returns new state
```

### 5. Client Displays Updated State
```typescript
// CLI
const newState = await fetch('/api/game/123');
console.log(`Generation ${newState.generation}`);

// Frontend
const newCreatures = await fetch('/api/game/123/creatures');
updateSceneWithNewCreatures(newCreatures);
```

---

## Summary

**ENTITIES**: Creatures, Materials, Buildings, Tools, Packs, Tribes

**COMPONENTS**: Transform, Traits, Health, MaterialType, BuildingType, etc.

**BACKEND SYSTEMS**: REST endpoints that compute state on demand
- Material System = `/api/game/:id/materials/*`
- Creature System = `/api/game/:id/creatures/*`
- Tool System = `/api/game/:id/tools/*`
- etc.

**FRONTEND SYSTEMS**: Rendering loops that query backend
- Rendering System (60 FPS)
- Animation System (60 FPS)
- Camera System (60 FPS)

**Backend = Stateful REST API (no continuous loop)**

**Frontend = Game loop that queries backend**

This is the architecture.
