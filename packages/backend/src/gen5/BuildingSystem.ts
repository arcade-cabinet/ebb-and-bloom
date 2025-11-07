/**
 * Gen 5: Building Construction System
 * Buildings emerge when tribes need permanent structures
 */

import { Goal, CompositeGoal } from 'yuka';
import seedrandom from 'seedrandom';
import { Building, Tribe, Pack, Creature, Tool, Planet, Coordinate } from '../schemas/index.js';

/**
 * Construction Goal - Yuka Goal for building creation
 */
export class ConstructBuildingGoal extends Goal {
  private building: Partial<Building>;
  private tribe: Tribe;
  private progress: number = 0;

  constructor(building: Partial<Building>, tribe: Tribe) {
    super();
    this.building = building;
    this.tribe = tribe;
  }

  activate(): void {
    this.status = Goal.STATUS_ACTIVE;
    console.log(`[ConstructBuildingGoal] Starting construction of ${this.building.type} for tribe ${this.tribe.id}`);
  }

  execute(): number {
    // Simulate construction progress
    this.progress += 0.1;

    if (this.progress >= 1.0) {
      this.status = Goal.STATUS_COMPLETED;
    }

    return this.status;
  }

  terminate(): void {
    console.log(`[ConstructBuildingGoal] Construction complete: ${this.building.type}`);
  }
}

/**
 * Gen 5 Building System
 */
export class Gen5System {
  private planet: Planet;
  private rng: ReturnType<typeof seedrandom>;

  constructor(planet: Planet, seed: string) {
    this.planet = planet;
    this.rng = seedrandom(seed + '-gen5');
  }

  /**
   * Evaluate building emergence based on tribal needs
   */
  evaluateBuildingEmergence(
    tribes: Tribe[],
    packs: Pack[],
    creatures: Creature[],
    tools: Tool[]
  ): Building[] {
    const buildings: Building[] = [];

    for (const tribe of tribes) {
      // Assess tribal needs
      const needs = this.assessTribalNeeds(tribe, packs, creatures, tools);

      // Determine which building types to construct
      for (const need of needs) {
        if (need.urgency > 0.6 && this.canConstruct(tribe, creatures, tools, need.buildingType)) {
          const building = this.constructBuilding(tribe, need.buildingType, need.location);
          buildings.push(building);

          console.log(`[GEN5] Building ${building.id} (${building.type}) constructed for tribe ${tribe.id}`);
        }
      }
    }

    return buildings;
  }

  /**
   * Assess tribal needs for buildings
   */
  private assessTribalNeeds(
    tribe: Tribe,
    packs: Pack[],
    creatures: Creature[],
    tools: Tool[]
  ): Array<{ buildingType: Building['type']; urgency: number; location: Coordinate }> {
    const needs: Array<{ buildingType: Building['type']; urgency: number; location: Coordinate }> = [];

    const tribePacks = packs.filter(p => tribe.packs.includes(p.id));
    const tribeCreatures = creatures.filter(c => tribePacks.some(p => p.members.includes(c.id)));
    const tribeTools = tools.filter(t => tribePacks.some(p => p.id === t.pack));

    // Need 1: Shelter (population density)
    const populationDensity = tribe.population / (tribe.territory.area || 1);
    if (populationDensity > 0.1) {
      needs.push({
        buildingType: 'shelter',
        urgency: Math.min(1, populationDensity * 2),
        location: tribe.center,
      });
    }

    // Need 2: Workshop (tool count)
    if (tribeTools.length > 10) {
      needs.push({
        buildingType: 'workshop',
        urgency: Math.min(1, tribeTools.length / 20),
        location: tribe.center,
      });
    }

    // Need 3: Storage (resource management)
    if (tribe.resources.length > 5) {
      needs.push({
        buildingType: 'storage',
        urgency: Math.min(1, tribe.resources.length / 10),
        location: tribe.center,
      });
    }

    // Need 4: Gathering space (social coordination)
    const avgSocial = tribeCreatures.reduce((sum, c) => sum + c.traits.social, 0) / tribeCreatures.length;
    if (avgSocial > 0.7 && tribe.population > 50) {
      needs.push({
        buildingType: 'gathering',
        urgency: avgSocial,
        location: tribe.center,
      });
    }

    return needs;
  }

  /**
   * Check if tribe can construct building
   */
  private canConstruct(
    tribe: Tribe,
    creatures: Creature[],
    tools: Tool[],
    buildingType: Building['type']
  ): boolean {
    // Need construction tools
    const constructionTools = tools.filter(t => 
      t.type === 'extraction' || t.type === 'processing'
    );

    if (constructionTools.length < 2) return false;

    // Need sufficient construction-capable creatures
    const builders = creatures.filter(c => 
      tribe.packs.includes(c.id) && c.traits.manipulation > 0.5
    );

    const requiredBuilders: Record<Building['type'], number> = {
      'shelter': 3,
      'workshop': 5,
      'storage': 4,
      'gathering': 10,
      'defensive': 8,
    };

    return builders.length >= (requiredBuilders[buildingType] || 5);
  }

  /**
   * Construct a building
   */
  private constructBuilding(
    tribe: Tribe,
    type: Building['type'],
    location: Coordinate
  ): Building {
    // Select materials from tribal territory
    const crustMaterials = this.planet.layers.find(l => l.name === 'crust')?.materials || [];
    const accessibleMaterials = crustMaterials.filter(m => m.depth < 20);

    const building: Building = {
      id: `building-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      tribe: tribe.id,
      location,
      materials: accessibleMaterials.slice(0, 3).map(m => m.element),
      size: this.determineBuildingSize(type, tribe.population),
      capacity: this.determineBuildingCapacity(type, tribe.population),
      condition: 1.0,
      constructedAt: Date.now(),
    };

    return building;
  }

  /**
   * Determine building size based on type and population
   */
  private determineBuildingSize(type: Building['type'], population: number): number {
    const baseSize: Record<Building['type'], number> = {
      'shelter': 10,
      'workshop': 20,
      'storage': 15,
      'gathering': 50,
      'defensive': 30,
    };

    const populationFactor = Math.log10(population + 1);
    return (baseSize[type] || 10) * populationFactor;
  }

  /**
   * Determine building capacity
   */
  private determineBuildingCapacity(type: Building['type'], population: number): number {
    const capacityRatio: Record<Building['type'], number> = {
      'shelter': 0.5, // Half population
      'workshop': 0.1, // 10% working
      'storage': 0.2, // 20% resources
      'gathering': 0.8, // 80% can gather
      'defensive': 0.3, // 30% defenders
    };

    return Math.floor(population * (capacityRatio[type] || 0.2));
  }
}
