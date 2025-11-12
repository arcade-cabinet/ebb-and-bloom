import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { SDFPrimitive } from '../types';
import { HostPrimitive } from '../ForeignBodySystem';
import { expandHostPrimitives } from './integration/hosts';
import { extractLightUniforms } from './integration/lights';
import { createMaterialUniforms } from './uniforms/materials';
import { createPrimitiveUniforms } from './uniforms/primitives';
import { createTextureUniforms, addProvidedTextures } from './uniforms/textures';
import { createDefaultTexture } from './textures/loader';
import { generateSceneSDF } from './shaders/fragment';
import { composeFragmentShader } from './shaders/composer';
import { vertexShader } from './shaders/vertex';

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

  const expandedPrimitives = useMemo(
    () => expandHostPrimitives(primitives, hostPrimitives),
    [primitives, hostPrimitives]
  );

  const defaultTexture = useMemo(() => createDefaultTexture(), []);

  const { materialUniforms, materialIndexMap } = useMemo(
    () => {
      const result = createMaterialUniforms(expandedPrimitives);
      const textureUniforms = createTextureUniforms(defaultTexture);
      return {
        materialUniforms: { ...result, ...textureUniforms },
        materialIndexMap: result.indexMap
      };
    },
    [expandedPrimitives, defaultTexture]
  );

  const primitiveUniforms = useMemo(
    () => createPrimitiveUniforms(expandedPrimitives),
    [expandedPrimitives]
  );

  const lightUniforms = useMemo(
    () => extractLightUniforms(scene, enableShadows, shadowSoftness, enableAO),
    [scene, enableShadows, shadowSoftness, enableAO]
  );

  const sceneSDF = useMemo(
    () => generateSceneSDF(expandedPrimitives, materialIndexMap, maxDistance),
    [expandedPrimitives, materialIndexMap, maxDistance]
  );

  const fragmentShader = useMemo(
    () => composeFragmentShader(sceneSDF, expandedPrimitives, maxSteps, precision, maxDistance),
    [sceneSDF, expandedPrimitives, maxSteps, precision, maxDistance]
  );

  const uniforms = useMemo(() => {
    const texUniformsFromProps = addProvidedTextures({}, textures);

    return {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
      uCameraPos: { value: new THREE.Vector3() },
      uMaxSteps: { value: maxSteps },
      uPrecision: { value: precision },
      uMaxDistance: { value: maxDistance },
      ...materialUniforms,
      ...primitiveUniforms,
      ...lightUniforms,
      ...texUniformsFromProps
    };
  }, [size, maxSteps, precision, maxDistance, textures, materialUniforms, primitiveUniforms, lightUniforms]);

  useFrame(({ clock }) => {
    if (!materialRef.current) return;
    uniforms.uTime.value = clock.getElapsedTime();
    uniforms.uCameraPos.value.copy(camera.position);
  });

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
