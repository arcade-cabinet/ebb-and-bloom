/**
 * Specialization System (Gen4)
 *
 * Creatures develop specialized roles based on traits and experience:
 * - Hunters: High strength, track and gather food
 * - Builders: High strength + intelligence, construct structures
 * - Crafters: High intelligence, create tools
 * - Scouts: High speed, explore and map territory
 * - Leaders: High intelligence + social, coordinate packs
 *
 * Specialization emerges from repeated actions and natural aptitude.
 */

export type SpecializationRole =
  | 'hunter'
  | 'builder'
  | 'crafter'
  | 'scout'
  | 'leader'
  | 'generalist';

export interface Specialization {
  creatureId: string;
  role: SpecializationRole;
  proficiency: number; // 0-1 (0 = novice, 1 = master)
  experience: Map<string, number>; // action type -> times performed
  traits: {
    strength?: number;
    intelligence?: number;
    speed?: number;
    social?: string;
  };
}

export interface SpecializationBenefit {
  role: SpecializationRole;
  action: string; // What action gets bonus
  multiplier: number; // 1.0-2.0 (how much better)
}

export class SpecializationSystem {
  private specializations: Map<string, Specialization> = new Map();

  // Role requirements (min trait values)
  private readonly ROLE_REQUIREMENTS: Record<SpecializationRole, any> = {
    hunter: { strength: 0.6, speed: 0.5 },
    builder: { strength: 0.6, intelligence: 0.6 },
    crafter: { intelligence: 0.7 },
    scout: { speed: 0.7, intelligence: 0.5 },
    leader: { intelligence: 0.7, social: 'pack' },
    generalist: {}, // No requirements
  };

  /**
   * Update specializations
   */
  update(
    creatures: Map<
      string,
      {
        traits?: {
          strength?: number;
          intelligence?: number;
          speed?: number;
          social?: string;
          locomotion?: string;
        };
      }
    >,
    actions: Map<string, string[]> // creature ID -> actions performed this frame
  ): void {
    // Initialize specializations for new creatures
    this.initializeSpecializations(creatures);

    // Track experience from actions
    this.trackExperience(actions);

    // Update roles based on experience and traits
    this.updateRoles(creatures);

    // Update proficiency
    this.updateProficiency();
  }

  /**
   * Initialize specializations
   */
  private initializeSpecializations(creatures: Map<string, { traits?: any }>): void {
    for (const [creatureId, creature] of creatures) {
      if (this.specializations.has(creatureId)) continue;

      this.specializations.set(creatureId, {
        creatureId,
        role: 'generalist',
        proficiency: 0.1,
        experience: new Map(),
        traits: creature.traits || {},
      });
    }
  }

  /**
   * Track experience from actions
   */
  private trackExperience(actions: Map<string, string[]>): void {
    for (const [creatureId, actionList] of actions) {
      const spec = this.specializations.get(creatureId);
      if (!spec) continue;

      for (const action of actionList) {
        const current = spec.experience.get(action) || 0;
        spec.experience.set(action, current + 1);
      }
    }
  }

  /**
   * Update roles based on experience and traits
   */
  private updateRoles(_creatures: Map<string, { traits?: any }>): void {
    for (const spec of this.specializations.values()) {
      // Get most performed action
      let maxAction = '';
      let maxCount = 0;

      for (const [action, count] of spec.experience) {
        if (count > maxCount) {
          maxCount = count;
          maxAction = action;
        }
      }

      // Determine role from action pattern
      if (maxCount > 100) {
        // Minimum experience threshold
        const newRole = this.determineRoleFromAction(maxAction, spec.traits);

        // Check if creature meets requirements
        if (this.meetsRequirements(spec.traits, newRole)) {
          spec.role = newRole;
        }
      }
    }
  }

  /**
   * Determine role from primary action
   */
  private determineRoleFromAction(action: string, _traits: any): SpecializationRole {
    switch (action) {
      case 'hunt':
      case 'gather_food':
        return 'hunter';
      case 'build':
      case 'construct':
        return 'builder';
      case 'craft':
      case 'create_tool':
        return 'crafter';
      case 'explore':
      case 'scout':
        return 'scout';
      case 'lead':
      case 'coordinate':
        return 'leader';
      default:
        return 'generalist';
    }
  }

  /**
   * Check if creature meets role requirements
   */
  private meetsRequirements(traits: any, role: SpecializationRole): boolean {
    const reqs = this.ROLE_REQUIREMENTS[role];

    for (const [trait, minValue] of Object.entries(reqs)) {
      if (trait === 'social') {
        if (traits.social !== minValue) return false;
      } else {
        if ((traits[trait] || 0) < (minValue as number)) return false;
      }
    }

    return true;
  }

  /**
   * Update proficiency
   */
  private updateProficiency(): void {
    for (const spec of this.specializations.values()) {
      // Proficiency grows with total experience
      const totalExp = Array.from(spec.experience.values()).reduce((sum, val) => sum + val, 0);

      // Logarithmic growth: 0 exp = 0.1, 1000 exp = 0.5, 10000 exp = 1.0
      spec.proficiency = Math.min(1.0, 0.1 + Math.log10(totalExp + 1) * 0.25);
    }
  }

  /**
   * Get specialization benefits
   */
  getBenefit(creatureId: string, action: string): number {
    const spec = this.specializations.get(creatureId);
    if (!spec) return 1.0;

    // Match action to role
    const benefitsFromRole = this.actionMatchesRole(action, spec.role);
    if (!benefitsFromRole) return 1.0;

    // Benefit scales with proficiency: 1.0 (no bonus) to 2.0 (master bonus)
    return 1.0 + spec.proficiency;
  }

  /**
   * Check if action benefits from role
   */
  private actionMatchesRole(action: string, role: SpecializationRole): boolean {
    const roleActions: Record<SpecializationRole, string[]> = {
      hunter: ['hunt', 'gather_food', 'track'],
      builder: ['build', 'construct', 'repair'],
      crafter: ['craft', 'create_tool', 'upgrade'],
      scout: ['explore', 'scout', 'navigate'],
      leader: ['lead', 'coordinate', 'teach'],
      generalist: [],
    };

    return roleActions[role]?.includes(action) || false;
  }

  /**
   * Get creature specialization
   */
  getSpecialization(creatureId: string): Specialization | null {
    return this.specializations.get(creatureId) || null;
  }

  /**
   * Get all specialized creatures (not generalists)
   */
  getSpecialized(): Specialization[] {
    return Array.from(this.specializations.values()).filter((s) => s.role !== 'generalist');
  }

  /**
   * Get creatures by role
   */
  getByRole(role: SpecializationRole): Specialization[] {
    return Array.from(this.specializations.values()).filter((s) => s.role === role);
  }

  /**
   * Record action for tracking
   */
  recordAction(creatureId: string, action: string): void {
    const spec = this.specializations.get(creatureId);
    if (!spec) return;

    const current = spec.experience.get(action) || 0;
    spec.experience.set(action, current + 1);
  }
}
