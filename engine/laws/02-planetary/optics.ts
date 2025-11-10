/**
 * Optics Laws
 *
 * How light interacts with matter.
 * CRITICAL for accurate visual rendering.
 *
 * Rayleigh scattering (sky color)
 * Mie scattering (clouds, fog)
 * Refraction (water, glass)
 * Absorption (why grass is green)
 */

export const Scattering = {
  /**
   * Rayleigh scattering - Why sky is blue
   * I ∝ 1/λ⁴
   *
   * Short wavelengths (blue) scatter MORE than long (red)
   */
  rayleighIntensity: (wavelength_nm: number, particleDensity: number): number => {
    const baseScattering = 1 / Math.pow(wavelength_nm / 400, 4); // Relative to 400nm
    return baseScattering * particleDensity;
  },

  /**
   * Sky color from atmospheric scattering
   * Blue during day (short path), Red at sunset (long path)
   */
  skyColor: (
    sunAngle_deg: number,
    atmosphericDensity: number
  ): { r: number; g: number; b: number } => {
    const pathLength = 1 / Math.cos((sunAngle_deg * Math.PI) / 180);

    // Rayleigh scattering favors blue
    const blueScatter = Scattering.rayleighIntensity(450, atmosphericDensity) / pathLength;
    const redScatter = Scattering.rayleighIntensity(650, atmosphericDensity) / pathLength;

    // Long path → more scattering → redder
    const red = Math.min(1, 0.3 + redScatter * 0.7);
    const blue = Math.max(0, 0.9 - blueScatter * pathLength * 0.1);

    return { r: red, g: 0.4, b: blue };
  },

  /**
   * Mie scattering - Clouds, fog, dust
   * Less wavelength dependent than Rayleigh
   */
  mieScattering: (particleSize_um: number, wavelength_nm: number): number => {
    // Size parameter
    const x = (2 * Math.PI * particleSize_um) / (wavelength_nm / 1000);

    // Simplified Mie (complex in reality)
    if (x < 0.1) return OpticsLaws.rayleighIntensity(wavelength_nm, 1); // Small → Rayleigh
    if (x > 10) return 1; // Large → geometric (white)

    return 0.5 + 0.5 * (1 - 1 / x); // Transition
  },
};

export const Refraction = {
  /**
   * Refractive index from composition
   * n = √ε_r (relative permittivity)
   */
  index: (material: string): number => {
    const indices: Record<string, number> = {
      vacuum: 1.0,
      air: 1.000293,
      water: 1.333,
      ice: 1.31,
      glass: 1.52,
      diamond: 2.42,
      quartz: 1.54,
    };
    return indices[material] || 1.5;
  },

  /**
   * Snell's law - Light bending at interface
   * n₁ sin(θ₁) = n₂ sin(θ₂)
   */
  snellsLaw: (n1: number, theta1_deg: number, n2: number): number => {
    const theta1_rad = (theta1_deg * Math.PI) / 180;
    const sinTheta2 = (n1 / n2) * Math.sin(theta1_rad);

    // Total internal reflection if sin > 1
    if (Math.abs(sinTheta2) > 1) return -1;

    return (Math.asin(sinTheta2) * 180) / Math.PI; // degrees
  },

  /**
   * Critical angle for total internal reflection
   */
  criticalAngle: (n1: number, n2: number): number => {
    return (Math.asin(n2 / n1) * 180) / Math.PI;
  },
};

export const Absorption = {
  /**
   * Absorption spectra - Which wavelengths are absorbed?
   *
   * This is WHY things have color!
   * Grass absorbs red/blue, reflects green
   */
  absorptionPeaks: (compound: string): number[] => {
    const peaks: Record<string, number[]> = {
      chlorophyll_a: [430, 662], // nm (absorbs blue and red)
      chlorophyll_b: [453, 642],
      carotene: [450, 480], // Blue-green (appears orange)
      hemoglobin: [415, 540], // Blue-green (appears red)
      melanin: [300, 400], // UV (appears brown/black)
    };
    return peaks[compound] || [];
  },

  /**
   * Perceived color from absorption
   * Absorb red/blue → Appears green
   */
  perceivedColor: (absorbedWavelengths_nm: number[]): { r: number; g: number; b: number } => {
    let r = 1,
      g = 1,
      b = 1;

    for (const lambda of absorbedWavelengths_nm) {
      if (lambda < 500)
        b *= 0.3; // Absorb blue
      else if (lambda < 600)
        g *= 0.3; // Absorb green
      else r *= 0.3; // Absorb red
    }

    // Normalize
    const max = Math.max(r, g, b);
    return { r: r / max, g: g / max, b: b / max };
  },

  /**
   * Beer-Lambert law - Absorption through medium
   * I = I₀ × e^(-α × d)
   */
  transmission: (
    initialIntensity: number,
    absorptionCoeff: number,
    thickness_m: number
  ): number => {
    return initialIntensity * Math.exp(-absorptionCoeff * thickness_m);
  },
};

export const Fluorescence = {
  /**
   * Materials that glow under UV
   * Absorb high energy → Emit lower energy
   */
  fluorescentMaterials: ['quartz', 'calcite', 'fluorite', 'chlorophyll', 'GFP'],

  /**
   * Stokes shift - Emitted wavelength > absorbed wavelength
   */
  emittedWavelength: (absorbedWavelength_nm: number): number => {
    return absorbedWavelength_nm + 50; // Typically 50nm shift
  },

  /**
   * Quantum efficiency
   */
  efficiency: (material: string): number => {
    const efficiencies: Record<string, number> = {
      quartz: 0.05,
      GFP: 0.8, // Green fluorescent protein (biology!)
      chlorophyll: 0.95, // Very efficient
    };
    return efficiencies[material] || 0.1;
  },
};

export const OpticsLaws = {
  scattering: Scattering,
  refraction: Refraction,
  absorption: Absorption,
  fluorescence: Fluorescence,
} as const;
