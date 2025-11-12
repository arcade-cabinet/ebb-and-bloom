/**
 * ATOMIC COMPONENTS
 * 
 * Components for atomic-scale entities and chemical bonding.
 */

import { z } from 'zod';

export const AtomicElementComponent = z.object({
  symbol: z.string().min(1).max(3),
  atomicNumber: z.number().int().min(1).max(118),
  atomicMass: z.number().positive(),
  electronegativity: z.number().optional(),
  valenceElectrons: z.number().int().min(0).max(8),
  availableElectrons: z.number().int().min(0).max(8),
});

export const ChemicalBondComponent = z.object({
  bonds: z.array(z.object({
    targetId: z.string(),
    bondType: z.enum(['covalent', 'ionic', 'metallic', 'hydrogen']),
    bondOrder: z.number().int().min(1).max(3),
    bondEnergy: z.number().positive(),
    bondLength: z.number().positive()
  }))
});

export const ElectronShellComponent = z.object({
  shells: z.array(z.number().int().min(0).max(32)),
  valenceShell: z.number().int().min(0).max(7),
  ionizationEnergies: z.array(z.number().positive()).optional()
});

export const AtomicVisualComponent = z.object({
  cpkColor: z.string(),
  vanDerWaalsRadius: z.number().positive(),
  covalentRadius: z.number().positive(),
  metallic: z.number().min(0).max(1),
  roughness: z.number().min(0).max(1),
  opacity: z.number().min(0).max(1),
  emissive: z.number().min(0).max(1)
});

// Atomic entity archetype
export const AtomicEntitySchema = z.object({
  entityId: z.string().uuid(),
  scale: z.literal('atomic'),
  
  // Required for all atoms
  element: AtomicElementComponent,
  position: z.object({ x: z.number(), y: z.number(), z: z.number() }),
  visual: AtomicVisualComponent,
  
  // Optional atomic properties
  velocity: z.object({ x: z.number(), y: z.number(), z: z.number() }).optional(),
  charge: z.number().optional(),
  electronShells: ElectronShellComponent.optional(),
  bonds: ChemicalBondComponent.optional(),
  
  // Physics integration
  mass: z.number().positive().optional(),
  temperature: z.number().positive().optional()
});

export type AtomicEntity = z.infer<typeof AtomicEntitySchema>;