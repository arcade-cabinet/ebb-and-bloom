# Audio Manifest System

This directory contains the audio manifest system for Ebb & Bloom, similar to the AI asset manifest but specifically for procedural and incidental audio.

## Files

- `audio-manifest.json` - Main manifest file tracking all audio assets
- `src/utils/FreesoundClient.ts` - Modern TypeScript Freesound API client
- `src/utils/AudioManifest.ts` - TypeScript types for audio manifest

## Manifest Structure

The audio manifest tracks:
- **Freesound assets**: Downloaded from Freesound API
- **Procedural audio**: Generated at runtime using Web Audio API
- **Usage contexts**: Where/how audio should be used in the game

## Usage Contexts

Audio entries can specify usage contexts:
- `evolution_morph` - Trait evolution events
- `pack_coordination` - Pack formation/coordination sounds
- `pollution_shock` - Environmental shock events
- `trait_emergence` - New trait discovery
- `environmental_decay` - Pollution effects
- `snap_success` - Successful resource snapping
- `snap_failure` - Failed snapping attempts

## Integration

The audio manifest integrates with:
- `GameDevCLI.ts` - Asset generation pipeline
- `FreesoundClient.ts` - Modern Freesound API wrapper
- `ProceduralAudioGenerator` - Runtime procedural audio generation

## Example Usage

```typescript
import { FreesoundClient, AudioManifestManager } from './utils/FreesoundClient';

// Search and add to manifest
const client = new FreesoundClient({ apiKey: process.env.FREESOUND_API_KEY });
const entries = await client.searchForManifest(
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

// Save to manifest
const manifest = new AudioManifestManager();
for (const entry of entries) {
  await manifest.addEntry(entry);
}
```
