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
import { EntityManager, Vehicle } from 'yuka';
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

    // Camera rotation state (accumulated yaw, current pitch)
    private cameraYaw: number = 0;
    private cameraPitch: number = 0;

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
     * 
     * We use terrain heightmap query (equivalent to raycast for terrain-only)
     * For buildings/obstacles, would need actual raycast against scene geometry
     */
    fixStanding(x: number, z: number, extraHeight: number = 0, extraDistance: number = 0): boolean {
        // DFU pattern: Raycast from above downward
        // We simulate this by querying terrain height (works for terrain, not buildings)
        const maxDistance = (this.controllerHeight * 2) + extraHeight + extraDistance;

        // Start raycast from above (DFU pattern)
        // DFU terrain can be up to 1539m, so start well above that
        const rayStartY = 2000; // Start high above max terrain (1539m)
        const rayDirection = new THREE.Vector3(0, -1, 0); // Downward

        // Use terrain raycast (DFU equivalent)
        const hit = this.terrain.raycastTerrain(
            new THREE.Vector3(x, rayStartY, z),
            rayDirection,
            maxDistance
        );

        if (hit) {
            // Position player at hit point + 65% of controller height (DFU pattern)
            const newY = hit.point.y + (this.controllerHeight * 0.65);
            this.vehicle.position.set(x, newY, z);

            // Position camera at eye height (must match update() behavior to avoid jump)
            this.camera.position.set(
                x,
                newY + this.eyeHeight, // Eye height offset (matches update())
                z
            );

            console.log(`[PlayerController] FixStanding at (${x}, ${z}) → terrain: ${hit.point.y.toFixed(2)}m, player: ${newY.toFixed(2)}m, camera: ${(newY + this.eyeHeight).toFixed(2)}m`);
            return true;
        }

        // Fallback: Use direct height query (if raycast fails)
        const terrainHeight = this.terrain.getTerrainHeight(x, z);
        const newY = terrainHeight + (this.controllerHeight * 0.65);
        this.vehicle.position.set(x, newY, z);

        // Position camera at eye height (must match update() behavior to avoid jump)
        this.camera.position.set(
            x,
            newY + this.eyeHeight, // Eye height offset (matches update())
            z
        );

        console.log(`[PlayerController] FixStanding (fallback) at (${x}, ${z}) → terrain: ${terrainHeight.toFixed(2)}m, player: ${newY.toFixed(2)}m, camera: ${(newY + this.eyeHeight).toFixed(2)}m`);
        return false;
    }

    /**
     * Update player (DFU FixedUpdate pattern)
     */
    update(delta: number): void {
        // Apply horizontal movement (DFU pattern)
        if (this.moveInput.length() > 0) {
            // Get camera forward/right vectors for movement direction (using THREE for calculations)
            const forward = new THREE.Vector3();
            this.camera.getWorldDirection(forward);
            forward.y = 0; // Keep movement horizontal
            forward.normalize();

            const right = new THREE.Vector3();
            right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

            // Calculate movement direction
            const moveDirection = new THREE.Vector3();
            moveDirection.addScaledVector(forward, this.moveInput.y); // Forward/back
            moveDirection.addScaledVector(right, this.moveInput.x);   // Left/right
            moveDirection.normalize();

            // Apply movement (DFU: controller.Move)
            // Convert THREE Vector3 to Yuka Vector3 by setting position directly
            const speed = this.vehicle.maxSpeed;
            const moveX = moveDirection.x * speed * delta;
            const moveZ = moveDirection.z * speed * delta;

            this.vehicle.position.x += moveX;
            this.vehicle.position.z += moveZ;
        }

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

        // Apply look input (camera rotation) - check if there's any input
        if (Math.abs(this.lookInput.x) > 0.001 || Math.abs(this.lookInput.y) > 0.001) {
            // Accumulate yaw (horizontal rotation)
            this.cameraYaw -= this.lookInput.x * delta * 2.0; // Sensitivity multiplier

            // Accumulate pitch (vertical rotation) - clamp to prevent flipping
            this.cameraPitch -= this.lookInput.y * delta * 2.0;
            this.cameraPitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.cameraPitch));

            // Apply rotations to camera (Euler order YXZ for proper first-person)
            this.camera.rotation.order = 'YXZ';
            this.camera.rotation.y = this.cameraYaw;
            this.camera.rotation.x = this.cameraPitch;
            this.camera.rotation.z = 0;

            // Clear look input after processing (it's a delta, not accumulated state)
            this.lookInput.set(0, 0);
        }

        // Sync camera position to player (but keep rotation)
        this.camera.position.set(
            this.vehicle.position.x,
            this.vehicle.position.y + this.eyeHeight, // Eye height offset
            this.vehicle.position.z
        );
    }

    /**
     * Handle movement input
     */
    setMoveInput(forward: number, strafe: number): void {
        this.moveInput.set(strafe, forward);
    }

    /**
     * Handle look input (relative mouse movement deltas)
     */
    setLookInput(deltaYaw: number, deltaPitch: number): void {
        this.lookInput.set(deltaYaw, deltaPitch);
    }

    /**
     * Reset camera rotation (for respawn, etc.)
     */
    resetCameraRotation(): void {
        this.cameraYaw = 0;
        this.cameraPitch = 0;
        this.camera.rotation.order = 'YXZ';
        this.camera.rotation.y = 0;
        this.camera.rotation.x = 0;
        this.camera.rotation.z = 0;
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
        return new THREE.Vector3(
            this.vehicle.position.x,
            this.vehicle.position.y,
            this.vehicle.position.z
        );
    }

    /**
     * Get grounded state
     */
    getIsGrounded(): boolean {
        return this.isGrounded;
    }
}

