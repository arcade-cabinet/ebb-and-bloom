import { BlobDefinition } from './MarchingCubesRenderer';

export interface BondLengthData {
  [key: string]: number;
}

const BOND_LENGTHS: BondLengthData = {
  'H-H': 0.74,
  'O-O': 1.21,
  'N-N': 1.10,
  'C-C': 1.54,
  'C=C': 1.34,
  'C≡C': 1.20,
  'C-H': 1.09,
  'C-O': 1.43,
  'C=O': 1.20,
  'O-H': 0.96,
  'N-H': 1.01,
  'C-N': 1.47,
};

const ELEMENT_STRENGTHS: { [key: string]: number } = {
  'H': 0.8,
  'He': 0.7,
  'C': 1.2,
  'N': 1.1,
  'O': 1.0,
  'F': 0.9,
  'Ne': 0.7,
  'Na': 1.4,
  'Mg': 1.3,
  'Al': 1.3,
  'Si': 1.2,
  'P': 1.1,
  'S': 1.0,
  'Cl': 0.9,
  'Ar': 0.8,
};

function getBondLength(elem1: string, elem2: string, bondType: 'single' | 'double' | 'triple' = 'single'): number {
  const key = bondType === 'double' ? `${elem1}=${elem2}` : bondType === 'triple' ? `${elem1}≡${elem2}` : `${elem1}-${elem2}`;
  const reverseKey = bondType === 'double' ? `${elem2}=${elem1}` : bondType === 'triple' ? `${elem2}≡${elem1}` : `${elem2}-${elem1}`;
  
  return BOND_LENGTHS[key] || BOND_LENGTHS[reverseKey] || 1.5;
}

function getElementStrength(element: string): number {
  return ELEMENT_STRENGTHS[element] || 1.0;
}

function toMaterialId(element: string): string {
  return `element-${element.toLowerCase()}`;
}

export function buildMolecule(formula: string): BlobDefinition[] {
  const blobs: BlobDefinition[] = [];
  
  switch (formula.toUpperCase()) {
    case 'H2': {
      const bondLength = getBondLength('H', 'H');
      blobs.push(
        { position: [-bondLength / 2, 0, 0], strength: getElementStrength('H'), materialId: toMaterialId('H') },
        { position: [bondLength / 2, 0, 0], strength: getElementStrength('H'), materialId: toMaterialId('H') }
      );
      break;
    }
    
    case 'O2': {
      const bondLength = getBondLength('O', 'O', 'double');
      blobs.push(
        { position: [-bondLength / 2, 0, 0], strength: getElementStrength('O'), materialId: toMaterialId('O') },
        { position: [bondLength / 2, 0, 0], strength: getElementStrength('O'), materialId: toMaterialId('O') }
      );
      break;
    }
    
    case 'N2': {
      const bondLength = getBondLength('N', 'N', 'triple');
      blobs.push(
        { position: [-bondLength / 2, 0, 0], strength: getElementStrength('N'), materialId: toMaterialId('N') },
        { position: [bondLength / 2, 0, 0], strength: getElementStrength('N'), materialId: toMaterialId('N') }
      );
      break;
    }
    
    case 'H2O': {
      const ohBond = getBondLength('O', 'H');
      const angle = 104.5 * (Math.PI / 180);
      
      blobs.push(
        { position: [0, 0, 0], strength: getElementStrength('O'), materialId: toMaterialId('O') },
        { 
          position: [ohBond * Math.cos(angle / 2), ohBond * Math.sin(angle / 2), 0],
          strength: getElementStrength('H'),
          materialId: toMaterialId('H')
        },
        {
          position: [ohBond * Math.cos(angle / 2), -ohBond * Math.sin(angle / 2), 0],
          strength: getElementStrength('H'),
          materialId: toMaterialId('H')
        }
      );
      break;
    }
    
    case 'CO2': {
      const coBond = getBondLength('C', 'O', 'double');
      blobs.push(
        { position: [0, 0, 0], strength: getElementStrength('C'), materialId: toMaterialId('C') },
        { position: [-coBond, 0, 0], strength: getElementStrength('O'), materialId: toMaterialId('O') },
        { position: [coBond, 0, 0], strength: getElementStrength('O'), materialId: toMaterialId('O') }
      );
      break;
    }
    
    case 'CH4': {
      const chBond = getBondLength('C', 'H');
      const angle = 109.5 * (Math.PI / 180);
      
      blobs.push(
        { position: [0, 0, 0], strength: getElementStrength('C'), materialId: toMaterialId('C') },
        { position: [chBond, 0, 0], strength: getElementStrength('H'), materialId: toMaterialId('H') },
        {
          position: [
            -chBond * Math.cos(angle),
            chBond * Math.sin(angle) * Math.cos(0),
            chBond * Math.sin(angle) * Math.sin(0)
          ],
          strength: getElementStrength('H'),
          materialId: toMaterialId('H')
        },
        {
          position: [
            -chBond * Math.cos(angle),
            chBond * Math.sin(angle) * Math.cos(2 * Math.PI / 3),
            chBond * Math.sin(angle) * Math.sin(2 * Math.PI / 3)
          ],
          strength: getElementStrength('H'),
          materialId: toMaterialId('H')
        },
        {
          position: [
            -chBond * Math.cos(angle),
            chBond * Math.sin(angle) * Math.cos(4 * Math.PI / 3),
            chBond * Math.sin(angle) * Math.sin(4 * Math.PI / 3)
          ],
          strength: getElementStrength('H'),
          materialId: toMaterialId('H')
        }
      );
      break;
    }
    
    default:
      console.warn(`Unknown molecule formula: ${formula}`);
      blobs.push({ position: [0, 0, 0], strength: 1.0, materialId: 'default' });
  }
  
  return blobs;
}

export function buildAtom(element: string, position: [number, number, number] = [0, 0, 0]): BlobDefinition {
  return {
    position,
    strength: getElementStrength(element),
    materialId: toMaterialId(element)
  };
}

export function buildCustomMolecule(
  atoms: Array<{ element: string; position: [number, number, number] }>
): BlobDefinition[] {
  return atoms.map(atom => buildAtom(atom.element, atom.position));
}
