import type { Evolvable, Environment } from '../interfaces/Evolvable';

export class SelectionSystem {
  evaluateFitness(entity: Evolvable, environment: Environment): number {
    const performance = this.evaluatePerformance(entity.phenotype, environment);
    const cost = this.calculateCost(entity.genotype, environment);
    
    return cost > 0 ? performance / cost : 0;
  }
  
  private evaluatePerformance(phenotype: any, environment: Environment): number {
    let performance = 1.0;
    
    if (phenotype.cuttingEfficiency !== undefined) {
      performance *= phenotype.cuttingEfficiency;
    }
    if (phenotype.flightEfficiency !== undefined) {
      performance *= phenotype.flightEfficiency;
    }
    
    if (environment.selectionPressure) {
      performance *= (1 + environment.selectionPressure);
    }
    
    return performance;
  }
  
  private calculateCost(genotype: any, environment: Environment): number {
    let cost = 1.0;
    
    if (genotype.complexity) {
      cost += genotype.complexity * 0.1;
    }
    
    const resourceAvailability = environment.resources.get('nutrients') ?? 1.0;
    cost *= (2 - resourceAvailability);
    
    return cost;
  }
  
  selectForReplication(population: Evolvable[], environment: Environment): Evolvable[] {
    const withFitness = population.map(entity => ({
      entity,
      fitness: this.evaluateFitness(entity, environment)
    }));
    
    withFitness.sort((a, b) => b.fitness - a.fitness);
    
    const survivors = withFitness.slice(0, Math.ceil(population.length / 2));
    return survivors.map(s => s.entity);
  }
  
  replicate(parents: Evolvable[], environment: Environment): Evolvable[] {
    const offspring: Evolvable[] = [];
    
    for (const parent of parents) {
      const child = parent.heredity.replicate(parent, environment);
      parent.heredity.mutate(child, environment.mutationRate || 0.01);
      offspring.push(child);
    }
    
    return offspring;
  }
}
