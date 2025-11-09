/**
 * Materials Science Laws
 * 
 * Properties of materials from composition.
 * Metallurgy, ceramics, polymers, composites.
 * 
 * FROM PERIODIC TABLE TO ENGINEERING.
 */

/**
 * Metallic Bonding
 * Why metals are shiny, conductive, malleable
 */
export const MetallicProperties = {
  /**
   * Electrical conductivity
   * Metals have free electrons
   * 
   * σ = n × e² × τ / m
   * Where n = electron density, τ = relaxation time
   */
  electricalConductivity: (element: string): number => {
    const conductivities: Record<string, number> = {
      Ag: 6.3e7, // Silver (best)
      Cu: 5.96e7, // Copper
      Au: 4.52e7, // Gold
      Al: 3.77e7, // Aluminum
      Fe: 1.0e7, // Iron
      // Non-metals
      C: 1e5, // Graphite (special case)
    };
    return conductivities[element] || 1e-10; // S/m
  },
  
  /**
   * Thermal conductivity
   * Metals conduct heat well
   */
  thermalConductivity: (element: string): number => {
    const conductivities: Record<string, number> = {
      Ag: 429, // Silver (best)
      Cu: 401, // Copper
      Au: 318, // Gold
      Al: 237, // Aluminum
      Fe: 80, // Iron
      C: 2000, // Diamond (best of all!)
    };
    return conductivities[element] || 0.1; // W/(m·K)
  },
  
  /**
   * Malleability
   * Can be hammered into sheets without breaking
   * 
   * Au > Ag > Al > Cu > Fe
   */
  malleability: (element: string): number => {
    const scores: Record<string, number> = {
      Au: 1.0, // Gold (most malleable)
      Ag: 0.9,
      Al: 0.8,
      Cu: 0.7,
      Fe: 0.5,
    };
    return scores[element] || 0.1; // 0-1
  },
  
  /**
   * Ductility
   * Can be drawn into wires
   */
  ductility: (element: string): number => {
    const scores: Record<string, number> = {
      Au: 1.0,
      Ag: 0.95,
      Cu: 0.9,
      Al: 0.8,
      Fe: 0.6,
    };
    return scores[element] || 0.1;
  },
};

/**
 * Alloys
 * Combining elements creates new properties
 */
export const Alloys = {
  /**
   * Bronze: Cu + Sn
   * Harder than pure copper, easier to cast
   */
  bronze: {
    composition: { Cu: 0.88, Sn: 0.12 },
    hardness: 3.5, // vs 3.0 for pure Cu
    meltingPoint: 1223, // K (lower than Cu alone!)
    strength: 350, // MPa (tensile)
  },
  
  /**
   * Steel: Fe + C
   * Much harder than pure iron
   */
  steel: {
    composition: { Fe: 0.99, C: 0.01 },
    hardness: 5.5, // vs 4.0 for pure Fe
    meltingPoint: 1783, // K
    strength: 500, // MPa (varies with carbon %)
  },
  
  /**
   * Brass: Cu + Zn
   * Corrosion resistant
   */
  brass: {
    composition: { Cu: 0.70, Zn: 0.30 },
    hardness: 3.5,
    meltingPoint: 1173, // K
    corrosionResistance: 0.9, // 0-1
  },
  
  /**
   * Calculate alloy properties from composition
   * Not simple average - interactions matter!
   */
  calculateAlloyProperties: (composition: Record<string, number>): {
    hardness: number;
    meltingPoint: number;
    strength: number;
  } => {
    // Check for known alloys
    if (composition.Cu > 0.85 && composition.Sn > 0.1) {
      return Alloys.bronze;
    }
    if (composition.Fe > 0.95 && composition.C > 0.005) {
      return Alloys.steel;
    }
    
    // Otherwise: Weighted average with interaction terms
    let hardness = 0;
    let meltingPoint = 0;
    for (const [element, fraction] of Object.entries(composition)) {
      hardness += fraction * 4; // Rough average
      meltingPoint += fraction * 1500; // Rough average
    }
    
    return {
      hardness,
      meltingPoint,
      strength: hardness * 100, // Rough correlation
    };
  },
};

/**
 * Ceramics
 * Non-metallic inorganic materials
 */
export const Ceramics = {
  /**
   * Clay → Pottery
   * Firing removes water, hardens structure
   */
  pottery: {
    composition: { Si: 0.30, Al: 0.15, O: 0.50, H: 0.05 },
    firingTemp: 1073, // K (800°C)
    hardness: 5.5, // After firing
    porosity: 0.15, // Porous (absorbs water)
  },
  
  /**
   * Brick
   * Fired clay, very hard
   */
  brick: {
    composition: { Si: 0.35, Al: 0.20, O: 0.45 },
    firingTemp: 1273, // K (1000°C)
    hardness: 6.0,
    compressiveStrength: 20, // MPa
  },
  
  /**
   * Glass (SiO₂)
   * Amorphous (non-crystalline) solid
   */
  glass: {
    composition: { Si: 0.33, O: 0.67 },
    meltingPoint: 1973, // K (very high!)
    hardness: 5.5,
    transparency: 0.9, // Very transparent
    brittleness: 0.95, // Breaks easily
  },
};

/**
 * Strength of Materials
 * How much stress before failure?
 */
export const StrengthOfMaterials = {
  /**
   * Tensile strength
   * Maximum pulling force before breaking
   * 
   * Units: MPa (megapascals)
   */
  tensileStrength: (material: string): number => {
    const strengths: Record<string, number> = {
      // Metals
      steel: 500,
      iron: 200,
      copper: 220,
      bronze: 350,
      
      // Stone
      granite: 130,
      limestone: 15,
      sandstone: 25,
      
      // Organic
      wood_oak: 90,
      bone: 130,
      silk: 500, // Stronger than steel per weight!
      
      // Ceramics
      pottery: 40,
      brick: 10,
    };
    
    return strengths[material] || 50; // MPa
  },
  
  /**
   * Compressive strength
   * Resistance to crushing
   * 
   * Rock is MUCH stronger in compression than tension
   */
  compressiveStrength: (material: string): number => {
    const strengths: Record<string, number> = {
      // Stone (very strong in compression!)
      granite: 200,
      limestone: 50,
      concrete: 40,
      
      // Metals
      steel: 550,
      iron: 250,
      
      // Organic (weak in compression)
      wood_oak: 50,
      bone: 170,
    };
    
    return strengths[material] || 30; // MPa
  },
  
  /**
   * Hardness (Mohs scale)
   * Resistance to scratching
   * 
   * 1: Talc (softest)
   * 10: Diamond (hardest)
   */
  mohsHardness: (composition: Record<string, number>): number => {
    // Pure elements
    if (composition.C && composition.C > 0.99) return 10; // Diamond
    if (composition.Fe && composition.Fe > 0.95) return 4.5; // Iron
    
    // Compounds
    const silicate = (composition.Si || 0) + (composition.O || 0);
    if (silicate > 0.8) return 7; // Quartz
    
    return 3; // Default (limestone)
  },
};

/**
 * Complete materials science laws
 */
export const MaterialsScienceLaws = {
  metallic: MetallicProperties,
  alloys: Alloys,
  ceramics: Ceramics,
  strength: StrengthOfMaterials,
} as const;
