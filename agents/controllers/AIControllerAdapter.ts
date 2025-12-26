/**
 * AI CONTROLLER ADAPTER
 * 
 * Wraps YUKA steering behaviors and decision trees to provide governor inputs.
 * This adapter makes autonomous decisions using existing YUKA primitives.
 */

import type { ControllerAdapter } from './ControllerAdapter';
import type { GovernorActionId, ActionContext, GovernorIntent } from './GovernorActionPort';
import {
  GameEntity,
  FuzzyModule,
  Vehicle,
  ArriveBehavior,
  WanderBehavior,
  Vector3,
  SteeringManager
} from 'yuka';
import { createGovernorFuzzy } from './GovernorFuzzy';

export interface AIControllerConfig {
  yukaEntity?: GameEntity;  // Optional YUKA entity for steering behaviors
  decisionFrequency?: number; // How often to make decisions (seconds)
}

/**
 * AI adapter using YUKA for autonomous decision-making
 */
export class AIControllerAdapter implements ControllerAdapter {
  private yukaEntity?: GameEntity;
  private decisionFrequency: number;
  private lastDecisionTime: number = 0;
  private fuzzyModule: FuzzyModule;
  
  constructor(config: AIControllerConfig = {}) {
    this.yukaEntity = config.yukaEntity;
    this.decisionFrequency = config.decisionFrequency ?? 1.0; // Default: 1 decision per second
    this.fuzzyModule = createGovernorFuzzy();
  }
  
  getType(): 'ai' {
    return 'ai';
  }
  
  /**
   * Provide autonomous input using YUKA behaviors
   */
  async provideInput(
    actionId: GovernorActionId,
    context: ActionContext
  ): Promise<GovernorIntent> {
    // Refresh fuzzy inputs
    this.updateFuzzyInputs(context);

    switch (actionId) {
      case 'smitePredator':
        return this.decideSmite(context);
      
      case 'nurtureFood':
        return this.decideNurture(context);
      
      case 'shapeTerrain':
        return this.decideShapeTerrain(context);
      
      case 'applyPressure':
        return this.decidePressure(context);
      
      case 'selectPrey':
        return this.decideSelectPrey(context);
      
      case 'formAlliance':
        return this.decideFormAlliance(context);
      
      case 'migrate':
        return this.decideMigrate(context);
      
      default:
        throw new Error(`Unknown action: ${actionId}`);
    }
  }

  /**
   * Updates fuzzy variables based on current context
   */
  private updateFuzzyInputs(context: ActionContext): void {
    const carryingCapacity = context.carryingCapacityLimit || Math.max(context.population, 1);
    const popStress = Math.min(context.population / carryingCapacity, 1);

    this.fuzzyModule.fuzzify('populationStress', popStress);
    this.fuzzyModule.fuzzify('predatorThreat', context.predatorDensity || 0);
    this.fuzzyModule.fuzzify('resourceAbundance', context.foodDensity || 0.5);
  }

  /**
   * AI Decision: Smite predators
   */
  private decideSmite(context: ActionContext): GovernorIntent {
    const magnitude = this.fuzzyModule.defuzzify('actionMagnitude');
    const confidence = this.fuzzyModule.defuzzify('actionConfidence');

    // Use steering behavior logic to find best target if we had predator positions.
    // Since we don't have explicit predator list positions here, we target territory center
    // but with fuzzy-adjusted magnitude.

    return {
      type: 'smitePredator',
      target: { 
        x: context.territory.x,
        y: 0, 
        z: context.territory.z 
      } as any,
      magnitude: magnitude,
      metadata: {
        reasoning: `AI: Threat level processed via Fuzzy Logic (Mag: ${magnitude.toFixed(2)})`,
        confidence: confidence,
      },
    };
  }
  
  /**
   * AI Decision: Nurture food supply
   */
  private decideNurture(context: ActionContext): GovernorIntent {
    const magnitude = this.fuzzyModule.defuzzify('actionMagnitude');
    const confidence = this.fuzzyModule.defuzzify('actionConfidence');
    
    return {
      type: 'nurtureFood',
      magnitude: magnitude,
      duration: 100, // 100 seconds
      metadata: {
        reasoning: `AI: Resource needs processed via Fuzzy Logic (Mag: ${magnitude.toFixed(2)})`,
        confidence: confidence,
      },
    };
  }
  
  /**
   * AI Decision: Shape terrain
   */
  private decideShapeTerrain(context: ActionContext): GovernorIntent {
    // Terrain shaping is often a reaction to pressure or need for defense
    // We can reuse magnitude from fuzzy logic as "intensity of need"
    const intensity = this.fuzzyModule.defuzzify('actionMagnitude');

    return {
      type: 'shapeTerrain',
      target: { 
        x: context.territory.x,
        y: 0,
        z: context.territory.z 
      } as any,
      magnitude: intensity,
      metadata: {
        reasoning: 'AI: Creating defensive terrain based on threat/stress',
        confidence: 0.6,
      },
    };
  }
  
  /**
   * AI Decision: Apply environmental pressure
   */
  private decidePressure(context: ActionContext): GovernorIntent {
    // Pressure is high when population is stable/stagnant (low stress) but we want evolution
    // Or when we need to force adaptation.
    // For now, let's use the inverse of population stress? Or just a set logic.
    // Let's rely on the fuzzy "actionMagnitude" which aggregates stress/threat.
    const magnitude = this.fuzzyModule.defuzzify('actionMagnitude');

    return {
      type: 'applyPressure',
      magnitude: magnitude,
      duration: 50,
      metadata: {
        reasoning: 'AI: Forcing adaptation through pressure',
        confidence: 0.7,
      },
    };
  }
  
  /**
   * AI Decision: Select prey
   */
  private decideSelectPrey(context: ActionContext): GovernorIntent {
    // Pick first available prey (simple heuristic)
    const preyId = context.availablePrey?.[0] ?? 'none';
    const confidence = this.fuzzyModule.defuzzify('actionConfidence');
    
    return {
      type: 'selectPrey',
      target: preyId,
      metadata: {
        reasoning: 'AI: Selected weakest prey species',
        confidence: confidence,
      },
    };
  }
  
  /**
   * AI Decision: Form alliance
   */
  private decideFormAlliance(context: ActionContext): GovernorIntent {
    const allyId = context.nearbySpecies?.[0] ?? 'none';
    
    return {
      type: 'formAlliance',
      target: allyId,
      metadata: {
        reasoning: 'AI: Strategic mutualism opportunity',
        confidence: 0.65,
      },
    };
  }
  
  /**
   * AI Decision: Migrate
   * Uses YUKA steering simulation to find a target position
   */
  private decideMigrate(context: ActionContext): GovernorIntent {
    const targetPos = this.findMigrationTarget(context);
    const confidence = this.fuzzyModule.defuzzify('actionConfidence');
    
    return {
      type: 'migrate',
      target: targetPos as any,
      metadata: {
        reasoning: 'AI: Determined optimal migration target using Steering Behaviors',
        confidence: confidence,
      },
    };
  }

  /**
   * Uses YUKA steering behaviors to simulate a search for a migration target.
   * It creates a virtual vehicle, applies Wander and Arrive behaviors towards valid positions,
   * and returns the result after a brief simulation.
   */
  private findMigrationTarget(context: ActionContext): { x: number, y: number, z: number } {
    if (!context.validPositions || context.validPositions.length === 0) {
      return { x: 0, y: 0, z: 0 };
    }

    // 1. Create a virtual vehicle at current territory center
    const vehicle = new Vehicle();
    vehicle.position.set(context.territory.x, 0, context.territory.z);
    vehicle.maxSpeed = 10;
    vehicle.mass = 1;

    // 2. Setup Steering Manager
    // Since Vehicle already has a steering manager, we use it directly
    // but in YUKA types provided, Vehicle has `steering: SteeringManager`.

    // 3. Add Behaviors
    // Wander to explore
    const wander = new WanderBehavior();
    wander.weight = 0.5;
    vehicle.steering.add(wander);

    // Arrive at a random valid position (representing a resource hotspot)
    // We pick one 'attractor' from the valid positions to steer towards
    const attractorIndex = Math.floor(Math.random() * context.validPositions.length);
    const attractor = context.validPositions[attractorIndex];
    // Convert THREE Vector3 to YUKA Vector3 if needed, assuming they are compatible or copying values
    const targetVec = new Vector3(attractor.x, attractor.y, attractor.z);

    const arrive = new ArriveBehavior(targetVec, 3, 1); // target, deceleration, weight
    arrive.weight = 1.0;
    vehicle.steering.add(arrive);

    // 4. Simulate for a few frames to get a "steered" position
    const simulationSteps = 60; // 1 second at 60fps
    const delta = 0.016; // 16ms

    for (let i = 0; i < simulationSteps; i++) {
        // Calculate steering force
        // In YUKA, vehicle.update() usually handles this if added to an EntityManager
        // But we can manually invoke calculate on steering manager and update position
        // Or just use vehicle.update(delta) if it works standalone (usually yes)

        // Manual update loop for standalone vehicle
        // Calculate total force
        const force = new Vector3();
        vehicle.steering.calculate(delta, force);

        // Apply force to velocity (F = ma => a = F/m)
        const acceleration = force.divideScalar(vehicle.mass);
        vehicle.velocity.add(acceleration.multiplyScalar(delta));

        // Cap velocity
        if (vehicle.velocity.length() > vehicle.maxSpeed) {
            vehicle.velocity.normalize().multiplyScalar(vehicle.maxSpeed);
        }

        // Update position
        const displacement = vehicle.velocity.clone().multiplyScalar(delta);
        vehicle.position.add(displacement);
    }

    return {
      x: vehicle.position.x,
      y: vehicle.position.y,
      z: vehicle.position.z
    };
  }
  
  /**
   * Telemetry: Action started
   */
  onActionStart(actionId: GovernorActionId, context: ActionContext): void {
    this.lastDecisionTime = Date.now();
    console.log(`[AI] Starting action: ${actionId}`, {
      species: context.speciesId,
      population: context.population,
    });
  }
  
  /**
   * Telemetry: Action completed
   */
  onActionComplete(intent: GovernorIntent): void {
    console.log(`[AI] Completed action: ${intent.type}`, {
      reasoning: intent.metadata?.reasoning,
      confidence: intent.metadata?.confidence,
    });
  }
}
