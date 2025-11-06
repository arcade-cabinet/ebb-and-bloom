# Development Guide - Ebb & Bloom

**Version**: 1.0.0  
**Date**: 2025-11-06

## Quick Start

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build

# Build Android APK
./build-android.sh
```

## Prerequisites

```bash
node >= 20.x
pnpm >= 9.x (install via: corepack enable)
Android Studio (for APK builds)
Java 17 (Zulu distribution)
```

## Project Structure

See [ARCHITECTURE.md](./ARCHITECTURE.md) for complete package structure.

## Development Workflow

### 1. Always Start with Memory Bank
Read these files BEFORE coding:
- `/memory-bank/productContext.md` - What we're building
- `/memory-bank/techContext.md` - How it's built
- `/memory-bank/activeContext.md` - Current sprint context
- `/memory-bank/progress.md` - Implementation status

### 2. Find the Right Package

**Adding a game mechanic?** → `src/ecs/systems/`  
**Adding a trait?** → `src/ecs/components/traits.ts`  
**Rendering change?** → `src/game/GameScene.ts`  
**UI change?** → `src/views/`  
**Touch input?** → `src/systems/GestureSystem.ts`

### 3. Write Tests First

```typescript
// src/test/my-feature.test.ts
import { describe, it, expect } from 'vitest';

describe('MyFeature', () => {
  it('should do the thing', () => {
    // Arrange
    // Act
    // Assert
  });
});
```

### 4. Implement in ECS

```typescript
// 1. Define component (if needed)
export const MyComponent = defineComponent({
  value: Types.f32
});

// 2. Create system
export const createMySystem = () => {
  const query = defineQuery([MyComponent, Position]);
  
  return (world: IWorld) => {
    const entities = query(world);
    for (let i = 0; i < entities.length; i++) {
      const eid = entities[i];
      // Modify components here
    }
  };
};

// 3. Add to GameScene
this.mySystem = createMySystem();

// 4. Call in update loop
this.mySystem(this.world);
```

### 5. Update Documentation

- Add system to package README
- Update memory-bank if architecture changes
- Link to VISION.md design pillar

## Code Standards

### ECS Rules
✅ **DO**: Store all game state in components  
✅ **DO**: Modify state only in systems  
✅ **DO**: Use queries to find entities  
✅ **DO**: Keep systems focused and testable  

❌ **DON'T**: Modify components from Phaser  
❌ **DON'T**: Modify components from Zustand  
❌ **DON'T**: Store state outside ECS  
❌ **DON'T**: Create circular dependencies  

### Mobile-First Rules
✅ **DO**: Test on real Android device  
✅ **DO**: Use touch events, not mouse  
✅ **DO**: Optimize for 60 FPS  
✅ **DO**: Consider battery usage  

❌ **DON'T**: Assume desktop first  
❌ **DON'T**: Use keyboard shortcuts  
❌ **DON'T**: Ignore haptic feedback  
❌ **DON'T**: Bloat APK size  

### Testing Rules
✅ **DO**: Write tests before implementation  
✅ **DO**: Test edge cases  
✅ **DO**: Mock Phaser and Capacitor  
✅ **DO**: Keep tests fast (<5s total)  

❌ **DON'T**: Skip tests  
❌ **DON'T**: Test implementation details  
❌ **DON'T**: Write slow tests  

## Common Tasks

### Adding a New Trait

1. Add component to `src/ecs/components/traits.ts`
2. Add to TRAIT_COSTS
3. Update calculateSynergies if needed
4. Write component test
5. Update trait documentation

### Adding a New System

1. Create `src/ecs/systems/MySystem.ts`
2. Define query for entities
3. Implement system logic
4. Write comprehensive tests
5. Add to GameScene.ts
6. Update package README

### Adding a New Recipe

1. Add to SNAP_RULES in `SnappingSystem.ts`
2. Define affinity overlap requirement
3. Set pollution cost
4. Add harmony bonus if applicable
5. Write snapping test

### Fixing a Bug

1. Write failing test that reproduces bug
2. Fix the bug
3. Confirm test passes
4. Add regression test if needed

## Testing Guide

### Run Tests
```bash
pnpm test              # Run once
pnpm test:watch        # Watch mode
pnpm test:ui           # Vitest UI
pnpm test:coverage     # Coverage report
```

### Test Structure
```typescript
describe('System Name', () => {
  let world: IWorld;
  
  beforeEach(() => {
    world = createWorld();
  });
  
  it('should handle normal case', () => {
    // Test implementation
  });
  
  it('should handle edge case', () => {
    // Test edge case
  });
});
```

## Building & Deployment

### Web Build
```bash
pnpm build              # Production build
pnpm preview            # Preview build
```

### Android Build
```bash
./build-android.sh      # Full automated build

# Or manually:
pnpm build
npx cap sync android
npx cap open android    # Opens Android Studio
```

### Release Process
```bash
# Create version tag
git tag v0.1.0-alpha
git push origin v0.1.0-alpha

# GitHub Actions automatically:
# 1. Runs all tests
# 2. Builds APK
# 3. Creates GitHub Release
# 4. Uploads APK artifact
```

## CI/CD

### Automated Checks
- TypeScript validation
- Test suite (57 tests)
- Build verification
- APK generation
- Security audit

### GitHub Actions
- `.github/workflows/build-android.yml` - APK builds
- `.github/workflows/quality.yml` - Code quality
- `.github/workflows/release.yml` - Releases

### Renovate Bot
- Nightly dependency updates
- Auto-merge non-major updates
- Manual review for major updates

## Troubleshooting

### Tests Failing
```bash
# Check for linter errors
pnpm exec tsc --noEmit

# Run specific test
pnpm test path/to/test.ts

# Check coverage
pnpm test:coverage
```

### Build Failing
```bash
# Clear build cache
rm -rf dist android

# Reinstall dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Try build again
pnpm build
```

### APK Not Building
```bash
# Sync Capacitor
npx cap sync android

# Check Android directory exists
ls android/

# If not, add Android platform
npx cap add android
```

## Getting Help

1. Check Memory Bank docs first
2. Read package README where you're working
3. Review test files for examples
4. Check techContext.md for architecture details
5. Review PROGRESS_ASSESSMENT.md for known issues

## Next Steps

**Stage 1**: Complete ✅  
**Stage 2**: See [VISION.md](./VISION.md) Future Vision section

Focus areas:
1. UX polish (tutorials, onboarding)
2. Combat system
3. Ritual mechanics
4. Nova cycles
5. Stardust hops

---

*Last Updated: 2025-11-06*  
*For vision, see [VISION.md](./VISION.md)*  
*For architecture, see [ARCHITECTURE.md](./ARCHITECTURE.md)*
