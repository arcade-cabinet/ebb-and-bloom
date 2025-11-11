/**
 * NEUROSCIENCE GOVERNOR
 * 
 * Brain size, learning, memory for agents.
 */

/**
 * COGNITIVE CAPACITY SYSTEM
 * 
 * Brain-body scaling and cognitive abilities.
 */
export class CognitiveSystem {
    /**
     * Brain mass from body mass (Jerison's encephalization quotient)
     * Brain = 0.01 * M^0.75 (mammals)
     */
    static brainMass(bodyMass: number): number {
        return 0.01 * Math.pow(bodyMass, 0.75);
    }

    /**
     * Encephalization quotient
     * EQ = actual brain mass / expected brain mass
     * EQ > 1 = smarter than expected for body size
     */
    static encephalizationQuotient(bodyMass: number, brainMass: number): number {
        const expected = this.brainMass(bodyMass);
        return brainMass / expected;
    }

    /**
     * Memory capacity
     * Scales with brain neurons (~10^11 for humans)
     */
    static memoryCapacity(brainMass: number): number {
        const neurons = brainMass * 10e9; // 10 billion neurons per gram
        return Math.log2(neurons); // Bits
    }

    /**
     * Learning rate
     * Higher EQ = faster learning
     */
    static learningRate(eq: number): number {
        return Math.min(1.0, eq / 7.0); // Humans ~7 EQ
    }

    /**
     * Update agent's learned behaviors
     */
    static learn(agent: any, experience: any, delta: number): void {
        if (!agent.memory) agent.memory = {};
        if (!agent.eq) agent.eq = 1.0;

        const learningRate = this.learningRate(agent.eq);
        const memoryCapacity = this.memoryCapacity(agent.brainMass || 0.01);

        // Store experience
        const key = experience.type;
        if (!agent.memory[key]) {
            agent.memory[key] = { count: 0, value: 0 };
        }

        // Update with learning rate
        agent.memory[key].count++;
        agent.memory[key].value += (experience.value - agent.memory[key].value) * learningRate * delta;

        // Forget old memories if capacity exceeded
        const memorySize = Object.keys(agent.memory).length;
        if (memorySize > memoryCapacity) {
            // Remove least recently used
            const oldest = Object.keys(agent.memory).reduce((a, b) => 
                agent.memory[a].count < agent.memory[b].count ? a : b
            );
            delete agent.memory[oldest];
        }
    }
}

