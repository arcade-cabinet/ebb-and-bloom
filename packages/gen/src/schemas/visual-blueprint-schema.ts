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

// Complete archetype schema with nested JSON structures
export const ArchetypeSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(), // Narrative description
  parameters: z.record(z.string(), z.number()), // Numerical parameters (stellarMass, metallicity, etc.)
  visualProperties: VisualRepresentationSchema, // NESTED JSON, not TOML string!
  textureReferences: z.array(z.string()), // Texture IDs (like "Metal049A", "Rock025")
});

export const GenerationScaleSchema = z.object({
  archetypes: z.array(ArchetypeSchema),
});

export type VisualBlueprint = z.infer<typeof VisualBlueprintSchema>;
export type ArchetypeWithBlueprint = z.infer<typeof ArchetypeWithBlueprintSchema>;
export type GenerationScale = z.infer<typeof GenerationScaleSchema>;