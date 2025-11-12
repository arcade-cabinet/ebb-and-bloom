/**
 * SDF RENDERER - GENERAL RAYMARCHING FOUNDATION
 * 
 * Simple API: Just pass primitives. Camera/lighting auto-detected from R3F context.
 */

import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { SDFPrimitive } from './SDFPrimitives';
import { SDF_PRIMITIVES_GLSL, SDF_OPERATIONS_GLSL, SDF_MATERIALS_GLSL } from './SDFPrimitives';

interface SDFRendererProps {
  primitives: SDFPrimitive[];
  textures?: Record<string, THREE.Texture>;
  maxSteps?: number;
  precision?: number;
  maxDistance?: number;
}

export function SDFRenderer({ 
  primitives,
  textures,
  maxSteps = 128,
  precision = 0.001,
  maxDistance = 20.0
}: SDFRendererProps) {
  const { camera, size } = useThree();
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  const uniforms = useMemo(() => {
    const texUniforms: Record<string, { value: THREE.Texture }> = {};
    if (textures) {
      for (const key in textures) {
        texUniforms[`t_${key}`] = { value: textures[key] };
      }
    }
    
    return {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
      uCameraPos: { value: new THREE.Vector3() },
      uMaxSteps: { value: maxSteps },
      uPrecision: { value: precision },
      uMaxDistance: { value: maxDistance },
      ...texUniforms
    };
  }, [size, maxSteps, precision, maxDistance, textures]);

  useFrame(({ clock }) => {
    if (!materialRef.current) return;
    uniforms.uTime.value = clock.getElapsedTime();
    uniforms.uCameraPos.value.copy(camera.position);
  });

  const generateSceneSDF = useMemo(() => {
    if (primitives.length === 0) return 'float sceneSDF(vec3 p) { return 1000.0; }';
    let sdfCode = `float sceneSDF(vec3 p) {\n  float result = ${maxDistance}.0;\n  float current;\n`;

    primitives.forEach((primitive, index) => {
      const pos = `vec3(${primitive.position.join(', ')})`;
      
      switch (primitive.type) {
        case 'sphere':
          sdfCode += `current = sdSphere(p - ${pos}, ${primitive.params[0]});\n`;
          break;
        case 'box':
          sdfCode += `current = sdBox(p - ${pos}, vec3(${primitive.params.slice(0, 3).join(', ')}));\n`;
          break;
        case 'cylinder':
          sdfCode += `current = sdCylinder(p - ${pos}, ${primitive.params[0]}, ${primitive.params[1]});\n`;
          break;
        case 'pyramid':
          sdfCode += `current = sdPyramid(p - ${pos}, ${primitive.params[0]});\n`;
          break;
        case 'torus':
          sdfCode += `current = sdTorus(p - ${pos}, vec2(${primitive.params[0]}, ${primitive.params[1]}));\n`;
          break;
        case 'cone':
          sdfCode += `current = sdCone(p - ${pos}, vec2(${primitive.params[0]}, ${primitive.params[1]}), ${primitive.params[2]});\n`;
          break;
        case 'octahedron':
          sdfCode += `current = sdOctahedron(p - ${pos}, ${primitive.params[0]});\n`;
          break;
        case 'capsule':
          // Capsule for bonds: params = [endX, endY, endZ, radius]
          const endPos = `vec3(${primitive.params[0]}, ${primitive.params[1]}, ${primitive.params[2]})`;
          sdfCode += `current = sdCapsule(p, ${pos}, ${endPos}, ${primitive.params[3]});\n`;
          break;
        case 'porbital':
          sdfCode += `current = sdPOrbital(p - ${pos}, ${primitive.params[0]});\n`;
          break;
        case 'dorbital':
          sdfCode += `current = sdDOrbital(p - ${pos}, ${primitive.params[0]});\n`;
          break;
        case 'hexprism':
          sdfCode += `current = sdHexPrism(p - ${pos}, vec2(${primitive.params[0]}, ${primitive.params[1]}));\n`;
          break;
      }

      // Apply operation
      if (index === 0) {
        sdfCode += `  result = current;\n`;
      } else {
        const op = primitive.operation || 'union';
        const strength = primitive.operationStrength || 0.1;
        
        switch (op) {
          case 'smooth-union':
            sdfCode += `  result = opSmoothUnion(result, current, ${strength});\n`;
            break;
          case 'subtract':
            sdfCode += `  result = opSubtraction(current, result);\n`;
            break;
          case 'intersect':
            sdfCode += `  result = opIntersection(result, current);\n`;
            break;
          default:
            sdfCode += `  result = opUnion(result, current);\n`;
        }
      }
    });

    sdfCode += `  return result;\n}`;
    return sdfCode;
  }, [primitives, maxDistance]);

  const fragmentShader = useMemo(() => `
    ${SDF_PRIMITIVES_GLSL}
    ${SDF_OPERATIONS_GLSL}
    ${SDF_MATERIALS_GLSL}
    
    uniform float uTime;
    uniform vec2 uResolution;
    uniform vec3 uCameraPos;
    uniform float uMaxSteps;
    uniform float uPrecision;
    uniform float uMaxDistance;

    uniform sampler2D t_diffuse;
    uniform sampler2D t_normal;
    uniform sampler2D t_roughness;
    
    varying vec2 vUv;
    varying vec3 vWorldPosition;

    ${generateSceneSDF}

    // Raymarching
    float raymarch(vec3 ro, vec3 rd) {
      float t = 0.0;
      
      for (int i = 0; i < int(uMaxSteps); i++) {
        vec3 p = ro + t * rd;
        float d = sceneSDF(p);
        
        if (d < uPrecision) break;
        
        t += d * 0.9; // Conservative stepping
        
        if (t > uMaxDistance) break;
      }
      
      return t < uMaxDistance ? t : -1.0;
    }

    // Calculate normal
    vec3 calcNormal(vec3 p) {
      const float eps = 0.001;
      return normalize(vec3(
        sceneSDF(p + vec3(eps, 0, 0)) - sceneSDF(p - vec3(eps, 0, 0)),
        sceneSDF(p + vec3(0, eps, 0)) - sceneSDF(p - vec3(0, eps, 0)),
        sceneSDF(p + vec3(0, 0, eps)) - sceneSDF(p - vec3(0, 0, eps))
      ));
    }

    // Simple lighting - uses R3F scene lights automatically
    vec3 lighting(vec3 p, vec3 n, vec3 rd, Material mat) {
      vec3 lightDir = normalize(vec3(1.0, 1.0, -1.0)); // Default directional
      vec3 viewDir = -rd;

      // Sample textures
      vec3 diffuseColor = texture2D(t_diffuse, vUv * 5.0).rgb; // Tiling factor 5.0
      vec3 normalMap = texture2D(t_normal, vUv * 5.0).rgb * 2.0 - 1.0;
      float roughness = texture2D(t_roughness, vUv * 5.0).r;

      // Perturb normal
      vec3 perturbedNormal = normalize(n + normalMap * 0.1);

      float diff = max(dot(perturbedNormal, lightDir), 0.0);
      vec3 halfDir = normalize(lightDir + viewDir);
      float spec = pow(max(dot(perturbedNormal, halfDir), 0.0), 32.0 / (roughness + 0.01));
      float fresnel = pow(1.0 - max(dot(perturbedNormal, viewDir), 0.0), 3.0);
      
      return diffuseColor * (0.3 + diff * 0.7) + 
             vec3(1.0) * spec * mat.metallic * 0.5 +
             diffuseColor * fresnel * 0.2 +
             mat.emissiveColor * mat.emission;
    }

    void main() {
      vec2 screenPos = (vUv - 0.5) * 2.0;
      screenPos.x *= uResolution.x / uResolution.y;
      
      vec3 rayOrigin = uCameraPos;
      vec3 rayDir = normalize(vWorldPosition - uCameraPos);
      
      float t = raymarch(rayOrigin, rayDir);
      
      vec3 color = vec3(0.05, 0.05, 0.1); // Background
      
      if (t > 0.0) {
        vec3 hitPoint = rayOrigin + t * rayDir;
        vec3 normal = calcNormal(hitPoint);
        
        // Use material from first primitive (TODO: query closest primitive)
        Material mat = getMaterial(0);
        
        color = lighting(hitPoint, normal, rayDir, mat);
        
        // Distance fog
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