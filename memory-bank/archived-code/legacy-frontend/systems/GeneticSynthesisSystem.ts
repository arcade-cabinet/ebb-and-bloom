/**
 * Genetic Synthesis System - Emergent taxonomy through trait compatibility
 * Generates creature names, morphology, and textures from genetic combinations
 */

import * as THREE from 'three';
import { createNoise2D } from 'simplex-noise';
import { log } from '../utils/Logger';
import { gameClock } from './GameClock';
import type { EvolutionaryCreature, CreatureArchetype } from './CreatureArchetypeSystem';

// Genetic compatibility matrix for trait synthesis
interface GeneticCompatibility {
  traitA: number;               // Index of first trait
  traitB: number;               // Index of second trait  
  compatibility: number;        // 0-1, how well they combine
  morphologicalEffect: MorphologicalChange;
  behavioralEffect: BehavioralChange;
  emergentName: string;         // What this combination gets called
}

interface MorphologicalChange {
  bodyProportions: {
    height: number;             // Tall/short modifier (-1 to 1)
    width: number;              // Thin/fat modifier (-1 to 1) 
    limbLength: number;         // Long/short appendages (-1 to 1)
    limbCount: number;          // Additional appendages (0-4)
  };
  
  specializations: {
    manipulators: number;       // Hand/claw development (0-1)
    sensoryOrgans: number;      // Eye/ear enhancement (0-1)
    locomotionFeatures: number; // Wings/fins/legs (0-1) 
    defensiveStructures: number; // Armor/spines/shells (0-1)
  };
  
  textureModifiers: {
    roughness: number;          // Smooth to rough skin (-1 to 1)
    pattern: 'solid' | 'spotted' | 'striped' | 'mottled' | 'iridescent';
    colorShift: number;         // Hue adjustment (-1 to 1)
    emissiveness: number;       // Bioluminescence (0-1)
  };
}

interface BehavioralChange {
  yukaModifiers: {
    wanderIntensity: number;    // How much they explore
    flockTendency: number;      // Pack formation likelihood  
    territorialness: number;    // Area defense strength
    curiosity: number;          // Investigation behaviors
    avoidance: number;          // Threat response intensity
  };
  
  activityPatterns: {
    constructionUrge: number;   // Building/modification behaviors
    toolExperimentation: number; // Object manipulation
    resourceHoarding: number;   // Collection behaviors
    symbioticSeeking: number;   // Cooperation with other species
  };
}

// Emergent naming system (replaces predetermined names)
interface NamingRules {
  morphologyDescriptors: {
    size: Record<string, string[]>;      // 'tiny' -> ['mote', 'speck', 'pip']
    proportion: Record<string, string[]>; // 'elongated' -> ['stretch', 'reed', 'vine']
    appendages: Record<string, string[]>; // 'many_limbed' -> ['crawler', 'dancer', 'reacher']
  };
  
  behaviorDescriptors: {
    social: Record<string, string[]>;     // 'pack_forming' -> ['bonder', 'cluster', 'chorus']
    activity: Record<string, string[]>;   // 'construction' -> ['builder', 'shaper', 'weaver']
    movement: Record<string, string[]>;   // 'aerial' -> ['glider', 'soarer', 'drift']
  };
  
  poeticElements: string[];              // Haiku-style naming components
}

class GeneticSynthesisSystem {
  private compatibilityMatrix: GeneticCompatibility[] = [];
  private namingRules: NamingRules;
  private synthesisNoise = createNoise2D();
  
  constructor() {
    this.initializeCompatibilityMatrix();
    this.initializeNamingRules();
    log.info('GeneticSynthesisSystem initialized');
  }
  
  private initializeCompatibilityMatrix(): void {
    // Example trait compatibility: FlipperFeet + StorageSacs = Aquatic Hoarder
    this.compatibilityMatrix.push({
      traitA: 0, // FlipperFeet
      traitB: 6, // StorageSacs  
      compatibility: 0.8,
      morphologicalEffect: {
        bodyProportions: {
          height: -0.2,     // Shorter for swimming
          width: 0.3,       // Wider for storage
          limbLength: 0.1,  // Longer limbs for swimming
          limbCount: 0      // No extra limbs
        },
        specializations: {
          manipulators: 0.7,        // Good for collecting
          sensoryOrgans: 0.4,
          locomotionFeatures: 0.9,  // Swimming adaptations
          defensiveStructures: 0.3
        },
        textureModifiers: {
          roughness: -0.3,          // Smooth for water
          pattern: 'mottled',
          colorShift: 0.2,          // Bluer
          emissiveness: 0.0
        }
      },
      behavioralEffect: {
        yukaModifiers: {
          wanderIntensity: 0.4,     // Less wandering
          flockTendency: 0.6,       // Moderate social
          territorialness: 0.8,     // Defends resource caches
          curiosity: 0.7,           // Seeks new resources
          avoidance: 0.5
        },
        activityPatterns: {
          constructionUrge: 0.3,    // Some building (caches)
          toolExperimentation: 0.5,
          resourceHoarding: 0.9,    // Primary behavior
          symbioticSeeking: 0.2
        }
      },
      emergentName: 'cache_swimmer'
    });
    
    // DrillArms + EchoSonar = Deep Miner
    this.compatibilityMatrix.push({
      traitA: 2, // DrillArms
      traitB: 4, // EchoSonar
      compatibility: 0.9,
      morphologicalEffect: {
        bodyProportions: {
          height: 0.1,      // Slightly taller
          width: 0.4,       // Much broader/stronger
          limbLength: -0.1, // Shorter, stockier
          limbCount: 2      // Extra drilling appendages
        },
        specializations: {
          manipulators: 0.9,        // Excellent drilling
          sensoryOrgans: 0.8,       // Enhanced detection
          locomotionFeatures: 0.3,  // Less mobile
          defensiveStructures: 0.7  // Armored for underground
        },
        textureModifiers: {
          roughness: 0.6,           // Rough, armored skin
          pattern: 'striped',       // Mining wear patterns
          colorShift: -0.2,         // Earthier colors
          emissiveness: 0.1         // Faint glow from drill activity
        }
      },
      behavioralEffect: {
        yukaModifiers: {
          wanderIntensity: 0.2,     // Focused movement
          flockTendency: 0.4,       // Loose coordination
          territorialness: 0.9,     // Highly territorial over resources
          curiosity: 0.8,           // Seeks hidden resources
          avoidance: 0.3            // Less fearful
        },
        activityPatterns: {
          constructionUrge: 0.7,    // Tunnel construction
          toolExperimentation: 0.8, // Tool/drill mastery
          resourceHoarding: 0.6,    // Collects rare materials
          symbioticSeeking: 0.1     // Mostly independent
        }
      },
      emergentName: 'deep_seeker'
    });
    
    log.info('Genetic compatibility matrix initialized', {
      compatibilityRules: this.compatibilityMatrix.length
    });
  }
  
  private initializeNamingRules(): void {
    this.namingRules = {
      morphologyDescriptors: {
        size: {
          'tiny': ['mote', 'wisp', 'fleck', 'spark'],
          'small': ['pip', 'bud', 'gem', 'pearl'],  
          'medium': ['form', 'shape', 'being', 'walker'],
          'large': ['titan', 'mass', 'bulk', 'giant'],
          'huge': ['colossus', 'mountain', 'leviathan']
        },
        proportion: {
          'elongated': ['stretch', 'reed', 'vine', 'thread'],
          'compact': ['stone', 'knot', 'core', 'heart'],
          'balanced': ['form', 'grace', 'harmony', 'flow'],
          'asymmetric': ['shift', 'lean', 'twist', 'spiral']
        },
        appendages: {
          'few_limbs': ['simple', 'clean', 'pure', 'direct'],
          'many_limbs': ['dancer', 'weaver', 'crawler', 'reacher'],
          'specialized': ['tool', 'grip', 'probe', 'sensor'],
          'defensive': ['guard', 'shield', 'armor', 'spine']
        }
      },
      
      behaviorDescriptors: {
        social: {
          'solitary': ['lone', 'single', 'hermit', 'sage'],
          'family': ['kin', 'bond', 'clan', 'house'],
          'pack': ['choir', 'band', 'legion', 'storm'],
          'communal': ['hive', 'collective', 'unity', 'mesh']
        },
        activity: {
          'foraging': ['seeker', 'finder', 'gatherer', 'hunter'],
          'building': ['shaper', 'weaver', 'architect', 'mason'],
          'wandering': ['drifter', 'nomad', 'wanderer', 'roamer'],
          'hoarding': ['keeper', 'collector', 'hoarder', 'vault']
        },
        movement: {
          'ground': ['walker', 'runner', 'crawler', 'stepper'],
          'aerial': ['glider', 'soarer', 'winged', 'drifter'],
          'aquatic': ['swimmer', 'flow', 'current', 'tide'],
          'climbing': ['climber', 'clinger', 'scaler', 'grip']
        }
      },
      
      poeticElements: [
        'whisper', 'echo', 'shadow', 'gleam', 'shimmer', 'murmur',
        'dance', 'song', 'dream', 'memory', 'sigh', 'breath',
        'thorn', 'bloom', 'ebb', 'flow', 'pulse', 'rhythm'
      ]
    };
    
    log.info('Naming rules initialized for emergent taxonomy');
  }
  
  /**
   * Synthesize new creature form from trait combination
   */
  synthesizeCreatureForm(traits: number[]): {
    morphology: MorphologicalChange;
    behavior: BehavioralChange;
    emergentName: string;
    compatibility: number;
  } {
    
    // Find best trait compatibility
    let bestCompatibility = 0;
    let bestSynthesis: GeneticCompatibility | null = null;
    
    for (const compat of this.compatibilityMatrix) {
      const traitAStrength = traits[compat.traitA] || 0;
      const traitBStrength = traits[compat.traitB] || 0;
      
      // Calculate synthesis strength
      const synthesisStrength = compat.compatibility * 
        Math.min(traitAStrength, traitBStrength) * 
        Math.sqrt(traitAStrength * traitBStrength);
      
      if (synthesisStrength > bestCompatibility) {
        bestCompatibility = synthesisStrength;
        bestSynthesis = compat;
      }
    }
    
    if (bestSynthesis) {
      // Use defined compatibility
      return {
        morphology: bestSynthesis.morphologicalEffect,
        behavior: bestSynthesis.behavioralEffect,
        emergentName: bestSynthesis.emergentName,
        compatibility: bestCompatibility
      };
    } else {
      // Generate novel combination
      return this.generateNovelSynthesis(traits);
    }
  }
  
  private generateNovelSynthesis(traits: number[]): {
    morphology: MorphologicalChange;
    behavior: BehavioralChange; 
    emergentName: string;
    compatibility: number;
  } {
    
    // Procedural morphology based on trait values
    const morphology: MorphologicalChange = {
      bodyProportions: {
        height: (traits[0] || 0) * 2 - 1,    // First trait affects height
        width: (traits[1] || 0) * 2 - 1,     // Second trait affects width
        limbLength: (traits[2] || 0) * 2 - 1, // Third trait affects limb proportions
        limbCount: Math.floor((traits[3] || 0) * 4) // Fourth trait adds appendages
      },
      specializations: {
        manipulators: traits[4] || 0,         // Fifth trait = tool use
        sensoryOrgans: traits[5] || 0,        // Sixth trait = enhanced senses
        locomotionFeatures: traits[6] || 0,   // Seventh trait = movement
        defensiveStructures: traits[7] || 0   // Eighth trait = defense
      },
      textureModifiers: {
        roughness: (traits[8] || 0) * 2 - 1,
        pattern: this.selectPattern(traits[9] || 0),
        colorShift: (traits[0] || 0) * 2 - 1, // Reuse first trait for color
        emissiveness: Math.max(0, (traits[1] || 0) - 0.7) // Emissive when second trait > 0.7
      }
    };
    
    // Behavioral synthesis
    const behavior: BehavioralChange = {
      yukaModifiers: {
        wanderIntensity: traits[2] || 0.5,
        flockTendency: traits[3] || 0.3,
        territorialness: traits[7] || 0.4,    // Defensive trait affects territory
        curiosity: traits[4] || 0.5,          // Tool use trait affects curiosity
        avoidance: 1 - (traits[7] || 0.5)     // Inverse of defensive trait
      },
      activityPatterns: {
        constructionUrge: traits[4] * traits[3],           // Tool use * social
        toolExperimentation: traits[4] || 0,
        resourceHoarding: traits[6] || 0,                  // Storage trait
        symbioticSeeking: traits[3] * traits[5]           // Social * sensory
      }
    };
    
    // Generate emergent name from trait combination
    const emergentName = this.generateEmergentName(traits, morphology, behavior);
    
    return {
      morphology,
      behavior,
      emergentName,
      compatibility: 0.5 // Novel combinations have moderate compatibility
    };
  }
  
  private selectPattern(patternValue: number): MorphologicalChange['textureModifiers']['pattern'] {
    const patterns: MorphologicalChange['textureModifiers']['pattern'][] = [
      'solid', 'spotted', 'striped', 'mottled', 'iridescent'
    ];
    
    const index = Math.floor(patternValue * patterns.length);
    return patterns[Math.min(index, patterns.length - 1)];
  }
  
  /**
   * Generate emergent creature name from trait synthesis
   * Combines systematic naming with haiku-like poetry
   */
  generateEmergentName(
    traits: number[],
    morphology: MorphologicalChange,
    behavior: BehavioralChange
  ): string {
    
    // Determine morphological category
    let sizeCategory = 'medium';
    const height = morphology.bodyProportions.height;
    const width = morphology.bodyProportions.width;
    
    if (height < -0.5 && width < -0.5) sizeCategory = 'tiny';
    else if (height < 0 && width < 0) sizeCategory = 'small';
    else if (height > 0.5 && width > 0.5) sizeCategory = 'huge';
    else if (height > 0 || width > 0) sizeCategory = 'large';
    
    // Determine proportion category
    let proportionCategory = 'balanced';
    if (Math.abs(height) > Math.abs(width) + 0.3) proportionCategory = 'elongated';
    else if (Math.abs(width) > Math.abs(height) + 0.3) proportionCategory = 'compact';
    else if (morphology.bodyProportions.limbCount > 2) proportionCategory = 'asymmetric';
    
    // Determine appendage category  
    let appendageCategory = 'few_limbs';
    if (morphology.bodyProportions.limbCount > 2) appendageCategory = 'many_limbs';
    if (morphology.specializations.manipulators > 0.7) appendageCategory = 'specialized';
    if (morphology.specializations.defensiveStructures > 0.7) appendageCategory = 'defensive';
    
    // Determine behavioral category
    let socialCategory = 'solitary';
    if (behavior.yukaModifiers.flockTendency > 0.7) socialCategory = 'pack';
    else if (behavior.yukaModifiers.flockTendency > 0.4) socialCategory = 'family';
    
    let activityCategory = 'foraging';
    if (behavior.activityPatterns.constructionUrge > 0.6) activityCategory = 'building';
    else if (behavior.activityPatterns.resourceHoarding > 0.6) activityCategory = 'hoarding';
    else if (behavior.yukaModifiers.wanderIntensity > 0.7) activityCategory = 'wandering';
    
    let movementCategory = 'ground';
    if (morphology.specializations.locomotionFeatures > 0.7) {
      movementCategory = traits[0] > 0.5 ? 'aquatic' : 'aerial'; // Determine based on first trait
    } else if (morphology.bodyProportions.limbCount > 6) {
      movementCategory = 'climbing';
    }
    
    // Combine descriptors
    const morphDescriptor = this.selectRandom(this.namingRules.morphologyDescriptors.size[sizeCategory]) +
      '_' + this.selectRandom(this.namingRules.morphologyDescriptors.appendages[appendageCategory]);
    
    const behaviorDescriptor = this.selectRandom(this.namingRules.behaviorDescriptors.social[socialCategory]) +
      '_' + this.selectRandom(this.namingRules.behaviorDescriptors.activity[activityCategory]);
    
    // Add poetic element for uniqueness
    const poeticElement = this.selectRandom(this.namingRules.poeticElements);
    
    const emergentName = `${morphDescriptor}_${behaviorDescriptor}_${poeticElement}`;
    
    log.info('Generated emergent creature name', {
      name: emergentName,
      traits: traits.slice(0, 5), // Log first 5 traits
      categories: {
        size: sizeCategory,
        social: socialCategory,
        activity: activityCategory
      }
    });
    
    return emergentName;
  }
  
  private selectRandom(options: string[]): string {
    if (!options || options.length === 0) return 'unknown';
    return options[Math.floor(Math.random() * options.length)];
  }
  
  /**
   * Apply genetic synthesis to modify creature mesh based on evolved traits
   */
  morphCreatureMesh(
    baseMesh: THREE.Group,
    synthesis: ReturnType<typeof this.synthesizeCreatureForm>
  ): THREE.Group {
    
    const morphology = synthesis.morphology;
    const evolutionIntensity = synthesis.compatibility;
    
    // Apply body proportion changes
    baseMesh.scale.set(
      1 + morphology.bodyProportions.width * 0.5 * evolutionIntensity,
      1 + morphology.bodyProportions.height * 0.5 * evolutionIntensity,
      1 + morphology.bodyProportions.limbLength * 0.3 * evolutionIntensity
    );
    
    // Add extra appendages if evolved
    if (morphology.bodyProportions.limbCount > 0) {
      this.addEvolutionaryAppendages(
        baseMesh, 
        morphology.bodyProportions.limbCount, 
        morphology.specializations,
        evolutionIntensity
      );
    }
    
    // Apply texture modifications
    this.applyEvolutionaryTextures(baseMesh, morphology.textureModifiers, evolutionIntensity);
    
    log.debug('Creature mesh morphed by genetic synthesis', {
      name: synthesis.emergentName,
      compatibility: synthesis.compatibility,
      appendagesAdded: morphology.bodyProportions.limbCount
    });
    
    return baseMesh;
  }
  
  private addEvolutionaryAppendages(
    mesh: THREE.Group,
    appendageCount: number,
    specializations: MorphologicalChange['specializations'],
    intensity: number
  ): void {
    
    for (let i = 0; i < Math.floor(appendageCount * intensity); i++) {
      const angle = (i / appendageCount) * Math.PI * 2;
      const radius = 0.3;
      
      let appendageGeometry: THREE.BufferGeometry;
      let appendageMaterial: THREE.Material;
      
      // Appendage type based on specializations
      if (specializations.manipulators > 0.7) {
        // Tool-use appendages (longer, more dexterous)
        appendageGeometry = new THREE.CylinderGeometry(0.02, 0.06, 0.4);
        appendageMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
      } else if (specializations.defensiveStructures > 0.7) {
        // Defensive appendages (shorter, armored)
        appendageGeometry = new THREE.ConeGeometry(0.08, 0.2);
        appendageMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
      } else {
        // General appendages
        appendageGeometry = new THREE.CylinderGeometry(0.03, 0.04, 0.25);
        appendageMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
      }
      
      const appendage = new THREE.Mesh(appendageGeometry, appendageMaterial);
      appendage.position.set(
        Math.cos(angle) * radius,
        -0.1,
        Math.sin(angle) * radius
      );
      appendage.rotation.z = angle;
      appendage.castShadow = true;
      
      mesh.add(appendage);
    }
  }
  
  private applyEvolutionaryTextures(
    mesh: THREE.Group,
    textureModifiers: MorphologicalChange['textureModifiers'],
    intensity: number
  ): void {
    
    mesh.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshLambertMaterial) {
        const material = child.material as THREE.MeshLambertMaterial;
        
        // Apply color shift
        const currentColor = material.color;
        const hsl = { h: 0, s: 0, l: 0 };
        currentColor.getHSL(hsl);
        
        hsl.h = (hsl.h + textureModifiers.colorShift * 0.2 * intensity) % 1;
        material.color.setHSL(hsl.h, hsl.s, hsl.l);
        
        // Apply emissiveness
        if (textureModifiers.emissiveness > 0) {
          material.emissive = currentColor.clone().multiplyScalar(textureModifiers.emissiveness * intensity * 0.3);
        }
        
        // Roughness would be applied to StandardMaterial in production
      }
    });
  }
  
  /**
   * Evolve creature over generations based on environmental pressure
   */
  evolveCreature(
    creature: EvolutionaryCreature,
    environmentalPressure: number[],
    generation: number
  ): { evolved: boolean; newName?: string; changes: MutationEvent[] } {
    
    const changes: MutationEvent[] = [];
    let significantEvolution = false;
    
    for (let traitIndex = 0; traitIndex < creature.currentTraits.length; traitIndex++) {
      const inheritanceRate = creature.archetype.traitInheritance[traitIndex];
      const pressure = environmentalPressure[traitIndex] || 0;
      const mutationStrength = creature.archetype.mutationRate;
      
      // Calculate trait change
      const change = inheritanceRate * pressure * mutationStrength * 0.1;
      
      if (Math.abs(change) > 0.02) { // Minimum change threshold
        const oldValue = creature.currentTraits[traitIndex];
        creature.currentTraits[traitIndex] = Math.max(0, Math.min(1, oldValue + change));
        
        changes.push({
          generation,
          traitIndex,
          previousValue: oldValue,
          newValue: creature.currentTraits[traitIndex],
          cause: 'environmental_pressure',
          significance: Math.abs(change)
        });
        
        if (Math.abs(change) > 0.1) {
          significantEvolution = true;
        }
      }
    }
    
    creature.mutationHistory.push(...changes);
    
    // Generate new name if significantly evolved
    let newName: string | undefined;
    if (significantEvolution) {
      const synthesis = this.synthesizeCreatureForm(creature.currentTraits);
      newName = synthesis.emergentName;
      
      log.info('Creature evolved significantly', {
        oldName: creature.archetype.baseSpecies,
        newName,
        generation,
        traitChanges: changes.length,
        compatibility: synthesis.compatibility
      });
    }
    
    return {
      evolved: significantEvolution,
      newName,
      changes
    };
  }
}

export default GeneticSynthesisSystem;
export type { GeneticCompatibility, MorphologicalChange, BehavioralChange, EvolutionaryCreature, MutationEvent };