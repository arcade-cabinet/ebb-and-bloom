import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { SDFRenderer } from '../../engine/rendering/sdf/renderer/SDFRenderer';
import { SDFPrimitive } from '../../engine/rendering/sdf/types';
import { useMemo } from 'react';
import { useControls, folder } from 'leva';

function LightingScene() {
  const { 
    enableShadows, 
    shadowSoftness, 
    enableAO,
    dirEnabled,
    dirIntensity,
    dirColor,
    pointEnabled,
    pointIntensity,
    pointColor,
    pointX,
    pointY,
    pointZ,
    ambientEnabled,
    ambientIntensity,
    ambientColor
  } = useControls({
    'Rendering': folder({
      enableShadows: { value: true, label: 'Shadows' },
      shadowSoftness: { value: 16.0, min: 1, max: 64, step: 1, label: 'Shadow Softness' },
      enableAO: { value: true, label: 'Ambient Occlusion' }
    }),
    'Material': folder({
      materialRoughness: { value: 0.3, min: 0, max: 1, step: 0.01, label: 'Roughness' },
      materialMetallic: { value: 0.0, min: 0, max: 1, step: 0.01, label: 'Metallic' },
      materialEmission: { value: 0.0, min: 0, max: 2, step: 0.01, label: 'Emission' }
    }),
    'Directional Light': folder({
      dirEnabled: { value: true, label: 'Enabled' },
      dirIntensity: { value: 1.0, min: 0, max: 3, step: 0.1, label: 'Intensity' },
      dirColor: { value: '#ffffff', label: 'Color' }
    }),
    'Point Light': folder({
      pointEnabled: { value: true, label: 'Enabled' },
      pointIntensity: { value: 2.0, min: 0, max: 5, step: 0.1, label: 'Intensity' },
      pointColor: { value: '#4488ff', label: 'Color' },
      pointX: { value: 2, min: -5, max: 5, step: 0.1, label: 'Position X' },
      pointY: { value: 2, min: -5, max: 5, step: 0.1, label: 'Position Y' },
      pointZ: { value: 2, min: -5, max: 5, step: 0.1, label: 'Position Z' }
    }),
    'Ambient Light': folder({
      ambientEnabled: { value: true, label: 'Enabled' },
      ambientIntensity: { value: 0.2, min: 0, max: 1, step: 0.01, label: 'Intensity' },
      ambientColor: { value: '#ffffff', label: 'Color' }
    })
  });

  const primitives: SDFPrimitive[] = useMemo(() => {
    const prims: SDFPrimitive[] = [];
    
    prims.push({
      type: 'sphere',
      position: [-2, 0, 0],
      params: [0.8],
      materialId: 'metal',
      operation: 'union'
    });
    
    prims.push({
      type: 'box',
      position: [0, 0, 0],
      params: [0.7, 0.7, 0.7],
      materialId: 'plastic',
      operation: 'union'
    });
    
    prims.push({
      type: 'torus',
      position: [2, 0, 0],
      params: [0.6, 0.2],
      materialId: 'glass',
      operation: 'union'
    });
    
    prims.push({
      type: 'plane',
      position: [0, -1.5, 0],
      params: [0, 1, 0, 0],
      materialId: 'ground',
      operation: 'union'
    });
    
    return prims;
  }, []);

  return (
    <>
      {dirEnabled && (
        <directionalLight
          position={[5, 5, -5]}
          intensity={dirIntensity}
          color={dirColor}
        />
      )}
      
      {pointEnabled && (
        <pointLight
          position={[pointX, pointY, pointZ]}
          intensity={pointIntensity}
          color={pointColor}
        />
      )}
      
      {ambientEnabled && (
        <ambientLight
          intensity={ambientIntensity}
          color={ambientColor}
        />
      )}
      
      <mesh>
        <planeGeometry args={[1000, 1000]} />
        <meshBasicMaterial color="#000000" />
        <SDFRenderer
          primitives={primitives}
          enableShadows={enableShadows}
          shadowSoftness={shadowSoftness}
          enableAO={enableAO}
        />
      </mesh>
    </>
  );
}

export function LightingDemo() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 2, 8]} fov={50} />
        <OrbitControls />
        <LightingScene />
      </Canvas>
    </div>
  );
}

export default LightingDemo;
