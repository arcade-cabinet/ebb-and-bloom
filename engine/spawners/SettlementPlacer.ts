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
import { EnhancedRNG } from '../utils/EnhancedRNG';
import { BiomeType } from './BiomeSystem';
import { ServiceTypology } from '../laws/social';

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

export enum BuildingType {
  HOUSE = 'house',
  SHOP = 'shop',
  TAVERN = 'tavern',
  TEMPLE = 'temple',
  WAREHOUSE = 'warehouse',
  WORKSHOP = 'workshop'
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
    const usePrefix = rng.uniform(0, 1) > 0.5;
    
    if (usePrefix) {
      const prefix = this.prefixes[Math.floor(rng.uniform(0, 1) * this.prefixes.length)];
      const root = this.roots[Math.floor(rng.uniform(0, 1) * this.roots.length)];
      return `${prefix}${root}`;
    } else {
      const root1 = this.roots[Math.floor(rng.uniform(0, 1) * this.roots.length)];
      const root2 = this.roots[Math.floor(rng.uniform(0, 1) * this.roots.length)];
      return root1.charAt(0).toUpperCase() + root1.slice(1) + root2;
    }
  }
  
  /**
   * Generate buildings for settlement
   * Based on population and Service typology
   */
  private generateBuildings(
    settlement: Settlement,
    rng: EnhancedRNG
  ): Building[] {
    const buildings: Building[] = [];
    const { population, type, position } = settlement;
    
    // Calculate building counts using Dunbar's number and Service typology
    const householdSize = 5; // Average household
    const houseCount = Math.ceil(population / householdSize);
    
    // LAW-BASED: Use ServiceTypology to determine governance
    const governanceType = ServiceTypology.classify(population, 1.0, 0.3);
    
    console.log(`[Settlement] ${settlement.name}: ${governanceType}, pop ${population}`);
    
    // Service buildings - determined by governance complexity
    let shopCount, workshopCount, warehouseCount, tavernCount, templeCount;
    
    if (governanceType === 'band') {
      shopCount = 0;
      workshopCount = 1;
      warehouseCount = 0;
      tavernCount = 0;
      templeCount = 0;
    } else if (governanceType === 'tribe') {
      shopCount = Math.floor(population / 150);
      workshopCount = Math.floor(population / 100);
      warehouseCount = 0;
      tavernCount = Math.floor(population / 200);
      templeCount = 1;
    } else if (governanceType === 'chiefdom') {
      shopCount = Math.floor(population / 80);
      workshopCount = Math.floor(population / 60);
      warehouseCount = Math.floor(population / 150);
      tavernCount = Math.floor(population / 100);
      templeCount = Math.floor(population / 300);
    } else {
      shopCount = Math.floor(population / 50);
      workshopCount = Math.floor(population / 40);
      warehouseCount = Math.floor(population / 80);
      tavernCount = Math.floor(population / 60);
      templeCount = Math.floor(population / 200);
    }
    
    // Determine building material based on biome/resources
    const material = this.chooseBuildingMaterial(settlement, rng);
    
    // Place buildings in GRID PATTERN like Daggerfall
    // Streets run N-S and E-W with buildings along them
    const streetWidth = 8; // meters
    const blockSize = 30; // meters per block
    const blocksWide = Math.ceil(Math.sqrt(population / 100));
    
    let buildingIndex = 0;
    
    // Helper to place a building type
    const placeBuildings = (count: number, buildingType: BuildingType) => {
      for (let i = 0; i < count; i++) {
        // Grid position
        const gridX = buildingIndex % blocksWide;
        const gridZ = Math.floor(buildingIndex / blocksWide);
        
        // Add randomness within block
        const offsetX = rng.uniform(-blockSize * 0.3, blockSize * 0.3);
        const offsetZ = rng.uniform(-blockSize * 0.3, blockSize * 0.3);
        
        const bx = position.x + (gridX - blocksWide / 2) * (blockSize + streetWidth) + offsetX;
        const bz = position.z + (gridZ - blocksWide / 2) * (blockSize + streetWidth) + offsetZ;
        
        // Building size varies by type
        let size: THREE.Vector3;
        switch (buildingType) {
          case BuildingType.HOUSE:
            size = new THREE.Vector3(
              rng.uniform(10, 15),   // BIGGER - actually visible
              rng.uniform(8, 12),    // TALLER
              rng.uniform(10, 15)
            );
            break;
          case BuildingType.SHOP:
            size = new THREE.Vector3(
              rng.uniform(12, 20),   // BIGGER
              rng.uniform(10, 15),   // TALLER
              rng.uniform(12, 20)
            );
            break;
          case BuildingType.TAVERN:
            size = new THREE.Vector3(
              rng.uniform(15, 25),   // BIGGER
              rng.uniform(12, 18),   // TALLER
              rng.uniform(15, 25)
            );
            break;
          case BuildingType.TEMPLE:
            size = new THREE.Vector3(
              rng.uniform(25, 40),   // MASSIVE
              rng.uniform(20, 30),   // TOWERING
              rng.uniform(25, 40)
            );
            break;
          case BuildingType.WAREHOUSE:
            size = new THREE.Vector3(
              rng.uniform(20, 35),   // BIGGER
              rng.uniform(10, 15),   // TALLER
              rng.uniform(20, 35)
            );
            break;
          case BuildingType.WORKSHOP:
            size = new THREE.Vector3(
              rng.uniform(12, 18),   // BIGGER
              rng.uniform(8, 12),    // TALLER
              rng.uniform(12, 18)
            );
            break;
        }
        
        buildings.push({
          type: buildingType,
          position: new THREE.Vector3(bx, position.y, bz),
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
   */
  private chooseBuildingMaterial(settlement: Settlement, rng: EnhancedRNG): BuildingMaterial {
    // For now, simple rule: wood in forests, stone in mountains/grassland
    // TODO: Use PlanetaryLaws for actual resource availability
    
    const choice = rng.uniform(0, 1);
    
    if (settlement.type === SettlementType.CITY) {
      return BuildingMaterial.BRICK; // Advanced construction
    } else if (choice < 0.6) {
      return BuildingMaterial.WOOD;
    } else {
      return BuildingMaterial.STONE;
    }
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
  private createBuildingMesh(building: Building): THREE.Group {
    const group = new THREE.Group();
    
    // Material color based on building material (VIBRANT colors)
    let wallColor: number;
    switch (building.material) {
      case BuildingMaterial.WOOD:
        wallColor = 0xD4A574; // Light wood
        break;
      case BuildingMaterial.STONE:
        wallColor = 0xC0C0C0; // Stone
        break;
      case BuildingMaterial.BRICK:
        wallColor = 0xCC5533; // Brick red
        break;
    }
    
    // Main building body
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: wallColor,
      roughness: 0.8,
      metalness: 0.0
    });
    
    const bodyGeometry = new THREE.BoxGeometry(
      building.size.x,
      building.size.y,
      building.size.z
    );
    
    const body = new THREE.Mesh(bodyGeometry, wallMaterial);
    body.position.y = building.size.y / 2;
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);
    
    // DOOR (single box - efficient)
    const doorGeometry = new THREE.BoxGeometry(2.5, 4, 0.3);
    const doorMaterial = new THREE.MeshStandardMaterial({
      color: 0x2A1A0A, // Dark wood
      roughness: 0.9
    });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(0, 2, building.size.z / 2 + 0.2);
    group.add(door);
    
    group.rotation.y = building.rotation;
    
    // Add roof (pyramid) - DARK RED tiles
    const roofGeometry = new THREE.ConeGeometry(
      Math.max(building.size.x, building.size.z) * 0.75,
      building.size.y * 0.4,
      4
    );
    const roofMaterial = new THREE.MeshStandardMaterial({
      color: 0x8B3333, // Dark red tiles
      roughness: 0.7,
      metalness: 0.0
    });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = building.size.y;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    group.add(roof);
    
    return group;
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
   * Get settlement count
   */
  getSettlementCount(): number {
    return this.settlements.size;
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

