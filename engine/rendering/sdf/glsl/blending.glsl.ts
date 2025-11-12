export const SDF_BLENDING_GLSL = `
// Material blending system

float hash(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

float noise3D(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  
  return mix(
    mix(
      mix(hash(i + vec3(0, 0, 0)), hash(i + vec3(1, 0, 0)), f.x),
      mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), f.x),
      f.y
    ),
    mix(
      mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), f.x),
      mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), f.x),
      f.y
    ),
    f.z
  );
}

struct MaterialData {
  vec3 baseColor;
  float roughness;
  float metallic;
  float emission;
  vec3 emissiveColor;
  float opacity;
};

MaterialData linearBlend(MaterialData mat1, MaterialData mat2, float factor) {
  float t = clamp(factor, 0.0, 1.0);
  
  return MaterialData(
    mix(mat1.baseColor, mat2.baseColor, t),
    mix(mat1.roughness, mat2.roughness, t),
    mix(mat1.metallic, mat2.metallic, t),
    mix(mat1.emission, mat2.emission, t),
    mix(mat1.emissiveColor, mat2.emissiveColor, t),
    mix(mat1.opacity, mat2.opacity, t)
  );
}

MaterialData smoothBlend(MaterialData mat1, MaterialData mat2, float factor, float smoothness) {
  float t = clamp(factor, 0.0, 1.0);
  t = smoothstep(0.0, 1.0, t);
  
  float blendFactor = pow(t, smoothness);
  
  return MaterialData(
    mix(mat1.baseColor, mat2.baseColor, blendFactor),
    mix(mat1.roughness, mat2.roughness, blendFactor),
    mix(mat1.metallic, mat2.metallic, blendFactor),
    mix(mat1.emission, mat2.emission, blendFactor),
    mix(mat1.emissiveColor, mat2.emissiveColor, blendFactor),
    mix(mat1.opacity, mat2.opacity, t)
  );
}

MaterialData noiseBlend(MaterialData mat1, MaterialData mat2, float factor, float scale, vec3 p) {
  float t = clamp(factor, 0.0, 1.0);
  float noiseValue = noise3D(p * scale);
  t = mix(t - 0.2, t + 0.2, noiseValue);
  t = clamp(t, 0.0, 1.0);
  
  return MaterialData(
    mix(mat1.baseColor, mat2.baseColor, t),
    mix(mat1.roughness, mat2.roughness, t),
    mix(mat1.metallic, mat2.metallic, t),
    mix(mat1.emission, mat2.emission, t),
    mix(mat1.emissiveColor, mat2.emissiveColor, t),
    mix(mat1.opacity, mat2.opacity, t)
  );
}

MaterialData gradientBlend(MaterialData mat1, MaterialData mat2, vec3 p, vec3 direction, float distance) {
  vec3 dir = normalize(direction);
  float projection = dot(p, dir);
  float t = clamp(projection / distance + 0.5, 0.0, 1.0);
  
  return MaterialData(
    mix(mat1.baseColor, mat2.baseColor, t),
    mix(mat1.roughness, mat2.roughness, t),
    mix(mat1.metallic, mat2.metallic, t),
    mix(mat1.emission, mat2.emission, t),
    mix(mat1.emissiveColor, mat2.emissiveColor, t),
    mix(mat1.opacity, mat2.opacity, t)
  );
}

MaterialData distanceBlend(MaterialData mat1, MaterialData mat2, float sdfDistance, float transitionDistance) {
  float t = clamp(abs(sdfDistance) / transitionDistance, 0.0, 1.0);
  
  return MaterialData(
    mix(mat1.baseColor, mat2.baseColor, t),
    mix(mat1.roughness, mat2.roughness, t),
    mix(mat1.metallic, mat2.metallic, t),
    mix(mat1.emission, mat2.emission, t),
    mix(mat1.emissiveColor, mat2.emissiveColor, t),
    mix(mat1.opacity, mat2.opacity, t)
  );
}

MaterialData makeMaterialData(vec3 baseColor, float roughness, float metallic, 
                               float emission, vec3 emissiveColor, float opacity) {
  return MaterialData(baseColor, roughness, metallic, emission, emissiveColor, opacity);
}

MaterialData blendMaterialsByMode(
  MaterialData mat1, 
  MaterialData mat2, 
  int mode,
  float factor,
  float param1,
  vec3 param2
) {
  if (mode == 0) {
    return linearBlend(mat1, mat2, factor);
  } else if (mode == 1) {
    return smoothBlend(mat1, mat2, factor, param1);
  } else if (mode == 2) {
    return noiseBlend(mat1, mat2, factor, param1, param2);
  } else if (mode == 3) {
    return gradientBlend(mat1, mat2, param2, normalize(vec3(param1, 0.5, 0.5)), 1.0);
  } else if (mode == 4) {
    return distanceBlend(mat1, mat2, factor, param1);
  }
  
  return linearBlend(mat1, mat2, factor);
}
`;
