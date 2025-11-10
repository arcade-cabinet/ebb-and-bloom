/**
 * GENETICS GOVERNOR
 * 
 * Heredity, mutation, and selection for agents.
 */

/**
 * GENETICS SYSTEM
 * 
 * Handles inheritance and mutation during reproduction.
 */
export class GeneticsSystem {
    static readonly MUTATION_RATE = 1e-8;

    /**
     * Create offspring genome from parents
     */
    static inherit(parent1: any, parent2: any): any {
        const genome = {
            traits: {},
            mutations: 0
        };

        // Mendelian inheritance
        for (const trait in parent1.genome?.traits || {}) {
            const allele1 = parent1.genome.traits[trait];
            const allele2 = parent2.genome?.traits?.[trait] || allele1;

            // Random selection from parents
            genome.traits[trait] = Math.random() < 0.5 ? allele1 : allele2;

            // Mutation
            if (Math.random() < this.MUTATION_RATE) {
                genome.traits[trait] += (Math.random() - 0.5) * 0.1;
                genome.mutations++;
            }
        }

        return genome;
    }

    /**
     * Calculate heritability
     */
    static heritability(phenotypeVariance: number, geneticVariance: number): number {
        return geneticVariance / phenotypeVariance;
    }

    /**
     * Selection response (breeder's equation)
     */
    static selectionResponse(heritability: number, selectionDifferential: number): number {
        return heritability * selectionDifferential;
    }

    /**
     * Hardy-Weinberg equilibrium
     */
    static hardyWeinberg(p: number): { AA: number; Aa: number; aa: number } {
        return {
            AA: p * p,
            Aa: 2 * p * (1 - p),
            aa: (1 - p) * (1 - p)
        };
    }

    /**
     * Genetic drift variance
     */
    static geneticDrift(alleleFreq: number, effectivePopSize: number): number {
        return (alleleFreq * (1 - alleleFreq)) / (2 * effectivePopSize);
    }

    /**
     * Inbreeding depression
     */
    static inbreedingDepression(inbreedingCoefficient: number): number {
        return 1 - 3.5 * inbreedingCoefficient;
    }
}

