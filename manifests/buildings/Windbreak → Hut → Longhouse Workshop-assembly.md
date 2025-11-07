Building set: Windbreak → Hut → Longhouse Workshop
Purpose: Reduce exposure mortality, shed rain, scale with group size, enable toolmaking under cover. All three tiers are deliberately upgradable and reuse major components.

Evolutionary logic (when to upgrade)
- exposure_mortality: build Windbreak immediately; add windward wall and tie-downs when winds increase.
- rain_frequency: add thatch skin and drip trenches to Windbreak; move to Hut when persistent rain appears; increase roof pitch and eaves.
- group_size_growth: >3 regular occupants → Hut; >6–8 occupants or multiple simultaneous crafters → Longhouse Workshop.
- toolmaking_needs_under_cover: add eave/porch to Hut; dedicated covered workbays and smoke control in Longhouse.

Common environmental orientation
- Face main opening 90–120° off prevailing wind (often SE in temperate zones).
- Put high back/solid wall to windward.
- Slight site crown, +150 mm above surrounding grade, with perimeter swale for drainage.
- Fire/smoke strategy: always provide a high vent path and low make-up air path to avoid backdraft.

AmbientCG materials mapping note
- Names below reference ambientCG categories; pick nearest-numbered variant available in your library. Examples:
  - Wood beams, rough: ambientCG WoodBeam001–004
  - De-barked roundwood/saplings: ambientCG WoodRound001
  - Bark/birch panels: ambientCG TreeBarkBirch002
  - Thatch reed/straw: ambientCG ThatchRoof001
  - Leather/hide: ambientCG Leather003
  - Rope/cord: ambientCG Rope001
  - Daub/plaster (clay-sand-straw): ambientCG PlasterRough014 or Clay002
  - Fieldstone/pavers: ambientCG StoneFieldstone010, CobblestoneHex001
  - Gravel/packed earth: ambientCG Gravel019, GroundMud007

Tier 1: Temporary Windbreak (branches and hides)
Role: Rapid deployment shelter to cut wind and shed light rain while occupants rest, tend a small fire, and perform minimal tasks.

Dimensions and capacity
- Plan: 3.0 m length x 1.5 m depth; ridge height 1.8 m; roof pitch ~45°
- Footprint: 3.2 x 2.0 m including drip edge
- Occupancy: 2–3 bedrolls (0.7 x 1.9 m each)

Structure
- Type: Single-slope lean-to on two forked posts and a ridge pole, with rafter sticks and a skin of thatch bundles and/or hides.
- Posts: 2 forked posts, Ø80–100 mm, 2.1 m long.
- Ridge pole: 1 @ 3.2 m, Ø80–120 mm.
- Rafters: 6–8 @ 2.0 m, Ø40–60 mm at 450 mm centers.
- Cross-lacing: 12–16 green sticks Ø20–30 mm to support cladding.
- Anchors: 6–8 stakes Ø30–40 mm, 0.5 m long; 4 buried deadmen logs for guy-lines in high winds.
- Tie-downs: 30–40 m cordage; lash square/diagonal bindings at all joints.
- Ground: 50 mm compacted duff over brush mat for thermal break.

Cladding and weathering
- Primary skin: 2 large hides (approx. 2 x 3 m each) OR 18–24 thatch bundles (reed/straw).
- Windward wing wall: low hurdle (wattle panel), 1.0 m high x 2.0 m long to block lateral gusts.
- Drip edge: 300 mm overhang; sod skirt or stone weights to pin lower edge against uplift.

Materials list (approx.)
- Roundwood: 0.12 m³ (posts, ridge, rafters, lacing)
- Thatch: 0.6 m³ (or hides 12 m²)
- Cordage: 40 m
- Stones for weighting/drainage: 0.25 m³
- Soil shaping: perimeter swale 3.0 m long x 0.2 m wide x 0.1 m deep

AmbientCG textures
- Structure: WoodRound001
- Cladding (thatch): ThatchRoof001
- Cladding (hide): Leather003
- Rope: Rope001
- Wing wall stones: StoneFieldstone010
- Ground: GroundMud007

Interior layout and stations
- Sleeping berm: rear, 0.9 m deep raised brush with grass thatch; 2–3 pallets.
- Fire: 1.5 m outside opening; reflective stone screen opposite fire to bounce heat.
- Micro-crafting: shallow tray under eave for flint-knapping; wood billet and antler punch stored in a hide pouch on the post.
- Dry stash: small rail high under ridge for hanging food and gear.

Structural performance
- Wind: stable to ~25 m/s gusts with guy-lines and weighted skirt.
- Rain: sheds light–moderate rain; add thatch density and pitch for heavy rain.

Creature behavior integration
- Rest spots claim to warm side nearest fire reflectance; sentry prefers post with view downwind.
- AI path: no obstruction within 1.0 m in front; reserve fire safety exclusion radius 1.2 m from hide edge.
- Social: 1 talk node at leeward end; small morale buff within 2 m when fire lit and windbreak present.

Upgrade hooks
- Add second lean-to back-to-back for A-frame when winds shift.
- Convert wing wall to full wattle panel → becomes windward wall of Hut.
- Reuse ridge/rafters as the first ribs for the Hut dome.


Tier 2: Semi-permanent Hut (bent-sapling dome with hides/bark/thatch)
Role: Weather-resilient living-craft hut with smoke control and porch for covered toolmaking.

Dimensions and capacity
- Interior diameter: 4.5 m (usable)
- Apex height: 2.4 m clear; lower ring beam at 1.6 m for loft/shelf
- Entrance: 0.9 m wide x 1.6 m high, facing away from prevailing wind
- Occupancy: 4–6 sleeping; 1–2 concurrent crafters under porch

Structure
- Frame: 16 bent sapling ribs Ø30–40 mm, 4.5–5.0 m long, paired and crossed; lashed to:
  - Base ring (ground-level sill): continuous hoop (spliced saplings) Ø4.8 m
  - Mid ring at 1.6 m for stiffness/storage
  - Apex ring at 2.2 m with adjustable smoke cap
- Secondary lath: 60–80 withies Ø10–15 mm woven as wattle up to 1.2 m height.
- Foundations: flat fieldstones under rib feet; sill hooped and staked; sod berm outside for splash and uplift resistance.

Cladding and weathering
- Lower wall (to 1.2 m): wattle-and-daub (clay:sand:chaff 1:2:1), 40–60 mm thick.
- Upper wall/roof: bark shingles or thatch bundles outside a hide inner liner; 250–300 mm thatch thickness at crown.
- Smoke hole: 300–400 mm opening with tilting hide cap on a pole.
- Eaves/porch: cantilevered rafters on entrance side; 1.5 m deep lean-to awning at 1.9 m head height.

Materials list (approx.)
- Saplings: 16 ribs + rings ≈ 100 m linear
- Withies for wattle: 300 m linear
- Daub: 0.6 m³
- Thatch: 2.0 m³ OR bark panels 18–22 m² + hides 12 m² inner liner
- Stones: 0.6 m³ for base, hearth, splash apron
- Cordage: 80 m
- Door: flexible hide flap on hoop frame

AmbientCG textures
- Saplings/structure: WoodRound001
- Wattle: WoodTwigs001 (or nearest small-branch material)
- Daub: PlasterRough014
- Thatch roof: ThatchRoof001
- Bark panels: TreeBarkBirch002
- Hide liner/door: Leather003
- Stone base/hearth: StoneFieldstone010
- Ground/porch: Gravel019

Interior layout and stations (zoned by cardinal quadrants)
- Center: round hearth Ø0.9 m with ring stones; clay apron; smoke hole above.
- North (dirty craft near door): knapping bench (log stump anvil, leather catch basin), raw stone bin, bone/antler tools rack.
- East (wet craft): hide-scraping beam with drip tray, tanning tub pit (lined with bark), peg rail and drying line under warm draft path.
- South (domestic): cook niche and storage baskets on wall ledge; small wood rack near hearth.
- West (clean craft): weaving frame/cordage twist post; sewing mat under hide liner.
- Perimeter sleeping: 4–6 pallets on raised benches (0.45 m high), cubbies below; warmest beds downwind of door.
- Loft shelf at 1.6 m ring: light storage and herbs; accessible via pegged ladder.
- Porch workbay: shaving horse, low workbench; tool board under eave; keeps noisy/airy tasks outside but dry.

Structural performance
- Wind: stable to ~30 m/s with staked sill and sod berm.
- Rain: 50 mm/hr with 300 mm thatch and 600 mm eaves; drainage trench 0.3 m wide around dripline.
- Smoke: stack effect via low air inlet at door gap and apex vent.

Creature behavior integration
- Sleep assignment by pallet; heat-seeking picks leeward benches first.
- Craft AI prefers porch if rain is light; moves inside if heavy or wind-driven.
- Smoke avoidance: avoid apex zone if cap closed; seating ring defined 1.2–1.6 m from hearth.
- Inventory adjacency: raw material baskets within 1 m of each station; finished goods shelf near door for quick dispatch.
- Hygiene: wet-craft splash zone marked; AI avoids tracking through sleeping area.

Upgrade hooks
- Add a second hut as a module and a covered breezeway if group >6.
- Salvageable members: ribs become rafters for Longhouse lean-tos; daub can be rehydrated for patching; thatch reused on longhouse roof as lower layers.
- Trigger toolmaking_needs_under_cover → expand porch to full 180° wrap or add side lean-to.

Tier 3: Longhouse Workshop (timber-frame with integrated workbays)
Role: Scalable production and communal living with controlled fire/smoke, storage, and multiple concurrent crafting stations.

Dimensions and capacity
- Interior plan: 12.0 m long x 4.8 m wide (5 bays @ 2.4 m)
- Eave height: 2.2 m; ridge height: ~3.8 m; roof pitch: 40°
- Occupancy: sleeping lofts for 8–12; simultaneous crafters: 4–6 across zones

Primary structure (post-and-beam bents)
- Bents: 6 frames at 2.4 m spacing
  - Posts: 12 @ 3.0 m, Ø160–200 mm or hewn 150 x 150 mm
  - Tie beams: 6 @ 4.8 m, 120 x 180 mm
  - Diagonal braces: 24 @ 1.2 m, 60 x 100 mm
- Longitudinals
  - Sill beams: 2 @ 12.0 m, 120 x 180 mm on stone pads 0.4 x 0.4 x 0.3 m (24 pads)
  - Wall plates: 2 @ 12.0 m, 100 x 150 mm
  - Purlins: 2 @ 12.0 m, 80 x 140 mm (at 1/3 and 2/3 roof height) or spliced
- Roof
  - Common rafters: 28 @ ~3.2 m, 60 x 100 mm at 500 mm centers
  - Ridge board: 1 @ 12.0 m, 50 x 250 mm
  - Thatched roofing: 250–300 mm thickness with netting/ligatures; 600 mm eaves; continuous 150 mm ridge vent with thatch ridge roll
- Joints: mortise-and-tenon with hardwood pegs (Ø20 mm); temporary lashings during assembly acceptable
- Tie-down: thatch netting and windward guy-ropes to deadmen in high-wind biomes

Walling and openings
- Lower wall (kick and splash zone): wattle-and-daub to 1.2 m
- Upper wall: woven panels or plank slats with adjustable hide flaps for ventilation
- Main doors: center bay, double leaves 1.6 m wide x 2.0 m high
- Service door: workshop end, 1.0 m wide
- Daylighting: clerestory slot vents beneath ridge; oiled-hide skylight panels over clean craft bay

Floor and drainage
- Central nave: compacted clay with 30–50 mm gravel topping
- Heavy work bay: 60 mm stone pavers over sand
- Wet bay: tamped clay with shallow drain channel to exterior soakaway
- Duckboards in high-traffic zones

Materials list (approx.)
- Structural timber: ~6.5–7.5 m³ (varies with hewn/round)
- Wattle withies: 600 m linear
- Daub: 3.0 m³
- Thatch: ~12 m³ (≈ 180–220 bundles)
- Planking (benches, racks, doors, loft decking): 30 m²
- Stone (pads + pavers): 6–8 m³
- Cordage: 120 m (assembly and thatch ligatures)
- Hardwood pegs: 80–100 pcs

AmbientCG textures
- Beams/posts: WoodBeam004
- Planks/lofts/doors: WoodPlanks019
- Wattle: WoodTwigs001
- Daub: PlasterRough014
- Thatch: ThatchRoof001
- Hides/flaps: Leather003
- Stone pads/pavers: StoneFieldstone010, CobblestoneHex001
- Floor: Gravel019, GroundMud007

Interior functional zoning (by bay, from social to heavy work)
- Bay 1 (Entry/dispatch)
  - Racks for finished tools, order board, cloak pegs
  - Worktable for inspection/packing
- Bay 2 (Clean craft)
  - Weaving frame, cordage posts, sewing benches with good daylight
  - Storage: baskets, herb racks on wall plate
- Bay 3 (Common hearth + social)
  - Central long hearth 2.0 x 0.8 m with clay curb; benches along posts
  - Overhead drying poles for food/cordage
  - Smoke vent hoods funneling to ridge slot
- Bay 4 (Wet/processing)
  - Tanning vats (dug tubs lined with bark/clay), drip rails, floor drain
  - Wash basin, hanging hides along warm ceiling zone
- Bay 5 (Heavy craft/forge)
  - Anvil log, stone slab knapping table with leather surround
  - Small clay forge with tuyere and twin bellows; quench trough; spark shield (daubed wattle screen)
  - Tool wall and billet storage
- Side aisles (all bays)
  - Low continuous benches (0.45 m high) double as sleeping platforms; cubbies beneath
- Lofts (both sides, above side aisles)
  - Slatted decking; sleeping for 8–12; cargo nets over nave
- External covered lean-tos (optional)
  - On south side: 1.8 m deep shed roof for log storage and shaving horse
  - On north side: woodpile and weatherbreak fence

Fire/smoke and safety
- Ridge slot vent with wind baffles; make-up air via low wall vents on leeward side
- Forge hood flue rises to ridge; keep 1.5 m no-spark zone to thatch; clay parging on underside of roof over forge bay
- Water pots/sand barrels at Bay 5 and Bay 3

Structural performance
- Wind: stable to ~35 m/s with pegged frame and tied thatch; add storm props between posts and deadmen in extreme events
- Rain: 60+ mm/hr; 600 mm eaves and drip trench 0.4 m wide x 0.2 m deep perimeter
- Snow (if applicable): 40° pitch acceptable to ~1.0 kPa; add ridge props if heavier

Creature behavior integration
- Pathing clear widths: 1.2 m nave; 0.9 m aisles; 1.6 m main doors
- Sleep allocation: lofts preferred when fire active; ground benches used by elders/guards near entry
- Job selection: each bay has adjacent raw storage within 1.5 m; finished goods flow toward Entry bay
- Social: morale bonus near Bay 3 benches; storytelling node at hearth
- Environmental comfort: heat zones around hearth and forge; wet bay avoided for sleep; smoke concentration reduces occupancy near ridge unless vents open
- Hazard avoidance: spark radius around forge; slippery zone in wet bay flagged; animals avoid these

Upgrade and modular extension
- Lengthen by adding 1–2 bents (+2.4 m each) as group_size grows; replicate bay programs as needed
- Swap thatch to shingle or turf if material tech advances; reuse thatch as underlayment
- Replace daub upper walls with plank cladding in rainy, windy biomes
- Add side workshops as lean-tos for specialized crafts (ceramics kiln, bowyer’s shed)
- Convert an end bay into store with secured door if raids increase

Assembly sequencing overview
1) Lay sill beams on stone pads; set bents flat on ground, assemble joints, raise with temporary props.
2) Install wall plates, purlins, rafters, ridge; true and peg.
3) Build wattle lower wall; apply daub; allow to cure.
4) Thatch roof from eaves to ridge; bind each course; install ridge roll and storm net.
5) Fit doors, lofts, benches; build hearth/forge and flues; cut vents and install flaps.

Resource reuse across tiers
- Windbreak poles/rafters become Hut ribs.
- Hut ribs and ring beams become Longhouse lean-to rafters or interior racks.
- Thatch from earlier tiers becomes base thatch layers on Longhouse.
- Stones migrate from hearths and splash aprons to longhouse pads and pavers.
- Hides shift from cladding to liners, doors, and vent caps.

Gameplay-facing functional areas summary
- Rest/sleep: pallets (Tier 1), benches and perimetral beds (Tier 2), lofts and benches (Tier 3)
- Fire/cooking: outside reflective fire (Tier 1), central hearth (Tier 2), long hearth + forge (Tier 3)
- Craft stations under cover:
  - Flint knapping: Windbreak tray; Hut near door; Longhouse heavy bay (stone slab + leather catcher)
  - Wood shaping: Hut porch; Longhouse lean-to + clean craft bay benches
  - Leather/tanning: Hut wet quadrant; Longhouse wet bay with drains
  - Weaving/cordage: Hut clean quadrant; Longhouse clean bay with daylight
- Storage: overhead ridge rail (Tier 1), ring loft and wall ledges (Tier 2), lofts, racks, and entry dispatch (Tier 3)

Bill-of-materials quick counts (for planning)
- Windbreak: 2 posts, 1 ridge, 6–8 rafters, 12–16 laths, 10 stakes, 18–24 thatch bundles or 2 large hides, 40 m cordage, 0.25 m³ stone
- Hut: 16 ribs, 3 ring hoops, 60–80 withies, 0.6 m³ daub, 2.0 m³ thatch or 20 m² bark + 12 m² hides, 80 m cordage, 0.6 m³ stone
- Longhouse: 12 posts, 6 tie beams, 24 braces, 2 sills, 2 plates, 2 purlins, 28 rafters, 1 ridge, 600 m withies, 3 m³ daub, 180–220 thatch bundles, 30 m² planking, 24 stone pads + 12 m² pavers, 120 m cordage, 80–100 pegs

Performance tuning by trigger
- If exposure_mortality spikes: add windward panels, weighted skirts, guy-lines; tighten hide liners; reduce door gap; add interior wind-baffle screen.
- If rain_frequency rises: increase roof pitch to 45°, double thatch thickness at crown, add 600–800 mm eaves and gutters (split-bamboo or bark), deepen swales.
- If group_size_growth: lengthen longhouse by one bay per +3–4 occupants; add loft decking and more pallets; increase storage racks.
- If toolmaking_needs_under_cover: extend Hut porch to half-wrap; add longhouse lean-to workbays; install skylight and vent hoods; segregate wet/dry/heavy tasks.

These plans balance realism (joinery, drainage, smoke paths, load paths) with gameplay needs (clear zones, upgradability, AI-friendly layouts, and material reuse), and map cleanly to ambientCG material sets for consistent visual grounding.