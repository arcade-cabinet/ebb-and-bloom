# Modern TypeScript Freesound Client & Audio Manifest System

## Overview

We've modernized the freesound.js library to TypeScript and created a comprehensive audio manifest system for procedural and incidental audio, similar to our AI asset manifest system.

## Files Created

### Core Library
- **`src/utils/FreesoundClient.ts`** - Modern TypeScript Freesound API client
  - Full TypeScript types
  - Modern async/await patterns
  - Collection pagination helpers
  - Integration with audio manifest system
  - Procedural audio generator utilities

- **`src/utils/AudioManifest.ts`** - TypeScript types for audio manifest
  - `AudioManifest` interface
  - `AudioManifestEntry` interface with usage contexts

### Manifest Files
- **`public/assets/audio-manifest.json`** - Audio asset manifest (similar to game-manifest.json)
- **`public/assets/AUDIO_MANIFEST_README.md`** - Documentation

### Updated Files
- **`src/dev/GameDevCLI.ts`** - Updated to use new FreesoundClient

## Key Features

### 1. Modern Freesound Client (`FreesoundClient`)

```typescript
import { FreesoundClient } from './utils/FreesoundClient';

const client = new FreesoundClient({ apiKey: process.env.FREESOUND_API_KEY });

// Search sounds
const results = await client.search({
  query: 'organic growth',
  pageSize: 5,
  filter: 'duration:[0.1 TO 10]',
  sort: 'score'
});

// Get sound details
const sound = await client.getSound(12345);

// Search and convert to manifest entries
const entries = await client.searchForManifest(
  'organic growth',
  'evolution',
  5,
  {
    contexts: ['evolution_morph'],
    volume: 0.6
  }
);
```

### 2. Procedural Audio Generator (`ProceduralAudioGenerator`)

```typescript
import { ProceduralAudioGenerator } from './utils/FreesoundClient';

// Generate tone
const toneBuffer = await ProceduralAudioGenerator.generateTone(440, 1.0, 'sine');

// Generate noise with envelope
const noiseBuffer = await ProceduralAudioGenerator.generateNoise(2.0, {
  attack: 0.1,
  decay: 0.2,
  sustain: 1.5,
  release: 0.2
});

// Create manifest entry for procedural audio
const entry = ProceduralAudioGenerator.createProceduralManifestEntry(
  'pollution-hum',
  'Pollution Hum',
  'procedural',
  0, // Generated at runtime
  {
    contexts: ['pollution_shock'],
    volume: 0.4,
    loop: true
  }
);
```

### 3. Audio Manifest Manager (`AudioManifestManager`)

```typescript
import { AudioManifestManager } from './utils/FreesoundClient';

const manifest = new AudioManifestManager('./public/assets/audio-manifest.json');

// Add entry
await manifest.addEntry(audioEntry);

// Get entries by category
const evolutionSounds = await manifest.getEntriesByCategory('evolution');

// Get entries by usage context
const morphSounds = await manifest.getEntriesByContext('evolution_morph');
```

## Audio Manifest Structure

```json
{
  "version": "1.0.0",
  "generated": "2025-01-08T00:00:00.000Z",
  "audio": [
    {
      "id": "evolution-12345",
      "name": "Organic Growth Ambience",
      "category": "evolution",
      "source": {
        "type": "freesound",
        "freesoundId": 12345,
        "query": "organic growth"
      },
      "files": {
        "ogg": "/audio/evolution-12345.ogg"
      },
      "metadata": {
        "duration": 3.5,
        "size": 45678,
        "checksum": "...",
        "generated": "2025-01-08T00:00:00.000Z",
        "tags": ["organic", "growth"],
        "license": "CC0",
        "bitrate": 128,
        "samplerate": 44100
      },
      "usage": {
        "contexts": ["evolution_morph", "trait_emergence"],
        "volume": 0.6,
        "loop": false,
        "fadeIn": 0.5,
        "fadeOut": 0.5
      }
    }
  ]
}
```

## Usage Contexts

Audio entries can specify where/how they're used:
- `evolution_morph` - Trait evolution events
- `pack_coordination` - Pack formation sounds
- `pollution_shock` - Environmental shock events
- `trait_emergence` - New trait discovery
- `environmental_decay` - Pollution effects
- `snap_success` - Successful resource snapping
- `snap_failure` - Failed snapping attempts

## Integration with GameDevCLI

The `GameDevCLI` now uses the modern FreesoundClient:

```typescript
// Old way (still works)
await cli.downloadFreesoundAudio('organic growth', 'evolution', 5);

// New way with usage contexts
await cli.downloadFreesoundAudio(
  'organic growth',
  'evolution',
  5,
  {
    contexts: ['evolution_morph'],
    volume: 0.6,
    fadeIn: 0.5,
    fadeOut: 0.5
  }
);
```

## Benefits

1. **Type Safety**: Full TypeScript support with proper types
2. **Modern Patterns**: Uses async/await instead of callbacks
3. **Manifest Integration**: Tracks audio assets similar to AI assets
4. **Usage Contexts**: Specifies where/how audio should be used
5. **Procedural Support**: Can generate procedural audio at runtime
6. **Better Organization**: Separate audio manifest from game manifest

## Next Steps

1. Enable audio workflow in `asset-generation.yml` when ready
2. Use `AudioManifestManager` in game code to load audio by context
3. Integrate procedural audio generator for runtime sound generation
4. Add audio loading system that respects usage contexts and volume settings
