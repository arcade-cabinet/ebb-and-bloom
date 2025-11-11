import { z } from 'zod';

export const ScaleSchema = z.object({
  scale: z.enum(['atomic', 'molecular', 'material', 'structural', 'organismal', 'population']),
  simulationDetail: z.enum(['explicit', 'aggregate', 'statistical']),
});

export const IdentitySchema = z.object({
  entityId: z.string().uuid(),
  parentId: z.string().uuid().optional(),
  lineageId: z.string().uuid().optional(),
  generation: z.number().int().min(0).optional(),
});

export const PhysicalSchema = z.object({
  mass: z.number().positive(),
  position: z.object({ x: z.number(), y: z.number(), z: z.number() }),
  velocity: z.object({ x: z.number(), y: z.number(), z: z.number() }).optional(),
  temperature: z.number().positive().optional(),
  charge: z.number().optional(),
  stateOfMatter: z.enum(['solid', 'liquid', 'gas', 'plasma']).optional(),
  rapierBodyHandle: z.number().optional(),
});

export const ChemicalSchema = z.object({
  elementCounts: z.record(z.string(), z.number()),
  bondGraph: z.array(z.string()),
  orbitalShells: z.array(z.number()).optional(),
  reactionSites: z.array(z.string()).optional(),
});

export const MaterialSchema = z.object({
  crystalLattice: z.string().optional(),
  grainStructure: z.array(z.any()).optional(),
  defects: z.array(z.any()).optional(),
  stressTensor: z.array(z.number()).optional(),
});

export const BiologicalSchema = z.object({
  genome: z.string(),
  regulatoryNetwork: z.record(z.string(), z.array(z.string())).optional(),
  phenotype: z.record(z.string(), z.any()),
  metabolism: z.object({
    pathways: z.array(z.string()),
    energyProduction: z.number(),
    maintenanceCost: z.number(),
  }).optional(),
  energyStores: z.number().optional(),
  wasteStores: z.number().optional(),
});

export const EcologicalSchema = z.object({
  nicheVector: z.array(z.number()).optional(),
  trophicLevel: z.number().optional(),
  populationStats: z.object({
    count: z.number(),
    density: z.number(),
    growthRate: z.number(),
  }).optional(),
  odexStateRef: z.string().optional(),
});

export const CulturalSchema = z.object({
  knowledgeGraphIds: z.array(z.string()).optional(),
  toolBlueprintRef: z.string().optional(),
  culturalMemetics: z.record(z.string(), z.number()).optional(),
});

export const AggregationSchema = z.object({
  aggregateOf: z.array(z.string()),
  aggregateScale: z.enum(['molecular', 'material', 'structural', 'organismal']),
  conservedMass: z.number(),
  conservedCharge: z.number(),
  conservedEnergy: z.number(),
});

export const EntitySchema = z.object({
  entityId: z.string().uuid(),
  scale: z.enum(['atomic', 'molecular', 'material', 'structural', 'organismal', 'population']),
  simulationDetail: z.enum(['explicit', 'aggregate', 'statistical']).optional(),
  
  parentId: z.string().uuid().optional(),
  lineageId: z.string().uuid().optional(),
  generation: z.number().int().min(0).optional(),
  
  mass: z.number().positive().optional(),
  position: z.object({ x: z.number(), y: z.number(), z: z.number() }).optional(),
  velocity: z.object({ x: z.number(), y: z.number(), z: z.number() }).optional(),
  temperature: z.number().positive().optional(),
  charge: z.number().optional(),
  stateOfMatter: z.enum(['solid', 'liquid', 'gas', 'plasma']).optional(),
  rapierBodyHandle: z.number().optional(),
  
  elementCounts: z.record(z.string(), z.number()).optional(),
  bondGraph: z.array(z.string()).optional(),
  orbitalShells: z.array(z.number()).optional(),
  reactionSites: z.array(z.string()).optional(),
  
  crystalLattice: z.string().optional(),
  grainStructure: z.array(z.any()).optional(),
  defects: z.array(z.any()).optional(),
  stressTensor: z.array(z.number()).optional(),
  
  genome: z.string().optional(),
  regulatoryNetwork: z.record(z.string(), z.array(z.string())).optional(),
  phenotype: z.record(z.string(), z.any()).optional(),
  metabolism: z.object({
    pathways: z.array(z.string()),
    energyProduction: z.number(),
    maintenanceCost: z.number(),
  }).optional(),
  energyStores: z.number().optional(),
  wasteStores: z.number().optional(),
  
  nicheVector: z.array(z.number()).optional(),
  trophicLevel: z.number().optional(),
  populationStats: z.object({
    count: z.number(),
    density: z.number(),
    growthRate: z.number(),
  }).optional(),
  odexStateRef: z.string().optional(),
  
  knowledgeGraphIds: z.array(z.string()).optional(),
  toolBlueprintRef: z.string().optional(),
  culturalMemetics: z.record(z.string(), z.number()).optional(),
  
  aggregateOf: z.array(z.string()).optional(),
  aggregateScale: z.enum(['molecular', 'material', 'structural', 'organismal']).optional(),
  conservedMass: z.number().optional(),
  conservedCharge: z.number().optional(),
  conservedEnergy: z.number().optional(),
});

export type Entity = z.infer<typeof EntitySchema>;

export type Scale = z.infer<typeof ScaleSchema>['scale'];
export type SimulationDetail = z.infer<typeof ScaleSchema>['simulationDetail'];
export type StateOfMatter = 'solid' | 'liquid' | 'gas' | 'plasma';

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export function createEntity(partial: Partial<Entity> & Pick<Entity, 'entityId' | 'scale'>): Entity {
  return EntitySchema.parse(partial);
}

export function validateEntity(entity: unknown): Entity {
  return EntitySchema.parse(entity);
}

export function isPhysicalEntity(entity: Entity): entity is Entity & { mass: number; position: Vector3 } {
  return entity.mass !== undefined && entity.position !== undefined;
}

export function isChemicalEntity(entity: Entity): entity is Entity & { elementCounts: Record<string, number> } {
  return entity.elementCounts !== undefined;
}

export function isBiologicalEntity(entity: Entity): entity is Entity & { genome: string } {
  return entity.genome !== undefined;
}

export function isAggregateEntity(entity: Entity): entity is Entity & { aggregateOf: string[] } {
  return entity.aggregateOf !== undefined && entity.aggregateOf.length > 0;
}
