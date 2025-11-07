/**
 * First-Person Controller - Player movement and camera
 */

import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { log } from '../utils/Logger';
import { getWorld } from '../world/ECSWorld';

interface Keys { 
  w: boolean; a: boolean; s: boolean; d: boolean; 
}

const FirstPersonController: React.FC = () => {
  const { camera } = useThree();
  const world = getWorld();
  const [keys, setKeys] = useState<Keys>({
    w: false, a: false, s: false, d: false
  });
  
  const playerRef = useRef({
    position: new THREE.Vector3(0, 5, 0),
    pitch: 0,
    yaw: 0,
    sensitivity: 0.002,
    speed: 25
  });
  
  // Create player entity in ECS
  useEffect(() => {
    try {
      const playerEntity = world.add({
        transform: {
          position: playerRef.current.position.clone(),
          rotation: new THREE.Euler(0, 0, 0),
          scale: new THREE.Vector3(1, 1, 1)
        },
        player: {}
      });
      
      log.info('Player entity created', {
        position: playerRef.current.position.toArray()
      });
      
    } catch (error) {
      log.error('Failed to create player entity', error);
    }
  }, [world]);
  
  useEffect(() => {
    log.info('Setting up first-person controls...');
    
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeys(prev => ({ ...prev, [e.key.toLowerCase()]: true }));
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      setKeys(prev => ({ ...prev, [e.key.toLowerCase()]: false }));
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement) {
        playerRef.current.yaw -= e.movementX * playerRef.current.sensitivity;
        playerRef.current.pitch -= e.movementY * playerRef.current.sensitivity;
        playerRef.current.pitch = Math.max(-Math.PI/2, Math.min(Math.PI/2, playerRef.current.pitch));
      }
    };
    
    const handleClick = () => {
      document.body.requestPointerLock();
      log.info('Pointer lock requested');
    };
    
    const handlePointerLockChange = () => {
      const locked = !!document.pointerLockElement;
      log.info('Pointer lock changed', { locked });
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);
    document.addEventListener('pointerlockchange', handlePointerLockChange);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
    };
  }, []);
  
  useFrame((state, delta) => {
    try {
      const player = playerRef.current;
      const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
      const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
      
      // Calculate movement vector
      const movement = new THREE.Vector3();
      if (keys.w) movement.add(forward);
      if (keys.s) movement.sub(forward);
      if (keys.a) movement.sub(right);
      if (keys.d) movement.add(right);
      
      // Apply movement
      if (movement.length() > 0) {
        movement.normalize().multiplyScalar(player.speed * delta);
        player.position.add(movement);
        
        // Simple ground collision (height = 2 for now)
        player.position.y = Math.max(2, player.position.y);
      }
      
      // Update camera
      camera.position.copy(player.position);
      camera.rotation.set(player.pitch, player.yaw, 0, 'YXZ');
      
      // Update player entity in ECS
      const playerEntities = world.with('player', 'transform');
      for (const entity of playerEntities) {
        if (entity.transform) {
          entity.transform.position.copy(player.position);
          entity.transform.rotation.set(player.pitch, player.yaw, 0);
        }
      }
      
    } catch (error) {
      log.error('First-person controller update failed', error);
    }
  });
  
  return null;
};

export default FirstPersonController;