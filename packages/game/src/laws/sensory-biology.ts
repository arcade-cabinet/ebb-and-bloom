/**
 * Sensory Biology Laws
 * 
 * How organisms sense their environment.
 * Based on Land & Nilsson (2012) "Animal Eyes" and other peer-reviewed sources.
 */

/**
 * Visual System
 * Land, M.F. & Nilsson, D.E. (2012) "Animal Eyes" Oxford University Press
 */
export const VisualSystem = {
  /**
   * Angular resolution (diffraction limit)
   * θ_min = λ / D
   * 
   * Fundamental physics limit on visual acuity
   */
  angularResolution_rad: (pupilDiameter_m: number, wavelength_m: number = 555e-9): number => {
    return wavelength_m / pupilDiameter_m;
  },
  
  /**
   * Visual acuity in cycles per degree
   * Standard clinical measure
   */
  visualAcuity_cpd: (pupilDiameter_m: number): number => {
    const resolution_rad = VisualSystem.angularResolution_rad(pupilDiameter_m);
    const resolution_deg = resolution_rad * (180 / Math.PI);
    return 1 / resolution_deg; // cycles/degree
  },
  
  /**
   * Eye diameter from body mass (allometric)
   * Eye = 0.00024 × M^0.64
   * 
   * Based on Ross & Kirk (2007)
   */
  eyeDiameterFromMass: (bodyMass_kg: number): number => {
    const eyeMass = 0.00024 * Math.pow(bodyMass_kg, 0.64); // kg
    const density = 1100; // kg/m³ (eye tissue)
    const volume = eyeMass / density;
    const radius = Math.pow((3 * volume) / (4 * Math.PI), 1/3);
    return radius * 2; // meters
  },
  
  /**
   * Light sensitivity (photons needed for detection)
   * Larger eyes gather more light: Sensitivity ∝ D²
   */
  lightSensitivity: (eyeDiameter_m: number): number => {
    const humanEye_m = 0.024;
    return Math.pow(eyeDiameter_m / humanEye_m, 2);
  },
  
  /**
   * Maximum visual range in atmosphere
   * Limited by scattering and absorption
   * 
   * Based on atmospheric optics
   */
  maxVisualRange: (
    atmosphericDensity_kgm3: number,
    particulateMatter_mgm3: number = 50
  ): number => {
    // Beer-Lambert law approximation
    const extinctionCoeff = 0.1 * atmosphericDensity_kgm3 + 0.01 * particulateMatter_mgm3;
    const contrastThreshold = 0.02; // 2% contrast needed
    return -Math.log(contrastThreshold) / extinctionCoeff; // meters
  },
};

/**
 * Auditory System
 * Fay (1988) "Hearing in Vertebrates: A Psychophysics Databook"
 */
export const AuditorySystem = {
  /**
   * Hearing range scales inversely with body size
   * Smaller animals hear higher frequencies
   * 
   * f_max ≈ 100000 × M^(-0.4) Hz
   */
  maxFrequency: (mass_kg: number): number => {
    return Math.min(100000, 100000 * Math.pow(mass_kg, -0.4));
  },
  
  /**
   * Minimum frequency (low rumbles)
   * f_min ≈ 20 Hz for most, but elephants can hear infrasound
   */
  minFrequency: (mass_kg: number): number => {
    if (mass_kg > 1000) return 5; // Large animals: infrasound
    if (mass_kg > 100) return 10;
    return 20; // Hz
  },
  
  /**
   * Sound propagation distance
   * Depends on frequency and medium
   * 
   * Low frequency travels farther (whale songs)
   */
  soundRange: (
    frequency_Hz: number,
    mediumDensity_kgm3: number,
    sourceIntensity_dB: number = 100
  ): number => {
    // Attenuation increases with frequency²
    const attenuationCoeff = 0.0001 * Math.pow(frequency_Hz / 1000, 2);
    const hearingThreshold_dB = 0;
    const distance = (sourceIntensity_dB - hearingThreshold_dB) / (20 * attenuationCoeff);
    
    return Math.min(distance, 10000); // meters (capped)
  },
};

/**
 * Olfactory System
 * Smell is complex and less well-quantified, but some relationships exist
 */
export const OlfactorySystem = {
  /**
   * Detection threshold
   * Number of molecules needed for detection
   * 
   * Dogs: ~5-10 molecules
   * Humans: ~40 molecules
   * Varies by compound
   */
  detectionThreshold: (
    olfactoryReceptors: number // Number of receptor cells
  ): number => {
    const human_receptors = 6e6; // 6 million
    const human_threshold = 40; // molecules
    
    return human_threshold * (human_receptors / olfactoryReceptors);
  },
  
  /**
   * Scent plume distance
   * Depends on wind, diffusion, molecule persistence
   */
  scentRange: (
    windSpeed_ms: number,
    moleculePersistence_s: number,
    diffusionRate_m2s: number = 1e-5
  ): number => {
    // Advection distance + diffusion distance
    const advection = windSpeed_ms * moleculePersistence_s;
    const diffusion = Math.sqrt(2 * diffusionRate_m2s * moleculePersistence_s);
    
    return advection + diffusion; // meters
  },
};

/**
 * Tactile/Vibration Sensing
 * Particularly important for fossorial and aquatic animals
 */
export const TactileSensing = {
  /**
   * Lateral line sensitivity (fish)
   * Detects water displacement from prey/predators
   */
  lateralLineRange: (
    bodyLength_m: number,
    waterVelocity_ms: number
  ): number => {
    // Can detect prey at ~1-2 body lengths in still water
    const baseRange = 1.5 * bodyLength_m;
    
    // Current reduces detection
    const velocityPenalty = waterVelocity_ms / 0.1; // Reduces by factor
    
    return baseRange / (1 + velocityPenalty);
  },
  
  /**
   * Seismic sensing (elephants, burrowing animals)
   * Rayleigh waves through ground
   */
  seismicRange: (
    impactForce_N: number,
    soilDensity_kgm3: number = 1500,
    soilStiffness_Pa: number = 1e7
  ): number => {
    // Wave speed in soil
    const waveSpeed = Math.sqrt(soilStiffness_Pa / soilDensity_kgm3);
    
    // Attenuation with distance (geometric spreading)
    const detectionThreshold_N = 0.01; // Newtons at sensor
    const distance = Math.sqrt(impactForce_N / detectionThreshold_N);
    
    return distance * 10; // meters (rough approximation)
  },
};

/**
 * Sensory Integration
 * How different senses combine
 */
export const SensoryIntegration = {
  /**
   * Primary sense by environment
   * Different environments favor different senses
   */
  primarySense: (environment: string): 'vision' | 'audition' | 'olfaction' | 'tactile' => {
    const senseMap: Record<string, 'vision' | 'audition' | 'olfaction' | 'tactile'> = {
      'ocean': 'tactile', // Lateral line, electroreception
      'murky_water': 'tactile',
      'forest': 'audition', // Dense vegetation blocks sight
      'grassland': 'vision', // Open areas
      'desert': 'vision',
      'cave': 'tactile', // Dark
      'underground': 'tactile', // Vibrations
      'arboreal': 'vision',
    };
    
    return senseMap[environment] || 'vision';
  },
  
  /**
   * Sensory budget: How much brain devoted to each sense?
   * Total sensory cortex ≈ 30% of brain
   */
  sensoryAllocation: (
    primarySense: string,
    brainMass_kg: number
  ): Record<string, number> => {
    const totalSensory = brainMass_kg * 0.3; // kg
    
    const allocation: Record<string, number> = {
      vision: 0.25,
      audition: 0.25,
      olfaction: 0.25,
      tactile: 0.25,
    };
    
    // Primary sense gets 50%, others split remaining 50%
    allocation[primarySense] = 0.5;
    const remaining = 0.5 / 3;
    for (const sense in allocation) {
      if (sense !== primarySense) {
        allocation[sense] = remaining;
      }
    }
    
    // Convert proportions to absolute mass
    const masses: Record<string, number> = {};
    for (const sense in allocation) {
      masses[sense] = totalSensory * allocation[sense];
    }
    
    return masses; // kg for each sensory system
  },
};

/**
 * Complete sensory biology laws
 */
export const SensoryBiologyLaws = {
  vision: VisualSystem,
  audition: AuditorySystem,
  olfaction: OlfactorySystem,
  tactile: TactileSensing,
  integration: SensoryIntegration,
} as const;

