/**
 * CORE ENGINE TESTS
 * 
 * Tests for core systems: WorldManager, TerrainSystem, PlayerController, etc.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as THREE from 'three';
import { EntityManager } from 'yuka';
import {
    WorldManager,
    TerrainSystem,
    PlayerController,
    CreatureManager,
    CityPlanner
} from '../../engine/core';
import { EnhancedRNG } from '../../engine/utils/EnhancedRNG';

describe('TerrainSystem', () => {
    it('should initialize with chunk manager', () => {
        const scene = new THREE.Scene();
        const entityManager = new EntityManager();
        
        const terrain = new TerrainSystem(scene, 'test-seed', entityManager, 3);
        
        expect(terrain).toBeDefined();
    });
    
    it('should return terrain height for any position', () => {
        const scene = new THREE.Scene();
        const entityManager = new EntityManager();
        const terrain = new TerrainSystem(scene, 'test-seed', entityManager);
        
        terrain.update(0, 0); // Load chunks
        
        const height = terrain.getTerrainHeight(0, 0);
        expect(height).toBeGreaterThanOrEqual(5); // Minimum height
        expect(height).toBeLessThanOrEqual(35); // Maximum height
    });
    
    it('should raycast to find ground', () => {
        const scene = new THREE.Scene();
        const entityManager = new EntityManager();
        const terrain = new TerrainSystem(scene, 'test-seed', entityManager);
        
        terrain.update(0, 0);
        
        const origin = new THREE.Vector3(0, 100, 0);
        const direction = new THREE.Vector3(0, -1, 0);
        
        const hit = terrain.raycastTerrain(origin, direction, 200);
        
        expect(hit).not.toBeNull();
        expect(hit!.point.y).toBeGreaterThan(0);
        expect(hit!.point.y).toBeLessThan(100);
    });
});

describe('PlayerController', () => {
    it('should initialize with correct height', () => {
        const camera = new THREE.PerspectiveCamera();
        const scene = new THREE.Scene();
        const entityManager = new EntityManager();
        const terrain = new TerrainSystem(scene, 'test', entityManager);
        
        const player = new PlayerController(camera, terrain, entityManager);
        
        expect(player).toBeDefined();
    });
    
    it('should fix standing on terrain', () => {
        const camera = new THREE.PerspectiveCamera();
        const scene = new THREE.Scene();
        const entityManager = new EntityManager();
        const terrain = new TerrainSystem(scene, 'test', entityManager);
        terrain.update(0, 0); // Load chunks
        
        const player = new PlayerController(camera, terrain, entityManager);
        player.fixStanding(0, 0);
        
        const pos = player.getPosition();
        const terrainHeight = terrain.getTerrainHeight(0, 0);
        
        // Player should be above terrain
        expect(pos.y).toBeGreaterThan(terrainHeight);
        // But not too far (controller height * 0.65)
        expect(pos.y - terrainHeight).toBeLessThan(2);
    });
    
    it('should apply gravity when not grounded', () => {
        const camera = new THREE.PerspectiveCamera();
        const scene = new THREE.Scene();
        const entityManager = new EntityManager();
        const terrain = new TerrainSystem(scene, 'test', entityManager);
        terrain.update(0, 0);
        
        const player = new PlayerController(camera, terrain, entityManager);
        player.fixStanding(0, 0);
        
        const initialY = player.getPosition().y;
        
        // Float player up
        const pos = player.getPosition();
        pos.y += 10;
        
        // Update several frames
        for (let i = 0; i < 10; i++) {
            player.update(0.1);
        }
        
        // Should have fallen back to ground
        const finalY = player.getPosition().y;
        expect(finalY).toBeLessThan(initialY + 10);
    });
});

describe('CreatureManager', () => {
    it('should spawn creatures with governors', () => {
        const scene = new THREE.Scene();
        const entityManager = new EntityManager();
        const manager = new CreatureManager(scene, entityManager, 'test');
        
        const biome = {
            vegetation: 0.7,
            rockColor: 0.3,
            uvIntensity: 0.5,
            temperature: 290
        };
        
        const creature = manager.spawn(new THREE.Vector3(0, 5, 0), biome);
        
        expect(creature).toBeDefined();
        expect(creature.mass).toBeGreaterThan(0);
        expect((creature as any).energy).toBeDefined();
    });
    
    it('should update metabolism on all creatures', () => {
        const scene = new THREE.Scene();
        const entityManager = new EntityManager();
        const manager = new CreatureManager(scene, entityManager, 'test');
        
        const creature = manager.spawn(
            new THREE.Vector3(0, 5, 0),
            { vegetation: 0.5, rockColor: 0.5, uvIntensity: 0.5, temperature: 290 }
        );
        
        const initialEnergy = (creature as any).energy;
        
        manager.update(1.0); // 1 second
        
        expect((creature as any).energy).toBeLessThan(initialEnergy);
    });
});

describe('CityPlanner', () => {
    it('should plan city with districts', () => {
        const planner = new CityPlanner();
        const rng = new EnhancedRNG('test');
        
        const layout = planner.planCity(1000, 'state', 0, 0, rng);
        
        expect(layout.districts.length).toBeGreaterThan(0);
        expect(layout.plaza).toBeDefined();
    });
    
    it('should create simpler layouts for bands', () => {
        const planner = new CityPlanner();
        const rng = new EnhancedRNG('test');
        
        const band = planner.planCity(30, 'band', 0, 0, rng);
        const state = planner.planCity(5000, 'state', 0, 0, rng);
        
        expect(state.districts.length).toBeGreaterThan(band.districts.length);
        expect(state.roads.length).toBeGreaterThan(band.roads.length);
    });
});

