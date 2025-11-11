import { World } from 'miniplex';
import { AtomEntity } from '../AtomicWorld';
import periodicTableData from '../../../agents/tables/source-data/PeriodicTableJSON.json';
import { EnhancedRNG } from '../../utils/EnhancedRNG';

interface PeriodicElement {
  symbol: string;
  name: string;
  number: number;
  atomic_mass: number;
  category: string;
  'cpk-hex': string;
  shells: number[];
  electronegativity_pauling: number | null;
}

const calculateValenceElectrons = (shells: number[]): number => {
  if (shells.length === 0) return 0;
  return shells[shells.length - 1];
};

const calculateVisualProperties = (element: PeriodicElement) => {
  const category = element.category;
  
  let metalness = 0;
  let roughness = 0.5;
  let opacity = 1;
  let emissive = 0;
  
  if (category.includes('metal')) {
    metalness = 0.9;
    roughness = 0.2;
  } else if (category.includes('noble gas')) {
    metalness = 0;
    roughness = 0.1;
    opacity = 0.3;
    emissive = 0.2;
  } else if (category.includes('nonmetal')) {
    metalness = 0;
    roughness = 0.7;
  } else {
    metalness = 0.5;
    roughness = 0.4;
  }
  
  const atomicNumber = element.number;
  const radius = Math.cbrt(atomicNumber) * 0.15 + 0.1;
  
  return {
    color: `#${element['cpk-hex']}`,
    metalness,
    roughness,
    opacity,
    emissive,
    radius,
  };
};

let nextAtomId = 0;

export function loadElementsIntoWorld(
  world: World<AtomEntity>,
  elementSymbols: string[],
  seed: string
): void {
  const rng = new EnhancedRNG(seed);
  
  const elements = periodicTableData.elements as PeriodicElement[];
  
  const symbolToElement = new Map<string, PeriodicElement>();
  elements.forEach(el => {
    symbolToElement.set(el.symbol, el);
  });
  
  elementSymbols.forEach((symbol, index) => {
    const elementData = symbolToElement.get(symbol);
    
    if (!elementData) {
      console.warn(`Element ${symbol} not found in periodic table`);
      return;
    }
    
    const angle = (index / elementSymbols.length) * Math.PI * 2;
    const radius = 3 + rng.normal(0, 0.5);
    const height = rng.normal(0, 1);
    
    const position = {
      x: Math.cos(angle) * radius,
      y: height,
      z: Math.sin(angle) * radius,
    };
    
    const visual = calculateVisualProperties(elementData);
    const valenceElectrons = calculateValenceElectrons(elementData.shells);
    
    world.add({
      id: nextAtomId++,
      element: {
        symbol: elementData.symbol,
        name: elementData.name,
        atomicNumber: elementData.number,
        atomicMass: elementData.atomic_mass,
        category: elementData.category,
        cpkHex: elementData['cpk-hex'],
        shells: elementData.shells,
        electronegativityPauling: elementData.electronegativity_pauling,
      },
      position,
      visual,
      valenceElectrons,
      availableElectrons: valenceElectrons,
    });
  });
  
  console.log(`[loadPeriodicTable] Loaded ${elementSymbols.length} atoms into ECS world with seed: ${seed}`);
}
