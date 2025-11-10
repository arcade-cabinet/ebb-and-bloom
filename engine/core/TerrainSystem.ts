/**
 * TERRAIN SYSTEM
 * 
 * Equivalent to DFU's StreamingWorld + DaggerfallTerrain.
 * Handles chunk streaming, terrain generation, collision queries.
 * 
 * Based on:
 * - Assets/Scripts/Terrain/StreamingWorld.cs (terrain streaming)
 * - Assets/Scripts/Terrain/DaggerfallTerrain.cs (individual terrain)
 */

import * as THREE from 'three';
import { EntityManager } from 'yuka';
import { ChunkManager } from '../spawners/ChunkManager';

export interface RaycastHit {
    point: THREE.Vector3;
    normal: THREE.Vector3;
    distance: number;
}

export class TerrainSystem {
    private chunkManager: ChunkManager;
    private chunkDistance: number;
    
    constructor(
        scene: THREE.Scene,
        seed: string,
        entityManager: EntityManager,
        chunkDistance: number = 3
    ) {
        this.chunkDistance = chunkDistance;
        this.chunkManager = new ChunkManager(scene, seed, entityManager);
        
        console.log(`[TerrainSystem] Initialized with distance ${chunkDistance} (${(2*chunkDistance+1)**2} chunks)`);
    }
    
    /**
     * Update terrain streaming (DFU StreamingWorld pattern)
     */
    update(playerX: number, playerZ: number): void {
        this.chunkManager.update(playerX, playerZ);
    }
    
    /**
     * Get terrain height at position (DFU pattern)
     */
    getTerrainHeight(x: number, z: number): number {
        return this.chunkManager.getTerrainHeight(x, z);
    }
    
    /**
     * Raycast against terrain (DFU Physics.Raycast equivalent)
     * 
     * DFU does: Physics.Raycast(ray, out hit, distance)
     * We do: Manual heightmap query
     */
    raycastTerrain(
        origin: THREE.Vector3,
        direction: THREE.Vector3,
        maxDistance: number = 100
    ): RaycastHit | null {
        // For downward raycast (most common - finding ground)
        if (direction.y < -0.9) {
            const height = this.getTerrainHeight(origin.x, origin.z);
            const distance = origin.y - height;
            
            if (distance > 0 && distance <= maxDistance) {
                return {
                    point: new THREE.Vector3(origin.x, height, origin.z),
                    normal: new THREE.Vector3(0, 1, 0),
                    distance
                };
            }
        }
        
        // For other directions, march along ray
        const step = 0.5; // Sample every 0.5m
        for (let t = 0; t < maxDistance; t += step) {
            const testPoint = new THREE.Vector3(
                origin.x + direction.x * t,
                origin.y + direction.y * t,
                origin.z + direction.z * t
            );
            
            const terrainHeight = this.getTerrainHeight(testPoint.x, testPoint.z);
            
            if (testPoint.y <= terrainHeight) {
                return {
                    point: new THREE.Vector3(testPoint.x, terrainHeight, testPoint.z),
                    normal: new THREE.Vector3(0, 1, 0), // Approximate
                    distance: t
                };
            }
        }
        
        return null;
    }
    
    /**
     * Get nearest settlement (DFU pattern)
     */
    getNearestSettlement(x: number, z: number) {
        return this.chunkManager.getNearestSettlement(x, z);
    }
}

