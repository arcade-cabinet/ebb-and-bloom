# Daggerfall Unity Architecture Study

**Purpose:** Understand DFU's complete architecture to build Ebb & Bloom engine equivalent

---

## Core Architecture

### GameManager.cs (Singleton)
**What it does:**
- Central coordinator for ALL game systems
- Manages PlayerObject, MainCamera, StreamingWorld
- Provides access to all managers (Weather, Quest, Transport, etc.)
- Handles game state (paused, ready, etc.)

**Components it manages:**
- PlayerMotor
- CharacterController  
- StreamingWorld
- WeaponManager
- QuestMachine
- SaveLoadManager
- WeatherManager
- Many more...

**For Ebb & Bloom:**
Need equivalent `WorldManager` or `GameManager` singleton that:
- Coordinates all engine systems
- Manages player controller
- Manages world streaming
- Provides unified API

---

### StreamingWorld.cs (World Management)
**What it does:**
- Streams terrain tiles around player
- TerrainDistance = 3 → (2×3+1)² = 49 tiles (7x7 grid)
- Recycles terrains beyond distance
- Spawns/destroys locations and objects

**Key pattern:**
```csharp
// Each terrain tile = 8x8 RMB blocks
// Player at center
// Load tiles in grid around player
// Recycle tiles when player moves
```

**For Ebb & Bloom:**
We have ChunkManager doing this already! But need to integrate properly into engine.

---

### DaggerfallTerrain.cs (Individual Terrain)
**What it does:**
- Partners with Unity Terrain component
- TerrainCollider automatically provides collision
- Self-assembling from map pixel coordinates
- Heightmap + texture generation

**Unity Terrain provides:**
- Automatic collision via TerrainCollider
- Heightmap storage
- Texture splatting
- Tree/detail placement

**For Ebb & Bloom:**
Need THREE.js equivalent:
- Mesh with collision
- Heightmap query function
- Material/texture system
- But simpler than Unity Terrain

---

### PlayerMotor.cs (Player Movement)
**What it does:**
- Uses Unity CharacterController (built-in physics)
- FixStanding() positions player on ground
- Handles gravity, jumping, climbing, swimming
- Collision automatic via CharacterController

**Key insight:**
```csharp
// Position player at hit.point + half controller height
transform.position = hit.point + Vector3.up * (controller.height * 0.65f);
```

Controller.height is ~1.8-2.0m, so player feet are ~1.2m above hit point, eyes at ~1.8m

**For Ebb & Bloom:**
Need PlayerController that:
- Raycasts to find ground
- Positions player at ground + controller height  
- Handles movement input
- Manages camera
- Does collision

---

## What Ebb & Bloom ENGINE Needs:

### 1. WorldManager (equivalent to GameManager + StreamingWorld)
```typescript
class WorldManager {
    // Core systems
    terrain: TerrainSystem;
    player: PlayerController;
    creatures: CreatureManager;
    weather: WeatherSystem;
    
    // State
    isReady: boolean;
    isPaused: boolean;
    
    // Methods
    initialize(seed: string, scene: THREE.Scene): void;
    update(delta: number): void;
    getPlayerPosition(): Vector3;
}
```

### 2. TerrainSystem (equivalent to StreamingWorld + DaggerfallTerrain)
```typescript
class TerrainSystem {
    // Chunk streaming
    loadedChunks: Map<string, TerrainChunk>;
    chunkDistance: number; // 3 = 7x7 grid
    
    // Methods
    update(playerX: number, playerZ: number): void;
    getTerrainHeight(x: number, z: number): number;
    raycastTerrain(origin: Vector3, direction: Vector3): RaycastHit;
}
```

### 3. PlayerController (equivalent to PlayerMotor)
```typescript
class PlayerController {
    // Character
    height: number; // Controller height
    eyeHeight: number; // Camera height
    position: Vector3;
    velocity: Vector3;
    
    // State
    isGrounded: boolean;
    isJumping: boolean;
    
    // Methods
    fixStanding(): void; // Position on ground
    handleInput(delta: number): void;
    applyGravity(delta: number): void;
    updateCamera(): void;
}
```

### 4. CreatureManager (equivalent to EnemyMotor + spawning)
```typescript
class CreatureManager {
    // Uses governors for behavior
    creatures: Map<string, CreatureController>;
    
    spawn(traits: CreatureTraits, position: Vector3): void;
    update(delta: number): void; // Governors decide behavior
}
```

---

## Implementation Plan:

1. Build WorldManager (coordinates everything)
2. Build TerrainSystem (integrates ChunkManager properly)
3. Build PlayerController (movement + collision)
4. Build CreatureManager (governors + synthesis)
5. Export clean ENGINE API
6. Game uses engine API only

---

**Status:** Starting proper engine build now

