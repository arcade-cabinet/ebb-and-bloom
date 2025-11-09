/**
 * Cultural Expression System (Gen5)
 * 
 * Creatures engage in non-functional cultural behaviors:
 * - Decorative patterns (body paint, markings)
 * - Ritualistic movements (dances, ceremonies)
 * - Art objects (decorative structures, sculptures)
 * - Music (rhythmic sounds, coordinated vocalizations)
 * 
 * Culture spreads within packs and between allied groups.
 */

export type ExpressionType = 'body_art' | 'dance' | 'sculpture' | 'music' | 'ceremony';

export interface CulturalExpression {
  id: string;
  type: ExpressionType;
  originPackId?: string;
  creatorId: string;
  position?: { lat: number; lon: number }; // For sculptures
  pattern?: string; // For body art (hex color pattern)
  movements?: { angle: number; duration: number }[]; // For dances
  complexity: number; // 0-1, higher = more complex
  timestamp: number;
  practitioners: Set<string>; // Creature IDs practicing this expression
}

export interface CreatureCulture {
  creatureId: string;
  expressions: Map<string, number>; // expression ID -> proficiency (0-1)
  activeExpression?: string; // Currently performing
  expressionTimer: number; // Time remaining for current expression
  innovator: boolean; // Can create new expressions
}

export interface CulturalSite {
  id: string;
  position: { lat: number; lon: number };
  type: 'gathering_site' | 'art_site' | 'ceremonial_site';
  packId?: string;
  expressions: string[]; // Expression IDs associated with this site
  visitors: Set<string>; // Creature IDs currently visiting
}

export class CulturalExpressionSystem {
  private expressions: Map<string, CulturalExpression> = new Map();
  private cultures: Map<string, CreatureCulture> = new Map();
  private sites: Map<string, CulturalSite> = new Map();
  private nextExpressionId: number = 0;
  private nextSiteId: number = 0;

  /**
   * Update cultural expressions
   */
  update(
    creatures: Map<string, {
      position: { lat: number; lon: number };
      traits?: {
        intelligence?: number;
        social?: string;
      };
    }>,
    packs: Map<string, { members: string[]; id: string }>,
    structures: Map<string, { position: { lat: number; lon: number }; type: string }>,
    deltaTime: number
  ): void {
    // Initialize culture for new creatures
    this.initializeCulture(creatures);

    // Create cultural sites near structures
    this.createCulturalSites(structures, packs);

    // Innovators create new expressions
    this.createExpressions(creatures, packs);

    // Creatures learn nearby expressions
    this.learnExpressions(creatures);

    // Creatures perform expressions
    this.performExpressions(creatures, deltaTime);

    // Culture spreads within packs
    this.spreadCulture(creatures, packs);
  }

  /**
   * Initialize culture for creatures
   */
  private initializeCulture(
    creatures: Map<string, { traits?: { intelligence?: number; social?: string } }>
  ): void {
    for (const [creatureId, creature] of creatures) {
      if (this.cultures.has(creatureId)) continue;

      const intelligence = creature.traits?.intelligence || 0.5;
      const social = creature.traits?.social || 'solitary';

      this.cultures.set(creatureId, {
        creatureId,
        expressions: new Map(),
        activeExpression: undefined,
        expressionTimer: 0,
        innovator: intelligence > 0.85 && social === 'pack' // Very high intelligence + social
      });
    }
  }

  /**
   * Create cultural sites near structures
   */
  private createCulturalSites(
    structures: Map<string, { position: { lat: number; lon: number }; type: string }>,
    packs: Map<string, { members: string[]; id: string }>
  ): void {
    const SITE_CREATION_CHANCE = 0.0005; // 0.05% per frame per structure

    for (const [_structureId, structure] of structures) {
      // Check if site already exists nearby
      let siteExists = false;
      for (const site of this.sites.values()) {
        const dist = this.distanceOnSphere(structure.position, site.position);
        if (dist < 5) {
          siteExists = true;
          break;
        }
      }

      if (!siteExists && Math.random() < SITE_CREATION_CHANCE) {
        // Determine site type
        let siteType: CulturalSite['type'] = 'gathering_site';
        if (structure.type.includes('longhouse')) {
          siteType = 'gathering_site';
        } else if (structure.type.includes('platform')) {
          siteType = 'art_site';
        }

        // Find pack for this location
        let packId: string | undefined;
        for (const pack of packs.values()) {
          // Check if any pack member is nearby
          // (This is simplified; ideally check creatures map)
          packId = pack.id;
          break;
        }

        const site: CulturalSite = {
          id: `site-${this.nextSiteId++}`,
          position: { ...structure.position },
          type: siteType,
          packId,
          expressions: [],
          visitors: new Set()
        };

        this.sites.set(site.id, site);
      }
    }
  }

  /**
   * Innovators create new cultural expressions
   */
  private createExpressions(
    creatures: Map<string, {
      position: { lat: number; lon: number };
      traits?: {
        intelligence?: number;
        social?: string;
      };
    }>,
    packs: Map<string, { members: string[]; id: string }>
  ): void {
    const CREATION_CHANCE = 0.0002; // 0.02% per frame

    for (const [creatureId, creature] of creatures) {
      const culture = this.cultures.get(creatureId);
      if (!culture || !culture.innovator) continue;

      if (Math.random() < CREATION_CHANCE) {
        // Determine expression type
        const types: ExpressionType[] = ['body_art', 'dance', 'sculpture', 'music', 'ceremony'];
        const type = types[Math.floor(Math.random() * types.length)];

        // Get pack ID
        let packId: string | undefined;
        for (const pack of packs.values()) {
          if (pack.members.includes(creatureId)) {
            packId = pack.id;
            break;
          }
        }

        this.createExpression(type, creatureId, creature.position, packId);
      }
    }
  }

  /**
   * Create a new cultural expression
   */
  private createExpression(
    type: ExpressionType,
    creatorId: string,
    position: { lat: number; lon: number },
    packId?: string
  ): CulturalExpression {
    const expression: CulturalExpression = {
      id: `expr-${this.nextExpressionId++}`,
      type,
      originPackId: packId,
      creatorId,
      position: type === 'sculpture' ? { ...position } : undefined,
      complexity: 0.3 + Math.random() * 0.7, // 0.3-1.0
      timestamp: Date.now(),
      practitioners: new Set([creatorId])
    };

    // Generate type-specific data
    if (type === 'body_art') {
      // Random color pattern
      const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
      expression.pattern = colors[Math.floor(Math.random() * colors.length)];
    } else if (type === 'dance') {
      // Random movement sequence
      const moveCount = 3 + Math.floor(Math.random() * 5); // 3-7 movements
      expression.movements = [];
      for (let i = 0; i < moveCount; i++) {
        expression.movements.push({
          angle: Math.random() * Math.PI * 2,
          duration: 0.5 + Math.random() * 1.5 // 0.5-2 seconds
        });
      }
    }

    this.expressions.set(expression.id, expression);

    // Creator knows this expression
    const culture = this.cultures.get(creatorId);
    if (culture) {
      culture.expressions.set(expression.id, 1.0); // Perfect proficiency
    }

    return expression;
  }

  /**
   * Creatures learn nearby expressions
   */
  private learnExpressions(
    creatures: Map<string, {
      position: { lat: number; lon: number };
      traits?: {
        intelligence?: number;
        social?: string;
      };
    }>
  ): void {
    const LEARNING_RANGE = 5; // degrees
    const LEARNING_CHANCE = 0.01; // 1% per frame

    for (const [creatureId, creature] of creatures) {
      const culture = this.cultures.get(creatureId);
      if (!culture) continue;

      const intelligence = creature.traits?.intelligence || 0.5;
      const social = creature.traits?.social || 'solitary';

      // Social creatures learn faster
      const learningMod = social === 'pack' ? 2.0 : 1.0;

      // Find nearby expressions
      for (const expression of this.expressions.values()) {
        // Already knows this expression?
        if (culture.expressions.has(expression.id)) continue;

        // Check if anyone nearby is practicing this expression
        let nearbyPractitioner = false;
        for (const practitionerId of expression.practitioners) {
          const practitioner = creatures.get(practitionerId);
          if (!practitioner) continue;

          const dist = this.distanceOnSphere(creature.position, practitioner.position);
          if (dist < LEARNING_RANGE) {
            nearbyPractitioner = true;
            break;
          }
        }

        if (!nearbyPractitioner) continue;

        // Learning check
        if (Math.random() < LEARNING_CHANCE * intelligence * learningMod) {
          expression.practitioners.add(creatureId);
          culture.expressions.set(expression.id, 0.1); // Start with low proficiency
        }
      }
    }
  }

  /**
   * Creatures perform expressions
   */
  private performExpressions(
    _creatures: Map<string, { position: { lat: number; lon: number } }>,
    deltaTime: number
  ): void {
    const PERFORMANCE_CHANCE = 0.005; // 0.5% per frame

      for (const [_creatureId, culture] of this.cultures) {
      // Update timer
      if (culture.expressionTimer > 0) {
        culture.expressionTimer -= deltaTime;
        
        // Performance ended
        if (culture.expressionTimer <= 0) {
          culture.activeExpression = undefined;
          
          // Increase proficiency
          if (culture.activeExpression) {
            const currentProf = culture.expressions.get(culture.activeExpression) || 0;
            culture.expressions.set(culture.activeExpression, Math.min(1.0, currentProf + 0.05));
          }
        }
        continue; // Still performing
      }

      // Start new performance
      if (culture.expressions.size > 0 && Math.random() < PERFORMANCE_CHANCE) {
        const expressionIds = Array.from(culture.expressions.keys());
        const exprId = expressionIds[Math.floor(Math.random() * expressionIds.length)];
        const expr = this.expressions.get(exprId);

        if (expr) {
          culture.activeExpression = exprId;
          
          // Performance duration based on complexity
          culture.expressionTimer = expr.complexity * 5000 + 2000; // 2-7 seconds
        }
      }
    }
  }

  /**
   * Culture spreads within packs
   */
  private spreadCulture(
    _creatures: Map<string, { position: { lat: number; lon: number } }>,
    packs: Map<string, { members: string[]; id: string }>
  ): void {
    const SPREAD_CHANCE = 0.02; // 2% per frame

    for (const pack of packs.values()) {
      // Collect all expressions known by pack members
      const packExpressions = new Set<string>();
      for (const memberId of pack.members) {
        const culture = this.cultures.get(memberId);
        if (!culture) continue;

        for (const exprId of culture.expressions.keys()) {
          packExpressions.add(exprId);
        }
      }

      // Spread to members who don't know them yet
      for (const memberId of pack.members) {
        const culture = this.cultures.get(memberId);
        if (!culture) continue;

        for (const exprId of packExpressions) {
          if (culture.expressions.has(exprId)) continue;

          // Spread check
          if (Math.random() < SPREAD_CHANCE) {
            const expr = this.expressions.get(exprId);
            if (expr) {
              expr.practitioners.add(memberId);
              culture.expressions.set(exprId, 0.2); // Start with moderate proficiency
            }
          }
        }
      }
    }
  }

  /**
   * Calculate distance on sphere
   */
  private distanceOnSphere(
    pos1: { lat: number; lon: number },
    pos2: { lat: number; lon: number }
  ): number {
    const dLat = pos2.lat - pos1.lat;
    const dLon = pos2.lon - pos1.lon;
    return Math.sqrt(dLat * dLat + dLon * dLon);
  }

  /**
   * Get all expressions
   */
  getExpressions(): CulturalExpression[] {
    return Array.from(this.expressions.values());
  }

  /**
   * Get creature's culture
   */
  getCulture(creatureId: string): CreatureCulture | null {
    return this.cultures.get(creatureId) || null;
  }

  /**
   * Get all cultural sites
   */
  getSites(): CulturalSite[] {
    return Array.from(this.sites.values());
  }

  /**
   * Check if creature is performing expression
   */
  isPerforming(creatureId: string): boolean {
    const culture = this.cultures.get(creatureId);
    return culture?.activeExpression !== undefined && culture.expressionTimer > 0;
  }
}
