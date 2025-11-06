# Testing Guide - Ebb & Bloom POC

## Automated Tests

### Core Functionality Test
Validates world generation, player mechanics, and crafting systems.

```bash
node test-core.js
```

**Expected Output:**
- World generation with 5x5 chunks (25 total)
- 4000x4000 pixel world bounds
- Raycast system finding tiles
- Player movement and resource collection
- Crafting system (ore + water = alloy)
- Trail effect with proper alpha fading
- Pollution tracking

## Manual Testing

### 10-Minute Frolic Test

**Objective:** Validate core gameplay loop and performance over 10 continuous minutes.

**Setup:**
1. Deploy to Android device or use browser
2. Enable performance monitoring (FPS counter visible in-game)
3. Ensure haptic feedback is enabled on device

**Test Procedure:**

**Minutes 0-2: Movement & Controls**
- [ ] Swipe gesture triggers quick dash
- [ ] Hold-and-drag activates joystick control
- [ ] Joystick provides smooth 8-directional movement
- [ ] Character sprite flips correctly based on direction
- [ ] Trail effect renders with proper fading
- [ ] Camera follows player smoothly

**Minutes 2-4: World Exploration**
- [ ] Observe different biome types (water, grass, flowers, ore)
- [ ] Verify world boundaries (5x5 chunks = 500x500 tiles)
- [ ] Check terrain varies organically (Perlin noise)
- [ ] Confirm tiles render within view radius
- [ ] No visual glitches or tearing

**Minutes 4-6: Resource Collection**
- [ ] Walk over water tiles to collect water
- [ ] Walk over ore tiles to collect ore
- [ ] Inventory UI updates correctly
- [ ] Resources accumulate over time

**Minutes 6-8: Crafting System**
- [ ] Craft button appears when resources available
- [ ] Tap craft button when ore + water > 0
- [ ] Haptic feedback triggers (device vibrates)
- [ ] Alloy count increases by 1
- [ ] Pollution meter increases by 1%
- [ ] Resources properly consumed
- [ ] Camera shake provides visual feedback

**Minutes 8-10: Performance Validation**
- [ ] FPS stays at or near 60 throughout session
- [ ] No frame drops during movement
- [ ] No memory leaks (check device/browser tools)
- [ ] Touch response remains snappy
- [ ] No lag or stuttering
- [ ] Battery consumption reasonable

### Evolution Intimacy Test

**Objective:** Validate state management and progression systems.

**Test Procedure:**
1. Open browser console
2. Access game store: `window.__ZUSTAND_STORE__` (if exposed)
3. Verify state updates:
   - `playTime` increments
   - `intimacyLevel` can be modified
   - `evolutionStage` updates at 20% intervals
   - `pollutionLevel` tracks crafting

**Expected Stages:**
- Stage 0: 0-19% intimacy
- Stage 1: 20-39% intimacy
- Stage 2: 40-59% intimacy
- Stage 3: 60-79% intimacy
- Stage 4: 80-100% intimacy

### Android APK Test

**Prerequisites:**
- Android SDK installed
- Device in developer mode with USB debugging

**Build Process:**
```bash
# Build web app
npm run build

# Initialize Capacitor (first time only)
npx cap init "Ebb and Bloom" "com.jbcom.ebbandbloom" --web-dir=dist

# Add Android platform (first time only)
npx cap add android

# Sync and build
npx cap sync android
cd android && ./gradlew assembleDebug
```

**Installation:**
```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

**On-Device Validation:**
- [ ] App launches without crashes
- [ ] Touch controls work natively
- [ ] Haptic feedback functions
- [ ] Performance reaches 60 FPS
- [ ] No significant battery drain
- [ ] Screen rotation handled (if enabled)

## Performance Benchmarks

### Target Metrics
- **FPS**: 60 (stable)
- **Load Time**: < 3 seconds
- **Memory Usage**: < 150MB
- **Bundle Size**: < 2MB (gzipped)

### Current Metrics
Check with:
```bash
# Bundle size
npm run build
ls -lh dist/assets/

# Load time - test in browser Network tab
npm run preview
```

## Known Issues

### Development Mode Security Warning
- **Issue**: esbuild vulnerability (GHSA-67mh-4wv8-2f99)
- **Severity**: Moderate (affects dev server only)
- **Impact**: None in production builds
- **Mitigation**: Only run dev server on localhost, use VPN if needed

### Haptic Feedback
- **Issue**: Haptics don't work in browser
- **Expected**: "Haptics not available" warning in console
- **Solution**: Test on actual Android device

## Debugging Tips

### Enable Phaser Debug Mode
Edit `src/game/config.js`:
```javascript
physics: {
  arcade: {
    debug: true // Shows collision boxes
  }
}
```

### Verbose Logging
Add to `src/game/GameScene.js`:
```javascript
console.log('Player position:', this.player.x, this.player.y);
console.log('Tile type:', tile.type);
console.log('FPS:', this.fps);
```

### Remote Debugging Android
```bash
# Enable Chrome DevTools for Android
chrome://inspect
```

Then select your device and inspect the WebView.

## Test Results Template

```markdown
## Test Results - [Date]

**Environment:**
- Device: [e.g., Pixel 7, Browser Chrome]
- OS: [e.g., Android 14, Windows 11]
- Build: [commit hash]

**10-Minute Frolic Test:**
- Movement: ✅/❌
- World Exploration: ✅/❌
- Resource Collection: ✅/❌
- Crafting: ✅/❌
- Performance: ✅/❌

**Performance Metrics:**
- Average FPS: [value]
- Min FPS: [value]
- Max FPS: [value]
- Load Time: [seconds]
- Memory Peak: [MB]

**Issues Found:**
1. [Description]
2. [Description]

**Notes:**
[Additional observations]
```
