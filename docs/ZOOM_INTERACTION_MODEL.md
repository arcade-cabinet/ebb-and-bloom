# Zoom-Based Mode Switching

## THE INTERACTION

**No buttons. No menus. Just zoom.**

---

## Universe → Game (Zoom IN)

### The Experience

```
You're watching the universe in VCR mode
Billions of years flowing past
Stars forming, galaxies swirling

You notice a blue-green planet (water + life!)
Interesting...

Scroll wheel down (or pinch-zoom on mobile)
Camera swoops toward the planet

Distance: 1,000,000 km → 100,000 km → 10,000 km → 1,000 km

THRESHOLD CROSSED: 100 km
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[TRANSITION ANIMATION]

Universe fades to background
Planet comes into focus
HUD changes:

  ╔════════════════════════════════════════╗
  ║        🎮 GAME MODE ACTIVE             ║
  ╠════════════════════════════════════════╣
  ║ Seed: ancient-ocean-glow               ║
  ║ Coordinates: [47583, 92847, 17384]     ║
  ║ Time: 13.8 Gyr + 500 Myr               ║
  ╠════════════════════════════════════════╣
  ║ YOU NOW CONTROL evolution on this      ║
  ║ planet. Make choices that matter.      ║
  ║                                        ║
  ║ [Share seed] [Zoom out to Universe]   ║
  ╚════════════════════════════════════════╝

Creatures appear (your lineage highlighted in green)
Evolution HUD shows up
Decision prompts appear
YOU'RE IN CONTROL
```

**What Just Happened:**
1. Camera distance crossed threshold (< 100 km)
2. System auto-generated seed FROM coordinates: `ancient-ocean-glow`
3. Mode switched to GAME
4. Player can now make decisions
5. **Seed is shareable** (friends can visit SAME planet)

---

## Game → Universe (Zoom OUT)

### The Experience

```
You've been playing for 30 minutes
Your creatures have evolved tools, forming tribes
Population: 1,247 individuals

You wonder: "What happens if I leave them alone?"

Scroll wheel up (zoom out)
Camera pulls back from surface

Distance: 100 m → 1 km → 10 km → 100 km → 1,000 km

THRESHOLD CROSSED: 500 km  
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[TRANSITION ANIMATION]

Planet handed to AI
Universe view returns
HUD changes:

  ╔════════════════════════════════════════╗
  ║      🌌 UNIVERSE MODE ACTIVE           ║
  ╠════════════════════════════════════════╣
  ║ Time: 13.8 Gyr + 500.0003 Myr          ║
  ║                                        ║
  ║ Your planet (ancient-ocean-glow):      ║
  ║ ✅ Saved at current state              ║
  ║ 🤖 Now under AI control                ║
  ║                                        ║
  ║ VCR: [⏪] [◀] [⏸] [▶] [⏩] [⏭]        ║
  ║                                        ║
  ║ [Fast-forward 1 million years]         ║
  ║ [Zoom back in to see results]          ║
  ╚════════════════════════════════════════╝

YOUR PLANET (green dot on planet surface)
AI continues simulating while you watch universe
```

**What Just Happened:**
1. Camera crossed threshold (> 500 km)
2. Planet state saved to universe at coordinates
3. AI takes over control
4. Mode switched to UNIVERSE
5. **You can fast-forward and come back**

---

## The "Check Back Later" Flow

```
GAME MODE on "ancient-ocean-glow"
  ↓
ZOOM OUT (AI takes over)
  ↓
UNIVERSE MODE
  ↓
FAST-FORWARD 1 million years (VCR controls)
  ↓
ZOOM BACK IN to "ancient-ocean-glow"
  ↓
GAME MODE (see what evolved!)
```

**The Magic:**

When you zoom back in after 1 million years:
- AI simulated your planet forward
- Creatures may have evolved intelligence
- Civilization may have formed
- OR species went extinct
- **You see the ACTUAL outcome**

Then you can:
- Take control again (continue guiding)
- Let AI keep going (watch longer)
- Share seed with friends ("Check out what evolved!")

---

## Technical Implementation

### Zoom Threshold Detection

```typescript
class Camera {
  onZoomChange(callback: (distance: number, target: SpacetimeCoordinates) => void) {
    // Mouse wheel or pinch gesture
    this.addEventListener('zoom', (delta) => {
      this.distance *= Math.pow(1.1, delta);
      callback(this.distance, this.target);
    });
  }
}

// Mode system watches zoom
camera.onZoomChange((distance, target) => {
  modeSystem.updateZoom(distance, target);
  
  // UI updates automatically
  if (modeSystem.getMode() === 'game') {
    showGameHUD(modeSystem.getCurrentSeed());
  } else {
    showUniverseHUD();
  }
});
```

### Seed Generation from Zoom

```typescript
// Player clicks planet in universe mode
onPlanetClick(coords: SpacetimeCoordinates) {
  // Start zooming in
  camera.zoomTo(coords, targetDistance: 50); // Below threshold
  
  // As camera crosses threshold, mode system generates seed
  // Happens automatically in updateZoom()
}

// Result:
// - Seamless transition
// - Seed auto-generated: "blue-star-wind"
// - Player can immediately share it
```

### State Persistence

```typescript
// When zooming out:
modeSystem.saveCurrentState(); // Planet → Universe

// When fast-forwarding:
universe.step(1e6 * YEAR); // 1 million years

// When zooming back in:
const updated = universe.getAt(originalCoords);
// Planet has evolved under AI control!
```

---

## Use Cases

### Use Case 1: Explorer
"I want to find cool planets"

1. Start in Universe mode
2. Fast-forward to interesting times
3. Zoom around looking at planets
4. Find one with life → Zoom in
5. Auto-get seed
6. Play a bit
7. Zoom out, find another

### Use Case 2: Long-term Player
"I want to see my civilization's deep future"

1. Play in Game mode ("red-moon-dance")
2. Guide creatures to agriculture
3. Zoom out → AI takes over
4. Fast-forward 10,000 years
5. Zoom back in
6. See: Civilization formed! Cities!
7. Continue guiding OR zoom out again

### Use Case 3: Multiplayer Exploration
"My friend found a crazy planet"

Friend: "Check out 'ancient-ocean-glow'!"

You:
1. Enter seed
2. Teleport to same coordinates
3. See SAME planet (deterministic)
4. Compare: "Wow, yours has giant creatures!"

### Use Case 4: Speedrunner
"Optimize evolution to space age"

1. Try seed: "red-moon-dance"
2. Make decisions
3. Reach agriculture in 50,000 years
4. Zoom out, fast-forward 10,000 years
5. Check result
6. If slow, restart with different strategy
7. Share optimal seed + strategy

---

## The Experience Goals

### Seamlessness
**No loading screens between modes.**

Zoom in → Game mode (instant)
Zoom out → Universe mode (instant)

### Discoverability
**No tutorial needed.**

Players naturally zoom in/out exploring.  
Modes activate automatically.  
Intuitive.

### Shareability
**Seeds are coordinates.**

"ancient-ocean-glow" = [47583, 92847, 17384] @ t=13.8Gyr  
Anyone can visit.  
Deterministic outcome.

### Temporal Freedom
**Fast-forward your own planet.**

Play → Zoom out → FF 1M years → Zoom in  
See YOUR planet's future.  
Under AI guidance, not player control.

---

## Why This Is Perfect

✅ **No artificial boundaries** (modes flow together)
✅ **Intuitive controls** (zoom = explore)
✅ **Seeds meaningful** (coordinates, not random)
✅ **Multiplayer ready** (share coordinates)
✅ **Time travel** (see your planet's future)
✅ **Educational** ("This IS a real position in the universe")

**The zoom level determines the experience.**

Zoomed out: Cosmic perspective, VCR controls, pure physics  
Zoomed in: Ground level, decision-making, player agency

**One simulation. Infinite depth. Seamless interaction.**


