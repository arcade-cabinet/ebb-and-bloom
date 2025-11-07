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
  
  // Query creatures from ECS world - Poll for new creatures
  useEffect(() => {
    const queryCreatures = () => {
      const creatures = Array.from(world.with('creature', 'render', 'yukaAgent', 'transform').entities);
      setCreatureEntities(creatures);
    };
    
    // Query immediately
    queryCreatures();
    
    // Poll every 500ms to catch newly spawned creatures
    const interval = setInterval(queryCreatures, 500);
    
    return () => clearInterval(interval);
  }, [world]);
  
  useEffect(() => {
    log.creature('CreatureRenderer mounted', undefined, { 
      creatureCount: creatureEntities.length 
    });
  }, [creatureEntities.length]);
  
  useEffect(() => {
    // Add creature meshes to scene
    let addedCount = 0;
    for (const entity of creatureEntities) {
      if (!entity.render?.mesh) {
        log.warn('Creature entity missing mesh', { 
          hasRender: !!entity.render,
          hasMesh: !!entity.render?.mesh,
          species: entity.creature?.species 
        });
        continue;
      }
      
      const mesh = entity.render.mesh;
      
      // Ensure mesh is visible
      mesh.visible = true;
      
      // Apply fur material to creatures if available
      if (furMaterial && !furLoading && entity.creature?.species !== 'bird') {
        mesh.traverse((child: THREE.Object3D) => {
          if (child instanceof THREE.Mesh) {
            child.material = furMaterial.clone();
            child.visible = true;
          }
        });
      }
      
      // Ensure mesh has a position
      if (entity.transform?.position) {
        mesh.position.copy(entity.transform.position);
      }
      
      if (!scene.children.includes(mesh)) {
        scene.add(mesh);
        addedCount++;
        log.creature('Creature added to scene', entity.creature?.species, {
          position: entity.transform?.position.toArray(),
          meshVisible: mesh.visible,
          meshChildren: mesh.children.length
        });
      } else {
        // Mesh already in scene, just ensure it's visible
        mesh.visible = true;
      }
    }
    
    if (addedCount > 0) {
      log.info(`Added ${addedCount} creatures to scene, total: ${creatureEntities.length}`);
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
        if (!entity.render?.mesh) continue;
        
        const mesh = entity.render.mesh;
        
        // Ensure mesh is visible
        if (!mesh.visible) {
          mesh.visible = true;
        }
        
        if (!entity.yukaAgent?.vehicle || !entity.transform) {
          // If no vehicle, ensure mesh is still positioned
          if (entity.transform?.position) {
            mesh.position.copy(entity.transform.position);
          }
          continue;
        }
        
        const vehicle = entity.yukaAgent.vehicle;
        
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
          const tail = mesh.children.find((child: THREE.Object3D) => child.position.z < 0);
          if (tail) {
            tail.rotation.x = Math.sin(Date.now() * 0.008) * 0.3;
          }
        }
        
        if (entity.creature?.species === 'rabbit') {
          // Ear twitch
          const ears = mesh.children.filter((child: THREE.Object3D) => child.position.y > 0.15);
          ears.forEach((ear: THREE.Object3D, i: number) => {
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