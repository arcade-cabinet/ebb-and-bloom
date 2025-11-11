/**
 * SOCIAL CONSTANTS
 * 
 * Universal constants for social systems.
 */

export const SOCIAL_CONSTANTS = {
    // Service typology thresholds
    BAND_MAX_POPULATION: 50,
    TRIBE_MAX_POPULATION: 500,
    CHIEFDOM_MAX_POPULATION: 5000,

    // Military participation
    BAND_MILITARY_RATIO: 0.3,
    TRIBE_MILITARY_RATIO: 0.2,
    CHIEFDOM_MILITARY_RATIO: 0.1,
    STATE_MILITARY_RATIO: 0.05,

    // Gini coefficients by society type
    BAND_GINI: 0.0,
    TRIBE_GINI: 0.2,
    CHIEFDOM_GINI: 0.4,
    STATE_GINI: 0.6,

    // Hierarchy levels
    MAX_HIERARCHY_LEVELS: 8,

    // Cooperation
    TIT_FOR_TAT_DEFECTION_THRESHOLD: 0.3,
    RECIPROCAL_ALTRUISM_MEMORY: 10, // Remember last N interactions
} as const;

