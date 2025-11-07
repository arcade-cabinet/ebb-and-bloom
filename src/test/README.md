# Tests

**Vitest test suites**

---

## Status

**57/57 passing** ✅

---

## Running Tests

```bash
pnpm test           # Run all tests
pnpm test:watch     # Watch mode
pnpm test:coverage  # Coverage report
```

---

## Test Files

- ECS components & systems
- Creature evolution
- Pack dynamics
- Pollution & shock events
- Material systems
- Haiku generation
- UI components

---

## Pattern

```typescript
import { describe, test, expect } from 'vitest';

describe('SystemName', () => {
  test('should do thing', () => {
    // Arrange
    // Act
    // Assert
  });
});
```

---

**All systems MUST have tests before commit.**

