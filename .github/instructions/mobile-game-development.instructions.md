---
description: 'Mobile game development patterns for React Three Fiber, Capacitor, and performance optimization'
applyTo: '**/src/components/**/*.tsx, **/src/App.tsx, **/capacitor.config.ts'
tools: ['codebase', 'problems', 'fetch']
model: 'gpt-5'
version: '1.0'
---

# Mobile Game Development Instructions

## Performance Constraints

### Mobile 60 FPS Target
- **Frame budget**: 16.67ms per frame maximum
- **Instanced rendering**: Use THREE.InstancedMesh for many similar objects
- **Viewport culling**: Only render visible entities (frustum culling)
- **Batch rendering**: Group similar render operations

### Memory Management
- **Object pooling**: Pool frequently created objects (particles, projectiles)
- **Texture atlasing**: Use texture arrays, avoid individual image files
- **Audio optimization**: Compress audio files, use Web Audio API efficiently
- **Garbage collection**: Minimize object creation in hot paths

## React Three Fiber Patterns

### Scene Architecture
- **Read-only from ECS**: React Three Fiber components only read from ECS, never write
- **Rendering layer**: React Three Fiber handles 3D rendering, UI positioning, animations
- **Input delegation**: Pass all input to ECS systems via events
- **Asset management**: Preload all assets, use texture system consistently

### Instanced Rendering
```typescript
// GOOD - Instanced rendering pattern for performance
import { useMemo } from 'react';
import { InstancedMesh } from 'three';

function VegetationRenderer({ positions }: { positions: Vector3[] }) {
  const instancedMesh = useMemo(() => {
    const mesh = new InstancedMesh(geometry, material, positions.length);
    positions.forEach((pos, i) => {
      mesh.setMatrixAt(i, new Matrix4().setPosition(pos));
    });
    return mesh;
  }, [positions]);
  
  return <primitive object={instancedMesh} />;
}
```

### Animation Patterns
- **Use React Three Fiber animations**: Use `useFrame` for animations
- **Animation pooling**: Reuse animation objects for performance
- **State-based animations**: Sync animations with ECS component state

## Capacitor Integration

### Native Features
- **Haptic feedback**: Use `@capacitor/haptics` for touch feedback
- **Device sensors**: Access accelerometer, gyroscope for game input
- **Storage**: Use `@capacitor/preferences` for persistent game state
- **Status bar**: Configure status bar appearance for immersion

### Platform-Specific Code
```typescript
// Platform detection pattern
import { Capacitor } from '@capacitor/core';

if (Capacitor.isNativePlatform()) {
  // Native device code
} else {
  // Web browser code
}
```

### Build Optimization
- **Asset optimization**: Compress images, audio for mobile delivery
- **Bundle size**: Use code splitting, lazy loading for large features
- **Platform assets**: Different resolutions for different screen densities

## Touch Input Patterns

### Gesture Recognition
- **Use GestureSystem**: Centralized gesture handling through ECS
- **Touch zones**: Define clear touch areas for different actions
- **Visual feedback**: Provide immediate visual/haptic feedback
- **Accessibility**: Support larger touch targets for accessibility

### Input Debouncing
```typescript
// Debounce rapid touch events
class TouchDebouncer {
  private lastTouch = 0;
  private threshold = 100; // ms
  
  shouldProcess(timestamp: number): boolean {
    if (timestamp - this.lastTouch > this.threshold) {
      this.lastTouch = timestamp;
      return true;
    }
    return false;
  }
}
```

## Audio Optimization

### Audio Management
- **Web Audio API**: Use for complex audio processing
- **Audio sprites**: Combine multiple sounds into single files
- **Streaming**: Stream background music, load SFX into memory
- **Volume mixing**: Separate volumes for music, SFX, UI sounds

### Performance Patterns
- **Audio pooling**: Reuse audio instances for repeated sounds
- **Lazy loading**: Load audio on-demand for infrequent sounds
- **Format optimization**: Use appropriate formats (OGG, AAC, MP3)

## Battery Optimization

### Power Management
- **Reduce draw calls**: Minimize WebGL state changes
- **Screen wake lock**: Use wake lock API judiciously
- **Background behavior**: Pause game when app goes to background
- **Frame rate scaling**: Reduce FPS on battery low or thermal throttling

### Thermal Management
```typescript
// Adaptive quality based on performance
class PerformanceMonitor {
  private frameTimes: number[] = [];
  
  adaptQuality(): void {
    const avgFrameTime = this.getAverageFrameTime();
    if (avgFrameTime > 20) { // > 50 FPS
      this.reduceQuality();
    } else if (avgFrameTime < 14) { // < 70 FPS
      this.increaseQuality();
    }
  }
}
```

## Testing on Device

### Development Workflow
- **Live reload**: Use Capacitor live reload for rapid iteration  
- **Device debugging**: Enable remote debugging for mobile browsers
- **Performance profiling**: Use Chrome DevTools on connected devices
- **Real device testing**: Test on multiple device classes (low/mid/high-end)

### Common Mobile Issues
- **Touch delays**: iOS has 300ms click delay, handle appropriately
- **Safe areas**: Respect device safe areas (notches, home indicators)
- **Orientation changes**: Handle portrait/landscape transitions gracefully
- **Memory pressure**: Handle memory warnings from OS

## Asset Pipeline

### Image Optimization
- **Multiple densities**: Provide @1x, @2x, @3x assets for different DPIs
- **Format selection**: Use WebP when supported, fallback to PNG/JPG
- **Compression**: Optimize file sizes without quality loss
- **Atlasing**: Use texture atlases for related sprites

### Audio Pipeline
- **Bit rate optimization**: Use appropriate bit rates for different audio types
- **Format detection**: Serve best format based on device capabilities
- **Preloading strategy**: Balance immediate availability vs bundle size

## Common Anti-Patterns

❌ **Creating meshes in render loop**
```typescript
// BAD - creates garbage
function EntityRenderer({ entities }: { entities: Entity[] }) {
  return (
    <>
      {entities.map(entity => (
        <mesh key={entity.id} position={[entity.x, entity.y, entity.z]}>
          <boxGeometry />
          <meshStandardMaterial />
        </mesh>
      ))}
    </>
  );
}
```

✅ **Using instanced rendering**
```typescript  
// GOOD - single draw call for many objects
function EntityRenderer({ entities }: { entities: Entity[] }) {
  const instancedMesh = useMemo(() => {
    const mesh = new InstancedMesh(geometry, material, entities.length);
    entities.forEach((entity, i) => {
      mesh.setMatrixAt(i, new Matrix4().setPosition(entity.position));
    });
    return mesh;
  }, [entities]);
  
  return <primitive object={instancedMesh} />;
}
```

❌ **Game logic in React components**
```typescript
// BAD - game logic in component
const handleDamage = () => {
  player.health -= damage; // Should be in ECS system
}
```

✅ **ECS-driven rendering**
```typescript
// GOOD - component only renders ECS state
function HealthBar() {
  const playerEntity = usePlayerEntity();
  const health = playerEntity?.health?.current || 0;
  const maxHealth = playerEntity?.health?.max || 100;
  
  return <div style={{ width: `${(health / maxHealth) * 100}%` }} />;
}
```