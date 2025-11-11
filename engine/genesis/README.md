# Cosmic Genesis Module

Complete 15-stage provenance system from Big Bang to First Life. All game physics constants are deterministically generated from the cosmic seed.

## Features

✅ **All 15 Cosmic Stages Implemented**
- Planck Epoch → Cosmic Inflation → Quark-Gluon Plasma → Nucleosynthesis
- Recombination → Dark Matter Web → Pop III Stars → First Supernovae
- Galaxy Position → Molecular Cloud → Cloud Collapse → Protoplanetary Disk
- Planetary Accretion → Planetary Differentiation → Surface & First Life

✅ **Production-Ready Implementation**
- NO stubs, NO placeholders, NO TODOs
- All stages with real scientific values
- Comprehensive test suite (35/35 tests passing)
- Full TypeScript type safety

✅ **Seed-Driven Generation**
- Deterministic: same seed = same universe
- Uses EnhancedRNG (seedrandom) for reproducibility
- 60+ game physics constants generated from seed

✅ **Complete Provenance Chain**
- Every material traces back to cosmic origin
- Metallicity from supernova cycles
- Element availability from galaxy position
- Ocean chemistry from bombardment history

✅ **Visual & Audio Characteristics**
- Particle counts and color palettes for each stage
- Audio waveforms and frequency ranges
- Ready for Three.js rendering and Web Audio API

✅ **Conservation Tracking**
- Mass-energy conservation throughout
- Entropy increases over time (2nd law)
- Ledger system for all transformations

## Quick Start

```typescript
import { CosmicProvenanceTimeline } from './engine/genesis';

const timeline = new CosmicProvenanceTimeline('my-universe-seed');

// Get all constants
const constants = timeline.getAllConstants();
console.log(constants.metallicity);        // Galaxy metal enrichment
console.log(constants.frost_line_radius);  // Where water freezes
console.log(constants.ph_value);           // Ocean chemistry

// Visual rendering
const stage = timeline.getStage('quark-gluon-plasma');
console.log(stage.visualCharacteristics.colorPalette); // ['#ff0000', ...]
console.log(stage.audioCharacteristics.waveform);      // 'sawtooth'

// Time navigation
const currentStage = timeline.getStageAtTime(180); // 3 minutes
console.log(currentStage?.name); // "Big Bang Nucleosynthesis"
```

## Files

- `CosmicProvenanceTimeline.ts` - Main implementation (33 KB)
- `__tests__/CosmicProvenanceTimeline.test.ts` - Test suite (35 tests)
- `USAGE_EXAMPLE.md` - Comprehensive usage guide
- `index.ts` - Module exports

## Generated Constants

### Primordial (Nucleosynthesis)
- `hydrogen_fraction` (~0.75)
- `helium_fraction` (~0.25)
- `lithium_fraction`, `deuterium_fraction`

### Cosmic Structure
- `hubble_expansion_rate`, `cosmic_curvature`
- `dark_matter_density`, `cosmic_web_connectivity`
- `cmb_temperature` (~2.725 K)

### Stellar Evolution
- `pop3_imf_slope` (Initial Mass Function)
- `star_formation_efficiency`
- `supernova_energy`, `iron_peak_yield`

### Galactic Position
- `distance_from_core` (parsecs from galactic center)
- `metallicity` (Z/Z_☉)
- `orbital_velocity` (km/s)

### Planetary Formation
- `frost_line_radius` (AU)
- `terrestrial_planet_mass` (M_⊕)
- `core_fraction`, `magnetic_field`

### Surface Conditions
- `ocean_mass_fraction`
- `atmospheric_pressure`
- `organic_carbon_concentration`
- `ph_value` (5-9 range)

## Integration with Game Systems

This system provides the foundation for:
- **Element Availability**: What metals exist depends on galaxy position
- **Tech Tree**: Spears → gunpowder → atomic bomb follows element availability
- **Material Traceability**: Every item traces to cosmic origin
- **Intro FMV**: Visualize cosmic expansion, teach provenance
- **Deterministic Worlds**: Same seed = same universe, always

## Test Coverage

```bash
npm test -- engine/genesis/__tests__/CosmicProvenanceTimeline.test.ts
```

All 35 tests passing:
- ✅ All 15 stages present and chronological
- ✅ Deterministic constant generation
- ✅ Stage-specific constant calculation
- ✅ Time scale formatting
- ✅ Conservation tracking
- ✅ Visual and audio characteristics
- ✅ Utility methods (getStageAtTime, getProgressThroughStage)

## Scientific Accuracy

Based on modern cosmology and astrophysics:
- Planck time: 5.391×10⁻⁴⁴ s
- Recombination: 380,000 years
- First stars: ~400 million years
- Solar system formation: 4.567 billion years ago
- Element abundances match observational data
- Conservation laws maintained throughout

## Next Steps

This system is ready for integration with:
- Visual rendering (Three.js particle systems)
- Audio sonification (Web Audio API)
- Game generation systems (GenesisSystem, UniverseGenerator)
- Material synthesis (MolecularSynthesis, StructureSynthesis)
