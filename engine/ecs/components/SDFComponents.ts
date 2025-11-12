/**
 * SDF RENDERING COMPONENTS
 * 
 * Miniplex ECS components for SDF-based rendering system integration.
 * These components bridge the scientific law system with the visual rendering layer.
 */

import { z } from 'zod';

export const SDFShapeComponent = z.object({
  primitiveType: z.enum([
    'sphere', 'box', 'torus', 'cylinder', 'cone', 'capsule', 
    'octahedron', 'pyramid', 'ellipsoid', 'roundedBox', 
    'cappedCylinder', 'triPrism', 'plane', 'roundCone', 
    'mengerSponge', 'gyroid', 'superellipsoid', 'torusKnot',
    'hexprism', 'porbital', 'dorbital'
  ]),
  params: z.array(z.number()),
  position: z.object({ x: z.number(), y: z.number(), z: z.number() }),
  rotation: z.object({ x: z.number(), y: z.number(), z: z.number() }).optional(),
  scale: z.object({ x: z.number(), y: z.number(), z: z.number() }).optional(),
  operation: z.enum(['union', 'subtract', 'intersect', 'smooth-union', 'smooth-subtract']).optional(),
  operationStrength: z.number().min(0).optional()
});

export const SDFMaterialComponent = z.object({
  materialId: z.string(),
  blendMode: z.enum(['replace', 'mix', 'add', 'multiply']).optional()
});

export const SDFOperationComponent = z.object({
  operationType: z.enum(['union', 'subtract', 'intersect', 'smooth-union', 'smooth-subtract', 'displace']),
  targetIds: z.array(z.string()),
  operationStrength: z.number().min(0).optional(),
  displacementFunction: z.string().optional()
});

export const SDFLODComponent = z.object({
  maxSteps: z.number().int().min(16).max(256).default(128),
  precision: z.number().min(0.0001).max(0.1).default(0.001),
  cullDistance: z.number().positive().default(100),
  autoLOD: z.boolean().default(true)
});

export const SDFEntitySchema = z.object({
  entityId: z.string().uuid(),
  sdfShape: SDFShapeComponent,
  sdfMaterial: SDFMaterialComponent.optional(),
  sdfOperation: SDFOperationComponent.optional(),
  sdfLOD: SDFLODComponent.optional(),
  visible: z.boolean().default(true)
});

export type SDFShape = z.infer<typeof SDFShapeComponent>;
export type SDFMaterial = z.infer<typeof SDFMaterialComponent>;
export type SDFOperation = z.infer<typeof SDFOperationComponent>;
export type SDFLOD = z.infer<typeof SDFLODComponent>;
export type SDFEntity = z.infer<typeof SDFEntitySchema>;
