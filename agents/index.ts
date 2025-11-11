/**
 * AGENTS PACKAGE
 * 
 * ALL agentic logic lives here.
 * 
 * Exports:
 * - Shared utilities (YUKA math adapter, zero-allocation patterns)
 * - Governors (Yuka-native law implementations)
 * - Agents (Yuka agent classes)
 * - World Generation (GenerationGovernor)
 */

// Shared utilities (YUKA math adapter)
export * from './shared';

// Governors
export * from './governors/physics';
export * from './governors/biological';
export * from './governors/ecological';
export * from './governors/social';
// World generation governors (if they exist)
// export * from './governors/world-generation/GenerationGovernor';

// Agents
// export { CreatureAgent } from './agents-yuka/CreatureAgent'; // TODO: Implement CreatureAgent with YUKA Vehicle pattern

