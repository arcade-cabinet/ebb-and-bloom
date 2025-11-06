# Quick Start Guide - Ebb & Bloom

## 🚀 5-Minute Setup

### Prerequisites
- Node.js 18+ installed
- npm 8+ installed

### Installation

```bash
# Clone repository
git clone https://github.com/jbcom/ebb-and-bloom.git
cd ebb-and-bloom

# Install dependencies
npm install

# Start development server
npm run dev
```

Open http://localhost:8080 in your browser.

## 🎮 Controls

### Touch/Mouse Controls
- **Swipe**: Quick dash in direction
- **Hold & Drag**: Joystick mode for continuous movement
- **Tap Craft Button**: Craft alloy when you have ore + water

### Keyboard (Testing)
- Use mouse click and drag for joystick simulation
- Click craft button to craft

## 🌍 Gameplay

1. **Explore** the meadow world with 5x5 chunks
2. **Collect** resources by walking over:
   - 🌊 Water tiles (blue)
   - ⛰️ Ore tiles (brown)
3. **Craft** alloy from ore + water
4. **Watch** pollution increase with each craft

## 📱 Mobile Testing

### Browser Testing
The game works in mobile browsers:
1. Start dev server: `npm run dev`
2. Get local IP: `ifconfig` or `ipconfig`
3. Open on mobile: `http://[your-ip]:8080`
4. Enable touch controls

### Android Build

#### Requirements
- Android SDK (Android Studio)
- Java Development Kit (JDK 11+)
- Gradle

#### Build Commands
```bash
# First time setup
npm run build
npx cap init "Ebb and Bloom" "com.jbcom.ebbandbloom" --web-dir=dist
npx cap add android

# Build and deploy
npm run build:android
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

Or use the convenience script:
```bash
./build-android.sh
```

## 🎯 Quick Test

Run the automated test to verify installation:
```bash
node test-core.js
```

Expected: All tests pass with green checkmarks ✓

## 📊 UI Elements

Top-left corner shows:
- **Ore**: Number of ore collected
- **Water**: Number of water collected  
- **Alloy**: Number of alloys crafted
- **Pollution**: Percentage (0-100%)
- **FPS**: Current frame rate (target: 60)

Bottom-right:
- **CRAFT button**: Tap to craft when resources available

## 🔧 Troubleshooting

### Build fails with "terser not found"
```bash
npm install --save-dev terser
```

### Port 8080 already in use
Edit `vite.config.js` and change port:
```javascript
server: {
  port: 3000, // Change this
}
```

### Blank screen on mobile
1. Check browser console for errors
2. Ensure build was successful: `npm run build`
3. Clear browser cache
4. Try different browser

### Low FPS on mobile
- Close other apps
- Disable browser extensions
- Use native Android build instead of browser
- Check device supports WebGL

### Capacitor errors
```bash
# Remove and re-add platform
rm -rf android
npm run cap:add:android
npm run cap:sync
```

## 🎨 Customization

### Change World Seed
Edit `src/game/GameScene.js`:
```javascript
this.worldCore = new WorldCore(12345); // Use any number
```

### Adjust View Radius
Edit `src/game/GameScene.js`:
```javascript
const visibleTiles = this.worldCore.getVisibleTiles(
  playerTilePos.x,
  playerTilePos.y,
  60 // Increase for more tiles, decrease for better performance
);
```

### Modify Biome Thresholds
Edit `src/game/core/core.js`:
```javascript
this.BIOME_THRESHOLDS = {
  water: -0.3,   // Less water
  grass: 0.2,    // More grass
  flower: 0.5,   // Moderate flowers
  ore: 0.7       // Rare ore
};
```

### Change Pollution Rate
Edit `src/game/systems/crafting.js`:
```javascript
alloy: {
  inputs: { ore: 1, water: 1 },
  output: { alloy: 1 },
  pollutionCost: 5 // Increase for faster pollution
}
```

## 📚 Next Steps

- Read [TESTING.md](TESTING.md) for comprehensive testing guide
- Check [README.md](README.md) for architecture details
- Explore source code in `src/game/` for implementation

## 🆘 Support

For issues or questions:
1. Check existing GitHub issues
2. Review code comments in source files
3. Test with `node test-core.js` to isolate problems

## 🌸 Have Fun!

Enjoy exploring the meadow world and crafting alloys!
