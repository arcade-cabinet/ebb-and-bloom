/**
 * WORLD INTEGRATION TESTS
 * 
 * End-to-end tests for complete world generation.
 */

import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { WorldManager } from '../../engine/core/WorldManager';

describe('WorldManager Integration', () => {
    it('should initialize complete world', () => {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera();
        
        const world = new WorldManager();
        world.initialize({
            seed: 'v1-test-world-seed',
            scene,
            camera,
            chunkDistance: 2 // Smaller for faster test
        });
        
        expect(world.isReady).toBe(true);
        expect(world.terrain).toBeDefined();
        expect(world.player).toBeDefined();
        expect(world.creatures).toBeDefined();
    });
    
    it('should spawn player on terrain', () => {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera();
        
        const world = new WorldManager();
        world.initialize({
            seed: 'v1-green-valley-test',
            scene,
            camera
        });
        
        const playerPos = world.getPlayerPosition();
        const terrainHeight = world.terrain.getTerrainHeight(playerPos.x, playerPos.z);
        
        // Player should be above terrain
        expect(playerPos.y).toBeGreaterThan(terrainHeight);
        expect(playerPos.y - terrainHeight).toBeLessThan(3);
    });
    
    it('should update all systems', () => {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera();
        
        const world = new WorldManager();
        world.initialize({
            seed: 'v1-update-test',
            scene,
            camera,
            chunkDistance: 1
        });
        
        const initialPos = world.getPlayerPosition().clone();
        
        // Update multiple frames
        for (let i = 0; i < 10; i++) {
            world.update(0.016); // 60fps
        }
        
        // Should complete without errors
        expect(world.isReady).toBe(true);
    });
    
    it('should maintain determinism with same seed', () => {
        const seed = 'v1-determinism-test';
        
        // World 1
        const scene1 = new THREE.Scene();
        const camera1 = new THREE.PerspectiveCamera();
        const world1 = new WorldManager();
        world1.initialize({ seed, scene: scene1, camera: camera1, chunkDistance: 1 });
        
        const height1 = world1.terrain.getTerrainHeight(50, 50);
        
        // World 2
        const scene2 = new THREE.Scene();
        const camera2 = new THREE.PerspectiveCamera();
        const world2 = new WorldManager();
        world2.initialize({ seed, scene: scene2, camera: camera2, chunkDistance: 1 });
        
        const height2 = world2.terrain.getTerrainHeight(50, 50);
        
        // Same seed = same terrain
        expect(height1).toBe(height2);
    });
});

describe('Complete World Generation', () => {
    it('should generate world with creatures and terrain', () => {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera();
        
        const world = new WorldManager();
        world.initialize({
            seed: 'v1-complete-test',
            scene,
            camera,
            chunkDistance: 2
        });
        
        // Spawn some creatures
        const biome = { vegetation: 0.5, rockColor: 0.5, uvIntensity: 0.5, temperature: 290 };
        world.creatures.spawn(new THREE.Vector3(10, 5, 10), biome);
        world.creatures.spawn(new THREE.Vector3(20, 5, 20), biome);
        
        const creatures = world.creatures.getCreatures();
        expect(creatures.length).toBe(2);
        
        // Update world
        world.update(1.0);
        
        // Creatures should have lost energy (metabolism)
        expect((creatures[0] as any).energy).toBeLessThan(100);
    });
});

