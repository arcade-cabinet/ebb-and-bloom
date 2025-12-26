import { Vehicle } from 'yuka';

/**
 * Traits defining the biological and behavioral characteristics of a creature.
 * Matched to engine/procedural/CreatureMeshGenerator.ts
 */
export interface CreatureTraits {
    mass: number;           // kg
    locomotion: 'cursorial' | 'arboreal' | 'burrowing' | 'littoral';
    diet: 'herbivore' | 'carnivore' | 'omnivore';
    socialBehavior: 'solitary' | 'pack';
    age: number;            // years
    genetics: number;       // 0-1
}

/**
 * CreatureAgent
 *
 * Extends YUKA Vehicle to represent a creature in the world.
 * Encapsulates biological properties and behavioral traits.
 */
export class CreatureAgent extends Vehicle {
    // Biological properties
    energy: number = 100;
    maxEnergy: number = 100;
    age: number = 0;
    genetics: number = 0;

    // Behavioral roles/classifications
    role: 'predator' | 'prey' = 'prey';
    species: string = 'unknown';
    socialRank: number = 0;

    // Core traits
    diet: 'herbivore' | 'carnivore' | 'omnivore' = 'herbivore';
    locomotion: 'cursorial' | 'arboreal' | 'burrowing' | 'littoral' = 'cursorial';
    socialBehavior: 'solitary' | 'pack' = 'solitary';

    constructor() {
        super();
    }

    /**
     * Initialize the agent with specific traits.
     * This sets physical properties (mass) and biological flags.
     *
     * @param traits The biological traits to apply
     */
    initialize(traits: CreatureTraits): void {
        // Physical properties
        this.mass = traits.mass;

        // Biological properties
        this.age = traits.age;
        this.genetics = traits.genetics;
        this.diet = traits.diet;
        this.locomotion = traits.locomotion;
        this.socialBehavior = traits.socialBehavior;

        // Derived properties
        this.role = traits.diet === 'carnivore' ? 'predator' : 'prey';
        this.species = traits.locomotion; // Simplified species classification for now
    }
}
