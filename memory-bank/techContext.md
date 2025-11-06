# Tech Context

## Technology Stack

### Mobile Framework
- **Capacitor 5.x**: Native mobile bridge
- **Ionic Vue 7.x**: UI components and routing
- **Vue 3**: Composition API, reactive state

### Game Engine & Systems
- **Phaser 3.60+**: 2D game engine, rendering, input
- **BitECS 0.3+**: High-performance Entity-Component-System
- **Yuka 0.7+**: AI steering behaviors, pathfinding (future stages)

### State & Data
- **Zustand 4.x**: Lightweight state management
- **Pinia**: Vue-specific state (if needed for UI)
- **LocalStorage/IndexedDB**: World persistence

### Utilities
- **simplex-noise**: Perlin noise generation
- **TypeScript 5.x**: Type safety throughout

### Build & Dev Tools
- **Vite 4.x**: Fast dev server, HMR
- **Vitest**: Unit testing
- **ESLint + Prettier**: Code quality
- **Capacitor CLI**: Mobile builds

## Development Setup

### Prerequisites
```bash
node >= 18.x
npm >= 9.x
Android Studio (for APK builds)
```

### Installation
```bash
npm install -g @ionic/cli @capacitor/cli
npm install
```

### Development
```bash
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run test         # Run unit tests
npm run lint         # Check code quality
```

### Mobile Build
```bash
npx cap add android
npx cap sync
npx cap open android  # Opens Android Studio
```

## Technical Constraints

### Mobile Performance
- **60FPS Target**: Must maintain on mid-range Android devices
- **Memory Limit**: ~512MB active game state
- **Battery**: Optimize to prevent excessive drain
- **Screen Sizes**: Support 5-7 inch displays

### Platform-Specific
- **Android**: Minimum API 24 (Android 7.0)
- **Gestures**: Must work with various touch screen qualities
- **Haptics**: Use Capacitor Haptics API
- **Orientation**: Portrait primary, landscape optional

### Network
- **Offline-First**: Core gameplay works without internet
- **Cloud Save**: Optional backup (future)
- **No Real-Time MP**: Fully single-player

## Dependencies

### Core Dependencies
```json
{
  "@capacitor/android": "^5.5.0",
  "@capacitor/core": "^5.5.0",
  "@capacitor/haptics": "^5.0.0",
  "@ionic/vue": "^7.5.0",
  "phaser": "^3.60.0",
  "bitecs": "^0.3.40",
  "yuka": "^0.7.8",
  "zustand": "^4.4.0",
  "simplex-noise": "^4.0.1",
  "vue": "^3.3.0"
}
```

### Dev Dependencies
```json
{
  "@vitejs/plugin-vue": "^4.4.0",
  "typescript": "^5.2.0",
  "vite": "^4.5.0",
  "vitest": "^0.34.0",
  "eslint": "^8.50.0",
  "prettier": "^3.0.0"
}
```

## Tool Usage Patterns

### Phaser Scene Lifecycle
```typescript
class MainScene extends Phaser.Scene {
  preload() {
    // Load assets
  }
  
  create() {
    // Initialize world, entities
    this.setupWorld();
    this.setupGestures();
  }
  
  update(time, delta) {
    // Run ECS systems
    // Update Phaser objects
  }
}
```

### BitECS Integration
```typescript
// Define ECS world
const world = createWorld();

// Add entities
const catalyst = addEntity(world);
addComponent(world, Position, catalyst);
addComponent(world, Velocity, catalyst);

// Run systems in Phaser update loop
update() {
  movementSystem(world);
  renderSystem(world, this); // Pass Phaser scene
}
```

### Zustand Store Pattern
```typescript
import create from 'zustand';

export const useGameStore = create((set, get) => ({
  // State
  resources: { ore: 0, water: 0, alloy: 0 },
  pollution: 0,
  
  // Actions
  addResource: (type, amount) => set((state) => ({
    resources: { ...state.resources, [type]: state.resources[type] + amount }
  })),
  
  craft: (recipe) => {
    const state = get();
    if (canCraft(state.resources, recipe)) {
      set({ resources: applyRecipe(state.resources, recipe) });
      return true;
    }
    return false;
  }
}));
```

### Gesture Handling
```typescript
// In Phaser scene
this.input.on('pointerdown', (pointer) => {
  this.gestureStart = { x: pointer.x, y: pointer.y, time: Date.now() };
});

this.input.on('pointerup', (pointer) => {
  const gesture = this.detectGesture(this.gestureStart, pointer);
  this.handleGesture(gesture);
});
```

## Known Issues & Workarounds

### Issue: Phaser + Vue Reactivity Conflicts
- **Problem**: Vue reactivity can cause Phaser render loops to stutter
- **Solution**: Keep Phaser game state separate from Vue reactive state
- **Pattern**: Use Zustand for game logic, Vue only for UI overlays

### Issue: Mobile Touch Delay
- **Problem**: 300ms click delay on some mobile browsers
- **Solution**: Use Phaser's pointer events, not DOM events
- **Pattern**: `scene.input.on('pointerdown')` instead of `@click`

### Issue: BitECS + TypeScript Types
- **Problem**: BitECS types can be verbose
- **Solution**: Create type aliases and helper functions
- **Pattern**: `type Entity = number; const createCatalyst = () => { /* ... */ }`

## Future Tech Considerations
- **Shaders**: GLSL for visual effects (Stage 4+)
- **Web Audio**: Procedural audio synthesis (Stage 3+)
- **WebGL2**: Advanced rendering techniques (if needed)
- **Wasm**: Performance-critical world gen (if needed)
