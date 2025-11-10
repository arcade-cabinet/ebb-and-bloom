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
import { TerrainSystem } from './TerrainSystem';
import { PlayerController } from './PlayerController';
import { CreatureManager } from './CreatureManager';

export interface WorldConfig {
    seed: string;
    scene: THREE.Scene;
    camera: THREE.Camera;
    chunkDistance?: number; // Default: 3 (7x7 grid like DFU)
}

export class WorldManager {
    // Core systems
    terrain: TerrainSystem;
    player: PlayerController;
    creatures: CreatureManager;
    entityManager: EntityManager;
    
    // Scene
    scene: THREE.Scene;
    camera: THREE.Camera;
    seed: string;
    
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
        
        // Create terrain system (equivalent to StreamingWorld)
        this.terrain = new TerrainSystem(
            this.scene,
            this.seed,
            this.entityManager,
            config.chunkDistance || 3
        );
        
        // Load initial chunks
        this.terrain.update(0, 0);
        
        // CRITICAL: Find settlement to spawn in (like DFU)
        const startSettlement = this.terrain.getNearestSettlement(0, 0);
        
        let spawnX, spawnZ;
        if (startSettlement) {
            // Spawn in settlement center
            spawnX = startSettlement.position.x;
            spawnZ = startSettlement.position.z;
            console.log(`[WorldManager] Starting in ${startSettlement.name} (${startSettlement.type})`);
        } else {
            // Fallback to offset spawn (not origin!)
            spawnX = 50;
            spawnZ = 50;
            console.log('[WorldManager] No settlement found, spawning in wilderness at (50, 50)');
        }
        
        // Create player controller (equivalent to PlayerMotor)
        this.player = new PlayerController(
            this.camera,
            this.terrain,
            this.entityManager
        );
        
        // Position player ON GROUND at spawn location
        this.player.fixStanding(spawnX, spawnZ);
        
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
        
        // Update terrain streaming (based on player position)
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
}

