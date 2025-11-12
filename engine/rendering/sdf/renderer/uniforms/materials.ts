import { SDFPrimitive } from '../../types';
import { materialRegistry } from '../../MaterialRegistry';

export interface MaterialUniforms {
  uMaterialBaseColors: { value: Float32Array };
  uMaterialRoughnesses: { value: Float32Array };
  uMaterialMetallics: { value: Float32Array };
  uMaterialEmissions: { value: Float32Array };
  uMaterialEmissiveColors: { value: Float32Array };
  uMaterialOpacities: { value: Float32Array };
  uMaterialCount: { value: number };
}

export interface MaterialIndexMap {
  indexMap: Map<string, number>;
}

export function createMaterialUniforms(primitives: SDFPrimitive[]): MaterialUniforms & MaterialIndexMap {
  const uniqueMaterialIds = new Set(primitives.map(p => p.materialId));
  const indexMap = new Map<string, number>();
  
  const baseColors: number[] = [];
  const roughnesses: number[] = [];
  const metallics: number[] = [];
  const emissions: number[] = [];
  const emissiveColors: number[] = [];
  const opacities: number[] = [];
  
  let index = 0;
  for (const matId of uniqueMaterialIds) {
    const material = materialRegistry.get(matId) || materialRegistry.get('default')!;
    indexMap.set(matId, index);
    
    baseColors.push(...material.baseColor);
    roughnesses.push(material.roughness);
    metallics.push(material.metallic);
    emissions.push(material.emission);
    emissiveColors.push(...material.emissiveColor);
    opacities.push(material.opacity);
    
    index++;
  }
  
  return {
    uMaterialBaseColors: { value: new Float32Array(baseColors) },
    uMaterialRoughnesses: { value: new Float32Array(roughnesses) },
    uMaterialMetallics: { value: new Float32Array(metallics) },
    uMaterialEmissions: { value: new Float32Array(emissions) },
    uMaterialEmissiveColors: { value: new Float32Array(emissiveColors) },
    uMaterialOpacities: { value: new Float32Array(opacities) },
    uMaterialCount: { value: index },
    indexMap
  };
}
