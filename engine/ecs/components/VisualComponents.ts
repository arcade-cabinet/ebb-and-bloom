/**
 * VISUAL COMPONENTS
 * 
 * Components for 3D rendering and visual properties.
 */

import { z } from 'zod';
import * as THREE from 'three';

export const Visual3DComponent = z.object({
  mesh: z.any().optional(), // THREE.Mesh - can't validate with Zod
  geometry: z.string().optional(), // Geometry type name
  material: z.object({
    type: z.enum(['standard', 'basic', 'phong', 'physical']),
    color: z.string(),
    metalness: z.number().min(0).max(1).optional(),
    roughness: z.number().min(0).max(1).optional(),
    opacity: z.number().min(0).max(1).optional(),
    transparent: z.boolean().optional(),
    emissive: z.string().optional(),
    emissiveIntensity: z.number().min(0).optional()
  }),
  visible: z.boolean().default(true),
  castShadow: z.boolean().default(false),
  receiveShadow: z.boolean().default(false)
});

export const AnimationComponent = z.object({
  animations: z.array(z.object({
    name: z.string(),
    duration: z.number().positive(),
    loop: z.boolean().default(false),
    playing: z.boolean().default(false)
  })),
  mixer: z.any().optional() // THREE.AnimationMixer
});

export const ParticleEffectComponent = z.object({
  particleSystem: z.any().optional(), // THREE.Points
  emissionRate: z.number().positive(),
  lifetime: z.number().positive(),
  velocity: z.object({ x: z.number(), y: z.number(), z: z.number() }),
  color: z.string(),
  size: z.number().positive(),
  playing: z.boolean().default(false)
});

export const LevelOfDetailComponent = z.object({
  lodLevels: z.array(z.object({
    distance: z.number().positive(),
    geometry: z.string(),
    materialQuality: z.enum(['low', 'medium', 'high'])
  })),
  currentLod: z.number().int().min(0)
});

// Visual entity archetype
export const VisualEntitySchema = z.object({
  entityId: z.string().uuid(),
  position: z.object({ x: z.number(), y: z.number(), z: z.number() }),
  rotation: z.object({ x: z.number(), y: z.number(), z: z.number() }).optional(),
  scale: z.object({ x: z.number(), y: z.number(), z: z.number() }).optional(),
  visual3D: Visual3DComponent,
  animation: AnimationComponent.optional(),
  particles: ParticleEffectComponent.optional(),
  lod: LevelOfDetailComponent.optional()
});

export type VisualEntity = z.infer<typeof VisualEntitySchema>;