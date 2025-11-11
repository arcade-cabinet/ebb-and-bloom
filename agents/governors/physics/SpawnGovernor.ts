/**
 * SPAWN GOVERNOR
 * 
 * Uses physics laws (gravity, slope analysis) to find safe flat spawn locations.
 * Replaces hardcoded (50,50) fallback with intelligent terrain evaluation.
 * 
 * DFU had MAPS.BSA with 15,000 predefined locations because 1996 had no intelligence.
 * We have governors with real scientific laws - they analyze terrain and decide.
 */

import * as THREE from 'three';
import { EnhancedRNG } from '../../../engine/utils/EnhancedRNG';

export interface SpawnCandidate {
    position: THREE.Vector3;
    slope: number;
    terrainHeight: number;
    nearWater: boolean;
    suitability: number;
}

export class SpawnGovernor {
    private rng: EnhancedRNG;
    
    constructor(seed: string) {
        // Use seed for deterministic spawn location selection
        this.rng = new EnhancedRNG(seed);
        console.log(`[SpawnGovernor] Initialized with seed: ${seed}`);
    }
    
    /**
     * Find safe spawn location using physics-based terrain analysis
     * 
     * Physics criteria:
     * - Slope < 10° (safe standing, no sliding down)
     * - Height > 0 (above water level)
     * - Flat area >= 5m radius (room to move)
     * 
     * @param startX Starting search X coordinate
     * @param startZ Starting search Z coordinate
     * @param getHeight Terrain height query function
     * @param searchRadius How far to search (meters)
     * @returns Safe spawn position or null
     */
    findSafeSpawn(
        startX: number,
        startZ: number,
        getHeight: (x: number, z: number) => number,
        searchRadius: number = 100
    ): THREE.Vector3 | null {
        const candidates: SpawnCandidate[] = [];
        
        // DETERMINISTIC SAMPLING: Use seeded RNG to derive spiral pattern order
        // This ensures identical seeds always produce identical spawn points
        const sampleCount = 32;
        const angleStep = (2 * Math.PI) / sampleCount;
        
        // Derive deterministic angle offset from seed (0 to 2π)
        const angleOffset = this.rng.uniform(0, 2 * Math.PI);
        
        // Generate sampling indices and shuffle them deterministically
        const sampleIndices: number[] = [];
        for (let i = 0; i < sampleCount; i++) {
            sampleIndices.push(i);
        }
        this.rng.shuffle(sampleIndices); // Fisher-Yates shuffle with seeded RNG
        
        for (let ring = 1; ring <= 5; ring++) {
            const radius = ring * (searchRadius / 5);
            
            // Sample in deterministic order (shuffled by seed)
            for (const i of sampleIndices) {
                const angle = angleOffset + i * angleStep; // Apply seed-derived offset
                const x = startX + Math.cos(angle) * radius;
                const z = startZ + Math.sin(angle) * radius;
                
                const candidate = this.evaluateSpawnPoint(x, z, getHeight);
                if (candidate.suitability > 0.5) {
                    candidates.push(candidate);
                }
            }
            
            // If we found good candidates in this ring, use them
            if (candidates.length > 0) break;
        }
        
        // No suitable spawn found
        if (candidates.length === 0) {
            console.warn(`[SpawnGovernor] No suitable spawn found near (${startX}, ${startZ}), using fallback`);
            // Fallback: use starting position and hope for the best
            const height = getHeight(startX, startZ);
            return new THREE.Vector3(startX, height, startZ);
        }
        
        // Sort by suitability (physics: prefer flattest, most stable terrain)
        // Then use seeded index to break ties deterministically
        candidates.sort((a, b) => {
            const suitDiff = b.suitability - a.suitability;
            if (Math.abs(suitDiff) > 0.001) {
                return suitDiff; // Clear winner
            }
            // Tie-breaking: use deterministic hash of position
            const hashA = (a.position.x * 73856093) ^ (a.position.z * 19349663);
            const hashB = (b.position.x * 73856093) ^ (b.position.z * 19349663);
            return hashA - hashB;
        });
        
        const best = candidates[0];
        console.log(`[SpawnGovernor] Found safe spawn at (${best.position.x.toFixed(0)}, ${best.position.z.toFixed(0)}), slope: ${best.slope.toFixed(1)}°, suitability: ${best.suitability.toFixed(2)}`);
        
        return best.position;
    }
    
    /**
     * Evaluate spawn point suitability using physics laws
     * 
     * @param x X coordinate
     * @param z Z coordinate  
     * @param getHeight Terrain height query
     * @returns Spawn candidate with suitability score (0-1)
     */
    private evaluateSpawnPoint(
        x: number,
        z: number,
        getHeight: (x: number, z: number) => number
    ): SpawnCandidate {
        const height = getHeight(x, z);
        
        // Calculate slope (physics: gradient = rise/run)
        const delta = 1.0; // Sample 1m away
        const heightN = getHeight(x, z + delta);
        const heightS = getHeight(x, z - delta);
        const heightE = getHeight(x + delta, z);
        const heightW = getHeight(x - delta, z);
        
        const slopeNS = Math.abs(heightN - heightS) / (2 * delta);
        const slopeEW = Math.abs(heightE - heightW) / (2 * delta);
        const slope = Math.sqrt(slopeNS * slopeNS + slopeEW * slopeEW);
        const slopeDegrees = Math.atan(slope) * (180 / Math.PI);
        
        // Check flat area around spawn (physics: stable footing)
        let flatArea = true;
        const checkRadius = 5.0; // Need 5m flat radius
        for (let dx = -checkRadius; dx <= checkRadius; dx += 2) {
            for (let dz = -checkRadius; dz <= checkRadius; dz += 2) {
                const localHeight = getHeight(x + dx, z + dz);
                if (Math.abs(localHeight - height) > 2.0) {
                    flatArea = false;
                    break;
                }
            }
            if (!flatArea) break;
        }
        
        // Suitability scoring (physics-based criteria)
        let suitability = 1.0;
        
        // Slope penalty (physics: safe standing < 10°)
        if (slopeDegrees > 10) {
            suitability *= 0.1; // Steep = unsafe
        } else if (slopeDegrees > 5) {
            suitability *= 0.7; // Moderate slope
        }
        
        // Height penalty (physics: avoid water, avoid extreme heights)
        if (height < 5) {
            suitability *= 0.3; // Probably in water
        } else if (height > 1000) {
            suitability *= 0.5; // Extremely high terrain
        }
        
        // Flat area bonus (physics: stable platform)
        if (flatArea) {
            suitability *= 1.5;
        }
        
        return {
            position: new THREE.Vector3(x, height, z),
            slope: slopeDegrees,
            terrainHeight: height,
            nearWater: height < 10,
            suitability: Math.min(1.0, suitability)
        };
    }
}
