/**
 * Biological Scaling Laws
 *
 * Allometric relationships that govern how biological organisms scale with size.
 * These are empirical power laws observed across all life on Earth.
 *
 * Key insight: Biology is constrained by physics and geometry.
 * - Surface area scales as length²
 * - Volume/mass scales as length³
 * - This creates fundamental constraints on metabolism, structure, lifespan
 */

/**
 * Kleiber's Law and Related Allometric Scaling
 *
 * Metabolic rate scales as M^(3/4) not M^1 (as naive surface area would suggest)
 * This 3/4 power is universal across organisms from bacteria to whales.
 */
export const AllometricScaling = {
  /**
   * Basal Metabolic Rate (Kleiber's Law)
   * BMR = 70 * M^0.75 (watts)
   * where M is mass in kg
   */
  basalMetabolicRate: (mass_kg: number): number => {
    return 70 * Math.pow(mass_kg, 0.75);
  },

  /**
   * Field Metabolic Rate (active animals)
   * FMR ≈ 3-5 × BMR for most vertebrates
   */
  fieldMetabolicRate: (mass_kg: number, activityMultiplier: number = 3): number => {
    return AllometricScaling.basalMetabolicRate(mass_kg) * activityMultiplier;
  },

  /**
   * Heart Rate scaling
   * HR ∝ M^(-1/4)
   * Larger animals have slower heart rates
   */
  heartRate: (mass_kg: number): number => {
    return 241 * Math.pow(mass_kg, -0.25); // beats per minute
  },

  /**
   * Lifespan scaling
   * Lifespan ∝ M^(1/4)
   * Larger animals live longer
   */
  maxLifespan: (mass_kg: number): number => {
    return 10.5 * Math.pow(mass_kg, 0.25); // years
  },

  /**
   * Gestation time scaling
   * Gestation ∝ M^(1/4)
   */
  gestationTime: (mass_kg: number): number => {
    return 0.162 * Math.pow(mass_kg, 0.25); // years
  },

  /**
   * Generation time (age at first reproduction)
   * Generation ∝ M^(1/4)
   */
  generationTime: (mass_kg: number): number => {
    return 2.5 * Math.pow(mass_kg, 0.25); // years
  },

  /**
   * Population density scaling
   * Density ∝ M^(-3/4)
   * Larger animals occur at lower densities
   */
  populationDensity: (mass_kg: number, primaryProductivity: number): number => {
    // individuals per km²
    const baseDensity = 1000 * Math.pow(mass_kg, -0.75);
    return baseDensity * (primaryProductivity / 1000); // Scale by productivity
  },

  /**
   * Home range size
   * Range ∝ M^1.02 for herbivores
   * Range ∝ M^1.36 for carnivores
   */
  homeRange: (mass_kg: number, trophicLevel: number): number => {
    if (trophicLevel === 1) {
      // Herbivore
      return 0.011 * Math.pow(mass_kg, 1.02); // km²
    } else {
      // Carnivore
      return 0.019 * Math.pow(mass_kg, 1.36); // km²
    }
  },

  /**
   * Brain mass scaling
   * Brain ∝ M^0.75 (for mammals)
   */
  brainMass: (mass_kg: number): number => {
    return 0.01 * Math.pow(mass_kg, 0.75); // kg
  },

  /**
   * Daily food intake
   * Intake ∝ Metabolic rate / Food energy density
   */
  foodIntake: (mass_kg: number, foodEnergyDensity: number = 4000): number => {
    // foodEnergyDensity in kJ/kg
    const dailyEnergyNeed = (AllometricScaling.fieldMetabolicRate(mass_kg) * 86400) / 1000; // kJ/day
    return dailyEnergyNeed / foodEnergyDensity; // kg/day
  },
};

/**
 * Structural Constraints (Square-Cube Law)
 *
 * As an organism scales up:
 * - Mass increases as length³
 * - Strength (cross-section) increases as length²
 * This limits maximum size for different body plans
 */
export const StructuralConstraints = {
  /**
   * Maximum viable size for given gravity and skeletal system
   *
   * Bone stress = (mass × gravity) / cross_sectional_area
   * Stress ∝ (L³ × g) / L² = L × g
   * Bones fail when stress exceeds material strength
   */
  maxViableSize: (
    gravity: number, // m/s²
    boneStrength: number = 150e6, // Pa (typical bone compressive strength)
    boneDensity: number = 2000 // kg/m³
  ): number => {
    // Simplified: max length ∝ strength / (density × gravity)
    return boneStrength / (boneDensity * gravity); // meters
  },

  /**
   * Can organism support its own weight?
   */
  isStructurallyViable: (
    mass_kg: number,
    height_m: number,
    gravity: number,
    legCount: number = 4
  ): boolean => {
    // Weight per leg
    const weightPerLeg = (mass_kg * gravity) / legCount;

    // Leg cross-section scales as height²
    const legCrossSectionArea = Math.pow(height_m * 0.1, 2); // Rough estimate

    // Stress = Force / Area
    const stress = weightPerLeg / legCrossSectionArea;

    const boneStrength = 150e6; // Pa
    return stress < boneStrength * 0.5; // Safety factor
  },

  /**
   * Gravity affects maximum size
   * Lower gravity → larger organisms possible
   * Higher gravity → only small organisms
   */
  maxMassForGravity: (gravity: number): number => {
    const earth_gravity = 9.81;
    const max_earth_land = 100000; // kg (largest land animals ~100 tons)

    // Inverse relationship: if gravity doubles, max mass roughly halves
    return max_earth_land * Math.pow(earth_gravity / gravity, 3);
  },
};

/**
 * Respiratory Constraints
 *
 * Oxygen must diffuse from environment to cells.
 * Diffusion is slow and limits organism size without circulatory systems.
 */
export const RespiratoryConstraints = {
  /**
   * Fick's Law of Diffusion
   * Maximum diffusion distance for oxygen
   */
  maxDiffusionDistance: (
    metabolicRate: number, // W/kg
    oxygenConcentration: number // mol/m³
  ): number => {
    const D = 2e-9; // Diffusion coefficient for O₂ in water (m²/s)
    return Math.sqrt((2 * D * oxygenConcentration) / metabolicRate);
  },

  /**
   * Does organism need circulatory system?
   *
   * Below ~1mm, diffusion is sufficient
   * Above ~1mm, need active circulation
   */
  requiresCirculation: (size_m: number, metabolicRate: number): boolean => {
    const diffusionLimit = 0.001; // 1mm
    return size_m > diffusionLimit || metabolicRate > 100;
  },

  /**
   * Oxygen availability affects maximum size
   */
  maxSizeForOxygen: (atmosphericO2: number): number => {
    // Higher O2 → larger insects possible (Carboniferous period)
    const modernO2 = 0.21; // 21% O2
    const modernMaxInsect = 0.1; // kg (modern largest insects ~100g)

    // Size scales roughly linearly with O2
    return modernMaxInsect * (atmosphericO2 / modernO2);
  },
};

/**
 * Thermoregulation Constraints
 *
 * Heat production scales as mass (∝ M^1)
 * Heat loss scales as surface area (∝ M^(2/3))
 * This creates size-dependent thermal challenges
 */
export const ThermoregulationConstraints = {
  /**
   * Surface area to volume ratio
   * SA/V ∝ M^(-1/3)
   * Smaller animals lose heat faster
   */
  surfaceAreaToVolume: (mass_kg: number): number => {
    // Assuming spherical-ish organism
    const volume = mass_kg / 1000; // m³ (assuming ~water density)
    const radius = Math.pow((3 * volume) / (4 * Math.PI), 1 / 3);
    const surfaceArea = 4 * Math.PI * radius * radius;
    return surfaceArea / volume; // m⁻¹
  },

  /**
   * Can organism maintain endothermy (warm-blooded)?
   *
   * Too small → lose heat too fast
   * Need high metabolic rate to compensate
   */
  canMaintainEndothermy: (mass_kg: number, ambientTemp: number): boolean => {
    const minMass = 0.002; // ~2g (smallest mammal: Etruscan shrew)

    // In cold environments, need to be larger
    if (ambientTemp < 273) {
      return mass_kg > 0.01; // 10g minimum in cold
    }

    return mass_kg > minMass;
  },

  /**
   * Body temperature regulation
   * Heat loss = k × SA × (T_body - T_ambient)
   */
  heatLossRate: (
    mass_kg: number,
    bodyTemp: number,
    ambientTemp: number,
    insulationFactor: number = 1
  ): number => {
    const k = 10; // W/(m²·K) - heat transfer coefficient
    const sa = 0.1 * Math.pow(mass_kg, 2 / 3); // m² (approximation)
    return (k * sa * (bodyTemp - ambientTemp)) / insulationFactor;
  },
};

/**
 * Sensory Constraints
 */
export const SensoryConstraints = {
  /**
   * Visual acuity scales with eye size
   */
  visualAcuity: (eyeDiameter_m: number): number => {
    // Angular resolution ≈ λ / D
    const wavelength = 550e-9; // m (green light)
    return wavelength / eyeDiameter_m; // radians
  },

  /**
   * Hearing range
   * Smaller animals hear higher frequencies
   */
  hearingRange: (mass_kg: number): { min: number; max: number } => {
    const maxFreq = 100000 * Math.pow(mass_kg, -0.4); // Hz
    const minFreq = Math.max(20, 20000 * Math.pow(mass_kg, -1)); // Hz
    return { min: minFreq, max: Math.min(maxFreq, 100000) };
  },
};

/**
 * Complete biological scaling laws
 */
export const BiologicalLaws = {
  allometry: AllometricScaling,
  structural: StructuralConstraints,
  respiratory: RespiratoryConstraints,
  thermal: ThermoregulationConstraints,
  sensory: SensoryConstraints,
} as const;
