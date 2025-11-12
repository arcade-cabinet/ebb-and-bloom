/**
 * ATOMIC WORLD
 * 
 * Miniplex world for atomic-scale entities and chemical bonding.
 * Used by AtomicSystems for molecular simulation and periodic table interactions.
 */

import { World } from 'miniplex';
import periodicTableData from '../../data/PeriodicTableJSON.json';

export interface AtomEntity {
  id: number;
  element: {
    symbol: string;
    atomicNumber: number;
    atomicMass: number;
    electronegativityPauling?: number;
    name: string;
  };
  position: { x: number; y: number; z: number };
  velocity?: { x: number; y: number; z: number };
  valenceElectrons: number;
  availableElectrons: number;
  bonds?: Array<{
    targetId: number;
    bondType: 'covalent' | 'ionic' | 'nonpolar-covalent';
    bondOrder: number;
    energy: number;
  }>;
  visual: {
    radius: number;
    color: string;
    metallic: number;
    roughness: number;
    opacity: number;
  };
}

export type AtomicWorld = World<AtomEntity>;

// Helper to create atomic entities from periodic table data
export function createAtomEntity(symbol: string, position: { x: number; y: number; z: number }, id: number): AtomEntity | null {
  const element = periodicTableData.elements.find((el: any) => el.symbol === symbol);
  if (!element) return null;

  // Get visual properties
  const visual = {
    radius: Math.max(0.1, (element.atomic_mass || 100) / 400),
    color: element.cpk_hex || '#cccccc',
    metallic: element.name.toLowerCase().includes('metal') ? 0.8 : 0.1,
    roughness: element.name.toLowerCase().includes('metal') ? 0.2 : 0.8,
    opacity: element.phase === 'Gas' ? 0.6 : 1.0
  };

  // Calculate valence electrons from electron configuration
  const valenceElectrons = element.electrons_per_shell ? 
    element.electrons_per_shell[element.electrons_per_shell.length - 1] : 
    1;

  return {
    id,
    element: {
      symbol: element.symbol,
      atomicNumber: element.number,
      atomicMass: element.atomic_mass,
      electronegativityPauling: element.electronegativity_pauling,
      name: element.name
    },
    position,
    valenceElectrons,
    availableElectrons: valenceElectrons,
    visual
  };
}