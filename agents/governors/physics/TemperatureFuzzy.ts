/**
 * TEMPERATURE FUZZY LOGIC
 * 
 * Thermodynamic decision-making using Yuka fuzzy logic.
 * 
 * Implements:
 * - Cold/Warm/Hot fuzzy sets
 * - Rules: "IF cold THEN seek warmth"
 * - Temperature-based behavior modulation
 * 
 * Based on: physics.ts thermodynamics, biology.ts thermoregulation
 * Pattern: FuzzyModule + FuzzyRule (like examples/fuzzy/)
 */

import { FuzzyModule, FuzzyVariable, FuzzySet, LeftShoulderFuzzySet, RightShoulderFuzzySet, TriangularFuzzySet, FuzzyRule } from 'yuka';

/**
 * Create temperature fuzzy module
 * 
 * Input: ambient temperature (K)
 * Output: thermal action (-1 to +1, negative = seek warmth, positive = seek cold)
 */
export function createTemperatureFuzzy(): FuzzyModule {
    const fuzzy = new FuzzyModule();

    // INPUT: Ambient Temperature (Kelvin)
    const ambientTemp = new FuzzyVariable();
    
    const freezing = new LeftShoulderFuzzySet(253, 263, 273); // < 0°C
    const cold = new TriangularFuzzySet(263, 273, 283); // 0-10°C
    const comfortable = new TriangularFuzzySet(273, 293, 310); // 10-37°C
    const warm = new TriangularFuzzySet(293, 310, 320); // 20-47°C
    const hot = new RightShoulderFuzzySet(310, 320, 330); // > 37°C

    ambientTemp.add(freezing);
    ambientTemp.add(cold);
    ambientTemp.add(comfortable);
    ambientTemp.add(warm);
    ambientTemp.add(hot);

    fuzzy.addFLV('ambientTemp', ambientTemp);

    // INPUT: Body Temperature (Kelvin)
    const bodyTemp = new FuzzyVariable();
    
    const hypothermic = new LeftShoulderFuzzySet(303, 308, 310); // < 35°C (mammal)
    const normal = new TriangularFuzzySet(308, 310, 312); // 35-39°C
    const hyperthermic = new RightShoulderFuzzySet(310, 312, 315); // > 39°C

    bodyTemp.add(hypothermic);
    bodyTemp.add(normal);
    bodyTemp.add(hyperthermic);

    fuzzy.addFLV('bodyTemp', bodyTemp);

    // OUTPUT: Thermal Action
    const thermalAction = new FuzzyVariable();
    
    const seekWarmth = new LeftShoulderFuzzySet(-1, -0.5, 0); // Strong warming behavior
    const neutral = new TriangularFuzzySet(-0.2, 0, 0.2); // No action
    const seekCold = new RightShoulderFuzzySet(0, 0.5, 1); // Strong cooling behavior

    thermalAction.add(seekWarmth);
    thermalAction.add(neutral);
    thermalAction.add(seekCold);

    fuzzy.addFLV('thermalAction', thermalAction);

    // RULES
    // Rule 1: IF freezing OR hypothermic THEN seek warmth
    const rule1 = new FuzzyRule(
        freezing,
        seekWarmth
    );
    fuzzy.addRule(rule1);

    const rule2 = new FuzzyRule(
        hypothermic,
        seekWarmth
    );
    fuzzy.addRule(rule2);

    // Rule 3: IF cold AND NOT hyperthermic THEN seek warmth
    const rule3 = new FuzzyRule(
        cold,
        seekWarmth
    );
    fuzzy.addRule(rule3);

    // Rule 4: IF comfortable AND normal THEN neutral
    const rule4 = new FuzzyRule(
        comfortable,
        neutral
    );
    fuzzy.addRule(rule4);

    // Rule 5: IF hot OR hyperthermic THEN seek cold
    const rule5 = new FuzzyRule(
        hot,
        seekCold
    );
    fuzzy.addRule(rule5);

    const rule6 = new FuzzyRule(
        hyperthermic,
        seekCold
    );
    fuzzy.addRule(rule6);

    return fuzzy;
}

/**
 * TEMPERATURE BEHAVIOR
 * 
 * Uses fuzzy logic to modulate agent behavior based on temperature.
 * 
 * Usage:
 * ```typescript
 * const tempBehavior = new TemperatureBehavior();
 * agent.thermalAction = tempBehavior.evaluate(ambientTemp, agent.bodyTemp);
 * // Use thermalAction to seek shade/sun, burrow, pant, etc.
 * ```
 */
export class TemperatureBehavior {
    fuzzyModule: FuzzyModule;

    constructor() {
        this.fuzzyModule = createTemperatureFuzzy();
    }

    /**
     * Evaluate temperature situation
     * 
     * @param ambientTemp - Ambient temperature (K)
     * @param bodyTemp - Body temperature (K)
     * @returns Thermal action (-1 = seek warmth, 0 = neutral, +1 = seek cold)
     */
    evaluate(ambientTemp: number, bodyTemp: number): number {
        this.fuzzyModule.fuzzify('ambientTemp', ambientTemp);
        this.fuzzyModule.fuzzify('bodyTemp', bodyTemp);

        return this.fuzzyModule.defuzzify('thermalAction');
    }

    /**
     * Get behavioral recommendation
     */
    getRecommendation(thermalAction: number): string {
        if (thermalAction < -0.5) return 'seek_warmth'; // Bask in sun, burrow
        if (thermalAction < -0.2) return 'conserve_heat'; // Reduce activity
        if (thermalAction < 0.2) return 'normal'; // No thermal stress
        if (thermalAction < 0.5) return 'dissipate_heat'; // Pant, seek shade
        return 'seek_cold'; // Find water, burrow
    }
}

