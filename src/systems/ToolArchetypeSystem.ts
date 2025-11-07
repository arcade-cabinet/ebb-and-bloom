/**
 * Tool Archetype System - 8 fundamental tool categories
 * 
 * Tools are NOT hardcoded items - they're ARCHETYPES that evolve
 * Everything is Squirrels applies to tools too
 * 
 * Tool Sphere is a Yuka collaborative system that informs:
 * - Creature sphere (what dexterity/strength needed)
 * - Building sphere (what construction complexity possible)
 * - Material sphere (what resources accessible)
 */

import { World, Entity } from 'miniplex';
import * as THREE from 'three';
import { log } from '../utils/Logger';
import { gameClock } from './GameClock';
import type { WorldSchema } from '../world/ECSWorld';

export enum ToolArchetype {
  ASSEMBLER = 'ASSEMBLER',         // Joins things (hammer, needle, mortar)
  DISASSEMBLER = 'DISASSEMBLER',   // Breaks things (axe, knife, saw)
  TRANSFORMER = 'TRANSFORMER',     // Changes form (furnace, mill, loom)
  EXTRACTOR = 'EXTRACTOR',         // Gets things from depths (shovel, drill, pump)
  CARRIER = 'CARRIER',             // Moves things (basket, cart, rope)
  MEASURER = 'MEASURER',           // Understands things (scale, compass, clock)
  PROTECTOR = 'PROTECTOR',         // Shields things (armor, walls, shelter)
  RECORDER = 'RECORDER'            // Preserves knowledge (writing, maps, memory)
}

interface ToolProperties {
  // Physical properties (NOT hardcoded capabilities)
  hardness: number;        // Material strength (0-1)
  reach: number;           // Physical extent (meters)
  precision: number;       // Fine manipulation (0-1)
  capacity: number;        // Volume/storage (cubic meters)
  durability: number;      // Uses before degradation
  weight: number;          // Affects mobility (kg)
}

interface ToolInstance {
  archetype: ToolArchetype;
  generation: number;           // What gen this tool emerged
  properties: ToolProperties;
  
  // Trait requirements to use effectively
  requiredTraits: {
    manipulation: number;      // Min manipulation trait needed
    strength: number;          // Min for heavy tools
    precision: number;         // Min for delicate tools
  };
  
  // Property-based capabilities (NOT hardcoded)
  capabilities: string[];      // Derived from properties
  
  // Evolution tracking
  synthesizedFrom: string[];   // Parts that formed this tool
  usageCount: number;
  effectiveness: number;       // 0-1, how well it works
}

class ToolArchetypeSystem {
  private world: World<WorldSchema>;
  private tools: Map<string, Entity<WorldSchema>> = new Map();
  private archetypeDefinitions: Map<ToolArchetype, ToolArchetypeDefinition> = new Map();

  constructor(world: World<WorldSchema>) {
    this.world = world;
    this.initializeArchetypes();
    log.info('ToolArchetypeSystem initialized - 8 fundamental archetypes');
  }

  private initializeArchetypes(): void {
    // Gen 1: Base tool archetypes (Daggerfall-style prefabs)
    
    // ASSEMBLER archetype
    this.archetypeDefinitions.set(ToolArchetype.ASSEMBLER, {
      archetype: ToolArchetype.ASSEMBLER,
      baseProperties: {
        hardness: 0.6,
        reach: 0.3,
        precision: 0.7,
        capacity: 0.1,
        durability: 50,
        weight: 0.5
      },
      traitInfluence: [0, 0.8, 0, 0, 0, 0, 0, 0, 0, 0], // High manipulation requirement
      emergenceConditions: {
        creatureSocial: 0.4,      // Needs social coordination
        materialsAvailable: 2     // Needs multiple materials
      }
    });

    // DISASSEMBLER archetype
    this.archetypeDefinitions.set(ToolArchetype.DISASSEMBLER, {
      archetype: ToolArchetype.DISASSEMBLER,
      baseProperties: {
        hardness: 0.8,
        reach: 0.5,
        precision: 0.3,
        capacity: 0,
        durability: 40,
        weight: 1.0
      },
      traitInfluence: [0.2, 0.6, 0.4, 0, 0, 0, 0, 0, 0, 0], // Manipulation + some excavation
      emergenceConditions: {
        creatureSocial: 0.2,
        materialsAvailable: 1
      }
    });

    // EXTRACTOR archetype
    this.archetypeDefinitions.set(ToolArchetype.EXTRACTOR, {
      archetype: ToolArchetype.EXTRACTOR,
      baseProperties: {
        hardness: 0.9,
        reach: 2.0,              // Deep reaching
        precision: 0.2,
        capacity: 0.3,
        durability: 30,
        weight: 1.5
      },
      traitInfluence: [0.3, 0.5, 0.9, 0, 0, 0, 0, 0, 0, 0], // High excavation requirement
      emergenceConditions: {
        materialDepth: 5,        // Triggers when deep materials are needed
        creatureSocial: 0.3
      }
    });

    // CARRIER archetype
    this.archetypeDefinitions.set(ToolArchetype.CARRIER, {
      archetype: ToolArchetype.CARRIER,
      baseProperties: {
        hardness: 0.4,
        reach: 1.0,
        precision: 0.1,
        capacity: 5.0,           // Large storage
        durability: 60,
        weight: 0.8
      },
      traitInfluence: [0, 0.3, 0, 0, 0, 0, 0.9, 0, 0, 0], // High storage trait
      emergenceConditions: {
        resourceScatter: 0.7,    // Triggers when resources are scattered
        creatureSocial: 0.5
      }
    });

    // RECORDER archetype (CRITICAL - enables knowledge transfer)
    this.archetypeDefinitions.set(ToolArchetype.RECORDER, {
      archetype: ToolArchetype.RECORDER,
      baseProperties: {
        hardness: 0.3,
        reach: 0.1,
        precision: 0.9,          // High precision for writing
        capacity: 0.5,           // Storage for knowledge
        durability: 100,         // Very durable (knowledge persists)
        weight: 0.2
      },
      traitInfluence: [0, 0.7, 0, 0.6, 0.8, 0, 0, 0, 0, 0], // Manipulation + social + sensing
      emergenceConditions: {
        creatureSocial: 0.8,     // High social need for knowledge transfer
        generation: 5            // Doesn't emerge until Gen 5+
      }
    });

    // TRANSFORMER, MEASURER, PROTECTOR (simplified for now)
    this.archetypeDefinitions.set(ToolArchetype.TRANSFORMER, {
      archetype: ToolArchetype.TRANSFORMER,
      baseProperties: { hardness: 0.7, reach: 0.5, precision: 0.5, capacity: 1.0, durability: 40, weight: 2.0 },
      traitInfluence: [0, 0.5, 0, 0, 0, 0, 0, 0, 0, 0.3],
      emergenceConditions: { creatureSocial: 0.6, materialsAvailable: 3 }
    });

    this.archetypeDefinitions.set(ToolArchetype.MEASURER, {
      archetype: ToolArchetype.MEASURER,
      baseProperties: { hardness: 0.3, reach: 0.2, precision: 0.95, capacity: 0, durability: 80, weight: 0.3 },
      traitInfluence: [0, 0.8, 0, 0, 0.9, 0, 0, 0, 0, 0],
      emergenceConditions: { creatureSocial: 0.7, generation: 4 }
    });

    this.archetypeDefinitions.set(ToolArchetype.PROTECTOR, {
      archetype: ToolArchetype.PROTECTOR,
      baseProperties: { hardness: 0.9, reach: 0.4, precision: 0.2, capacity: 0, durability: 70, weight: 1.8 },
      traitInfluence: [0, 0.3, 0, 0, 0, 0, 0, 0, 0.9, 0],
      emergenceConditions: { territorialConflict: 0.6, generation: 3 }
    });

    log.info('Tool archetypes initialized', {
      archetypes: Array.from(this.archetypeDefinitions.keys())
    });
  }

  /**
   * Yuka decision: Should a new tool archetype emerge?
   * Called by YukaSphereCoordinator based on environmental pressure
   */
  shouldToolEmerge(
    archetype: ToolArchetype,
    generation: number,
    environmentalContext: any
  ): boolean {
    const definition = this.archetypeDefinitions.get(archetype);
    if (!definition) return false;

    const conditions = definition.emergenceConditions;

    // Check generation requirement
    if (conditions.generation && generation < conditions.generation) {
      return false;
    }

    // Check social requirement
    if (conditions.creatureSocial && environmentalContext.socialCoordination < conditions.creatureSocial) {
      return false;
    }

    // Check material requirements
    if (conditions.materialsAvailable && environmentalContext.uniqueMaterials < conditions.materialsAvailable) {
      return false;
    }

    // Check depth requirement (for EXTRACTOR)
    if (conditions.materialDepth && environmentalContext.deepestMaterialNeeded < conditions.materialDepth) {
      return false;
    }

    // Check conflict requirement (for PROTECTOR)
    if (conditions.territorialConflict && environmentalContext.conflict < conditions.territorialConflict) {
      return false;
    }

    // Check scatter requirement (for CARRIER)
    if (conditions.resourceScatter && environmentalContext.resourceDistribution < conditions.resourceScatter) {
      return false;
    }

    log.info('Tool archetype emergence condition met', { archetype, generation });
    return true;
  }

  /**
   * Spawn a tool entity (Gen 1 base or Gen 2+ evolved)
   */
  spawnTool(
    archetype: ToolArchetype,
    position: THREE.Vector3,
    generation: number,
    synthesizedFrom?: string[]
  ): Entity<WorldSchema> {
    const definition = this.archetypeDefinitions.get(archetype);
    if (!definition) {
      throw new Error(`No definition for tool archetype: ${archetype}`);
    }

    const toolInstance: ToolInstance = {
      archetype,
      generation,
      properties: { ...definition.baseProperties },
      requiredTraits: {
        manipulation: definition.traitInfluence[1] || 0,
        strength: definition.traitInfluence[0] || 0,
        precision: definition.traitInfluence[4] || 0
      },
      capabilities: this.deriveCapabilities(definition.baseProperties, archetype),
      synthesizedFrom: synthesizedFrom || [],
      usageCount: 0,
      effectiveness: 1.0
    };

    // Create visual representation
    const mesh = this.createToolMesh(toolInstance);

    // Create ECS entity
    const entity = this.world.add({
      transform: {
        position: position.clone(),
        rotation: new THREE.Euler(0, Math.random() * Math.PI * 2, 0),
        scale: new THREE.Vector3(1, 1, 1)
      },
      resource: {
        materialType: 'tool' as any,
        quantity: 1,
        purity: toolInstance.effectiveness,
        magneticRadius: 3,
        harvestable: true
      },
      render: {
        mesh,
        material: mesh.material as THREE.Material,
        visible: true,
        castShadow: true,
        receiveShadow: true
      }
    });

    // Store tool instance data
    (entity as any).toolInstance = toolInstance;

    this.tools.set(entity.toString(), entity);

    log.info('Tool spawned', {
      archetype,
      generation,
      position: position.toArray(),
      capabilities: toolInstance.capabilities
    });

    return entity;
  }

  /**
   * Derive capabilities from properties (NOT hardcoded)
   */
  private deriveCapabilities(props: ToolProperties, archetype: ToolArchetype): string[] {
    const caps: string[] = [];

    // Hardness determines breaking/cutting
    if (props.hardness > 0.7 && archetype === ToolArchetype.DISASSEMBLER) {
      caps.push('break_stone', 'cut_wood', 'harvest_metal');
    } else if (props.hardness > 0.5) {
      caps.push('cut_wood', 'harvest_soft');
    }

    // Reach determines accessibility
    if (props.reach > 1.0 && archetype === ToolArchetype.EXTRACTOR) {
      caps.push('deep_mining', 'well_digging');
    } else if (props.reach > 0.5) {
      caps.push('surface_harvest');
    }

    // Precision determines assembly quality
    if (props.precision > 0.8 && archetype === ToolArchetype.ASSEMBLER) {
      caps.push('fine_assembly', 'complex_construction');
    } else if (props.precision > 0.5) {
      caps.push('basic_assembly');
    }

    // Capacity determines storage/transport
    if (props.capacity > 3.0 && archetype === ToolArchetype.CARRIER) {
      caps.push('bulk_transport', 'resource_hoarding');
    } else if (props.capacity > 1.0) {
      caps.push('basic_carry');
    }

    // Special archetype capabilities
    if (archetype === ToolArchetype.RECORDER) {
      caps.push('knowledge_storage', 'cultural_transmission', 'enable_religion', 'enable_governance');
    }

    if (archetype === ToolArchetype.TRANSFORMER) {
      caps.push('material_processing', 'alloy_creation');
    }

    return caps;
  }

  /**
   * Create procedural tool mesh from properties
   */
  private createToolMesh(tool: ToolInstance): THREE.Group {
    const group = new THREE.Group();

    // Tool mesh varies by archetype and properties
    let geometry: THREE.BufferGeometry;
    let material: THREE.Material;

    switch (tool.archetype) {
      case ToolArchetype.ASSEMBLER:
        // Hammer-like
        geometry = new THREE.CylinderGeometry(0.1, 0.15, 0.5, 6);
        material = new THREE.MeshStandardMaterial({ 
          color: 0x654321,
          roughness: 0.8,
          metalness: 0.2
        });
        break;

      case ToolArchetype.DISASSEMBLER:
        // Axe-like
        geometry = new THREE.BoxGeometry(0.3, 0.1, 0.6);
        material = new THREE.MeshStandardMaterial({ 
          color: 0x808080,
          roughness: 0.3,
          metalness: tool.properties.hardness
        });
        break;

      case ToolArchetype.EXTRACTOR:
        // Shovel/drill-like
        geometry = new THREE.ConeGeometry(0.1, tool.properties.reach, 6);
        material = new THREE.MeshStandardMaterial({ 
          color: 0x8B4513,
          roughness: 0.7,
          metalness: 0.4
        });
        break;

      case ToolArchetype.CARRIER:
        // Basket-like
        geometry = new THREE.CylinderGeometry(
          tool.properties.capacity * 0.2,
          tool.properties.capacity * 0.15,
          tool.properties.capacity * 0.3,
          8
        );
        material = new THREE.MeshStandardMaterial({ 
          color: 0xD2691E,
          roughness: 0.9,
          metalness: 0
        });
        break;

      case ToolArchetype.RECORDER:
        // Book/tablet-like
        geometry = new THREE.BoxGeometry(0.3, 0.4, 0.05);
        material = new THREE.MeshStandardMaterial({ 
          color: 0xFFF8DC,
          roughness: 0.8,
          metalness: 0,
          emissive: 0xD69E2E,  // Trait gold - knowledge
          emissiveIntensity: 0.2
        });
        break;

      default:
        // Generic tool
        geometry = new THREE.BoxGeometry(0.2, 0.3, 0.2);
        material = new THREE.MeshStandardMaterial({ color: 0x808080 });
    }

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);

    return group;
  }

  /**
   * Update tool durability, effectiveness based on usage
   */
  update(deltaTime: number): void {
    for (const [id, entity] of this.tools) {
      const instance = (entity as any).toolInstance as ToolInstance;
      if (!instance) continue;

      // Tools degrade with use
      if (instance.usageCount > instance.properties.durability) {
        instance.effectiveness = Math.max(0, instance.effectiveness - 0.01);
      }

      // Broken tools eventually disappear
      if (instance.effectiveness < 0.1) {
        log.info('Tool broken and removed', { archetype: instance.archetype, usageCount: instance.usageCount });
        this.world.remove(entity);
        this.tools.delete(id);
      }
    }
  }

  /**
   * Get all tools of a specific archetype
   */
  getToolsByArchetype(archetype: ToolArchetype): Entity<WorldSchema>[] {
    const results: Entity<WorldSchema>[] = [];
    
    for (const entity of this.tools.values()) {
      const instance = (entity as any).toolInstance as ToolInstance;
      if (instance && instance.archetype === archetype) {
        results.push(entity);
      }
    }
    
    return results;
  }
}

interface ToolArchetypeDefinition {
  archetype: ToolArchetype;
  baseProperties: ToolProperties;
  traitInfluence: number[];  // Which traits affect usage
  emergenceConditions: Record<string, number>;
}

export default ToolArchetypeSystem;
export type { ToolInstance, ToolProperties };

