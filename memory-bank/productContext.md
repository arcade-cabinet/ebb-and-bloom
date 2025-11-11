# Product Context

**Last Updated:** November 11, 2025  
**Game:** Ebb & Bloom - Competitive Evolution from Big Bang to Transcendence

---

## What This Is

**Competitive evolution game where you guide ONE species from cosmic origins to transcendence, racing against autonomous AI rivals for dominance.**

**Core Mechanic:** Player and AI opponents use IDENTICAL tools (Governor Intents) to influence their species indirectly. 57 scientific laws apply equally to all—no cheating, no special advantages. First species to transcend wins.

**Tagline:** "Everything is a Squirrel - From Quarks to Consciousness"

---

## Core Philosophy

### "Everything is a Squirrel"
**Meaning:** Total scientific rigor with complete material provenance.
- Kill fox → Get fox parts with full atomic lineage
- No generic "meat" - actual carbon atoms from specific stellar fusion
- Destroy shelter → Materials trace back to planetary accretion
- Build spear → Element availability from galaxy metallicity

**Example:**
```
Player finds copper ore.
Where did it come from?
→ Surface geology (accretion layer)
→ Planetary differentiation (core separation)
→ Stellar system (Pop I star)
→ Galaxy metallicity (0.7, metal-rich)
→ Supernova enrichment (8 cycles)
→ Big Bang + 3-word seed
```

### Governor View (Spore-Style)
**Not:** First-person creature control  
**Instead:** Strategic overhead perspective - see the ECOSYSTEM

**Like Spore's stages:**
- Creature stage: Guide from above, don't control limbs
- Tribal stage: Influence village, not micromanage individuals
- Civilization stage: Shape culture, not command armies

**In Ebb & Bloom:**
- **Primordial:** Nudge chemistry toward abiogenesis
- **Organismal:** Suggest prey, smite predators (energy-limited)
- **Social:** Shape terrain, apply environmental pressure
- **Cultural:** Form alliances, migrate populations
- **Transcendent:** Achieve consciousness singularity

### Competitive, Not Sandbox
**You vs YUKA Rivals:**
- 3-5 AI-controlled species competing for same resources
- AI uses SAME intent API (no cheating)
- AI pays SAME energy costs
- Laws determine ALL outcomes (not AI advantages)

**Win Condition:** First species to transcend  
**Lose Condition:** Species extinction OR rivals transcend first

**Difficulty:** "Dead World Bias" (main menu setting)
- Easy: High genesis probability (abundant life)
- Normal: Balanced conditions
- Hard: Low genesis probability (rare abiogenesis)

---

## Gameplay Loop

### 1. Seed Selection (Menu Scene)
- Enter 3-word seed (`v1-alpha-beta-gamma`)
- OR shuffle for random seed
- Seed preview: Galaxy age, metallicity, life probability
- Dead World Bias slider (difficulty)

### 2. Cosmic Genesis (Intro FMV)
**Dual Purpose:**
- **Visual:** Teaches player about provenance chain
- **Technical:** Deterministic universe generation

**Sequence (15-30 seconds):**
1. Big Bang (quantum fluctuations from seed)
2. Dark matter web expansion
3. Pop III star formation
4. Supernova enrichment (metallicity counter)
5. Galaxy formation (radial distance from center)
6. Stellar system (habitable zone calculation)
7. Planetary accretion (layer-by-layer formation)
8. Surface differentiation (where's the copper?)
9. Hydrosphere formation (water probability)
10. Abiogenesis flash (life begins - or doesn't)

**Player learns:**
- Young galaxy = low metallicity = stone age ceiling
- Old galaxy = high metallicity = atomic weapons possible
- Radial distance = galaxy age (edge younger than center)
- Planetary layers = material locations (core has iron, not surface)

### 3. Primordial Phase (Gameplay Scene)
**View:** Top-down diorama (tilt device to pan on mobile)

**Player Species:** Single organism glowing with "your" color  
**Rival Species:** 3-5 other glowing colors (YUKA-controlled)

**Available Intents (energy-limited):**
- **Nurture Food** (500 energy): Spawn vegetation patches
- **Smite Predator** (1000 energy): Damage rival's creatures
- **Shape Terrain** (800 energy): Raise/lower land (escape routes)
- **Apply Pressure** (600 energy): Environmental stress (evolution nudge)

**Laws Running:**
- Thermodynamics (heat flow, energy conservation)
- Metabolism (hunger, starvation)
- Physics (collision, gravity)
- Chemistry (reactions, bonds)
- Ecology (carrying capacity, predator/prey)
- Evolution (mutation, selection)

**Player Observes:**
- Creatures hunting (YUKA Goals: hunger, safety)
- Packs forming (YUKA FuzzyModule: cooperation desirability)
- Tools emerging (creatures learn spear-making)
- Territories expanding (population growth)
- Rivals competing (AI uses same intents)

**Pacing:** Time dilation controls
- 1x: Real-time (watch creatures think)
- 10x: Accelerate evolution
- 100x: Fast-forward to next era

### 4. Cultural Phase (Future)
**Tools → Tribes → Buildings → Religion/Democracy**

Same governor view, new intents:
- **Form Alliance** (400 energy): Create mutualism
- **Migrate** (700 energy): Population movement
- **Select Prey** (300 energy): Hunting optimization

### 5. Transcendence (Win/Lose)
**Win:** Your species achieves consciousness singularity first  
**Lose:** Species extinct OR rival transcends first

---

## Player Experience Goals

### Mobile Diorama
**Hold the living world in your hands:**
- Gyroscope: Tilt device to orbit camera
- Accelerometer: Shake for time dilation
- Haptics: Cosmic events (supernova rumble, abiogenesis pulse)
- Touch: Tap to select, hold to execute intent

**Sensory Immersion:**
- Audio: Cosmic sonification (galaxy hum, stellar pulse)
- Visual: Smooth interpolation (no instant simulation jumps)
- Temporal: SEE creatures thinking, reasoning, building

### Strategic Depth
**Every decision has trade-offs:**
- Smite predator → Spend 1000 energy → Can't nurture food
- Nurture food → Population boom → Exceeds carrying capacity → Mass starvation
- Shape terrain → Create barriers → Creatures can't migrate → Isolated gene pool
- Apply pressure → Force evolution → Species diverges → Lose control

**AI Responds:**
- Rival smites YOUR predators (helps you)? → Alliance forming?
- Rival nurtures YOUR food sources (competition)? → Territory conflict?
- Rival migrates toward you? → Prepare for war

### Discovery & Emergence
**Not hardcoded progression:**
- Young galaxy? Creatures never discover metallurgy (no metal!)
- Old galaxy? Atomic weapons emerge naturally (uranium abundant)
- High cooperation genes? Democracy emerges
- High aggression genes? Totalitarianism emerges

**Player learns by observation:**
- Why can't I craft bronze? (Check galaxy metallicity)
- Why won't creatures cooperate? (Check genome: low social trait)
- Why did spears appear? (Dexterity evolved + wood available)

---

## Why It's Special

### 1. Provable Fairness
**AI cannot cheat. Literally impossible.**
- Player and AI use GovernorActionPort (same interface)
- GovernorActionExecutor applies laws (same code path)
- ConservationLedger tracks ALL changes (audit trail)

**Test:**
```typescript
const playerIntent = { action: 'smite_predator', magnitude: 1.0 };
const aiIntent = { action: 'smite_predator', magnitude: 1.0 };

// Same execution, same outcome, same energy cost
await executor.execute(playerIntent); // Cost: 1000
await executor.execute(aiIntent);     // Cost: 1000 (IDENTICAL)
```

### 2. Complete Determinism
**Same seed = identical universe, always.**
- Big Bang → Identical quantum fluctuations
- Galaxy → Identical metallicity
- Planet → Identical mineral deposits
- Life → Identical genesis probability

**Every atom has a history traceable to Big Bang.**

### 3. Multi-Scale Simulation (WARP/WEFT)
**WARP (Time):** Big Bang → Transcendence  
**WEFT (Scale):** Universal → Quantum

**Example: Why is this fox brown?**
```
WARP (causal chain):
Galaxy metallicity (0.6) → Iron scarce
→ Prey has low iron → Fox diet lacks iron
→ No hemoglobin synthesis → No red blood cells
→ Brown fur (melanin compensates)

WEFT (scale interactions):
Universal constants → Galaxy properties
→ Stellar fusion → Element production
→ Planetary chemistry → Nutrient availability
→ Organismal metabolism → Pigmentation
→ Molecular synthesis → Fur color
```

### 4. Mobile-First Premium Experience
**Not a freemium cash grab:**
- Pay once, play forever
- No ads, no IAP, no dark patterns
- Premium mobile sensors (gyroscope, haptics)
- 60fps sustained, <300MB RAM

---

## Target Audience

**Who:**
- Strategy gamers (Civilization, Spore)
- Evolution enthusiasts (Richard Dawkins readers)
- Mobile gamers seeking depth (Monument Valley, The Room)
- Ages 25-45, value science + strategy

**Sessions:**
- Quick: 10 minutes (one evolutionary era)
- Medium: 30 minutes (primordial → cultural)
- Long: 60+ minutes (Big Bang → transcendence)

**Platform Priority:**
1. Android (native React Native + Expo)
2. Web (Vite build for testing)
3. iOS (future)

---

## Competitive Landscape

### Unique Positioning

**vs Spore:**
- ✅ More scientifically rigorous (WARP/WEFT provenance)
- ✅ Truly competitive (AI rivals using same rules)
- ✅ Mobile-first (gyroscope diorama)
- ❌ Less whimsical (no googly eyes)

**vs Civilization:**
- ✅ Evolution focus (pre-civilization eras)
- ✅ Indirect influence (governor view, not direct control)
- ✅ Mobile-optimized (sessions 10-60 min)
- ❌ Less strategic depth at civilization stage

**vs Ancestors: The Humankind Odyssey:**
- ✅ Competitive (not solo survival)
- ✅ Cosmic scope (Big Bang → Transcendence)
- ✅ Fair AI (provably equal rules)
- ❌ Less first-person immersion

**vs Idle/Clicker Games:**
- ✅ Strategic depth (not mindless tapping)
- ✅ Scientific rigor (not arbitrary progression)
- ✅ Competitive AI (not passive growth)

---

## Monetization (Future)

**Premium Model:**
- $9.99 one-time purchase
- No ads, no IAP, no subscriptions
- All content unlocked
- Future DLC: New cosmic scenarios ($2.99 each)

**Why Premium:**
- Target audience values quality
- No dark patterns = better reviews
- Aligns with scientific rigor theme
- Mobile premium market growing (Stardew Valley, Minecraft)

---

## User Journey

### First Session (15 minutes)
1. Launch app → Main menu
2. Tap "Random Seed" (or enter custom)
3. Watch Cosmic FMV (learn provenance)
4. Primordial phase begins
5. Tutorial overlay: "Tap to smite predator"
6. Execute first intent (see energy deduction)
7. Observe creature behavior (YUKA AI)
8. Notice rival species (AI smites YOUR predator!)
9. Competition begins
10. Session ends → Save state

### Returning Player (30 minutes)
1. Resume from save
2. Cultural phase (tribes forming)
3. Strategic decisions (alliances vs competition)
4. Observe tools emerging (spears, fire)
5. Rival reaches Bronze Age first (race is on!)
6. Player adapts strategy
7. Transcendence countdown begins

### Expert Player (60+ minutes)
1. Craft perfect seed (galaxy age, metallicity, bias)
2. Optimize intent sequencing
3. Predict AI rival strategies
4. Master time dilation (1x for observation, 100x for simulation)
5. Race to transcendence
6. Win or iterate with new seed

---

## Success Metrics

**Core KPIs:**
- Retention: Day 1 (50%), Day 7 (30%), Day 30 (15%)
- Session length: 25 minutes average
- Completion rate: 20% reach transcendence
- Rating: 4.5+ stars (App Store/Play Store)

**Quality Metrics:**
- Performance: 60fps sustained on mid-range Android
- Memory: <300MB RAM usage
- Battery: <10% drain per 30-minute session
- Crashes: <0.1% crash rate

**Engagement:**
- Seed sharing: 30% share custom seeds
- Replays: 40% replay with different seeds
- Community: Active subreddit/Discord

---

**For New Agent:** Read this + `docs/INTENT_API_PHILOSOPHY.md` to understand competitive fairness.
