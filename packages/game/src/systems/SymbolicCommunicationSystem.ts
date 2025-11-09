/**
 * Symbolic Communication System (Gen5)
 * 
 * Creatures develop visual symbol systems for communication:
 * - Territorial markers (boundary symbols)
 * - Resource markers (food/water/danger indicators)
 * - Identity symbols (pack/lineage markers)
 * - Abstract concepts (trade, alliance, warning)
 * 
 * Symbols emerge from need and spread through social learning.
 */

export type SymbolType = 
  | 'territory_marker'
  | 'resource_food'
  | 'resource_water'
  | 'danger_warning'
  | 'pack_identity'
  | 'trade_offer'
  | 'alliance_request'
  | 'abstract';

export interface Symbol {
  id: string;
  type: SymbolType;
  position: { lat: number; lon: number };
  shape: 'circle' | 'triangle' | 'square' | 'line' | 'spiral' | 'cross';
  color: string; // Hex color
  size: number; // 0.1-1.0
  createdBy: string; // Creature ID
  packId?: string;
  meaning?: string; // Optional abstract meaning
  timestamp: number;
  recognizedBy: Set<string>; // Creature IDs that understand this symbol
}

export interface SymbolKnowledge {
  creatureId: string;
  knownSymbols: Map<SymbolType, number>; // type -> proficiency (0-1)
  createdSymbols: string[]; // Symbol IDs created by this creature
  canCreate: boolean; // Requires high intelligence
  teachingSymbol?: SymbolType; // Currently teaching this type
}

export class SymbolicCommunicationSystem {
  private symbols: Map<string, Symbol> = new Map();
  private knowledge: Map<string, SymbolKnowledge> = new Map();
  private nextSymbolId: number = 0;

  /**
   * Update symbolic communication
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
    deltaTime: number
  ): void {
    // Initialize knowledge for new creatures
    this.initializeKnowledge(creatures);

    // High-intelligence creatures create symbols
    this.createSymbols(creatures, packs);

    // Creatures learn nearby symbols
    this.learnSymbols(creatures);

    // Social creatures teach symbols
    this.teachSymbols(creatures);

    // Symbols fade over time
    this.fadeSymbols(deltaTime);
  }

  /**
   * Initialize knowledge for creatures
   */
  private initializeKnowledge(
    creatures: Map<string, { traits?: { intelligence?: number } }>
  ): void {
    for (const [creatureId, creature] of creatures) {
      if (this.knowledge.has(creatureId)) continue;

      const intelligence = creature.traits?.intelligence || 0.5;

      this.knowledge.set(creatureId, {
        creatureId,
        knownSymbols: new Map(),
        createdSymbols: [],
        canCreate: intelligence > 0.8, // Very high intelligence required
        teachingSymbol: undefined
      });
    }
  }

  /**
   * Intelligent creatures create symbols
   */
  private createSymbols(
    creatures: Map<string, {
      position: { lat: number; lon: number };
      traits?: {
        intelligence?: number;
        social?: string;
      };
    }>,
    packs: Map<string, { members: string[]; id: string }>
  ): void {
    const CREATION_CHANCE = 0.0001; // 0.01% per frame

    for (const [creatureId, creature] of creatures) {
      const knowledge = this.knowledge.get(creatureId);
      if (!knowledge || !knowledge.canCreate) continue;

      const intelligence = creature.traits?.intelligence || 0.5;

      // Creation check
      if (Math.random() < CREATION_CHANCE * intelligence) {
        // Determine symbol type based on context
        const symbolType = this.determineSymbolType(creatureId, creature, packs);
        
        // Get pack ID if creature is in a pack
        let packId: string | undefined;
        for (const pack of packs.values()) {
          if (pack.members.includes(creatureId)) {
            packId = pack.id;
            break;
          }
        }

        this.createSymbol(symbolType, creature.position, creatureId, packId);
      }
    }
  }

  /**
   * Determine symbol type from context
   */
  private determineSymbolType(
    _creatureId: string,
    creature: { position: { lat: number; lon: number }; traits?: any },
    _packs: Map<string, { members: string[]; id: string }>
  ): SymbolType {
    // Pack creatures create identity markers
    if (creature.traits?.social === 'pack') {
      return 'pack_identity';
    }

    // Random selection weighted by intelligence
    const types: SymbolType[] = [
      'territory_marker',
      'resource_food',
      'danger_warning',
      'trade_offer',
      'abstract'
    ];

    return types[Math.floor(Math.random() * types.length)];
  }

  /**
   * Create a new symbol
   */
  private createSymbol(
    type: SymbolType,
    position: { lat: number; lon: number },
    creatorId: string,
    packId?: string
  ): Symbol {
    const shapes: Symbol['shape'][] = ['circle', 'triangle', 'square', 'line', 'spiral', 'cross'];
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffffff'];

    const symbol: Symbol = {
      id: `symbol-${this.nextSymbolId++}`,
      type,
      position: { ...position },
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 0.3 + Math.random() * 0.7, // 0.3-1.0
      createdBy: creatorId,
      packId,
      timestamp: Date.now(),
      recognizedBy: new Set([creatorId])
    };

    this.symbols.set(symbol.id, symbol);

    // Creator knows this symbol
    const knowledge = this.knowledge.get(creatorId);
    if (knowledge) {
      knowledge.createdSymbols.push(symbol.id);
      knowledge.knownSymbols.set(type, 1.0); // Perfect understanding
    }

    return symbol;
  }

  /**
   * Creatures learn nearby symbols
   */
  private learnSymbols(
    creatures: Map<string, { position: { lat: number; lon: number }; traits?: { intelligence?: number } }>
  ): void {
    const LEARNING_RANGE = 3; // degrees
    const LEARNING_CHANCE = 0.01; // 1% per frame

    for (const [creatureId, creature] of creatures) {
      const knowledge = this.knowledge.get(creatureId);
      if (!knowledge) continue;

      const intelligence = creature.traits?.intelligence || 0.5;

      // Find nearby symbols
      for (const symbol of this.symbols.values()) {
        // Already knows this symbol?
        if (symbol.recognizedBy.has(creatureId)) continue;

        // Within range?
        const dist = this.distanceOnSphere(creature.position, symbol.position);
        if (dist > LEARNING_RANGE) continue;

        // Learning check (smart creatures learn faster)
        if (Math.random() < LEARNING_CHANCE * intelligence) {
          symbol.recognizedBy.add(creatureId);
          
          // Update knowledge
          const currentProf = knowledge.knownSymbols.get(symbol.type) || 0;
          knowledge.knownSymbols.set(symbol.type, Math.min(1.0, currentProf + 0.1));
        }
      }
    }
  }

  /**
   * Social creatures teach symbols
   */
  private teachSymbols(
    creatures: Map<string, {
      position: { lat: number; lon: number };
      traits?: {
        social?: string;
        intelligence?: number;
      };
    }>
  ): void {
    const TEACHING_RANGE = 3; // degrees
    const TEACHING_CHANCE = 0.05; // 5% per frame

    // Find potential teachers
    const teachers: string[] = [];
    for (const [creatureId, knowledge] of this.knowledge) {
      if (knowledge.knownSymbols.size > 0) {
        const creature = creatures.get(creatureId);
        if (creature?.traits?.social === 'pack') {
          teachers.push(creatureId);
        }
      }
    }

    // Teach nearby creatures
    for (const teacherId of teachers) {
      const teacher = creatures.get(teacherId);
      if (!teacher) continue;

      const teacherKnowledge = this.knowledge.get(teacherId)!;

      // Find students nearby
      for (const [studentId, student] of creatures) {
        if (studentId === teacherId) continue;

        const dist = this.distanceOnSphere(teacher.position, student.position);
        if (dist > TEACHING_RANGE) continue;

        // Teaching check
        if (Math.random() < TEACHING_CHANCE) {
          // Teach random known symbol type
          const knownTypes = Array.from(teacherKnowledge.knownSymbols.keys());
          if (knownTypes.length > 0) {
            const symbolType = knownTypes[Math.floor(Math.random() * knownTypes.length)];
            
            const studentKnowledge = this.knowledge.get(studentId);
            if (studentKnowledge) {
              const currentProf = studentKnowledge.knownSymbols.get(symbolType) || 0;
              studentKnowledge.knownSymbols.set(symbolType, Math.min(1.0, currentProf + 0.2));
              
              teacherKnowledge.teachingSymbol = symbolType;
            }
          }
        }
      }
    }
  }

  /**
   * Symbols fade over time (except permanent pack markers)
   */
  private fadeSymbols(_deltaTime: number): void {
    const FADE_TIME = 300000; // 5 minutes

    const toDelete: string[] = [];
    for (const [id, symbol] of this.symbols) {
      // Pack identity markers are permanent
      if (symbol.type === 'pack_identity') continue;

      // Check age
      if (Date.now() - symbol.timestamp > FADE_TIME) {
        toDelete.push(id);
      }
    }

    for (const id of toDelete) {
      this.symbols.delete(id);
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
   * Get all symbols
   */
  getSymbols(): Symbol[] {
    return Array.from(this.symbols.values());
  }

  /**
   * Get creature's symbol knowledge
   */
  getKnowledge(creatureId: string): SymbolKnowledge | null {
    return this.knowledge.get(creatureId) || null;
  }

  /**
   * Check if creature understands symbol
   */
  understandsSymbol(creatureId: string, symbolId: string): boolean {
    const symbol = this.symbols.get(symbolId);
    return symbol?.recognizedBy.has(creatureId) || false;
  }
}
