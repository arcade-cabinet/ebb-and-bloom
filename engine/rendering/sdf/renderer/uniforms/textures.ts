import * as THREE from 'three';

export interface TextureUniforms {
  tDefaultTexture: { value: THREE.Texture };
}

export function createTextureUniforms(defaultTexture: THREE.Texture): TextureUniforms {
  return {
    tDefaultTexture: { value: defaultTexture }
  };
}

export function addProvidedTextures(
  baseUniforms: Record<string, { value: any }>,
  textures?: Record<string, THREE.Texture>
): Record<string, { value: THREE.Texture }> {
  const texUniformsFromProps: Record<string, { value: THREE.Texture }> = {};
  if (textures) {
    for (const key in textures) {
      texUniformsFromProps[`t_${key}`] = { value: textures[key] };
    }
  }
  return texUniformsFromProps;
}
