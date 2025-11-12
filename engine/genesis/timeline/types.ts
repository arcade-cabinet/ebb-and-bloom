export interface CosmicStage {
  id: string;
  name: string;
  description: string;
  timeStart: number;
  timeEnd: number;
  causalTrigger: string;
  seedInfluence: string[];
  constantsGenerated: {
    name: string;
    formula: string;
    seedParameters: string[];
  }[];
  visualCharacteristics: {
    particleCount: number;
    colorPalette: string[];
    scaleRange: [number, number];
    cameraDistance: number;
  };
  audioCharacteristics: {
    frequencyRange: [number, number];
    waveform: 'noise' | 'sine' | 'sawtooth' | 'percussion';
    motif: string;
  };
  conservationLedger: {
    massEnergy: string;
    entropy: string;
  };
}

export interface StageCalculator {
  getStages(): CosmicStage[];
  evaluateConstant(constantName: string, seedFactor: number): number | null;
}
