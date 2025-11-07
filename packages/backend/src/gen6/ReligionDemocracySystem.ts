/**
 * Gen 6: Religion and Democracy Systems
 * Abstract belief systems and governance emerge from complex societies
 */

import { Goal } from 'yuka';
import seedrandom from 'seedrandom';
import { Religion, Myth, Ritual, Tribe, Building, Creature, Planet } from '../schemas/index.js';

/**
 * Religious Practice Goal
 */
export class PerformRitualGoal extends Goal {
  private ritual: Ritual;
  private participants: string[];

  constructor(ritual: Ritual, participants: string[]) {
    super();
    this.ritual = ritual;
    this.participants = participants;
  }

  activate(): void {
    this.status = Goal.STATUS_ACTIVE;
    console.log(`[PerformRitualGoal] ${this.participants.length} creatures performing ${this.ritual.name}`);
  }

  execute(): number {
    // Ritual completes
    this.status = Goal.STATUS_COMPLETED;
    return this.status;
  }

  terminate(): void {
    console.log(`[PerformRitualGoal] Ritual ${this.ritual.name} complete`);
  }
}

/**
 * Gen 6 Religion/Democracy System
 */
export class Gen6System {
  private planet: Planet;
  private rng: ReturnType<typeof seedrandom>;

  constructor(planet: Planet, seed: string) {
    this.planet = planet;
    this.rng = seedrandom(seed + '-gen6');
  }

  /**
   * Evaluate religion emergence from tribal complexity
   */
  evaluateReligionEmergence(
    tribes: Tribe[],
    buildings: Building[],
    creatures: Creature[]
  ): Religion[] {
    const religions: Religion[] = [];

    for (const tribe of tribes) {
      // Religion emerges from large, stable tribes with gathering spaces
      const tribeBuildings = buildings.filter(b => b.tribe === tribe.id);
      const hasGatheringSpace = tribeBuildings.some(b => b.type === 'gathering');
      const isLarge = tribe.population > 100;
      const isStable = tribe.status === 'stable';

      if (hasGatheringSpace && isLarge && isStable && this.rng() < 0.3) {
        const religion = this.formReligion(tribe, creatures);
        religions.push(religion);

        console.log(`[GEN6] Religion ${religion.id} emerged in tribe ${tribe.id}`);
      }
    }

    return religions;
  }

  /**
   * Form a religion based on tribal context
   */
  private formReligion(tribe: Tribe, creatures: Creature[]): Religion {
    const tribeCreatures = creatures.filter(c => tribe.packs.includes(c.id));

    // Generate cosmology based on planetary features
    const cosmology = this.generateCosmology();

    // Generate founding myths
    const myths = this.generateFoundingMyths(tribe, cosmology);

    // Generate initial rituals
    const rituals = this.generateRituals(cosmology);

    const religion: Religion = {
      id: `religion-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      tribe: tribe.id,
      name: `${cosmology.primary_force} Faith`,
      cosmology,
      myths,
      rituals,
      adherents: tribeCreatures.map(c => c.id),
      influence: 0.5,
      foundedAt: Date.now(),
    };

    return religion;
  }

  /**
   * Generate cosmology based on planetary environment
   */
  private generateCosmology(): { primary_force: string; creation_story: string; afterlife: string } {
    const forces = ['Sun', 'Earth', 'Water', 'Stone', 'Stars'];
    const primary = forces[Math.floor(this.rng() * forces.length)];

    const cosmologies: Record<string, { creation_story: string; afterlife: string }> = {
      'Sun': {
        creation_story: 'The Great Fire birthed all life from flame',
        afterlife: 'Souls ascend to join the eternal light',
      },
      'Earth': {
        creation_story: 'The First Stone split to release the world',
        afterlife: 'Bodies return to nourish the eternal soil',
      },
      'Water': {
        creation_story: 'The Primordial Ocean birthed all that swims, walks, and flies',
        afterlife: 'Spirits flow into the great underground sea',
      },
      'Stone': {
        creation_story: 'The Eternal Mountains gave form to chaos',
        afterlife: 'Bones crystallize into sacred mineral',
      },
      'Stars': {
        creation_story: 'Each star is a world, this world is but one',
        afterlife: 'Souls travel to distant star-worlds',
      },
    };

    return {
      primary_force: primary,
      ...cosmologies[primary],
    };
  }

  /**
   * Generate founding myths
   */
  private generateFoundingMyths(tribe: Tribe, cosmology: { primary_force: string }): Myth[] {
    return [
      {
        id: `myth-origin-${Date.now()}`,
        name: `The First ${cosmology.primary_force}`,
        story: `Long ago, when the world was empty, the First ${cosmology.primary_force} gave life to all creatures`,
        significance: 'Explains tribal origins',
        rituals: [],
      },
      {
        id: `myth-tribe-${Date.now()}`,
        name: 'The Founding',
        story: `Our ancestors gathered at this place, blessed by ${cosmology.primary_force}`,
        significance: 'Legitimizes tribal authority',
        rituals: [],
      },
    ];
  }

  /**
   * Generate rituals
   */
  private generateRituals(cosmology: { primary_force: string }): Ritual[] {
    return [
      {
        id: `ritual-daily-${Date.now()}`,
        name: `${cosmology.primary_force} Prayer`,
        purpose: 'Daily devotion',
        frequency: 'daily',
        participants_required: 1,
        location_type: 'gathering',
        effects: ['morale boost', 'social cohesion'],
      },
      {
        id: `ritual-seasonal-${Date.now()}`,
        name: `${cosmology.primary_force} Festival`,
        purpose: 'Seasonal celebration',
        frequency: 'seasonal',
        participants_required: 50,
        location_type: 'gathering',
        effects: ['tribal unity', 'resource blessing'],
      },
    ];
  }

  /**
   * Evaluate democracy emergence (alternative to religion)
   */
  evaluateDemocracyEmergence(
    tribes: Tribe[],
    buildings: Building[],
    creatures: Creature[]
  ): Tribe[] {
    const democraticTribes: Tribe[] = [];

    for (const tribe of tribes) {
      if (tribe.governance !== 'elder_council') continue;

      const tribeCreatures = creatures.filter(c => tribe.packs.includes(c.id));
      const avgSocial = tribeCreatures.reduce((sum, c) => sum + c.traits.social, 0) / tribeCreatures.length;

      // Democracy emerges from highly social, educated populations
      const hasGathering = buildings.some(b => b.tribe === tribe.id && b.type === 'gathering');
      const isHighlySocial = avgSocial > 0.8;
      const isLarge = tribe.population > 200;

      if (hasGathering && isHighlySocial && isLarge && this.rng() < 0.2) {
        tribe.governance = 'democratic_assembly';
        democraticTribes.push(tribe);

        console.log(`[GEN6] Democracy emerged in tribe ${tribe.id}`);
      }
    }

    return democraticTribes;
  }
}
