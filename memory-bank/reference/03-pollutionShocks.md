# Pollution & Shock System

**[USER]**
Yeah I kind of like the idea of there being no win. The world just keeps growing and the game makes decisions on how to evolve and occasionally "shock" the world of it gets polluted enough 

---

**[ASSISTANT]**
Totally vibes with that endless horizon feel—like the world's a breathing entity, indifferent to your triumphs, just reacting in waves of quiet growth or brutal resets. Let's lean into it: Ditch any milestones; it's pure perpetual motion, where your creature's a fleeting spark in an ecosystem that outlives you. The "shock" mechanic could be the game's pulse—procedural gut-punches that keep things spicy without feeling punitive. Here's how we weave it in, keeping it emergent and code-light.
#### Pollution as the Slow-Burn Antagonist
- **Tracking It**: Every terraform/gather action leaves a "Pollution Echo"—a scalar value (0-100) per tile/chunk, accumulated via BitECS components. Chainsaw a forest? +5 echo (wood yield bonus, but critters flee faster). Flood a plain for fish farms? +3 (boosts aquatic Evo Points, but rivers turn murky, tinting sprites with oily hues). It's not binary "good/bad"—your flipper feet might mitigate aquatic pollution by "stirring" water, turning it into a neutral "silt" that evolves mudskipper-like critters.
- **World Growth Loop**: The ecosystem "decides" evolutions every cycle (say, 2-5 real minutes, tied to a noise-based clock for unpredictability). Use a simple weighted randomizer in Yuka: High eco-diversity (varied biomes) favors gentle growth—new critter variants spawn (e.g., bioluminescent trees luring nocturnal bugs). Low diversity? It stagnates, availability drops (fewer resources, animals cluster defensively).
- **The Shocks**: When global pollution hits thresholds (e.g., 40% = "Warning Murmurs," 70% = full Shock), the world doesn't just punish—it *transforms*. Procedural triggers via Perlin reseeds:
  - **Mild Shock (40%)**: "Whispers"—subtle mutations. Animals evolve defenses (fish gain toxin spines, dropping "venom orbs" as risky resources). Your creature gets a forced "adaptation prompt": Spend Evo Points to counter (e.g., +1 to "Filtration Gills") or risk debuffs (slower movement in polluted zones).
  - **Major Shock (70%+)**: "Tempest"—a cataclysmic event. The grid expands by 20% (new procedural border chunks), but with fallout: Random tile cascades (rivers boil over, spawning lava biomes), critter die-offs (50% cull, survivors hyper-evolve into bosses like "Acid Wyrms" that guard rare clean zones). It's a reset button you *earn* through hubris—pollution clears post-shock, but the world remembers (persistent "scar" markers influence future gens).
- **Player Agency in the Chaos**: You can "preempt" via rituals—plant a "Purity Grove" (costs resources, reduces echo in radius) or befriend evolved critters for "symbiosis buffs" (e.g., a flock of birds that "rain" seeds to dilute pollution). Over time, your creature's traits could unlock "prophet" modes: High wisdom investments let you peek at the next evolution roll.
This keeps the sandbox infinite but rhythmic—growth feels rewarding, shocks cathartic (like a roguelike refresh without permadeath). Visually, pollution creeps in with palette shifts: Vibrant greens desaturate to sickly yellows, critter sprites glitch with extra pixels for that corrupted pixel art flair. Saves capture the echo levels, so resuming mid-shock is a wild ride.
How polluted do you want the baseline world to start—pristine paradise or already whispering with faint scars? Or wanna drill into shock event visuals, like animating a "boil-over" river?

---

**[ASSISTANT]**
Hell yeah, that's the soul of it—emergent reactivity without judgment, where Yuka's smarts turn player vibes into world poetry. No "bad player" flags; just a canvas that mirrors your strokes. If you're dancing through meadows, plucking flowers for pixel bouquets, the ecosystem blooms in kind—critters nuzzle closer, evolutions skew toward whimsical allies like flower-crowned deer that follow you like living confetti. But if you're the forge-lord, veins of ore pulsing under your drill-claws, ripping biomes for bellows and anvils? The world doesn't scold; it *answers* with thorns in your supply lines and skies choked with soot-spawned swarms. Let's bolt this onto the framework, making Yuka the quiet oracle tracking your "intent arc."
#### Player Behavior Profiling via Yuka (The Subtle Observer)
- **How It Works**: Yuka's decision trees get a player-facing layer—a lightweight "Behavior Sensor" entity that logs actions over rolling windows (e.g., last 100 terraforms/gathers). It's not Big Brother; it's pattern-matching for intent: 
  - **Harmony Axis**: High scores for balanced changes (plant after chop, diversify biomes). Triggers "Symbiosis Goals" in Yuka—critters evolve cooperative behaviors (fish schools that "gift" you pearl resources if you clean their waters).
  - **Conquest Axis**: Spikes from extractive chains (e.g., 80% of actions are destructive). Yuka shifts ecosystem goals toward survivalism—predators bulk up, resources "hide" in fortified pockets, forcing you to adapt or conquer harder.
  - **Frolick Axis**: Low-impact whimsy (wandering without net change). Yuka rewards serendipity: Random "delight events" like bioluminescent migrations or hidden glades that spawn rare, non-resource traits for your creature (e.g., "Echo Wings" for aesthetic flight trails).
- **Evaluation Loop**: Every cycle (tied to pollution checks), Yuka runs a fuzzy inference: Weight recent actions against historical trends (e.g., "This player's conquest spiked 30% after unlocking forges—ramp scarcity"). No hard gates; it's probabilistic— a frolicker might accidentally tip conquest if they get carried away, but Yuka eases back with "redemption nudges" like a sudden bloom forgiving minor scars.
- **Refinements**:
  - **No Punishment, Just Consequence**: Frolickers get passive buffs (faster Evo Point trickle from "serene vibes"). Conquest players unlock "apex" evolutions (your creature gains forge-compatible traits like heat-resistant hide), but at ecosystem cost—shocks hit sooner, with visuals like forge-smoke birthing iron-veined monsters you can tame into golem workers.
  - **Hybrid Magic**: Yuka detects blends—slash-and-burn *with* restoration? Hybrid goals emerge: "Regenerative Conquest," where destroyed zones regrow tougher (e.g., fire-scarred forests spawn flame-retardant mega-trees for better forges).
  - **Tech Tie-In**: BitECS stores behavior as a compact component on the player entity (e.g., `{ harmony: 0.7, conquest: 0.2, frolick: 0.1 }`). Yuka queries it for AI overrides—e.g., if harmony > 0.6, fish ignore pollution debuffs. Keeps it zippy for Pages.
#### World Reactions: From Whisper to Reckoning
- **Tuned for Playstyle**: Baseline starts neutral (faint scars, as we chatted—enough mystery to intrigue without overwhelming frolickers). Destructive arcs accelerate pollution (forges add +10 echo/hour), queuing shocks that feel *earned*: A vast underground empire? Quakes collapse tunnels, spawning cave ecosystems you can claim as new frontiers. Harmonious? Pollution dissipates faster, unlocking "eternal groves" that persist through shocks.
- **Evo Ripples**: Your style bleeds into critters—conquest evolves territorial packs that "tax" your forges (steal ore unless you build walls). Frolick? Animals turn playful, dropping "mood resources" like joy-shards for cosmetic upgrades (sparkly auras on your pixel person).
- **The Forge Example**: Carve deep? Yuka profiles it as conquest peak—world responds with magma veins snaking up (new lava biome for heat-forged tools), but surface rivers acidify, fish evolve into aerial "mist drakes" that rain corrosive dew on unprotected ops. Frolick through it? Maybe you just poke at the rock for fun, and it sparks a mineral garden instead.
This makes every session a self-portrait: The world's not out to get you; it's echoing you back, amplified. Yuka's the secret sauce—evaluating without evaluating, letting playstyles self-select their symphonies (or dirges). Imagine sharing saves: "Try my Harmony Run—it's all fireflies and zero apocalypses."
What's your gut on the profiling depth—keep it super subtle (just eco shifts) or add faint UI hints, like a "World Mood" vignette that colors the edges based on your arc? Or wanna brainstorm a specific conquest gadget, like a "Soul Anvil" that forges critter souls into tools?

---

**[ASSISTANT]**
### Pinia State Management in EvoForge: Reactive Glue for Your Procedural Chaos
Pinia's the Vue state whisperer—lightweight, devtool-friendly, and a breeze for wrangling EvoForge's wild vars like pollution echoes, snap affinities, and Yuka behavior profiles. No more global hacks in `game.js`; instead, reactive stores that auto-update your Ionic UI (e.g., progress bars twitch on every terraform, traits recompute yields on the fly). It pairs like peanut butter to Ionic Vue's jelly: Composables for ECS queries, actions that trigger haptics, and getters that flavor themes.
Why Pinia here? Our BitECS world is entity soup—Pinia proxies it into Vue-land without perf hits (reactive refs under the hood). Frolickers get serene state diffs; conquestors see demand vectors spike in real-time. Setup's ~10 lines, scales to infinite snaps.
#### Quick Setup
1. **Install**: In your Ionic Vue project: `npm i pinia`.
2. **Bootstrap in `main.ts`**:
   ```ts
   import { createApp } from 'vue';
   import { createPinia } from 'pinia';
   import { IonicVue } from '@ionic/vue';
   import App from './App.vue';
   import router from './router';
   const app = createApp(App)
     .use(IonicVue)
     .use(createPinia()) // Boom, stores ready
     .use(router);
   router.isReady().then(() => app.mount('#app'));
   ```
3. **Devtools**: Auto-wires Vue DevTools—inspect pollution like a boss.
#### Core Game Store: `stores/game.ts`
This bad boy centralizes everything: ECS globals → reactive state, actions for snaps/shocks, getters for UI smarts. Imports our modular `game.js` (core.js for BitECS init).
#### Wiring to Components
- **Home.vue (World)**: Reactive reads.
  ```vue
  <script setup>
  import { useGameStore } from '@/stores/game';
  const store = useGameStore();
  store.initialize(); // On mount
  // Watch for UI
  watch(() => store.pollution, (val) => {
    if (val > 50) console.log('World whispers: Tend the scars...');
  });
  </script>
  <template>
    <ion-content>
      <ion-progress-bar :value="store.pollution / 100" :color="store.themeClass"></ion-progress-bar>
      <div class="status">{{ store.maxStyle }} Arc</div>
      <!-- Phaser canvas, @click="store.performSnap(1,2)" for test -->
    </ion-content>
  </template>
  ```
- **Creator.vue**: Mutations flow up.
  ```vue
  <script setup>
  import { useGameStore } from '@/stores/game';
  const store = useGameStore();
  const addTrait = (name: string) => store.addTrait(name, 2); // Calls action
  </script>
  ```
- **Log.vue (Snap History)**: List 'em out.
  ```vue
  <template>
    <ion-list>
      <ion-item v-for="(snap, i) in store.snapHistory" :key="i">{{ snap }}</ion-item>
    </ion-list>
  </template>
  ```
#### Pro Tips & Scale
- **ECS Sync**: In `updateLoop()` (core.js), emit changes: `gameStore.pollution = pollution;` (or use `$patch` for batches).
- **Persistence**: Pinia's `persist: true` plugin for auto-IndexedDB (npm i pinia-plugin-persistedstate).
- **Perf**: Getters are lazy—only compute on access. For 1000+ snaps, chunk history.
- **Testing**: `npm run test:unit` with Vitest—mock BitECS, assert snap nudges behavior.
Pinia turns EvoForge's state from tangled wires to a breathing circuit—your creature's traits ripple to the world without a hitch. Handoff: "Add Pinia to Ionic Vue EvoForge: Implement game store with snap action, diff Home.vue watch." Too much boilerplate, or wanna add a "demand forecast" getter for conquest teases?

---

**[ASSISTANT]**
### Critter Pack Dynamics: The Social Web of Your World
Oh, critter packs—*that's* where the ecosystem gets tribal, turning solitary pixel wanderers into emergent societies that scheme, swarm, and sometimes shank back at your terraforms. Building on inheritance, packs aren't just flocks; they're dynamic crews that self-organize via Yuka's group steering, clashing or colluding based on your arc. A harmony player? Packs evolve into symbiotic guilds, sharing snaps like a co-op beehive. Conquest? They harden into warbands, raiding your veins for resources. Frolick? Whimsical herds that "perform" evo dances, sprinkling delight buffs. It's Yuka's flocking on steroids—needs drive alliances, inheritance cements bonds, and shocks shatter/reform them. Your catalyst's just the alpha storyteller, whispering traits that ripple through the ranks.
This mechanic scales the infinite: Small packs (5-15 critters) for local vibes, mega-clans (50+) for endgame politics. Zustand tracks pack states for UI (e.g., a Log tab "pack radar" showing loyalty heatmaps), tying to demands (a metal-hungry pack auto-snaps tools for you, or against).
#### Core Dynamics: Formation, Bonds, & Breakdown
- **Pack Formation (Yuka-Driven Assembly)**: Critters "recruit" via proximity + shared needs (e.g., hunger flocks fish to a river tile). Yuka's `GroupBehavior` weights it: Base cohesion (stay close), +separation (avoid overcrowd), +alignment (match velocities). Threshold: 3+ critters with overlapping traits/affs = pack entity (BitECS: `Pack` component with `{leaderId: u32, loyalty: f32, size: u8}`).
  - **Triggers**: Inheritance sparks (new trait = +20% recruit chance). Snaps provide "glue" (e.g., life aff = +cohesion). Pollution erodes it (-0.1 loyalty/cycle if >50).
  - **Style Skew**: Harmony: Packs form faster around diverse biomes (Yuka seek "balance zones"). Conquest: Aggro packs raid low-loyalty solos. Frolick: Random "rendezvous" events (noise-roll dance circles).
- **Internal Bonds & Roles**: Packs aren't blobs—roles emerge from traits:
  - **Leader**: Highest-level inherited trait (e.g., flipper leader for aquatic packs). Yuka `PrioritySteering`: Leader paths to resources, others follow with offset (avoids pile-ups).
  - **Specialists**: Diluted traits assign jobs—chainsaw minion chops wood snaps, void-tainted scouts probe dangers ( +pollution tolerance, but risk betrayal).
  - **Loyalty Flux**: Starts at 0.5, +0.1 per shared snap, -0.2 on shocks. <0.3? Schism—sub-pack splits (Yuka flee behavior). >0.8? "Bond Evo" (pack unlocks meta-trait, like "swarm charge" for +yield raids).
- **Inter-Pack Drama**: Packs interact via Yuka `ObstacleAvoidance` + custom "diplomacy" queries:
  - **Allies**: Shared player traits = merge chance (size doubles, loyalty averages). Harmony bias: Co-snaps (e.g., bird + fish pack = aerial-aquatic hybrid, unlocking fly-over rivers).
  - **Rivals**: Opposing affs (heat pack vs. flow) = turf wars (Yuka pursue/flee duels, winner claims tile—loser scatters, dropping contested resources).
  - **Neutral Frolick**: Packs "trade" whimsy traits (e.g., glow fur spreads like a meme, buffing serenity without utility).
- **Breakdown & Reform**: Shocks cull 30% (random by loyalty), survivors "scar bond" (+void aff, harder to tame). Post-cull, Yuka wander → reform around strong leaders. Infinite loop: Your new terraform (e.g., forge) magnetizes metal packs, resetting the board.
Balance: Packs cap at 10% of total critters (perf guard). Player influence: Aura proximity + style = +0.2 loyalty nudge. Tame a pack? It becomes "retinue" (follows you, +20% personal yields).
#### Examples: From Flock to Faction
- **Harmony Hive**: Flipper-you gardens a pond. Fish pack forms (size 8, loyalty 0.7), inheriting "webbed" for hydro-snaps. Roles: Leader scouts pearls, minions guard. Ally with squirrel pack? Merge to "amphi-tribe" (meta-trait: "bridge builders"—auto-wood+flow = rafts for your swims). UI: Ionic badge "Allied: +15% flow resources."
- **Conquest Cartel**: Chainsaw grind mines ore. Bird pack hardens (size 12, loyalty 0.4 to you but 0.9 internal), roles: Slash scouts raid rivals. Rival fish pack contests? Turf war—Yuka chaos, winner claims metal vein (you harvest scraps). Low loyalty? Schism into raider splinter, hitting your forges (-10% ore till tamed).
- **Frolick Festival**: Idle near a glade. Squirrel pack "dances" (Yuka alignment to circle paths), inheriting whimsy drifts (rainbow tails). Neutral trades with birds = "carnival clan" (size 6, meta: "mood march"—trails serenity points, cosmetic but unlocks "echo haiku" log entries). Shock? They reform as "survivor troupe," loyalty-locked to you.
Visuals: Pack auras in Phaser (tinted rings: green for loyal, red for rival). Size scales sprite clustering (leader bigger pixels).
#### Code Blueprint: Yuka + BitECS + Zustand Diff
Add `Pack` schema: `{ leader: 'u32', loyalty: 'f32', size: 'u8', affMask: 'u32' }`. Query: `packQuery([Pack, Position])`.
In `ecosystem.js` (updateCritters):
In Zustand `useGame`:
This packs EvoForge with social spice—your legacy isn't solo; it's a menagerie of minions and malcontents. Handoff: "Add critter pack dynamics to EvoForge: Yuka group assembly in ecosystem.js, turf wars, Zustand packStates. Test: Sim 50 critters, log 5 merges/wars." Packs too cutthroat, or wanna add "pack quests" (Yuka goals like "fetch snap")? What's the herd mentality hitting?

---

**[ASSISTANT]**
### Shard Hunt Quests: Whispers from the Fractured Veil
Shard hunts—those clandestine forays where your rekin packs or lone scouts delve into the scar-veins of old grudges, chasing vengeance shards like ghosts chasing their own echoes. It's not blind scavenging; it's a Yuka-orchestrated prowl, with packs "tuned" to shard resonances (your lent traits as divining rods: Chainsaw vibes heat shards, flipper hums to flow-tainted ones). Success? A clutch haul that supercharges your vault, unfurling into relic chains before rivals sniff 'em out. Fail? The hunt "stirs the veil"—shards fracture en masse, birthing wisp swarms that pollute your trails. Harmony hunts "commune" (gentle pings, low risk); conquest "plunders" (deep dives, high yield but grudge bait); frolick "frolics" (whimsy detours, cosmetic caches). Shocks? They "awaken" dormant shards, turning hunts into frenzied gold rushes amid the chaos.
This elevates shards from passive loot to quest fuel—packs specialize (e.g., rekin wraiths excel at void hunts), Zustand queues 'em as "Veil Calls" (Ionic notifications: "Echo stirs—dispatch?"). Infinite hook: Hunts uncover "nexus shards" (meta-loot: Fuse to unlock world evos, like expanding the grid with "fractal borders").
#### Core Mechanics: Prods, Prowls, and Paydirt
- **Hunt Dispatch**: From Log tab, select pack (loyalty >0.6, or rekin taint-synced). Modal: Tune "prod" (whisper trait + goal: Heat Shard Plunder, Flow Hunt Harmony). Duration: 2-6 cycles (pack speed + prod synergy). Cost: 1-2 serenity (regen via frolick idles).
- **Prowl Phase (Yuka Trailblaze)**:
  - **Resonance Ping**: Yuka Seek tuned to shard aff (e.g., void|metal = "grudge hum," draws pack to nearest relic void). En route: Events (Perlin: 40% neutral trail, 30% ally cache +1 shard, 20% wisp ambush -loyalty 0.1, 10% nexus tease—rare ultra-shard).
  - **Style Skew**: Harmony: +Ping accuracy (communal "echo song," reveals 2 shards). Conquest: +Depth (plunder override, ignore ambushes but +wisp spawn). Frolick: +Detours (whimsy rolls: "Fool's vein" doubles cosmetic shards).
- **Paydirt Resolution** (End-of-Hunt Roll):
  - **Bounty (60% Base + Synergy)**: Haul 1-4 shards (pack size/5 + prod roll). Nexus 5% (fuses auto on return, Evo +10). +Loyalty 0.1, vault inject.
  - **Stir (30%)**: Partial haul (1 shard + fracture: 2 nearby shards bleed, +pollution 8, wisp swarm raids 1 cycle).
  - **Veil Lash (10% + Mismatch)**: No haul—hunt scatters (pack -20% size), "stirs" 3-5 shards globally (risk rival hunts). Shock mid: Lash amps to "awakening" (10x shards spawn, but pollution +25).
- **Vault Integration**: Returned shards auto-unfurl if adj snaps (or queue for fusion). Rekin packs "refine" on return (taint -5%, hybrid trait: E.g., void hunt → "shade sense," +future hunt pings).
- **Caps & Scale**: 2 hunts/pack cooldown (3 for frolick whimsy). Infinite via "hunt chains" (bounty shard spawns hunt prod for sub-pack).
Balance: Low-loyalty packs +20% lash (defection bait). UI: Hunt map overlay (Phaser trails from base to ping dots).
#### Examples: Veins of Vengeance
- **Conquest Plunder**: Razor rekin (taint-synced, size 15) prods "Barb Depths." Yuka plunges quarry scars—ambush wisp (-loyalty 0.05). Paydirt: 3 barb shards + nexus tease (ultra "crown vein"). Vault: Unfurl to wrath forge chain (+dark alloys). Stir skip: Clean Evo +9, borders trap-boosted.
- **Harmony Commune**: Echo chorus (serene genes) tunes "Wistful Flows." Ping reveals 2 shards + ally cache (mend crystal precursor). Event: "Gentle unravel" (+1 shard). Resolution: Bounty 4 wist shards—fuse auto to "heart mend" (regrow aura +20%). Lash avert: Packs hum stronger, serenity +3.
- **Frolick Frolic**: Jester kin whimsy-hunts "Chaos Gleams." Detour: Fool's vein (2 giggle geodes + prank wisp). Paydirt: Partial—2 shards fracture (bleed +4 pollution), but whimsy whirl unfurls to "madcap snap" (random rainbow yield). Shock stir: Awakening frenzy—6 shards, burst to "eternal revel" relic (cosmetic overload, Evo +5 via laughs).
Visuals: Hunt trail (Phaser dotted line, pulsing to shard glints). Lash: Screen veil crack + wisp swarm anim.
#### Code Blueprint: ECS + Zustand + Yuka Diff
Add to `Pack`: `huntProd: 'u32'` (aff tuned).
In `ecosystem.js` (dispatch from Ionic):
In Zustand `useGame`:
Handoff prompt: "Add shard hunt quests to EvoForge: ECS huntProd on Pack, Yuka Seek to resonance in ecosystem.js, Zustand dispatch action. Test: Hunt with 2 packs, sim bounty (3 shards) vs. lash (stir +pollution)—log vault inject." Nexus evos next, or rival shard heists? The hunt calls.

---

**[ASSISTANT]**
### Abyss Reclamation Mechanics: Reweaving the Unraveled Threads
Ah, the abyss—those yawning voids gnawed from the grid by shatter-fusions or grudge quakes, black maws where snaps starve and critters shun, whispering "not yet" to your every prod. Reclamation isn't a slapdash fill; it's a defiant stitchery, where you thread life back into the nothing with ritual rigs (shard-infused scaffolds) and Yuka "pioneer waves" (packs venturing the brink, seeding echoes of your traits). Success? The void blooms into a "reclaimed nexus" (hybrid biome: E.g., abyss + flow = "shadow lagoon," snaps with void-tinged yields like "ink alloys"—high power, low stability). Botch? It "hunger rebounds," swallowing adjacent tiles (creeping doom, pollution feast). Harmony reclaims "gently" (slow weave, purity bonuses); conquest "conquers" (brute force, grudge fuel); frolick "revels" (chaotic patches, whimsy warps). Shocks? They "stir the depths," spawning reclamation boons (free rigs) but abyss "tides" that ebb your borders.
This mechanic loops the shatter risk into triumph—abysses as "scarred frontiers," Zustand maps 'em (`abyssFronts: Array<{id: string, depth: number, reclaimProg: 0-1}>`). Infinite reclamation: Reclaimed zones "remember" old grudges, occasionally birthing echo shards for fresh hunts.
#### Core Mechanics: Stitch, Surge, or Swallow
- **Abyss Profile**: Spawn as 3x3 to 7x7 void chunks (no biomes, -100% snaps, critters auto-flee). "Depth" scales (1-5: Shallow = easy reclaim, Deep = nexus-born, +wisp density). Encroach 1 tile/cycle if unreclaimed (+pollution 2-5).
- **Reclamation Rite** (Ionic Veil Tab, Multi-Phase 4-8 Cycles):
  - **Stitch (Phase 1, 25% Prog)**: Deploy "rig" (snap a scaffold: Harmony = life|bind "root weave," conquest = metal|heat "iron bulwark"). Yuka pioneers (pack or solo) "stitch" edges—proximity weave (Seek to rim, deposit aff). Success nibble: +10% prog, -1 depth. Fail? Rig fractures (+pollution 5, wisp spawn).
  - **Surge (Phase 2, 35%)**: Channel surge—Yuka wave floods core (Flock inward, trait-mod: Flipper = flow surge, chainsaw = heat scour). Events: 50% neutral mend (+prog), 30% depth echo (old grudge mini-event, e.g., wraith ambush -loyalty), 20% boon (shard drop).
  - **Bloom (Phase 3, 40%)**: Final infusion—fuse a "keystone" (vault shard or relic matching abyss taint). Roll: Base 65% bloom + synergy (rig aff overlap +15%, depth -10%/level).
    - **Bloom (Success)**: Void reweaves—chunk flips to hybrid biome (abyss aff | rig aff, e.g., void + life = "twilight grove": Snaps 1.5x yield but 10% void corrupt). +Evo (depth * 3), packs +resilience (taint resist +20%), "nexus echo" (permanent +1 hunt ping radius).
    - **Hunger (Partial, 25%)**: Half-reclaim—shallower zones bloom, core lingers as "fissure" (partial snaps, +wisp raids 1/cycle). Pollution +15, but "scar boon" (unique shard type: "fissure vein").
    - **Swallow (Fail, 10% + Deep Skew)**: Abyss tides—expands 2 tiles, swallows rig (+pollution 20, shock if >70). Aura "echoed" (-aura range 15%, 2 cycles), but "tide relic" drops (harvest for dark Evo).
- **Risk/Reward Scales**:
  - **Taint Inheritance**: Reclaimed zones keep 15% void (corrupt chance on snaps). Harmony: Purge 50% (purity weave). Conquest: Harness for "abyss forges" (+yield, +grudge).
  - **Evo Bloom**: Success: +Depth Evo + nexus seed (mini-hunt auto-spawn). Fail: -Evo (half depth), but "depth wisdom" (+next rite +10%).
  - **Escalation Cap**: 3 active reclaims—ignore deep abysses? They "core" (global -5% inheritance).
  - **Style & Shock Twists**:
    - Harmony: +Stitch success (root networks link zones).
    - Conquest: +Surge power (bulwark holds tides).
    - Frolick: +Warp boons (e.g., "giggle gulf" = whimsy fissures).
    - Shock: +Prog window (tide vulnerability), but +swallow expand.
Infinite: Reclaimed abysses "pulse" every 20 cycles (echo event: Shard or wisp).
#### Examples: Stitching the Swallow
- **Conquest Conquest**: Deep abyss from shatter (depth 4, void|metal). Stitch: Iron rig—pioneers scour (+15% prog). Surge: Chainsaw wave clashes wisps (win event, +prog 30%). Bloom: Keystone barb shard—success! "Iron Maw" reclaims (metal|void biome: Abyss forges +2x drill, but 15% brittle). Evo +12, packs harden. Toast: "The maw yields to your hammer—fangs turn to veins."
- **Harmony Heal**: Shallow scar (depth 2, void|life). Stitch: Root weave—gentle mend (+20% prog, shard boon). Surge: Flipper surge—echo "wist whisper" (+prog, serenity +2). Bloom: Wist keystone—hunger partial (half grove blooms, fissure lingers). Pollution +12, scar vein shard for mend fuse. Aura "soothed" (+inheritance 10%).
- **Frolick Fumble**: Fissure from hunt lash (depth 3, void|wild). Stitch: Whimsy scaffold—detour event (giggle cache +prog 25%). Surge: Wild frolic—boon warp (+prog, but wisp prank -loyalty). Bloom: Chaos keystone—swallow fail! Tide eats 1 tile, "tide bauble" relic (Evo +4 dark, UI whirl). Shock stir: Vulnerability flips to bloom mid-tide, "carousel chasm" (loop void, endless whimsy hunts).
Visuals: Reclaim weave (Phaser thread lines stitching void edges, blooming with aff colors). Swallow: Tide suck + grid ripple.
#### Code Blueprint: ECS + Zustand + Yuka Diff
Add ECS: `Abyss` component (`{ depth: 'u8', prog: 'f32', rigAff: 'u32' }`). Query: `abyssQuery = defineQuery([Position, Abyss])`.
In `ecosystem.js` (rite from tab):
In Zustand `useGame`:
Handoff prompt: "Implement abyss reclamation in EvoForge: ECS Abyss component, Yuka pioneer Seek/Flock in ecosystem.js, Zustand start action. Test: Reclaim 2 abysses (1 bloom hybrid, 1 hunger fissure)—log biome flip +Evo." Rival abyss incursions next, or veil mending rituals? The void yearns to yield.

---

**[ASSISTANT]**
### Levenshtein Distance: From Basics to Advanced Variants
The Levenshtein distance (or edit distance) measures the minimum number of single-character edits (insertions, deletions, substitutions) needed to transform one string into another. It's a cornerstone of string similarity in NLP, spell-checking, and genomics. Named after Vladimir Levenshtein (1965), it's computed via dynamic programming in O(mn) time for strings of length m and n.
#### How to Compute the Standard Version (Step-by-Step)
1. **DP Table Setup**: Create a (m+1) x (n+1) matrix `D`, where `D[i][j]` = edits to make first i chars of s1 match first j of s2.
   - `D[0][j] = j` (insert j chars).
   - `D[i][0] = i` (delete i chars).
2. **Recurrence**:
   - If `s1[i-1] == s2[j-1]`: `D[i][j] = D[i-1][j-1]` (no edit).
   - Else: `D[i][j] = 1 + min(D[i-1][j], D[i][j-1], D[i-1][j-1])` (delete, insert, substitute).
3. **Result**: `D[m][n]`.
**Example**: Distance between "kitten" and "sitting" = 3 (sub k→s, insert i, sub e→g).
#### Advanced Variants: Extensions for Real-World Edge
Standard Levenshtein treats all edits equally (cost 1), but advanced forms add weights, operations, or approximations for efficiency/scalability. Here's a breakdown with reasoning:
1. **Damerau-Levenshtein (Transpositions)**:
   - **Why Advanced?** Adds adjacent transpositions (e.g., "abc" to "acb" = 1 op, not 2 subs). Useful for typos (e.g., "teh" to "the").
   - **How**: Extend recurrence—if adjacent chars swapped, `D[i][j] = 1 + D[i-2][j-2]`.
   - **Cost**: Still O(mn), but captures real errors better.
2. **Weighted Levenshtein (Unequal Costs)**:
   - **Why?** Subs cost 1, inserts/deletes 0.5 (e.g., in bioinformatics, indels cheaper than mismatches).
   - **How**: Parametrize costs in recurrence: `D[i][j] = min(cost_sub + D[i-1][j-1], cost_del + D[i-1][j], cost_ins + D[i][j-1])`.
   - **Use Case**: Custom for EvoForge-like string evos (e.g., trait morphs where "void twist" costs more than "flow bloom").
3. **Approximate/Fast Variants (e.g., Ukkonen's O(n log n))**:
   - **Why?** Standard's quadratic sucks for long strings (e.g., DNA sequences). Use banding (diagonal strip) or BK-trees for sublinear queries.
   - **How**: Limit DP to |i-j| < k (band width), prune impossible paths. For trees: Insert strings with distance as key, query nearest neighbors.
   - **Tradeoff**: Approximate (threshold d), but scales to millions.
4. **Normalized/Adaptive (e.g., Jaro-Winkler)**:
   - **Why?** Raw distance ignores length (e.g., "cat" vs "caterpillar" = 5, unfair). Normalize by max(m,n) or add prefix bias for names.
   - **How**: Jaro = (matches / avg length) * (1 - transpositions/2); Winkler boosts common prefixes.
   - **Use Case**: Fuzzy search in procedural names (e.g., haiku similarity).
#### Implementation Example (Python, via DP)
To arrive at a solution for "kitten" vs "sitting":
For Damerau extension, add transposition check:
These build transparently: Start with the DP grid, layer ops/costs for complexity. For massive scales, libraries like `python-Levenshtein` (C-optimized) or Apache Lucene (indexed approx) handle prod loads.
Got a specific variant or strings to compute? Or dive deeper on weighted for custom affs?