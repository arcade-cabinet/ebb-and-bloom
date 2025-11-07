/**
 * Building System - Complete Daggerfall-inspired functional architecture
 * Generates purposeful buildings with interiors, doors, and NPC placement
 */

import { World, Entity } from 'miniplex';
import * as THREE from 'three';
import { SimplexNoise } from 'simplex-noise';
import { log, measurePerformance } from '../utils/Logger';
import type { WorldSchema, Transform, BuildingData, RenderData } from '../world/ECSWorld';
import { textureLibrary } from './TextureLibrary';

// Daggerfall building type classification
export enum BuildingType {
  // Essential services (inner ring placement)
  GENERAL_STORE = 'general_store',
  TAVERN = 'tavern', 
  TEMPLE = 'temple',
  BLACKSMITH = 'blacksmith',
  
  // Specialized shops (middle ring)
  ALCHEMIST = 'alchemist',
  ARMORER = 'armorer',
  CLOTHIER = 'clothier',
  BOOKSELLER = 'bookseller',
  
  // Residences (outer ring)
  HOUSE_SMALL = 'house_small',
  HOUSE_MEDIUM = 'house_medium', 
  HOUSE_LARGE = 'house_large',
  
  // Special buildings
  PALACE = 'palace',
  GUILD_HALL = 'guild_hall',
  LIBRARY = 'library'
}

// Room type definitions for interior generation
export enum RoomType {
  // Commercial rooms
  SHOP_FLOOR = 'shop_floor',
  STORAGE = 'storage',
  WORKSHOP = 'workshop',
  
  // Residential rooms  
  COMMON_ROOM = 'common_room',
  BEDROOM = 'bedroom',
  KITCHEN = 'kitchen',
  CELLAR = 'cellar',
  
  // Special rooms
  ALTAR_ROOM = 'altar_room',
  FORGE = 'forge',
  LABORATORY = 'laboratory',
  LIBRARY_HALL = 'library_hall'
}

interface BuildingTemplate {
  type: BuildingType;
  name: string;
  
  // Exterior properties
  dimensions: { width: number; height: number; depth: number };
  materialRequirements: string[]; // Texture categories needed
  placementRules: {
    distanceFromCenter: [number, number]; // Min/max distance from settlement center
    terrainRequirements: 'flat' | 'sloped' | 'elevated' | 'waterfront';
    neighboringBuildings: BuildingType[]; // Preferred neighbors
    roadAccess: boolean;
  };
  
  // Interior layout
  floors: FloorPlan[];
  
  // Functional properties  
  services: string[]; // What this building provides
  npcRoles: string[]; // What NPCs work here
  operatingHours: [number, number]; // When it's active
  customerCapacity: number;
}

interface FloorPlan {
  floor: number; // 0=ground, 1=upper, -1=basement
  rooms: RoomLayout[];
  stairs: { from: THREE.Vector3; to: THREE.Vector3 }[];
}

interface RoomLayout {
  type: RoomType;
  bounds: { x: number; z: number; width: number; depth: number };
  doors: DoorSpec[];
  furniture: FurnitureSpec[];
  lightSources: THREE.Vector3[];
  functionalAreas: FunctionalAreaSpec[];
}

interface DoorSpec {
  position: THREE.Vector3;
  rotation: number;
  opensTo: RoomType | 'exterior';
  material: 'wood' | 'metal' | 'stone';
  lockable: boolean;
}

interface FurnitureSpec {
  type: 'counter' | 'table' | 'chair' | 'bed' | 'anvil' | 'cauldron' | 'shelf';
  position: THREE.Vector3;
  rotation: number;
  material: string;
  functional: boolean; // Can player interact?
}

interface FunctionalAreaSpec {
  type: 'crafting_station' | 'trading_post' | 'sleeping_area' | 'storage_area';
  bounds: { x: number; z: number; width: number; depth: number };
  requiredMaterials: string[]; // For crafting stations
  outputMaterials: string[]; // What can be created here
  npcInteraction: boolean; // Requires NPC presence
}

class BuildingSystem {
  private world: World<WorldSchema>;
  private buildingNoise = new SimplexNoise();
  private templates = new Map<BuildingType, BuildingTemplate>();
  private settlements: Entity<WorldSchema>[] = [];
  private buildings: Entity<WorldSchema>[] = [];
  
  constructor(world: World<WorldSchema>) {
    this.world = world;
    this.initializeBuildingTemplates();
    log.info('BuildingSystem initialized with Daggerfall-inspired architecture');
  }
  
  private initializeBuildingTemplates(): void {
    log.info('Initializing building templates based on Daggerfall classification...');
    
    // Essential service: General Store
    this.templates.set(BuildingType.GENERAL_STORE, {
      type: BuildingType.GENERAL_STORE,
      name: 'General Store',
      dimensions: { width: 12, height: 10, depth: 12 },
      materialRequirements: ['wood', 'stone'],
      placementRules: {
        distanceFromCenter: [20, 60],
        terrainRequirements: 'flat',
        neighboringBuildings: [BuildingType.TAVERN, BuildingType.BLACKSMITH],
        roadAccess: true
      },
      floors: [
        {
          floor: 0,
          rooms: [
            {
              type: RoomType.SHOP_FLOOR,
              bounds: { x: 1, z: 1, width: 8, depth: 8 },
              doors: [
                { position: new THREE.Vector3(0, 0, 4), rotation: 0, opensTo: 'exterior', material: 'wood', lockable: false }
              ],
              furniture: [
                { type: 'counter', position: new THREE.Vector3(2, 0, 6), rotation: 0, material: 'wood', functional: true },
                { type: 'shelf', position: new THREE.Vector3(6, 0, 1), rotation: Math.PI/2, material: 'wood', functional: false },
                { type: 'shelf', position: new THREE.Vector3(6, 0, 7), rotation: Math.PI/2, material: 'wood', functional: false }
              ],
              lightSources: [new THREE.Vector3(4, 3, 4)],
              functionalAreas: [
                {
                  type: 'trading_post',
                  bounds: { x: 1, z: 5, width: 3, depth: 3 },
                  requiredMaterials: [],
                  outputMaterials: ['basic_goods', 'tools', 'food'],
                  npcInteraction: true
                }
              ]
            },
            {
              type: RoomType.STORAGE,
              bounds: { x: 9, z: 1, width: 3, depth: 8 },
              doors: [
                { position: new THREE.Vector3(9, 0, 4), rotation: Math.PI, opensTo: RoomType.SHOP_FLOOR, material: 'wood', lockable: true }
              ],
              furniture: [
                { type: 'shelf', position: new THREE.Vector3(10, 0, 2), rotation: 0, material: 'wood', functional: false },
                { type: 'shelf', position: new THREE.Vector3(10, 0, 6), rotation: 0, material: 'wood', functional: false }
              ],
              lightSources: [],
              functionalAreas: [
                {
                  type: 'storage_area',
                  bounds: { x: 9, z: 1, width: 3, depth: 8 },
                  requiredMaterials: [],
                  outputMaterials: [],
                  npcInteraction: false
                }
              ]
            }
          ],
          stairs: []
        },
        {
          floor: 1,
          rooms: [
            {
              type: RoomType.COMMON_ROOM,
              bounds: { x: 1, z: 1, width: 6, depth: 6 },
              doors: [
                { position: new THREE.Vector3(3, 0, 1), rotation: Math.PI/2, opensTo: RoomType.BEDROOM, material: 'wood', lockable: false }
              ],
              furniture: [
                { type: 'table', position: new THREE.Vector3(3, 0, 3), rotation: 0, material: 'wood', functional: false },
                { type: 'chair', position: new THREE.Vector3(2, 0, 3), rotation: 0, material: 'wood', functional: false },
                { type: 'chair', position: new THREE.Vector3(4, 0, 3), rotation: Math.PI, material: 'wood', functional: false }
              ],
              lightSources: [new THREE.Vector3(3, 3, 3)],
              functionalAreas: []
            },
            {
              type: RoomType.BEDROOM,
              bounds: { x: 7, z: 1, width: 4, depth: 6 },
              doors: [],
              furniture: [
                { type: 'bed', position: new THREE.Vector3(9, 0, 5), rotation: 0, material: 'wood', functional: true }
              ],
              lightSources: [],
              functionalAreas: [
                {
                  type: 'sleeping_area', 
                  bounds: { x: 7, z: 1, width: 4, depth: 6 },
                  requiredMaterials: [],
                  outputMaterials: [],
                  npcInteraction: false
                }
              ]
            }
          ],
          stairs: [
            { from: new THREE.Vector3(1, 0, 8), to: new THREE.Vector3(1, 4, 8) }
          ]
        }
      ],
      services: ['trade', 'basic_goods'],
      npcRoles: ['shopkeeper', 'assistant'],
      operatingHours: [8, 20], // 8 AM to 8 PM
      customerCapacity: 4
    });
    
    // Essential service: Tavern
    this.templates.set(BuildingType.TAVERN, {
      type: BuildingType.TAVERN,
      name: 'Tavern',
      dimensions: { width: 16, height: 12, depth: 14 },
      materialRequirements: ['wood', 'stone'],
      placementRules: {
        distanceFromCenter: [15, 50],
        terrainRequirements: 'flat',
        neighboringBuildings: [BuildingType.GENERAL_STORE, BuildingType.TEMPLE],
        roadAccess: true
      },
      floors: [
        {
          floor: 0,
          rooms: [
            {
              type: RoomType.COMMON_ROOM,
              bounds: { x: 1, z: 1, width: 12, depth: 10 },
              doors: [
                { position: new THREE.Vector3(0, 0, 5), rotation: 0, opensTo: 'exterior', material: 'wood', lockable: false },
                { position: new THREE.Vector3(13, 0, 5), rotation: Math.PI, opensTo: RoomType.KITCHEN, material: 'wood', lockable: false }
              ],
              furniture: [
                { type: 'table', position: new THREE.Vector3(3, 0, 3), rotation: 0, material: 'wood', functional: true },
                { type: 'table', position: new THREE.Vector3(7, 0, 3), rotation: 0, material: 'wood', functional: true },
                { type: 'table', position: new THREE.Vector3(3, 0, 7), rotation: 0, material: 'wood', functional: true },
                { type: 'chair', position: new THREE.Vector3(2, 0, 3), rotation: 0, material: 'wood', functional: true },
                { type: 'chair', position: new THREE.Vector3(4, 0, 3), rotation: Math.PI, material: 'wood', functional: true },
                { type: 'counter', position: new THREE.Vector3(9, 0, 9), rotation: Math.PI/4, material: 'wood', functional: true }
              ],
              lightSources: [
                new THREE.Vector3(4, 3, 4),
                new THREE.Vector3(8, 3, 7),
                new THREE.Vector3(6, 3, 9)
              ],
              functionalAreas: [
                {
                  type: 'trading_post',
                  bounds: { x: 8, z: 8, width: 4, depth: 3 },
                  requiredMaterials: [],
                  outputMaterials: ['food', 'drink', 'rumors', 'rest'],
                  npcInteraction: true
                }
              ]
            },
            {
              type: RoomType.KITCHEN,
              bounds: { x: 13, z: 1, width: 3, depth: 10 },
              doors: [],
              furniture: [
                { type: 'counter', position: new THREE.Vector3(14, 0, 3), rotation: 0, material: 'stone', functional: true },
                { type: 'cauldron', position: new THREE.Vector3(14, 0, 7), rotation: 0, material: 'metal', functional: true }
              ],
              lightSources: [new THREE.Vector3(14, 3, 5)],
              functionalAreas: [
                {
                  type: 'crafting_station',
                  bounds: { x: 13, z: 1, width: 3, depth: 10 },
                  requiredMaterials: ['organic', 'water'],
                  outputMaterials: ['food', 'drink', 'medicine'],
                  npcInteraction: true
                }
              ]
            }
          ],
          stairs: [
            { from: new THREE.Vector3(11, 0, 9), to: new THREE.Vector3(11, 4, 9) }
          ]
        }
      ],
      services: ['food', 'drink', 'lodging', 'social'],
      npcRoles: ['innkeeper', 'barmaid', 'cook'],
      operatingHours: [6, 24], // All day
      customerCapacity: 12
    });
    
    // Crafting facility: Blacksmith
    this.templates.set(BuildingType.BLACKSMITH, {
      type: BuildingType.BLACKSMITH,
      name: 'Blacksmith',
      dimensions: { width: 10, height: 8, depth: 14 },
      materialRequirements: ['stone', 'metal'],
      placementRules: {
        distanceFromCenter: [25, 70],
        terrainRequirements: 'flat',
        neighboringBuildings: [BuildingType.ARMORER, BuildingType.GENERAL_STORE],
        roadAccess: true
      },
      floors: [
        {
          floor: 0,
          rooms: [
            {
              type: RoomType.FORGE,
              bounds: { x: 1, z: 1, width: 8, depth: 8 },
              doors: [
                { position: new THREE.Vector3(0, 0, 4), rotation: 0, opensTo: 'exterior', material: 'wood', lockable: false },
                { position: new THREE.Vector3(4, 0, 9), rotation: Math.PI/2, opensTo: RoomType.STORAGE, material: 'wood', lockable: true }
              ],
              furniture: [
                { type: 'anvil', position: new THREE.Vector3(4, 0, 4), rotation: 0, material: 'metal', functional: true },
                { type: 'counter', position: new THREE.Vector3(1, 0, 6), rotation: 0, material: 'stone', functional: true }
              ],
              lightSources: [
                new THREE.Vector3(4, 3, 4), // Forge fire
                new THREE.Vector3(2, 3, 2)
              ],
              functionalAreas: [
                {
                  type: 'crafting_station',
                  bounds: { x: 3, z: 3, width: 3, depth: 3 },
                  requiredMaterials: ['metal', 'ore', 'heat'],
                  outputMaterials: ['tools', 'weapons', 'armor', 'alloys'],
                  npcInteraction: true
                }
              ]
            },
            {
              type: RoomType.STORAGE,
              bounds: { x: 1, z: 9, width: 8, depth: 4 },
              doors: [],
              furniture: [
                { type: 'shelf', position: new THREE.Vector3(2, 0, 10), rotation: 0, material: 'wood', functional: false },
                { type: 'counter', position: new THREE.Vector3(6, 0, 11), rotation: Math.PI/2, material: 'stone', functional: false }
              ],
              lightSources: [],
              functionalAreas: [
                {
                  type: 'storage_area',
                  bounds: { x: 1, z: 9, width: 8, depth: 4 },
                  requiredMaterials: [],
                  outputMaterials: [],
                  npcInteraction: false
                }
              ]
            }
          ],
          stairs: []
        }
      ],
      services: ['metalworking', 'tool_repair', 'weapon_crafting'],
      npcRoles: ['blacksmith', 'apprentice'],
      operatingHours: [6, 18],
      customerCapacity: 3
    });
    
    // Residence: Medium House
    this.templates.set(BuildingType.HOUSE_MEDIUM, {
      type: BuildingType.HOUSE_MEDIUM,
      name: 'Medium House',
      dimensions: { width: 10, height: 8, depth: 10 },
      materialRequirements: ['wood', 'stone'],
      placementRules: {
        distanceFromCenter: [40, 120],
        terrainRequirements: 'flat',
        neighboringBuildings: [BuildingType.HOUSE_SMALL, BuildingType.HOUSE_LARGE],
        roadAccess: false
      },
      floors: [
        {
          floor: 0,
          rooms: [
            {
              type: RoomType.COMMON_ROOM,
              bounds: { x: 1, z: 1, width: 6, depth: 6 },
              doors: [
                { position: new THREE.Vector3(0, 0, 3), rotation: 0, opensTo: 'exterior', material: 'wood', lockable: true },
                { position: new THREE.Vector3(7, 0, 3), rotation: Math.PI, opensTo: RoomType.KITCHEN, material: 'wood', lockable: false }
              ],
              furniture: [
                { type: 'table', position: new THREE.Vector3(3, 0, 3), rotation: 0, material: 'wood', functional: false },
                { type: 'chair', position: new THREE.Vector3(2, 0, 3), rotation: 0, material: 'wood', functional: false },
                { type: 'chair', position: new THREE.Vector3(4, 0, 3), rotation: Math.PI, material: 'wood', functional: false }
              ],
              lightSources: [new THREE.Vector3(3, 3, 3)],
              functionalAreas: []
            },
            {
              type: RoomType.KITCHEN,
              bounds: { x: 7, z: 1, width: 3, depth: 6 },
              doors: [],
              furniture: [
                { type: 'counter', position: new THREE.Vector3(8, 0, 3), rotation: 0, material: 'stone', functional: true },
                { type: 'table', position: new THREE.Vector3(8, 0, 5), rotation: 0, material: 'wood', functional: false }
              ],
              lightSources: [new THREE.Vector3(8, 3, 3)],
              functionalAreas: [
                {
                  type: 'crafting_station',
                  bounds: { x: 7, z: 1, width: 3, depth: 6 },
                  requiredMaterials: ['organic', 'water'],
                  outputMaterials: ['food', 'medicine'],
                  npcInteraction: false
                }
              ]
            }
          ],
          stairs: [
            { from: new THREE.Vector3(1, 0, 7), to: new THREE.Vector3(1, 4, 7) }
          ]
        },
        {
          floor: 1,
          rooms: [
            {
              type: RoomType.BEDROOM,
              bounds: { x: 1, z: 1, width: 4, depth: 4 },
              doors: [
                { position: new THREE.Vector3(5, 0, 3), rotation: Math.PI, opensTo: RoomType.BEDROOM, material: 'wood', lockable: true }
              ],
              furniture: [
                { type: 'bed', position: new THREE.Vector3(3, 0, 3), rotation: 0, material: 'wood', functional: true }
              ],
              lightSources: [],
              functionalAreas: [
                {
                  type: 'sleeping_area',
                  bounds: { x: 1, z: 1, width: 4, depth: 4 },
                  requiredMaterials: [],
                  outputMaterials: [],
                  npcInteraction: false
                }
              ]
            },
            {
              type: RoomType.BEDROOM,
              bounds: { x: 5, z: 1, width: 4, depth: 4 },
              doors: [],
              furniture: [
                { type: 'bed', position: new THREE.Vector3(7, 0, 3), rotation: 0, material: 'wood', functional: true }
              ],
              lightSources: [],
              functionalAreas: [
                {
                  type: 'sleeping_area',
                  bounds: { x: 5, z: 1, width: 4, depth: 4 },
                  requiredMaterials: [],
                  outputMaterials: [],
                  npcInteraction: false
                }
              ]
            }
          ],
          stairs: []
        }
      ],
      services: ['residence', 'private_crafting'],
      npcRoles: ['citizen', 'family_member'],
      operatingHours: [0, 24], // Residential
      customerCapacity: 6
    });
    
    log.info('Building templates initialized', {
      totalTemplates: this.templates.size,
      types: Array.from(this.templates.keys())
    });
  }
  
  /**
   * Generate settlement with Daggerfall-style functional placement
   */
  generateSettlement(
    centerPosition: THREE.Vector3,
    populationSize: number,
    terrainHeightData: Float32Array
  ): Entity<WorldSchema> {
    
    const perf = measurePerformance(`Settlement Generation at ${centerPosition.toArray()}`);
    
    log.info('Generating functional settlement', {
      center: centerPosition.toArray(),
      targetPopulation: populationSize,
      terrainSize: terrainHeightData.length
    });
    
    // Create settlement entity
    const settlement = this.world.add({
      transform: {
        position: centerPosition.clone(),
        rotation: new THREE.Euler(0, 0, 0),
        scale: new THREE.Vector3(1, 1, 1)
      },
      building: {
        type: 'settlement',
        width: 200, // Settlement radius
        height: 0,
        depth: 200,
        hasInterior: false,
        doors: []
      }
    });
    
    this.settlements.push(settlement);
    
    // Phase 1: Essential services (inner ring)
    const essentialServices = [BuildingType.GENERAL_STORE, BuildingType.TAVERN, BuildingType.BLACKSMITH, BuildingType.TEMPLE];
    const servicePositions = this.generateServiceRing(centerPosition, 30, essentialServices.length);
    
    for (let i = 0; i < essentialServices.length; i++) {
      const building = this.generateBuilding(essentialServices[i], servicePositions[i], terrainHeightData);
      this.buildings.push(building);
    }
    
    // Phase 2: Residential ring
    const residenceCount = Math.max(6, Math.floor(populationSize / 4));
    const residencePositions = this.generateResidentialRing(centerPosition, 60, residenceCount);
    
    for (const position of residencePositions) {
      const houseType = this.selectHouseType(position, centerPosition);
      const building = this.generateBuilding(houseType, position, terrainHeightData);
      this.buildings.push(building);
    }
    
    perf.end();
    
    log.info('Settlement generation complete', {
      essentialServices: essentialServices.length,
      residences: residenceCount,
      totalBuildings: this.buildings.length
    });
    
    return settlement;
  }
  
  private generateServiceRing(center: THREE.Vector3, radius: number, count: number): THREE.Vector3[] {
    const positions: THREE.Vector3[] = [];
    
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const jitter = (this.buildingNoise.noise2D(i * 10, center.x * 0.01) * 0.5) * 15;
      
      const position = new THREE.Vector3(
        center.x + Math.cos(angle) * (radius + jitter),
        0, // Will be adjusted to terrain
        center.z + Math.sin(angle) * (radius + jitter)
      );
      
      positions.push(position);
    }
    
    return positions;
  }
  
  private generateResidentialRing(center: THREE.Vector3, baseRadius: number, count: number): THREE.Vector3[] {
    const positions: THREE.Vector3[] = [];
    
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (Math.PI / count); // Offset from services
      const radiusVariation = this.buildingNoise.noise2D(i * 5, center.z * 0.01) * 20;
      const radius = baseRadius + radiusVariation;
      
      const position = new THREE.Vector3(
        center.x + Math.cos(angle) * radius,
        0,
        center.z + Math.sin(angle) * radius
      );
      
      positions.push(position);
    }
    
    return positions;
  }
  
  private selectHouseType(position: THREE.Vector3, center: THREE.Vector3): BuildingType {
    const distanceFromCenter = position.distanceTo(center);
    
    // Wealthier houses closer to center
    if (distanceFromCenter < 50) {
      return BuildingType.HOUSE_LARGE;
    } else if (distanceFromCenter < 80) {
      return BuildingType.HOUSE_MEDIUM;  
    } else {
      return BuildingType.HOUSE_SMALL;
    }
  }
  
  /**
   * Generate individual building with full interior
   */
  generateBuilding(
    type: BuildingType,
    position: THREE.Vector3,
    terrainHeightData: Float32Array
  ): Entity<WorldSchema> {
    
    const template = this.templates.get(type);
    if (!template) {
      throw new Error(`No template found for building type: ${type}`);
    }
    
    const perf = measurePerformance(`Building Generation: ${template.name}`);
    
    log.info('Generating functional building', {
      type: template.name,
      position: position.toArray(),
      dimensions: template.dimensions
    });
    
    // Adjust position to terrain height
    const terrainY = this.sampleTerrainHeight(position.x, position.z, terrainHeightData);
    position.y = terrainY;
    
    // Create building mesh with proper materials
    const buildingMesh = this.createBuildingMesh(template);
    buildingMesh.position.copy(position);
    
    // Generate interior geometry
    const interiorMesh = this.generateInterior(template);
    interiorMesh.position.copy(position);
    
    // Create doors with collision detection
    const doors = this.createDoors(template, position);
    
    // Create ECS entity
    const building = this.world.add({
      transform: {
        position: position.clone(),
        rotation: new THREE.Euler(0, Math.random() * Math.PI * 0.25 - Math.PI * 0.125, 0), // Slight random rotation
        scale: new THREE.Vector3(1, 1, 1)
      },
      building: {
        type: template.type as any,
        width: template.dimensions.width,
        height: template.dimensions.height,
        depth: template.dimensions.depth,
        hasInterior: true,
        doors: doors.map(door => ({ position: door.position, open: false }))
      },
      render: {
        mesh: buildingMesh,
        material: buildingMesh.material as THREE.Material,
        visible: true,
        castShadow: true,
        receiveShadow: true
      }
    });
    
    // Store template data for interior access
    (building as any).buildingTemplate = template;
    (building as any).interiorMesh = interiorMesh;
    (building as any).doorSpecs = doors;
    
    perf.end();
    
    log.info('Functional building generated', {
      type: template.name,
      floors: template.floors.length,
      rooms: template.floors.reduce((sum, floor) => sum + floor.rooms.length, 0),
      doors: doors.length,
      services: template.services
    });
    
    return building;
  }
  
  private createBuildingMesh(template: BuildingTemplate): THREE.Group {
    const group = new THREE.Group();
    
    // Main structure
    const mainGeometry = new THREE.BoxGeometry(
      template.dimensions.width,
      template.dimensions.height, 
      template.dimensions.depth
    );
    
    // Get appropriate material based on template requirements
    const materialType = template.materialRequirements[0]; // Primary material
    const material = this.getMaterialForType(materialType);
    
    const mainStructure = new THREE.Mesh(mainGeometry, material);
    mainStructure.position.y = template.dimensions.height / 2;
    mainStructure.castShadow = true;
    mainStructure.receiveShadow = true;
    group.add(mainStructure);
    
    // Roof
    const roofGeometry = new THREE.ConeGeometry(
      Math.max(template.dimensions.width, template.dimensions.depth) * 0.6,
      template.dimensions.height * 0.3,
      4
    );
    
    const roofMaterial = new THREE.MeshLambertMaterial({ color: 0x8B0000 }); // Red tile
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = template.dimensions.height + template.dimensions.height * 0.15;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    group.add(roof);
    
    // Foundation
    if (template.materialRequirements.includes('stone')) {
      const foundationGeometry = new THREE.BoxGeometry(
        template.dimensions.width + 1,
        2,
        template.dimensions.depth + 1
      );
      
      const foundationMaterial = this.getMaterialForType('stone');
      const foundation = new THREE.Mesh(foundationGeometry, foundationMaterial);
      foundation.position.y = -0.5;
      foundation.castShadow = true;
      foundation.receiveShadow = true;
      group.add(foundation);
    }
    
    return group;
  }
  
  private generateInterior(template: BuildingTemplate): THREE.Group {
    const interiorGroup = new THREE.Group();
    
    for (const floor of template.floors) {
      const floorGroup = new THREE.Group();
      floorGroup.position.y = floor.floor * 4; // 4 units per floor
      
      for (const room of floor.rooms) {
        const roomGroup = this.createRoom(room, template);
        floorGroup.add(roomGroup);
      }
      
      // Add stairs
      for (const stair of floor.stairs) {
        const stairMesh = this.createStairs(stair);
        floorGroup.add(stairMesh);
      }
      
      interiorGroup.add(floorGroup);
    }
    
    return interiorGroup;
  }
  
  private createRoom(room: RoomLayout, template: BuildingTemplate): THREE.Group {
    const roomGroup = new THREE.Group();
    
    // Floor
    const floorGeometry = new THREE.PlaneGeometry(room.bounds.width, room.bounds.depth);
    const floorMaterial = this.getMaterialForType('wood');
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(
      room.bounds.x + room.bounds.width / 2,
      0,
      room.bounds.z + room.bounds.depth / 2
    );
    floor.receiveShadow = true;
    roomGroup.add(floor);
    
    // Walls (simplified - would generate proper wall meshes in production)
    const wallHeight = 3;
    const wallMaterial = this.getMaterialForType(template.materialRequirements[0]);
    
    // Four walls
    const walls = [
      { pos: [room.bounds.x + room.bounds.width/2, wallHeight/2, room.bounds.z], size: [room.bounds.width, wallHeight, 0.2] },
      { pos: [room.bounds.x + room.bounds.width/2, wallHeight/2, room.bounds.z + room.bounds.depth], size: [room.bounds.width, wallHeight, 0.2] },
      { pos: [room.bounds.x, wallHeight/2, room.bounds.z + room.bounds.depth/2], size: [0.2, wallHeight, room.bounds.depth] },
      { pos: [room.bounds.x + room.bounds.width, wallHeight/2, room.bounds.z + room.bounds.depth/2], size: [0.2, wallHeight, room.bounds.depth] }
    ];
    
    for (const wall of walls) {
      const wallGeometry = new THREE.BoxGeometry(...wall.size);
      const wallMesh = new THREE.Mesh(wallGeometry, wallMaterial);
      wallMesh.position.set(...wall.pos);
      wallMesh.castShadow = true;
      wallMesh.receiveShadow = true;
      roomGroup.add(wallMesh);
    }
    
    // Add furniture
    for (const furnitureSpec of room.furniture) {
      const furnitureMesh = this.createFurniture(furnitureSpec);
      roomGroup.add(furnitureMesh);
    }
    
    return roomGroup;
  }
  
  private createDoors(template: BuildingTemplate, buildingPosition: THREE.Vector3): DoorSpec[] {
    const doors: DoorSpec[] = [];
    
    for (const floor of template.floors) {
      for (const room of floor.rooms) {
        for (const doorSpec of room.doors) {
          if (doorSpec.opensTo === 'exterior') {
            // Exterior door
            doors.push({
              position: buildingPosition.clone().add(doorSpec.position),
              rotation: doorSpec.rotation,
              opensTo: doorSpec.opensTo,
              material: doorSpec.material,
              lockable: doorSpec.lockable
            });
          }
        }
      }
    }
    
    return doors;
  }
  
  private createFurniture(spec: FurnitureSpec): THREE.Group {
    const furnitureGroup = new THREE.Group();
    
    let geometry: THREE.BufferGeometry;
    const material = this.getMaterialForType(spec.material);
    
    switch (spec.type) {
      case 'counter':
        geometry = new THREE.BoxGeometry(2, 0.8, 0.6);
        break;
      case 'table':
        geometry = new THREE.BoxGeometry(1.2, 0.05, 0.8);
        break;
      case 'chair':
        geometry = new THREE.BoxGeometry(0.4, 0.8, 0.4);
        break;
      case 'bed':
        geometry = new THREE.BoxGeometry(0.8, 0.2, 1.8);
        break;
      case 'anvil':
        geometry = new THREE.BoxGeometry(0.6, 0.8, 0.4);
        break;
      case 'cauldron':
        geometry = new THREE.CylinderGeometry(0.3, 0.4, 0.6);
        break;
      case 'shelf':
        geometry = new THREE.BoxGeometry(1.5, 1.6, 0.3);
        break;
      default:
        geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    }
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(spec.position);
    mesh.rotation.y = spec.rotation;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    // Mark functional furniture for interaction
    if (spec.functional) {
      mesh.userData.functional = true;
      mesh.userData.furnitureType = spec.type;
    }
    
    furnitureGroup.add(mesh);
    return furnitureGroup;
  }
  
  private createStairs(stairSpec: { from: THREE.Vector3; to: THREE.Vector3 }): THREE.Group {
    const stairGroup = new THREE.Group();
    
    const direction = stairSpec.to.clone().sub(stairSpec.from).normalize();
    const distance = stairSpec.from.distanceTo(stairSpec.to);
    const stepCount = Math.ceil(distance / 0.3); // Step every 0.3 units
    
    for (let i = 0; i < stepCount; i++) {
      const stepPosition = stairSpec.from.clone().add(
        direction.clone().multiplyScalar(i * distance / stepCount)
      );
      
      const stepGeometry = new THREE.BoxGeometry(1, 0.2, 0.3);
      const stepMaterial = this.getMaterialForType('wood');
      const step = new THREE.Mesh(stepGeometry, stepMaterial);
      step.position.copy(stepPosition);
      step.castShadow = true;
      step.receiveShadow = true;
      
      stairGroup.add(step);
    }
    
    return stairGroup;
  }
  
  private getMaterialForType(materialType: string): THREE.Material {
    // Would use TextureSystem in production, simplified for now
    const colorMap: Record<string, number> = {
      'wood': 0x8B4513,
      'stone': 0x696969,
      'metal': 0xC0C0C0,
      'fabric': 0xDEB887
    };
    
    return new THREE.MeshLambertMaterial({ 
      color: colorMap[materialType] || 0x888888 
    });
  }
  
  private sampleTerrainHeight(worldX: number, worldZ: number, heightData: Float32Array): number {
    // Simplified height sampling
    const resolution = Math.sqrt(heightData.length);
    const localX = Math.floor((worldX + 512) / 1024 * resolution);
    const localZ = Math.floor((worldZ + 512) / 1024 * resolution);
    const idx = Math.max(0, Math.min(resolution - 1, localZ)) * resolution + Math.max(0, Math.min(resolution - 1, localX));
    
    return heightData[idx] || 0;
  }
  
  /**
   * Check if position is inside any building
   */
  isInsideBuilding(position: THREE.Vector3): { building: Entity<WorldSchema>; room?: RoomLayout } | null {
    for (const building of this.buildings) {
      if (!building.transform || !building.building) continue;
      
      const buildingPos = building.transform.position;
      const buildingSize = { 
        width: building.building.width, 
        depth: building.building.depth 
      };
      
      // Check if position is within building bounds
      if (
        position.x >= buildingPos.x - buildingSize.width / 2 &&
        position.x <= buildingPos.x + buildingSize.width / 2 &&
        position.z >= buildingPos.z - buildingSize.depth / 2 &&
        position.z <= buildingPos.z + buildingSize.depth / 2
      ) {
        
        // Find which room if any
        const template = (building as any).buildingTemplate as BuildingTemplate;
        if (template) {
          const room = this.findRoomAtPosition(position, template, buildingPos);
          return { building, room };
        }
        
        return { building };
      }
    }
    
    return null;
  }
  
  private findRoomAtPosition(
    position: THREE.Vector3, 
    template: BuildingTemplate, 
    buildingPos: THREE.Vector3
  ): RoomLayout | undefined {
    
    const localPos = position.clone().sub(buildingPos);
    
    for (const floor of template.floors) {
      const floorY = floor.floor * 4;
      
      if (localPos.y >= floorY && localPos.y <= floorY + 4) {
        for (const room of floor.rooms) {
          if (
            localPos.x >= room.bounds.x &&
            localPos.x <= room.bounds.x + room.bounds.width &&
            localPos.z >= room.bounds.z &&
            localPos.z <= room.bounds.z + room.bounds.depth
          ) {
            return room;
          }
        }
      }
    }
    
    return undefined;
  }
  
  /**
   * Get all crafting stations in settlement
   */
  getCraftingStations(): Array<{
    building: Entity<WorldSchema>;
    room: RoomLayout;
    station: FunctionalAreaSpec;
    position: THREE.Vector3;
  }> {
    
    const stations: Array<{
      building: Entity<WorldSchema>;
      room: RoomLayout;
      station: FunctionalAreaSpec;
      position: THREE.Vector3;
    }> = [];
    
    for (const building of this.buildings) {
      const template = (building as any).buildingTemplate as BuildingTemplate;
      if (!template || !building.transform) continue;
      
      for (const floor of template.floors) {
        for (const room of floor.rooms) {
          for (const area of room.functionalAreas) {
            if (area.type === 'crafting_station') {
              const stationPosition = building.transform.position.clone().add(
                new THREE.Vector3(
                  area.bounds.x + area.bounds.width / 2,
                  floor.floor * 4,
                  area.bounds.z + area.bounds.depth / 2
                )
              );
              
              stations.push({
                building,
                room,
                station: area,
                position: stationPosition
              });
            }
          }
        }
      }
    }
    
    return stations;
  }
  
  update(deltaTime: number): void {
    // Building system doesn't need regular updates
    // Could handle door animations, lighting changes, NPC scheduling here
  }
}

export default BuildingSystem;
export { BuildingType, RoomType, type BuildingTemplate, type RoomLayout, type DoorSpec, type FurnitureSpec };