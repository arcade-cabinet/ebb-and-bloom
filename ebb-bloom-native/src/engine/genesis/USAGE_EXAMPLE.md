# CosmicProvenanceTimeline Usage Examples

## Basic Usage

```typescript
import { CosmicProvenanceTimeline } from './engine/genesis';

// Create timeline from seed
const timeline = new CosmicProvenanceTimeline('my-universe-seed');

// Get all 15 cosmic stages
const stages = timeline.getStages();
console.log(`Timeline has ${stages.length} stages`);

// Get specific stage
const planck = timeline.getStage('planck-epoch');
console.log(planck.name); // "Planck Epoch"
console.log(planck.description);

// Get time scale label
console.log(timeline.getTimeScaleLabel(planck)); 
// "1.0e-32 Planck times"
```

## Generating Game Physics Constants

```typescript
// Get all constants generated from the seed
const constants = timeline.getAllConstants();

console.log(constants.hydrogen_fraction);  // ~0.75
console.log(constants.helium_fraction);    // ~0.25
console.log(constants.metallicity);        // Varies by seed
console.log(constants.ocean_mass_fraction); // Determines water availability
console.log(constants.ph_value);           // Ocean chemistry
```

## Stage-Specific Constants

```typescript
// Calculate constants for a specific stage
const nucleosynthesisConstants = timeline.calculateConstantsForStage('nucleosynthesis');

console.log(nucleosynthesisConstants.hydrogen_fraction);
console.log(nucleosynthesisConstants.helium_fraction);
console.log(nucleosynthesisConstants.lithium_fraction);
console.log(nucleosynthesisConstants.deuterium_fraction);
```

## Visual Characteristics for Rendering

```typescript
const stage = timeline.getStage('quark-gluon-plasma');

// Get visual properties
const visual = stage.visualCharacteristics;
console.log(visual.particleCount);     // 200000
console.log(visual.colorPalette);      // ['#ff0000', '#ff4400', ...]
console.log(visual.scaleRange);        // [1e-15, 1e-12]
console.log(visual.cameraDistance);    // 1e-13

// Use for Three.js particle system
const particles = new THREE.Points(
  new THREE.BufferGeometry(),
  new THREE.PointsMaterial({
    color: visual.colorPalette[0],
    size: visual.scaleRange[0]
  })
);
```

## Audio Characteristics for Sonification

```typescript
const stage = timeline.getStage('cosmic-inflation');

const audio = stage.audioCharacteristics;
console.log(audio.frequencyRange);  // [10000, 20000] Hz
console.log(audio.waveform);        // 'sine'
console.log(audio.motif);           // "Rapid pitch descent (redshift)"

// Use with Web Audio API
const oscillator = audioContext.createOscillator();
oscillator.type = audio.waveform;
oscillator.frequency.setValueAtTime(audio.frequencyRange[0], audioContext.currentTime);
```

## Conservation Tracking

```typescript
const stage = timeline.getStage('planck-epoch');
const conservation = timeline.getConservationStatus(stage);

console.log(`Mass: ${conservation.mass}`);
console.log(`Energy: ${conservation.energy}`);
console.log(`Entropy: ${conservation.entropy}`);

// Verify conservation law
const total = conservation.mass + conservation.energy;
console.log(`Total mass-energy: ${total}`);
```

## Time Navigation

```typescript
// Find stage at specific time
const currentTime = 180; // 180 seconds = 3 minutes
const stage = timeline.getStageAtTime(currentTime);
console.log(stage?.id); // 'nucleosynthesis'

// Calculate progress through stage
const progress = timeline.getProgressThroughStage(stage, currentTime);
console.log(`Progress: ${(progress * 100).toFixed(1)}%`);
```

## Iterating Through All Stages

```typescript
const timeline = new CosmicProvenanceTimeline('seed');

for (const stage of timeline.getStages()) {
  console.log(`\n=== ${stage.name} ===`);
  console.log(`Time: ${timeline.getTimeScaleLabel(stage)}`);
  console.log(`Trigger: ${stage.causalTrigger}`);
  
  const constants = timeline.calculateConstantsForStage(stage.id);
  console.log('Generated constants:', Object.keys(constants));
  
  console.log('Visual:', stage.visualCharacteristics);
  console.log('Audio:', stage.audioCharacteristics);
}
```

## Deterministic Generation

```typescript
// Same seed always produces same results
const timeline1 = new CosmicProvenanceTimeline('seed-123');
const timeline2 = new CosmicProvenanceTimeline('seed-123');

const constants1 = timeline1.getAllConstants();
const constants2 = timeline2.getAllConstants();

console.log(constants1 === constants2); // true (same values)

// Different seeds produce different universes
const timeline3 = new CosmicProvenanceTimeline('seed-456');
const constants3 = timeline3.getAllConstants();

console.log(constants1.metallicity !== constants3.metallicity); // true
```

## Material Provenance Chain

```typescript
// Trace material origin through cosmic history
const timeline = new CosmicProvenanceTimeline('earth-seed');

// Where do iron tools come from?
const supernovae = timeline.getStage('first-supernovae');
const ironYield = timeline.calculateConstantsForStage('first-supernovae');
console.log('Iron created in supernovae:', ironYield.iron_peak_yield);

const galaxy = timeline.getStage('galaxy-position');
const metalEnrichment = timeline.calculateConstantsForStage('galaxy-position');
console.log('Local metallicity:', metalEnrichment.metallicity);

const surface = timeline.getStage('surface-and-life');
const surfaceConstants = timeline.calculateConstantsForStage('surface-and-life');
console.log('Available for tools:', surfaceConstants);
```

## Integration with Game Systems

```typescript
import { CosmicProvenanceTimeline } from './engine/genesis';
import { GameEngine } from './game/engine';

class UniverseGenerator {
  private timeline: CosmicProvenanceTimeline;
  
  constructor(seed: string) {
    this.timeline = new CosmicProvenanceTimeline(seed);
  }
  
  generatePlanetaryComposition() {
    // Get metallicity from cosmic position
    const constants = this.timeline.getAllConstants();
    
    return {
      ironCore: constants.core_fraction,
      waterOceans: constants.ocean_mass_fraction,
      atmosphere: constants.atmospheric_pressure,
      magneticField: constants.magnetic_field,
      pH: constants.ph_value,
      organics: constants.organic_carbon_concentration
    };
  }
  
  generateElementalAvailability() {
    const constants = this.timeline.getAllConstants();
    
    // Primordial elements (always available)
    const primordial = {
      hydrogen: constants.hydrogen_fraction,
      helium: constants.helium_fraction,
      lithium: constants.lithium_fraction
    };
    
    // Metals from supernovae (depends on galactic position)
    const metallicity = constants.metallicity;
    const metals = {
      iron: metallicity * 0.3,
      carbon: metallicity * 0.2,
      oxygen: metallicity * 0.4,
      silicon: metallicity * 0.1
    };
    
    return { primordial, metals };
  }
  
  visualizeCosmicOrigins() {
    // Create intro FMV showing cosmic expansion
    const stages = this.timeline.getStages();
    
    return stages.map(stage => ({
      duration: stage.timeEnd - stage.timeStart,
      visual: stage.visualCharacteristics,
      audio: stage.audioCharacteristics,
      narration: stage.description
    }));
  }
}
```

## All 15 Stage IDs

- `planck-epoch`
- `cosmic-inflation`
- `quark-gluon-plasma`
- `nucleosynthesis`
- `recombination`
- `dark-matter-web`
- `population-iii-stars`
- `first-supernovae`
- `galaxy-position`
- `molecular-cloud`
- `cloud-collapse`
- `protoplanetary-disk`
- `planetary-accretion`
- `planetary-differentiation`
- `surface-and-life`
