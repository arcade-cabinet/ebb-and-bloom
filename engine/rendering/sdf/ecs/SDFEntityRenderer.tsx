/**
 * SDF ENTITY RENDERER
 * 
 * React component that renders Miniplex ECS entities with SDF components.
 * Bridges the gap between the scientific law system (ECS) and visual rendering (SDF).
 */

import { useMemo } from 'react';
import type { World } from 'miniplex';
import { SDFRenderer } from '../renderer/SDFRenderer';
import { useSDFEntities } from '../../../ecs/hooks/useSDFEntities';
import { entityToSDFPrimitive } from '../../../ecs/utils/sdfMaterializer';
import type { SDFPrimitive } from '../types';

export interface SDFEntityRendererProps {
  world: World<any>;
  maxSteps?: number;
  precision?: number;
}

export function SDFEntityRenderer({
  world,
  maxSteps = 128,
  precision = 0.001
}: SDFEntityRendererProps) {
  const entities = useSDFEntities(world, { visible: true });
  
  const primitives = useMemo<SDFPrimitive[]>(() => {
    return entities.map(entity => entityToSDFPrimitive(entity));
  }, [entities]);
  
  const lodConfig = useMemo(() => {
    const firstEntityWithLOD = entities.find(e => e.sdfLOD);
    if (firstEntityWithLOD?.sdfLOD) {
      return {
        maxSteps: firstEntityWithLOD.sdfLOD.maxSteps,
        precision: firstEntityWithLOD.sdfLOD.precision
      };
    }
    return { maxSteps, precision };
  }, [entities, maxSteps, precision]);
  
  if (primitives.length === 0) {
    return null;
  }
  
  return (
    <SDFRenderer 
      primitives={primitives}
      maxSteps={lodConfig.maxSteps}
      precision={lodConfig.precision}
    />
  );
}
