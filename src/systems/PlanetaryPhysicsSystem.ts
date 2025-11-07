/**
 * Planetary Physics System - Generation 0 Runtime Orchestrator
 * 
 * This system manages planetary generation at runtime:
 * 1. Takes seed phrase from game initialization
 * 2. Executes Gen 0 AI workflows (or loads cached manifest)
 * 3. Provides planetary data to other systems (materials, creatures, etc.)
 * 4. Acts as the planetary "entity" with Yuka goals
 * 
 * This is THE FOUNDATION - all other systems depend on this.
 */

import { World } from 'miniplex';
import { log } from '../utils/Logger';
import type { WorldSchema } from '../world/ECSWorld';
import type { GenerationZeroOutput } from '../core/generation-zero-types';
import { 
  executeGenerationZero, 
  loadGenerationZero 
} from '../dev/GenerationZeroOrchestrator';

/**
 * Planetary physics state
 */
interface PlanetaryState {
  initialized: boolean;
  seedPhrase: string;
  manifest: GenerationZeroOutput | null;
  generationStartTime: number;
  generationComplete: boolean;
}

/**
 * Planetary Physics System
 * Manages Gen 0 planetary generation and provides data to other systems
 */
class PlanetaryPhysicsSystem {
  private world: World<WorldSchema>;
  private state: PlanetaryState;

  constructor(world: World<WorldSchema>) {
    this.world = world;
    this.state = {
      initialized: false,
      seedPhrase: '',
      manifest: null,
      generationStartTime: 0,
      generationComplete: false,
    };

    log.info('PlanetaryPhysicsSystem initialized');
  }

  /**
   * Initialize planetary generation from seed phrase
   * This should be called during game initialization
   */
  async initialize(seedPhrase: string): Promise<void> {
    if (this.state.initialized) {
      log.warn('PlanetaryPhysicsSystem already initialized', { 
        seedPhrase: this.state.seedPhrase 
      });
      return;
    }

    log.info('PlanetaryPhysicsSystem initializing', { seedPhrase });
    this.state.seedPhrase = seedPhrase;
    this.state.generationStartTime = Date.now();

    try {
      // Try to load existing manifest first (idempotency)
      let manifest = loadGenerationZero(seedPhrase);

      if (manifest) {
        log.info('Loaded existing Gen 0 manifest from cache', { 
          planet: manifest.planetary.planetaryName 
        });
      } else {
        // Generate new manifest via AI workflows
        log.info('No cached manifest found, generating new planet via AI workflows...');
        log.warn('This will make API calls to OpenAI and may take 30-60 seconds');
        
        manifest = await executeGenerationZero(seedPhrase);
        
        log.info('Gen 0 planetary generation complete', {
          planet: manifest.planetary.planetaryName,
          elapsedMs: Date.now() - this.state.generationStartTime,
        });
      }

      this.state.manifest = manifest;
      this.state.generationComplete = true;
      this.state.initialized = true;

      // Log planetary summary
      this.logPlanetarySummary();

    } catch (error) {
      log.error('PlanetaryPhysicsSystem initialization failed', { error });
      
      // Fallback to default planet if AI generation fails
      log.warn('Falling back to default planet configuration');
      this.state.manifest = this.createFallbackManifest(seedPhrase);
      this.state.generationComplete = true;
      this.state.initialized = true;
    }
  }

  /**
   * Get the complete planetary manifest
   */
  getManifest(): GenerationZeroOutput | null {
    return this.state.manifest;
  }

  /**
   * Get planetary cores
   */
  getPlanetaryCores() {
    return this.state.manifest?.planetary.cores || [];
  }

  /**
   * Get shared materials (found across multiple cores)
   */
  getSharedMaterials() {
    return this.state.manifest?.planetary.sharedMaterials || [];
  }

  /**
   * Get fill material properties
   */
  getFillMaterial() {
    return this.state.manifest?.planetary.fillMaterial;
  }

  /**
   * Get all core-specific materials
   */
  getAllCoreSpecificMaterials() {
    if (!this.state.manifest) return [];
    
    return this.state.manifest.coreManifests.flatMap(cm => 
      cm.materials.map(m => ({
        ...m,
        coreName: cm.coreName,
      }))
    );
  }

  /**
   * Get all creature archetypes
   */
  getAllCreatureArchetypes() {
    if (!this.state.manifest) return [];
    
    return this.state.manifest.coreManifests.flatMap(cm => 
      cm.creatures.map(c => ({
        ...c,
        coreName: cm.coreName,
      }))
    );
  }

  /**
   * Get materials for a specific core
   */
  getMaterialsForCore(coreName: string) {
    if (!this.state.manifest) return [];
    
    const coreManifest = this.state.manifest.coreManifests.find(
      cm => cm.coreName === coreName
    );
    
    return coreManifest?.materials || [];
  }

  /**
   * Get creatures for a specific core
   */
  getCreaturesForCore(coreName: string) {
    if (!this.state.manifest) return [];
    
    const coreManifest = this.state.manifest.coreManifests.find(
      cm => cm.coreName === coreName
    );
    
    return coreManifest?.creatures || [];
  }

  /**
   * Check if Gen 0 is complete
   */
  isGenerationComplete(): boolean {
    return this.state.generationComplete;
  }

  /**
   * Get current seed phrase
   */
  getSeedPhrase(): string {
    return this.state.seedPhrase;
  }

  /**
   * Log planetary summary for debugging
   */
  private logPlanetarySummary(): void {
    if (!this.state.manifest) return;

    const { planetary, coreManifests } = this.state.manifest;
    
    log.info('=== PLANETARY SUMMARY ===');
    log.info(`Planet: ${planetary.planetaryName}`);
    log.info(`Theme: ${planetary.worldTheme}`);
    log.info(`Seed Phrase: ${this.state.seedPhrase}`);
    log.info(`Cores: ${planetary.cores.length}`);
    log.info(`Shared Materials: ${planetary.sharedMaterials.length}`);
    log.info(`Fill Material: ${planetary.fillMaterial.name} (${planetary.fillMaterial.type})`);
    
    const totalCoreSpecificMaterials = coreManifests.reduce(
      (sum, cm) => sum + cm.materials.length, 0
    );
    const totalCreatures = coreManifests.reduce(
      (sum, cm) => sum + cm.creatures.length, 0
    );
    
    log.info(`Total Core-Specific Materials: ${totalCoreSpecificMaterials}`);
    log.info(`Total Creature Archetypes: ${totalCreatures}`);
    log.info('========================');
  }

  /**
   * Create fallback manifest if AI generation fails
   */
  private createFallbackManifest(seedPhrase: string): GenerationZeroOutput {
    log.warn('Creating fallback manifest with hardcoded values');
    
    return {
      planetary: {
        seedPhrase,
        planetaryName: 'Terra Fallback',
        worldTheme: 'Default Earth-like World',
        fillMaterial: {
          name: 'Standard Soil',
          type: 'soil',
          density: 5,
          permeability: 5,
          oxygenation: 7,
          lightPenetration: 3,
          waterRetention: 5,
          description: 'Default loamy soil',
        },
        sharedMaterials: [
          {
            name: 'Iron',
            category: 'ore',
            affinityTypes: ['METAL'],
            rarity: 0.6,
            baseDepth: 10,
            hardness: 5,
            description: 'Common iron ore',
          },
        ],
        cores: [
          {
            name: 'Ferrite Core',
            description: 'Iron-rich core',
            color: '#8B4513',
            dominantElement: 'Iron',
            temperature: 7,
            pressure: 8,
            stability: 6,
            meshyPrompt: 'Iron ore core geological formation',
          },
        ],
      },
      coreManifests: [
        {
          coreName: 'Ferrite Core',
          materials: [],
          creatures: [],
        },
      ],
    };
  }

  /**
   * Update loop (called every frame)
   * Currently minimal - Yuka goals would go here later
   */
  update(deltaTime: number): void {
    // Future: Planetary Yuka goals would be evaluated here
    // - Maintain Orbital Stability
    // - Balance Core Pressures
    // - Support Surface Ecology
  }
}

export default PlanetaryPhysicsSystem;
