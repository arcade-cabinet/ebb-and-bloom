/**
 * Yuka Sphere Evolution Verification Script
 * 
 * This script verifies that multiple independent Yuka sphere evolution examples
 * are working correctly by observing the game state over multiple generations.
 */

import { getWorld } from '../src/world/ECSWorld';
import { gameClock } from '../src/systems/GameClock';
import EcosystemFoundation from '../src/systems/EcosystemFoundation';
import TextureSystem from '../src/systems/TextureSystem';
import { log } from '../src/utils/Logger';

interface EvolutionObservation {
  generation: number;
  timestamp: number;
  eventType: string;
  description: string;
  affectedCreatures: number;
  significance: number;
}

interface VerificationResult {
  generationsObserved: number;
  evolutionEvents: EvolutionObservation[];
  creatureEvolutions: number;
  toolEmergences: number;
  materialSyntheses: number;
  buildingConstructions: number;
  deconstructions: number;
  packFormations: number;
  allSystemsWorking: boolean;
}

/**
 * Verify Yuka sphere evolution is working
 */
export async function verifyYukaEvolution(): Promise<VerificationResult> {
  const world = getWorld();
  const textureSystem = new TextureSystem(world);
  const ecosystem = new EcosystemFoundation(world, textureSystem);

  // Initialize ecosystem
  await textureSystem.initialize();
  await ecosystem.initialize();
  ecosystem.start();

  const observations: EvolutionObservation[] = [];
  let generationsObserved = 0;
  const maxGenerations = 5; // Observe 5 generations

  // Listen to evolution events
  const unsubscribe = gameClock.onEvolutionEvent((event) => {
    observations.push({
      generation: event.generation,
      timestamp: event.timestamp,
      eventType: event.eventType,
      description: event.description,
      affectedCreatures: event.affectedCreatures.length,
      significance: event.significance
    });

    log.info('Evolution event observed', {
      generation: event.generation,
      type: event.eventType,
      description: event.description,
      significance: event.significance
    });
  });

  // Wait for generations to advance
  const generationPromise = new Promise<void>((resolve) => {
    const timeUnsubscribe = gameClock.onTimeUpdate((time) => {
      if (time.generation >= maxGenerations) {
        generationsObserved = time.generation;
        timeUnsubscribe();
        resolve();
      }
    });
  });

  // Wait for maxGenerations or timeout (60 seconds)
  await Promise.race([
    generationPromise,
    new Promise<void>((resolve) => setTimeout(resolve, 60000))
  ]);

  unsubscribe();

  // Analyze observations
  const creatureEvolutions = observations.filter(e => e.eventType === 'trait_emergence').length;
  const toolEmergences = observations.filter(e => e.description.includes('tool') || e.description.includes('EXTRACTOR')).length;
  const materialSyntheses = observations.filter(e => e.description.includes('material') || e.description.includes('synthesize')).length;
  const buildingConstructions = observations.filter(e => e.description.includes('building') || e.description.includes('construct')).length;
  const deconstructions = observations.filter(e => e.eventType === 'extinction').length;
  const packFormations = observations.filter(e => e.eventType === 'pack_formation').length;

  const allSystemsWorking = 
    generationsObserved >= maxGenerations &&
    observations.length > 0 &&
    creatureEvolutions > 0;

  const result: VerificationResult = {
    generationsObserved,
    evolutionEvents: observations,
    creatureEvolutions,
    toolEmergences,
    materialSyntheses,
    buildingConstructions,
    deconstructions,
    packFormations,
    allSystemsWorking
  };

  log.info('Yuka Evolution Verification Complete', result);

  return result;
}

// Run if called directly
if (require.main === module) {
  verifyYukaEvolution()
    .then((result) => {
      console.log('\n=== YUKA EVOLUTION VERIFICATION RESULTS ===');
      console.log(`Generations Observed: ${result.generationsObserved}`);
      console.log(`Total Evolution Events: ${result.evolutionEvents.length}`);
      console.log(`Creature Evolutions: ${result.creatureEvolutions}`);
      console.log(`Tool Emergences: ${result.toolEmergences}`);
      console.log(`Material Syntheses: ${result.materialSyntheses}`);
      console.log(`Building Constructions: ${result.buildingConstructions}`);
      console.log(`Deconstructions: ${result.deconstructions}`);
      console.log(`Pack Formations: ${result.packFormations}`);
      console.log(`All Systems Working: ${result.allSystemsWorking ? '✅ YES' : '❌ NO'}`);
      console.log('\n=== EVOLUTION EVENTS ===');
      result.evolutionEvents.forEach((event, i) => {
        console.log(`${i + 1}. Gen ${event.generation}: ${event.eventType} - ${event.description} (significance: ${event.significance.toFixed(2)})`);
      });
      process.exit(result.allSystemsWorking ? 0 : 1);
    })
    .catch((error) => {
      console.error('Verification failed:', error);
      process.exit(1);
    });
}

