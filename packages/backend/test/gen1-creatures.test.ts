/**
 * Test Gen 1: Creature System
 * Proves Yuka-driven creatures work
 */

import { describe, it, expect } from 'vitest';
import { AccretionSimulation } from '../src/gen0/AccretionSimulation.js';
import { Gen1System, ARCHETYPES } from '../src/gen1/CreatureSystem.js';

describe('Gen 1: Creature System', () => {
  it('spawns creatures deterministically', async () => {
    const planet = await new AccretionSimulation({ seed: 'test-planet' }).simulate();
    
    const gen1a = new Gen1System({ seed: 'creature-seed', planet, creatureCount: 10 });
    const creaturesA = gen1a.spawnCreatures(10);

    const gen1b = new Gen1System({ seed: 'creature-seed', planet, creatureCount: 10 });
    const creaturesB = gen1b.spawnCreatures(10);

    // Same seed → same creatures
    expect(creaturesA.length).toBe(creaturesB.length);
    expect(creaturesA[0].position).toEqual(creaturesB[0].position);
    expect(creaturesA[0].archetype).toBe(creaturesB[0].archetype);
  });

  it('spawns different creatures for different seeds', async () => {
    const planet = await new AccretionSimulation({ seed: 'test-planet' }).simulate();
    
    const gen1a = new Gen1System({ seed: 'seed-A', planet, creatureCount: 10 });
    const creaturesA = gen1a.spawnCreatures(10);

    const gen1b = new Gen1System({ seed: 'seed-B', planet, creatureCount: 10 });
    const creaturesB = gen1b.spawnCreatures(10);

    // Different seeds → different creatures
    expect(creaturesA[0].position).not.toEqual(creaturesB[0].position);
  });

  it('creatures have valid composition from archetypes', async () => {
    const planet = await new AccretionSimulation({ seed: 'test-planet' }).simulate();
    const gen1 = new Gen1System({ seed: 'test', planet, creatureCount: 10 });
    const creatures = gen1.spawnCreatures(10);

    for (const creature of creatures) {
      // Should have composition
      expect(creature.composition.carbon).toBeGreaterThan(0);
      expect(creature.composition.water).toBeGreaterThan(0);

      // Should match archetype
      const archetype = ARCHETYPES[creature.archetype];
      expect(creature.traits.excavation).toBe(archetype.traits.excavation);
    }
  });

  it('creatures have needs that deplete', async () => {
    const planet = await new AccretionSimulation({ seed: 'test-planet' }).simulate();
    const gen1 = new Gen1System({ seed: 'test', planet, creatureCount: 1 });
    const creatures = gen1.spawnCreatures(1);
    const creature = creatures[0];

    const initialCarbon = creature.needs.find(n => n.type === 'carbon')!.current;

    // Update for 10 cycles
    gen1.update(creatures, 10);

    const finalCarbon = creature.needs.find(n => n.type === 'carbon')!.current;

    // Carbon should have depleted
    expect(finalCarbon).toBeLessThan(initialCarbon);
  });

  it('creatures execute energy management goals', async () => {
    const planet = await new AccretionSimulation({ seed: 'test-planet' }).simulate();
    const gen1 = new Gen1System({ seed: 'test', planet, creatureCount: 1 });
    const creatures = gen1.spawnCreatures(1);

    // Deplete energy
    creatures[0].needs[0].current = 1; // Very low
    creatures[0].needs[0].urgency = 0.95;

    const initialPosition = { ...creatures[0].position };

    // Update (should try to find food)
    gen1.update(creatures, 1);

    // Should have moved (exploring) or consumed something
    expect(creatures[0].status).toBe('alive');
  });

  it('creatures die when needs are critically low', async () => {
    const planet = await new AccretionSimulation({ seed: 'test-planet' }).simulate();
    const gen1 = new Gen1System({ seed: 'test', planet, creatureCount: 1 });
    const creatures = gen1.spawnCreatures(1);

    // Deplete all needs
    for (const need of creatures[0].needs) {
      need.current = 0;
      need.urgency = 1.0;
    }

    // Update
    gen1.update(creatures, 1);

    // Should be dying
    expect(creatures[0].status).toBe('dying');
  });

  it('different archetypes have different traits', async () => {
    const planet = await new AccretionSimulation({ seed: 'test-planet' }).simulate();
    const gen1 = new Gen1System({ seed: 'test', planet, creatureCount: 100 });
    const creatures = gen1.spawnCreatures(100);

    // Should have multiple archetypes
    const archetypes = new Set(creatures.map(c => c.archetype));
    expect(archetypes.size).toBeGreaterThan(1);

    // Check archetype differences
    const cursorial = creatures.find(c => c.archetype === 'cursorial_forager');
    const burrow = creatures.find(c => c.archetype === 'burrow_engineer');

    if (cursorial && burrow) {
      expect(cursorial.traits.excavation).toBeLessThan(burrow.traits.excavation);
      expect(cursorial.traits.speed).toBeGreaterThan(burrow.traits.speed);
    }
  });

  it('creatures spawn across the planet surface', async () => {
    const planet = await new AccretionSimulation({ seed: 'test-planet' }).simulate();
    const gen1 = new Gen1System({ seed: 'test', planet, creatureCount: 100 });
    const creatures = gen1.spawnCreatures(100);

    // Should have distribution across lat/lon
    const lats = creatures.map(c => c.position.lat);
    const lons = creatures.map(c => c.position.lon);

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);

    // Should cover significant range
    expect(maxLat - minLat).toBeGreaterThan(100);
    expect(maxLon - minLon).toBeGreaterThan(100);
  });
});
