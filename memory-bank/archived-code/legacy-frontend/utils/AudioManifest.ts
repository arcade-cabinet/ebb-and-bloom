/**
 * Audio Manifest Schema
 * 
 * Defines the structure for procedural and incidental audio assets
 * Similar to game-manifest.json but specifically for audio
 */

export interface AudioManifest {
  version: string;
  generated: string;
  audio: AudioManifestEntry[];
}

export interface AudioManifestEntry {
  id: string;
  name: string;
  category: 'evolution' | 'environment' | 'ui' | 'creature' | 'procedural' | 'incidental';
  source: {
    type: 'freesound' | 'generated' | 'procedural';
    freesoundId?: number;
    prompt?: string;
    query?: string;
  };
  files: {
    ogg?: string;
    mp3?: string;
    wav?: string;
  };
  metadata: {
    duration: number;
    size: number;
    checksum: string;
    generated: string;
    tags?: string[];
    license?: string;
    bitrate?: number;
    samplerate?: number;
  };
  usage?: {
    contexts: string[]; // e.g., ['evolution_morph', 'pack_coordination', 'pollution_shock']
    volume?: number; // 0.0 to 1.0
    loop?: boolean;
    fadeIn?: number; // seconds
    fadeOut?: number; // seconds
  };
}
