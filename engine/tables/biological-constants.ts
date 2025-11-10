/**
 * BIOLOGICAL CONSTANTS
 * 
 * Universal constants for biological systems.
 */

export const BIOLOGICAL_CONSTANTS = {
    // Kleiber's Law coefficient
    KLEIBER_COEFFICIENT: 70, // watts

    // Minimum viable population
    MINIMUM_VIABLE_POPULATION: 50,

    // Mutation rate per generation
    MUTATION_RATE: 1e-8,

    // Maximum lifespan scaling
    MAXIMUM_LIFESPAN_COEFFICIENT: 10.5, // years per kg^0.25

    // Generation time scaling
    GENERATION_TIME_COEFFICIENT: 2.5, // years per kg^0.25

    // Gestation time scaling
    GESTATION_TIME_COEFFICIENT: 0.162, // years per kg^0.25

    // Heart rate scaling
    HEART_RATE_COEFFICIENT: 241, // bpm per kg^-0.25

    // Brain mass scaling
    BRAIN_MASS_COEFFICIENT: 0.01, // kg per kg^0.75

    // Encephalization quotient scaling
    EQ_HUMAN: 7.0,
    EQ_DOLPHIN: 4.5,
    EQ_CHIMP: 2.5,
    EQ_DOG: 1.2,
    EQ_MOUSE: 0.5,

    // Trophic efficiency
    TROPHIC_EFFICIENCY: 0.1, // 10% rule

    // Home range scaling
    HERBIVORE_RANGE_EXPONENT: 1.02,
    CARNIVORE_RANGE_EXPONENT: 1.36,
} as const;

