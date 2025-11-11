/**
 * AGENTS PACKAGE
 * 
 * ALL agentic logic lives here.
 * 
 * Exports:
 * - Governors (Yuka-native law implementations)
 * - Agents (Yuka agent classes)
 * - World Generation (GenerationGovernor)
 */

// Governors
export * from './governors/physics';
export * from './governors/biological';
export * from './governors/ecological';
export * from './governors/social';
// World generation governors (if they exist)
// export * from './governors/world-generation/GenerationGovernor';

// Agents
export { CreatureAgent } from './agents-yuka/CreatureAgent';

