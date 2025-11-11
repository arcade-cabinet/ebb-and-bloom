# Architecture

## Root Level Packages

```
/
├── agents/          # ALL agentic logic (governors, agents)
├── engine/          # Game engine ONLY (terrain, rendering, physics)
├── game/            # Game UI/React (summons GenerationGovernor to control engine)
└── packages/        # Other packages
```

## Separation of Concerns

### `agents/` Package
- **Purpose:** ALL agentic logic
- **Contains:**
  - Governors (Yuka-native law implementations)
  - Agents (Yuka agent classes)
  - GenerationGovernor (controls what spawns)
- **Does NOT:** Render, manage terrain, handle input

### `engine/` Package
- **Purpose:** Game engine ONLY
- **Contains:**
  - WorldManager (coordinates systems)
  - TerrainSystem (terrain generation)
  - PlayerController (movement, collision)
  - Spawners (procedural generation)
  - Prefabs (Daggerfall Unity-style prefabs)
- **Does NOT:** Make decisions about what spawns (agents do that)

### `game/` Package
- **Purpose:** Game UI/React
- **Contains:**
  - React components
  - UI screens
  - HUD
- **Does:** Summons GenerationGovernor from `agents/` to CONTROL `engine/`

## Flow

```
game/Game.tsx
  ↓ imports GenerationGovernor from agents/
  ↓ imports WorldManager from engine/
  ↓
  const world = new WorldManager();        // Initialize ENGINE
  const governor = new GenerationGovernor(); // Summon AGENT to control engine
  ↓
  governor.loadChunk(...);  // AGENT controls what ENGINE spawns
```

## Benefits

1. **Engine works independently** - Can test engine without agents
2. **Agents work independently** - Can test agents without engine
3. **Game orchestrates** - Game package summons agents to control engine
4. **Clear separation** - No circular dependencies


