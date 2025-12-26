import { describe, it, expect } from 'vitest';
import { CreatureAgent, CreatureTraits } from '../../../agents/agents-yuka/CreatureAgent';
import { Vehicle } from 'yuka';

describe('CreatureAgent', () => {
    it('should extend YUKA Vehicle', () => {
        const agent = new CreatureAgent();
        expect(agent).toBeInstanceOf(Vehicle);
    });

    it('should have default properties', () => {
        const agent = new CreatureAgent();
        expect(agent.energy).toBe(100);
        expect(agent.maxEnergy).toBe(100);
        expect(agent.role).toBe('prey');
        expect(agent.diet).toBe('herbivore');
    });

    it('should initialize with traits correctly', () => {
        const agent = new CreatureAgent();
        const traits: CreatureTraits = {
            mass: 50,
            locomotion: 'cursorial',
            diet: 'carnivore',
            socialBehavior: 'pack',
            age: 5,
            genetics: 0.8
        };

        agent.initialize(traits);

        expect(agent.mass).toBe(50);
        expect(agent.age).toBe(5);
        expect(agent.genetics).toBe(0.8);
        expect(agent.diet).toBe('carnivore');
        expect(agent.role).toBe('predator'); // Derived from diet
        expect(agent.socialBehavior).toBe('pack');
        expect(agent.species).toBe('cursorial');
    });

    it('should set role to prey for herbivores', () => {
        const agent = new CreatureAgent();
        const traits: CreatureTraits = {
            mass: 20,
            locomotion: 'arboreal',
            diet: 'herbivore',
            socialBehavior: 'solitary',
            age: 2,
            genetics: 0.5
        };

        agent.initialize(traits);
        expect(agent.role).toBe('prey');
    });
});
