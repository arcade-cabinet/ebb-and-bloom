/**
 * Gen 5: Building Construction with AI-Generated Building Types
 * Uses data pools for building specs instead of hardcoding
 */

import { Goal } from 'yuka';
import seedrandom from 'seedrandom';
import { Building, Tribe, Pack, Creature, Tool, Planet, Coordinate } from '../schemas/index.js';
import { generateGen5DataPools, selectFromPool, extractSeedComponents } from '../gen-systems/loadGenData.js';

/**
 * Construction Goal
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
    console.log(`[ConstructBuildingGoal] Building ${this.building.type} for tribe ${this.tribe.id}`);
  }

  execute(): number {
    this.progress += 0.1;
    if (this.progress >= 1.0) {
      this.status = Goal.STATUS_COMPLETED;
    }
    return this.status;
  }

  terminate(): void {
    console.log(`[ConstructBuildingGoal] ${this.building.type} complete`);
  }
}

/**
 * Gen 5 Building System
 */
export class Gen5System {
  private planet: Planet;
  private rng: seedrandom.PRNG;
  private useAI: boolean;
  private buildingTypeOptions: any[] = [];

  constructor(planet: Planet, seed: string, useAI = true) {
    this.planet = planet;
    this.rng = seedrandom(seed + '-gen5');
    this.useAI = useAI;
  }

  /**
   * Initialize with AI-generated building types
   */
  async initialize(gen4Data: any): Promise<void> {
    console.log(`[GEN5] Initializing with AI data pools: ${this.useAI}`);

    if (this.useAI && gen4Data) {
      const dataPools = await generateGen5DataPools(this.planet, gen4Data, this.planet.seed);
      this.buildingTypeOptions = dataPools.micro.buildingTypesOptions;
      console.log(`[GEN5] Generated ${this.buildingTypeOptions.length} building type options`);
    } else {
      // Fallback
      this.buildingTypeOptions = [
        { name: 'Simple Shelter', purpose: 'protection', visualBlueprint: {} },
        { name: 'Stone Workshop', purpose: 'crafting', visualBlueprint: {} },
      ];
    }
  }

  /**
   * Evaluate building emergence
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

      for (const need of needs) {
        if (need.urgency > 0.6 && this.canConstruct(tribe, creatures, tools, need.buildingType)) {
          const building = this.constructBuilding(tribe, need.buildingType, need.location);
          buildings.push(building);
        }
      }
    }

    return buildings;
  }

  /**
   * Assess tribal needs
   */
  private assessTribalNeeds(
    tribe: Tribe,
    packs: Pack[],
    creatures: Creature[],
    tools: Tool[]
  ): Array<{ buildingType: string; urgency: number; location: Coordinate }> {
    const needs: Array<{ buildingType: string; urgency: number; location: Coordinate }> = [];

    const tribePacks = packs.filter((p) => tribe.packs.includes(p.id));
    const tribeCreatures = creatures.filter((c) =>
      tribePacks.some((p) => p.members.includes(c.id))
    );

    // Shelter need (based on population)
    const shelterUrgency = Math.min(1, tribe.population / 50);
    needs.push({
      buildingType: 'shelter',
      urgency: shelterUrgency,
      location: tribe.territory.center,
    });

    // Workshop need (based on tool count)
    const tribeTools = tools.filter((t) => tribePacks.some((p) => p.id === t.creator));
    const workshopUrgency = Math.min(1, tribeTools.length / 10);
    needs.push({
      buildingType: 'workshop',
      urgency: workshopUrgency,
      location: tribe.territory.center,
    });

    // Gathering need (based on population)
    const gatheringUrgency = Math.min(1, tribe.population / 100);
    needs.push({
      buildingType: 'gathering',
      urgency: gatheringUrgency,
      location: tribe.territory.center,
    });

    return needs.sort((a, b) => b.urgency - a.urgency);
  }

  /**
   * Can tribe construct this building?
   */
  private canConstruct(tribe: Tribe, creatures: Creature[], tools: Tool[], buildingType: string): boolean {
    // Need minimum population
    if (tribe.population < 20) return false;

    // Need tools
    const tribeTools = tools.filter((t) => tribe.packs.some((p) => p === t.creator));
    if (tribeTools.length < 2) return false;

    return true;
  }

  /**
   * Construct a building using AI-generated specs
   */
  private constructBuilding(tribe: Tribe, buildingType: string, location: Coordinate): Building {
    // Select building from AI pool
    const { micro } = extractSeedComponents(this.planet.seed + tribe.id + buildingType);
    const selectedType = this.buildingTypeOptions.find((t) => t.purpose === buildingType) ||
      selectFromPool(this.buildingTypeOptions, micro);

    const building: Building = {
      id: `building-${tribe.id}-${Date.now()}`,
      name: selectedType.name,
      type: buildingType as any,
      tribe: tribe.id,
      location,
      size: Math.max(10, tribe.population / 5),
      capacity: Math.max(20, tribe.population / 2),
      status: 'complete',
      visualBlueprint: selectedType.visualBlueprint,
    };

    console.log(`[GEN5] Building ${building.name} (${building.type}) constructed for tribe ${tribe.id}`);
    return building;
  }
}
