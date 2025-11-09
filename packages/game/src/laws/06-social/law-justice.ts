/**
 * Law & Justice - Legal systems, property rights, dispute resolution
 */

export const PropertyRights = {
  bundleOfRights: ['use', 'exclude', 'transfer', 'profit'],
  
  isDefendable: (resourceValue: number, defenseCost: number) => resourceValue > defenseCost * 1.2,
  
  tragedyOfCommons: (users: number, resourceRegeneration: number, extraction: number) => {
    return users * extraction > resourceRegeneration;
  },
};

export const DisputeResolution = {
  mediationSuccess: (relationship: number, stakes: number) => {
    return relationship / stakes > 2;
  },
  
  arbitrationCost: (caseComplexity: number) => caseComplexity * 100,
};

export const LawJusticeLaws = {
  property: PropertyRights,
  dispute: DisputeResolution,
} as const;

