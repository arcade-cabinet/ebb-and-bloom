# Test Package - Vitest Test Suites

**Purpose**: Comprehensive test coverage for all game systems.

## Test Status: 57/57 Passing ✅

### Test Suites

| Suite | Tests | Purpose |
|-------|-------|---------|
| **components.test.ts** | 4 | ECS component validation |
| **movement.test.ts** | 3 | Position/velocity updates |
| **crafting.test.ts** | 3 | Recipe matching, resources |
| **haiku.test.ts** | 8 | Jaro-Winkler, diversity |
| **snapping.test.ts** | 6 | Affinity-based combining |
| **pollution-behavior.test.ts** | 15 | Shocks, playstyle profiling |
| **pack.test.ts** | 18 | Formation, loyalty, schism |

## Running Tests

```bash
pnpm test              # Run once
pnpm test:watch        # Watch mode
pnpm test:ui           # Vitest UI
pnpm test:coverage     # Coverage report
```

## Test Structure

```typescript
describe('System Name', () => {
  let world: IWorld;
  
  beforeEach(() => {
    world = createWorld();
  });
  
  it('should handle case', () => {
    // Arrange - Act - Assert
  });
});
```

## Setup

- **setup.ts**: Mocks for Phaser and Capacitor
- **happy-dom**: Fast DOM simulation

## Links

- [DEVELOPMENT.md](../docs/DEVELOPMENT.md) - Testing guide

---

*Coverage: Comprehensive*  
*Last Updated: 2025-11-06*
