/**
 * Production Asset Generator - GPT-4 + GPT-image-1 workflow for complete asset creation
 * Implements prefab archetype assemblies with AI enhancement
 */

import { generateImage, generateObject } from 'ai';
import { readFile, writeFile, existsSync, mkdirSync } from 'fs/promises';
import { join } from 'path';
import { TEXT_MODEL, IMAGE_MODEL } from '../config/ai-models';

// Simple console logging
const log = {
  info: (...args: any[]) => console.log('[UI-GEN]', ...args),
  error: (...args: any[]) => console.error('[UI-GEN ERROR]', ...args),
  warn: (...args: any[]) => console.warn('[UI-GEN WARN]', ...args),
};

interface AmbientCGCatalog {
  textures: Array<{
    category: string;
    assetId: string;
    name: string;
    tags: string[];
    suitableFor: string[];
  }>;
}

interface CreatureArchetypeSpec {
  id: string;
  name: string;
  morphology: {
    baseSize: number;
    limbConfiguration: string;
    surfaceTexture: string;
    specialFeatures: string[];
  };
  traitDistribution: number[]; // Starting trait values
  evolutionaryPathways: Array<{
    pathway: string;
    triggerConditions: string[];
    resultingMorphology: string;
    newCapabilities: string[];
  }>;
  textureMapping: {
    primarySurface: string;
    secondaryFeatures: string[];
    specializedParts: string[];
    evolutionaryStages: Array<{
      traitThreshold: number;
      textureChanges: string;
    }>;
  };
  behavioralPattern: {
    baseAI: string;
    socialTendency: number;
    environmentalPreference: string[];
    packCompatibility: string[];
  };
}

interface BuildingAssemblySpec {
  id: string;
  name: string;
  purpose: string;
  materialRequirements: Array<{
    material: string;
    quantity: number;
    quality: string;
  }>;
  structuralElements: Array<{
    component: string;
    dimensions: [number, number, number];
    material: string;
    function: string;
  }>;
  interiorLayout: {
    floors: Array<{
      level: number;
      rooms: Array<{
        type: string;
        function: string;
        dimensions: [number, number];
        furniture: string[];
        craftingStations: string[];
      }>;
    }>;
  };
  upgradePaths: Array<{
    requiredMaterials: string[];
    newCapabilities: string[];
    structuralChanges: string;
  }>;
}

class ProductionAssetGenerator {
  private ambientCGCatalog: AmbientCGCatalog | null = null;
  private manifestPath = join(__dirname, '../../data/manifests/ui-asset-manifest.ts');
  
  constructor() {
    this.loadAmbientCGCatalog();
  }
  
  private async loadAmbientCGCatalog(): Promise<void> {
    try {
      // Load our downloaded texture catalog for intelligent texture mapping
      const manifestPath = join(__dirname, '../textures/manifest.json');
      if (existsSync(manifestPath)) {
        const manifest = JSON.parse(await readFile(manifestPath, 'utf-8'));
        
        this.ambientCGCatalog = {
          textures: manifest.assets.map((asset: any) => ({
            category: asset.category,
            assetId: asset.assetId,
            name: asset.name,
            tags: this.extractTags(asset.name),
            suitableFor: this.determineSuitability(asset.category, asset.name)
          }))
        };
        
        log.info('AmbientCG catalog loaded for intelligent texture mapping', {
          totalTextures: this.ambientCGCatalog.textures.length,
          categories: [...new Set(this.ambientCGCatalog.textures.map(t => t.category))]
        });
      }
    } catch (error) {
      log.error('Failed to load AmbientCG catalog', error);
    }
  }
  
  private extractTags(name: string): string[] {
    // Extract semantic tags from texture names for AI matching
    const words = name.toLowerCase().split(/[_\s-]+/);
    return words.filter(word => word.length > 2);
  }
  
  private determineSuitability(category: string, name: string): string[] {
    const suitabilityMap: Record<string, string[]> = {
      'Wood': ['structure_walls', 'furniture', 'organic_surface', 'creature_natural'],
      'Metal': ['tools', 'weapons', 'industrial', 'creature_metallic'],
      'Stone': ['foundation', 'walls', 'natural_terrain', 'creature_armored'],
      'Fabric': ['creature_fur', 'creature_skin', 'soft_surfaces', 'organic_texture'],
      'Leather': ['creature_hide', 'tough_surfaces', 'worn_materials', 'natural_armor'],
      'Grass': ['ground_cover', 'natural_environment', 'creature_camouflage'],
      'Rock': ['natural_terrain', 'creature_shells', 'defensive_structures'],
      'Concrete': ['advanced_structures', 'industrial_builds', 'modern_materials']
    };
    
    return suitabilityMap[category] || ['general_purpose'];
  }
  
  /**
   * Generate creature archetype with GPT-4 + texture mapping
   */
  async generateCreatureArchetype(
    baseArchetype: string,
    traitProfile: number[],
    environmentalContext: string
  ): Promise<CreatureArchetypeSpec> {
    
    log.info('Generating creature archetype with AI', {
      baseArchetype,
      traitProfile,
      environmentalContext
    });
    
    // Build context-aware prompt with AmbientCG texture options
    const availableTextures = this.getRelevantTextures(['creature_fur', 'creature_skin', 'organic_texture']);
    
    const systemPrompt = `You are an evolutionary biologist and creature designer for an advanced ecosystem simulation. You understand:
    
1. Evolutionary trait inheritance and environmental pressure
2. Morphological adaptation based on behavioral requirements  
3. Realistic biological constraints and possibilities
4. How texture and material properties affect creature design
5. Social dynamics and pack coordination requirements

Available texture materials from AmbientCG catalog:
${availableTextures.map(t => `${t.assetId}: ${t.name} (${t.suitableFor.join(', ')})`).join('\n')}

Create detailed creature archetype specifications that will be used to generate both AI visuals and 3D game assets.`;
    
    try {
      const result = await generateObject({
        model: TEXT_MODEL,
        system: systemPrompt,
        prompt: `Generate a complete creature archetype specification:

Base Archetype: ${baseArchetype}
Trait Profile: ${traitProfile.map((t, i) => `Trait${i}: ${(t*100).toFixed(0)}%`).join(', ')}
Environmental Context: ${environmentalContext}

Requirements:
1. Detailed morphology that reflects trait distribution
2. Evolutionary pathways showing how traits could develop
3. Specific AmbientCG texture mapping for realistic material application
4. Behavioral patterns compatible with Yuka AI steering system
5. Social compatibility for pack formation dynamics
6. Tool-use potential based on manipulation traits
7. Environmental adaptation based on context

Output a complete CreatureArchetypeSpec with all fields populated.`,
        schema: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            morphology: {
              type: 'object',
              properties: {
                baseSize: { type: 'number' },
                limbConfiguration: { type: 'string' },
                surfaceTexture: { type: 'string' },
                specialFeatures: { type: 'array', items: { type: 'string' } }
              },
              required: ['baseSize', 'limbConfiguration', 'surfaceTexture', 'specialFeatures']
            },
            traitDistribution: { type: 'array', items: { type: 'number' } },
            evolutionaryPathways: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  pathway: { type: 'string' },
                  triggerConditions: { type: 'array', items: { type: 'string' } },
                  resultingMorphology: { type: 'string' },
                  newCapabilities: { type: 'array', items: { type: 'string' } }
                },
                required: ['pathway', 'triggerConditions', 'resultingMorphology', 'newCapabilities']
              }
            },
            textureMapping: {
              type: 'object',
              properties: {
                primarySurface: { type: 'string' },
                secondaryFeatures: { type: 'array', items: { type: 'string' } },
                specializedParts: { type: 'array', items: { type: 'string' } },
                evolutionaryStages: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      traitThreshold: { type: 'number' },
                      textureChanges: { type: 'string' }
                    },
                    required: ['traitThreshold', 'textureChanges']
                  }
                }
              },
              required: ['primarySurface', 'secondaryFeatures', 'specializedParts', 'evolutionaryStages']
            },
            behavioralPattern: {
              type: 'object',
              properties: {
                baseAI: { type: 'string' },
                socialTendency: { type: 'number' },
                environmentalPreference: { type: 'array', items: { type: 'string' } },
                packCompatibility: { type: 'array', items: { type: 'string' } }
              },
              required: ['baseAI', 'socialTendency', 'environmentalPreference', 'packCompatibility']
            }
          },
          required: ['id', 'name', 'morphology', 'traitDistribution', 'evolutionaryPathways', 'textureMapping', 'behavioralPattern']
        }
      });
      
      const creatureSpec = result.object as CreatureArchetypeSpec;
      
      log.info('Creature archetype generated', {
        name: creatureSpec.name,
        pathways: creatureSpec.evolutionaryPathways.length,
        textureMapping: creatureSpec.textureMapping.primarySurface
      });
      
      return creatureSpec;
      
    } catch (error) {
      log.error('Failed to generate creature archetype', error);
      throw error;
    }
  }
  
  /**
   * Generate building assembly with structural engineering AI
   */
  async generateBuildingAssembly(
    buildingType: string,
    materialRequirements: string[],
    functionalRequirements: string[]
  ): Promise<BuildingAssemblySpec> {
    
    log.info('Generating building assembly with structural engineering AI', {
      buildingType,
      materialRequirements,
      functionalRequirements
    });
    
    const availableMaterials = this.getRelevantTextures(['structure_walls', 'foundation', 'roofing']);
    
    const systemPrompt = `You are a structural engineer and architect specializing in functional building design for evolutionary ecosystems. You understand:

1. Structural engineering principles and load-bearing requirements
2. Material properties and construction techniques  
3. Functional space planning and workflow optimization
4. Integration with natural environments and creature behavior
5. Upgrade and expansion pathways for evolving needs

Available construction materials from AmbientCG catalog:
${availableMaterials.map(t => `${t.assetId}: ${t.name} (${t.suitableFor.join(', ')})`).join('\n')}

Design buildings that serve specific gameplay functions while being structurally sound and aesthetically pleasing.`;
    
    try {
      const result = await generateObject({
        model: TEXT_MODEL,
        system: systemPrompt,
        prompt: `Design a complete building assembly:

Building Type: ${buildingType}
Required Materials: ${materialRequirements.join(', ')}
Functional Requirements: ${functionalRequirements.join(', ')}

Create a building that:
1. Serves specific gameplay functions (crafting, storage, social coordination)
2. Uses realistic structural engineering principles
3. Maps to available AmbientCG textures for visual consistency
4. Provides clear workflow areas for creature/player interaction
5. Has upgrade pathways as better materials become available
6. Integrates naturally with the evolutionary ecosystem theme

Output a complete BuildingAssemblySpec with precise dimensions and material specifications.`,
        schema: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            purpose: { type: 'string' },
            materialRequirements: {
              type: 'array',
              items: {
                type: 'object', 
                properties: {
                  material: { type: 'string' },
                  quantity: { type: 'number' },
                  quality: { type: 'string' }
                },
                required: ['material', 'quantity', 'quality']
              }
            },
            structuralElements: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  component: { type: 'string' },
                  dimensions: { type: 'array', items: { type: 'number' } },
                  material: { type: 'string' },
                  function: { type: 'string' }
                },
                required: ['component', 'dimensions', 'material', 'function']
              }
            },
            interiorLayout: {
              type: 'object',
              properties: {
                floors: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      level: { type: 'number' },
                      rooms: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            type: { type: 'string' },
                            function: { type: 'string' },
                            dimensions: { type: 'array', items: { type: 'number' } },
                            furniture: { type: 'array', items: { type: 'string' } },
                            craftingStations: { type: 'array', items: { type: 'string' } }
                          },
                          required: ['type', 'function', 'dimensions', 'furniture', 'craftingStations']
                        }
                      }
                    },
                    required: ['level', 'rooms']
                  }
                }
              },
              required: ['floors']
            },
            upgradePaths: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  requiredMaterials: { type: 'array', items: { type: 'string' } },
                  newCapabilities: { type: 'array', items: { type: 'string' } },
                  structuralChanges: { type: 'string' }
                },
                required: ['requiredMaterials', 'newCapabilities', 'structuralChanges']
              }
            }
          },
          required: ['id', 'name', 'purpose', 'materialRequirements', 'structuralElements', 'interiorLayout', 'upgradePaths']
        }
      });
      
      const buildingSpec = result.object as BuildingAssemblySpec;
      
      log.info('Building assembly generated', {
        name: buildingSpec.name,
        rooms: buildingSpec.interiorLayout.floors.reduce((sum, floor) => sum + floor.rooms.length, 0),
        upgrades: buildingSpec.upgradePaths.length
      });
      
      return buildingSpec;
      
    } catch (error) {
      log.error('Failed to generate building assembly', error);
      throw error;
    }
  }
  
  /**
   * Generate creature visual with GPT-image-1
   */
  async generateCreatureVisual(
    creatureSpec: CreatureArchetypeSpec,
    evolutionStage: 'base' | 'intermediate' | 'advanced' = 'base'
  ): Promise<string> {
    
    log.info('Generating creature visual with GPT-image-1', {
      creatureId: creatureSpec.id,
      evolutionStage
    });
    
    const textureContext = this.buildTextureContext(creatureSpec.textureMapping);
    
    const visualPrompt = `Create a realistic creature illustration for the evolutionary ecosystem game "Ebb & Bloom".

Creature: ${creatureSpec.name}
Evolution Stage: ${evolutionStage}

Morphology: ${creatureSpec.morphology.limbConfiguration}, size ${creatureSpec.morphology.baseSize} units, ${creatureSpec.morphology.surfaceTexture}

Special Features: ${creatureSpec.morphology.specialFeatures.join(', ')}

Texture Inspiration: ${textureContext}

Style: Realistic biological design showing clear evolutionary adaptations, natural environment setting, organic form with visible trait development, game-asset ready reference illustration.

Evolutionary Focus: Show traits that reflect ${evolutionStage} development stage - ${evolutionStage === 'base' ? 'starting form with potential' : evolutionStage === 'intermediate' ? 'developing specialized features' : 'fully evolved with advanced adaptations'}.

Brand Integration: Subtle earth tones with hints of Ebb & Bloom color palette (deep indigo, emerald green, trait gold accents where appropriate).`;
    
    try {
      // Use Vercel AI SDK generateImage
      const result = await generateImage({
        model: IMAGE_MODEL,
        prompt: visualPrompt,
        size: '1024x1024',
        quality: 'hd',
      });
      
      if (!result.image) throw new Error('No image generated');
      
      // Handle different response formats
      let imageBuffer: Buffer;
      if (typeof result.image === 'string') {
        // URL - download it
        imageBuffer = await this.downloadImage(result.image);
      } else if (result.image instanceof Uint8Array) {
        imageBuffer = Buffer.from(result.image);
      } else {
        throw new Error(`Unexpected image format`);
      }
      const fileName = `${creatureSpec.id}_${evolutionStage}.png`;
      const filePath = join(__dirname, `../../../frontend/public/creatures/${fileName}`);
      
      // Ensure directory exists
      const creatureDir = join(__dirname, '../../../frontend/public/creatures');
      if (!existsSync(creatureDir)) {
        await mkdirSync(creatureDir, { recursive: true });
      }
      
      await writeFile(filePath, imageBuffer);
      
      log.info('Creature visual generated successfully', {
        creatureId: creatureSpec.id,
        evolutionStage,
        filePath,
        size: imageBuffer.length
      });
      
      return filePath;
      
    } catch (error) {
      log.error('Failed to generate creature visual', error);
      throw error;
    }
  }
  
  private buildTextureContext(textureMapping: CreatureArchetypeSpec['textureMapping']): string {
    if (!this.ambientCGCatalog) return 'Natural organic textures';
    
    const primaryTexture = this.ambientCGCatalog.textures.find(t => 
      t.assetId.toLowerCase().includes(textureMapping.primarySurface.toLowerCase())
    );
    
    return primaryTexture 
      ? `Primary surface inspired by ${primaryTexture.name} texture characteristics`
      : `Organic surface texture (${textureMapping.primarySurface})`;
  }
  
  private getRelevantTextures(suitabilityFilter: string[]) {
    if (!this.ambientCGCatalog) return [];
    
    return this.ambientCGCatalog.textures.filter(texture =>
      texture.suitableFor.some(use => suitabilityFilter.includes(use))
    );
  }
  
  private async downloadImage(url: string): Promise<Buffer> {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
  
  /**
   * Generate complete production asset library
   */
  async generateCompleteAssetLibrary(): Promise<void> {
    log.info('Starting complete production asset generation...');
    
    try {
      // Load production manifest
      const manifest = JSON.parse(await readFile(this.manifestPath, 'utf-8'));
      
      // Generate creature archetypes
      log.info('Generating creature archetypes...');
      for (const archetype of manifest.creature_archetypes.assets) {
        const creatureSpec = await this.generateCreatureArchetype(
          archetype.id,
          [0.3, 0.6, 0.4, 0.5, 0.7, 0.2, 0.5, 0.4, 0.3, 0.2], // Example trait profile
          'temperate_ecosystem'
        );
        
        // Generate visuals for each evolution stage
        await this.generateCreatureVisual(creatureSpec, 'base');
        await this.generateCreatureVisual(creatureSpec, 'intermediate'); 
        await this.generateCreatureVisual(creatureSpec, 'advanced');
        
        // Small delay to respect API rate limits
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      // Generate building assemblies  
      log.info('Generating building assemblies...');
      for (const building of manifest.building_archetypes.assets) {
        const buildingSpec = await this.generateBuildingAssembly(
          building.id,
          ['wood', 'stone', 'metal'],
          building.functional_requirements
        );
        
        // Would generate building visuals here
        
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      log.info('Complete production asset library generated');
      
    } catch (error) {
      log.error('Failed to generate complete asset library', error);
      throw error;
    }
  }
}

export default ProductionAssetGenerator;