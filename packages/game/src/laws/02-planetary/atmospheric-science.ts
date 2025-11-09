/**
 * Atmospheric Science - Composition, pressure, wind patterns
 */

export const AtmosphericComposition = {
  scaleHeight_m: (temp_K: number, molarmass_gmol: number, gravity_ms2: number) => {
    const R = 8.314;
    return (R * temp_K) / ((molarmass_gmol * gravity_ms2) / 1000);
  },

  jeansEscape: (
    M_planet_kg: number,
    R_planet_m: number,
    T_exosphere_K: number,
    m_molecule_kg: number
  ) => {
    const G = 6.6743e-11;
    const k_B = 1.380649e-23;
    const v_esc = Math.sqrt((2 * G * M_planet_kg) / R_planet_m);
    const v_thermal = Math.sqrt((3 * k_B * T_exosphere_K) / m_molecule_kg);
    return v_esc / v_thermal; // > 6 for retention
  },

  pressureAtAltitude: (P0_Pa: number, altitude_m: number, scaleHeight_m: number) => {
    return P0_Pa * Math.exp(-altitude_m / scaleHeight_m);
  },
};

export const WindPatterns = {
  coriolisParameter: (latitude_deg: number, omega_radPerS: number) => {
    return 2 * omega_radPerS * Math.sin((latitude_deg * Math.PI) / 180);
  },

  geostrophicWind_ms: (pressureGradient_PaPerM: number, density_kgm3: number, coriolis: number) => {
    return pressureGradient_PaPerM / (density_kgm3 * coriolis);
  },
};

export const AtmosphericScienceLaws = {
  composition: AtmosphericComposition,
  wind: WindPatterns,
} as const;
