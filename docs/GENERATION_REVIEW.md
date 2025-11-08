# Generation Review: WARP & WEFT Flow

**Generated:** 2025-11-08T03:53:48.721Z

This document presents all generations (Gen 0-6) with their WARP (vertical causal flow) and WEFT (horizontal scale flow) relationships.

---

## Table of Contents

- [Gen 0: Planetary Genesis](#generation-0)
- [Gen 1: ECS Archetypes](#generation-1)
- [Gen 2: Pack Dynamics](#generation-2)
- [Gen 3: Tool Systems](#generation-3)
- [Gen 4: Tribe Formation](#generation-4)
- [Gen 5: Building Systems](#generation-5)
- [Gen 6: Religion & Democracy](#generation-6)
- [Texture Reference Collection](#texture-reference-collection)

---

## Gen 0: Planetary Genesis {#generation-0}

**WARP Flow:** This is the first generation (Gen 0). No previous generations to inherit from.

---

### MACRO: System-level context and foundational patterns

**Total Archetypes:** 7

#### Population I Star System (`population_i_star_system`)

**Description:** A young, metal-rich star supporting diverse planetary formations characterized by metal-rich environments and vibrant, dynamic surfaces.

**Parameters:**
```json
{
  "stellarMass": {
    "min": 0.8,
    "max": 1.5,
    "default": 1.2
  },
  "metallicity": {
    "min": 0.7,
    "max": 1,
    "default": 0.85
  },
  "age": {
    "min": 1,
    "max": 5,
    "default": 3
  },
  "orbitalDistance": {
    "min": 0.5,
    "max": 3,
    "default": 1.5
  }
}
```

**Color Palette:**
- <span style="background-color: #FFBB33; padding: 2px 8px; border-radius: 3px;">#FFBB33</span>
- <span style="background-color: #FF6633; padding: 2px 8px; border-radius: 3px;">#FF6633</span>
- <span style="background-color: #FFC300; padding: 2px 8px; border-radius: 3px;">#FFC300</span>
- <span style="background-color: #FF5733; padding: 2px 8px; border-radius: 3px;">#FF5733</span>
- <span style="background-color: #E91E63; padding: 2px 8px; border-radius: 3px;">#E91E63</span>

**PBR Properties:**
```json
{
  "baseColor": "#FFBB33",
  "roughness": 0.4,
  "metallic": 0.8,
  "normalStrength": 1.3,
  "aoStrength": 0.9,
  "heightScale": 0.02,
  "emissive": "#FF5733"
}
```

**Procedural Rules:**
> Planets show rich metallic patterns and bright contrasting colors, with active geological features.

**Textures:**
- **Metal049A** (Metal): <img src="../../packages/gen/public/textures/metal/Metal049A_bundle_2K.jpg" alt="Metal 049 A" width="200" />
- **Rock030** (Rock): <img src="../../packages/gen/public/textures/rock/Rock030_bundle_2K.jpg" alt="Rock 030" width="200" />

---

#### Population II Star System (`population_ii_star_system`)

**Description:** An ancient, metal-poor star offering stable and carbon/silicate-rich planetary formations with subtle and muted color schemes.

**Parameters:**
```json
{
  "stellarMass": {
    "min": 0.5,
    "max": 1,
    "default": 0.7
  },
  "metallicity": {
    "min": 0,
    "max": 0.3,
    "default": 0.1
  },
  "age": {
    "min": 8,
    "max": 13,
    "default": 10
  },
  "orbitalDistance": {
    "min": 1,
    "max": 5,
    "default": 2.5
  }
}
```

**Color Palette:**
- <span style="background-color: #B2BEB5; padding: 2px 8px; border-radius: 3px;">#B2BEB5</span>
- <span style="background-color: #8A8D8E; padding: 2px 8px; border-radius: 3px;">#8A8D8E</span>
- <span style="background-color: #737373; padding: 2px 8px; border-radius: 3px;">#737373</span>
- <span style="background-color: #495867; padding: 2px 8px; border-radius: 3px;">#495867</span>
- <span style="background-color: #98A886; padding: 2px 8px; border-radius: 3px;">#98A886</span>

**PBR Properties:**
```json
{
  "baseColor": "#B2BEB5",
  "roughness": 0.8,
  "metallic": 0.05,
  "normalStrength": 1.1,
  "aoStrength": 0.9,
  "heightScale": 0.04,
  "emissive": "#737373"
}
```

**Procedural Rules:**
> Planets exhibit muted tones and weathered surface textures, emphasizing silicate formations.

**Textures:**
- **Rock025** (unknown): `Rock025` (not found in manifest)
- **Clay02** (unknown): `Clay02` (not found in manifest)

---

#### Binary Star System (`binary_star_system`)

**Description:** A dual star system providing complex gravitational dynamics, influencing planetary orbits and creating unique temperature zones.

**Parameters:**
```json
{
  "stellarMass": {
    "min": 0.8,
    "max": 2,
    "default": 1.5
  },
  "metallicity": {
    "min": 0.3,
    "max": 0.9,
    "default": 0.6
  },
  "age": {
    "min": 2,
    "max": 10,
    "default": 6
  },
  "orbitalDistance": {
    "min": 0.2,
    "max": 2,
    "default": 1
  }
}
```

**Color Palette:**
- <span style="background-color: #FFD700; padding: 2px 8px; border-radius: 3px;">#FFD700</span>
- <span style="background-color: #E8A066; padding: 2px 8px; border-radius: 3px;">#E8A066</span>
- <span style="background-color: #7C4A33; padding: 2px 8px; border-radius: 3px;">#7C4A33</span>
- <span style="background-color: #C0C0C0; padding: 2px 8px; border-radius: 3px;">#C0C0C0</span>
- <span style="background-color: #2F4F4F; padding: 2px 8px; border-radius: 3px;">#2F4F4F</span>

**PBR Properties:**
```json
{
  "baseColor": "#FFD700",
  "roughness": 0.3,
  "metallic": 0.6,
  "normalStrength": 1.7,
  "aoStrength": 0.8,
  "heightScale": 0.03,
  "emissive": "#E8A066"
}
```

**Procedural Rules:**
> Planets have pronounced tidal features, with temperature variations causing distinct surface patterns.

**Textures:**
- **Rock030** (Rock): <img src="../../packages/gen/public/textures/rock/Rock030_bundle_2K.jpg" alt="Rock 030" width="200" />
- **Metal050** (unknown): `Metal050` (not found in manifest)

---

#### Post-Supernova Enrichment Zone (`post_supernova_enrichment_zone`)

**Description:** A system enriched by supernova events, containing rare heavy elements that enable planet formation with rare materials and unique chemical properties.

**Parameters:**
```json
{
  "stellarMass": {
    "min": 1,
    "max": 3,
    "default": 2.2
  },
  "metallicity": {
    "min": 0.6,
    "max": 1,
    "default": 0.9
  },
  "age": {
    "min": 1,
    "max": 5,
    "default": 3
  },
  "orbitalDistance": {
    "min": 0.8,
    "max": 4,
    "default": 2
  }
}
```

**Color Palette:**
- <span style="background-color: #FFC107; padding: 2px 8px; border-radius: 3px;">#FFC107</span>
- <span style="background-color: #6B4226; padding: 2px 8px; border-radius: 3px;">#6B4226</span>
- <span style="background-color: #8B0000; padding: 2px 8px; border-radius: 3px;">#8B0000</span>
- <span style="background-color: #4682B4; padding: 2px 8px; border-radius: 3px;">#4682B4</span>
- <span style="background-color: #EE82EE; padding: 2px 8px; border-radius: 3px;">#EE82EE</span>

**PBR Properties:**
```json
{
  "baseColor": "#FFC107",
  "roughness": 0.5,
  "metallic": 0.7,
  "normalStrength": 1.2,
  "aoStrength": 0.9,
  "heightScale": 0.05,
  "emissive": "#EE82EE"
}
```

**Procedural Rules:**
> Enriched elements result in volatile surface conditions and visually dynamic landscapes.

**Textures:**
- **Metal049A** (Metal): <img src="../../packages/gen/public/textures/metal/Metal049A_bundle_2K.jpg" alt="Metal 049 A" width="200" />
- **Rock030** (Rock): <img src="../../packages/gen/public/textures/rock/Rock030_bundle_2K.jpg" alt="Rock 030" width="200" />

---

#### Protoplanetary Disk Disruption (`protoplanetary_disk_disruption`)

**Description:** A star born from a disrupted protoplanetary disk, leading to eccentric planetary orbits and diverse surface patterns on celestial bodies.

**Parameters:**
```json
{
  "stellarMass": {
    "min": 0.7,
    "max": 1.4,
    "default": 1
  },
  "metallicity": {
    "min": 0.2,
    "max": 0.8,
    "default": 0.5
  },
  "age": {
    "min": 0.5,
    "max": 5,
    "default": 2
  },
  "orbitalDistance": {
    "min": 1.5,
    "max": 5,
    "default": 3
  }
}
```

**Color Palette:**
- <span style="background-color: #8C8C8C; padding: 2px 8px; border-radius: 3px;">#8C8C8C</span>
- <span style="background-color: #D3D3D3; padding: 2px 8px; border-radius: 3px;">#D3D3D3</span>
- <span style="background-color: #B0C4DE; padding: 2px 8px; border-radius: 3px;">#B0C4DE</span>
- <span style="background-color: #FFFACD; padding: 2px 8px; border-radius: 3px;">#FFFACD</span>
- <span style="background-color: #C0C0C0; padding: 2px 8px; border-radius: 3px;">#C0C0C0</span>

**PBR Properties:**
```json
{
  "baseColor": "#8C8C8C",
  "roughness": 0.7,
  "metallic": 0.3,
  "normalStrength": 1.4,
  "aoStrength": 0.8,
  "heightScale": 0.06,
  "emissive": "#FFFACD"
}
```

**Procedural Rules:**
> Planets have distinctive rings and chaotic surface cracking due to varying orbital influences.

**Textures:**
- **Rock030** (Rock): <img src="../../packages/gen/public/textures/rock/Rock030_bundle_2K.jpg" alt="Rock 030" width="200" />
- **Gravel012** (unknown): `Gravel012` (not found in manifest)

---

#### Multigenerational Nursery System (`multigenerational_nursery_system`)

**Description:** A star system formed over multiple stellar generations, providing varied elemental compositions and complex planetary forms.

**Parameters:**
```json
{
  "stellarMass": {
    "min": 0.9,
    "max": 2.5,
    "default": 1.8
  },
  "metallicity": {
    "min": 0.4,
    "max": 0.9,
    "default": 0.65
  },
  "age": {
    "min": 5,
    "max": 10,
    "default": 8
  },
  "orbitalDistance": {
    "min": 1,
    "max": 4,
    "default": 2.5
  }
}
```

**Color Palette:**
- <span style="background-color: #FF8C00; padding: 2px 8px; border-radius: 3px;">#FF8C00</span>
- <span style="background-color: #2E8B57; padding: 2px 8px; border-radius: 3px;">#2E8B57</span>
- <span style="background-color: #DAA520; padding: 2px 8px; border-radius: 3px;">#DAA520</span>
- <span style="background-color: #4682B4; padding: 2px 8px; border-radius: 3px;">#4682B4</span>
- <span style="background-color: #DC143C; padding: 2px 8px; border-radius: 3px;">#DC143C</span>

**PBR Properties:**
```json
{
  "baseColor": "#FF8C00",
  "roughness": 0.6,
  "metallic": 0.7,
  "normalStrength": 1.5,
  "aoStrength": 0.8,
  "heightScale": 0.04,
  "emissive": "#DAA520"
}
```

**Procedural Rules:**
> Diverse mixes of geological and metallic surfaces reflect the rich history of material accumulation.

**Textures:**
- **Metal050** (unknown): `Metal050` (not found in manifest)
- **Rock025** (unknown): `Rock025` (not found in manifest)

---

#### Nucleosynthesis Cloud System (`nucleosynthesis_cloud_system`)

**Description:** A system formed from primordial nucleosynthesis clouds, offering a pure element balance conducive to diverse elemental chemistry on planets.

**Parameters:**
```json
{
  "stellarMass": {
    "min": 1,
    "max": 1.8,
    "default": 1.4
  },
  "metallicity": {
    "min": 0.1,
    "max": 0.5,
    "default": 0.3
  },
  "age": {
    "min": 5,
    "max": 12,
    "default": 8
  },
  "orbitalDistance": {
    "min": 0.5,
    "max": 3.5,
    "default": 2
  }
}
```

**Color Palette:**
- <span style="background-color: #D2B48C; padding: 2px 8px; border-radius: 3px;">#D2B48C</span>
- <span style="background-color: #556B2F; padding: 2px 8px; border-radius: 3px;">#556B2F</span>
- <span style="background-color: #8B4513; padding: 2px 8px; border-radius: 3px;">#8B4513</span>
- <span style="background-color: #DEB887; padding: 2px 8px; border-radius: 3px;">#DEB887</span>
- <span style="background-color: #6B8E23; padding: 2px 8px; border-radius: 3px;">#6B8E23</span>

**PBR Properties:**
```json
{
  "baseColor": "#D2B48C",
  "roughness": 0.7,
  "metallic": 0.2,
  "normalStrength": 1.3,
  "aoStrength": 0.8,
  "heightScale": 0.05,
  "emissive": "#6B8E23"
}
```

**Procedural Rules:**
> Planets display smooth, elemental transitions often leading to varied surface mineralogies.

**Textures:**
- **Rock025** (unknown): `Rock025` (not found in manifest)
- **Metal049A** (Metal): <img src="../../packages/gen/public/textures/metal/Metal049A_bundle_2K.jpg" alt="Metal 049 A" width="200" />

---


### MESO: Intermediate dynamics and structural relationships

**WEFT Flow:** Building on MACRO scale archetypes:
- "Population I Star System", "Population II Star System", "Binary Star System"...

**Total Archetypes:** 5

#### Hot Accretion Zone (`hot_accretion_zone`)

**Description:** Molten surfaces creating smooth and glassy appearances with cooling orange/red lava cracks visible from space. Formed in high-temperature regions of young star systems.

**Parameters:**
```json
{
  "stellarMass": {
    "min": 1.1,
    "max": 1.5,
    "default": 1.3
  },
  "temperature": {
    "min": 1500,
    "max": 2000,
    "default": 1750
  },
  "accretionRate": {
    "min": 2,
    "max": 5,
    "default": 3.5
  },
  "orbitalDistance": {
    "min": 0.1,
    "max": 0.5,
    "default": 0.3
  }
}
```

**Color Palette:**
- <span style="background-color: #331A1A; padding: 2px 8px; border-radius: 3px;">#331A1A</span>
- <span style="background-color: #AA3311; padding: 2px 8px; border-radius: 3px;">#AA3311</span>
- <span style="background-color: #FF3300; padding: 2px 8px; border-radius: 3px;">#FF3300</span>
- <span style="background-color: #FF5500; padding: 2px 8px; border-radius: 3px;">#FF5500</span>
- <span style="background-color: #A6674D; padding: 2px 8px; border-radius: 3px;">#A6674D</span>

**PBR Properties:**
```json
{
  "baseColor": "#FF5500",
  "roughness": 0.8,
  "metallic": 0.2,
  "normalStrength": 1.2,
  "aoStrength": 0.9,
  "heightScale": 0.07,
  "emissive": "#FF3300"
}
```

**Procedural Rules:**
> Sparse large craters, dense small cooling cracks, lava flow channels.

**Textures:**
- **Rock025** (unknown): `Rock025` (not found in manifest)
- **Metal049A** (Metal): <img src="../../packages/gen/public/textures/metal/Metal049A_bundle_2K.jpg" alt="Metal 049 A" width="200" />

---

#### Cold Accretion Zone (`cold_accretion_zone`)

**Description:** Icy accumulation resulting in bright, reflective white and blue surfaces. Formations have crystalline structures and are primarily found in cooler outer regions or older star systems.

**Parameters:**
```json
{
  "stellarMass": {
    "min": 0.8,
    "max": 1.2,
    "default": 1
  },
  "temperature": {
    "min": -200,
    "max": -100,
    "default": -150
  },
  "accretionRate": {
    "min": 0.5,
    "max": 1.5,
    "default": 1
  },
  "orbitalDistance": {
    "min": 1.5,
    "max": 3,
    "default": 2.5
  }
}
```

**Color Palette:**
- <span style="background-color: #88BBFF; padding: 2px 8px; border-radius: 3px;">#88BBFF</span>
- <span style="background-color: #E0F7FA; padding: 2px 8px; border-radius: 3px;">#E0F7FA</span>
- <span style="background-color: #BFEFFF; padding: 2px 8px; border-radius: 3px;">#BFEFFF</span>
- <span style="background-color: #70A0FF; padding: 2px 8px; border-radius: 3px;">#70A0FF</span>
- <span style="background-color: #FFFFFF; padding: 2px 8px; border-radius: 3px;">#FFFFFF</span>

**PBR Properties:**
```json
{
  "baseColor": "#E0F7FA",
  "roughness": 0.15,
  "metallic": 0.1,
  "normalStrength": 0.8,
  "aoStrength": 0.5,
  "heightScale": 0.03,
  "emissive": "#FFFFFF"
}
```

**Procedural Rules:**
> Crystalline patches dominate, sparse dark rock patches, scattered ice layers.

**Textures:**
- **Metal049A** (Metal): <img src="../../packages/gen/public/textures/metal/Metal049A_bundle_2K.jpg" alt="Metal 049 A" width="200" />
- **Rock030** (Rock): <img src="../../packages/gen/public/textures/rock/Rock030_bundle_2K.jpg" alt="Rock 030" width="200" />

---

#### Giant Impact Phase (`giant_impact_phase`)

**Description:** Characterized by large, surface-altering impacts that create multi-toned, cratered terrains with prominent basins visible from space.

**Parameters:**
```json
{
  "stellarMass": {
    "min": 0.9,
    "max": 1.4,
    "default": 1.1
  },
  "temperature": {
    "min": 300,
    "max": 1500,
    "default": 900
  },
  "impactFrequency": {
    "min": 3,
    "max": 8,
    "default": 5.5
  },
  "orbitalDistance": {
    "min": 0.8,
    "max": 1.8,
    "default": 1.3
  }
}
```

**Color Palette:**
- <span style="background-color: #3A3A47; padding: 2px 8px; border-radius: 3px;">#3A3A47</span>
- <span style="background-color: #606070; padding: 2px 8px; border-radius: 3px;">#606070</span>
- <span style="background-color: #848498; padding: 2px 8px; border-radius: 3px;">#848498</span>
- <span style="background-color: #AA9999; padding: 2px 8px; border-radius: 3px;">#AA9999</span>
- <span style="background-color: #27272C; padding: 2px 8px; border-radius: 3px;">#27272C</span>

**PBR Properties:**
```json
{
  "baseColor": "#3A3A47",
  "roughness": 0.65,
  "metallic": 0.25,
  "normalStrength": 1.3,
  "aoStrength": 1,
  "heightScale": 0.08,
  "emissive": "#606070"
}
```

**Procedural Rules:**
> Large craters dominate, with layered basins and ejecta blankets.

**Textures:**
- **Rock025** (unknown): `Rock025` (not found in manifest)
- **Metal050** (unknown): `Metal050` (not found in manifest)

---

#### Late Heavy Bombardment (`late_heavy_bombardment`)

**Description:** Frequent small- to medium-sized impacts distribute volatiles, resulting in mottled, variable surfaces with dark impact scars.

**Parameters:**
```json
{
  "stellarMass": {
    "min": 1,
    "max": 1.5,
    "default": 1.2
  },
  "impactFrequency": {
    "min": 8,
    "max": 15,
    "default": 10.5
  },
  "temperature": {
    "min": 500,
    "max": 1000,
    "default": 750
  },
  "orbitalDistance": {
    "min": 0.7,
    "max": 2,
    "default": 1.4
  }
}
```

**Color Palette:**
- <span style="background-color: #5C5E5C; padding: 2px 8px; border-radius: 3px;">#5C5E5C</span>
- <span style="background-color: #6D6E72; padding: 2px 8px; border-radius: 3px;">#6D6E72</span>
- <span style="background-color: #7C807F; padding: 2px 8px; border-radius: 3px;">#7C807F</span>
- <span style="background-color: #A9A8A3; padding: 2px 8px; border-radius: 3px;">#A9A8A3</span>
- <span style="background-color: #272827; padding: 2px 8px; border-radius: 3px;">#272827</span>

**PBR Properties:**
```json
{
  "baseColor": "#5C5E5C",
  "roughness": 0.75,
  "metallic": 0.15,
  "normalStrength": 1.4,
  "aoStrength": 0.6,
  "heightScale": 0.06,
  "emissive": "#6D6E72"
}
```

**Procedural Rules:**
> Dense small craters with few large impacts, varying terrain textures.

**Textures:**
- **Rock030** (Rock): <img src="../../packages/gen/public/textures/rock/Rock030_bundle_2K.jpg" alt="Rock 030" width="200" />
- **Metal050** (unknown): `Metal050` (not found in manifest)

---

#### Gravitational Differentiation (`gravitational_differentiation`)

**Description:** Internal heating and pressure cause materials to stratify into distinct bands, creating structured and colored surface zones.

**Parameters:**
```json
{
  "stellarMass": {
    "min": 0.9,
    "max": 1.3,
    "default": 1.1
  },
  "differentiationTime": {
    "min": 3,
    "max": 6,
    "default": 4.5
  },
  "temperature": {
    "min": 800,
    "max": 1400,
    "default": 1100
  },
  "orbitalDistance": {
    "min": 0.6,
    "max": 2.4,
    "default": 1.5
  }
}
```

**Color Palette:**
- <span style="background-color: #664D3C; padding: 2px 8px; border-radius: 3px;">#664D3C</span>
- <span style="background-color: #998675; padding: 2px 8px; border-radius: 3px;">#998675</span>
- <span style="background-color: #B0A297; padding: 2px 8px; border-radius: 3px;">#B0A297</span>
- <span style="background-color: #F4DED7; padding: 2px 8px; border-radius: 3px;">#F4DED7</span>
- <span style="background-color: #27221C; padding: 2px 8px; border-radius: 3px;">#27221C</span>

**PBR Properties:**
```json
{
  "baseColor": "#998675",
  "roughness": 0.55,
  "metallic": 0.35,
  "normalStrength": 1.1,
  "aoStrength": 0.4,
  "heightScale": 0.04,
  "emissive": "#B0A297"
}
```

**Procedural Rules:**
> Banded layers with varying chemistry, visible stratification patterns.

**Textures:**
- **Metal049A** (Metal): <img src="../../packages/gen/public/textures/metal/Metal049A_bundle_2K.jpg" alt="Metal 049 A" width="200" />
- **Rock025** (unknown): `Rock025` (not found in manifest)

---


### MICRO: Fine-grained details and specific implementations

**WEFT Flow:** Building on MACRO and MESO scales:
- MACRO: "Population I Star System", "Population II Star System"...
- MESO: "Hot Accretion Zone", "Cold Accretion Zone"...

**Total Archetypes:** 8

#### Iron-Nickel Core Dominance (`micro_001`)

**Description:** A metal-rich planetary core resulting in a planet with stark, metallic surface features, manifesting as dark grays with reflective highlights and rusty oxidation areas.

**Parameters:**
```json
{
  "ironContent": {
    "min": 0.5,
    "max": 1,
    "default": 0.8
  },
  "carbonContent": {
    "min": 0.1,
    "max": 0.4,
    "default": 0.2
  },
  "volatileContent": {
    "min": 0,
    "max": 0.3,
    "default": 0.1
  },
  "rareEarthContent": {
    "min": 0,
    "max": 0.1,
    "default": 0.05
  },
  "silicateContent": {
    "min": 0.2,
    "max": 0.6,
    "default": 0.4
  }
}
```

**Color Palette:**
- <span style="background-color: #2E2E2E; padding: 2px 8px; border-radius: 3px;">#2E2E2E</span>
- <span style="background-color: #5B5B5B; padding: 2px 8px; border-radius: 3px;">#5B5B5B</span>
- <span style="background-color: #964B00; padding: 2px 8px; border-radius: 3px;">#964B00</span>
- <span style="background-color: #B87333; padding: 2px 8px; border-radius: 3px;">#B87333</span>
- <span style="background-color: #ECECEC; padding: 2px 8px; border-radius: 3px;">#ECECEC</span>

**PBR Properties:**
```json
{
  "baseColor": "#2E2E2E",
  "roughness": 0.3,
  "metallic": 0.9,
  "normalStrength": 1,
  "aoStrength": 0.8,
  "heightScale": 0.1,
  "emissive": "#000000"
}
```

**Procedural Rules:**
> Metals accumulate towards core with oxidized veins spread across surface.

**Textures:**
- **Metal049A** (Metal): <img src="../../packages/gen/public/textures/metal/Metal049A_bundle_2K.jpg" alt="Metal 049 A" width="200" />
- **Metal050** (unknown): `Metal050` (not found in manifest)

---

#### Carbon Mantle Shimmer (`micro_002`)

**Description:** A planet with a carbon-rich mantle, revealing a dark, shiny surface featuring graphite textures and sparkling diamond-like features in certain regions.

**Parameters:**
```json
{
  "ironContent": {
    "min": 0.1,
    "max": 0.3,
    "default": 0.2
  },
  "carbonContent": {
    "min": 0.5,
    "max": 1,
    "default": 0.8
  },
  "volatileContent": {
    "min": 0,
    "max": 0.2,
    "default": 0.1
  },
  "rareEarthContent": {
    "min": 0,
    "max": 0.2,
    "default": 0.1
  },
  "silicateContent": {
    "min": 0.2,
    "max": 0.4,
    "default": 0.3
  }
}
```

**Color Palette:**
- <span style="background-color: #1C1C1C; padding: 2px 8px; border-radius: 3px;">#1C1C1C</span>
- <span style="background-color: #8A8A8A; padding: 2px 8px; border-radius: 3px;">#8A8A8A</span>
- <span style="background-color: #FFFFFF; padding: 2px 8px; border-radius: 3px;">#FFFFFF</span>
- <span style="background-color: #333333; padding: 2px 8px; border-radius: 3px;">#333333</span>
- <span style="background-color: #3C3C3C; padding: 2px 8px; border-radius: 3px;">#3C3C3C</span>
- <span style="background-color: #DCDCDC; padding: 2px 8px; border-radius: 3px;">#DCDCDC</span>

**PBR Properties:**
```json
{
  "baseColor": "#1C1C1C",
  "roughness": 0.4,
  "metallic": 0,
  "normalStrength": 1.2,
  "aoStrength": 0.7,
  "heightScale": 0.05,
  "emissive": "#FFFFFF"
}
```

**Procedural Rules:**
> Carbon stratification forms shiny patches and reflective veins.

**Textures:**
- **Rock025** (unknown): `Rock025` (not found in manifest)
- **Rock030** (Rock): <img src="../../packages/gen/public/textures/rock/Rock030_bundle_2K.jpg" alt="Rock 030" width="200" />

---

#### Volatile Surface Waters (`micro_003`)

**Description:** Planets with high volatile content showing lush blue surfaces with visible water bodies and frozen caps, surrounded by contrasting clouds.

**Parameters:**
```json
{
  "ironContent": {
    "min": 0,
    "max": 0.3,
    "default": 0.1
  },
  "carbonContent": {
    "min": 0.1,
    "max": 0.3,
    "default": 0.2
  },
  "volatileContent": {
    "min": 0.5,
    "max": 1,
    "default": 0.8
  },
  "rareEarthContent": {
    "min": 0,
    "max": 0.1,
    "default": 0.04
  },
  "silicateContent": {
    "min": 0.1,
    "max": 0.3,
    "default": 0.2
  }
}
```

**Color Palette:**
- <span style="background-color: #0050D4; padding: 2px 8px; border-radius: 3px;">#0050D4</span>
- <span style="background-color: #A1CDEC; padding: 2px 8px; border-radius: 3px;">#A1CDEC</span>
- <span style="background-color: #FFFFFF; padding: 2px 8px; border-radius: 3px;">#FFFFFF</span>
- <span style="background-color: #66B3FF; padding: 2px 8px; border-radius: 3px;">#66B3FF</span>
- <span style="background-color: #5E83BA; padding: 2px 8px; border-radius: 3px;">#5E83BA</span>

**PBR Properties:**
```json
{
  "baseColor": "#0050D4",
  "roughness": 0.2,
  "metallic": 0,
  "normalStrength": 1,
  "aoStrength": 0.6,
  "heightScale": 0.02,
  "emissive": "#66B3FF"
}
```

**Procedural Rules:**
> Volatile distribution leads to open water expanses with icy polar caps.

**Textures:**
- **Water008** (unknown): `Water008` (not found in manifest)
- **Ice004** (unknown): `Ice004` (not found in manifest)

---

#### Silicate Plateau (`micro_004`)

**Description:** A predominantly silicate-based planet exhibiting traditional rocky surfaces in shades of brown, beige, and gray with mineral veins.

**Parameters:**
```json
{
  "ironContent": {
    "min": 0.1,
    "max": 0.2,
    "default": 0.15
  },
  "carbonContent": {
    "min": 0,
    "max": 0.1,
    "default": 0.05
  },
  "volatileContent": {
    "min": 0.1,
    "max": 0.2,
    "default": 0.15
  },
  "rareEarthContent": {
    "min": 0,
    "max": 0.1,
    "default": 0.03
  },
  "silicateContent": {
    "min": 0.6,
    "max": 1,
    "default": 0.8
  }
}
```

**Color Palette:**
- <span style="background-color: #8B8378; padding: 2px 8px; border-radius: 3px;">#8B8378</span>
- <span style="background-color: #7F7F7F; padding: 2px 8px; border-radius: 3px;">#7F7F7F</span>
- <span style="background-color: #BDB76B; padding: 2px 8px; border-radius: 3px;">#BDB76B</span>
- <span style="background-color: #D3D3D3; padding: 2px 8px; border-radius: 3px;">#D3D3D3</span>
- <span style="background-color: #8B4513; padding: 2px 8px; border-radius: 3px;">#8B4513</span>
- <span style="background-color: #696969; padding: 2px 8px; border-radius: 3px;">#696969</span>

**PBR Properties:**
```json
{
  "baseColor": "#8B8378",
  "roughness": 0.9,
  "metallic": 0,
  "normalStrength": 1.5,
  "aoStrength": 0.8,
  "heightScale": 0.1,
  "emissive": "#000000"
}
```

**Procedural Rules:**
> Material compaction leads to layered, textured rocky surfaces.

**Textures:**
- **Rock038** (unknown): `Rock038` (not found in manifest)
- **Rock050** (Rock): <img src="../../packages/gen/public/textures/rock/Rock050_bundle_2K.jpg" alt="Rock 050" width="200" />

---

#### Rare Earth Iridescence (`micro_005`)

**Description:** Rare earth concentration gives rise to iridescent planets with shifting color surfaces, appearing multi-hued from varying light angles.

**Parameters:**
```json
{
  "ironContent": {
    "min": 0,
    "max": 0.1,
    "default": 0.05
  },
  "carbonContent": {
    "min": 0,
    "max": 0.1,
    "default": 0.05
  },
  "volatileContent": {
    "min": 0,
    "max": 0.3,
    "default": 0.1
  },
  "rareEarthContent": {
    "min": 0.5,
    "max": 1,
    "default": 0.8
  },
  "silicateContent": {
    "min": 0.1,
    "max": 0.3,
    "default": 0.2
  }
}
```

**Color Palette:**
- <span style="background-color: #FFD700; padding: 2px 8px; border-radius: 3px;">#FFD700</span>
- <span style="background-color: #DAA520; padding: 2px 8px; border-radius: 3px;">#DAA520</span>
- <span style="background-color: #C0C0C0; padding: 2px 8px; border-radius: 3px;">#C0C0C0</span>
- <span style="background-color: #E5E4E2; padding: 2px 8px; border-radius: 3px;">#E5E4E2</span>
- <span style="background-color: #B8860B; padding: 2px 8px; border-radius: 3px;">#B8860B</span>
- <span style="background-color: #FF4500; padding: 2px 8px; border-radius: 3px;">#FF4500</span>

**PBR Properties:**
```json
{
  "baseColor": "#FFD700",
  "roughness": 0.2,
  "metallic": 0.8,
  "normalStrength": 1.3,
  "aoStrength": 0.7,
  "heightScale": 0.03,
  "emissive": "#E5E4E2"
}
```

**Procedural Rules:**
> Iridescent hues fluctuate with mineral density and light exposure.

**Textures:**
- **Metal051** (unknown): `Metal051` (not found in manifest)
- **Metal052** (unknown): `Metal052` (not found in manifest)

---

#### Silicon-Oxygen Hardstone (`micro_006`)

**Description:** A robust, silicate-dominated structure perfect for detailed surface inspection, providing varied shades of tan and gray with visible grain.

**Parameters:**
```json
{
  "ironContent": {
    "min": 0.1,
    "max": 0.2,
    "default": 0.15
  },
  "carbonContent": {
    "min": 0,
    "max": 0.1,
    "default": 0.05
  },
  "volatileContent": {
    "min": 0.1,
    "max": 0.3,
    "default": 0.2
  },
  "rareEarthContent": {
    "min": 0,
    "max": 0.1,
    "default": 0.02
  },
  "silicateContent": {
    "min": 0.7,
    "max": 1,
    "default": 0.9
  }
}
```

**Color Palette:**
- <span style="background-color: #A0522D; padding: 2px 8px; border-radius: 3px;">#A0522D</span>
- <span style="background-color: #DAA520; padding: 2px 8px; border-radius: 3px;">#DAA520</span>
- <span style="background-color: #D2B48C; padding: 2px 8px; border-radius: 3px;">#D2B48C</span>
- <span style="background-color: #A9A9A9; padding: 2px 8px; border-radius: 3px;">#A9A9A9</span>
- <span style="background-color: #C0C0C0; padding: 2px 8px; border-radius: 3px;">#C0C0C0</span>
- <span style="background-color: #808080; padding: 2px 8px; border-radius: 3px;">#808080</span>

**PBR Properties:**
```json
{
  "baseColor": "#D2B48C",
  "roughness": 0.8,
  "metallic": 0,
  "normalStrength": 1.6,
  "aoStrength": 0.9,
  "heightScale": 0.08,
  "emissive": "#808080"
}
```

**Procedural Rules:**
> Variations in rock densities create distinguishable bands and hardstone aggregates.

**Textures:**
- **Rock045** (unknown): `Rock045` (not found in manifest)
- **Rock046** (unknown): `Rock046` (not found in manifest)

---

#### Calcium-Magnesium Formation (`micro_007`)

**Description:** Planets with extensive calcareous and magnesium-rich vistas offering yellow-brown hues with rugged models including visible striations.

**Parameters:**
```json
{
  "ironContent": {
    "min": 0.1,
    "max": 0.2,
    "default": 0.15
  },
  "carbonContent": {
    "min": 0.1,
    "max": 0.3,
    "default": 0.2
  },
  "volatileContent": {
    "min": 0,
    "max": 0.2,
    "default": 0.1
  },
  "rareEarthContent": {
    "min": 0,
    "max": 0.2,
    "default": 0.05
  },
  "silicateContent": {
    "min": 0.5,
    "max": 0.7,
    "default": 0.6
  }
}
```

**Color Palette:**
- <span style="background-color: #FFD700; padding: 2px 8px; border-radius: 3px;">#FFD700</span>
- <span style="background-color: #F0E68C; padding: 2px 8px; border-radius: 3px;">#F0E68C</span>
- <span style="background-color: #FFFAF0; padding: 2px 8px; border-radius: 3px;">#FFFAF0</span>
- <span style="background-color: #8B4513; padding: 2px 8px; border-radius: 3px;">#8B4513</span>
- <span style="background-color: #CD853F; padding: 2px 8px; border-radius: 3px;">#CD853F</span>
- <span style="background-color: #BC8F8F; padding: 2px 8px; border-radius: 3px;">#BC8F8F</span>

**PBR Properties:**
```json
{
  "baseColor": "#FFD700",
  "roughness": 0.5,
  "metallic": 0,
  "normalStrength": 1.2,
  "aoStrength": 0.8,
  "heightScale": 0.06,
  "emissive": "#8B4513"
}
```

**Procedural Rules:**
> Calcium seams are irregular, and magnesium formations alternate in complexity by temperature.

**Textures:**
- **Rock028** (Rock): <img src="../../packages/gen/public/textures/rock/Rock028_bundle_2K.jpg" alt="Rock 028" width="200" />
- **Concrete023** (Concrete): <img src="../../packages/gen/public/textures/concrete/Concrete023_bundle_2K.jpg" alt="Concrete 023" width="200" />

---

#### Hydrothermal Vent Regions (`micro_008`)

**Description:** Regions marked by volcanic and hydrothermal interaction, presenting dark surfaces with hints of red and bubbly textures due to escape gases.

**Parameters:**
```json
{
  "ironContent": {
    "min": 0.1,
    "max": 0.3,
    "default": 0.2
  },
  "carbonContent": {
    "min": 0.2,
    "max": 0.4,
    "default": 0.3
  },
  "volatileContent": {
    "min": 0.3,
    "max": 0.5,
    "default": 0.4
  },
  "rareEarthContent": {
    "min": 0.1,
    "max": 0.3,
    "default": 0.2
  },
  "silicateContent": {
    "min": 0.2,
    "max": 0.4,
    "default": 0.3
  }
}
```

**Color Palette:**
- <span style="background-color: #1F1F1F; padding: 2px 8px; border-radius: 3px;">#1F1F1F</span>
- <span style="background-color: #D2691E; padding: 2px 8px; border-radius: 3px;">#D2691E</span>
- <span style="background-color: #8B4513; padding: 2px 8px; border-radius: 3px;">#8B4513</span>
- <span style="background-color: #B22222; padding: 2px 8px; border-radius: 3px;">#B22222</span>
- <span style="background-color: #532C1C; padding: 2px 8px; border-radius: 3px;">#532C1C</span>
- <span style="background-color: #3A3A3A; padding: 2px 8px; border-radius: 3px;">#3A3A3A</span>

**PBR Properties:**
```json
{
  "baseColor": "#1F1F1F",
  "roughness": 0.55,
  "metallic": 0.1,
  "normalStrength": 1.4,
  "aoStrength": 0.75,
  "heightScale": 0.07,
  "emissive": "#D2691E"
}
```

**Procedural Rules:**
> Escape gases form surface bubbles and uneven color shifts, red glow visible from cracks.

**Textures:**
- **Rock035** (Rock): <img src="../../packages/gen/public/textures/rock/Rock035_bundle_2K.jpg" alt="Rock 035" width="200" />
- **Metal060** (unknown): `Metal060` (not found in manifest)

---


---

## Gen 1: ECS Archetypes {#generation-1}

**WARP Flow:** Inheriting knowledge from previous generation:
- **Gen 0: Planetary Genesis** provided:
  - "Population I Star System", "Population II Star System", "Binary Star System", "Post-Supernova Enrichment Zone", "Protoplanetary Disk Disruption"...
  - Total: 20 archetypes across all scales

---

### MACRO: System-level context and foundational patterns

**Total Archetypes:** 5

#### Chromatic Cartographer (`macro_archetype_001`)

**Description:** A nomadic creature adapted to metal-rich environments, utilizing advanced sensory arrays to map the dynamic landscapes.

**Parameters:**
```json
{
  "stellarMass": {
    "min": 0.9,
    "max": 1.4,
    "default": 1.1
  },
  "metallicity": {
    "min": 0.5,
    "max": 1,
    "default": 0.8
  },
  "age": {
    "min": 1,
    "max": 5,
    "default": 3
  },
  "orbitalDistance": {
    "min": 0.7,
    "max": 2.5,
    "default": 1.5
  }
}
```

**Color Palette:**
- <span style="background-color: #6A5ACD; padding: 2px 8px; border-radius: 3px;">#6A5ACD</span>
- <span style="background-color: #8B4513; padding: 2px 8px; border-radius: 3px;">#8B4513</span>
- <span style="background-color: #C0C0C0; padding: 2px 8px; border-radius: 3px;">#C0C0C0</span>
- <span style="background-color: #FFFFFF; padding: 2px 8px; border-radius: 3px;">#FFFFFF</span>
- <span style="background-color: #1E90FF; padding: 2px 8px; border-radius: 3px;">#1E90FF</span>

**PBR Properties:**
```json
{
  "baseColor": "#6A5ACD",
  "roughness": 0.6,
  "metallic": 0.4,
  "normalStrength": 1.2,
  "aoStrength": 0.7,
  "heightScale": 0.03,
  "emissive": "#1E90FF"
}
```

**Procedural Rules:**
> Varies optically to detect and map metal formations using polarized reflections.

**Textures:**
- **Metal049A** (Metal): <img src="../../packages/gen/public/textures/metal/Metal049A_bundle_2K.jpg" alt="Metal 049 A" width="200" />
- **Fabric019** (Fabric): <img src="../../packages/gen/public/textures/fabric/Fabric019_bundle_2K.jpg" alt="Fabric 019" width="200" />

---

#### Silk Weaver (`macro_archetype_002`)

**Description:** Creature capable of producing strong silk-like structures, adapted to construct functional nests in both arid and humid climates.

**Parameters:**
```json
{
  "stellarMass": {
    "min": 1,
    "max": 1.5,
    "default": 1.3
  },
  "metallicity": {
    "min": 0.4,
    "max": 0.8,
    "default": 0.6
  },
  "age": {
    "min": 1,
    "max": 8,
    "default": 4
  },
  "orbitalDistance": {
    "min": 0.6,
    "max": 2,
    "default": 1.2
  }
}
```

**Color Palette:**
- <span style="background-color: #A0522D; padding: 2px 8px; border-radius: 3px;">#A0522D</span>
- <span style="background-color: #FAEBD7; padding: 2px 8px; border-radius: 3px;">#FAEBD7</span>
- <span style="background-color: #D2B48C; padding: 2px 8px; border-radius: 3px;">#D2B48C</span>
- <span style="background-color: #8B4513; padding: 2px 8px; border-radius: 3px;">#8B4513</span>
- <span style="background-color: #FFD700; padding: 2px 8px; border-radius: 3px;">#FFD700</span>

**PBR Properties:**
```json
{
  "baseColor": "#A0522D",
  "roughness": 0.7,
  "metallic": 0,
  "normalStrength": 1,
  "aoStrength": 0.6,
  "heightScale": 0.02,
  "emissive": "#FFD700"
}
```

**Procedural Rules:**
> Silk strands vary in thickness and strength, adapting to environmental demands.

**Textures:**
- **Fabric023** (Fabric): <img src="../../packages/gen/public/textures/fabric/Fabric023_bundle_2K.jpg" alt="Fabric 023" width="200" />
- **Leather011** (Leather): <img src="../../packages/gen/public/textures/leather/Leather011_bundle_2K.jpg" alt="Leather 011" width="200" />

---

#### Herbal Forager (`macro_archetype_003`)

**Description:** Adapted to exploit the rich organic matter of wood and grasses, this creature specializes in sustainable foraging.

**Parameters:**
```json
{
  "stellarMass": {
    "min": 1,
    "max": 1.3,
    "default": 1.15
  },
  "metallicity": {
    "min": 0.3,
    "max": 0.6,
    "default": 0.5
  },
  "age": {
    "min": 1,
    "max": 7,
    "default": 3.5
  },
  "orbitalDistance": {
    "min": 1,
    "max": 2.5,
    "default": 1.5
  }
}
```

**Color Palette:**
- <span style="background-color: #3CB371; padding: 2px 8px; border-radius: 3px;">#3CB371</span>
- <span style="background-color: #556B2F; padding: 2px 8px; border-radius: 3px;">#556B2F</span>
- <span style="background-color: #8B4513; padding: 2px 8px; border-radius: 3px;">#8B4513</span>
- <span style="background-color: #F5DEB3; padding: 2px 8px; border-radius: 3px;">#F5DEB3</span>
- <span style="background-color: #9ACD32; padding: 2px 8px; border-radius: 3px;">#9ACD32</span>

**PBR Properties:**
```json
{
  "baseColor": "#3CB371",
  "roughness": 0.5,
  "metallic": 0,
  "normalStrength": 1,
  "aoStrength": 0.8,
  "heightScale": 0.03,
  "emissive": "#9ACD32"
}
```

**Procedural Rules:**
> Grass and wood textures combine to create a camouflaged exterior.

**Textures:**
- **Wood051** (Wood): <img src="../../packages/gen/public/textures/wood/Wood051_bundle_2K.jpg" alt="Wood 051" width="200" />
- **Grass001** (Grass): <img src="../../packages/gen/public/textures/grass/Grass001_bundle_2K.jpg" alt="Grass 001" width="200" />

---

#### Arid Engineers (`macro_archetype_004`)

**Description:** Using readily available materials such as sandstone and grass, these creatures build networks of complex habitats in arid environments.

**Parameters:**
```json
{
  "stellarMass": {
    "min": 0.8,
    "max": 1.3,
    "default": 1
  },
  "metallicity": {
    "min": 0.3,
    "max": 0.7,
    "default": 0.5
  },
  "age": {
    "min": 1,
    "max": 5,
    "default": 2.5
  },
  "orbitalDistance": {
    "min": 1.2,
    "max": 3,
    "default": 2
  }
}
```

**Color Palette:**
- <span style="background-color: #C2B280; padding: 2px 8px; border-radius: 3px;">#C2B280</span>
- <span style="background-color: #D2B48C; padding: 2px 8px; border-radius: 3px;">#D2B48C</span>
- <span style="background-color: #8B4513; padding: 2px 8px; border-radius: 3px;">#8B4513</span>
- <span style="background-color: #F5F5DC; padding: 2px 8px; border-radius: 3px;">#F5F5DC</span>
- <span style="background-color: #A0522D; padding: 2px 8px; border-radius: 3px;">#A0522D</span>

**PBR Properties:**
```json
{
  "baseColor": "#C2B280",
  "roughness": 0.7,
  "metallic": 0.1,
  "normalStrength": 1.5,
  "aoStrength": 1,
  "heightScale": 0.04,
  "emissive": "#F5F5DC"
}
```

**Procedural Rules:**
> Variations in habitat structures reflect environmental adaptation.

**Textures:**
- **Rock025** (unknown): `Rock025` (not found in manifest)
- **Grass002** (Grass): <img src="../../packages/gen/public/textures/grass/Grass002_bundle_2K.jpg" alt="Grass 002" width="200" />

---

#### Nocturnal Chaser (`macro_archetype_005`)

**Description:** Predatory creatures that adapted to low-light environments using advanced sensory navigation and speed.

**Parameters:**
```json
{
  "stellarMass": {
    "min": 1.1,
    "max": 1.4,
    "default": 1.25
  },
  "metallicity": {
    "min": 0.3,
    "max": 0.8,
    "default": 0.5
  },
  "age": {
    "min": 1,
    "max": 6,
    "default": 3
  },
  "orbitalDistance": {
    "min": 0.8,
    "max": 2.2,
    "default": 1.6
  }
}
```

**Color Palette:**
- <span style="background-color: #2F4F4F; padding: 2px 8px; border-radius: 3px;">#2F4F4F</span>
- <span style="background-color: #708090; padding: 2px 8px; border-radius: 3px;">#708090</span>
- <span style="background-color: #C0C0C0; padding: 2px 8px; border-radius: 3px;">#C0C0C0</span>
- <span style="background-color: #000000; padding: 2px 8px; border-radius: 3px;">#000000</span>
- <span style="background-color: #8B0000; padding: 2px 8px; border-radius: 3px;">#8B0000</span>

**PBR Properties:**
```json
{
  "baseColor": "#2F4F4F",
  "roughness": 0.6,
  "metallic": 0.2,
  "normalStrength": 1.1,
  "aoStrength": 0.9,
  "heightScale": 0.03,
  "emissive": "#8B0000"
}
```

**Procedural Rules:**
> Skin texture shifts enable stealth and concealment in dark landscapes.

**Textures:**
- **Leather012** (Leather): <img src="../../packages/gen/public/textures/leather/Leather012_bundle_2K.jpg" alt="Leather 012" width="200" />
- **Fabric019** (Fabric): <img src="../../packages/gen/public/textures/fabric/Fabric019_bundle_2K.jpg" alt="Fabric 019" width="200" />

---


### MESO: Intermediate dynamics and structural relationships

**WEFT Flow:** Building on MACRO scale archetypes:
- "Chromatic Cartographer", "Silk Weaver", "Herbal Forager"...

**Total Archetypes:** 6

#### Solo Vigilant (`archetype_solo_vigilant`)

**Description:** A solitary creature with acute senses, adapted to traverse and patrol metal-rich territories, remaining resilient and elusive in its environment.

**Parameters:**
```json
{
  "stellarMass": {
    "min": 0.8,
    "max": 1.5,
    "default": 1.2
  },
  "metallicity": {
    "min": 0.3,
    "max": 1,
    "default": 0.8
  },
  "age": {
    "min": 1,
    "max": 10,
    "default": 5
  },
  "orbitalDistance": {
    "min": 0.5,
    "max": 3,
    "default": 1.5
  }
}
```

**Color Palette:**
- <span style="background-color: #4E535E; padding: 2px 8px; border-radius: 3px;">#4E535E</span>
- <span style="background-color: #7395AE; padding: 2px 8px; border-radius: 3px;">#7395AE</span>
- <span style="background-color: #557A95; padding: 2px 8px; border-radius: 3px;">#557A95</span>
- <span style="background-color: #B1A296; padding: 2px 8px; border-radius: 3px;">#B1A296</span>
- <span style="background-color: #495867; padding: 2px 8px; border-radius: 3px;">#495867</span>

**PBR Properties:**
```json
{
  "baseColor": "#4E535E",
  "roughness": 0.7,
  "metallic": 0.2,
  "normalStrength": 1,
  "aoStrength": 0.6,
  "heightScale": 0.1,
  "emissive": "#7395AE"
}
```

**Procedural Rules:**
> Colors shift depending on ambient source lighting and surface contact consistency, creating an almost chameleon-like appearance in metal-heavy environments.

**Textures:**
- **Metal049A** (Metal): <img src="../../packages/gen/public/textures/metal/Metal049A_bundle_2K.jpg" alt="Metal 049 A" width="200" />
- **Fabric019** (Fabric): <img src="../../packages/gen/public/textures/fabric/Fabric019_bundle_2K.jpg" alt="Fabric 019" width="200" />

---

#### Fabric Conclave (`archetype_fabric_conclave`)

**Description:** A community of creatures forming intricate fabric-like nests for communal living and resource sharing, thriving on synergy in semi-organic environments.

**Parameters:**
```json
{
  "stellarMass": {
    "min": 0.9,
    "max": 1.4,
    "default": 1.1
  },
  "metallicity": {
    "min": 0.4,
    "max": 0.9,
    "default": 0.7
  },
  "age": {
    "min": 2,
    "max": 8,
    "default": 4.5
  },
  "orbitalDistance": {
    "min": 0.8,
    "max": 2.5,
    "default": 1.2
  }
}
```

**Color Palette:**
- <span style="background-color: #BFB8A5; padding: 2px 8px; border-radius: 3px;">#BFB8A5</span>
- <span style="background-color: #D9BF77; padding: 2px 8px; border-radius: 3px;">#D9BF77</span>
- <span style="background-color: #C1839F; padding: 2px 8px; border-radius: 3px;">#C1839F</span>
- <span style="background-color: #6D9DC5; padding: 2px 8px; border-radius: 3px;">#6D9DC5</span>
- <span style="background-color: #94BFA7; padding: 2px 8px; border-radius: 3px;">#94BFA7</span>

**PBR Properties:**
```json
{
  "baseColor": "#BFB8A5",
  "roughness": 0.5,
  "metallic": 0.1,
  "normalStrength": 1.2,
  "aoStrength": 0.7,
  "heightScale": 0.08,
  "emissive": "#D9BF77"
}
```

**Procedural Rules:**
> Color patterns dynamically adjust to the season, utilizing available fabric and grass textures to build adaptive habitats.

**Textures:**
- **Fabric023** (Fabric): <img src="../../packages/gen/public/textures/fabric/Fabric023_bundle_2K.jpg" alt="Fabric 023" width="200" />
- **Grass002** (Grass): <img src="../../packages/gen/public/textures/grass/Grass002_bundle_2K.jpg" alt="Grass 002" width="200" />

---

#### Swarm Collective (`archetype_swarm_collective`)

**Description:** A highly organized group demonstrating swarm intelligence, effectively managing resources and efficiently navigating through volatile environments.

**Parameters:**
```json
{
  "stellarMass": {
    "min": 1,
    "max": 1.3,
    "default": 1.2
  },
  "metallicity": {
    "min": 0.5,
    "max": 0.8,
    "default": 0.6
  },
  "age": {
    "min": 3,
    "max": 9,
    "default": 5.5
  },
  "orbitalDistance": {
    "min": 1,
    "max": 2,
    "default": 1.4
  }
}
```

**Color Palette:**
- <span style="background-color: #6F4E37; padding: 2px 8px; border-radius: 3px;">#6F4E37</span>
- <span style="background-color: #D9A673; padding: 2px 8px; border-radius: 3px;">#D9A673</span>
- <span style="background-color: #B86B77; padding: 2px 8px; border-radius: 3px;">#B86B77</span>
- <span style="background-color: #C1C6C8; padding: 2px 8px; border-radius: 3px;">#C1C6C8</span>
- <span style="background-color: #A393BF; padding: 2px 8px; border-radius: 3px;">#A393BF</span>

**PBR Properties:**
```json
{
  "baseColor": "#6F4E37",
  "roughness": 0.6,
  "metallic": 0.2,
  "normalStrength": 1.3,
  "aoStrength": 0.8,
  "heightScale": 0.1,
  "emissive": "#A393BF"
}
```

**Procedural Rules:**
> Emitting colors blend into their background, serving both as camouflage and communication across the swarm.

**Textures:**
- **Leather011** (Leather): <img src="../../packages/gen/public/textures/leather/Leather011_bundle_2K.jpg" alt="Leather 011" width="200" />
- **Grass001** (Grass): <img src="../../packages/gen/public/textures/grass/Grass001_bundle_2K.jpg" alt="Grass 001" width="200" />

---

#### Herd Nomads (`archetype_herd_nomads`)

**Description:** A large and cohesive group traveling together across dynamic landscapes, sharing resources effectively and providing mutual protection.

**Parameters:**
```json
{
  "stellarMass": {
    "min": 1.1,
    "max": 1.5,
    "default": 1.3
  },
  "metallicity": {
    "min": 0.4,
    "max": 0.9,
    "default": 0.7
  },
  "age": {
    "min": 1.5,
    "max": 8,
    "default": 4
  },
  "orbitalDistance": {
    "min": 0.7,
    "max": 1.8,
    "default": 1.3
  }
}
```

**Color Palette:**
- <span style="background-color: #BC986A; padding: 2px 8px; border-radius: 3px;">#BC986A</span>
- <span style="background-color: #8B786D; padding: 2px 8px; border-radius: 3px;">#8B786D</span>
- <span style="background-color: #ADA397; padding: 2px 8px; border-radius: 3px;">#ADA397</span>
- <span style="background-color: #650000; padding: 2px 8px; border-radius: 3px;">#650000</span>
- <span style="background-color: #FF38A1; padding: 2px 8px; border-radius: 3px;">#FF38A1</span>

**PBR Properties:**
```json
{
  "baseColor": "#BC986A",
  "roughness": 0.6,
  "metallic": 0.1,
  "normalStrength": 1,
  "aoStrength": 0.7,
  "heightScale": 0.07,
  "emissive": "#FF38A1"
}
```

**Procedural Rules:**
> Coloration and texture mimic the moving landscape, adjusting mottling patterns as they migrate.

**Textures:**
- **Leather012** (Leather): <img src="../../packages/gen/public/textures/leather/Leather012_bundle_2K.jpg" alt="Leather 012" width="200" />
- **Grass002** (Grass): <img src="../../packages/gen/public/textures/grass/Grass002_bundle_2K.jpg" alt="Grass 002" width="200" />

---

#### Territorial Pair (`archetype_territorial_pair`)

**Description:** A pair-bound system where two creatures claim and defend a specific area, effectively utilizing resources and maintaining local biodiversity.

**Parameters:**
```json
{
  "stellarMass": {
    "min": 1,
    "max": 1.3,
    "default": 1.1
  },
  "metallicity": {
    "min": 0.3,
    "max": 0.7,
    "default": 0.5
  },
  "age": {
    "min": 1.5,
    "max": 7,
    "default": 3
  },
  "orbitalDistance": {
    "min": 0.6,
    "max": 1.5,
    "default": 1
  }
}
```

**Color Palette:**
- <span style="background-color: #2C5F2D; padding: 2px 8px; border-radius: 3px;">#2C5F2D</span>
- <span style="background-color: #97BC62; padding: 2px 8px; border-radius: 3px;">#97BC62</span>
- <span style="background-color: #D9BF77; padding: 2px 8px; border-radius: 3px;">#D9BF77</span>
- <span style="background-color: #DAA520; padding: 2px 8px; border-radius: 3px;">#DAA520</span>
- <span style="background-color: #8A7F80; padding: 2px 8px; border-radius: 3px;">#8A7F80</span>

**PBR Properties:**
```json
{
  "baseColor": "#2C5F2D",
  "roughness": 0.8,
  "metallic": 0.05,
  "normalStrength": 1.1,
  "aoStrength": 0.9,
  "heightScale": 0.05,
  "emissive": "#DAA520"
}
```

**Procedural Rules:**
> Territory-specific coloration that not only marks boundaries but also reflects emotional states.

**Textures:**
- **Wood051** (Wood): <img src="../../packages/gen/public/textures/wood/Wood051_bundle_2K.jpg" alt="Wood 051" width="200" />
- **Grass001** (Grass): <img src="../../packages/gen/public/textures/grass/Grass001_bundle_2K.jpg" alt="Grass 001" width="200" />

---

#### Pack Hunters (`archetype_pack_hunters`)

**Description:** Coordinated predator group exploiting social structures to efficiently hunt and consume prey, dynamic leadership adaptability being key.

**Parameters:**
```json
{
  "stellarMass": {
    "min": 1.2,
    "max": 1.4,
    "default": 1.3
  },
  "metallicity": {
    "min": 0.6,
    "max": 1,
    "default": 0.8
  },
  "age": {
    "min": 2,
    "max": 9,
    "default": 6
  },
  "orbitalDistance": {
    "min": 0.9,
    "max": 2,
    "default": 1.3
  }
}
```

**Color Palette:**
- <span style="background-color: #4B3832; padding: 2px 8px; border-radius: 3px;">#4B3832</span>
- <span style="background-color: #854442; padding: 2px 8px; border-radius: 3px;">#854442</span>
- <span style="background-color: #7E9181; padding: 2px 8px; border-radius: 3px;">#7E9181</span>
- <span style="background-color: #B1B1B1; padding: 2px 8px; border-radius: 3px;">#B1B1B1</span>
- <span style="background-color: #3B3A36; padding: 2px 8px; border-radius: 3px;">#3B3A36</span>

**PBR Properties:**
```json
{
  "baseColor": "#4B3832",
  "roughness": 0.4,
  "metallic": 0.15,
  "normalStrength": 1.4,
  "aoStrength": 0.9,
  "heightScale": 0.06,
  "emissive": "#854442"
}
```

**Procedural Rules:**
> Fractal patterning reflective of group hierarchy and hunting success, emitted in luminescent bursts during night pursuits.

**Textures:**
- **Bricks051** (Bricks): <img src="../../packages/gen/public/textures/bricks/Bricks051_bundle_2K.jpg" alt="Bricks 051" width="200" />
- **Leather011** (Leather): <img src="../../packages/gen/public/textures/leather/Leather011_bundle_2K.jpg" alt="Leather 011" width="200" />

---


### MICRO: Fine-grained details and specific implementations

**WEFT Flow:** Building on MACRO and MESO scales:
- MACRO: "Chromatic Cartographer", "Silk Weaver"...
- MESO: "Solo Vigilant", "Fabric Conclave"...

**Total Archetypes:** 5

#### Pulse Predator (`pulse_predator`)

**Description:** A dynamic creature with rapid metabolic cycles, adapted for intense bursts of activity. Its physiology is optimized for hunting and swift responses in metal-rich environments.

**Parameters:**
```json
{
  "metabolicRate": {
    "min": 1.5,
    "max": 2.5,
    "default": 2
  },
  "sensoryRange": {
    "min": 1.2,
    "max": 2,
    "default": 1.6
  },
  "immuneStrength": {
    "min": 0.7,
    "max": 1.2,
    "default": 0.9
  },
  "reproductiveRate": {
    "min": 0.6,
    "max": 1.2,
    "default": 0.9
  },
  "energyEfficiency": {
    "min": 0.5,
    "max": 0.8,
    "default": 0.65
  }
}
```

**Color Palette:**
- <span style="background-color: #1F1A10; padding: 2px 8px; border-radius: 3px;">#1F1A10</span>
- <span style="background-color: #535652; padding: 2px 8px; border-radius: 3px;">#535652</span>
- <span style="background-color: #90928F; padding: 2px 8px; border-radius: 3px;">#90928F</span>
- <span style="background-color: #7A5C39; padding: 2px 8px; border-radius: 3px;">#7A5C39</span>
- <span style="background-color: #CAC3BD; padding: 2px 8px; border-radius: 3px;">#CAC3BD</span>

**PBR Properties:**
```json
{
  "baseColor": "#535652",
  "roughness": 0.7,
  "metallic": 0.2,
  "normalStrength": 1,
  "aoStrength": 0.6,
  "heightScale": 0.1,
  "emissive": "#7A5C39"
}
```

**Procedural Rules:**
> Coloration changes based on temperature and proximity to prey.

**Textures:**
- **Leather011** (Leather): <img src="../../packages/gen/public/textures/leather/Leather011_bundle_2K.jpg" alt="Leather 011" width="200" />
- **Fabric019** (Fabric): <img src="../../packages/gen/public/textures/fabric/Fabric019_bundle_2K.jpg" alt="Fabric 019" width="200" />

---

#### Sand Sculptor (`sand_sculptor`)

**Description:** A creature adept at reshaping sandy and rocky environments using adapted appendages, forming intricate structures and nests.

**Parameters:**
```json
{
  "metabolicRate": {
    "min": 0.8,
    "max": 1.2,
    "default": 1
  },
  "sensoryRange": {
    "min": 1,
    "max": 1.5,
    "default": 1.25
  },
  "immuneStrength": {
    "min": 1,
    "max": 1.5,
    "default": 1.25
  },
  "reproductiveRate": {
    "min": 0.7,
    "max": 1.3,
    "default": 1
  },
  "energyEfficiency": {
    "min": 1,
    "max": 1.5,
    "default": 1.25
  }
}
```

**Color Palette:**
- <span style="background-color: #F4E8C1; padding: 2px 8px; border-radius: 3px;">#F4E8C1</span>
- <span style="background-color: #C2A477; padding: 2px 8px; border-radius: 3px;">#C2A477</span>
- <span style="background-color: #8F746C; padding: 2px 8px; border-radius: 3px;">#8F746C</span>
- <span style="background-color: #B49768; padding: 2px 8px; border-radius: 3px;">#B49768</span>
- <span style="background-color: #DECBA4; padding: 2px 8px; border-radius: 3px;">#DECBA4</span>

**PBR Properties:**
```json
{
  "baseColor": "#B49768",
  "roughness": 0.9,
  "metallic": 0.2,
  "normalStrength": 1.2,
  "aoStrength": 0.7,
  "heightScale": 0.02,
  "emissive": "#C2A477"
}
```

**Procedural Rules:**
> Surface patterns vary with humidity and temperature.

**Textures:**
- **Leather012** (Leather): <img src="../../packages/gen/public/textures/leather/Leather012_bundle_2K.jpg" alt="Leather 012" width="200" />
- **Fabric023** (Fabric): <img src="../../packages/gen/public/textures/fabric/Fabric023_bundle_2K.jpg" alt="Fabric 023" width="200" />

---

#### Fiber Forager (`fiber_forager`)

**Description:** A herbivorous creature specialized in digesting high-fiber diets extracted from wood-like materials, supporting efficient community dynamics.

**Parameters:**
```json
{
  "metabolicRate": {
    "min": 1.2,
    "max": 1.5,
    "default": 1.35
  },
  "sensoryRange": {
    "min": 0.8,
    "max": 1.2,
    "default": 1
  },
  "immuneStrength": {
    "min": 1.2,
    "max": 1.8,
    "default": 1.5
  },
  "reproductiveRate": {
    "min": 1,
    "max": 1.5,
    "default": 1.25
  },
  "energyEfficiency": {
    "min": 1,
    "max": 1.5,
    "default": 1.25
  }
}
```

**Color Palette:**
- <span style="background-color: #897D68; padding: 2px 8px; border-radius: 3px;">#897D68</span>
- <span style="background-color: #D2CCA1; padding: 2px 8px; border-radius: 3px;">#D2CCA1</span>
- <span style="background-color: #A79956; padding: 2px 8px; border-radius: 3px;">#A79956</span>
- <span style="background-color: #AC8D6F; padding: 2px 8px; border-radius: 3px;">#AC8D6F</span>
- <span style="background-color: #766C5B; padding: 2px 8px; border-radius: 3px;">#766C5B</span>

**PBR Properties:**
```json
{
  "baseColor": "#897D68",
  "roughness": 0.85,
  "metallic": 0.1,
  "normalStrength": 1.1,
  "aoStrength": 0.7,
  "heightScale": 0.04,
  "emissive": "#D2CCA1"
}
```

**Procedural Rules:**
> Fibrous textures evolve with age, reflecting the maturity of individual's diet.

**Textures:**
- **Fabric023** (Fabric): <img src="../../packages/gen/public/textures/fabric/Fabric023_bundle_2K.jpg" alt="Fabric 023" width="200" />
- **Leather011** (Leather): <img src="../../packages/gen/public/textures/leather/Leather011_bundle_2K.jpg" alt="Leather 011" width="200" />

---

#### Resilient Rambler (`resilient_rambler`)

**Description:** Designed for long-distance travel across diverse terrains, this creature's physiology allows for minimal energy usage during migration.

**Parameters:**
```json
{
  "metabolicRate": {
    "min": 0.5,
    "max": 0.8,
    "default": 0.65
  },
  "sensoryRange": {
    "min": 1,
    "max": 1.4,
    "default": 1.2
  },
  "immuneStrength": {
    "min": 1.4,
    "max": 2,
    "default": 1.7
  },
  "reproductiveRate": {
    "min": 0.6,
    "max": 1.1,
    "default": 0.85
  },
  "energyEfficiency": {
    "min": 1.5,
    "max": 2,
    "default": 1.75
  }
}
```

**Color Palette:**
- <span style="background-color: #A39485; padding: 2px 8px; border-radius: 3px;">#A39485</span>
- <span style="background-color: #675B45; padding: 2px 8px; border-radius: 3px;">#675B45</span>
- <span style="background-color: #3C3C3A; padding: 2px 8px; border-radius: 3px;">#3C3C3A</span>
- <span style="background-color: #B9B8AB; padding: 2px 8px; border-radius: 3px;">#B9B8AB</span>
- <span style="background-color: #8F827D; padding: 2px 8px; border-radius: 3px;">#8F827D</span>

**PBR Properties:**
```json
{
  "baseColor": "#675B45",
  "roughness": 0.88,
  "metallic": 0.15,
  "normalStrength": 0.7,
  "aoStrength": 0.5,
  "heightScale": 0.03,
  "emissive": "#8F827D"
}
```

**Procedural Rules:**
> Visual patterns alter with their extensive travel across varied terrains.

**Textures:**
- **Leather012** (Leather): <img src="../../packages/gen/public/textures/leather/Leather012_bundle_2K.jpg" alt="Leather 012" width="200" />
- **Fabric019** (Fabric): <img src="../../packages/gen/public/textures/fabric/Fabric019_bundle_2K.jpg" alt="Fabric 019" width="200" />

---

#### Covert Cloaker (`covert_cloaker`)

**Description:** Possesses advanced systems for camouflage, integrating sophisticated hormonal responses controlling skin and fur textures and colors.

**Parameters:**
```json
{
  "metabolicRate": {
    "min": 0.9,
    "max": 1.3,
    "default": 1.1
  },
  "sensoryRange": {
    "min": 1.5,
    "max": 2,
    "default": 1.75
  },
  "immuneStrength": {
    "min": 0.8,
    "max": 1.3,
    "default": 1.05
  },
  "reproductiveRate": {
    "min": 0.7,
    "max": 1.2,
    "default": 0.95
  },
  "energyEfficiency": {
    "min": 1.2,
    "max": 1.8,
    "default": 1.5
  }
}
```

**Color Palette:**
- <span style="background-color: #2E2E28; padding: 2px 8px; border-radius: 3px;">#2E2E28</span>
- <span style="background-color: #4C4C47; padding: 2px 8px; border-radius: 3px;">#4C4C47</span>
- <span style="background-color: #6B6B60; padding: 2px 8px; border-radius: 3px;">#6B6B60</span>
- <span style="background-color: #EFEDEB; padding: 2px 8px; border-radius: 3px;">#EFEDEB</span>
- <span style="background-color: #D2D0CA; padding: 2px 8px; border-radius: 3px;">#D2D0CA</span>

**PBR Properties:**
```json
{
  "baseColor": "#6B6B60",
  "roughness": 0.92,
  "metallic": 0.05,
  "normalStrength": 1.3,
  "aoStrength": 0.8,
  "heightScale": 0.05,
  "emissive": "#EFEDEB"
}
```

**Procedural Rules:**
> Color and texture adaptation occurs via local hormonal modulation based on threat level.

**Textures:**
- **Leather011** (Leather): <img src="../../packages/gen/public/textures/leather/Leather011_bundle_2K.jpg" alt="Leather 011" width="200" />
- **Fabric019** (Fabric): <img src="../../packages/gen/public/textures/fabric/Fabric019_bundle_2K.jpg" alt="Fabric 019" width="200" />

---


---

## Gen 2: Pack Dynamics {#generation-2}

**WARP Flow:** Inheriting knowledge from previous generation:
- **Gen 1: ECS Archetypes** provided:
  - "Chromatic Cartographer", "Silk Weaver", "Herbal Forager", "Arid Engineers", "Nocturnal Chaser"...
  - Total: 16 archetypes across all scales

---

### MACRO: System-level context and foundational patterns

**Total Archetypes:** 10

#### Iron Vein Enclave (`archetype_001`)

**Description:** Territories organized around dense deposits of metal-rich veins, these enclaves are structurally fortified by naturally occurring iron-rich geology.

**Parameters:**
```json
{
  "territorySize": {
    "min": 1,
    "max": 5,
    "default": 3.5
  },
  "resourceDensity": {
    "min": 0.6,
    "max": 1,
    "default": 0.85
  },
  "defensiveValue": {
    "min": 0.7,
    "max": 1,
    "default": 0.9
  },
  "migrationPattern": {
    "min": 0.4,
    "max": 0.8,
    "default": 0.6
  }
}
```

**Color Palette:**
- <span style="background-color: #5A5F60; padding: 2px 8px; border-radius: 3px;">#5A5F60</span>
- <span style="background-color: #2C3E50; padding: 2px 8px; border-radius: 3px;">#2C3E50</span>
- <span style="background-color: #7F8C8D; padding: 2px 8px; border-radius: 3px;">#7F8C8D</span>
- <span style="background-color: #BDC3C7; padding: 2px 8px; border-radius: 3px;">#BDC3C7</span>
- <span style="background-color: #95A5A6; padding: 2px 8px; border-radius: 3px;">#95A5A6</span>

**PBR Properties:**
```json
{
  "baseColor": "#5A5F60",
  "roughness": 0.85,
  "metallic": 0.7,
  "normalStrength": 1,
  "aoStrength": 0.8,
  "heightScale": 0.04,
  "emissive": "#95A5A6"
}
```

**Procedural Rules:**
> Metallic expansions occur around high-density nodes, generating reflective patches on surfaces.

**Textures:**
- **Metal049A** (Metal): <img src="../../packages/gen/public/textures/metal/Metal049A_bundle_2K.jpg" alt="Metal 049 A" width="200" />
- **Rock030** (Rock): <img src="../../packages/gen/public/textures/rock/Rock030_bundle_2K.jpg" alt="Rock 030" width="200" />

---

#### Aqua Carrara Cluster (`archetype_002`)

**Description:** Packs cluster around vital water sources, forming lush, vibrant biomes essential for hydration-dependent species.

**Parameters:**
```json
{
  "territorySize": {
    "min": 2,
    "max": 10,
    "default": 6
  },
  "resourceDensity": {
    "min": 0.8,
    "max": 1,
    "default": 0.95
  },
  "defensiveValue": {
    "min": 0.3,
    "max": 0.7,
    "default": 0.5
  },
  "migrationPattern": {
    "min": 0.7,
    "max": 1,
    "default": 0.85
  }
}
```

**Color Palette:**
- <span style="background-color: #69B34C; padding: 2px 8px; border-radius: 3px;">#69B34C</span>
- <span style="background-color: #A9DFBF; padding: 2px 8px; border-radius: 3px;">#A9DFBF</span>
- <span style="background-color: #2ECC71; padding: 2px 8px; border-radius: 3px;">#2ECC71</span>
- <span style="background-color: #58D68D; padding: 2px 8px; border-radius: 3px;">#58D68D</span>
- <span style="background-color: #239B56; padding: 2px 8px; border-radius: 3px;">#239B56</span>

**PBR Properties:**
```json
{
  "baseColor": "#69B34C",
  "roughness": 0.65,
  "metallic": 0,
  "normalStrength": 1.2,
  "aoStrength": 0.7,
  "heightScale": 0.03,
  "emissive": "#A9DFBF"
}
```

**Procedural Rules:**
> Grass coverage varies with water access, allowing lush growth near springs.

**Textures:**
- **Grass001** (Grass): <img src="../../packages/gen/public/textures/grass/Grass001_bundle_2K.jpg" alt="Grass 001" width="200" />
- **Rock025** (unknown): `Rock025` (not found in manifest)

---

#### Crystalline Basin Territory (`archetype_004`)

**Description:** These territories form within crystalline basins rich in reflective minerals, providing both resources and concealment.

**Parameters:**
```json
{
  "territorySize": {
    "min": 1.2,
    "max": 3.8,
    "default": 2.5
  },
  "resourceDensity": {
    "min": 0.65,
    "max": 0.9,
    "default": 0.75
  },
  "defensiveValue": {
    "min": 0.6,
    "max": 0.85,
    "default": 0.75
  },
  "migrationPattern": {
    "min": 0.5,
    "max": 0.9,
    "default": 0.7
  }
}
```

**Color Palette:**
- <span style="background-color: #FFFFFF; padding: 2px 8px; border-radius: 3px;">#FFFFFF</span>
- <span style="background-color: #E0E0E0; padding: 2px 8px; border-radius: 3px;">#E0E0E0</span>
- <span style="background-color: #B3B6B7; padding: 2px 8px; border-radius: 3px;">#B3B6B7</span>
- <span style="background-color: #A6ACAF; padding: 2px 8px; border-radius: 3px;">#A6ACAF</span>
- <span style="background-color: #DAE0E2; padding: 2px 8px; border-radius: 3px;">#DAE0E2</span>

**PBR Properties:**
```json
{
  "baseColor": "#FFFFFF",
  "roughness": 0.5,
  "metallic": 0.3,
  "normalStrength": 1.5,
  "aoStrength": 0.6,
  "heightScale": 0.04,
  "emissive": "#E0E0E0"
}
```

**Procedural Rules:**
> Crystals reflect sunlight creating shifting light patterns across the terrain.

**Textures:**
- **Rock030** (Rock): <img src="../../packages/gen/public/textures/rock/Rock030_bundle_2K.jpg" alt="Rock 030" width="200" />
- **Metal050** (unknown): `Metal050` (not found in manifest)

---

#### Luminous Meadow Nest (`archetype_005`)

**Description:** Bright, open meadows that rely on exposure to sunlight, serving as nesting grounds for visually oriented species.

**Parameters:**
```json
{
  "territorySize": {
    "min": 3,
    "max": 8,
    "default": 5
  },
  "resourceDensity": {
    "min": 0.4,
    "max": 0.7,
    "default": 0.6
  },
  "defensiveValue": {
    "min": 0.2,
    "max": 0.5,
    "default": 0.35
  },
  "migrationPattern": {
    "min": 0.7,
    "max": 1,
    "default": 0.85
  }
}
```

**Color Palette:**
- <span style="background-color: #B3E5FC; padding: 2px 8px; border-radius: 3px;">#B3E5FC</span>
- <span style="background-color: #81D4FA; padding: 2px 8px; border-radius: 3px;">#81D4FA</span>
- <span style="background-color: #4FC3F7; padding: 2px 8px; border-radius: 3px;">#4FC3F7</span>
- <span style="background-color: #29B6F6; padding: 2px 8px; border-radius: 3px;">#29B6F6</span>
- <span style="background-color: #039BE5; padding: 2px 8px; border-radius: 3px;">#039BE5</span>

**PBR Properties:**
```json
{
  "baseColor": "#B3E5FC",
  "roughness": 0.55,
  "metallic": 0,
  "normalStrength": 1,
  "aoStrength": 0.4,
  "heightScale": 0.03,
  "emissive": "#81D4FA"
}
```

**Procedural Rules:**
> Meadow blooms are regulated by sunlight availability producing varied greens and yellows.

**Textures:**
- **Grass001** (Grass): <img src="../../packages/gen/public/textures/grass/Grass001_bundle_2K.jpg" alt="Grass 001" width="200" />
- **Rock025** (unknown): `Rock025` (not found in manifest)

---

#### Thermal Vent Haven (`archetype_007`)

**Description:** Territories centered on geothermal vents providing warmth and essential minerals for thermally-adapted species.

**Parameters:**
```json
{
  "territorySize": {
    "min": 1,
    "max": 3,
    "default": 2
  },
  "resourceDensity": {
    "min": 0.9,
    "max": 1,
    "default": 0.95
  },
  "defensiveValue": {
    "min": 0.4,
    "max": 0.6,
    "default": 0.5
  },
  "migrationPattern": {
    "min": 0.3,
    "max": 0.6,
    "default": 0.45
  }
}
```

**Color Palette:**
- <span style="background-color: #D35400; padding: 2px 8px; border-radius: 3px;">#D35400</span>
- <span style="background-color: #E59866; padding: 2px 8px; border-radius: 3px;">#E59866</span>
- <span style="background-color: #F8C471; padding: 2px 8px; border-radius: 3px;">#F8C471</span>
- <span style="background-color: #F39C12; padding: 2px 8px; border-radius: 3px;">#F39C12</span>
- <span style="background-color: #D68910; padding: 2px 8px; border-radius: 3px;">#D68910</span>

**PBR Properties:**
```json
{
  "baseColor": "#D35400",
  "roughness": 0.7,
  "metallic": 0.2,
  "normalStrength": 1.3,
  "aoStrength": 0.75,
  "heightScale": 0.02,
  "emissive": "#F39C12"
}
```

**Procedural Rules:**
> Heat distortion effects create a shimmering landscape above prominent vents.

**Textures:**
- **Rock030** (Rock): <img src="../../packages/gen/public/textures/rock/Rock030_bundle_2K.jpg" alt="Rock 030" width="200" />
- **Metal050** (unknown): `Metal050` (not found in manifest)

---

#### Iron Valley Fortress (`iron_valley_fortress`)

**Description:** A fortified valley surrounded by naturally occurring iron-rich geological formations, providing both defense and abundant resources.

**Parameters:**
```json
{
  "territorySize": {
    "min": 20,
    "max": 50,
    "default": 35
  },
  "resourceDensity": {
    "min": 0.6,
    "max": 0.9,
    "default": 0.75
  },
  "defensiveValue": {
    "min": 0.7,
    "max": 0.95,
    "default": 0.85
  },
  "migrationPattern": {
    "min": 0.1,
    "max": 0.2,
    "default": 0.15
  }
}
```

**Color Palette:**
- <span style="background-color: #3C3C42; padding: 2px 8px; border-radius: 3px;">#3C3C42</span>
- <span style="background-color: #8C9BA5; padding: 2px 8px; border-radius: 3px;">#8C9BA5</span>
- <span style="background-color: #5E7A7D; padding: 2px 8px; border-radius: 3px;">#5E7A7D</span>
- <span style="background-color: #9AA2AA; padding: 2px 8px; border-radius: 3px;">#9AA2AA</span>
- <span style="background-color: #D7DDE1; padding: 2px 8px; border-radius: 3px;">#D7DDE1</span>

**PBR Properties:**
```json
{
  "baseColor": "#3C3C42",
  "roughness": 0.88,
  "metallic": 0.65,
  "normalStrength": 1.4,
  "aoStrength": 0.9,
  "heightScale": 0.08,
  "emissive": "#5E7A7D"
}
```

**Procedural Rules:**
> Iron formations and stone features vary with local tectonic activity, creating a naturally fortified terrain.

**Textures:**
- **Metal049A** (Metal): <img src="../../packages/gen/public/textures/metal/Metal049A_bundle_2K.jpg" alt="Metal 049 A" width="200" />
- **Rock025** (unknown): `Rock025` (not found in manifest)

---

#### Sunken Thermal Cluster (`sunken_thermal_cluster`)

**Description:** A cluster of valley territories warmed by geothermal activity, providing ideal conditions for creatures seeking warmth and metallic resources.

**Parameters:**
```json
{
  "territorySize": {
    "min": 15,
    "max": 40,
    "default": 30
  },
  "resourceDensity": {
    "min": 0.5,
    "max": 0.8,
    "default": 0.65
  },
  "defensiveValue": {
    "min": 0.3,
    "max": 0.7,
    "default": 0.5
  },
  "migrationPattern": {
    "min": 0.2,
    "max": 0.4,
    "default": 0.3
  }
}
```

**Color Palette:**
- <span style="background-color: #2A2E35; padding: 2px 8px; border-radius: 3px;">#2A2E35</span>
- <span style="background-color: #545C66; padding: 2px 8px; border-radius: 3px;">#545C66</span>
- <span style="background-color: #BEC4C9; padding: 2px 8px; border-radius: 3px;">#BEC4C9</span>
- <span style="background-color: #758998; padding: 2px 8px; border-radius: 3px;">#758998</span>
- <span style="background-color: #E1E5EA; padding: 2px 8px; border-radius: 3px;">#E1E5EA</span>

**PBR Properties:**
```json
{
  "baseColor": "#2A2E35",
  "roughness": 0.85,
  "metallic": 0.5,
  "normalStrength": 1.2,
  "aoStrength": 0.75,
  "heightScale": 0.06,
  "emissive": "#758998"
}
```

**Procedural Rules:**
> Geothermal activity creates patchy warmth patterns on the surface, altering snow and vegetation cover.

**Textures:**
- **Rock030** (Rock): <img src="../../packages/gen/public/textures/rock/Rock030_bundle_2K.jpg" alt="Rock 030" width="200" />
- **Metal049A** (Metal): <img src="../../packages/gen/public/textures/metal/Metal049A_bundle_2K.jpg" alt="Metal 049 A" width="200" />

---

#### Waterfall Oasis Collective (`waterfall_oasis_collective`)

**Description:** A series of lush areas formed around waterfalls, providing hydration, visual cover, and a gathering point for diverse pack integrations.

**Parameters:**
```json
{
  "territorySize": {
    "min": 10,
    "max": 25,
    "default": 18
  },
  "resourceDensity": {
    "min": 0.7,
    "max": 0.95,
    "default": 0.85
  },
  "defensiveValue": {
    "min": 0.4,
    "max": 0.8,
    "default": 0.6
  },
  "migrationPattern": {
    "min": 0.35,
    "max": 0.6,
    "default": 0.5
  }
}
```

**Color Palette:**
- <span style="background-color: #D2E0E2; padding: 2px 8px; border-radius: 3px;">#D2E0E2</span>
- <span style="background-color: #90A9A8; padding: 2px 8px; border-radius: 3px;">#90A9A8</span>
- <span style="background-color: #54A387; padding: 2px 8px; border-radius: 3px;">#54A387</span>
- <span style="background-color: #D1E6C4; padding: 2px 8px; border-radius: 3px;">#D1E6C4</span>
- <span style="background-color: #F2F7F2; padding: 2px 8px; border-radius: 3px;">#F2F7F2</span>

**PBR Properties:**
```json
{
  "baseColor": "#D2E0E2",
  "roughness": 0.55,
  "metallic": 0.2,
  "normalStrength": 1,
  "aoStrength": 0.65,
  "heightScale": 0.04,
  "emissive": "#54A387"
}
```

**Procedural Rules:**
> Vegetation density varies with proximity to water sources, while stone formations provide natural barriers.

**Textures:**
- **Grass001** (Grass): <img src="../../packages/gen/public/textures/grass/Grass001_bundle_2K.jpg" alt="Grass 001" width="200" />
- **Rock025** (unknown): `Rock025` (not found in manifest)

---

#### Elevated Watch Point (`elevated_watch_point`)

**Description:** High ground formations offering strategic viewpoints, utilized by packs for observation and early detection of resources or threats.

**Parameters:**
```json
{
  "territorySize": {
    "min": 5,
    "max": 15,
    "default": 10
  },
  "resourceDensity": {
    "min": 0.2,
    "max": 0.5,
    "default": 0.35
  },
  "defensiveValue": {
    "min": 0.5,
    "max": 0.9,
    "default": 0.75
  },
  "migrationPattern": {
    "min": 0.05,
    "max": 0.15,
    "default": 0.1
  }
}
```

**Color Palette:**
- <span style="background-color: #5D6D58; padding: 2px 8px; border-radius: 3px;">#5D6D58</span>
- <span style="background-color: #A9B9A6; padding: 2px 8px; border-radius: 3px;">#A9B9A6</span>
- <span style="background-color: #D4DBD6; padding: 2px 8px; border-radius: 3px;">#D4DBD6</span>
- <span style="background-color: #32412A; padding: 2px 8px; border-radius: 3px;">#32412A</span>
- <span style="background-color: #C5CEC8; padding: 2px 8px; border-radius: 3px;">#C5CEC8</span>

**PBR Properties:**
```json
{
  "baseColor": "#5D6D58",
  "roughness": 0.92,
  "metallic": 0.1,
  "normalStrength": 1.3,
  "aoStrength": 0.7,
  "heightScale": 0.07,
  "emissive": "#A9B9A6"
}
```

**Procedural Rules:**
> Steep inclines with rocky outcrops serve as natural lookouts; vegetation sparse.

**Textures:**
- **Rock025** (unknown): `Rock025` (not found in manifest)
- **Grass002** (Grass): <img src="../../packages/gen/public/textures/grass/Grass002_bundle_2K.jpg" alt="Grass 002" width="200" />

---

#### Underground Network Hub (`underground_network_hub`)

**Description:** Subterranean ecosystems interconnected by vast networks of tunnels, facilitating resource transfer and concealed migratory paths.

**Parameters:**
```json
{
  "territorySize": {
    "min": 10,
    "max": 30,
    "default": 20
  },
  "resourceDensity": {
    "min": 0.8,
    "max": 1,
    "default": 0.9
  },
  "defensiveValue": {
    "min": 0.65,
    "max": 0.85,
    "default": 0.75
  },
  "migrationPattern": {
    "min": 0.3,
    "max": 0.55,
    "default": 0.45
  }
}
```

**Color Palette:**
- <span style="background-color: #353D46; padding: 2px 8px; border-radius: 3px;">#353D46</span>
- <span style="background-color: #696F73; padding: 2px 8px; border-radius: 3px;">#696F73</span>
- <span style="background-color: #A2A8AC; padding: 2px 8px; border-radius: 3px;">#A2A8AC</span>
- <span style="background-color: #4B5157; padding: 2px 8px; border-radius: 3px;">#4B5157</span>
- <span style="background-color: #CACFD1; padding: 2px 8px; border-radius: 3px;">#CACFD1</span>

**PBR Properties:**
```json
{
  "baseColor": "#353D46",
  "roughness": 0.9,
  "metallic": 0.4,
  "normalStrength": 1.5,
  "aoStrength": 0.85,
  "heightScale": 0.09,
  "emissive": "#4B5157"
}
```

**Procedural Rules:**
> Complex tunnel systems vary with depth, creating interwoven pathways reinforced by metallic veins.

**Textures:**
- **Rock030** (Rock): <img src="../../packages/gen/public/textures/rock/Rock030_bundle_2K.jpg" alt="Rock 030" width="200" />
- **Metal050** (unknown): `Metal050` (not found in manifest)

---


### MESO: Intermediate dynamics and structural relationships

**WEFT Flow:** Building on MACRO scale archetypes:
- "Iron Vein Enclave", "Aqua Carrara Cluster", "Crystalline Basin Territory"...

**Total Archetypes:** 6

#### Kinship Tribe (`kinship_tribe_001`)

**Description:** A family-based pack structure where leadership is inherited through bloodlines. This structure is prominent among creatures that value heredity and ancestral wisdom.

**Parameters:**
```json
{
  "packSize": {
    "min": 5,
    "max": 50,
    "default": 20
  },
  "hierarchyDepth": {
    "min": 1,
    "max": 4,
    "default": 2
  },
  "roleSpecialization": {
    "min": 0.1,
    "max": 0.5,
    "default": 0.3
  },
  "decisionMakingStyle": {
    "min": 0.3,
    "max": 0.7,
    "default": 0.5
  }
}
```

**Color Palette:**
- <span style="background-color: #925639; padding: 2px 8px; border-radius: 3px;">#925639</span>
- <span style="background-color: #D1B982; padding: 2px 8px; border-radius: 3px;">#D1B982</span>
- <span style="background-color: #7A503E; padding: 2px 8px; border-radius: 3px;">#7A503E</span>
- <span style="background-color: #3A1F00; padding: 2px 8px; border-radius: 3px;">#3A1F00</span>
- <span style="background-color: #FFE5B4; padding: 2px 8px; border-radius: 3px;">#FFE5B4</span>

**PBR Properties:**
```json
{
  "baseColor": "#7A503E",
  "roughness": 0.5,
  "metallic": 0,
  "normalStrength": 0.6,
  "aoStrength": 0.7,
  "heightScale": 0.04,
  "emissive": "#925639"
}
```

**Procedural Rules:**
> Cloth-like patterns interwoven with vegetation motifs, symbolizing familial ties.

**Textures:**
- **Fabric019** (Fabric): <img src="../../packages/gen/public/textures/fabric/Fabric019_bundle_2K.jpg" alt="Fabric 019" width="200" />
- **Grass001** (Grass): <img src="../../packages/gen/public/textures/grass/Grass001_bundle_2K.jpg" alt="Grass 001" width="200" />

---

#### Skill Specialists (`skill_specialists_002`)

**Description:** Structured around roles based on individual abilities, these packs excel in task-specific efficiency. Each member specializes in a particular skill to enhance the collective's survival.

**Parameters:**
```json
{
  "packSize": {
    "min": 10,
    "max": 30,
    "default": 15
  },
  "hierarchyDepth": {
    "min": 0.5,
    "max": 1.5,
    "default": 1
  },
  "roleSpecialization": {
    "min": 0.7,
    "max": 1,
    "default": 0.8
  },
  "decisionMakingStyle": {
    "min": 0.3,
    "max": 0.4,
    "default": 0.35
  }
}
```

**Color Palette:**
- <span style="background-color: #C28668; padding: 2px 8px; border-radius: 3px;">#C28668</span>
- <span style="background-color: #DDA15E; padding: 2px 8px; border-radius: 3px;">#DDA15E</span>
- <span style="background-color: #BC6C25; padding: 2px 8px; border-radius: 3px;">#BC6C25</span>
- <span style="background-color: #8C4C04; padding: 2px 8px; border-radius: 3px;">#8C4C04</span>
- <span style="background-color: #F7C59F; padding: 2px 8px; border-radius: 3px;">#F7C59F</span>

**PBR Properties:**
```json
{
  "baseColor": "#BC6C25",
  "roughness": 0.7,
  "metallic": 0.1,
  "normalStrength": 0.8,
  "aoStrength": 0.6,
  "heightScale": 0.03,
  "emissive": "#C28668"
}
```

**Procedural Rules:**
> Patchwork of leather and natural textures, indicating task-oriented roles.

**Textures:**
- **Leather011** (Leather): <img src="../../packages/gen/public/textures/leather/Leather011_bundle_2K.jpg" alt="Leather 011" width="200" />
- **Grass002** (Grass): <img src="../../packages/gen/public/textures/grass/Grass002_bundle_2K.jpg" alt="Grass 002" width="200" />

---

#### Age Hierarchy (`age_hierarchy_003`)

**Description:** Leadership is based on age and experience, with older individuals guiding younger ones through wisdom accumulated over time.

**Parameters:**
```json
{
  "packSize": {
    "min": 8,
    "max": 40,
    "default": 25
  },
  "hierarchyDepth": {
    "min": 1,
    "max": 3,
    "default": 2
  },
  "roleSpecialization": {
    "min": 0.2,
    "max": 0.6,
    "default": 0.4
  },
  "decisionMakingStyle": {
    "min": 0.6,
    "max": 0.9,
    "default": 0.75
  }
}
```

**Color Palette:**
- <span style="background-color: #6B4226; padding: 2px 8px; border-radius: 3px;">#6B4226</span>
- <span style="background-color: #C3A995; padding: 2px 8px; border-radius: 3px;">#C3A995</span>
- <span style="background-color: #A6793E; padding: 2px 8px; border-radius: 3px;">#A6793E</span>
- <span style="background-color: #42210B; padding: 2px 8px; border-radius: 3px;">#42210B</span>
- <span style="background-color: #FFD8A9; padding: 2px 8px; border-radius: 3px;">#FFD8A9</span>

**PBR Properties:**
```json
{
  "baseColor": "#6B4226",
  "roughness": 0.6,
  "metallic": 0,
  "normalStrength": 0.7,
  "aoStrength": 0.8,
  "heightScale": 0.02,
  "emissive": "#FFD8A9"
}
```

**Procedural Rules:**
> Patterns of layered fabric dyed in subdued tones, indicating lineage and wisdom.

**Textures:**
- **Fabric023** (Fabric): <img src="../../packages/gen/public/textures/fabric/Fabric023_bundle_2K.jpg" alt="Fabric 023" width="200" />
- **Grass001** (Grass): <img src="../../packages/gen/public/textures/grass/Grass001_bundle_2K.jpg" alt="Grass 001" width="200" />

---

#### Meritocracy Ring (`meritocracy_ring_004`)

**Description:** Members gain status and leadership roles based on individual achievement and ability, fostering a competitive environment where merit decides hierarchy.

**Parameters:**
```json
{
  "packSize": {
    "min": 5,
    "max": 20,
    "default": 12
  },
  "hierarchyDepth": {
    "min": 0.5,
    "max": 2.5,
    "default": 1.5
  },
  "roleSpecialization": {
    "min": 0.6,
    "max": 1,
    "default": 0.7
  },
  "decisionMakingStyle": {
    "min": 0.4,
    "max": 0.6,
    "default": 0.5
  }
}
```

**Color Palette:**
- <span style="background-color: #D4A73F; padding: 2px 8px; border-radius: 3px;">#D4A73F</span>
- <span style="background-color: #998A2F; padding: 2px 8px; border-radius: 3px;">#998A2F</span>
- <span style="background-color: #73661A; padding: 2px 8px; border-radius: 3px;">#73661A</span>
- <span style="background-color: #443D1B; padding: 2px 8px; border-radius: 3px;">#443D1B</span>
- <span style="background-color: #FFE788; padding: 2px 8px; border-radius: 3px;">#FFE788</span>

**PBR Properties:**
```json
{
  "baseColor": "#998A2F",
  "roughness": 0.5,
  "metallic": 0.4,
  "normalStrength": 0.9,
  "aoStrength": 0.6,
  "heightScale": 0.06,
  "emissive": "#D4A73F"
}
```

**Procedural Rules:**
> Circular metal motifs encompassed by grass textures, symbolizing agility and talent.

**Textures:**
- **Metal049A** (Metal): <img src="../../packages/gen/public/textures/metal/Metal049A_bundle_2K.jpg" alt="Metal 049 A" width="200" />
- **Grass002** (Grass): <img src="../../packages/gen/public/textures/grass/Grass002_bundle_2K.jpg" alt="Grass 002" width="200" />

---

#### Egalitarian Swarm (`egalitarian_swarm_005`)

**Description:** A cooperative structure emphasizing shared leadership and collective decision-making, maximizing the group's overall cohesion and adaptability.

**Parameters:**
```json
{
  "packSize": {
    "min": 15,
    "max": 60,
    "default": 30
  },
  "hierarchyDepth": {
    "min": 0.1,
    "max": 1,
    "default": 0.5
  },
  "roleSpecialization": {
    "min": 0.3,
    "max": 0.7,
    "default": 0.5
  },
  "decisionMakingStyle": {
    "min": 0.7,
    "max": 0.9,
    "default": 0.8
  }
}
```

**Color Palette:**
- <span style="background-color: #A8D0DB; padding: 2px 8px; border-radius: 3px;">#A8D0DB</span>
- <span style="background-color: #70A1A1; padding: 2px 8px; border-radius: 3px;">#70A1A1</span>
- <span style="background-color: #505955; padding: 2px 8px; border-radius: 3px;">#505955</span>
- <span style="background-color: #324E58; padding: 2px 8px; border-radius: 3px;">#324E58</span>
- <span style="background-color: #DCF3EF; padding: 2px 8px; border-radius: 3px;">#DCF3EF</span>

**PBR Properties:**
```json
{
  "baseColor": "#70A1A1",
  "roughness": 0.8,
  "metallic": 0,
  "normalStrength": 0.5,
  "aoStrength": 0.9,
  "heightScale": 0.01,
  "emissive": "#A8D0DB"
}
```

**Procedural Rules:**
> Natural textures blend into one another, showcasing unity and adaptability.

**Textures:**
- **Rock025** (unknown): `Rock025` (not found in manifest)
- **Grass001** (Grass): <img src="../../packages/gen/public/textures/grass/Grass001_bundle_2K.jpg" alt="Grass 001" width="200" />

---

#### Loner Alliance (`loner_alliance_006`)

**Description:** A temporary and loose organization of individually-minded creatures who come together for mutual benefit when solitary existence becomes unsustainable.

**Parameters:**
```json
{
  "packSize": {
    "min": 3,
    "max": 10,
    "default": 5
  },
  "hierarchyDepth": {
    "min": 0,
    "max": 0.2,
    "default": 0.1
  },
  "roleSpecialization": {
    "min": 0.1,
    "max": 0.2,
    "default": 0.15
  },
  "decisionMakingStyle": {
    "min": 0.3,
    "max": 0.4,
    "default": 0.35
  }
}
```

**Color Palette:**
- <span style="background-color: #5F6E78; padding: 2px 8px; border-radius: 3px;">#5F6E78</span>
- <span style="background-color: #9DA7B1; padding: 2px 8px; border-radius: 3px;">#9DA7B1</span>
- <span style="background-color: #B3BAC2; padding: 2px 8px; border-radius: 3px;">#B3BAC2</span>
- <span style="background-color: #CACED2; padding: 2px 8px; border-radius: 3px;">#CACED2</span>
- <span style="background-color: #DDE4EA; padding: 2px 8px; border-radius: 3px;">#DDE4EA</span>

**PBR Properties:**
```json
{
  "baseColor": "#9DA7B1",
  "roughness": 0.9,
  "metallic": 0,
  "normalStrength": 0.4,
  "aoStrength": 0.8,
  "heightScale": 0.02,
  "emissive": "#5F6E78"
}
```

**Procedural Rules:**
> Fragmented and rough textures suggesting temporary stitches and alliances.

**Textures:**
- **Fabric019** (Fabric): <img src="../../packages/gen/public/textures/fabric/Fabric019_bundle_2K.jpg" alt="Fabric 019" width="200" />
- **Rock025** (unknown): `Rock025` (not found in manifest)

---


### MICRO: Fine-grained details and specific implementations

**WEFT Flow:** Building on MACRO and MESO scales:
- MACRO: "Iron Vein Enclave", "Aqua Carrara Cluster"...
- MESO: "Kinship Tribe", "Skill Specialists"...

**Total Archetypes:** 8

#### Alpha Coordinator (`alpha_coordinator`)

**Description:** An individual who takes on the leadership role within the pack, utilizing advanced problem-solving skills and adaptive communication to steer the pack's direction effectively.

**Parameters:**
```json
{
  "leadershipPresence": {
    "min": 0.7,
    "max": 1,
    "default": 0.9
  },
  "communicationComplexity": {
    "min": 0.8,
    "max": 1,
    "default": 0.9
  },
  "strategicVision": {
    "min": 0.6,
    "max": 1,
    "default": 0.8
  },
  "empathy": {
    "min": 0.5,
    "max": 0.9,
    "default": 0.7
  }
}
```

**Color Palette:**
- <span style="background-color: #3A3A3A; padding: 2px 8px; border-radius: 3px;">#3A3A3A</span>
- <span style="background-color: #D1BEB0; padding: 2px 8px; border-radius: 3px;">#D1BEB0</span>
- <span style="background-color: #F2E8C9; padding: 2px 8px; border-radius: 3px;">#F2E8C9</span>
- <span style="background-color: #88624F; padding: 2px 8px; border-radius: 3px;">#88624F</span>
- <span style="background-color: #362C28; padding: 2px 8px; border-radius: 3px;">#362C28</span>

**PBR Properties:**
```json
{
  "baseColor": "#3A3A3A",
  "roughness": 0.5,
  "metallic": 0,
  "normalStrength": 1,
  "aoStrength": 0.9,
  "heightScale": 0.05,
  "emissive": "#D1BEB0"
}
```

**Procedural Rules:**
> Variations in leadership markings are more pronounced, with accents highlighting dominance.

**Textures:**
- **Leather011** (Leather): <img src="../../packages/gen/public/textures/leather/Leather011_bundle_2K.jpg" alt="Leather 011" width="200" />
- **Fabric023** (Fabric): <img src="../../packages/gen/public/textures/fabric/Fabric023_bundle_2K.jpg" alt="Fabric 023" width="200" />

---

#### Resource Allocator (`resource_allocator`)

**Description:** An individual responsible for the management and distribution of resources within the pack, ensuring equitable access and strategic reserves.

**Parameters:**
```json
{
  "resourceManagement": {
    "min": 0.6,
    "max": 1,
    "default": 0.8
  },
  "communicationComplexity": {
    "min": 0.6,
    "max": 0.9,
    "default": 0.75
  },
  "observationSkills": {
    "min": 0.5,
    "max": 0.9,
    "default": 0.7
  },
  "fairness": {
    "min": 0.7,
    "max": 1,
    "default": 0.85
  }
}
```

**Color Palette:**
- <span style="background-color: #5B8B6C; padding: 2px 8px; border-radius: 3px;">#5B8B6C</span>
- <span style="background-color: #99C5B5; padding: 2px 8px; border-radius: 3px;">#99C5B5</span>
- <span style="background-color: #E6A57E; padding: 2px 8px; border-radius: 3px;">#E6A57E</span>
- <span style="background-color: #846747; padding: 2px 8px; border-radius: 3px;">#846747</span>
- <span style="background-color: #B9CBB6; padding: 2px 8px; border-radius: 3px;">#B9CBB6</span>

**PBR Properties:**
```json
{
  "baseColor": "#5B8B6C",
  "roughness": 0.6,
  "metallic": 0,
  "normalStrength": 1,
  "aoStrength": 0.8,
  "heightScale": 0.04,
  "emissive": "#99C5B5"
}
```

**Procedural Rules:**
> Subtle variations in texture indicate resource-specific roles.

**Textures:**
- **Fabric019** (Fabric): <img src="../../packages/gen/public/textures/fabric/Fabric019_bundle_2K.jpg" alt="Fabric 019" width="200" />
- **Leather012** (Leather): <img src="../../packages/gen/public/textures/leather/Leather012_bundle_2K.jpg" alt="Leather 012" width="200" />

---

#### Empathy Signalers (`empathy_signalers`)

**Description:** Individuals engaging in communicating emotional and cognitive states between pack members, enhancing coordination and cohesion.

**Parameters:**
```json
{
  "empathy": {
    "min": 0.8,
    "max": 1,
    "default": 0.9
  },
  "communicationComplexity": {
    "min": 0.7,
    "max": 1,
    "default": 0.85
  },
  "sensitivity": {
    "min": 0.6,
    "max": 0.9,
    "default": 0.75
  },
  "synchronization": {
    "min": 0.5,
    "max": 0.8,
    "default": 0.65
  }
}
```

**Color Palette:**
- <span style="background-color: #A69076; padding: 2px 8px; border-radius: 3px;">#A69076</span>
- <span style="background-color: #FFDDC1; padding: 2px 8px; border-radius: 3px;">#FFDDC1</span>
- <span style="background-color: #FBD4B4; padding: 2px 8px; border-radius: 3px;">#FBD4B4</span>
- <span style="background-color: #F7BFA7; padding: 2px 8px; border-radius: 3px;">#F7BFA7</span>
- <span style="background-color: #CE796B; padding: 2px 8px; border-radius: 3px;">#CE796B</span>

**PBR Properties:**
```json
{
  "baseColor": "#A69076",
  "roughness": 0.7,
  "metallic": 0,
  "normalStrength": 0.8,
  "aoStrength": 0.6,
  "heightScale": 0.03,
  "emissive": "#FBD4B4"
}
```

**Procedural Rules:**
> Texture blends and color gradients reflect emotional states.

**Textures:**
- **Fabric023** (Fabric): <img src="../../packages/gen/public/textures/fabric/Fabric023_bundle_2K.jpg" alt="Fabric 023" width="200" />
- **Leather011** (Leather): <img src="../../packages/gen/public/textures/leather/Leather011_bundle_2K.jpg" alt="Leather 011" width="200" />

---

#### Tactical Hunter (`tactical_hunter`)

**Description:** Individuals specialized in strategic prey handling and hunting coordination, using keen senses and adaptive tactics.

**Parameters:**
```json
{
  "predatorySkills": {
    "min": 0.7,
    "max": 1,
    "default": 0.85
  },
  "stealth": {
    "min": 0.6,
    "max": 0.9,
    "default": 0.75
  },
  "teamCoordination": {
    "min": 0.5,
    "max": 0.8,
    "default": 0.7
  },
  "adaptiveThinking": {
    "min": 0.5,
    "max": 0.9,
    "default": 0.7
  }
}
```

**Color Palette:**
- <span style="background-color: #6B4C3A; padding: 2px 8px; border-radius: 3px;">#6B4C3A</span>
- <span style="background-color: #A07E5E; padding: 2px 8px; border-radius: 3px;">#A07E5E</span>
- <span style="background-color: #D9C8B2; padding: 2px 8px; border-radius: 3px;">#D9C8B2</span>
- <span style="background-color: #402218; padding: 2px 8px; border-radius: 3px;">#402218</span>
- <span style="background-color: #7B6D62; padding: 2px 8px; border-radius: 3px;">#7B6D62</span>

**PBR Properties:**
```json
{
  "baseColor": "#6B4C3A",
  "roughness": 0.8,
  "metallic": 0,
  "normalStrength": 1.3,
  "aoStrength": 0.85,
  "heightScale": 0.06,
  "emissive": "#A07E5E"
}
```

**Procedural Rules:**
> Camouflage variations align with environmental textures for optimum concealment.

**Textures:**
- **Leather012** (Leather): <img src="../../packages/gen/public/textures/leather/Leather012_bundle_2K.jpg" alt="Leather 012" width="200" />
- **Fabric019** (Fabric): <img src="../../packages/gen/public/textures/fabric/Fabric019_bundle_2K.jpg" alt="Fabric 019" width="200" />

---

#### Herbal Healer (`herbal_healer`)

**Description:** Individuals specializing in the identification and use of plants for medicinal purposes, supporting overall pack health.

**Parameters:**
```json
{
  "botanicalKnowledge": {
    "min": 0.7,
    "max": 1,
    "default": 0.85
  },
  "healingAbility": {
    "min": 0.6,
    "max": 1,
    "default": 0.8
  },
  "communicationComplexity": {
    "min": 0.5,
    "max": 0.8,
    "default": 0.7
  },
  "agility": {
    "min": 0.5,
    "max": 0.8,
    "default": 0.65
  }
}
```

**Color Palette:**
- <span style="background-color: #A3B18A; padding: 2px 8px; border-radius: 3px;">#A3B18A</span>
- <span style="background-color: #DAD7CD; padding: 2px 8px; border-radius: 3px;">#DAD7CD</span>
- <span style="background-color: #F6F0E6; padding: 2px 8px; border-radius: 3px;">#F6F0E6</span>
- <span style="background-color: #C2C5BB; padding: 2px 8px; border-radius: 3px;">#C2C5BB</span>
- <span style="background-color: #828C74; padding: 2px 8px; border-radius: 3px;">#828C74</span>

**PBR Properties:**
```json
{
  "baseColor": "#A3B18A",
  "roughness": 0.9,
  "metallic": 0,
  "normalStrength": 0.7,
  "aoStrength": 0.8,
  "heightScale": 0.04,
  "emissive": "#DAD7CD"
}
```

**Procedural Rules:**
> Herb outlines and medicinal patterns vary with regional plant diversity.

**Textures:**
- **Leather011** (Leather): <img src="../../packages/gen/public/textures/leather/Leather011_bundle_2K.jpg" alt="Leather 011" width="200" />
- **Fabric023** (Fabric): <img src="../../packages/gen/public/textures/fabric/Fabric023_bundle_2K.jpg" alt="Fabric 023" width="200" />

---

#### Defensive Guardian (`defensive_guardian`)

**Description:** Individuals focused on protecting pack territory and ensuring safety from external threats, using physical prowess and strategic barriers.

**Parameters:**
```json
{
  "strength": {
    "min": 0.8,
    "max": 1,
    "default": 0.9
  },
  "awareness": {
    "min": 0.6,
    "max": 0.9,
    "default": 0.75
  },
  "territorialInstinct": {
    "min": 0.7,
    "max": 1,
    "default": 0.85
  },
  "decisionMaking": {
    "min": 0.5,
    "max": 0.8,
    "default": 0.65
  }
}
```

**Color Palette:**
- <span style="background-color: #506266; padding: 2px 8px; border-radius: 3px;">#506266</span>
- <span style="background-color: #A7BBC7; padding: 2px 8px; border-radius: 3px;">#A7BBC7</span>
- <span style="background-color: #C3D3E1; padding: 2px 8px; border-radius: 3px;">#C3D3E1</span>
- <span style="background-color: #798A99; padding: 2px 8px; border-radius: 3px;">#798A99</span>
- <span style="background-color: #3D4C54; padding: 2px 8px; border-radius: 3px;">#3D4C54</span>

**PBR Properties:**
```json
{
  "baseColor": "#506266",
  "roughness": 0.9,
  "metallic": 0.1,
  "normalStrength": 1.4,
  "aoStrength": 0.9,
  "heightScale": 0.07,
  "emissive": "#A7BBC7"
}
```

**Procedural Rules:**
> Defensive markings emphasize deterrence through illusionary displays.

**Textures:**
- **Leather012** (Leather): <img src="../../packages/gen/public/textures/leather/Leather012_bundle_2K.jpg" alt="Leather 012" width="200" />
- **Fabric023** (Fabric): <img src="../../packages/gen/public/textures/fabric/Fabric023_bundle_2K.jpg" alt="Fabric 023" width="200" />

---

#### Exploratory Tracker (`exploratory_tracker`)

**Description:** Individuals devoted to exploring new terrains and gathering information about unfamiliar territories, paving the way for pack expansion.

**Parameters:**
```json
{
  "explorationSkills": {
    "min": 0.7,
    "max": 1,
    "default": 0.85
  },
  "navigation": {
    "min": 0.6,
    "max": 0.9,
    "default": 0.75
  },
  "resourceDiscovery": {
    "min": 0.6,
    "max": 0.9,
    "default": 0.75
  },
  "endurance": {
    "min": 0.5,
    "max": 0.8,
    "default": 0.7
  }
}
```

**Color Palette:**
- <span style="background-color: #2E3A44; padding: 2px 8px; border-radius: 3px;">#2E3A44</span>
- <span style="background-color: #687D8B; padding: 2px 8px; border-radius: 3px;">#687D8B</span>
- <span style="background-color: #8FA6B8; padding: 2px 8px; border-radius: 3px;">#8FA6B8</span>
- <span style="background-color: #B1C3D0; padding: 2px 8px; border-radius: 3px;">#B1C3D0</span>
- <span style="background-color: #405C67; padding: 2px 8px; border-radius: 3px;">#405C67</span>

**PBR Properties:**
```json
{
  "baseColor": "#2E3A44",
  "roughness": 0.7,
  "metallic": 0,
  "normalStrength": 1.1,
  "aoStrength": 0.8,
  "heightScale": 0.05,
  "emissive": "#8FA6B8"
}
```

**Procedural Rules:**
> Explorer patterns mimic movement shadows and geographical textures.

**Textures:**
- **Leather011** (Leather): <img src="../../packages/gen/public/textures/leather/Leather011_bundle_2K.jpg" alt="Leather 011" width="200" />
- **Fabric023** (Fabric): <img src="../../packages/gen/public/textures/fabric/Fabric023_bundle_2K.jpg" alt="Fabric 023" width="200" />

---

#### Conflict Mediator (`conflict_mediator`)

**Description:** Individuals skilled in resolving disputes within the pack, aiding in maintaining harmony and cooperative functionality.

**Parameters:**
```json
{
  "mediationSkills": {
    "min": 0.7,
    "max": 1,
    "default": 0.85
  },
  "emotionalIntelligence": {
    "min": 0.6,
    "max": 1,
    "default": 0.8
  },
  "communicationComplexity": {
    "min": 0.5,
    "max": 0.9,
    "default": 0.75
  },
  "persuasion": {
    "min": 0.5,
    "max": 0.9,
    "default": 0.7
  }
}
```

**Color Palette:**
- <span style="background-color: #775A4D; padding: 2px 8px; border-radius: 3px;">#775A4D</span>
- <span style="background-color: #B79D87; padding: 2px 8px; border-radius: 3px;">#B79D87</span>
- <span style="background-color: #DAC3AC; padding: 2px 8px; border-radius: 3px;">#DAC3AC</span>
- <span style="background-color: #ECE2D0; padding: 2px 8px; border-radius: 3px;">#ECE2D0</span>
- <span style="background-color: #947264; padding: 2px 8px; border-radius: 3px;">#947264</span>

**PBR Properties:**
```json
{
  "baseColor": "#775A4D",
  "roughness": 0.8,
  "metallic": 0,
  "normalStrength": 0.9,
  "aoStrength": 0.7,
  "heightScale": 0.04,
  "emissive": "#DAC3AC"
}
```

**Procedural Rules:**
> Patterns highlight diplomatic markings and communication focus points.

**Textures:**
- **Fabric019** (Fabric): <img src="../../packages/gen/public/textures/fabric/Fabric019_bundle_2K.jpg" alt="Fabric 019" width="200" />
- **Leather011** (Leather): <img src="../../packages/gen/public/textures/leather/Leather011_bundle_2K.jpg" alt="Leather 011" width="200" />

---


---

## Gen 3: Tool Systems {#generation-3}

**WARP Flow:** Inheriting knowledge from previous generation:
- **Gen 2: Pack Dynamics** provided:
  - "Iron Vein Enclave", "Aqua Carrara Cluster", "Crystalline Basin Territory", "Luminous Meadow Nest", "Thermal Vent Haven"...
  - Total: 24 archetypes across all scales

---

### MACRO: System-level context and foundational patterns

**Total Archetypes:** 8

#### Deep Vein Network (`macro_1`)

**Description:** A comprehensive mining system engineered to access deep iron-nickel cores, unlocking vital metallic resources previously unreachable by standard excavation methods.

**Parameters:**
```json
{
  "stellarMass": {
    "min": 0.9,
    "max": 1.2,
    "default": 1
  },
  "metallicity": {
    "min": 0.7,
    "max": 1,
    "default": 0.85
  },
  "age": {
    "min": 2,
    "max": 7,
    "default": 4.5
  },
  "orbitalDistance": {
    "min": 0.6,
    "max": 2,
    "default": 1.2
  }
}
```

**Color Palette:**
- <span style="background-color: #4B4B4B; padding: 2px 8px; border-radius: 3px;">#4B4B4B</span>
- <span style="background-color: #313131; padding: 2px 8px; border-radius: 3px;">#313131</span>
- <span style="background-color: #525252; padding: 2px 8px; border-radius: 3px;">#525252</span>
- <span style="background-color: #787878; padding: 2px 8px; border-radius: 3px;">#787878</span>
- <span style="background-color: #A0A0A0; padding: 2px 8px; border-radius: 3px;">#A0A0A0</span>

**PBR Properties:**
```json
{
  "baseColor": "#4B4B4B",
  "roughness": 0.85,
  "metallic": 0.95,
  "normalStrength": 1,
  "aoStrength": 0.7,
  "heightScale": 0.08,
  "emissive": "#313131"
}
```

**Procedural Rules:**
> Variable node branching to simulate natural fissures and cracking.

**Textures:**
- **Metal049A** (Metal): <img src="../../packages/gen/public/textures/metal/Metal049A_bundle_2K.jpg" alt="Metal 049 A" width="200" />
- **Rock030** (Rock): <img src="../../packages/gen/public/textures/rock/Rock030_bundle_2K.jpg" alt="Rock 030" width="200" />

---

#### Thermal Bore Accelerator (`macro_2`)

**Description:** Utilizes geothermal energy to accelerate drill penetration into the carbon mantle, unlocking subterranean carbon-based resources.

**Parameters:**
```json
{
  "stellarMass": {
    "min": 1,
    "max": 1.4,
    "default": 1.1
  },
  "metallicity": {
    "min": 0.4,
    "max": 0.9,
    "default": 0.6
  },
  "age": {
    "min": 3,
    "max": 8,
    "default": 5.5
  },
  "orbitalDistance": {
    "min": 1,
    "max": 3,
    "default": 2
  }
}
```

**Color Palette:**
- <span style="background-color: #866143; padding: 2px 8px; border-radius: 3px;">#866143</span>
- <span style="background-color: #564334; padding: 2px 8px; border-radius: 3px;">#564334</span>
- <span style="background-color: #7C5F38; padding: 2px 8px; border-radius: 3px;">#7C5F38</span>
- <span style="background-color: #A17A50; padding: 2px 8px; border-radius: 3px;">#A17A50</span>
- <span style="background-color: #492B20; padding: 2px 8px; border-radius: 3px;">#492B20</span>

**PBR Properties:**
```json
{
  "baseColor": "#866143",
  "roughness": 0.7,
  "metallic": 0.5,
  "normalStrength": 1.5,
  "aoStrength": 0.9,
  "heightScale": 0.07,
  "emissive": "#564334"
}
```

**Procedural Rules:**
> Fractal surfaces simulate thermal stress and heat-induced coloration variations.

**Textures:**
- **Rock025** (unknown): `Rock025` (not found in manifest)
- **Metal050** (unknown): `Metal050` (not found in manifest)

---

#### Aqua-Seep Extractor (`macro_3`)

**Description:** Designed for deep extraction of volatile compounds from subsurface water channels, retrieving essential life-supporting resources.

**Parameters:**
```json
{
  "stellarMass": {
    "min": 0.8,
    "max": 1.1,
    "default": 0.9
  },
  "metallicity": {
    "min": 0.3,
    "max": 0.8,
    "default": 0.5
  },
  "age": {
    "min": 1,
    "max": 5,
    "default": 3
  },
  "orbitalDistance": {
    "min": 0.7,
    "max": 2.5,
    "default": 1.5
  }
}
```

**Color Palette:**
- <span style="background-color: #2F729C; padding: 2px 8px; border-radius: 3px;">#2F729C</span>
- <span style="background-color: #1D4C73; padding: 2px 8px; border-radius: 3px;">#1D4C73</span>
- <span style="background-color: #4196B4; padding: 2px 8px; border-radius: 3px;">#4196B4</span>
- <span style="background-color: #6CB6D8; padding: 2px 8px; border-radius: 3px;">#6CB6D8</span>
- <span style="background-color: #145A74; padding: 2px 8px; border-radius: 3px;">#145A74</span>

**PBR Properties:**
```json
{
  "baseColor": "#2F729C",
  "roughness": 0.6,
  "metallic": 0.4,
  "normalStrength": 1.2,
  "aoStrength": 0.7,
  "heightScale": 0.03,
  "emissive": "#1D4C73"
}
```

**Procedural Rules:**
> Varying reflective patterns to simulate surface refractions and wetness.

**Textures:**
- **Metal049A** (Metal): <img src="../../packages/gen/public/textures/metal/Metal049A_bundle_2K.jpg" alt="Metal 049 A" width="200" />
- **Wood051** (Wood): <img src="../../packages/gen/public/textures/wood/Wood051_bundle_2K.jpg" alt="Wood 051" width="200" />

---

#### Chromatic Forge Array (`macro_4`)

**Description:** An expansive system capable of synthesizing complex materials by fusing small metal particles utilizing fusion-powered processes.

**Parameters:**
```json
{
  "stellarMass": {
    "min": 1.2,
    "max": 1.5,
    "default": 1.35
  },
  "metallicity": {
    "min": 0.5,
    "max": 1,
    "default": 0.75
  },
  "age": {
    "min": 2.5,
    "max": 7.5,
    "default": 5
  },
  "orbitalDistance": {
    "min": 1,
    "max": 3,
    "default": 1.5
  }
}
```

**Color Palette:**
- <span style="background-color: #D3B782; padding: 2px 8px; border-radius: 3px;">#D3B782</span>
- <span style="background-color: #9B7A3C; padding: 2px 8px; border-radius: 3px;">#9B7A3C</span>
- <span style="background-color: #593A1B; padding: 2px 8px; border-radius: 3px;">#593A1B</span>
- <span style="background-color: #A67C52; padding: 2px 8px; border-radius: 3px;">#A67C52</span>
- <span style="background-color: #744E25; padding: 2px 8px; border-radius: 3px;">#744E25</span>
- <span style="background-color: #5C3C20; padding: 2px 8px; border-radius: 3px;">#5C3C20</span>

**PBR Properties:**
```json
{
  "baseColor": "#D3B782",
  "roughness": 0.4,
  "metallic": 0.85,
  "normalStrength": 1.3,
  "aoStrength": 0.8,
  "heightScale": 0.06,
  "emissive": "#9B7A3C"
}
```

**Procedural Rules:**
> Synthetic augmented designs with metallic sheen and mineral overlay to signify harmonic metal syntheses.

**Textures:**
- **Metal050** (unknown): `Metal050` (not found in manifest)
- **Rock025** (unknown): `Rock025` (not found in manifest)

---

#### Skybridge Logistical Platform (`macro_5`)

**Description:** Infrastructure utilizing interconnected pathways and platforms to unlock tough-to-access cliffside ores and enhance vertical mobility.

**Parameters:**
```json
{
  "stellarMass": {
    "min": 0.8,
    "max": 1.2,
    "default": 1
  },
  "metallicity": {
    "min": 0.2,
    "max": 0.7,
    "default": 0.4
  },
  "age": {
    "min": 4,
    "max": 9,
    "default": 6.5
  },
  "orbitalDistance": {
    "min": 1.3,
    "max": 3.5,
    "default": 2.4
  }
}
```

**Color Palette:**
- <span style="background-color: #8D6F4E; padding: 2px 8px; border-radius: 3px;">#8D6F4E</span>
- <span style="background-color: #5E4731; padding: 2px 8px; border-radius: 3px;">#5E4731</span>
- <span style="background-color: #B7946E; padding: 2px 8px; border-radius: 3px;">#B7946E</span>
- <span style="background-color: #9C8360; padding: 2px 8px; border-radius: 3px;">#9C8360</span>
- <span style="background-color: #C9A57E; padding: 2px 8px; border-radius: 3px;">#C9A57E</span>
- <span style="background-color: #D6B585; padding: 2px 8px; border-radius: 3px;">#D6B585</span>

**PBR Properties:**
```json
{
  "baseColor": "#8D6F4E",
  "roughness": 0.5,
  "metallic": 0.3,
  "normalStrength": 1,
  "aoStrength": 0.7,
  "heightScale": 0.05,
  "emissive": "#5E4731"
}
```

**Procedural Rules:**
> Natural wood textures integrated with polished metal keystones, promoting aesthetic functionality.

**Textures:**
- **Wood094** (Wood): <img src="../../packages/gen/public/textures/wood/Wood094_bundle_2K.jpg" alt="Wood 094" width="200" />
- **Metal049A** (Metal): <img src="../../packages/gen/public/textures/metal/Metal049A_bundle_2K.jpg" alt="Metal 049 A" width="200" />

---

#### Lunar Resonance Facility (`macro_6`)

**Description:** Advanced harvesting of lunar elements by synchronizing orbital alignments and employing resonant frequency technology.

**Parameters:**
```json
{
  "stellarMass": {
    "min": 0.9,
    "max": 1.3,
    "default": 1.1
  },
  "metallicity": {
    "min": 0.4,
    "max": 0.9,
    "default": 0.65
  },
  "age": {
    "min": 2.5,
    "max": 6.5,
    "default": 4
  },
  "orbitalDistance": {
    "min": 2,
    "max": 3.5,
    "default": 2.7
  }
}
```

**Color Palette:**
- <span style="background-color: #21374A; padding: 2px 8px; border-radius: 3px;">#21374A</span>
- <span style="background-color: #587C91; padding: 2px 8px; border-radius: 3px;">#587C91</span>
- <span style="background-color: #2C4F61; padding: 2px 8px; border-radius: 3px;">#2C4F61</span>
- <span style="background-color: #4B7D8A; padding: 2px 8px; border-radius: 3px;">#4B7D8A</span>
- <span style="background-color: #1E566E; padding: 2px 8px; border-radius: 3px;">#1E566E</span>

**PBR Properties:**
```json
{
  "baseColor": "#21374A",
  "roughness": 0.65,
  "metallic": 0.2,
  "normalStrength": 1.4,
  "aoStrength": 0.9,
  "heightScale": 0.07,
  "emissive": "#587C91"
}
```

**Procedural Rules:**
> Reflective luminescent pads illuminate surface when engaging orbital extraction protocols.

**Textures:**
- **Rock030** (Rock): <img src="../../packages/gen/public/textures/rock/Rock030_bundle_2K.jpg" alt="Rock 030" width="200" />
- **Metal050** (unknown): `Metal050` (not found in manifest)

---

#### Stellar Fusion Hub (`macro_7`)

**Description:** A centralized location where stellar materials are synthesized into advanced components, utilizing plasma-based heating and elemental fusion processes.

**Parameters:**
```json
{
  "stellarMass": {
    "min": 1.1,
    "max": 1.5,
    "default": 1.3
  },
  "metallicity": {
    "min": 0.5,
    "max": 1,
    "default": 0.8
  },
  "age": {
    "min": 4,
    "max": 10,
    "default": 6
  },
  "orbitalDistance": {
    "min": 1.5,
    "max": 4,
    "default": 2.5
  }
}
```

**Color Palette:**
- <span style="background-color: #FF7F00; padding: 2px 8px; border-radius: 3px;">#FF7F00</span>
- <span style="background-color: #FF4000; padding: 2px 8px; border-radius: 3px;">#FF4000</span>
- <span style="background-color: #FF9F40; padding: 2px 8px; border-radius: 3px;">#FF9F40</span>
- <span style="background-color: #CC3300; padding: 2px 8px; border-radius: 3px;">#CC3300</span>
- <span style="background-color: #FF5500; padding: 2px 8px; border-radius: 3px;">#FF5500</span>

**PBR Properties:**
```json
{
  "baseColor": "#FF7F00",
  "roughness": 0.3,
  "metallic": 0.9,
  "normalStrength": 1.6,
  "aoStrength": 1,
  "heightScale": 0.06,
  "emissive": "#FF4000"
}
```

**Procedural Rules:**
> Generates fusion colors across compound surfaces emitting radiant volcanic-like glow during synthesis.

**Textures:**
- **Metal049A** (Metal): <img src="../../packages/gen/public/textures/metal/Metal049A_bundle_2K.jpg" alt="Metal 049 A" width="200" />
- **Rock025** (unknown): `Rock025` (not found in manifest)

---

#### Gem Vein Expander (`macro_8`)

**Description:** A network designed for the systematic expansion and controlled exploitation of gem-rich veins extending deep below the surface.

**Parameters:**
```json
{
  "stellarMass": {
    "min": 0.7,
    "max": 1.3,
    "default": 0.9
  },
  "metallicity": {
    "min": 0.6,
    "max": 0.9,
    "default": 0.75
  },
  "age": {
    "min": 2,
    "max": 6,
    "default": 4
  },
  "orbitalDistance": {
    "min": 0.5,
    "max": 2,
    "default": 1
  }
}
```

**Color Palette:**
- <span style="background-color: #B92323; padding: 2px 8px; border-radius: 3px;">#B92323</span>
- <span style="background-color: #FF4040; padding: 2px 8px; border-radius: 3px;">#FF4040</span>
- <span style="background-color: #CF3232; padding: 2px 8px; border-radius: 3px;">#CF3232</span>
- <span style="background-color: #A51A1A; padding: 2px 8px; border-radius: 3px;">#A51A1A</span>
- <span style="background-color: #C85757; padding: 2px 8px; border-radius: 3px;">#C85757</span>

**PBR Properties:**
```json
{
  "baseColor": "#B92323",
  "roughness": 0.8,
  "metallic": 0.4,
  "normalStrength": 1.2,
  "aoStrength": 0.7,
  "heightScale": 0.05,
  "emissive": "#FF4040"
}
```

**Procedural Rules:**
> Vein conduits show crystalline fractal formations mimicking geometric repetition of gems.

**Textures:**
- **Rock025** (unknown): `Rock025` (not found in manifest)
- **Metal050** (unknown): `Metal050` (not found in manifest)

---


### MESO: Intermediate dynamics and structural relationships

**WEFT Flow:** Building on MACRO scale archetypes:
- "Deep Vein Network", "Thermal Bore Accelerator", "Aqua-Seep Extractor"...

**Total Archetypes:** 5

#### Core Drill Attachment (`archetype_001`)

**Description:** A specialized attachment designed to enhance drilling into deep iron-nickel cores, optimized for seamless integration with the Deep Vein Network.

**Parameters:**
```json
{
  "effectivenessMultiplier": {
    "min": 1.5,
    "max": 3,
    "default": 2.1
  },
  "durability": {
    "min": 2000,
    "max": 5000,
    "default": 3500
  },
  "materialCost": {
    "min": 150,
    "max": 300,
    "default": 200
  },
  "creationComplexity": {
    "min": 4,
    "max": 8,
    "default": 6
  }
}
```

**Color Palette:**
- <span style="background-color: #8B9AA3; padding: 2px 8px; border-radius: 3px;">#8B9AA3</span>
- <span style="background-color: #B0BEC5; padding: 2px 8px; border-radius: 3px;">#B0BEC5</span>
- <span style="background-color: #455A64; padding: 2px 8px; border-radius: 3px;">#455A64</span>
- <span style="background-color: #78909C; padding: 2px 8px; border-radius: 3px;">#78909C</span>
- <span style="background-color: #37474F; padding: 2px 8px; border-radius: 3px;">#37474F</span>

**PBR Properties:**
```json
{
  "baseColor": "#8B9AA3",
  "roughness": 0.6,
  "metallic": 0.9,
  "normalStrength": 1.2,
  "aoStrength": 0.9,
  "heightScale": 0.02,
  "emissive": "#455A64"
}
```

**Procedural Rules:**
> Surface features exhibit subtle grooves and layered metallic textures similar to deep-metallurgical formations.

**Textures:**
- **Metal049A** (Metal): <img src="../../packages/gen/public/textures/metal/Metal049A_bundle_2K.jpg" alt="Metal 049 A" width="200" />
- **Rock025** (unknown): `Rock025` (not found in manifest)

---

#### Geothermal Resonator (`archetype_002`)

**Description:** A tool designed to channel geothermal energy to enhance material extraction, particularly effective in hot accretion zones.

**Parameters:**
```json
{
  "effectivenessMultiplier": {
    "min": 2,
    "max": 4,
    "default": 3
  },
  "durability": {
    "min": 1500,
    "max": 4000,
    "default": 3000
  },
  "materialCost": {
    "min": 200,
    "max": 350,
    "default": 275
  },
  "creationComplexity": {
    "min": 5,
    "max": 9,
    "default": 7
  }
}
```

**Color Palette:**
- <span style="background-color: #FF8F00; padding: 2px 8px; border-radius: 3px;">#FF8F00</span>
- <span style="background-color: #FF6F00; padding: 2px 8px; border-radius: 3px;">#FF6F00</span>
- <span style="background-color: #FF5722; padding: 2px 8px; border-radius: 3px;">#FF5722</span>
- <span style="background-color: #B71C1C; padding: 2px 8px; border-radius: 3px;">#B71C1C</span>
- <span style="background-color: #BF360C; padding: 2px 8px; border-radius: 3px;">#BF360C</span>

**PBR Properties:**
```json
{
  "baseColor": "#FF8F00",
  "roughness": 0.7,
  "metallic": 0.6,
  "normalStrength": 1.4,
  "aoStrength": 0.7,
  "heightScale": 0.03,
  "emissive": "#FF5722"
}
```

**Procedural Rules:**
> Exhibits vibrant thermal animation effects with fluctuating emissive glow in response to geothermal sources.

**Textures:**
- **Metal049A** (Metal): <img src="../../packages/gen/public/textures/metal/Metal049A_bundle_2K.jpg" alt="Metal 049 A" width="200" />
- **Rock030** (Rock): <img src="../../packages/gen/public/textures/rock/Rock030_bundle_2K.jpg" alt="Rock 030" width="200" />

---

#### Hydraulic Channel Carver (`archetype_003`)

**Description:** An advanced tool designed for carving precise channels through subsurface water deposits for efficient volatile transport.

**Parameters:**
```json
{
  "effectivenessMultiplier": {
    "min": 1.8,
    "max": 3.5,
    "default": 2.5
  },
  "durability": {
    "min": 2500,
    "max": 4500,
    "default": 3500
  },
  "materialCost": {
    "min": 175,
    "max": 325,
    "default": 250
  },
  "creationComplexity": {
    "min": 6,
    "max": 10,
    "default": 8
  }
}
```

**Color Palette:**
- <span style="background-color: #00796B; padding: 2px 8px; border-radius: 3px;">#00796B</span>
- <span style="background-color: #004D40; padding: 2px 8px; border-radius: 3px;">#004D40</span>
- <span style="background-color: #006064; padding: 2px 8px; border-radius: 3px;">#006064</span>
- <span style="background-color: #004D40; padding: 2px 8px; border-radius: 3px;">#004D40</span>
- <span style="background-color: #005662; padding: 2px 8px; border-radius: 3px;">#005662</span>

**PBR Properties:**
```json
{
  "baseColor": "#00796B",
  "roughness": 0.8,
  "metallic": 0.2,
  "normalStrength": 1.4,
  "aoStrength": 0.85,
  "heightScale": 0.04,
  "emissive": "#004D40"
}
```

**Procedural Rules:**
> Surfaces display aquatically inspired undulating patterns, reacting dynamically with water presence.

**Textures:**
- **Metal049A** (Metal): <img src="../../packages/gen/public/textures/metal/Metal049A_bundle_2K.jpg" alt="Metal 049 A" width="200" />
- **Rock025** (unknown): `Rock025` (not found in manifest)

---

#### Alloy Synthesizer (`archetype_004`)

**Description:** Crafted to blend extracted metals into usable alloys, the Alloy Synthesizer powers the Chromatic Forge Array.

**Parameters:**
```json
{
  "effectivenessMultiplier": {
    "min": 2.5,
    "max": 5,
    "default": 3.5
  },
  "durability": {
    "min": 3000,
    "max": 5000,
    "default": 4000
  },
  "materialCost": {
    "min": 250,
    "max": 400,
    "default": 325
  },
  "creationComplexity": {
    "min": 7,
    "max": 11,
    "default": 9
  }
}
```

**Color Palette:**
- <span style="background-color: #C5CAE9; padding: 2px 8px; border-radius: 3px;">#C5CAE9</span>
- <span style="background-color: #7986CB; padding: 2px 8px; border-radius: 3px;">#7986CB</span>
- <span style="background-color: #3F51B5; padding: 2px 8px; border-radius: 3px;">#3F51B5</span>
- <span style="background-color: #1A237E; padding: 2px 8px; border-radius: 3px;">#1A237E</span>
- <span style="background-color: #283593; padding: 2px 8px; border-radius: 3px;">#283593</span>

**PBR Properties:**
```json
{
  "baseColor": "#C5CAE9",
  "roughness": 0.5,
  "metallic": 0.8,
  "normalStrength": 1.3,
  "aoStrength": 0.75,
  "heightScale": 0.06,
  "emissive": "#283593"
}
```

**Procedural Rules:**
> Creates vivid metallic sheen fluctuating across surfaces depending on ambient light and composition.

**Textures:**
- **Metal049A** (Metal): <img src="../../packages/gen/public/textures/metal/Metal049A_bundle_2K.jpg" alt="Metal 049 A" width="200" />
- **Metal050** (unknown): `Metal050` (not found in manifest)

---

#### Elevated Transport System (`archetype_005`)

**Description:** This system facilitates material movement between elevated and grounded positions, bridging the Skybridge Logistical Platform.

**Parameters:**
```json
{
  "effectivenessMultiplier": {
    "min": 1.4,
    "max": 3,
    "default": 2.3
  },
  "durability": {
    "min": 1800,
    "max": 4000,
    "default": 3000
  },
  "materialCost": {
    "min": 200,
    "max": 325,
    "default": 275
  },
  "creationComplexity": {
    "min": 5,
    "max": 9,
    "default": 7
  }
}
```

**Color Palette:**
- <span style="background-color: #BCAAA4; padding: 2px 8px; border-radius: 3px;">#BCAAA4</span>
- <span style="background-color: #8D6E63; padding: 2px 8px; border-radius: 3px;">#8D6E63</span>
- <span style="background-color: #37474F; padding: 2px 8px; border-radius: 3px;">#37474F</span>
- <span style="background-color: #546E7A; padding: 2px 8px; border-radius: 3px;">#546E7A</span>
- <span style="background-color: #263238; padding: 2px 8px; border-radius: 3px;">#263238</span>

**PBR Properties:**
```json
{
  "baseColor": "#8D6E63",
  "roughness": 0.6,
  "metallic": 0.4,
  "normalStrength": 1.1,
  "aoStrength": 0.6,
  "heightScale": 0.03,
  "emissive": "#37474F"
}
```

**Procedural Rules:**
> Exhibits organic textures with weathered markings reflecting the environmental transition process.

**Textures:**
- **Metal050** (unknown): `Metal050` (not found in manifest)
- **Wood051** (Wood): <img src="../../packages/gen/public/textures/wood/Wood051_bundle_2K.jpg" alt="Wood 051" width="200" />

---


### MICRO: Fine-grained details and specific implementations

**WEFT Flow:** Building on MACRO and MESO scales:
- MACRO: "Deep Vein Network", "Thermal Bore Accelerator"...
- MESO: "Core Drill Attachment", "Geothermal Resonator"...

**Total Archetypes:** 7

#### Durable Miner (`durable_miner_archetype`)

**Description:** Tools designed for deep mining with enhanced durability to withstand harsh environments.

**Parameters:**
```json
{
  "baseDurability": {
    "min": 0.8,
    "max": 1.5,
    "default": 1.2
  },
  "effectivenessCurve": {
    "min": 0.6,
    "max": 1,
    "default": 0.85
  },
  "maintenanceFrequency": {
    "min": 0.2,
    "max": 0.5,
    "default": 0.3
  },
  "materialCompatibility": {
    "min": 0.7,
    "max": 1,
    "default": 0.9
  }
}
```

**Color Palette:**
- <span style="background-color: #6C7D8B; padding: 2px 8px; border-radius: 3px;">#6C7D8B</span>
- <span style="background-color: #8B9CA8; padding: 2px 8px; border-radius: 3px;">#8B9CA8</span>
- <span style="background-color: #ABBCCD; padding: 2px 8px; border-radius: 3px;">#ABBCCD</span>
- <span style="background-color: #CCDDEE; padding: 2px 8px; border-radius: 3px;">#CCDDEE</span>
- <span style="background-color: #E1EAF0; padding: 2px 8px; border-radius: 3px;">#E1EAF0</span>

**PBR Properties:**
```json
{
  "baseColor": "#6C7D8B",
  "roughness": 0.8,
  "metallic": 0.3,
  "normalStrength": 1.2,
  "aoStrength": 0.6,
  "heightScale": 0.05,
  "emissive": "#8B9CA8"
}
```

**Procedural Rules:**
> Variation in surface weathering and wear patterns.

**Textures:**
- **Metal049A** (Metal): <img src="../../packages/gen/public/textures/metal/Metal049A_bundle_2K.jpg" alt="Metal 049 A" width="200" />
- **Rock025** (unknown): `Rock025` (not found in manifest)

---

#### Corrosion Resistant Tool (`corrosion_resistant_tool`)

**Description:** Specialized tools with coatings to withstand corrosive elements during extraction processes.

**Parameters:**
```json
{
  "baseDurability": {
    "min": 0.9,
    "max": 1.6,
    "default": 1.3
  },
  "effectivenessCurve": {
    "min": 0.7,
    "max": 1,
    "default": 0.9
  },
  "maintenanceFrequency": {
    "min": 0.3,
    "max": 0.7,
    "default": 0.5
  },
  "materialCompatibility": {
    "min": 0.8,
    "max": 1,
    "default": 0.95
  }
}
```

**Color Palette:**
- <span style="background-color: #434C5E; padding: 2px 8px; border-radius: 3px;">#434C5E</span>
- <span style="background-color: #56657A; padding: 2px 8px; border-radius: 3px;">#56657A</span>
- <span style="background-color: #69798D; padding: 2px 8px; border-radius: 3px;">#69798D</span>
- <span style="background-color: #7C8EA0; padding: 2px 8px; border-radius: 3px;">#7C8EA0</span>
- <span style="background-color: #90A3B3; padding: 2px 8px; border-radius: 3px;">#90A3B3</span>

**PBR Properties:**
```json
{
  "baseColor": "#434C5E",
  "roughness": 0.7,
  "metallic": 0.4,
  "normalStrength": 1.4,
  "aoStrength": 0.7,
  "heightScale": 0.04,
  "emissive": "#56657A"
}
```

**Procedural Rules:**
> Corrosion patterns and resilient surface coatings vary procedurally.

**Textures:**
- **Metal050** (unknown): `Metal050` (not found in manifest)
- **Rock030** (Rock): <img src="../../packages/gen/public/textures/rock/Rock030_bundle_2K.jpg" alt="Rock 030" width="200" />

---

#### Precision Drill Head (`precision_drill_head`)

**Description:** Drilling toolheads optimized for precision and reduced vibration at extreme depths.

**Parameters:**
```json
{
  "baseDurability": {
    "min": 0.7,
    "max": 1.2,
    "default": 1
  },
  "effectivenessCurve": {
    "min": 0.8,
    "max": 1.2,
    "default": 1.1
  },
  "maintenanceFrequency": {
    "min": 0.4,
    "max": 0.6,
    "default": 0.5
  },
  "materialCompatibility": {
    "min": 0.9,
    "max": 1,
    "default": 1
  }
}
```

**Color Palette:**
- <span style="background-color: #525A64; padding: 2px 8px; border-radius: 3px;">#525A64</span>
- <span style="background-color: #636C77; padding: 2px 8px; border-radius: 3px;">#636C77</span>
- <span style="background-color: #747D89; padding: 2px 8px; border-radius: 3px;">#747D89</span>
- <span style="background-color: #868E9A; padding: 2px 8px; border-radius: 3px;">#868E9A</span>
- <span style="background-color: #99A1AB; padding: 2px 8px; border-radius: 3px;">#99A1AB</span>

**PBR Properties:**
```json
{
  "baseColor": "#525A64",
  "roughness": 0.9,
  "metallic": 0.2,
  "normalStrength": 1.6,
  "aoStrength": 0.5,
  "heightScale": 0.03,
  "emissive": "#747D89"
}
```

**Procedural Rules:**
> Etching and patterning related to precision needs vary.

**Textures:**
- **Rock025** (unknown): `Rock025` (not found in manifest)
- **Metal049A** (Metal): <img src="../../packages/gen/public/textures/metal/Metal049A_bundle_2K.jpg" alt="Metal 049 A" width="200" />

---

#### Adaptive Joint Tool (`adaptive_joint_tool`)

**Description:** Tools with joints that adapt dynamically to various shapes, enhancing versatility.

**Parameters:**
```json
{
  "baseDurability": {
    "min": 0.6,
    "max": 1.1,
    "default": 0.9
  },
  "effectivenessCurve": {
    "min": 0.5,
    "max": 1,
    "default": 0.8
  },
  "maintenanceFrequency": {
    "min": 0.2,
    "max": 0.4,
    "default": 0.3
  },
  "materialCompatibility": {
    "min": 0.7,
    "max": 1,
    "default": 0.85
  }
}
```

**Color Palette:**
- <span style="background-color: #4A5A6A; padding: 2px 8px; border-radius: 3px;">#4A5A6A</span>
- <span style="background-color: #5F6F7E; padding: 2px 8px; border-radius: 3px;">#5F6F7E</span>
- <span style="background-color: #748A93; padding: 2px 8px; border-radius: 3px;">#748A93</span>
- <span style="background-color: #8BA2A5; padding: 2px 8px; border-radius: 3px;">#8BA2A5</span>
- <span style="background-color: #A3B1B5; padding: 2px 8px; border-radius: 3px;">#A3B1B5</span>

**PBR Properties:**
```json
{
  "baseColor": "#4A5A6A",
  "roughness": 0.85,
  "metallic": 0.15,
  "normalStrength": 1.5,
  "aoStrength": 0.4,
  "heightScale": 0.03,
  "emissive": "#5F6F7E"
}
```

**Procedural Rules:**
> Joints can alter surface shape dynamically based on application.

**Textures:**
- **Metal049A** (Metal): <img src="../../packages/gen/public/textures/metal/Metal049A_bundle_2K.jpg" alt="Metal 049 A" width="200" />
- **Wood094** (Wood): <img src="../../packages/gen/public/textures/wood/Wood094_bundle_2K.jpg" alt="Wood 094" width="200" />

---

#### Heat Resistant Coating (`heat_resistant_coating`)

**Description:** A protective coating applied to tool surfaces, enabling usage in high-temperature zones.

**Parameters:**
```json
{
  "baseDurability": {
    "min": 0.5,
    "max": 1,
    "default": 0.8
  },
  "effectivenessCurve": {
    "min": 0.6,
    "max": 1,
    "default": 0.9
  },
  "maintenanceFrequency": {
    "min": 0.5,
    "max": 0.8,
    "default": 0.6
  },
  "materialCompatibility": {
    "min": 0.9,
    "max": 1,
    "default": 0.95
  }
}
```

**Color Palette:**
- <span style="background-color: #2E3844; padding: 2px 8px; border-radius: 3px;">#2E3844</span>
- <span style="background-color: #5A6673; padding: 2px 8px; border-radius: 3px;">#5A6673</span>
- <span style="background-color: #788290; padding: 2px 8px; border-radius: 3px;">#788290</span>
- <span style="background-color: #959DAF; padding: 2px 8px; border-radius: 3px;">#959DAF</span>
- <span style="background-color: #B1BBC5; padding: 2px 8px; border-radius: 3px;">#B1BBC5</span>

**PBR Properties:**
```json
{
  "baseColor": "#2E3844",
  "roughness": 0.75,
  "metallic": 0.35,
  "normalStrength": 1.3,
  "aoStrength": 0.8,
  "heightScale": 0.06,
  "emissive": "#5A6673"
}
```

**Procedural Rules:**
> Coating thickness and texture vary based on thermal exposure.

**Textures:**
- **Metal050** (unknown): `Metal050` (not found in manifest)
- **Rock030** (Rock): <img src="../../packages/gen/public/textures/rock/Rock030_bundle_2K.jpg" alt="Rock 030" width="200" />

---

#### Heavy Duty Hinges (`heavy_duty_hinges`)

**Description:** Strong hinge mechanisms for tools, allowing high-load applications without failure.

**Parameters:**
```json
{
  "baseDurability": {
    "min": 1,
    "max": 1.8,
    "default": 1.5
  },
  "effectivenessCurve": {
    "min": 0.7,
    "max": 1.1,
    "default": 0.9
  },
  "maintenanceFrequency": {
    "min": 0.4,
    "max": 0.7,
    "default": 0.6
  },
  "materialCompatibility": {
    "min": 0.6,
    "max": 1,
    "default": 0.8
  }
}
```

**Color Palette:**
- <span style="background-color: #373F48; padding: 2px 8px; border-radius: 3px;">#373F48</span>
- <span style="background-color: #4C5560; padding: 2px 8px; border-radius: 3px;">#4C5560</span>
- <span style="background-color: #636F78; padding: 2px 8px; border-radius: 3px;">#636F78</span>
- <span style="background-color: #7B8891; padding: 2px 8px; border-radius: 3px;">#7B8891</span>
- <span style="background-color: #93A1AA; padding: 2px 8px; border-radius: 3px;">#93A1AA</span>

**PBR Properties:**
```json
{
  "baseColor": "#373F48",
  "roughness": 0.9,
  "metallic": 0.5,
  "normalStrength": 1.8,
  "aoStrength": 0.9,
  "heightScale": 0.05,
  "emissive": "#4C5560"
}
```

**Procedural Rules:**
> Joint patterning and surface joint reinforcement vary based on load capacity.

**Textures:**
- **Metal049A** (Metal): <img src="../../packages/gen/public/textures/metal/Metal049A_bundle_2K.jpg" alt="Metal 049 A" width="200" />
- **Metal050** (unknown): `Metal050` (not found in manifest)

---

#### Energy Vibration Dampener (`energy_vibration_dampener`)

**Description:** A tool feature designed to reduce energy transmission and minimize vibration effect during use.

**Parameters:**
```json
{
  "baseDurability": {
    "min": 0.8,
    "max": 1.4,
    "default": 1.2
  },
  "effectivenessCurve": {
    "min": 0.6,
    "max": 1,
    "default": 0.85
  },
  "maintenanceFrequency": {
    "min": 0.3,
    "max": 0.5,
    "default": 0.4
  },
  "materialCompatibility": {
    "min": 0.7,
    "max": 1,
    "default": 0.9
  }
}
```

**Color Palette:**
- <span style="background-color: #5E6A78; padding: 2px 8px; border-radius: 3px;">#5E6A78</span>
- <span style="background-color: #718593; padding: 2px 8px; border-radius: 3px;">#718593</span>
- <span style="background-color: #849FAD; padding: 2px 8px; border-radius: 3px;">#849FAD</span>
- <span style="background-color: #97B7C0; padding: 2px 8px; border-radius: 3px;">#97B7C0</span>
- <span style="background-color: #ABCCD3; padding: 2px 8px; border-radius: 3px;">#ABCCD3</span>

**PBR Properties:**
```json
{
  "baseColor": "#5E6A78",
  "roughness": 0.85,
  "metallic": 0.25,
  "normalStrength": 1.4,
  "aoStrength": 0.7,
  "heightScale": 0.04,
  "emissive": "#718593"
}
```

**Procedural Rules:**
> Pattern of energy dispersion lines vary.

**Textures:**
- **Metal049A** (Metal): <img src="../../packages/gen/public/textures/metal/Metal049A_bundle_2K.jpg" alt="Metal 049 A" width="200" />
- **Rock025** (unknown): `Rock025` (not found in manifest)

---


---

## Gen 4: Tribe Formation {#generation-4}

**WARP Flow:** Inheriting knowledge from previous generation:
- **Gen 3: Tool Systems** provided:
  - "Deep Vein Network", "Thermal Bore Accelerator", "Aqua-Seep Extractor", "Chromatic Forge Array", "Skybridge Logistical Platform"...
  - Total: 20 archetypes across all scales

---

### MACRO: System-level context and foundational patterns

**Total Archetypes:** 5

#### Trade Winds Network (`trade_winds_01`)

**Description:** A vast system of inter-tribal trade routes connecting multiple territories across metal-rich zones. Tribes exchange resources like iron and rare minerals using specialized communication signals and guided rail systems.

**Parameters:**
```json
{
  "networkSize": {
    "min": 8,
    "max": 20,
    "default": 15
  },
  "tradeVolume": {
    "min": 50,
    "max": 200,
    "default": 100
  },
  "allianceStrength": {
    "min": 0.3,
    "max": 0.7,
    "default": 0.5
  },
  "conflictFrequency": {
    "min": 0.1,
    "max": 0.4,
    "default": 0.2
  }
}
```

**Color Palette:**
- <span style="background-color: #476A75; padding: 2px 8px; border-radius: 3px;">#476A75</span>
- <span style="background-color: #739391; padding: 2px 8px; border-radius: 3px;">#739391</span>
- <span style="background-color: #A4C4C3; padding: 2px 8px; border-radius: 3px;">#A4C4C3</span>
- <span style="background-color: #DCEAEF; padding: 2px 8px; border-radius: 3px;">#DCEAEF</span>
- <span style="background-color: #333B40; padding: 2px 8px; border-radius: 3px;">#333B40</span>

**PBR Properties:**
```json
{
  "baseColor": "#739391",
  "roughness": 0.7,
  "metallic": 0.6,
  "normalStrength": 1.4,
  "aoStrength": 0.5,
  "heightScale": 0.1,
  "emissive": "#A4C4C3"
}
```

**Procedural Rules:**
> Trade routes vary procedurally with terrain; rail systems adapt to valleys and inclines.

**Textures:**
- **Metal049A** (Metal): <img src="../../packages/gen/public/textures/metal/Metal049A_bundle_2K.jpg" alt="Metal 049 A" width="200" />
- **Rock025** (unknown): `Rock025` (not found in manifest)

---

#### Alliance Network (`alliance_network_02`)

**Description:** A structured alliance of tribes across territories, providing mutual defense and technological sharing. Tribes contribute to a central knowledge pool accessible through shared hubs.

**Parameters:**
```json
{
  "networkSize": {
    "min": 5,
    "max": 15,
    "default": 10
  },
  "tradeVolume": {
    "min": 20,
    "max": 100,
    "default": 60
  },
  "allianceStrength": {
    "min": 0.5,
    "max": 1,
    "default": 0.8
  },
  "conflictFrequency": {
    "min": 0.05,
    "max": 0.2,
    "default": 0.1
  }
}
```

**Color Palette:**
- <span style="background-color: #7E9988; padding: 2px 8px; border-radius: 3px;">#7E9988</span>
- <span style="background-color: #B7CAB1; padding: 2px 8px; border-radius: 3px;">#B7CAB1</span>
- <span style="background-color: #3D5B59; padding: 2px 8px; border-radius: 3px;">#3D5B59</span>
- <span style="background-color: #96B2A6; padding: 2px 8px; border-radius: 3px;">#96B2A6</span>
- <span style="background-color: #EBF0E0; padding: 2px 8px; border-radius: 3px;">#EBF0E0</span>

**PBR Properties:**
```json
{
  "baseColor": "#96B2A6",
  "roughness": 0.8,
  "metallic": 0.2,
  "normalStrength": 1.3,
  "aoStrength": 0.6,
  "heightScale": 0.05,
  "emissive": "#B7CAB1"
}
```

**Procedural Rules:**
> Alliance hubs adapt visually to geological features, symbolized by shared banners and technologies.

**Textures:**
- **Fabric019** (Fabric): <img src="../../packages/gen/public/textures/fabric/Fabric019_bundle_2K.jpg" alt="Fabric 019" width="200" />
- **Wood094** (Wood): <img src="../../packages/gen/public/textures/wood/Wood094_bundle_2K.jpg" alt="Wood 094" width="200" />

---

#### Conflict Zone (`conflict_zone_03`)

**Description:** Areas where territorial disputes and resource contention lead to frequent skirmishes. Tribes employ defensive fortifications and engage in tactical maneuvers to control strategic resources.

**Parameters:**
```json
{
  "networkSize": {
    "min": 3,
    "max": 8,
    "default": 5
  },
  "tradeVolume": {
    "min": 0,
    "max": 20,
    "default": 10
  },
  "allianceStrength": {
    "min": 0,
    "max": 0.3,
    "default": 0.1
  },
  "conflictFrequency": {
    "min": 0.6,
    "max": 1,
    "default": 0.8
  }
}
```

**Color Palette:**
- <span style="background-color: #5C5E60; padding: 2px 8px; border-radius: 3px;">#5C5E60</span>
- <span style="background-color: #8A8B8D; padding: 2px 8px; border-radius: 3px;">#8A8B8D</span>
- <span style="background-color: #B8B8B8; padding: 2px 8px; border-radius: 3px;">#B8B8B8</span>
- <span style="background-color: #37383A; padding: 2px 8px; border-radius: 3px;">#37383A</span>
- <span style="background-color: #1C1D1E; padding: 2px 8px; border-radius: 3px;">#1C1D1E</span>

**PBR Properties:**
```json
{
  "baseColor": "#37383A",
  "roughness": 0.9,
  "metallic": 0.4,
  "normalStrength": 1.6,
  "aoStrength": 0.7,
  "heightScale": 0.07,
  "emissive": "#B8B8B8"
}
```

**Procedural Rules:**
> Rock formations and metal fortifications adapt to topography for strategic advantage.

**Textures:**
- **Rock030** (Rock): <img src="../../packages/gen/public/textures/rock/Rock030_bundle_2K.jpg" alt="Rock 030" width="200" />
- **Metal050** (unknown): `Metal050` (not found in manifest)

---

#### Cultural Exchange Hubs (`cultural_exchange_01`)

**Description:** Central points of cultural and knowledge sharing among tribes. These hubs facilitate the exchange of art, technology, and traditions, strengthening inter-tribal connections.

**Parameters:**
```json
{
  "networkSize": {
    "min": 5,
    "max": 12,
    "default": 8
  },
  "tradeVolume": {
    "min": 10,
    "max": 50,
    "default": 30
  },
  "allianceStrength": {
    "min": 0.4,
    "max": 0.8,
    "default": 0.6
  },
  "conflictFrequency": {
    "min": 0.1,
    "max": 0.3,
    "default": 0.15
  }
}
```

**Color Palette:**
- <span style="background-color: #6D5D4E; padding: 2px 8px; border-radius: 3px;">#6D5D4E</span>
- <span style="background-color: #A09E8B; padding: 2px 8px; border-radius: 3px;">#A09E8B</span>
- <span style="background-color: #D6D5C7; padding: 2px 8px; border-radius: 3px;">#D6D5C7</span>
- <span style="background-color: #857864; padding: 2px 8px; border-radius: 3px;">#857864</span>
- <span style="background-color: #BFABA0; padding: 2px 8px; border-radius: 3px;">#BFABA0</span>

**PBR Properties:**
```json
{
  "baseColor": "#A09E8B",
  "roughness": 0.6,
  "metallic": 0.1,
  "normalStrength": 1.3,
  "aoStrength": 0.5,
  "heightScale": 0.04,
  "emissive": "#D6D5C7"
}
```

**Procedural Rules:**
> Cultural motifs and architectural designs vary with the artistic influences of participating tribes.

**Textures:**
- **Fabric023** (Fabric): <img src="../../packages/gen/public/textures/fabric/Fabric023_bundle_2K.jpg" alt="Fabric 023" width="200" />
- **Wood051** (Wood): <img src="../../packages/gen/public/textures/wood/Wood051_bundle_2K.jpg" alt="Wood 051" width="200" />

---

#### Diplomatic Hub (`diplomatic_hub_04`)

**Description:** Key centers for negotiation and treaty formation between tribes. Facilitates long-term alliances and policies addressing environmental and resource challenges.

**Parameters:**
```json
{
  "networkSize": {
    "min": 4,
    "max": 10,
    "default": 6
  },
  "tradeVolume": {
    "min": 5,
    "max": 30,
    "default": 15
  },
  "allianceStrength": {
    "min": 0.6,
    "max": 1,
    "default": 0.9
  },
  "conflictFrequency": {
    "min": 0.05,
    "max": 0.2,
    "default": 0.1
  }
}
```

**Color Palette:**
- <span style="background-color: #4B5539; padding: 2px 8px; border-radius: 3px;">#4B5539</span>
- <span style="background-color: #727B57; padding: 2px 8px; border-radius: 3px;">#727B57</span>
- <span style="background-color: #939985; padding: 2px 8px; border-radius: 3px;">#939985</span>
- <span style="background-color: #BCC3A7; padding: 2px 8px; border-radius: 3px;">#BCC3A7</span>
- <span style="background-color: #DDE4C2; padding: 2px 8px; border-radius: 3px;">#DDE4C2</span>

**PBR Properties:**
```json
{
  "baseColor": "#727B57",
  "roughness": 0.7,
  "metallic": 0.3,
  "normalStrength": 1.2,
  "aoStrength": 0.5,
  "heightScale": 0.06,
  "emissive": "#BCC3A7"
}
```

**Procedural Rules:**
> Diplomatic buildings exhibit a blend of architectural styles, signifying cross-cultural influence.

**Textures:**
- **Leather011** (Leather): <img src="../../packages/gen/public/textures/leather/Leather011_bundle_2K.jpg" alt="Leather 011" width="200" />
- **Concrete025** (Concrete): <img src="../../packages/gen/public/textures/concrete/Concrete025_bundle_2K.jpg" alt="Concrete 025" width="200" />

---


### MESO: Intermediate dynamics and structural relationships

**WEFT Flow:** Building on MACRO scale archetypes:
- "Trade Winds Network", "Alliance Network", "Conflict Zone"...

**Total Archetypes:** 8

#### Iron Nexus Council (`archetype_001`)

**Description:** A centralized council governance structure where elected representatives from each tribe come together to make decisions for the greater community. This governance model balances local autonomy with central decision-making, ideal for regions with interconnected trade routes.

**Parameters:**
```json
{
  "governanceComplexity": {
    "min": 0.5,
    "max": 0.9,
    "default": 0.7
  },
  "decisionSpeed": {
    "min": 0.4,
    "max": 0.8,
    "default": 0.6
  },
  "resourceEfficiency": {
    "min": 0.6,
    "max": 0.9,
    "default": 0.75
  },
  "socialStability": {
    "min": 0.7,
    "max": 1,
    "default": 0.85
  }
}
```

**Color Palette:**
- <span style="background-color: #34495E; padding: 2px 8px; border-radius: 3px;">#34495E</span>
- <span style="background-color: #2ECC71; padding: 2px 8px; border-radius: 3px;">#2ECC71</span>
- <span style="background-color: #3498DB; padding: 2px 8px; border-radius: 3px;">#3498DB</span>
- <span style="background-color: #E74C3C; padding: 2px 8px; border-radius: 3px;">#E74C3C</span>
- <span style="background-color: #9B59B6; padding: 2px 8px; border-radius: 3px;">#9B59B6</span>

**PBR Properties:**
```json
{
  "baseColor": "#34495E",
  "roughness": 0.5,
  "metallic": 0.3,
  "normalStrength": 1.2,
  "aoStrength": 0.7,
  "heightScale": 0.03,
  "emissive": "#3498DB"
}
```

**Procedural Rules:**
> Fabric patterns vary by tribal symbol, metal sheen reflects council diversity.

**Textures:**
- **Metal049A** (Metal): <img src="../../packages/gen/public/textures/metal/Metal049A_bundle_2K.jpg" alt="Metal 049 A" width="200" />
- **Fabric019** (Fabric): <img src="../../packages/gen/public/textures/fabric/Fabric019_bundle_2K.jpg" alt="Fabric 019" width="200" />

---

#### Metal Tapestry Confederation (`archetype_002`)

**Description:** A confederation model that emphasizes loose alliance among tribes, focusing on shared cultural heritage and defensive collaborations.

**Parameters:**
```json
{
  "governanceComplexity": {
    "min": 0.3,
    "max": 0.6,
    "default": 0.5
  },
  "decisionSpeed": {
    "min": 0.5,
    "max": 0.9,
    "default": 0.7
  },
  "resourceEfficiency": {
    "min": 0.4,
    "max": 0.7,
    "default": 0.6
  },
  "socialStability": {
    "min": 0.6,
    "max": 0.9,
    "default": 0.75
  }
}
```

**Color Palette:**
- <span style="background-color: #1ABC9C; padding: 2px 8px; border-radius: 3px;">#1ABC9C</span>
- <span style="background-color: #F39C12; padding: 2px 8px; border-radius: 3px;">#F39C12</span>
- <span style="background-color: #E67E22; padding: 2px 8px; border-radius: 3px;">#E67E22</span>
- <span style="background-color: #C0392B; padding: 2px 8px; border-radius: 3px;">#C0392B</span>
- <span style="background-color: #8E44AD; padding: 2px 8px; border-radius: 3px;">#8E44AD</span>

**PBR Properties:**
```json
{
  "baseColor": "#1ABC9C",
  "roughness": 0.4,
  "metallic": 0.2,
  "normalStrength": 1,
  "aoStrength": 0.6,
  "heightScale": 0.04,
  "emissive": "#F39C12"
}
```

**Procedural Rules:**
> Fabric colors weave together to represent unified tribal identity.

**Textures:**
- **Fabric023** (Fabric): <img src="../../packages/gen/public/textures/fabric/Fabric023_bundle_2K.jpg" alt="Fabric 023" width="200" />
- **Metal050** (unknown): `Metal050` (not found in manifest)

---

#### Harmonic Council (`archetype_003`)

**Description:** A council system where decision-making is based on harmonizing differing perspectives into a cohesive strategy, ideal for diplomatic hubs.

**Parameters:**
```json
{
  "governanceComplexity": {
    "min": 0.6,
    "max": 0.9,
    "default": 0.8
  },
  "decisionSpeed": {
    "min": 0.3,
    "max": 0.6,
    "default": 0.45
  },
  "resourceEfficiency": {
    "min": 0.5,
    "max": 0.8,
    "default": 0.6
  },
  "socialStability": {
    "min": 0.8,
    "max": 1,
    "default": 0.9
  }
}
```

**Color Palette:**
- <span style="background-color: #2980B9; padding: 2px 8px; border-radius: 3px;">#2980B9</span>
- <span style="background-color: #27AE60; padding: 2px 8px; border-radius: 3px;">#27AE60</span>
- <span style="background-color: #F1C40F; padding: 2px 8px; border-radius: 3px;">#F1C40F</span>
- <span style="background-color: #E74C3C; padding: 2px 8px; border-radius: 3px;">#E74C3C</span>
- <span style="background-color: #8E44AD; padding: 2px 8px; border-radius: 3px;">#8E44AD</span>

**PBR Properties:**
```json
{
  "baseColor": "#2980B9",
  "roughness": 0.3,
  "metallic": 0.25,
  "normalStrength": 1.3,
  "aoStrength": 0.7,
  "heightScale": 0.02,
  "emissive": "#E74C3C"
}
```

**Procedural Rules:**
> Metallic elements represent balanced perspectives, fabrics indicate diverse cultures.

**Textures:**
- **Fabric019** (Fabric): <img src="../../packages/gen/public/textures/fabric/Fabric019_bundle_2K.jpg" alt="Fabric 019" width="200" />
- **Metal050** (unknown): `Metal050` (not found in manifest)

---

#### Resource Ring Federation (`archetype_004`)

**Description:** A federation structure that coordinates multiple packs specialized in different resource extraction and provides a platform for controlled distribution.

**Parameters:**
```json
{
  "governanceComplexity": {
    "min": 0.6,
    "max": 0.9,
    "default": 0.7
  },
  "decisionSpeed": {
    "min": 0.4,
    "max": 0.7,
    "default": 0.6
  },
  "resourceEfficiency": {
    "min": 0.8,
    "max": 1,
    "default": 0.9
  },
  "socialStability": {
    "min": 0.7,
    "max": 0.9,
    "default": 0.8
  }
}
```

**Color Palette:**
- <span style="background-color: #ECF0F1; padding: 2px 8px; border-radius: 3px;">#ECF0F1</span>
- <span style="background-color: #95A5A6; padding: 2px 8px; border-radius: 3px;">#95A5A6</span>
- <span style="background-color: #7F8C8D; padding: 2px 8px; border-radius: 3px;">#7F8C8D</span>
- <span style="background-color: #BDC3C7; padding: 2px 8px; border-radius: 3px;">#BDC3C7</span>
- <span style="background-color: #D5D8DC; padding: 2px 8px; border-radius: 3px;">#D5D8DC</span>

**PBR Properties:**
```json
{
  "baseColor": "#95A5A6",
  "roughness": 0.5,
  "metallic": 0.4,
  "normalStrength": 1.4,
  "aoStrength": 0.8,
  "heightScale": 0.05,
  "emissive": "#BDC3C7"
}
```

**Procedural Rules:**
> Textures reflect the resource specialization of the federation.

**Textures:**
- **Metal049A** (Metal): <img src="../../packages/gen/public/textures/metal/Metal049A_bundle_2K.jpg" alt="Metal 049 A" width="200" />
- **Rock030** (Rock): <img src="../../packages/gen/public/textures/rock/Rock030_bundle_2K.jpg" alt="Rock 030" width="200" />

---

#### Sovereign Mesh (`archetype_005`)

**Description:** A democratic mesh of tribes where power is distributed horizontally, and decisions are made collectively through transparent consensus.

**Parameters:**
```json
{
  "governanceComplexity": {
    "min": 0.7,
    "max": 1,
    "default": 0.85
  },
  "decisionSpeed": {
    "min": 0.3,
    "max": 0.5,
    "default": 0.4
  },
  "resourceEfficiency": {
    "min": 0.5,
    "max": 0.7,
    "default": 0.6
  },
  "socialStability": {
    "min": 0.9,
    "max": 1,
    "default": 0.95
  }
}
```

**Color Palette:**
- <span style="background-color: #F5B041; padding: 2px 8px; border-radius: 3px;">#F5B041</span>
- <span style="background-color: #45B39D; padding: 2px 8px; border-radius: 3px;">#45B39D</span>
- <span style="background-color: #BB8FCE; padding: 2px 8px; border-radius: 3px;">#BB8FCE</span>
- <span style="background-color: #F4D03F; padding: 2px 8px; border-radius: 3px;">#F4D03F</span>
- <span style="background-color: #1C2833; padding: 2px 8px; border-radius: 3px;">#1C2833</span>

**PBR Properties:**
```json
{
  "baseColor": "#45B39D",
  "roughness": 0.6,
  "metallic": 0.2,
  "normalStrength": 1.1,
  "aoStrength": 0.7,
  "heightScale": 0.03,
  "emissive": "#F4D03F"
}
```

**Procedural Rules:**
> Textile patterns are diverse but unified in shared symbolism.

**Textures:**
- **Fabric023** (Fabric): <img src="../../packages/gen/public/textures/fabric/Fabric023_bundle_2K.jpg" alt="Fabric 023" width="200" />
- **Metal050** (unknown): `Metal050` (not found in manifest)

---

#### Iron Veil Protection Alliance (`archetype_006`)

**Description:** A defensive alliance model prioritizing mutual protection and coordinated responses to external threats, securing territorial boundaries.

**Parameters:**
```json
{
  "governanceComplexity": {
    "min": 0.5,
    "max": 0.8,
    "default": 0.7
  },
  "decisionSpeed": {
    "min": 0.6,
    "max": 0.9,
    "default": 0.8
  },
  "resourceEfficiency": {
    "min": 0.4,
    "max": 0.6,
    "default": 0.5
  },
  "socialStability": {
    "min": 0.6,
    "max": 0.8,
    "default": 0.7
  }
}
```

**Color Palette:**
- <span style="background-color: #2C3E50; padding: 2px 8px; border-radius: 3px;">#2C3E50</span>
- <span style="background-color: #E74C3C; padding: 2px 8px; border-radius: 3px;">#E74C3C</span>
- <span style="background-color: #3498DB; padding: 2px 8px; border-radius: 3px;">#3498DB</span>
- <span style="background-color: #9B59B6; padding: 2px 8px; border-radius: 3px;">#9B59B6</span>
- <span style="background-color: #27AE60; padding: 2px 8px; border-radius: 3px;">#27AE60</span>

**PBR Properties:**
```json
{
  "baseColor": "#2C3E50",
  "roughness": 0.7,
  "metallic": 0.3,
  "normalStrength": 1.3,
  "aoStrength": 0.9,
  "heightScale": 0.06,
  "emissive": "#E74C3C"
}
```

**Procedural Rules:**
> Metals signify protection, stone textures underline defense.

**Textures:**
- **Metal050** (unknown): `Metal050` (not found in manifest)
- **Rock025** (unknown): `Rock025` (not found in manifest)

---

#### Equilibrium Council (`archetype_007`)

**Description:** Designed to maintain societal balance by integrating rotating leadership roles based on individual merit and achievement, supporting dynamic stability.

**Parameters:**
```json
{
  "governanceComplexity": {
    "min": 0.4,
    "max": 0.7,
    "default": 0.6
  },
  "decisionSpeed": {
    "min": 0.5,
    "max": 0.8,
    "default": 0.7
  },
  "resourceEfficiency": {
    "min": 0.6,
    "max": 0.8,
    "default": 0.75
  },
  "socialStability": {
    "min": 0.7,
    "max": 0.9,
    "default": 0.8
  }
}
```

**Color Palette:**
- <span style="background-color: #34495E; padding: 2px 8px; border-radius: 3px;">#34495E</span>
- <span style="background-color: #1ABC9C; padding: 2px 8px; border-radius: 3px;">#1ABC9C</span>
- <span style="background-color: #F39C12; padding: 2px 8px; border-radius: 3px;">#F39C12</span>
- <span style="background-color: #E67E22; padding: 2px 8px; border-radius: 3px;">#E67E22</span>
- <span style="background-color: #8E44AD; padding: 2px 8px; border-radius: 3px;">#8E44AD</span>

**PBR Properties:**
```json
{
  "baseColor": "#1ABC9C",
  "roughness": 0.5,
  "metallic": 0.3,
  "normalStrength": 1.1,
  "aoStrength": 0.6,
  "heightScale": 0.02,
  "emissive": "#F39C12"
}
```

**Procedural Rules:**
> Patterns represent change, unity, and dynamic governance.

**Textures:**
- **Fabric019** (Fabric): <img src="../../packages/gen/public/textures/fabric/Fabric019_bundle_2K.jpg" alt="Fabric 019" width="200" />
- **Leather012** (Leather): <img src="../../packages/gen/public/textures/leather/Leather012_bundle_2K.jpg" alt="Leather 012" width="200" />

---

#### Radiant Assembly (`archetype_008`)

**Description:** A highly structured democratic assembly focusing on resource innovation and technological advancement, blending different tribal disciplines.

**Parameters:**
```json
{
  "governanceComplexity": {
    "min": 0.8,
    "max": 1,
    "default": 0.9
  },
  "decisionSpeed": {
    "min": 0.3,
    "max": 0.5,
    "default": 0.4
  },
  "resourceEfficiency": {
    "min": 0.7,
    "max": 1,
    "default": 0.85
  },
  "socialStability": {
    "min": 0.8,
    "max": 1,
    "default": 0.9
  }
}
```

**Color Palette:**
- <span style="background-color: #3498DB; padding: 2px 8px; border-radius: 3px;">#3498DB</span>
- <span style="background-color: #1ABC9C; padding: 2px 8px; border-radius: 3px;">#1ABC9C</span>
- <span style="background-color: #F39C12; padding: 2px 8px; border-radius: 3px;">#F39C12</span>
- <span style="background-color: #E74C3C; padding: 2px 8px; border-radius: 3px;">#E74C3C</span>
- <span style="background-color: #8E44AD; padding: 2px 8px; border-radius: 3px;">#8E44AD</span>

**PBR Properties:**
```json
{
  "baseColor": "#3498DB",
  "roughness": 0.4,
  "metallic": 0.35,
  "normalStrength": 1.5,
  "aoStrength": 0.7,
  "heightScale": 0.03,
  "emissive": "#8E44AD"
}
```

**Procedural Rules:**
> Fabrics symbolize knowledge exchange, metals express innovation.

**Textures:**
- **Metal049A** (Metal): <img src="../../packages/gen/public/textures/metal/Metal049A_bundle_2K.jpg" alt="Metal 049 A" width="200" />
- **Fabric023** (Fabric): <img src="../../packages/gen/public/textures/fabric/Fabric023_bundle_2K.jpg" alt="Fabric 023" width="200" />

---


### MICRO: Fine-grained details and specific implementations

**WEFT Flow:** Building on MACRO and MESO scales:
- MACRO: "Trade Winds Network", "Alliance Network"...
- MESO: "Iron Nexus Council", "Metal Tapestry Confederation"...

**Total Archetypes:** 6

#### Harmony Keeper (`role_001`)

**Description:** An individual whose primary role is to mediate disputes and maintain harmony among tribe members and with neighboring tribes. Known for their calm demeanor and profound understanding of social dynamics.

**Parameters:**
```json
{
  "roleAuthority": {
    "min": 0.4,
    "max": 0.8,
    "default": 0.6
  },
  "skillRequirement": {
    "min": 0.7,
    "max": 1,
    "default": 0.85
  },
  "socialStatus": {
    "min": 0.5,
    "max": 0.9,
    "default": 0.7
  },
  "resourceAccess": {
    "min": 0.3,
    "max": 0.6,
    "default": 0.5
  }
}
```

**Color Palette:**
- <span style="background-color: #8A2BE2; padding: 2px 8px; border-radius: 3px;">#8A2BE2</span>
- <span style="background-color: #9370DB; padding: 2px 8px; border-radius: 3px;">#9370DB</span>
- <span style="background-color: #E6E6FA; padding: 2px 8px; border-radius: 3px;">#E6E6FA</span>
- <span style="background-color: #F8F8FF; padding: 2px 8px; border-radius: 3px;">#F8F8FF</span>
- <span style="background-color: #4B0082; padding: 2px 8px; border-radius: 3px;">#4B0082</span>

**PBR Properties:**
```json
{
  "baseColor": "#8A2BE2",
  "roughness": 0.5,
  "metallic": 0.1,
  "normalStrength": 1,
  "aoStrength": 0.7,
  "heightScale": 0.02,
  "emissive": "#9370DB"
}
```

**Procedural Rules:**
> Fabric patterns change to reflect emotional states, incorporating flowing lines and waves.

**Textures:**
- **Fabric019** (Fabric): <img src="../../packages/gen/public/textures/fabric/Fabric019_bundle_2K.jpg" alt="Fabric 019" width="200" />
- **Leather011** (Leather): <img src="../../packages/gen/public/textures/leather/Leather011_bundle_2K.jpg" alt="Leather 011" width="200" />

---

#### Resource Strategist (`role_002`)

**Description:** Specializes in analyzing and optimizing resource allocation within and between tribes, balancing supply with communal needs.

**Parameters:**
```json
{
  "roleAuthority": {
    "min": 0.6,
    "max": 0.9,
    "default": 0.75
  },
  "skillRequirement": {
    "min": 0.7,
    "max": 0.95,
    "default": 0.85
  },
  "socialStatus": {
    "min": 0.4,
    "max": 0.7,
    "default": 0.55
  },
  "resourceAccess": {
    "min": 0.6,
    "max": 1,
    "default": 0.8
  }
}
```

**Color Palette:**
- <span style="background-color: #9C661F; padding: 2px 8px; border-radius: 3px;">#9C661F</span>
- <span style="background-color: #CD853F; padding: 2px 8px; border-radius: 3px;">#CD853F</span>
- <span style="background-color: #D2B48C; padding: 2px 8px; border-radius: 3px;">#D2B48C</span>
- <span style="background-color: #DEB887; padding: 2px 8px; border-radius: 3px;">#DEB887</span>
- <span style="background-color: #F5DEB3; padding: 2px 8px; border-radius: 3px;">#F5DEB3</span>

**PBR Properties:**
```json
{
  "baseColor": "#9C661F",
  "roughness": 0.7,
  "metallic": 0.3,
  "normalStrength": 1,
  "aoStrength": 0.9,
  "heightScale": 0.03,
  "emissive": "#CD853F"
}
```

**Procedural Rules:**
> Visual patterns shift between tight geometric shapes and expansive fields, symbolizing resource flow.

**Textures:**
- **Metal049A** (Metal): <img src="../../packages/gen/public/textures/metal/Metal049A_bundle_2K.jpg" alt="Metal 049 A" width="200" />
- **Fabric023** (Fabric): <img src="../../packages/gen/public/textures/fabric/Fabric023_bundle_2K.jpg" alt="Fabric 023" width="200" />

---

#### Cultural Artisan (`role_003`)

**Description:** Creates and maintains cultural artifacts that encode tribal history and identity. Proficient in integrating new materials into traditional forms.

**Parameters:**
```json
{
  "roleAuthority": {
    "min": 0.3,
    "max": 0.6,
    "default": 0.4
  },
  "skillRequirement": {
    "min": 0.8,
    "max": 1,
    "default": 0.9
  },
  "socialStatus": {
    "min": 0.5,
    "max": 0.8,
    "default": 0.65
  },
  "resourceAccess": {
    "min": 0.4,
    "max": 0.7,
    "default": 0.55
  }
}
```

**Color Palette:**
- <span style="background-color: #FFD700; padding: 2px 8px; border-radius: 3px;">#FFD700</span>
- <span style="background-color: #FF8C00; padding: 2px 8px; border-radius: 3px;">#FF8C00</span>
- <span style="background-color: #FFFF00; padding: 2px 8px; border-radius: 3px;">#FFFF00</span>
- <span style="background-color: #FF4500; padding: 2px 8px; border-radius: 3px;">#FF4500</span>
- <span style="background-color: #D2691E; padding: 2px 8px; border-radius: 3px;">#D2691E</span>

**PBR Properties:**
```json
{
  "baseColor": "#FFD700",
  "roughness": 0.6,
  "metallic": 0.2,
  "normalStrength": 0.8,
  "aoStrength": 0.85,
  "heightScale": 0.05,
  "emissive": "#FF8C00"
}
```

**Procedural Rules:**
> Patterns are inspired by natural motifs and embossed with tribal symbols.

**Textures:**
- **Leather012** (Leather): <img src="../../packages/gen/public/textures/leather/Leather012_bundle_2K.jpg" alt="Leather 012" width="200" />
- **Wood094** (Wood): <img src="../../packages/gen/public/textures/wood/Wood094_bundle_2K.jpg" alt="Wood 094" width="200" />

---

#### Iron Vanguard (`role_004`)

**Description:** Trained to protect tribal territories and manage defensive structures, this warrior is clad in metal-enhanced gear.

**Parameters:**
```json
{
  "roleAuthority": {
    "min": 0.5,
    "max": 0.8,
    "default": 0.7
  },
  "skillRequirement": {
    "min": 0.7,
    "max": 0.95,
    "default": 0.85
  },
  "socialStatus": {
    "min": 0.6,
    "max": 0.9,
    "default": 0.8
  },
  "resourceAccess": {
    "min": 0.3,
    "max": 0.6,
    "default": 0.45
  }
}
```

**Color Palette:**
- <span style="background-color: #4B0082; padding: 2px 8px; border-radius: 3px;">#4B0082</span>
- <span style="background-color: #483D8B; padding: 2px 8px; border-radius: 3px;">#483D8B</span>
- <span style="background-color: #2F4F4F; padding: 2px 8px; border-radius: 3px;">#2F4F4F</span>
- <span style="background-color: #006400; padding: 2px 8px; border-radius: 3px;">#006400</span>
- <span style="background-color: #1E90FF; padding: 2px 8px; border-radius: 3px;">#1E90FF</span>

**PBR Properties:**
```json
{
  "baseColor": "#4B0082",
  "roughness": 0.4,
  "metallic": 0.5,
  "normalStrength": 1.5,
  "aoStrength": 1,
  "heightScale": 0.04,
  "emissive": "#483D8B"
}
```

**Procedural Rules:**
> Metallic surfaces show dynamic reflection variances to intimidate foes.

**Textures:**
- **Metal050** (unknown): `Metal050` (not found in manifest)
- **Leather011** (Leather): <img src="../../packages/gen/public/textures/leather/Leather011_bundle_2K.jpg" alt="Leather 011" width="200" />

---

#### Inter-Tribal Liaison (`role_005`)

**Description:** Facilitates communication and collaboration between tribes, knowledgeable about multiple cultures and languages.

**Parameters:**
```json
{
  "roleAuthority": {
    "min": 0.4,
    "max": 0.7,
    "default": 0.55
  },
  "skillRequirement": {
    "min": 0.8,
    "max": 1,
    "default": 0.9
  },
  "socialStatus": {
    "min": 0.5,
    "max": 0.8,
    "default": 0.65
  },
  "resourceAccess": {
    "min": 0.2,
    "max": 0.5,
    "default": 0.4
  }
}
```

**Color Palette:**
- <span style="background-color: #4682B4; padding: 2px 8px; border-radius: 3px;">#4682B4</span>
- <span style="background-color: #5F9EA0; padding: 2px 8px; border-radius: 3px;">#5F9EA0</span>
- <span style="background-color: #87CEEB; padding: 2px 8px; border-radius: 3px;">#87CEEB</span>
- <span style="background-color: #8A2BE2; padding: 2px 8px; border-radius: 3px;">#8A2BE2</span>
- <span style="background-color: #7B68EE; padding: 2px 8px; border-radius: 3px;">#7B68EE</span>

**PBR Properties:**
```json
{
  "baseColor": "#4682B4",
  "roughness": 0.6,
  "metallic": 0.1,
  "normalStrength": 1,
  "aoStrength": 0.85,
  "heightScale": 0.04,
  "emissive": "#5F9EA0"
}
```

**Procedural Rules:**
> Textile patterns feature motifs from various tribes, facilitating cross-cultural identification.

**Textures:**
- **Fabric023** (Fabric): <img src="../../packages/gen/public/textures/fabric/Fabric023_bundle_2K.jpg" alt="Fabric 023" width="200" />
- **Leather012** (Leather): <img src="../../packages/gen/public/textures/leather/Leather012_bundle_2K.jpg" alt="Leather 012" width="200" />

---

#### Innovative Machinist (`role_006`)

**Description:** Specializes in the creation and maintenance of advanced machinery used in mining and resource extraction, integrating new technologies with tribal needs.

**Parameters:**
```json
{
  "roleAuthority": {
    "min": 0.4,
    "max": 0.7,
    "default": 0.55
  },
  "skillRequirement": {
    "min": 0.9,
    "max": 1,
    "default": 0.95
  },
  "socialStatus": {
    "min": 0.5,
    "max": 0.8,
    "default": 0.65
  },
  "resourceAccess": {
    "min": 0.6,
    "max": 1,
    "default": 0.8
  }
}
```

**Color Palette:**
- <span style="background-color: #A9A9A9; padding: 2px 8px; border-radius: 3px;">#A9A9A9</span>
- <span style="background-color: #808080; padding: 2px 8px; border-radius: 3px;">#808080</span>
- <span style="background-color: #696969; padding: 2px 8px; border-radius: 3px;">#696969</span>
- <span style="background-color: #C0C0C0; padding: 2px 8px; border-radius: 3px;">#C0C0C0</span>
- <span style="background-color: #D3D3D3; padding: 2px 8px; border-radius: 3px;">#D3D3D3</span>
- <span style="background-color: #778899; padding: 2px 8px; border-radius: 3px;">#778899</span>

**PBR Properties:**
```json
{
  "baseColor": "#808080",
  "roughness": 0.4,
  "metallic": 0.6,
  "normalStrength": 1.2,
  "aoStrength": 1,
  "heightScale": 0.03,
  "emissive": "#696969"
}
```

**Procedural Rules:**
> Machinery surfaces dynamically adjust based on environmental wear and tear.

**Textures:**
- **Metal049A** (Metal): <img src="../../packages/gen/public/textures/metal/Metal049A_bundle_2K.jpg" alt="Metal 049 A" width="200" />
- **Concrete023** (Concrete): <img src="../../packages/gen/public/textures/concrete/Concrete023_bundle_2K.jpg" alt="Concrete 023" width="200" />

---


---

## Gen 5: Building Systems {#generation-5}

**WARP Flow:** Inheriting knowledge from previous generation:
- **Gen 4: Tribe Formation** provided:
  - "Trade Winds Network", "Alliance Network", "Conflict Zone", "Cultural Exchange Hubs", "Diplomatic Hub"...
  - Total: 19 archetypes across all scales

---

### MACRO: System-level context and foundational patterns

**Total Archetypes:** 4

#### Iron Nexus City (`urban_center_001`)

**Description:** A dense urban hub thriving in metal-rich environments featuring towering structures and complex transport systems.

**Parameters:**
```json
{
  "settlementDensity": {
    "min": 0.7,
    "max": 1,
    "default": 0.85
  },
  "infrastructureComplexity": {
    "min": 0.8,
    "max": 1,
    "default": 0.9
  },
  "populationCapacity": {
    "min": 0.5,
    "max": 1,
    "default": 0.8
  },
  "resourceEfficiency": {
    "min": 0.6,
    "max": 0.9,
    "default": 0.75
  }
}
```

**Color Palette:**
- <span style="background-color: #708090; padding: 2px 8px; border-radius: 3px;">#708090</span>
- <span style="background-color: #2F4F4F; padding: 2px 8px; border-radius: 3px;">#2F4F4F</span>
- <span style="background-color: #4682B4; padding: 2px 8px; border-radius: 3px;">#4682B4</span>
- <span style="background-color: #5F9EA0; padding: 2px 8px; border-radius: 3px;">#5F9EA0</span>
- <span style="background-color: #778899; padding: 2px 8px; border-radius: 3px;">#778899</span>

**PBR Properties:**
```json
{
  "baseColor": "#708090",
  "roughness": 0.7,
  "metallic": 0.5,
  "normalStrength": 1,
  "aoStrength": 0.8,
  "heightScale": 0.05,
  "emissive": "#2F4F4F"
}
```

**Procedural Rules:**
> Skyscrapers exhibit a variety of metal textures interspersed with reflective surfaces.

**Textures:**
- **Metal049A** (Metal): <img src="../../packages/gen/public/textures/metal/Metal049A_bundle_2K.jpg" alt="Metal 049 A" width="200" />
- **Concrete023** (Concrete): <img src="../../packages/gen/public/textures/concrete/Concrete023_bundle_2K.jpg" alt="Concrete 023" width="200" />

---

#### Fortified Enclave (`defensive_cluster_002`)

**Description:** A strategically positioned settlement focused on defense, utilizing natural rock formations and advanced construction techniques.

**Parameters:**
```json
{
  "settlementDensity": {
    "min": 0.4,
    "max": 0.7,
    "default": 0.5
  },
  "infrastructureComplexity": {
    "min": 0.5,
    "max": 0.8,
    "default": 0.7
  },
  "populationCapacity": {
    "min": 0.3,
    "max": 0.6,
    "default": 0.5
  },
  "resourceEfficiency": {
    "min": 0.7,
    "max": 1,
    "default": 0.9
  }
}
```

**Color Palette:**
- <span style="background-color: #6A5ACD; padding: 2px 8px; border-radius: 3px;">#6A5ACD</span>
- <span style="background-color: #8A2BE2; padding: 2px 8px; border-radius: 3px;">#8A2BE2</span>
- <span style="background-color: #4B0082; padding: 2px 8px; border-radius: 3px;">#4B0082</span>
- <span style="background-color: #5B5B5B; padding: 2px 8px; border-radius: 3px;">#5B5B5B</span>
- <span style="background-color: #696969; padding: 2px 8px; border-radius: 3px;">#696969</span>

**PBR Properties:**
```json
{
  "baseColor": "#6A5ACD",
  "roughness": 0.9,
  "metallic": 0.2,
  "normalStrength": 1.2,
  "aoStrength": 1,
  "heightScale": 0.1,
  "emissive": "#4B0082"
}
```

**Procedural Rules:**
> Buildings merge seamlessly into the rocky landscape, reinforced with brick fortifications.

**Textures:**
- **Rock025** (unknown): `Rock025` (not found in manifest)
- **Bricks051** (Bricks): <img src="../../packages/gen/public/textures/bricks/Bricks051_bundle_2K.jpg" alt="Bricks 051" width="200" />

---

#### Metal Exchange Port (`trade_hub_003`)

**Description:** An essential trade nexus bustling with activity, facilitating extensive resource exchange along major trade routes.

**Parameters:**
```json
{
  "settlementDensity": {
    "min": 0.5,
    "max": 0.9,
    "default": 0.75
  },
  "infrastructureComplexity": {
    "min": 0.6,
    "max": 0.9,
    "default": 0.8
  },
  "populationCapacity": {
    "min": 0.6,
    "max": 0.9,
    "default": 0.85
  },
  "resourceEfficiency": {
    "min": 0.7,
    "max": 1,
    "default": 0.9
  }
}
```

**Color Palette:**
- <span style="background-color: #DAA520; padding: 2px 8px; border-radius: 3px;">#DAA520</span>
- <span style="background-color: #B8860B; padding: 2px 8px; border-radius: 3px;">#B8860B</span>
- <span style="background-color: #FFB6C1; padding: 2px 8px; border-radius: 3px;">#FFB6C1</span>
- <span style="background-color: #FFD700; padding: 2px 8px; border-radius: 3px;">#FFD700</span>
- <span style="background-color: #FF6347; padding: 2px 8px; border-radius: 3px;">#FF6347</span>

**PBR Properties:**
```json
{
  "baseColor": "#DAA520",
  "roughness": 0.4,
  "metallic": 0.6,
  "normalStrength": 1.1,
  "aoStrength": 0.9,
  "heightScale": 0.03,
  "emissive": "#FFD700"
}
```

**Procedural Rules:**
> Markets display a diverse range of metalworks, highlighted by vibrant colors and bustling activity.

**Textures:**
- **Metal050** (unknown): `Metal050` (not found in manifest)
- **Bricks060** (Bricks): <img src="../../packages/gen/public/textures/bricks/Bricks060_bundle_2K.jpg" alt="Bricks 060" width="200" />

---

#### Metalmine Basin (`resource_site_005`)

**Description:** A pivotal installation focused on the extraction and processing of mineral-rich deposits found within natural basins.

**Parameters:**
```json
{
  "settlementDensity": {
    "min": 0.2,
    "max": 0.5,
    "default": 0.3
  },
  "infrastructureComplexity": {
    "min": 0.3,
    "max": 0.6,
    "default": 0.5
  },
  "populationCapacity": {
    "min": 0.2,
    "max": 0.4,
    "default": 0.3
  },
  "resourceEfficiency": {
    "min": 0.8,
    "max": 1,
    "default": 0.95
  }
}
```

**Color Palette:**
- <span style="background-color: #B0C4DE; padding: 2px 8px; border-radius: 3px;">#B0C4DE</span>
- <span style="background-color: #6960EC; padding: 2px 8px; border-radius: 3px;">#6960EC</span>
- <span style="background-color: #008080; padding: 2px 8px; border-radius: 3px;">#008080</span>
- <span style="background-color: #4682B4; padding: 2px 8px; border-radius: 3px;">#4682B4</span>
- <span style="background-color: #5F9EA0; padding: 2px 8px; border-radius: 3px;">#5F9EA0</span>

**PBR Properties:**
```json
{
  "baseColor": "#B0C4DE",
  "roughness": 0.9,
  "metallic": 0,
  "normalStrength": 1.3,
  "aoStrength": 1,
  "heightScale": 0.02,
  "emissive": "#6960EC"
}
```

**Procedural Rules:**
> Quarries and machinery reflect the surrounding geology, with pathways between extraction points.

**Textures:**
- **Rock030** (Rock): <img src="../../packages/gen/public/textures/rock/Rock030_bundle_2K.jpg" alt="Rock 030" width="200" />
- **Concrete025** (Concrete): <img src="../../packages/gen/public/textures/concrete/Concrete025_bundle_2K.jpg" alt="Concrete 025" width="200" />

---


### MESO: Intermediate dynamics and structural relationships

**WEFT Flow:** Building on MACRO scale archetypes:
- "Iron Nexus City", "Fortified Enclave", "Metal Exchange Port"...

**Total Archetypes:** 4

#### Skyward Living Cluster (`residential_habitat_01`)

**Description:** A multi-tiered residential system designed for vertical expansion in metal-rich urban environments. Utilizes dynamic iron-aluminum alloys to create a robust yet flexible living space.

**Parameters:**
```json
{
  "buildingCapacity": {
    "min": 20,
    "max": 150,
    "default": 80
  },
  "constructionCost": {
    "min": 100,
    "max": 500,
    "default": 300
  },
  "functionalEfficiency": {
    "min": 0.6,
    "max": 1,
    "default": 0.85
  },
  "maintenanceRequirement": {
    "min": 0.1,
    "max": 0.3,
    "default": 0.2
  }
}
```

**Color Palette:**
- <span style="background-color: #3A4B57; padding: 2px 8px; border-radius: 3px;">#3A4B57</span>
- <span style="background-color: #9C8E7D; padding: 2px 8px; border-radius: 3px;">#9C8E7D</span>
- <span style="background-color: #CFB99D; padding: 2px 8px; border-radius: 3px;">#CFB99D</span>
- <span style="background-color: #D6D9D0; padding: 2px 8px; border-radius: 3px;">#D6D9D0</span>
- <span style="background-color: #76827A; padding: 2px 8px; border-radius: 3px;">#76827A</span>

**PBR Properties:**
```json
{
  "baseColor": "#3A4B57",
  "roughness": 0.4,
  "metallic": 0.7,
  "normalStrength": 1.2,
  "aoStrength": 0.5,
  "heightScale": 0.02,
  "emissive": "#76827A"
}
```

**Procedural Rules:**
> Vertical expansions follow a fractal pattern to allow for natural light distribution.

**Textures:**
- **Metal049A** (Metal): <img src="../../packages/gen/public/textures/metal/Metal049A_bundle_2K.jpg" alt="Metal 049 A" width="200" />
- **Bricks051** (Bricks): <img src="../../packages/gen/public/textures/bricks/Bricks051_bundle_2K.jpg" alt="Bricks 051" width="200" />

---

#### Metalwork Fabrication Complex (`workshop_fabricator_02`)

**Description:** A centralized facility for crafting and assembling metal-based tools and structures, supporting both local and inter-tribal resource refinement needs.

**Parameters:**
```json
{
  "buildingCapacity": {
    "min": 5,
    "max": 20,
    "default": 12
  },
  "constructionCost": {
    "min": 150,
    "max": 600,
    "default": 375
  },
  "functionalEfficiency": {
    "min": 0.7,
    "max": 1,
    "default": 0.9
  },
  "maintenanceRequirement": {
    "min": 0.15,
    "max": 0.35,
    "default": 0.22
  }
}
```

**Color Palette:**
- <span style="background-color: #4F4F4F; padding: 2px 8px; border-radius: 3px;">#4F4F4F</span>
- <span style="background-color: #A5B2C2; padding: 2px 8px; border-radius: 3px;">#A5B2C2</span>
- <span style="background-color: #D4D9DF; padding: 2px 8px; border-radius: 3px;">#D4D9DF</span>
- <span style="background-color: #F0F0F0; padding: 2px 8px; border-radius: 3px;">#F0F0F0</span>
- <span style="background-color: #6A798A; padding: 2px 8px; border-radius: 3px;">#6A798A</span>

**PBR Properties:**
```json
{
  "baseColor": "#4F4F4F",
  "roughness": 0.8,
  "metallic": 0.4,
  "normalStrength": 1,
  "aoStrength": 0.7,
  "heightScale": 0.03,
  "emissive": "#6A798A"
}
```

**Procedural Rules:**
> Exteriors are adorned with modular panels that can be swapped out or reconfigured as needed.

**Textures:**
- **Metal050** (unknown): `Metal050` (not found in manifest)
- **Concrete023** (Concrete): <img src="../../packages/gen/public/textures/concrete/Concrete023_bundle_2K.jpg" alt="Concrete 023" width="200" />

---

#### Vaulted Resource Bastion (`storage_facility_03`)

**Description:** A vast underground network for storing essential raw materials and finished products, safeguarded by natural formations.

**Parameters:**
```json
{
  "buildingCapacity": {
    "min": 100,
    "max": 500,
    "default": 300
  },
  "constructionCost": {
    "min": 200,
    "max": 800,
    "default": 500
  },
  "functionalEfficiency": {
    "min": 0.5,
    "max": 1,
    "default": 0.85
  },
  "maintenanceRequirement": {
    "min": 0.05,
    "max": 0.2,
    "default": 0.1
  }
}
```

**Color Palette:**
- <span style="background-color: #5A5A5A; padding: 2px 8px; border-radius: 3px;">#5A5A5A</span>
- <span style="background-color: #7B7B7B; padding: 2px 8px; border-radius: 3px;">#7B7B7B</span>
- <span style="background-color: #9E9E9E; padding: 2px 8px; border-radius: 3px;">#9E9E9E</span>
- <span style="background-color: #CCCCCC; padding: 2px 8px; border-radius: 3px;">#CCCCCC</span>
- <span style="background-color: #E6E6E6; padding: 2px 8px; border-radius: 3px;">#E6E6E6</span>

**PBR Properties:**
```json
{
  "baseColor": "#5A5A5A",
  "roughness": 0.9,
  "metallic": 0.1,
  "normalStrength": 1.4,
  "aoStrength": 0.8,
  "heightScale": 0.04,
  "emissive": "#CCCCCC"
}
```

**Procedural Rules:**
> Rock carvings vary by segment, blending artificial structures with natural formations.

**Textures:**
- **Rock025** (unknown): `Rock025` (not found in manifest)
- **Concrete025** (Concrete): <img src="../../packages/gen/public/textures/concrete/Concrete025_bundle_2K.jpg" alt="Concrete 025" width="200" />

---

#### Iron Council Hall (`administrative_center_04`)

**Description:** A formidable structure serving as the decision-making hub for inter-tribal governance and coordination, characterized by its gravitas-filled majesty.

**Parameters:**
```json
{
  "buildingCapacity": {
    "min": 15,
    "max": 60,
    "default": 30
  },
  "constructionCost": {
    "min": 300,
    "max": 900,
    "default": 650
  },
  "functionalEfficiency": {
    "min": 0.8,
    "max": 1,
    "default": 0.95
  },
  "maintenanceRequirement": {
    "min": 0.15,
    "max": 0.25,
    "default": 0.2
  }
}
```

**Color Palette:**
- <span style="background-color: #4D4D4D; padding: 2px 8px; border-radius: 3px;">#4D4D4D</span>
- <span style="background-color: #757575; padding: 2px 8px; border-radius: 3px;">#757575</span>
- <span style="background-color: #A8A8A8; padding: 2px 8px; border-radius: 3px;">#A8A8A8</span>
- <span style="background-color: #CCCCCC; padding: 2px 8px; border-radius: 3px;">#CCCCCC</span>
- <span style="background-color: #F7F7F7; padding: 2px 8px; border-radius: 3px;">#F7F7F7</span>

**PBR Properties:**
```json
{
  "baseColor": "#4D4D4D",
  "roughness": 0.3,
  "metallic": 0.6,
  "normalStrength": 1.3,
  "aoStrength": 0.9,
  "heightScale": 0.05,
  "emissive": "#F7F7F7"
}
```

**Procedural Rules:**
> Exterior features geometric recesses depicting tribal heritage and alliances.

**Textures:**
- **Metal049A** (Metal): <img src="../../packages/gen/public/textures/metal/Metal049A_bundle_2K.jpg" alt="Metal 049 A" width="200" />
- **Bricks060** (Bricks): <img src="../../packages/gen/public/textures/bricks/Bricks060_bundle_2K.jpg" alt="Bricks 060" width="200" />

---


### MICRO: Fine-grained details and specific implementations

**WEFT Flow:** Building on MACRO and MESO scales:
- MACRO: "Iron Nexus City", "Fortified Enclave"...
- MESO: "Skyward Living Cluster", "Metalwork Fabrication Complex"...

**Total Archetypes:** 6

#### Metal Weave Construction (`CM001`)

**Description:** A lightweight framework composed of interwoven metallic strands, optimized for rapid assembly and adaptation to uneven terrain.

**Parameters:**
```json
{
  "constructionSpeed": {
    "min": 0.5,
    "max": 0.9,
    "default": 0.7
  },
  "materialEfficiency": {
    "min": 0.7,
    "max": 1,
    "default": 0.85
  },
  "structuralStrength": {
    "min": 0.6,
    "max": 0.9,
    "default": 0.75
  },
  "durability": {
    "min": 0.5,
    "max": 0.8,
    "default": 0.65
  }
}
```

**Color Palette:**
- <span style="background-color: #323840; padding: 2px 8px; border-radius: 3px;">#323840</span>
- <span style="background-color: #687D8B; padding: 2px 8px; border-radius: 3px;">#687D8B</span>
- <span style="background-color: #A7BCC6; padding: 2px 8px; border-radius: 3px;">#A7BCC6</span>
- <span style="background-color: #D2DEE8; padding: 2px 8px; border-radius: 3px;">#D2DEE8</span>
- <span style="background-color: #FFFFFF; padding: 2px 8px; border-radius: 3px;">#FFFFFF</span>

**PBR Properties:**
```json
{
  "baseColor": "#687D8B",
  "roughness": 0.4,
  "metallic": 0.9,
  "normalStrength": 1.2,
  "aoStrength": 0.6,
  "heightScale": 0.03
}
```

**Procedural Rules:**
> Variations in weave density create visual complexity and strength gradients.

**Textures:**
- **Metal049A** (Metal): <img src="../../packages/gen/public/textures/metal/Metal049A_bundle_2K.jpg" alt="Metal 049 A" width="200" />
- **Metal050** (unknown): `Metal050` (not found in manifest)

---

#### Stone Filigree Masonry (`CM002`)

**Description:** Intricate stone masonry utilizing decorative patterns and precise joinery, providing aesthetic appeal and stability.

**Parameters:**
```json
{
  "constructionSpeed": {
    "min": 0.3,
    "max": 0.7,
    "default": 0.5
  },
  "materialEfficiency": {
    "min": 0.6,
    "max": 0.9,
    "default": 0.75
  },
  "structuralStrength": {
    "min": 0.8,
    "max": 1,
    "default": 0.9
  },
  "durability": {
    "min": 0.8,
    "max": 1,
    "default": 0.9
  }
}
```

**Color Palette:**
- <span style="background-color: #5E4C4A; padding: 2px 8px; border-radius: 3px;">#5E4C4A</span>
- <span style="background-color: #8A7D77; padding: 2px 8px; border-radius: 3px;">#8A7D77</span>
- <span style="background-color: #B5ADAA; padding: 2px 8px; border-radius: 3px;">#B5ADAA</span>
- <span style="background-color: #D8D5D3; padding: 2px 8px; border-radius: 3px;">#D8D5D3</span>
- <span style="background-color: #ECECEC; padding: 2px 8px; border-radius: 3px;">#ECECEC</span>

**PBR Properties:**
```json
{
  "baseColor": "#8A7D77",
  "roughness": 0.8,
  "metallic": 0.1,
  "normalStrength": 1.3,
  "aoStrength": 1,
  "heightScale": 0.06
}
```

**Procedural Rules:**
> Customized filigree designs applied during the carving process enhance uniqueness.

**Textures:**
- **Rock025** (unknown): `Rock025` (not found in manifest)
- **Rock030** (Rock): <img src="../../packages/gen/public/textures/rock/Rock030_bundle_2K.jpg" alt="Rock 030" width="200" />

---

#### Geomorph Earthworks (`CM003`)

**Description:** Earth and clay construction technique enhanced by natural terrain features, providing thermal and structural benefits.

**Parameters:**
```json
{
  "constructionSpeed": {
    "min": 0.4,
    "max": 0.6,
    "default": 0.5
  },
  "materialEfficiency": {
    "min": 0.8,
    "max": 1,
    "default": 0.9
  },
  "structuralStrength": {
    "min": 0.5,
    "max": 0.8,
    "default": 0.65
  },
  "durability": {
    "min": 0.6,
    "max": 0.8,
    "default": 0.7
  }
}
```

**Color Palette:**
- <span style="background-color: #6B572F; padding: 2px 8px; border-radius: 3px;">#6B572F</span>
- <span style="background-color: #8C7642; padding: 2px 8px; border-radius: 3px;">#8C7642</span>
- <span style="background-color: #A58D5D; padding: 2px 8px; border-radius: 3px;">#A58D5D</span>
- <span style="background-color: #C3A983; padding: 2px 8px; border-radius: 3px;">#C3A983</span>
- <span style="background-color: #DED3B0; padding: 2px 8px; border-radius: 3px;">#DED3B0</span>

**PBR Properties:**
```json
{
  "baseColor": "#8C7642",
  "roughness": 0.7,
  "metallic": 0,
  "normalStrength": 1,
  "aoStrength": 0.7,
  "heightScale": 0.04
}
```

**Procedural Rules:**
> Varied earth tones and surface textures reflect local soil composition.

**Textures:**
- **Grass001** (Grass): <img src="../../packages/gen/public/textures/grass/Grass001_bundle_2K.jpg" alt="Grass 001" width="200" />
- **Rock030** (Rock): <img src="../../packages/gen/public/textures/rock/Rock030_bundle_2K.jpg" alt="Rock 030" width="200" />

---

#### Composite Timber Framework (`CM004`)

**Description:** Advanced wood construction using multi-layered beams and interlocking joints, enhancing load-bearing capabilities.

**Parameters:**
```json
{
  "constructionSpeed": {
    "min": 0.6,
    "max": 0.85,
    "default": 0.75
  },
  "materialEfficiency": {
    "min": 0.7,
    "max": 0.9,
    "default": 0.8
  },
  "structuralStrength": {
    "min": 0.7,
    "max": 0.9,
    "default": 0.8
  },
  "durability": {
    "min": 0.6,
    "max": 0.8,
    "default": 0.7
  }
}
```

**Color Palette:**
- <span style="background-color: #3B2800; padding: 2px 8px; border-radius: 3px;">#3B2800</span>
- <span style="background-color: #5A3B00; padding: 2px 8px; border-radius: 3px;">#5A3B00</span>
- <span style="background-color: #7A552A; padding: 2px 8px; border-radius: 3px;">#7A552A</span>
- <span style="background-color: #9B704B; padding: 2px 8px; border-radius: 3px;">#9B704B</span>
- <span style="background-color: #BC8C71; padding: 2px 8px; border-radius: 3px;">#BC8C71</span>

**PBR Properties:**
```json
{
  "baseColor": "#7A552A",
  "roughness": 0.6,
  "metallic": 0,
  "normalStrength": 1.1,
  "aoStrength": 0.6,
  "heightScale": 0.02
}
```

**Procedural Rules:**
> Layer textures vary by species and orientation, adding complexity.

**Textures:**
- **Wood094** (Wood): <img src="../../packages/gen/public/textures/wood/Wood094_bundle_2K.jpg" alt="Wood 094" width="200" />
- **Wood051** (Wood): <img src="../../packages/gen/public/textures/wood/Wood051_bundle_2K.jpg" alt="Wood 051" width="200" />

---

#### Integrated Metal Casting (`CM005`)

**Description:** Metal casting technique using molds for uniform structural elements, ensuring precision and strength.

**Parameters:**
```json
{
  "constructionSpeed": {
    "min": 0.4,
    "max": 0.7,
    "default": 0.55
  },
  "materialEfficiency": {
    "min": 0.7,
    "max": 0.85,
    "default": 0.8
  },
  "structuralStrength": {
    "min": 0.8,
    "max": 1,
    "default": 0.9
  },
  "durability": {
    "min": 0.8,
    "max": 1,
    "default": 0.9
  }
}
```

**Color Palette:**
- <span style="background-color: #353839; padding: 2px 8px; border-radius: 3px;">#353839</span>
- <span style="background-color: #565656; padding: 2px 8px; border-radius: 3px;">#565656</span>
- <span style="background-color: #7F7F7F; padding: 2px 8px; border-radius: 3px;">#7F7F7F</span>
- <span style="background-color: #A0A0A0; padding: 2px 8px; border-radius: 3px;">#A0A0A0</span>
- <span style="background-color: #CCCCCC; padding: 2px 8px; border-radius: 3px;">#CCCCCC</span>

**PBR Properties:**
```json
{
  "baseColor": "#7F7F7F",
  "roughness": 0.5,
  "metallic": 0.9,
  "normalStrength": 1.4,
  "aoStrength": 0.8,
  "heightScale": 0.03
}
```

**Procedural Rules:**
> Casting imperfections add unique visual identifiers within elements.

**Textures:**
- **Concrete023** (Concrete): <img src="../../packages/gen/public/textures/concrete/Concrete023_bundle_2K.jpg" alt="Concrete 023" width="200" />
- **Metal050** (unknown): `Metal050` (not found in manifest)

---

#### Wattle and Daub Fusion (`CM006`)

**Description:** Traditional woven framework covered with an advanced composite for improved insulation and weather resistance.

**Parameters:**
```json
{
  "constructionSpeed": {
    "min": 0.5,
    "max": 0.75,
    "default": 0.65
  },
  "materialEfficiency": {
    "min": 0.8,
    "max": 1,
    "default": 0.9
  },
  "structuralStrength": {
    "min": 0.5,
    "max": 0.7,
    "default": 0.6
  },
  "durability": {
    "min": 0.6,
    "max": 0.8,
    "default": 0.7
  }
}
```

**Color Palette:**
- <span style="background-color: #A8935A; padding: 2px 8px; border-radius: 3px;">#A8935A</span>
- <span style="background-color: #C7B88D; padding: 2px 8px; border-radius: 3px;">#C7B88D</span>
- <span style="background-color: #E2D2AB; padding: 2px 8px; border-radius: 3px;">#E2D2AB</span>
- <span style="background-color: #F0E3C3; padding: 2px 8px; border-radius: 3px;">#F0E3C3</span>
- <span style="background-color: #FFF6E5; padding: 2px 8px; border-radius: 3px;">#FFF6E5</span>

**PBR Properties:**
```json
{
  "baseColor": "#C7B88D",
  "roughness": 0.7,
  "metallic": 0,
  "normalStrength": 1,
  "aoStrength": 0.6,
  "heightScale": 0.02
}
```

**Procedural Rules:**
> Variations in daub surface texture enhance visual complexity.

**Textures:**
- **Wood094** (Wood): <img src="../../packages/gen/public/textures/wood/Wood094_bundle_2K.jpg" alt="Wood 094" width="200" />
- **Concrete023** (Concrete): <img src="../../packages/gen/public/textures/concrete/Concrete023_bundle_2K.jpg" alt="Concrete 023" width="200" />

---


---

## Gen 6: Religion & Democracy {#generation-6}

**WARP Flow:** Inheriting knowledge from previous generation:
- **Gen 5: Building Systems** provided:
  - "Iron Nexus City", "Fortified Enclave", "Metal Exchange Port", "Metalmine Basin", "Skyward Living Cluster"...
  - Total: 14 archetypes across all scales

---

### MACRO: System-level context and foundational patterns

**Total Archetypes:** 3

#### Iron Harmony Doctrine (`archetype_001`)

**Description:** An ideological framework that perceives the universe as a symphony orchestrated by the balance of metal and consciousness. Believers see harmony in the network of iron veins that sustain their settlements.

**Parameters:**
```json
{
  "stellarMass": {
    "min": 1.1,
    "max": 2.5,
    "default": 1.5
  },
  "metallicity": {
    "min": 0.6,
    "max": 1.2,
    "default": 0.9
  },
  "age": {
    "min": 3,
    "max": 8,
    "default": 5.5
  },
  "orbitalDistance": {
    "min": 0.6,
    "max": 2,
    "default": 1.1
  }
}
```

**Color Palette:**
- <span style="background-color: #4F4F4F; padding: 2px 8px; border-radius: 3px;">#4F4F4F</span>
- <span style="background-color: #A3A3A3; padding: 2px 8px; border-radius: 3px;">#A3A3A3</span>
- <span style="background-color: #FFDD00; padding: 2px 8px; border-radius: 3px;">#FFDD00</span>
- <span style="background-color: #002233; padding: 2px 8px; border-radius: 3px;">#002233</span>
- <span style="background-color: #00AAFF; padding: 2px 8px; border-radius: 3px;">#00AAFF</span>

**PBR Properties:**
```json
{
  "baseColor": "#4F4F4F",
  "roughness": 0.6,
  "metallic": 0.7,
  "normalStrength": 1,
  "aoStrength": 0.9,
  "heightScale": 0.07,
  "emissive": "#FFDD00"
}
```

**Procedural Rules:**
> Patterns of interlocking metal veins with woven fabric codex representing philosophical texts.

**Textures:**
- **Metal049A** (Metal): <img src="../../packages/gen/public/textures/metal/Metal049A_bundle_2K.jpg" alt="Metal 049 A" width="200" />
- **Rock030** (Rock): <img src="../../packages/gen/public/textures/rock/Rock030_bundle_2K.jpg" alt="Rock 030" width="200" />
- **Fabric023** (Fabric): <img src="../../packages/gen/public/textures/fabric/Fabric023_bundle_2K.jpg" alt="Fabric 023" width="200" />

---

#### Stone Pattern Allegiance (`archetype_002`)

**Description:** An ideology that prioritizes the alignment and organization of stone structures as reflections of cosmic order. These structures serve both religious and social functions in guiding community life.

**Parameters:**
```json
{
  "stellarMass": {
    "min": 0.8,
    "max": 1.5,
    "default": 1.2
  },
  "metallicity": {
    "min": 0.3,
    "max": 0.9,
    "default": 0.6
  },
  "age": {
    "min": 2,
    "max": 6,
    "default": 4
  },
  "orbitalDistance": {
    "min": 0.5,
    "max": 1.5,
    "default": 1
  }
}
```

**Color Palette:**
- <span style="background-color: #70543E; padding: 2px 8px; border-radius: 3px;">#70543E</span>
- <span style="background-color: #D1C6B5; padding: 2px 8px; border-radius: 3px;">#D1C6B5</span>
- <span style="background-color: #8B8C89; padding: 2px 8px; border-radius: 3px;">#8B8C89</span>
- <span style="background-color: #3A3E41; padding: 2px 8px; border-radius: 3px;">#3A3E41</span>
- <span style="background-color: #D3D4D5; padding: 2px 8px; border-radius: 3px;">#D3D4D5</span>

**PBR Properties:**
```json
{
  "baseColor": "#70543E",
  "roughness": 0.8,
  "metallic": 0.2,
  "normalStrength": 0.9,
  "aoStrength": 0.85,
  "heightScale": 0.1,
  "emissive": "#D1C6B5"
}
```

**Procedural Rules:**
> Interwoven stone patterns manifested as divine symbols, generally woven with inscriptions using soft fabrics.

**Textures:**
- **Rock025** (unknown): `Rock025` (not found in manifest)
- **Bricks051** (Bricks): <img src="../../packages/gen/public/textures/bricks/Bricks051_bundle_2K.jpg" alt="Bricks 051" width="200" />
- **Fabric019** (Fabric): <img src="../../packages/gen/public/textures/fabric/Fabric019_bundle_2K.jpg" alt="Fabric 019" width="200" />

---

#### Metal Exchange Reverence (`archetype_003`)

**Description:** A complex belief system founded on the flow and trade of metals, associating economic activity with spiritual progression. Trade routes become pilgrimages, where metals carry spiritual weight.

**Parameters:**
```json
{
  "stellarMass": {
    "min": 0.9,
    "max": 1.8,
    "default": 1.4
  },
  "metallicity": {
    "min": 0.4,
    "max": 1,
    "default": 0.8
  },
  "age": {
    "min": 2,
    "max": 6,
    "default": 3.5
  },
  "orbitalDistance": {
    "min": 0.7,
    "max": 2.2,
    "default": 1.4
  }
}
```

**Color Palette:**
- <span style="background-color: #8D8D8D; padding: 2px 8px; border-radius: 3px;">#8D8D8D</span>
- <span style="background-color: #CFCFCF; padding: 2px 8px; border-radius: 3px;">#CFCFCF</span>
- <span style="background-color: #4D4D4D; padding: 2px 8px; border-radius: 3px;">#4D4D4D</span>
- <span style="background-color: #FFF700; padding: 2px 8px; border-radius: 3px;">#FFF700</span>
- <span style="background-color: #AE7C00; padding: 2px 8px; border-radius: 3px;">#AE7C00</span>

**PBR Properties:**
```json
{
  "baseColor": "#8D8D8D",
  "roughness": 0.3,
  "metallic": 0.85,
  "normalStrength": 1.2,
  "aoStrength": 0.7,
  "heightScale": 0.03,
  "emissive": "#FFF700"
}
```

**Procedural Rules:**
> Metallic consistency with interwoven trade patterns represented by softer contrasting textures.

**Textures:**
- **Metal050** (unknown): `Metal050` (not found in manifest)
- **Fabric023** (Fabric): <img src="../../packages/gen/public/textures/fabric/Fabric023_bundle_2K.jpg" alt="Fabric 023" width="200" />
- **Concrete023** (Concrete): <img src="../../packages/gen/public/textures/concrete/Concrete023_bundle_2K.jpg" alt="Concrete 023" width="200" />

---


### MESO: Intermediate dynamics and structural relationships

**WEFT Flow:** Building on MACRO scale archetypes:
- "Iron Harmony Doctrine", "Stone Pattern Allegiance", "Metal Exchange Reverence"

**Total Archetypes:** 4

#### Doctrine Council (`institutional_doctrine_council`)

**Description:** A central governing body that oversees the integration and interpretation of the Iron Harmony Doctrine across settlements. Functions as a spiritual and administrative guide, ensuring community alignment with cosmic principles.

**Parameters:**
```json
{
  "institutionalComplexity": {
    "min": 0.7,
    "max": 1,
    "default": 0.85
  },
  "coordinationEfficiency": {
    "min": 0.6,
    "max": 0.9,
    "default": 0.75
  },
  "influenceRange": {
    "min": 0.2,
    "max": 0.5,
    "default": 0.35
  },
  "stability": {
    "min": 0.8,
    "max": 1,
    "default": 0.9
  }
}
```

**Color Palette:**
- <span style="background-color: #8A8D91; padding: 2px 8px; border-radius: 3px;">#8A8D91</span>
- <span style="background-color: #C2C5C9; padding: 2px 8px; border-radius: 3px;">#C2C5C9</span>
- <span style="background-color: #E5E7E9; padding: 2px 8px; border-radius: 3px;">#E5E7E9</span>
- <span style="background-color: #7B7D81; padding: 2px 8px; border-radius: 3px;">#7B7D81</span>
- <span style="background-color: #343537; padding: 2px 8px; border-radius: 3px;">#343537</span>

**PBR Properties:**
```json
{
  "baseColor": "#8A8D91",
  "roughness": 0.6,
  "metallic": 0,
  "normalStrength": 1,
  "aoStrength": 0.9,
  "heightScale": 0.01,
  "emissive": "#C2C5C9"
}
```

**Procedural Rules:**
> Materials show intricate stone carving patterns interwoven with fabric elements.

**Textures:**
- **Stone049** (unknown): `Stone049` (not found in manifest)
- **Fabric023** (Fabric): <img src="../../packages/gen/public/textures/fabric/Fabric023_bundle_2K.jpg" alt="Fabric 023" width="200" />

---

#### Stone Pattern University (`stone_pattern_university`)

**Description:** An educational institution dedicated to teaching and expanding the principles of the Stone Pattern Allegiance, specializing in architectural and societal symmetries.

**Parameters:**
```json
{
  "institutionalComplexity": {
    "min": 0.6,
    "max": 0.9,
    "default": 0.75
  },
  "coordinationEfficiency": {
    "min": 0.5,
    "max": 0.7,
    "default": 0.6
  },
  "influenceRange": {
    "min": 0.3,
    "max": 0.6,
    "default": 0.4
  },
  "stability": {
    "min": 0.7,
    "max": 1,
    "default": 0.85
  }
}
```

**Color Palette:**
- <span style="background-color: #ADB7C0; padding: 2px 8px; border-radius: 3px;">#ADB7C0</span>
- <span style="background-color: #6C7A89; padding: 2px 8px; border-radius: 3px;">#6C7A89</span>
- <span style="background-color: #E0E3E5; padding: 2px 8px; border-radius: 3px;">#E0E3E5</span>
- <span style="background-color: #44546B; padding: 2px 8px; border-radius: 3px;">#44546B</span>
- <span style="background-color: #A0A4A8; padding: 2px 8px; border-radius: 3px;">#A0A4A8</span>

**PBR Properties:**
```json
{
  "baseColor": "#ADB7C0",
  "roughness": 0.7,
  "metallic": 0.1,
  "normalStrength": 0.9,
  "aoStrength": 0.85,
  "heightScale": 0.02,
  "emissive": "#6C7A89"
}
```

**Procedural Rules:**
> The surfaces of the university feature repeating geometric patterns and fabric banners.

**Textures:**
- **Rock030** (Rock): <img src="../../packages/gen/public/textures/rock/Rock030_bundle_2K.jpg" alt="Rock 030" width="200" />
- **Fabric019** (Fabric): <img src="../../packages/gen/public/textures/fabric/Fabric019_bundle_2K.jpg" alt="Fabric 019" width="200" />

---

#### Metal Trade Network (`metal_trade_network`)

**Description:** An economic institution facilitating the trade and distribution of metals across regions, operating on the principles of Metal Exchange Reverence.

**Parameters:**
```json
{
  "institutionalComplexity": {
    "min": 0.8,
    "max": 1,
    "default": 0.9
  },
  "coordinationEfficiency": {
    "min": 0.7,
    "max": 0.95,
    "default": 0.85
  },
  "influenceRange": {
    "min": 0.5,
    "max": 0.8,
    "default": 0.65
  },
  "stability": {
    "min": 0.6,
    "max": 0.9,
    "default": 0.75
  }
}
```

**Color Palette:**
- <span style="background-color: #BCC1C6; padding: 2px 8px; border-radius: 3px;">#BCC1C6</span>
- <span style="background-color: #F2F4F5; padding: 2px 8px; border-radius: 3px;">#F2F4F5</span>
- <span style="background-color: #AEB2B5; padding: 2px 8px; border-radius: 3px;">#AEB2B5</span>
- <span style="background-color: #868A8D; padding: 2px 8px; border-radius: 3px;">#868A8D</span>
- <span style="background-color: #5C5F63; padding: 2px 8px; border-radius: 3px;">#5C5F63</span>

**PBR Properties:**
```json
{
  "baseColor": "#BCC1C6",
  "roughness": 0.3,
  "metallic": 0.6,
  "normalStrength": 1.2,
  "aoStrength": 0.9,
  "heightScale": 0.015,
  "emissive": "#F2F4F5"
}
```

**Procedural Rules:**
> Network outposts exhibit reflective metal surfaces and interconnected fabric trade routes.

**Textures:**
- **Metal049A** (Metal): <img src="../../packages/gen/public/textures/metal/Metal049A_bundle_2K.jpg" alt="Metal 049 A" width="200" />
- **Fabric023** (Fabric): <img src="../../packages/gen/public/textures/fabric/Fabric023_bundle_2K.jpg" alt="Fabric 023" width="200" />

---

#### Cultural Preservation Society (`cultural_preservation_society`)

**Description:** An organization dedicated to preserving, chronicling, and transmitting cultural history, art, and knowledge within the framework of Iron Harmony Doctrine.

**Parameters:**
```json
{
  "institutionalComplexity": {
    "min": 0.4,
    "max": 0.7,
    "default": 0.55
  },
  "coordinationEfficiency": {
    "min": 0.4,
    "max": 0.7,
    "default": 0.55
  },
  "influenceRange": {
    "min": 0.2,
    "max": 0.5,
    "default": 0.35
  },
  "stability": {
    "min": 0.7,
    "max": 1,
    "default": 0.85
  }
}
```

**Color Palette:**
- <span style="background-color: #A9A9A9; padding: 2px 8px; border-radius: 3px;">#A9A9A9</span>
- <span style="background-color: #FFE8A1; padding: 2px 8px; border-radius: 3px;">#FFE8A1</span>
- <span style="background-color: #606060; padding: 2px 8px; border-radius: 3px;">#606060</span>
- <span style="background-color: #333333; padding: 2px 8px; border-radius: 3px;">#333333</span>
- <span style="background-color: #FFFFFF; padding: 2px 8px; border-radius: 3px;">#FFFFFF</span>

**PBR Properties:**
```json
{
  "baseColor": "#A9A9A9",
  "roughness": 0.5,
  "metallic": 0.2,
  "normalStrength": 1.1,
  "aoStrength": 0.95,
  "heightScale": 0.02,
  "emissive": "#FFE8A1"
}
```

**Procedural Rules:**
> Displays intricate wooden carvings and patterned fabric inserts as symbols of heritage.

**Textures:**
- **Wood094** (Wood): <img src="../../packages/gen/public/textures/wood/Wood094_bundle_2K.jpg" alt="Wood 094" width="200" />
- **Fabric019** (Fabric): <img src="../../packages/gen/public/textures/fabric/Fabric019_bundle_2K.jpg" alt="Fabric 019" width="200" />

---


### MICRO: Fine-grained details and specific implementations

**WEFT Flow:** Building on MACRO and MESO scales:
- MACRO: "Iron Harmony Doctrine", "Stone Pattern Allegiance"...
- MESO: "Doctrine Council", "Stone Pattern University"...

**Total Archetypes:** 5

#### Devotional Practices (`devotional-practices`)

**Description:** Personal rituals that express commitment to the Iron Harmony Doctrine, involving rhythmic chants and harmonized movements resonating with metal and stone landscapes.

**Parameters:**
```json
{
  "beliefIntensity": {
    "min": 0.7,
    "max": 1,
    "default": 0.85
  },
  "participationLevel": {
    "min": 0.6,
    "max": 1,
    "default": 0.8
  },
  "identityStrength": {
    "min": 0.5,
    "max": 0.9,
    "default": 0.7
  },
  "socialBonding": {
    "min": 0.4,
    "max": 0.8,
    "default": 0.6
  }
}
```

**Color Palette:**
- <span style="background-color: #708090; padding: 2px 8px; border-radius: 3px;">#708090</span>
- <span style="background-color: #A9A9A9; padding: 2px 8px; border-radius: 3px;">#A9A9A9</span>
- <span style="background-color: #778899; padding: 2px 8px; border-radius: 3px;">#778899</span>
- <span style="background-color: #D3D3D3; padding: 2px 8px; border-radius: 3px;">#D3D3D3</span>
- <span style="background-color: #C0C0C0; padding: 2px 8px; border-radius: 3px;">#C0C0C0</span>

**PBR Properties:**
```json
{
  "baseColor": "#708090",
  "roughness": 0.4,
  "metallic": 0.5,
  "normalStrength": 1,
  "aoStrength": 0.5,
  "heightScale": 0.03,
  "emissive": "#A9A9A9"
}
```

**Procedural Rules:**
> Surfaces feature intertwining metallic threads creating harmonic patterns.

**Textures:**
- **Metal049A** (Metal): <img src="../../packages/gen/public/textures/metal/Metal049A_bundle_2K.jpg" alt="Metal 049 A" width="200" />
- **Fabric019** (Fabric): <img src="../../packages/gen/public/textures/fabric/Fabric019_bundle_2K.jpg" alt="Fabric 019" width="200" />

---

#### Civic Duties (`civic-duties`)

**Description:** Structured communal responsibilities that individuals perform regularly to maintain alignment with Stone Pattern Allegiance, emphasizing civic engineering and stonework maintenance.

**Parameters:**
```json
{
  "beliefIntensity": {
    "min": 0.5,
    "max": 0.8,
    "default": 0.65
  },
  "participationLevel": {
    "min": 0.7,
    "max": 1,
    "default": 0.85
  },
  "identityStrength": {
    "min": 0.6,
    "max": 0.9,
    "default": 0.75
  },
  "socialBonding": {
    "min": 0.7,
    "max": 0.9,
    "default": 0.8
  }
}
```

**Color Palette:**
- <span style="background-color: #2C3E50; padding: 2px 8px; border-radius: 3px;">#2C3E50</span>
- <span style="background-color: #34495E; padding: 2px 8px; border-radius: 3px;">#34495E</span>
- <span style="background-color: #5D6D7E; padding: 2px 8px; border-radius: 3px;">#5D6D7E</span>
- <span style="background-color: #AAB7B8; padding: 2px 8px; border-radius: 3px;">#AAB7B8</span>
- <span style="background-color: #EAEDED; padding: 2px 8px; border-radius: 3px;">#EAEDED</span>

**PBR Properties:**
```json
{
  "baseColor": "#2C3E50",
  "roughness": 0.8,
  "metallic": 0,
  "normalStrength": 1.5,
  "aoStrength": 0.7,
  "heightScale": 0.05,
  "emissive": "#34495E"
}
```

**Procedural Rules:**
> Stone surfaces display procedural engravings reflecting community involvement.

**Textures:**
- **Rock025** (unknown): `Rock025` (not found in manifest)
- **Leather011** (Leather): <img src="../../packages/gen/public/textures/leather/Leather011_bundle_2K.jpg" alt="Leather 011" width="200" />

---

#### Cultural Identities (`cultural-identities`)

**Description:** Strongly held personal and collective identities rooted in the Metal Exchange Reverence, exhibiting decorative attire and unique dialects associated with trade interactions.

**Parameters:**
```json
{
  "beliefIntensity": {
    "min": 0.6,
    "max": 0.9,
    "default": 0.75
  },
  "participationLevel": {
    "min": 0.6,
    "max": 1,
    "default": 0.9
  },
  "identityStrength": {
    "min": 0.7,
    "max": 0.95,
    "default": 0.85
  },
  "socialBonding": {
    "min": 0.8,
    "max": 1,
    "default": 0.9
  }
}
```

**Color Palette:**
- <span style="background-color: #B0C4DE; padding: 2px 8px; border-radius: 3px;">#B0C4DE</span>
- <span style="background-color: #4682B4; padding: 2px 8px; border-radius: 3px;">#4682B4</span>
- <span style="background-color: #6495ED; padding: 2px 8px; border-radius: 3px;">#6495ED</span>
- <span style="background-color: #B0E0E6; padding: 2px 8px; border-radius: 3px;">#B0E0E6</span>
- <span style="background-color: #00CED1; padding: 2px 8px; border-radius: 3px;">#00CED1</span>

**PBR Properties:**
```json
{
  "baseColor": "#B0C4DE",
  "roughness": 0.5,
  "metallic": 0.6,
  "normalStrength": 1.2,
  "aoStrength": 0.7,
  "heightScale": 0.04,
  "emissive": "#4682B4"
}
```

**Procedural Rules:**
> Layered fabrics mixed with metallic adornments form a distinct identity appearance.

**Textures:**
- **Leather012** (Leather): <img src="../../packages/gen/public/textures/leather/Leather012_bundle_2K.jpg" alt="Leather 012" width="200" />
- **Metal050** (unknown): `Metal050` (not found in manifest)

---

#### Philosophical Commitments (`philosophical-commitments`)

**Description:** Deep contemplative practices driven by the understanding of universal harmony under the Iron Harmony Doctrine, focusing on self-awareness and cosmic alignment through minimalistic living.

**Parameters:**
```json
{
  "beliefIntensity": {
    "min": 0.8,
    "max": 1,
    "default": 0.9
  },
  "participationLevel": {
    "min": 0.5,
    "max": 1,
    "default": 0.7
  },
  "identityStrength": {
    "min": 0.7,
    "max": 0.95,
    "default": 0.85
  },
  "socialBonding": {
    "min": 0.3,
    "max": 0.6,
    "default": 0.5
  }
}
```

**Color Palette:**
- <span style="background-color: #483D8B; padding: 2px 8px; border-radius: 3px;">#483D8B</span>
- <span style="background-color: #6A5ACD; padding: 2px 8px; border-radius: 3px;">#6A5ACD</span>
- <span style="background-color: #7B68EE; padding: 2px 8px; border-radius: 3px;">#7B68EE</span>
- <span style="background-color: #4682B4; padding: 2px 8px; border-radius: 3px;">#4682B4</span>
- <span style="background-color: #8A2BE2; padding: 2px 8px; border-radius: 3px;">#8A2BE2</span>

**PBR Properties:**
```json
{
  "baseColor": "#483D8B",
  "roughness": 0.3,
  "metallic": 0.2,
  "normalStrength": 1.3,
  "aoStrength": 0.6,
  "heightScale": 0.02,
  "emissive": "#6A5ACD"
}
```

**Procedural Rules:**
> Flowing fabric textures with subtle iron inlays signify philosophical commitments.

**Textures:**
- **Fabric023** (Fabric): <img src="../../packages/gen/public/textures/fabric/Fabric023_bundle_2K.jpg" alt="Fabric 023" width="200" />
- **Metal049A** (Metal): <img src="../../packages/gen/public/textures/metal/Metal049A_bundle_2K.jpg" alt="Metal 049 A" width="200" />

---

#### Ideological Alignment (`ideological-alignment`)

**Description:** The practice of consciously aligning personal beliefs with the overarching principles of Metal Exchange Reverence, involving continuous adaptation to dynamic trade flows.

**Parameters:**
```json
{
  "beliefIntensity": {
    "min": 0.7,
    "max": 1,
    "default": 0.85
  },
  "participationLevel": {
    "min": 0.3,
    "max": 0.7,
    "default": 0.5
  },
  "identityStrength": {
    "min": 0.5,
    "max": 0.8,
    "default": 0.65
  },
  "socialBonding": {
    "min": 0.4,
    "max": 0.7,
    "default": 0.55
  }
}
```

**Color Palette:**
- <span style="background-color: #4682B4; padding: 2px 8px; border-radius: 3px;">#4682B4</span>
- <span style="background-color: #5F9EA0; padding: 2px 8px; border-radius: 3px;">#5F9EA0</span>
- <span style="background-color: #B0E0E6; padding: 2px 8px; border-radius: 3px;">#B0E0E6</span>
- <span style="background-color: #00CED1; padding: 2px 8px; border-radius: 3px;">#00CED1</span>
- <span style="background-color: #AFEEEE; padding: 2px 8px; border-radius: 3px;">#AFEEEE</span>

**PBR Properties:**
```json
{
  "baseColor": "#4682B4",
  "roughness": 0.4,
  "metallic": 0.5,
  "normalStrength": 1.1,
  "aoStrength": 0.6,
  "heightScale": 0.03,
  "emissive": "#5F9EA0"
}
```

**Procedural Rules:**
> Fabric mixed with metallic threads creates adaptive ideological symbols.

**Textures:**
- **Fabric019** (Fabric): <img src="../../packages/gen/public/textures/fabric/Fabric019_bundle_2K.jpg" alt="Fabric 019" width="200" />
- **Metal049A** (Metal): <img src="../../packages/gen/public/textures/metal/Metal049A_bundle_2K.jpg" alt="Metal 049 A" width="200" />

---


---

## Texture Reference Collection

**Total Unique Textures Used:** 30

### Bricks Textures

<div style="display: flex; flex-wrap: wrap; gap: 10px;">
<div style="text-align: center;">
<img src="../../packages/gen/public/textures/bricks/Bricks051_bundle_2K.jpg" alt="Bricks 051" width="150" />
<br/><small><strong>Bricks051</strong><br/>Bricks 051</small>
</div>
<div style="text-align: center;">
<img src="../../packages/gen/public/textures/bricks/Bricks060_bundle_2K.jpg" alt="Bricks 060" width="150" />
<br/><small><strong>Bricks060</strong><br/>Bricks 060</small>
</div>
</div>

### Concrete Textures

<div style="display: flex; flex-wrap: wrap; gap: 10px;">
<div style="text-align: center;">
<img src="../../packages/gen/public/textures/concrete/Concrete023_bundle_2K.jpg" alt="Concrete 023" width="150" />
<br/><small><strong>Concrete023</strong><br/>Concrete 023</small>
</div>
<div style="text-align: center;">
<img src="../../packages/gen/public/textures/concrete/Concrete025_bundle_2K.jpg" alt="Concrete 025" width="150" />
<br/><small><strong>Concrete025</strong><br/>Concrete 025</small>
</div>
</div>

### Fabric Textures

<div style="display: flex; flex-wrap: wrap; gap: 10px;">
<div style="text-align: center;">
<img src="../../packages/gen/public/textures/fabric/Fabric019_bundle_2K.jpg" alt="Fabric 019" width="150" />
<br/><small><strong>Fabric019</strong><br/>Fabric 019</small>
</div>
<div style="text-align: center;">
<img src="../../packages/gen/public/textures/fabric/Fabric023_bundle_2K.jpg" alt="Fabric 023" width="150" />
<br/><small><strong>Fabric023</strong><br/>Fabric 023</small>
</div>
</div>

### Grass Textures

<div style="display: flex; flex-wrap: wrap; gap: 10px;">
<div style="text-align: center;">
<img src="../../packages/gen/public/textures/grass/Grass001_bundle_2K.jpg" alt="Grass 001" width="150" />
<br/><small><strong>Grass001</strong><br/>Grass 001</small>
</div>
<div style="text-align: center;">
<img src="../../packages/gen/public/textures/grass/Grass002_bundle_2K.jpg" alt="Grass 002" width="150" />
<br/><small><strong>Grass002</strong><br/>Grass 002</small>
</div>
</div>

### Leather Textures

<div style="display: flex; flex-wrap: wrap; gap: 10px;">
<div style="text-align: center;">
<img src="../../packages/gen/public/textures/leather/Leather011_bundle_2K.jpg" alt="Leather 011" width="150" />
<br/><small><strong>Leather011</strong><br/>Leather 011</small>
</div>
<div style="text-align: center;">
<img src="../../packages/gen/public/textures/leather/Leather012_bundle_2K.jpg" alt="Leather 012" width="150" />
<br/><small><strong>Leather012</strong><br/>Leather 012</small>
</div>
</div>

### Metal Textures

<div style="display: flex; flex-wrap: wrap; gap: 10px;">
<div style="text-align: center;">
<img src="../../packages/gen/public/textures/metal/Metal049A_bundle_2K.jpg" alt="Metal 049 A" width="150" />
<br/><small><strong>Metal049A</strong><br/>Metal 049 A</small>
</div>
</div>

### Rock Textures

<div style="display: flex; flex-wrap: wrap; gap: 10px;">
<div style="text-align: center;">
<img src="../../packages/gen/public/textures/rock/Rock028_bundle_2K.jpg" alt="Rock 028" width="150" />
<br/><small><strong>Rock028</strong><br/>Rock 028</small>
</div>
<div style="text-align: center;">
<img src="../../packages/gen/public/textures/rock/Rock030_bundle_2K.jpg" alt="Rock 030" width="150" />
<br/><small><strong>Rock030</strong><br/>Rock 030</small>
</div>
<div style="text-align: center;">
<img src="../../packages/gen/public/textures/rock/Rock035_bundle_2K.jpg" alt="Rock 035" width="150" />
<br/><small><strong>Rock035</strong><br/>Rock 035</small>
</div>
<div style="text-align: center;">
<img src="../../packages/gen/public/textures/rock/Rock050_bundle_2K.jpg" alt="Rock 050" width="150" />
<br/><small><strong>Rock050</strong><br/>Rock 050</small>
</div>
</div>

### Unknown Textures

<div style="display: flex; flex-wrap: wrap; gap: 10px;">
</div>

### Wood Textures

<div style="display: flex; flex-wrap: wrap; gap: 10px;">
<div style="text-align: center;">
<img src="../../packages/gen/public/textures/wood/Wood051_bundle_2K.jpg" alt="Wood 051" width="150" />
<br/><small><strong>Wood051</strong><br/>Wood 051</small>
</div>
<div style="text-align: center;">
<img src="../../packages/gen/public/textures/wood/Wood094_bundle_2K.jpg" alt="Wood 094" width="150" />
<br/><small><strong>Wood094</strong><br/>Wood 094</small>
</div>
</div>


---

# Quality Assessment

## Overall Quality Statistics

- **Total Archetypes Assessed**: 125
- **Overall Average Score**: 0.0%
- **Anemic Archetypes** (< 30%): 0

✅ **All archetypes meet quality standards!**
