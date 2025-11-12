import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { materialRegistry } from '../sdf/MaterialRegistry';

export interface InstanceData {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number] | number;
  materialId: string;
}

export interface InstancedRendererProps {
  instances: InstanceData[];
  geometry?: 'sphere' | 'box' | 'cylinder';
  geometryArgs?: number[];
  castShadow?: boolean;
  receiveShadow?: boolean;
}

export function InstancedRenderer({
  instances,
  geometry = 'sphere',
  geometryArgs = [0.1, 8, 6],
  castShadow = true,
  receiveShadow = false
}: InstancedRendererProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const tempMatrix = useMemo(() => new THREE.Matrix4(), []);
  const tempColor = useMemo(() => new THREE.Color(), []);
  const tempQuaternion = useMemo(() => new THREE.Quaternion(), []);
  const tempPosition = useMemo(() => new THREE.Vector3(), []);
  const tempScale = useMemo(() => new THREE.Vector3(), []);

  const geometryComponent = useMemo(() => {
    switch (geometry) {
      case 'box':
        return <boxGeometry args={geometryArgs as [number, number, number]} />;
      case 'cylinder':
        return <cylinderGeometry args={geometryArgs as [number, number, number]} />;
      case 'sphere':
      default:
        return <sphereGeometry args={geometryArgs as [number, number, number]} />;
    }
  }, [geometry, geometryArgs]);

  useEffect(() => {
    if (!meshRef.current) return;

    for (let i = 0; i < instances.length; i++) {
      const instance = instances[i];
      
      tempPosition.set(instance.position[0], instance.position[1], instance.position[2]);
      
      if (instance.rotation) {
        tempQuaternion.setFromEuler(
          new THREE.Euler(instance.rotation[0], instance.rotation[1], instance.rotation[2])
        );
      } else {
        tempQuaternion.identity();
      }
      
      if (instance.scale) {
        if (typeof instance.scale === 'number') {
          tempScale.set(instance.scale, instance.scale, instance.scale);
        } else {
          tempScale.set(instance.scale[0], instance.scale[1], instance.scale[2]);
        }
      } else {
        tempScale.set(1, 1, 1);
      }
      
      tempMatrix.compose(tempPosition, tempQuaternion, tempScale);
      meshRef.current.setMatrixAt(i, tempMatrix);
      
      const mat = materialRegistry.get(instance.materialId);
      if (mat) {
        tempColor.setRGB(mat.baseColor[0], mat.baseColor[1], mat.baseColor[2]);
      } else {
        tempColor.setHex(0x888888);
      }
      meshRef.current.setColorAt(i, tempColor);
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  }, [instances, tempMatrix, tempColor, tempQuaternion, tempPosition, tempScale]);

  useFrame(() => {
    if (!meshRef.current) return;
    
    for (let i = 0; i < instances.length; i++) {
      const instance = instances[i];
      
      tempPosition.set(instance.position[0], instance.position[1], instance.position[2]);
      
      if (instance.rotation) {
        tempQuaternion.setFromEuler(
          new THREE.Euler(instance.rotation[0], instance.rotation[1], instance.rotation[2])
        );
      } else {
        tempQuaternion.identity();
      }
      
      if (instance.scale) {
        if (typeof instance.scale === 'number') {
          tempScale.set(instance.scale, instance.scale, instance.scale);
        } else {
          tempScale.set(instance.scale[0], instance.scale[1], instance.scale[2]);
        }
      } else {
        tempScale.set(1, 1, 1);
      }
      
      tempMatrix.compose(tempPosition, tempQuaternion, tempScale);
      meshRef.current.setMatrixAt(i, tempMatrix);
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, instances.length]}
      castShadow={castShadow}
      receiveShadow={receiveShadow}
    >
      {geometryComponent}
      <meshStandardMaterial vertexColors />
    </instancedMesh>
  );
}
