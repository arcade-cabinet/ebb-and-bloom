/**
 * Zod schemas for AI-generated data pools
 * NO FALLBACKS - AI MUST WORK OR FAIL LOUDLY
 */

import { z } from 'zod';

// ============================================================================
// VISUAL BLUEPRINT SCHEMA
// ============================================================================

export const VisualBlueprintSchema = z.object({
  description: z.string(),
  canCreate: z.array(z.string()),
  cannotCreate: z.array(z.string()),
  representations: z.object({
    materials: z.array(z.string()),
    shaders: z.record(z.string(), z.number()),
    proceduralRules: z.string(),
    colorPalette: z.array(z.string()),
  }),
  compatibleWith: z.array(z.string()),
  incompatibleWith: z.array(z.string()),
  compositionRules: z.string(),
});

// ============================================================================
// GEN 0 DATA POOLS
// ============================================================================

export const Gen0OptionSchema = z.object({
  name: z.string(),
  description: z.string(),
  parameters: z.record(z.string(), z.number()),
  visualBlueprint: VisualBlueprintSchema,
});

export const Gen0DataPoolSchema = z.object({
  macro: z.object({
    options: z.array(Gen0OptionSchema),
  }),
  meso: z.object({
    options: z.array(Gen0OptionSchema),
  }),
  micro: z.object({
    options: z.array(Gen0OptionSchema),
  }),
});

// ============================================================================
// GEN 1 DATA POOLS  
// ============================================================================

export const Gen1OptionSchema = z.object({
  name: z.string(),
  archetype: z.string(),
  traits: z.record(z.string(), z.number()),
  visualBlueprint: VisualBlueprintSchema,
});

export const Gen1DataPoolSchema = z.object({
  macro: z.object({
    type: z.literal('ecological_niches'),
    options: z.array(Gen1OptionSchema),
  }),
  meso: z.object({
    type: z.literal('population_dynamics'),
    options: z.array(Gen1OptionSchema),
  }),
  micro: z.object({
    type: z.literal('individual_physiology'),
    options: z.array(Gen1OptionSchema),
  }),
});

// ============================================================================
// GEN 2 DATA POOLS
// ============================================================================

export const Gen2OptionSchema = z.object({
  name: z.string(),
  packType: z.string(),
  formationRules: z.record(z.string(), z.number()),
  visualBlueprint: VisualBlueprintSchema,
});

export const Gen2DataPoolSchema = z.object({
  macro: z.object({
    type: z.literal('territorial_geography'),
    options: z.array(Gen2OptionSchema),
  }),
  meso: z.object({
    type: z.literal('pack_sociology'),
    options: z.array(Gen2OptionSchema),
  }),
  micro: z.object({
    type: z.literal('individual_pack_behavior'),
    options: z.array(Gen2OptionSchema),
  }),
});

// Export schemas for AI generation
export type VisualBlueprint = z.infer<typeof VisualBlueprintSchema>;
export type Gen0DataPool = z.infer<typeof Gen0DataPoolSchema>;
export type Gen1DataPool = z.infer<typeof Gen1DataPoolSchema>;
export type Gen2DataPool = z.infer<typeof Gen2DataPoolSchema>;