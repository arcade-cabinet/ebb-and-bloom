import { describe, it, expect } from 'vitest';
import { PHYSICS_CONSTANTS } from '../../../agents/tables/physics-constants';

describe('PHYSICS_CONSTANTS', () => {
  it('should have gravitational constant G', () => {
    expect(PHYSICS_CONSTANTS.G).toBeDefined();
    expect(PHYSICS_CONSTANTS.G).toBeCloseTo(6.674e-11, 15);
  });

  it('should have speed of light c', () => {
    expect(PHYSICS_CONSTANTS.c).toBe(299792458);
  });

  it('should have Boltzmann constant k_B', () => {
    expect(PHYSICS_CONSTANTS.k_B).toBeCloseTo(1.380649e-23, 30);
  });

  it('should have Planck constant h', () => {
    expect(PHYSICS_CONSTANTS.h).toBeCloseTo(6.62607015e-34, 40);
  });

  it('should have reduced Planck constant ℏ', () => {
    expect(PHYSICS_CONSTANTS.ℏ).toBeCloseTo(1.054571817e-34, 40);
  });

  it('should have Avogadro number N_A', () => {
    expect(PHYSICS_CONSTANTS.N_A).toBeCloseTo(6.02214076e23, 15);
  });

  it('should have elementary charge e', () => {
    expect(PHYSICS_CONSTANTS.e).toBeCloseTo(1.602176634e-19, 30);
  });

  it('should have Stefan-Boltzmann constant σ', () => {
    expect(PHYSICS_CONSTANTS.σ).toBeCloseTo(5.670374419e-8, 15);
  });

  it('should have astronomical constants', () => {
    expect(PHYSICS_CONSTANTS.AU).toBeCloseTo(1.495978707e11, 5);
    expect(PHYSICS_CONSTANTS.SOLAR_MASS).toBeGreaterThan(0);
    expect(PHYSICS_CONSTANTS.EARTH_MASS).toBeGreaterThan(0);
  });

  it('should have mathematical constants', () => {
    expect(PHYSICS_CONSTANTS.π).toBe(Math.PI);
    expect(PHYSICS_CONSTANTS.e_euler).toBe(Math.E);
    expect(PHYSICS_CONSTANTS.φ).toBeCloseTo(1.618033988749, 10);
  });

  it('should maintain constant relationships', () => {
    expect(PHYSICS_CONSTANTS.ℏ).toBeCloseTo(
      PHYSICS_CONSTANTS.h / (2 * Math.PI),
      40
    );
  });

  it('should be immutable (readonly)', () => {
    expect(() => {
      (PHYSICS_CONSTANTS as any).G = 0;
    }).toThrow();
  });
});
