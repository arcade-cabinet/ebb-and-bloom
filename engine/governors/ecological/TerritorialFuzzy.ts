/**
 * TERRITORIAL FUZZY LOGIC
 * 
 * Territory defense decisions using Yuka fuzzy logic.
 * 
 * Implements:
 * - Territory boundaries (fuzzy edges)
 * - Defense decisions based on resource value and intruder threat
 * - Patrol vs defend vs ignore behaviors
 * 
 * Based on: ecology.ts TerritoryLaws
 * Pattern: FuzzyModule + FuzzyRule
 */

import { 
    FuzzyModule, 
    FuzzyVariable, 
    FuzzySet, 
    LeftShoulderFuzzySet, 
    RightShoulderFuzzySet, 
    TriangularFuzzySet, 
    FuzzyRule,
    FuzzyAND
} from 'yuka';

/**
 * Create territorial fuzzy module
 * 
 * Inputs:
 * - Distance from territory center (normalized 0-1)
 * - Resource value (0-1)
 * - Intruder threat (0-1)
 * 
 * Output:
 * - Defense intensity (0-1)
 */
export function createTerritorialFuzzy(): FuzzyModule {
    const fuzzy = new FuzzyModule();

    // INPUT: Distance from territory center (0 = center, 1 = edge)
    const distanceFromCenter = new FuzzyVariable();
    
    const core = new LeftShoulderFuzzySet(0, 0.2, 0.4); // Core territory
    const buffer = new TriangularFuzzySet(0.3, 0.5, 0.7); // Buffer zone
    const edge = new TriangularFuzzySet(0.6, 0.8, 1.0); // Edge
    const outside = new RightShoulderFuzzySet(0.9, 1.0, 1.2); // Outside territory

    distanceFromCenter.add(core);
    distanceFromCenter.add(buffer);
    distanceFromCenter.add(edge);
    distanceFromCenter.add(outside);

    fuzzy.addFLV('distanceFromCenter', distanceFromCenter);

    // INPUT: Resource Value (0 = worthless, 1 = critical)
    const resourceValue = new FuzzyVariable();
    
    const worthless = new LeftShoulderFuzzySet(0, 0.1, 0.3);
    const moderate = new TriangularFuzzySet(0.2, 0.5, 0.8);
    const valuable = new RightShoulderFuzzySet(0.7, 0.9, 1.0);

    resourceValue.add(worthless);
    resourceValue.add(moderate);
    resourceValue.add(valuable);

    fuzzy.addFLV('resourceValue', resourceValue);

    // INPUT: Intruder Threat (0 = harmless, 1 = dangerous)
    const intruderThreat = new FuzzyVariable();
    
    const harmless = new LeftShoulderFuzzySet(0, 0.2, 0.4);
    const cautious = new TriangularFuzzySet(0.3, 0.5, 0.7);
    const dangerous = new RightShoulderFuzzySet(0.6, 0.8, 1.0);

    intruderThreat.add(harmless);
    intruderThreat.add(cautious);
    intruderThreat.add(dangerous);

    fuzzy.addFLV('intruderThreat', intruderThreat);

    // OUTPUT: Defense Intensity (0 = ignore, 1 = aggressive defense)
    const defenseIntensity = new FuzzyVariable();
    
    const ignore = new LeftShoulderFuzzySet(0, 0.1, 0.3);
    const patrol = new TriangularFuzzySet(0.2, 0.4, 0.6);
    const challenge = new TriangularFuzzySet(0.5, 0.7, 0.9);
    const attack = new RightShoulderFuzzySet(0.8, 0.9, 1.0);

    defenseIntensity.add(ignore);
    defenseIntensity.add(patrol);
    defenseIntensity.add(challenge);
    defenseIntensity.add(attack);

    fuzzy.addFLV('defenseIntensity', defenseIntensity);

    // RULES
    // Rule 1: IF in core AND valuable resources THEN attack
    const rule1 = new FuzzyRule(
        new FuzzyAND(core, valuable),
        attack
    );
    fuzzy.addRule(rule1);

    // Rule 2: IF in core AND dangerous intruder THEN attack
    const rule2 = new FuzzyRule(
        new FuzzyAND(core, dangerous),
        attack
    );
    fuzzy.addRule(rule2);

    // Rule 3: IF in buffer AND valuable THEN challenge
    const rule3 = new FuzzyRule(
        new FuzzyAND(buffer, valuable),
        challenge
    );
    fuzzy.addRule(rule3);

    // Rule 4: IF at edge AND harmless THEN patrol
    const rule4 = new FuzzyRule(
        new FuzzyAND(edge, harmless),
        patrol
    );
    fuzzy.addRule(rule4);

    // Rule 5: IF outside OR worthless THEN ignore
    const rule5 = new FuzzyRule(
        outside,
        ignore
    );
    fuzzy.addRule(rule5);

    const rule6 = new FuzzyRule(
        worthless,
        ignore
    );
    fuzzy.addRule(rule6);

    // Rule 7: IF at edge AND dangerous THEN challenge
    const rule7 = new FuzzyRule(
        new FuzzyAND(edge, dangerous),
        challenge
    );
    fuzzy.addRule(rule7);

    return fuzzy;
}

/**
 * TERRITORIAL BEHAVIOR
 * 
 * Uses fuzzy logic to determine territorial defense.
 */
export class TerritorialBehavior {
    fuzzyModule: FuzzyModule;
    territoryCenterX: number;
    territoryCenterZ: number;
    territoryRadius: number;

    constructor(centerX: number, centerZ: number, radius: number) {
        this.fuzzyModule = createTerritorialFuzzy();
        this.territoryCenterX = centerX;
        this.territoryCenterZ = centerZ;
        this.territoryRadius = radius;
    }

    /**
     * Evaluate defense intensity for an intruder
     * 
     * @param intruderX - Intruder X position
     * @param intruderZ - Intruder Z position
     * @param resourceValue - Value of resources (0-1)
     * @param intruderThreat - Threat level of intruder (0-1)
     * @returns Defense intensity (0-1)
     */
    evaluate(
        intruderX: number,
        intruderZ: number,
        resourceValue: number,
        intruderThreat: number
    ): number {
        // Calculate distance from territory center
        const dx = intruderX - this.territoryCenterX;
        const dz = intruderZ - this.territoryCenterZ;
        const distance = Math.sqrt(dx * dx + dz * dz);
        const normalizedDistance = Math.min(1.2, distance / this.territoryRadius);

        // Fuzzify inputs
        this.fuzzyModule.fuzzify('distanceFromCenter', normalizedDistance);
        this.fuzzyModule.fuzzify('resourceValue', resourceValue);
        this.fuzzyModule.fuzzify('intruderThreat', intruderThreat);

        // Defuzzify output
        return this.fuzzyModule.defuzzify('defenseIntensity');
    }

    /**
     * Get behavioral recommendation
     */
    getRecommendation(defenseIntensity: number): string {
        if (defenseIntensity < 0.3) return 'ignore';
        if (defenseIntensity < 0.6) return 'patrol';
        if (defenseIntensity < 0.9) return 'challenge';
        return 'attack';
    }

    /**
     * Check if position is inside territory
     */
    isInTerritory(x: number, z: number): boolean {
        const dx = x - this.territoryCenterX;
        const dz = z - this.territoryCenterZ;
        const distance = Math.sqrt(dx * dx + dz * dz);
        return distance <= this.territoryRadius;
    }
}

