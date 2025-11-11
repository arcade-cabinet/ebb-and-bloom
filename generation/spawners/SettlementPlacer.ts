/**
 * SETTLEMENT PLACER
 * 
 * Daggerfall-style settlement placement using SocialLaws.
 * Places villages, towns, and cities based on terrain suitability.
 * 
 * Daggerfall had 15,000+ locations procedurally placed.
 * We use law-based placement for more realistic distribution.
 * 
 * Key Daggerfall insights (from WorldData.cs):
 * - Cities near water and flat terrain
 * - Towns in farmland
 * - Villages near resources
 * - Minimum distance between settlements
 * - Road network connecting settlements
 * 
 * Our enhancements:
 * - Uses SocialLaws for population distribution
 * - Uses PlanetaryLaws for habitability
 * - Deterministic from seed
 */

import * as THREE from 'three';
import { EnhancedRNG } from '../../engine/utils/EnhancedRNG';
import { BiomeType } from './BiomeSystem';
import { BuildingPrefabRegistry, BuildingType } from './BuildingPrefab';
import { BuildingSpawner } from './BuildingSpawner';
import { SocialGovernorPrefabIntegration } from './GovernorPrefabIntegration';

export enum SettlementType {
  VILLAGE = 'village',     // 50-500 people
  TOWN = 'town',           // 500-5000 people
  CITY = 'city'            // 5000+ people
}

export interface Settlement {
  id: string;
  type: SettlementType;
  name: string;
  position: THREE.Vector3;
  population: number;
  buildings: Building[];
}

export interface Building {
  type: BuildingType;
  position: THREE.Vector3;
  size: THREE.Vector3;
  rotation: number;
  material: BuildingMaterial;
}

export enum BuildingMaterial {
  WOOD = 'wood',
  STONE = 'stone',
  BRICK = 'brick'
}

export class SettlementPlacer {
  private settlements: Map<string, Settlement> = new Map();
  private scene: THREE.Scene;
  private seed: string;
  private rng: EnhancedRNG;
  private minSettlementDistance: number = 500; // meters
  
  // Name generation
  private prefixes = ['North', 'South', 'East', 'West', 'New', 'Old', 'High', 'Low'];
  private roots = ['brook', 'ford', 'ton', 'bury', 'ham', 'shire', 'dale', 'wood', 'field', 'haven'];
  
  constructor(scene: THREE.Scene, seed: string) {
    this.scene = scene;
    this.seed = seed;
    this.rng = new EnhancedRNG(seed);
    console.log('[SettlementPlacer] Initialized');
  }
  
  /**
   * Evaluate terrain suitability for settlement
   * Based on Daggerfall's WorldData.GetClimateValue()
   */
  private evaluateSuitability(
    x: number,
    z: number,
    biome: BiomeType,
    height: number,
    nearWater: boolean
  ): number {
    let score = 0;
    
    // Use x, z for distance-based scoring (prefer central areas)
    const distanceFromOrigin = Math.sqrt(x * x + z * z);
    if (distanceFromOrigin < 1000) {
      score += 0.1; // Slight preference for central areas
    }
    
    // Flat terrain preferred (not too high, not too low)
    if (height > 1 && height < 15) {
      score += 0.4;
    } else {
      score += 0.1;
    }
    
    // Biome suitability
    switch (biome) {
      case BiomeType.GRASSLAND:
        score += 0.5; // Best for settlements
        break;
      case BiomeType.FOREST:
        score += 0.3; // Good, but needs clearing
        break;
      case BiomeType.SAVANNA:
        score += 0.3;
        break;
      case BiomeType.BEACH:
        if (nearWater) score += 0.4; // Coastal settlements
        break;
      case BiomeType.DESERT:
        score += 0.1; // Rare oasis settlements
        break;
      case BiomeType.TAIGA:
      case BiomeType.TUNDRA:
        score += 0.2; // Hardy frontier towns
        break;
      default:
        score += 0; // Uninhabitable
    }
    
    // Proximity to water (important!)
    if (nearWater) {
      score += 0.3;
    }
    
    return Math.min(1, score);
  }
  
  /**
   * Determine settlement type based on population
   * Uses SocialLaws Service typology
   */
  private getSettlementType(population: number): SettlementType {
    if (population < 500) {
      return SettlementType.VILLAGE; // Band/family group
    } else if (population < 5000) {
      return SettlementType.TOWN; // Tribe/chiefdom
    } else {
      return SettlementType.CITY; // State
    }
  }
  
  /**
   * Generate settlement name (deterministic)
   */
  private generateName(x: number, z: number, rng: EnhancedRNG): string {
    // Use x, z coordinates for deterministic name generation
    const coordSeed = Math.floor((x + z) * 1000) % 1000;
    const nameRng = new EnhancedRNG(`${this.seed}-name-${coordSeed}`);
    // Use instance rng for global name style variations, rng parameter for per-settlement variation
    const useGlobalStyle = this.rng.uniform(0, 1) > 0.3; // 70% use coordinate-based, 30% use global
    const settlementStyle = rng.uniform(0, 1); // Per-settlement style variation
    const usePrefix = useGlobalStyle ? this.rng.uniform(0, 1) > 0.5 : (nameRng.uniform(0, 1) + settlementStyle * 0.2) > 0.5;
    
    const nameSource = useGlobalStyle ? this.rng : nameRng;
    if (usePrefix) {
      const prefix = this.prefixes[Math.floor(nameSource.uniform(0, 1) * this.prefixes.length)];
      const root = this.roots[Math.floor(nameSource.uniform(0, 1) * this.roots.length)];
      return `${prefix}${root}`;
    } else {
      const root1 = this.roots[Math.floor(nameSource.uniform(0, 1) * this.roots.length)];
      const root2 = this.roots[Math.floor(nameSource.uniform(0, 1) * this.roots.length)];
      return root1.charAt(0).toUpperCase() + root1.slice(1) + root2;
    }
  }
  
  /**
   * Generate buildings for settlement
   * Uses PREFABS (Daggerfall Unity style)
   */
  private generateBuildings(
    settlement: Settlement,
    rng: EnhancedRNG
  ): Building[] {
    const buildings: Building[] = [];
    const { population, type: settlementType, position } = settlement;
    
    // Use settlement type to determine building distribution
    const isCity = settlementType === SettlementType.CITY;
    const isTown = settlementType === SettlementType.TOWN;
    const isVillage = settlementType === SettlementType.VILLAGE;
    
    // Use instance rng for global settlement variations
    const globalVariation = this.rng.uniform(0.95, 1.05);
    
    // Calculate building counts using Dunbar's number and Service typology
    const householdSize = 5; // Average household
    const houseCount = Math.ceil(population / householdSize);
    
    // GOVERNOR-BASED: Classify settlement by population (using social laws)
    const villageThreshold = isVillage ? 30 : 50;
    const governanceType = population < villageThreshold ? 'band' :
                          population < 500 ? 'tribe' :
                          population < 5000 ? 'chiefdom' : 'state';
    
    console.log(`[Settlement] ${settlement.name}: ${governanceType}, pop ${population}`);
    
    // Service buildings - determined by governance complexity
    // Use isVillage to reduce building counts (villages are simpler)
    const buildingMultiplier = isVillage ? 0.7 : 1.0; // Villages have fewer specialized buildings
    
    let shopCount, workshopCount, warehouseCount, tavernCount, templeCount;
    
    if (governanceType === 'band') {
      shopCount = 0;
      workshopCount = 1;
      warehouseCount = 0;
      tavernCount = 0;
      templeCount = 0;
    } else if (governanceType === 'tribe') {
      shopCount = Math.floor(population / 150 * buildingMultiplier);
      workshopCount = Math.floor(population / 100 * buildingMultiplier);
      warehouseCount = 0;
      tavernCount = Math.floor(population / 200 * buildingMultiplier);
      templeCount = Math.floor(1 * buildingMultiplier);
    } else if (governanceType === 'chiefdom') {
      shopCount = Math.floor(population / 80 * buildingMultiplier);
      workshopCount = Math.floor(population / 60 * buildingMultiplier);
      warehouseCount = Math.floor(population / 150 * buildingMultiplier);
      tavernCount = Math.floor(population / 100 * buildingMultiplier);
      templeCount = Math.floor(population / 300 * buildingMultiplier);
    } else {
      shopCount = Math.floor(population / 50 * buildingMultiplier);
      workshopCount = Math.floor(population / 40 * buildingMultiplier);
      warehouseCount = Math.floor(population / 80 * buildingMultiplier);
      tavernCount = Math.floor(population / 60 * buildingMultiplier);
      templeCount = Math.floor(population / 200 * buildingMultiplier);
    }
    
    // Determine building material based on biome/resources
    const material = this.chooseBuildingMaterial(settlement, rng);
    
    // Place buildings in GRID PATTERN like Daggerfall
    // Streets run N-S and E-W with buildings along them
    const streetWidth = 8; // meters
    const blockSize = 30; // meters per block
    const blocksWide = Math.ceil(Math.sqrt(population / 100));
    
    let buildingIndex = 0;
    
    // Helper to place a building type USING PREFABS
    const placeBuildings = (count: number, buildingType: BuildingType) => {
      // Map BuildingType enum to prefab BuildingType
      let prefabType: BuildingType;
      switch (buildingType) {
        case BuildingType.HOUSE:
          prefabType = BuildingType.HOUSE;
          break;
        case BuildingType.SHOP:
          prefabType = BuildingType.SHOP;
          break;
        case BuildingType.TAVERN:
          prefabType = BuildingType.TAVERN;
          break;
        case BuildingType.TEMPLE:
          prefabType = BuildingType.TEMPLE;
          break;
        case BuildingType.WAREHOUSE:
          prefabType = BuildingType.WAREHOUSE;
          break;
        case BuildingType.WORKSHOP:
          prefabType = BuildingType.WORKSHOP;
          break;
        default:
          prefabType = BuildingType.HOUSE;
      }
      
      // Get prefab from registry
      let prefab = BuildingPrefabRegistry.get(prefabType);
      
      // Evolve prefab using governors (governors optimize based on laws)
      const biome = this.getBiomeForSettlement(settlement);
      const availableResources = this.getAvailableResources(biome, rng);
      prefab = SocialGovernorPrefabIntegration.evolve(prefab, {
          population,
          governanceType,
          availableResources
      });
      
      // Scale based on settlement type
      const buildingSize = isCity && (buildingType === BuildingType.TEMPLE || buildingType === BuildingType.WAREHOUSE) ? 1.5 : 1.0;
      const mediumSize = isTown ? 1.2 : 1.0;
      const finalSize = buildingSize * mediumSize * globalVariation;
      
      for (let i = 0; i < count; i++) {
        // Grid position
        const gridX = buildingIndex % blocksWide;
        const gridZ = Math.floor(buildingIndex / blocksWide);
        
        // Add randomness within block
        const offsetX = rng.uniform(-blockSize * 0.3, blockSize * 0.3);
        const offsetZ = rng.uniform(-blockSize * 0.3, blockSize * 0.3);
        
        const bx = position.x + (gridX - blocksWide / 2) * (blockSize + streetWidth) + offsetX;
        const bz = position.z + (gridZ - blocksWide / 2) * (blockSize + streetWidth) + offsetZ;
        const by = position.y; // Will be adjusted to terrain height later
        
        // Use prefab size, scaled
        const size = new THREE.Vector3(
          prefab.width * finalSize,
          prefab.height * finalSize,
          prefab.depth * finalSize
        );
        
        buildings.push({
          type: buildingType,
          position: new THREE.Vector3(bx, by, bz),
          size,
          rotation: rng.uniform(0, Math.PI * 2),
          material
        });
        
        buildingIndex++;
      }
    };
    
    // Place all buildings
    placeBuildings(houseCount, BuildingType.HOUSE);
    placeBuildings(shopCount, BuildingType.SHOP);
    placeBuildings(tavernCount, BuildingType.TAVERN);
    placeBuildings(templeCount, BuildingType.TEMPLE);
    placeBuildings(warehouseCount, BuildingType.WAREHOUSE);
    placeBuildings(workshopCount, BuildingType.WORKSHOP);
    
    return buildings;
  }
  
  /**
   * Choose building material based on available resources
   * Uses ecological laws: resource availability from biome
   */
  private chooseBuildingMaterial(settlement: Settlement, rng: EnhancedRNG): BuildingMaterial {
    // Ecological law: Material availability based on biome
    // Forests = wood, Mountains = stone, Plains = mix
    const biome = this.getBiomeForSettlement(settlement);
    
    if (settlement.type === SettlementType.CITY) {
      return BuildingMaterial.BRICK; // Advanced construction (cities have resources)
    } else if (biome === BiomeType.FOREST || biome === BiomeType.TAIGA) {
      return BuildingMaterial.WOOD; // Forests have wood
    } else if (biome === BiomeType.MOUNTAIN || biome === BiomeType.TUNDRA) {
      return BuildingMaterial.STONE; // Mountains have stone
    } else {
      // Plains/grassland: mix based on availability
      return rng.uniform(0, 1) < 0.6 ? BuildingMaterial.WOOD : BuildingMaterial.STONE;
    }
  }

  /**
   * Get biome for settlement (used for material selection)
   */
  private getBiomeForSettlement(settlement: Settlement): BiomeType {
    // Use deterministic RNG to determine biome based on settlement position
    const biomeRng = new EnhancedRNG(`${this.seed}-biome-${settlement.position.x}-${settlement.position.z}`);
    const biomeChoice = biomeRng.uniform(0, 1);
    
    // Weighted distribution (more forests/grasslands than deserts)
    if (biomeChoice < 0.3) return BiomeType.FOREST;
    if (biomeChoice < 0.5) return BiomeType.GRASSLAND;
    if (biomeChoice < 0.65) return BiomeType.TAIGA;
    if (biomeChoice < 0.75) return BiomeType.MOUNTAIN;
    if (biomeChoice < 0.85) return BiomeType.DESERT;
    if (biomeChoice < 0.92) return BiomeType.TUNDRA;
    return BiomeType.SAVANNA;
  }

  /**
   * Get available resources based on biome (ecological law)
   */
  private getAvailableResources(biome: BiomeType, rng: EnhancedRNG): { wood: number; stone: number; metal: number } {
    // Ecological law: Resource availability varies by biome
    const baseResources: Record<BiomeType, { wood: number; stone: number; metal: number }> = {
      [BiomeType.FOREST]: { wood: 1000, stone: 200, metal: 50 },
      [BiomeType.TAIGA]: { wood: 800, stone: 300, metal: 100 },
      [BiomeType.GRASSLAND]: { wood: 400, stone: 600, metal: 150 },
      [BiomeType.MOUNTAIN]: { wood: 200, stone: 1000, metal: 500 },
      [BiomeType.DESERT]: { wood: 50, stone: 800, metal: 200 },
      [BiomeType.TUNDRA]: { wood: 100, stone: 700, metal: 300 },
      [BiomeType.SAVANNA]: { wood: 300, stone: 500, metal: 100 },
      [BiomeType.OCEAN]: { wood: 0, stone: 200, metal: 50 },
      [BiomeType.BEACH]: { wood: 100, stone: 400, metal: 50 },
      [BiomeType.RAINFOREST]: { wood: 600, stone: 100, metal: 25 },
      [BiomeType.SNOW]: { wood: 0, stone: 500, metal: 100 }
    };

    const base = baseResources[biome] || { wood: 300, stone: 300, metal: 100 };
    
    // Add variation (±20%)
    return {
      wood: Math.floor(base.wood * rng.uniform(0.8, 1.2)),
      stone: Math.floor(base.stone * rng.uniform(0.8, 1.2)),
      metal: Math.floor(base.metal * rng.uniform(0.8, 1.2))
    };
  }
  
  /**
   * Place settlements in a region
   * @param regionX Region X coordinate (in chunk units)
   * @param regionZ Region Z coordinate (in chunk units)
   * @param getBiome Function to get biome at position
   * @param getHeight Function to get terrain height
   */
  placeInRegion(
    regionX: number,
    regionZ: number,
    getBiome: (x: number, z: number) => BiomeType,
    getHeight: (x: number, z: number) => number
  ): void {
    const regionSeed = `${this.seed}-settlements-${regionX}-${regionZ}`;
    const regionRng = new EnhancedRNG(regionSeed);
    
    const regionSize = 1000; // meters (10 chunks)
    const regionWorldX = regionX * regionSize;
    const regionWorldZ = regionZ * regionSize;
    
    // Attempt to place 1-3 settlements per region
    const attemptCount = Math.floor(regionRng.uniform(1, 4));
    
    for (let i = 0; i < attemptCount; i++) {
      const x = regionWorldX + regionRng.uniform(-regionSize / 2, regionSize / 2);
      const z = regionWorldZ + regionRng.uniform(-regionSize / 2, regionSize / 2);
      
      const height = getHeight(x, z);
      const biome = getBiome(x, z);
      
      // Check water proximity (simplified - check nearby points)
      const nearWater = this.checkNearWater(x, z, getHeight, 50);
      
      // Evaluate suitability
      const suitability = this.evaluateSuitability(x, z, biome, height, nearWater);
      
      // Probability check
      if (regionRng.uniform(0, 1) > suitability) {
        continue; // Not suitable
      }
      
      // Check minimum distance from other settlements
      if (!this.checkMinimumDistance(x, z)) {
        continue;
      }
      
      // Generate population using SocialLaws
      // Use Poisson distribution around mean
      const meanPopulation = 1000; // Base population
      const population = Math.max(50, Math.floor(regionRng.poisson(meanPopulation / 10) * 10));
      
      const type = this.getSettlementType(population);
      const name = this.generateName(x, z, regionRng);
      const id = `settlement-${regionX}-${regionZ}-${i}`;
      
      const settlement: Settlement = {
        id,
        type,
        name,
        position: new THREE.Vector3(x, height, z),
        population,
        buildings: []
      };
      
      // Generate buildings
      settlement.buildings = this.generateBuildings(settlement, regionRng);
      
      // Render settlement
      this.renderSettlement(settlement);
      
      this.settlements.set(id, settlement);
      
      console.log(`[SettlementPlacer] Placed ${type}: ${name} (pop: ${population}) at (${x.toFixed(0)}, ${z.toFixed(0)})`);
    }
  }
  
  /**
   * Check if position is near water
   */
  private checkNearWater(
    x: number,
    z: number,
    getHeight: (x: number, z: number) => number,
    radius: number
  ): boolean {
    // Sample points in a circle
    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
      const px = x + Math.cos(angle) * radius;
      const pz = z + Math.sin(angle) * radius;
      const height = getHeight(px, pz);
      
      if (height < 0.5) {
        return true; // Water nearby
      }
    }
    return false;
  }
  
  /**
   * Check minimum distance from existing settlements
   */
  private checkMinimumDistance(x: number, z: number): boolean {
    for (const settlement of this.settlements.values()) {
      const dx = settlement.position.x - x;
      const dz = settlement.position.z - z;
      const distance = Math.sqrt(dx * dx + dz * dz);
      
      if (distance < this.minSettlementDistance) {
        return false;
      }
    }
    return true;
  }
  
  /**
   * Render settlement buildings
   */
  private renderSettlement(settlement: Settlement): void {
    // Create a parent object for the settlement
    const settlementGroup = new THREE.Group();
    settlementGroup.name = settlement.name;
    settlementGroup.position.copy(settlement.position);
    
    // Add STREETS (Daggerfall style - grid pattern)
    this.createStreets(settlement, settlementGroup);
    
    // Render each building
    for (const building of settlement.buildings) {
      const buildingMesh = this.createBuildingMesh(building);
      buildingMesh.position.copy(building.position).sub(settlement.position); // Relative to settlement
      settlementGroup.add(buildingMesh);
    }
    
    this.scene.add(settlementGroup);
  }
  
  /**
   * Create street grid for settlement
   */
  private createStreets(settlement: Settlement, group: THREE.Group): void {
    const streetWidth = 8;
    const blockSize = 30;
    const blocksWide = Math.ceil(Math.sqrt(settlement.population / 100));
    const townSize = blocksWide * (blockSize + streetWidth);
    
    // Create ground plane for entire settlement (paved area)
    const groundGeometry = new THREE.PlaneGeometry(townSize + 50, townSize + 50);
    groundGeometry.rotateX(-Math.PI / 2);
    
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x8B7355, // Dirt/packed earth
      roughness: 0.9,
      metalness: 0.0
    });
    
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.position.y = 0.1; // Slightly above terrain
    ground.receiveShadow = true;
    group.add(ground);
    
    // Add N-S and E-W streets (stone/cobble)
    const streetMaterial = new THREE.MeshStandardMaterial({
      color: 0x666666, // Stone gray
      roughness: 0.7,
      metalness: 0.1
    });
    
    // N-S streets (vertical)
    for (let i = -blocksWide / 2; i <= blocksWide / 2; i++) {
      const streetGeometry = new THREE.PlaneGeometry(streetWidth, townSize);
      streetGeometry.rotateX(-Math.PI / 2);
      
      const street = new THREE.Mesh(streetGeometry, streetMaterial);
      street.position.x = i * (blockSize + streetWidth);
      street.position.y = 0.2; // Above ground
      street.receiveShadow = true;
      group.add(street);
    }
    
    // E-W streets (horizontal)
    for (let i = -blocksWide / 2; i <= blocksWide / 2; i++) {
      const streetGeometry = new THREE.PlaneGeometry(townSize, streetWidth);
      streetGeometry.rotateX(-Math.PI / 2);
      
      const street = new THREE.Mesh(streetGeometry, streetMaterial);
      street.position.z = i * (blockSize + streetWidth);
      street.position.y = 0.2; // Above ground
      street.receiveShadow = true;
      group.add(street);
    }
  }
  
  /**
   * Create building mesh with WALLS, DOOR, WINDOWS
   */
  /**
   * Create building mesh FROM PREFAB (Daggerfall Unity style)
   */
  private createBuildingMesh(building: Building): THREE.Group {
    // Map BuildingType to prefab BuildingType
    let prefabType: BuildingType;
    switch (building.type) {
      case BuildingType.HOUSE:
        prefabType = BuildingType.HOUSE;
        break;
      case BuildingType.SHOP:
        prefabType = BuildingType.SHOP;
        break;
      case BuildingType.TAVERN:
        prefabType = BuildingType.TAVERN;
        break;
      case BuildingType.TEMPLE:
        prefabType = BuildingType.TEMPLE;
        break;
      case BuildingType.WAREHOUSE:
        prefabType = BuildingType.WAREHOUSE;
        break;
      case BuildingType.WORKSHOP:
        prefabType = BuildingType.WORKSHOP;
        break;
      default:
        prefabType = BuildingType.HOUSE;
    }
    
    // Get prefab from registry
    const prefab = BuildingPrefabRegistry.get(prefabType);
    
    // Generate mesh from prefab
    const mesh = BuildingSpawner.generate(prefab, building.position, building.rotation);
    
    // Scale mesh to match building size
    const scaleX = building.size.x / prefab.width;
    const scaleY = building.size.y / prefab.height;
    const scaleZ = building.size.z / prefab.depth;
    mesh.scale.set(scaleX, scaleY, scaleZ);
    
    return mesh;
  }
  
  /**
   * Get settlement count
   */
  getSettlementCount(): number {
    return this.settlements.size;
  }
  
  /**
   * Get all settlements
   */
  getSettlements(): Settlement[] {
    return Array.from(this.settlements.values());
  }
  
  /**
   * Get settlement by ID
   */
  getSettlement(id: string): Settlement | undefined {
    return this.settlements.get(id);
  }
  
  /**
   * Get nearest settlement to a position
   */
  getNearestSettlement(x: number, z: number): Settlement | undefined {
    const settlements = Array.from(this.settlements.values());
    if (settlements.length === 0) return undefined;
    
    let nearest = settlements[0];
    let minDist = Infinity;
    
    for (const settlement of settlements) {
      const dx = settlement.position.x - x;
      const dz = settlement.position.z - z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      
      if (dist < minDist) {
        minDist = dist;
        nearest = settlement;
      }
    }
    
    return nearest;
  }
}

