/**
 * Anatomical Laws
 * Skeletal structure, organ systems, body proportions from physics + biology.
 */

export const SkeletalSystem = {
  boneDensity_kgm3: 1850,
  boneStrength_MPa: 130,

  skeletonMass: (bodyMass_kg: number, taxon: 'mammal' | 'bird' | 'fish'): number => {
    const fractions = { mammal: 0.15, bird: 0.08, fish: 0.04 };
    return bodyMass_kg * fractions[taxon];
  },

  limbLength: (mass_kg: number, locomotion: string): number => {
    const base = 0.3 * Math.pow(mass_kg, 0.35);
    if (locomotion === 'cursorial') return base * 1.4;
    if (locomotion === 'fossorial') return base * 0.7;
    return base;
  },

  supportCapacity: (boneDiameter_m: number, gravity_ms2: number): number => {
    const area = Math.PI * Math.pow(boneDiameter_m / 2, 2);
    const strength = 130e6; // Pa
    return (area * strength) / gravity_ms2; // kg
  },
};

export const MusculatureSystem = {
  muscleMass: (bodyMass_kg: number, activityLevel: number): number => {
    return bodyMass_kg * (0.35 + activityLevel * 0.15);
  },

  maxForce_N: (muscleCrossSection_m2: number): number => {
    const specificForce = 300000; // N/m² (muscle tension)
    return muscleCrossSection_m2 * specificForce;
  },
};

export const OrganSystems = {
  heartMass: (bodyMass_kg: number): number => 0.006 * Math.pow(bodyMass_kg, 0.98),
  lungVolume: (bodyMass_kg: number): number => 0.06 * Math.pow(bodyMass_kg, 1.04),
  brainMass: (bodyMass_kg: number, EQ: number): number => 0.01 * Math.pow(bodyMass_kg, 0.75) * EQ,
};

export const AnatomyLaws = {
  skeletal: SkeletalSystem,
  muscular: MusculatureSystem,
  organs: OrganSystems,
} as const;
