/**
 * Tool System (Gen3)
 * 
 * Enables creatures to discover, use, and share knowledge of simple tools.
 * Tools emerge from environmental resources and creature intelligence.
 * 
 * Tool Types:
 * - Digging Sticks: Break ground, dig burrows (Burrow Engineers)
 * - Gathering Poles: Reach high food (Arboreal Opportunists)
 * - Wading Spears: Fish in water (Littoral Harvesters)
 * - Striking Stones: Break hard resources (Cursorial Foragers)
 */

export interface Tool {
  id: string;
  type: 'digging_stick' | 'gathering_pole' | 'wading_spear' | 'striking_stone';
  position: { lat: number; lon: number };
  createdBy: string | null; // Creature that created it
  durability: number; // 0-1 (1 = new, 0 = broken)
  discoveredBy: Set<string>; // Creature IDs that know about this tool
}

export interface ToolKnowledge {
  creatureId: string;
  knownTools: Map<string, number>; // tool type -> proficiency (0-1)
  learnedFrom: Map<string, string>; // tool type -> teacher creature ID
  teaching: boolean; // Currently teaching others?
}

export class ToolSystem {
  private tools: Map<string, Tool> = new Map();
  private knowledge: Map<string, ToolKnowledge> = new Map();
  private nextToolId: number = 0;

  /**
   * Update tool system each frame
   */
  update(
    creatures: Map<string, {
      position: { lat: number; lon: number };
      traits?: {
        locomotion?: string;
        intelligence?: number;
        social?: string;
      };
    }>,
    deltaTime: number
  ): void {
    // Tool discovery (smart creatures find tools)
    this.checkToolDiscovery(creatures);

    // Tool degradation over time
    this.degradeTools(deltaTime);

    // Cultural transmission (creatures teach each other)
    this.transmitKnowledge(creatures);

    // Smart creatures create new tools
    this.attemptToolCreation(creatures);
  }

  /**
   * Creatures discover nearby tools
   */
  private checkToolDiscovery(
    creatures: Map<string, {
      position: { lat: number; lon: number };
      traits?: { intelligence?: number };
    }>
  ): void {
    const DISCOVERY_RANGE = 2; // degrees

    for (const [creatureId, creature] of creatures) {
      const intelligence = creature.traits?.intelligence || 0.5;
      
      // Smarter creatures discover more easily
      const discoveryChance = intelligence * 0.1; // 5-10% per frame

      for (const tool of this.tools.values()) {
        // Already discovered?
        if (tool.discoveredBy.has(creatureId)) continue;

        // Within range?
        const dist = this.distanceOnSphere(creature.position, tool.position);
        if (dist > DISCOVERY_RANGE) continue;

        // Discovery check
        if (Math.random() < discoveryChance) {
          tool.discoveredBy.add(creatureId);
          this.learnTool(creatureId, tool.type);
        }
      }
    }
  }

  /**
   * Creature learns about a tool type
   */
  private learnTool(creatureId: string, toolType: string, teacherId?: string): void {
    let knowledge = this.knowledge.get(creatureId);
    
    if (!knowledge) {
      knowledge = {
        creatureId,
        knownTools: new Map(),
        learnedFrom: new Map(),
        teaching: false
      };
      this.knowledge.set(creatureId, knowledge);
    }

    // Initial proficiency: low (0.1-0.3)
    if (!knowledge.knownTools.has(toolType)) {
      knowledge.knownTools.set(toolType, 0.1 + Math.random() * 0.2);
      
      if (teacherId) {
        knowledge.learnedFrom.set(toolType, teacherId);
      }
    }
  }

  /**
   * Tools degrade over time
   */
  private degradeTools(deltaTime: number): void {
    const DEGRADATION_RATE = 0.001; // 1% per second

    const toDelete: string[] = [];
    for (const [toolId, tool] of this.tools) {
      tool.durability -= DEGRADATION_RATE * deltaTime;

      // Mark broken tools for removal
      if (tool.durability <= 0) {
        toDelete.push(toolId);
      }
    }

    // Remove broken tools
    for (const toolId of toDelete) {
      this.tools.delete(toolId);
    }
  }

  /**
   * Cultural transmission: creatures teach each other
   */
  private transmitKnowledge(
    creatures: Map<string, {
      position: { lat: number; lon: number };
      traits?: {
        social?: string;
        intelligence?: number;
      };
    }>
  ): void {
    const TEACHING_RANGE = 3; // degrees
    const TEACHING_CHANCE = 0.05; // 5% per frame

    // Find teachers (creatures with tool knowledge)
    const teachers: string[] = [];
    for (const [creatureId, knowledge] of this.knowledge) {
      if (knowledge.knownTools.size > 0) {
        const creature = creatures.get(creatureId);
        if (creature?.traits?.social === 'pack') {
          teachers.push(creatureId);
        }
      }
    }

    // Teach nearby creatures
    for (const teacherId of teachers) {
      const teacher = creatures.get(teacherId);
      if (!teacher) continue;

      const teacherKnowledge = this.knowledge.get(teacherId)!;

      // Find students nearby
      for (const [studentId, student] of creatures) {
        if (studentId === teacherId) continue;

        // Within teaching range?
        const dist = this.distanceOnSphere(teacher.position, student.position);
        if (dist > TEACHING_RANGE) continue;

        // Social creatures learn better
        const isSocial = student.traits?.social === 'pack';
        if (!isSocial && Math.random() > 0.5) continue;

        // Teaching check
        if (Math.random() < TEACHING_CHANCE) {
          // Teach random known tool
          const knownTools = Array.from(teacherKnowledge.knownTools.keys());
          if (knownTools.length > 0) {
            const toolType = knownTools[Math.floor(Math.random() * knownTools.length)];
            this.learnTool(studentId, toolType, teacherId);
            teacherKnowledge.teaching = true;
          }
        }
      }
    }
  }

  /**
   * Smart creatures create new tools
   */
  private attemptToolCreation(
    creatures: Map<string, {
      position: { lat: number; lon: number };
      traits?: {
        locomotion?: string;
        intelligence?: number;
      };
    }>
  ): void {
    const CREATION_CHANCE = 0.001; // 0.1% per frame

    for (const [creatureId, creature] of creatures) {
      const intelligence = creature.traits?.intelligence || 0.5;
      const locomotion = creature.traits?.locomotion || 'cursorial';

      // Only smart creatures create tools
      if (intelligence < 0.7) continue;

      // Creation check
      if (Math.random() < CREATION_CHANCE * intelligence) {
        const toolType = this.getToolTypeForLocomotion(locomotion);
        this.createTool(toolType, creature.position, creatureId);
      }
    }
  }

  /**
   * Create a new tool
   */
  createTool(
    type: Tool['type'],
    position: { lat: number; lon: number },
    creatorId: string
  ): Tool {
    const tool: Tool = {
      id: `tool-${this.nextToolId++}`,
      type,
      position: { ...position },
      createdBy: creatorId,
      durability: 1.0,
      discoveredBy: new Set([creatorId])
    };

    this.tools.set(tool.id, tool);
    
    // Creator automatically knows how to use it
    this.learnTool(creatorId, type);

    return tool;
  }

  /**
   * Get appropriate tool type for creature locomotion
   */
  private getToolTypeForLocomotion(locomotion: string): Tool['type'] {
    switch (locomotion) {
      case 'burrowing':
        return 'digging_stick';
      case 'arboreal':
        return 'gathering_pole';
      case 'littoral':
        return 'wading_spear';
      case 'cursorial':
      default:
        return 'striking_stone';
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
   * Get all tools
   */
  getTools(): Tool[] {
    return Array.from(this.tools.values());
  }

  /**
   * Get creature's tool knowledge
   */
  getKnowledge(creatureId: string): ToolKnowledge | null {
    return this.knowledge.get(creatureId) || null;
  }

  /**
   * Get all creatures with tool knowledge
   */
  getKnowledgeableCreatures(): string[] {
    return Array.from(this.knowledge.keys());
  }

  /**
   * Check if creature knows a tool type
   */
  knowsTool(creatureId: string, toolType: string): boolean {
    return this.knowledge.get(creatureId)?.knownTools.has(toolType) || false;
  }
}
