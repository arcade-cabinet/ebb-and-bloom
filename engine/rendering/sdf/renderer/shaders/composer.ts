import {
  SDF_PRIMITIVES_GLSL,
  SDF_OPERATIONS_GLSL,
  SDF_COORDINATE_TARGETING_GLSL,
  SDF_BLENDING_GLSL,
  SDF_TRANSFORMS_GLSL,
  SDF_UV_GENERATION_GLSL,
  SDF_SURFACE_NORMALS_GLSL,
  SDF_SURFACE_SAMPLING_GLSL,
  SDF_ATTACHMENT_ALIGNMENT_GLSL,
  SDF_LIGHTING_GLSL
} from '../../glsl';
import { SDFPrimitive } from '../../types';
import { SceneSDF, generatePrimitiveUVFunction } from './fragment';

export function composeFragmentShader(
  sceneSDF: SceneSDF,
  primitives: SDFPrimitive[],
  maxSteps: number,
  precision: number,
  maxDistance: number
): string {
  const primitiveUVFunction = generatePrimitiveUVFunction(primitives);

  return `
    ${SDF_PRIMITIVES_GLSL}
    ${SDF_OPERATIONS_GLSL}
    ${SDF_COORDINATE_TARGETING_GLSL}
    ${SDF_BLENDING_GLSL}
    ${SDF_TRANSFORMS_GLSL}
    ${SDF_UV_GENERATION_GLSL}
    ${SDF_SURFACE_NORMALS_GLSL}
    ${SDF_SURFACE_SAMPLING_GLSL}
    ${SDF_ATTACHMENT_ALIGNMENT_GLSL}
    ${SDF_LIGHTING_GLSL}
    
    uniform float uTime;
    uniform vec2 uResolution;
    uniform vec3 uCameraPos;
    uniform float uMaxSteps;
    uniform float uPrecision;
    uniform float uMaxDistance;
    
    uniform float uMaterialBaseColors[60];
    uniform float uMaterialRoughnesses[20];
    uniform float uMaterialMetallics[20];
    uniform float uMaterialEmissions[20];
    uniform float uMaterialEmissiveColors[60];
    uniform float uMaterialOpacities[20];
    uniform int uMaterialCount;
    
    uniform float uCoordinateTargets[60];
    uniform int uPrimitiveCount;
    uniform float uTextureTiling[40];
    uniform float uTextureOffset[40];
    uniform float uPrimitiveTextureFlags[20];
    
    uniform float uLightPositions[24];
    uniform float uLightColors[24];
    uniform float uLightIntensities[8];
    uniform float uLightTypes[8];
    uniform int uLightCount;
    uniform float uEnableShadows;
    uniform float uShadowSoftness;
    uniform float uEnableAO;

    uniform sampler2D t_diffuse;
    uniform sampler2D t_normal;
    uniform sampler2D t_roughness;
    uniform sampler2D t_metallic;
    uniform sampler2D t_ao;
    uniform sampler2D t_emission;
    uniform sampler2D tDefaultTexture;
    
    varying vec2 vUv;
    varying vec3 vWorldPosition;
    
    vec3 triplanarMapping(sampler2D tex, vec3 p, vec3 n, vec2 tiling) {
      vec3 blending = abs(n);
      blending = normalize(max(blending, 0.00001));
      float b = (blending.x + blending.y + blending.z);
      blending /= b;
      
      vec3 xaxis = texture2D(tex, p.yz * tiling).rgb;
      vec3 yaxis = texture2D(tex, p.xz * tiling).rgb;
      vec3 zaxis = texture2D(tex, p.xy * tiling).rgb;
      
      return xaxis * blending.x + yaxis * blending.y + zaxis * blending.z;
    }
    
    float triplanarMappingScalar(sampler2D tex, vec3 p, vec3 n, vec2 tiling) {
      vec3 blending = abs(n);
      blending = normalize(max(blending, 0.00001));
      float b = (blending.x + blending.y + blending.z);
      blending /= b;
      
      float xaxis = texture2D(tex, p.yz * tiling).r;
      float yaxis = texture2D(tex, p.xz * tiling).r;
      float zaxis = texture2D(tex, p.xy * tiling).r;
      
      return xaxis * blending.x + yaxis * blending.y + zaxis * blending.z;
    }
    
    struct Material {
      vec3 baseColor;
      float roughness;
      float metallic;
      float emission;
      vec3 emissiveColor;
      float opacity;
    };
    
    Material getMaterial(int index) {
      int clampedIndex = clamp(index, 0, uMaterialCount - 1);
      int colorOffset = clampedIndex * 3;
      
      return Material(
        vec3(
          uMaterialBaseColors[colorOffset],
          uMaterialBaseColors[colorOffset + 1],
          uMaterialBaseColors[colorOffset + 2]
        ),
        uMaterialRoughnesses[clampedIndex],
        uMaterialMetallics[clampedIndex],
        uMaterialEmissions[clampedIndex],
        vec3(
          uMaterialEmissiveColors[colorOffset],
          uMaterialEmissiveColors[colorOffset + 1],
          uMaterialEmissiveColors[colorOffset + 2]
        ),
        uMaterialOpacities[clampedIndex]
      );
    }

    ${sceneSDF.sdfFunction}

    vec3 raymarch(vec3 ro, vec3 rd) {
      float t = 0.0;
      int matIndex = 0;
      int primIndex = 0;
      
      for (int i = 0; i < int(uMaxSteps); i++) {
        vec3 p = ro + t * rd;
        vec3 result = sceneSDF(p);
        float d = result.x;
        
        if (d < uPrecision) {
          matIndex = int(result.y);
          primIndex = int(result.z);
          break;
        }
        
        t += d * 0.9;
        
        if (t > uMaxDistance) break;
      }
      
      return vec3(t < uMaxDistance ? t : -1.0, float(matIndex), float(primIndex));
    }

    vec3 calcNormal(vec3 p) {
      const float eps = 0.001;
      return normalize(vec3(
        sceneSDF(p + vec3(eps, 0, 0)).x - sceneSDF(p - vec3(eps, 0, 0)).x,
        sceneSDF(p + vec3(0, eps, 0)).x - sceneSDF(p - vec3(0, eps, 0)).x,
        sceneSDF(p + vec3(0, 0, eps)).x - sceneSDF(p - vec3(0, 0, eps)).x
      ));
    }
    
    float getRegionBlendFactor(vec3 localPos, int primitiveIndex) {
      int offset = primitiveIndex * 3;
      if (offset >= 60) return 1.0;
      
      float hasTarget = uCoordinateTargets[offset];
      if (hasTarget < 0.5) return 1.0;
      
      int regionType = int(uCoordinateTargets[offset + 1]);
      float blendRadius = uCoordinateTargets[offset + 2];
      
      return classifyRegionSmooth(localPos, regionType, blendRadius);
    }
    
    vec2 getPrimitiveUV(vec3 p, int primitiveIndex) {
      ${primitiveUVFunction}
      return vec2(0.0);
    }

    vec3 lighting(vec3 p, vec3 n, vec3 rd, Material mat, int primitiveIndex) {
      vec3 viewDir = -rd;

      vec3 baseColor = mat.baseColor;
      float roughness = mat.roughness;
      float metallic = mat.metallic;
      float ao = 1.0;
      vec3 emissive = mat.emissiveColor * mat.emission;
      
      int flags = int(uPrimitiveTextureFlags[primitiveIndex]);
      bool hasTextures = flags > 0;
      
      if (hasTextures) {
        vec2 uv = getPrimitiveUV(p, primitiveIndex);
        
        int tilingOffset = primitiveIndex * 2;
        int offsetOffset = primitiveIndex * 2;
        vec2 tiling = vec2(uTextureTiling[tilingOffset], uTextureTiling[tilingOffset + 1]);
        vec2 offset = vec2(uTextureOffset[offsetOffset], uTextureOffset[offsetOffset + 1]);
        uv = applyUVTransform(uv, tiling, offset);
        
        if ((flags & 1) != 0) {
          baseColor = texture2D(t_diffuse, uv).rgb;
        }
        if ((flags & 4) != 0) {
          roughness = texture2D(t_roughness, uv).r;
        }
        if ((flags & 8) != 0) {
          metallic = texture2D(t_metallic, uv).r;
        }
        if ((flags & 16) != 0) {
          ao = texture2D(t_ao, uv).r;
        }
        if ((flags & 32) != 0) {
          emissive += texture2D(t_emission, uv).rgb;
        }
      }
      
      if (uEnableAO > 0.5) {
        ao *= ambientOcclusionFast(p, n);
      }
      
      PBRMaterial pbrMat = PBRMaterial(baseColor, roughness, metallic, emissive);
      
      vec3 totalLight = vec3(0.0);
      vec3 ambientLight = vec3(0.0);
      
      for (int i = 0; i < 8; i++) {
        if (i >= uLightCount) break;
        
        int posOffset = i * 3;
        int colorOffset = i * 3;
        
        float lightType = uLightTypes[i];
        vec3 lightColor = vec3(
          uLightColors[colorOffset],
          uLightColors[colorOffset + 1],
          uLightColors[colorOffset + 2]
        );
        float lightIntensity = uLightIntensities[i];
        
        if (lightType > 2.5 && lightType < 3.5) {
          ambientLight += lightColor * lightIntensity;
        }
        else if (lightType > -0.5 && lightType < 0.5) {
          vec3 lightDir = normalize(vec3(
            uLightPositions[posOffset],
            uLightPositions[posOffset + 1],
            uLightPositions[posOffset + 2]
          ));
          
          float shadow = 1.0;
          if (uEnableShadows > 0.5) {
            shadow = softShadow(p, lightDir, 0.01, 10.0, uShadowSoftness);
          }
          
          vec3 lighting = pbrShading(n, viewDir, lightDir, lightColor, lightIntensity, pbrMat);
          totalLight += lighting * shadow;
        }
        else if (lightType > 0.5 && lightType < 1.5) {
          vec3 lightPos = vec3(
            uLightPositions[posOffset],
            uLightPositions[posOffset + 1],
            uLightPositions[posOffset + 2]
          );
          vec3 lightDir = normalize(lightPos - p);
          float lightDist = length(lightPos - p);
          float attenuation = 1.0 / (1.0 + 0.1 * lightDist + 0.01 * lightDist * lightDist);
          
          float shadow = 1.0;
          if (uEnableShadows > 0.5) {
            shadow = softShadow(p, lightDir, 0.01, lightDist, uShadowSoftness);
          }
          
          vec3 lighting = pbrShading(n, viewDir, lightDir, lightColor, lightIntensity * attenuation, pbrMat);
          totalLight += lighting * shadow;
        }
        else if (lightType > 1.5 && lightType < 2.5) {
          vec3 lightPos = vec3(
            uLightPositions[posOffset],
            uLightPositions[posOffset + 1],
            uLightPositions[posOffset + 2]
          );
          vec3 lightDir = normalize(lightPos - p);
          float lightDist = length(lightPos - p);
          float attenuation = 1.0 / (1.0 + 0.1 * lightDist + 0.01 * lightDist * lightDist);
          
          float shadow = 1.0;
          if (uEnableShadows > 0.5) {
            shadow = softShadow(p, lightDir, 0.01, lightDist, uShadowSoftness);
          }
          
          vec3 lighting = pbrShading(n, viewDir, lightDir, lightColor, lightIntensity * attenuation, pbrMat);
          totalLight += lighting * shadow;
        }
      }
      
      vec3 ambient = ambientLight * baseColor * ao;
      vec3 finalColor = totalLight + ambient + emissive;
      
      return finalColor;
    }

    void main() {
      vec2 screenPos = (vUv - 0.5) * 2.0;
      screenPos.x *= uResolution.x / uResolution.y;
      
      vec3 rayOrigin = uCameraPos;
      vec3 rayDir = normalize(vWorldPosition - uCameraPos);
      
      vec3 raymarchResult = raymarch(rayOrigin, rayDir);
      float t = raymarchResult.x;
      int materialIndex = int(raymarchResult.y);
      int primitiveIndex = int(raymarchResult.z);
      
      vec3 color = vec3(0.05, 0.05, 0.1);
      
      if (t > 0.0) {
        vec3 hitPoint = rayOrigin + t * rayDir;
        vec3 normal = calcNormal(hitPoint);
        
        float regionBlend = getRegionBlendFactor(hitPoint, primitiveIndex);
        
        Material mat = getMaterial(materialIndex);
        vec3 litColor = lighting(hitPoint, normal, rayDir, mat, primitiveIndex);
        
        vec3 backgroundColor = vec3(0.05, 0.05, 0.1);
        color = mix(backgroundColor, litColor, regionBlend);
        
        float depth = t / uMaxDistance;
        color = mix(color, vec3(0.1, 0.1, 0.3), depth * 0.3);
      }
      
      gl_FragColor = vec4(color, 1.0);
    }
  `;
}
