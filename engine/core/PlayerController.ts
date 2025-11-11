/**
 * PLAYER CONTROLLER - PURE ENGINE MODE
 * 
 * Direct DFU PlayerMotor + CharacterController implementation.
 * No Yuka dependencies - pure physics first, governors control later.
 * 
 * Based on Daggerfall Unity source:
 * - Assets/Scripts/Game/PlayerMotor.cs (movement logic)
 * - Assets/Scripts/Game/Player/PlayerSpeedChanger.cs (speed formulas)
 * - Assets/Scripts/Game/Player/AcrobatMotor.cs (jump/gravity)
 * - Unity CharacterController (collision/physics)
 */

import * as THREE from 'three';
import { TerrainSystem } from './TerrainSystem';

export class PlayerController {
    // Pure THREE.js position (no Yuka abstraction)
    private position: THREE.Vector3;
    private camera: THREE.Camera;
    private terrain: TerrainSystem;

    // DFU constants (from Daggerfall Unity source)
    private readonly controllerHeight: number = 1.8;  // CharacterController height (DFU standard)
    private readonly eyeHeight: number = 1.62;        // Camera height from feet (90% of controller height)
    private readonly gravity: number = -20.0;         // DFU gravity (AcrobatMotor.defaultGravity = 20.0)
    private readonly jumpSpeed: number = 4.5;         // DFU jump velocity (AcrobatMotor.defaultJumpSpeed = 4.5)
    private readonly walkSpeed: number = 5.0;         // DFU walk speed ≈(50+150-25)/39.5 ≈ 4.43, rounded to 5.0
    private readonly groundTolerance: number = 0.1;   // DFU grounding tolerance

    // State
    private verticalVelocity: number = 0;
    private isGrounded: boolean = false;

    // Input
    private moveInput: THREE.Vector2 = new THREE.Vector2();
    private lookInput: THREE.Vector2 = new THREE.Vector2();

    // Camera rotation state (accumulated yaw, current pitch)
    private cameraYaw: number = 0;
    private cameraPitch: number = 0;

    constructor(camera: THREE.Camera, terrain: TerrainSystem) {
        this.camera = camera;
        this.terrain = terrain;
        this.position = new THREE.Vector3(); // Pure engine position

        console.log(`[PlayerController] Pure engine mode - DFU physics: height=${this.controllerHeight}m, eyes=${this.eyeHeight}m, walk=${this.walkSpeed}m/s, gravity=${this.gravity}m/s²`);
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
            this.position.set(x, newY, z);

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
        this.position.set(x, newY, z);

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

            // Apply movement (DFU: controller.Move(moveDirection * Time.deltaTime))
            // Pure engine - direct position manipulation
            const moveX = moveDirection.x * this.walkSpeed * delta;
            const moveZ = moveDirection.z * this.walkSpeed * delta;

            this.position.x += moveX;
            this.position.z += moveZ;
        }

        // Check grounding (DFU: collisionFlags & CollisionFlags.Below)
        const terrainHeight = this.terrain.getTerrainHeight(
            this.position.x,
            this.position.z
        );
        const feetHeight = terrainHeight + (this.controllerHeight * 0.65); // DFU pattern

        this.isGrounded = Math.abs(this.position.y - feetHeight) < this.groundTolerance;

        if (this.isGrounded) {
            // Snap to ground (DFU pattern)
            this.position.y = feetHeight;
            this.verticalVelocity = 0;
        } else {
            // Apply DFU gravity
            this.verticalVelocity += this.gravity * delta;
            this.position.y += this.verticalVelocity * delta;

            // Don't fall through terrain
            if (this.position.y < feetHeight) {
                this.position.y = feetHeight;
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
            this.position.x,
            this.position.y + this.eyeHeight, // Eye height offset
            this.position.z
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
     * 
     * DFU: moveDirection.y = jumpSpeed * jumpSpeedMultiplier
     * Base jumpSpeed = 4.5 (AcrobatMotor.defaultJumpSpeed)
     * Multiplier includes skill bonuses, but we use 1.0 for base implementation
     */
    jump(): void {
        if (this.isGrounded) {
            this.verticalVelocity = this.jumpSpeed; // DFU base jump velocity (4.5 m/s)
            this.isGrounded = false;
        }
    }

    /**
     * Get position (for WorldManager)
     */
    getPosition(): THREE.Vector3 {
        return this.position.clone();
    }

    /**
     * Get grounded state
     */
    getIsGrounded(): boolean {
        return this.isGrounded;
    }
}

