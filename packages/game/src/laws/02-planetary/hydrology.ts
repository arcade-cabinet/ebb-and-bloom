/**
 * Hydrology Laws
 * 
 * Water cycle, rivers, aquifers, erosion.
 * Critical for agriculture and settlement.
 */

/**
 * Water Cycle
 * Evaporation → Precipitation → Runoff → Repeat
 */
export const WaterCycle = {
  /**
   * Evaporation rate
   * Depends on temperature, wind, humidity
   * 
   * Penman equation (simplified)
   */
  evaporationRate_mmPerDay: (
    temperature_K: number,
    windSpeed_ms: number,
    relativeHumidity: number // 0-1
  ): number => {
    const tempC = temperature_K - 273.15;
    
    // Temperature factor (exponential with temp)
    const tempFactor = Math.exp(tempC / 15);
    
    // Wind factor (increases evaporation)
    const windFactor = 1 + windSpeed_ms / 10;
    
    // Humidity factor (reduces evaporation)
    const humidityFactor = 1 - relativeHumidity;
    
    const baseRate = 3; // mm/day at 20°C, no wind, 50% humidity
    return baseRate * tempFactor * windFactor * humidityFactor;
  },
  
  /**
   * Precipitation from atmospheric moisture
   * 
   * Clausius-Clapeyron: Warm air holds more moisture
   */
  maxAtmosphericMoisture_gPerKg: (temperature_K: number): number => {
    // Saturation vapor pressure (empirical)
    const tempC = temperature_K - 273.15;
    const e_s = 6.112 * Math.exp(17.67 * tempC / (tempC + 243.5)); // hPa
    
    // Specific humidity at saturation
    const P = 1013; // hPa (sea level pressure)
    return 622 * e_s / (P - e_s); // g/kg
  },
  
  /**
   * Runoff vs infiltration
   * How much rain becomes streams vs groundwater?
   * 
   * Depends on: soil type, vegetation, slope
   */
  runoffFraction: (
    rainfallIntensity_mmPerHour: number,
    soilPermeability_mmPerHour: number,
    vegetationCover: number, // 0-1
    slopePercent: number
  ): number => {
    // Infiltration capacity
    const maxInfiltration = soilPermeability_mmPerHour * (1 + vegetationCover);
    
    // Slope increases runoff
    const slopeFactor = 1 + slopePercent / 10;
    
    // Runoff = rainfall exceeds infiltration
    if (rainfallIntensity_mmPerHour * slopeFactor > maxInfiltration) {
      const excess = rainfallIntensity_mmPerHour - maxInfiltration / slopeFactor;
      return excess / rainfallIntensity_mmPerHour; // Fraction
    }
    
    return 0; // All infiltrates
  },
};

/**
 * River Systems
 * Horton's laws of drainage composition
 */
export const RiverSystems = {
  /**
   * Stream order (Strahler number)
   * 1st order: Headwater streams
   * 2nd order: Two 1st order join
   * etc.
   */
  streamOrder: (upstreamOrders: number[]): number => {
    if (upstreamOrders.length === 0) return 1; // Headwater
    
    const maxOrder = Math.max(...upstreamOrders);
    const countAtMax = upstreamOrders.filter(o => o === maxOrder).length;
    
    return countAtMax >= 2 ? maxOrder + 1 : maxOrder;
  },
  
  /**
   * Drainage density
   * Total stream length / drainage area
   * 
   * Varies: 0.5 - 200 km/km²
   * High: Impermeable rock, steep slopes
   * Low: Permeable soil, flat terrain
   */
  drainageDensity: (
    rockPermeability_mmPerHour: number,
    averageSlope_percent: number,
    rainfall_mm: number
  ): number => {
    const baseRate = 10; // km/km²
    
    // Impermeable → more surface water → higher density
    const permeabilityFactor = 100 / rockPermeability_mmPerHour;
    
    // Steep → faster runoff → higher density
    const slopeFactor = averageSlope_percent / 10;
    
    // Wet → more streams
    const rainfallFactor = rainfall_mm / 1000;
    
    return baseRate * permeabilityFactor * slopeFactor * rainfallFactor;
  },
  
  /**
   * River discharge (flow rate)
   * Q = A × v (cross-section × velocity)
   * 
   * Manning equation for velocity:
   * v = (1/n) × R^(2/3) × S^(1/2)
   */
  discharge_m3PerSecond: (
    drainageArea_km2: number,
    rainfall_mmPerYear: number,
    evaporation_mmPerYear: number
  ): number => {
    // Net water input
    const netWater_mm = rainfall_mmPerYear - evaporation_mmPerYear;
    const netWater_m3 = drainageArea_km2 * 1e6 * netWater_mm / 1000; // m³/year
    
    // Convert to m³/s
    return netWater_m3 / (365.25 * 86400); // m³/s
  },
};

/**
 * Groundwater
 * Aquifers and subsurface water
 */
export const Groundwater = {
  /**
   * Aquifer recharge rate
   * How fast does groundwater replenish?
   */
  rechargeRate_mmPerYear: (
    infiltration_mm: number,
    deepPercolation Fraction: number // 0-1
  ): number => {
    return infiltration_mm * deepPercolationFraction;
  },
  
  /**
   * Well yield
   * How much water can be extracted?
   * 
   * Darcy's law: Q = K × A × (h₁ - h₂) / L
   */
  wellYield_m3PerDay: (
    hydraulicConductivity_mPerDay: number,
    aquiferThickness_m: number,
    hydraulicGradient: number // Dimensionless
  ): number => {
    const wellRadius = 0.1; // m (typical)
    const wellArea = Math.PI * Math.pow(wellRadius, 2);
    
    return hydraulicConductivity_mPerDay * wellArea * aquiferThickness_m * hydraulicGradient;
  },
  
  /**
   * Aquifer sustainability
   * Extraction rate vs recharge rate
   */
  isSustainable: (
    extractionRate_m3PerYear: number,
    rechargeRate_m3PerYear: number
  ): boolean => {
    return extractionRate_m3PerYear <= rechargeRate_m3PerYear * 0.9; // 90% threshold
  },
};

/**
 * Complete hydrology laws
 */
export const HydrologyLaws = {
  waterCycle: WaterCycle,
  rivers: RiverSystems,
  groundwater: Groundwater,
} as const;
