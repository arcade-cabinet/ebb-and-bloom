/**
 * CHEMISTRY QUERIES
 * 
 * Standard query patterns for chemical systems.
 */

import type { World } from 'miniplex';
import type { AtomicEntity } from '../components/AtomicComponents';
import type { MolecularEntity } from '../components/ChemistryComponents';

// Common chemistry queries
export const ChemistryQueries = {
  
  // Atomic-level queries
  bondableAtoms: (world: World<AtomicEntity>) => 
    world.with('element', 'position', 'visual'),
    
  atomsWithAvailableElectrons: (world: World<AtomicEntity>) =>
    world.with('element', 'position').where(entity => 
      entity.element.availableElectrons > 0
    ),
    
  bondedAtoms: (world: World<AtomicEntity>) =>
    world.with('element', 'position', 'bonds'),

  // Molecular-level queries  
  reactableMolecules: (world: World<MolecularEntity>) =>
    world.with('composition', 'position', 'reactions'),
    
  unstableMolecules: (world: World<MolecularEntity>) =>
    world.with('composition', 'bonds').where(entity =>
      entity.bonds && entity.bonds.bondGraph.some(bond => bond.bondEnergy < 0)
    ),
    
  // Cross-scale queries
  allChemicalEntities: (world: World<any>) =>
    world.where(entity => 
      entity.scale === 'atomic' || 
      entity.scale === 'molecular' || 
      entity.scale === 'material'
    ),
    
  entitiesWithinReactionDistance: (world: World<any>, centerEntity: any, maxDistance: number = 2.0) =>
    world.with('position').where(entity =>
      entity.entityId !== centerEntity.entityId &&
      Math.sqrt(
        Math.pow(entity.position.x - centerEntity.position.x, 2) +
        Math.pow(entity.position.y - centerEntity.position.y, 2) + 
        Math.pow(entity.position.z - centerEntity.position.z, 2)
      ) <= maxDistance
    ),

  // Periodic table queries
  elementsByGroup: (world: World<AtomicEntity>, group: number) =>
    world.with('element').where(entity => 
      Math.floor((entity.element.atomicNumber - 1) / 8) + 1 === group
    ),
    
  metalElements: (world: World<AtomicEntity>) =>
    world.with('element', 'visual').where(entity =>
      entity.visual.metallic > 0.5
    ),
    
  nobleGases: (world: World<AtomicEntity>) =>
    world.with('element').where(entity =>
      [2, 10, 18, 36, 54, 86, 118].includes(entity.element.atomicNumber)
    )
};

// Query helpers
export function findNearbyAtoms(world: World<AtomicEntity>, position: { x: number; y: number; z: number }, radius: number): AtomicEntity[] {
  return Array.from(world.with('element', 'position')).filter(atom => {
    const dx = atom.position.x - position.x;
    const dy = atom.position.y - position.y;
    const dz = atom.position.z - position.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz) <= radius;
  });
}

export function findBondingPartners(world: World<AtomicEntity>, atom: AtomicEntity): AtomicEntity[] {
  return Array.from(ChemistryQueries.atomsWithAvailableElectrons(world)).filter(partner =>
    partner.entityId !== atom.entityId &&
    canBond(atom, partner)
  );
}

function canBond(atom1: AtomicEntity, atom2: AtomicEntity): boolean {
  // Simple bonding rule - can be enhanced with real chemistry
  return atom1.element.availableElectrons > 0 && 
         atom2.element.availableElectrons > 0 &&
         atom1.element.atomicNumber !== 2 && // Helium doesn't bond
         atom2.element.atomicNumber !== 2;
}