# Tech Context

**Last Updated**: 2025-11-10

---

## Stack

### Current: Engine + Game
- **Framework**: React + React Three Fiber
- **Rendering**: Three.js via R3F
- **AI**: Yuka (physics, AI systems, steering behaviors)
- **Cross-Platform**: Capacitor (web/iOS/Android)
- **Storage**: Capacitor Preferences API (consider migrating to Storage for hooks)
- **Seed**: seedrandom (deterministic RNG)
- **Testing**: Vitest (unit/integration), Playwright (E2E browser)
- **Build**: Vite
- **Package Manager**: pnpm
- **Node.js**: 22 (latest LTS)
- **Command Runner**: Just (justfile, not bash scripts)

---

## Commands (via Justfile)

### Development
```bash
just dev-fresh          # Kill servers and start fresh
just dev                # Start dev server (port 5173)
just build              # Production build
```

### Quality & Testing
```bash
just quality            # Run all quality checks (type-check, lint, format, test)
just quality-fix        # Fix quality issues automatically
just test               # Run all tests
just test-coverage      # Run tests with coverage (80% thresholds)
just test-browser       # Run Playwright E2E tests
just test-browser-ui    # Run Playwright with UI
just test-codegen       # Generate Playwright tests using codegen
```

### Dependencies
```bash
just audit              # Security audit
just audit-fix          # Fix vulnerabilities
just upgrade            # Upgrade all dependencies
just upgrade-interactive # Interactive upgrade
just migrate-pnpm       # Migrate to pnpm
```

### Mobile
```bash
just android            # Build Android
just ios                # Build iOS
just sync               # Sync Capacitor
```

---

## File Structure

```
engine/              # Complete simulation engine
├── governors/      # 15 governors (decide behavior)
├── procedural/     # 6 synthesis systems (create visuals)
├── core/           # 5 core systems (WorldManager API)
├── spawners/       # Terrain, biomes, creatures, NPCs
├── systems/        # Tools, structures, trade
├── agents/         # CreatureAgent
├── tables/         # Constants
├── utils/          # RNG, seeds
└── types/          # TypeScript definitions

game/               # Clean game package
├── Game.tsx        # Main component
├── main.tsx        # Entry point
├── index.html      # HTML shell
└── ui/             # UI system (Menu, Pause, HUD)

tests/              # Test suite
├── unit/           # Unit tests
├── integration/    # Integration tests
└── browser/        # Playwright E2E tests

docs/               # Architecture documentation
memory-bank/        # Agent context (ONLY place for status/docs)
```

---

## Development Setup

1. **Install**: `pnpm install`
2. **Start Dev Server**: `just dev` (port 5173)
3. **Run Tests**: `just test`
4. **Quality Check**: `just quality`

---

## Testing

- **Unit/Integration**: `just test-unit` / `just test-integration`
- **E2E Browser**: `just test-browser` (Playwright)
- **Coverage**: `just test-coverage` (80% thresholds)
- **Watch**: `just test-watch`

**Current**: Tests passing, 87% coverage

---

## Deployment

### Web
```bash
just build              # Builds to game/dist/
# Deploy to Vercel, Netlify, GitHub Pages, etc.
```

### Android
```bash
just android           # Builds + syncs + opens Android Studio
# Or manually: pnpm run build && npx cap sync android && npx cap open android
```

### iOS
```bash
just ios               # Builds + syncs + opens Xcode
# Or manually: pnpm run build && npx cap sync ios && npx cap open ios
```

**Config**: `capacitor.config.ts` (appId: `com.ebbandbloom.app`)

---

## Quality & Tooling

### Tools
- **ESLint** - TypeScript + React linting
- **Prettier** - Code formatting
- **EditorConfig** - Editor consistency
- **Vitest** - Fast test runner (80% coverage thresholds)
- **Playwright** - E2E browser testing
- **Coverage** - V8 provider

### Capacitor React Hooks
- `@capacitor-community/app-react` - App lifecycle
- `@capacitor-community/filesystem-react` - Filesystem operations
- `@capacitor-community/device-react` - Device information
- **Note**: Preferences uses direct API (hooks are for Storage plugin)

### Key Constraints
- **Seed-Driven**: All generation uses deterministic seeds (`v1-word-word-word`)
- **Engine/Game Separation**: Engine has NO rendering code
- **TypeScript**: Strict mode
- **Cross-Platform**: Must work on web/iOS/Android via Capacitor
- **NO Status Docs in Root**: Only README.md (all docs in memory-bank/)
