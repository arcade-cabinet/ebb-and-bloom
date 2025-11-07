/**
 * Gen 2: Pack System Tests
 * Tests pack formation using Yuka Flocking Behaviors
 */

import { describe, it, expect } from 'vitest';
import { AccretionSimulation } from '../src/gen0/AccretionSimulation.js';
import { Gen1System } from '../src/gen1/CreatureSystem.js';
import { Gen2System } from '../src/gen2/PackSystem.js';
import { Creature, Pack } from '../src/schemas/index.js';

describe('Gen 2: Pack Formation System', () => {
  it('evaluates pack formation based on resource scarcity', async () => {
    const seed = 'pack-test-seed';
    const accretion = new AccretionSimulation(seed);
    const planet = await accretion.simulate();

    const gen1 = new Gen1System(planet, seed);
    const creatures = gen1.spawnCreatures(10);

    const gen2 = new Gen2System(planet);

    // Place creatures close together
    creatures.forEach((c, i) => {
      c.position.lat = 10 + i * 0.5; // Within ~55km
      c.position.lon = 20 + i * 0.5;
    });

    const packs = gen2.evaluatePackFormation(creatures);

    expect(packs.length).toBeGreaterThan(0);
    console.log(`Formed ${packs.length} pack(s)`);
  });

  it('forms packs with correct members', async () => {
    const seed = 'pack-members-test';
    const accretion = new AccretionSimulation(seed);
    const planet = await accretion.simulate();

    const gen1 = new Gen1System(planet, seed);
    const creatures = gen1.spawnCreatures(8);

    // Group 1: Close together
    for (let i = 0; i < 4; i++) {
      creatures[i].position.lat = 0;
      creatures[i].position.lon = i * 0.1; // ~11km apart
    }

    // Group 2: Far away
    for (let i = 4; i < 8; i++) {
      creatures[i].position.lat = 50;
      creatures[i].position.lon = 100 + i * 0.1;
    }

    const gen2 = new Gen2System(planet);
    const packs = gen2.evaluatePackFormation(creatures);

    expect(packs.length).toBeGreaterThanOrEqual(1);

    for (const pack of packs) {
      expect(pack.members.length).toBeGreaterThanOrEqual(2);
      expect(pack.members.length).toBeLessThanOrEqual(6);
      expect(pack.status).toBe('stable');
      expect(pack.cohesion).toBeGreaterThan(0);
    }
  });

  it('applies Yuka flocking behaviors', async () => {
    const seed = 'flocking-test';
    const accretion = new AccretionSimulation(seed);
    const planet = await accretion.simulate();

    const gen1 = new Gen1System(planet, seed);
    const creatures = gen1.spawnCreatures(5);

    // Place creatures in a line
    creatures.forEach((c, i) => {
      c.position.lat = 0;
      c.position.lon = i * 0.5; // ~55km apart
    });

    const gen2 = new Gen2System(planet);
    const packs = gen2.evaluatePackFormation(creatures);

    expect(packs.length).toBeGreaterThan(0);

    const pack = packs[0];
    const packMembers = creatures.filter(c => pack.members.includes(c.id));

    // Record initial positions
    const initialPositions = packMembers.map(c => ({ ...c.position }));

    // Update pack (apply flocking)
    gen2.updatePacks(packs, creatures, 1.0);

    // Positions should change due to flocking
    const moved = packMembers.some((c, i) => {
      const initial = initialPositions[i];
      return c.position.lat !== initial.lat || c.position.lon !== initial.lon;
    });

    expect(moved).toBe(true);
    console.log('Flocking behaviors applied successfully');
  });

  it('calculates pack cohesion correctly', async () => {
    const seed = 'cohesion-test';
    const accretion = new AccretionSimulation(seed);
    const planet = await accretion.simulate();

    const gen1 = new Gen1System(planet, seed);
    const creatures = gen1.spawnCreatures(6);

    // Tight group
    creatures.forEach((c, i) => {
      c.position.lat = 0;
      c.position.lon = i * 0.01; // ~1.1km apart
    });

    const gen2 = new Gen2System(planet);
    const packs = gen2.evaluatePackFormation(creatures);

    expect(packs.length).toBeGreaterThan(0);

    const pack = packs[0];
    const packMembers = creatures.filter(c => pack.members.includes(c.id));

    gen2.updatePacks(packs, creatures, 0);

    // Tight packs should have high cohesion
    expect(pack.cohesion).toBeGreaterThan(0.8);
    console.log(`Pack cohesion: ${pack.cohesion.toFixed(2)}`);
  });

  it('updates pack center as members move', async () => {
    const seed = 'center-test';
    const accretion = new AccretionSimulation(seed);
    const planet = await accretion.simulate();

    const gen1 = new Gen1System(planet, seed);
    const creatures = gen1.spawnCreatures(4);

    creatures.forEach((c, i) => {
      c.position.lat = i * 0.2;
      c.position.lon = i * 0.2;
    });

    const gen2 = new Gen2System(planet);
    const packs = gen2.evaluatePackFormation(creatures);

    expect(packs.length).toBeGreaterThan(0);

    const pack = packs[0];
    const initialCenter = { ...pack.center };

    // Move a member
    const member = creatures.find(c => pack.members.includes(c.id))!;
    member.position.lat += 1;
    member.position.lon += 1;

    gen2.updatePacks(packs, creatures, 0);

    // Center should have changed
    expect(pack.center.lat).not.toBe(initialCenter.lat);
    expect(pack.center.lon).not.toBe(initialCenter.lon);
  });

  it('disperses packs when members die', async () => {
    const seed = 'disperse-test';
    const accretion = new AccretionSimulation(seed);
    const planet = await accretion.simulate();

    const gen1 = new Gen1System(planet, seed);
    const creatures = gen1.spawnCreatures(3);

    creatures.forEach((c, i) => {
      c.position.lat = 0;
      c.position.lon = i * 0.1;
    });

    const gen2 = new Gen2System(planet);
    const packs = gen2.evaluatePackFormation(creatures);

    expect(packs.length).toBeGreaterThan(0);

    const pack = packs[0];

    // Kill all members
    creatures.forEach(c => {
      if (pack.members.includes(c.id)) {
        c.status = 'dead';
      }
    });

    gen2.updatePacks(packs, creatures, 0);

    // Pack should be dispersing
    expect(pack.status).toBe('dispersing');
  });

  it('prevents creatures from joining multiple packs', async () => {
    const seed = 'no-double-pack-test';
    const accretion = new AccretionSimulation(seed);
    const planet = await accretion.simulate();

    const gen1 = new Gen1System(planet, seed);
    const creatures = gen1.spawnCreatures(10);

    // All creatures close together
    creatures.forEach((c, i) => {
      c.position.lat = 0;
      c.position.lon = i * 0.05; // Very close
    });

    const gen2 = new Gen2System(planet);
    const packs = gen2.evaluatePackFormation(creatures);

    // Check no creature is in multiple packs
    const allMembers: string[] = [];
    for (const pack of packs) {
      for (const memberId of pack.members) {
        expect(allMembers.includes(memberId)).toBe(false);
        allMembers.push(memberId);
      }
    }
  });

  it('converges pack positions over time with flocking', async () => {
    const seed = 'convergence-test';
    const accretion = new AccretionSimulation(seed);
    const planet = await accretion.simulate();

    const gen1 = new Gen1System(planet, seed);
    const creatures = gen1.spawnCreatures(4);

    // Spread out creatures
    creatures.forEach((c, i) => {
      c.position.lat = i * 1; // ~111km apart
      c.position.lon = i * 1;
    });

    const gen2 = new Gen2System(planet);
    const packs = gen2.evaluatePackFormation(creatures);

    expect(packs.length).toBeGreaterThan(0);

    const pack = packs[0];
    const packMembers = creatures.filter(c => pack.members.includes(c.id));

    // Calculate initial spread
    const initialSpread = this.calculateSpread(packMembers);

    // Simulate multiple cycles
    for (let i = 0; i < 10; i++) {
      gen2.updatePacks(packs, creatures, 1.0);
    }

    // Calculate final spread
    const finalSpread = this.calculateSpread(packMembers);

    // Pack should be tighter
    expect(finalSpread).toBeLessThan(initialSpread);
    console.log(`Initial spread: ${initialSpread.toFixed(2)}km, Final spread: ${finalSpread.toFixed(2)}km`);
  });
});

/**
 * Helper: Calculate spread of pack members
 */
function calculateSpread(members: Creature[]): number {
  if (members.length < 2) return 0;

  const center = {
    lat: members.reduce((sum, m) => sum + m.position.lat, 0) / members.length,
    lon: members.reduce((sum, m) => sum + m.position.lon, 0) / members.length,
  };

  const avgDistance = members.reduce((sum, m) => {
    const dLat = (m.position.lat - center.lat) * Math.PI / 180;
    const dLon = (m.position.lon - center.lon) * Math.PI / 180;
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(center.lat * Math.PI / 180) * Math.cos(m.position.lat * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    return sum + (6371 * c);
  }, 0) / members.length;

  return avgDistance;
}
