# Celestial View System

**The core visual experience of Simbiont**: One continuous camera that zooms from cosmic scale to ground level, showing evolution at every scale.

---

## Design Philosophy

### The Magic Moment

```
Timeline of Visual Evolution:

00:00  Game starts → Swirling cosmic dust (celestial view)
01:30  Planet forms → Dark and lifeless
02:00  Gen1 begins → First 4 tiny lights appear on surface
03:00  Lights multiply → 20 points of light moving across planet
08:00  Packs form → Lights clustering together
12:00  Gen4 settlements → Permanent glows appear
20:00  Gen6 civilization → Entire night side glowing like Earth from space

Player: "I... I did that. That was me."
```

**This visual progression solves all player engagement problems identified in playthroughs.**

---

## Camera System

### Three View Modes (Continuous Zoom)

```
┌─────────────────────────────────────────────────────────┐
│ CELESTIAL VIEW (500+ units)                             │
│ ┌─────────────────────────────────────┐                 │
│ │          🌟                          │                 │
│ │                                      │                 │
│ │              🌍  🌑                  │                 │
│ │                                      │                 │
│ │                    🌑                │                 │
│ └─────────────────────────────────────┘                 │
│ View: Entire solar system                               │
│ Creatures: Not visible                                  │
│ Use: Gen0 planet formation, big-picture strategy        │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ PLANETARY VIEW (100-500 units)                          │
│ ┌─────────────────────────────────────┐                 │
│ │                                      │                 │
│ │         🌍                           │                 │
│ │      ·  · · ·                        │                 │
│ │     · · ·  ·  ·                      │                 │
│ │        · ·  ·                        │                 │
│ └─────────────────────────────────────┘                 │
│ View: Planet fills screen                               │
│ Creatures: Point lights (dots of color)                 │
│ Use: Population spread, territory control, macro view   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ SURFACE VIEW (5-100 units)                              │
│ ┌─────────────────────────────────────┐                 │
│ │     🏔️  🌲 🌲                       │                 │
│ │  🦎   🌲    🦎🦎                     │                 │
│ │ 🌲  🏔️    🌲   🦎                   │                 │
│ │    🌲  🦎    🏔️                     │                 │
│ └─────────────────────────────────────┘                 │
│ View: Ground level detail                               │
│ Creatures: 3D meshes (individual models)                │
│ Use: Individual behavior, tactical decisions, intimacy  │
└─────────────────────────────────────────────────────────┘
```

### Camera Configuration

```typescript
// packages/game/src/scenes/GameScene.ts

const camera = new ArcRotateCamera(
  'camera',
  -Math.PI / 2,    // Alpha (horizontal rotation)
  Math.PI / 2.5,   // Beta (vertical angle)
  20,              // Radius (starting distance)
  Vector3.Zero(),  // Target (planet center)
  scene
);

// Extended limits for celestial view
camera.lowerRadiusLimit = 5;      // Close: See creatures
camera.upperRadiusLimit = 500;    // Far: See entire system
camera.wheelDeltaPercentage = 0.01; // Smooth zoom speed
```

**User controls**:
- **Mouse wheel**: Zoom in/out
- **Touch**: Pinch to zoom
- **Mouse drag**: Rotate around planet
- **Touch drag**: Rotate around planet

---

## LOD (Level of Detail) System

### Creature Rendering Modes

**The core innovation**: Creatures dynamically switch between point lights and 3D meshes based on camera distance.

```typescript
// packages/game/src/renderers/gen1/CreatureRenderer.ts

render(creatures: CreatureData[], cameraDistance: number): void {
  const threshold = 100; // Distance threshold for LOD switch
  
  if (cameraDistance > threshold) {
    this.renderAsLights(creatures);   // Distant: Point lights
  } else {
    this.renderAsMeshes(creatures);   // Close: 3D models
  }
}
```

### Point Light Mode (Distance > 100)

**Visual representation**:
- Each creature = one colored point light
- Light color = lineage identity
  - Green = player lineage
  - Red = AI lineage 1
  - Blue = AI lineage 2
- Light intensity = creature vitality (0-1)
- Light range = 2 units (just a pinprick)

**Purpose**:
- Show population spread and density
- Make territory control visible
- Display macro-level patterns (migration, clustering)
- Performance: Can render 1000+ creatures

**Player experience**:
```
Player zoomed out to planetary view:
- Sees clusters of green lights (their creatures)
- Sees red lights spreading (AI competition)
- Crisis occurs → Lights flicker (stress visible)
- Migration → Lights flow like a stream
- Growth → Lights multiply and brighten
```

### 3D Mesh Mode (Distance < 100)

**Visual representation**:
- Each creature = full 3D model
- Individual animations (walking, eating, fighting)
- Detailed visual traits (size, color, shape)
- Placeholder: Currently capsule meshes

**Purpose**:
- Show individual behavior
- Make traits visible (social clustering, speed differences)
- Create emotional connection (Aisha's "cute creature moments")
- Performance: ~100-200 creatures recommended

**Player experience**:
```
Player zooms into surface view:
- Sees individual creatures moving
- Watches pack coordination
- Observes conflicts in detail
- Identifies why tactical decisions succeeded/failed
```

### Seamless Transition

**The critical detail**: No pop-in or jarring switch.

```typescript
private transitionToLights(): void {
  // Fade out 3D meshes
  for (const mesh of this.meshes.values()) {
    mesh.dispose();
  }
  this.meshes.clear();
  
  // Fade in point lights at same positions
  this.currentLOD = 'lights';
}

private transitionToMeshes(): void {
  // Fade out point lights
  for (const light of this.lights.values()) {
    light.dispose();
  }
  this.lights.clear();
  
  // Fade in 3D meshes at same positions
  this.currentLOD = 'meshes';
}
```

**Implementation note**: Currently instant switch. Future: Add fade animation for smoother transition.

---

## Visual Progression Through Generations

### Gen0: Accretion Simulation

**Celestial View (Default)**:
- Swirling dust cloud around proto-sun
- Planetesimals colliding and forming
- Planet gradually coalescing at center
- Moons captured by gravity
- All visible from cosmic distance

**Player engagement**:
- **Passive** (current): Watch planet form over ~2 minutes
- **Future**: Interactive events (direct meteor impacts, comet targeting)

**Visual state**: Dark lifeless planet

---

### Gen1: First Creatures

**The First Lights Appear**:

```
Year 0:
├─ Camera in Planetary View
├─ Planet rotating slowly, empty
└─ Then... a SINGLE POINT OF LIGHT appears

Year 1:
├─ 4 lights total (player's initial creatures)
├─ 4 red lights (AI lineage 1)
└─ 4 blue lights (AI lineage 2)

Year 10:
├─ Lights begin MOVING
├─ Spreading across surface
└─ Following food sources

Year 30:
├─ 20+ lights now
├─ Clear territorial patterns
└─ Conflicts visible (lights flashing)

Year 50:
├─ 43 lights scattered
├─ Some clusters forming (early packs)
└─ Player feels ownership: "Those are MY creatures"
```

**Player engagement**:
- Watch lights spread → Macro strategy emerges
- Zoom in to see WHY a conflict happened → Tactical learning
- Zoom out to adapt strategy → Continuous feedback loop

**Visual state**: Dark planet with scattered pinpricks of light

---

### Gen2: Pack Dynamics

**Lights Begin Clustering**:

```
Behavioral change visible from space:

Instead of:     Now:
·  · ·  ·       ⦿  ⦿  ⦿
 ·   ·  ·
·  ·   ·        (Brighter clusters)

Individual      Pack
lights          glows
```

**Visual characteristics**:
- 3-6 lights move together (coordinated)
- Brighter combined glow (pack strength)
- Clear territorial boundaries emerge
- Cluster sizes show social hierarchy

**Player engagement**:
- Aisha: "Oh they're finding each other... they're not alone anymore"
- Marcus: Analyzes cluster sizes to predict conflicts
- Sarah: Feels emotional connection to her pack

**Visual state**: Organized clusters of light

---

### Gen3: Tool Discovery

**Lights Change Color**:

```
Cultural divergence visible:

Net-users:  Cyan tinted lights (coastal)
Spear-users: Orange tinted lights (highlands)  
Basket-users: Violet tinted lights (forests)

Planet now shows CULTURAL DIVERSITY through color
```

**Visual characteristics**:
- Same lineage splits into color variants (tools)
- Geographic clustering by color (tool-appropriate territories)
- Cross-lineage color patterns (cultural exchange)

**Player engagement**:
- Devon: "Wait, I'm seeing different colors now..."
- Hover tooltip shows: "Pack of 6 with Nets (Fishing)"
- Technology visible from space

**Visual state**: Multi-colored light clusters

---

### Gen4: Tribal Stage

**Lights Become Settlements**:

```
Transition:

Moving lights → PERMANENT GLOWS
·  · ·  ·     →  ◉ (large stationary glow)
 ·   ·  ·        with · · · (creatures) around it

Settlements appear as large persistent lights
```

**Visual characteristics**:
- Large stationary glows = permanent settlements
- Smaller moving lights = individual creatures
- Glow expands over time = settlement growth
- Multiple settlements = civilization spreading

**Player engagement**:
- Marcus: "Oh this is the civilization phase"
- Click settlement → Zoom into surface view
- See actual buildings, structures, resource stockpiles
- Zoom out → See territorial expansion as glow spread

**Visual state**: Major light sources (cities) with activity around them

---

### Gen5: Language & Culture

**Lights Gain Patterns & Connections**:

```
Cultural identity visible as PULSE RHYTHMS:

Your settlements:  ·—·—·—  (slow, contemplative)
Red settlements:   ··—··—  (fast, militant)
Blue settlements:  ~·~·~·~ (wave-like, artistic)

IDEA THREADS connect settlements:
     Settlement A
          │ (gold = trade)
          ├─────────→ Settlement B
          │ (white = stories)
          └─────────→ Settlement C
```

**Visual characteristics**:
- Settlements pulse with rhythmic patterns
- Light threads connect trading/allied settlements
- Thread color shows relationship type:
  - Gold = Trade goods
  - White = Stories/traditions
  - Red = Conflict/raids
  - Green = Alliance

**Player engagement**:
- Aisha watches peaceful white threads spreading stories
- Marcus strategizes trade route optimization
- Devon weaponizes culture (teaches hostile traditions to enemies)

**Visual state**: Pulsing network of connected civilization

---

### Gen6: Planetary Consciousness

**The Entire Planet Glows**:

```
Comparison:

Gen0:  ⚫ (dark lifeless sphere)
       
Gen1:  ⚫·· (few scattered lights)
       
Gen3:  ⚫:·::· (many clustered lights)
       
Gen6:  ⚪ (entire surface illuminated)
       Night side = dense light network
       Day side = visible cities, roads, agriculture
```

**The Payoff Moment**:

```
20:00 - Camera slowly pulls back to Celestial View
20:30 - Planet that was DARK is now ALIVE WITH LIGHT
21:00 - Entire night side glowing like Earth from ISS
21:30 - Moons have small lights too (space colonies)
22:00 - Player: "I... I did that. That was me."
```

**Visual characteristics**:
- No longer "lights on a dark planet"
- Now "glowing planet in space"
- Orbital structures visible (early space activity)
- Complete transformation from Gen0

**Player engagement**:
- **All archetypes feel accomplishment**
- Sarah: Visual journey completion
- Marcus: Strategic vision realized
- Aisha: Transcendent beauty
- Devon: Chaos successfully orchestrated

**Visual state**: Planetary transformation complete

---

## Player Archetype Support

### How Celestial View Solves Engagement Problems

**Problem**: Different players want different experiences
**Solution**: Multi-scale view serves all playstyles

#### Sarah (Casual Mobile)

**Findings from simulation**:
- ❌ Gen0 was too slow and boring
- ❌ Early Gen1 had nothing to DO
- ✅ Crises create engagement

**Celestial View Solution**:
- ✅ Stay in Planetary View (simple, visual)
- ✅ Watch lights spread = satisfying progress
- ✅ Crises show as flickering lights (visual alarm)
- ✅ Zoom in occasionally for "creature moments"
- ✅ Clear victory: dark planet → glowing planet

**Typical session**:
```
90% in Planetary View (strategic overview)
10% zoom to Surface View (specific events)
Feels accomplishment watching population multiply
```

#### Marcus (Strategy Gamer)

**Findings from simulation**:
- ✅ Loves optimization and analysis
- ✅ Needs detailed stats and causality
- ❌ Couldn't understand WHY strategies failed

**Celestial View Solution**:
- ✅ Planetary View = strategic situation visible
- ✅ Zoom in to diagnose failures ("Why did I lose that fight?")
- ✅ Zoom out to adapt ("Ah, I need to expand east")
- ✅ Camera is analytical tool

**Typical session**:
```
Constantly zooming in/out
Planetary: "Red tribe controls highlands"
Surface: "They have 5-creature packs, I have 2-creature packs"
Planetary: "I need to merge my packs"
Uses camera to verify hypothesis
```

#### Aisha (Narrative Explorer)

**Findings from simulation**:
- ✅ Loves beauty and meaning
- ✅ Gen0 meditation was perfect
- ❌ Gen4 combat felt discordant

**Celestial View Solution**:
- ✅ Celestial View IS meditation (cosmic scale)
- ✅ The zoom journey is metaphorical (consciousness descending)
- ✅ Can follow individual creatures (Story Mode)
- ✅ Watching planet illuminate = poetic

**Typical session**:
```
Starts in Celestial View (breathes, appreciates)
Slowly descends to Planetary (sees life emerging)
Zooms to Surface for intimate moments
Ascends back for reflection
The camera movement IS the narrative
```

#### Devon (Chaos Experimenter)

**Findings from simulation**:
- ✅ Loves breaking systems
- ✅ Wants emergent chaos
- ❌ Couldn't see cascading failures

**Celestial View Solution**:
- ✅ Scout entire planet from orbit for weak points
- ✅ Watch ecosystem collapse from space (all lights dying)
- ✅ Dive into conflicts to enjoy carnage
- ✅ Planetary View shows cascading patterns

**Typical session**:
```
Scans planet for opportunities
Identifies weak AI territory
Zooms in to execute exploit
Zooms out to watch ripple effects
"I can SEE the whole system breaking!"
```

---

## Technical Implementation

### File Structure

```
packages/game/src/
├─ scenes/
│  └─ GameScene.ts
│     ├─ Camera setup (5-500 unit range)
│     ├─ LOD update loop
│     └─ Scene orchestration
│
└─ renderers/
   ├─ gen0/
   │  ├─ PlanetRenderer.ts (macro: planet surface)
   │  └─ MoonRenderer.ts (meso: orbital bodies)
   │
   └─ gen1/
      └─ CreatureRenderer.ts (micro: creatures with LOD)
         ├─ renderAsLights() - Point light mode
         ├─ renderAsMeshes() - 3D mesh mode
         └─ LOD transition logic
```

### Update Loop

```typescript
// packages/game/src/scenes/GameScene.ts

this.scene.registerBeforeRender(() => {
  this.time += deltaTime;
  
  // Update orbital mechanics (moons)
  this.moonRenderer.updateOrbitalPositions(this.time);
  
  // Update creature LOD based on camera distance
  const camera = this.scene.activeCamera;
  const cameraDistance = Vector3.Distance(
    camera.position, 
    Vector3.Zero()
  );
  
  // Automatic LOD switching
  this.creatureRenderer.render(
    this.renderData.creatures,
    cameraDistance  // <-- This drives LOD decision
  );
});
```

### Performance Considerations

**Point Light Mode**:
- ~1000+ creatures: Acceptable
- Each light = minimal GPU cost
- No mesh geometry, no animations
- Perfect for macro view

**3D Mesh Mode**:
- ~100-200 creatures: Recommended max
- Full geometry and animations
- Occlusion culling helps
- LOD naturally limits visible creatures (close view = smaller area)

**Transition Cost**:
- Dispose old mode, create new mode
- Currently happens at threshold crossing
- Future: Add hysteresis to prevent rapid switching

---

## Future Enhancements

### Gen4+ Visual Features (Not Yet Implemented)

**Settlement Glows**:
- Large area lights (not point lights)
- Glow intensity = population size
- Glow expansion animation = growth
- Different colors = different cultures

**Idea Threads**:
- Bézier curves connecting settlements
- Animated flow along curves
- Color-coded by relationship type
- Fade in/out based on diplomatic changes

**Particle Effects**:
- Meteor impacts (Gen0)
- Conflict explosions (Gen1-2)
- Tool discoveries (Gen3)
- Building construction (Gen4+)

### Interaction Enhancements

**Click to Zoom**:
- Click planet surface → zoom to that point
- Click creature light → follow that creature
- Click settlement glow → zoom into city

**Story Mode Camera**:
- Auto-follow one creature's life
- Cinematic camera movements
- Smooth transitions between scales
- For Aisha's narrative experience

**Multi-Focus**:
- Picture-in-picture for comparing locations
- Split screen for watching multiple conflicts
- Timeline scrubbing (watch recorded history)

---

## Summary

**What We Built**:
1. ✅ Extended camera range (5-500 units)
2. ✅ LOD system for creatures (lights ↔ meshes)
3. ✅ Automatic switching based on distance
4. ✅ Smooth zoom with mouse/touch

**What It Solves**:
1. ✅ Engagement across all player archetypes
2. ✅ Visual progression (dark → glowing)
3. ✅ Strategic overview + tactical detail
4. ✅ Emotional connection (see individual lives OR population patterns)
5. ✅ Performance (LOD optimizes rendering)

**The Core Innovation**:
One continuous zoom from cosmic dust to individual creatures, showing evolution at every scale. This IS the game's visual identity.

---

**Status**: Implemented and ready for testing
**Next**: Add Gen4+ features (settlements, threads) and full 3D creature models
