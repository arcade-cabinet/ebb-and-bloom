/**
 * Terrain Renderer - Displays ECS terrain entities
 */

import { useThree } from '@react-three/fiber';
import React, { useEffect, useState } from 'react';
import { useWorld } from '../contexts/WorldContext';
import { useGroundMaterial } from '../systems/TextureSystem';
import { log } from '../utils/Logger';

const TerrainRenderer: React.FC = () => {
  const { scene } = useThree();
  const { world } = useWorld();
  const [terrainEntities, setTerrainEntities] = useState<any[]>([]);
  const { material: grassMaterial, loading: grassLoading } = useGroundMaterial('grass');

  // Query terrain from ECS world
  useEffect(() => {
    const updateTerrain = () => {
      const terrain = Array.from(world.with('terrain', 'render').entities);
      setTerrainEntities(terrain);
    };

    updateTerrain();
    const interval = setInterval(updateTerrain, 500); // Update 2x per second
    return () => clearInterval(interval);
  }, [world]);

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