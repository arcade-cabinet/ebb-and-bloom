/**
 * Quantum Mechanics (Basics)
 * 
 * Why atoms have the properties they do.
 * Electron configurations, bonding, conductivity.
 * 
 * NOT full QM (too complex), but key results that affect macroscopic properties.
 */

export const ElectronConfiguration = {
  /**
   * Electron shells and subshells
   * 1s, 2s, 2p, 3s, 3p, 3d, 4s, etc.
   */
  shellOrder: ['1s', '2s', '2p', '3s', '3p', '4s', '3d', '4p', '5s', '4d', '5p', '6s', '4f', '5d', '6p'],
  shellCapacity: { s: 2, p: 6, d: 10, f: 14 },
  
  /**
   * Valence electrons (determines bonding)
   */
  valenceElectrons: (atomicNumber: number): number => {
    // Simplified - use periodic table position
    const period = Math.ceil(atomicNumber / 8);
    return ((atomicNumber - 1) % 8) + 1;
  },
  
  /**
   * Is metal? (based on electron configuration)
   * Metals: Few valence electrons, easily lost
   */
  isMetal: (atomicNumber: number): boolean => {
    const valence = ElectronConfiguration.valenceElectrons(atomicNumber);
    return valence <= 3; // 1-3 valence = metal
  },
};

export const ChemicalBonding = {
  /**
   * Bond type from electronegativity difference
   * 
   * ΔEN < 0.5: Covalent (share electrons)
   * 0.5 < ΔEN < 1.7: Polar covalent
   * ΔEN > 1.7: Ionic (transfer electrons)
   */
  bondType: (electronegativity1: number, electronegativity2: number): string => {
    const delta = Math.abs(electronegativity1 - electronegativity2);
    if (delta < 0.5) return 'covalent';
    if (delta < 1.7) return 'polar-covalent';
    return 'ionic';
  },
  
  /**
   * Bond strength from orbital overlap
   * Single < Double < Triple
   */
  bondEnergy_kJmol: (bondType: string, bondOrder: number): number => {
    const base = {
      'C-C': 346,
      'C-H': 413,
      'C-O': 358,
      'C-N': 305,
      'O-H': 467,
      'N-H': 391,
    }[bondType] || 300;
    
    return base * bondOrder; // 1, 2, or 3
  },
};

export const BandTheory = {
  /**
   * Band gap - Energy difference between valence and conduction bands
   * 
   * No gap: Metal (conductor)
   * Small gap: Semiconductor
   * Large gap: Insulator
   */
  bandGap_eV: (material: string): number => {
    const gaps: Record<string, number> = {
      // Metals (no gap)
      Fe: 0,
      Cu: 0,
      Au: 0,
      
      // Semiconductors
      Si: 1.1,
      Ge: 0.7,
      GaAs: 1.4,
      
      // Insulators
      SiO2: 9, // Quartz
      diamond: 5.5, // Wide gap!
      NaCl: 8.5,
    };
    return gaps[material] || 5; // Default: insulator
  },
  
  /**
   * Electrical conductivity from band gap
   * σ ∝ exp(-E_g / 2kT)
   */
  conductivity_Sm: (bandGap_eV: number, temperature_K: number): number => {
    if (bandGap_eV === 0) return 1e7; // Metal (high)
    
    const k_B = 8.617e-5; // eV/K
    const exponent = -bandGap_eV / (2 * k_B * temperature_K);
    
    return 1e-10 * Math.exp(exponent); // Semiconductor/insulator
  },
  
  /**
   * Why diamond is transparent but graphite is opaque?
   * Wide band gap = no absorption of visible light = transparent
   */
  isTransparent: (bandGap_eV: number): boolean => {
    const visiblePhotonEnergy = 2.5; // eV (average visible light)
    return bandGap_eV > visiblePhotonEnergy;
  },
};

export const QuantumEffects = {
  /**
   * Quantum tunneling rate
   * Affects radioactive decay, chemical reactions
   */
  tunnelingProbability: (barrierHeight_eV: number, barrierWidth_nm: number): number => {
    const hbar = 1.054e-34; // J·s
    const m = 9.109e-31; // electron mass kg
    const E = barrierHeight_eV * 1.602e-19; // Convert to Joules
    
    const kappa = Math.sqrt(2 * m * E) / hbar;
    const transmission = Math.exp(-2 * kappa * barrierWidth_nm * 1e-9);
    
    return transmission;
  },
  
  /**
   * Zero-point energy
   * Even at absolute zero, quantum systems have energy
   */
  zeroPointEnergy_J: (frequency_Hz: number): number => {
    const h = 6.626e-34; // J·s
    return 0.5 * h * frequency_Hz;
  },
};

export const QuantumLaws = {
  electrons: ElectronConfiguration,
  bonding: ChemicalBonding,
  bandTheory: BandTheory,
  quantumEffects: QuantumEffects,
} as const;

