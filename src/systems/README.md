# Systems Package - Cross-Cutting Game Systems

**Purpose**: Systems that span across multiple domains (ECS, Phaser, UI). These handle input, feedback, and narrative that don't fit cleanly into ECS systems.

## Package Contents

### HaikuScorer.ts ✅
**Purpose**: Prevents narrative repetition in procedural haiku journal

**Features**:
- Jaro-Winkler similarity algorithm
- Diversity guard (<20% overlap)
- Procedural metaphor bank
- Haiku scoring and validation

**Links**: [VISION.md - Innovation #3: Procedural Haiku Journaling](../docs/VISION.md)

### HapticSystem.ts ✅
**Purpose**: Touch feedback system for mobile

**Features**:
- 20+ distinct haptic patterns
- Playstyle-aware feedback
- Complex sequences (tension, heartbeat, crescendo)
- Capacitor Haptics API integration

**Links**: [VISION.md - Innovation #4: Touch as Language](../docs/VISION.md)

### GestureSystem.ts ✅
**Purpose**: Touch-first input system

**Features**:
- 7 gesture types (swipe, pinch, hold, tap, double-tap, drag, rotate)
- Configurable thresholds
- Mobile-optimized event handling
- Maps to game actions

**Links**: [VISION.md - Design Pillar #3: Touch as Poetry](../docs/VISION.md)

## How to Use

### HaikuScorer
```typescript
import { scoreHaikuDiversity } from './systems/HaikuScorer';

const result = scoreHaikuDiversity(haikuArray);
if (result.isDiverse) {
  // Safe to add new haiku
}
```

### Haptics
```typescript
import { playHaptic } from './systems/HapticSystem';

await playHaptic('SNAP_HARMONY', playstyle);
```

### Gestures
```typescript
import { EnhancedGestureController } from './systems/GestureSystem';

const controller = new EnhancedGestureController(scene);
controller.on('swipe', (gesture) => {
  // Handle swipe
});
```

## Tests

- **HaikuScorer**: 8 tests ✅
- **Haptics**: Manual (hardware required)
- **Gestures**: Manual (integration tests)

---

*Links*: [VISION](../docs/VISION.md) | [ARCHITECTURE](../docs/ARCHITECTURE.md)  
*Last Updated: 2025-11-06*
