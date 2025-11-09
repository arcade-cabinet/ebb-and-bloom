/**
 * Transportation Laws - Movement of goods and people
 */

export const LandTransport = {
  walkingSpeed_ms: (slope_percent: number, load_kg: number) => {
    const baseSpeed = 1.4; // m/s
    const slopePenalty = Math.exp(-slope_percent / 10);
    const loadPenalty = Math.exp(-load_kg / 50);
    return baseSpeed * slopePenalty * loadPenalty;
  },
  
  animalDraft: (animalMass_kg: number) => {
    const force_N = animalMass_kg * 9.81 * 0.15; // 15% of weight
    const speed_ms = 1.5;
    return force_N * speed_ms; // Watts
  },
  
  wheelEfficiency: 0.95,
  sledgeEfficiency: 0.15,
};

export const WaterTransport = {
  driftSpeed_ms: (currentVelocity_ms: number) => currentVelocity_ms,
  
  rowing Power_W: (rowers: number) => rowers * 75,
  
  sailingSpeed_ms: (windSpeed_ms: number, angle_deg: number) => {
    const efficiency = Math.cos(angle_deg * Math.PI / 180) * 0.4;
    return windSpeed_ms * efficiency;
  },
};

export const TransportCosts = {
  costPerTonKm: (method: string) => ({
    foot: 1.0,
    pack_animal: 0.3,
    cart: 0.15,
    boat: 0.05,
    ship: 0.02,
  }[method] || 1.0),
};

export const TransportationLaws = {
  land: LandTransport,
  water: WaterTransport,
  costs: TransportCosts,
} as const;

