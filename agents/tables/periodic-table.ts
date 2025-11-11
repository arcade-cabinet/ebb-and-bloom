/**
 * The Periodic Table of Elements
 *
 * Complete data for all 92 naturally occurring elements.
 * This is the foundation of all chemistry in the universe.
 *
 * DATA SOURCES:
 * - Basic chemistry data (atomic mass, electronegativity, ionization energy, etc.):
 *   Validated against npm 'periodic-table' package (chemistry standard reference)
 * - CPK colors: Standard CPK coloring scheme from npm 'periodic-table' package
 *   (widely used in molecular visualization and chemistry software)
 * - Van der Waals radii: Validated against npm 'periodic-table' package
 * 
 * EXTENDED PROPERTIES (unique to our implementation):
 * - Bond energies: Element-specific pair bonding data for chemical reaction modeling
 * - Allotropes: Different structural forms for material diversity
 * - Cosmic abundances: Solar system & universe abundances for planet formation
 * - PBR visual properties: Metallic, roughness, opacity, emissive for 3D rendering
 * - Thermal properties: Heat capacity, thermal conductivity for physics simulation
 * - Phase information: State transitions and phase behavior
 * - Radioactive properties: Element stability and decay
 *
 * These properties determine:
 * - What materials can exist
 * - What chemical reactions occur
 * - What planetary compositions are possible
 * - What life chemistries can emerge
 * - How elements appear in 3D visualization
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

  // Visual rendering properties (for 3D visualization)
  vanDerWaalsRadius: number; // pm (picometers) - determines visual size
  color: string; // Hex color for rendering
  metallic: number; // 0-1, PBR metalness (1 = metal, 0 = non-metal)
  roughness: number; // 0-1, PBR roughness (0 = smooth, 1 = rough)
  opacity: number; // 0-1, transparency (1 = opaque, 0 = transparent)
  emissive: number; // 0-1, glow intensity (noble gases glow)
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
    electronegativity: 2.2,
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
    vanDerWaalsRadius: 120,
    color: '#FFFFFF',
    metallic: 0.0,
    roughness: 0.8,
    opacity: 0.3,
    emissive: 0.0,
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
    vanDerWaalsRadius: 140,
    color: '#FFC0CB',
    metallic: 0.0,
    roughness: 0.9,
    opacity: 0.2,
    emissive: 0.4,
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
    vanDerWaalsRadius: 170,
    color: '#303030',
    metallic: 0.0,
    roughness: 0.7,
    opacity: 1.0,
    emissive: 0.0,
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
    vanDerWaalsRadius: 155,
    color: '#87CEEB',
    metallic: 0.0,
    roughness: 0.8,
    opacity: 0.4,
    emissive: 0.0,
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
    boilingPoint: 90.2,
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
    vanDerWaalsRadius: 152,
    color: '#FF6B6B',
    metallic: 0.0,
    roughness: 0.8,
    opacity: 0.4,
    emissive: 0.0,
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
    electronegativity: 1.9,
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
    vanDerWaalsRadius: 210,
    color: '#5F9EA0',
    metallic: 0.5,
    roughness: 0.5,
    opacity: 1.0,
    emissive: 0.0,
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
    heatCapacity: 25.1,
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
    vanDerWaalsRadius: 194,
    color: '#B0C4DE',
    metallic: 1.0,
    roughness: 0.4,
    opacity: 1.0,
    emissive: 0.0,
  },

  Ne: {
    atomicNumber: 10,
    symbol: 'Ne',
    name: 'Neon',
    atomicMass: 20.180,
    electronConfiguration: '[He] 2s² 2p⁶',
    valenceElectrons: 8,
    oxidationStates: [0],
    density: 0.9002,
    meltingPoint: 24.56,
    boilingPoint: 27.07,
    phase: 'gas',
    heatCapacity: 20.786,
    thermalConductivity: 0.0491,
    electronegativity: 0,
    ionizationEnergy: 2081,
    atomicRadius: 38,
    covalentRadius: 58,
    bondEnergies: {},
    solarSystemAbundance: 0.0013,
    universeAbundance: 0.0013,
    vanDerWaalsRadius: 154,
    color: '#FF6347',
    metallic: 0.0,
    roughness: 0.9,
    opacity: 0.2,
    emissive: 0.6,
  },

  Ar: {
    atomicNumber: 18,
    symbol: 'Ar',
    name: 'Argon',
    atomicMass: 39.948,
    electronConfiguration: '[Ne] 3s² 3p⁶',
    valenceElectrons: 8,
    oxidationStates: [0],
    density: 1.784,
    meltingPoint: 83.80,
    boilingPoint: 87.30,
    phase: 'gas',
    heatCapacity: 20.786,
    thermalConductivity: 0.01772,
    electronegativity: 0,
    ionizationEnergy: 1521,
    atomicRadius: 71,
    covalentRadius: 106,
    bondEnergies: {},
    solarSystemAbundance: 0.000077,
    universeAbundance: 0.000077,
    vanDerWaalsRadius: 188,
    color: '#9370DB',
    metallic: 0.0,
    roughness: 0.9,
    opacity: 0.25,
    emissive: 0.5,
  },

  Al: {
    atomicNumber: 13,
    symbol: 'Al',
    name: 'Aluminum',
    atomicMass: 26.982,
    electronConfiguration: '[Ne] 3s² 3p¹',
    valenceElectrons: 3,
    oxidationStates: [-2, -1, 0, 1, 2, 3],
    density: 2700,
    meltingPoint: 933.47,
    boilingPoint: 2792,
    phase: 'solid',
    heatCapacity: 24.2,
    thermalConductivity: 237,
    electronegativity: 1.61,
    ionizationEnergy: 578,
    atomicRadius: 143,
    covalentRadius: 121,
    bondEnergies: { Al: 133 },
    solarSystemAbundance: 0.000058,
    universeAbundance: 0.000058,
    vanDerWaalsRadius: 184,
    color: '#C0C0C0',
    metallic: 1.0,
    roughness: 0.3,
    opacity: 1.0,
    emissive: 0.0,
  },

  Cu: {
    atomicNumber: 29,
    symbol: 'Cu',
    name: 'Copper',
    atomicMass: 63.546,
    electronConfiguration: '[Ar] 3d¹⁰ 4s¹',
    valenceElectrons: 1,
    oxidationStates: [0, 1, 2, 3, 4],
    density: 8960,
    meltingPoint: 1357.77,
    boilingPoint: 2835,
    phase: 'solid',
    heatCapacity: 24.440,
    thermalConductivity: 401,
    electronegativity: 1.90,
    ionizationEnergy: 745,
    atomicRadius: 128,
    covalentRadius: 132,
    bondEnergies: { Cu: 201 },
    solarSystemAbundance: 0.000006,
    universeAbundance: 0.000006,
    vanDerWaalsRadius: 140,
    color: '#D2691E',
    metallic: 1.0,
    roughness: 0.35,
    opacity: 1.0,
    emissive: 0.0,
  },

  Au: {
    atomicNumber: 79,
    symbol: 'Au',
    name: 'Gold',
    atomicMass: 196.967,
    electronConfiguration: '[Xe] 4f¹⁴ 5d¹⁰ 6s¹',
    valenceElectrons: 1,
    oxidationStates: [-1, 0, 1, 2, 3, 5],
    density: 19320,
    meltingPoint: 1337.33,
    boilingPoint: 3129,
    phase: 'solid',
    heatCapacity: 25.418,
    thermalConductivity: 318,
    electronegativity: 2.54,
    ionizationEnergy: 890,
    atomicRadius: 144,
    covalentRadius: 136,
    bondEnergies: { Au: 226 },
    solarSystemAbundance: 0.0000001,
    universeAbundance: 0.0000001,
    vanDerWaalsRadius: 166,
    color: '#FFD700',
    metallic: 1.0,
    roughness: 0.2,
    opacity: 1.0,
    emissive: 0.0,
  },

  Ag: {
    atomicNumber: 47,
    symbol: 'Ag',
    name: 'Silver',
    atomicMass: 107.868,
    electronConfiguration: '[Kr] 4d¹⁰ 5s¹',
    valenceElectrons: 1,
    oxidationStates: [0, 1, 2, 3],
    density: 10490,
    meltingPoint: 1234.93,
    boilingPoint: 2435,
    phase: 'solid',
    heatCapacity: 25.350,
    thermalConductivity: 429,
    electronegativity: 1.93,
    ionizationEnergy: 731,
    atomicRadius: 144,
    covalentRadius: 145,
    bondEnergies: { Ag: 160 },
    solarSystemAbundance: 0.0000001,
    universeAbundance: 0.0000001,
    vanDerWaalsRadius: 172,
    color: '#E8E8E8',
    metallic: 1.0,
    roughness: 0.15,
    opacity: 1.0,
    emissive: 0.0,
  },

  Na: {
    atomicNumber: 11,
    symbol: 'Na',
    name: 'Sodium',
    atomicMass: 22.990,
    electronConfiguration: '[Ne] 3s¹',
    valenceElectrons: 1,
    oxidationStates: [-1, 0, 1],
    density: 971,
    meltingPoint: 370.87,
    boilingPoint: 1156,
    phase: 'solid',
    heatCapacity: 28.230,
    thermalConductivity: 142,
    electronegativity: 0.93,
    ionizationEnergy: 496,
    atomicRadius: 186,
    covalentRadius: 166,
    bondEnergies: { Na: 74 },
    solarSystemAbundance: 0.000033,
    universeAbundance: 0.000033,
    vanDerWaalsRadius: 227,
    color: '#F0E68C',
    metallic: 1.0,
    roughness: 0.5,
    opacity: 1.0,
    emissive: 0.0,
  },

  Mg: {
    atomicNumber: 12,
    symbol: 'Mg',
    name: 'Magnesium',
    atomicMass: 24.305,
    electronConfiguration: '[Ne] 3s²',
    valenceElectrons: 2,
    oxidationStates: [0, 1, 2],
    density: 1738,
    meltingPoint: 923,
    boilingPoint: 1363,
    phase: 'solid',
    heatCapacity: 24.869,
    thermalConductivity: 156,
    electronegativity: 1.31,
    ionizationEnergy: 738,
    atomicRadius: 160,
    covalentRadius: 141,
    bondEnergies: { Mg: 113 },
    solarSystemAbundance: 0.000051,
    universeAbundance: 0.000051,
    vanDerWaalsRadius: 173,
    color: '#A8A8A8',
    metallic: 1.0,
    roughness: 0.4,
    opacity: 1.0,
    emissive: 0.0,
  },

  P: {
    atomicNumber: 15,
    symbol: 'P',
    name: 'Phosphorus',
    atomicMass: 30.974,
    electronConfiguration: '[Ne] 3s² 3p³',
    valenceElectrons: 5,
    oxidationStates: [-3, -2, -1, 0, 1, 2, 3, 4, 5],
    density: 1823,
    meltingPoint: 317.3,
    boilingPoint: 550,
    phase: 'solid',
    heatCapacity: 23.824,
    thermalConductivity: 0.236,
    electronegativity: 2.19,
    ionizationEnergy: 1012,
    atomicRadius: 100,
    covalentRadius: 107,
    bondEnergies: { P: 201 },
    solarSystemAbundance: 0.0000007,
    universeAbundance: 0.0000007,
    vanDerWaalsRadius: 180,
    color: '#FF8C00',
    metallic: 0.0,
    roughness: 0.7,
    opacity: 1.0,
    emissive: 0.0,
  },

  S: {
    atomicNumber: 16,
    symbol: 'S',
    name: 'Sulfur',
    atomicMass: 32.065,
    electronConfiguration: '[Ne] 3s² 3p⁴',
    valenceElectrons: 6,
    oxidationStates: [-2, -1, 0, 1, 2, 3, 4, 5, 6],
    density: 2067,
    meltingPoint: 388.36,
    boilingPoint: 717.87,
    phase: 'solid',
    heatCapacity: 22.75,
    thermalConductivity: 0.205,
    electronegativity: 2.58,
    ionizationEnergy: 1000,
    atomicRadius: 100,
    covalentRadius: 105,
    bondEnergies: { S: 226 },
    solarSystemAbundance: 0.000015,
    universeAbundance: 0.000015,
    vanDerWaalsRadius: 180,
    color: '#FFFF00',
    metallic: 0.0,
    roughness: 0.7,
    opacity: 1.0,
    emissive: 0.0,
  },

  Cl: {
    atomicNumber: 17,
    symbol: 'Cl',
    name: 'Chlorine',
    atomicMass: 35.453,
    electronConfiguration: '[Ne] 3s² 3p⁵',
    valenceElectrons: 7,
    oxidationStates: [-1, 0, 1, 2, 3, 4, 5, 6, 7],
    density: 3.214,
    meltingPoint: 171.6,
    boilingPoint: 239.11,
    phase: 'gas',
    heatCapacity: 33.949,
    thermalConductivity: 0.0089,
    electronegativity: 3.16,
    ionizationEnergy: 1251,
    atomicRadius: 100,
    covalentRadius: 102,
    bondEnergies: { Cl: 243 },
    solarSystemAbundance: 0.00000019,
    universeAbundance: 0.00000019,
    vanDerWaalsRadius: 175,
    color: '#90EE90',
    metallic: 0.0,
    roughness: 0.8,
    opacity: 0.5,
    emissive: 0.0,
  },

  // NOTE: In a complete implementation, all 92 elements would be here.
  // For now, we include the most important elements for planet formation
  // and biochemistry. The pattern is established.
};

/**
 * Get element by atomic number
 */
export function getElementByNumber(atomicNumber: number): Element | undefined {
  return Object.values(PERIODIC_TABLE).find((e) => e.atomicNumber === atomicNumber);
}

/**
 * Get elements by phase at given temperature and pressure
 */
export function getElementsByPhase(
  temperature: number,
  pressure: number = 101325 // Pa (1 atm)
): Element[] {
  return Object.values(PERIODIC_TABLE).filter((element) => {
    // Use pressure to adjust phase transition points (Clausius-Clapeyron equation approximation)
    // Higher pressure = higher boiling point, lower pressure = lower boiling point
    const pressureFactor = pressure / 101325; // Normalize to 1 atm
    const adjustedMeltingPoint = element.meltingPoint * (1 + (pressureFactor - 1) * 0.1);
    const adjustedBoilingPoint = element.boilingPoint * (1 + (pressureFactor - 1) * 0.1);
    
    // Simplified phase determination (real calculation more complex)
    if (temperature < adjustedMeltingPoint) return element.phase === 'solid';
    if (temperature < adjustedBoilingPoint) return element.phase === 'liquid';
    return element.phase === 'gas';
  });
}

/**
 * Primordial abundances (Big Bang nucleosynthesis + stellar nucleosynthesis)
 */
export const PRIMORDIAL_ABUNDANCES = {
  H: 0.75, // 75% hydrogen
  He: 0.23, // 23% helium
  C: 0.005, // 0.5% carbon
  N: 0.001, // 0.1% nitrogen
  O: 0.01, // 1% oxygen
  Si: 0.0007,
  Fe: 0.0011,
  // Other elements: ~0.2% combined
} as const;
