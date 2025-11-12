/**
 * BIOLOGY COMPONENTS
 * 
 * Components for biological entities and life processes.
 */

import { z } from 'zod';

export const GenomeComponent = z.object({
  dnaSequence: z.string(),
  genes: z.array(z.object({
    name: z.string(),
    sequence: z.string(),
    function: z.string(),
    expression: z.number().min(0).max(1)
  })),
  mutations: z.array(z.object({
    position: z.number(),
    original: z.string(),
    mutated: z.string(),
    effect: z.string()
  })).optional()
});

export const PhenotypeComponent = z.object({
  traits: z.record(z.string(), z.any()),
  species: z.string(),
  morphology: z.object({
    size: z.number().positive(),
    bodyPlan: z.string(),
    locomotion: z.string(),
    sensoryOrgans: z.array(z.string())
  }),
  behavior: z.object({
    aggression: z.number().min(0).max(1),
    sociality: z.number().min(0).max(1),
    intelligence: z.number().min(0).max(1),
    toolUse: z.number().min(0).max(1)
  })
});

export const MetabolismComponent = z.object({
  pathways: z.array(z.string()),
  energyProduction: z.number().positive(),
  maintenanceCost: z.number().positive(),
  efficiency: z.number().min(0).max(1),
  wasteProducts: z.array(z.string())
});

export const EnergyComponent = z.object({
  current: z.number().min(0),
  maximum: z.number().positive(),
  regenerationRate: z.number().positive(),
  consumptionRate: z.number().positive()
});

export const LifecycleComponent = z.object({
  age: z.number().min(0),
  maxLifespan: z.number().positive(),
  reproductiveMaturity: z.number().positive(),
  lifecycleStage: z.enum(['embryo', 'juvenile', 'adult', 'elder']),
  reproductiveStatus: z.enum(['immature', 'fertile', 'pregnant', 'sterile'])
});

export const NeedsComponent = z.object({
  hunger: z.number().min(0).max(1),
  thirst: z.number().min(0).max(1),
  safety: z.number().min(0).max(1),
  reproduction: z.number().min(0).max(1),
  social: z.number().min(0).max(1),
  territory: z.number().min(0).max(1)
});

// Biological entity archetype
export const BiologicalEntitySchema = z.object({
  entityId: z.string().uuid(),
  scale: z.literal('organismal'),
  
  // Required for all living things
  genome: GenomeComponent,
  phenotype: PhenotypeComponent,
  metabolism: MetabolismComponent,
  energy: EnergyComponent,
  lifecycle: LifecycleComponent,
  needs: NeedsComponent,
  
  // Physics integration
  position: z.object({ x: z.number(), y: z.number(), z: z.number() }),
  velocity: z.object({ x: z.number(), y: z.number(), z: z.number() }).optional(),
  mass: z.number().positive().optional(),
  temperature: z.number().positive().optional()
});

export type BiologicalEntity = z.infer<typeof BiologicalEntitySchema>;