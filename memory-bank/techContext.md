# Technical Context - Ebb & Bloom

## Technology Stack

### Core Framework
- **pnpm 9.x**: Package manager (3x faster than npm)
- **TypeScript 5.7.2**: Type safety throughout
- **Node >= 20.x**: Runtime requirement

### Mobile Framework  
- **Capacitor 6.1.2**: Native mobile bridge
- **Ionic Vue 8.7.9**: Mobile UI components and routing
- **Vue 3.5.13**: Composition API, reactive state

### Game Engine & Architecture
- **Phaser 3.87.0**: 2D rendering engine (WebGL)
- **BitECS 0.3.40**: High-performance Entity-Component-System
- **Yuka 0.7.8**: AI steering behaviors (prepared for Stage 2)
- **Zustand 5.0.2**: Lightweight state management

### Build & Dev Tools
- **Vite 6.0.3**: Fast dev server with HMR
- **Vitest 2.1.9**: Unit testing with happy-dom 15.11.7
- **Capacitor CLI**: Mobile builds
- **GitHub Actions**: CI/CD automation
- **Renovate Bot**: Automated dependency updates

## Architecture Pattern

### Clean Separation of Concerns

```
┌─────────────────────────────────────────┐
│          Capacitor Native               │
│  ┌───────────────────────────────────┐  │
│  │       Ionic Vue (UI Layer)        │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │   Phaser (Rendering Only)   │  │  │
│  │  │                             │  │  │
│  │  │  Reads from ECS ──┐         │  │  │
│  │  └────────────────────┼─────────┘  │  │
│  │                       │            │  │
│  │  ┌────────────────────▼─────────┐  │  │
│  │  │   BitECS (Game Logic)       │  │  │
│  │  │                             │  │  │
│  │  │  Components:                │  │  │
│  │  │  - Position, Velocity       │  │  │
│  │  │  - Inventory, Traits        │  │  │
│  │  │  - Pack, Critter            │  │  │
│  │  │                             │  │  │
│  │  │  Systems:                   │  │  │
│  │  │  - MovementSystem           │  │  │
│  │  │  - CraftingSystem           │  │  │
│  │  │  - PackSystem               │  │  │
│  │  │  - PollutionSystem          │  │  │
│  │  │  - BehaviorSystem           │  │  │
│  │  │  - SnappingSystem           │  │  │
│  │  └─────────────────────────────┘  │  │
│  │          ▲                         │  │
│  │  ┌───────┴──────────────────────┐  │  │
│  │  │  Zustand (UI State Sync)    │  │  │
│  │  │  - Reads from ECS           │  │  │
│  │  │  - Never writes to ECS      │  │  │
│  │  └─────────────────────────────┘  │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
         │                    │
         ▼                    ▼
    Android APIs         WebGL Renderer
```

### Data Flow Principles

1. **ECS as Source of Truth**: All game state lives in BitECS
2. **Phaser Reads Only**: Rendering layer never modifies game state
3. **Zustand for UI**: Syncs ECS state to Vue components (one-way)
4. **Systems Modify State**: Only ECS systems can change components

## Current Implementation

### ECS Components (`src/ecs/components/`)

#### Core Components
```typescript
Position: { x: f32, y: f32 }
Velocity: { x: f32, y: f32 }
Inventory: { ore: ui16, water: ui16, alloy: ui16, ... }
Sprite: { textureKey: ui32 }
```

#### Trait Components (10 total)
```typescript
FlipperFeet: { level: ui8 }        // Water speed, flow affinity
ChainsawHands: { level: ui8 }     // Wood harvest, scares critters
DrillArms: { level: ui8 }          // Ore mining, reveals veins
WingGliders: { level: ui8 }        // Glide distance, aerial view
EchoSonar: { level: ui8 }          // Resource ping radius
BioLumGlow: { level: ui8 }         // Night vision, attracts critters
StorageSacs: { level: ui8 }        // Inventory capacity
FiltrationGills: { level: ui8 }    // Pollution resistance
ShieldCarapace: { level: ui8 }     // Damage reduction
ToxinSpines: { level: ui8 }        // Counter-attack
```

#### Social Components
```typescript
Pack: {
  leaderId: ui32,      // Entity ID of leader
  loyalty: f32,        // 0-1 loyalty to player
  size: ui8,           // Number of members
  affMask: ui32,       // Inherited affinity traits
  packType: ui8        // neutral/ally/rival
}

Critter: {
  species: ui8,        // fish/squirrel/bird/beaver
  packId: ui32,        // Pack entity ID (0 if solo)
  role: ui8,           // leader/specialist/follower
  inheritedTrait: ui8, // Diluted trait from player
  needState: ui8       // idle/foraging/fleeing
}
```

### ECS Systems (`src/ecs/systems/`)

#### MovementSystem
- Applies velocity to position
- Handles friction and deceleration
- Delta-time based updates
- Query: `[Position, Velocity]`

#### CraftingSystem
- Recipe matching engine
- Resource validation
- Inventory updates
- Pollution tracking
- Query: `[Inventory]`

#### SnappingSystem
- Affinity-based resource combinatorics
- 8-bit flag matching (HEAT, FLOW, BIND, POWER, LIFE, METAL, VOID, WILD)
- Procedural haiku generation for snaps
- Query: `[Position, Inventory]`

#### PackSystem
- Formation logic (3-15 critters)
- Loyalty calculation (0-1 scale)
- Role assignment (leader/specialist/follower)
- Pack schism mechanics (split at <0.3 loyalty)
- Query: `[Pack, Position]` and `[Critter, Position]`

#### PollutionSystem
- Tracks global pollution (0-100%)
- Calculates shock thresholds (Whisper 40%, Tempest 70%, Collapse 90%)
- Playstyle-specific mutations
- Purity Grove mitigation
- Query: `[all entities]` (global state)

#### BehaviorSystem
- Profiles Harmony/Conquest/Frolick playstyle
- Rolling 100-action window
- World reaction modifiers
- No punishment - just consequences
- Query: `[player entity]` (behavior tracking)

### Cross-Cutting Systems (`src/systems/`)

#### HaikuScorer
- Jaro-Winkler similarity algorithm
- Prevents narrative repetition (<20% overlap)
- Procedural metaphor bank
- Diversity guard for journal entries

#### HapticSystem
- Playstyle-aware haptic patterns
- Complex sequences (tension, heartbeat, crescendo)
- Capacitor Haptics integration
- 20+ distinct patterns

#### GestureSystem
- 7 gesture types: swipe, pinch, hold, tap, double-tap, drag, rotate
- Touch-first mobile controls
- Configurable thresholds
- Maps to game actions (terraform, combat, camera)

### World Generation (`src/game/core/`)

#### Perlin Noise Generator
```typescript
// Seeded pseudo-random terrain generation
class PerlinNoise {
  constructor(seed: number)
  noise(x: number, y: number): number
  octaveNoise(x: number, y: number, octaves: number, persistence: number): number
}
```

#### WorldCore
```typescript
class WorldCore {
  // 5x5 chunks, 100x100 tiles each = 250,000 total tiles
  chunks: Map<string, Chunk>
  
  generateChunk(cx: number, cy: number): Chunk
  getTile(x: number, y: number): TileType
  raycast(x1, y1, x2, y2): boolean // Line-of-sight
}
```

**Biome Generation:**
```typescript
noise_value = perlin.octaveNoise(x, y, 4, 0.5)
if (noise < -0.3) -> water
else if (noise < 0.2) -> grass
else if (noise < 0.5) -> flower
else if (noise > 0.7) -> ore
```

### State Management (`src/stores/gameStore.ts`)

```typescript
interface GameState {
  // ECS World reference
  world: IWorld | null
  
  // Synced FROM ECS (read-only)
  pollution: number
  playerInventory: Record<string, number>
  
  // UI-only state
  playTime: number
  intimacyLevel: number
  evolutionStage: number
  
  // Actions (update store, never write to ECS directly)
  updatePollution(value: number): void
  updateInventory(inventory: Record<string, number>): void
}
```

**Critical Rule**: Zustand NEVER writes to ECS. ECS systems write to components, then sync to Zustand for UI display.

### Phaser Integration (`src/game/GameScene.ts`)

```typescript
class GameScene extends Phaser.Scene {
  world: IWorld
  movementSystem: System
  craftingSystem: System
  
  create() {
    // Initialize ECS
    this.world = resetWorld()
    this.playerEid = createPlayer(this.world, x, y)
    
    // Initialize systems
    this.movementSystem = createMovementSystem()
    this.craftingSystem = createCraftingSystem()
    
    // Create Phaser sprites (rendering only)
    this.playerSprite = this.add.sprite(x, y, 'player')
  }
  
  update(time, delta) {
    // Run ECS systems (modify components)
    this.movementSystem(this.world, delta)
    this.craftingSystem(this.world)
    
    // Read from ECS to update Phaser sprites
    this.playerSprite.setPosition(
      Position.x[this.playerEid],
      Position.y[this.playerEid]
    )
  }
}
```

## Performance Optimizations

### Implemented
1. **Viewport Culling**: Only render visible tiles (~3600 vs 250,000)
2. **Sprite Pooling**: Reuse sprites instead of creating new
3. **Distance-Based Updates**: Re-render chunks only when player moves far
4. **Pixel Art Mode**: Disable anti-aliasing for faster rendering
5. **WebGL Acceleration**: Hardware-accelerated rendering
6. **Minimal GC**: Fixed-size arrays, object reuse
7. **ECS Architecture**: Cache-friendly data layout

### Targets
- **60 FPS**: Steady frame rate on mid-range Android
- **< 16.67ms**: Frame time budget
- **< 150MB RAM**: Active game state
- **< 3s Load**: Initial world generation

### Performance Monitoring
- FPS counter (in-game)
- Frame time tracking
- Memory usage (DevTools)
- Bundle size tracking (CI/CD)

## Testing Infrastructure

### Test Environment
- **Vitest 2.1.9**: Test runner
- **happy-dom 15.11.7**: DOM simulation (faster than jsdom)
- **Globals enabled**: No import needed in tests

### Test Structure
```
src/test/
├── setup.ts                    # Mocks for Phaser, Capacitor
├── components.test.ts          # ECS component tests (4 tests)
├── movement.test.ts            # Movement system (3 tests)
├── crafting.test.ts            # Crafting system (3 tests)
├── haiku.test.ts              # Haiku scorer (8 tests)
├── snapping.test.ts           # Snapping system (6 tests)
├── pollution-behavior.test.ts  # Pollution + Behavior (15 tests)
└── pack.test.ts               # Pack system (18 tests)
```

### Test Coverage: 57/57 Passing ✅
- Components: Full coverage
- Systems: Comprehensive unit tests
- Integration: Game loop validation
- CI: Tests run before every build

## CI/CD Pipeline

### GitHub Actions Workflows

#### 1. Build Android APK
**Trigger**: Push to any branch, PRs, manual dispatch
**Steps**:
1. Run 57 tests (must pass)
2. Build web assets (`pnpm run build`)
3. Initialize Capacitor Android
4. Sync assets (`npx cap sync android`)
5. Build debug/release APKs
6. Upload artifacts (30-90 day retention)
7. Comment on PR with status

**Build Time**: ~8-12 minutes
**Free Tier Usage**: ~100-120 min/day (within 2,000 min/month limit)

#### 2. Code Quality
**Trigger**: Every PR
**Checks**:
- TypeScript validation (`pnpm exec tsc --noEmit`)
- Test coverage (`pnpm run test:coverage`)
- Documentation checks
- ECS architecture validation
- Large file detection
- Security audit

#### 3. Release APK
**Trigger**: Version tags (v*) or manual
**Steps**:
- Builds both debug and release APKs
- Creates GitHub Release automatically
- Professional naming: `ebb-and-bloom-v0.1.0.apk`
- Auto-generated release notes
- Installation instructions

### Renovate Bot (Dependency Management)
**Schedule**: Nightly (10pm-5am + weekends)
**Strategy**:
- Non-major updates: Bundled into single auto-merge PR
- Major updates: Separate PRs with manual review
- Game engines (Phaser, BitECS, Yuka): Always manual
- Capacitor ecosystem: Bundled together
- Security vulnerabilities: Immediate auto-merge
- Lockfile maintenance: Weekly (Mondays)

## Development Workflow

### Commands
```bash
# Development
pnpm install          # Install dependencies
pnpm dev             # Start dev server (HMR)

# Testing
pnpm test            # Run all tests
pnpm test:watch      # Watch mode
pnpm test:ui         # Vitest UI
pnpm test:coverage   # Coverage report

# Building
pnpm build           # Build for production
pnpm preview         # Preview production build

# Mobile
npx cap sync android # Sync web assets to Android
npx cap open android # Open Android Studio
./build-android.sh   # Full Android build script
```

### Prerequisites
```bash
node >= 20.x
pnpm >= 9.x          # Install via: corepack enable
Android Studio       # For APK builds
Java 17 (Zulu)      # For Gradle builds
```

## Known Technical Constraints

### Mobile Performance
- **60FPS Target**: Must maintain on mid-range Android (Snapdragon 700+)
- **Memory Limit**: ~512MB active game state
- **Battery**: Optimize to prevent excessive drain
- **Screen Sizes**: Support 5-7 inch displays
- **Bundle Size**: Target < 15MB APK (currently ~4MB)

### Platform-Specific
- **Android**: Minimum API 24 (Android 7.0)
- **Gestures**: Must work with various touch screen qualities
- **Haptics**: Use Capacitor Haptics API
- **Orientation**: Portrait primary, landscape optional

### Network
- **Offline-First**: Core gameplay works without internet
- **Cloud Save**: Optional backup (future Stage 3+)
- **No Real-Time MP**: Fully single-player

## Known Issues & Solutions

### Issue: Phaser + Vue Reactivity Conflicts
**Problem**: Vue reactivity can cause Phaser render loops to stutter
**Solution**: Keep Phaser game state separate from Vue reactive state
**Pattern**: Use Zustand for game logic, Vue only for UI overlays

### Issue: Mobile Touch Delay
**Problem**: 300ms click delay on some mobile browsers
**Solution**: Use Phaser's pointer events, not DOM events
**Pattern**: `scene.input.on('pointerdown')` instead of `@click`

### Issue: BitECS + TypeScript Types
**Problem**: BitECS component types can be verbose
**Solution**: Create type aliases and helper functions
**Pattern**: `type Entity = number;` with helper functions

### Issue: pnpm + packageManager Field
**Problem**: pnpm/action-setup@v4 treats ANY `packageManager` field as conflict
**Solution**: Remove `packageManager` field from package.json entirely
**Pattern**: Let workflows manage pnpm version explicitly

### Issue: GitHub Actions Gradle Cache
**Problem**: setup-java@v5 gradle cache fails if android/ doesn't exist
**Solution**: Don't use gradle cache before `npx cap add android` step
**Pattern**: Remove `cache: 'gradle'` from setup-java step

## Future Technical Considerations

### Stage 2+ (Planned)
- **Shaders**: GLSL for visual effects (pollution haze, water flow)
- **Web Audio**: Procedural audio synthesis (ambient soundscapes)
- **Service Workers**: Offline persistence, background processing

### Stage 3+ (Future)
- **WebGL2**: Advanced rendering (particle systems, lighting)
- **WebAssembly**: Performance-critical world gen (if needed)
- **Cloud Sync**: Optional cross-device saves

### Stage 4+ (Stretch Goals)
- **Real-time Multiplayer**: WebRTC for co-op
- **Shader Graphs**: Visual effects system
- **VR Support**: Oculus Quest port

## Architecture Decisions

### Why BitECS?
- High performance (cache-friendly memory layout)
- Scales to thousands of entities
- Proper separation of data and logic
- Future-proof for complex gameplay

### Why Phaser as Rendering Layer?
- Mature 2D engine with excellent WebGL renderer
- Large community and resources
- Good mobile performance
- Easy to keep separate from game logic

### Why Zustand over Redux/Vuex?
- Lightweight (< 1KB)
- No boilerplate
- Framework agnostic
- Perfect for ECS → UI sync

### Why pnpm over npm?
- 3x faster installs
- Strict dependency resolution
- Efficient disk usage
- Better for monorepos (future expansion)

---

**Last Updated**: 2025-11-06
**Architecture Version**: Stage 1 Complete (ECS + Systems)
**Next**: Stage 2 (Combat, Rituals, Nova Cycles)
