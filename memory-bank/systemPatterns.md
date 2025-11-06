# System Patterns

## Architecture Overview

### Modular Core Design
```
/src
├── core/           # World generation, raycast system
│   ├── world.ts    # Perlin chunk generation
│   └── raycast.ts  # Stride view rendering
├── player/         # Player controls and state
│   ├── gestures.ts # Touch/swipe handlers
│   └── catalyst.ts # Player entity
├── crafting/       # Resource and crafting systems
│   └── recipes.ts  # Crafting logic
├── stores/         # Zustand state management
│   └── game.ts     # Global game state
└── scenes/         # Phaser scenes
    └── main.ts     # Main gameplay scene
```

## Key Technical Decisions

### 1. Phaser + BitECS Hybrid
- **Phaser**: Handles rendering, input, scene management
- **BitECS**: Manages entity-component-system for game logic
- **Rationale**: Phaser's mobile performance + ECS scalability for evolution systems

### 2. Chunk-Based World Generation
- **5x5 Chunk Grid**: Manageable memory footprint for mobile
- **Perlin Noise**: Deterministic, seed-based generation
- **Lazy Loading**: Generate chunks as player approaches edges
- **Persistence**: Track pollution/changes per chunk

### 3. Raycast Stride View
- **POV Style**: First-person-ish view from behind catalyst
- **Performance**: 100 rays for FOV @ 60FPS target
- **Mobile Optimization**: Lower resolution, distance culling
- **Future**: Can expand to full 3D or maintain pixel aesthetic

### 4. Gesture-First Input
- **Swipe**: Movement direction and turning
- **Tap**: Interact/collect
- **Long Press**: Context actions (future: dispatch creatures)
- **Pinch**: Zoom/FOV adjustment (future)
- **Drag & Drop**: Crafting combinations

### 5. State Management Strategy
- **Zustand**: Global game state (resources, pollution, journal)
- **BitECS Components**: Entity-specific state
- **Local Storage**: Persistence for world state
- **Rationale**: Simple, performant, no prop-drilling hell

## Component Relationships

### World Generation Flow
```
Seed → Perlin Noise → Chunk Grid → Raycast View → Render
                                    ↓
                              Player Position
```

### Crafting Flow
```
Gesture Input → Recipe Match → Resource Check → Craft Item → Haptic Feedback
                                                    ↓
                                              Update Pollution
```

### Evolution Flow (Future)
```
Proximity Event → Trait Roll → Inheritance Calc → Visual Morph → Audio/Haptic
```

## Critical Implementation Paths

### Stage 1 POC Path
1. Initialize Ionic Vue + Capacitor project
2. Install Phaser, BitECS, dependencies
3. Create basic Phaser scene with placeholder graphics
4. Implement Perlin chunk generation (5x5 grid)
5. Build raycast system for stride view
6. Add touch gesture handlers
7. Create catalyst entity with movement
8. Implement one crafting recipe (ore+water=alloy)
9. Add haptic feedback hooks
10. Build Android APK and test on device

### Performance Guardrails
- Target 60FPS minimum
- Max 1000 entities on screen
- Chunk culling beyond 2 chunk radius
- Texture atlases for sprite batching
- Minimize garbage collection (object pooling)

## Design Patterns in Use

### 1. Entity Component System (BitECS)
```typescript
// Components are simple data containers
const Position = defineComponent({ x: f32, y: f32 });
const Velocity = defineComponent({ x: f32, y: f32 });

// Systems operate on entities with specific components
const movementSystem = (world) => {
  const entities = query([Position, Velocity]);
  // Update positions based on velocity
};
```

### 2. Command Pattern (Crafting)
```typescript
interface CraftCommand {
  inputs: ResourceType[];
  output: ResourceType;
  execute: () => void;
}
```

### 3. Observer Pattern (State Updates)
```typescript
// Zustand automatically notifies subscribers
const useGameStore = create((set) => ({
  resources: { ore: 0, water: 0 },
  addResource: (type, amount) => 
    set((state) => ({ resources: { ...state.resources, [type]: state.resources[type] + amount }}))
}));
```

### 4. Object Pool Pattern (Performance)
```typescript
class EntityPool {
  private pool: Entity[] = [];
  acquire(): Entity { /* reuse or create */ }
  release(entity: Entity) { /* return to pool */ }
}
```

## Testing Strategy
- **Unit Tests**: Core logic (world gen, crafting recipes)
- **Integration Tests**: System interactions (gesture → movement)
- **Device Testing**: Real Android devices for performance
- **10-Minute Frolic Test**: Playability validation
