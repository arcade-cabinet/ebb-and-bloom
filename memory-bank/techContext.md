# Tech Context

**Last Updated**: 2025-01-09

---

## Stack

- **ECS**: Miniplex (game logic)
- **Rendering**: React Three Fiber
- **UI**: @react-three/uikit (3D UI components)
- **AI**: Yuka (creature behavior)
- **State**: Zustand (UI state, read-only from ECS)
- **Platform**: Capacitor (mobile)
- **Build**: Vite
- **Test**: Vitest
- **Seed**: seedrandom (**TO BE ADDED**)

---

## Commands

```bash
# Development
pnpm dev
pnpm build
pnpm preview

# Testing
pnpm test
pnpm test:watch
pnpm test:coverage

# Mobile
npx cap sync android
npx cap open android
./build-android.sh
```

---

## File Structure

```
src/
├── systems/      # Game logic (ECS)
├── world/        # ECS schema
├── components/   # R3F rendering
├── stores/       # Zustand state
└── App.tsx       # Entry point

docs/             # Permanent documentation
memory-bank/      # AI context (ephemeral)
```

---

## Development Setup

1. Install: `pnpm install`
2. Textures: `pnpm setup:textures`
3. Dev server: `pnpm dev`
4. Open: http://localhost:5173

---

## Testing

- **Unit**: `pnpm test`
- **Watch**: `pnpm test:watch`
- **UI**: `pnpm test:ui`
- **Coverage**: `pnpm test:coverage`

**Current**: 57/57 passing

---

## Mobile Build

```bash
pnpm build && npx cap sync android
npx cap open android
# Build APK in Android Studio
```

---

## Key Constraints

- **Cross-platform**: Web, Android, iOS, desktop (via Capacitor)
- **Performance**: Target 60 FPS on mid-range devices
- **Bundle size**: < 15MB APK
- **TypeScript**: Strict mode
- **No DOM UI**: All UI via UIKit (inside Canvas)

