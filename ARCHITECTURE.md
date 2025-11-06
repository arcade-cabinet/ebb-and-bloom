# Architecture Overview - Ebb & Bloom

## System Architecture

```
┌─────────────────────────────────────────────────┐
│          Capacitor Native Container             │
│  ┌───────────────────────────────────────────┐  │
│  │           Ionic Vue App                   │  │
│  │  ┌─────────────────────────────────────┐  │  │
│  │  │     Phaser Game Engine              │  │  │
│  │  │                                     │  │  │
│  │  │  ┌──────────┐  ┌─────────────┐    │  │  │
│  │  │  │ GameScene│  │   Zustand   │    │  │  │
│  │  │  │          │  │    Store    │    │  │  │
│  │  │  └────┬─────┘  └──────┬──────┘    │  │  │
│  │  │       │                │           │  │  │
│  │  │  ┌────▼────────────────▼──────┐   │  │  │
│  │  │  │     Game Systems           │   │  │  │
│  │  │  ├────────────────────────────┤   │  │  │
│  │  │  │ WorldCore  │  Player       │   │  │  │
│  │  │  │ (Perlin)   │  (Gestures)   │   │  │  │
│  │  │  ├────────────┼───────────────┤   │  │  │
│  │  │  │ Crafting   │  Rendering    │   │  │  │
│  │  │  │ (Haptics)  │  (Sprites)    │   │  │  │
│  │  │  └────────────────────────────┘   │  │  │
│  │  │                                     │  │  │
│  │  └─────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
         │                       │
         ▼                       ▼
   Android APIs              WebGL Renderer
   (Haptics, etc.)          (60 FPS Target)
```

## Module Breakdown

### Core Modules

#### 1. World Generation (`src/game/core/`)

**Perlin.js**
- Implements Perlin noise algorithm for organic terrain generation
- Seeded pseudo-random generation for reproducible worlds
- Octave layering for natural-looking variation
- Used by WorldCore to determine biome types

**Core.js**
- Main world generation system
- Manages 5x5 chunk grid (25 chunks total)
- Each chunk: 100x100 tiles (10,000 tiles per chunk)
- Total world: 500x500 tiles = 250,000 tiles
- Biome types: water, grass, flower, ore
- Raycast system for line-of-sight calculations
- Viewport culling for efficient rendering

**Key Algorithms:**
```javascript
// Perlin noise value determines biome
noise_value = perlin.octaveNoise(x, y, 4, 0.5)
if (noise < -0.3) -> water
else if (noise < 0.2) -> grass
else if (noise < 0.5) -> flower
else if (noise > 0.7) -> ore
```

#### 2. Player System (`src/game/player/`)

**Player.js**
- Catalyst character entity
- Physics: velocity-based movement with decay
- Sprite: 8x8 modular with directional flipping
- Trail effect: 10-point fading trail for warp visual
- Inventory: tracks ore, water, alloy
- Crafting logic: ore + water → alloy

**GestureController.js**
- Touch and mouse input handling
- Swipe detection: distance > 50px in < 300ms
- Joystick mode: hold and drag for continuous control
- Deadzone: 10px minimum movement
- Joystick radius: 50px max from origin
- Event cleanup: proper listener removal on destroy

**Movement Modes:**
1. **Swipe**: Quick dash
   - Detect fast short movements
   - Apply impulse force
2. **Joystick**: Continuous control
   - Calculate normalized direction
   - Apply proportional force

#### 3. Crafting System (`src/game/systems/`)

**Crafting.js**
- Recipe management
- Resource validation
- Haptic feedback integration (Capacitor Haptics API)
- Pollution tracking (0-100%)
- Recipe: `{ inputs, outputs, pollutionCost }`

**Pollution Mechanic:**
- Increases with each craft action
- Visual feedback: pollution meter
- Future expansion: environmental effects

#### 4. Game Scene (`src/game/GameScene.js`)

**Main Phaser Scene:**
- Initializes all systems
- Manages game loop (60 FPS target)
- Renders world tiles within viewport
- Updates player position
- Draws trail effects
- Handles UI rendering
- Auto-collects resources on tile overlap
- Triggers crafting on button press

**Optimization Strategies:**
- Tile culling: only render tiles within view radius
- Distance-based re-rendering: updates when player moves 200+ pixels
- Pixel art rendering: disable anti-aliasing
- Object pooling potential for future optimization

#### 5. State Management (`src/store/gameStore.js`)

**Zustand Store:**
- Global game state
- Play time tracking
- Intimacy level (0-100)
- Evolution stages (0-4 at 20% intervals)
- Pollution level synchronization
- Persistent state between sessions (future)

## Data Flow

### Game Loop
```
1. Input → GestureController
   ↓
2. Force applied to Player
   ↓
3. Player.update(deltaTime)
   - Update position
   - Update trail
   - Update animation state
   ↓
4. GameScene.update()
   - Move camera
   - Check resource collection
   - Re-render world if moved far
   - Draw trail
   - Update UI
   ↓
5. Render → Phaser WebGL
```

### Crafting Flow
```
1. Player collects ore + water
   ↓
2. UI shows craft button
   ↓
3. User taps craft button
   ↓
4. CraftingSystem.craft()
   - Validate resources
   - Consume inputs
   - Add outputs
   - Increase pollution
   - Trigger haptic
   ↓
5. GameScene shows feedback
   - Camera shake
   - UI update
```

## Performance Considerations

### Target Metrics
- **FPS**: 60 (steady)
- **Frame time**: ~16.67ms
- **Memory**: < 150MB
- **Load time**: < 3s

### Optimizations Implemented
1. **Tile Culling**: Only render visible tiles (~3600 vs 250,000)
2. **Distance-based Updates**: Re-render only when needed
3. **Pixel Art Mode**: Faster rendering, no anti-aliasing
4. **WebGL**: Hardware acceleration
5. **Minimal GC**: Reuse objects where possible
6. **Trail Pooling**: Fixed-size trail array

### Bottlenecks to Watch
1. Tile sprite creation (currently creates new sprites)
2. Trail rendering each frame
3. Touch event frequency on Android
4. Large Phaser bundle size (~1.6MB)

## Technology Stack Rationale

### Why Capacitor?
- Native mobile APIs (haptics, camera, etc.)
- Simple web-to-native bridge
- Good performance on modern devices
- Active development and community

### Why Ionic Vue?
- Mobile-optimized UI components
- Vue 3 composition API
- Fast development
- Familiar to web developers

### Why Phaser?
- Mature 2D game engine
- Excellent WebGL renderer
- Large community and resources
- Good mobile performance

### Why BitECS?
- Prepared for future ECS architecture
- High performance entity management
- Memory efficient
- Scalable (not yet utilized in POC)

### Why Yuka?
- AI and pathfinding capabilities
- Steering behaviors for entities
- Spatial partitioning
- Future: NPC movements and behaviors (not yet utilized in POC)

### Why Zustand?
- Lightweight state management
- No boilerplate
- React/Vue agnostic
- Good performance

## Future Expansion Points

### Planned Features (Beyond POC)
1. **BitECS Integration**
   - Convert entities to ECS architecture
   - Add more entity types (NPCs, creatures)
   - Component-based systems

2. **Yuka AI**
   - NPC pathfinding
   - Flocking behaviors
   - Obstacle avoidance

3. **Enhanced Intimacy**
   - Evolution visual changes
   - Unlock new abilities per stage
   - Relationship mechanics

4. **Environmental Effects**
   - Pollution impacts terrain
   - Day/night cycle
   - Weather systems

5. **Multiplayer**
   - Shared world state
   - Collaborative crafting
   - Tidal ripple effects between players

## File Structure Logic

```
src/
├── game/              # Game logic (framework-agnostic)
│   ├── core/         # World generation & systems
│   ├── player/       # Player entity & controls
│   ├── systems/      # Game systems (crafting, etc.)
│   ├── sprites/      # (Future) Sprite definitions
│   ├── GameScene.js  # Phaser scene integration
│   └── config.js     # Phaser configuration
├── store/            # Zustand state management
├── components/       # (Future) Vue components
├── views/            # (Future) Vue views/screens
├── utils/            # (Future) Utility functions
└── main.js           # App entry point
```

## Build Process

### Development
```
Vite Dev Server
  ↓
Hot Module Reload
  ↓
Browser/Mobile Browser
```

### Production
```
Vite Build (Rollup)
  ↓
Minification (Terser)
  ↓
dist/ output
  ↓
Capacitor Sync
  ↓
Android Project
  ↓
Gradle Build
  ↓
APK
```

## Testing Strategy

### Automated Tests
- Core functionality test (test-core.js)
- Unit tests for individual modules (future)

### Manual Tests
- 10-minute frolic test
- Performance monitoring
- Touch responsiveness
- Resource collection
- Crafting mechanics

### Integration Tests
- Full gameplay loop
- Save/load state
- Cross-device compatibility

## Security Considerations

✅ **Implemented:**
- No eval() or unsafe code execution
- Input sanitization in touch handlers
- No external API calls
- CSP-compatible code

⚠️ **Noted:**
- esbuild dev server vulnerability (dev-only, moderate)
- Solution: Only use dev server on localhost

## Performance Monitoring

### Built-in Metrics
- FPS counter (visible in-game)
- Frame time tracking
- Memory usage (via browser DevTools)

### Recommended Tools
- Chrome DevTools Performance tab
- Android Profiler
- Phaser Debug mode
- React Native Debugger (future if needed)

## Deployment

### Development
```bash
npm run dev
# http://localhost:8080
```

### Production Web
```bash
npm run build
npm run preview
```

### Android APK
```bash
./build-android.sh
# or
npm run build:android
```

## Maintenance Notes

### Regular Tasks
- Update dependencies monthly
- Monitor npm audit
- Test on new Android versions
- Profile performance on target devices

### Known Issues
- Large bundle size (Phaser ~1.6MB)
  - Consider dynamic imports in future
- Dev server security warning
  - Only affects development mode
