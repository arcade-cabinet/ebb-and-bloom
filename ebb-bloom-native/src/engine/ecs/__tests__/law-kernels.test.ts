import { describe, it, expect } from 'vitest';
import * as Laws from '../laws/LawKernels';
import { PHYSICS_CONSTANTS } from '../../../agents/tables/physics-constants';

describe('Law Kernels', () => {
  describe('Gravitational Laws', () => {
    it('should calculate gravitational force correctly', () => {
      const m1 = 1000;
      const m2 = 2000;
      const r = 10;

      const force = Laws.gravityForce(m1, m2, r);
      const expected = (PHYSICS_CONSTANTS.G * m1 * m2) / (r * r);

      expect(force).toBeCloseTo(expected, 10);
    });

    it('should calculate escape velocity', () => {
      const mass = PHYSICS_CONSTANTS.EARTH_MASS;
      const radius = PHYSICS_CONSTANTS.EARTH_RADIUS;

      const escapeVel = Laws.escapeVelocity(mass, radius);

      expect(escapeVel).toBeGreaterThan(11000);
      expect(escapeVel).toBeLessThan(12000);
    });

    it('should calculate orbital velocity', () => {
      const mass = PHYSICS_CONSTANTS.EARTH_MASS;
      const radius = PHYSICS_CONSTANTS.EARTH_RADIUS + 400000;

      const orbitalVel = Laws.orbitalVelocity(mass, radius);

      expect(orbitalVel).toBeGreaterThan(7000);
      expect(orbitalVel).toBeLessThan(8000);
    });
  });

  describe('Chemical Laws', () => {
    it('should calculate molecular mass from element counts', () => {
      const mass = Laws.calculateMolecularMassFromElements({ H: 2, O: 1 });

      expect(mass).toBeCloseTo(18.015, 1);
    });

    it('should return bond energy for known element pairs', () => {
      const energy = Laws.bondEnergy('H', 'O');

      expect(energy).toBeGreaterThan(0);
    });
  });

  describe('Thermodynamic Laws', () => {
    it('should calculate thermal energy', () => {
      const temperature = 300;
      const energy = Laws.thermalEnergy(temperature);

      expect(energy).toBeGreaterThan(0);
      expect(energy).toBeCloseTo(6.2e-21, -21);
    });

    it('should calculate black body radiation', () => {
      const temperature = 5778;
      const surfaceArea = 4 * Math.PI * PHYSICS_CONSTANTS.SOLAR_RADIUS ** 2;

      const power = Laws.blackBodyRadiation(temperature, surfaceArea);

      expect(power).toBeGreaterThan(0);
      expect(power / PHYSICS_CONSTANTS.SOLAR_LUMINOSITY).toBeCloseTo(1, 0);
    });

    it('should calculate ideal gas pressure', () => {
      const moles = 1;
      const volume = 0.0224;
      const temperature = 273.15;

      const pressure = Laws.idealGasPressure(moles, volume, temperature);

      expect(pressure).toBeCloseTo(101325, -3);
    });
  });

  describe('Kinetic Laws', () => {
    it('should calculate kinetic energy', () => {
      const mass = 1000;
      const velocity = { x: 10, y: 0, z: 0 };

      const ke = Laws.kineticEnergy(mass, velocity);

      expect(ke).toBeCloseTo(50000, 1);
    });

    it('should calculate momentum', () => {
      const mass = 100;
      const velocity = { x: 5, y: 3, z: 2 };

      const p = Laws.momentum(mass, velocity);

      expect(p.x).toBe(500);
      expect(p.y).toBe(300);
      expect(p.z).toBe(200);
    });
  });

  describe('Electromagnetic Laws', () => {
    it('should calculate Coulomb force', () => {
      const q1 = 1e-6;
      const q2 = 1e-6;
      const r = 1;

      const force = Laws.coulombForce(q1, q2, r);

      expect(force).toBeGreaterThan(0);
    });

    it('should calculate electric potential energy', () => {
      const q1 = 1e-6;
      const q2 = -1e-6;
      const r = 1;

      const energy = Laws.electricPotentialEnergy(q1, q2, r);

      expect(energy).toBeLessThan(0);
    });
  });

  describe('Stellar Laws', () => {
    it('should calculate stellar luminosity', () => {
      const sunMass = PHYSICS_CONSTANTS.SOLAR_MASS;
      const luminosity = Laws.stellarLuminosity(sunMass);

      expect(luminosity / PHYSICS_CONSTANTS.SOLAR_LUMINOSITY).toBeCloseTo(1, 0);
    });

    it('should calculate stellar lifetime', () => {
      const sunMass = PHYSICS_CONSTANTS.SOLAR_MASS;
      const lifetime = Laws.stellarLifetime(sunMass);

      expect(lifetime).toBeGreaterThan(3e17);
    });

    it('should calculate Schwarzschild radius', () => {
      const sunMass = PHYSICS_CONSTANTS.SOLAR_MASS;
      const radius = Laws.schwarzschildRadius(sunMass);

      expect(radius).toBeCloseTo(2953, -1);
    });
  });

  describe('Biological Laws', () => {
    it('should calculate Kleiber metabolic rate', () => {
      const mass = 70;
      const rate = Laws.kleiber(mass);

      expect(rate).toBeGreaterThan(0);
      expect(rate).toBeCloseTo(70 * Math.pow(70, 0.75), 0);
    });

    it('should calculate metabolic rate with temperature effect', () => {
      const mass = 70;
      const temperature = 310;

      const rate = Laws.metabolicRate(mass, temperature);

      expect(rate).toBeGreaterThan(0);
    });

    it('should calculate logistic growth', () => {
      const population = 50;
      const carryingCapacity = 100;
      const growthRate = 0.1;

      const growth = Laws.logisticGrowth(population, carryingCapacity, growthRate);

      expect(growth).toBeGreaterThan(0);
      expect(growth).toBeLessThan(population * growthRate);
    });
  });

  describe('Quantum and Relativistic Laws', () => {
    it('should calculate Planck energy', () => {
      const frequency = 5e14;
      const energy = Laws.planckEnergy(frequency);

      expect(energy).toBeGreaterThan(0);
      expect(energy).toBeCloseTo(PHYSICS_CONSTANTS.h * frequency, -34);
    });

    it('should calculate de Broglie wavelength', () => {
      const mass = 9.109e-31;
      const velocity = 1e6;

      const wavelength = Laws.deBroglieWavelength(mass, velocity);

      expect(wavelength).toBeGreaterThan(0);
    });

    it('should calculate relativistic mass', () => {
      const restMass = 1;
      const velocity = PHYSICS_CONSTANTS.c * 0.5;

      const relMass = Laws.relativisticMass(restMass, velocity);

      expect(relMass).toBeGreaterThan(restMass);
    });
  });

  describe('Diffusion and Transport', () => {
    it('should calculate diffusion coefficient', () => {
      const temperature = 300;
      const particleRadius = 1e-9;
      const viscosity = 1e-3;

      const D = Laws.diffusionCoefficient(temperature, particleRadius, viscosity);

      expect(D).toBeGreaterThan(0);
    });

    it('should calculate Ficks diffusion', () => {
      const c1 = 100;
      const c2 = 50;
      const distance = 1;
      const D = 1e-9;

      const flux = Laws.ficksDiffusion(c1, c2, distance, D);

      expect(flux).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero distance gracefully', () => {
      const force = Laws.gravityForce(1000, 1000, 0);
      expect(force).toBe(0);
    });

    it('should handle invalid chemical formulas', () => {
      const mass = Laws.calculateMolecularMass('XYZ123Invalid!!!');
      expect(mass).toBeGreaterThanOrEqual(0);
    });
  });
});
