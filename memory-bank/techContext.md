# Tech Context

## Technology Stack

### Mobile Framework
- **Capacitor 6.1+**: Native mobile bridge
- **Ionic Vue 8.7+**: UI components and routing
- **Vue 3.5+**: Composition API, reactive state

### Game Engine & Systems
- **Phaser 3.87+**: 2D game engine, rendering, input
- **BitECS 0.3.40**: High-performance Entity-Component-System
- **Yuka 0.7.8**: AI steering behaviors, pathfinding (for critter packs)

### State & Data
- **Zustand 5.0+**: Lightweight state management
- **LocalStorage/IndexedDB**: World persistence

### Utilities
- **TypeScript 5.7+**: Type safety throughout

### Build & Dev Tools
- **pnpm 9.x**: Fast, efficient package manager (3x faster than npm)
- **Vite 6.0+**: Fast dev server, HMR
- **Vitest 2.1+**: Unit testing with happy-dom
- **Capacitor CLI**: Mobile builds
- **GitHub Actions**: CI/CD automation
- **Renovate Bot**: Automated dependency updates

## Development Setup

### Prerequisites
```bash
node >= 20.x
pnpm >= 9.x (installed via: corepack enable)
Android Studio (for APK builds)
Java 17 (Zulu distribution)
```

### Installation
```bash
# Enable corepack for pnpm
corepack enable

# Install dependencies
pnpm install

# Setup Capacitor Android (if not exists)
npx cap add android
```

### Development
```bash
pnpm dev             # Start Vite dev server
pnpm build           # Build for production
pnpm test            # Run unit tests
pnpm test:watch      # Run tests in watch mode
pnpm test:ui         # Open Vitest UI
pnpm test:coverage   # Generate coverage report
```

### Mobile Build
```bash
# Sync web assets to native platforms
npx cap sync android

# Open Android Studio for building/debugging
npx cap open android

# Or use automated script
./build-android.sh
```

## Technical Constraints

### Mobile Performance
- **60FPS Target**: Must maintain on mid-range Android devices (Snapdragon 700+)
- **Memory Limit**: ~512MB active game state
- **Battery**: Optimize to prevent excessive drain
- **Screen Sizes**: Support 5-7 inch displays
- **Bundle Size**: Target < 15MB APK

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

### Core Dependencies (package.json)
```json
{
  "@capacitor/android": "^6.1.2",
  "@capacitor/app": "^6.0.1",
  "@capacitor/core": "^6.1.2",
  "@capacitor/haptics": "^6.0.1",
  "@capacitor/ios": "^6.1.2",
  "@ionic/vue": "^8.7.9",
  "@ionic/vue-router": "^8.7.9",
  "bitecs": "^0.3.40",
  "phaser": "^3.87.0",
  "vue": "^3.5.13",
  "vue-router": "^4.4.5",
  "yuka": "^0.7.8",
  "zustand": "^5.0.2"
}
```

### Dev Dependencies
```json
{
  "@capacitor/cli": "^6.1.2",
  "@testing-library/vue": "^8.1.0",
  "@vitejs/plugin-vue": "^5.2.1",
  "@vitest/ui": "^2.1.9",
  "happy-dom": "^15.11.7",
  "jsdom": "^25.0.1",
  "typescript": "^5.7.2",
  "vite": "^6.0.3",
  "vitest": "^2.1.9"
}
```

**Note**: Renovate Bot automatically keeps these updated via nightly PRs.

## CI/CD Pipeline

### GitHub Actions Workflows

**1. Build Android APK** (`.github/workflows/build-android.yml`)
- Triggered on: push to main/branch, PRs, manual dispatch
- Steps:
  1. Run test suite (57 tests)
  2. Build web assets (`pnpm run build`)
  3. Initialize Capacitor Android if needed
  4. Sync assets (`npx cap sync android`)
  5. Build debug/release APKs
  6. Upload artifacts (30-90 day retention)
  7. Comment on PR with status
- Build time: ~8-12 minutes
- Free tier usage: ~100-120 min/day (within 2,000 min/month limit)

**2. Code Quality** (`.github/workflows/quality.yml`)
- TypeScript validation (`pnpm exec tsc --noEmit`)
- Test coverage (`pnpm run test:coverage`)
- Documentation checks
- ECS architecture validation
- Large file detection

**3. Release APK** (`.github/workflows/release.yml`)
- Triggered by: version tags (v*) or manual dispatch
- Builds both debug and release APKs
- Creates GitHub Release automatically
- Professional naming: `ebb-and-bloom-v0.1.0.apk`
- Auto-generated release notes
- Installation instructions included

### Automated Dependency Management

**Renovate Bot** (`renovate.json`)
- Schedule: Nightly (10pm-5am weekdays + weekends)
- Non-major updates: Bundled into single auto-merge PR
- Major updates: Separate PRs with manual review
- Game engine packages (Phaser, BitECS, Yuka): Always manual review
- Capacitor ecosystem: Bundled together
- Security vulnerabilities: Immediate auto-merge
- Lockfile maintenance: Weekly (Mondays)
- Dependency dashboard: Disabled (automation-first)

## Tool Usage Patterns

### Phaser Scene Lifecycle
```typescript
class MainScene extends Phaser.Scene {
  preload() {
    // Load assets (textures, audio)
  }
  
  create() {
    // Initialize ECS world
    this.world = createWorld();
    // Setup gesture handlers
    this.setupGestures();
    // Create player entity
    this.player = createPlayer(this.world, 0, 0);
  }
  
  update(time, delta) {
    // Run ECS systems (order matters!)
    movementSystem(this.world);
    craftingSystem(this.world);
    pollutionSystem(this.world);
    // Render from ECS state (read-only)
    renderSystem(this.world, this);
  }
}
```

### BitECS Integration
```typescript
import { createWorld, addEntity, addComponent } from 'bitecs';
import { Position, Velocity } from './components';

// Create ECS world (singleton)
const world = createWorld();

// Add entity with components
const player = addEntity(world);
addComponent(world, Position, player);
addComponent(world, Velocity, player);
Position.x[player] = 100;
Position.y[player] = 100;

// Systems operate on queries
const movementSystem = (world: IWorld) => {
  const ents = movementQuery(world);
  for (let i = 0; i < ents.length; i++) {
    const eid = ents[i];
    Position.x[eid] += Velocity.x[eid];
    Position.y[eid] += Velocity.y[eid];
  }
};
```

### Zustand Store Pattern
```typescript
import { create } from 'zustand';

export const useGameStore = create<GameState>((set, get) => ({
  // State (synced FROM ECS, never writes to ECS)
  pollution: 0,
  playerInventory: { ore: 0, water: 0, alloy: 0 },
  
  // Actions (update store, game logic stays in ECS)
  updatePollution: (value: number) => set({ pollution: value }),
  
  updateInventory: (inventory: Record<string, number>) => 
    set({ playerInventory: inventory })
}));
```

### Gesture Handling (Enhanced Mobile)
```typescript
import { EnhancedGestureController } from './systems/GestureSystem';

// In Phaser scene
this.gestureController = new EnhancedGestureController(this, {
  swipeThreshold: 50,
  holdDuration: 500,
  pinchThreshold: 0.1
});

this.gestureController.on('swipe', (gesture) => {
  // Handle swipe for movement or terraforming
  console.log(`Swiped ${gesture.direction}`);
});

this.gestureController.on('pinch', (gesture) => {
  // Handle pinch for zooming
  this.cameras.main.zoom *= gesture.scale;
});
```

### Haptic Feedback
```typescript
import { playHaptic, HAPTIC_PATTERNS } from './systems/HapticSystem';
import { getDominantPlaystyle } from './ecs/systems/BehaviorSystem';

// Play haptic with playstyle awareness
const playstyle = getDominantPlaystyle(playerEid);
await playHaptic('SNAP_HARMONY', playstyle);

// Complex sequences
await playTensionRumble(duration, playstyle);
await playShockRumble('tempest', playstyle);
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
- **Problem**: BitECS component types can be verbose
- **Solution**: Create type aliases and helper functions
- **Pattern**: `type Entity = number; const createPlayer = (world, x, y) => { /* ... */ }`

### Issue: pnpm + packageManager Field
- **Problem**: pnpm/action-setup@v4 treats ANY `packageManager` field as conflict
- **Solution**: Remove `packageManager` field from package.json entirely
- **Pattern**: Let workflows manage pnpm version explicitly with `version: 9`

### Issue: GitHub Actions Gradle Cache
- **Problem**: setup-java@v5 gradle cache fails if android/ doesn't exist
- **Solution**: Don't use gradle cache before `npx cap add android` step
- **Pattern**: Remove `cache: 'gradle'` from setup-java step

## Developer Experience

### AI-Powered Development

**GitHub Copilot Workspace** (`.github/.copilot-instructions.md`)
- Comprehensive project context for AI pair programming
- Architecture principles and constraints
- Code standards and naming conventions
- Testing requirements
- Common pitfalls to avoid

**Cursor AI** (`.cursor/rules/default.md`)
- Quick reference rules for Cursor editor
- Memory Bank first (always read before coding)
- ECS architecture constraints
- Testing and performance requirements

**Memory Bank** (`memory-bank/`)
- Source of truth for project state
- Required reading for ALL AI agents
- Updated after significant changes
- Aligned with .copilot-instructions and .cursor/rules

### Testing Infrastructure

**Vitest Configuration** (`vite.config.js`)
- Environment: happy-dom (faster than jsdom)
- Globals enabled (no import needed)
- Coverage: c8 reporter
- Setup file: `src/test/setup.ts` (mocks Phaser, Capacitor)

**Test Organization**
```
src/test/
├── setup.ts              # Global mocks
├── components.test.ts    # ECS component tests
├── movement.test.ts      # Movement system tests
├── crafting.test.ts      # Crafting system tests
├── haiku.test.ts         # Haiku scorer tests
├── snapping.test.ts      # Snapping system tests
├── pollution-behavior.test.ts  # Pollution + Behavior tests
└── pack.test.ts          # Pack system tests
```

**Test Coverage**: 57/57 tests passing, aim for 80%+ coverage

## Future Tech Considerations

### Stage 2+
- **Shaders**: GLSL for visual effects (pollution haze, water flow)
- **Web Audio**: Procedural audio synthesis (ambient soundscapes)
- **Service Workers**: Offline persistence, background processing

### Stage 3+
- **WebGL2**: Advanced rendering (particle systems, lighting)
- **WebAssembly**: Performance-critical world gen (if needed)
- **Cloud Sync**: Optional cross-device saves

### Stage 4+
- **Real-time Multiplayer**: WebRTC for co-op (exploration mode)
- **Shader Graphs**: Visual effects system
- **VR Support**: Oculus Quest port (stretch goal)

---

**Last Updated**: 2025-11-06 (pnpm migration, CI/CD complete, Renovate added)
