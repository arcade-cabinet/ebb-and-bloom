/**
 * Pack Social System - Complete social dynamics and territory management
 * Handles pack formation, territory management, and coordinated behaviors
 */

import { World, Entity } from 'miniplex';
import * as THREE from 'three';
import * as YUKA from 'yuka';
import { createNoise2D } from 'simplex-noise';
import { log } from '../utils/Logger';
import { gameClock, type EvolutionEvent } from './GameClock';
import type { WorldSchema, CreatureData } from '../world/ECSWorld';
import type { EvolutionaryCreature } from './CreatureArchetypeSystem';

export enum PackType {
  FAMILY_GROUP = 'family_group',       // Parents + offspring
  HUNTING_PACK = 'hunting_pack',       // Coordinated hunters
  TERRITORIAL_CLAN = 'territorial_clan', // Area defenders
  MIGRATION_HERD = 'migration_herd',    // Seasonal travelers
  SYMBIOTIC_COLLECTIVE = 'symbiotic_collective' // Multi-species cooperation
}

export enum SocialRole {
  ALPHA = 'alpha',           // Pack leader
  BETA = 'beta',             // Second in command
  SPECIALIST = 'specialist',  // Unique skills (scout, healer)
  FOLLOWER = 'follower',     // General member
  JUVENILE = 'juvenile',     // Young/learning
  ELDER = 'elder',           // Experienced advisor
  OUTCAST = 'outcast'        // Rejected member
}

export interface PackStructure {
  packId: string;
  packType: PackType;
  
  // Leadership hierarchy
  members: Map<string, SocialRole>; // Entity ID -> Role
  loyaltyLevels: Map<string, number>; // Entity ID -> Loyalty (0-1)
  dominanceOrder: string[]; // Ordered by dominance
  
  // Territory and resources
  territoryCenter: THREE.Vector3;
  territoryRadius: number;
  claimedResources: string[]; // Resource entity IDs
  sharedTraits: number[]; // Averaged traits from all members
  
  // Social dynamics
  cohesion: number; // 0-1, how unified the pack is
  aggression: number; // 0-1, how hostile to outsiders
  stability: number; // 0-1, resistance to schism
  generation: number; // When this pack formed
  
  // Behavioral patterns
  activitySchedule: PackActivity[];
  migrationPattern: MigrationRoute | null;
  alliances: string[]; // Other pack IDs
  rivalries: string[]; // Enemy pack IDs
}

interface PackActivity {
  type: 'foraging' | 'hunting' | 'territorial_patrol' | 'resource_gathering' | 'social_grooming' | 'migration';
  startHour: number;
  duration: number;
  location: THREE.Vector3;
  requiredRoles: SocialRole[];
  coordination: YukaCoordination;
}

interface MigrationRoute {
  waypoints: THREE.Vector3[];
  currentTarget: number;
  seasonalTrigger: 'temperature' | 'resource_scarcity' | 'population_pressure';
  migrationSpeed: number;
}

interface YukaCoordination {
  leaderBehavior: 'path_finding' | 'resource_seeking' | 'territory_defending';
  followerBehavior: 'formation_keeping' | 'flocking' | 'individual_foraging';
  formations: PackFormation[];
  communicationRadius: number;
}

interface PackFormation {
  name: 'line' | 'circle' | 'wedge' | 'scatter';
  positions: THREE.Vector3[]; // Relative positions from leader
  roles: SocialRole[]; // Which roles go where
  useCase: 'hunting' | 'migration' | 'defense' | 'foraging';
}

class PackSocialSystem {
  private world: World<WorldSchema>;
  private packs = new Map<string, PackStructure>();
  private socialNoise = createNoise2D();
  private nextPackId = 0;
  
  constructor(world: World<WorldSchema>) {
    this.world = world;
    log.info('PackSocialSystem initialized with advanced social dynamics');
  }
  
  /**
   * Form new pack from nearby compatible creatures
   */
  formPack(
    candidates: Entity<WorldSchema>[],
    packType: PackType,
    centerPosition: THREE.Vector3
  ): PackStructure {
    
    const packId = `pack_${this.nextPackId++}`;
    
    log.info('Forming new pack', {
      packId,
      packType,
      memberCount: candidates.length,
      center: centerPosition.toArray()
    });
    
    // Determine pack hierarchy
    const hierarchy = this.establishHierarchy(candidates);
    const loyaltyLevels = this.calculateInitialLoyalty(candidates, hierarchy);
    
    // Calculate shared traits from all members
    const sharedTraits = this.calculateSharedTraits(candidates);
    
    const pack: PackStructure = {
      packId,
      packType,
      members: hierarchy,
      loyaltyLevels,
      dominanceOrder: this.sortByDominance(candidates, hierarchy),
      territoryCenter: centerPosition.clone(),
      territoryRadius: this.calculateTerritorySize(candidates, packType),
      claimedResources: [],
      sharedTraits,
      cohesion: 0.7, // Start with moderate cohesion
      aggression: this.calculatePackAggression(candidates),
      stability: 0.6,
      generation: gameClock.getCurrentTime().generation,
      activitySchedule: this.generateActivitySchedule(packType),
      migrationPattern: packType === PackType.MIGRATION_HERD ? this.generateMigrationRoute(centerPosition) : null,
      alliances: [],
      rivalries: []
    };
    
    this.packs.set(packId, pack);
    
    // Configure Yuka behaviors for pack coordination
    this.setupPackBehaviors(pack, candidates);
    
    // Record pack formation event
    const event: EvolutionEvent = {
      generation: pack.generation,
      timestamp: gameClock.getCurrentTime().gameTimeMs,
      eventType: 'pack_formation',
      description: `New ${packType} formed with ${candidates.length} members`,
      affectedCreatures: candidates.map(c => c.toString()),
      traits: sharedTraits,
      significance: 0.6
    };
    
    gameClock.recordEvent(event);
    
    log.info('Pack formation complete', {
      packId,
      hierarchy: Object.fromEntries(hierarchy),
      sharedTraits: sharedTraits.slice(0, 3),
      territoryRadius: pack.territoryRadius
    });
    
    return pack;
  }
  
  private establishHierarchy(candidates: Entity<WorldSchema>[]): Map<string, SocialRole> {
    const hierarchy = new Map<string, SocialRole>();
    
    // Sort candidates by dominance factors
    const sorted = candidates.sort((a, b) => {
      const aData = (a as any).evolutionaryCreature as EvolutionaryCreature;
      const bData = (b as any).evolutionaryCreature as EvolutionaryCreature;
      
      if (!aData || !bData) return 0;
      
      // Dominance = age + size + aggression traits
      const aDominance = aData.age + aData.archetype.morphology.bodyPlan.bodySize + (aData.currentTraits[7] || 0);
      const bDominance = bData.age + bData.archetype.morphology.bodyPlan.bodySize + (bData.currentTraits[7] || 0);
      
      return bDominance - aDominance;
    });
    
    // Assign roles based on position in dominance order
    for (let i = 0; i < sorted.length; i++) {
      const entityId = sorted[i].toString();
      
      if (i === 0) {
        hierarchy.set(entityId, SocialRole.ALPHA);
      } else if (i === 1 && sorted.length > 3) {
        hierarchy.set(entityId, SocialRole.BETA);
      } else if (i < sorted.length * 0.3) {
        hierarchy.set(entityId, SocialRole.SPECIALIST);
      } else if (i > sorted.length * 0.8) {
        hierarchy.set(entityId, SocialRole.JUVENILE);
      } else {
        hierarchy.set(entityId, SocialRole.FOLLOWER);
      }
    }
    
    return hierarchy;
  }
  
  private calculateInitialLoyalty(
    candidates: Entity<WorldSchema>[],
    hierarchy: Map<string, SocialRole>
  ): Map<string, number> {
    
    const loyalties = new Map<string, number>();
    
    for (const entity of candidates) {
      const role = hierarchy.get(entity.toString());
      const evolutionData = (entity as any).evolutionaryCreature as EvolutionaryCreature;
      
      let baseLoyalty = 0.5; // Neutral starting point
      
      // Role affects initial loyalty
      switch (role) {
        case SocialRole.ALPHA:
          baseLoyalty = 0.9; // Leaders are confident
          break;
        case SocialRole.BETA:
          baseLoyalty = 0.8; // Seconds are loyal
          break;
        case SocialRole.SPECIALIST:
          baseLoyalty = 0.7; // Specialists are valued
          break;
        case SocialRole.FOLLOWER:
          baseLoyalty = 0.6; // Followers are committed
          break;
        case SocialRole.JUVENILE:
          baseLoyalty = 0.8; // Young are enthusiastic
          break;
        case SocialRole.ELDER:
          baseLoyalty = 0.7; // Elders are wise but independent
          break;
        case SocialRole.OUTCAST:
          baseLoyalty = 0.2; // Outcasts are reluctant
          break;
      }
      
      // Social trait affects loyalty
      if (evolutionData && evolutionData.currentTraits.length > 3) {
        const socialTrait = evolutionData.currentTraits[3]; // Assuming trait 3 is social
        baseLoyalty = Math.max(0.1, Math.min(0.9, baseLoyalty + (socialTrait - 0.5) * 0.4));
      }
      
      loyalties.set(entity.toString(), baseLoyalty);
    }
    
    return loyalties;
  }
  
  private calculateSharedTraits(candidates: Entity<WorldSchema>[]): number[] {
    const sharedTraits = Array(10).fill(0);
    let validCreatures = 0;
    
    for (const entity of candidates) {
      const evolutionData = (entity as any).evolutionaryCreature as EvolutionaryCreature;
      if (!evolutionData || !evolutionData.currentTraits) continue;
      
      for (let i = 0; i < Math.min(evolutionData.currentTraits.length, 10); i++) {
        sharedTraits[i] += evolutionData.currentTraits[i];
      }
      
      validCreatures++;
    }
    
    // Average traits across pack
    if (validCreatures > 0) {
      for (let i = 0; i < sharedTraits.length; i++) {
        sharedTraits[i] /= validCreatures;
      }
    }
    
    return sharedTraits;
  }
  
  private sortByDominance(
    candidates: Entity<WorldSchema>[],
    hierarchy: Map<string, SocialRole>
  ): string[] {
    
    const roleOrder = {
      [SocialRole.ALPHA]: 0,
      [SocialRole.BETA]: 1,
      [SocialRole.ELDER]: 2,
      [SocialRole.SPECIALIST]: 3,
      [SocialRole.FOLLOWER]: 4,
      [SocialRole.JUVENILE]: 5,
      [SocialRole.OUTCAST]: 6
    };
    
    return candidates
      .sort((a, b) => {
        const roleA = hierarchy.get(a.toString()) || SocialRole.FOLLOWER;
        const roleB = hierarchy.get(b.toString()) || SocialRole.FOLLOWER;
        return roleOrder[roleA] - roleOrder[roleB];
      })
      .map(entity => entity.toString());
  }
  
  private calculateTerritorySize(candidates: Entity<WorldSchema>[], packType: PackType): number {
    const baseSize = candidates.length * 15; // Base radius per member
    
    const typeModifiers = {
      [PackType.FAMILY_GROUP]: 0.8,       // Smaller territory
      [PackType.HUNTING_PACK]: 1.2,       // Larger hunting ground
      [PackType.TERRITORIAL_CLAN]: 1.5,   // Biggest territory
      [PackType.MIGRATION_HERD]: 0.6,     // Temporary territory
      [PackType.SYMBIOTIC_COLLECTIVE]: 1.0 // Standard
    };
    
    return baseSize * (typeModifiers[packType] || 1.0);
  }
  
  private calculatePackAggression(candidates: Entity<WorldSchema>[]): number {
    let totalAggression = 0;
    let validCreatures = 0;
    
    for (const entity of candidates) {
      const evolutionData = (entity as any).evolutionaryCreature as EvolutionaryCreature;
      if (!evolutionData || !evolutionData.currentTraits) continue;
      
      // Aggression from defensive/territorial traits
      const aggressionTrait = evolutionData.currentTraits[7] || 0; // Assuming trait 7 is defensive
      totalAggression += aggressionTrait;
      validCreatures++;
    }
    
    return validCreatures > 0 ? totalAggression / validCreatures : 0.3;
  }
  
  private generateActivitySchedule(packType: PackType): PackActivity[] {
    const schedule: PackActivity[] = [];
    
    switch (packType) {
      case PackType.FAMILY_GROUP:
        schedule.push(
          {
            type: 'foraging',
            startHour: 6,
            duration: 4,
            location: new THREE.Vector3(0, 0, 0), // Relative to territory center
            requiredRoles: [SocialRole.ALPHA, SocialRole.FOLLOWER],
            coordination: {
              leaderBehavior: 'resource_seeking',
              followerBehavior: 'flocking',
              formations: [{ name: 'scatter', positions: [], roles: [], useCase: 'foraging' }],
              communicationRadius: 15
            }
          },
          {
            type: 'social_grooming',
            startHour: 12,
            duration: 2,
            location: new THREE.Vector3(0, 0, 0),
            requiredRoles: [SocialRole.ALPHA, SocialRole.JUVENILE, SocialRole.ELDER],
            coordination: {
              leaderBehavior: 'territory_defending',
              followerBehavior: 'formation_keeping',
              formations: [{ name: 'circle', positions: [], roles: [], useCase: 'defense' }],
              communicationRadius: 10
            }
          }
        );
        break;
        
      case PackType.HUNTING_PACK:
        schedule.push(
          {
            type: 'hunting',
            startHour: 18,
            duration: 6,
            location: new THREE.Vector3(20, 0, 0), // Hunt outside territory
            requiredRoles: [SocialRole.ALPHA, SocialRole.BETA, SocialRole.SPECIALIST],
            coordination: {
              leaderBehavior: 'path_finding',
              followerBehavior: 'formation_keeping',
              formations: [{ name: 'wedge', positions: [], roles: [], useCase: 'hunting' }],
              communicationRadius: 25
            }
          },
          {
            type: 'territorial_patrol',
            startHour: 8,
            duration: 3,
            location: new THREE.Vector3(0, 0, 0),
            requiredRoles: [SocialRole.BETA, SocialRole.SPECIALIST],
            coordination: {
              leaderBehavior: 'territory_defending',
              followerBehavior: 'formation_keeping',
              formations: [{ name: 'line', positions: [], roles: [], useCase: 'defense' }],
              communicationRadius: 30
            }
          }
        );
        break;
        
      case PackType.TERRITORIAL_CLAN:
        schedule.push(
          {
            type: 'territorial_patrol',
            startHour: 0,
            duration: 24,
            location: new THREE.Vector3(0, 0, 0),
            requiredRoles: [SocialRole.ALPHA, SocialRole.BETA, SocialRole.SPECIALIST, SocialRole.FOLLOWER],
            coordination: {
              leaderBehavior: 'territory_defending',
              followerBehavior: 'formation_keeping',
              formations: [
                { name: 'circle', positions: [], roles: [SocialRole.ALPHA], useCase: 'defense' },
                { name: 'line', positions: [], roles: [SocialRole.BETA, SocialRole.SPECIALIST], useCase: 'defense' }
              ],
              communicationRadius: 40
            }
          }
        );
        break;
    }
    
    return schedule;
  }
  
  private generateMigrationRoute(startPosition: THREE.Vector3): MigrationRoute {
    const waypoints: THREE.Vector3[] = [startPosition];
    
    // Generate 3-5 waypoints in a rough circle
    const waypointCount = 3 + Math.floor(Math.random() * 3);
    const routeRadius = 100 + Math.random() * 200;
    
    for (let i = 1; i < waypointCount; i++) {
      const angle = (i / waypointCount) * Math.PI * 2;
      const jitter = (this.socialNoise(i * 10, startPosition.x * 0.01) * 50);
      
      const waypoint = new THREE.Vector3(
        startPosition.x + Math.cos(angle) * (routeRadius + jitter),
        0,
        startPosition.z + Math.sin(angle) * (routeRadius + jitter)
      );
      
      waypoints.push(waypoint);
    }
    
    return {
      waypoints,
      currentTarget: 1,
      seasonalTrigger: 'resource_scarcity',
      migrationSpeed: 2.0 + Math.random() * 3.0
    };
  }
  
  private setupPackBehaviors(pack: PackStructure, members: Entity<WorldSchema>[]): void {
    log.info('Setting up pack coordination behaviors', { packId: pack.packId });
    
    for (const entity of members) {
      if (!entity.yukaAgent?.vehicle) continue;
      
      const role = pack.members.get(entity.toString());
      const vehicle = entity.yukaAgent.vehicle;
      
      // Clear existing behaviors
      vehicle.steering.behaviors.length = 0;
      
      switch (role) {
        case SocialRole.ALPHA:
          this.setupLeaderBehavior(vehicle, pack);
          break;
          
        case SocialRole.BETA:
          this.setupSecondBehavior(vehicle, pack, members[0]); // Follow alpha
          break;
          
        case SocialRole.SPECIALIST:
          this.setupSpecialistBehavior(vehicle, pack);
          break;
          
        default:
          this.setupFollowerBehavior(vehicle, pack, this.getAlpha(members, pack));
      }
    }
  }
  
  private setupLeaderBehavior(vehicle: YUKA.Vehicle, pack: PackStructure): void {
    // Leaders path-find to resources and patrol territory
    const wanderBehavior = new YUKA.WanderBehavior();
    wanderBehavior.radius = pack.territoryRadius * 0.3;
    wanderBehavior.distance = pack.territoryRadius * 0.2;
    wanderBehavior.jitter = 1;
    
    vehicle.steering.add(wanderBehavior);
    vehicle.maxSpeed = 6 + pack.sharedTraits[0] * 4; // Speed from first trait
  }
  
  private setupFollowerBehavior(
    vehicle: YUKA.Vehicle,
    pack: PackStructure,
    leader: Entity<WorldSchema> | null
  ): void {
    
    if (!leader?.yukaAgent?.vehicle) {
      // Fallback to wander if no leader
      const wander = new YUKA.WanderBehavior();
      vehicle.steering.add(wander);
      return;
    }
    
    // Follow leader with separation
    const seekLeader = new YUKA.SeekBehavior();
    seekLeader.target = leader.yukaAgent.vehicle.position;
    seekLeader.weight = 0.7;
    
    const separation = new YUKA.SeparationBehavior();
    separation.weight = 0.5;
    
    vehicle.steering.add(seekLeader);
    vehicle.steering.add(separation);
    vehicle.maxSpeed = 4 + pack.sharedTraits[0] * 3; // Slower than leader
  }
  
  private setupSpecialistBehavior(vehicle: YUKA.Vehicle, pack: PackStructure): void {
    // Specialists scout and find resources
    const wander = new YUKA.WanderBehavior();
    wander.radius = pack.territoryRadius * 0.4;
    wander.distance = pack.territoryRadius * 0.3;
    wander.jitter = 3; // More exploration
    
    vehicle.steering.add(wander);
    vehicle.maxSpeed = 7 + pack.sharedTraits[4] * 3; // Speed from sensing trait
  }
  
  private setupSecondBehavior(
    vehicle: YUKA.Vehicle,
    pack: PackStructure,
    alpha: Entity<WorldSchema>
  ): void {
    
    if (!alpha.yukaAgent?.vehicle) return;
    
    // Support alpha while maintaining some independence
    const support = new YUKA.SeekBehavior();
    support.target = alpha.yukaAgent.vehicle.position;
    support.weight = 0.5; // Less dependent than followers
    
    const patrol = new YUKA.WanderBehavior();
    patrol.radius = pack.territoryRadius * 0.25;
    patrol.weight = 0.5;
    
    vehicle.steering.add(support);
    vehicle.steering.add(patrol);
    vehicle.maxSpeed = 5.5 + pack.sharedTraits[0] * 3.5;
  }
  
  private getAlpha(members: Entity<WorldSchema>[], pack: PackStructure): Entity<WorldSchema> | null {
    for (const member of members) {
      if (pack.members.get(member.toString()) === SocialRole.ALPHA) {
        return member;
      }
    }
    return null;
  }
  
  /**
   * Update pack dynamics over time
   */
  update(deltaTime: number): void {
    for (const pack of this.packs.values()) {
      this.updatePackCohesion(pack, deltaTime);
      this.updateTerritorialBehavior(pack);
      this.checkPackSchism(pack);
      this.updateMigration(pack, deltaTime);
    }
  }
  
  private updatePackCohesion(pack: PackStructure, deltaTime: number): void {
    // Cohesion changes based on member loyalty and external pressures
    let averageLoyalty = 0;
    let memberCount = 0;
    
    for (const loyalty of pack.loyaltyLevels.values()) {
      averageLoyalty += loyalty;
      memberCount++;
    }
    
    if (memberCount > 0) {
      averageLoyalty /= memberCount;
      
      // Cohesion trends toward average loyalty
      const targetCohesion = averageLoyalty;
      pack.cohesion += (targetCohesion - pack.cohesion) * 0.1 * deltaTime;
      pack.cohesion = Math.max(0, Math.min(1, pack.cohesion));
    }
  }
  
  private updateTerritorialBehavior(pack: PackStructure): void {
    // Check for territorial conflicts with other packs
    for (const otherPack of this.packs.values()) {
      if (otherPack.packId === pack.packId) continue;
      
      const distance = pack.territoryCenter.distanceTo(otherPack.territoryCenter);
      const combinedRadius = pack.territoryRadius + otherPack.territoryRadius;
      
      if (distance < combinedRadius) {
        // Territory overlap - potential conflict
        this.handleTerritorialDispute(pack, otherPack);
      }
    }
  }
  
  private handleTerritorialDispute(pack1: PackStructure, pack2: PackStructure): void {
    const pack1Strength = pack1.members.size * pack1.cohesion * pack1.aggression;
    const pack2Strength = pack2.members.size * pack2.cohesion * pack2.aggression;
    
    if (Math.abs(pack1Strength - pack2Strength) > 0.3) {
      // One pack clearly dominates - weaker pack moves
      const weakerPack = pack1Strength < pack2Strength ? pack1 : pack2;
      this.forceTerritoryMove(weakerPack);
    } else {
      // Establish rivalry
      if (!pack1.rivalries.includes(pack2.packId)) {
        pack1.rivalries.push(pack2.packId);
        pack2.rivalries.push(pack1.packId);
        
        log.info('Pack rivalry established', {
          pack1: pack1.packId,
          pack2: pack2.packId,
          strength1: pack1Strength.toFixed(2),
          strength2: pack2Strength.toFixed(2)
        });
      }
    }
  }
  
  private forceTerritoryMove(pack: PackStructure): void {
    // Move territory center away from conflicts
    const moveDistance = pack.territoryRadius * 1.5;
    const moveAngle = Math.random() * Math.PI * 2;
    
    pack.territoryCenter.add(new THREE.Vector3(
      Math.cos(moveAngle) * moveDistance,
      0,
      Math.sin(moveAngle) * moveDistance
    ));
    
    log.info('Pack territory relocated due to conflict', {
      packId: pack.packId,
      newCenter: pack.territoryCenter.toArray()
    });
  }
  
  private checkPackSchism(pack: PackStructure): void {
    // Pack splits if cohesion is very low and size is large
    if (pack.cohesion < 0.3 && pack.members.size > 6) {
      this.splitPack(pack);
    }
  }
  
  private splitPack(originalPack: PackStructure): void {
    log.info('Pack schism detected', { 
      packId: originalPack.packId, 
      cohesion: originalPack.cohesion,
      memberCount: originalPack.members.size 
    });
    
    // Split members based on loyalty
    const loyalMembers: string[] = [];
    const dissidentMembers: string[] = [];
    
    for (const [memberId, loyalty] of originalPack.loyaltyLevels.entries()) {
      if (loyalty > 0.5) {
        loyalMembers.push(memberId);
      } else {
        dissidentMembers.push(memberId);
      }
    }
    
    if (dissidentMembers.length >= 2) {
      // Create new pack from dissidents
      const newPackId = `pack_${this.nextPackId++}`;
      const newCenter = originalPack.territoryCenter.clone().add(
        new THREE.Vector3(
          (Math.random() - 0.5) * 100,
          0,
          (Math.random() - 0.5) * 100
        )
      );
      
      // Would create new pack here with dissident members
      
      log.info('Pack split complete', {
        originalPack: originalPack.packId,
        newPack: newPackId,
        loyalMembers: loyalMembers.length,
        dissidentMembers: dissidentMembers.length
      });
      
      // Record schism event
      const event: EvolutionEvent = {
        generation: gameClock.getCurrentTime().generation,
        timestamp: gameClock.getCurrentTime().gameTimeMs,
        eventType: 'pack_formation',
        description: `Pack schism: ${originalPack.packId} split into ${newPackId}`,
        affectedCreatures: [...loyalMembers, ...dissidentMembers],
        traits: originalPack.sharedTraits,
        significance: 0.7
      };
      
      gameClock.recordEvent(event);
    }
  }
  
  private updateMigration(pack: PackStructure, deltaTime: number): void {
    if (!pack.migrationPattern) return;
    
    const route = pack.migrationPattern;
    const currentTarget = route.waypoints[route.currentTarget];
    
    if (!currentTarget) return;
    
    const distanceToTarget = pack.territoryCenter.distanceTo(currentTarget);
    
    if (distanceToTarget < 20) {
      // Reached waypoint, move to next
      route.currentTarget = (route.currentTarget + 1) % route.waypoints.length;
      
      log.info('Pack reached migration waypoint', {
        packId: pack.packId,
        waypoint: route.currentTarget,
        nextTarget: route.waypoints[route.currentTarget]?.toArray()
      });
    } else {
      // Move toward target
      const direction = currentTarget.clone().sub(pack.territoryCenter).normalize();
      const moveDistance = route.migrationSpeed * deltaTime;
      
      pack.territoryCenter.add(direction.multiplyScalar(moveDistance));
    }
  }
  
  /**
   * Attempt to form pack from nearby creatures
   */
  attemptPackFormation(creatures: Entity<WorldSchema>[]): PackStructure | null {
    if (creatures.length < 2) return null;
    
    // Check compatibility for pack formation
    const compatibility = this.calculatePackCompatibility(creatures);
    
    if (compatibility > 0.6) {
      const centerPosition = this.calculateCenterPosition(creatures);
      const packType = this.determineBestPackType(creatures);
      
      return this.formPack(creatures, packType, centerPosition);
    }
    
    return null;
  }
  
  private calculatePackCompatibility(creatures: Entity<WorldSchema>[]): number {
    // Check trait similarity and behavioral compatibility
    let totalCompatibility = 0;
    let comparisons = 0;
    
    for (let i = 0; i < creatures.length; i++) {
      for (let j = i + 1; j < creatures.length; j++) {
        const creature1 = (creatures[i] as any).evolutionaryCreature as EvolutionaryCreature;
        const creature2 = (creatures[j] as any).evolutionaryCreature as EvolutionaryCreature;
        
        if (!creature1 || !creature2) continue;
        
        // Calculate trait similarity
        let traitSimilarity = 0;
        for (let k = 0; k < Math.min(creature1.currentTraits.length, creature2.currentTraits.length); k++) {
          const diff = Math.abs(creature1.currentTraits[k] - creature2.currentTraits[k]);
          traitSimilarity += 1 - diff; // Higher similarity = lower difference
        }
        traitSimilarity /= Math.min(creature1.currentTraits.length, creature2.currentTraits.length);
        
        totalCompatibility += traitSimilarity;
        comparisons++;
      }
    }
    
    return comparisons > 0 ? totalCompatibility / comparisons : 0;
  }
  
  private calculateCenterPosition(creatures: Entity<WorldSchema>[]): THREE.Vector3 {
    const center = new THREE.Vector3();
    let count = 0;
    
    for (const creature of creatures) {
      if (creature.transform) {
        center.add(creature.transform.position);
        count++;
      }
    }
    
    if (count > 0) {
      center.divideScalar(count);
    }
    
    return center;
  }
  
  private determineBestPackType(creatures: Entity<WorldSchema>[]): PackType {
    const sharedTraits = this.calculateSharedTraits(creatures);
    
    // Determine pack type based on dominant traits
    const socialTrait = sharedTraits[3] || 0;
    const aggressionTrait = sharedTraits[7] || 0;
    const mobilityTrait = sharedTraits[0] || 0;
    
    if (aggressionTrait > 0.7) {
      return PackType.HUNTING_PACK;
    } else if (socialTrait > 0.8 && aggressionTrait > 0.6) {
      return PackType.TERRITORIAL_CLAN;
    } else if (mobilityTrait > 0.7) {
      return PackType.MIGRATION_HERD;
    } else if (socialTrait > 0.6) {
      return PackType.FAMILY_GROUP;
    } else {
      return PackType.SYMBIOTIC_COLLECTIVE;
    }
  }
  
  // Analysis and debugging
  getPackAnalysis(): {
    totalPacks: number;
    averagePackSize: number;
    packTypes: Record<PackType, number>;
    totalTerritorialCoverage: number;
    activeRivalries: number;
  } {
    const analysis = {
      totalPacks: this.packs.size,
      averagePackSize: 0,
      packTypes: {} as Record<PackType, number>,
      totalTerritorialCoverage: 0,
      activeRivalries: 0
    };
    
    let totalMembers = 0;
    
    for (const pack of this.packs.values()) {
      totalMembers += pack.members.size;
      
      // Count pack types
      analysis.packTypes[pack.packType] = (analysis.packTypes[pack.packType] || 0) + 1;
      
      // Sum territorial coverage  
      analysis.totalTerritorialCoverage += Math.PI * pack.territoryRadius * pack.territoryRadius;
      
      // Count rivalries
      analysis.activeRivalries += pack.rivalries.length;
    }
    
    if (this.packs.size > 0) {
      analysis.averagePackSize = totalMembers / this.packs.size;
    }
    
    // Dedupe rivalries (each counted twice)
    analysis.activeRivalries /= 2;
    
    return analysis;
  }
}

export default PackSocialSystem;