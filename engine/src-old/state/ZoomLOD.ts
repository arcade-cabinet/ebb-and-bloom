/**
 * Zoom Level-of-Detail System
 * 
 * Defines hierarchical zoom levels and thresholds for agent spawning.
 * Like visual LOD, but for simulation - only spawn agents at visible scales.
 */

export enum ZoomLevel {
  COSMIC = 'cosmic',       // 1e9 - 1e12 ly (EntropyAgent only)
  GALACTIC = 'galactic',   // 1e6 - 1e9 ly (Galaxy agents)
  STELLAR = 'stellar',     // 1 - 1e6 ly (Stellar agents)
  PLANETARY = 'planetary', // 1000 - 1M km (Planetary agents)
  SURFACE = 'surface',     // 1 - 1000 km (Creature agents)
}

/**
 * Zoom level configuration
 */
export interface ZoomLevelConfig {
  level: ZoomLevel;
  minDistance: number; // Camera distance threshold (arbitrary units)
  maxDistance: number;
  agentTypes: string[]; // Which agent types to spawn at this level
  hudTitle: string;
  hudIcon: string;
  maxAgents: number; // Performance limit
}

/**
 * Zoom level configurations
 * Distance units are arbitrary (Babylon camera radius)
 */
export const ZOOM_LEVELS: Record<ZoomLevel, ZoomLevelConfig> = {
  [ZoomLevel.COSMIC]: {
    level: ZoomLevel.COSMIC,
    minDistance: 1000,
    maxDistance: Infinity,
    agentTypes: ['entropy'],
    hudTitle: 'UNIVERSE',
    hudIcon: '🌌',
    maxAgents: 1,
  },
  [ZoomLevel.GALACTIC]: {
    level: ZoomLevel.GALACTIC,
    minDistance: 500,
    maxDistance: 1000,
    agentTypes: ['entropy', 'galaxy'],
    hudTitle: 'GALAXY VIEW',
    hudIcon: '🌀',
    maxAgents: 10,
  },
  [ZoomLevel.STELLAR]: {
    level: ZoomLevel.STELLAR,
    minDistance: 100,
    maxDistance: 500,
    agentTypes: ['entropy', 'galaxy', 'stellar'],
    hudTitle: 'STELLAR VIEW',
    hudIcon: '⭐',
    maxAgents: 100,
  },
  [ZoomLevel.PLANETARY]: {
    level: ZoomLevel.PLANETARY,
    minDistance: 20,
    maxDistance: 100,
    agentTypes: ['entropy', 'galaxy', 'stellar', 'planetary'],
    hudTitle: 'PLANETARY VIEW',
    hudIcon: '🪐',
    maxAgents: 1000,
  },
  [ZoomLevel.SURFACE]: {
    level: ZoomLevel.SURFACE,
    minDistance: 0,
    maxDistance: 20,
    agentTypes: ['entropy', 'galaxy', 'stellar', 'planetary', 'creature'],
    hudTitle: 'SURFACE VIEW',
    hudIcon: '🦖',
    maxAgents: 10000,
  },
};

/**
 * Get zoom level from camera distance
 */
export function getZoomLevelFromCameraDistance(distance: number): ZoomLevel {
  if (distance >= ZOOM_LEVELS[ZoomLevel.COSMIC].minDistance) {
    return ZoomLevel.COSMIC;
  }
  if (distance >= ZOOM_LEVELS[ZoomLevel.GALACTIC].minDistance) {
    return ZoomLevel.GALACTIC;
  }
  if (distance >= ZOOM_LEVELS[ZoomLevel.STELLAR].minDistance) {
    return ZoomLevel.STELLAR;
  }
  if (distance >= ZOOM_LEVELS[ZoomLevel.PLANETARY].minDistance) {
    return ZoomLevel.PLANETARY;
  }
  return ZoomLevel.SURFACE;
}

/**
 * Check if zooming in (toward more detail)
 */
export function isZoomingIn(oldLevel: ZoomLevel, newLevel: ZoomLevel): boolean {
  const levels = [
    ZoomLevel.COSMIC,
    ZoomLevel.GALACTIC,
    ZoomLevel.STELLAR,
    ZoomLevel.PLANETARY,
    ZoomLevel.SURFACE,
  ];
  
  const oldIndex = levels.indexOf(oldLevel);
  const newIndex = levels.indexOf(newLevel);
  
  return newIndex > oldIndex;
}

/**
 * Check if zooming out (toward less detail)
 */
export function isZoomingOut(oldLevel: ZoomLevel, newLevel: ZoomLevel): boolean {
  const levels = [
    ZoomLevel.COSMIC,
    ZoomLevel.GALACTIC,
    ZoomLevel.STELLAR,
    ZoomLevel.PLANETARY,
    ZoomLevel.SURFACE,
  ];
  
  const oldIndex = levels.indexOf(oldLevel);
  const newIndex = levels.indexOf(newLevel);
  
  return newIndex < oldIndex;
}

/**
 * Get scale factor for marker queries
 * (physical scale in meters at each zoom level)
 */
export function getScaleForLevel(level: ZoomLevel): number {
  switch (level) {
    case ZoomLevel.COSMIC:
      return 1e25;  // 1 Gly scale
    case ZoomLevel.GALACTIC:
      return 1e22;  // 100 kly scale
    case ZoomLevel.STELLAR:
      return 1e16;  // 1 ly scale
    case ZoomLevel.PLANETARY:
      return 1e9;   // 1 Gm scale
    case ZoomLevel.SURFACE:
      return 1e3;   // 1 km scale
  }
}

/**
 * Convert zoom level to HUD info scale
 */
export function zoomLevelToInfoScale(level: ZoomLevel): 'cosmic' | 'galactic' | 'stellar' | 'planetary' | 'surface' {
  return level;
}

/**
 * Get agent types that should spawn at this level
 */
export function getAgentTypesForLevel(level: ZoomLevel): string[] {
  return ZOOM_LEVELS[level].agentTypes;
}

/**
 * Get maximum agents allowed at this level
 */
export function getMaxAgentsForLevel(level: ZoomLevel): number {
  return ZOOM_LEVELS[level].maxAgents;
}

/**
 * Get HUD config for level
 */
export function getHUDConfigForLevel(level: ZoomLevel): { title: string; icon: string } {
  const config = ZOOM_LEVELS[level];
  return {
    title: config.hudTitle,
    icon: config.hudIcon,
  };
}

/**
 * Threshold for zoom change detection (prevent jitter)
 */
export const ZOOM_CHANGE_THRESHOLD = 5; // Camera distance units

/**
 * Marker query radius (how far to look for markers when zooming in)
 */
export const MARKER_RADIUS = 10000; // Physical units (meters)

