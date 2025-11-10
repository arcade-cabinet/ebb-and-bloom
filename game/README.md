# Ebb & Bloom - Game

World exploration game built using the Ebb & Bloom engine.

---

## Architecture

This is a **clean game package** that uses ONLY the engine's public API.

**Main principle:** Game does NOT touch engine internals.

```typescript
import { WorldManager } from 'ebb-and-bloom-engine';

// ALLOWED
const world = new WorldManager();
world.initialize({ seed, scene, camera });
world.update(delta);

// NOT ALLOWED
// import { ChunkManager } from 'ebb-and-bloom-engine/spawners';
// Don't bypass WorldManager!
```

---

## File Structure

```
game/
├── main.tsx          # Entry point
├── Game.tsx          # Main game component
├── index.html        # HTML shell
├── package.json      # Dependencies
├── vite.config.ts    # Build config
├── tsconfig.json     # TypeScript config
└── README.md         # This file
```

**Total:** ~100 lines. Clean and simple.

---

## How It Works

### 1. Initialize World
```typescript
const world = new WorldManager();
world.initialize({
    seed: 'v1-green-valley-breeze',
    scene,      // THREE.Scene
    camera,     // THREE.Camera
    chunkDistance: 3  // 7x7 chunk grid
});
```

**What happens:**
- TerrainSystem loads chunks
- PlayerController spawns on terrain
- CreatureManager ready to spawn
- All governors active

### 2. Game Loop
```typescript
function update(delta) {
    world.update(delta);
    // That's it!
}
```

**What world.update() does:**
- Updates player (movement, collision, camera)
- Updates terrain (chunk streaming)
- Updates creatures (governors decide behavior)
- Updates all Yuka entities

### 3. Rendering
```typescript
<Canvas>
    <World />
    <PointerLockControls />
</Canvas>
```

React Three Fiber renders the scene.  
WorldManager populates it.  
Clean separation.

---

## Development

```bash
# Install
npm install

# Dev server
npm run dev

# Build
npm run build

# Preview build
npm run preview
```

---

## What the Engine Provides

From `ebb-and-bloom-engine`:

- ✅ WorldManager (main API)
- ✅ Terrain streaming
- ✅ Player controller
- ✅ Creature spawning
- ✅ Governor behaviors
- ✅ Synthesis systems
- ✅ All game logic

**Game just:**
- Creates React components
- Calls world.update()
- Renders with R3F
- Handles UI/HUD

---

## Adding Features

Want creatures?
```typescript
const biome = {
    vegetation: 0.7,
    rockColor: 0.3,
    uvIntensity: 0.5,
    temperature: 290
};

world.creatures.spawn(position, biome);
// Governor-driven behavior automatic
// Synthesis creates unique visuals
```

Want buildings?
```typescript
// Use engine's CityPlanner + BuildingArchitect
// (Integration pending)
```

---

## Next Steps

1. **Input handling** - WASD movement
2. **Camera controls** - Mouse look
3. **HUD** - Health, stamina, location
4. **Interaction** - Talk to NPCs, use tools
5. **Inventory** - Pick up items

All using engine API only.

---

**Clean game. Clean API. Clean separation.**

