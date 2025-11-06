# Game Package - Phaser Rendering Layer

**Purpose**: Phaser integration layer. **READ-ONLY from ECS**. Responsible for rendering, camera, sprites, but NOT game logic.

## Package Contents

### GameScene.ts ✅
**Purpose**: Main Phaser scene, game loop orchestration

**Responsibilities**:
- Initialize ECS world
- Create and run ECS systems
- Render sprites from ECS Position/Sprite components
- Handle camera following
- Draw trail effects
- UI rendering

**Critical Rule**: GameScene reads from ECS, never writes to it.

### core/perlin.ts ✅
**Purpose**: Perlin noise generator for terrain

**Features**:
- Seeded pseudo-random generation
- Octave layering for natural variation
- Deterministic (same seed = same world)

### core/core.ts ✅
**Purpose**: World generation and chunk management

**Features**:
- 5x5 chunk grid (100x100 tiles each)
- 4 biome types (water, grass, flowers, ore)
- Raycast system for line-of-sight
- Viewport culling for performance

### player/ (DEPRECATED)
**Status**: Being migrated to ECS. Do not use.

## Architecture

```
GameScene (Phaser)
  ├── Initializes ECS World
  ├── Creates Systems
  ├── update() Loop:
  │     ├── Systems modify ECS
  │     ├── Read Position from ECS
  │     └── Update sprite.setPosition()
  └── Rendering ONLY
```

## How to Use

### Initialize
```typescript
// In GameScene.create()
this.world = resetWorld();
this.playerEid = createPlayer(this.world, x, y);
this.movementSystem = createMovementSystem();
```

### Update Loop
```typescript
// In GameScene.update()
update(time: number, delta: number) {
  // 1. Run systems (modify ECS)
  this.movementSystem(this.world, delta);
  
  // 2. Read from ECS (render)
  this.playerSprite.setPosition(
    Position.x[this.playerEid],
    Position.y[this.playerEid]
  );
}
```

## Tests

- WorldCore: 1 test ✅
- Phaser integration: Manual (visual testing)

## Links

- [ARCHITECTURE.md](../docs/ARCHITECTURE.md) - Data flow diagram
- [techContext.md](../memory-bank/techContext.md) - Phaser integration details

---

*Status: Stage 1 Complete ✅*  
*Last Updated: 2025-11-06*
