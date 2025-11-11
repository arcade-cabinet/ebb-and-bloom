import { World } from 'miniplex';

export type AtomEntity = {
  id: number;
  element: {
    symbol: string;
    name: string;
    atomicNumber: number;
    atomicMass: number;
    category: string;
    cpkHex: string;
    shells: number[];
    electronegativityPauling: number | null;
  };
  
  position: { x: number; y: number; z: number };
  velocity?: { x: number; y: number; z: number };
  
  visual: {
    color: string;
    metalness: number;
    roughness: number;
    opacity: number;
    emissive: number;
    radius: number;
  };
  
  valenceElectrons: number;
  availableElectrons: number;
  bonds?: Array<{ targetId: number; bondType: string; bondOrder: number; energy: number }>;
};

export const createAtomicWorld = () => new World<AtomEntity>();
