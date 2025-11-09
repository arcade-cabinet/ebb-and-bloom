/**
 * Warfare Laws - Combat, tactics, military organization
 */

export const CombatMechanics = {
  lanchesterLinear: (A: number, B: number, a: number, b: number, dt: number) => ({
    dA: -b * B * dt,
    dB: -a * A * dt,
  }),
  
  lanchesterSquare: (A: number, B: number, a: number, b: number, dt: number) => ({
    dA: -b * B * A * dt,
    dB: -a * A * B * dt,
  }),
  
  combatPower: (numbers: number, quality: number, morale: number) => {
    return numbers * quality * morale;
  },
};

export const Logistics = {
  supplyLineCapacity_kgPerDay: (distance_km: number, transportMethod: string) => {
    const baseCapacity = 10000;
    const efficiency = { foot: 0.1, animal: 0.5, cart: 0.8, ship: 1.0 }[transportMethod] || 0.5;
    return baseCapacity * efficiency * Math.exp(-distance_km / 500);
  },
  
  attritionRate: (distance_km: number, season: string) => {
    const baseRate = 0.01;
    const distanceFactor = distance_km / 100;
    const seasonFactor = { summer: 1, winter: 3, spring: 1.2, fall: 1.5 }[season] || 1;
    return baseRate * distanceFactor * seasonFactor;
  },
};

export const WarfareLaws = {
  combat: CombatMechanics,
  logistics: Logistics,
} as const;

