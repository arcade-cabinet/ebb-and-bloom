---
description: 'Vue 3 + TypeScript + BitECS development patterns for Ebb & Bloom game architecture'
applyTo: '**/*.vue, **/*.ts, **/src/ecs/**/*.ts'
tools: ['codebase', 'search', 'problems']
model: 'gpt-5'
version: '1.0'
---

# Vue 3 + TypeScript + BitECS Instructions

## Architecture Constraints

### Entity Component System (BitECS)
- ✅ **Game logic ONLY in ECS systems** (`src/ecs/systems/`)
- ✅ **Components are data-only** - no methods, only properties
- ✅ **Systems operate on queries** - batch process entities
- ❌ **NO game logic in Vue components or Phaser scenes**

### Data Flow Pattern
```
ECS Systems (modify state) → Pinia Store (reactive sync) → Vue Components (display)
                          → Phaser Scene (render sprites)
```

### Component Design
- **Components**: Pure data structures using `defineComponent()` from BitECS
- **Queries**: Cache queries at system initialization, don't recreate
- **Entity Creation**: Use factory functions in `src/ecs/entities/`

## Vue 3 Patterns

### Composition API Standards
- **Use `<script setup>`** for all new components
- **Reactive refs**: Use `ref()` for primitive values, `reactive()` for objects
- **Computed properties**: Use `computed()` for derived state
- **Lifecycle**: Use composition API lifecycle hooks (`onMounted`, `onUnmounted`)

### Store Integration
- **Read-only from ECS**: Pinia store only syncs FROM ECS systems
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
- **Vue Test Utils**: Use `@vue/test-utils` for component testing
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

### Vue Performance
- **v-for keys**: Always use stable, unique keys
- **Computed caching**: Leverage Vue's computed property caching
- **Component splitting**: Split large components into smaller, focused ones
- **Lazy loading**: Use dynamic imports for route-level code splitting

## Common Anti-Patterns to Avoid

❌ **Game logic in Vue components**
```typescript
// BAD - game logic in component
const movePlayer = () => {
  player.position.x += 10;
}
```

✅ **Game logic in ECS systems**
```typescript
// GOOD - game logic in system
export function MovementSystem(world: IWorld) {
  const query = defineQuery([Position, Velocity]);
  return (delta: number) => {
    query(world).forEach(entity => {
      Position.x[entity] += Velocity.x[entity] * delta;
    });
  };
}
```

❌ **Direct store mutations from components**
```typescript
// BAD - direct store mutation
gameStore.setState({ health: newHealth });
```

✅ **Store updates from ECS**
```typescript
// GOOD - store syncs from ECS
export function StoreSync(world: IWorld) {
  return () => {
    const playerEntity = getPlayerEntity(world);
    gameStore.setState({
      health: Health.current[playerEntity]
    });
  };
}
```

## File Organization

```
src/
├── ecs/
│   ├── components/       # BitECS component definitions
│   ├── systems/          # Game logic systems  
│   ├── entities/         # Entity factory functions
│   └── world.ts          # ECS world instance
├── stores/
│   └── gameStore.ts      # Pinia reactive store
├── views/                # Vue page components
├── components/           # Vue UI components
└── game/
    └── GameScene.ts      # Phaser rendering (read-only from ECS)
```

## Debugging Patterns

### ECS Debugging
- Use BitECS dev tools for entity inspection
- Log component state changes in development
- Add debug queries for problematic systems

### Vue Debugging  
- Use Vue DevTools for component inspection
- Enable Vue's development mode warnings
- Use `console.log` sparingly, prefer debugger breakpoints