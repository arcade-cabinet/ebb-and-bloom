---
description: 'React + TypeScript + Miniplex ECS development patterns for Ebb & Bloom game architecture'
applyTo: '**/*.tsx, **/*.ts, **/src/systems/**/*.ts'
tools: ['codebase', 'search', 'problems']
model: 'gpt-5'
version: '1.0'
---

# React + TypeScript + Miniplex ECS Instructions

## Architecture Constraints

### Entity Component System (Miniplex)
- ✅ **Game logic ONLY in ECS systems** (`src/systems/`)
- ✅ **Components are data-only** - no methods, only properties
- ✅ **Systems operate on queries** - batch process entities
- ❌ **NO game logic in React components or Three.js scenes**

### Data Flow Pattern
```
ECS Systems (modify state) → Zustand Store (reactive sync) → React Components (display)
                          → React Three Fiber Scene (render 3D)
```

### Component Design
- **Components**: Pure data structures using Miniplex component definitions
- **Queries**: Use Miniplex queries for entity selection
- **Entity Creation**: Use factory functions in `src/ecs/entities/`

## React Patterns

### React Three Fiber Standards
- **Use React hooks** for all component logic
- **Reactive state**: Use Zustand store hooks for reactive state
- **Computed properties**: Use `useMemo()` for derived state
- **Lifecycle**: Use React lifecycle hooks (`useEffect`, `useLayoutEffect`)

### Store Integration
- **Read-only from ECS**: Zustand store only syncs FROM ECS systems
- **UI state only**: Store UI-specific state (modals, selections, camera position)
- **No direct ECS writes**: Use ECS systems for all game state changes

### TypeScript Patterns
- **Strict mode enabled**: All files must pass `tsc --noEmit`
- **Component props**: Use `defineProps<{}>()` with interface
- **Emits**: Use `defineEmits<{}>()` with event signature
- **Generic components**: Prefer composition over inheritance

## Mobile-First Patterns

### Touch Interaction
- **Gesture handling**: Use GestureSystem for all touch input
- **Haptic feedback**: Integrate with HapticSystem for user feedback
- **Performance**: Target 60 FPS on mobile devices

### Ionic Integration
- **Ion components**: Use Ionic components for mobile UI patterns
- **Native features**: Access through Capacitor plugins
- **Responsive design**: Mobile-first, scale up for larger screens

## Testing Requirements

### Component Testing
- **React Testing Library**: Use `@testing-library/react` for component testing
- **ECS mocking**: Mock ECS world and systems in component tests
- **Vitest**: Use Vitest test runner with happy-dom environment

### System Testing
- **Pure functions**: ECS systems should be easily testable
- **Query mocking**: Mock component queries for system tests
- **Integration tests**: Test ECS → Store → Component data flow

## Performance Guidelines

### ECS Performance
- **Component queries**: Cache at system initialization
- **Batch operations**: Process entities in batches, not individually  
- **Memory management**: Use object pooling for frequently created/destroyed objects
- **Component arrays**: Use typed arrays for numeric components

### React Performance
- **List keys**: Always use stable, unique keys in map functions
- **Memoization**: Use `useMemo()` and `useCallback()` for expensive computations
- **Component splitting**: Split large components into smaller, focused ones
- **Lazy loading**: Use dynamic imports for route-level code splitting

## Common Anti-Patterns to Avoid

❌ **Game logic in React components**
```typescript
// BAD - game logic in component
const movePlayer = () => {
  player.position.x += 10;
}
```

✅ **Game logic in ECS systems**
```typescript
// GOOD - game logic in system
export function createMovementSystem(world: World) {
  return (delta: number) => {
    for (const entity of world.with('position', 'velocity')) {
      entity.position.x += entity.velocity.x * delta;
      entity.position.y += entity.velocity.y * delta;
    }
  };
}
```

❌ **Direct store mutations from components**
```typescript
// BAD - direct store mutation
useEvolutionDataStore.getState().setState({ health: newHealth });
```

✅ **Store updates from ECS**
```typescript
// GOOD - store syncs from ECS
export function storeSync(world: World) {
  return () => {
    const playerEntity = getPlayerEntity(world);
    useEvolutionDataStore.getState().updateHealth(
      playerEntity.health?.current || 0
    );
  };
}
```

## File Organization

```
src/
├── systems/             # ECS game logic systems (Miniplex)
├── stores/
│   └── EvolutionDataStore.ts  # Zustand reactive store
├── components/          # React UI components
└── App.tsx             # React Three Fiber rendering (read-only from ECS)
```

## Debugging Patterns

### ECS Debugging
- Use Miniplex queries for entity inspection
- Log component state changes in development
- Add debug queries for problematic systems

### React Debugging  
- Use React DevTools for component inspection
- Enable React's development mode warnings
- Use proper logging system (Pino logger), prefer debugger breakpoints