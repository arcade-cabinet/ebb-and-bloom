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
    ): THREE.Vector3 {
        // NO FALLBACKS - governors use laws to find solutions, not arbitrary defaults
        // Progressive expansion: ideal → acceptable → any stable ground
        
        // DETERMINISTIC SAMPLING: Use seeded RNG to derive spiral pattern order
        const sampleCount = 32;
        const angleStep = (2 * Math.PI) / sampleCount;
        const angleOffset = this.rng.uniform(0, 2 * Math.PI);
        
        // Generate deterministic sampling order
        const sampleIndices: number[] = [];
        for (let i = 0; i < sampleCount; i++) {
            sampleIndices.push(i);
        }
        this.rng.shuffle(sampleIndices);
        
        // Strategy 1: Search for IDEAL spawn (slope <10°, flat 5m radius)
        let candidates = this.searchWithCriteria(
            startX, startZ, searchRadius, sampleIndices, angleOffset, angleStep,
            getHeight, 10, 5.0
        );
        
        if (candidates.length > 0) {
            return this.selectBestCandidate(candidates, 'ideal');
        }
        
        // Strategy 2: Expand radius, relax flatness (slope <20°, flat 3m radius)
        candidates = this.searchWithCriteria(
            startX, startZ, searchRadius * 2, sampleIndices, angleOffset, angleStep,
            getHeight, 20, 3.0
        );
        
        if (candidates.length > 0) {
            return this.selectBestCandidate(candidates, 'acceptable');
        }
        
        // Strategy 3: ANY stable ground (slope <30°, flat 1m radius)
        // This will find something unless terrain is extreme cliffs everywhere
        candidates = this.searchWithCriteria(
            startX, startZ, searchRadius * 4, sampleIndices, angleOffset, angleStep,
            getHeight, 30, 1.0
        );
        
        if (candidates.length > 0) {
            return this.selectBestCandidate(candidates, 'minimal');
        }
        
        // Strategy 4: PHYSICS ABSOLUTE MINIMUM - find the flattest spot within 1000m
        // Accept ANY slope, just find the least steep location
        const allCandidates: SpawnCandidate[] = [];
        const wideRadius = 1000;
        
        for (let ring = 1; ring <= 10; ring++) {
            const radius = ring * (wideRadius / 10);
            for (const i of sampleIndices) {
                const angle = angleOffset + i * angleStep;
                const x = startX + Math.cos(angle) * radius;
                const z = startZ + Math.sin(angle) * radius;
                
                const candidate = this.evaluateSpawnPoint(x, z, getHeight, 90, 0); // No constraints
                allCandidates.push(candidate);
            }
        }
        
        // Return flattest location found (deterministic sorting)
        return this.selectBestCandidate(allCandidates, 'emergency');
    }
    
    /**
     * Search for spawn points matching specific physics criteria
     */
    private searchWithCriteria(
        startX: number, startZ: number, searchRadius: number,
        sampleIndices: number[], angleOffset: number, angleStep: number,
        getHeight: (x: number, z: number) => number,
        maxSlope: number, flatRadius: number
    ): SpawnCandidate[] {
        const candidates: SpawnCandidate[] = [];
        
        for (let ring = 1; ring <= 5; ring++) {
            const radius = ring * (searchRadius / 5);
            
            for (const i of sampleIndices) {
                const angle = angleOffset + i * angleStep;
                const x = startX + Math.cos(angle) * radius;
                const z = startZ + Math.sin(angle) * radius;
                
                const candidate = this.evaluateSpawnPoint(x, z, getHeight, maxSlope, flatRadius);
                if (candidate.suitability > 0.5) {
                    candidates.push(candidate);
                }
            }
            
            if (candidates.length > 0) break;
        }
        
        return candidates;
    }
    
    /**
     * Select best candidate using deterministic physics-based sorting
     */
    private selectBestCandidate(candidates: SpawnCandidate[], quality: string): THREE.Vector3 {
        // Sort by suitability, then deterministic tie-breaking
        candidates.sort((a, b) => {
            const suitDiff = b.suitability - a.suitability;
            if (Math.abs(suitDiff) > 0.001) {
                return suitDiff;
            }
            const hashA = (a.position.x * 73856093) ^ (a.position.z * 19349663);
            const hashB = (b.position.x * 73856093) ^ (b.position.z * 19349663);
            return hashA - hashB;
        });
        
        const best = candidates[0];
        console.log(`[SpawnGovernor] Found ${quality} spawn at (${best.position.x.toFixed(0)}, ${best.position.z.toFixed(0)}), slope: ${best.slope.toFixed(1)}°, suitability: ${best.suitability.toFixed(2)}`);
        
        return best.position;
    }
    
    /**
     * Evaluate spawn point suitability using physics laws
     * 
     * @param x X coordinate
     * @param z Z coordinate  
     * @param getHeight Terrain height query
     * @param maxSlope Maximum acceptable slope (degrees)
     * @param flatRadius Required flat area radius (meters)
     * @returns Spawn candidate with suitability score (0-1)
     */
    private evaluateSpawnPoint(
        x: number,
        z: number,
        getHeight: (x: number, z: number) => number,
        maxSlope: number,
        flatRadius: number
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
        if (flatRadius > 0) {
            for (let dx = -flatRadius; dx <= flatRadius; dx += 2) {
                for (let dz = -flatRadius; dz <= flatRadius; dz += 2) {
                    const localHeight = getHeight(x + dx, z + dz);
                    if (Math.abs(localHeight - height) > 2.0) {
                        flatArea = false;
                        break;
                    }
                }
                if (!flatArea) break;
            }
        }
        
        // Suitability scoring (physics-based criteria)
        let suitability = 1.0;
        
        // Slope penalty (physics: graduated penalty based on maxSlope parameter)
        if (slopeDegrees > maxSlope) {
            suitability *= 0.1; // Exceeds maximum slope
        } else if (slopeDegrees > maxSlope * 0.5) {
            suitability *= 0.7; // Moderate slope
        }
        
        // Height penalty (physics: avoid water, avoid extreme heights)
        if (height < 5) {
            suitability *= 0.3; // Probably in water
        } else if (height > 1000) {
            suitability *= 0.5; // Extremely high terrain
        }
        
        // Flat area bonus (physics: stable platform)
        if (flatArea && flatRadius > 0) {
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
