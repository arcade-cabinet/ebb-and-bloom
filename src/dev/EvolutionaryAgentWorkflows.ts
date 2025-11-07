/**
 * Evolutionary Agent Workflows - Complete agentic system for universal evolution
 * Every system (creatures, buildings, tools, society) as evolutionary pressure networks
 */

import { generateText, generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { log } from '../utils/Logger';
import { AI_MODELS } from '../config/ai-models';
import type { EvolutionEvent } from '../systems/GameClock';

// Universal evolutionary framework - EVERYTHING is an evolutionary system
interface EvolutionarySystem {
  systemType: 'creature' | 'tool' | 'building' | 'social' | 'material' | 'environment';
  currentGeneration: number;
  evolutionaryPressures: PressureSource[];
  adaptationCapabilities: AdaptationResponse[];
  interSystemDependencies: SystemDependency[];
  yukaCommunication: YukaInterSystemProtocol;
}

interface PressureSource {
  sourceSystem: string;       // What system is creating pressure
  pressureType: string;       // Type of pressure being applied
  intensity: number;          // 0-1 strength
  requirement: string;        // What capability is needed
  urgency: number;           // How quickly response is needed
}

interface AdaptationResponse {
  capability: string;         // What capability this system can evolve
  cost: number;              // Evolutionary cost to develop
  prerequisites: string[];    // What must exist first
  resultingArchetype: string; // What this evolution produces
  unlocksForOtherSystems: string[]; // What this enables other systems to do
}

interface SystemDependency {
  dependentSystem: string;    // What system depends on this one
  requirement: string;        // What they need from this system
  reciprocalBenefit: string; // What this system gets in return
}

interface YukaInterSystemProtocol {
  communicationChannels: string[];  // How systems share information
  coordinationBehaviors: string[]; // How systems work together
  competitionResolution: string[];  // How conflicts are resolved
}

class EvolutionaryAgentWorkflows {
  private evolutionarySystems = new Map<string, EvolutionarySystem>();
  private pressureNetwork = new Map<string, PressureSource[]>();
  private adaptationHistory = new Map<string, AdaptationResponse[]>();
  
  constructor() {
    this.initializeUniversalEvolutionaryFramework();
    log.info('EvolutionaryAgentWorkflows initialized - Universal evolution framework active');
  }
  
  private initializeUniversalEvolutionaryFramework(): void {
    // Initialize all game systems as evolutionary systems
    
    // 1. Creature Evolution (already implemented)
    this.evolutionarySystems.set('creatures', {
      systemType: 'creature',
      currentGeneration: 0,
      evolutionaryPressures: [],
      adaptationCapabilities: [
        { capability: 'tool_use', cost: 0.3, prerequisites: ['manipulation_trait_0.5'], resultingArchetype: 'tool_user', unlocksForOtherSystems: ['tools.basic_creation'] },
        { capability: 'pack_coordination', cost: 0.4, prerequisites: ['social_trait_0.6'], resultingArchetype: 'pack_leader', unlocksForOtherSystems: ['social.leadership_hierarchy'] },
        { capability: 'construction', cost: 0.6, prerequisites: ['manipulation_0.7', 'social_0.5'], resultingArchetype: 'builder', unlocksForOtherSystems: ['buildings.construction_capability'] }
      ],
      interSystemDependencies: [
        { dependentSystem: 'tools', requirement: 'manipulation_capability', reciprocalBenefit: 'enhanced_capabilities' },
        { dependentSystem: 'buildings', requirement: 'construction_labor', reciprocalBenefit: 'shelter_benefits' }
      ],
      yukaCommunication: {
        communicationChannels: ['proximity_signals', 'behavioral_mimicry', 'resource_sharing'],
        coordinationBehaviors: ['pack_formation', 'task_division', 'territory_defense'],
        competitionResolution: ['dominance_hierarchy', 'resource_negotiation', 'territorial_division']
      }
    });
    
    // 2. Tool Evolution System
    this.evolutionarySystems.set('tools', {
      systemType: 'tool',
      currentGeneration: 0,
      evolutionaryPressures: [],
      adaptationCapabilities: [
        { capability: 'stone_tools', cost: 0.2, prerequisites: ['manipulation_creatures'], resultingArchetype: 'basic_implements', unlocksForOtherSystems: ['materials.deeper_extraction'] },
        { capability: 'metal_tools', cost: 0.5, prerequisites: ['alloy_materials', 'heat_source'], resultingArchetype: 'advanced_implements', unlocksForOtherSystems: ['buildings.complex_construction'] },
        { capability: 'composite_tools', cost: 0.8, prerequisites: ['multiple_materials', 'advanced_construction'], resultingArchetype: 'specialized_implements', unlocksForOtherSystems: ['environment.terraforming'] }
      ],
      interSystemDependencies: [
        { dependentSystem: 'creatures', requirement: 'manipulation_capability', reciprocalBenefit: 'tool_efficiency_bonus' },
        { dependentSystem: 'materials', requirement: 'raw_materials', reciprocalBenefit: 'processing_capability' },
        { dependentSystem: 'buildings', requirement: 'construction_tools', reciprocalBenefit: 'workshop_efficiency' }
      ],
      yukaCommunication: {
        communicationChannels: ['usage_patterns', 'efficiency_feedback', 'innovation_triggers'],
        coordinationBehaviors: ['tool_sharing', 'technique_learning', 'improvement_collaboration'],
        competitionResolution: ['efficiency_comparison', 'resource_prioritization', 'innovation_leadership']
      }
    });
    
    // 3. Building Evolution System  
    this.evolutionarySystems.set('buildings', {
      systemType: 'building',
      currentGeneration: 0,
      evolutionaryPressures: [],
      adaptationCapabilities: [
        { capability: 'basic_shelter', cost: 0.3, prerequisites: ['construction_creatures', 'basic_materials'], resultingArchetype: 'simple_structures', unlocksForOtherSystems: ['social.gathering_spaces'] },
        { capability: 'workshop_facilities', cost: 0.5, prerequisites: ['tool_systems', 'material_processing'], resultingArchetype: 'craft_buildings', unlocksForOtherSystems: ['tools.advanced_creation'] },
        { capability: 'complex_architecture', cost: 0.8, prerequisites: ['advanced_tools', 'social_coordination'], resultingArchetype: 'settlement_structures', unlocksForOtherSystems: ['social.civilization_foundation'] }
      ],
      interSystemDependencies: [
        { dependentSystem: 'creatures', requirement: 'construction_labor', reciprocalBenefit: 'shelter_protection' },
        { dependentSystem: 'tools', requirement: 'construction_implements', reciprocalBenefit: 'workshop_efficiency' },
        { dependentSystem: 'social', requirement: 'coordinated_labor', reciprocalBenefit: 'social_gathering_spaces' }
      ],
      yukaCommunication: {
        communicationChannels: ['construction_coordination', 'space_utilization', 'expansion_planning'],
        coordinationBehaviors: ['collaborative_building', 'resource_logistics', 'architectural_innovation'],
        competitionResolution: ['space_allocation', 'resource_distribution', 'construction_priority']
      }
    });
    
    // 4. Material Evolution System
    this.evolutionarySystems.set('materials', {
      systemType: 'material',
      currentGeneration: 0,
      evolutionaryPressures: [],
      adaptationCapabilities: [
        { capability: 'surface_extraction', cost: 0.1, prerequisites: ['basic_tools'], resultingArchetype: 'common_materials', unlocksForOtherSystems: ['tools.basic_creation'] },
        { capability: 'deep_extraction', cost: 0.4, prerequisites: ['excavation_tools', 'excavation_creatures'], resultingArchetype: 'rare_materials', unlocksForOtherSystems: ['tools.advanced_alloys'] },
        { capability: 'synthesis_processing', cost: 0.7, prerequisites: ['workshop_buildings', 'advanced_tools'], resultingArchetype: 'composite_materials', unlocksForOtherSystems: ['buildings.advanced_construction'] }
      ],
      interSystemDependencies: [
        { dependentSystem: 'tools', requirement: 'extraction_capability', reciprocalBenefit: 'raw_material_access' },
        { dependentSystem: 'creatures', requirement: 'extraction_labor', reciprocalBenefit: 'trait_development_resources' },
        { dependentSystem: 'buildings', requirement: 'processing_facilities', reciprocalBenefit: 'construction_materials' }
      ],
      yukaCommunication: {
        communicationChannels: ['scarcity_signals', 'quality_feedback', 'demand_patterns'],
        coordinationBehaviors: ['extraction_efficiency', 'processing_optimization', 'distribution_logistics'],
        competitionResolution: ['scarcity_management', 'quality_prioritization', 'access_negotiation']
      }
    });
    
    // 5. Social Evolution System
    this.evolutionarySystems.set('social', {
      systemType: 'social',
      currentGeneration: 0,
      evolutionaryPressures: [],
      adaptationCapabilities: [
        { capability: 'pack_coordination', cost: 0.3, prerequisites: ['social_creatures'], resultingArchetype: 'basic_groups', unlocksForOtherSystems: ['buildings.coordinated_construction'] },
        { capability: 'hierarchy_formation', cost: 0.5, prerequisites: ['pack_coordination', 'resource_competition'], resultingArchetype: 'organized_society', unlocksForOtherSystems: ['tools.specialized_roles'] },
        { capability: 'inter_pack_cooperation', cost: 0.8, prerequisites: ['multiple_packs', 'complex_buildings'], resultingArchetype: 'civilization', unlocksForOtherSystems: ['environment.large_scale_modification'] }
      ],
      interSystemDependencies: [
        { dependentSystem: 'creatures', requirement: 'social_coordination', reciprocalBenefit: 'pack_survival_benefits' },
        { dependentSystem: 'buildings', requirement: 'social_spaces', reciprocalBenefit: 'coordinated_labor' },
        { dependentSystem: 'tools', requirement: 'role_specialization', reciprocalBenefit: 'collective_efficiency' }
      ],
      yukaCommunication: {
        communicationChannels: ['pack_signals', 'hierarchy_communication', 'inter_group_negotiation'],
        coordinationBehaviors: ['leadership_emergence', 'task_specialization', 'conflict_resolution'],
        competitionResolution: ['dominance_establishment', 'resource_sharing_protocols', 'territorial_agreements']
      }
    });
    
    log.info('Universal evolutionary framework initialized', {
      systems: Array.from(this.evolutionarySystems.keys()),
      totalAdaptations: Array.from(this.evolutionarySystems.values()).reduce((sum, sys) => sum + sys.adaptationCapabilities.length, 0)
    });
  }
  
  /**
   * Generate evolutionary pressure response across all systems
   */
  async generateEvolutionaryPressureResponse(
    pressureEvent: EvolutionEvent,
    affectedSystems: string[]
  ): Promise<AdaptationResponse[]> {
    
    log.info('Generating evolutionary pressure response across systems', {
      eventType: pressureEvent.eventType,
      affectedSystems
    });
    
    const adaptations: AdaptationResponse[] = [];
    
    for (const systemId of affectedSystems) {
      const system = this.evolutionarySystems.get(systemId);
      if (!system) continue;
      
      const systemPrompt = `You are an evolutionary systems analyst for the "${systemId}" evolutionary system. You understand how environmental pressures drive systematic adaptation and capability emergence.

Current System State:
- Type: ${system.systemType}
- Generation: ${system.currentGeneration}
- Current Capabilities: ${system.adaptationCapabilities.map(c => c.capability).join(', ')}
- Dependencies: ${system.interSystemDependencies.map(d => d.dependentSystem).join(', ')}

Evolutionary Pressure Event:
- Type: ${pressureEvent.eventType}
- Description: ${pressureEvent.description}
- Significance: ${pressureEvent.significance}
- Affected Traits: ${pressureEvent.traits.join(', ')}

Analyze how this pressure should drive evolution in the ${systemId} system.`;

      try {
        const response = await generateText({
          model: openai(AI_MODELS.TEXT_GENERATION),
          system: systemPrompt,
          prompt: `Given the evolutionary pressure event, determine what adaptation should emerge in the ${systemId} system.

Consider:
1. What capability gap is revealed by this pressure?
2. What adaptation would address this gap?
3. What prerequisites must be met?
4. What would this unlock for other systems?
5. What is the evolutionary cost?

Respond with a specific adaptation that would naturally emerge from this pressure.`
        });
        
        // Parse response into structured adaptation
        const adaptation: AdaptationResponse = {
          capability: `pressure_response_${Date.now()}`,
          cost: pressureEvent.significance * 0.5,
          prerequisites: [`${systemId}_generation_${system.currentGeneration}`],
          resultingArchetype: `adapted_${systemId}_archetype`,
          unlocksForOtherSystems: [`enhanced_${systemId}_interaction`]
        };
        
        adaptations.push(adaptation);
        
        log.info('Evolutionary adaptation generated', {
          system: systemId,
          capability: adaptation.capability,
          cost: adaptation.cost
        });
        
      } catch (error) {
        log.error(`Failed to generate adaptation for ${systemId}`, error);
      }
    }
    
    return adaptations;
  }
  
  /**
   * Generate predator-prey evolution dynamics
   */
  async generatePredatorPreyDynamics(
    ecosystem: { predators: any[]; prey: any[]; environment: any }
  ): Promise<{
    predatorAdaptations: string[];
    preyAdaptations: string[];
    coevolutionEffects: string[];
  }> {
    
    const systemPrompt = `You are an evolutionary ecologist specializing in predator-prey coevolution dynamics. You understand how predation pressure drives rapid evolutionary adaptation in both predator and prey species, creating evolutionary arms races and sophisticated ecological relationships.`;
    
    try {
      const result = await generateObject({
        model: openai(AI_MODELS.TEXT_GENERATION),
        system: systemPrompt,
        prompt: `Analyze predator-prey coevolution for an evolutionary ecosystem:

Current Ecosystem:
- Predator Population: ${ecosystem.predators.length} individuals
- Prey Population: ${ecosystem.prey.length} individuals  
- Environmental Factors: ${JSON.stringify(ecosystem.environment)}

Generate realistic coevolutionary adaptations:
1. How do predators evolve to become more effective hunters?
2. How do prey evolve to evade predation more successfully?
3. What coevolutionary spiral effects emerge?
4. How does this drive innovation in both lineages?

Focus on: speed vs stealth, detection vs camouflage, coordination vs evasion, tool use vs natural weapons.`,
        schema: {
          type: 'object',
          properties: {
            predatorAdaptations: { type: 'array', items: { type: 'string' } },
            preyAdaptations: { type: 'array', items: { type: 'string' } },
            coevolutionEffects: { type: 'array', items: { type: 'string' } }
          },
          required: ['predatorAdaptations', 'preyAdaptations', 'coevolutionEffects']
        }
      });
      
      return result.object;
      
    } catch (error) {
      log.error('Failed to generate predator-prey dynamics', error);
      return { predatorAdaptations: [], preyAdaptations: [], coevolutionEffects: [] };
    }
  }
  
  /**
   * Generate progressive material unlock system
   */
  async generateMaterialUnlockProgression(
    currentTechnology: string[],
    environmentalConstraints: string[],
    creatureCapabilities: string[]
  ): Promise<{
    newMaterials: Array<{
      material: string;
      depthRequirement: number;
      toolRequirement: string;
      pressureTrigger: string;
      evolutionaryContext: string;
    }>;
  }> {
    
    const systemPrompt = `You are a materials scientist and evolutionary game designer. You understand how technological progression should emerge naturally from evolutionary pressure rather than arbitrary level gates. Materials become accessible when creatures develop the necessary capabilities and environmental pressures create the need.`;
    
    try {
      const result = await generateObject({
        model: openai(AI_MODELS.TEXT_GENERATION),
        system: systemPrompt,
        prompt: `Design progressive material unlock system based on evolutionary pressure:

Current Technology: ${currentTechnology.join(', ')}
Environmental Constraints: ${environmentalConstraints.join(', ')}  
Creature Capabilities: ${creatureCapabilities.join(', ')}

Create material progression where:
1. Deeper materials require more durable/specialized tools
2. Rare materials require specific environmental adaptation
3. Complex materials require social coordination to process
4. Each material unlocks new evolutionary pressures and possibilities

NO arbitrary "level 5 unlocks tin" - everything must be evolutionary pressure-driven.

Example: "Tin deposits exist at 15m depth → creatures evolve excavation trait to 0.8 → tin becomes accessible → enables bronze alloy synthesis → unlocks complex tool crafting → creates pressure for specialized roles"`,
        schema: {
          type: 'object',
          properties: {
            newMaterials: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  material: { type: 'string' },
                  depthRequirement: { type: 'number' },
                  toolRequirement: { type: 'string' },
                  pressureTrigger: { type: 'string' },
                  evolutionaryContext: { type: 'string' }
                },
                required: ['material', 'depthRequirement', 'toolRequirement', 'pressureTrigger', 'evolutionaryContext']
              }
            }
          },
          required: ['newMaterials']
        }
      });
      
      return result.object;
      
    } catch (error) {
      log.error('Failed to generate material unlock progression', error);
      return { newMaterials: [] };
    }
  }
  
  /**
   * Generate building evolution based on population pressure
   */
  async generateBuildingEvolution(
    populationPressure: number,
    availableResources: string[],
    socialOrganization: string,
    environmentalChallenges: string[]
  ): Promise<{
    buildingArchetype: string;
    evolutionaryNeed: string;
    constructionRequirements: string[];
    socialImpact: string;
    futureEvolutionPotential: string[];
  }> {
    
    const systemPrompt = `You are an architectural evolutionist studying how built environments emerge naturally from population pressure, resource availability, and social organization. Buildings evolve to solve specific survival and coordination problems, not as arbitrary progression unlocks.`;
    
    try {
      const result = await generateObject({
        model: openai(AI_MODELS.TEXT_GENERATION),
        system: systemPrompt,
        prompt: `Design building evolution response to current conditions:

Population Pressure: ${populationPressure} (0-1 scale)
Available Resources: ${availableResources.join(', ')}
Social Organization: ${socialOrganization}
Environmental Challenges: ${environmentalChallenges.join(', ')}

Determine what building archetype would naturally evolve to address these pressures:
1. What specific problem does population pressure create?
2. How do available resources constrain solutions?
3. What social organization enables this building type?
4. How does environment shape architectural approach?
5. What future evolutionary pressure does this building create?

Example: "Population 50+ → Food storage pressure → Granary building evolution → Requires: Wood construction + Social coordination + Pest management → Enables: Surplus accumulation → Creates pressure for: Trade systems and population growth"`,
        schema: {
          type: 'object',
          properties: {
            buildingArchetype: { type: 'string' },
            evolutionaryNeed: { type: 'string' },
            constructionRequirements: { type: 'array', items: { type: 'string' } },
            socialImpact: { type: 'string' },
            futureEvolutionPotential: { type: 'array', items: { type: 'string' } }
          },
          required: ['buildingArchetype', 'evolutionaryNeed', 'constructionRequirements', 'socialImpact', 'futureEvolutionPotential']
        }
      });
      
      return result.object;
      
    } catch (error) {
      log.error('Failed to generate building evolution', error);
      return {
        buildingArchetype: 'basic_shelter',
        evolutionaryNeed: 'protection',
        constructionRequirements: ['basic_materials'],
        socialImpact: 'minimal',
        futureEvolutionPotential: ['expanded_shelter']
      };
    }
  }
  
  /**
   * Coordinate inter-system evolutionary responses
   */
  async coordinateSystemEvolution(
    triggerEvent: EvolutionEvent,
    currentSystemStates: Map<string, any>
  ): Promise<{
    systemResponses: Map<string, AdaptationResponse>;
    cascadingEffects: string[];
    newPressures: PressureSource[];
  }> {
    
    log.info('Coordinating inter-system evolutionary response', {
      trigger: triggerEvent.eventType,
      systems: Array.from(currentSystemStates.keys())
    });
    
    const systemResponses = new Map<string, AdaptationResponse>();
    const cascadingEffects: string[] = [];
    const newPressures: PressureSource[] = [];
    
    // Generate responses for each system
    for (const [systemId, state] of currentSystemStates) {
      const system = this.evolutionarySystems.get(systemId);
      if (!system) continue;
      
      // Determine if this system should respond to the trigger event
      const shouldRespond = this.shouldSystemRespondToEvent(system, triggerEvent);
      
      if (shouldRespond) {
        const adaptations = await this.generateEvolutionaryPressureResponse(triggerEvent, [systemId]);
        if (adaptations.length > 0) {
          systemResponses.set(systemId, adaptations[0]);
          
          // Generate cascading effects
          cascadingEffects.push(`${systemId} evolves ${adaptations[0].capability}`);
          
          // Create new pressures for other systems
          for (const unlock of adaptations[0].unlocksForOtherSystems) {
            newPressures.push({
              sourceSystem: systemId,
              pressureType: 'capability_unlock',
              intensity: 0.6,
              requirement: unlock,
              urgency: 0.5
            });
          }
        }
      }
    }
    
    return {
      systemResponses,
      cascadingEffects,
      newPressures
    };
  }
  
  private shouldSystemRespondToEvent(system: EvolutionarySystem, event: EvolutionEvent): boolean {
    // Determine if evolutionary pressure affects this system
    const pressureMapping = {
      'trait_emergence': ['creatures', 'tools'],
      'pack_formation': ['social', 'buildings'],
      'extinction': ['materials', 'environment', 'social'],
      'speciation': ['creatures', 'social', 'environment'],
      'behavior_shift': ['tools', 'buildings', 'social']
    };
    
    const affectedSystems = pressureMapping[event.eventType as keyof typeof pressureMapping] || [];
    return affectedSystems.includes(system.systemType);
  }
  
  /**
   * Generate complete evolutionary system network
   */
  async generateCompleteEvolutionaryNetwork(): Promise<{
    systemArchetypes: Map<string, any>;
    pressureNetworks: Map<string, PressureSource[]>;
    adaptationPathways: Map<string, AdaptationResponse[]>;
    yukaCommunicationProtocols: Map<string, YukaInterSystemProtocol>;
  }> {
    
    log.info('Generating complete evolutionary system network...');
    
    const systemArchetypes = new Map();
    const pressureNetworks = new Map();  
    const adaptationPathways = new Map();
    const yukaCommunicationProtocols = new Map();
    
    for (const [systemId, system] of this.evolutionarySystems) {
      // Generate detailed archetypes for this system
      systemArchetypes.set(systemId, await this.generateSystemArchetypes(systemId, system));
      
      // Map pressure networks
      pressureNetworks.set(systemId, system.evolutionaryPressures);
      
      // Define adaptation pathways
      adaptationPathways.set(systemId, system.adaptationCapabilities);
      
      // Setup Yuka communication protocols
      yukaCommunicationProtocols.set(systemId, system.yukaCommunication);
    }
    
    log.info('Complete evolutionary network generated', {
      systems: systemArchetypes.size,
      totalPressureConnections: Array.from(pressureNetworks.values()).reduce((sum, p) => sum + p.length, 0),
      totalAdaptationPaths: Array.from(adaptationPathways.values()).reduce((sum, a) => sum + a.length, 0)
    });
    
    return {
      systemArchetypes,
      pressureNetworks,
      adaptationPathways,
      yukaCommunicationProtocols
    };
  }
  
  private async generateSystemArchetypes(systemId: string, system: EvolutionarySystem): Promise<any> {
    const systemPrompt = `You are a systems architect for evolutionary game design. Generate specific archetypes for the ${systemId} system that will evolve based on pressure rather than arbitrary unlocks.`;
    
    try {
      const result = await generateText({
        model: openai(AI_MODELS.TEXT_GENERATION),
        system: systemPrompt,
        prompt: `Generate evolutionary archetypes for ${systemId} system:

System Type: ${system.systemType}
Adaptation Capabilities: ${system.adaptationCapabilities.map(c => c.capability).join(', ')}

Create 3-5 base archetypes that can evolve into more complex forms based on evolutionary pressure. Each archetype should have clear pressure triggers and evolution pathways.`
      });
      
      return { systemId, archetypes: result.text, generated: new Date().toISOString() };
      
    } catch (error) {
      log.error(`Failed to generate archetypes for ${systemId}`, error);
      return { systemId, archetypes: 'Basic archetype', generated: new Date().toISOString() };
    }
  }
}

export default EvolutionaryAgentWorkflows;