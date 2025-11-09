# WORLD SIMULATOR - Report Mode

## Overview

A **graphics-free simulation view** using Babylon GUI to display text reports and population graphs. This proves the viability of the law-based universe generation system through interactive cycles showing advancement and decline.

## Features

- ✅ **Pure Report Mode**: No 3D rendering, just data
- ✅ **Interactive Cycles**: Click buttons to advance 10 or 100 cycles
- ✅ **Population Graphs**: Visual representation of population dynamics over time
- ✅ **Event Tracking**: Shows extinctions, climate changes, catastrophes, social advancement
- ✅ **Deterministic**: Same seed always produces same world
- ✅ **Android-Ready**: Can be packaged with Capacitor

## Running Locally

```bash
# Development mode
cd packages/game
pnpm dev

# Open browser to:
http://localhost:5173/simulation.html
```

## Usage

### In Browser
1. World generates automatically with random seed
2. Click **ADVANCE 10 CYCLES** to simulate 1,000 years (100 years per cycle)
3. Click **ADVANCE 100 CYCLES** for 10,000 years
4. Click **NEW WORLD** to generate a different universe
5. Use URL hash to set seed: `simulation.html#my-seed-42`

### What You'll See

**Initial Report:**
- Universe properties (star type, planets)
- Habitable planet details (temperature, gravity)
- Ecology (productivity, biomes)
- Species list with populations

**After Each Cycle:**
- Events (extinctions, climate shifts, catastrophes, social advancement)
- Environment status (temperature, productivity)
- Current populations for all species
- Population graph showing trends
- Social development stage (Band → Tribe → Chiefdom → State)

## Building for Android

```bash
cd packages/game

# 1. Build the app
pnpm build:capacitor

# 2. Open in Android Studio
npx cap open android

# 3. Build APK in Android Studio
# Build > Build Bundle(s) / APK(s) > Build APK(s)
```

### Android Configuration

The simulation view can be set as the default by modifying `capacitor.config.ts`:

```typescript
{
  appId: 'com.ebb.worldsim',
  appName: 'World Simulator',
  webDir: 'dist',
  server: {
    url: 'http://localhost:5173/simulation.html', // Dev
    // or use: './simulation.html' for production build
  }
}
```

## For Feedback Gathering

### Test Scenarios

1. **Determinism Test**
   - Load `simulation.html#test-42`
   - Record species and populations
   - Reload page with same seed
   - Verify identical results

2. **Extinction Test**
   - Advance many cycles (500+)
   - Observe which species go extinct first
   - Check if predator-prey balance makes sense

3. **Advancement Test**
   - Watch social stages progress
   - See if population growth matches expectations
   - Observe catastrophe recovery

4. **Climate Test**
   - Track temperature changes over time
   - See impact on productivity
   - Observe population responses

### Feedback Questions

- **Does the population dynamics feel realistic?**
- **Are extinctions happening too often/rarely?**
- **Does social advancement progression make sense?**
- **Is the pacing right? (100 years per cycle)**
- **What additional data would you want to see?**
- **Is the graph readable/useful?**

## Technical Details

### Performance
- ~50-100ms per 10-cycle simulation
- GUI updates in real-time
- No 3D rendering overhead

### Data Structure
```typescript
{
  cycle: number;           // Current cycle
  year: number;            // Current year (cycle × 100)
  populations: Map;        // Species → population count
  extinctions: string[];   // List of extinct species
  socialStage: string;     // Current social development
  temperature: number;     // °C
  productivity: number;    // kcal/m²/year
  events: string[];        // Recent events
}
```

### Population Dynamics
- Uses simplified logistic growth
- Predator-prey interactions (Lotka-Volterra)
- Environmental stochasticity (climate changes)
- Catastrophic events (1% chance per 10 cycles)

## Future Enhancements

- [ ] Export simulation data to JSON
- [ ] Save/load simulation state
- [ ] Compare multiple worlds side-by-side
- [ ] Adjust simulation speed
- [ ] Add "intervention" buttons (increase productivity, cause catastrophe)
- [ ] Historical timeline view
- [ ] Species detail view

## Files

- `src/scenes/SimulationScene.ts` - Main simulation view class
- `simulation.html` - Entry point for report mode
- `src/gen-systems/loadGenData.ts` - Universe generation
- `src/ecology/StochasticPopulation.ts` - Population dynamics

---

**This is the PROOF OF CONCEPT for gathering feedback on the law-based universe system!**
