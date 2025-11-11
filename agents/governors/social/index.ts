/**
 * Social Governors
 * 
 * Yuka-native implementations of social laws.
 */

export { HierarchyBehavior } from './HierarchyBehavior';
export { WarfareBehavior, MilitarySystem } from './WarfareBehavior';
export { CooperationBehavior, TitForTatBehavior } from './CooperationBehavior';
export { 
  NarrativeGovernor,
  FetchQuestGoal,
  KillQuestGoal,
} from './NarrativeGovernor';
export type {
  GeneratedQuest,
  QuestType,
  QuestObjective,
  QuestReward,
  QuestNarrative,
  QuestGiver,
  SocialContext,
  NPCContext,
  LawBasis,
} from './NarrativeGovernor';

