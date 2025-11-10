/**
 * ECOLOGICAL CONSTANTS
 * 
 * Universal constants for ecological systems.
 */

export const ECOLOGICAL_CONSTANTS = {
    // Lotka-Volterra default coefficients
    PREY_BIRTH_RATE: 0.5, // α
    PREDATION_RATE: 0.02, // β
    CONVERSION_EFFICIENCY: 0.01, // δ
    PREDATOR_DEATH_RATE: 0.3, // γ

    // Dunbar's number
    DUNBARS_NUMBER: 150,

    // Social group sizes
    INTIMATE_GROUP: 5,
    CLOSE_FRIENDS: 15,
    FRIENDS: 50,
    MEANINGFUL_CONTACTS: 150,
    ACQUAINTANCES: 500,

    // Island biogeography
    SPECIES_AREA_EXPONENT: 0.25, // z value
    SPECIES_AREA_COEFFICIENT: 10, // c value

    // Carrying capacity
    NPP_TROPICAL_RAINFOREST: 2000, // g C/m²/year
    NPP_TEMPERATE_FOREST: 1250,
    NPP_GRASSLAND: 600,
    NPP_DESERT: 90,
    NPP_TUNDRA: 140,

    // Territory sizes (km² per individual)
    TERRITORY_HERBIVORE_SMALL: 0.01,
    TERRITORY_HERBIVORE_LARGE: 1.0,
    TERRITORY_CARNIVORE_SMALL: 0.1,
    TERRITORY_CARNIVORE_LARGE: 100,
} as const;

