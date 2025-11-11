import { World } from 'miniplex';
import { AtomEntity } from '../AtomicWorld';

const G_SIM = 6.674e11;
const ATOMIC_MASS_TO_KG = 1.66053906660e-27;

export const gravitySystem = (world: World<AtomEntity>, delta: number) => {
  const atoms = world.with('position', 'velocity', 'element');
  const atomArray = Array.from(atoms);

  for (let i = 0; i < atomArray.length; i++) {
    const atom1 = atomArray[i];
    
    if (!atom1.velocity) {
      atom1.velocity = { x: 0, y: 0, z: 0 };
    }

    for (let j = i + 1; j < atomArray.length; j++) {
      const atom2 = atomArray[j];
      
      const dx = atom2.position.x - atom1.position.x;
      const dy = atom2.position.y - atom1.position.y;
      const dz = atom2.position.z - atom1.position.z;
      const distanceSquared = dx * dx + dy * dy + dz * dz;
      const distance = Math.sqrt(distanceSquared);

      if (distance < 0.01) continue;

      const mass1Kg = atom1.element.atomicMass * ATOMIC_MASS_TO_KG;
      const mass2Kg = atom2.element.atomicMass * ATOMIC_MASS_TO_KG;
      
      const forceMagnitude = G_SIM * mass1Kg * mass2Kg / distanceSquared;
      
      const fx = (dx / distance) * forceMagnitude;
      const fy = (dy / distance) * forceMagnitude;
      const fz = (dz / distance) * forceMagnitude;

      const a1x = fx / mass1Kg;
      const a1y = fy / mass1Kg;
      const a1z = fz / mass1Kg;

      atom1.velocity.x += a1x * delta;
      atom1.velocity.y += a1y * delta;
      atom1.velocity.z += a1z * delta;

      if (!atom2.velocity) {
        atom2.velocity = { x: 0, y: 0, z: 0 };
      }

      atom2.velocity.x -= a1x * delta;
      atom2.velocity.y -= a1y * delta;
      atom2.velocity.z -= a1z * delta;
    }

    atom1.position.x += atom1.velocity.x * delta;
    atom1.position.y += atom1.velocity.y * delta;
    atom1.position.z += atom1.velocity.z * delta;
  }
};

export const bondingSystem = (world: World<AtomEntity>) => {
  const atoms = world.with('element', 'position', 'valenceElectrons', 'availableElectrons', 'id');
  const atomArray = Array.from(atoms);

  for (let i = 0; i < atomArray.length; i++) {
    const atom1 = atomArray[i];

    for (let j = i + 1; j < atomArray.length; j++) {
      const atom2 = atomArray[j];

      const dx = atom2.position.x - atom1.position.x;
      const dy = atom2.position.y - atom1.position.y;
      const dz = atom2.position.z - atom1.position.z;
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

      const bondingDistance = (atom1.visual.radius + atom2.visual.radius) * 1.2;

      if (distance < bondingDistance) {
        if (!atom1.bonds) atom1.bonds = [];
        if (!atom2.bonds) atom2.bonds = [];

        const alreadyBonded = atom1.bonds.some(b => b.targetId === atom2.id);
        if (alreadyBonded) continue;

        const available1 = atom1.availableElectrons;
        const available2 = atom2.availableElectrons;

        if (available1 <= 0 || available2 <= 0) continue;

        let bondOrder = Math.min(available1, available2);
        bondOrder = Math.min(bondOrder, 3);
        
        if (bondOrder < 1) continue;

        const electronegativityDiff = Math.abs(
          (atom1.element.electronegativityPauling || 0) - 
          (atom2.element.electronegativityPauling || 0)
        );

        let bondType = 'covalent';
        if (electronegativityDiff > 1.7) {
          bondType = 'ionic';
        } else if (electronegativityDiff < 0.5) {
          bondType = 'nonpolar-covalent';
        }

        const bondEnergy = bondOrder * 100;

        atom1.availableElectrons -= bondOrder;
        atom2.availableElectrons -= bondOrder;

        atom1.bonds.push({ targetId: atom2.id, bondType, bondOrder, energy: bondEnergy });
        atom2.bonds.push({ targetId: atom1.id, bondType, bondOrder, energy: bondEnergy });
      }
    }
  }
};

export const bondPruningSystem = (world: World<AtomEntity>) => {
  const atoms = world.with('bonds', 'position', 'id');
  const atomArray = Array.from(atoms);
  
  const atomMap = new Map<number, AtomEntity>();
  atomArray.forEach(atom => {
    atomMap.set(atom.id, atom);
  });

  for (const atom of atomArray) {
    if (!atom.bonds || atom.bonds.length === 0) continue;

    const validBonds = atom.bonds.filter(bond => {
      const targetAtom = atomMap.get(bond.targetId);
      
      if (!targetAtom) {
        atom.availableElectrons += bond.bondOrder;
        return false;
      }

      const dx = targetAtom.position.x - atom.position.x;
      const dy = targetAtom.position.y - atom.position.y;
      const dz = targetAtom.position.z - atom.position.z;
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

      const breakDistance = (atom.visual.radius + targetAtom.visual.radius) * 2.0;

      if (distance > breakDistance) {
        atom.availableElectrons += bond.bondOrder;
        return false;
      }

      return true;
    });

    atom.bonds = validBonds;
  }
};
