/**
 * UNIVERSE MARKERS STORE
 * 
 * Stores WHERE structures formed during universe expansion.
 * 
 * BOTTOM-UP HIERARCHY:
 * - EntropyAgent marks when/where structures can form
 * - Markers stored in this Zustand-like store
 * - When zoom in → load markers → spawn agents at those locations
 * - When zoom out → save state → despawn agents
 */

import { Vector3 } from 'yuka';

/**
 * Structure marker types
 */
export type MarkerType = 
  | 'stellar-epoch'      // First stars formed here
  | 'galactic-center'    // Galaxy heart location
  | 'planetary-system'   // Planetary system location
  | 'life-emergence';    // Life appeared here

/**
 * Structure marker
 */
export interface StructureMarker {
  type: MarkerType;
  scale: number;          // Universe scale when it formed (a(t))
  position: Vector3;      // Position in comoving coordinates
  timestamp: number;      // Age of universe when marked (seconds)
  metadata: any;          // Type-specific data (temperature, density, etc.)
}

/**
 * Saved state for a region (when zoomed out)
 */
export interface RegionState {
  markerId: string;       // Which marker this state belongs to
  agentStates: any[];     // Serialized agent states
  lastUpdated: number;    // When this was saved
}

/**
 * Universe Markers Store
 * 
 * Simple in-memory store (could be backed by Zustand or IndexedDB later)
 */
export class UniverseMarkerStore {
  private markers: Map<string, StructureMarker> = new Map();
  private states: Map<string, RegionState> = new Map();
  
  constructor() {
    console.log('[UniverseMarkerStore] Initialized');
  }
  
  /**
   * Add a marker
   * 
   * EntropyAgent calls this as universe expands
   */
  addMarker(type: MarkerType, scale: number, position: Vector3, timestamp: number, metadata?: any): string {
    const id = `${type}-${timestamp.toFixed(0)}-${position.x.toFixed(0)},${position.y.toFixed(0)},${position.z.toFixed(0)}`;
    
    const marker: StructureMarker = {
      type,
      scale,
      position,
      timestamp,
      metadata: metadata || {},
    };
    
    this.markers.set(id, marker);
    
    console.log(`[UniverseMarkerStore] 📍 Marker added: ${type} at scale ${scale.toExponential(2)}x`);
    
    return id;
  }
  
  /**
   * Get markers at a specific scale
   * 
   * Scene calls this when zooming to a scale
   */
  getMarkersAtScale(scale: number, tolerance: number = 0.1): StructureMarker[] {
    const results: StructureMarker[] = [];
    
    for (const marker of this.markers.values()) {
      // Check if marker scale is within tolerance of target scale
      const scaleDiff = Math.abs(marker.scale - scale) / scale;
      if (scaleDiff < tolerance) {
        results.push(marker);
      }
    }
    
    return results;
  }
  
  /**
   * Get all markers of a type
   */
  getMarkersByType(type: MarkerType): StructureMarker[] {
    return Array.from(this.markers.values()).filter(m => m.type === type);
  }
  
  /**
   * Get marker by ID
   */
  getMarker(id: string): StructureMarker | undefined {
    return this.markers.get(id);
  }
  
  /**
   * Save state for a region
   * 
   * Called when zooming OUT (despawn agents, save state)
   */
  saveRegionState(markerId: string, agentStates: any[], timestamp: number): void {
    const state: RegionState = {
      markerId,
      agentStates,
      lastUpdated: timestamp,
    };
    
    this.states.set(markerId, state);
    
    console.log(`[UniverseMarkerStore] 💾 State saved for marker ${markerId} (${agentStates.length} agents)`);
  }
  
  /**
   * Load state for a region
   * 
   * Called when zooming IN (spawn agents from saved state)
   */
  loadRegionState(markerId: string): RegionState | undefined {
    const state = this.states.get(markerId);
    
    if (state) {
      console.log(`[UniverseMarkerStore] 📂 State loaded for marker ${markerId} (${state.agentStates.length} agents)`);
    }
    
    return state;
  }
  
  /**
   * Check if region has saved state
   */
  hasState(markerId: string): boolean {
    return this.states.has(markerId);
  }
  
  /**
   * Get markers near a point (for zoom-based spawning)
   * 
   * @param point - Focus point (camera target)
   * @param scale - Physical scale to search at (meters)
   * @param radius - Search radius (meters)
   */
  getMarkersNearPoint(point: Vector3, scale: number, radius: number): Array<{ id: string; marker: StructureMarker; distance: number }> {
    const results: Array<{ id: string; marker: StructureMarker; distance: number }> = [];
    
    for (const [id, marker] of this.markers.entries()) {
      // Calculate distance
      const distance = marker.position.distanceTo(point);
      
      // Check if within radius
      if (distance <= radius) {
        results.push({ id, marker, distance });
      }
    }
    
    // Sort by distance (closest first)
    results.sort((a, b) => a.distance - b.distance);
    
    return results;
  }
  
  /**
   * Find nearest marker of a type
   * 
   * @param point - Search origin
   * @param type - Marker type (optional)
   */
  findNearestMarker(point: Vector3, type?: MarkerType): { id: string; marker: StructureMarker; distance: number } | null {
    let nearest: { id: string; marker: StructureMarker; distance: number } | null = null;
    let minDistance = Infinity;
    
    for (const [id, marker] of this.markers.entries()) {
      // Filter by type if specified
      if (type && marker.type !== type) continue;
      
      const distance = marker.position.distanceTo(point);
      
      if (distance < minDistance) {
        minDistance = distance;
        nearest = { id, marker, distance };
      }
    }
    
    return nearest;
  }
  
  /**
   * Get all markers (for analytical advancement)
   */
  getAllMarkers(): Map<string, StructureMarker> {
    return new Map(this.markers);
  }
  
  /**
   * Clear all markers (for testing)
   */
  clear(): void {
    this.markers.clear();
    this.states.clear();
    console.log('[UniverseMarkerStore] Cleared all markers and states');
  }
  
  /**
   * Get statistics
   */
  getStats(): {
    markerCount: number;
    stateCount: number;
    markersByType: Record<string, number>;
  } {
    const markersByType: Record<string, number> = {};
    
    for (const marker of this.markers.values()) {
      markersByType[marker.type] = (markersByType[marker.type] || 0) + 1;
    }
    
    return {
      markerCount: this.markers.size,
      stateCount: this.states.size,
      markersByType,
    };
  }
}

// Global singleton
export const MARKER_STORE = new UniverseMarkerStore();

/**
 * USAGE:
 * 
 * // EntropyAgent (during expansion)
 * if (age > 100e6 * YEAR && !spawnedStellarEpoch) {
 *   const markerId = MARKER_STORE.addMarker(
 *     'stellar-epoch',
 *     this.scale,
 *     Vector3.Zero(),
 *     this.age,
 *     { temperature: this.temperature, density: this.density }
 *   );
 *   
 *   this.spawnedStellarEpoch = true;
 * }
 * 
 * // UniverseScene (when zooming)
 * const currentScale = calculateScale(cameraDistance);
 * const markers = MARKER_STORE.getMarkersAtScale(currentScale);
 * 
 * for (const marker of markers) {
 *   if (marker.type === 'stellar-epoch') {
 *     // Check if we've been here before
 *     if (MARKER_STORE.hasState(markerId)) {
 *       // Load saved state
 *       const state = MARKER_STORE.loadRegionState(markerId);
 *       // Spawn agents from state
 *     } else {
 *       // First time here - calculate probabilistically
 *       const timeSinceMarker = currentAge - marker.timestamp;
 *       // What WOULD have formed in that time?
 *       spawnGalaxyAgent(marker.position, timeSinceMarker);
 *     }
 *   }
 * }
 * 
 * // When zooming OUT
 * const agentStates = serializeAgents(agents);
 * MARKER_STORE.saveRegionState(markerId, agentStates, currentAge);
 * // Then despawn agents
 */

