/**
 * Epidemiology Laws
 * Disease spread, SIR models, herd immunity, R₀.
 * Kermack-McKendrick and modern epidemiology.
 */

export const SIRModel = {
  dS_dt: (S: number, I: number, N: number, beta: number): number => {
    return (-beta * S * I) / N;
  },

  dI_dt: (S: number, I: number, N: number, beta: number, gamma: number): number => {
    return (beta * S * I) / N - gamma * I;
  },

  dR_dt: (I: number, gamma: number): number => {
    return gamma * I;
  },

  basicReproductionNumber: (beta: number, gamma: number): number => {
    return beta / gamma; // R₀
  },

  herdImmunityThreshold: (R0: number): number => {
    return 1 - 1 / R0; // Fraction needing immunity
  },

  epidemicPeak: (S0: number, I0: number, R0_value: number): number => {
    return S0 - (1 / R0_value) * (1 + Math.log(S0 * R0_value));
  },
};

export const TransmissionDynamics = {
  contactRate: (populationDensity_perkm2: number, socialMixing: number): number => {
    return Math.sqrt(populationDensity_perkm2) * socialMixing;
  },

  transmissionProbability: (contactDuration_min: number, viralLoad: number): number => {
    return 1 - Math.exp(-0.01 * contactDuration_min * viralLoad);
  },

  infectiousPeriod_days: (recoveryRate: number): number => {
    return 1 / recoveryRate;
  },
};

export const EpidemiologyLaws = {
  SIR: SIRModel,
  transmission: TransmissionDynamics,
} as const;
