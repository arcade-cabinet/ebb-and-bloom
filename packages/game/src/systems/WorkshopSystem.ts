/**
 * Workshop System (Gen4)
 * 
 * Advanced crafting stations where specialized creatures create better tools.
 * Workshops are upgraded structures with specific functions:
 * - Smithy: Create/upgrade striking tools
 * - Carpentry: Create/upgrade wooden tools
 * - Weaving Station: Create composite tools (rope, handles)
 * - Assembly Area: Combine parts into complex tools
 */

export type WorkshopType = 'smithy' | 'carpentry' | 'weaving' | 'assembly';

export interface Workshop {
  id: string;
  type: WorkshopType;
  position: { lat: number; lon: number };
  structureId: string; // Parent structure
  efficiency: number; // 0-1 (1 = master workshop)
  activeProjects: CraftingProject[];
  builtBy: string[]; // Creature IDs
  durability: number; // 0-1
}

export interface CraftingProject {
  id: string;
  workshopId: string;
  crafterIds: string[]; // Creatures working on it
  outputTool: {
    type: string;
    quality: number; // 0-1 (affects durability multiplier)
  };
  requiredMaterials: Map<string, number>; // material -> amount needed
  progress: number; // 0-1
  startTime: number;
}

export interface AdvancedTool {
  id: string;
  baseType: string; // Original tool type
  quality: number; // 0-1 (1 = masterwork)
  durabilityMultiplier: number; // 1.0-3.0 (how much longer it lasts)
  efficiencyMultiplier: number; // 1.0-2.0 (how much better it works)
  craftedBy: string;
  craftedAt: string; // Workshop ID
  components: string[]; // Parts used
}

export class WorkshopSystem {
  private workshops: Map<string, Workshop> = new Map();
  private projects: Map<string, CraftingProject> = new Map();
  private advancedTools: Map<string, AdvancedTool> = new Map();
  private nextWorkshopId: number = 0;
  private nextProjectId: number = 0;
  private nextToolId: number = 0;

  /**
   * Update workshop system
   */
  update(
    creatures: Map<string, {
      position: { lat: number; lon: number };
      traits?: {
        intelligence?: number;
        strength?: number;
      };
    }>,
    structures: Map<string, { position: { lat: number; lon: number }; type: string }>,
    specializations: Map<string, { role: string; proficiency: number }>,
    deltaTime: number
  ): void {
    // Convert structures to workshops (high-intelligence builders)
    this.upgradeStructuresToWorkshops(structures, creatures, specializations);

    // Crafters start projects at workshops
    this.initiateCraftingProjects(creatures, specializations);

    // Work on active projects
    this.progressCraftingProjects(creatures, specializations, deltaTime);

    // Complete finished projects
    this.completeProjects();

    // Workshops degrade slowly
    this.degradeWorkshops(deltaTime);
  }

  /**
   * Upgrade structures to workshops
   */
  private upgradeStructuresToWorkshops(
    structures: Map<string, { position: { lat: number; lon: number }; type: string }>,
    creatures: Map<string, any>,
    specializations: Map<string, { role: string; proficiency: number }>
  ): void {
    const UPGRADE_RANGE = 2; // degrees
    const UPGRADE_CHANCE = 0.0001; // 0.01% per frame

    for (const [structureId, structure] of structures) {
      // Already a workshop?
      const existing = Array.from(this.workshops.values()).find(w => w.structureId === structureId);
      if (existing) continue;

      // Find nearby crafters
      for (const [creatureId, creature] of creatures) {
        const spec = specializations.get(creatureId);
        if (!spec || (spec.role !== 'crafter' && spec.role !== 'builder')) continue;
        if (spec.proficiency < 0.5) continue; // Need experienced specialists

        const dist = this.distanceOnSphere(creature.position, structure.position);
        if (dist > UPGRADE_RANGE) continue;

        // Upgrade check
        if (Math.random() < UPGRADE_CHANCE) {
          const workshopType = this.determineWorkshopType(structure.type);
          this.createWorkshop(workshopType, structure.position, structureId, creatureId);
          break;
        }
      }
    }
  }

  /**
   * Determine workshop type from structure
   */
  private determineWorkshopType(structureType: string): WorkshopType {
    switch (structureType) {
      case 'burrow':
        return 'smithy'; // Underground forges
      case 'platform':
        return 'carpentry'; // Woodworking
      case 'stiltwork':
        return 'weaving'; // Water-based fiber work
      case 'windbreak':
      default:
        return 'assembly'; // General assembly
    }
  }

  /**
   * Create a workshop
   */
  private createWorkshop(
    type: WorkshopType,
    position: { lat: number; lon: number },
    structureId: string,
    builderId: string
  ): Workshop {
    const workshop: Workshop = {
      id: `workshop-${this.nextWorkshopId++}`,
      type,
      position: { ...position },
      structureId,
      efficiency: 0.5, // Starts at medium efficiency
      activeProjects: [],
      builtBy: [builderId],
      durability: 1.0
    };

    this.workshops.set(workshop.id, workshop);
    return workshop;
  }

  /**
   * Crafters initiate projects
   */
  private initiateCraftingProjects(
    creatures: Map<string, { position: { lat: number; lon: number } }>,
    specializations: Map<string, { role: string; proficiency: number }>
  ): void {
    const PROJECT_RANGE = 2; // degrees
    const INITIATE_CHANCE = 0.001; // 0.1% per frame

    for (const [workshopId, workshop] of this.workshops) {
      // Already has projects?
      if (workshop.activeProjects.length >= 3) continue;

      // Find nearby crafters
      for (const [creatureId, creature] of creatures) {
        const spec = specializations.get(creatureId);
        if (!spec || spec.role !== 'crafter') continue;

        const dist = this.distanceOnSphere(creature.position, workshop.position);
        if (dist > PROJECT_RANGE) continue;

        // Initiate project
        if (Math.random() < INITIATE_CHANCE * spec.proficiency) {
          const project = this.createProject(workshopId, creatureId, workshop.type);
          workshop.activeProjects.push(project);
          break;
        }
      }
    }
  }

  /**
   * Create a crafting project
   */
  private createProject(
    workshopId: string,
    crafterId: string,
    workshopType: WorkshopType
  ): CraftingProject {
    const project: CraftingProject = {
      id: `project-${this.nextProjectId++}`,
      workshopId,
      crafterIds: [crafterId],
      outputTool: {
        type: this.getToolTypeForWorkshop(workshopType),
        quality: 0.5 // Will improve with crafter skill
      },
      requiredMaterials: new Map([
        ['wood', 2],
        ['stone', 1]
      ]),
      progress: 0,
      startTime: Date.now()
    };

    this.projects.set(project.id, project);
    return project;
  }

  /**
   * Get tool type for workshop
   */
  private getToolTypeForWorkshop(type: WorkshopType): string {
    switch (type) {
      case 'smithy':
        return 'striking_stone_advanced';
      case 'carpentry':
        return 'gathering_pole_advanced';
      case 'weaving':
        return 'wading_spear_advanced';
      case 'assembly':
        return 'digging_stick_advanced';
    }
  }

  /**
   * Progress crafting projects
   */
  private progressCraftingProjects(
    creatures: Map<string, { position: { lat: number; lon: number } }>,
    specializations: Map<string, { role: string; proficiency: number }>,
    deltaTime: number
  ): void {
    const WORK_RANGE = 2; // degrees
    const BASE_PROGRESS_RATE = 0.005; // 0.5% per second

    for (const workshop of this.workshops.values()) {
      for (const project of workshop.activeProjects) {
        // Find workers
        let totalProgress = 0;

        for (const [creatureId, creature] of creatures) {
          const spec = specializations.get(creatureId);
          if (!spec || spec.role !== 'crafter') continue;

          const dist = this.distanceOnSphere(creature.position, workshop.position);
          if (dist > WORK_RANGE) continue;

          // Calculate progress contribution
          const progressRate = BASE_PROGRESS_RATE * spec.proficiency * workshop.efficiency;
          totalProgress += progressRate * deltaTime;

          // Track worker
          if (!project.crafterIds.includes(creatureId)) {
            project.crafterIds.push(creatureId);
          }
        }

        project.progress += totalProgress;
      }
    }
  }

  /**
   * Complete finished projects
   */
  private completeProjects(): void {
    for (const workshop of this.workshops.values()) {
      const completed: number[] = [];

      workshop.activeProjects.forEach((project, idx) => {
        if (project.progress >= 1.0) {
          // Create advanced tool
          const tool = this.createAdvancedTool(project, workshop);
          this.advancedTools.set(tool.id, tool);

          // Improve workshop efficiency
          workshop.efficiency = Math.min(1.0, workshop.efficiency + 0.05);

          completed.push(idx);
        }
      });

      // Remove completed projects
      for (const idx of completed.reverse()) {
        const project = workshop.activeProjects[idx];
        this.projects.delete(project.id);
        workshop.activeProjects.splice(idx, 1);
      }
    }
  }

  /**
   * Create an advanced tool
   */
  private createAdvancedTool(
    project: CraftingProject,
    workshop: Workshop
  ): AdvancedTool {
    // Quality based on crafter proficiency and workshop efficiency
    const quality = (project.outputTool.quality + workshop.efficiency) / 2;

    const tool: AdvancedTool = {
      id: `adv-tool-${this.nextToolId++}`,
      baseType: project.outputTool.type,
      quality,
      durabilityMultiplier: 1.0 + quality * 2.0, // 1.0-3.0x durability
      efficiencyMultiplier: 1.0 + quality, // 1.0-2.0x efficiency
      craftedBy: project.crafterIds[0],
      craftedAt: workshop.id,
      components: ['wood', 'stone', 'composite']
    };

    return tool;
  }

  /**
   * Degrade workshops
   */
  private degradeWorkshops(deltaTime: number): void {
    const DEGRADATION_RATE = 0.0001; // 0.01% per second

    const toDelete: string[] = [];
    for (const [id, workshop] of this.workshops) {
      workshop.durability -= DEGRADATION_RATE * deltaTime;

      if (workshop.durability <= 0) {
        toDelete.push(id);
      }
    }

    for (const id of toDelete) {
      this.workshops.delete(id);
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
   * Get all workshops
   */
  getWorkshops(): Workshop[] {
    return Array.from(this.workshops.values());
  }

  /**
   * Get all active projects
   */
  getProjects(): CraftingProject[] {
    return Array.from(this.projects.values());
  }

  /**
   * Get advanced tools
   */
  getAdvancedTools(): AdvancedTool[] {
    return Array.from(this.advancedTools.values());
  }
}
