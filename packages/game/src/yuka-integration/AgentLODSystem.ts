/**
 * AGENT LOD (Level of Detail) SYSTEM
 * 
 * Just like visual LOD, but for SIMULATION:
 * - Close zoom = Spawn agents, real-time simulation
 * - Far zoom = Despawn agents, statistical advancement
 * - State persists in Zustand regardless of zoom
 * 
 * The KEY insight:
 * You don't need to SIMULATE every creature when viewing galaxies.
 * Use statistics to advance state, spawn agents when zooming in.
 */

import { Vehicle, Vector3 } from 'yuka';
import { create } from 'zustand';
import { AgentSpawner, AgentType } from './AgentSpawner';
import { LEGAL_BROKER } from '../laws/core/LegalBroker';
import { UniverseState } from '../laws/core/UniversalLawCoordinator';

/**
 * Simulation scale (determines which agents are active)
 */
export enum SimulationScale {
  COSMIC = 'cosmic',       // 10^9 ly - No agents, pure statistics
  GALACTIC = 'galactic',   // 10^5 ly - Galactic agents only
  STELLAR = 'stellar',     // 10^2 AU - Stellar + Planetary agents
  PLANETARY = 'planetary', // 10^3 km - All agents including creatures
}

/**
 * Persisted state for a region (stored in Zustand)
 */
export interface RegionState {
  // Identity
  seed: string;
  lastUpdateTime: number; // When was this last simulated?
  
  // Cosmos
  atoms: Map<string, number>;
  molecules: Map<string, number>;
  
  // Objects
  stars: any[];
  planets: any[];
  
  // Life
  species: any[];
  populations: Map<string, number>; // species → population count
  
  // Society
  groups: any[];
  technologies: any[];
  
  // Complexity
  complexity: number;
  activity: number;
}

/**
 * Zustand store for universe state
 */
interface UniverseStore {
  regions: Map<string, RegionState>;
  currentScale: SimulationScale;
  currentTime: number;
  
  // Actions
  saveRegion: (key: string, state: RegionState) => void;
  loadRegion: (key: string) => RegionState | undefined;
  setScale: (scale: SimulationScale) => void;
  advanceTime: (dt: number) => void;
}

export const useUniverseStore = create<UniverseStore>((set, get) => ({
  regions: new Map(),
  currentScale: SimulationScale.COSMIC,
  currentTime: 0,
  
  saveRegion: (key, state) => {
    const regions = new Map(get().regions);
    regions.set(key, state);
    set({ regions });
  },
  
  loadRegion: (key) => {
    return get().regions.get(key);
  },
  
  setScale: (scale) => set({ currentScale: scale }),
  
  advanceTime: (dt) => set((state) => ({
    currentTime: state.currentTime + dt,
  })),
}));

/**
 * Agent LOD System
 * 
 * Manages agent spawning/despawning based on zoom level.
 * Advances time using statistics when agents not needed.
 */
export class AgentLODSystem {
  private spawner: AgentSpawner;
  private currentScale: SimulationScale;
  private activeAgents: Map<string, Vehicle[]>; // regionKey → agents
  
  constructor() {
    this.spawner = new AgentSpawner();
    this.currentScale = SimulationScale.COSMIC;
    this.activeAgents = new Map();
    
    console.log('[AgentLODSystem] Initialized');
  }
  
  /**
   * Change simulation scale (triggers spawn/despawn)
   */
  async setScale(newScale: SimulationScale, focusRegion?: string): Promise<void> {
    console.log(`[AgentLODSystem] Scale change: ${this.currentScale} → ${newScale}`);
    
    if (newScale === this.currentScale) {
      return; // No change
    }
    
    const oldScale = this.currentScale;
    this.currentScale = newScale;
    
    // Save state of currently active regions
    await this.saveActiveRegions();
    
    // Despawn agents from old scale
    await this.despawnAgents(oldScale);
    
    // Spawn agents for new scale
    if (focusRegion) {
      await this.spawnAgentsForRegion(focusRegion, newScale);
    }
    
    // Update Zustand
    useUniverseStore.getState().setScale(newScale);
    
    console.log(`  Active agents: ${this.getActiveAgentCount()}`);
  }
  
  /**
   * Save state of all active regions to Zustand
   */
  private async saveActiveRegions(): Promise<void> {
    for (const [regionKey, agents] of this.activeAgents) {
      const state = await this.extractStateFromAgents(regionKey, agents);
      useUniverseStore.getState().saveRegion(regionKey, state);
      console.log(`  💾 Saved state for region: ${regionKey}`);
    }
  }
  
  /**
   * Extract state from running agents (before despawning)
   */
  private async extractStateFromAgents(regionKey: string, agents: Vehicle[]): Promise<RegionState> {
    // Aggregate agent states into region state
    const populations = new Map<string, number>();
    const species: any[] = [];
    
    // Group by species and count
    const speciesMap = new Map<string, any[]>();
    for (const agent of agents) {
      const speciesName = (agent as any)['species'] || 'Unknown';
      if (!speciesMap.has(speciesName)) {
        speciesMap.set(speciesName, []);
      }
      speciesMap.get(speciesName)!.push(agent);
    }
    
    for (const [speciesName, members] of speciesMap) {
      populations.set(speciesName, members.length);
      
      // Store representative for species
      if (members.length > 0) {
        species.push({
          scientificName: speciesName,
          population: members.length,
          mass: (members[0] as any)['mass'] || 50,
          // ... extract other properties
        });
      }
    }
    
    // Calculate complexity based on what exists in region
    const complexity = this.calculateComplexity(species, Array.from(populations.entries()));
    
    // Extract atomic/molecular composition
    const { atoms, molecules } = this.extractChemistry(regionKey);
    
    return {
      seed: regionKey,
      lastUpdateTime: useUniverseStore.getState().currentTime,
      atoms,           // Keep as Map
      molecules,       // Keep as Map
      stars: [],       // Stars tracked separately in agent system
      planets: [],     // Planets tracked separately in agent system
      species,
      populations,     // Keep as Map
      groups: [],
      technologies: [],
      complexity,
      activity: populations.size > 0 ? 8 : 2, // Active if life exists
    };
  }
  
  /**
   * Despawn all agents from a scale
   */
  private async despawnAgents(scale: SimulationScale): Promise<void> {
    const agentTypes = this.getAgentTypesForScale(scale);
    
    for (const type of agentTypes) {
      const manager = this.spawner.getManager(type);
      if (manager) {
        const count = manager.entities.length;
        manager.clear();
        console.log(`  🗑️  Despawned ${count} ${type} agents`);
      }
    }
    
    this.activeAgents.clear();
  }
  
  /**
   * Spawn agents for a region at given scale
   */
  private async spawnAgentsForRegion(regionKey: string, scale: SimulationScale): Promise<void> {
    console.log(`[AgentLODSystem] Spawning agents for ${regionKey} at ${scale} scale`);
    
    // Load state from Zustand (if exists)
    const savedState = useUniverseStore.getState().loadRegion(regionKey);
    
    if (!savedState) {
      console.log(`  No saved state, starting fresh`);
      return;
    }
    
    // Spawn agents based on scale
    const agentTypes = this.getAgentTypesForScale(scale);
    const agents: Vehicle[] = [];
    
    for (const type of agentTypes) {
      const spawnedAgents = await this.spawnAgentsOfType(type, savedState);
      agents.push(...spawnedAgents);
    }
    
    this.activeAgents.set(regionKey, agents);
    console.log(`  ✅ Spawned ${agents.length} agents`);
  }
  
  /**
   * Spawn agents of specific type from saved state
   */
  private async spawnAgentsOfType(type: AgentType, state: RegionState): Promise<Vehicle[]> {
    const agents: Vehicle[] = [];
    
    // Example: Spawn creature agents from saved populations
    if (type === AgentType.CREATURE && state.species.length > 0) {
      for (const species of state.species) {
        const populationSize = state.populations.get(species.scientificName) || 0;
        
        // Don't spawn ALL creatures (would be thousands!)
        // Spawn representative sample (max 100 agents per species)
        const agentsToSpawn = Math.min(populationSize, 100);
        
        for (let i = 0; i < agentsToSpawn; i++) {
          const result = await this.spawner.spawn({
            type: AgentType.CREATURE,
            position: this.randomPositionInRegion(),
            reason: `Creature from species ${species.scientificName}`,
            state: this.createUniverseStateFromRegion(state),
            params: {
              species: species.scientificName,
              mass: species.mass,
            },
          });
          
          if (result.success && result.agent) {
            agents.push(result.agent);
          }
        }
      }
    }
    
    return agents;
  }
  
  /**
   * Advance time statistically (when zoomed out, no agents running)
   */
  async advanceTimeAnalytically(dt: number, regionKey: string): Promise<void> {
    console.log(`[AgentLODSystem] Advancing ${regionKey} by ${dt} seconds (analytically)`);
    
    const state = useUniverseStore.getState().loadRegion(regionKey);
    if (!state) return;
    
    // Ask legal broker how to advance state without simulation
    const response = await LEGAL_BROKER.ask({
      domain: 'ecology',
      action: 'advance-population-analytically',
      params: {
        populations: Object.fromEntries(state.populations),
        deltaTime: dt,
      },
      state: this.createUniverseStateFromRegion(state),
    });
    
    // Update populations based on analytical solution
    if (response.value) {
      const newPopulations = response.value;
      for (const [species, pop] of Object.entries(newPopulations)) {
        state.populations.set(species, pop as number);
      }
      
      state.lastUpdateTime += dt;
      useUniverseStore.getState().saveRegion(regionKey, state);
      
      console.log(`  ✅ State advanced analytically`);
    }
  }
  
  /**
   * Get agent types that should be active at a scale
   */
  private getAgentTypesForScale(scale: SimulationScale): AgentType[] {
    switch (scale) {
      case SimulationScale.COSMIC:
        return []; // No agents at cosmic scale
      case SimulationScale.GALACTIC:
        return [AgentType.GALACTIC];
      case SimulationScale.STELLAR:
        return [AgentType.GALACTIC, AgentType.STELLAR, AgentType.PLANETARY];
      case SimulationScale.PLANETARY:
        return [AgentType.STELLAR, AgentType.PLANETARY, AgentType.BIOSPHERE, AgentType.CREATURE];
      default:
        return [];
    }
  }
  
  /**
   * Calculate complexity level from region contents
   */
  private calculateComplexity(species: any[], populations: Array<[string, number]>): number {
    // Complexity levels:
    // 0 = Void, 1 = Particles, 2 = Atoms, 3 = Molecules
    // 4 = Life, 5 = Multicellular, 6 = Cognitive, 7 = Social, 8 = Technological
    
    if (species.length === 0) {
      return 3; // Molecules (no life)
    }
    
    if (populations.length === 0) {
      return 4; // Life exists but no populations yet
    }
    
    // Check for social structures
    const hasSocialGroups = populations.some(([_, count]) => count > 10);
    if (hasSocialGroups) {
      return 7; // Social
    }
    
    // Check for cognitive abilities (brain mass heuristic)
    const hasCognition = species.some(s => s.mass > 50); // 50kg+
    if (hasCognition) {
      return 6; // Cognitive
    }
    
    // Check for multicellular life
    const hasMulticellular = species.some(s => s.mass > 0.001); // > 1g
    if (hasMulticellular) {
      return 5; // Multicellular
    }
    
    return 4; // Single-celled life
  }
  
  /**
   * Extract atomic and molecular composition of region
   */
  private extractChemistry(regionKey: string): {
    atoms: Map<string, number>;
    molecules: Map<string, number>;
  } {
    const atoms = new Map<string, number>();
    const molecules = new Map<string, number>();
    
    // Default cosmic abundances (by mass)
    atoms.set('H', 0.74);   // Hydrogen (most abundant)
    atoms.set('He', 0.24);  // Helium
    atoms.set('O', 0.01);   // Oxygen
    atoms.set('C', 0.005);  // Carbon
    atoms.set('N', 0.001);  // Nitrogen
    atoms.set('Fe', 0.001); // Iron
    
    // Common molecules in space
    molecules.set('H2', 0.5);    // Molecular hydrogen
    molecules.set('H2O', 0.01);  // Water (if conditions allow)
    molecules.set('CO', 0.005);  // Carbon monoxide
    molecules.set('CO2', 0.003); // Carbon dioxide
    molecules.set('CH4', 0.001); // Methane
    
    return { atoms, molecules };
  }
  
  private randomPositionInRegion(): Vector3 {
    // Random position within region (±50 units from center)
    const range = 50;
    return new Vector3(
      (Math.random() - 0.5) * range * 2,
      (Math.random() - 0.5) * range * 2,
      (Math.random() - 0.5) * range * 2
    );
  }
  
  private createUniverseStateFromRegion(state: RegionState): UniverseState {
    // Convert RegionState to UniverseState
    const universeStore = useUniverseStore.getState();
    
    return {
      t: universeStore.currentTime,
      localTime: 0,
      temperature: 2.725, // CMB temperature (K)
      pressure: 1e-15,
      density: 1e-21,
      complexity: state.complexity,
      elements: { H: 0.74, He: 0.24, O: 0.01 },
      hasLife: state.complexity >= 4,
      hasCognition: state.complexity >= 6,
      hasSociety: state.complexity >= 7,
      hasTechnology: state.complexity >= 8,
    };
  }
  
  /**
   * Update active agents
   */
  update(delta: number): void {
    this.spawner.update(delta);
  }
  
  /**
   * Get count of active agents across all scales
   */
  getActiveAgentCount(): number {
    return this.spawner.getAgentCount();
  }
}

/**
 * USAGE:
 * 
 * const lodSystem = new AgentLODSystem();
 * 
 * // User viewing cosmos (no agents needed)
 * lodSystem.setScale(SimulationScale.COSMIC);
 * 
 * // Advance time by 1 billion years (analytically!)
 * for (const regionKey of visibleRegions) {
 *   await lodSystem.advanceTimeAnalytically(1e9 * YEAR, regionKey);
 * }
 * 
 * // User zooms into a star system
 * lodSystem.setScale(SimulationScale.STELLAR, 'region-123');
 * // → Spawns stellar agents, planetary agents
 * 
 * // User zooms into planet surface
 * lodSystem.setScale(SimulationScale.PLANETARY, 'region-123');
 * // → Loads populations from Zustand
 * // → Spawns creature agents (representative sample)
 * // → NOW running real Yuka simulation
 * 
 * // User zooms back out
 * lodSystem.setScale(SimulationScale.STELLAR, 'region-123');
 * // → Saves creature states to Zustand
 * // → Despawns all creature agents
 * // → Back to analytical advancement
 * 
 * // 1 million years pass while user explores galaxy
 * lodSystem.advanceTimeAnalytically(1e6 * YEAR, 'region-123');
 * // → Uses Lotka-Volterra equations
 * // → No agents running
 * // → Populations evolved analytically
 * // → State saved
 * 
 * // User zooms back in
 * lodSystem.setScale(SimulationScale.PLANETARY, 'region-123');
 * // → Loads NEW populations (evolved during absence)
 * // → Spawns agents with updated stats
 * // → Resume simulation from new state
 */
