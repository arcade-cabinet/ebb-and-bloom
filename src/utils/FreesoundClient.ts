/**
 * Modern TypeScript Freesound API Client
 * 
 * Adapted from freesound.js with:
 * - Full TypeScript support
 * - Modern async/await patterns
 * - Integration with Ebb & Bloom audio manifest system
 * - Support for procedural/incidental audio generation
 */

export interface FreesoundConfig {
  apiKey: string;
  host?: string;
}

export interface FreesoundSearchParams {
  query: string;
  filter?: string;
  sort?: 'score' | 'duration_asc' | 'duration_desc' | 'created_asc' | 'created_desc';
  page?: number;
  pageSize?: number;
  fields?: string[];
  descriptors?: string;
}

export interface FreesoundSound {
  id: number;
  name: string;
  tags: string[];
  description: string;
  created: string;
  license: string;
  username: string;
  download?: string;
  previews: {
    'preview-hq-mp3'?: string;
    'preview-hq-ogg'?: string;
    'preview-lq-mp3'?: string;
    'preview-lq-ogg'?: string;
    'preview-hq-wav'?: string;
    'preview-lq-wav'?: string;
  };
  images?: {
    waveform_m?: string;
    waveform_l?: string;
    spectral_m?: string;
    spectral_l?: string;
  };
  duration: number;
  filesize: number;
  bitrate?: number;
  bitdepth?: number;
  samplerate?: number;
  geotag?: {
    lat: number;
    lon: number;
  };
  type?: string;
  pack?: string;
  pack_name?: string;
  pack_id?: number;
  num_downloads?: number;
  avg_rating?: number;
  num_ratings?: number;
  rate?: string;
  comments?: string;
  num_comments?: number;
  comment?: string;
  similar_sounds?: string;
  analysis?: {
    lowlevel?: Record<string, unknown>;
    rhythm?: Record<string, unknown>;
    tonal?: Record<string, unknown>;
    sfx?: Record<string, unknown>;
  };
  analysis_frames?: string;
  analysis_stats?: string;
  ac_analysis?: Record<string, unknown>;
}

export interface FreesoundSearchResult {
  count: number;
  next?: string;
  previous?: string;
  results: FreesoundSound[];
}

export interface FreesoundCollection<T> {
  count: number;
  next?: string;
  previous?: string;
  results: T[];
  nextPage?: () => Promise<FreesoundCollection<T>>;
  previousPage?: () => Promise<FreesoundCollection<T>>;
  getItem?: (index: number) => T;
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

export class FreesoundClient {
  private apiKey: string;
  private host: string;
  private baseUrl: string;

  constructor(config: FreesoundConfig) {
    this.apiKey = config.apiKey;
    this.host = config.host || 'freesound.org';
    this.baseUrl = `https://${this.host}/apiv2`;
  }

  /**
   * Search for sounds on Freesound
   */
  async search(params: FreesoundSearchParams): Promise<FreesoundCollection<FreesoundSound>> {
    const queryParams = new URLSearchParams({
      query: params.query,
      format: 'json',
      ...(params.filter && { filter: params.filter }),
      ...(params.sort && { sort: params.sort }),
      ...(params.page && { page: params.page.toString() }),
      ...(params.pageSize && { page_size: params.pageSize.toString() }),
      ...(params.fields && { fields: params.fields.join(',') }),
      ...(params.descriptors && { descriptors: params.descriptors }),
    });

    const url = `${this.baseUrl}/search/text/?${queryParams.toString()}`;
    const response = await this.makeRequest<FreesoundSearchResult>(url);

    return this.wrapCollection(response, (sound) => sound);
  }

  /**
   * Get sound details by ID
   */
  async getSound(soundId: number, fields?: string[]): Promise<FreesoundSound> {
    const queryParams = new URLSearchParams({
      format: 'json',
      ...(fields && { fields: fields.join(',') }),
    });

    const url = `${this.baseUrl}/sounds/${soundId}/?${queryParams.toString()}`;
    return this.makeRequest<FreesoundSound>(url);
  }

  /**
   * Get similar sounds
   */
  async getSimilarSounds(soundId: number, params?: { page?: number; pageSize?: number }): Promise<FreesoundCollection<FreesoundSound>> {
    const queryParams = new URLSearchParams({
      format: 'json',
      ...(params?.page && { page: params.page.toString() }),
      ...(params?.pageSize && { page_size: params.pageSize.toString() }),
    });

    const url = `${this.baseUrl}/sounds/${soundId}/similar/?${queryParams.toString()}`;
    const response = await this.makeRequest<FreesoundSearchResult>(url);

    return this.wrapCollection(response, (sound) => sound);
  }

  /**
   * Get sound analysis data
   */
  async getSoundAnalysis(soundId: number, filter?: string, showAll = false): Promise<Record<string, unknown>> {
    const queryParams = new URLSearchParams({
      format: 'json',
      ...(showAll && { all: '1' }),
    });

    const url = `${this.baseUrl}/sounds/${soundId}/analysis/${filter || ''}?${queryParams.toString()}`;
    return this.makeRequest<Record<string, unknown>>(url);
  }

  /**
   * Download sound preview URL (for OAuth users, use download endpoint)
   */
  getPreviewUrl(sound: FreesoundSound, quality: 'hq' | 'lq' = 'hq', format: 'ogg' | 'mp3' | 'wav' = 'ogg'): string | null {
    const key = `preview-${quality}-${format}` as keyof FreesoundSound['previews'];
    return sound.previews[key] || null;
  }

  /**
   * Convert Freesound sound to AudioManifestEntry
   */
  toManifestEntry(
    sound: FreesoundSound,
    category: AudioManifestEntry['category'],
    query?: string,
    usage?: AudioManifestEntry['usage']
  ): AudioManifestEntry {
    // Prefer OGG for web, fallback to MP3
    const previewUrl = this.getPreviewUrl(sound, 'hq', 'ogg') || 
                      this.getPreviewUrl(sound, 'hq', 'mp3') ||
                      this.getPreviewUrl(sound, 'lq', 'ogg') ||
                      this.getPreviewUrl(sound, 'lq', 'mp3');

    const fileExtension = previewUrl?.split('.').pop()?.split('?')[0] || 'ogg';
    const fileName = `${category}-${sound.id}.${fileExtension}`;

    return {
      id: `${category}-${sound.id}`,
      name: sound.name,
      category,
      source: {
        type: 'freesound',
        freesoundId: sound.id,
        ...(query && { query }),
      },
      files: {
        [fileExtension]: `/audio/${fileName}`,
      },
      metadata: {
        duration: sound.duration,
        size: sound.filesize,
        checksum: '', // Will be calculated after download
        generated: new Date().toISOString(),
        tags: sound.tags,
        license: sound.license,
        bitrate: sound.bitrate,
        samplerate: sound.samplerate,
      },
      ...(usage && { usage }),
    };
  }

  /**
   * Search and convert to manifest entries
   */
  async searchForManifest(
    query: string,
    category: AudioManifestEntry['category'],
    count: number = 5,
    usage?: AudioManifestEntry['usage']
  ): Promise<AudioManifestEntry[]> {
    const searchResult = await this.search({
      query,
      pageSize: count,
      filter: 'duration:[0.1 TO 10]', // 0.1 to 10 seconds for game audio
      sort: 'score',
      fields: ['id', 'name', 'tags', 'duration', 'filesize', 'previews', 'license', 'bitrate', 'samplerate'],
    });

    return searchResult.results.map((sound) => 
      this.toManifestEntry(sound, category, query, usage)
    );
  }

  /**
   * Make HTTP request with authentication
   */
  private async makeRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Token ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Freesound API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
  }

  /**
   * Wrap collection with pagination helpers
   */
  private wrapCollection<T, R>(
    result: FreesoundSearchResult,
    mapper: (item: FreesoundSound) => T
  ): FreesoundCollection<T> {
    const collection: FreesoundCollection<T> = {
      count: result.count,
      next: result.next,
      previous: result.previous,
      results: result.results.map(mapper),
    };

    if (result.next) {
      collection.nextPage = async () => {
        const response = await fetch(result.next!, {
          headers: {
            'Authorization': `Token ${this.apiKey}`,
          },
        });
        const nextResult = await response.json();
        return this.wrapCollection(nextResult, mapper);
      };
    }

    if (result.previous) {
      collection.previousPage = async () => {
        const response = await fetch(result.previous!, {
          headers: {
            'Authorization': `Token ${this.apiKey}`,
          },
        });
        const prevResult = await response.json();
        return this.wrapCollection(prevResult, mapper);
      };
    }

    collection.getItem = (index: number) => collection.results[index];

    return collection;
  }
}

/**
 * Procedural audio generator for incidental sounds
 * Uses Web Audio API to generate simple procedural sounds
 */
export class ProceduralAudioGenerator {
  /**
   * Generate a simple tone
   */
  static async generateTone(
    frequency: number,
    duration: number,
    type: OscillatorType = 'sine'
  ): Promise<AudioBuffer> {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const sampleRate = audioContext.sampleRate;
    const frameCount = sampleRate * duration;
    const buffer = audioContext.createBuffer(1, frameCount, sampleRate);
    const channelData = buffer.getChannelData(0);

    for (let i = 0; i < frameCount; i++) {
      const t = i / sampleRate;
      channelData[i] = Math.sin(2 * Math.PI * frequency * t);
    }

    return buffer;
  }

  /**
   * Generate noise with envelope
   */
  static async generateNoise(
    duration: number,
    envelope: { attack: number; decay: number; sustain: number; release: number }
  ): Promise<AudioBuffer> {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const sampleRate = audioContext.sampleRate;
    const frameCount = sampleRate * duration;
    const buffer = audioContext.createBuffer(1, frameCount, sampleRate);
    const channelData = buffer.getChannelData(0);

    const attackFrames = sampleRate * envelope.attack;
    const decayFrames = sampleRate * envelope.decay;
    const sustainFrames = sampleRate * envelope.sustain;
    const releaseFrames = sampleRate * envelope.release;

    for (let i = 0; i < frameCount; i++) {
      let amplitude = 0;
      
      if (i < attackFrames) {
        amplitude = i / attackFrames;
      } else if (i < attackFrames + decayFrames) {
        amplitude = 1 - (i - attackFrames) / decayFrames * 0.3;
      } else if (i < attackFrames + decayFrames + sustainFrames) {
        amplitude = 0.7;
      } else {
        const releaseIndex = i - (attackFrames + decayFrames + sustainFrames);
        amplitude = 0.7 * (1 - releaseIndex / releaseFrames);
      }

      channelData[i] = (Math.random() * 2 - 1) * amplitude;
    }

    return buffer;
  }

  /**
   * Create manifest entry for procedural audio
   */
  static createProceduralManifestEntry(
    id: string,
    name: string,
    category: AudioManifestEntry['category'],
    duration: number,
    usage?: AudioManifestEntry['usage']
  ): AudioManifestEntry {
    return {
      id: `procedural-${id}`,
      name,
      category,
      source: {
        type: 'procedural',
      },
      files: {
        // Procedural audio is generated at runtime, no file
      },
      metadata: {
        duration,
        size: 0, // Generated at runtime
        checksum: '', // Not applicable
        generated: new Date().toISOString(),
      },
      ...(usage && { usage }),
    };
  }
}

/**
 * Audio manifest manager
 * Manages procedural and incidental audio entries similar to AI asset manifest
 */
export class AudioManifestManager {
  private manifestPath: string;

  constructor(manifestPath: string = './public/assets/audio-manifest.json') {
    this.manifestPath = manifestPath;
  }

  /**
   * Load audio manifest
   */
  async loadManifest(): Promise<{ version: string; generated: string; audio: AudioManifestEntry[] }> {
    try {
      const fs = await import('fs/promises');
      const data = await fs.readFile(this.manifestPath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return {
        version: '1.0.0',
        generated: new Date().toISOString(),
        audio: [],
      };
    }
  }

  /**
   * Save audio manifest
   */
  async saveManifest(manifest: { version: string; generated: string; audio: AudioManifestEntry[] }): Promise<void> {
    const fs = await import('fs/promises');
    await fs.writeFile(this.manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
  }

  /**
   * Add audio entry to manifest
   */
  async addEntry(entry: AudioManifestEntry): Promise<void> {
    const manifest = await this.loadManifest();
    
    // Check if entry already exists
    const existingIndex = manifest.audio.findIndex((a) => a.id === entry.id);
    if (existingIndex >= 0) {
      manifest.audio[existingIndex] = entry;
    } else {
      manifest.audio.push(entry);
    }

    manifest.generated = new Date().toISOString();
    await this.saveManifest(manifest);
  }

  /**
   * Get entries by category
   */
  async getEntriesByCategory(category: AudioManifestEntry['category']): Promise<AudioManifestEntry[]> {
    const manifest = await this.loadManifest();
    return manifest.audio.filter((entry) => entry.category === category);
  }

  /**
   * Get entries by usage context
   */
  async getEntriesByContext(context: string): Promise<AudioManifestEntry[]> {
    const manifest = await this.loadManifest();
    return manifest.audio.filter((entry) => 
      entry.usage?.contexts?.includes(context)
    );
  }
}
