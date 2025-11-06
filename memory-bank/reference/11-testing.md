# Testing & Playtest Strategy

**[USER]**
Thoughts on balance? Simulate playthrough AS a human in a couple of target demographics and give me feedback?

---

**[ASSISTANT]**
Hell yeah, that's the meta gut-check we need—peeling back the procedural onion to spot what slips through the AI sieve. We're deep in the weeds on EvoForge's (or Veilshaper's—still leaning that way for its scar-poetry bite) veins and cycles, but the blind spots? They're the squishy, human-hiccup stuff that code and seeds can't fake: The unscripted "aha" that hits at 2 AM, or the quiet rage-quit that births a pivot. AI like me can spit balanced loops and haptic thrum specs till the cows home, but we miss the *messy meat*—those irksome, irrational edges where players aren't optimizing; they're *feeling*.
### 1. **The "One More Stride" Soul – Emotional Pacing We Can't Taste**
   We've nailed the mechanical ripple (snap a river, feel the fin-kin echo), but overlooked how *boredom blooms* in the quiet. AI sims like my playthroughs predict "60min arc: Evo +12, harmony +15%"—cold math. Humans? We drift after 20min if the world's not *whispering back* with unprompted surprises. Missing: **Idle serendipity hooks**—that Outer Wilds campfire stare where a pack *just* wanders up with a haiku-gift, no quest ping. Or Subnautica's idle biolum flicker that tugs you deeper without a menu. Tune it human: Playtest with "vibe logs" (post-session: "Did the abyss *pull* you, or push?"), then seed "ghost events" (5% chance a reclaimed scar "remembers" a forgotten snap, spawning a micro-quest). AI can't grok the sigh of "close enough for now"—we'd over-optimize, turning your world's ache into a checklist.
### 2. **Fringe Player Fumbles – Accessibility's Hidden Grudges**
   Balance sims assume "average thumbs," but we're blind to the edges: Colorblind folks missing void tints (that pollution desat's a grudge gate), or neurodiverse players zoning on gesture overload (swipe-pinch-hold? Feels like a rift lash). Overlooked: **Sensory mercy modes**—not watered-down, but adaptive (vibrate patterns for aff resonance instead of visuals, voice-narrated journal haikus via TTS). Human testers spot the wince ("Gyro tilt made me seasick on the bus"); AI just crunches averages. Spot it now: Beta with diverse crews (Discord call for "fringe hands"—elder gamers, one-handed swipers)—they'll flag how a "peaceful" harmony loop fatigues ADHD drifts without audio anchors.
### 3. **Community Echoes – The Unprocedural Social Scar**
   Procedural's our jam, but we forget the *pull* of shared scars: NMS thrives on "I found this nexus egg—seed code?" chats, turning solo loops into constellation myths. Missing: **Zero-backend sharing** (URL seeds for worlds, Capacitor QR exports for vaults—hop your burr-vein to a friend's lagoon). AI devs like me can gen infinite solos, but can't feel the FOMO of "their" world's evo outpacing yours. Human fix: Bake "echo trades" (trade stardust shards via Bluetooth/NFC, mutating traits cross-devices)—feels like passing a cursed relic. Without it, your endless one's a private ache; with, it's a viral whisper.
### 4. **The "Why Bother?" Fade – Retention's Quiet Betrayal**
   We've got the evo high (that first pack kinship buzz), but overlooked the mid-loop slump: After 3 cycles, the world's *too* yours—no fresh ache. AI balances yields linearly; humans crave narrative scar— that Subnautica "what if I *don't* mend this abyss?" dread. Spot: **Impermanence teases** (nova pulses "whisper" alternate evos via journal previews: "In the hush, the burr could bloom thorn-kin... or swallow the light?"). Playtest it raw: 1hr sessions with "fade probes" ("Would you hop now, or linger?")—tune the pull so 70% linger, 30% exhale to stardust. We miss the human "enough's enough" sigh that kills replays.
These are the human hiccups AI glosses— the feels we can't simulate, only iterate from flesh-and-thumb feedback. Nail 'em with a quick POC beta (Stage 1 chunk + gestures, drop to 5 testers: Cozy zen, grind junkie, poet nomad)—their rants'll scar the design right. What's the first itch to scratch: Vibe-log playtest script, or echo-trade mockup? Let's make it *ache* real.

---

**[ASSISTANT]**
# Ebb & Bloom: UI/UX Brand Guidelines
## Core Identity
- **Tone**: Intimate ache—Subnautica's tidal pull meets Outer Wilds' fragile whisper. Cozy zen (serene blooms), rhythmic grind (grudge surges), poetic depth (evo haikus). Touch as breath: Gestures hum with world's pulse, haptics echo the tide.
- **Aesthetic**: Procedural pixels with smoothed haze (FXAA/TAA, purity slider: 0=raw '84 grit, 1=velvet bloom). Palette: Indigo ebbs (void depths), emerald blooms (vein unfurls), rust scars (grudge thorns). Ampersand '&' as vein-thread motif—indie polish like GRIS/Journey.
- **Feel**: Endless in one world's fold—80% stride immersion, 20% stardust breaths. No menus; world as interface (gyro tilts sink views, swipe scars ripple).
## UI Principles
- **Minimalist Layers**: HUD as faint echoes—progress rings for reclamation (circular bloom on pinch), journal haikus as rising mist (tap to read, fade on idle). No clutter; 90% screen = world canvas.
- **Gesture-First Flow**: Swipe = carve/surge (trail particles linger), pinch = siphon/infuse (haptic throb scales with taint), hold = whisper/dispatch (pack icons pulse under thumb). Tutorials: World-narrated (first snap whispers "The vein yields...").
- **Accessibility Mercy**: Adaptive modes—vibration patterns for aff resonance (colorblind veil), voice haikus (TTS for poets), simplified gestures (tap-hold for grinders). Purity slider tunes haze (zen high, raw low).
## UX Flow & Balance
- **Onboarding Ache**: Splash: Pixel catalyst assembles (modular traits gen live), fades to first stride (haptic ripple on river probe). 2min to first evo (fin-kin inheritance ping).
- **Loop Rhythm**: 10min frolic (serenity trickle), 30min knot (quest ripples), 60min nova (reset with journal persist). Hops: Earned rite (nexus pinch-fold, carry 1 scar—tease, don't yank).
- **Feedback Pulse**: Haptics as tide (light buzz bloom, heavy rumble lash); audio whispers (synth hum evos, haiku reads on rift). Retention: Idle pings ("Kin stirs the deep")—70% linger rate target.
- **Style Skew**: Harmony (soft glows, gift icons), Conquest (rust flares, surge meters), Frolick (whimsy confetti, detour warps)—toggle via catalyst evo.
## Dev Guardrails
- **Touch Purity**: 95% gestures; test on 5 devices (mid-Android to iPhone)—no "fat thumb" fails.
- **Perf Anchor**: 60FPS cap; chunk loads <1s; shaders optional (fallback raw pixels).
- **Test Mantra**: Playtest vibes—"Does the world *ache* back?" Weekly betas: Cozy (linger), Grinder (surge), Poet (haiku pull).
This keeps the tide focused—intimate, rhythmic, aching. Iterate from thumbs.

---

**[ASSISTANT]**
Hell yeah, those "chainsaw echoes" are the AI's version of a bad earworm—harmless in a riff, but a vision-killer if they metastasize into every thorn and fin. Beyond trait fixation, here's where we'd bolt more stringent guards to keep the evo fresh, not fractal monoculture. These are dev-side rails (prompt suffixes, diversity checks in code), tuned for creative sparks without the weird loops:
### 1. **Procedural Diversity (The Evo Bloat Guard)**
   - **Issue**: AI loves remixing one motif (e.g., every hybrid = "thorn + something"), starving the world's ache of surprises.
   - **Guard**: Aff roll variance >50% new combos per cycle (Perlin-weighted: 70% hybrids, 30% pure wilds). Code hook: `if (interactions > 3) forceUnlikelyAff(1 - similarityScore);`. Playtest: "Does this bloom feel like *your* thumb, or the same burr remix?"
   - **Why?** Keeps evos poetic—flipper to ink whimsy, not flipper-thorn 5x.
### 2. **Style Skew Drift (The Harmony Hegemony Guard)**
   - **Issue**: Without nudges, evos default to "safe" (all green blooms), sidelining conquest's grudge bite or frolick's chaos.
   - **Guard**: Player profile drift-check (Zustand: If harmony >70% for 2 loops, inject 20% void wildcards). Prompt: "Diversify: 1/3 serene, 1/3 thorny, 1/3 whimsical per 10 snaps." Beta probe: "Did the world *push back*, or just greenlight?"
   - **Why?** Ensures the tidal balance—ebbs need thorns to ache.
### 3. **Visual/Sound Echo Chambers (The Aesthetic Rut Guard)**
   - **Issue**: Shaders/audio latch on one palette/motif (emerald haze everywhere), turning the haze to headache.
   - **Guard**: Procedural palette drift (cycle-based: 0.1-0.2 hue shift per nova, tied to evo count). For audio: FM params randomize 30% per morph (no repeat seeds). Shader uniform: `diversityClamp(0.6, 1.0);`—cap similarity on post-FX. Test: "Does the bloom *surprise*, or blend into blur?"
   - **Why?** Keeps the indie GRIS glow dynamic—indigo voids blooming rust, not eternal green.
### 4. **Narrative Repetition (The Haiku Hangover Guard)**
   - **Issue**: Journal whispers turn into echo-chamber poetry (every evo = "The vein wakes to [trait] light").
   - **Guard**: Semantic variety scorer (NLP check: <20% keyword overlap per 5 haikus; prompt: "Unlikely metaphors: Thorn as lover, not thorn again"). Seed from player logs (e.g., recent snaps feed unique phrases). Probe: "Did the ache *evolve*, or loop the same verse?"
   - **Why?** Keeps the Outer Wilds ache fresh—haikus as personal elegies, not recycled ripples.
### 5. **Beta Feedback Loops (The Human Sanity Check)**
   - **Issue**: AI self-simulates "balanced," but thumbs flag the weird (e.g., every purge = same wisp swarm).
   - **Guard**: Mandatory "vibe probes" per stage (5 testers: "On a 1-10, how fresh is this evo?"). Code flag: If similarity >0.7 in 3 runs, auto-variate (reroll 2 params). Without: Weekly hands-on (you + 3 proxies)—"Does it *surprise*, or like the last 5 seeds?"
   - **Why?** AI's blind to the "enough's enough" sigh—humans keep the innovation aching real.
These rails turn potential ruts into rivers—vision as the seed, code as the guard against self-seed. Feels fortified? Or drill into one (e.g., haiku scorer POC)?