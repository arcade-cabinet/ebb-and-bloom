import { EnhancedRNG } from '../../utils/EnhancedRNG';
import { AudioContextManager } from './init/context';
import { AudioRouter } from './init/routing';
import { VoiceContext } from './types';
import { generateQuantumNoise } from './voices/quantum';
import { generateExpansionRumble } from './voices/inflation';
import { generatePlasmaChaos } from './voices/plasma';
import { generateAtomicBonding, generatePhotonRelease } from './voices/nucleosynthesis';
import { generateGravitationalBass } from './voices/darkmatter';
import { generateStellarHum } from './voices/stars';
import { generateSupernovaExplosion } from './voices/supernovae';
import { generateGalacticHarmony } from './voices/galaxies';
import { generateNebulaWisps, generateCloudCollapse } from './voices/clouds';
import { generateDiskRotation, generatePlanetesimalCollisions } from './voices/protoplanetary';
import { generateCoreRumble, generateOceanicBubbling } from './voices/planetary';

export interface AudioCharacteristics {
  frequencyRange: [number, number];
  waveform: 'noise' | 'sine' | 'sawtooth' | 'square' | 'triangle' | 'percussion';
  motif: string;
  volume: number;
  panning: number;
  reverbAmount: number;
  filterType?: 'lowpass' | 'highpass' | 'bandpass';
  filterFrequency?: number;
}

export class CosmicAudioSonification {
  private contextManager: AudioContextManager;
  private router: AudioRouter;
  private rng: EnhancedRNG;

  constructor(masterRng: EnhancedRNG) {
    this.rng = masterRng;
    this.contextManager = new AudioContextManager(this.rng);
    this.router = new AudioRouter();
  }

  public playSoundForStage(stageId: string, progress: number): void {
    const audioContext = this.contextManager.getAudioContext();
    const masterGain = this.contextManager.getMasterGain();
    
    if (!this.contextManager.isReady() || !audioContext || !masterGain) {
      return;
    }
    
    this.router.cleanupOldSources(audioContext);
    
    const voiceContext: VoiceContext = {
      audioContext,
      masterGain,
      convolver: this.contextManager.getConvolver(),
      rng: this.rng,
      currentSources: this.router.getSources()
    };
    
    try {
      switch (stageId) {
        case 'planck-epoch':
          generateQuantumNoise(voiceContext, progress);
          break;
        case 'cosmic-inflation':
          generateExpansionRumble(voiceContext, progress);
          break;
        case 'quark-gluon-plasma':
          generatePlasmaChaos(voiceContext, progress);
          break;
        case 'nucleosynthesis':
          generateAtomicBonding(voiceContext, progress);
          break;
        case 'recombination':
          generatePhotonRelease(voiceContext, progress);
          break;
        case 'dark-matter-web':
          generateGravitationalBass(voiceContext, progress);
          break;
        case 'population-iii-stars':
          generateStellarHum(voiceContext, progress);
          break;
        case 'first-supernovae':
          generateSupernovaExplosion(voiceContext, progress);
          break;
        case 'galaxy-position':
          generateGalacticHarmony(voiceContext, progress);
          break;
        case 'molecular-cloud':
          generateNebulaWisps(voiceContext, progress);
          break;
        case 'cloud-collapse':
          generateCloudCollapse(voiceContext, progress);
          break;
        case 'protoplanetary-disk':
          generateDiskRotation(voiceContext, progress);
          break;
        case 'planetary-accretion':
          generatePlanetesimalCollisions(voiceContext, progress);
          break;
        case 'planetary-differentiation':
          generateCoreRumble(voiceContext, progress);
          break;
        case 'surface-and-life':
          generateOceanicBubbling(voiceContext, progress);
          break;
        default:
          console.warn(`[CosmicAudioSonification] Unknown stage: ${stageId}`);
      }
    } catch (error) {
      console.error(`[CosmicAudioSonification] Error playing sound for stage ${stageId}:`, error);
    }
  }

  public stopAll(): void {
    const audioContext = this.contextManager.getAudioContext();
    if (audioContext) {
      this.router.stopAll(audioContext);
    }
  }

  public setMasterVolume(volume: number): void {
    this.contextManager.setMasterVolume(volume);
  }
}
