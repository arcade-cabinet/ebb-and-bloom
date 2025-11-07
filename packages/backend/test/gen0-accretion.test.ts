/**
 * Test Gen 0: Accretion Simulation
 * Proves deterministic seeding and valid planet generation
 */

import { describe, it, expect } from 'vitest';
import { AccretionSimulation } from '../src/gen0/AccretionSimulation.js';

describe('Gen 0: Accretion Simulation', () => {
  it('produces deterministic planet for same seed', async () => {
    const sim1 = new AccretionSimulation({ seed: 'test-deterministic' });
    const planet1 = await sim1.simulate();

    const sim2 = new AccretionSimulation({ seed: 'test-deterministic' });
    const planet2 = await sim2.simulate();

    // Same seed → identical planet
    expect(planet1.radius).toBe(planet2.radius);
    expect(planet1.mass).toBe(planet2.mass);
    expect(planet1.rotationPeriod).toBe(planet2.rotationPeriod);
    expect(planet1.layers.length).toBe(planet2.layers.length);
    expect(planet1.layers[0].materials[0].quantity).toBe(planet2.layers[0].materials[0].quantity);
  });

  it('produces different planets for different seeds', async () => {
    const sim1 = new AccretionSimulation({ seed: 'test-seed-A' });
    const planet1 = await sim1.simulate();

    const sim2 = new AccretionSimulation({ seed: 'test-seed-B' });
    const planet2 = await sim2.simulate();

    // Different seeds → different planets
    expect(planet1.radius).not.toBe(planet2.radius);
    expect(planet1.mass).not.toBe(planet2.mass);
    expect(planet1.rotationPeriod).not.toBe(planet2.rotationPeriod);
  });

  it('produces realistic planetary structure', async () => {
    const sim = new AccretionSimulation({ seed: 'test-realistic' });
    const planet = await sim.simulate();

    // Should have 4 layers
    expect(planet.layers.length).toBe(4);

    // Should have core, mantle, crust
    const layerNames = planet.layers.map(l => l.name);
    expect(layerNames).toContain('inner_core');
    expect(layerNames).toContain('outer_core');
    expect(layerNames).toContain('mantle');
    expect(layerNames).toContain('crust');

    // Core should be densest
    const innerCore = planet.layers.find(l => l.name === 'inner_core')!;
    const crust = planet.layers.find(l => l.name === 'crust')!;
    expect(innerCore.density).toBeGreaterThan(crust.density);

    // Core should be hottest
    expect(innerCore.temperature).toBeGreaterThan(crust.temperature);

    // Radius should be reasonable (3000km - 7000km)
    expect(planet.radius).toBeGreaterThan(3e6);
    expect(planet.radius).toBeLessThan(7e6);

    // Mass should be reasonable (Earth-like)
    expect(planet.mass).toBeGreaterThan(1e23);
    expect(planet.mass).toBeLessThan(1e25);

    // Rotation period should be reasonable (5-25 hours)
    expect(planet.rotationPeriod).toBeGreaterThan(18000);
    expect(planet.rotationPeriod).toBeLessThan(90000);
  });

  it('records formation history', async () => {
    const sim = new AccretionSimulation({ seed: 'test-history' });
    const planet = await sim.simulate();

    // Should have accretion events
    expect(planet.compositionHistory.length).toBeGreaterThan(0);

    // Events should have required fields
    const event = planet.compositionHistory[0];
    expect(event.cycle).toBeGreaterThanOrEqual(0);
    expect(event.type).toBe('accretion');
    expect(event.objects.length).toBeGreaterThan(0);
    expect(event.result).toBeDefined();
    expect(event.result.newMass).toBeGreaterThan(0);
  });

  it('produces planets with iron-rich cores', async () => {
    const sim = new AccretionSimulation({ seed: 'test-iron-core' });
    const planet = await sim.simulate();

    // Inner core should have iron
    const innerCore = planet.layers.find(l => l.name === 'inner_core')!;
    const ironMaterial = innerCore.materials.find(m => m.type === 'iron');

    expect(ironMaterial).toBeDefined();
    expect(ironMaterial!.quantity).toBeGreaterThan(0);
    expect(ironMaterial!.hardness).toBe(10);
    expect(ironMaterial!.density).toBeGreaterThan(10000);
  });

  it('crust contains accessible materials', async () => {
    const sim = new AccretionSimulation({ seed: 'test-crust-materials' });
    const planet = await sim.simulate();

    const crust = planet.layers.find(l => l.name === 'crust')!;

    // Should have various materials
    expect(crust.materials.length).toBeGreaterThan(3);

    // Should have limestone (accessible for creatures)
    const limestone = crust.materials.find(m => m.type === 'limestone');
    expect(limestone).toBeDefined();
    expect(limestone!.hardness).toBeLessThan(5);

    // Should have water
    const water = crust.materials.find(m => m.type === 'water');
    expect(water).toBeDefined();
  });

  it('layers are properly ordered by radius', async () => {
    const sim = new AccretionSimulation({ seed: 'test-layer-order' });
    const planet = await sim.simulate();

    // Layers should be sorted by radius
    for (let i = 0; i < planet.layers.length - 1; i++) {
      const current = planet.layers[i];
      const next = planet.layers[i + 1];

      expect(current.maxRadius).toBeLessThanOrEqual(next.minRadius);
    }

    // Last layer should extend to planet radius
    const lastLayer = planet.layers[planet.layers.length - 1];
    expect(lastLayer.maxRadius).toBe(planet.radius);
  });

  it('produces valid Zod schema', async () => {
    const sim = new AccretionSimulation({ seed: 'test-zod-validation' });
    const planet = await sim.simulate();

    // Should pass Zod validation
    const { PlanetSchema } = await import('../src/schemas/index.js');
    expect(() => PlanetSchema.parse(planet)).not.toThrow();
  });
});
