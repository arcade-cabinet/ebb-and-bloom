/**
 * NARRATIVE GOVERNOR
 * 
 * Emergent quest generation from social dynamics using YUKA primitives.
 * 
 * REPLACES: DFU's QRC/QBN quest files (static text templates)
 * WITH: Dynamic quest generation from social/ecological/biological laws
 * 
 * ARCHITECTURE:
 * - StateMachine: Quest state tracking (INACTIVE → AVAILABLE → ACTIVE → COMPLETED → FAILED)
 * - Goals/Evaluators: Quest objective prioritization
 * - Social Laws: Quest generation from faction relationships, resource scarcity, conflicts
 * 
 * QUEST TYPES (Emergent from Laws):
 * - Fetch: Resource scarcity (EcologyGovernor)
 * - Kill: Creature threats (BiologyGovernor + PredatorPreyBehavior)
 * - Escort: Social hierarchy (HierarchyBehavior + safe passage needs)
 * - Discover: Territorial expansion (TerritorialFuzzy)
 * - Craft: Tool specialization (SpecializationSystem)
 * - Political: Faction conflicts (WarfareBehavior + CooperationBehavior)
 */

import {
  StateMachine,
  State,
  Goal,
  GoalEvaluator,
  Vector3,
} from 'yuka';

// ============================================================================
// QUEST DATA STRUCTURES
// ============================================================================

export type QuestType = 'fetch' | 'kill' | 'escort' | 'discover' | 'craft' | 'political';

export interface QuestObjective {
  id: string;
  type: 'reach' | 'collect' | 'eliminate' | 'protect' | 'craft' | 'persuade';
  target: string;
  location?: Vector3;
  quantity?: number;
  timeLimit?: number;
  optional: boolean;
}

export interface QuestReward {
  items: string[];
  reputation: number;
  currency: number;
  socialStanding?: number;
}

export interface QuestNarrative {
  intro: string;
  accept: string;
  refuse: string;
  progress: string[];
  success: string;
  failure: string;
}

export interface QuestGiver {
  npcId: string;
  name: string;
  socialRank: number;
  socialTension: number;
  faction?: string;
  urgency: number;
}

export interface LawBasis {
  ecology?: number;
  social?: number;
  biology?: number;
  physics?: number;
}

export interface GeneratedQuest {
  id: string;
  type: QuestType;
  giver: QuestGiver;
  objectives: QuestObjective[];
  rewards: QuestReward;
  narrative: QuestNarrative;
  lawBasis: LawBasis;
  difficulty: number;
  timeToComplete: number;
  state: string;
  stateMachine: StateMachine;
}

// ============================================================================
// SOCIAL CONTEXT (Input from other governors)
// ============================================================================

export interface SocialContext {
  population: number;
  governanceType: 'band' | 'tribe' | 'chiefdom' | 'state';
  factionCount: number;
  avgSocialRank: number;
  conflictLevel: number;
  cooperationLevel: number;
  resourceScarcity: number;
  creatureThreat: number;
  territoryPressure: number;
}

export interface NPCContext {
  id: string;
  name: string;
  role: string;
  socialRank: number;
  faction?: string;
  needs: string[];
  problems: string[];
  resources: Record<string, number>;
}

// ============================================================================
// QUEST STATE MACHINE STATES
// ============================================================================

class QuestInactiveState extends State {
  enter(quest: GeneratedQuest): void {
    quest.state = 'INACTIVE';
  }

  execute(_quest: GeneratedQuest): void {
    // Quest has not been generated yet
  }

  exit(_quest: GeneratedQuest): void {
    // Transition to available
  }
}

class QuestAvailableState extends State {
  enter(quest: GeneratedQuest): void {
    quest.state = 'AVAILABLE';
  }

  execute(_quest: GeneratedQuest): void {
    // Quest is available to be accepted by player
  }

  exit(_quest: GeneratedQuest): void {
    // Player accepted quest
  }
}

class QuestActiveState extends State {
  enter(quest: GeneratedQuest): void {
    quest.state = 'ACTIVE';
  }

  execute(_quest: GeneratedQuest): void {
    // Quest is in progress
    // Track objectives completion
  }

  exit(_quest: GeneratedQuest): void {
    // Quest completing or failing
  }
}

class QuestCompletedState extends State {
  enter(quest: GeneratedQuest): void {
    quest.state = 'COMPLETED';
  }

  execute(_quest: GeneratedQuest): void {
    // Quest completed, rewards given
  }

  exit(_quest: GeneratedQuest): void {
    // Quest cleanup
  }
}

class QuestFailedState extends State {
  enter(quest: GeneratedQuest): void {
    quest.state = 'FAILED';
  }

  execute(_quest: GeneratedQuest): void {
    // Quest failed, apply consequences
  }

  exit(_quest: GeneratedQuest): void {
    // Quest cleanup
  }
}

// ============================================================================
// QUEST GOALS AND EVALUATORS
// ============================================================================

export class FetchQuestGoal extends Goal<GeneratedQuest> {
  declare owner: GeneratedQuest;
  declare status: string;

  constructor(quest: GeneratedQuest) {
    super(quest);
  }

  activate(): void {
    this.status = Goal.STATUS.ACTIVE;
  }

  execute(): void {
    // Check if fetch objectives completed
    const allCollected = this.owner.objectives.every(obj => 
      obj.type !== 'collect' || obj.quantity === 0
    );

    if (allCollected) {
      this.status = Goal.STATUS.COMPLETED;
    }
  }

  terminate(): void {
    this.status = Goal.STATUS.INACTIVE;
  }
}

export class KillQuestGoal extends Goal<GeneratedQuest> {
  declare owner: GeneratedQuest;
  declare status: string;

  constructor(quest: GeneratedQuest) {
    super(quest);
  }

  activate(): void {
    this.status = Goal.STATUS.ACTIVE;
  }

  execute(): void {
    // Check if kill objectives completed
    const allEliminated = this.owner.objectives.every(obj =>
      obj.type !== 'eliminate' || obj.quantity === 0
    );

    if (allEliminated) {
      this.status = Goal.STATUS.COMPLETED;
    }
  }

  terminate(): void {
    this.status = Goal.STATUS.INACTIVE;
  }
}

class QuestPriorityEvaluator extends GoalEvaluator {
  questType: QuestType;
  declare characterBias: number;

  constructor(questType: QuestType, characterBias: number = 0.5) {
    super(characterBias);
    this.questType = questType;
  }

  calculateDesirability(context: SocialContext): number {
    let desirability = this.characterBias;

    switch (this.questType) {
      case 'fetch':
        // High resource scarcity = high fetch quest desirability
        desirability += context.resourceScarcity * 0.5;
        break;

      case 'kill':
        // High creature threat = high kill quest desirability
        desirability += context.creatureThreat * 0.6;
        break;

      case 'escort':
        // High conflict + high social rank variation = high escort desirability
        desirability += (context.conflictLevel * 0.3) + 
                       (1 - context.avgSocialRank) * 0.2;
        break;

      case 'discover':
        // High territory pressure = high discover quest desirability
        desirability += context.territoryPressure * 0.4;
        break;

      case 'political':
        // High faction count + high conflict = high political quest desirability
        desirability += (context.factionCount / 10) * 0.3 + 
                       context.conflictLevel * 0.4;
        break;

      case 'craft':
        // Higher governance complexity = more craft quests
        const complexityScore = context.governanceType === 'state' ? 1.0 :
                              context.governanceType === 'chiefdom' ? 0.7 :
                              context.governanceType === 'tribe' ? 0.4 : 0.2;
        desirability += complexityScore * 0.5;
        break;
    }

    return Math.min(1, Math.max(0, desirability));
  }

  setGoal(quest: GeneratedQuest): void {
    switch (this.questType) {
      case 'fetch':
        quest.objectives = this.generateFetchObjectives(quest);
        break;
      case 'kill':
        quest.objectives = this.generateKillObjectives(quest);
        break;
      default:
        break;
    }
  }

  private generateFetchObjectives(quest: GeneratedQuest): QuestObjective[] {
    return [
      {
        id: `fetch-${Math.random().toString(36).substr(2, 9)}`,
        type: 'collect',
        target: 'rare_herb',
        quantity: Math.floor(quest.difficulty * 10),
        optional: false,
      },
    ];
  }

  private generateKillObjectives(quest: GeneratedQuest): QuestObjective[] {
    return [
      {
        id: `kill-${Math.random().toString(36).substr(2, 9)}`,
        type: 'eliminate',
        target: 'aggressive_predator',
        quantity: Math.floor(quest.difficulty * 5),
        optional: false,
      },
    ];
  }
}

// ============================================================================
// NARRATIVE GOVERNOR CLASS
// ============================================================================

export class NarrativeGovernor {
  private evaluators: Map<QuestType, QuestPriorityEvaluator>;
  private activeQuests: Map<string, GeneratedQuest>;
  private questIdCounter: number = 0;

  constructor() {
    this.evaluators = new Map();
    this.activeQuests = new Map();

    // Initialize evaluators for each quest type
    this.evaluators.set('fetch', new QuestPriorityEvaluator('fetch', 0.3));
    this.evaluators.set('kill', new QuestPriorityEvaluator('kill', 0.4));
    this.evaluators.set('escort', new QuestPriorityEvaluator('escort', 0.3));
    this.evaluators.set('discover', new QuestPriorityEvaluator('discover', 0.2));
    this.evaluators.set('political', new QuestPriorityEvaluator('political', 0.5));
    this.evaluators.set('craft', new QuestPriorityEvaluator('craft', 0.3));
  }

  // ============================================================================
  // QUEST GENERATION (Main Entry Point)
  // ============================================================================

  /**
   * Generate quest from social context
   * 
   * REPLACES: Parser.Parse(questTextFile)
   * 
   * @param socialContext - Current social state from governors
   * @param npcContext - Quest giver context
   * @returns Generated quest
   */
  generateQuest(
    socialContext: SocialContext,
    npcContext: NPCContext
  ): GeneratedQuest {
    // 1. Evaluate quest type desirability
    const questType = this.selectQuestType(socialContext);

    // 2. Calculate difficulty from social complexity
    const difficulty = this.calculateDifficulty(socialContext, npcContext);

    // 3. Generate quest giver
    const giver = this.createQuestGiver(npcContext);

    // 4. Generate objectives from quest type
    const objectives = this.generateObjectives(questType, difficulty, socialContext);

    // 5. Calculate rewards from social value and risk
    const rewards = this.calculateRewards(difficulty, socialContext, questType);

    // 6. Generate narrative from social dynamics
    const narrative = this.generateNarrative(questType, giver, objectives, socialContext);

    // 7. Determine law basis
    const lawBasis = this.determineLawBasis(questType, socialContext);

    // 8. Create quest with StateMachine
    const quest = this.createQuestWithStateMachine(
      questType,
      giver,
      objectives,
      rewards,
      narrative,
      lawBasis,
      difficulty
    );

    // Store quest
    this.activeQuests.set(quest.id, quest);

    return quest;
  }

  /**
   * Update quest cycle
   * 
   * Called each frame to:
   * - Check social state changes
   * - Generate new relevant quests
   * - Prune old/expired quests
   * 
   * @param delta - Time delta
   * @param socialContext - Current social state
   */
  update(delta: number, socialContext: SocialContext): void {
    // Update all quest state machines
    for (const quest of this.activeQuests.values()) {
      quest.stateMachine.update(delta);
    }

    // Prune completed/failed quests older than threshold
    this.pruneOldQuests();

    // Generate new quests if social tension is high
    if (socialContext.conflictLevel > 0.7 || socialContext.resourceScarcity > 0.6) {
      // Quest generation logic here
    }
  }

  // ============================================================================
  // QUEST TYPE SELECTION
  // ============================================================================

  private selectQuestType(socialContext: SocialContext): QuestType {
    // Calculate desirability for each quest type
    const desirabilities: Array<{ type: QuestType; score: number }> = [];

    for (const [type, evaluator] of this.evaluators.entries()) {
      const score = evaluator.calculateDesirability(socialContext);
      desirabilities.push({ type, score });
    }

    // Sort by desirability (highest first)
    desirabilities.sort((a, b) => b.score - a.score);

    // Return most desirable quest type
    return desirabilities[0].type;
  }

  // ============================================================================
  // DIFFICULTY CALCULATION
  // ============================================================================

  private calculateDifficulty(
    socialContext: SocialContext,
    npcContext: NPCContext
  ): number {
    // Base difficulty from governance complexity (Service typology)
    let difficulty = 0.5;

    switch (socialContext.governanceType) {
      case 'band':
        difficulty = 0.3;
        break;
      case 'tribe':
        difficulty = 0.5;
        break;
      case 'chiefdom':
        difficulty = 0.7;
        break;
      case 'state':
        difficulty = 0.9;
        break;
    }

    // Modify by social rank (higher rank = harder quests)
    difficulty += npcContext.socialRank * 0.2;

    // Modify by urgency (more urgent = harder)
    const urgency = npcContext.problems.length / 5;
    difficulty += urgency * 0.1;

    return Math.min(1, Math.max(0.1, difficulty));
  }

  // ============================================================================
  // QUEST GIVER CREATION
  // ============================================================================

  private createQuestGiver(npcContext: NPCContext): QuestGiver {
    // Calculate social tension from problems and needs
    const socialTension = (npcContext.problems.length + npcContext.needs.length) / 10;

    return {
      npcId: npcContext.id,
      name: npcContext.name,
      socialRank: npcContext.socialRank,
      socialTension: Math.min(1, socialTension),
      faction: npcContext.faction,
      urgency: npcContext.problems.length / 5,
    };
  }

  // ============================================================================
  // OBJECTIVE GENERATION (Quest-Type Specific)
  // ============================================================================

  private generateObjectives(
    questType: QuestType,
    difficulty: number,
    socialContext: SocialContext
  ): QuestObjective[] {
    switch (questType) {
      case 'fetch':
        return this.generateFetchObjectives(difficulty, socialContext);
      case 'kill':
        return this.generateKillObjectives(difficulty, socialContext);
      case 'escort':
        return this.generateEscortObjectives(difficulty, socialContext);
      case 'discover':
        return this.generateDiscoverObjectives(difficulty, socialContext);
      case 'craft':
        return this.generateCraftObjectives(difficulty, socialContext);
      case 'political':
        return this.generatePoliticalObjectives(difficulty, socialContext);
      default:
        return [];
    }
  }

  private generateFetchObjectives(
    difficulty: number,
    context: SocialContext
  ): QuestObjective[] {
    const objectives: QuestObjective[] = [];

    // Scarce resources based on ecology
    const resourceTypes = ['herb', 'ore', 'water', 'food'];
    const scarcityIndex = Math.floor(context.resourceScarcity * resourceTypes.length);
    const resource = resourceTypes[scarcityIndex];

    objectives.push({
      id: `fetch-${this.questIdCounter++}`,
      type: 'collect',
      target: `rare_${resource}`,
      quantity: Math.ceil(difficulty * 10),
      location: new Vector3(
        Math.random() * 1000 - 500,
        0,
        Math.random() * 1000 - 500
      ),
      optional: false,
    });

    // Optional bonus objective for higher difficulty
    if (difficulty > 0.6) {
      objectives.push({
        id: `fetch-bonus-${this.questIdCounter++}`,
        type: 'collect',
        target: `pristine_${resource}`,
        quantity: Math.ceil(difficulty * 3),
        optional: true,
      });
    }

    return objectives;
  }

  private generateKillObjectives(
    difficulty: number,
    context: SocialContext
  ): QuestObjective[] {
    const objectives: QuestObjective[] = [];

    // Creature threat determines target
    const creatureTypes = ['rat', 'wolf', 'bear', 'dragon'];
    const threatIndex = Math.min(
      creatureTypes.length - 1,
      Math.floor(context.creatureThreat * creatureTypes.length)
    );
    const creature = creatureTypes[threatIndex];

    objectives.push({
      id: `kill-${this.questIdCounter++}`,
      type: 'eliminate',
      target: `aggressive_${creature}`,
      quantity: Math.ceil(difficulty * 5),
      location: new Vector3(
        Math.random() * 1000 - 500,
        0,
        Math.random() * 1000 - 500
      ),
      optional: false,
    });

    return objectives;
  }

  private generateEscortObjectives(
    difficulty: number,
    _context: SocialContext
  ): QuestObjective[] {
    const objectives: QuestObjective[] = [];

    objectives.push({
      id: `escort-${this.questIdCounter++}`,
      type: 'protect',
      target: 'noble_traveler',
      location: new Vector3(
        Math.random() * 1000 - 500,
        0,
        Math.random() * 1000 - 500
      ),
      timeLimit: difficulty * 600, // 10 minutes max
      optional: false,
    });

    return objectives;
  }

  private generateDiscoverObjectives(
    _difficulty: number,
    _context: SocialContext
  ): QuestObjective[] {
    const objectives: QuestObjective[] = [];

    objectives.push({
      id: `discover-${this.questIdCounter++}`,
      type: 'reach',
      target: 'ancient_ruin',
      location: new Vector3(
        Math.random() * 1000 - 500,
        0,
        Math.random() * 1000 - 500
      ),
      optional: false,
    });

    return objectives;
  }

  private generateCraftObjectives(
    difficulty: number,
    _context: SocialContext
  ): QuestObjective[] {
    const objectives: QuestObjective[] = [];

    const craftables = ['sword', 'armor', 'potion', 'tool'];
    const item = craftables[Math.floor(difficulty * craftables.length)];

    objectives.push({
      id: `craft-${this.questIdCounter++}`,
      type: 'craft',
      target: `masterwork_${item}`,
      quantity: 1,
      optional: false,
    });

    return objectives;
  }

  private generatePoliticalObjectives(
    _difficulty: number,
    _context: SocialContext
  ): QuestObjective[] {
    const objectives: QuestObjective[] = [];

    objectives.push({
      id: `political-${this.questIdCounter++}`,
      type: 'persuade',
      target: 'rival_faction_leader',
      optional: false,
    });

    return objectives;
  }

  // ============================================================================
  // REWARD CALCULATION
  // ============================================================================

  private calculateRewards(
    difficulty: number,
    context: SocialContext,
    questType: QuestType
  ): QuestReward {
    // Base reward scales with difficulty
    const baseReward = difficulty * 100;

    // Currency scales with governance type (state has more money)
    const governanceMultiplier = context.governanceType === 'state' ? 2.0 :
                                context.governanceType === 'chiefdom' ? 1.5 :
                                context.governanceType === 'tribe' ? 1.0 : 0.5;

    const currency = Math.floor(baseReward * governanceMultiplier);

    // Reputation scales with quest type and difficulty
    const reputationBase = difficulty * 50;
    const reputation = questType === 'political' ? reputationBase * 2 : reputationBase;

    // Items based on quest type
    const items = this.generateRewardItems(questType, difficulty);

    return {
      items,
      reputation: Math.floor(reputation),
      currency,
      socialStanding: difficulty * 0.1,
    };
  }

  private generateRewardItems(questType: QuestType, difficulty: number): string[] {
    const items: string[] = [];

    switch (questType) {
      case 'fetch':
        items.push('potion_of_healing');
        break;
      case 'kill':
        items.push('enchanted_weapon');
        break;
      case 'escort':
        items.push('noble_favor');
        break;
      case 'discover':
        items.push('ancient_artifact');
        break;
      case 'craft':
        items.push('master_crafting_tools');
        break;
      case 'political':
        items.push('political_alliance');
        break;
    }

    // Higher difficulty = more items
    if (difficulty > 0.7) {
      items.push('rare_gem');
    }

    return items;
  }

  // ============================================================================
  // NARRATIVE GENERATION
  // ============================================================================

  private generateNarrative(
    questType: QuestType,
    giver: QuestGiver,
    objectives: QuestObjective[],
    _context: SocialContext
  ): QuestNarrative {
    const templates = this.getNarrativeTemplates(questType);

    // Fill templates with context
    const intro = templates.intro
      .replace('{giver}', giver.name)
      .replace('{urgency}', giver.urgency > 0.7 ? 'urgent' : 'important')
      .replace('{target}', objectives[0].target);

    const accept = templates.accept
      .replace('{giver}', giver.name);

    const refuse = templates.refuse
      .replace('{giver}', giver.name);

    const success = templates.success
      .replace('{giver}', giver.name);

    const failure = templates.failure
      .replace('{giver}', giver.name);

    return {
      intro,
      accept,
      refuse,
      progress: ['You are making progress...'],
      success,
      failure,
    };
  }

  private getNarrativeTemplates(questType: QuestType): {
    intro: string;
    accept: string;
    refuse: string;
    success: string;
    failure: string;
  } {
    const templates = {
      fetch: {
        intro: '{giver} needs you to collect {target}. This is {urgency}!',
        accept: '{giver} thanks you for accepting this task.',
        refuse: '{giver} looks disappointed but understands.',
        success: '{giver} is grateful for your help!',
        failure: '{giver} is displeased with your failure.',
      },
      kill: {
        intro: '{giver} asks you to eliminate {target}. The threat is {urgency}!',
        accept: '{giver} wishes you luck in battle.',
        refuse: '{giver} will need to find someone else.',
        success: '{giver} praises your combat prowess!',
        failure: '{giver} mourns the ongoing threat.',
      },
      escort: {
        intro: '{giver} needs safe passage. This is {urgency}!',
        accept: '{giver} entrusts their safety to you.',
        refuse: '{giver} will travel alone, then.',
        success: '{giver} arrived safely thanks to you!',
        failure: '{giver} did not survive the journey.',
      },
      discover: {
        intro: '{giver} wants you to find {target}. This is {urgency}!',
        accept: '{giver} provides you with directions.',
        refuse: '{giver} will send someone else.',
        success: '{giver} is amazed by your discovery!',
        failure: '{giver} is disappointed you found nothing.',
      },
      craft: {
        intro: '{giver} needs {target} crafted. This is {urgency}!',
        accept: '{giver} provides materials.',
        refuse: '{giver} will find another craftsman.',
        success: '{giver} admires your craftsmanship!',
        failure: '{giver} is unhappy with the result.',
      },
      political: {
        intro: '{giver} needs you to negotiate with {target}. This is {urgency}!',
        accept: '{giver} briefs you on the politics.',
        refuse: '{giver} understands the risk.',
        success: '{giver} celebrates the new alliance!',
        failure: '{giver} regrets the failed diplomacy.',
      },
    };

    return templates[questType];
  }

  // ============================================================================
  // LAW BASIS DETERMINATION
  // ============================================================================

  private determineLawBasis(
    questType: QuestType,
    context: SocialContext
  ): LawBasis {
    const basis: LawBasis = {};

    switch (questType) {
      case 'fetch':
        basis.ecology = context.resourceScarcity;
        break;
      case 'kill':
        basis.biology = context.creatureThreat;
        break;
      case 'escort':
        basis.social = context.conflictLevel;
        break;
      case 'discover':
        basis.ecology = context.territoryPressure;
        break;
      case 'craft':
        basis.social = context.governanceType === 'state' ? 0.9 : 0.5;
        break;
      case 'political':
        basis.social = context.conflictLevel;
        basis.ecology = context.resourceScarcity * 0.5;
        break;
    }

    return basis;
  }

  // ============================================================================
  // QUEST STATE MACHINE CREATION
  // ============================================================================

  private createQuestWithStateMachine(
    type: QuestType,
    giver: QuestGiver,
    objectives: QuestObjective[],
    rewards: QuestReward,
    narrative: QuestNarrative,
    lawBasis: LawBasis,
    difficulty: number
  ): GeneratedQuest {
    const questId = `quest-${this.questIdCounter++}-${type}`;

    // Create quest object
    const quest: GeneratedQuest = {
      id: questId,
      type,
      giver,
      objectives,
      rewards,
      narrative,
      lawBasis,
      difficulty,
      timeToComplete: difficulty * 1800, // 30 minutes max
      state: 'INACTIVE',
      stateMachine: new StateMachine(),
    };

    // Set quest as owner of state machine
    quest.stateMachine.owner = quest;

    // Add states to state machine
    quest.stateMachine.add('INACTIVE', new QuestInactiveState());
    quest.stateMachine.add('AVAILABLE', new QuestAvailableState());
    quest.stateMachine.add('ACTIVE', new QuestActiveState());
    quest.stateMachine.add('COMPLETED', new QuestCompletedState());
    quest.stateMachine.add('FAILED', new QuestFailedState());

    // Start in AVAILABLE state (ready to be accepted)
    quest.stateMachine.changeTo('AVAILABLE');

    return quest;
  }

  // ============================================================================
  // QUEST MANAGEMENT
  // ============================================================================

  /**
   * Accept quest (player accepts)
   */
  acceptQuest(questId: string): void {
    const quest = this.activeQuests.get(questId);
    if (quest && quest.state === 'AVAILABLE') {
      quest.stateMachine.changeTo('ACTIVE');
    }
  }

  /**
   * Complete quest
   */
  completeQuest(questId: string): void {
    const quest = this.activeQuests.get(questId);
    if (quest && quest.state === 'ACTIVE') {
      quest.stateMachine.changeTo('COMPLETED');
    }
  }

  /**
   * Fail quest
   */
  failQuest(questId: string): void {
    const quest = this.activeQuests.get(questId);
    if (quest && quest.state === 'ACTIVE') {
      quest.stateMachine.changeTo('FAILED');
    }
  }

  /**
   * Get quest by ID
   */
  getQuest(questId: string): GeneratedQuest | undefined {
    return this.activeQuests.get(questId);
  }

  /**
   * Get all available quests
   */
  getAvailableQuests(): GeneratedQuest[] {
    return Array.from(this.activeQuests.values()).filter(
      quest => quest.state === 'AVAILABLE'
    );
  }

  /**
   * Get all active quests
   */
  getActiveQuests(): GeneratedQuest[] {
    return Array.from(this.activeQuests.values()).filter(
      quest => quest.state === 'ACTIVE'
    );
  }

  /**
   * Prune old quests
   */
  private pruneOldQuests(): void {
    const toRemove: string[] = [];

    for (const [id, quest] of this.activeQuests.entries()) {
      if (quest.state === 'COMPLETED' || quest.state === 'FAILED') {
        toRemove.push(id);
      }
    }

    for (const id of toRemove) {
      this.activeQuests.delete(id);
    }
  }
}
