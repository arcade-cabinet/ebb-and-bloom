/**
 * Linguistic Roots for Systematic Naming
 *
 * Based on Latin and Greek etymology used in real scientific nomenclature.
 * These roots combine systematically to generate taxonomic names,
 * tool names, and architectural classifications.
 */

// LOCOMOTION ROOTS (from Latin/Greek)
export const LOCOMOTION_ROOTS = {
  cursorial: 'cursor', // Latin: runner
  arboreal: 'dendro', // Greek: tree-dweller
  fossorial: 'fossor', // Latin: digger
  aquatic: 'hydro', // Greek: water
  aerial: 'aero', // Greek: air
  scansorial: 'petro', // Greek: rock-climber
  serpentine: 'serpento', // Latin: snake-like
  sessile: 'fixo', // Latin: fixed in place
} as const;

// DIET ROOTS
export const DIET_ROOTS = {
  herbivore: 'herbivor', // Latin: plant-eater
  carnivore: 'carnivor', // Latin: meat-eater
  omnivore: 'omnivor', // Latin: all-eater
  insectivore: 'insectivor', // Latin: insect-eater
  frugivore: 'frugivor', // Latin: fruit-eater
  piscivore: 'piscivor', // Latin: fish-eater
  nectarivore: 'nectarivor', // Latin: nectar-eater
  detritivore: 'detrivor', // Latin: detritus-eater
} as const;

// SIZE ROOTS (Allometric scale)
export const SIZE_ROOTS = {
  micro: 'micro', // < 0.1 kg
  parvo: 'parvo', // 0.1-1 kg (small)
  meso: 'meso', // 1-10 kg (medium)
  macro: 'macro', // 10-100 kg (large)
  mega: 'mega', // 100-1000 kg (very large)
  giganto: 'giganto', // > 1000 kg (gigantic)
} as const;

// BODY PLAN ROOTS
export const BODY_ROOTS = {
  biped: 'bi', // Two legs
  quadruped: 'quadra', // Four legs
  hexapod: 'hexa', // Six legs (arthropod-like)
  octopod: 'octo', // Eight legs
  serpentine: 'serpento', // Legless
  multiped: 'multi', // Many legs
} as const;

// HABITAT MODIFIERS
export const HABITAT_MODIFIERS = {
  desert: 'xero', // Greek: dry
  forest: 'silvo', // Latin: forest
  mountain: 'oro', // Greek: mountain
  coastal: 'littoro', // Latin: shore
  grassland: 'prato', // Latin: meadow
  tundra: 'gelo', // Greek: frost
  wetland: 'paludo', // Latin: marsh
  cave: 'speleo', // Greek: cave
} as const;

// THERMOREGULATION ROOTS
export const THERMO_ROOTS = {
  endothermic: 'thermo', // Warm-blooded
  ectothermic: 'cryo', // Cold-blooded
} as const;

// SOCIALITY ROOTS
export const SOCIAL_ROOTS = {
  solitary: 'mono',
  pair: 'duo',
  pack: 'grupo',
  herd: 'grege',
  colony: 'colono',
} as const;

// MATERIAL ROOTS (for tools and structures)
export const MATERIAL_ROOTS = {
  stone: 'litho', // Greek: stone
  wood: 'ligno', // Latin: wood
  bone: 'osseo', // Latin: bone
  metal: 'metallo', // Greek: metal
  clay: 'argillo', // Latin: clay
  fiber: 'fibro', // Latin: fiber
  hide: 'dermo', // Greek: skin
} as const;

// CONSTRUCTION METHOD ROOTS
export const CONSTRUCTION_ROOTS = {
  carved: 'sculpto',
  woven: 'texto',
  stacked: 'structo',
  dug: 'fosso',
  assembled: 'compono',
  cast: 'fundo',
} as const;

// LATIN/GREEK SUFFIXES
export const SUFFIXES = {
  // Taxonomic suffixes
  species: 'us', // Standard species ending
  genus: '', // Genus is just the root
  family: 'idae', // Family suffix
  order: 'iformes', // Order suffix

  // Tool suffixes
  simple: 'is',
  complex: 'orum',

  // Place suffixes
  place: 'um',
  site: 'ia',
} as const;

/**
 * Combine roots to form scientific name
 */
export function combineRoots(
  primary: string,
  secondary: string,
  suffix: string = SUFFIXES.species
): string {
  return `${capitalize(primary)}${secondary}${suffix}`;
}

/**
 * Generate genus name from locomotion and habitat
 */
export function generateGenus(
  locomotion: keyof typeof LOCOMOTION_ROOTS,
  habitat?: keyof typeof HABITAT_MODIFIERS
): string {
  const locoRoot = LOCOMOTION_ROOTS[locomotion];
  const habitatMod = habitat ? HABITAT_MODIFIERS[habitat] : '';
  return capitalize(habitatMod + locoRoot);
}

/**
 * Generate species name from diet and size
 */
export function generateSpecies(
  diet: keyof typeof DIET_ROOTS,
  size: keyof typeof SIZE_ROOTS
): string {
  const sizeRoot = SIZE_ROOTS[size];
  const dietRoot = DIET_ROOTS[diet];
  return `${sizeRoot}${dietRoot}${SUFFIXES.species}`;
}

/**
 * Generate binomial name
 */
export function generateBinomialName(
  locomotion: keyof typeof LOCOMOTION_ROOTS,
  diet: keyof typeof DIET_ROOTS,
  size: keyof typeof SIZE_ROOTS,
  habitat?: keyof typeof HABITAT_MODIFIERS
): string {
  const genus = generateGenus(locomotion, habitat);
  const species = generateSpecies(diet, size);
  return `${genus} ${species}`;
}

/**
 * Generate common name from traits
 */
export function generateCommonName(traits: {
  size?: keyof typeof SIZE_ROOTS;
  habitat?: keyof typeof HABITAT_MODIFIERS;
  locomotion?: keyof typeof LOCOMOTION_ROOTS;
  sociality?: keyof typeof SOCIAL_ROOTS;
}): string {
  const parts: string[] = [];

  // Size descriptor
  if (traits.size === 'parvo') parts.push('Lesser');
  if (traits.size === 'mega' || traits.size === 'giganto') parts.push('Greater');

  // Habitat descriptor
  if (traits.habitat) {
    parts.push(capitalize(traits.habitat));
  }

  // Locomotion descriptor (converted to common English)
  if (traits.locomotion) {
    const commonLocomotion: Record<string, string> = {
      cursorial: 'Runner',
      arboreal: 'Climber',
      fossorial: 'Burrower',
      aquatic: 'Swimmer',
      aerial: 'Flyer',
      scansorial: 'Scaler',
    };
    parts.push(commonLocomotion[traits.locomotion] || traits.locomotion);
  }

  // Pack indicator
  if (traits.sociality === 'pack') {
    parts.push('(pack)');
  }

  return parts.join(' ');
}

/**
 * Capitalize first letter
 */
function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Archaeological tool industry names (real typologies)
 */
export const TOOL_INDUSTRIES = {
  oldowan: {
    name: 'Oldowan',
    period: '2.6-1.7 Ma',
    characteristics: 'Simple cores and flakes',
    complexity: 1,
  },
  acheulean: {
    name: 'Acheulean',
    period: '1.7-0.1 Ma',
    characteristics: 'Bifacial hand-axes',
    complexity: 2,
  },
  mousterian: {
    name: 'Mousterian',
    period: '300-30 Ka',
    characteristics: 'Prepared cores, retouched flakes',
    complexity: 3,
  },
  upperPaleolithic: {
    name: 'Upper Paleolithic',
    period: '50-10 Ka',
    characteristics: 'Blades, composite tools',
    complexity: 4,
  },
  mesolithic: {
    name: 'Mesolithic',
    period: '10-5 Ka',
    characteristics: 'Microliths, specialized tools',
    complexity: 5,
  },
  neolithic: {
    name: 'Neolithic',
    period: '10-2 Ka',
    characteristics: 'Polished stone, agriculture',
    complexity: 6,
  },
  chalcolithic: {
    name: 'Chalcolithic',
    period: '5-3 Ka',
    characteristics: 'Copper tools, early metallurgy',
    complexity: 7,
  },
  bronzeAge: {
    name: 'Bronze Age',
    period: '3-1.2 Ka',
    characteristics: 'Bronze tools and weapons',
    complexity: 8,
  },
  ironAge: {
    name: 'Iron Age',
    period: '1.2-0.5 Ka',
    characteristics: 'Iron tools, steel',
    complexity: 9,
  },
} as const;
