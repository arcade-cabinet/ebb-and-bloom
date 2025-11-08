/**
 * AI Models Configuration - Single source of truth for all model constants
 */

export const AI_MODELS = {
  // Primary text generation - GPT-5 as instructed
  TEXT_GENERATION: 'gpt-5',
  
  // Image generation - GPT-image-1 as instructed  
  IMAGE_GENERATION: 'gpt-image-1',
  
  // Specialized models
  CREATURE_DESIGN: 'gpt-5',
  BUILDING_ENGINEERING: 'gpt-5', 
  MATERIAL_SCIENCE: 'gpt-5',
  NARRATIVE_GENERATION: 'gpt-5',
  SYSTEM_ARCHITECTURE: 'gpt-5'
} as const;

// Single configuration export
export const getModelConfig = () => AI_MODELS;