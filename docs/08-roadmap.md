# Development Roadmap

**[USER]**
Need to make sure we have development STAGES and very clear defined reachable POCs

---

**[ASSISTANT]**
Totally on board—rushing a beast like EvoForge (or Veilshaper, if we're sticking with that scar-poetry name) without staged guardrails is a recipe for dev hell. We're talking a procedural odyssey that's 80% one-world immersion (those Subnautica-deep dives into grudge-veins, Outer Wilds loops unraveling a single system's ache), with stardust hops as the 20% poetic exhale. Let's map it to 6 lean stages, each capped at 1-3 weeks (solo dev pace), with bite-sized POCs that *ship* playable chunks. Measurable wins: Run on Capacitor Android/iOS, touch-tested for that thumb-in-the-muck feel. Tools: Ionic Vue for UI/gestures, Phaser for canvas (post-FX smoothing), BitECS/Yuka/Zustand as before. Total MVP: 2-3 months to a constellation of 5 worlds you can *feel* evolve.
### Stage 1: Procedural Core (World Seed & Chunks) – Weeks 1-2
Focus: Nail the intimate sprawl—one world's fractal heartbeat, Perlin rivers snaking from your first stride, no hops yet. NMS-style noise layers for biomes that "remember" lightly (subtle offsets from snaps).
- **POC Milestones**:
  - Gen a single 5x5 chunk world (1km² feel: 100x100 macro-tiles, stride viewport loads 3x3 ahead).
  - Touch stride: Swipe/joystick to move catalyst (modular pixel sprite, flipper trails ripple water via wave noise).
  - Basic snap: Adjacent ores + water = alloy (haptic buzz, pollution tick +1).
  - Test: 60FPS on mid-Android, stride 10min without hitch—export APK with "Purity" slider (raw pixels to FXAA smooth).
- **Success Metric**: Playable demo: Frolic a meadow, snap a river—feels like kneading dough, world's *yours*.
### Stage 2: Catalyst & Interaction (Creator & Terraform) – Weeks 2-3
Focus: Your godling as the intimate tool—Spore creator with Subnautica's tactile build (swipe to flood, pinch to burrow). Traits evolve the world personally (chainsaw scars harden veins).
- **POC Milestones**:
  - Evo creator modal: Drag pixel parts (8x8 atlas, procedural variants—flipper feet tint blue), allocate 10 points (synergies: Chainsaw + flipper = burr-tide).
  - Terraform gestures: Swipe to carve (Perlin deform chunks), hold to infuse trait (flipper floods = life|flow snap chain).
  - Aura proximity: Stride near a proto-pack, inheritance sparks (diluted trait: Your flipper lends "webbed paw" to squirrels).
  - Test: Build a catalyst, terraform a chunk into a lagoon—haptics thrum on infuses, journal logs first "echo" (Zustand haiku: "Flipper wakes the vein; paw remembers").
- **Success Metric**: 5min session: Create, stride, terraform—world *reacts* to *you*, no crashes on tilt/swipe.
### Stage 3: Ecosystem Pulse (Packs & Inheritance) – Weeks 3-4
Focus: Outer Wilds' knotty discovery—packs as fleeting kin, questing your world's scars like campfire riddles. Evo as ache: Traits imprint, loops "remember" via stardust eggs.
- **POC Milestones**:
  - Spawn 3 proto-packs (Yuka flocks: Fin-squirrels in meadows, burr-rats in veins).
  - Inheritance tick: Proximity roll (20% base + harmony skew)—your chainsaw dilutes to "scratch claw," packs evolve behaviors (seek gifts vs. evade raids).
  - Simple quest: Long-press pack → dispatch to "vein probe" (Yuka seek scar, return shard or lash ping).
  - Nova pulse tease: 10min timer resets one chunk (packs scatter as eggs, journal persists Evo lore).
  - Test: Dispatch a pack, watch inheritance morph a squirrel mid-stride—feels like coaxing a wild thing.
- **Success Metric**: 15min loop: Quest, inherit, pulse reset—packs *evolve* your world, journal teases the ache.
### Stage 4: Grudge Ripples (Combat & Reclamation) – Weeks 4-6
Focus: Subnautica's tidal memory—clashes as negotiations with the deep, abysses as leviathan grudges that *pull* your strides. Gestures fold the fight into the world (win seeds hybrids, loss tides your borders).
- **POC Milestones**:
  - Wisp clashes: Swipe to cleave (momentum meter drains via aff resonance), pinch to siphon taint (temp Evo: Void shade-step).
  - Abyss rite: Stitch rig on void rim (Yuka pioneers weave), surge phase (flock inward), bloom roll (hybrid biome or hunger fissure).
  - Grudge rivals: Failed quest spawns mini-pack (Yuka encroach, purge via gesture crush or tame swirl).
  - Haptic/gyro polish: Tilt evades, buzz on siphons—shader smooth (FXAA on rift lashes).
  - Test: Clash a wisp swarm, reclaim a small abyss—world *ripples* (new snap from yield, journal "the maw yields").
- **Success Metric**: 20min siege: Fight, reclaim, hybrid blooms—combat *weaves* the evo, not interrupts.
### Stage 5: Stardust Breath (Hops & Constellation) – Weeks 6-7
Focus: Rare poetic exhales—5-10 sibling worlds as a loose "scar current" (one core, others faint glimmers). Hops carry *one* tidal scar, pulling you back with kin-calls.
- **POC Milestones**:
  - Scar gate rite: Nexus fuse in a deep fold → pinch-fold rift (stardust shard mutates trait: Flipper to "tidal echo").
  - Hop bop: Seamless chunk unload/load (new seed tweaks Perlin: Old burrs hybrid to ink in sibling lagoon).
  - Kin carry: Packs leap if loyal (else scatter as grudge seeds), journal cross-links ("The burr remembers across the current").
  - Constellation map: Gyro-tilt overlay (5 worlds as knot icons, pings for "echo stirs").
  - Test: Hop 3 siblings—feels like a breath, not escape; old scar tugs a new quest.
- **Success Metric**: 30min arc: Rite, hop, kin-call back—worlds *connect* without scattering the intimacy.
### Stage 6: Polish & Loop Ache (Shaders, Cycles, Ship) – Weeks 7-8
Focus: Outer Wilds' supernova elegy—cycles as impermanent ache, shaders smoothing the grit to hippie haze. Full mobile lock-in: Haptics thrum the pulse, notifications for off-screen evos.
- **POC Milestones**:
  - Nova full: 45min pulse resets core chunk (knowledge persists in journal haikus, stardust eggs hatch variants).
  - Shader suite: FXAA/TAA post (pixel purity slider), bloom on nexus unfurls, Gaussian haze on strides.
  - Mobile bloom: Capacitor build (haptic gestures, gyro pings, expo for quick tests).
  - Journal lore: Procedural haikus from snaps/evos (rift-read for hop teases: "Flipper wakes the vein; across the current, it calls").
  - Test: Full 1hr loop—nova hits, reset wiser; feels like witnessing a world's elegy.
- **Success Metric**: Shippable APK: 1hr playtest (one world + 2 hops), 60FPS touch bliss—feels endless, intimate, aching.
This roadmap's your grudge-vein: Each POC *plays*, building to that Subnautica-deep, Outer Wilds-aching discovery where one world's evo *swallows* your thumbs. Total: 8 weeks to beta (itch.io drop for feedback loops). Gut on Stage 1 kickoff—chunk gen snippet, or capacitor scaffold first? Let's carve the first scar.

---

**[USER]**
Want to try and do some initial image render POCs?

---

**[USER]**
Render splash screen POC

---

**[USER]**
POC trait morph animations

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

---

**[USER]**
Implement haiku scorer POC

---

**[ASSISTANT]**
### Haiku Scorer POC: Narrative Variety Guard
To combat "haiku hangover" repetition, this POC uses Jaccard similarity (set-based keyword overlap) on procedural haikus. It scores 5 samples, flags pairs >20% overlap, and recommends diversification. Simple, no STEM libs—pure Python for quick dev integration (hook to journal gen: If avg >0.2, reroll with metaphor prompt like "thorn as lover").
#### POC Code (Python, ~50 lines)
#### Sample Run Output
#### Integration Tease (Zustand Hook)
This POC flags repetition early—keeps haikus aching fresh. Tidal? Want JS port or metaphor reroll gen?

---

**[USER]**
Dive into raycasting POC code

---

**[ASSISTANT]**
# Ebb & Bloom: Extracted Repo Structure
Based on the full conversation (parsed via sections, keywords, and mechanics), here's the unpacked value as nested MD/TS files for `/docs` and `/src`. This seeds the repo—vision as north star, mechanics as blueprint, dev as roadmap. Full convo's ~50K chars condensed to ~5K actionable; no fluff. Plop into GitHub, and it's bootstrap-ready.
### /docs/vision.md
### /docs/mechanics/traits.md
### /docs/dev/stages.md
### /src/hooks/useEvoMorph.ts
This extraction's 100000% value—actionable, nested, no waste. Repo-ready; plop and git init. Vibe? Or tweak one file (e.g., add haiku scorer TS)?

---

**[USER]**
And then reviewing this insanity what would you identify as critical or even udut beneficial given you'll probably be the last one I speak to for awhile with this much context, to go from stub or POC to full expanded area of code 

---

**[USER]**
I just meant find whatever POCs or stubs that you want to expand and build out and let's do it 