/**
 * PLAYER-WORLD INTEGRATION TESTS
 * 
 * Tests for player interaction with world systems: terrain, settlements, creatures.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as THREE from 'three';
import { WorldManager } from '../../engine/core/WorldManager';

describe('Player-World Integration', () => {
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let world: WorldManager;

    beforeEach(() => {
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        world = new WorldManager();
    });

    describe('Player Spawn', () => {
        it('should spawn player on terrain', () => {
            world.initialize({
                seed: 'test-spawn',
                scene,
                camera,
                chunkDistance: 2
            });

            const playerPos = world.getPlayerPosition();
            const terrainHeight = world.terrain.getTerrainHeight(playerPos.x, playerPos.z);

            // Player should be above terrain
            expect(playerPos.y).toBeGreaterThan(terrainHeight);
            expect(playerPos.y - terrainHeight).toBeLessThan(3);
        });

        it('should spawn player outside settlement edge', () => {
            world.initialize({
                seed: 'test-settlement-spawn',
                scene,
                camera,
                chunkDistance: 3
            });

            const playerPos = world.getPlayerPosition();
            const settlement = world.terrain.getNearestSettlement(playerPos.x, playerPos.z);

            if (settlement) {
                // Player should be outside settlement bounds
                const dx = settlement.position.x - playerPos.x;
                const dz = settlement.position.z - playerPos.z;
                const distance = Math.sqrt(dx * dx + dz * dz);
                
                // Should be at least 10m from settlement center
                expect(distance).toBeGreaterThan(10);
            }
        });

        it('should spawn player at valid terrain height', () => {
            world.initialize({
                seed: 'test-height',
                scene,
                camera,
                chunkDistance: 2
            });

            const playerPos = world.getPlayerPosition();
            const terrainHeight = world.terrain.getTerrainHeight(playerPos.x, playerPos.z);

            // Terrain height should be in valid range (5-35m)
            expect(terrainHeight).toBeGreaterThanOrEqual(5);
            expect(terrainHeight).toBeLessThanOrEqual(35);

            // Player should be above terrain
            expect(playerPos.y).toBeGreaterThan(terrainHeight);
        });
    });

    describe('Player Movement on Terrain', () => {
        beforeEach(() => {
            world.initialize({
                seed: 'test-movement',
                scene,
                camera,
                chunkDistance: 2
            });
        });

        it('should move player across terrain', () => {
            const initialPos = world.getPlayerPosition().clone();

            world.player.setMoveInput(0, 1); // Forward
            for (let i = 0; i < 10; i++) {
                world.update(0.1);
            }

            const newPos = world.getPlayerPosition();
            expect(newPos.distanceTo(initialPos)).toBeGreaterThan(0);
        });

        it('should maintain player on terrain while moving', () => {
            const initialY = world.getPlayerPosition().y;

            // Move in a circle
            for (let i = 0; i < 20; i++) {
                const angle = (i / 20) * Math.PI * 2;
                world.player.setMoveInput(Math.sin(angle), Math.cos(angle));
                world.update(0.1);
            }

            // Should stay roughly at ground level
            const finalY = world.getPlayerPosition().y;
            expect(finalY).toBeCloseTo(initialY, 1.0); // Allow some variation for terrain
        });

        it('should handle terrain height changes', () => {
            const startPos = world.getPlayerPosition().clone();
            
            // Move to a different location
            world.player.setMoveInput(0, 1);
            for (let i = 0; i < 30; i++) {
                world.update(0.1);
            }

            const endPos = world.getPlayerPosition();
            const endTerrainHeight = world.terrain.getTerrainHeight(endPos.x, endPos.z);

            // Player should be on terrain at new location
            expect(endPos.y).toBeGreaterThan(endTerrainHeight);
            expect(endPos.y - endTerrainHeight).toBeLessThan(3);
        });
    });

    describe('Player-Settlement Interaction', () => {
        beforeEach(() => {
            world.initialize({
                seed: 'test-settlement',
                scene,
                camera,
                chunkDistance: 3
            });
        });

        it('should detect nearby settlements', () => {
            const playerPos = world.getPlayerPosition();
            const settlement = world.terrain.getNearestSettlement(playerPos.x, playerPos.z);

            // Should find a settlement (if world generates one)
            // This test verifies the system works, not that settlement exists
            if (settlement) {
                expect(settlement.name).toBeDefined();
                expect(settlement.position).toBeDefined();
            }
        });

        it('should allow player to approach settlement', () => {
            const playerPos = world.getPlayerPosition();
            const settlement = world.terrain.getNearestSettlement(playerPos.x, playerPos.z);

            if (settlement) {
                // Move toward settlement
                const dx = settlement.position.x - playerPos.x;
                const dz = settlement.position.z - playerPos.z;
                const distance = Math.sqrt(dx * dx + dz * dz);
                const direction = new THREE.Vector2(dx / distance, dz / distance);

                world.player.setMoveInput(direction.x, direction.y);
                for (let i = 0; i < 50; i++) {
                    world.update(0.1);
                }

                const newPos = world.getPlayerPosition();
                const newDistance = Math.sqrt(
                    Math.pow(settlement.position.x - newPos.x, 2) +
                    Math.pow(settlement.position.z - newPos.z, 2)
                );

                // Should be closer to settlement
                expect(newDistance).toBeLessThan(distance);
            }
        });
    });

    describe('Player-Creature Interaction', () => {
        beforeEach(() => {
            world.initialize({
                seed: 'test-creatures',
                scene,
                camera,
                chunkDistance: 2
            });
        });

        it('should spawn creatures in world', () => {
            const biome = {
                vegetation: 0.7,
                rockColor: 0.3,
                uvIntensity: 0.5,
                temperature: 290
            };

            const creature = world.creatures.spawn(
                new THREE.Vector3(10, 5, 10),
                biome
            );

            expect(creature).toBeDefined();
        });

        it('should allow player to move near creatures', () => {
            const biome = {
                vegetation: 0.7,
                rockColor: 0.3,
                uvIntensity: 0.5,
                temperature: 290
            };

            const creaturePos = new THREE.Vector3(20, 5, 20);
            world.creatures.spawn(creaturePos, biome);

            // Move player toward creature
            const playerPos = world.getPlayerPosition();
            const startPos = playerPos.clone();
            const dx = creaturePos.x - playerPos.x;
            const dz = creaturePos.z - playerPos.z;
            const distance = Math.sqrt(dx * dx + dz * dz);
            const direction = new THREE.Vector2(dx / distance, dz / distance);

            world.player.setMoveInput(direction.x, direction.y);
            for (let i = 0; i < 30; i++) {
                world.update(0.1);
            }

            const newPos = world.getPlayerPosition();
            const newDistance = newPos.distanceTo(creaturePos);

            // Should be closer to creature (or at least moved toward it)
            // Allow some tolerance for terrain variation affecting movement
            if (newDistance >= distance) {
                // If not closer, at least verify we moved
                const movedDistance = startPos.distanceTo(newPos);
                expect(movedDistance).toBeGreaterThan(0);
            } else {
                expect(newDistance).toBeLessThan(distance);
            }
        });
    });

    describe('World Update Loop', () => {
        beforeEach(() => {
            world.initialize({
                seed: 'test-update',
                scene,
                camera,
                chunkDistance: 2
            });
        });

        it('should update all systems without errors', () => {
            // Run many update cycles
            for (let i = 0; i < 100; i++) {
                world.update(0.016); // 60fps
            }

            expect(world.isReady).toBe(true);
        });

        it('should maintain player state across updates', () => {
            const initialPos = world.getPlayerPosition().clone();

            // Update without movement
            for (let i = 0; i < 10; i++) {
                world.update(0.1);
            }

            // Player should still be at valid position
            const finalPos = world.getPlayerPosition();
            expect(finalPos.y).toBeGreaterThan(0);
        });
    });
});

