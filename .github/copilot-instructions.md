# GitHub Copilot Instructions

**This extends `.clinerules`**. Read `.clinerules` as primary configuration.

---

## Memory Bank First

Before suggesting code, mentally reference:
1. `memory-bank/agent-permanent-context.md` - Project facts
2. `memory-bank/activeContext.md` - Current focus
3. `memory-bank/systemPatterns.md` - Architecture patterns

---

## Copilot Role

**Inline code completion and suggestions**

### Best Used For
- Implementing functions based on type signatures
- Completing patterns established in file
- Generating test cases
- Writing boilerplate

### NOT Used For
- Architectural decisions (use Claude)
- Large refactors (use Cline/Cursor)
- Multi-file changes (use Cursor)

---

## Code Patterns to Follow

### ECS Systems
```typescript
class SystemName {
  private world: World<WorldSchema>;
  
  constructor(world: World<WorldSchema>) {
    this.world = world;
  }
  
  update(deltaTime: number): void {
    // Query entities
    const entities = this.world.with('component1', 'component2');
    
    // Process each
    for (const entity of entities.entities) {
      // Logic here
    }
  }
}
```

### React Three Fiber Rendering
```typescript
const Renderer: React.FC = () => {
  const { world } = useWorld();
  const { scene } = useThree();
  const [entities, setEntities] = useState<any[]>([]);
  
  useEffect(() => {
    // Query ECS once
    const query = world.with('component', 'render');
    setEntities(Array.from(query.entities));
  }, [world]);
  
  useEffect(() => {
    // Add meshes to scene
    for (const entity of entities) {
      if (entity.render?.mesh) scene.add(entity.render.mesh);
    }
    return () => {
      for (const entity of entities) {
        if (entity.render?.mesh) scene.remove(entity.render.mesh);
      }
    };
  }, [entities, scene]);
  
  return null;
};
```

### UIKit Components
```typescript
<Card
  positionType="absolute"
  positionTop={20}
  positionRight={20}
  width={280}
>
  <CardHeader>
    <CardTitle><Text>Title</Text></CardTitle>
  </CardHeader>
  <CardContent flexDirection="column" gap={8}>
    {/* Content */}
  </CardContent>
</Card>
```

---

## Current Focus

**Phase 0-1: Generation 0 (Planetary Genesis) Implementation**

**See**: GitHub Issue #13 and `docs/WORLD.md` lines 1932-1984

When suggesting code, prioritize:
- **Seed-driven**: seedrandom for all procedural generation
- **AI Workflows**: Vercel AI SDK parent-child workflows
- **Planetary Physics**: No hardcoded values (Copper at 10m is WRONG)
- **Yuka Integration**: Everything is a Yuka entity with goals
- **Event Messaging**: MessageDispatcher for player feedback

---

## Architecture Constraints

- ✅ ECS for game logic
- ✅ React Three Fiber for rendering only
- ✅ Zustand syncs FROM ECS, never writes
- ✅ UIKit for ALL UI
- ❌ NO hardcoded progression
- ❌ NO game logic in React components
- ❌ NO DOM-based UI

---

## Testing

Suggest test cases for all new systems:

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

**For collaboration rules, see**: `memory-bank/agent-collaboration.md`

