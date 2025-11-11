/**
 * Pack Formation System (Gen2)
 *
 * Groups creatures into packs based on social traits and proximity:
 * - Pack detection (nearby creatures with pack trait)
 * - Leader selection (highest strength/intelligence)
 * - Cohesion calculation (how tight the pack is)
 * - Pack splitting/merging
 */

import { CreatureBehaviorState } from './CreatureBehaviorSystem';

export interface PackFormation {
  id: string;
  leaderId: string;
  members: string[];
  cohesion: number; // 0-1
  color: string;
  center: { lat: number; lon: number };
  formed: number; // Timestamp
}

export class PackFormationSystem {
  private packs: Map<string, PackFormation> = new Map();
  private nextPackId: number = 0;
  private packColors: string[] = [
    '#00ff00', // Green
    '#ff0000', // Red
    '#0000ff', // Blue
    '#ffff00', // Yellow
    '#ff00ff', // Magenta
    '#00ffff', // Cyan
  ];

  /**
   * Update pack formations based on creature positions and social traits
   */
  update(
    creatures: Map<string, CreatureBehaviorState>,
    traits: Map<string, { social?: string; strength?: number; intelligence?: number }>
  ): Map<string, PackFormation> {
    // Get creatures with pack social trait
    const packCreatures = new Map<string, CreatureBehaviorState>();

    for (const [id, creature] of creatures) {
      const trait = traits.get(id);
      if (trait?.social === 'pack') {
        packCreatures.set(id, creature);
      }
    }

    // Detect packs (proximity-based clustering)
    const newPacks = this.detectPacks(packCreatures);

    // Update existing packs or create new ones
    this.reconcilePacks(newPacks, creatures);

    // Update cohesion for all packs
    for (const pack of this.packs.values()) {
      this.updateCohesion(pack, creatures);
    }

    return this.packs;
  }

  /**
   * Detect packs based on creature proximity
   */
  private detectPacks(creatures: Map<string, CreatureBehaviorState>): string[][] {
    const clusters: string[][] = [];
    const visited = new Set<string>();
    const PACK_DISTANCE = 10; // degrees

    for (const [id, creature] of creatures) {
      if (visited.has(id)) continue;

      // Start new cluster
      const cluster: string[] = [id];
      visited.add(id);

      // Find nearby creatures
      for (const [otherId, other] of creatures) {
        if (visited.has(otherId)) continue;

        const dist = this.distanceOnSphere(creature.position, other.position);
        if (dist < PACK_DISTANCE) {
          cluster.push(otherId);
          visited.add(otherId);
        }
      }

      // Only create packs with 2+ members
      if (cluster.length >= 2) {
        clusters.push(cluster);
      }
    }

    return clusters;
  }

  /**
   * Reconcile detected packs with existing packs
   */
  private reconcilePacks(
    newClusters: string[][],
    creatures: Map<string, CreatureBehaviorState>
  ): void {
    // Remove old packs that no longer exist
    const existingPackIds = new Set(this.packs.keys());
    const activeMemberIds = new Set<string>();

    for (const cluster of newClusters) {
      cluster.forEach((id) => activeMemberIds.add(id));
    }

    for (const packId of existingPackIds) {
      const pack = this.packs.get(packId)!;
      const stillActive = pack.members.some((id) => activeMemberIds.has(id));

      if (!stillActive) {
        this.packs.delete(packId);
      }
    }

    // Create or update packs
    for (const cluster of newClusters) {
      // Find existing pack with most overlap
      let bestMatch: PackFormation | null = null;
      let bestOverlap = 0;

      for (const pack of this.packs.values()) {
        const overlap = cluster.filter((id) => pack.members.includes(id)).length;
        if (overlap > bestOverlap) {
          bestOverlap = overlap;
          bestMatch = pack;
        }
      }

      if (bestMatch && bestOverlap >= 2) {
        // Update existing pack
        bestMatch.members = cluster;
        this.updatePackLeader(bestMatch, creatures);
        this.updatePackCenter(bestMatch, creatures);
      } else {
        // Create new pack
        const pack: PackFormation = {
          id: `pack-${this.nextPackId++}`,
          leaderId: cluster[0], // Temporary
          members: cluster,
          cohesion: 0.5,
          color: this.packColors[this.nextPackId % this.packColors.length],
          center: { lat: 0, lon: 0 },
          formed: Date.now(),
        };

        this.updatePackLeader(pack, creatures);
        this.updatePackCenter(pack, creatures);
        this.packs.set(pack.id, pack);
      }
    }
  }

  /**
   * Update pack leader (strongest/smartest member)
   */
  private updatePackLeader(
    pack: PackFormation,
    creatures: Map<string, CreatureBehaviorState>
  ): void {
    if (pack.members.length === 0) return;

    // Find strongest/smartest member
    let bestLeader = pack.members[0];
    let bestScore = 0;

    for (const memberId of pack.members) {
      const creature = creatures.get(memberId);
      if (!creature) continue;

      // Leadership score = strength + intelligence (if available from traits)
      // For now, just use first member as placeholder until traits are fully available
      const score = Math.random(); // Will be replaced with actual trait scoring

      if (score > bestScore) {
        bestScore = score;
        bestLeader = memberId;
      }
    }

    pack.leaderId = bestLeader;
  }

  /**
   * Update pack center position
   */
  private updatePackCenter(
    pack: PackFormation,
    creatures: Map<string, CreatureBehaviorState>
  ): void {
    let sumLat = 0;
    let sumLon = 0;
    let count = 0;

    for (const memberId of pack.members) {
      const creature = creatures.get(memberId);
      if (creature) {
        sumLat += creature.position.lat;
        sumLon += creature.position.lon;
        count++;
      }
    }

    if (count > 0) {
      pack.center = {
        lat: sumLat / count,
        lon: sumLon / count,
      };
    }
  }

  /**
   * Update pack cohesion (how tight the pack is)
   */
  private updateCohesion(pack: PackFormation, creatures: Map<string, CreatureBehaviorState>): void {
    // Calculate average distance from center
    let totalDist = 0;
    let count = 0;

    for (const memberId of pack.members) {
      const creature = creatures.get(memberId);
      if (creature) {
        const dist = this.distanceOnSphere(creature.position, pack.center);
        totalDist += dist;
        count++;
      }
    }

    if (count > 0) {
      const avgDist = totalDist / count;
      // Cohesion: 1.0 = very tight (0 dist), 0.0 = very spread (20+ degrees)
      pack.cohesion = Math.max(0, Math.min(1, 1 - avgDist / 20));
    }
  }

  /**
   * Calculate distance on sphere
   */
  private distanceOnSphere(
    pos1: { lat: number; lon: number },
    pos2: { lat: number; lon: number }
  ): number {
    const dLat = pos2.lat - pos1.lat;
    const dLon = pos2.lon - pos1.lon;
    return Math.sqrt(dLat * dLat + dLon * dLon);
  }

  /**
   * Get pack for a creature
   */
  getPackForCreature(creatureId: string): PackFormation | null {
    for (const pack of this.packs.values()) {
      if (pack.members.includes(creatureId)) {
        return pack;
      }
    }
    return null;
  }

  /**
   * Get all packs
   */
  getPacks(): PackFormation[] {
    return Array.from(this.packs.values());
  }
}
