import { EnhancedRNG } from '../../utils/EnhancedRNG';
import { PHYSICS_CONSTANTS } from '../../../agents/tables/physics-constants';
import type { CosmicStage, StageCalculator } from './types';
import { QuantumCalculator } from './calculators/quantum';
import { InflationCalculator } from './calculators/inflation';
import { FurnaceCalculator } from './calculators/furnace';
import { DarkMatterCalculator } from './calculators/darkmatter';
import { StarsCalculator } from './calculators/stars';
import { SupernovaeCalculator } from './calculators/supernovae';
import { GalaxiesCalculator } from './calculators/galaxies';
import { CloudsCalculator } from './calculators/clouds';
import { AccretionCalculator } from './calculators/accretion';

export type { CosmicStage } from './types';

export class CosmicProvenanceTimeline {
  private stages: CosmicStage[];
  private rng: EnhancedRNG;
  private calculatedConstants: Record<string, number>;
  private calculators: StageCalculator[];

  constructor(masterRng: EnhancedRNG) {
    this.rng = masterRng;
    this.calculatedConstants = {};
    this.calculators = [
      new QuantumCalculator(),
      new InflationCalculator(),
      new FurnaceCalculator(),
      new DarkMatterCalculator(),
      new StarsCalculator(),
      new SupernovaeCalculator(),
      new GalaxiesCalculator(),
      new CloudsCalculator(),
      new AccretionCalculator()
    ];
    this.stages = this.collectStages();
    this.calculateAllConstants();
  }

  private collectStages(): CosmicStage[] {
    const allStages: CosmicStage[] = [];
    for (const calculator of this.calculators) {
      allStages.push(...calculator.getStages());
    }
    return allStages.sort((a, b) => a.timeStart - b.timeStart);
  }

  private calculateAllConstants(): void {
    for (const stage of this.stages) {
      const stageConstants = this.calculateConstantsForStage(stage.id);
      Object.assign(this.calculatedConstants, stageConstants);
    }
  }

  public calculateConstantsForStage(stageId: string): Record<string, number> {
    const stage = this.getStage(stageId);
    if (!stage) {
      throw new Error(`Stage ${stageId} not found`);
    }

    const constants: Record<string, number> = {};

    for (const param of stage.seedInfluence) {
      const seedValue = this.rng.normal(1.0, 0.1);
      constants[param] = Math.max(0.01, seedValue);
    }

    for (const constDef of stage.constantsGenerated) {
      const { name, seedParameters } = constDef;
      const seedFactors = seedParameters.map(p => constants[p] || 1.0);
      const avgFactor = seedFactors.reduce((a, b) => a + b, 0) / seedFactors.length;
      
      constants[name] = this.evaluateConstantFormula(name, avgFactor);
    }

    return constants;
  }

  private evaluateConstantFormula(constantName: string, seedFactor: number): number {
    for (const calculator of this.calculators) {
      const value = calculator.evaluateConstant(constantName, seedFactor);
      if (value !== null) {
        return value;
      }
    }
    return seedFactor;
  }

  public getAllConstants(): Record<string, number> {
    return { ...this.calculatedConstants };
  }

  public getStages(): CosmicStage[] {
    return this.stages;
  }

  public getStage(id: string): CosmicStage {
    const stage = this.stages.find(s => s.id === id);
    if (!stage) {
      throw new Error(`Stage ${id} not found`);
    }
    return stage;
  }

  public getTimeScaleLabel(stage: CosmicStage): string {
    const YEAR = 31557600;
    const MINUTE = 60;
    const HOUR = 3600;
    const DAY = 86400;

    const time = stage.timeEnd;

    if (time < 1e-30) {
      return `${(time * 1e43).toExponential(1)} Planck times`;
    } else if (time < 1e-6) {
      return `${time.toExponential(1)} seconds`;
    } else if (time < MINUTE) {
      return `${time.toFixed(3)} seconds`;
    } else if (time < HOUR) {
      return `${(time / MINUTE).toFixed(1)} minutes`;
    } else if (time < DAY) {
      return `${(time / HOUR).toFixed(1)} hours`;
    } else if (time < YEAR) {
      return `${(time / DAY).toFixed(1)} days`;
    } else if (time < 1e6 * YEAR) {
      return `${(time / YEAR / 1000).toFixed(0)} thousand years`;
    } else if (time < 1e9 * YEAR) {
      return `${(time / YEAR / 1e6).toFixed(0)} million years`;
    } else {
      return `${(time / YEAR / 1e9).toFixed(2)} billion years`;
    }
  }

  public getConservationStatus(stage: CosmicStage): { 
    mass: number; 
    energy: number; 
    entropy: number; 
  } {
    const totalMassEnergy = 1e53;
    const initialEntropy = PHYSICS_CONSTANTS.k_B * Math.log(1e120);
    
    const timeFraction = stage.timeEnd / (14e9 * 31557600);
    
    const mass = totalMassEnergy * (0.3 + 0.7 * this.rng.uniform());
    const energy = totalMassEnergy - mass;
    const entropy = initialEntropy * Math.exp(timeFraction * 10) * this.rng.uniform(0.9, 1.1);
    
    return { mass, energy, entropy };
  }

  public getStageAtTime(time: number): CosmicStage | null {
    for (const stage of this.stages) {
      if (time >= stage.timeStart && time <= stage.timeEnd) {
        return stage;
      }
    }
    return null;
  }

  public getProgressThroughStage(stage: CosmicStage, currentTime: number): number {
    if (currentTime < stage.timeStart) return 0;
    if (currentTime > stage.timeEnd) return 1;
    
    const duration = stage.timeEnd - stage.timeStart;
    if (duration === 0) return 1;
    
    return (currentTime - stage.timeStart) / duration;
  }
}

export default CosmicProvenanceTimeline;
