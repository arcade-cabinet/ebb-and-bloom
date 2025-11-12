import { SDFPrimitive } from '../../types';

export interface PrimitiveUniforms {
  uCoordinateTargets: { value: Float32Array };
  uPrimitiveCount: { value: number };
  uTextureTiling: { value: Float32Array };
  uTextureOffset: { value: Float32Array };
  uPrimitiveTextureFlags: { value: Float32Array };
}

export function createPrimitiveUniforms(primitives: SDFPrimitive[]): PrimitiveUniforms {
  const regionTypeMap: Record<string, number> = {
    'all': 0, 'top': 1, 'bottom': 2, 'sides': 3,
    'front': 4, 'back': 5, 'left': 6, 'right': 7
  };
  
  const coordinateTargetData: number[] = [];
  const textureTilingData: number[] = [];
  const textureOffsetData: number[] = [];
  const primitiveTextureFlags: number[] = [];
  
  primitives.forEach((prim) => {
    if (prim.coordinateTarget) {
      coordinateTargetData.push(1.0);
      coordinateTargetData.push(regionTypeMap[prim.coordinateTarget.region] || 0);
      coordinateTargetData.push(prim.coordinateTarget.blendRadius || 0.1);
    } else {
      coordinateTargetData.push(0.0);
      coordinateTargetData.push(0.0);
      coordinateTargetData.push(0.0);
    }
    
    const textureSet = prim.textureSet;
    if (textureSet) {
      const tiling = textureSet.tiling || [1, 1];
      const offset = textureSet.offset || [0, 0];
      textureTilingData.push(...tiling);
      textureOffsetData.push(...offset);
      
      let flags = 0;
      if (textureSet.diffuse) flags |= 1;
      if (textureSet.normal) flags |= 2;
      if (textureSet.roughness) flags |= 4;
      if (textureSet.metallic) flags |= 8;
      if (textureSet.ao) flags |= 16;
      if (textureSet.emission) flags |= 32;
      primitiveTextureFlags.push(flags);
    } else {
      textureTilingData.push(1, 1);
      textureOffsetData.push(0, 0);
      primitiveTextureFlags.push(0);
    }
  });
  
  return {
    uCoordinateTargets: { value: new Float32Array(coordinateTargetData) },
    uPrimitiveCount: { value: primitives.length },
    uTextureTiling: { value: new Float32Array(textureTilingData) },
    uTextureOffset: { value: new Float32Array(textureOffsetData) },
    uPrimitiveTextureFlags: { value: new Float32Array(primitiveTextureFlags) }
  };
}
