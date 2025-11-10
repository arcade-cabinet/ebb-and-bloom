/**
 * PLAYER CONTROLLER
 * 
 * Equivalent to DFU's PlayerMotor + CharacterController.
 * Handles movement, collision, camera, grounding.
 * 
 * Based on:
 * - Assets/Scripts/Game/PlayerMotor.cs (movement logic)
 * - Unity CharacterController (collision/physics)
 */

import * as THREE from 'three';
import { Vehicle, EntityManager } from 'yuka';
import { TerrainSystem } from './TerrainSystem';

export class PlayerController {
    // DFU CharacterController equivalent
    private vehicle: Vehicle;
    private camera: THREE.Camera;
    private terrain: TerrainSystem;
    
    // DFU constants
    private readonly controllerHeight: number = 2.0;  // CharacterController height
    private readonly eyeHeight: number = 1.8;         // Camera height from feet
    private readonly gravity: number = -9.8;          // m/s²
    
    // State
    private verticalVelocity: number = 0;
    private isGrounded: boolean = false;
    
    // Input
    private moveInput: THREE.Vector2 = new THREE.Vector2();
    private lookInput: THREE.Vector2 = new THREE.Vector2();
    
    constructor(camera: THREE.Camera, terrain: TerrainSystem, entityManager: EntityManager) {
        this.camera = camera;
        this.terrain = terrain;
        this.vehicle = new Vehicle();
        this.vehicle.maxSpeed = 10;
        entityManager.add(this.vehicle);
        
        console.log(`[PlayerController] Created with height ${this.controllerHeight}m, eyes at ${this.eyeHeight}m`);
    }
    
    /**
     * Fix standing - position player on ground
     * 
     * DFU equivalent:
     * Ray ray = new Ray(transform.position + Vector3.up * extraHeight, Vector3.down);
     * if (Physics.Raycast(ray, out hit, controller.height * 2 + extraHeight + extraDistance))
     *     transform.position = hit.point + Vector3.up * (controller.height * 0.65f);
     */
    fixStanding(x: number, z: number): boolean {
        // Raycast down from above to find ground
        const terrainHeight = this.terrain.getTerrainHeight(x, z);
        
        // Position at ground + 65% of controller height (DFU pattern)
        const newY = terrainHeight + (this.controllerHeight * 0.65);
        
        this.vehicle.position.set(x, newY, z);
        this.camera.position.copy(this.vehicle.position);
        
        console.log(`[PlayerController] FixStanding at (${x}, ${z}) → terrain: ${terrainHeight.toFixed(2)}m, player: ${newY.toFixed(2)}m`);
        
        return true;
    }
    
    /**
     * Update player (DFU FixedUpdate pattern)
     */
    update(delta: number): void {
        // Check grounding (DFU: collisionFlags & CollisionFlags.Below)
        const terrainHeight = this.terrain.getTerrainHeight(
            this.vehicle.position.x,
            this.vehicle.position.z
        );
        const feetHeight = terrainHeight + (this.controllerHeight * 0.65);
        
        this.isGrounded = Math.abs(this.vehicle.position.y - feetHeight) < 0.1;
        
        if (this.isGrounded) {
            // Snap to ground
            this.vehicle.position.y = feetHeight;
            this.verticalVelocity = 0;
        } else {
            // Apply gravity
            this.verticalVelocity += this.gravity * delta;
            this.vehicle.position.y += this.verticalVelocity * delta;
            
            // Don't fall through
            if (this.vehicle.position.y < feetHeight) {
                this.vehicle.position.y = feetHeight;
                this.verticalVelocity = 0;
                this.isGrounded = true;
            }
        }
        
        // Sync camera to player
        this.camera.position.copy(this.vehicle.position);
    }
    
    /**
     * Handle movement input
     */
    setMoveInput(forward: number, strafe: number): void {
        this.moveInput.set(strafe, forward);
    }
    
    /**
     * Handle look input
     */
    setLookInput(yaw: number, pitch: number): void {
        this.lookInput.set(yaw, pitch);
    }
    
    /**
     * Jump (DFU AcrobatMotor pattern)
     */
    jump(): void {
        if (this.isGrounded) {
            this.verticalVelocity = 5.0; // DFU jump velocity
            this.isGrounded = false;
        }
    }
    
    /**
     * Get position (for WorldManager)
     */
    getPosition(): THREE.Vector3 {
        return this.vehicle.position.clone();
    }
    
    /**
     * Get grounded state
     */
    getIsGrounded(): boolean {
        return this.isGrounded;
    }
}

