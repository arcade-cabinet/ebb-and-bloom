import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SimplexNoise } from 'simplex-noise';
import { world } from '../App';

// Simple creature behavior states
type CreatureState = 'foraging' | 'alert' | 'fleeing' | 'resting' | 'exploring';

interface SimpleCreature {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  state: CreatureState;
  stateTimer: number;
  homePosition: THREE.Vector3;
  alertRadius: number;
  fleeDistance: number;
  type: 'squirrel' | 'rabbit' | 'bird';
}

const creatureNoise = new SimplexNoise();

// Simple, believable squirrel behavior
const updateSquirrelBehavior = (squirrel: SimpleCreature, playerPosition: THREE.Vector3, delta: number) => {
  const distToPlayer = squirrel.position.distanceTo(playerPosition);
  const distToHome = squirrel.position.distanceTo(squirrel.homePosition);
  
  squirrel.stateTimer -= delta;
  
  // React to player proximity
  if (distToPlayer < 3 && squirrel.state !== 'fleeing') {
    squirrel.state = 'alert';
    squirrel.stateTimer = 1.0; // Stay alert for 1 second
  } else if (distToPlayer < 1.5) {
    squirrel.state = 'fleeing';
    squirrel.stateTimer = 2.0; // Flee for 2 seconds
  }
  
  // State machine
  switch (squirrel.state) {
    case 'fleeing':
      // Run away from player
      const fleeDirection = squirrel.position.clone().sub(playerPosition).normalize();
      squirrel.velocity.copy(fleeDirection.multiplyScalar(15)); // Fast!
      if (squirrel.stateTimer <= 0) {
        squirrel.state = 'resting';
        squirrel.stateTimer = 3.0;
      }
      break;
      
    case 'alert':
      // Stop and look around
      squirrel.velocity.set(0, 0, 0);
      if (squirrel.stateTimer <= 0) {
        squirrel.state = distToPlayer < 5 ? 'foraging' : 'exploring';
        squirrel.stateTimer = 2.0 + Math.random() * 3.0;
      }
      break;
      
    case 'foraging':
      // Small circular movements around current spot
      const foragingNoise = creatureNoise.noise2D(
        squirrel.position.x * 0.1 + Date.now() * 0.001, 
        squirrel.position.z * 0.1
      );
      squirrel.velocity.set(
        Math.sin(foragingNoise * Math.PI * 2) * 5,
        0,
        Math.cos(foragingNoise * Math.PI * 2) * 5
      );
      if (squirrel.stateTimer <= 0) {
        squirrel.state = 'resting';
        squirrel.stateTimer = 2.0;
      }
      break;
      
    case 'resting':
      squirrel.velocity.set(0, 0, 0);
      if (squirrel.stateTimer <= 0) {
        squirrel.state = Math.random() < 0.5 ? 'foraging' : 'exploring';
        squirrel.stateTimer = 3.0 + Math.random() * 4.0;
      }
      break;
      
    case 'exploring':
      // Random walk towards interesting spots
      if (distToHome > 20) {
        // Head back home if too far
        const homeDirection = squirrel.homePosition.clone().sub(squirrel.position).normalize();
        squirrel.velocity.copy(homeDirection.multiplyScalar(8));
      } else {
        // Random exploration
        const exploreNoise = creatureNoise.noise2D(
          squirrel.position.x * 0.05 + Date.now() * 0.0005,
          squirrel.position.z * 0.05 + Date.now() * 0.0005
        );
        squirrel.velocity.set(
          Math.sin(exploreNoise * Math.PI * 4) * 10,
          0,
          Math.cos(exploreNoise * Math.PI * 4) * 10
        );
      }
      if (squirrel.stateTimer <= 0) {
        squirrel.state = 'foraging';
        squirrel.stateTimer = 4.0;
      }
      break;
  }
  
  // Apply movement with terrain snapping
  squirrel.position.add(squirrel.velocity.clone().multiplyScalar(delta));
  
  const getHeightAt = (window as any).getHeightAt;
  if (getHeightAt) {
    squirrel.position.y = getHeightAt(squirrel.position.x, squirrel.position.z) + 0.3; // Ground level
  }
};

// Individual Squirrel Component
const Squirrel: React.FC<{ creature: SimpleCreature }> = ({ creature }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const tailRef = useRef<THREE.Mesh>(null!);
  
  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    // Get player position for behavior
    const playerPos = state.camera.position;
    
    // Update creature behavior
    updateSquirrelBehavior(creature, playerPos, delta);
    
    // Sync mesh to creature position
    meshRef.current.position.copy(creature.position);
    
    // Face movement direction
    if (creature.velocity.length() > 0.1) {
      meshRef.current.lookAt(
        creature.position.x + creature.velocity.x,
        creature.position.y,
        creature.position.z + creature.velocity.z
      );
    }
    
    // Tail swish animation
    if (tailRef.current) {
      tailRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 8) * 0.3;
      tailRef.current.rotation.x = creature.state === 'alert' ? 0.5 : 0; // Raised when alert
    }
  });
  
  return (
    <group ref={meshRef}>
      {/* Body */}
      <mesh castShadow receiveShadow>
        <ellipsoidGeometry args={[0.3, 0.2, 0.5]} />
        <meshLambertMaterial color="#8B4513" />
      </mesh>
      
      {/* Head */}
      <mesh position={[0, 0.1, 0.4]} castShadow>
        <sphereGeometry args={[0.15]} />
        <meshLambertMaterial color="#8B4513" />
      </mesh>
      
      {/* Tail */}
      <mesh ref={tailRef} position={[0, 0.2, -0.4]} castShadow>
        <ellipsoidGeometry args={[0.1, 0.1, 0.6]} />
        <meshLambertMaterial color="#654321" />
      </mesh>
    </group>
  );
};

// Procedural Creature Spawner  
const WildlifeSystem: React.FC = () => {
  const creatures = useMemo(() => {
    const spawned: SimpleCreature[] = [];
    const getHeightAt = (window as any).getHeightAt;
    
    if (!getHeightAt) return spawned;
    
    // Spawn squirrels in patches (they like to be near each other)
    for (let i = 0; i < 20; i++) {
      const patchCenterX = (Math.random() - 0.5) * 600;
      const patchCenterZ = (Math.random() - 0.5) * 600;
      
      // 3-5 squirrels per patch
      const patchSize = 3 + Math.floor(Math.random() * 3);
      for (let j = 0; j < patchSize; j++) {
        const x = patchCenterX + (Math.random() - 0.5) * 30; // Small patch radius
        const z = patchCenterZ + (Math.random() - 0.5) * 30;
        const y = getHeightAt(x, z) + 0.3;
        
        spawned.push({
          position: new THREE.Vector3(x, y, z),
          velocity: new THREE.Vector3(),
          state: 'foraging',
          stateTimer: Math.random() * 2.0,
          homePosition: new THREE.Vector3(x, y, z),
          alertRadius: 3,
          fleeDistance: 1.5,
          type: 'squirrel'
        });
      }
    }
    
    return spawned;
  }, []);
  
  return (
    <>
      {creatures.map((creature, index) => (
        <Squirrel key={index} creature={creature} />
      ))}
    </>
  );
};

export default WildlifeSystem;