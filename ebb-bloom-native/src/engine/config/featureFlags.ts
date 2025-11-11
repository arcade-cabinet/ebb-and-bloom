/**
 * FEATURE FLAGS
 * 
 * Control which systems are enabled/disabled.
 * Allows pure engine gameplay without agentic systems.
 */

export const FEATURE_FLAGS = {
    /**
     * AGENTIC SYSTEMS
     * When false, disables all governor-based decision making.
     * Pure engine uses deterministic prefabs and spawners only.
     */
    ENABLE_AGENTIC_SYSTEMS: false,

    /**
     * GENERATION GOVERNOR
     * When false, world generation uses simple spawners instead of governor decisions.
     */
    ENABLE_GENERATION_GOVERNOR: false,

    /**
     * CREATURE GOVERNORS
     * When false, creatures spawn using simple rules instead of PredatorPreyBehavior decisions.
     */
    ENABLE_CREATURE_GOVERNORS: false,

    /**
     * SETTLEMENT GOVERNORS
     * When false, settlements use simple placement rules instead of social governors.
     */
    ENABLE_SETTLEMENT_GOVERNORS: false,
} as const;

/**
 * Check if agentic systems are enabled
 */
export function isAgenticEnabled(): boolean {
    return FEATURE_FLAGS.ENABLE_AGENTIC_SYSTEMS;
}

/**
 * Check if generation governor is enabled
 */
export function isGenerationGovernorEnabled(): boolean {
    return FEATURE_FLAGS.ENABLE_GENERATION_GOVERNOR && FEATURE_FLAGS.ENABLE_AGENTIC_SYSTEMS;
}

/**
 * Check if creature governors are enabled
 */
export function isCreatureGovernorsEnabled(): boolean {
    return FEATURE_FLAGS.ENABLE_CREATURE_GOVERNORS && FEATURE_FLAGS.ENABLE_AGENTIC_SYSTEMS;
}

/**
 * Check if settlement governors are enabled
 */
export function isSettlementGovernorsEnabled(): boolean {
    return FEATURE_FLAGS.ENABLE_SETTLEMENT_GOVERNORS && FEATURE_FLAGS.ENABLE_AGENTIC_SYSTEMS;
}


