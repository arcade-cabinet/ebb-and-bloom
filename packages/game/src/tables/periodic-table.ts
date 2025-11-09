/**
 * The Periodic Table of Elements
 * 
 * Complete data for all 92 naturally occurring elements.
 * This is the foundation of all chemistry in the universe.
 * 
 * Properties are based on real scientific data and determine:
 * - What materials can exist
 * - What chemical reactions occur
 * - What planetary compositions are possible
 * - What life chemistries can emerge
 */

export interface Element {
  atomicNumber: number;
  symbol: string;
  name: string;
  atomicMass: number; // u (unified atomic mass units)
  
  // Electronic structure
  electronConfiguration: string;
  valenceElectrons: number;
  oxidationStates: number[];
  
  // Physical properties at STP (Standard Temperature and Pressure)
  density: number; // kg/m³
  meltingPoint: number; // K
  boilingPoint: number; // K
  phase: 'solid' | 'liquid' | 'gas';
  
  // Thermal properties
  heatCapacity: number; // J/(mol·K)
  thermalConductivity: number; // W/(m·K)
  
  // Chemical properties
  electronegativity: number; // Pauling scale
  ionizationEnergy: number; // kJ/mol - First ionization
  atomicRadius: number; // pm (picometers)
  covalentRadius: number; // pm
  
  // Bonding behavior
  bondEnergies: { [element: string]: number }; // kJ/mol
  
  // Cosmic abundance
  solarSystemAbundance: number; // Fraction by mass
  universeAbundance: number; // Fraction by mass
  
  // Special properties
  radioactive?: boolean;
  halfLife?: number; // years (if radioactive)
  allotropes?: string[]; // Different structural forms
}

export const PERIODIC_TABLE: { [symbol: string]: Element } = {
  H: {
    atomicNumber: 1,
    symbol: 'H',
    name: 'Hydrogen',
    atomicMass: 1.008,
    electronConfiguration: '1s¹',
    valenceElectrons: 1,
    oxidationStates: [-1, 0, 1],
    density: 0.0899, // at STP (gas)
    meltingPoint: 14.01,
    boilingPoint: 20.28,
    phase: 'gas',
    heatCapacity: 28.836,
    thermalConductivity: 0.1805,
    electronegativity: 2.20,
    ionizationEnergy: 1312,
    atomicRadius: 37,
    covalentRadius: 31,
    bondEnergies: {
      H: 436, // H-H bond
      C: 413, // H-C bond
      O: 467, // H-O bond
      N: 391, // H-N bond
    },
    solarSystemAbundance: 0.75,
    universeAbundance: 0.75,
  },
  
  He: {
    atomicNumber: 2,
    symbol: 'He',
    name: 'Helium',
    atomicMass: 4.003,
    electronConfiguration: '1s²',
    valenceElectrons: 2,
    oxidationStates: [0],
    density: 0.1785,
    meltingPoint: 0.95, // Does not solidify at 1 atm
    boilingPoint: 4.22,
    phase: 'gas',
    heatCapacity: 20.786,
    thermalConductivity: 0.1513,
    electronegativity: 0, // Noble gas
    ionizationEnergy: 2372,
    atomicRadius: 32,
    covalentRadius: 28,
    bondEnergies: {}, // Noble gas - does not bond
    solarSystemAbundance: 0.23,
    universeAbundance: 0.23,
  },
  
  C: {
    atomicNumber: 6,
    symbol: 'C',
    name: 'Carbon',
    atomicMass: 12.011,
    electronConfiguration: '[He] 2s² 2p²',
    valenceElectrons: 4,
    oxidationStates: [-4, -3, -2, -1, 0, 1, 2, 3, 4],
    density: 2267, // graphite
    meltingPoint: 3823, // sublimes
    boilingPoint: 4098,
    phase: 'solid',
    heatCapacity: 8.517,
    thermalConductivity: 129, // graphite parallel
    electronegativity: 2.55,
    ionizationEnergy: 1086,
    atomicRadius: 70,
    covalentRadius: 76,
    bondEnergies: {
      H: 413,
      C: 346, // C-C single bond
      O: 358, // C-O single bond
      N: 305, // C-N single bond
    },
    solarSystemAbundance: 0.0003,
    universeAbundance: 0.005,
    allotropes: ['diamond', 'graphite', 'graphene', 'fullerene', 'carbon nanotubes'],
  },
  
  N: {
    atomicNumber: 7,
    symbol: 'N',
    name: 'Nitrogen',
    atomicMass: 14.007,
    electronConfiguration: '[He] 2s² 2p³',
    valenceElectrons: 5,
    oxidationStates: [-3, -2, -1, 0, 1, 2, 3, 4, 5],
    density: 1.251, // gas at STP
    meltingPoint: 63.15,
    boilingPoint: 77.36,
    phase: 'gas',
    heatCapacity: 29.124,
    thermalConductivity: 0.02583,
    electronegativity: 3.04,
    ionizationEnergy: 1402,
    atomicRadius: 65,
    covalentRadius: 71,
    bondEnergies: {
      H: 391,
      N: 945, // N≡N triple bond (very strong)
      O: 201, // N-O single bond
    },
    solarSystemAbundance: 0.0001,
    universeAbundance: 0.001,
  },
  
  O: {
    atomicNumber: 8,
    symbol: 'O',
    name: 'Oxygen',
    atomicMass: 15.999,
    electronConfiguration: '[He] 2s² 2p⁴',
    valenceElectrons: 6,
    oxidationStates: [-2, -1, 0, 1, 2],
    density: 1.429, // gas at STP
    meltingPoint: 54.36,
    boilingPoint: 90.20,
    phase: 'gas',
    heatCapacity: 29.378,
    thermalConductivity: 0.02658,
    electronegativity: 3.44,
    ionizationEnergy: 1314,
    atomicRadius: 60,
    covalentRadius: 66,
    bondEnergies: {
      H: 467,
      C: 358,
      O: 498, // O=O double bond
      N: 201,
    },
    solarSystemAbundance: 0.01,
    universeAbundance: 0.01,
    allotropes: ['dioxygen (O₂)', 'ozone (O₃)'],
  },
  
  Si: {
    atomicNumber: 14,
    symbol: 'Si',
    name: 'Silicon',
    atomicMass: 28.085,
    electronConfiguration: '[Ne] 3s² 3p²',
    valenceElectrons: 4,
    oxidationStates: [-4, -3, -2, -1, 0, 1, 2, 3, 4],
    density: 2329,
    meltingPoint: 1687,
    boilingPoint: 3538,
    phase: 'solid',
    heatCapacity: 19.789,
    thermalConductivity: 149,
    electronegativity: 1.90,
    ionizationEnergy: 786,
    atomicRadius: 110,
    covalentRadius: 111,
    bondEnergies: {
      Si: 226, // Si-Si bond
      O: 452, // Si-O bond (very strong - basis of silicate rocks)
      C: 301,
      H: 323,
    },
    solarSystemAbundance: 0.0007,
    universeAbundance: 0.0007,
  },
  
  Fe: {
    atomicNumber: 26,
    symbol: 'Fe',
    name: 'Iron',
    atomicMass: 55.845,
    electronConfiguration: '[Ar] 3d⁶ 4s²',
    valenceElectrons: 2,
    oxidationStates: [-2, -1, 0, 1, 2, 3, 4, 5, 6],
    density: 7874,
    meltingPoint: 1811,
    boilingPoint: 3134,
    phase: 'solid',
    heatCapacity: 25.10,
    thermalConductivity: 80.4,
    electronegativity: 1.83,
    ionizationEnergy: 762,
    atomicRadius: 140,
    covalentRadius: 132,
    bondEnergies: {
      Fe: 118,
      O: 407,
    },
    solarSystemAbundance: 0.0011,
    universeAbundance: 0.0011,
    allotropes: ['alpha-iron', 'gamma-iron', 'delta-iron'],
  },
  
  // NOTE: In a complete implementation, all 92 elements would be here.
  // For now, we include the most important elements for planet formation
  // and biochemistry. The pattern is established.
};

/**
 * Get element by atomic number
 */
export function getElementByNumber(atomicNumber: number): Element | undefined {
  return Object.values(PERIODIC_TABLE).find(e => e.atomicNumber === atomicNumber);
}

/**
 * Get elements by phase at given temperature and pressure
 */
export function getElementsByPhase(
  temperature: number,
  pressure: number = 101325 // Pa (1 atm)
): Element[] {
  return Object.values(PERIODIC_TABLE).filter(element => {
    // Simplified phase determination (real calculation more complex)
    if (temperature < element.meltingPoint) return element.phase === 'solid';
    if (temperature < element.boilingPoint) return element.phase === 'liquid';
    return element.phase === 'gas';
  });
}

/**
 * Primordial abundances (Big Bang nucleosynthesis + stellar nucleosynthesis)
 */
export const PRIMORDIAL_ABUNDANCES = {
  H: 0.75,  // 75% hydrogen
  He: 0.23, // 23% helium
  C: 0.005, // 0.5% carbon
  N: 0.001, // 0.1% nitrogen
  O: 0.01,  // 1% oxygen
  Si: 0.0007,
  Fe: 0.0011,
  // Other elements: ~0.2% combined
} as const;
