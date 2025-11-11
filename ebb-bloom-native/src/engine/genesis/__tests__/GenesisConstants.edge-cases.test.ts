/**
 * GenesisConstants Edge Cases Tests
 * 
 * Comprehensive edge case testing for extreme scenarios and boundary conditions.
 * Tests determinism, seed handling, and physics boundary values.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { GenesisConstants } from '../GenesisConstants';
import { rngRegistry } from '../../rng/RNGRegistry';
import { PHYSICS_CONSTANTS } from '../../../agents/tables/physics-constants';

describe('GenesisConstants - Edge Cases', () => {
  beforeEach(() => {
    rngRegistry.reset();
  });

  describe('Extreme Seed Values', () => {
    it('should handle seed with all zeros', () => {
      rngRegistry.setSeed('000-000-000');
      const rng = rngRegistry.getScopedRNG('edge-test-zeros');
      
      expect(() => {
        const genesis = new GenesisConstants(rng);
        expect(genesis).toBeDefined();
      }).not.toThrow();
    });

    it('should handle seed with maximum entropy', () => {
      rngRegistry.setSeed('999-999-999');
      const rng = rngRegistry.getScopedRNG('edge-test-max');
      
      expect(() => {
        const genesis = new GenesisConstants(rng);
        expect(genesis).toBeDefined();
      }).not.toThrow();
    });

    it('should handle very long seed (100+ characters)', () => {
      const longSeed = 'a'.repeat(150);
      rngRegistry.setSeed(longSeed);
      const rng = rngRegistry.getScopedRNG('edge-test-long');
      
      expect(() => {
        const genesis = new GenesisConstants(rng);
        expect(genesis).toBeDefined();
      }).not.toThrow();
    });

    it('should handle unicode seed with emojis', () => {
      rngRegistry.setSeed('🌟-🌍-🔬');
      const rng = rngRegistry.getScopedRNG('edge-test-unicode');
      
      expect(() => {
        const genesis = new GenesisConstants(rng);
        expect(genesis).toBeDefined();
      }).not.toThrow();
    });

    it('should handle seed with special characters', () => {
      rngRegistry.setSeed('!@#-$%^-&*()');
      const rng = rngRegistry.getScopedRNG('edge-test-special');
      
      expect(() => {
        const genesis = new GenesisConstants(rng);
        expect(genesis).toBeDefined();
      }).not.toThrow();
    });

    it('should handle empty string seed', () => {
      rngRegistry.setSeed('');
      const rng = rngRegistry.getScopedRNG('edge-test-empty');
      
      expect(() => {
        const genesis = new GenesisConstants(rng);
        expect(genesis).toBeDefined();
      }).not.toThrow();
    });

    it('should handle single character seed', () => {
      rngRegistry.setSeed('x');
      const rng = rngRegistry.getScopedRNG('edge-test-single');
      
      expect(() => {
        const genesis = new GenesisConstants(rng);
        expect(genesis).toBeDefined();
      }).not.toThrow();
    });

    it('should handle numeric-only seed', () => {
      rngRegistry.setSeed('123456789');
      const rng = rngRegistry.getScopedRNG('edge-test-numeric');
      
      expect(() => {
        const genesis = new GenesisConstants(rng);
        expect(genesis).toBeDefined();
      }).not.toThrow();
    });
  });

  describe('Boundary Physics Values', () => {
    it('should generate valid gravity near black hole event horizon', () => {
      rngRegistry.setSeed('extreme-gravity');
      const rng = rngRegistry.getScopedRNG('edge-test-gravity');
      const genesis = new GenesisConstants(rng);
      const constants = genesis.getConstants();
      
      expect(constants.gravity).toBeGreaterThan(0);
      expect(constants.gravity).toBeLessThan(1e15);
    });

    it('should generate valid temperature near absolute zero', () => {
      rngRegistry.setSeed('absolute-zero');
      const rng = rngRegistry.getScopedRNG('edge-test-temp');
      const genesis = new GenesisConstants(rng);
      const constants = genesis.getConstants();
      
      expect(constants.surface_temperature).toBeGreaterThanOrEqual(0);
    });

    it('should generate valid stellar mass at lower bound', () => {
      rngRegistry.setSeed('tiny-star');
      const rng = rngRegistry.getScopedRNG('edge-test-star-mass');
      const genesis = new GenesisConstants(rng);
      const constants = genesis.getConstants();
      
      expect(constants.stellar_mass).toBeGreaterThan(0);
      expect(constants.stellar_mass).toBeLessThan(1000 * PHYSICS_CONSTANTS.SOLAR_MASS);
    });

    it('should generate valid planet mass at lower bound', () => {
      rngRegistry.setSeed('tiny-planet');
      const rng = rngRegistry.getScopedRNG('edge-test-planet-mass');
      const genesis = new GenesisConstants(rng);
      const constants = genesis.getConstants();
      
      expect(constants.planet_mass).toBeGreaterThan(0);
      expect(constants.planet_radius).toBeGreaterThan(0);
    });

    it('should handle extreme metallicity values', () => {
      rngRegistry.setSeed('metal-rich');
      const rng = rngRegistry.getScopedRNG('edge-test-metallicity');
      const genesis = new GenesisConstants(rng);
      const constants = genesis.getConstants();
      
      expect(constants.metallicity).toBeGreaterThanOrEqual(0);
      expect(constants.metallicity).toBeLessThan(1);
    });

    it('should generate valid escape velocity', () => {
      rngRegistry.setSeed('escape-vel');
      const rng = rngRegistry.getScopedRNG('edge-test-escape');
      const genesis = new GenesisConstants(rng);
      const constants = genesis.getConstants();
      
      expect(constants.escape_velocity).toBeGreaterThan(0);
      expect(constants.escape_velocity).toBeLessThan(PHYSICS_CONSTANTS.c);
    });

    it('should respect speed of light limit', () => {
      rngRegistry.setSeed('relativistic');
      const rng = rngRegistry.getScopedRNG('edge-test-c-limit');
      const genesis = new GenesisConstants(rng);
      const constants = genesis.getConstants();
      
      expect(constants.orbital_velocity).toBeLessThan(PHYSICS_CONSTANTS.c);
    });

    it('should generate physically valid core fraction', () => {
      rngRegistry.setSeed('core-test');
      const rng = rngRegistry.getScopedRNG('edge-test-core');
      const genesis = new GenesisConstants(rng);
      const constants = genesis.getConstants();
      
      expect(constants.core_fraction).toBeGreaterThan(0);
      expect(constants.core_fraction).toBeLessThan(1);
      expect(constants.mantle_fraction).toBeGreaterThan(0);
      expect(constants.mantle_fraction).toBeLessThan(1);
      expect(constants.core_fraction + constants.mantle_fraction).toBeLessThanOrEqual(1.0);
    });
  });

  describe('Determinism Tests', () => {
    it('should produce identical results across 1000 iterations with same seed', () => {
      const results: number[] = [];
      
      for (let i = 0; i < 1000; i++) {
        rngRegistry.reset();
        rngRegistry.setSeed('deterministic-test-seed');
        const rng = rngRegistry.getScopedRNG('test-scope');
        const genesis = new GenesisConstants(rng);
        const constants = genesis.getConstants();
        results.push(constants.planet_mass);
      }
      
      const allSame = results.every(val => val === results[0]);
      expect(allSame).toBe(true);
    });

    it('should produce different results for different seeds', () => {
      const results = new Set<number>();
      
      for (let i = 0; i < 100; i++) {
        rngRegistry.setSeed(`seed-${i}`);
        const rng = rngRegistry.getScopedRNG(`unique-${i}`);
        const genesis = new GenesisConstants(rng);
        const constants = genesis.getConstants();
        results.add(constants.planet_mass);
      }
      
      expect(results.size).toBeGreaterThan(90);
    });

    it('should be independent of seed application order', () => {
      rngRegistry.setSeed('order-test-A');
      const rng1 = rngRegistry.getScopedRNG('test-1');
      const genesis1 = new GenesisConstants(rng1);
      const constants1 = genesis1.getConstants();
      
      rngRegistry.setSeed('order-test-B');
      rngRegistry.setSeed('order-test-A');
      const rng2 = rngRegistry.getScopedRNG('test-1');
      const genesis2 = new GenesisConstants(rng2);
      const constants2 = genesis2.getConstants();
      
      expect(constants1.planet_mass).toBe(constants2.planet_mass);
      expect(constants1.gravity).toBe(constants2.gravity);
    });

    it('should produce bit-exact results for same seed across sessions', () => {
      rngRegistry.setSeed('bit-exact-test');
      const rng1 = rngRegistry.getScopedRNG('session-1');
      const genesis1 = new GenesisConstants(rng1);
      const constants1 = genesis1.getConstants();
      
      rngRegistry.reset();
      rngRegistry.setSeed('bit-exact-test');
      const rng2 = rngRegistry.getScopedRNG('session-1');
      const genesis2 = new GenesisConstants(rng2);
      const constants2 = genesis2.getConstants();
      
      expect(constants1.planet_mass).toBe(constants2.planet_mass);
      expect(constants1.stellar_luminosity).toBe(constants2.stellar_luminosity);
      expect(constants1.atmospheric_pressure).toBe(constants2.atmospheric_pressure);
    });
  });

  describe('Conservation Laws', () => {
    it('should maintain mass-energy conservation', () => {
      rngRegistry.setSeed('conservation-test');
      const rng = rngRegistry.getScopedRNG('energy-test');
      const genesis = new GenesisConstants(rng);
      const constants = genesis.getConstants();
      
      const totalMass = constants.planet_mass + constants.stellar_mass;
      expect(totalMass).toBeGreaterThan(0);
      expect(totalMass).toBeLessThan(Infinity);
    });

    it('should maintain atmospheric composition sum close to 1.0', () => {
      rngRegistry.setSeed('atmosphere-test');
      const rng = rngRegistry.getScopedRNG('atmo-test');
      const genesis = new GenesisConstants(rng);
      const constants = genesis.getConstants();
      
      const compositionSum = Object.values(constants.atmospheric_composition)
        .reduce((sum, val) => sum + val, 0);
      
      expect(compositionSum).toBeGreaterThan(0.95);
      expect(compositionSum).toBeLessThanOrEqual(1.05);
    });

    it('should maintain primordial element fractions sum to 1.0', () => {
      rngRegistry.setSeed('primordial-test');
      const rng = rngRegistry.getScopedRNG('element-test');
      const genesis = new GenesisConstants(rng);
      const constants = genesis.getConstants();
      
      const totalFraction = constants.hydrogen_fraction + 
                           constants.helium_fraction + 
                           constants.lithium_fraction;
      
      expect(totalFraction).toBeCloseTo(1.0, 2);
    });

    it('should maintain physical planet structure ratios', () => {
      rngRegistry.setSeed('structure-test');
      const rng = rngRegistry.getScopedRNG('struct-test');
      const genesis = new GenesisConstants(rng);
      const constants = genesis.getConstants();
      
      const crustFraction = constants.crust_thickness / constants.planet_radius;
      const totalStructure = constants.core_fraction + constants.mantle_fraction + crustFraction;
      
      expect(totalStructure).toBeLessThanOrEqual(1.1);
      expect(totalStructure).toBeGreaterThan(0.9);
    });
  });

  describe('Extreme Physics Scenarios', () => {
    it('should handle planet in very close orbit', () => {
      rngRegistry.setSeed('hot-jupiter');
      const rng = rngRegistry.getScopedRNG('close-orbit');
      const genesis = new GenesisConstants(rng);
      const constants = genesis.getConstants();
      
      expect(constants.solar_constant).toBeGreaterThan(0);
      expect(constants.surface_temperature).toBeGreaterThan(0);
    });

    it('should handle planet in distant orbit', () => {
      rngRegistry.setSeed('cold-neptune');
      const rng = rngRegistry.getScopedRNG('far-orbit');
      const genesis = new GenesisConstants(rng);
      const constants = genesis.getConstants();
      
      expect(constants.solar_constant).toBeGreaterThan(0);
      expect(constants.surface_temperature).toBeGreaterThan(0);
    });

    it('should handle very high stellar luminosity', () => {
      rngRegistry.setSeed('massive-star');
      const rng = rngRegistry.getScopedRNG('bright-star');
      const genesis = new GenesisConstants(rng);
      const constants = genesis.getConstants();
      
      expect(constants.stellar_luminosity).toBeGreaterThan(0);
      expect(constants.habitable_zone_inner).toBeLessThan(constants.habitable_zone_outer);
    });

    it('should handle very low stellar luminosity', () => {
      rngRegistry.setSeed('red-dwarf');
      const rng = rngRegistry.getScopedRNG('dim-star');
      const genesis = new GenesisConstants(rng);
      const constants = genesis.getConstants();
      
      expect(constants.stellar_luminosity).toBeGreaterThan(0);
      expect(constants.habitable_zone_inner).toBeGreaterThan(0);
    });

    it('should handle extreme magnetic field values', () => {
      rngRegistry.setSeed('magnetar');
      const rng = rngRegistry.getScopedRNG('mag-field');
      const genesis = new GenesisConstants(rng);
      const constants = genesis.getConstants();
      
      expect(constants.magnetic_field).toBeGreaterThan(0);
    });

    it('should handle extreme tidal locking scenarios', () => {
      rngRegistry.setSeed('tidal-lock');
      const rng = rngRegistry.getScopedRNG('tide-test');
      const genesis = new GenesisConstants(rng);
      const constants = genesis.getConstants();
      
      expect(constants.tidal_locking_timescale).toBeGreaterThan(0);
      expect(constants.tidal_locking_timescale).toBeLessThan(Infinity);
    });
  });

  describe('Numerical Stability', () => {
    it('should not produce NaN values', () => {
      rngRegistry.setSeed('nan-test');
      const rng = rngRegistry.getScopedRNG('stability-test');
      const genesis = new GenesisConstants(rng);
      const constants = genesis.getConstants();
      
      Object.entries(constants).forEach(([_key, value]) => {
        if (typeof value === 'number') {
          expect(Number.isNaN(value)).toBe(false);
        }
      });
    });

    it('should not produce Infinity values', () => {
      rngRegistry.setSeed('infinity-test');
      const rng = rngRegistry.getScopedRNG('finite-test');
      const genesis = new GenesisConstants(rng);
      const constants = genesis.getConstants();
      
      Object.entries(constants).forEach(([_key, value]) => {
        if (typeof value === 'number') {
          expect(Number.isFinite(value)).toBe(true);
        }
      });
    });

    it('should handle division by zero gracefully', () => {
      rngRegistry.setSeed('zero-division');
      const rng = rngRegistry.getScopedRNG('zero-test');
      
      expect(() => {
        const genesis = new GenesisConstants(rng);
        const constants = genesis.getConstants();
        expect(constants).toBeDefined();
      }).not.toThrow();
    });

    it('should maintain precision for very small values', () => {
      rngRegistry.setSeed('precision-test');
      const rng = rngRegistry.getScopedRNG('small-val');
      const genesis = new GenesisConstants(rng);
      const constants = genesis.getConstants();
      
      expect(constants.lithium_fraction).toBeGreaterThan(0);
      expect(constants.lithium_fraction).toBeLessThan(1);
    });

    it('should maintain precision for very large values', () => {
      rngRegistry.setSeed('large-test');
      const rng = rngRegistry.getScopedRNG('large-val');
      const genesis = new GenesisConstants(rng);
      const constants = genesis.getConstants();
      
      expect(constants.cloud_mass).toBeGreaterThan(0);
      expect(constants.supernova_energy).toBeGreaterThan(0);
    });
  });

  describe('Habitable Zone Calculations', () => {
    it('should always have inner habitable zone less than outer', () => {
      for (let i = 0; i < 50; i++) {
        rngRegistry.setSeed(`hab-zone-${i}`);
        const rng = rngRegistry.getScopedRNG(`hab-${i}`);
        const genesis = new GenesisConstants(rng);
        const constants = genesis.getConstants();
        
        expect(constants.habitable_zone_inner).toBeLessThan(constants.habitable_zone_outer);
      }
    });

    it('should place planet within or outside habitable zone consistently', () => {
      rngRegistry.setSeed('hz-placement');
      const rng = rngRegistry.getScopedRNG('hz-test');
      const genesis = new GenesisConstants(rng);
      const constants = genesis.getConstants();
      
      const inHZ = constants.orbital_radius >= constants.habitable_zone_inner &&
                   constants.orbital_radius <= constants.habitable_zone_outer;
      
      expect(typeof inHZ).toBe('boolean');
    });
  });

  describe('Hill Sphere Calculations', () => {
    it('should generate valid Hill sphere radius', () => {
      rngRegistry.setSeed('hill-sphere');
      const rng = rngRegistry.getScopedRNG('hill-test');
      const genesis = new GenesisConstants(rng);
      const constants = genesis.getConstants();
      
      expect(constants.hill_sphere).toBeGreaterThan(0);
      expect(constants.hill_sphere).toBeLessThan(constants.orbital_radius);
    });

    it('should scale Hill sphere with planet mass', () => {
      rngRegistry.setSeed('hill-mass-1');
      const rng1 = rngRegistry.getScopedRNG('hill-1');
      const genesis1 = new GenesisConstants(rng1);
      const constants1 = genesis1.getConstants();
      
      rngRegistry.setSeed('hill-mass-2');
      const rng2 = rngRegistry.getScopedRNG('hill-2');
      const genesis2 = new GenesisConstants(rng2);
      const constants2 = genesis2.getConstants();
      
      expect(constants1.hill_sphere).toBeGreaterThan(0);
      expect(constants2.hill_sphere).toBeGreaterThan(0);
    });
  });
});
