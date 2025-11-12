/**
 * SDF RENDERER - GENERAL RAYMARCHING FOUNDATION
 * 
 * Simple API: Just pass primitives. Camera/lighting auto-detected from R3F context.
 * Uses MaterialRegistry for string-based material lookups with PBR properties.
 */

import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { SDFPrimitive } from './SDFPrimitives';
import { 
  SDF_PRIMITIVES_GLSL, 
  SDF_OPERATIONS_GLSL, 
  SDF_COORDINATE_TARGETING_GLSL,
  SDF_TRANSFORMS_GLSL,
  SDF_UV_GENERATION_GLSL,
  SDF_BLENDING_GLSL,
  SDF_SURFACE_NORMALS_GLSL,
  SDF_SURFACE_SAMPLING_GLSL,
  SDF_ATTACHMENT_ALIGNMENT_GLSL,
  SDF_LIGHTING_GLSL
} from './SDFPrimitives';
import { materialRegistry } from './MaterialRegistry';
import { HostPrimitive, foreignBodySystem } from './ForeignBodySystem';

interface SDFRendererProps {
  primitives?: SDFPrimitive[];
  hostPrimitives?: HostPrimitive[];
  textures?: Record<string, THREE.Texture>;
  maxSteps?: number;
  precision?: number;
  maxDistance?: number;
  enableShadows?: boolean;
  shadowSoftness?: number;
  enableAO?: boolean;
}

export function SDFRenderer({ 
  primitives,
  hostPrimitives,
  textures,
  maxSteps = 128,
  precision = 0.001,
  maxDistance = 20.0,
  enableShadows = true,
  shadowSoftness = 16.0,
  enableAO = true
}: SDFRendererProps) {
  const { camera, size, scene } = useThree();
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  const expandedPrimitives = useMemo(() => {
    if (hostPrimitives && hostPrimitives.length > 0) {
      const allPrimitives: SDFPrimitive[] = [];
      for (const host of hostPrimitives) {
        const composite = foreignBodySystem.createComposite(host);
        allPrimitives.push(...composite);
      }
      if (primitives) {
        allPrimitives.push(...primitives);
      }
      return allPrimitives;
    }
    return primitives || [];
  }, [primitives, hostPrimitives]);
  
  const createDefaultTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 1, 1);
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  };
  
  const defaultTexture = useMemo(() => createDefaultTexture(), []);
  
  const { materialUniforms, materialIndexMap, textureUniforms } = useMemo(() => {
    const uniqueMaterialIds = new Set(expandedPrimitives.map(p => p.materialId));
    const indexMap = new Map<string, number>();
    const uniforms: Record<string, { value: any }> = {};
    
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
    
    uniforms.uMaterialBaseColors = { value: new Float32Array(baseColors) };
    uniforms.uMaterialRoughnesses = { value: new Float32Array(roughnesses) };
    uniforms.uMaterialMetallics = { value: new Float32Array(metallics) };
    uniforms.uMaterialEmissions = { value: new Float32Array(emissions) };
    uniforms.uMaterialEmissiveColors = { value: new Float32Array(emissiveColors) };
    uniforms.uMaterialOpacities = { value: new Float32Array(opacities) };
    uniforms.uMaterialCount = { value: index };
    
    const regionTypeMap: Record<string, number> = {
      'all': 0, 'top': 1, 'bottom': 2, 'sides': 3,
      'front': 4, 'back': 5, 'left': 6, 'right': 7
    };
    
    const coordinateTargetData: number[] = [];
    const textureTilingData: number[] = [];
    const textureOffsetData: number[] = [];
    const primitiveTextureFlags: number[] = [];
    
    expandedPrimitives.forEach((prim) => {
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
    
    uniforms.uCoordinateTargets = { value: new Float32Array(coordinateTargetData) };
    uniforms.uPrimitiveCount = { value: expandedPrimitives.length };
    uniforms.uTextureTiling = { value: new Float32Array(textureTilingData) };
    uniforms.uTextureOffset = { value: new Float32Array(textureOffsetData) };
    uniforms.uPrimitiveTextureFlags = { value: new Float32Array(primitiveTextureFlags) };
    
    const texUniforms: Record<string, { value: THREE.Texture }> = {};
    texUniforms.tDefaultTexture = { value: defaultTexture };
    
    return { materialUniforms: uniforms, materialIndexMap: indexMap, textureUniforms: texUniforms };
  }, [expandedPrimitives, defaultTexture]);
  
  const lightUniforms = useMemo(() => {
    const MAX_LIGHTS = 8;
    const lightPositions: number[] = [];
    const lightColors: number[] = [];
    const lightIntensities: number[] = [];
    const lightTypes: number[] = [];
    let lightCount = 0;
    
    scene.traverse((obj) => {
      if (lightCount >= MAX_LIGHTS) return;
      
      if (obj instanceof THREE.DirectionalLight) {
        const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(obj.quaternion);
        lightPositions.push(dir.x, dir.y, dir.z);
        lightColors.push(obj.color.r, obj.color.g, obj.color.b);
        lightIntensities.push(obj.intensity);
        lightTypes.push(0);
        lightCount++;
      } else if (obj instanceof THREE.PointLight) {
        lightPositions.push(obj.position.x, obj.position.y, obj.position.z);
        lightColors.push(obj.color.r, obj.color.g, obj.color.b);
        lightIntensities.push(obj.intensity);
        lightTypes.push(1);
        lightCount++;
      } else if (obj instanceof THREE.SpotLight) {
        lightPositions.push(obj.position.x, obj.position.y, obj.position.z);
        lightColors.push(obj.color.r, obj.color.g, obj.color.b);
        lightIntensities.push(obj.intensity);
        lightTypes.push(2);
        lightCount++;
      } else if (obj instanceof THREE.AmbientLight) {
        if (lightCount === 0 || lightTypes[0] !== 3) {
          lightPositions.unshift(0, 0, 0);
          lightColors.unshift(obj.color.r, obj.color.g, obj.color.b);
          lightIntensities.unshift(obj.intensity);
          lightTypes.unshift(3);
          lightCount++;
        }
      }
    });
    
    while (lightPositions.length < MAX_LIGHTS * 3) {
      lightPositions.push(0, 0, 0);
      lightColors.push(0, 0, 0);
      lightIntensities.push(0);
      lightTypes.push(-1);
    }
    
    return {
      uLightPositions: { value: new Float32Array(lightPositions) },
      uLightColors: { value: new Float32Array(lightColors) },
      uLightIntensities: { value: new Float32Array(lightIntensities) },
      uLightTypes: { value: new Float32Array(lightTypes) },
      uLightCount: { value: lightCount },
      uEnableShadows: { value: enableShadows ? 1.0 : 0.0 },
      uShadowSoftness: { value: shadowSoftness },
      uEnableAO: { value: enableAO ? 1.0 : 0.0 }
    };
  }, [scene, enableShadows, shadowSoftness, enableAO]);
  
  const uniforms = useMemo(() => {
    const texUniformsFromProps: Record<string, { value: THREE.Texture }> = {};
    if (textures) {
      for (const key in textures) {
        texUniformsFromProps[`t_${key}`] = { value: textures[key] };
      }
    }
    
    return {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
      uCameraPos: { value: new THREE.Vector3() },
      uMaxSteps: { value: maxSteps },
      uPrecision: { value: precision },
      uMaxDistance: { value: maxDistance },
      ...materialUniforms,
      ...lightUniforms,
      ...textureUniforms,
      ...texUniformsFromProps
    };
  }, [size, maxSteps, precision, maxDistance, textures, materialUniforms, lightUniforms, textureUniforms]);

  useFrame(({ clock }) => {
    if (!materialRef.current) return;
    uniforms.uTime.value = clock.getElapsedTime();
    uniforms.uCameraPos.value.copy(camera.position);
  });

  const generateSceneSDF = useMemo(() => {
    if (expandedPrimitives.length === 0) {
      return {
        sdfFunction: 'vec3 sceneSDF(vec3 p) { return vec3(1000.0, 0.0, 0.0); }',
        primitiveData: [],
        materialIds: []
      };
    }
    
    let sdfCode = `vec3 sceneSDF(vec3 p) {\n  float result = ${maxDistance}.0;\n  float current;\n  int materialIndex = 0;\n  int primitiveIndex = 0;\n  vec3 pTransformed;\n`;
    const primitiveData: Array<{ type: string; params: number[] }> = [];
    const materialIds: number[] = [];

    expandedPrimitives.forEach((primitive, index) => {
      const pos = `vec3(${primitive.position.join(', ')})`;
      const matIndex = materialIndexMap.get(primitive.materialId) || 0;
      materialIds.push(matIndex);
      primitiveData.push({ type: primitive.type, params: primitive.params });
      
      const rotation = primitive.rotation || [0, 0, 0];
      const scale = primitive.scale || [1, 1, 1];
      const hasRotation = rotation.some(r => r !== 0);
      const hasScale = scale.some(s => s !== 1);
      const hasTransform = hasRotation || hasScale;
      
      if (hasTransform) {
        sdfCode += `  pTransformed = applyInverseTransform(p - ${pos}, vec3(${rotation.join(', ')}), vec3(${scale.join(', ')}));\n`;
      } else {
        sdfCode += `  pTransformed = p - ${pos};\n`;
      }
      
      switch (primitive.type) {
        case 'sphere':
          sdfCode += `  current = sdSphere(pTransformed, ${primitive.params[0]});\n`;
          break;
        case 'box':
          sdfCode += `  current = sdBox(pTransformed, vec3(${primitive.params.slice(0, 3).join(', ')}));\n`;
          break;
        case 'cylinder':
          sdfCode += `  current = sdCylinder(pTransformed, ${primitive.params[0]}, ${primitive.params[1]});\n`;
          break;
        case 'pyramid':
          sdfCode += `  current = sdPyramid(pTransformed, ${primitive.params[0]});\n`;
          break;
        case 'torus':
          sdfCode += `  current = sdTorus(pTransformed, vec2(${primitive.params[0]}, ${primitive.params[1]}));\n`;
          break;
        case 'cone':
          sdfCode += `  current = sdCone(pTransformed, vec2(${primitive.params[0]}, ${primitive.params[1]}), ${primitive.params[2]});\n`;
          break;
        case 'octahedron':
          sdfCode += `  current = sdOctahedron(pTransformed, ${primitive.params[0]});\n`;
          break;
        case 'capsule':
          const endPos = `vec3(${primitive.params[0]}, ${primitive.params[1]}, ${primitive.params[2]})`;
          sdfCode += `  current = sdCapsule(p, ${pos}, ${endPos}, ${primitive.params[3]});\n`;
          break;
        case 'porbital':
          sdfCode += `  current = sdPOrbital(pTransformed, ${primitive.params[0]});\n`;
          break;
        case 'dorbital':
          sdfCode += `  current = sdDOrbital(pTransformed, ${primitive.params[0]});\n`;
          break;
        case 'hexprism':
          sdfCode += `  current = sdHexPrism(pTransformed, vec2(${primitive.params[0]}, ${primitive.params[1]}));\n`;
          break;
        case 'triPrism':
          sdfCode += `  current = sdTriPrism(pTransformed, vec2(${primitive.params[0]}, ${primitive.params[1]}));\n`;
          break;
        case 'ellipsoid':
          sdfCode += `  current = sdEllipsoid(pTransformed, vec3(${primitive.params.slice(0, 3).join(', ')}));\n`;
          break;
        case 'roundedBox':
          sdfCode += `  current = sdRoundedBox(pTransformed, vec3(${primitive.params.slice(0, 3).join(', ')}), ${primitive.params[3]});\n`;
          break;
        case 'cappedCylinder':
          sdfCode += `  current = sdCappedCylinder(pTransformed, ${primitive.params[0]}, ${primitive.params[1]});\n`;
          break;
        case 'plane':
          sdfCode += `  current = sdPlane(pTransformed, vec3(${primitive.params.slice(0, 3).join(', ')}), ${primitive.params[3]});\n`;
          break;
        case 'roundCone':
          sdfCode += `  current = sdRoundCone(pTransformed, ${primitive.params[0]}, ${primitive.params[1]}, ${primitive.params[2]});\n`;
          break;
        case 'mengerSponge':
          sdfCode += `  current = sdMengerSponge(pTransformed, ${primitive.params[0]});\n`;
          break;
        case 'gyroid':
          sdfCode += `  current = sdGyroid(pTransformed, ${primitive.params[0]}, ${primitive.params[1]});\n`;
          break;
        case 'superellipsoid':
          sdfCode += `  current = sdSuperellipsoid(pTransformed, ${primitive.params[0]}, ${primitive.params[1]}, ${primitive.params[2]});\n`;
          break;
        case 'torusKnot':
          sdfCode += `  current = sdTorusKnot(pTransformed, ${primitive.params[0]}, ${primitive.params[1]}, ${primitive.params[2]});\n`;
          break;
      }
      
      // Apply distance field compensation for scaling
      if (hasScale) {
        sdfCode += `  current = compensateSDFDistance(current, vec3(${scale.join(', ')}));\n`;
      }

      if (index === 0) {
        sdfCode += `  result = current;\n`;
        sdfCode += `  materialIndex = ${matIndex};\n`;
        sdfCode += `  primitiveIndex = ${index};\n`;
      } else {
        const op = primitive.operation || 'union';
        const strength = primitive.operationStrength || 0.1;
        
        switch (op) {
          case 'smooth-union':
            sdfCode += `  if (current < result) { result = opSmoothUnion(result, current, ${strength}); materialIndex = ${matIndex}; primitiveIndex = ${index}; }\n`;
            break;
          case 'subtract':
            sdfCode += `  result = opSubtraction(current, result);\n`;
            break;
          case 'intersect':
            sdfCode += `  result = opIntersection(result, current);\n`;
            break;
          default:
            sdfCode += `  if (current < result) { result = current; materialIndex = ${matIndex}; primitiveIndex = ${index}; }\n`;
        }
      }
    });

    sdfCode += `  return vec3(result, float(materialIndex), float(primitiveIndex));\n}`;
    return { sdfFunction: sdfCode, primitiveData, materialIds };
  }, [expandedPrimitives, maxDistance, materialIndexMap]);

  const fragmentShader = useMemo(() => `
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
    
    // Triplanar texture mapping
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

    ${generateSceneSDF.sdfFunction}

    // Raymarching - returns (distance, materialIndex, primitiveIndex)
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

    // Calculate normal
    vec3 calcNormal(vec3 p) {
      const float eps = 0.001;
      return normalize(vec3(
        sceneSDF(p + vec3(eps, 0, 0)).x - sceneSDF(p - vec3(eps, 0, 0)).x,
        sceneSDF(p + vec3(0, eps, 0)).x - sceneSDF(p - vec3(0, eps, 0)).x,
        sceneSDF(p + vec3(0, 0, eps)).x - sceneSDF(p - vec3(0, 0, eps)).x
      ));
    }
    
    // Get coordinate target region blend factor for a primitive
    float getRegionBlendFactor(vec3 localPos, int primitiveIndex) {
      int offset = primitiveIndex * 3;
      if (offset >= 60) return 1.0;
      
      float hasTarget = uCoordinateTargets[offset];
      if (hasTarget < 0.5) return 1.0;
      
      int regionType = int(uCoordinateTargets[offset + 1]);
      float blendRadius = uCoordinateTargets[offset + 2];
      
      return classifyRegionSmooth(localPos, regionType, blendRadius);
    }
    
    // Get UV coordinates for a specific primitive
    vec2 getPrimitiveUV(vec3 p, int primitiveIndex) {
      ${expandedPrimitives.map((prim, idx) => `
      ${idx > 0 ? 'else ' : ''}if (primitiveIndex == ${idx}) {
        ${(() => {
          switch (prim.type) {
            case 'sphere':
              return `return uvSphere(p, ${prim.params[0]});`;
            case 'box':
              return `return uvBox(p, vec3(${prim.params.slice(0, 3).join(', ')}));`;
            case 'cylinder':
              return `return uvCylinder(p, ${prim.params[0]}, ${prim.params[1]});`;
            case 'torus':
              return `return uvTorus(p, vec2(${prim.params[0]}, ${prim.params[1]}));`;
            case 'pyramid':
              return `return uvPyramid(p, ${prim.params[0]});`;
            case 'cone':
              return `return uvCone(p, ${prim.params[2]});`;
            case 'octahedron':
              return `return uvOctahedron(p, ${prim.params[0]});`;
            case 'hexprism':
              return `return uvHexPrism(p, vec2(${prim.params[0]}, ${prim.params[1]}));`;
            case 'capsule':
              return `return uvCapsule(p, vec3(${prim.position.join(', ')}), vec3(${prim.params.slice(0, 3).join(', ')}), ${prim.params[3]});`;
            case 'triPrism':
              return `return uvTriPrism(p, vec2(${prim.params[0]}, ${prim.params[1]}));`;
            case 'ellipsoid':
              return `return uvEllipsoid(p, vec3(${prim.params.slice(0, 3).join(', ')}));`;
            case 'roundedBox':
              return `return uvRoundedBox(p, vec3(${prim.params.slice(0, 3).join(', ')}), ${prim.params[3]});`;
            case 'cappedCylinder':
              return `return uvCappedCylinder(p, ${prim.params[0]}, ${prim.params[1]});`;
            case 'plane':
              return `return uvPlane(p, vec3(${prim.params.slice(0, 3).join(', ')}));`;
            case 'roundCone':
              return `return uvRoundCone(p, ${prim.params[0]}, ${prim.params[1]}, ${prim.params[2]});`;
            case 'mengerSponge':
              return `return uvMengerSponge(p, ${prim.params[0]});`;
            case 'gyroid':
              return `return uvGyroid(p, ${prim.params[0]});`;
            case 'superellipsoid':
              return `return uvSuperellipsoid(p, vec3(${prim.params[0]}, ${prim.params[1]}, ${prim.params[2]}));`;
            case 'torusKnot':
              return `return uvTorusKnot(p, ${prim.params[0]}, ${prim.params[1]}, ${prim.params[2]});`;
            case 'porbital':
              return `return uvPOrbital(p, ${prim.params[0]});`;
            case 'dorbital':
              return `return uvDOrbital(p, ${prim.params[0]});`;
            default:
              return `return vec2(0.0);`;
          }
        })()}
      }`).join('')}
      return vec2(0.0);
    }

    // PBR lighting with material properties, R3F lights, and per-primitive texture support
    vec3 lighting(vec3 p, vec3 n, vec3 rd, Material mat, int primitiveIndex) {
      vec3 viewDir = -rd;

      vec3 baseColor = mat.baseColor;
      float roughness = mat.roughness;
      float metallic = mat.metallic;
      float ao = 1.0;
      vec3 emissive = mat.emissiveColor * mat.emission;
      
      // Get texture flags for this primitive
      int flags = int(uPrimitiveTextureFlags[primitiveIndex]);
      bool hasTextures = flags > 0;
      
      if (hasTextures) {
        // Get UV coordinates for this primitive
        vec2 uv = getPrimitiveUV(p, primitiveIndex);
        
        // Apply tiling and offset
        int tilingOffset = primitiveIndex * 2;
        int offsetOffset = primitiveIndex * 2;
        vec2 tiling = vec2(uTextureTiling[tilingOffset], uTextureTiling[tilingOffset + 1]);
        vec2 offset = vec2(uTextureOffset[offsetOffset], uTextureOffset[offsetOffset + 1]);
        uv = applyUVTransform(uv, tiling, offset);
        
        // Sample textures based on flags
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
      
      // Calculate ambient occlusion if enabled
      if (uEnableAO > 0.5) {
        ao *= ambientOcclusionFast(p, n);
      }
      
      // Create PBR material struct
      PBRMaterial pbrMat = PBRMaterial(baseColor, roughness, metallic, emissive);
      
      // Accumulate lighting from all lights
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
        
        // Ambient light (type 3)
        if (lightType > 2.5 && lightType < 3.5) {
          ambientLight += lightColor * lightIntensity;
        }
        // Directional light (type 0)
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
        // Point light (type 1)
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
        // Spot light (type 2) - treated like point light for now
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
      
      // Add ambient light
      vec3 ambient = ambientLight * baseColor * ao;
      
      // Combine all lighting
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
  `, [generateSceneSDF, maxSteps, precision, maxDistance]);

  const vertexShader = `
    varying vec2 vUv;
    varying vec3 vWorldPosition;
    
    void main() {
      vUv = uv;
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }
  `;

  return (
    <mesh>
      <planeGeometry args={[4, 4]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}