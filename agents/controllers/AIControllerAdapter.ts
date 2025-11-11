/**
 * AI CONTROLLER ADAPTER
 * 
 * Wraps YUKA steering behaviors and decision trees to provide governor inputs.
 * This adapter makes autonomous decisions using existing YUKA primitives.
 */

import type { ControllerAdapter } from './ControllerAdapter';
import type { GovernorActionId, ActionContext, GovernorIntent } from './GovernorActionPort';
import type { GameEntity } from 'yuka';

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
  
  constructor(config: AIControllerConfig = {}) {
    this.yukaEntity = config.yukaEntity;
    this.decisionFrequency = config.decisionFrequency ?? 1.0; // Default: 1 decision per second
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
    // For now, use simple heuristics
    // TODO: Replace with proper YUKA steering behaviors and fuzzy logic
    
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
   * AI Decision: Smite predators
   */
  private decideSmite(context: ActionContext): GovernorIntent {
    // Simple heuristic: Smite at species territory center
    return {
      type: 'smitePredator',
      target: { 
        x: context.territory.x,
        y: 0, 
        z: context.territory.z 
      } as any,
      magnitude: context.predatorDensity ?? 0.5,
      metadata: {
        reasoning: 'AI: High predator density, targeting territory center',
        confidence: 0.7,
      },
    };
  }
  
  /**
   * AI Decision: Nurture food supply
   */
  private decideNurture(context: ActionContext): GovernorIntent {
    // Calculate magnitude based on population vs carrying capacity
    const targetMagnitude = Math.min(
      (context.population / (context.carryingCapacityLimit ?? context.population)) * 0.8,
      1.0
    );
    
    return {
      type: 'nurtureFood',
      magnitude: targetMagnitude,
      duration: 100, // 100 seconds
      metadata: {
        reasoning: 'AI: Population approaching capacity, increasing food',
        confidence: 0.8,
      },
    };
  }
  
  /**
   * AI Decision: Shape terrain
   */
  private decideShapeTerrain(context: ActionContext): GovernorIntent {
    return {
      type: 'shapeTerrain',
      target: { 
        x: context.territory.x,
        y: 0,
        z: context.territory.z 
      } as any,
      magnitude: 0.5,
      metadata: {
        reasoning: 'AI: Creating defensive terrain',
        confidence: 0.6,
      },
    };
  }
  
  /**
   * AI Decision: Apply environmental pressure
   */
  private decidePressure(context: ActionContext): GovernorIntent {
    return {
      type: 'applyPressure',
      magnitude: 0.6,
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
    
    return {
      type: 'selectPrey',
      target: preyId,
      metadata: {
        reasoning: 'AI: Selected weakest prey species',
        confidence: 0.75,
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
   */
  private decideMigrate(context: ActionContext): GovernorIntent {
    // Pick a random nearby position
    const targetPos = context.validPositions?.[0] ?? { x: 0, y: 0, z: 0 };
    
    return {
      type: 'migrate',
      target: targetPos as any,
      metadata: {
        reasoning: 'AI: Resource depletion, migrating to better territory',
        confidence: 0.7,
      },
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
