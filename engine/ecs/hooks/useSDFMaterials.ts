/**
 * USE SDF MATERIALS HOOK
 * 
 * Miniplex-react hook for querying and managing SDF materials.
 * Provides reactive access to material assignments across SDF entities.
 */

import { useMemo } from 'react';
import type { World } from 'miniplex';
import type { With } from 'miniplex';
import { useSDFEntities } from './useSDFEntities';
import { materialRegistry } from '../../rendering/sdf/MaterialRegistry';

export interface MaterialUsage {
  materialId: string;
  entityIds: string[];
  count: number;
  material: ReturnType<typeof materialRegistry.get>;
}

export function useSDFMaterials(world: World<any>): MaterialUsage[] {
  const entities = useSDFEntities(world);
  
  const materialUsage = useMemo(() => {
    const usage = new Map<string, MaterialUsage>();
    
    for (const entity of entities) {
      if (!entity.sdfMaterial) continue;
      
      const materialId = entity.sdfMaterial.materialId;
      
      if (!usage.has(materialId)) {
        usage.set(materialId, {
          materialId,
          entityIds: [],
          count: 0,
          material: materialRegistry.get(materialId)
        });
      }
      
      const entry = usage.get(materialId)!;
      entry.entityIds.push(entity.entityId);
      entry.count++;
    }
    
    return Array.from(usage.values());
  }, [entities]);
  
  return materialUsage;
}

export function useEntitiesByMaterial(world: World<any>, materialId: string): With<any, 'sdfShape'>[] {
  return useSDFEntities(world, { materialId });
}
