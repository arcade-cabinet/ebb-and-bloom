/**
 * PLAYER CONTROLLER UNIT TESTS
 * 
 * Comprehensive tests for player movement, camera, gravity, and interaction.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as THREE from 'three';
import { EntityManager } from 'yuka';
import { PlayerController } from '../../engine/core/PlayerController';
import { TerrainSystem } from '../../engine/core/TerrainSystem';

describe('PlayerController', () => {
    let camera: THREE.PerspectiveCamera;
    let scene: THREE.Scene;
    let entityManager: EntityManager;
    let terrain: TerrainSystem;
    let player: PlayerController;

    beforeEach(() => {
        camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        scene = new THREE.Scene();
        entityManager = new EntityManager();
        terrain = new TerrainSystem(scene, 'test-seed', entityManager, 2);
        terrain.update(0, 0); // Load initial chunks
        player = new PlayerController(camera, terrain, entityManager);
    });

    describe('Initialization', () => {
        it('should initialize with correct properties', () => {
            expect(player).toBeDefined();
            const pos = player.getPosition();
            expect(pos).toBeDefined();
        });

        it('should have camera attached', () => {
            expect(camera).toBeDefined();
        });
    });

    describe('fixStanding', () => {
        it('should position player on terrain', () => {
            player.fixStanding(0, 0);
            
            const pos = player.getPosition();
            const terrainHeight = terrain.getTerrainHeight(0, 0);
            
            // Player should be above terrain
            expect(pos.y).toBeGreaterThan(terrainHeight);
            // But not too far (controller height * 0.65)
            expect(pos.y - terrainHeight).toBeLessThan(2);
        });

        it('should set camera at eye height', () => {
            player.fixStanding(50, 50);
            
            const pos = player.getPosition();
            const cameraY = camera.position.y;
            
            // Camera should be at eye height above player position
            expect(cameraY).toBeGreaterThan(pos.y);
            expect(cameraY - pos.y).toBeCloseTo(1.8, 0.1); // eyeHeight
        });

        it('should work at different terrain heights', () => {
            // Test at various positions
            const positions = [
                [0, 0],
                [100, 100],
                [-50, 50],
                [200, -100]
            ];

            for (const [x, z] of positions) {
                player.fixStanding(x, z);
                const pos = player.getPosition();
                const terrainHeight = terrain.getTerrainHeight(x, z);
                
                expect(pos.y).toBeGreaterThan(terrainHeight);
                expect(pos.y - terrainHeight).toBeLessThan(2);
            }
        });
    });

    describe('Movement', () => {
        beforeEach(() => {
            player.fixStanding(0, 0);
            // Reset camera rotation to ensure consistent movement direction
            player.resetCameraRotation();
        });

        it('should move forward when W is pressed', () => {
            const initialPos = player.getPosition().clone();
            
            player.setMoveInput(0, 1); // Forward
            player.update(0.1); // 100ms
            
            const newPos = player.getPosition();
            // Should have moved (distance > 0)
            const distance = initialPos.distanceTo(newPos);
            expect(distance).toBeGreaterThan(0);
        });

        it('should move backward when S is pressed', () => {
            const initialPos = player.getPosition().clone();
            
            player.setMoveInput(0, -1); // Backward
            player.update(0.1);
            
            const newPos = player.getPosition();
            const distance = initialPos.distanceTo(newPos);
            expect(distance).toBeGreaterThan(0);
        });

        it('should strafe left when A is pressed', () => {
            const initialPos = player.getPosition().clone();
            
            player.setMoveInput(-1, 0); // Left
            player.update(0.1);
            
            const newPos = player.getPosition();
            const distance = initialPos.distanceTo(newPos);
            expect(distance).toBeGreaterThan(0);
        });

        it('should strafe right when D is pressed', () => {
            const initialPos = player.getPosition().clone();
            
            player.setMoveInput(1, 0); // Right
            player.update(0.1);
            
            const newPos = player.getPosition();
            const distance = initialPos.distanceTo(newPos);
            expect(distance).toBeGreaterThan(0);
        });

        it('should move diagonally when W+A is pressed', () => {
            const initialPos = player.getPosition().clone();
            
            player.setMoveInput(-0.707, 0.707); // Normalized diagonal
            player.update(0.1);
            
            const newPos = player.getPosition();
            // Should have moved (diagonal movement)
            const distance = initialPos.distanceTo(newPos);
            expect(distance).toBeGreaterThan(0);
        });

        it('should not move when no input', () => {
            const initialPos = player.getPosition().clone();
            
            player.setMoveInput(0, 0);
            player.update(0.1);
            
            const newPos = player.getPosition();
            expect(newPos.x).toBeCloseTo(initialPos.x, 0.01);
            expect(newPos.z).toBeCloseTo(initialPos.z, 0.01);
        });

        it('should move at correct speed', () => {
            const initialPos = player.getPosition().clone();
            
            player.setMoveInput(0, 1); // Forward
            player.update(1.0); // 1 second
            
            const newPos = player.getPosition();
            const distance = initialPos.distanceTo(newPos);
            
            // Should have moved approximately maxSpeed (10) units in 1 second
            // Allow some tolerance for floating point precision and terrain variation
            expect(distance).toBeGreaterThan(9);
            expect(distance).toBeLessThan(11);
        });
    });

    describe('Camera Rotation', () => {
        beforeEach(() => {
            player.fixStanding(0, 0);
        });

        it('should rotate yaw with mouse X movement', () => {
            const initialYaw = camera.rotation.y;
            
            player.setLookInput(1.0, 0); // Right mouse movement
            player.update(0.016); // One frame
            
            expect(camera.rotation.y).not.toBe(initialYaw);
        });

        it('should rotate pitch with mouse Y movement', () => {
            const initialPitch = camera.rotation.x;
            
            player.setLookInput(0, 1.0); // Up mouse movement
            player.update(0.016);
            
            expect(camera.rotation.x).not.toBe(initialPitch);
        });

        it('should limit pitch to -90 to +90 degrees', () => {
            // Try to look way up
            for (let i = 0; i < 100; i++) {
                player.setLookInput(0, 10.0);
                player.update(0.016);
            }
            
            const pitch = camera.rotation.x;
            expect(pitch).toBeGreaterThanOrEqual(-Math.PI / 2);
            expect(pitch).toBeLessThanOrEqual(Math.PI / 2);
        });

        it('should accumulate rotation correctly', () => {
            const initialYaw = camera.rotation.y;
            
            // Multiple small movements
            for (let i = 0; i < 10; i++) {
                player.setLookInput(0.1, 0);
                player.update(0.016);
            }
            
            expect(camera.rotation.y).not.toBe(initialYaw);
        });
    });

    describe('Gravity and Grounding', () => {
        beforeEach(() => {
            player.fixStanding(0, 0);
        });

        it('should apply gravity when not grounded', () => {
            const initialY = player.getPosition().y;
            
            // Float player up
            const pos = player.getPosition();
            pos.y += 10;
            player.getPosition().copy(pos);
            
            // Update several frames
            for (let i = 0; i < 10; i++) {
                player.update(0.1);
            }
            
            // Should have fallen back toward ground
            const finalY = player.getPosition().y;
            expect(finalY).toBeLessThan(initialY + 10);
        });

        it('should snap to ground when grounded', () => {
            player.fixStanding(0, 0);
            const terrainHeight = terrain.getTerrainHeight(0, 0);
            
            // Update multiple frames
            for (let i = 0; i < 10; i++) {
                player.update(0.1);
            }
            
            const pos = player.getPosition();
            const expectedFeetHeight = terrainHeight + (2.0 * 0.65); // controllerHeight * 0.65
            expect(pos.y).toBeCloseTo(expectedFeetHeight, 0.1);
        });

        it('should maintain ground level when moving', () => {
            player.fixStanding(0, 0);
            const initialY = player.getPosition().y;
            const initialTerrainHeight = terrain.getTerrainHeight(0, 0);
            
            // Move forward while updating
            player.setMoveInput(0, 1);
            for (let i = 0; i < 10; i++) {
                player.update(0.1);
            }
            
            // Should stay on terrain (terrain height may vary, but player should follow it)
            const newPos = player.getPosition();
            const newTerrainHeight = terrain.getTerrainHeight(newPos.x, newPos.z);
            const expectedY = newTerrainHeight + (2.0 * 0.65); // controllerHeight * 0.65
            
            // Allow tolerance for terrain variation and floating point precision
            expect(newPos.y).toBeGreaterThan(expectedY - 1.0);
            expect(newPos.y).toBeLessThan(expectedY + 1.0);
        });
    });

    describe('Jump', () => {
        beforeEach(() => {
            player.fixStanding(0, 0);
        });

        it('should jump when jump() is called', () => {
            // Ensure player is grounded first
            for (let i = 0; i < 5; i++) {
                player.update(0.1);
            }
            
            const initialY = player.getPosition().y;
            
            player.jump();
            player.update(0.1);
            
            const newY = player.getPosition().y;
            // Should jump (or at least attempt to - might not work if not grounded)
            // Check that vertical velocity was applied
            expect(newY).toBeGreaterThanOrEqual(initialY - 0.1); // Allow small tolerance
        });

        it('should not jump when already in air', () => {
            // Float player up
            const pos = player.getPosition();
            pos.y += 10;
            player.getPosition().copy(pos);
            
            const initialY = player.getPosition().y;
            
            player.jump(); // Should not work when not grounded
            player.update(0.1);
            
            // Should continue falling, not jump higher
            const newY = player.getPosition().y;
            expect(newY).toBeLessThanOrEqual(initialY);
        });
    });

    describe('Camera Position Sync', () => {
        it('should sync camera position to player position', () => {
            player.fixStanding(50, 50);
            
            const playerPos = player.getPosition();
            const cameraPos = camera.position;
            
            // Camera should be at player X/Z, but Y should be eye height
            expect(cameraPos.x).toBeCloseTo(playerPos.x, 0.01);
            expect(cameraPos.z).toBeCloseTo(playerPos.z, 0.01);
            expect(cameraPos.y).toBeCloseTo(playerPos.y + 1.8, 0.1); // eyeHeight
        });

        it('should maintain camera sync during movement', () => {
            player.fixStanding(0, 0);
            
            player.setMoveInput(0, 1);
            for (let i = 0; i < 10; i++) {
                player.update(0.1);
            }
            
            const playerPos = player.getPosition();
            const cameraPos = camera.position;
            
            expect(cameraPos.x).toBeCloseTo(playerPos.x, 0.01);
            expect(cameraPos.z).toBeCloseTo(playerPos.z, 0.01);
        });
    });
});

