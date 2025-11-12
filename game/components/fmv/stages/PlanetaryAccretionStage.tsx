import { useRef, useEffect, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Vector3 as YukaVector3 } from 'yuka';
import { SDFRenderer } from '../../../../engine/rendering/sdf/renderer/SDFRenderer';
import { SDFPrimitive } from '../../../../engine/rendering/sdf/types';
import { materialRegistry } from '../../../../engine/rendering/sdf/MaterialRegistry';
import { useGameState } from '../../../state/GameState';
import { createDebrisField, ParticleVehicle, applyGravityForce, applySeparationForce, SpatialGrid, updateSpatialGrid } from '../utils/createParticleSwarm';
import { CosmicAudioSonification } from '../../../../engine/audio/cosmic/CosmicAudioSonification';
import { CosmicHapticFeedback } from '../../../../engine/haptics/CosmicHapticFeedback';

interface PlanetaryAccretionStageProps {
  onComplete?: () => void;
  duration?: number;
  audioSystem?: CosmicAudioSonification;
  hapticSystem?: CosmicHapticFeedback;
}

export function PlanetaryAccretionStage({ 
  onComplete, 
  duration = 12000, 
  audioSystem, 
  hapticSystem 
}: PlanetaryAccretionStageProps) {
  const vehiclesRef = useRef<ParticleVehicle[]>([]);
  const startTimeRef = useRef<number>(0);
  const centerRef = useRef(new YukaVector3(0, 0, 0));
  const formedLayersRef = useRef<Set<string>>(new Set());
  const spatialGridRef = useRef(new SpatialGrid(1.5));
  const gridUpdateCounterRef = useRef(0);
  
  const instancedRef = useRef<THREE.InstancedMesh>(null);
  const tempMatrix = useMemo(() => new THREE.Matrix4(), []);
  const tempColor = useMemo(() => new THREE.Color(), []);
  
  const [planetLayers, setPlanetLayers] = useState<SDFPrimitive[]>([]);
  const layerRadiiRef = useRef<Map<string, number>>(new Map());

  const getScopedRNG = useGameState((state) => state.getScopedRNG);
  const getPlanetRadius = useGameState((state) => state.getPlanetRadius);

  const planetRadius = useMemo(() => getPlanetRadius() / 6371000, [getPlanetRadius]);

  const vehicles = useMemo(() => {
    const rng = getScopedRNG('fmv-accretion');
    
    const coreRadius = planetRadius * 0.3;
    const mantleRadius = planetRadius * 0.7;
    const crustRadius = planetRadius * 0.95;
    const oceanRadius = planetRadius * 1.0;
    const atmosphereRadius = planetRadius * 1.1;

    return createDebrisField(
      [
        { type: 'core', element: 'Fe', count: 60, radius: coreRadius },
        { type: 'mantle', element: 'Mg', count: 70, radius: mantleRadius },
        { type: 'crust', element: 'Si', count: 60, radius: crustRadius },
        { type: 'ocean', element: 'H2O', count: 35, radius: oceanRadius },
        { type: 'atmosphere', element: 'N2', count: 25, radius: atmosphereRadius },
      ],
      8,
      1.5,
      0.3,
      rng
    );
  }, [getScopedRNG, planetRadius]);

  useEffect(() => {
    vehiclesRef.current = vehicles;
    startTimeRef.current = Date.now();
    
    layerRadiiRef.current.clear();
    layerRadiiRef.current.set('core', planetRadius * 0.3);
    layerRadiiRef.current.set('mantle', planetRadius * 0.7);
    layerRadiiRef.current.set('crust', planetRadius * 0.95);
    layerRadiiRef.current.set('ocean', planetRadius * 1.0);
    layerRadiiRef.current.set('atmosphere', planetRadius * 1.1);
    
    updateSpatialGrid(spatialGridRef.current, vehiclesRef.current);
  }, [vehicles, planetRadius]);

  useFrame((_, delta) => {
    const elapsed = Date.now() - startTimeRef.current;
    const progress = Math.min(elapsed / duration, 1);

    const gravityStrength = 0.2 + progress * 0.8;

    gridUpdateCounterRef.current++;
    const shouldUpdateGrid = gridUpdateCounterRef.current % 4 === 0;
    
    if (shouldUpdateGrid) {
      updateSpatialGrid(spatialGridRef.current, vehiclesRef.current);
    }

    const materialMap = {
      Fe: 'element-fe',
      Mg: 'element-mg',
      Si: 'element-si',
      H2O: 'element-h',
      N2: 'element-n',
    };

    for (let i = 0; i < vehiclesRef.current.length; i++) {
      const vehicle = vehiclesRef.current[i];
      
      if (!vehicle.locked) {
        const dampingFactor = 0.98;
        vehicle.velocity.multiplyScalar(dampingFactor);
        
        applyGravityForce(vehicle, centerRef.current, gravityStrength);
        
        const nearby = spatialGridRef.current.getNearby(vehicle, 0.6);
        applySeparationForce(vehicle, nearby, 0.3, 0.05);
        
        vehicle.update(delta);

        const distanceToCenter = vehicle.position.length();
        if (distanceToCenter <= vehicle.targetRadius && !vehicle.locked) {
          vehicle.locked = true;
          vehicle.velocity.set(0, 0, 0);
          
          const normalizedPos = new YukaVector3().copy(vehicle.position).normalize();
          normalizedPos.multiplyScalar(vehicle.targetRadius);
          vehicle.position.copy(normalizedPos);

          if (vehicle.layerType && !formedLayersRef.current.has(vehicle.layerType)) {
            formedLayersRef.current.add(vehicle.layerType);
            
            const layerRadius = layerRadiiRef.current.get(vehicle.layerType);
            const materialId = materialMap[vehicle.elementType as keyof typeof materialMap] || 'default';
            
            if (layerRadius !== undefined) {
              setPlanetLayers(prev => [...prev, {
                type: 'sphere',
                position: [0, 0, 0],
                params: [layerRadius],
                materialId,
              }]);
            }
            
            if (audioSystem) {
              audioSystem.playSoundForStage('planetary-accretion', progress);
            }
            if (hapticSystem) {
              hapticSystem.playHapticForStage('planetary-accretion', progress);
            }
          }
        }
      }
    }

    if (instancedRef.current) {
      for (let i = 0; i < vehiclesRef.current.length; i++) {
        const vehicle = vehiclesRef.current[i];
        
        if (vehicle.locked) {
          tempMatrix.makeScale(0.001, 0.001, 0.001);
        } else {
          tempMatrix.identity();
          tempMatrix.setPosition(vehicle.position.x, vehicle.position.y, vehicle.position.z);
        }
        instancedRef.current.setMatrixAt(i, tempMatrix);
        
        const materialId = materialMap[vehicle.elementType as keyof typeof materialMap] || 'default';
        const mat = materialRegistry.get(materialId);
        if (mat) {
          tempColor.setRGB(mat.baseColor[0], mat.baseColor[1], mat.baseColor[2]);
        } else {
          tempColor.setRGB(0.5, 0.5, 0.5);
        }
        instancedRef.current.setColorAt(i, tempColor);
      }
      
      instancedRef.current.instanceMatrix.needsUpdate = true;
      if (instancedRef.current.instanceColor) {
        instancedRef.current.instanceColor.needsUpdate = true;
      }
    }

    if (progress >= 1 && onComplete) {
      onComplete();
    }
  });

  return (
    <group>
      <instancedMesh ref={instancedRef} args={[undefined, undefined, 250]}>
        <sphereGeometry args={[0.03, 8, 6]} />
        <meshStandardMaterial vertexColors />
      </instancedMesh>
      
      <SDFRenderer
        primitives={planetLayers}
        maxSteps={128}
        precision={0.001}
        enableShadows={true}
      />
    </group>
  );
}
