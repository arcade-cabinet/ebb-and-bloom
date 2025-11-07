/**
 * Generation 0 Workflow Orchestrator
 * 
 * Orchestrates parent-child AI workflow execution:
 * 1. Creative Director (parent) designs planetary cores + shared materials
 * 2. Core Specialists (children) run in parallel, one per core
 * 3. Combines results into complete Gen 0 manifest
 * 
 * Uses Vercel AI SDK for deterministic generation from seed phrase.
 */

import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { log } from '../utils/Logger';
import { CreativeDirectorWorkflow } from './CreativeDirectorWorkflow';
import { CoreSpecialistWorkflow } from './CoreSpecialistWorkflow';
import type { 
  GenerationZeroOutput,
  PlanetaryManifest,
  CoreSpecialistManifest 
} from '../core/generation-zero-types';

/**
 * Orchestrator for Gen 0 workflows
 */
export class GenerationZeroOrchestrator {
  private seedPhrase: string;
  private manifestDir: string;

  constructor(seedPhrase: string, manifestDir: string = './manifests/gen0') {
    this.seedPhrase = seedPhrase;
    this.manifestDir = manifestDir;
  }

  /**
   * Execute complete Gen 0 workflow
   * Returns complete planetary system manifest
   */
  async execute(): Promise<GenerationZeroOutput> {
    log.info('Generation 0 orchestration starting', { 
      seedPhrase: this.seedPhrase 
    });

    const startTime = Date.now();

    try {
      // Step 1: Execute Creative Director (parent workflow)
      log.info('Step 1: Executing Creative Director (parent workflow)...');
      const creativeDirector = new CreativeDirectorWorkflow(this.seedPhrase);
      const planetaryManifest = await creativeDirector.execute();

      // Step 2: Execute Core Specialists (child workflows) in parallel
      log.info('Step 2: Executing Core Specialists (8 parallel workflows)...');
      const coreManifestPromises = planetaryManifest.cores.map(core => {
        const specialist = new CoreSpecialistWorkflow(core, this.seedPhrase);
        return specialist.execute();
      });

      const coreManifests = await Promise.all(coreManifestPromises);

      // Step 3: Combine results
      const output: GenerationZeroOutput = {
        planetary: planetaryManifest,
        coreManifests: coreManifests,
      };

      const elapsed = Date.now() - startTime;
      log.info('Generation 0 orchestration complete', {
        planet: planetaryManifest.planetaryName,
        cores: planetaryManifest.cores.length,
        totalMaterials: planetaryManifest.sharedMaterials.length + 
          coreManifests.reduce((sum, m) => sum + m.materials.length, 0),
        totalCreatures: coreManifests.reduce((sum, m) => sum + m.creatures.length, 0),
        elapsedMs: elapsed,
      });

      return output;
    } catch (error) {
      log.error('Generation 0 orchestration failed', { error });
      throw error;
    }
  }

  /**
   * Execute and persist to disk (idempotent)
   */
  async executeAndPersist(): Promise<GenerationZeroOutput> {
    // Ensure manifest directory exists
    if (!existsSync(this.manifestDir)) {
      mkdirSync(this.manifestDir, { recursive: true });
    }

    const manifestPath = join(this.manifestDir, `${this.seedPhrase}.json`);

    // Check if already exists (idempotency)
    if (existsSync(manifestPath)) {
      log.info('Gen 0 manifest already exists, loading from disk', { 
        seedPhrase: this.seedPhrase 
      });
      const existing = JSON.parse(readFileSync(manifestPath, 'utf-8'));
      return existing as GenerationZeroOutput;
    }

    // Execute workflow
    const output = await this.execute();

    // Persist to disk
    writeFileSync(manifestPath, JSON.stringify(output, null, 2));
    log.info('Gen 0 manifest persisted', { path: manifestPath });

    return output;
  }

  /**
   * Load existing manifest from disk
   */
  static loadManifest(seedPhrase: string, manifestDir: string = './manifests/gen0'): GenerationZeroOutput | null {
    const manifestPath = join(manifestDir, `${seedPhrase}.json`);
    
    if (!existsSync(manifestPath)) {
      return null;
    }

    try {
      const data = readFileSync(manifestPath, 'utf-8');
      return JSON.parse(data) as GenerationZeroOutput;
    } catch (error) {
      log.error('Failed to load Gen 0 manifest', { seedPhrase, error });
      return null;
    }
  }
}

/**
 * Execute Gen 0 orchestration (convenience function)
 */
export async function executeGenerationZero(seedPhrase: string): Promise<GenerationZeroOutput> {
  const orchestrator = new GenerationZeroOrchestrator(seedPhrase);
  return await orchestrator.executeAndPersist();
}

/**
 * Load existing Gen 0 manifest (convenience function)
 */
export function loadGenerationZero(seedPhrase: string): GenerationZeroOutput | null {
  return GenerationZeroOrchestrator.loadManifest(seedPhrase);
}
