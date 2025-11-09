/**
 * Metallurgy Laws
 * Smelting, forging, alloying, heat treatment.
 */

export const Smelting = {
  reductionTemperature: (ore: string): number => {
    const temps: Record<string, number> = {
      Cu: 1358, // Copper oxide
      Fe: 1811, // Iron oxide  
      Sn: 505, // Tin oxide
      Pb: 600, // Lead oxide
      Ag: 1234, // Silver oxide
      Au: 1337, // Gold (native, no reduction needed)
    };
    return temps[ore] || 1500;
  },
  
  fuelRequired_kgPerKg: (ore: string, fuel: 'charcoal' | 'coal' | 'coke'): number => {
    const energyDensity = { charcoal: 30, coal: 25, coke: 28 }[fuel]; // MJ/kg
    const reductionEnergy = 5; // MJ/kg (typical)
    const efficiency = 0.3; // 30% thermal efficiency
    
    return reductionEnergy / (energyDensity * efficiency);
  },
  
  oreConcentration: (element: string, rockType: string): number => {
    if (element === 'Fe' && rockType === 'hematite') return 0.70; // 70% Fe
    if (element === 'Cu' && rockType === 'malachite') return 0.57;
    return 0.05; // Low-grade ore
  },
};

export const HeatTreatment = {
  quenching: (steel_carbonPercent: number): number => {
    const hardeningFactor = 1 + steel_carbonPercent * 100;
    return 5.5 * hardeningFactor; // Mohs hardness
  },
  
  tempering: (quenchedHardness: number, temperingTemp_K: number): {
    hardness: number;
    toughness: number;
  } => {
    const tempC = temperingTemp_K - 273.15;
    const hardenessReduction = tempC / 600;
    const toughnessGain = 1 - Math.exp(-tempC / 300);
    
    return {
      hardness: quenchedHardness * (1 - hardenessReduction),
      toughness: toughnessGain,
    };
  },
};

export const MetallurgyLaws = {
  smelting: Smelting,
  heatTreatment: HeatTreatment,
} as const;

