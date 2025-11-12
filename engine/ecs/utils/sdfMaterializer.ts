/**
 * SDF MATERIALIZER UTILITY
 * 
 * Pure function to convert ECS entities to SDFPrimitive objects.
 * Resolves material IDs from ECS components. The renderer will look up
 * material properties from MaterialRegistry using the materialId.
 */

import type { SDFPrimitive } from '../../rendering/sdf/types';
import type { SDFEntity } from '../components/SDFComponents';

/**
 * Convert an ECS entity with SDF components to an SDFPrimitive.
 * 
 * This is a pure function that:
 * - Extracts shape and transform data from the entity
 * - Looks up material properties from materialRegistry
 * - Merges everything into an SDFPrimitive
 * - Handles missing materials with fallback defaults
 * 
 * @param entity - Entity with sdfShape component
 * @returns SDFPrimitive ready for rendering
 */
export function entityToSDFPrimitive(entity: SDFEntity): SDFPrimitive {
  const { sdfShape, sdfMaterial, sdfOperation } = entity;
  
  const materialId = sdfMaterial?.materialId || 'default';
  
  const operationType = sdfShape.operation || sdfOperation?.operationType || 'union';
  const validOperation = operationType === 'displace' ? 'union' : operationType;
  
  const primitive: SDFPrimitive = {
    type: sdfShape.primitiveType,
    params: sdfShape.params,
    position: [sdfShape.position.x, sdfShape.position.y, sdfShape.position.z],
    rotation: sdfShape.rotation 
      ? [sdfShape.rotation.x, sdfShape.rotation.y, sdfShape.rotation.z]
      : undefined,
    scale: sdfShape.scale
      ? [sdfShape.scale.x, sdfShape.scale.y, sdfShape.scale.z]
      : undefined,
    materialId,
    operation: validOperation as SDFPrimitive['operation'],
    operationStrength: sdfShape.operationStrength || sdfOperation?.operationStrength
  };
  
  return primitive;
}
