/**
 * Taxonomic Classification Laws
 *
 * These are the rules for classifying organisms into taxonomic categories.
 * Just like physics laws, these are deterministic functions that map
 * properties to classifications.
 */

import {
  LOCOMOTION_ROOTS,
  DIET_ROOTS,
  SIZE_ROOTS,
  HABITAT_MODIFIERS,
  THERMO_ROOTS,
  generateBinomialName,
  generateCommonName,
} from '../tables/linguistic-roots.js';

/**
 * Linnaean Taxonomy
 * Kingdom → Phylum → Class → Order → Family → Genus → Species
 */
export const LinnaeanTaxonomy = {
  /**
   * Kingdom classification (based on life chemistry)
   */
  kingdom: (chemistry: { backbone: string; solvent: string }): string => {
    if (chemistry.backbone === 'C' && chemistry.solvent === 'H2O') {
      return 'Animalia'; // Carbon-water life (Earth-like)
    }
    if (chemistry.backbone === 'Si') {
      return 'Silicae'; // Silicon-based life
    }
    if (chemistry.solvent === 'NH3') {
      return 'Azotae'; // Ammonia-based life
    }
    return 'Xenobiota'; // Other exotic chemistry
  },

  /**
   * Phylum classification (body plan)
   */
  phylum: (bodyPlan: { symmetry: string; skeleton: string }): string => {
    if (bodyPlan.symmetry === 'bilateral' && bodyPlan.skeleton === 'internal') {
      return 'Chordata'; // Backbone
    }
    if (bodyPlan.symmetry === 'bilateral' && bodyPlan.skeleton === 'external') {
      return 'Arthropoda'; // Exoskeleton
    }
    if (bodyPlan.symmetry === 'radial') {
      return 'Cnidaria'; // Radial symmetry
    }
    if (bodyPlan.skeleton === 'none') {
      return 'Mollusca'; // Soft-bodied
    }
    return 'Incertae'; // Uncertain
  },

  /**
   * Class classification (major adaptations)
   */
  class: (traits: {
    locomotion: string;
    thermoregulation: string;
    reproduction: string;
  }): string => {
    // Endothermic (warm-blooded)
    if (traits.thermoregulation === 'endothermic') {
      if (traits.locomotion === 'aerial') return 'Aves'; // Birds
      return 'Mammalia'; // Mammals
    }

    // Ectothermic (cold-blooded)
    if (traits.locomotion === 'aquatic') return 'Pisces'; // Fish
    if (traits.reproduction === 'eggs') return 'Reptilia'; // Reptiles
    return 'Amphibia'; // Amphibians
  },

  /**
   * Order classification (ecological role)
   */
  order: (traits: { diet: string; locomotion: string }): string => {
    // Carnivores
    if (traits.diet === 'carnivore') {
      if (traits.locomotion === 'cursorial') return 'Carnivora';
      if (traits.locomotion === 'aerial') return 'Falconiformes';
      return 'Predatora';
    }

    // Herbivores
    if (traits.diet === 'herbivore') {
      if (traits.locomotion === 'arboreal') return 'Primates';
      if (traits.locomotion === 'cursorial') return 'Artiodactyla';
      return 'Herbivora';
    }

    // Omnivores
    return 'Omnivora';
  },

  /**
   * Family classification (specific traits)
   */
  family: (genus: string): string => {
    // Family = genus + "idae"
    return `${genus}idae`;
  },

  /**
   * Genus classification (primary characteristic)
   */
  genus: (
    locomotion: keyof typeof LOCOMOTION_ROOTS,
    habitat?: keyof typeof HABITAT_MODIFIERS
  ): string => {
    const root = LOCOMOTION_ROOTS[locomotion];
    const modifier = habitat ? HABITAT_MODIFIERS[habitat] : '';
    return capitalize(modifier + root);
  },

  /**
   * Species classification (secondary traits)
   */
  species: (diet: keyof typeof DIET_ROOTS, size: keyof typeof SIZE_ROOTS): string => {
    const sizeRoot = SIZE_ROOTS[size];
    const dietRoot = DIET_ROOTS[diet];
    return `${sizeRoot}${dietRoot}us`;
  },
};

/**
 * Trait-based Classification
 * Map organism properties to taxonomic traits
 */
export const TraitClassification = {
  /**
   * Locomotion type from morphology and habitat
   */
  locomotion: (traits: {
    legs: number;
    wings: boolean;
    fins: boolean;
    habitat: string;
  }): keyof typeof LOCOMOTION_ROOTS => {
    if (traits.wings) return 'aerial';
    if (traits.fins) return 'aquatic';
    if (traits.habitat === 'forest' && traits.legs > 0) return 'arboreal';
    if (traits.habitat === 'underground') return 'fossorial';
    if (traits.legs === 0) return 'serpentine';
    return 'cursorial'; // Default: ground-dwelling
  },

  /**
   * Diet type from teeth and gut morphology
   */
  diet: (traits: {
    teethType: string;
    gutLength: number;
    trophicLevel: number;
  }): keyof typeof DIET_ROOTS => {
    if (traits.trophicLevel === 1) return 'herbivore';
    if (traits.trophicLevel === 2) return 'carnivore';
    if (traits.trophicLevel === 1.5) return 'omnivore';

    // From morphology
    if (traits.teethType === 'grinding') return 'herbivore';
    if (traits.teethType === 'tearing') return 'carnivore';
    return 'omnivore';
  },

  /**
   * Size category from mass
   */
  size: (mass_kg: number): keyof typeof SIZE_ROOTS => {
    if (mass_kg < 0.1) return 'micro';
    if (mass_kg < 1) return 'parvo';
    if (mass_kg < 10) return 'meso';
    if (mass_kg < 100) return 'macro';
    if (mass_kg < 1000) return 'mega';
    return 'giganto';
  },

  /**
   * Habitat from environment
   */
  habitat: (environment: {
    biome: string;
    terrain: string;
  }): keyof typeof HABITAT_MODIFIERS | undefined => {
    if (environment.biome === 'desert') return 'desert';
    if (environment.biome === 'forest') return 'forest';
    if (environment.biome === 'grassland') return 'grassland';
    if (environment.biome === 'tundra') return 'tundra';
    if (environment.terrain === 'mountain') return 'mountain';
    if (environment.terrain === 'coastal') return 'coastal';
    return undefined;
  },

  /**
   * Thermoregulation from metabolic properties
   */
  thermoregulation: (traits: {
    metabolicRate: number;
    mass: number;
  }): 'endothermic' | 'ectothermic' => {
    // High metabolic rate relative to size → endothermic
    const expectedMetabolic = 70 * Math.pow(traits.mass, 0.75);
    return traits.metabolicRate > expectedMetabolic * 5 ? 'endothermic' : 'ectothermic';
  },
};

/**
 * Complete Organism Classification
 * Input: organism properties → Output: full taxonomic name
 */
export const OrganismClassifier = {
  /**
   * Generate complete taxonomic classification
   */
  classify: (organism: {
    // Life chemistry
    chemistry: { backbone: string; solvent: string };

    // Body plan
    bodyPlan: { symmetry: string; skeleton: string };

    // Morphology
    legs: number;
    wings: boolean;
    fins: boolean;

    // Physiology
    mass_kg: number;
    metabolicRate: number;
    teethType: string;
    gutLength: number;

    // Ecology
    trophicLevel: number;
    habitat: { biome: string; terrain: string };
  }) => {
    // Derive traits
    const locomotion = TraitClassification.locomotion({
      legs: organism.legs,
      wings: organism.wings,
      fins: organism.fins,
      habitat: organism.habitat.biome,
    });

    const diet = TraitClassification.diet({
      teethType: organism.teethType,
      gutLength: organism.gutLength,
      trophicLevel: organism.trophicLevel,
    });

    const size = TraitClassification.size(organism.mass_kg);

    const habitatType = TraitClassification.habitat(organism.habitat);

    const thermoregulation = TraitClassification.thermoregulation({
      metabolicRate: organism.metabolicRate,
      mass: organism.mass_kg,
    });

    // Generate taxonomic hierarchy
    const kingdom = LinnaeanTaxonomy.kingdom(organism.chemistry);
    const phylum = LinnaeanTaxonomy.phylum(organism.bodyPlan);
    const classType = LinnaeanTaxonomy.class({
      locomotion,
      thermoregulation,
      reproduction: 'live_birth', // Simplified
    });
    const order = LinnaeanTaxonomy.order({ diet, locomotion });
    const genus = LinnaeanTaxonomy.genus(locomotion, habitatType);
    const species = LinnaeanTaxonomy.species(diet, size);
    const family = LinnaeanTaxonomy.family(genus);

    // Generate names
    const scientificName = `${genus} ${species}`;
    const commonName = generateCommonName({
      size,
      habitat: habitatType,
      locomotion,
      sociality: undefined,
    });

    return {
      taxonomy: {
        kingdom,
        phylum,
        class: classType,
        order,
        family,
        genus,
        species,
      },
      names: {
        scientific: scientificName,
        common: commonName || `${locomotion} ${diet}`,
      },
      traits: {
        locomotion,
        diet,
        size,
        habitat: habitatType,
        thermoregulation,
      },
    };
  },
};

/**
 * Helper: capitalize string
 */
function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Complete taxonomic laws
 */
export const TaxonomicLaws = {
  linnaean: LinnaeanTaxonomy,
  traits: TraitClassification,
  classifier: OrganismClassifier,
} as const;
