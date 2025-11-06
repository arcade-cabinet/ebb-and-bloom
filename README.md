# Ebb & Bloom

Stage 1 POC: A mobile-first game featuring procedurally generated meadow biomes, touch-based controls, and crafting mechanics.

## 🌸 Features

### World Generation
- **5x5 Chunk System**: Each chunk is 100x100 tiles
- **Perlin Noise**: Organic terrain generation with meadow biomes
- **Biome Types**: Water, Grass, Flowers, Ore deposits
- **Raycast Stride View**: Efficient rendering for mobile

### Player & Controls
- **Modular 8x8 Sprite**: Catalyst character with directional animations
- **Touch Gestures**:
  - **Swipe**: Quick dash movement
  - **Joystick**: Hold and drag for continuous movement
  - **Trail Effect**: Visual feedback with flipper trail warp
- **Mobile-First**: Optimized for touch screens

### Crafting System
- **Basic Snap**: Ore + Water = Alloy
- **Haptic Feedback**: Vibration on successful crafting
- **Pollution Mechanic**: Each craft increases pollution by +1
- **Visual Feedback**: Camera shake and UI updates

### Performance
- **Target**: 60FPS on Android devices
- **Optimizations**: 
  - Pixel art rendering
  - Efficient tile culling
  - WebGL acceleration
  - Minimal garbage collection

## 🚀 Tech Stack

- **Capacitor**: Native mobile wrapper
- **Ionic Vue**: Mobile UI framework
- **Phaser 3**: Game engine for 2D rendering
- **BitECS**: Entity Component System (prepared for future expansion)
- **Yuka**: AI/pathfinding library (prepared for future expansion)
- **Zustand**: State management for game state and intimacy tracking

## 📦 Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## 📱 Android Build

```bash
# Quick build
./build-android.sh

# Or manually:
npm run build
npx cap sync android
cd android && ./gradlew assembleDebug
```

The APK will be at: `android/app/build/outputs/apk/debug/app-debug.apk`

## 🎮 How to Play

1. **Move**: Touch and drag to move the catalyst character
   - Short swipe for quick dash
   - Hold and drag for joystick control
2. **Collect**: Walk over ore and water tiles to collect resources
3. **Craft**: Tap the CRAFT button when you have ore + water
4. **Watch**: Monitor pollution levels as you craft

## 🧪 Testing

**10-Minute Frolic Test**: 
- Play for 10 minutes continuously
- Test touch responsiveness
- Verify 60FPS performance
- Check resource collection
- Validate crafting mechanics

**Evolution Intimacy**:
- Intimacy system tracked in Zustand store
- Evolution stages unlock at 20% intervals
- Future expansion point for deeper mechanics

## 📁 Project Structure

```
ebb-and-bloom/
├── src/
│   ├── game/
│   │   ├── core/
│   │   │   ├── perlin.js      # Perlin noise generator
│   │   │   └── core.js         # World generation & raycast
│   │   ├── player/
│   │   │   └── player.js       # Player & gesture controls
│   │   ├── systems/
│   │   │   └── crafting.js     # Crafting & pollution
│   │   ├── GameScene.js        # Main Phaser scene
│   │   └── config.js           # Phaser configuration
│   ├── store/
│   │   └── gameStore.js        # Zustand state management
│   ├── App.vue                 # Main Vue component
│   └── main.js                 # Entry point
├── public/                     # Static assets
├── android/                    # Capacitor Android project
├── vite.config.js             # Vite configuration
├── capacitor.config.json      # Capacitor configuration
├── build-android.sh           # Android build script
└── package.json               # Dependencies & scripts
```

## 🎯 Vision

**One-world ache, tidal evo ripples**

This POC establishes the foundation for a living, breathing world where:
- Player actions ripple through the ecosystem
- Evolution mechanics respond to intimacy levels
- Pollution creates environmental consequences
- The world persists and evolves over time

## 📊 Performance Targets

- **FPS**: 60 on Android devices
- **Load Time**: < 3 seconds
- **Memory**: < 150MB RAM usage
- **Battery**: Optimized rendering pipeline

## 🔧 Development

```bash
# Development mode with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Sync with Capacitor
npm run cap:sync

# Open in Android Studio
npm run cap:open:android
```

## 📝 License

See LICENSE file for details.