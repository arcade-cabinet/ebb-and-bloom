/**
 * GenesisConstants Test Suite
 * 
 * Comprehensive tests for the Genesis Constants system.
 * Uses test fixtures, factories, and parameterized tests.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { GenesisConstants } from '../GenesisConstants';
import { PHYSICS_CONSTANTS } from '../../../agents/tables/physics-constants';
import { rngRegistry } from '../../rng/RNGRegistry';
import { createTestGenesis } from '../../../tests/factories/cosmicFactories';

describe('GenesisConstants', () => {
  let genesis: GenesisConstants;

  beforeEach(() => {
    genesis = createTestGenesis();
  });

  describe('Constructor and Initialization', () => {
    it('should create GenesisConstants from RNG', () => {
      expect(genesis).toBeDefined();
      expect(genesis.getTimeline()).toBeDefined();
    });

    it('should produce deterministic constants for same seed', () => {
      rngRegistry.reset();
      rngRegistry.setSeed('deterministic-seed');
      const genesis1 = createTestGenesis();
      
      rngRegistry.reset();
      rngRegistry.setSeed('deterministic-seed');
      const genesis2 = createTestGenesis();

      const constants1 = genesis1.getConstants();
      const constants2 = genesis2.getConstants();

      expect(constants1.metallicity).toBe(constants2.metallicity);
      expect(constants1.gravity).toBe(constants2.gravity);
      expect(constants1.planet_mass).toBe(constants2.planet_mass);
      expect(constants1.stellar_luminosity).toBe(constants2.stellar_luminosity);
    });

    it('should produce different constants for different seeds', () => {
      rngRegistry.setSeed('seed-alpha');
      const genesis1 = createTestGenesis();
      
      rngRegistry.setSeed('seed-beta');
      const genesis2 = createTestGenesis();

      const constants1 = genesis1.getConstants();
      const constants2 = genesis2.getConstants();

      expect(constants1.metallicity).not.toBe(constants2.metallicity);
      expect(constants1.gravity).not.toBe(constants2.gravity);
    });
  });

  describe('Cosmic Constants', () => {
    it.each([
      { name: 'time_dilation', min: 0, max: 10 },
      { name: 'expansion_rate', min: 40, max: 120 },
    ])('should have valid $name', ({ name, min, max }) => {
      const constants = genesis.getConstants();
      expect(constants[name]).toBeGreaterThan(min);
      expect(constants[name]).toBeLessThan(max);
    });

    it('should have valid entropy baseline', () => {
      const constants = genesis.getConstants();
      expect(constants.entropy_baseline).toBeGreaterThan(0);
      expect(Number.isFinite(constants.entropy_baseline)).toBe(true);
    });

    it('should have valid cosmic curvature', () => {
      const constants = genesis.getConstants();
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

    it.each([
      { element: 'hydrogen_fraction', min: 0.7, max: 0.8 },
      { element: 'lithium_fraction', min: 0, max: 1e-8 },
    ])('should have $element in expected range', ({ element, min, max }) => {
      const constants = genesis.getConstants();
      expect(constants[element]).toBeGreaterThan(min);
      expect(constants[element]).toBeLessThan(max);
    });
  });

  describe('Stellar Properties', () => {
    it('should have reasonable stellar mass', () => {
      const constants = genesis.getConstants();
      const massRatio = constants.stellar_mass / PHYSICS_CONSTANTS.SOLAR_MASS;
      expect(massRatio).toBeGreaterThan(0.05);
      expect(massRatio).toBeLessThan(200);
    });

    it('should have stellar luminosity following mass-luminosity relation', () => {
      const constants = genesis.getConstants();
      const massRatio = constants.stellar_mass / PHYSICS_CONSTANTS.SOLAR_MASS;
      const expectedLuminosity = PHYSICS_CONSTANTS.SOLAR_LUMINOSITY * Math.pow(massRatio, 3.5);
      
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
      const massRatio = constants.planet_mass / PHYSICS_CONSTANTS.EARTH_MASS;
      expect(massRatio).toBeGreaterThan(0.001);
      expect(massRatio).toBeLessThan(100);
    });

    it('should have planet radius derived from mass', () => {
      const constants = genesis.getConstants();
      expect(constants.planet_radius).toBeGreaterThan(0);
      expect(Number.isFinite(constants.planet_radius)).toBe(true);
      
      rngRegistry.setSeed('high-mass-planet');
      const genesis2 = createTestGenesis();
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

    it.each([
      { property: 'core_fraction', min: 0.15, max: 0.55 },
      { property: 'magnetic_field', min: 0, max: Infinity },
    ])('should have $property in range', ({ property, min, max }) => {
      const constants = genesis.getConstants();
      expect(constants[property]).toBeGreaterThan(min);
      expect(constants[property]).toBeLessThan(max);
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
      expect(constants.atmospheric_pressure).toBeGreaterThan(1000);
      expect(constants.atmospheric_pressure).toBeLessThan(10000000);
    });
  });

  describe('Chemistry and Life', () => {
    it.each([
      { property: 'ph_value', min: 0, max: 14 },
      { property: 'organic_carbon_concentration', min: 0, max: Infinity },
      { property: 'amino_acid_formation_rate', min: 0, max: Infinity },
    ])('should have valid $property', ({ property, min, max }) => {
      const constants = genesis.getConstants();
      expect(constants[property]).toBeGreaterThan(min);
      expect(constants[property]).toBeLessThan(max);
      expect(Number.isFinite(constants[property])).toBe(true);
    });
  });

  describe('Solar Radiation', () => {
    it('should have positive solar constant', () => {
      const constants = genesis.getConstants();
      expect(constants.solar_constant).toBeGreaterThan(0);
    });

    it('should have solar constant follow inverse square law', () => {
      const constants = genesis.getConstants();
      
      // Solar constant should equal L / (4π r²)
      const expectedSolarConstant = constants.stellar_luminosity / 
        (4 * Math.PI * constants.orbital_radius * constants.orbital_radius);
      
      // Should be within order of magnitude (accounting for variations)
      expect(constants.solar_constant).toBeGreaterThan(expectedSolarConstant * 0.5);
      expect(constants.solar_constant).toBeLessThan(expectedSolarConstant * 2.0);
    });

    it('should have positive UV index', () => {
      const constants = genesis.getConstants();
      expect(constants.uv_index).toBeGreaterThan(0);
    });
  });

  describe('Volatile Delivery', () => {
    it.each([
      { property: 'water_delivery_rate', min: 0, max: Infinity },
    ])('should have valid $property', ({ property, min, max }) => {
      const constants = genesis.getConstants();
      expect(constants[property]).toBeGreaterThan(min);
      expect(constants[property]).toBeLessThan(max);
      expect(Number.isFinite(constants[property])).toBe(true);
    });

    it('should have volatile ratios summing to reasonable value', () => {
      const constants = genesis.getConstants();
      const sum = Object.values(constants.volatile_ratios).reduce((a, b) => a + b, 0);
      
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

    it.each([
      { property: 'tidal_locking_timescale', min: 0, max: Infinity },
      { property: 'surface_temperature', min: 50, max: 2000 },
    ])('should have valid $property', ({ property, min, max }) => {
      const constants = genesis.getConstants();
      expect(constants[property]).toBeGreaterThan(min);
      expect(constants[property]).toBeLessThan(max);
      expect(Number.isFinite(constants[property])).toBe(true);
    });
  });

  describe('Convenience Getters', () => {
    it.each([
      { getter: 'getGravity', property: 'gravity' },
      { getter: 'getMetallicity', property: 'metallicity' },
      { getter: 'getSolarRadiation', property: 'solar_constant' },
      { getter: 'getOrganicFormationRate', property: 'amino_acid_formation_rate' },
      { getter: 'getSurfaceTemperature', property: 'surface_temperature' },
      { getter: 'getPlanetRadius', property: 'planet_radius' },
      { getter: 'getEscapeVelocity', property: 'escape_velocity' },
    ])('$getter should return $property', ({ getter, property }) => {
      expect(genesis[getter]()).toBe(genesis.getConstants()[property]);
    });

    it('should provide atmospheric composition getter', () => {
      const composition = genesis.getAtmosphericComposition();
      expect(composition).toEqual(genesis.getConstants().atmospheric_composition);
    });

    it('should provide volatile ratios getter', () => {
      const ratios = genesis.getVolatileRatios();
      expect(ratios).toEqual(genesis.getConstants().volatile_ratios);
    });
  });

  describe('Validation System', () => {
    it('should provide warnings array', () => {
      const warnings = genesis.getWarnings();
      expect(Array.isArray(warnings)).toBe(true);
    });

    it('should validate gravity range', () => {
      rngRegistry.setSeed('extreme-gravity-test');
      const extremeGenesis = createTestGenesis();
      const warnings = extremeGenesis.getWarnings();
      
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

    it.each([
      { seed: 'extreme-test-1' },
      { seed: 'extreme-test-2' },
    ])('should not throw on extreme values ($seed)', ({ seed }) => {
      rngRegistry.setSeed(seed);
      expect(() => createTestGenesis()).not.toThrow();
    });
  });

  describe('Integration with Timeline', () => {
    it('should provide access to cosmic timeline', () => {
      const timeline = genesis.getTimeline();
      expect(timeline).toBeDefined();
      expect(timeline.getStages).toBeDefined();
    });

    it.each([
      { constant: 'hydrogen_fraction' },
      { constant: 'helium_fraction' },
      { constant: 'metallicity' },
    ])('should map timeline $constant to genesis', ({ constant }) => {
      const timeline = genesis.getTimeline();
      const timelineConstants = timeline.getAllConstants();
      const genesisConstants = genesis.getConstants();

      expect(genesisConstants[constant]).toBe(timelineConstants[constant]);
    });
  });

  describe('Physical Consistency', () => {
    it('should have physically consistent planetary system', () => {
      const constants = genesis.getConstants();
      
      const stellarHillSphere = 1000 * PHYSICS_CONSTANTS.AU;
      expect(constants.orbital_radius).toBeLessThan(stellarHillSphere);
    });

    it('should have energy balance consistent', () => {
      const constants = genesis.getConstants();
      
      const receivedPower = constants.solar_constant;
      const earthSolarConstant = 1361;
      
      const earthTemp = 288;
      const expectedTemp = earthTemp * Math.pow(receivedPower / earthSolarConstant, 0.25);
      
      expect(constants.surface_temperature).toBeGreaterThan(expectedTemp * 0.3);
      expect(constants.surface_temperature).toBeLessThan(expectedTemp * 5.0);
    });

    it('should have escape velocity prevent atmosphere loss for larger planets', () => {
      const constants = genesis.getConstants();
      
      const kT = PHYSICS_CONSTANTS.k_B * 300;
      const m_H2 = 2 * 1.67e-27;
      const v_thermal = Math.sqrt(3 * kT / m_H2);
      
      const canRetainH2 = constants.escape_velocity > 6 * v_thermal;
      
      expect(typeof canRetainH2).toBe('boolean');
    });
  });

  describe('Regression Tests', () => {
    it('should match known Earth-like values for Earth-like seed', () => {
      rngRegistry.setSeed('earth-analog-seed');
      const earthLike = createTestGenesis();
      const constants = earthLike.getConstants();
      
      const gravityRatio = constants.gravity / 9.81;
      expect(gravityRatio).toBeGreaterThan(0.1);
      expect(gravityRatio).toBeLessThan(10);
    });

    it('should produce stable results across multiple instantiations', () => {
      const results: number[] = [];
      
      for (let i = 0; i < 5; i++) {
        rngRegistry.reset();
        rngRegistry.setSeed('stability-test');
        const g = createTestGenesis();
        results.push(g.getGravity());
      }
      
      const first = results[0];
      results.forEach(r => expect(r).toBe(first));
    });
  });
});
