/**
 * Religion & Ritual Laws - Costly signaling, group cohesion
 */

export const RitualTheory = {
  costlySignaling: (ritualCost: number, commitment: number) => ritualCost * commitment,
  
  groupCohesion: (ritualFrequency: number, participants: number, cost: number) => {
    return ritualFrequency * Math.sqrt(participants) * Math.log(cost + 1);
  },
  
  synchronyEffect: (participants: number) => Math.log(participants + 1),
};

export const SupernaturalBeliefs = {
  agentDetection: (ambiguity: number, threat: number) => {
    return ambiguity * threat > 0.3;
  },
  
  moralGods: (groupSize: number) => groupSize > 1000,
};

export const ReligionLaws = {
  ritual: RitualTheory,
  supernatural: SupernaturalBeliefs,
} as const;

