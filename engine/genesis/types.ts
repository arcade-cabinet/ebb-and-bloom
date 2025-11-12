export interface CosmicProfile {
  time_dilation: number;
  entropy_baseline: number;
  expansion_rate: number;
  cosmic_curvature: number;
  hydrogen_fraction: number;
  helium_fraction: number;
  lithium_fraction: number;
  hubble_expansion_rate: number;
  dark_matter_density: number;
  cmb_temperature: number;
  pop3_imf_slope: number;
  supernova_energy: number;
  iron_peak_yield: number;
  distance_from_core: number;
  metallicity: number;
  orbital_velocity: number;
  cloud_mass: number;
  dust_to_gas_ratio: number;
  cloud_temperature: number;
}

export interface StellarProfile {
  angular_momentum: number;
  stellar_mass: number;
  stellar_luminosity: number;
  stellar_temperature: number;
  frost_line_radius: number;
  disk_mass: number;
  temperature_gradient: number;
}

export interface PlanetaryProfile {
  planet_mass: number;
  planet_radius: number;
  gravity: number;
  orbital_radius: number;
  core_fraction: number;
  mantle_fraction: number;
  crust_thickness: number;
  magnetic_field: number;
}

export interface AtmosphericProfile {
  ocean_mass_fraction: number;
  atmospheric_pressure: number;
  atmospheric_composition: Record<string, number>;
  water_delivery_rate: number;
  volatile_ratios: Record<string, number>;
}

export interface ChemistryProfile {
  ph_value: number;
  organic_carbon_concentration: number;
  amino_acid_formation_rate: number;
  solar_constant: number;
  uv_index: number;
}

export interface DerivedProfile {
  escape_velocity: number;
  hill_sphere: number;
  habitable_zone_inner: number;
  habitable_zone_outer: number;
  tidal_locking_timescale: number;
  surface_temperature: number;
}

export interface GenesisConstantsData {
  cosmic: CosmicProfile;
  stellar: StellarProfile;
  planetary: PlanetaryProfile;
  atmospheric: AtmosphericProfile;
  chemistry: ChemistryProfile;
  derived: DerivedProfile;
}
