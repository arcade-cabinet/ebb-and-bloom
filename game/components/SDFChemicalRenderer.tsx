/**
 * SDF CHEMICAL RENDERER - 5 lines of code
 */

import { useEntities } from 'miniplex-react';
import { useMemo } from 'react';
import { useGameState } from '../state/GameState';
import { SDFRenderer } from '../../engine/rendering/sdf/SDFRenderer';
import { ChemicalSDFBuilder } from '../../engine/rendering/chemistry/ChemicalSDFBuilder';

export function SDFChemicalRenderer() {
  const { world } = useGameState();
  if (!world) return null;
  
  const entities = Array.from(useEntities(world.entities.with('elementCounts', 'position')));
  const primitives = useMemo(() => {
    const atoms = ChemicalSDFBuilder.buildSceneFromECS(entities).primitives;
    const bonds: any[] = [];
    entities.forEach((e1, i) => {
      if (!e1.position) return;
      entities.slice(i + 1).forEach(e2 => {
        if (!e2.position) return;
        const d = Math.sqrt(Math.pow(e1.position.x - e2.position.x, 2) + Math.pow(e1.position.y - e2.position.y, 2) + Math.pow(e1.position.z - e2.position.z, 2));
        if (d > 0.5 && d < 3.0) bonds.push({ type: 'capsule' as const, position: [e1.position.x, e1.position.y, e1.position.z], params: [e2.position.x, e2.position.y, e2.position.z, 0.06], materialId: 4, operation: 'smooth-union' as const, operationStrength: 0.2 });
      });
    });
    return [...atoms, ...bonds];
  }, [entities]);
  
  return primitives.length > 0 ? <SDFRenderer primitives={primitives} /> : null;
}

