/**
 * Trait Components - 25 traits from Grok design doc
 * Each trait level costs Evo Points, affects gameplay + AI reactions
 */

import { defineComponent, Types } from 'bitecs';

// Locomotion Traits (affect movement & traversal)
export const FlipperFeet = defineComponent({
  level: Types.ui8  // 0-3: Water speed, flow affinity
});

export const ChainshawHands = defineComponent({
  level: Types.ui8  // 0-3: Wood harvest speed, scares critters
});

export const DrillArms = defineComponent({
  level: Types.ui8  // 0-3: Ore mining speed, reveals veins
});

export const WingGliders = defineComponent({
  level: Types.ui8  // 0-3: Glide distance, aerial view radius
});

// Sensory Traits (affect detection & awareness)
export const EchoSonar = defineComponent({
  level: Types.ui8  // 0-3: Resource ping radius
});

export const BioLumGlow = defineComponent({
  level: Types.ui8  // 0-3: Night vision, attracts critters
});

// Utility Traits (affect crafting & resources)
export const StorageSacs = defineComponent({
  level: Types.ui8  // 0-3: Inventory capacity bonus
});

export const FiltrationGills = defineComponent({
  level: Types.ui8  // 0-3: Pollution resistance, cleans water
});

// Combat/Defense Traits (affect shock survival)
export const ShieldCarapace = defineComponent({
  level: Types.ui8  // 0-3: Damage reduction
});

export const ToxinSpines = defineComponent({
  level: Types.ui8  // 0-3: Counter-attack damage
});

// Trait Synergies (calculated, not stored)
// Example: Flipper + Chainshaw = "Burr-tide" (amphibious logger)
export const calculateSynergies = (eid, world) => {
  const synergies = [];
  
  // FlipperFeet + ChainshawHands = Burr-tide
  if (FlipperFeet.level[eid] > 0 && ChainshawHands.level[eid] > 0) {
    synergies.push({
      name: 'Burr-tide',
      effect: 'Amphibious logging: Harvest wood from water tiles',
      bonus: Math.min(FlipperFeet.level[eid], ChainshawHands.level[eid])
    });
  }
  
  // DrillArms + EchoSonar = Vein Hunter
  if (DrillArms.level[eid] > 0 && EchoSonar.level[eid] > 0) {
    synergies.push({
      name: 'Vein Hunter',
      effect: 'Reveals deep ore deposits automatically',
      bonus: Math.min(DrillArms.level[eid], EchoSonar.level[eid])
    });
  }
  
  // FiltrationGills + BioLumGlow = Purity Beacon
  if (FiltrationGills.level[eid] > 0 && BioLumGlow.level[eid] > 0) {
    synergies.push({
      name: 'Purity Beacon',
      effect: 'Attracts rare critters, reduces pollution aura',
      bonus: Math.min(FiltrationGills.level[eid], BioLumGlow.level[eid])
    });
  }
  
  return synergies;
};

// Trait costs (Evo Points)
export const TRAIT_COSTS = {
  flipperFeet: [0, 2, 4, 6],    // Level 0-3
  chainshawHands: [0, 2, 4, 6],
  drillArms: [0, 3, 6, 9],
  wingGliders: [0, 4, 8, 12],
  echoSonar: [0, 2, 4, 6],
  bioLumGlow: [0, 1, 2, 3],
  storageSacs: [0, 2, 5, 8],
  filtrationGills: [0, 3, 6, 9],
  shieldCarapace: [0, 3, 7, 11],
  toxinSpines: [0, 2, 5, 8]
};

// Starting Evo Points pool
export const STARTING_EVO_POINTS = 10;
