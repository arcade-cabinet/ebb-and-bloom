/**
 * CHEMISTRY COMPONENTS
 * 
 * Components for chemical reactions and molecular interactions.
 */

import { z } from 'zod';

export const ElementalCompositionComponent = z.object({
  elementCounts: z.record(z.string(), z.number().positive()),
  molecularFormula: z.string().optional(),
  molarMass: z.number().positive().optional()
});

export const ChemicalReactionComponent = z.object({
  reactionSites: z.array(z.string()),
  reactionRate: z.number().positive().optional(),
  activationEnergy: z.number().positive().optional(),
  catalysts: z.array(z.string()).optional()
});

export const MolecularBondComponent = z.object({
  bondGraph: z.array(z.object({
    atom1: z.string(),
    atom2: z.string(),
    bondType: z.enum(['covalent', 'ionic', 'metallic', 'hydrogen', 'van_der_waals']),
    bondOrder: z.number().min(0).max(3),
    bondEnergy: z.number(),
    bondLength: z.number().positive()
  })),
  bondAngles: z.array(z.number()).optional(),
  hybridization: z.string().optional()
});

export const ElectrochemicalComponent = z.object({
  oxidationState: z.number().int(),
  electronAffinity: z.number().optional(),
  ionizationEnergy: z.number().positive().optional(),
  electronegativity: z.number().optional()
});

export const CrystalStructureComponent = z.object({
  latticeType: z.enum(['cubic', 'hexagonal', 'tetragonal', 'orthorhombic', 'monoclinic', 'triclinic']),
  latticeParameters: z.object({ a: z.number(), b: z.number(), c: z.number() }),
  spaceGroup: z.string().optional(),
  defects: z.array(z.object({
    type: z.string(),
    density: z.number(),
    energy: z.number()
  })).optional()
});

// Chemical entity archetypes
export const MolecularEntitySchema = z.object({
  entityId: z.string().uuid(),
  scale: z.literal('molecular'),
  composition: ElementalCompositionComponent,
  bonds: MolecularBondComponent.optional(),
  reactions: ChemicalReactionComponent.optional(),
  electrochemistry: ElectrochemicalComponent.optional(),
  position: z.object({ x: z.number(), y: z.number(), z: z.number() }),
  temperature: z.number().positive().optional()
});

export const MaterialEntitySchema = z.object({
  entityId: z.string().uuid(),
  scale: z.literal('material'),
  composition: ElementalCompositionComponent,
  crystalStructure: CrystalStructureComponent,
  position: z.object({ x: z.number(), y: z.number(), z: z.number() }),
  mass: z.number().positive(),
  temperature: z.number().positive().optional()
});

export type MolecularEntity = z.infer<typeof MolecularEntitySchema>;
export type MaterialEntity = z.infer<typeof MaterialEntitySchema>;