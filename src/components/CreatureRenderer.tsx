/**
 * Creature Renderer - Displays ECS creature entities with Yuka AI
 */

import React, { useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useThree } from '@react-three/fiber';
import { useWorld } from '../contexts/WorldContext';
import { log } from '../utils/Logger';
import { useFabricMaterial } from '../systems/TextureSystem';
import * as THREE from 'three';

const CreatureRenderer: React.FC = () => {
  const { scene } = useThree();
  const { world } = useWorld();
  const [creatureEntities, setCreatureEntities] = useState<any[]>([]);
  const { material: furMaterial, loading: furLoading } = useFabricMaterial('fur');
  
  // Query creatures from ECS world
  useEffect(() => {
    const updateCreatures = () => {
      const creatures = Array.from(world.with('creature', 'render', 'yukaAgent', 'transform').entities);
      setCreatureEntities(creatures);
    };
    
    updateCreatures();
    const interval = setInterval(updateCreatures, 100); // Update 10x per second
    return () => clearInterval(interval);
  }, [world]);
  
  useEffect(() => {
    log.creature('CreatureRenderer mounted', undefined, { 
      creatureCount: creatureEntities.length 
    });
  }, [creatureEntities.length]);
  
  useEffect(() => {
    // Add creature meshes to scene
    for (const entity of creatureEntities) {
      if (!entity.render?.mesh) continue;
      
      const mesh = entity.render.mesh;
      
      // Apply fur material to creatures if available
      if (furMaterial && !furLoading && entity.creature?.species !== 'bird') {
        mesh.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.material = furMaterial.clone();
          }
        });
      }
      
      if (!scene.children.includes(mesh)) {
        scene.add(mesh);
        log.creature('Creature added to scene', entity.creature?.species, {
          position: entity.transform?.position.toArray()
        });
      }
    }
    
    // Cleanup removed creatures
    return () => {
      for (const entity of creatureEntities) {
        if (entity.render?.mesh && scene.children.includes(entity.render.mesh)) {
          scene.remove(entity.render.mesh);
        }
      }
    };
  }, [creatureEntities, scene, furMaterial, furLoading]);
  
  // Update creature positions from Yuka vehicles
  useFrame(() => {
    try {
      for (const entity of creatureEntities) {
        if (!entity.yukaAgent?.vehicle || !entity.render?.mesh || !entity.transform) continue;
        
        const vehicle = entity.yukaAgent.vehicle;
        const mesh = entity.render.mesh;
        
        // Sync mesh to vehicle position
        mesh.position.copy(vehicle.position);
        entity.transform.position.copy(vehicle.position);
        
        // Face movement direction
        if (vehicle.velocity.length() > 0.1) {
          const lookTarget = vehicle.position.clone().add(vehicle.velocity);
          mesh.lookAt(lookTarget);
        }
        
        // Species-specific animations
        if (entity.creature?.species === 'squirrel') {
          // Tail swish
          const tail = mesh.children.find(child => child.position.z < 0);
          if (tail) {
            tail.rotation.x = Math.sin(Date.now() * 0.008) * 0.3;
          }
        }
        
        if (entity.creature?.species === 'rabbit') {
          // Ear twitch
          const ears = mesh.children.filter(child => child.position.y > 0.15);
          ears.forEach((ear, i) => {
            ear.rotation.z = Math.sin(Date.now() * 0.01 + i) * 0.1;
          });
        }
      }
    } catch (error) {
      log.error('Creature rendering update failed', error);
    }
  });
  
  return null; // This component only manages scene objects
};

export default CreatureRenderer;