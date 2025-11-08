/**
 * Miniplex ECS World Setup
 * Proper organization of components, entities, and systems
 */

import { World } from 'miniplex';
import * as THREE from 'three';
import * as YUKA from 'yuka';
import { log } from '../utils/Logger';

// Component Definitions
export interface Transform {
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: THREE.Vector3;
}

export interface Movement {
  velocity: THREE.Vector3;
  maxSpeed: number;
  acceleration: number;
}

export interface YukaAgent {
  vehicle: YUKA.Vehicle;
  behaviorType: 'wander' | 'seek' | 'flee' | 'flock';
  homePosition: THREE.Vector3;
  territory: number; // Radius
}

export interface CreatureData {
  species: 'squirrel' | 'rabbit' | 'deer' | 'bird';
  size: number;
  personality: 'curious' | 'shy' | 'aggressive' | 'neutral';
  energy: number;
  mood: number; // -1 to 1
}

export interface RenderData {
  mesh: THREE.Object3D;
  material: THREE.Material;
  visible: boolean;
  castShadow: boolean;
  receiveShadow: boolean;
}

export interface TerrainChunk {
  chunkX: number;
  chunkZ: number;
  heightData: Float32Array;
  geometry: THREE.BufferGeometry;
  loaded: boolean;
}

export interface BuildingData {
  type: 'house' | 'barn' | 'tower' | 'shop';
  width: number;
  height: number;
  depth: number;
  hasInterior: boolean;
  doors: Array<{ position: THREE.Vector3; open: boolean }>;
}

export interface ResourceNode {
  materialType: 'wood' | 'stone' | 'metal' | 'organic';
  quantity: number;
  purity: number;
  magneticRadius: number;
  harvestable: boolean;
}

// World Schema
export type WorldSchema = {
  transform?: Transform;
  movement?: Movement;
  yukaAgent?: YukaAgent;
  creature?: CreatureData;
  render?: RenderData;
  terrain?: TerrainChunk;
  building?: BuildingData;
  resource?: ResourceNode;
  player?: {};
};

// Create ECS World
export const createWorld = (): World<WorldSchema> => {
  log.info('Creating Miniplex ECS world...');
  
  const world = new World<WorldSchema>();
  
  log.info('ECS world created successfully', {
    componentTypes: [
      'Transform', 'Movement', 'YukaAgent', 'CreatureData', 
      'RenderData', 'TerrainChunk', 'BuildingData', 'ResourceNode'
    ]
  });
  
  return world;
};

// World Queries for System Operations
export const createWorldQueries = (world: World<WorldSchema>) => {
  log.info('Creating ECS queries...');
  
  return {
    // Movement system queries
    movingEntities: world.with('transform', 'movement'),
    yukaEntities: world.with('transform', 'yukaAgent'),
    
    // Rendering system queries
    renderableEntities: world.with('transform', 'render'),
    visibleEntities: world.with('transform', 'render')
      .where(e => e.render!.visible),
    
    // Creature system queries  
    allCreatures: world.with('transform', 'creature', 'yukaAgent'),
    activeCreatures: world.with('transform', 'creature', 'yukaAgent')
      .where(e => e.creature!.energy > 0),
    
    // Environment queries
    terrainChunks: world.with('terrain')
      .where(e => e.terrain!.loaded),
    buildings: world.with('transform', 'building'),
    resources: world.with('transform', 'resource')
      .where(e => e.resource!.harvestable),
    
    // Player queries
    player: world.with('transform', 'player')
  };
};

// Global Yuka Manager
export let yukaManager: YUKA.EntityManager;
export let yukaTime: YUKA.Time;

// Initialize Yuka system
export const initializeYuka = () => {
  try {
    log.yuka('Initializing Yuka AI system...');
    yukaManager = new YUKA.EntityManager();
    yukaTime = new YUKA.Time();
    log.yuka('Yuka AI system initialized successfully');
  } catch (error) {
    log.error('Failed to initialize Yuka AI system', error);
    throw error;
  }
};

// World state management
let worldInstance: World<WorldSchema> | null = null;
let worldQueries: ReturnType<typeof createWorldQueries> | null = null;

export const getWorld = (): World<WorldSchema> => {
  if (!worldInstance) {
    worldInstance = createWorld();
    worldQueries = createWorldQueries(worldInstance);
    initializeYuka();
  }
  return worldInstance;
};

export const getWorldQueries = () => {
  if (!worldQueries) {
    getWorld(); // Initialize if needed
  }
  return worldQueries!;
};