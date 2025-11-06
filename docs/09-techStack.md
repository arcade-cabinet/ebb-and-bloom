# Tech Stack & Architecture

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

**[USER]**
Zustand state management

---

**[ASSISTANT]**
### Zustand State Management in EvoForge: Minimalist Magic for Your Evo Chaos
Zustand's the stealth ninja of state libs—tiny (1KB), no boilerplate, and it slips into Vue like it owns the place. Ditch Pinia's setup ceremony if you crave raw hooks over stores; Zustand's `create` gives you a reactive atom that Pinia's refs envy. For EvoForge, it's ideal: A single `useGame` hook that hydrates your Ionic components with pollution pulses, snap histories, and trait demands—without the Pinia ceremony. Critters flock? Zustand diffs the behavior profile on the fly. Terraform a river? Haptics fire, and your modal toasts the new alloy chain.
Why swap to Zustand? If Pinia felt a tad opinionated (plugins, devtools overhead), Zustand's vanilla JS core keeps our BitECS/Yuka imports pure. It proxies globals seamlessly, scales to infinite snaps (lazy subs only), and works offline in Capacitor PWAs. Vue integration? Just `useStore` in setups—reactive as `computed`.
#### Quick Setup
1. **Install**: In your Ionic Vue project: `npm i zustand`.
2. **No Main.ts Tweaks**: Zustand's provider-free—import anywhere. For devtools: `npm i @zustand-devtools` (optional middleware).
#### Core Game Store: `stores/useGame.ts`
One file, one hook. Reactive state, actions, selectors—proxies our ECS like a boss. Exports for Ionic components.
#### Wiring to Components
- **Home.vue**: Hook in, reactive wins.
  ```vue
  <script setup>
  import { useGame, usePollution, useMaxStyle, useThemeClass } from '@/stores/useGame';
  import { onMounted } from 'vue';
  import { watch } from 'vue';
  import { IonContent, IonProgressBar } from '@ionic/vue';
  const game = useGame();
  const pollution = usePollution();
  const maxStyle = useMaxStyle();
  const themeClass = useThemeClass();
  onMounted(() => game.initialize());
  watch(pollution, (val) => {
    if (val > 50) console.log('World stirs...');
  });
  </script>
  <template>
    <ion-content>
      <ion-progress-bar :value="pollution / 100" :color="themeClass"></ion-progress-bar>
      <div class="status">{{ maxStyle }} Arc</div>
      <!-- Phaser, @click="game.performSnap(1,2)" -->
    </ion-content>
  </template>
  ```
- **Creator.vue**: Mutations via actions.
  ```vue
  <script setup>
  import { useGame } from '@/stores/useGame';
  const game = useGame();
  const addTrait = (name: string) => game.addTrait(name, 2);
  </script>
  ```
- **Log.vue**: Array reactivity.
  ```vue
  <script setup>
  import { useGame } from '@/stores/useGame';
  const { snapHistory } = useGame();
  </script>
  <template>
    <ion-list>
      <ion-item v-for="(snap, i) in snapHistory" :key="i">{{ snap }}</ion-item>
    </ion-list>
  </template>
  ```
#### Pro Tips & Scale
- **ECS Sync**: In `updateLoop()`, `useGame.setState({ pollution })`—or middleware for auto-sync.
- **Persistence**: `persist` middleware: `create(persist(createGameSlice, { name: 'evo-storage' }))` → LocalStorage/IndexedDB.
- **Perf**: Selectors shallow-sub—change one trait, only demands recompute.
- **Testing**: Jest mocks: `const mockGame = create(() => ({}));`.
Zustand strips it to the essentials, letting EvoForge's procedural fire breathe—snaps cascade, state just flows. Handoff: "Migrate EvoForge to Zustand: Replace Pinia with useGame hook, diff components for selectors." Pinia nostalgia, or straight to Redux vibes?

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
### Pack Quest Mechanics: Dispatching Your Legacies to the Wild
Love this vector—packs aren't just emergent herds; they're your roving extensions, turning inheritance into agency. No fetch quests from a HUD; instead, "Dispatch" rituals where you whisper goals to a clan (via proximity or Ionic gesture), and Yuka steers them into the unknown. A flipper-blessed otterkin pack quests for lost river pearls, returning with snaps or scars. Botch it? They rebel, spawning rival territories. Success? They "evolve up," feeding Evo Points back to you. It's risk-reward poetry: Your traits echo out, but the world's entropy twists them.
This slots atop inheritance—packs (5-50 critters) form post-cycle if shared genes >50% (BitECS query). Quests scale with pack size/maturity: Tiny squads for whimsy scouts, mega-clans for conquest raids. Ties to style—Yuka goals skew harmonious (explore/gift) or conquest (raid/claim). Shocks interrupt quests mid-stride, mutating outcomes (e.g., void storm turns pearl-hunters into marauders).
#### Core Mechanics: From Huddle to Horizon
- **Pack Formation & Maturity**: Post-inheritance, critters "huddle" if within 64px and gene overlap (GeneTrait.bits & packMask > half). Zustand tracks `packRegistry: Array<{id: string, size: number, genes: u32, loyalty: 0-1}>`. Maturity levels (1-5): Starts at 1 (scout), levels via successful quests (+1, caps at size/10). Loyalty starts 0.8 (harmony +0.1), drops on failures (-0.2, <0.3 = defection).
- **Dispatch Ritual**: In world tab, long-press a pack (Ionic gesture)—modal pops: Select goal (Explore/Fetch/Raid, Yuka-weighted by behavior). Assign "whisper" (lend a trait temporarily, e.g., +your chainsaw for raid). Quest duration: 1-10 cycles (noise-based, pack speed scales with genes).
- **Quest Resolution (Yuka-Driven)**:
  - **Pathfinding Saga**: Pack as Yuka group (FlockBehavior + custom Goal: Seek target biome). En route: Random events (Perlin rolls)—harmony: Ally critter joins (+size); conquest: Rival skirmish (-loyalty if fail). Inherited traits mod odds (flipper pack: +30% river cross).
  - **Outcome Branches** (probabilistic, seeded):
    - **Success (60% base + traits/loyalty)**: Return with haul (e.g., fetch: Rare snap like "deep ore vein," auto-places near you). +Loyalty, +maturity, +Evo Points (size * 0.5).
    - **Partial (30%)**: Scarred return—pollution echo on haul, but hybrid trait (e.g., pearl + void = "tainted gem," risky high-yield snap).
    - **Failure (10% + conquest skew)**: Pack scatters ( -size/2), possible defection (new rival pack). Shock tie-in: If mid-quest, 50% mutate to "lost kin" (hostile wanderers).
  - **Backflow**: Hauls integrate—successful fetch spawns snap chain starters. Defectors contest your biomes (Yuka territory claim, stealing 5% resources/turn).
- **Quest Caps & Scale**: 1 active quest/pack (queue for clans). Infinite via pack gen—mature packs "bud" off sub-packs (50% genes). Frolick: Quests unlock "tales" (cosmetic logs, +serenity).
Balance: Quests cost "whisper energy" (regen via harmony idles), preventing spam. UI: Pack icons in Log tab (Ionic badges for status: 🟢 Questing | 🔴 Defected).
#### Examples: Legacies in Motion
- **Harmony Scout**: Flippers-you dispatches a young fin-squirrel pack (size 8, genes: flow|life) to "Explore Plains." Yuka flocks north—event: Befriend birds (+2 size). Return: "Whimsy Meadow" tile spawns (life snaps galore, +frolick nudge). Toast: "Your grace called forth a glade—Evo +4."
- **Conquest Raid**: Chainsaw clan (size 20, genes: heat|metal) raids "Raid River" for ore. Mid-path: Skirmish with fish (-3 size, loyalty dip). Success: Vein haul (+demands met, auto-drill snap). Fail roll? Half defect, forming "razor dam" blocking your flows—forcing a counter-quest.
- **Shock-Twisted Hybrid**: Otterkin mid-fetch pearls—void quake hits. Partial: Return "corrode pearls" (flow|void snap: High yield but +pollution/hour). Maturity +1, but loyalty -0.1—next quest risks "abyssal drift" (pack wanders off-map, lost forever).
Visuals: Quest overlay (Phaser tween: Pack sprites path with trail lines). Modal: "Whisper Chainsaw? (Temp lend: +raid 20%, risk rustback)."
#### Code Blueprint: ECS + Zustand + Yuka Diff
Add ECS: `Pack` component (`{ id: 'u32', maturity: 'u8', loyalty: 'f32' }`). Query: `packQuery = defineQuery([Position, GeneTrait, Pack])`.
In `ecosystem.js` (quest tick):
In Zustand `useGame`:
Handoff prompt: "Add pack quests to EvoForge: ECS Pack component, Yuka GoalBehavior for paths, Zustand dispatch action. Test: Dispatch 3 packs, sim resolutions, log hauls/loyalty shifts." Too clan-heavy, or wanna weave in "quest artifacts" (unique snaps from epics)? Your call.

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
### Nexus Shard Fusions: Gateways to the Fractal Abyss
Nexus shards—those elusive nexus points where grudge veins converge, humming with the raw geometry of your world's unmaking. They're the crown jewels of shard hunts, not mere loot but keys to *rewriting the canvas*: Fuse a nexus clutch (3-7 shards, taint-synced), and it doesn't just yield a relic; it *folds* the grid, birthing evolutions that ripple your entire domain (e.g., "fractal bloom" expands biomes with nested rivers, unlocking sub-shards). But nexus fusion's a high-wire act—taint overloads can "shatter the veil," collapsing chunks into void abysses (local permadeath for tiles, but spawns "abyss nexuses" for deeper dives). Harmony fusions "weave" stability (gentle expansions); conquest "shatters" aggressively (rapid growth, grudge magnets); frolick "warps" whimsically (twisted geometries, like Möbius loops for endless snaps).
This caps the shard loop—hunts feed fusions, fusions feed world scale, closing the infinite without bloat. Zustand hoards 'em as "Nexus Vault" (Ionic carousel: "Resonate: 4/7 | Fold Risk: Veil Thin"). Rare: 1 nexus/10 hunts, but shocks "catalyze" extras (post-quake veins pulse).
#### Core Mechanics: Fold, Fracture, or Flourish
- **Nexus Accrual**: From hunt bounties (5% roll) or purge relics (10% on clean severs). Require "resonance attunement" (vault shards must share >70% aff bits—e.g., all void|metal for "thorns nexus"). Cap: 10 in vault (excess "harmonize" auto, +serenity trickle).
- **Fusion Ritual** (Ionic Altar Modal, 1-Cycle Cast):
  - **Attune (Prep, 0 Risk)**: Select 3-7 attuned shards + "catalyst" (your trait or snap: Chainsaw amps shatter yield). Cost: Evo 3-5 (scaled by clutch size).
  - **Fold (Resolution, Yuka Echo)**: Procedural weave—Yuka "echoes" simulate fusion (Flock of shard proxies converging on nexus core). Roll: Base 70% flourish + attunement (taint <50% +20%, mismatch -15%).
    - **Flourish (Success, 70%)**: World Evo—grid folds (e.g., +20% size chunk with nexus aff: Flow nexus = labyrinth rivers, +snap loops). +Evo (clutch * 2), vault clears, packs +maturity (inheritance amp 20%).
    - **Fracture (Partial, 20%)**: Partial fold—half clutch yields (e.g., 3 shards → mini-evo like "petal scar," +local regrow but taint lingers 10%). Pollution +10, "fractal echo" (random tile warps next cycle).
    - **Shatter (Fail, 10% + Taint Skew)**: Veil rips—clutch lost, local abyss spawns (5x5 void chunk: No snaps, but "abyss nexus" seed for ultra-hunt). Pollution +30, shock chain (if >70), your aura "fractured" (-inheritance 25%, 3 cycles).
  - **Nexus Types** (Aff-Seeded Outcomes):
    - Heat|Metal: "Forge Fold"—expands quarries, +deep ore chains.
    - Life|Flow: "Bloom Weave"—biome hybrids, +regrow evos.
    - Void|Wild: "Abyss Warp"—risky scale ( +grid but +wisp density).
- **Style & Shock Mods**:
  - Harmony: +Flourish (weave stability, -fracture to 15%).
  - Conquest: +Shatter yields (abyss as conquest frontier, +grudge Evo).
  - Frolick: +Warp whimsy (e.g., loop folds = infinite whimsy detours).
  - Shock: +Roll window (catalyze mid-fusion), but +shatter abyss size.
Caps: 1 fusion/10 cycles—overfuse, "resonance fatigue" (+taint on hunts). Infinite: Abyss nexuses "call" rival hunts, balancing the boom.
#### Examples: Threads of the Unwoven
- **Conquest Crucible**: 5 barb nexus (void|metal attuned, chainsaw catalyst). Fold: Yuka converge—flourish roll! "Thorns Labyrinth" unfolds (quarry maze, +drill loops 3x yield). Evo +10, packs sharpen (razor rekin +maturity). Toast: "The grudge bends to your forge—veins run deeper."
- **Harmony Harmony**: 4 wist nexus (life|flow, flipper prod). Attune: Gentle weave—fracture partial (2 shards lost, "petal rift" mini-fold: Local river regrow +15%). Pollution +8, but echo "softens" next hunt (+ping). Fuse remnant: "Stream Heart" (serenity +5, inheritance cleanse).
- **Frolick Folly**: 6 chaos nexus (wild|void, whimsy detour). Fold: Warped roll—shatter! Abyss gulps 4x4 chunk (void pit, wisp haven). Pollution +25, aura "looped" (-speed in spirals). But abyss seeds "mad nexus" (ultra-hunt call, Evo +7 on reclaim). Shock amp: Catalyze to flourish mid-rift, birthing "eternal carousel" (loop biomes, endless frolick quests).
Visuals: Fusion vortex (Phaser spiral pull, shard sprites melting into grid folds). Shatter: Crack web + abyss suck-in.
#### Code Blueprint: ECS + Zustand + Yuka Diff
Add ECS: `Nexus` component (`{ clutchAff: 'u32', catalyst: 'u32', foldType: 'u8' }`—0=flourish,1=fracture,2=shatter).
In `ecosystem.js` (ritual from modal):
In Zustand `useGame`:
Handoff prompt: "Implement nexus shard fusions in EvoForge: ECS Nexus component, Yuka Flock converge in ecosystem.js, Zustand attune action. Test: Fuse 2 clutches (1 flourish expand, 1 shatter abyss)—log grid fold +pollution." Abyss reclamation next, or rival nexus raids? The nexus hums.

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
Hell yeah, that 1984 alchemy is the blueprint—why grind pixels when you can seed a cosmos? EvoForge's tile heart is solid for prototyping that intimate terraform vibe, but leveling up to "run around a world" means ditching the grid cage for a seamless, chunked expanse where your flipper-footed godling sprints across procedural horizons, packs questing over the horizon while you chase grudge-veins that snake for miles. Elite didn't store shit; it *conjured* it. We can do the same, modernized for Pages/Capacitor—no bloat, just elegant math that feels boundless.
### Scaling the Canvas: Chunked Cosmos Vibes
- **Hierarchical Proc Gen (Elite-Style Seeds)**: Ditch the flat 64x64; go fractal. Top-level: Galaxy-scale seed (LCG or Perlin galaxy) spits out "regions" (1km² chunks, 100x100 "macro-tiles"). Zoom in? Sub-seed per chunk: Rivers carve via drunk-walker algos (random walks with flow rules, like Elite's planet gens), villages as BSP-split clusters (binary trees for layouts—rooms connect like Rogue, but scaled to hamlets with procedural quests: "The elder's burr-haunted well needs mending"). Your creature? Runs free in a viewport (Phaser camera follows, loads 3x3 chunks ahead—~1MB RAM cap).
  - Why Feasible? 1984 BBC Micro had 32KB; your phone's got gigs. Cache chunks in IndexedDB (seed-based, not full maps—regen on revisit with "drift" for freshness: Time-hash tweaks evos).
  - Fun Hack: "Memory Ghosts"—old visits leave faint echoes (e.g., purged rival's wraith lingers if you loop back, Yuka-patrolled).
- **Endless Hooks, DOS Soul**: Quests aren't pinned; they're emergent beacons. Packs radio "pings" (Zustand events: "Otterkin found shard vein—dispatch?"). World "breathes" via global sim (off-screen Yuka ticks every 30s, Zustand syncs deltas). Shocks? Regional quakes reseed chunks (Perlin waves propagate borders). Scale your godling: Evo points unlock "stride modes" (flipper = glide rivers, chainsaw = burrow shortcuts).
  - Old Trick Twist: Like Nethack's bones, "abandoned camps"—your dead runs (permadeath tease?) leave shard loot for new saves, procedural inheritance across playthroughs.
### Pullin' It Off in 2025 (No Sweat)
- **Tech Stack Lift**: Phaser scenes for chunk streaming (preload 1, gen next). BitECS archetypes per chunk (unload old ones—O(1) queries stay snappy). Yuka for pack migrations (group steering across chunks, no full pathfind).
  - Perf: 60FPS on mid-Android? Throttle gen to idle frames (requestIdleCallback). Capacitor? Native geolocation seeds chunks from your real walks (hunt IRL-inspired veins).
- **MVP Ramp**: Start hybrid—keep tile zoom for close terraform, WASD/swipe to "stride" chunks. Test: One region gen (5min), add nexus folds to expand on-the-fly.
This catapults EvoForge to that 1984 endless high—your catalyst doesn't own a tile; it *authors* worlds that outlive the run. Headspace match? Let's spec a chunk-seed pseudocode snippet, or handoff "Scale EvoForge to chunked world: Implement LCG region gen in world.js, Yuka cross-chunk steer." What's the first stride?

---

**[ASSISTANT]**
### Haiku Scorer POC: Narrative Variety Guard
To combat "haiku hangover" repetition, this POC uses Jaccard similarity (set-based keyword overlap) on procedural haikus. It scores 5 samples, flags pairs >20% overlap, and recommends diversification. Simple, no STEM libs—pure Python for quick dev integration (hook to journal gen: If avg >0.2, reroll with metaphor prompt like "thorn as lover").
#### POC Code (Python, ~50 lines)
#### Sample Run Output
#### Integration Tease (Zustand Hook)
This POC flags repetition early—keeps haikus aching fresh. Tidal? Want JS port or metaphor reroll gen?