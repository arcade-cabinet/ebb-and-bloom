/**
 * Gen 4: Tribe Formation System
 * Packs coalesce into tribes when benefits outweigh coordination costs
 */

import { Goal, CompositeGoal } from 'yuka';
import seedrandom from 'seedrandom';
import { Tribe, Pack, Creature, Tool, Planet, Coordinate, Territory } from '../schemas/index.js';

/**
 * Tribe Formation Goal - Multi-pack cooperation
 */
export class FormTribeGoal extends Goal {
  private packs: Pack[];
  private reason: string;

  constructor(packs: Pack[], reason: string) {
    super();
    this.packs = packs;
    this.reason = reason;
  }

  activate(): void {
    this.status = Goal.STATUS_ACTIVE;
    console.log(`[FormTribeGoal] Activating: ${this.packs.length} packs forming tribe for ${this.reason}`);
  }

  execute(): number {
    // Simplified: tribe forms immediately if goal is active
    this.status = Goal.STATUS_COMPLETED;
    return this.status;
  }

  terminate(): void {
    console.log(`[FormTribeGoal] Tribe formed from ${this.packs.length} packs`);
  }
}

/**
 * Gen 4 Tribe System
 */
export class Gen4System {
  private planet: Planet;
  private rng: ReturnType<typeof seedrandom>;

  constructor(planet: Planet, seed: string) {
    this.planet = planet;
    this.rng = seedrandom(seed + '-gen4');
  }

  /**
   * Evaluate tribe formation from existing packs
   */
  evaluateTribeFormation(
    packs: Pack[],
    creatures: Creature[],
    tools: Tool[]
  ): Tribe[] {
    const tribes: Tribe[] = [];
    const assignedPacks = new Set<string>();

    // Calculate inter-pack distances and shared resources
    for (let i = 0; i < packs.length; i++) {
      if (assignedPacks.has(packs[i].id)) continue;

      const candidatePacks = [packs[i]];
      
      // Find nearby packs
      for (let j = i + 1; j < packs.length; j++) {
        if (assignedPacks.has(packs[j].id)) continue;

        const distance = this.calculateDistance(packs[i].center, packs[j].center);
        
        if (distance < 100) { // 100km range for tribal cooperation
          candidatePacks.push(packs[j]);
        }
      }

      // Evaluate if these packs should form a tribe
      if (candidatePacks.length >= 2) {
        const cooperation Benefits = this.assessCooperationBenefits(candidatePacks, creatures, tools);
        const coordinationCosts = this.assessCoordinationCosts(candidatePacks);

        if (cooperationBenefits > coordinationCosts * 1.5) { // 1.5x threshold for stability
          const tribe = this.formTribe(candidatePacks, creatures);
          tribes.push(tribe);

          // Mark packs as assigned
          candidatePacks.forEach(p => assignedPacks.add(p.id));

          console.log(`[GEN4] Tribe ${tribe.id} formed with ${tribe.packs.length} packs`);
        }
      }
    }

    return tribes;
  }

  /**
   * Assess cooperation benefits
   */
  private assessCooperationBenefits(packs: Pack[], creatures: Creature[], tools: Tool[]): number {
    let benefits = 0;

    // Benefit 1: Resource pooling
    const totalTerritory = packs.length * 100; // km² per pack
    benefits += totalTerritory * 0.01;

    // Benefit 2: Tool sharing
    const sharedTools = tools.filter(t => packs.some(p => p.id === t.pack));
    benefits += sharedTools.length * 0.2;

    // Benefit 3: Defense (safety in numbers)
    const totalMembers = packs.reduce((sum, p) => sum + p.members.length, 0);
    benefits += totalMembers * 0.05;

    // Benefit 4: Knowledge transfer
    const avgTraits = this.calculateAverageTraits(packs, creatures);
    benefits += avgTraits * 0.3;

    return Math.min(1, benefits);
  }

  /**
   * Assess coordination costs
   */
  private assessCoordinationCosts(packs: Pack[]): number {
    let costs = 0;

    // Cost 1: Distance (harder to coordinate if far apart)
    const avgDistance = this.calculateAverageInterPackDistance(packs);
    costs += avgDistance / 100; // Normalize by 100km

    // Cost 2: Size (larger groups harder to coordinate)
    costs += packs.length * 0.1;

    // Cost 3: Cultural differences (assume based on distance)
    costs += packs.length * 0.05;

    return Math.min(1, costs);
  }

  /**
   * Form a tribe from packs
   */
  private formTribe(packs: Pack[], creatures: Creature[]): Tribe {
    // Calculate tribal center (weighted by pack size)
    const totalMembers = packs.reduce((sum, p) => sum + p.members.length, 0);
    let weightedLat = 0;
    let weightedLon = 0;

    packs.forEach(pack => {
      const weight = pack.members.length / totalMembers;
      weightedLat += pack.center.lat * weight;
      weightedLon += pack.center.lon * weight;
    });

    // Determine territory (convex hull of pack territories)
    const territory = this.calculateTribalTerritory(packs);

    const tribe: Tribe = {
      id: `tribe-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      packs: packs.map(p => p.id),
      center: { lat: weightedLat, lon: weightedLon },
      population: totalMembers,
      territory,
      governance: 'elder_council', // Default, could be determined by traits
      resources: [],
      status: 'forming',
    };

    return tribe;
  }

  /**
   * Calculate tribal territory
   */
  private calculateTribalTerritory(packs: Pack[]): Territory {
    // Simplified: bounding box of all pack centers
    const lats = packs.map(p => p.center.lat);
    const lons = packs.map(p => p.center.lon);

    return {
      bounds: [
        { lat: Math.min(...lats), lon: Math.min(...lons) },
        { lat: Math.max(...lats), lon: Math.max(...lons) },
      ],
      area: (Math.max(...lats) - Math.min(...lats)) * (Math.max(...lons) - Math.min(...lons)) * 12100, // km²
      resources: [],
    };
  }

  /**
   * Calculate average traits across packs
   */
  private calculateAverageTraits(packs: Pack[], creatures: Creature[]): number {
    const packCreatures = creatures.filter(c => packs.some(p => p.members.includes(c.id)));
    if (packCreatures.length === 0) return 0;

    const avgExcavation = packCreatures.reduce((sum, c) => sum + c.traits.excavation, 0) / packCreatures.length;
    const avgManipulation = packCreatures.reduce((sum, c) => sum + c.traits.manipulation, 0) / packCreatures.length;
    const avgSocial = packCreatures.reduce((sum, c) => sum + c.traits.social, 0) / packCreatures.length;

    return (avgExcavation + avgManipulation + avgSocial) / 3;
  }

  /**
   * Calculate average inter-pack distance
   */
  private calculateAverageInterPackDistance(packs: Pack[]): number {
    if (packs.length < 2) return 0;

    let totalDistance = 0;
    let count = 0;

    for (let i = 0; i < packs.length; i++) {
      for (let j = i + 1; j < packs.length; j++) {
        totalDistance += this.calculateDistance(packs[i].center, packs[j].center);
        count++;
      }
    }

    return totalDistance / count;
  }

  /**
   * Calculate distance between coordinates
   */
  private calculateDistance(a: Coordinate, b: Coordinate): number {
    const dLat = (b.lat - a.lat) * Math.PI / 180;
    const dLon = (b.lon - a.lon) * Math.PI / 180;
    
    const a1 = Math.sin(dLat/2) * Math.sin(dLat/2) +
               Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) *
               Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a1), Math.sqrt(1-a1));
    
    return 6371 * c;
  }
}
