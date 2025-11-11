# Tech Context

**Last Updated:** November 11, 2025  
**Status:** Phase 3 Complete, evaluating React Native + Expo migration

---

## Current Stack

### Core Technologies
- **Runtime:** Node.js 22.17.0
- **Framework:** React 19.2 + React Three Fiber
- **3D Engine:** Three.js 0.169
- **AI Framework:** YUKA (Goals, StateMachines, SteeringBehaviors)
- **Build Tool:** Vite 5.4 (dev server on port 5000)
- **Language:** TypeScript 5.7 (ES2023 target, strict mode)
- **Package Manager:** npm (considering pnpm)
- **Command Runner:** Just (justfile for all workflows)

### State & Data
- **State Management:** Zustand (persistent store)
- **ECS:** Miniplex (archetype-based storage)
- **Physics:** Rapier 3D (rigid body dynamics)
- **RNG:** seedrandom (deterministic generation)
- **Validation:** Zod (runtime type checking)

### Testing
- **Unit/Integration:** Vitest (happy-dom environment)
- **E2E:** Playwright (browser automation)
- **Coverage:** 80%+ thresholds (lines, functions, statements, branches)

### Mobile (Under Review)
- **Current:** Capacitor 7.x (web wrapper)
- **Evaluating:** React Native + Expo (native performance)
- **Android Tooling (Installed):**
  - JDK 17
  - Android Studio
  - watchman
  - Expo development build environment

### Logging (Pending Implementation)
- **Proposed:** Pino (structured JSON logging)
- **Browser Support:** pino-browser (browserify build)
- **Features:** Pretty printing, log levels, child loggers, serializers

---

## Commands (via Justfile)

### Development
```bash
just dev                # Start dev server (port 5000)
just dev-fresh          # Kill servers + start fresh
just build              # Production build
just kill-servers       # Kill ports 5173, 3000, 8080, 5174
```

### Quality & Testing
```bash
just quality            # Run all checks (type, lint, format, test)
just quality-fix        # Auto-fix issues
just check              # Type check only
just lint               # Lint code
just lint-fix           # Fix linting issues
just format             # Format code
just format-check       # Check formatting
just test               # Run all tests
just test-unit          # Unit tests only
just test-integration   # Integration tests only
just test-watch         # Watch mode
just test-coverage      # With coverage report
just test-browser       # Playwright E2E
just test-browser-ui    # Playwright with UI
just test-codegen       # Generate Playwright tests
just test-report        # Show Playwright HTML report
just test-all           # Unit + browser tests
```

### Dependencies & Security
```bash
just audit              # Security audit
just audit-fix          # Fix vulnerabilities
just upgrade            # Upgrade all dependencies
just upgrade-interactive # Interactive upgrade
just install            # Install dependencies
just clean-install      # Remove node_modules + reinstall
```

### Mobile (Capacitor)
```bash
just android            # Build Android
just ios                # Build iOS
just sync               # Sync Capacitor
```

### Cleanup
```bash
just clean              # Remove build artifacts
just list               # Show all commands
```

### Quick Workflows
```bash
just quick              # Test + type-check (fast validation)
```

---

## Project Structure

```
engine/                 # Core simulation engine
├── ecs/               # Entity-Component-System
│   ├── World.ts       # Miniplex world with spatial queries
│   ├── components/    # CoreComponents (Zod schemas)
│   ├── systems/       # 11 scientific law systems
│   └── core/          # LawOrchestrator, GovernorActionExecutor
├── genesis/           # Cosmic provenance
│   ├── GenesisConstants.ts
│   └── CosmicProvenanceTimeline.ts
├── rng/               # Deterministic RNG
│   └── RNGRegistry.ts
└── [Future]
    ├── accretion/     # Planetary layer generation
    ├── synthesis/     # Molecular/Pigmentation/Structure
    └── audio/         # Cosmic sonification

agents/                # AI controllers
├── controllers/       # GovernorActionPort interface
└── [Future]
    ├── creature/      # YUKA Goals, StateMachines
    └── rival/         # RivalAIGovernorController

game/                  # React UI + scenes
├── Game.tsx           # Root component
├── state/             # GameState (Zustand)
├── scenes/            # Menu, Intro, Gameplay, Pause
├── controllers/       # PlayerGovernorController
└── core/              # RenderLayer, SceneManager

docs/                  # Permanent technical guides
├── AI_HIERARCHY.md
├── COSMIC_PROVENANCE.md
├── INTENT_API_PHILOSOPHY.md
└── README.md

memory-bank/           # AI session context (ephemeral)
├── activeContext.md
├── progress.md
├── systemPatterns.md
├── techContext.md (this file)
└── productContext.md

tests/                 # Test suite
├── unit/
├── integration/
└── e2e/
```

---

## Development Workflow

### Starting Development
1. `just dev` - Start dev server on port 5000
2. Open browser to webview URL
3. Dev server hot-reloads on file changes

### Before Committing
1. `just quality` - Run all checks
2. `just test-coverage` - Verify 80%+ coverage
3. Fix any LSP errors
4. Ensure zero console errors

### Testing Strategy
- **Unit:** Test individual functions/classes
- **Integration:** Test system interactions (ECS + Laws)
- **E2E:** Test full gameplay flow (Menu → Intro → Gameplay)
- **Performance:** Benchmark critical paths (<10ms, <100ms budgets)

---

## Key Constraints & Decisions

### Replit Environment
- **Port 5000:** Frontend MUST bind to 0.0.0.0:5000 (only port exposed)
- **No Docker:** Replit uses Nix (no nested virtualization)
- **No Virtual Envs:** Use Nix package configuration
- **Vite Dev Server:** Must set `allowedHosts: true` in vite.config.ts

### Determinism Requirements
- **RNGRegistry:** All randomness through scoped namespaces
- **No Math.random():** Use `rngRegistry.getScopedRNG(namespace)`
- **Test:** Duplicate seed runs MUST produce identical results
- **Caching:** RNG instances cached per `${seed}:${namespace}`

### Cross-Platform Targets
- **Primary:** Web (Vite build)
- **Secondary:** Android (Capacitor or React Native - under review)
- **Tertiary:** iOS (future)
- **Performance:** 60fps minimum, <500MB RAM target

### Mobile Decision (Under Review)

**Current: Capacitor 7.x**
- ✅ Web wrapper (easy setup)
- ✅ Works with React Three Fiber
- ❌ WebGL performance overhead
- ❌ Limited native API access
- ❌ Larger bundle size

**Proposed: React Native + Expo**
- ✅ True native performance
- ✅ Direct sensor access (gyroscope, accelerometer, haptics)
- ✅ Smaller bundle size
- ✅ Better battery life
- ✅ Industry direction (React ecosystem)
- ✅ Expo development build (JDK 17, watchman, Android Studio installed)
- ❌ Three.js requires react-three-fiber fork (expo-three or react-three-drei)
- ❌ Migration effort (rewrite mobile layer)
- ❌ Different build pipeline

**Evaluation Criteria:**
1. **3D Performance:** Does React Native + expo-three match R3F performance?
2. **Sensor Integration:** Gyroscope camera control critical for mobile diorama
3. **Development Velocity:** Migration time vs long-term benefits
4. **Bundle Size:** APK size comparison
5. **Battery Life:** Power consumption on mobile devices

**Next Steps:**
- Research expo-three vs react-three-fiber compatibility
- Prototype gyroscope camera control in React Native
- Benchmark Three.js performance (React Native vs Capacitor WebGL)
- Estimate migration effort (React → React Native)

---

## Logging Strategy (Pending Implementation)

### Proposed: Pino

**Why Pino:**
- Structured JSON logging (machine-readable)
- Browser support (pino-browser via browserify)
- Pretty printing in development
- Log levels (trace, debug, info, warn, error, fatal)
- Child loggers (scoped contexts)
- Serializers (custom object formatting)
- Performance (asynchronous, minimal overhead)

**Usage Pattern:**
```typescript
// logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  browser: {
    asObject: true, // Structured objects
    write: {
      debug: console.debug,
      info: console.info,
      warn: console.warn,
      error: console.error,
    },
  },
});

// Component usage
const gameLogger = logger.child({ module: 'GameState' });
gameLogger.info({ seed: 'v1-test-alpha' }, 'Initializing world');
gameLogger.debug({ entities: 150 }, 'ECS tick complete');
gameLogger.error({ error: err }, 'Failed to spawn entity');
```

**Log Levels:**
- **trace:** Extremely verbose (RNG calls, every ECS query)
- **debug:** Development debugging (intent execution, system updates)
- **info:** Normal operations (world initialization, scene transitions)
- **warn:** Unexpected but recoverable (conservation law drift)
- **error:** Errors requiring attention (failed spawns, invalid intents)
- **fatal:** Unrecoverable errors (ECS corruption, memory exhaustion)

**Scoped Loggers:**
```typescript
const genesisLogger = logger.child({ module: 'Genesis' });
const ecsLogger = logger.child({ module: 'ECS' });
const intentLogger = logger.child({ module: 'GovernorActionExecutor' });
const lawLogger = logger.child({ module: 'LawOrchestrator' });
```

**Benefits:**
- Debugging: Trace WARP chain generation
- Performance: Identify slow systems
- Conservation: Log mass/energy changes
- Intent Auditing: Track player vs AI actions
- Browser DevTools: Pretty-printed in console

**Installation:**
```bash
npm install pino pino-browser
# Or: just install (after adding to package.json)
```

---

## TypeScript Configuration

### Compiler Options
- **Target:** ES2023 (modern features)
- **Module:** ESNext (tree-shaking)
- **Strict:** true (no implicit any, null checks)
- **JSX:** react-jsx (React 19 automatic runtime)
- **Lib:** ES2023, DOM, DOM.Iterable
- **ModuleResolution:** bundler (Vite-compatible)

### Path Aliases (tsconfig.json)
```json
{
  "paths": {
    "@/*": ["./game/*"],
    "@engine/*": ["./engine/*"],
    "@agents/*": ["./agents/*"],
  }
}
```

---

## Vite Configuration (Critical for Replit)

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    host: '0.0.0.0',        // REQUIRED: Bind to all interfaces
    port: 5000,              // REQUIRED: Only port exposed by Replit
    strictPort: true,
    allowedHosts: true,      // REQUIRED: Allow iframe proxy
  },
  build: {
    target: 'es2023',
    outDir: 'game/dist',
  },
});
```

**Without allowedHosts: true, user will NEVER see frontend!**

---

## Performance Budgets

### Critical Paths
- `GenesisConstants` initialization: <10ms
- `CosmicProvenanceTimeline` generation: <100ms
- `World.initialize()`: <500ms
- `LawOrchestrator.tick()`: <16ms (60fps)
- `GovernorActionExecutor.execute()`: <50ms

### Memory
- Development: <1GB RAM
- Production: <500MB RAM
- Mobile: <300MB RAM

### Bundle Size
- JavaScript: <2MB (gzipped)
- Assets: <10MB total
- Initial Load: <5s on 3G

---

## Dependencies (Key Libraries)

### Core
- react: 19.2
- react-three-fiber: Latest
- three: 0.169
- yuka: Latest
- zustand: Latest

### ECS & Physics
- miniplex: Latest
- @dimforge/rapier3d: Latest

### Utilities
- seedrandom: Latest
- zod: Latest
- uuid: Latest

### Dev Tools
- vite: 5.4
- typescript: 5.7
- vitest: Latest
- playwright: Latest
- eslint: Latest
- prettier: Latest

### Mobile (Current)
- @capacitor/core: 7.x
- @capacitor/android: 7.x
- @capacitor/ios: 7.x

### Mobile (Proposed)
- react-native: Latest
- expo: Latest
- expo-three: Latest
- expo-gl: Latest
- expo-sensors: Latest (gyroscope, accelerometer)

---

## Browser Compatibility

### Targets
- Chrome/Edge 120+
- Firefox 120+
- Safari 17+
- Mobile Safari 17+
- Chrome Android 120+

### Required Features
- WebGL 2.0 (Three.js)
- ES2023 (async/await, nullish coalescing)
- Web Workers (future: physics offload)
- Local Storage (Zustand persistence)

---

## Known Technical Debt

1. **Mobile Platform Decision:** Capacitor vs React Native + Expo
2. **Logging:** No structured logging (Pino pending)
3. **Planetary Accretion:** Not yet implemented (Phase 6)
4. **Audio System:** Cosmic sonification (Phase 6)
5. **Worker Threads:** Physics/ECS not offloaded yet

---

## Next Technical Decisions

### Immediate (Phase 3-4)
- [ ] Implement Pino logging
- [ ] Decide: Capacitor vs React Native + Expo
- [ ] Delete obsolete generation/ code

### Near-term (Phase 5-6)
- [ ] Worker thread for physics
- [ ] Planetary accretion system
- [ ] Audio generation (cosmic sonification)

### Long-term (Phase 7+)
- [ ] WebGPU migration (from WebGL)
- [ ] WASM for critical paths
- [ ] Progressive Web App (PWA) features

---

**For New Agent:** Read justfile for all available commands. Always use `just` instead of raw npm/pnpm commands.
