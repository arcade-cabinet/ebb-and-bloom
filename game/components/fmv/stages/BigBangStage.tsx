import { useRef, useEffect, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Vector3 as YukaVector3 } from 'yuka';
import { SDFRenderer } from '../../../../engine/rendering/sdf/renderer/SDFRenderer';
import { SDFPrimitive } from '../../../../engine/rendering/sdf/types';
import { materialRegistry } from '../../../../engine/rendering/sdf/MaterialRegistry';
import { useGameState } from '../../../state/GameState';
import { createParticleSwarm, ParticleVehicle, applyGravityForce, applySeparationForce, applyCohesionForce, SpatialGrid, updateSpatialGrid } from '../utils/createParticleSwarm';
import { CosmicAudioSonification } from '../../../../engine/audio/cosmic/CosmicAudioSonification';
import { CosmicHapticFeedback } from '../../../../engine/haptics/CosmicHapticFeedback';

interface BigBangStageProps {
  onComplete?: () => void;
  duration?: number;
  audioSystem?: CosmicAudioSonification;
  hapticSystem?: CosmicHapticFeedback;
}

export function BigBangStage({ onComplete, duration = 8000, audioSystem, hapticSystem }: BigBangStageProps) {
  const vehiclesRef = useRef<ParticleVehicle[]>([]);
  const startTimeRef = useRef<number>(0);
  const centerRef = useRef(new YukaVector3(0, 0, 0));
  const progressRef = useRef(0);
  const audioTimerRef = useRef(0);
  const hapticTimerRef = useRef(0);
  const spatialGridRef = useRef(new SpatialGrid(2.0));
  const gridUpdateCounterRef = useRef(0);
  
  const instancedRef = useRef<THREE.InstancedMesh>(null);
  const tempMatrix = useMemo(() => new THREE.Matrix4(), []);
  const tempColor = useMemo(() => new THREE.Color(), []);
  
  const [heroPrimitives, setHeroPrimitives] = useState<SDFPrimitive[]>([]);

  const getScopedRNG = useGameState((state) => state.getScopedRNG);

  const vehicles = useMemo(() => {
    const rng = getScopedRNG('fmv-bigbang');
    
    const hydrogenFraction = 0.75;
    const heliumFraction = 0.25;

    return createParticleSwarm(
      {
        count: 300,
        spawnRadius: 15,
        maxSpeed: 2.0,
        maxForce: 0.5,
        elementDistribution: {
          H: hydrogenFraction,
          He: heliumFraction,
        },
      },
      rng
    );
  }, [getScopedRNG]);

  useEffect(() => {
    vehiclesRef.current = vehicles;
    startTimeRef.current = Date.now();
    
    updateSpatialGrid(spatialGridRef.current, vehiclesRef.current);
    
    setHeroPrimitives([{
      type: 'sphere',
      position: [0, 0, 0],
      params: [0.5],
      materialId: 'element-h',
    }]);
  }, [vehicles]);

  useFrame((_, delta) => {
    const elapsed = Date.now() - startTimeRef.current;
    const progress = Math.min(elapsed / duration, 1);
    progressRef.current = progress;

    const gravityStrength = 0.1 + progress * 0.4;
    const cohesionStrength = 0.05 + progress * 0.15;
    const separationStrength = 0.1 - progress * 0.05;

    gridUpdateCounterRef.current++;
    const shouldUpdateGrid = gridUpdateCounterRef.current % 3 === 0;
    
    if (shouldUpdateGrid) {
      updateSpatialGrid(spatialGridRef.current, vehiclesRef.current);
    }

    for (let i = 0; i < vehiclesRef.current.length; i++) {
      const vehicle = vehiclesRef.current[i];
      
      const dampingFactor = 0.95;
      vehicle.velocity.multiplyScalar(dampingFactor);
      
      applyGravityForce(vehicle, centerRef.current, gravityStrength);
      
      const nearby = spatialGridRef.current.getNearby(vehicle, 3.0);
      applySeparationForce(vehicle, nearby, 0.5, separationStrength);
      applyCohesionForce(vehicle, nearby, 3.0, cohesionStrength);
      
      vehicle.update(delta);
    }

    if (instancedRef.current) {
      for (let i = 0; i < vehiclesRef.current.length; i++) {
        const vehicle = vehiclesRef.current[i];
        
        tempMatrix.setPosition(vehicle.position.x, vehicle.position.y, vehicle.position.z);
        instancedRef.current.setMatrixAt(i, tempMatrix);
        
        const mat = materialRegistry.get(vehicle.elementType === 'H' ? 'element-h' : 'element-he');
        if (mat) {
          tempColor.setRGB(mat.baseColor[0], mat.baseColor[1], mat.baseColor[2]);
        } else {
          tempColor.setHex(vehicle.elementType === 'H' ? 0xffffff : 0xffdd00);
        }
        instancedRef.current.setColorAt(i, tempColor);
      }
      
      instancedRef.current.instanceMatrix.needsUpdate = true;
      if (instancedRef.current.instanceColor) {
        instancedRef.current.instanceColor.needsUpdate = true;
      }
    }

    const convergenceStrength = progress;
    setHeroPrimitives([{
      type: 'sphere',
      position: [0, 0, 0],
      params: [0.5 + convergenceStrength * 0.5],
      materialId: 'element-h',
    }]);

    audioTimerRef.current += delta;
    if (audioSystem && audioTimerRef.current >= 0.1) {
      audioTimerRef.current = 0;
      audioSystem.playSoundForStage('nucleosynthesis', progress);
    }

    hapticTimerRef.current += delta;
    if (hapticSystem && hapticTimerRef.current >= 0.2) {
      hapticTimerRef.current = 0;
      hapticSystem.playHapticForStage('nucleosynthesis', progress);
    }

    if (progress >= 1 && onComplete) {
      onComplete();
    }
  });

  return (
    <group>
      <instancedMesh ref={instancedRef} args={[undefined, undefined, 300]}>
        <sphereGeometry args={[0.05, 8, 6]} />
        <meshStandardMaterial vertexColors />
      </instancedMesh>
      
      <SDFRenderer
        primitives={heroPrimitives}
        maxSteps={64}
        precision={0.01}
        enableShadows={false}
      />
      
      <mesh position={[0, 5, 0]}>
        <planeGeometry args={[10, 2]} />
        <meshBasicMaterial transparent opacity={0.8} color="#ffffff" />
      </mesh>
    </group>
  );
}
