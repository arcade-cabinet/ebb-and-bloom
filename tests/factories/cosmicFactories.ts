/**
 * Cosmic Domain Factories
 * 
 * Test factories for Genesis, Timeline, and related cosmic systems.
 */

import { GenesisConstants } from '../../engine/genesis/GenesisConstants';
import { CosmicProvenanceTimeline } from '../../engine/genesis/CosmicProvenanceTimeline';
import { rngRegistry } from '../../engine/rng/RNGRegistry';
import type { EnhancedRNG } from '../../engine/utils/EnhancedRNG';

export function createTestGenesis(rng?: EnhancedRNG, overrides?: Partial<GenesisConstants>) {
  const genesis = new GenesisConstants(rng || rngRegistry.getScopedRNG('test-genesis'));
  return Object.assign(genesis, overrides);
}

export function createTestTimeline(rng?: EnhancedRNG) {
  return new CosmicProvenanceTimeline(
    rng || rngRegistry.getScopedRNG('test-timeline')
  );
}

export function createTestStageContext(stageIndex: number, rng?: EnhancedRNG) {
  const timeline = createTestTimeline(rng);
  return {
    timeline,
    stage: timeline.getStages()[stageIndex],
    index: stageIndex,
  };
}
