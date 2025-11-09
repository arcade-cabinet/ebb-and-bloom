/**
 * Biochemistry Laws - Molecular basis of life
 */

export const ProteinChemistry = {
  aminoAcidMass: { Gly: 75, Ala: 89, Val: 117, Leu: 131, Ile: 131, Pro: 115 },
  peptideBond_kJmol: 335,
  proteinFolding_kcal: (chainLength: number) => 1.5 * chainLength,
};

export const DNAChemistry = {
  basesMass: { A: 331, T: 322, G: 347, C: 307 },
  hydrogenBondEnergy_kJmol: { AT: 8, GC: 12 },
  meltingTemp: (GC_percent: number) => 273 + 41 * GC_percent + 81.5,
};

export const MetabolicPathways = {
  glycolysis_ATP: 2,
  citricAcycle_ATP: 32,
  efficiency: 0.38,
  glucoseEnergy_kJ: 2870,
  ATPenergy_kJ: 30.5,
};

export const EnzymeKinetics = {
  michaelsMenten: (S: number, Vmax: number, Km: number) => (Vmax * S) / (Km + S),
  Q10: 2.5,
  temperatureEffect: (T_K: number, T_opt: number) => Math.pow(2.5, (T_K - T_opt) / 10),
};

export const BiochemistryLaws = {
  proteins: ProteinChemistry,
  dna: DNAChemistry,
  metabolism: MetabolicPathways,
  enzymes: EnzymeKinetics,
} as const;
