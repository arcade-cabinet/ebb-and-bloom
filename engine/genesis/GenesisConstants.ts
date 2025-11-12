/**
 * Genesis Constants System
 * 
 * @deprecated This monolithic class has been refactored into a modular architecture.
 * Use GenesisFacade instead: `import { GenesisFacade } from './facade/GenesisFacade'`
 * 
 * The new architecture provides:
 * - GenesisFacade: Public API with getter methods
 * - GenesisKernel: Orchestrator with lazy memoization
 * - Modular calculation functions in ./modules/
 * 
 * This file is kept for reference and backward compatibility only.
 * It will be removed in a future version.
 * 
 * PRODUCTION-READY: No stubs, no placeholders, no TODOs.
 */

import { CosmicProvenanceTimeline } from './CosmicProvenanceTimeline';
import { PHYSICS_CONSTANTS } from '../../agents/tables/physics-constants';
import EnhancedRNG from '../utils/EnhancedRNG';

export interface GenesisConstantsData {
  // Cosmic constants
  time_dilation: number;
  entropy_baseline: number;
  expansion_rate: number;
  cosmic_curvature: number;
  
  // Primordial chemistry
  hydrogen_fraction: number;
  helium_fraction: number;
  lithium_fraction: number;
  
  // Cosmic structure
  hubble_expansion_rate: number;
  dark_matter_density: number;
  cmb_temperature: number;
  
  // Stellar evolution
  pop3_imf_slope: number;
  supernova_energy: number;
  iron_peak_yield: number;
  
  // Galactic position
  distance_from_core: number;
  metallicity: number;
  orbital_velocity: number;
  
  // Molecular cloud
  cloud_mass: number;
  dust_to_gas_ratio: number;
  cloud_temperature: number;
  
  // Stellar furnace
  angular_momentum: number;
  stellar_mass: number;
  stellar_luminosity: number;
  
  // Protoplanetary disk
  frost_line_radius: number;
  disk_mass: number;
  temperature_gradient: number;
  
  // Planetary properties
  planet_mass: number;
  planet_radius: number;
  gravity: number;
  orbital_radius: number;
  
  // Internal structure
  core_fraction: number;
  mantle_fraction: number;
  crust_thickness: number;
  magnetic_field: number;
  
  // Surface conditions
  ocean_mass_fraction: number;
  atmospheric_pressure: number;
  atmospheric_composition: Record<string, number>;
  
  // Prebiotic chemistry
  ph_value: number;
  organic_carbon_concentration: number;
  amino_acid_formation_rate: number;
  
  // Solar radiation
  solar_constant: number;
  uv_index: number;
  
  // Volatile delivery
  water_delivery_rate: number;
  volatile_ratios: Record<string, number>;
  
  // Derived physics (for advanced calculations)
  escape_velocity: number;
  hill_sphere: number;
  habitable_zone_inner: number;
  habitable_zone_outer: number;
  tidal_locking_timescale: number;
  surface_temperature: number;
}

interface ValidationWarning {
  parameter: string;
  value: number;
  expectedRange: [number, number];
  severity: 'info' | 'warning' | 'extreme';
  message: string;
}

export class GenesisConstants {
  private timeline: CosmicProvenanceTimeline;
  private constants: GenesisConstantsData;
  private warnings: ValidationWarning[] = [];

  constructor(masterRng: EnhancedRNG) {
    this.timeline = new CosmicProvenanceTimeline(masterRng);
    this.constants = this.calculateAllConstants();
    this.validate();
  }

  private calculateAllConstants(): GenesisConstantsData {
    const raw = this.timeline.getAllConstants();

    // STEP 1: Direct mapping from timeline constants
    const time_dilation = raw.time_dilation_constant || 1.0;
    const entropy_baseline = raw.entropy_baseline || PHYSICS_CONSTANTS.k_B * Math.log(1e120);
    const expansion_rate = raw.hubble_expansion_rate || 67.4;
    const cosmic_curvature = raw.cosmic_curvature || 0.0;
    
    const hydrogen_fraction = raw.hydrogen_fraction || 0.75;
    const helium_fraction = raw.helium_fraction || 0.25;
    const lithium_fraction = raw.lithium_fraction || 1e-10;
    
    const hubble_expansion_rate = raw.hubble_expansion_rate || 67.4;
    const dark_matter_density = raw.dark_matter_density || 0.268;
    const cmb_temperature = raw.cmb_temperature || 2.725;
    
    const pop3_imf_slope = raw.pop3_imf_slope || -2.35;
    const supernova_energy = raw.supernova_energy || 1e44;
    const iron_peak_yield = raw.iron_peak_yield || 0.1 * PHYSICS_CONSTANTS.SOLAR_MASS;
    
    const distance_from_core = raw.distance_from_core || 8000 * 9.461e15;
    const metallicity = raw.metallicity || 0.02;
    const orbital_velocity = raw.orbital_velocity || 220000;
    
    const cloud_mass = raw.molecular_cloud_mass || 1e5 * PHYSICS_CONSTANTS.SOLAR_MASS;
    const dust_to_gas_ratio = raw.dust_fraction || 0.01;
    
    const frost_line_radius = raw.frost_line_radius || 2.7 * PHYSICS_CONSTANTS.AU;
    const disk_mass = raw.disk_mass || 0.01 * PHYSICS_CONSTANTS.SOLAR_MASS;
    
    const planet_mass = raw.terrestrial_planet_mass || PHYSICS_CONSTANTS.EARTH_MASS;
    const orbital_radius = raw.semi_major_axis || PHYSICS_CONSTANTS.AU;
    
    const core_fraction = raw.core_fraction || 0.33;
    const magnetic_field = raw.magnetic_field || 50e-6;
    
    const ocean_mass_fraction = raw.ocean_mass_fraction || 0.0003;
    const atmospheric_pressure = raw.atmospheric_pressure || 101325;
    
    const ph_value = raw.ph_value || 7.0;
    const organic_carbon_concentration = raw.organic_carbon_concentration || 1e-6;

    // STEP 2: Calculate stellar properties
    const stellar_mass = this.calculateStellarMass(disk_mass);
    const stellar_luminosity = this.calculateStellarLuminosity(stellar_mass);
    const stellar_temperature = this.calculateStellarTemperature(stellar_luminosity, stellar_mass);

    // STEP 3: Calculate planetary radius from mass (Earth-like density assumption)
    const planet_radius = this.calculatePlanetRadius(planet_mass, core_fraction);

    // STEP 4: Calculate gravity
    const gravity = this.calculateGravity(planet_mass, planet_radius);

    // STEP 5: Calculate angular momentum
    const angular_momentum = raw.specific_angular_momentum || 
      Math.sqrt(PHYSICS_CONSTANTS.G * stellar_mass * orbital_radius);

    // STEP 6: Calculate cloud temperature (molecular cloud physics)
    const cloud_temperature = this.calculateCloudTemperature(cloud_mass, dust_to_gas_ratio);

    // STEP 7: Calculate temperature gradient in protoplanetary disk
    const temperature_gradient = this.calculateTemperatureGradient(
      stellar_luminosity,
      frost_line_radius
    );

    // STEP 8: Calculate mantle and crust
    const mantle_fraction = this.calculateMantleFraction(core_fraction);
    const crust_thickness = this.calculateCrustThickness(planet_radius, core_fraction);

    // STEP 9: Calculate atmospheric composition
    const atmospheric_composition = this.calculateAtmosphericComposition(
      metallicity,
      planet_mass,
      stellar_temperature,
      orbital_radius
    );

    // STEP 10: Calculate amino acid formation rate
    const amino_acid_formation_rate = this.calculateAminoAcidFormationRate(
      organic_carbon_concentration,
      atmospheric_composition,
      stellar_luminosity,
      orbital_radius
    );

    // STEP 11: Calculate solar constant
    const solar_constant = this.calculateSolarConstant(stellar_luminosity, orbital_radius);

    // STEP 12: Calculate UV index
    const uv_index = this.calculateUVIndex(stellar_temperature, stellar_luminosity, orbital_radius);

    // STEP 13: Calculate water delivery rate
    const water_delivery_rate = this.calculateWaterDeliveryRate(
      ocean_mass_fraction,
      planet_mass,
      frost_line_radius,
      orbital_radius
    );

    // STEP 14: Calculate volatile ratios
    const volatile_ratios = this.calculateVolatileRatios(
      frost_line_radius,
      orbital_radius,
      metallicity
    );

    // STEP 15: Calculate derived physics
    const escape_velocity = this.calculateEscapeVelocity(gravity, planet_radius);
    const hill_sphere = this.calculateHillSphere(orbital_radius, planet_mass, stellar_mass);
    const { inner, outer } = this.calculateHabitableZone(stellar_luminosity);
    const habitable_zone_inner = inner;
    const habitable_zone_outer = outer;
    const tidal_locking_timescale = this.calculateTidalLockingTimescale(
      planet_mass,
      planet_radius,
      orbital_radius,
      stellar_mass
    );
    const surface_temperature = this.calculateSurfaceTemperature(
      solar_constant,
      atmospheric_pressure,
      atmospheric_composition
    );

    return {
      time_dilation,
      entropy_baseline,
      expansion_rate,
      cosmic_curvature,
      
      hydrogen_fraction,
      helium_fraction,
      lithium_fraction,
      
      hubble_expansion_rate,
      dark_matter_density,
      cmb_temperature,
      
      pop3_imf_slope,
      supernova_energy,
      iron_peak_yield,
      
      distance_from_core,
      metallicity,
      orbital_velocity,
      
      cloud_mass,
      dust_to_gas_ratio,
      cloud_temperature,
      
      angular_momentum,
      stellar_mass,
      stellar_luminosity,
      
      frost_line_radius,
      disk_mass,
      temperature_gradient,
      
      planet_mass,
      planet_radius,
      gravity,
      orbital_radius,
      
      core_fraction,
      mantle_fraction,
      crust_thickness,
      magnetic_field,
      
      ocean_mass_fraction,
      atmospheric_pressure,
      atmospheric_composition,
      
      ph_value,
      organic_carbon_concentration,
      amino_acid_formation_rate,
      
      solar_constant,
      uv_index,
      
      water_delivery_rate,
      volatile_ratios,
      
      escape_velocity,
      hill_sphere,
      habitable_zone_inner,
      habitable_zone_outer,
      tidal_locking_timescale,
      surface_temperature,
    };
  }

  // ========== STELLAR CALCULATIONS ==========

  private calculateStellarMass(diskMass: number): number {
    // Stellar mass is typically 100x disk mass (protoplanetary disk is ~1% of star)
    return diskMass * 100;
  }

  private calculateStellarLuminosity(stellarMass: number): number {
    // Main sequence mass-luminosity relation: L ∝ M^3.5
    const massRatio = stellarMass / PHYSICS_CONSTANTS.SOLAR_MASS;
    return PHYSICS_CONSTANTS.SOLAR_LUMINOSITY * Math.pow(massRatio, 3.5);
  }

  private calculateStellarTemperature(luminosity: number, mass: number): number {
    // Stefan-Boltzmann: L = 4πR²σT⁴
    // Main sequence mass-radius: R ∝ M^0.8
    const massRatio = mass / PHYSICS_CONSTANTS.SOLAR_MASS;
    const radius = PHYSICS_CONSTANTS.SOLAR_RADIUS * Math.pow(massRatio, 0.8);
    
    // T = (L / (4πR²σ))^0.25
    const temp4 = luminosity / (4 * Math.PI * radius * radius * PHYSICS_CONSTANTS.σ);
    return Math.pow(temp4, 0.25);
  }

  // ========== PLANETARY CALCULATIONS ==========

  private calculatePlanetRadius(mass: number, coreFraction: number): number {
    // Earth-like density with core variation
    // ρ = ρ_Earth * (1 + 0.2 * (core_fraction - 0.33))
    // Higher core fraction → higher density → smaller radius
    const densityRatio = 1.0 + 0.2 * (coreFraction - 0.33);
    const earthDensity = PHYSICS_CONSTANTS.EARTH_MASS / ((4/3) * Math.PI * Math.pow(PHYSICS_CONSTANTS.EARTH_RADIUS, 3));
    const planetDensity = earthDensity * densityRatio;
    
    // R = (3M / (4πρ))^(1/3)
    return Math.pow((3 * mass) / (4 * Math.PI * planetDensity), 1/3);
  }

  private calculateGravity(mass: number, radius: number): number {
    // g = GM / R²
    return (PHYSICS_CONSTANTS.G * mass) / (radius * radius);
  }

  private calculateEscapeVelocity(gravity: number, radius: number): number {
    // v_esc = sqrt(2 * g * R)
    return Math.sqrt(2 * gravity * radius);
  }

  private calculateHillSphere(orbitalRadius: number, planetMass: number, stellarMass: number): number {
    // R_Hill = a * (M_planet / (3 * M_star))^(1/3)
    return orbitalRadius * Math.pow(planetMass / (3 * stellarMass), 1/3);
  }

  private calculateTidalLockingTimescale(
    _planetMass: number,
    planetRadius: number,
    orbitalRadius: number,
    stellarMass: number
  ): number {
    // Simplified tidal locking timescale (years)
    // t_lock ≈ (ω * a^6 * I * Q) / (3 * G * M_star^2 * k_2 * R^5)
    // Simplified: t ∝ a^6 / (M_star^2 * R^5)
    const years = 365.25 * 24 * 3600;
    const factor = Math.pow(orbitalRadius / PHYSICS_CONSTANTS.AU, 6) / 
                   (Math.pow(stellarMass / PHYSICS_CONSTANTS.SOLAR_MASS, 2) * 
                    Math.pow(planetRadius / PHYSICS_CONSTANTS.EARTH_RADIUS, 5));
    return 1e10 * factor * years;
  }

  // ========== STRUCTURE CALCULATIONS ==========

  private calculateMantleFraction(coreFraction: number): number {
    // Mantle is everything between core and thin crust
    const crustFraction = 0.01; // ~1% of radius
    return 1.0 - coreFraction - crustFraction;
  }

  private calculateCrustThickness(planetRadius: number, _coreFraction: number): number {
    // Crust is typically 0.5-1% of planet radius for terrestrial planets
    // Core fraction has minimal effect on crust thickness
    return planetRadius * 0.01;
  }

  // ========== MOLECULAR CLOUD CALCULATIONS ==========

  private calculateCloudTemperature(_mass: number, dustFraction: number): number {
    // Molecular clouds: T ≈ 10-20 K
    // More dust → better cooling → lower temperature
    const baseTemp = 15.0; // K
    const dustCoolingFactor = 1.0 - 0.3 * Math.min(dustFraction / 0.01, 1.0);
    return baseTemp * dustCoolingFactor;
  }

  // ========== PROTOPLANETARY DISK CALCULATIONS ==========

  private calculateTemperatureGradient(_luminosity: number, frostLineRadius: number): number {
    // dT/dr for protoplanetary disk
    // T(r) = T_0 * (r/r_0)^(-3/7) for passive disk
    // dT/dr = -(3/7) * T(r) / r
    const T_frostline = 170; // K (water freezes)
    const gradient = -(3/7) * T_frostline / frostLineRadius;
    return gradient; // K/m
  }

  // ========== ATMOSPHERIC CALCULATIONS ==========

  private calculateAtmosphericComposition(
    metallicity: number,
    planetMass: number,
    _stellarTemp: number,
    orbitalRadius: number
  ): Record<string, number> {
    // Model atmospheric composition based on metallicity and planet properties
    const massRatio = planetMass / PHYSICS_CONSTANTS.EARTH_MASS;
    const canRetainH2 = massRatio > 2.0; // Larger planets retain H2
    const isHot = orbitalRadius < 0.5 * PHYSICS_CONSTANTS.AU;

    const composition: Record<string, number> = {};

    if (canRetainH2 && !isHot) {
      // Hydrogen-rich atmosphere (like gas giants or super-Earths)
      composition['H2'] = 0.85;
      composition['He'] = 0.13;
      composition['CH4'] = 0.015;
      composition['NH3'] = 0.005;
    } else {
      // Terrestrial atmosphere (Earth-like or Venus-like)
      const highMetallicity = metallicity > 0.015;
      
      if (highMetallicity) {
        // Metal-rich → more outgassing → CO2-rich (Venus-like)
        composition['N2'] = 0.03;
        composition['CO2'] = 0.96;
        composition['Ar'] = 0.01;
      } else {
        // Earth-like atmosphere
        composition['N2'] = 0.78;
        composition['O2'] = 0.21;
        composition['Ar'] = 0.009;
        composition['CO2'] = 0.0004;
        composition['H2O'] = 0.0006;
      }
    }

    return composition;
  }

  // ========== CHEMISTRY CALCULATIONS ==========

  private calculateAminoAcidFormationRate(
    organicCarbon: number,
    atmosphere: Record<string, number>,
    stellarLuminosity: number,
    orbitalRadius: number
  ): number {
    // Miller-Urey-like synthesis rate
    // Rate ∝ organic_carbon * energy_input * reducing_atmosphere_factor
    
    const energyInput = stellarLuminosity / (4 * Math.PI * orbitalRadius * orbitalRadius);
    const energyFactor = energyInput / (PHYSICS_CONSTANTS.SOLAR_LUMINOSITY / (4 * Math.PI * PHYSICS_CONSTANTS.AU * PHYSICS_CONSTANTS.AU));
    
    // Reducing atmosphere (H2, CH4, NH3) enhances formation
    const reducingFactor = 1.0 + 10 * ((atmosphere['H2'] || 0) + (atmosphere['CH4'] || 0) + (atmosphere['NH3'] || 0));
    
    // Base rate: moles/(m³·year)
    return organicCarbon * energyFactor * reducingFactor * 1e-9;
  }

  // ========== RADIATION CALCULATIONS ==========

  private calculateSolarConstant(luminosity: number, orbitalRadius: number): number {
    // Solar constant: S = L / (4πr²)
    return luminosity / (4 * Math.PI * orbitalRadius * orbitalRadius);
  }

  private calculateUVIndex(stellarTemp: number, luminosity: number, orbitalRadius: number): number {
    // UV index based on stellar temperature and distance
    // Hotter stars → more UV
    
    const solarConstant = this.calculateSolarConstant(luminosity, orbitalRadius);
    const earthSolarConstant = 1361; // W/m²
    
    // UV fraction varies with stellar temperature
    // Cooler stars (< 6000K): ~8% UV, Hotter stars (> 6000K): ~15% UV
    const uvFraction = stellarTemp > 6000 ? 0.15 : 0.08;
    
    const uvPower = solarConstant * uvFraction;
    const earthUVPower = earthSolarConstant * 0.08;
    
    // UV index: Earth = 5-11 typical
    return 8 * (uvPower / earthUVPower);
  }

  // ========== VOLATILE DELIVERY CALCULATIONS ==========

  private calculateWaterDeliveryRate(
    oceanFraction: number,
    planetMass: number,
    _frostLineRadius: number,
    _orbitalRadius: number
  ): number {
    // Water delivery rate during late heavy bombardment
    // Total water mass
    const waterMass = oceanFraction * planetMass;
    
    // Delivery timescale: ~100-500 million years
    const deliveryTime = 300e6 * 365.25 * 24 * 3600; // seconds
    
    // Rate: kg/s
    return waterMass / deliveryTime;
  }

  private calculateVolatileRatios(
    frostLineRadius: number,
    orbitalRadius: number,
    metallicity: number
  ): Record<string, number> {
    // Volatile ratios depend on formation location relative to frost line
    const insideFrostLine = orbitalRadius < frostLineRadius;
    
    const ratios: Record<string, number> = {};

    if (insideFrostLine) {
      // Dry formation zone (like Earth)
      ratios['H2O'] = 0.001 * (1 + metallicity / 0.02); // Trace water from asteroids
      ratios['CO2'] = 0.01;
      ratios['N2'] = 0.005;
      ratios['noble_gases'] = 0.0001;
    } else {
      // Beyond frost line (like Europa, Enceladus)
      ratios['H2O'] = 0.50; // Abundant water ice
      ratios['CO2'] = 0.05;
      ratios['CH4'] = 0.03;
      ratios['NH3'] = 0.02;
      ratios['N2'] = 0.01;
      ratios['noble_gases'] = 0.001;
    }

    return ratios;
  }

  // ========== HABITABLE ZONE CALCULATIONS ==========

  private calculateHabitableZone(stellarLuminosity: number): { inner: number; outer: number } {
    // Habitable zone: where liquid water can exist
    // Inner edge: runaway greenhouse (too hot)
    // Outer edge: maximum greenhouse (too cold)
    
    const luminosityRatio = stellarLuminosity / PHYSICS_CONSTANTS.SOLAR_LUMINOSITY;
    
    // Empirical formulas (Kasting et al. 1993)
    const inner = 0.95 * Math.sqrt(luminosityRatio) * PHYSICS_CONSTANTS.AU;
    const outer = 1.37 * Math.sqrt(luminosityRatio) * PHYSICS_CONSTANTS.AU;
    
    return { inner, outer };
  }

  // ========== TEMPERATURE CALCULATIONS ==========

  private calculateSurfaceTemperature(
    solarConstant: number,
    _atmosphericPressure: number,
    atmosphericComposition: Record<string, number>
  ): number {
    // Energy balance: S * (1 - A) / 4 = εσT⁴
    // With greenhouse effect
    
    const albedo = 0.3; // Earth-like albedo
    const emissivity = 0.95;
    
    // Greenhouse effect from CO2 and H2O
    const co2_fraction = atmosphericComposition['CO2'] || 0.0004;
    const h2o_fraction = atmosphericComposition['H2O'] || 0.0006;
    const greenhouseFactor = 1.0 + 0.3 * (co2_fraction / 0.0004) + 0.5 * (h2o_fraction / 0.0006);
    
    // Without greenhouse: T_eff = ((S * (1-A)) / (4 * ε * σ))^0.25
    const T_eff = Math.pow((solarConstant * (1 - albedo)) / (4 * emissivity * PHYSICS_CONSTANTS.σ), 0.25);
    
    // With greenhouse
    return T_eff * Math.pow(greenhouseFactor, 0.25);
  }

  // ========== VALIDATION ==========

  private validate(): void {
    this.warnings = [];

    // Gravity validation
    const earth_g = 9.81;
    if (this.constants.gravity < 0.1 * earth_g || this.constants.gravity > 3.0 * earth_g) {
      this.warnings.push({
        parameter: 'gravity',
        value: this.constants.gravity / earth_g,
        expectedRange: [0.1, 3.0],
        severity: this.constants.gravity < 0.05 * earth_g || this.constants.gravity > 5.0 * earth_g ? 'extreme' : 'warning',
        message: `Gravity is ${(this.constants.gravity / earth_g).toFixed(2)}g. Habitable range is typically 0.1g - 3.0g.`
      });
    }

    // Metallicity validation
    if (this.constants.metallicity < 0.0001 || this.constants.metallicity > 0.03) {
      this.warnings.push({
        parameter: 'metallicity',
        value: this.constants.metallicity,
        expectedRange: [0.0001, 0.03],
        severity: this.constants.metallicity < 0.00001 || this.constants.metallicity > 0.05 ? 'extreme' : 'info',
        message: `Metallicity is ${this.constants.metallicity.toExponential(2)}. Pop III stars: ~0.0001, Galactic center: ~0.03.`
      });
    }

    // Ocean fraction validation
    if (this.constants.ocean_mass_fraction < 0.0 || this.constants.ocean_mass_fraction > 0.9) {
      this.warnings.push({
        parameter: 'ocean_mass_fraction',
        value: this.constants.ocean_mass_fraction,
        expectedRange: [0.0, 0.9],
        severity: 'warning',
        message: `Ocean mass fraction is ${(this.constants.ocean_mass_fraction * 100).toFixed(2)}%. Earth: ~0.03%.`
      });
    }

    // pH validation
    if (this.constants.ph_value < 5.0 || this.constants.ph_value > 9.0) {
      this.warnings.push({
        parameter: 'ph_value',
        value: this.constants.ph_value,
        expectedRange: [5.0, 9.0],
        severity: this.constants.ph_value < 3.0 || this.constants.ph_value > 11.0 ? 'extreme' : 'warning',
        message: `pH is ${this.constants.ph_value.toFixed(2)}. Life-compatible range: 5.0 - 9.0.`
      });
    }

    // Atmospheric pressure validation (in atmospheres)
    const pressure_atm = this.constants.atmospheric_pressure / 101325;
    if (pressure_atm < 0.1 || pressure_atm > 10.0) {
      this.warnings.push({
        parameter: 'atmospheric_pressure',
        value: pressure_atm,
        expectedRange: [0.1, 10.0],
        severity: pressure_atm < 0.01 || pressure_atm > 100 ? 'extreme' : 'warning',
        message: `Atmospheric pressure is ${pressure_atm.toFixed(2)} atm. Habitable range: 0.1 - 10.0 atm.`
      });
    }

    // Habitable zone validation
    if (this.constants.orbital_radius < this.constants.habitable_zone_inner || 
        this.constants.orbital_radius > this.constants.habitable_zone_outer) {
      this.warnings.push({
        parameter: 'orbital_radius',
        value: this.constants.orbital_radius / PHYSICS_CONSTANTS.AU,
        expectedRange: [
          this.constants.habitable_zone_inner / PHYSICS_CONSTANTS.AU,
          this.constants.habitable_zone_outer / PHYSICS_CONSTANTS.AU
        ],
        severity: 'info',
        message: `Planet at ${(this.constants.orbital_radius / PHYSICS_CONSTANTS.AU).toFixed(2)} AU. Habitable zone: ${(this.constants.habitable_zone_inner / PHYSICS_CONSTANTS.AU).toFixed(2)} - ${(this.constants.habitable_zone_outer / PHYSICS_CONSTANTS.AU).toFixed(2)} AU.`
      });
    }
  }

  // ========== PUBLIC GETTERS ==========

  getConstants(): GenesisConstantsData {
    return { ...this.constants };
  }

  getTimeline(): CosmicProvenanceTimeline {
    return this.timeline;
  }

  getGravity(): number {
    return this.constants.gravity;
  }

  getMetallicity(): number {
    return this.constants.metallicity;
  }

  getSolarRadiation(): number {
    return this.constants.solar_constant;
  }

  getAtmosphericComposition(): Record<string, number> {
    return { ...this.constants.atmospheric_composition };
  }

  getVolatileRatios(): Record<string, number> {
    return { ...this.constants.volatile_ratios };
  }

  getOrganicFormationRate(): number {
    return this.constants.amino_acid_formation_rate;
  }

  getSurfaceTemperature(): number {
    return this.constants.surface_temperature;
  }

  getPlanetRadius(): number {
    return this.constants.planet_radius;
  }

  getEscapeVelocity(): number {
    return this.constants.escape_velocity;
  }

  getWarnings(): ValidationWarning[] {
    return [...this.warnings];
  }

  printWarnings(): void {
    if (this.warnings.length === 0) {
      console.log('✅ All constants within expected ranges.');
      return;
    }

    console.log(`⚠️  ${this.warnings.length} validation warning(s):`);
    for (const warning of this.warnings) {
      const icon = warning.severity === 'extreme' ? '🔴' : warning.severity === 'warning' ? '⚠️ ' : 'ℹ️ ';
      console.log(`${icon} ${warning.message}`);
    }
  }
}
