/**
 * Building Renderer - Displays procedural buildings with proper collision
 */

import React, { useEffect, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { useWorld } from '../contexts/WorldContext';
import { log } from '../utils/Logger';
import { useWoodMaterial, useStoneMaterial } from '../systems/TextureSystem';
import * as THREE from 'three';

const BuildingRenderer: React.FC = () => {
  const { scene } = useThree();
  const { world } = useWorld();
  const [buildingEntities, setBuildingEntities] = useState<any[]>([]);
  const { material: woodMaterial, loading: woodLoading } = useWoodMaterial('planks');
  const { material: stoneMaterial, loading: stoneLoading } = useStoneMaterial('brick');
  
  // Query buildings from ECS world
  useEffect(() => {
    const updateBuildings = () => {
      const buildings = Array.from(world.with('building', 'render', 'transform').entities);
      setBuildingEntities(buildings);
    };
    
    updateBuildings();
    const interval = setInterval(updateBuildings, 500); // Update 2x per second
    return () => clearInterval(interval);
  }, [world]);
  
  useEffect(() => {
    log.info('BuildingRenderer mounted', { 
      buildingCount: buildingEntities.length 
    });
  }, [buildingEntities.length]);
  
  useEffect(() => {
    // Render building entities to scene
    for (const entity of buildingEntities) {
      if (!entity.render?.mesh || !entity.building || !entity.transform) continue;
      
      const mesh = entity.render.mesh;
      const building = entity.building;
      const transform = entity.transform;
      
      // Apply materials if loaded
      if (woodMaterial && !woodLoading) {
        mesh.traverse((child) => {
          if (child instanceof THREE.Mesh && child.userData.materialType === 'wood') {
            child.material = woodMaterial.clone();
          }
        });
      }
      
      if (stoneMaterial && !stoneLoading) {
        mesh.traverse((child) => {
          if (child instanceof THREE.Mesh && child.userData.materialType === 'stone') {
            child.material = stoneMaterial.clone();
          }
        });
      }
      
      // Position building
      mesh.position.copy(transform.position);
      
      // Add collision detection
      const boundingBox = new THREE.Box3().setFromObject(mesh);
      mesh.userData.boundingBox = boundingBox;
      mesh.userData.collision = true;
      
      if (!scene.children.includes(mesh)) {
        scene.add(mesh);
        log.info('Building added to scene', {
          type: building.type,
          position: transform.position.toArray(),
          dimensions: [building.width, building.height, building.depth],
          hasInterior: building.hasInterior,
          doorCount: building.doors.length
        });
      }
    }
    
    // Cleanup removed buildings  
    return () => {
      for (const entity of buildingEntities) {
        if (entity.render?.mesh && scene.children.includes(entity.render.mesh)) {
          scene.remove(entity.render.mesh);
        }
      }
    };
  }, [buildingEntities, scene, woodMaterial, woodLoading, stoneMaterial, stoneLoading]);
  
  return null; // This component only manages scene objects
};

export default BuildingRenderer;