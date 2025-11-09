/**
 * Structure Building System (Gen3)
 * 
 * Enables creatures to build simple structures based on their archetype:
 * - Burrow Engineers: Underground burrow complexes
 * - Arboreal Opportunists: Tree platform nests
 * - Littoral Harvesters: Stilt structures in shallow water
 * - Cursorial Foragers: Windbreak shelters
 * 
 * Structures provide benefits:
 * - Safety (reduced fear)
 * - Energy efficiency (faster rest)
 * - Storage (food reserves)
 * - Social gathering points
 */

export interface Structure {
  id: string;
  type: 'burrow' | 'platform' | 'stiltwork' | 'windbreak';
  position: { lat: number; lon: number };
  builders: string[]; // Creature IDs that contributed
  completionProgress: number; // 0-1 (1 = complete)
  durability: number; // 0-1 (1 = new, 0 = destroyed)
  capacity: number; // How many creatures can use it
  occupants: Set<string>; // Current users
  foodStorage: number; // Stored food amount
}

export interface BuildingProject {
  structureId: string;
  targetType: Structure['type'];
  location: { lat: number; lon: number };
  contributors: Map<string, number>; // creature ID -> work contributed
  startTime: number;
}

export class StructureBuildingSystem {
  private structures: Map<string, Structure> = new Map();
  private projects: Map<string, BuildingProject> = new Map();

  /**
   * Update building system
   */
  update(
    creatures: Map<string, {
      position: { lat: number; lon: number };
      traits?: {
        locomotion?: string;
        social?: string;
        intelligence?: number;
        strength?: number;
      };
      energy?: number;
    }>,
    toolKnowledge: Map<string, boolean>, // creature ID -> has tools
    deltaTime: number
  ): void {
    // Start new building projects
    this.initiateProjects(creatures, toolKnowledge);

    // Creatures work on nearby projects
    this.workOnProjects(creatures, toolKnowledge, deltaTime);

    // Complete finished projects
    this.completeProjects();

    // Structures degrade over time
    this.degradeStructures(deltaTime);

    // Creatures use structures (rest, store food)
    this.useStructures(creatures);
  }

  /**
   * Smart creatures with tools start building projects
   */
  private initiateProjects(
    creatures: Map<string, {
      position: { lat: number; lon: number };
      traits?: {
        locomotion?: string;
        intelligence?: number;
        social?: string;
      };
    }>,
    toolKnowledge: Map<string, boolean>
  ): void {
    const INITIATION_CHANCE = 0.0005; // 0.05% per frame

    for (const [creatureId, creature] of creatures) {
      // Only smart creatures with tools initiate
      const intelligence = creature.traits?.intelligence || 0.5;
      const hasTools = toolKnowledge.get(creatureId) || false;
      
      if (!hasTools || intelligence < 0.6) continue;

      // Already too many projects nearby?
      if (this.countNearbyProjects(creature.position) > 0) continue;

      // Initiation check
      if (Math.random() < INITIATION_CHANCE * intelligence) {
        const locomotion = creature.traits?.locomotion || 'cursorial';
        const structureType = this.getStructureTypeForLocomotion(locomotion);
        
        this.startProject(structureType, creature.position, creatureId);
      }
    }
  }

  /**
   * Creatures work on nearby projects
   */
  private workOnProjects(
    creatures: Map<string, {
      position: { lat: number; lon: number };
      traits?: {
        strength?: number;
        intelligence?: number;
        social?: string;
      };
      energy?: number;
    }>,
    toolKnowledge: Map<string, boolean>,
    deltaTime: number
  ): void {
    const WORK_RANGE = 2; // degrees
    const BASE_WORK_RATE = 0.01; // 1% per second

    for (const [_projectId, project] of this.projects) {
      // Find nearby workers
      for (const [creatureId, creature] of creatures) {
        // Has tools?
        if (!toolKnowledge.get(creatureId)) continue;

        // Has energy?
        if ((creature.energy || 1.0) < 0.3) continue;

        // Within range?
        const dist = this.distanceOnSphere(creature.position, project.location);
        if (dist > WORK_RANGE) continue;

        // Calculate work contribution
        const strength = creature.traits?.strength || 0.5;
        const intelligence = creature.traits?.intelligence || 0.5;
        const social = creature.traits?.social === 'pack' ? 1.2 : 1.0; // Pack bonus

        const workRate = BASE_WORK_RATE * strength * intelligence * social * deltaTime;

        // Add contribution
        if (!project.contributors.has(creatureId)) {
          project.contributors.set(creatureId, 0);
        }
        project.contributors.set(creatureId, project.contributors.get(creatureId)! + workRate);
      }
    }
  }

  /**
   * Start a new building project
   */
  private startProject(
    type: Structure['type'],
    position: { lat: number; lon: number },
    initiatorId: string
  ): void {
    const projectId = `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const structureId = `structure-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const project: BuildingProject = {
      structureId,
      targetType: type,
      location: position,
      contributors: new Map([[initiatorId, 0.01]]), // Start with small contribution from initiator
      startTime: Date.now()
    };

    this.projects.set(projectId, project);
  }

  /**
   * Complete projects that reach 100% progress
   */
  private completeProjects(): void {
    const COMPLETION_THRESHOLD = 1.0; // 100% work needed

    const toComplete: string[] = [];
    for (const [projId, project] of this.projects) {
      // Calculate total progress
      const totalWork = Array.from(project.contributors.values()).reduce((sum, work) => sum + work, 0);

      if (totalWork >= COMPLETION_THRESHOLD) {
        toComplete.push(projId);
      }
    }

    // Complete projects
    for (const projId of toComplete) {
      const project = this.projects.get(projId)!;
      
      // Create structure
      const structure: Structure = {
        id: project.structureId,
        type: project.targetType,
        position: project.location,
        builders: Array.from(project.contributors.keys()),
        completionProgress: 1.0,
        durability: 1.0,
        capacity: this.getCapacityForType(project.targetType),
        occupants: new Set(),
        foodStorage: 0
      };

      this.structures.set(structure.id, structure);
      this.projects.delete(projId);
    }
  }

  /**
   * Structures degrade slowly over time
   */
  private degradeStructures(deltaTime: number): void {
    const DEGRADATION_RATE = 0.0001; // 0.01% per second

    for (const [structureId, structure] of this.structures) {
      structure.durability -= DEGRADATION_RATE * deltaTime;

      // Remove destroyed structures
      if (structure.durability <= 0) {
        this.structures.delete(structureId);
      }
    }
  }

  /**
   * Creatures use structures for benefits
   */
  private useStructures(
    creatures: Map<string, {
      position: { lat: number; lon: number };
      energy?: number;
    }>
  ): void {
    const USE_RANGE = 1; // degrees

    // Clear all occupants
    for (const structure of this.structures.values()) {
      structure.occupants.clear();
    }

    // Find users
    for (const [creatureId, creature] of creatures) {
      // Find nearest structure
      let nearestStructure: Structure | null = null;
      let nearestDist = Infinity;

      for (const structure of this.structures.values()) {
        const dist = this.distanceOnSphere(creature.position, structure.position);
        if (dist < nearestDist && dist < USE_RANGE) {
          nearestDist = dist;
          nearestStructure = structure;
        }
      }

      // Use structure
      if (nearestStructure && nearestStructure.occupants.size < nearestStructure.capacity) {
        nearestStructure.occupants.add(creatureId);
      }
    }
  }

  /**
   * Get structure type for locomotion archetype
   */
  private getStructureTypeForLocomotion(locomotion: string): Structure['type'] {
    switch (locomotion) {
      case 'burrowing':
        return 'burrow';
      case 'arboreal':
        return 'platform';
      case 'littoral':
        return 'stiltwork';
      case 'cursorial':
      default:
        return 'windbreak';
    }
  }

  /**
   * Get capacity for structure type
   */
  private getCapacityForType(type: Structure['type']): number {
    switch (type) {
      case 'burrow':
        return 5; // Underground network
      case 'platform':
        return 3; // Tree nest
      case 'stiltwork':
        return 4; // Water platform
      case 'windbreak':
        return 3; // Ground shelter
    }
  }

  /**
   * Count projects near a location
   */
  private countNearbyProjects(position: { lat: number; lon: number }): number {
    const NEARBY_RANGE = 10; // degrees
    let count = 0;

    for (const project of this.projects.values()) {
      const dist = this.distanceOnSphere(position, project.location);
      if (dist < NEARBY_RANGE) count++;
    }

    return count;
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
   * Get all structures
   */
  getStructures(): Structure[] {
    return Array.from(this.structures.values());
  }

  /**
   * Get all active projects
   */
  getProjects(): BuildingProject[] {
    return Array.from(this.projects.values());
  }

  /**
   * Get structure at location
   */
  getStructureAt(position: { lat: number; lon: number }): Structure | null {
    const RANGE = 1;
    
    for (const structure of this.structures.values()) {
      const dist = this.distanceOnSphere(position, structure.position);
      if (dist < RANGE) return structure;
    }
    
    return null;
  }
}
