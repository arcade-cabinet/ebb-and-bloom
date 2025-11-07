/**
 * Terrain Renderer - Displays ECS terrain entities
 */

import React, { useEffect } from 'react';
import { useEntities } from 'miniplex-react';
import { useThree } from '@react-three/fiber';
import { log } from '../utils/Logger';
import { useGroundMaterial } from '../systems/TextureSystem';

const TerrainRenderer: React.FC = () => {
  const { scene } = useThree();
  const terrainEntities = useEntities('terrain', 'render');
  const { material: grassMaterial, loading: grassLoading } = useGroundMaterial('grass');
  
  useEffect(() => {
    log.info('TerrainRenderer mounted', { 
      terrainChunks: terrainEntities.length 
    });
  }, []);
  
  useEffect(() => {
    // Add terrain meshes to scene
    for (const entity of terrainEntities) {
      if (!entity.render?.mesh) continue;
      
      const mesh = entity.render.mesh;
      
      // Apply loaded grass material if available
      if (grassMaterial && !grassLoading) {
        mesh.material = grassMaterial.clone();
      }
      
      if (!scene.children.includes(mesh)) {
        scene.add(mesh);
        log.terrain('Terrain chunk added to scene', { 
          chunkX: entity.terrain?.chunkX, 
          chunkZ: entity.terrain?.chunkZ 
        });
      }
    }
    
    // Cleanup removed entities
    return () => {
      for (const entity of terrainEntities) {
        if (entity.render?.mesh && scene.children.includes(entity.render.mesh)) {
          scene.remove(entity.render.mesh);
        }
      }
    };
  }, [terrainEntities, scene, grassMaterial, grassLoading]);
  
  return null; // This component only manages scene objects
};

export default TerrainRenderer;