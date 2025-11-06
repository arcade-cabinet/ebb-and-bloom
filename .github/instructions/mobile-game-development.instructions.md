---
description: 'Mobile game development patterns for Phaser 3, Capacitor, and performance optimization'
applyTo: '**/src/game/**/*.ts, **/src/game/**/*.js, **/capacitor.config.ts'
tools: ['codebase', 'problems', 'fetch']
model: 'gpt-5'
version: '1.0'
---

# Mobile Game Development Instructions

## Performance Constraints

### Mobile 60 FPS Target
- **Frame budget**: 16.67ms per frame maximum
- **Sprite pooling**: Reuse sprites, never create/destroy in game loop
- **Viewport culling**: Only render visible tiles and entities
- **Batch rendering**: Group similar render operations

### Memory Management
- **Object pooling**: Pool frequently created objects (particles, projectiles)
- **Texture atlasing**: Use sprite sheets, avoid individual image files
- **Audio optimization**: Compress audio files, use Web Audio API efficiently
- **Garbage collection**: Minimize object creation in hot paths

## Phaser 3 Patterns

### Scene Architecture
- **Read-only from ECS**: Phaser scenes only read from ECS, never write
- **Rendering layer**: Phaser handles rendering, UI positioning, animations
- **Input delegation**: Pass all input to ECS systems via events
- **Asset management**: Preload all assets, use asset keys consistently

### Sprite Management
```typescript
// GOOD - Sprite pooling pattern
class SpritePool {
  private pool: Phaser.GameObjects.Sprite[] = [];
  
  getSprite(): Phaser.GameObjects.Sprite {
    return this.pool.pop() || this.scene.add.sprite(0, 0, 'key');
  }
  
  returnSprite(sprite: Phaser.GameObjects.Sprite): void {
    sprite.setVisible(false);
    this.pool.push(sprite);
  }
}
```

### Animation Patterns
- **Use Phaser animations**: Create reusable animation configs
- **Tween pooling**: Reuse tween objects for performance
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

❌ **Creating sprites in game loop**
```typescript
// BAD - creates garbage
update() {
  entities.forEach(entity => {
    const sprite = this.add.sprite(x, y, key); // Creates new sprite every frame
  });
}
```

✅ **Using sprite pooling**
```typescript  
// GOOD - reuses sprites
update() {
  entities.forEach(entity => {
    const sprite = this.spritePool.getSprite(); // Reuses existing sprite
    sprite.setPosition(x, y);
  });
}
```

❌ **Game logic in Phaser scenes**
```typescript
// BAD - game logic in scene
update() {
  player.health -= damage; // Should be in ECS system
}
```

✅ **ECS-driven rendering**
```typescript
// GOOD - scene only renders ECS state
update() {
  const playerEntity = getPlayerEntity(world);
  const health = Health.current[playerEntity];
  this.healthBar.setPercent(health / Health.max[playerEntity]);
}
```