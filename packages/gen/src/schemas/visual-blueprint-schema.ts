/**
 * VISUAL BLUEPRINT ZOD SCHEMA - PROPERLY DECLARED
 */

import { z } from 'zod';

// PBR Properties for rendering (used by both VisualBlueprintSchema and ArchetypeSchema)
export const PBRPropertiesSchema = z.object({
  baseColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  roughness: z.number().min(0).max(1),
  metallic: z.number().min(0).max(1),
  normalStrength: z.number().min(0).max(2),
  aoStrength: z.number().min(0).max(1),
  heightScale: z.number().min(0).max(0.1),
  emissive: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

export const VisualBlueprintSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  generation: z.number().int().min(0).max(6),
  scale: z.enum(['macro', 'meso', 'micro']),

  // Causal relationships
  canCreate: z.array(z.string()),
  cannotCreate: z.array(z.string()),
  compatibleWith: z.array(z.string()),
  incompatibleWith: z.array(z.string()),

  // Visual representation
  representations: z.object({
    primaryTextures: z.array(z.string()), // Actual texture paths
    colorPalette: z.array(z.string()), // Hex colors
    pbrProperties: PBRPropertiesSchema,
    proceduralRules: z.string(),
  }),

  // Composition
  compositionRules: z.string(),
  layeringOrder: z.number().int(),

  // Metadata
  createdAt: z.string().datetime(),
  version: z.string(),
});

export const ArchetypeWithBlueprintSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  parameters: z.record(z.string(), z.number()),
  visualBlueprint: VisualBlueprintSchema,
  textureReferences: z.array(z.string()),
  properties: z.record(z.string(), z.any()),
});

// Visual representation structure
export const VisualRepresentationSchema = z.object({
  primaryTextures: z.array(z.string()), // Texture IDs from manifest
  colorPalette: z.array(z.string().regex(/^#[0-9A-Fa-f]{6}$/)), // Hex colors
  pbrProperties: PBRPropertiesSchema,
  proceduralRules: z.string(), // How surface features vary
});

// Deconstruction and compatibility schema
export const DeconstructionSchema = z.object({
  // How this archetype can be deconstructed
  deconstructionProcess: z.string(), // Description of how it breaks down
  // What tools/entities are compatible for deconstructing it
  compatibleDeconstructors: z.array(z.string()), // e.g., ["DISASSEMBLER tools", "creatures with excavation > 0.7"]
  // What it decomposes into (Gen N-1 components, materials, etc.)
  decomposesInto: z.array(z.string()), // e.g., ["Gen1 archetypes", "raw materials", "organic matter"]
  // Property-based usage after deconstruction
  propertyUsage: z.object({
    hardness: z.string().optional(), // e.g., "armor potential"
    volume: z.string().optional(), // e.g., "container potential"
    organic: z.string().optional(), // e.g., "food potential"
  }).optional(),
});

// Formation and synthesis schema for Yuka guidance
export const FormationSchema = z.object({
  // Step-by-step formation process (HOW it forms)
  formationProcess: z.string(), // Detailed description of formation steps for Yuka to understand
  // How it synthesizes from previous generations (WHAT combines to create it)
  synthesisFrom: z.object({
    // What Gen N-1 components combine to create this archetype
    previousGenerations: z.array(z.string()), // e.g., ["Gen1 creature archetypes", "Gen0 materials"]
    // Specific synthesis requirements
    requirements: z.array(z.string()), // e.g., ["creature manipulation > 0.5", "pack size > 3"]
    // Causal chain explanation
    causalChain: z.string(), // How previous generations causally lead to this archetype
  }),
  // Yuka decision guidance (what Yuka needs to know to create this)
  yukaGuidance: z.string(), // Instructions for Yuka AI systems on how to evaluate/trigger formation
});

// Parameter range schema (for universal templates)
export const ParameterRangeSchema = z.object({
  min: z.number(),
  max: z.number(),
  default: z.number().optional(), // Optional default/typical value
  description: z.string().optional(), // What this parameter represents
});

// Bias/weight schema for seed-based selection
export const SelectionBiasSchema = z.object({
  // Base weight (0.0-1.0) - how likely this archetype is to be selected
  baseWeight: z.number().min(0).max(1).default(0.2), // Default: equal probability (1/5)
  // Seed modifiers - how seed components affect selection probability
  seedModifiers: z.record(z.string(), z.number()).optional(), // e.g., { "high-metallicity": 1.5, "low-metallicity": 0.5 }
  // Description of bias behavior
  biasDescription: z.string().optional(), // e.g., "More likely in metal-rich systems"
});

// Adjacency/compatibility schema
export const AdjacencySchema = z.object({
  // What archetypes this is compatible with (can coexist)
  compatibleWith: z.array(z.string()).default([]), // Archetype IDs or categories
  // What archetypes this is incompatible with (cannot coexist)
  incompatibleWith: z.array(z.string()).default([]), // Archetype IDs or categories
  // Adjacent archetypes (similar but distinct)
  adjacentTo: z.array(z.string()).default([]), // Archetype IDs that are variations
  // Prerequisites (what must exist before this can form)
  requires: z.array(z.string()).default([]), // Archetype IDs or conditions
});

// Complete archetype schema with nested JSON structures
export const ArchetypeSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(), // Narrative description
  // UNIVERSAL TEMPLATE: Parameters as RANGES, not fixed values
  // Seed will interpolate within these ranges
  parameters: z.record(z.string(), z.union([
    z.number(), // Backward compatibility: fixed value
    ParameterRangeSchema, // New: range for seed-based variation
  ])),
  visualProperties: VisualRepresentationSchema, // NESTED JSON, not TOML string!
  textureReferences: z.array(z.string()), // Texture IDs (like "Metal049A", "Rock025")
  // Selection bias for seed-based weighted selection
  selectionBias: SelectionBiasSchema.optional(),
  // Adjacency/compatibility system
  adjacency: AdjacencySchema.optional(),
  // Deconstruction and compatibility (REQUIRED for all archetypes)
  deconstruction: DeconstructionSchema,
  // Formation and synthesis for Yuka guidance (REQUIRED for all archetypes)
  formation: FormationSchema,
});

export const GenerationScaleSchema = z.object({
  archetypes: z.array(ArchetypeSchema),
});

// Type exports (DRY - single source of truth)
export type VisualBlueprint = z.infer<typeof VisualBlueprintSchema>;
export type ArchetypeWithBlueprint = z.infer<typeof ArchetypeWithBlueprintSchema>;
export type GenerationScale = z.infer<typeof GenerationScaleSchema>;
export type Archetype = z.infer<typeof ArchetypeSchema>;
export type VisualRepresentation = z.infer<typeof VisualRepresentationSchema>;
export type Deconstruction = z.infer<typeof DeconstructionSchema>;
export type Formation = z.infer<typeof FormationSchema>;
export type ParameterRange = z.infer<typeof ParameterRangeSchema>;
export type SelectionBias = z.infer<typeof SelectionBiasSchema>;
export type Adjacency = z.infer<typeof AdjacencySchema>;
export type PBRProperties = z.infer<typeof PBRPropertiesSchema>;

// Re-export texture manifest schema
export * from './texture-manifest-schema';