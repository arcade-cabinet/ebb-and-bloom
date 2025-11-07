/**
 * Procedural Audio Manifest - Complete audio strategy for Ebb & Bloom
 * Defines Freesound queries, procedural generation needs, and usage contexts
 */

export interface AudioManifestDefinition {
  id: string;
  name: string;
  category: 'evolution' | 'environment' | 'ui' | 'creature' | 'procedural' | 'incidental';
  priority: 'critical' | 'high' | 'medium' | 'low';
  
  // Source configuration
  source: {
    type: 'freesound' | 'procedural' | 'hybrid';
    freesoundQuery?: string;
    freesoundTags?: string[];
    proceduralType?: 'tone' | 'noise' | 'sweep' | 'pulse' | 'chord';
    proceduralParams?: Record<string, any>;
  };
  
  // Usage context
  usage: {
    contexts: string[]; // When to play this sound
    volume: number; // 0.0 to 1.0
    loop: boolean;
    fadeIn?: number; // seconds
    fadeOut?: number; // seconds
    spatial?: boolean; // 3D positional audio
    priority?: number; // 0-10, higher = more important
  };
  
  // Quality requirements
  requirements: {
    duration?: { min: number; max: number }; // seconds
    sampleRate?: number;
    bitrate?: number;
    format: 'ogg' | 'mp3' | 'wav';
  };
  
  // Procedural variation
  variation?: {
    enabled: boolean;
    pitchRange?: [number, number]; // semitones
    speedRange?: [number, number]; // playback speed multiplier
    volumeRange?: [number, number]; // volume multiplier
  };
}

/**
 * Complete audio manifest for Ebb & Bloom
 * Organized by category and priority
 */
export const AUDIO_MANIFEST: AudioManifestDefinition[] = [
  // ===== EVOLUTION SOUNDS (Critical) =====
  {
    id: 'evolution-trait-emergence',
    name: 'Trait Emergence',
    category: 'evolution',
    priority: 'critical',
    source: {
      type: 'freesound',
      freesoundQuery: 'organic growth biological transformation cellular activity',
      freesoundTags: ['organic', 'growth', 'biological', 'transformation']
    },
    usage: {
      contexts: ['trait_emergence', 'mutation', 'evolution_event'],
      volume: 0.6,
      loop: false,
      fadeIn: 0.2,
      fadeOut: 0.3,
      spatial: false,
      priority: 8
    },
    requirements: {
      duration: { min: 0.5, max: 3.0 },
      format: 'ogg'
    },
    variation: {
      enabled: true,
      pitchRange: [-2, 2],
      speedRange: [0.9, 1.1]
    }
  },
  
  {
    id: 'evolution-generation-advance',
    name: 'Generation Advance',
    category: 'evolution',
    priority: 'critical',
    source: {
      type: 'hybrid',
      freesoundQuery: 'ascending tone progression growth',
      proceduralType: 'sweep',
      proceduralParams: { startFreq: 200, endFreq: 600, duration: 1.5 }
    },
    usage: {
      contexts: ['generation_complete', 'major_evolution'],
      volume: 0.7,
      loop: false,
      spatial: false,
      priority: 9
    },
    requirements: {
      duration: { min: 1.0, max: 2.5 },
      format: 'ogg'
    }
  },
  
  {
    id: 'evolution-synthesis',
    name: 'Material Synthesis',
    category: 'evolution',
    priority: 'high',
    source: {
      type: 'freesound',
      freesoundQuery: 'material combination fusion merge',
      freesoundTags: ['material', 'combination', 'fusion']
    },
    usage: {
      contexts: ['material_synthesis', 'snapping', 'crafting'],
      volume: 0.5,
      loop: false,
      spatial: true,
      priority: 6
    },
    requirements: {
      duration: { min: 0.3, max: 1.5 },
      format: 'ogg'
    }
  },
  
  // ===== ENVIRONMENT SOUNDS (Critical) =====
  {
    id: 'environment-forest-ambience',
    name: 'Forest Ambience',
    category: 'environment',
    priority: 'critical',
    source: {
      type: 'freesound',
      freesoundQuery: 'forest ambience nature background',
      freesoundTags: ['forest', 'ambience', 'nature', 'background']
    },
    usage: {
      contexts: ['environment_ambience', 'biome_forest'],
      volume: 0.4,
      loop: true,
      fadeIn: 2.0,
      fadeOut: 2.0,
      spatial: false,
      priority: 7
    },
    requirements: {
      duration: { min: 30.0, max: 120.0 },
      format: 'ogg'
    }
  },
  
  {
    id: 'environment-water-flow',
    name: 'Water Flow',
    category: 'environment',
    priority: 'high',
    source: {
      type: 'freesound',
      freesoundQuery: 'water flowing stream river',
      freesoundTags: ['water', 'flowing', 'stream', 'river']
    },
    usage: {
      contexts: ['environment_ambience', 'biome_river', 'biome_lake'],
      volume: 0.3,
      loop: true,
      spatial: true,
      priority: 5
    },
    requirements: {
      duration: { min: 10.0, max: 60.0 },
      format: 'ogg'
    }
  },
  
  {
    id: 'environment-wind-trees',
    name: 'Wind Through Trees',
    category: 'environment',
    priority: 'high',
    source: {
      type: 'freesound',
      freesoundQuery: 'wind through trees rustling leaves',
      freesoundTags: ['wind', 'trees', 'rustling', 'leaves']
    },
    usage: {
      contexts: ['environment_ambience', 'biome_forest', 'biome_plains'],
      volume: 0.35,
      loop: true,
      spatial: false,
      priority: 6
    },
    requirements: {
      duration: { min: 15.0, max: 90.0 },
      format: 'ogg'
    }
  },
  
  {
    id: 'environment-pollution-warning',
    name: 'Pollution Warning',
    category: 'environment',
    priority: 'high',
    source: {
      type: 'hybrid',
      freesoundQuery: 'ominous warning danger',
      proceduralType: 'pulse',
      proceduralParams: { frequency: 150, pulseRate: 2.0, duration: 3.0 }
    },
    usage: {
      contexts: ['pollution_shock', 'environmental_warning', 'shock_event'],
      volume: 0.6,
      loop: false,
      spatial: true,
      priority: 8
    },
    requirements: {
      duration: { min: 2.0, max: 5.0 },
      format: 'ogg'
    }
  },
  
  // ===== CREATURE SOUNDS (High) =====
  {
    id: 'creature-pack-coordination',
    name: 'Pack Coordination',
    category: 'creature',
    priority: 'high',
    source: {
      type: 'freesound',
      freesoundQuery: 'animal communication pack coordination social bonding',
      freesoundTags: ['animal', 'communication', 'pack', 'social']
    },
    usage: {
      contexts: ['pack_formation', 'pack_coordination', 'social_interaction'],
      volume: 0.5,
      loop: false,
      spatial: true,
      priority: 7
    },
    requirements: {
      duration: { min: 0.5, max: 2.0 },
      format: 'ogg'
    },
    variation: {
      enabled: true,
      pitchRange: [-3, 3],
      volumeRange: [0.7, 1.0]
    }
  },
  
  {
    id: 'creature-territorial-call',
    name: 'Territorial Call',
    category: 'creature',
    priority: 'medium',
    source: {
      type: 'freesound',
      freesoundQuery: 'territorial call animal warning',
      freesoundTags: ['territorial', 'call', 'animal', 'warning']
    },
    usage: {
      contexts: ['territorial_dispute', 'pack_conflict', 'aggression'],
      volume: 0.6,
      loop: false,
      spatial: true,
      priority: 6
    },
    requirements: {
      duration: { min: 0.3, max: 1.5 },
      format: 'ogg'
    }
  },
  
  {
    id: 'creature-movement-footsteps',
    name: 'Creature Footsteps',
    category: 'creature',
    priority: 'medium',
    source: {
      type: 'freesound',
      freesoundQuery: 'footsteps organic natural ground',
      freesoundTags: ['footsteps', 'organic', 'natural', 'ground']
    },
    usage: {
      contexts: ['creature_movement', 'pack_migration'],
      volume: 0.3,
      loop: false,
      spatial: true,
      priority: 4
    },
    requirements: {
      duration: { min: 0.1, max: 0.5 },
      format: 'ogg'
    },
    variation: {
      enabled: true,
      pitchRange: [-4, 4],
      speedRange: [0.8, 1.2]
    }
  },
  
  // ===== UI SOUNDS (High) =====
  {
    id: 'ui-evolution-notification',
    name: 'Evolution Notification',
    category: 'ui',
    priority: 'high',
    source: {
      type: 'procedural',
      proceduralType: 'tone',
      proceduralParams: { frequency: 440, duration: 0.2, type: 'sine' }
    },
    usage: {
      contexts: ['ui_notification', 'evolution_event_ui'],
      volume: 0.4,
      loop: false,
      spatial: false,
      priority: 5
    },
    requirements: {
      duration: { min: 0.1, max: 0.5 },
      format: 'ogg'
    }
  },
  
  {
    id: 'ui-button-interaction',
    name: 'Button Interaction',
    category: 'ui',
    priority: 'medium',
    source: {
      type: 'procedural',
      proceduralType: 'pulse',
      proceduralParams: { frequency: 800, duration: 0.1, type: 'sine' }
    },
    usage: {
      contexts: ['ui_button', 'ui_interaction'],
      volume: 0.3,
      loop: false,
      spatial: false,
      priority: 3
    },
    requirements: {
      duration: { min: 0.05, max: 0.2 },
      format: 'ogg'
    }
  },
  
  {
    id: 'ui-haiku-appear',
    name: 'Haiku Appear',
    category: 'ui',
    priority: 'medium',
    source: {
      type: 'hybrid',
      freesoundQuery: 'gentle notification nature interaction',
      proceduralType: 'chord',
      proceduralParams: { frequencies: [220, 330, 440], duration: 0.8 }
    },
    usage: {
      contexts: ['haiku_display', 'narrative_event'],
      volume: 0.5,
      loop: false,
      fadeIn: 0.3,
      fadeOut: 0.5,
      spatial: false,
      priority: 6
    },
    requirements: {
      duration: { min: 0.5, max: 1.5 },
      format: 'ogg'
    }
  },
  
  // ===== PROCEDURAL SOUNDS (Medium) =====
  {
    id: 'procedural-material-pickup',
    name: 'Material Pickup',
    category: 'procedural',
    priority: 'medium',
    source: {
      type: 'procedural',
      proceduralType: 'tone',
      proceduralParams: { frequency: 600, duration: 0.15, type: 'triangle' }
    },
    usage: {
      contexts: ['material_pickup', 'resource_collection'],
      volume: 0.4,
      loop: false,
      spatial: true,
      priority: 4
    },
    requirements: {
      duration: { min: 0.1, max: 0.3 },
      format: 'ogg'
    },
    variation: {
      enabled: true,
      pitchRange: [-2, 2]
    }
  },
  
  {
    id: 'procedural-building-construction',
    name: 'Building Construction',
    category: 'procedural',
    priority: 'medium',
    source: {
      type: 'hybrid',
      freesoundQuery: 'construction building assembly',
      proceduralType: 'pulse',
      proceduralParams: { frequency: 300, pulseRate: 3.0, duration: 2.0 }
    },
    usage: {
      contexts: ['building_construction', 'assembly'],
      volume: 0.5,
      loop: false,
      spatial: true,
      priority: 5
    },
    requirements: {
      duration: { min: 1.0, max: 3.0 },
      format: 'ogg'
    }
  },
  
  // ===== INCIDENTAL SOUNDS (Low) =====
  {
    id: 'incidental-ambient-rustle',
    name: 'Ambient Rustle',
    category: 'incidental',
    priority: 'low',
    source: {
      type: 'freesound',
      freesoundQuery: 'rustle leaves movement',
      freesoundTags: ['rustle', 'leaves', 'movement']
    },
    usage: {
      contexts: ['ambient_detail', 'environment_detail'],
      volume: 0.2,
      loop: false,
      spatial: true,
      priority: 2
    },
    requirements: {
      duration: { min: 0.5, max: 2.0 },
      format: 'ogg'
    },
    variation: {
      enabled: true,
      pitchRange: [-5, 5],
      volumeRange: [0.5, 1.0]
    }
  }
];

/**
 * Get audio manifest entries by category
 */
export function getAudioByCategory(category: AudioManifestDefinition['category']): AudioManifestDefinition[] {
  return AUDIO_MANIFEST.filter(entry => entry.category === category);
}

/**
 * Get audio manifest entries by priority
 */
export function getAudioByPriority(priority: AudioManifestDefinition['priority']): AudioManifestDefinition[] {
  return AUDIO_MANIFEST.filter(entry => entry.priority === priority);
}

/**
 * Get audio manifest entries by usage context
 */
export function getAudioByContext(context: string): AudioManifestDefinition[] {
  return AUDIO_MANIFEST.filter(entry => 
    entry.usage.contexts.includes(context)
  );
}

/**
 * Generate Freesound query list for batch download
 */
export function getFreesoundQueries(): Array<{
  query: string;
  category: AudioManifestDefinition['category'];
  count: number;
  tags?: string[];
}> {
  const queries: Map<string, { query: string; category: AudioManifestDefinition['category']; count: number; tags?: string[] }> = new Map();
  
  for (const entry of AUDIO_MANIFEST) {
    if (entry.source.type === 'freesound' || entry.source.type === 'hybrid') {
      if (entry.source.freesoundQuery) {
        const key = `${entry.source.freesoundQuery}-${entry.category}`;
        if (!queries.has(key)) {
          queries.set(key, {
            query: entry.source.freesoundQuery,
            category: entry.category,
            count: entry.priority === 'critical' ? 5 : entry.priority === 'high' ? 3 : 2,
            tags: entry.source.freesoundTags
          });
        }
      }
    }
  }
  
  return Array.from(queries.values());
}

