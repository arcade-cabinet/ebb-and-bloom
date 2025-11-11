/**
 * WORLD MANAGER
 * 
 * Equivalent to DFU's GameManager + StreamingWorld.
 * Central coordinator for all world systems.
 * 
 * Based on:
 * - Assets/Scripts/Game/GameManager.cs
 * - Assets/Scripts/Terrain/StreamingWorld.cs
 */

import * as THREE from 'three';
import { EntityManager } from 'yuka';
import { isGenerationGovernorEnabled } from '../config/featureFlags';
import { CreatureManager } from './CreatureManager';
import { PlayerController } from './PlayerController';
import { TerrainSystem } from './TerrainSystem';
import { SpawnGovernor } from '../../agents/governors/physics/SpawnGovernor';

export interface WorldConfig {
    seed: string;
    scene: THREE.Scene;
    camera: THREE.Camera;
    chunkDistance?: number; // Default: 3 (7x7 grid like DFU)
}

export class WorldManager {
    // Core systems
    terrain!: TerrainSystem;
    player!: PlayerController;
    creatures!: CreatureManager;
    entityManager: EntityManager;
    // generationGovernor!: GenerationGovernor; // ONE OVERARCHING SYSTEM

    // Scene
    scene!: THREE.Scene;
    camera!: THREE.Camera;
    seed!: string;

    // State
    isReady: boolean = false;
    isPaused: boolean = false;

    constructor() {
        this.entityManager = new EntityManager();
    }

    /**
     * Initialize world (DFU GameManager pattern)
     */
    initialize(config: WorldConfig): void {
        this.scene = config.scene;
        this.camera = config.camera;
        this.seed = config.seed;

        console.log(`[WorldManager] Initializing world: ${this.seed}`);
        console.log(`[WorldManager] Agentic systems: ${isGenerationGovernorEnabled() ? 'ENABLED' : 'DISABLED'} (pure engine mode)`);

        // Create terrain system (equivalent to StreamingWorld)
        this.terrain = new TerrainSystem(
            this.scene,
            this.seed,
            this.entityManager,
            config.chunkDistance || 3
        );

        // Load initial terrain chunks (pure engine - no governor)
        this.terrain.update(0, 0);

        // CRITICAL: Position player using DFU's PositionPlayerToLocation pattern
        const spawnPos = this.positionPlayerToLocation(0, 0);

        // Create player controller (PURE ENGINE - DFU PlayerMotor equivalent)
        // No Yuka - governors will control externally later
        this.player = new PlayerController(
            this.camera,
            this.terrain
        );

        // Position player ON GROUND at spawn location (DFU FixStanding pattern)
        this.player.fixStanding(spawnPos.x, spawnPos.z);

        // Create creature manager
        this.creatures = new CreatureManager(
            this.scene,
            this.entityManager,
            this.seed
        );

        this.isReady = true;
        console.log(`[WorldManager] Ready ✅`);
    }

    /**
     * Update all systems (DFU Update pattern)
     */
    update(delta: number): void {
        if (!this.isReady || this.isPaused) return;

        // Update player (movement, collision, camera)
        this.player.update(delta);

        // Update terrain streaming (based on player position) - pure engine
        const playerPos = this.player.getPosition();
        this.terrain.update(playerPos.x, playerPos.z);

        // Update creatures (governors decide behavior)
        this.creatures.update(delta);

        // Update all Yuka entities
        this.entityManager.update(delta);
    }

    /**
     * Get player position (for UI, etc.)
     */
    getPlayerPosition(): THREE.Vector3 {
        return this.player.getPosition();
    }

    /**
     * Pause/unpause
     */
    setPaused(paused: boolean): void {
        this.isPaused = paused;
    }

    /**
     * Position player to location (DFU StreamingWorld.PositionPlayerToLocation pattern)
     * 
     * Based on:
     * - Assets/Scripts/Terrain/StreamingWorld.cs:1470-1594
     * 
     * Spawns player OUTSIDE settlement edge on random side (N/S/E/W)
     * Not at center - avoids spawning inside buildings!
     */
    private positionPlayerToLocation(startX: number, startZ: number): THREE.Vector3 {
        // Find nearest settlement
        const settlement = this.terrain.getNearestSettlement(startX, startZ);

        if (!settlement) {
            // No settlement found - use SpawnGovernor to find safe flat terrain
            // Governor analyzes terrain physics (slope, height) instead of hardcoded coords
            console.log(`[WorldManager] No settlement found, using SpawnGovernor to find safe spawn near (${startX}, ${startZ})`);
            
            const spawnGovernor = new SpawnGovernor(this.seed);
            const safeSpawn = spawnGovernor.findSafeSpawn(
                startX,
                startZ,
                (x: number, z: number) => this.terrain.getTerrainHeight(x, z),
                200 // Search 200m radius
            );
            
            return safeSpawn || new THREE.Vector3(startX, this.terrain.getTerrainHeight(startX, startZ), startZ);
        }

        console.log(`[WorldManager] Positioning player near ${settlement.name} (${settlement.type})`);

        // Calculate settlement bounds based on type/population (DFU pattern)
        // DFU uses location block dimensions - we approximate from population
        const settlementSize = this.getSettlementSize(settlement);
        const halfWidth = settlementSize.width / 2;
        const halfHeight = settlementSize.height / 2;

        // Settlement center
        const centerX = settlement.position.x;
        const centerZ = settlement.position.z;

        // Pick random side (N/S/E/W) - DFU pattern
        // Use deterministic RNG from seed for consistency
        const sideRng = this.getDeterministicRNG(settlement.id);
        const side = Math.floor(sideRng.uniform(0, 4)); // 0=N, 1=S, 2=E, 3=W

        // Extra distance to place player outside settlement edge
        // DFU uses RMBLayout.RMBSide * 0.1f - we use 10% of settlement size
        const extraDistance = Math.max(10, settlementSize.width * 0.1);

        // Calculate spawn position based on side
        let spawnX = centerX;
        let spawnZ = centerZ;

        switch (side) {
            case 0: // North
                spawnZ = centerZ + halfHeight + extraDistance;
                break;
            case 1: // South
                spawnZ = centerZ - halfHeight - extraDistance;
                break;
            case 2: // East
                spawnX = centerX + halfWidth + extraDistance;
                break;
            case 3: // West
                spawnX = centerX - halfWidth - extraDistance;
                break;
        }

        // Get terrain height at spawn location (DFU pattern - player spawns ON terrain)
        const terrainHeight = this.terrain.getTerrainHeight(spawnX, spawnZ);

        console.log(`[WorldManager] Spawning on ${['North', 'South', 'East', 'West'][side]} side at (${spawnX.toFixed(0)}, ${spawnZ.toFixed(0)}), terrain height: ${terrainHeight.toFixed(2)}m`);

        return new THREE.Vector3(spawnX, terrainHeight, spawnZ);
    }

    /**
     * Get settlement size based on type and population (DFU approximation)
     */
    private getSettlementSize(settlement: any): { width: number; height: number } {
        // DFU settlements are typically square blocks
        // We approximate size from population/type
        let baseSize = 50; // meters

        switch (settlement.type) {
            case 'village':
                baseSize = 30 + (settlement.population / 50); // 30-40m
                break;
            case 'town':
                baseSize = 60 + (settlement.population / 100); // 60-110m
                break;
            case 'city':
                baseSize = 120 + (settlement.population / 200); // 120-170m
                break;
        }

        // DFU locations are typically square
        return { width: baseSize, height: baseSize };
    }

    /**
     * Get deterministic RNG for consistent random choices
     */
    private getDeterministicRNG(seed: string): any {
        // Simple seeded RNG for deterministic side selection
        let hash = 0;
        for (let i = 0; i < seed.length; i++) {
            hash = ((hash << 5) - hash) + seed.charCodeAt(i);
            hash = hash & hash;
        }

        let state = Math.abs(hash);
        return {
            uniform: (min: number, max: number) => {
                state = (state * 9301 + 49297) % 233280;
                const normalized = state / 233280;
                return min + normalized * (max - min);
            }
        };
    }
}

