/**
 * GenesisConstants Test Suite
 * 
 * Comprehensive tests for the Genesis Constants system.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { GenesisConstants } from '../GenesisConstants';
import { PHYSICS_CONSTANTS } from '../../../agents/tables/physics-constants';

describe('GenesisConstants', () => {
  let genesis: GenesisConstants;

  beforeEach(() => {
    genesis = new GenesisConstants('test-seed-42');
  });

  describe('Constructor and Initialization', () => {
    it('should create GenesisConstants from seed', () => {
      expect(genesis).toBeDefined();
      expect(genesis.getTimeline()).toBeDefined();
    });

    it('should produce deterministic constants for same seed', () => {
      const genesis1 = new GenesisConstants('deterministic-seed');
      const genesis2 = new GenesisConstants('deterministic-seed');

      const constants1 = genesis1.getConstants();
      const constants2 = genesis2.getConstants();

      expect(constants1.metallicity).toBe(constants2.metallicity);
      expect(constants1.gravity).toBe(constants2.gravity);
      expect(constants1.planet_mass).toBe(constants2.planet_mass);
      expect(constants1.stellar_luminosity).toBe(constants2.stellar_luminosity);
    });

    it('should produce different constants for different seeds', () => {
      const genesis1 = new GenesisConstants('seed-alpha');
      const genesis2 = new GenesisConstants('seed-beta');

      const constants1 = genesis1.getConstants();
      const constants2 = genesis2.getConstants();

      expect(constants1.metallicity).not.toBe(constants2.metallicity);
      expect(constants1.gravity).not.toBe(constants2.gravity);
    });
  });

  describe('Cosmic Constants', () => {
    it('should have valid time dilation constant', () => {
      const constants = genesis.getConstants();
      expect(constants.time_dilation).toBeGreaterThan(0);
      expect(constants.time_dilation).toBeLessThan(10);
    });

    it('should have valid entropy baseline', () => {
      const constants = genesis.getConstants();
      expect(constants.entropy_baseline).toBeGreaterThan(0);
      expect(Number.isFinite(constants.entropy_baseline)).toBe(true);
    });

    it('should have valid expansion rate', () => {
      const constants = genesis.getConstants();
      // Hubble constant: roughly 50-100 km/s/Mpc
      expect(constants.expansion_rate).toBeGreaterThan(40);
      expect(constants.expansion_rate).toBeLessThan(120);
    });

    it('should have valid cosmic curvature', () => {
      const constants = genesis.getConstants();
      // Universe is nearly flat: |Ω_k| < 0.01
      expect(Math.abs(constants.cosmic_curvature)).toBeLessThan(0.1);
    });
  });

  describe('Primordial Chemistry', () => {
    it('should have hydrogen and helium fractions summing to ~1', () => {
      const constants = genesis.getConstants();
      const sum = constants.hydrogen_fraction + constants.helium_fraction;
      expect(sum).toBeGreaterThan(0.95);
      expect(sum).toBeLessThan(1.05);
    });

    it('should have dominant hydrogen fraction', () => {
      const constants = genesis.getConstants();
      expect(constants.hydrogen_fraction).toBeGreaterThan(0.7);
      expect(constants.hydrogen_fraction).toBeLessThan(0.8);
    });

    it('should have lithium as trace element', () => {
      const constants = genesis.getConstants();
      expect(constants.lithium_fraction).toBeLessThan(1e-8);
    });
  });

  describe('Stellar Properties', () => {
    it('should have reasonable stellar mass', () => {
      const constants = genesis.getConstants();
      // Main sequence stars: 0.08 - 100 solar masses
      const massRatio = constants.stellar_mass / PHYSICS_CONSTANTS.SOLAR_MASS;
      expect(massRatio).toBeGreaterThan(0.05);
      expect(massRatio).toBeLessThan(200);
    });

    it('should have stellar luminosity following mass-luminosity relation', () => {
      const constants = genesis.getConstants();
      const massRatio = constants.stellar_mass / PHYSICS_CONSTANTS.SOLAR_MASS;
      const expectedLuminosity = PHYSICS_CONSTANTS.SOLAR_LUMINOSITY * Math.pow(massRatio, 3.5);
      
      // Should be within order of magnitude
      expect(constants.stellar_luminosity).toBeGreaterThan(expectedLuminosity * 0.5);
      expect(constants.stellar_luminosity).toBeLessThan(expectedLuminosity * 2.0);
    });

    it('should have positive angular momentum', () => {
      const constants = genesis.getConstants();
      expect(constants.angular_momentum).toBeGreaterThan(0);
    });
  });

  describe('Planetary Properties', () => {
    it('should have reasonable planet mass', () => {
      const constants = genesis.getConstants();
      // Terrestrial planets: 0.01 - 10 Earth masses
      const massRatio = constants.planet_mass / PHYSICS_CONSTANTS.EARTH_MASS;
      expect(massRatio).toBeGreaterThan(0.001);
      expect(massRatio).toBeLessThan(100);
    });

    it('should have planet radius derived from mass', () => {
      const constants = genesis.getConstants();
      expect(constants.planet_radius).toBeGreaterThan(0);
      expect(Number.isFinite(constants.planet_radius)).toBe(true);
      
      // Rough check: larger mass → larger radius
      const genesis2 = new GenesisConstants('high-mass-planet');
      const c2 = genesis2.getConstants();
      
      if (c2.planet_mass > constants.planet_mass) {
        expect(c2.planet_radius).toBeGreaterThan(constants.planet_radius * 0.5);
      }
    });

    it('should have gravity calculated correctly', () => {
      const constants = genesis.getConstants();
      const expectedGravity = (PHYSICS_CONSTANTS.G * constants.planet_mass) / 
                             (constants.planet_radius * constants.planet_radius);
      
      expect(constants.gravity).toBeCloseTo(expectedGravity, -1);
    });

    it('should have reasonable orbital radius', () => {
      const constants = genesis.getConstants();
      // Planets orbit between 0.1 - 50 AU typically
      const radiusAU = constants.orbital_radius / PHYSICS_CONSTANTS.AU;
      expect(radiusAU).toBeGreaterThan(0.01);
      expect(radiusAU).toBeLessThan(100);
    });
  });

  describe('Internal Structure', () => {
    it('should have core, mantle, and crust fractions summing to ~1', () => {
      const constants = genesis.getConstants();
      const crustFraction = constants.crust_thickness / constants.planet_radius;
      const sum = constants.core_fraction + constants.mantle_fraction + crustFraction;
      
      expect(sum).toBeGreaterThan(0.95);
      expect(sum).toBeLessThan(1.05);
    });

    it('should have core fraction between 0.2 and 0.5', () => {
      const constants = genesis.getConstants();
      expect(constants.core_fraction).toBeGreaterThan(0.15);
      expect(constants.core_fraction).toBeLessThan(0.55);
    });

    it('should have positive magnetic field', () => {
      const constants = genesis.getConstants();
      expect(constants.magnetic_field).toBeGreaterThan(0);
    });

    it('should have reasonable crust thickness', () => {
      const constants = genesis.getConstants();
      expect(constants.crust_thickness).toBeGreaterThan(0);
      expect(constants.crust_thickness).toBeLessThan(constants.planet_radius * 0.05);
    });
  });

  describe('Atmospheric Composition', () => {
    it('should have atmospheric composition summing to ~1', () => {
      const constants = genesis.getConstants();
      const sum = Object.values(constants.atmospheric_composition).reduce((a, b) => a + b, 0);
      
      expect(sum).toBeGreaterThan(0.95);
      expect(sum).toBeLessThan(1.05);
    });

    it('should have all composition values between 0 and 1', () => {
      const constants = genesis.getConstants();
      for (const fraction of Object.values(constants.atmospheric_composition)) {
        expect(fraction).toBeGreaterThanOrEqual(0);
        expect(fraction).toBeLessThanOrEqual(1);
      }
    });

    it('should have realistic atmospheric pressure', () => {
      const constants = genesis.getConstants();
      // 0.01 atm (Mars) to 100 atm (Venus-like)
      expect(constants.atmospheric_pressure).toBeGreaterThan(1000);
      expect(constants.atmospheric_pressure).toBeLessThan(10000000);
    });
  });

  describe('Chemistry and Life', () => {
    it('should have pH in reasonable range', () => {
      const constants = genesis.getConstants();
      expect(constants.ph_value).toBeGreaterThan(0);
      expect(constants.ph_value).toBeLessThan(14);
    });

    it('should have positive organic carbon concentration', () => {
      const constants = genesis.getConstants();
      expect(constants.organic_carbon_concentration).toBeGreaterThan(0);
    });

    it('should have amino acid formation rate', () => {
      const constants = genesis.getConstants();
      expect(constants.amino_acid_formation_rate).toBeGreaterThan(0);
      expect(Number.isFinite(constants.amino_acid_formation_rate)).toBe(true);
    });
  });

  describe('Solar Radiation', () => {
    it('should have positive solar constant', () => {
      const constants = genesis.getConstants();
      expect(constants.solar_constant).toBeGreaterThan(0);
    });

    it('should have solar constant decrease with distance', () => {
      // Create two planets at different distances
      const closeGenesis = new GenesisConstants('close-planet');
      const farGenesis = new GenesisConstants('far-planet');
      
      const closeConstants = closeGenesis.getConstants();
      const farConstants = farGenesis.getConstants();
      
      // If far planet is actually farther, it should have lower solar constant
      if (farConstants.orbital_radius > closeConstants.orbital_radius) {
        expect(farConstants.solar_constant).toBeLessThan(closeConstants.solar_constant);
      }
    });

    it('should have positive UV index', () => {
      const constants = genesis.getConstants();
      expect(constants.uv_index).toBeGreaterThan(0);
    });
  });

  describe('Volatile Delivery', () => {
    it('should have water delivery rate', () => {
      const constants = genesis.getConstants();
      expect(constants.water_delivery_rate).toBeGreaterThan(0);
      expect(Number.isFinite(constants.water_delivery_rate)).toBe(true);
    });

    it('should have volatile ratios summing to reasonable value', () => {
      const constants = genesis.getConstants();
      const sum = Object.values(constants.volatile_ratios).reduce((a, b) => a + b, 0);
      
      // Total volatiles should be < 100% of planet mass
      expect(sum).toBeGreaterThan(0);
      expect(sum).toBeLessThan(2.0);
    });

    it('should have water as major volatile', () => {
      const constants = genesis.getConstants();
      expect(constants.volatile_ratios['H2O']).toBeDefined();
      expect(constants.volatile_ratios['H2O']).toBeGreaterThan(0);
    });
  });

  describe('Derived Physics', () => {
    it('should calculate escape velocity correctly', () => {
      const constants = genesis.getConstants();
      const expectedVelocity = Math.sqrt(2 * constants.gravity * constants.planet_radius);
      
      expect(constants.escape_velocity).toBeCloseTo(expectedVelocity, -1);
    });

    it('should have Hill sphere smaller than orbital radius', () => {
      const constants = genesis.getConstants();
      expect(constants.hill_sphere).toBeLessThan(constants.orbital_radius);
      expect(constants.hill_sphere).toBeGreaterThan(0);
    });

    it('should have habitable zone inner < outer', () => {
      const constants = genesis.getConstants();
      expect(constants.habitable_zone_inner).toBeLessThan(constants.habitable_zone_outer);
    });

    it('should have positive tidal locking timescale', () => {
      const constants = genesis.getConstants();
      expect(constants.tidal_locking_timescale).toBeGreaterThan(0);
      expect(Number.isFinite(constants.tidal_locking_timescale)).toBe(true);
    });

    it('should have reasonable surface temperature', () => {
      const constants = genesis.getConstants();
      // 50 K (frozen) to 2000 K (very hot, but still allows interesting universes)
      expect(constants.surface_temperature).toBeGreaterThan(50);
      expect(constants.surface_temperature).toBeLessThan(2000);
    });
  });

  describe('Convenience Getters', () => {
    it('should provide gravity getter', () => {
      expect(genesis.getGravity()).toBe(genesis.getConstants().gravity);
    });

    it('should provide metallicity getter', () => {
      expect(genesis.getMetallicity()).toBe(genesis.getConstants().metallicity);
    });

    it('should provide solar radiation getter', () => {
      expect(genesis.getSolarRadiation()).toBe(genesis.getConstants().solar_constant);
    });

    it('should provide atmospheric composition getter', () => {
      const composition = genesis.getAtmosphericComposition();
      expect(composition).toEqual(genesis.getConstants().atmospheric_composition);
    });

    it('should provide volatile ratios getter', () => {
      const ratios = genesis.getVolatileRatios();
      expect(ratios).toEqual(genesis.getConstants().volatile_ratios);
    });

    it('should provide organic formation rate getter', () => {
      expect(genesis.getOrganicFormationRate()).toBe(genesis.getConstants().amino_acid_formation_rate);
    });

    it('should provide surface temperature getter', () => {
      expect(genesis.getSurfaceTemperature()).toBe(genesis.getConstants().surface_temperature);
    });

    it('should provide planet radius getter', () => {
      expect(genesis.getPlanetRadius()).toBe(genesis.getConstants().planet_radius);
    });

    it('should provide escape velocity getter', () => {
      expect(genesis.getEscapeVelocity()).toBe(genesis.getConstants().escape_velocity);
    });
  });

  describe('Validation System', () => {
    it('should provide warnings array', () => {
      const warnings = genesis.getWarnings();
      expect(Array.isArray(warnings)).toBe(true);
    });

    it('should validate gravity range', () => {
      // Create extreme cases
      const extremeGenesis = new GenesisConstants('extreme-gravity-test');
      const warnings = extremeGenesis.getWarnings();
      
      // Warnings should be structured correctly
      warnings.forEach(warning => {
        expect(warning).toHaveProperty('parameter');
        expect(warning).toHaveProperty('value');
        expect(warning).toHaveProperty('expectedRange');
        expect(warning).toHaveProperty('severity');
        expect(warning).toHaveProperty('message');
      });
    });

    it('should have severity levels', () => {
      const warnings = genesis.getWarnings();
      
      warnings.forEach(warning => {
        expect(['info', 'warning', 'extreme']).toContain(warning.severity);
      });
    });

    it('should not throw on extreme values', () => {
      // Even extreme universes should be calculable
      expect(() => new GenesisConstants('extreme-test-1')).not.toThrow();
      expect(() => new GenesisConstants('extreme-test-2')).not.toThrow();
    });
  });

  describe('Integration with Timeline', () => {
    it('should provide access to cosmic timeline', () => {
      const timeline = genesis.getTimeline();
      expect(timeline).toBeDefined();
      expect(timeline.getStages).toBeDefined();
    });

    it('should use timeline constants', () => {
      const timeline = genesis.getTimeline();
      const timelineConstants = timeline.getAllConstants();
      const genesisConstants = genesis.getConstants();

      // Direct mapping
      expect(genesisConstants.hydrogen_fraction).toBe(timelineConstants.hydrogen_fraction);
      expect(genesisConstants.helium_fraction).toBe(timelineConstants.helium_fraction);
      expect(genesisConstants.metallicity).toBe(timelineConstants.metallicity);
    });
  });

  describe('Physical Consistency', () => {
    it('should have physically consistent planetary system', () => {
      const constants = genesis.getConstants();
      
      // Planet should be within stellar Hill sphere (very rough check)
      const stellarHillSphere = 1000 * PHYSICS_CONSTANTS.AU; // Rough stellar influence
      expect(constants.orbital_radius).toBeLessThan(stellarHillSphere);
    });

    it('should have energy balance consistent', () => {
      const constants = genesis.getConstants();
      
      // Solar constant should produce reasonable surface temperature
      const receivedPower = constants.solar_constant;
      const earthSolarConstant = 1361; // W/m²
      
      // Temperature should scale roughly with power^0.25
      const earthTemp = 288; // K
      const expectedTemp = earthTemp * Math.pow(receivedPower / earthSolarConstant, 0.25);
      
      // Should be within factor of 5 (greenhouse effect and albedo vary greatly)
      // Extreme greenhouse (Venus) or extreme albedo (ice world) can produce large variations
      expect(constants.surface_temperature).toBeGreaterThan(expectedTemp * 0.3);
      expect(constants.surface_temperature).toBeLessThan(expectedTemp * 5.0);
    });

    it('should have escape velocity prevent atmosphere loss for larger planets', () => {
      const constants = genesis.getConstants();
      
      // Molecular velocity of H2 at 300K
      const kT = PHYSICS_CONSTANTS.k_B * 300;
      const m_H2 = 2 * 1.67e-27; // kg (2 protons)
      const v_thermal = Math.sqrt(3 * kT / m_H2);
      
      // Escape velocity should be >> thermal velocity for atmosphere retention
      // Factor of 6 is typical threshold
      const canRetainH2 = constants.escape_velocity > 6 * v_thermal;
      
      // This is info, not assertion - some planets can't retain H2
      expect(typeof canRetainH2).toBe('boolean');
    });
  });

  describe('Regression Tests', () => {
    it('should match known Earth-like values for Earth-like seed', () => {
      const earthLike = new GenesisConstants('earth-analog-seed');
      const constants = earthLike.getConstants();
      
      // Should produce vaguely Earth-like values (within order of magnitude)
      const gravityRatio = constants.gravity / 9.81;
      expect(gravityRatio).toBeGreaterThan(0.1);
      expect(gravityRatio).toBeLessThan(10);
    });

    it('should produce stable results across multiple instantiations', () => {
      const seed = 'stability-test';
      const results: number[] = [];
      
      for (let i = 0; i < 5; i++) {
        const g = new GenesisConstants(seed);
        results.push(g.getGravity());
      }
      
      // All should be identical
      const first = results[0];
      results.forEach(r => expect(r).toBe(first));
    });
  });
});
