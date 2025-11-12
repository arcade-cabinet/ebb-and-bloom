/**
 * PHYSICS COMPONENTS
 * 
 * Components for physical properties and mechanics.
 */

import { z } from 'zod';

export const PositionComponent = z.object({
  x: z.number(),
  y: z.number(), 
  z: z.number()
});

export const VelocityComponent = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number()
});

export const AccelerationComponent = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number()
});

export const MassComponent = z.object({
  mass: z.number().positive(),
  density: z.number().positive().optional()
});

export const TemperatureComponent = z.object({
  temperature: z.number().positive(),
  heatCapacity: z.number().positive().optional(),
  thermalConductivity: z.number().optional()
});

export const ElectricComponent = z.object({
  charge: z.number(),
  electricField: z.object({ x: z.number(), y: z.number(), z: z.number() }).optional(),
  conductivity: z.number().optional()
});

export const StateOfMatterComponent = z.object({
  state: z.enum(['solid', 'liquid', 'gas', 'plasma']),
  phaseTransitionTemp: z.number().optional(),
  sublimationPoint: z.number().optional()
});

export const RapierPhysicsComponent = z.object({
  bodyHandle: z.number(),
  colliderHandle: z.number().optional(),
  bodyType: z.enum(['dynamic', 'kinematic', 'static'])
});

// Physics entity archetypes
export const PhysicalEntitySchema = z.object({
  entityId: z.string().uuid(),
  position: PositionComponent,
  mass: MassComponent,
  velocity: VelocityComponent.optional(),
  acceleration: AccelerationComponent.optional(),
  temperature: TemperatureComponent.optional(),
  electric: ElectricComponent.optional(),
  stateOfMatter: StateOfMatterComponent.optional(),
  rapierPhysics: RapierPhysicsComponent.optional()
});

export type PhysicalEntity = z.infer<typeof PhysicalEntitySchema>;