/**
 * USE SDF ENTITIES HOOK
 * 
 * Miniplex-react hook for querying entities with SDF rendering components.
 * Provides reactive access to SDF entities for rendering and manipulation.
 */

import { useMemo } from 'react';
import { useEntities } from 'miniplex-react';
import type { World, With } from 'miniplex';
import type { SDFShape } from '../components/SDFComponents';

export interface SDFEntitiesFilter {
  visible?: boolean;
  primitiveType?: SDFShape['primitiveType'];
  materialId?: string;
}

type SDFEntityWithShape = With<any, 'sdfShape'>;

export function useSDFEntities(
  world: World<any>,
  filter?: SDFEntitiesFilter
): SDFEntityWithShape[] {
  const query = world.with('sdfShape');
  const allEntities = useEntities(query);
  
  const filteredEntities = useMemo(() => {
    const entityArray = Array.from(allEntities);
    
    if (!filter) {
      return entityArray;
    }
    
    return entityArray.filter((entity: any) => {
      if (filter.visible !== undefined && entity.visible !== filter.visible) {
        return false;
      }
      
      if (filter.primitiveType && entity.sdfShape?.primitiveType !== filter.primitiveType) {
        return false;
      }
      
      if (filter.materialId && entity.sdfMaterial?.materialId !== filter.materialId) {
        return false;
      }
      
      return true;
    }) as SDFEntityWithShape[];
  }, [allEntities, filter]);
  
  return filteredEntities;
}

export function useSDFEntityById(world: World<any>, entityId: string): SDFEntityWithShape | undefined {
  const entities = useSDFEntities(world);
  return entities.find((e: SDFEntityWithShape) => e.entityId === entityId);
}
