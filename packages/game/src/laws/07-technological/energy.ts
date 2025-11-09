/**
 * Energy Technology - Power generation, storage, transmission
 */

export const MechanicalPower = {
  waterWheel_W: (flowRate_m3s: number, head_m: number) => {
    const efficiency = 0.4;
    return 1000 * 9.81 * flowRate_m3s * head_m * efficiency;
  },

  windmill_W: (windSpeed_ms: number, bladeRadius_m: number) => {
    const efficiency = 0.35;
    const sweptArea = Math.PI * bladeRadius_m * bladeRadius_m;
    return 0.5 * 1.225 * sweptArea * Math.pow(windSpeed_ms, 3) * efficiency;
  },

  humanPower_W: 75,
  horsePower_W: 746,
  oxPower_W: 500,
};

export const HeatEngines = {
  carnotEfficiency: (T_hot_K: number, T_cold_K: number) => 1 - T_cold_K / T_hot_K,

  steamEngine_efficiency: (pressure_Pa: number) => {
    const idealEfficiency = 0.25;
    const pressureFactor = Math.log(pressure_Pa / 101325) / 10;
    return Math.min(0.4, idealEfficiency * (1 + pressureFactor));
  },
};

export const EnergyLaws = {
  mechanical: MechanicalPower,
  heat: HeatEngines,
} as const;
