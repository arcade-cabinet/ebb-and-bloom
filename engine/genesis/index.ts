/**
 * Genesis Module
 * 
 * Complete cosmic provenance system from Big Bang to First Life
 * 
 * RECOMMENDED: Use the modular architecture via GenesisFacade
 */

export { CosmicProvenanceTimeline, type CosmicStage } from './CosmicProvenanceTimeline';

export { GenesisFacade } from './facade/GenesisFacade';
export { GenesisKernel } from './core/GenesisKernel';
export { GenesisSeedContext } from './context/GenesisSeedContext';
export type {
  CosmicProfile,
  StellarProfile,
  PlanetaryProfile,
  AtmosphericProfile,
  ChemistryProfile,
  DerivedProfile,
  GenesisConstantsData
} from './types';

export { calculateCosmicConstants } from './modules/cosmic';
export { calculateStellarConstants } from './modules/stellar';
export { calculatePlanetaryConstants } from './modules/planetary';
export { calculateAtmosphericConstants } from './modules/atmospheric';
export { calculateChemistryConstants } from './modules/chemistry';
export { calculateDerivedConstants } from './modules/derived';

export { 
  createStageDescriptors, 
  type CosmicStageDescriptor, 
  type SDFPrimitive 
} from './CosmicStageDescriptor';
export { 
  StageOrchestrator, 
  type OrchestratorState, 
  type StageTransition 
} from './StageOrchestrator';

/** @deprecated Use GenesisFacade instead */
export { GenesisConstants, type GenesisConstantsData as LegacyGenesisConstantsData } from './GenesisConstants';
