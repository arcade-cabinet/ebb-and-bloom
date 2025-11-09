/**
 * Soil Science & Pedology
 * 
 * Soil formation, nutrient cycling, fertility.
 * Critical for agriculture and plant growth.
 */

/**
 * Soil Formation
 * Jenny (1941) "Factors of Soil Formation"
 * 
 * Soil = f(Climate, Organisms, Relief, Parent material, Time)
 * CLORPT equation
 */
export const SoilFormation = {
  /**
   * Soil depth from time
   * Rate depends on climate and parent rock
   * 
   * Typical: 1 cm per 100-1000 years
   */
  soilDepth_m: (
    time_years: number,
    rainfall_mm: number,
    temperature_K: number,
    rockHardness: number // 1-10 Mohs scale
  ): number => {
    // Weathering rate increases with warmth and moisture
    const tempC = temperature_K - 273.15;
    const climateFactor = (tempC / 15) * (rainfall_mm / 1000);
    
    // Hard rocks weather slower
    const hardnessFactor = 10 / rockHardness;
    
    // Rate: cm per 100 years
    const rate_cmPer100yr = 0.1 * climateFactor * hardnessFactor;
    
    const depth_cm = rate_cmPer100yr * (time_years / 100);
    
    return Math.min(2.0, depth_cm / 100); // Cap at 2m (typical soil depth)
  },
  
  /**
   * Soil texture from parent material
   * 
   * Sand (>2mm): Low water, low nutrients, fast drainage
   * Silt (0.05-2mm): Medium
   * Clay (<0.05mm): High water, high nutrients, slow drainage
   */
  texture: (parentRock: 'granite' | 'basalt' | 'limestone' | 'sandstone'): {
    sand: number;
    silt: number;
    clay: number;
  } => {
    const textures = {
      granite: { sand: 0.60, silt: 0.30, clay: 0.10 }, // Coarse
      basalt: { sand: 0.30, silt: 0.40, clay: 0.30 }, // Medium
      limestone: { sand: 0.10, silt: 0.40, clay: 0.50 }, // Fine
      sandstone: { sand: 0.80, silt: 0.15, clay: 0.05 }, // Very coarse
    };
    
    return textures[parentRock];
  },
};

/**
 * Nutrient Cycling (NPK + micronutrients)
 * Liebig's Law of the Minimum
 */
export const NutrientCycling = {
  /**
   * Liebig's Law: Growth limited by scarcest nutrient
   * 
   * Even if N and P abundant, if K is limiting, growth stops at K level
   */
  limitingNutrient: (nutrients: {
    N: number; // Nitrogen (kg/ha)
    P: number; // Phosphorus
    K: number; // Potassium
  }): 'N' | 'P' | 'K' => {
    // Normalize by plant requirements (N:P:K = 10:1:5)
    const N_relative = nutrients.N / 10;
    const P_relative = nutrients.P / 1;
    const K_relative = nutrients.K / 5;
    
    const min = Math.min(N_relative, P_relative, K_relative);
    
    if (min === N_relative) return 'N';
    if (min === P_relative) return 'P';
    return 'K';
  },
  
  /**
   * Nutrient availability from soil pH
   * 
   * pH 6-7: Optimal (all nutrients available)
   * pH < 5: Iron/aluminum toxic, phosphorus locked
   * pH > 8: Micronutrients unavailable
   */
  nutrientAvailability: (pH: number): number => {
    if (pH < 4 || pH > 9) return 0.2; // Very poor
    if (pH < 5.5 || pH > 7.5) return 0.6; // Suboptimal
    return 1.0; // Optimal
  },
  
  /**
   * Nitrogen fixation
   * Legumes and other plants fix atmospheric N₂
   * 
   * Rate: 50-200 kg N/ha/year for legumes
   */
  nitrogenFixation_kgPerHaPerYear: (
    legumePercent: number,
    soilMoisture: number // 0-1
  ): number => {
    const maxRate = 150; // kg/ha/year
    return maxRate * legumePercent * soilMoisture;
  },
  
  /**
   * Nutrient depletion from harvest
   * Taking crops removes nutrients
   */
  depletionRate: (
    cropYield_kgPerHa: number,
    nutrient: 'N' | 'P' | 'K'
  ): number => {
    // Typical crop nutrient content (kg nutrient / kg dry matter)
    const content = {
      N: 0.015, // 1.5%
      P: 0.002, // 0.2%
      K: 0.010, // 1.0%
    }[nutrient];
    
    return cropYield_kgPerHa * content; // kg/ha removed
  },
};

/**
 * Soil Erosion
 * Universal Soil Loss Equation (USLE)
 * 
 * Wischmeier & Smith (1978)
 */
export const SoilErosion = {
  /**
   * USLE: A = R × K × LS × C × P
   * 
   * A = Annual soil loss (tons/ha/year)
   * R = Rainfall erosivity
   * K = Soil erodibility
   * LS = Slope length-steepness
   * C = Cover management
   * P = Support practices
   */
  annualLoss_tonsPerHa: (
    rainfall_mm: number,
    soilTexture: { sand: number; clay: number },
    slopePercent: number,
    vegetationCover: number, // 0-1
    hasTerracing: boolean
  ): number => {
    // R: Rainfall erosivity (increases with intensity)
    const R = Math.pow(rainfall_mm / 1000, 1.5) * 100;
    
    // K: Soil erodibility (sand erodes less than silt, clay resists)
    const K = 0.4 - 0.2 * soilTexture.sand - 0.1 * soilTexture.clay;
    
    // LS: Slope factor (steeper = more erosion)
    const LS = Math.pow(slopePercent / 10, 1.3);
    
    // C: Cover factor (vegetation protects soil)
    const C = 1 - vegetationCover; // 0 = full cover, 1 = bare
    
    // P: Practice factor (terracing reduces erosion 50%)
    const P = hasTerracing ? 0.5 : 1.0;
    
    return R * K * LS * C * P; // tons/ha/year
  },
  
  /**
   * Soil exhaustion time
   * How long until topsoil gone?
   */
  exhaustionTime_years: (
    currentDepth_m: number,
    erosionRate_tonsPerHa: number,
    soilDensity: number = 1400 // kg/m³
  ): number => {
    const depth_cm = currentDepth_m * 100;
    const soilMass_tonsPerHa = depth_cm * soilDensity * 100 / 1000; // tons/ha
    
    return soilMass_tonsPerHa / erosionRate_tonsPerHa; // years
  },
};

/**
 * Primary Productivity
 * How much plant biomass grows?
 */
export const PrimaryProductivity = {
  /**
   * Net Primary Productivity (NPP)
   * Total plant growth (dry matter)
   * 
   * Depends on: Light, water, temperature, nutrients
   */
  NPP_kgPerM2PerYear: (
    temperature_K: number,
    rainfall_mm: number,
    sunlight_Wm2: number,
    nutrientAvailability: number // 0-1
  ): number => {
    const tempC = temperature_K - 273.15;
    
    // Miami model (simple but effective)
    const tempFactor = tempC < 0 ? 0 : Math.min(1, tempC / 30);
    const waterFactor = Math.min(1, rainfall_mm / 1500);
    const lightFactor = Math.min(1, sunlight_Wm2 / 250);
    
    // Limited by scarcest resource (Liebig's law)
    const limitation = Math.min(tempFactor, waterFactor, lightFactor, nutrientAvailability);
    
    const maxNPP = 2.5; // kg/m²/year (tropical rainforest)
    return maxNPP * limitation;
  },
  
  /**
   * Carrying capacity from NPP
   * How many herbivores can the land support?
   * 
   * Rule of thumb: 10% efficiency between trophic levels
   */
  herbivor eCarryingCapacity: (
    NPP_kgPerM2: number,
    area_m2: number,
    herbivoreMetabolicRate_W: number
  ): number => {
    // Annual plant production
    const totalPlantMass_kg = NPP_kgPerM2 * area_m2;
    
    // Herbivores get 10% of NPP (trophic efficiency)
    const herbivoreEnergy_kJ = totalPlantMass_kg * 15000 * 0.1; // 15 MJ/kg, 10% efficient
    
    // Annual energy need per herbivore
    const energyPerHerbivore_kJ = herbivoreMetabolicRate_W * 365.25 * 86400 / 1000;
    
    return herbivoreEnergy_kJ / energyPerHerbivore_kJ; // Number of herbivores
  },
};

/**
 * Complete soil science laws
 */
export const SoilScienceLaws = {
  formation: SoilFormation,
  nutrients: NutrientCycling,
  erosion: SoilErosion,
  productivity: PrimaryProductivity,
} as const;
