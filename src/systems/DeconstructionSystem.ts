/**
 * Deconstruction System - "Reverse Synthesis"
 * 
 * Killing creatures or dismantling buildings yields their GENERATIONAL PARTS
 * NOT arbitrary loot tables - actual constituent components based on synthesis
 * 
 * Aligns with "Everything is Squirrels" doctrine
 */

import type { World } from 'miniplex';
import * as THREE from 'three';
import { log } from '../utils/Logger';
import type { WorldSchema } from '../world/ECSWorld';
import type { EvolutionaryCreature } from './CreatureArchetypeSystem';

export interface DeconstructedPart {
  name: string;              // Auto-generated taxonomic name
  generation: number;        // What generation this part came from
  sourceArchetype: string;   // What it was part of
  properties: {
    hardness: number;        // Physical property
    volume: number;          // Size/capacity
    weight: number;          // Mass
    organic: boolean;        // Organic vs inorganic
    toxicity: number;        // Chemical properties
  };
  traitSignature: number[];  // Trait inheritance from parent
  usableFor: string[];       // Property-based usage (not hardcoded)
}

class DeconstructionSystem {
  private world: World<WorldSchema>;
  private deconstructedParts: Map<string, DeconstructedPart[]> = new Map();

  constructor(world: World<WorldSchema>) {
    this.world = world;
    log.info('DeconstructionSystem initialized - Reverse Synthesis active');
  }

  /**
   * Deconstruct a creature into its generational parts
   */
  deconstructCreature(entity: import('miniplex').With<WorldSchema, keyof WorldSchema>): DeconstructedPart[] {
    const evolutionData = (entity as any).evolutionaryCreature as EvolutionaryCreature;
    
    if (!evolutionData || !entity.transform) {
      log.warn('Cannot deconstruct entity - no evolutionary data');
      return [];
    }

    const parts: DeconstructedPart[] = [];
    const generation = evolutionData.generation;
    const archetype = evolutionData.archetype.baseSpecies;

    log.info('Deconstructing creature', {
      archetype,
      generation,
      position: entity.transform.position.toArray()
    });

    // Gen 3 creature breaks into Gen 2 parts, which break into Gen 1 archetypes
    if (generation >= 3) {
      // Break into Gen 2 synthesized components
      parts.push(...this.extractGen2Components(evolutionData));
    } else if (generation >= 2) {
      // Break into Gen 1 archetypal parts
      parts.push(...this.extractGen1Archetypes(evolutionData));
    } else {
      // Gen 1 breaks into raw materials
      parts.push(...this.extractRawMaterials(evolutionData));
    }

    // Spawn parts as harvestable resources in world
    for (const part of parts) {
      this.spawnPartEntity(part, entity.transform.position);
    }

    // Remove original entity
    this.world.remove(entity);

    log.info('Creature deconstructed', {
      archetype,
      generation,
      partsYielded: parts.length,
      partNames: parts.map(p => p.name)
    });

    return parts;
  }

  /**
   * Extract Gen 2 components from Gen 3+ creature
   */
  private extractGen2Components(creature: EvolutionaryCreature): DeconstructedPart[] {
    const parts: DeconstructedPart[] = [];
    
    // Analyze dominant traits to determine component types
    const traits = creature.currentTraits;
    
    // High manipulation trait → yields "manipulator appendage"
    if (traits[1] > 0.6) {
      parts.push({
        name: this.generateTaxonomicName('manipulator', creature.archetype.baseSpecies, 2),
        generation: 2,
        sourceArchetype: creature.archetype.baseSpecies,
        properties: {
          hardness: 0.4 + (traits[8] * 0.3), // Defense affects hardness
          volume: 0.2,
          weight: 0.3 + (traits[1] * 0.4),
          organic: true,
          toxicity: traits[9] || 0
        },
        traitSignature: [traits[1], traits[4], traits[8]], // Manipulation, sensing, defense
        usableFor: this.deriveUsage({ hardness: 0.4, volume: 0.2, organic: true })
      });
    }

    // High social trait → yields "coordination organ"
    if (traits[3] > 0.6) {
      parts.push({
        name: this.generateTaxonomicName('coordinator', creature.archetype.baseSpecies, 2),
        generation: 2,
        sourceArchetype: creature.archetype.baseSpecies,
        properties: {
          hardness: 0.2,
          volume: 0.3,
          weight: 0.2,
          organic: true,
          toxicity: 0
        },
        traitSignature: [traits[3], traits[4]], // Social, sensing
        usableFor: this.deriveUsage({ hardness: 0.2, volume: 0.3, organic: true })
      });
    }

    // High defense trait → yields "armor plating"
    if (traits[8] > 0.6) {
      parts.push({
        name: this.generateTaxonomicName('armor', creature.archetype.baseSpecies, 2),
        generation: 2,
        sourceArchetype: creature.archetype.baseSpecies,
        properties: {
          hardness: 0.7 + (traits[8] * 0.3),
          volume: 0.4,
          weight: 0.6 + (traits[8] * 0.4),
          organic: false,
          toxicity: 0
        },
        traitSignature: [traits[8], traits[0]], // Defense, mobility
        usableFor: this.deriveUsage({ hardness: 0.9, volume: 0.4, organic: false })
      });
    }

    // Always yield some base biomass
    parts.push({
      name: this.generateTaxonomicName('biomass', creature.archetype.baseSpecies, 2),
      generation: 2,
      sourceArchetype: creature.archetype.baseSpecies,
      properties: {
        hardness: 0.3,
        volume: 1.0,
        weight: 0.5,
        organic: true,
        toxicity: traits[9] || 0
      },
      traitSignature: traits,
      usableFor: ['fuel', 'fertilizer', 'food']
    });

    return parts;
  }

  /**
   * Extract Gen 1 archetypal parts from Gen 2 creature
   */
  private extractGen1Archetypes(creature: EvolutionaryCreature): DeconstructedPart[] {
    const parts: DeconstructedPart[] = [];
    
    // Gen 2 breaks into Gen 1 base archetypes
    parts.push({
      name: `${creature.archetype.baseSpecies}_flesh`,
      generation: 1,
      sourceArchetype: creature.archetype.baseSpecies,
      properties: {
        hardness: 0.3,
        volume: 0.8,
        weight: 0.4,
        organic: true,
        toxicity: 0
      },
      traitSignature: creature.currentTraits,
      usableFor: ['food', 'leather', 'fertilizer']
    });

    parts.push({
      name: `${creature.archetype.baseSpecies}_bone`,
      generation: 1,
      sourceArchetype: creature.archetype.baseSpecies,
      properties: {
        hardness: 0.6,
        volume: 0.3,
        weight: 0.3,
        organic: true,
        toxicity: 0
      },
      traitSignature: [creature.currentTraits[8], creature.currentTraits[0]], // Defense, mobility
      usableFor: ['tool_handle', 'ornament', 'fertilizer']
    });

    return parts;
  }

  /**
   * Extract raw materials from Gen 1 creature
   */
  private extractRawMaterials(creature: EvolutionaryCreature): DeconstructedPart[] {
    // Gen 1 archetypes yield basic organic materials
    return [
      {
        name: 'organic_matter',
        generation: 0,
        sourceArchetype: creature.archetype.baseSpecies,
        properties: {
          hardness: 0.2,
          volume: 0.5,
          weight: 0.3,
          organic: true,
          toxicity: 0
        },
        traitSignature: [],
        usableFor: ['compost', 'fuel']
      }
    ];
  }

  /**
   * Generate taxonomic name automatically (no hardcoded names)
   */
  private generateTaxonomicName(partType: string, sourceSpecies: string, generation: number): string {
    return `${sourceSpecies}_${partType}_gen${generation}`;
  }

  /**
   * Derive usage from properties (NOT hardcoded)
   */
  private deriveUsage(props: { hardness: number; volume: number; organic: boolean }): string[] {
    const usages: string[] = [];

    // Hardness determines structural use
    if (props.hardness > 0.7) {
      usages.push('armor', 'tool_head', 'building_material');
    } else if (props.hardness > 0.4) {
      usages.push('tool_handle', 'weapon_shaft');
    }

    // Volume determines container use
    if (props.volume > 0.5) {
      usages.push('container', 'storage');
    }

    // Organic vs inorganic
    if (props.organic) {
      usages.push('food', 'fertilizer', 'fuel');
    } else {
      usages.push('construction', 'crafting');
    }

    return usages;
  }

  /**
   * Spawn deconstructed part as harvestable entity in world
   */
  private spawnPartEntity(part: DeconstructedPart, position: THREE.Vector3): void {
    // Create visual representation
    const geometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
    const material = new THREE.MeshStandardMaterial({
      color: part.properties.organic ? 0x8B4513 : 0x808080,
      roughness: part.properties.hardness,
      metalness: part.properties.organic ? 0 : 0.5
    });
    const mesh = new THREE.Mesh(geometry, material);

    // Scatter parts slightly
    const offset = new THREE.Vector3(
      (Math.random() - 0.5) * 2,
      0.5,
      (Math.random() - 0.5) * 2
    );

    const partEntity = this.world.add({
      transform: {
        position: position.clone().add(offset),
        rotation: new THREE.Euler(0, Math.random() * Math.PI * 2, 0),
        scale: new THREE.Vector3(1, 1, 1)
      },
      resource: {
        materialType: 'organic' as any,
        quantity: Math.floor(part.properties.volume * 10),
        purity: 1 - (part.properties.toxicity || 0),
        magneticRadius: 5,
        harvestable: true
      },
      render: {
        mesh,
        material,
        visible: true,
        castShadow: true,
        receiveShadow: true
      }
    });

    // Store part data on entity
    (partEntity as any).deconstructedPart = part;

    log.debug('Spawned deconstructed part', {
      name: part.name,
      generation: part.generation,
      properties: part.properties
    });
  }

  /**
   * Deconstruct a building (similar logic)
   */
  deconstructBuilding(entity: import('miniplex').With<WorldSchema, keyof WorldSchema>): DeconstructedPart[] {
    // TODO: Implement building deconstruction
    // Buildings break into their assembly parts
    log.info('Building deconstruction not yet implemented');
    return [];
  }
}

export default DeconstructionSystem;

