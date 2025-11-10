/**
 * LEGAL BROKER SYSTEM
 *
 * The intermediary between Yuka and the laws.
 * Yuka NEVER talks to laws directly - always through this broker.
 *
 * Like real-world legal systems:
 * - You don't read laws directly
 * - You go through legal channels (lawyers, regulators, courts)
 * - Each domain has its own regulator
 * - Conflicts resolved by coordination
 */

import { EntropyRegulator } from './regulators/EntropyRegulator';
import { PhysicsRegulator } from './regulators/PhysicsRegulator';
import { BiologyRegulator } from './regulators/BiologyRegulator';
import { EcologyRegulator } from './regulators/EcologyRegulator';
import { SocialRegulator } from './regulators/SocialRegulator';
import { TechnologyRegulator } from './regulators/TechnologyRegulator';
import { PlanetaryRegulator } from './regulators/PlanetaryRegulator';
import { UniversalLawCoordinator, UniverseState } from './UniversalLawCoordinator';

/**
 * Legal request from Yuka
 */
export interface LegalRequest {
  domain: string; // Which domain? (physics, biology, social, etc.)
  action: string; // What action? (calculate-metabolism, form-group, etc.)
  params: Record<string, any>; // Parameters
  state: UniverseState; // Current universe state
}

/**
 * Legal response with metadata
 */
export interface LegalResponse {
  value: any; // The answer
  authority: string; // Which regulator provided it
  confidence: number; // 0-1, how confident
  conflicts?: ConflictResolution[]; // Any conflicts that were resolved
  precedents?: string[]; // Which laws were cited
}

/**
 * Conflict resolution record
 */
export interface ConflictResolution {
  law1: string;
  value1: any;
  law2: string;
  value2: any;
  winner: string;
  reason: string;
}

/**
 * Domain Regulator Interface
 *
 * Each domain (physics, biology, etc.) has its own regulator
 * that knows its own laws
 */
export interface DomainRegulator {
  domain: string;

  /**
   * Can this regulator handle this request?
   */
  canHandle(request: LegalRequest): boolean;

  /**
   * Process request using domain laws
   */
  process(request: LegalRequest): LegalResponse;

  /**
   * Get all laws this regulator oversees
   */
  getLaws(): string[];
}

/**
 * THE LEGAL BROKER
 *
 * Yuka's single point of contact for ALL legal questions.
 * Routes to appropriate regulators, resolves conflicts.
 */
export class LegalBroker {
  private regulators: Map<string, DomainRegulator> = new Map();

  constructor() {
    // Register all domain regulators
    // ENTROPY FIRST - it has veto power over everything
    this.registerRegulator(new EntropyRegulator());
    this.registerRegulator(new PhysicsRegulator());
    this.registerRegulator(new BiologyRegulator());
    this.registerRegulator(new EcologyRegulator());
    this.registerRegulator(new SocialRegulator());
    this.registerRegulator(new TechnologyRegulator());
    this.registerRegulator(new PlanetaryRegulator());
  }
  
  /**
   * Get regulator (for external state updates)
   */
  getRegulator(domain: string): DomainRegulator | undefined {
    return this.regulators.get(domain);
  }

  /**
   * Register a domain regulator
   */
  private registerRegulator(regulator: DomainRegulator): void {
    this.regulators.set(regulator.domain, regulator);
    console.log(`[LegalBroker] Registered regulator: ${regulator.domain}`);
  }

  /**
   * Yuka asks a legal question
   *
   * This is the ONLY method Yuka should call
   */
  async ask(request: LegalRequest): Promise<LegalResponse> {
    console.log(`[LegalBroker] Request: ${request.domain}.${request.action}`);

    // 1. Find which regulator(s) can handle this
    const capableRegulators = this.findCapableRegulators(request);

    if (capableRegulators.length === 0) {
      console.warn(`[LegalBroker] No regulator can handle: ${request.domain}.${request.action}`);
      return {
        value: null,
        authority: 'none',
        confidence: 0,
        precedents: [],
      };
    }

    // 2. Get responses from all capable regulators
    const responses = capableRegulators.map((reg) => reg.process(request));

    // 3. If only one response, return it
    if (responses.length === 1) {
      console.log(`[LegalBroker] Single authority: ${responses[0].authority}`);
      return responses[0];
    }

    // 4. Multiple responses - need to resolve conflicts
    console.log(`[LegalBroker] Multiple authorities (${responses.length}), coordinating...`);
    return this.resolveConflicts(request, responses);
  }

  /**
   * Find all regulators that can handle this request
   */
  private findCapableRegulators(request: LegalRequest): DomainRegulator[] {
    const capable: DomainRegulator[] = [];

    for (const regulator of this.regulators.values()) {
      if (regulator.canHandle(request)) {
        capable.push(regulator);
      }
    }

    return capable;
  }

  /**
   * Resolve conflicts between multiple regulators
   *
   * This is where UniversalLawCoordinator comes in
   */
  private resolveConflicts(request: LegalRequest, responses: LegalResponse[]): LegalResponse {
    const conflicts: ConflictResolution[] = [];

    // Compare all pairs of responses
    for (let i = 0; i < responses.length; i++) {
      for (let j = i + 1; j < responses.length; j++) {
        const r1 = responses[i];
        const r2 = responses[j];

        // If values differ significantly, we have a conflict
        if (this.valuesConflict(r1.value, r2.value)) {
          // Use UniversalLawCoordinator to resolve
          const winner = UniversalLawCoordinator.resolveLawConflict(
            r1.authority,
            r1.value,
            r2.authority,
            r2.value,
            request.state
          );

          conflicts.push({
            law1: r1.authority,
            value1: r1.value,
            law2: r2.authority,
            value2: r2.value,
            winner: winner === r1.value ? r1.authority : r2.authority,
            reason: 'Precedence hierarchy',
          });
        }
      }
    }

    // Return response from highest-precedence regulator
    const sorted = responses.sort((a, b) => {
      // Sort by confidence (higher is better)
      return b.confidence - a.confidence;
    });

    const winner = sorted[0];

    return {
      ...winner,
      conflicts,
    };
  }

  /**
   * Check if two values conflict
   */
  private valuesConflict(v1: any, v2: any): boolean {
    if (typeof v1 === 'number' && typeof v2 === 'number') {
      // Numbers conflict if they differ by more than 10%
      const diff = Math.abs(v1 - v2);
      const avg = (v1 + v2) / 2;
      return diff / avg > 0.1;
    }

    // Non-numbers conflict if different
    return v1 !== v2;
  }

  /**
   * Get all available laws (for debugging)
   */
  getAllLaws(): Record<string, string[]> {
    const allLaws: Record<string, string[]> = {};

    for (const [domain, regulator] of this.regulators.entries()) {
      allLaws[domain] = regulator.getLaws();
    }

    return allLaws;
  }

  /**
   * Ask multiple questions in parallel (batch request)
   */
  async askBatch(requests: LegalRequest[]): Promise<LegalResponse[]> {
    return Promise.all(requests.map((req) => this.ask(req)));
  }
}

/**
 * SINGLETON INSTANCE
 *
 * Yuka gets ONE broker, shared across entire simulation
 */
export const LEGAL_BROKER = new LegalBroker();

/**
 * USAGE (for Yuka):
 *
 * import { LEGAL_BROKER } from './laws/core/LegalBroker';
 *
 * // Ask a question
 * const response = await LEGAL_BROKER.ask({
 *   domain: 'biology',
 *   action: 'calculate-metabolism',
 *   params: { mass: 50 },
 *   state: currentUniverseState,
 * });
 *
 * console.log(response.value);        // The answer
 * console.log(response.authority);    // Who provided it
 * console.log(response.confidence);   // How confident
 * console.log(response.conflicts);    // Any conflicts resolved
 *
 * // Batch requests
 * const responses = await LEGAL_BROKER.askBatch([
 *   { domain: 'biology', action: 'calculate-lifespan', ... },
 *   { domain: 'ecology', action: 'carrying-capacity', ... },
 * ]);
 */
