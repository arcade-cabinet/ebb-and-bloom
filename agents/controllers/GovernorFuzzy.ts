/**
 * GOVERNOR FUZZY LOGIC
 *
 * Fuzzy logic module for Governor AI decision making.
 * Determines the intensity (magnitude) and confidence of actions based on environmental context.
 */

import {
  FuzzyModule,
  FuzzyVariable,
  LeftShoulderFuzzySet,
  RightShoulderFuzzySet,
  TriangularFuzzySet,
  FuzzyRule,
  FuzzyAND,
  FuzzyOR
} from 'yuka';

/**
 * Creates the fuzzy module for Governor decision making.
 *
 * Inputs:
 * - populationStress: 0 (low) to 1 (high) - Ratio of population to capacity
 * - predatorThreat: 0 (safe) to 1 (dangerous) - Predator density
 * - resourceAbundance: 0 (scarce) to 1 (plentiful) - Food/Energy availability
 *
 * Outputs:
 * - actionMagnitude: 0 (low) to 1 (high) - Intensity of the action
 * - actionConfidence: 0 (unsure) to 1 (certain) - AI confidence
 */
export function createGovernorFuzzy(): FuzzyModule {
  const fuzzy = new FuzzyModule();

  // --- INPUTS ---

  // Population Stress (pop / capacity)
  const populationStress = new FuzzyVariable();
  const popLow = new LeftShoulderFuzzySet(0, 0.2, 0.4);
  const popOptimal = new TriangularFuzzySet(0.3, 0.5, 0.7);
  const popHigh = new RightShoulderFuzzySet(0.6, 0.8, 1.0);

  populationStress.add(popLow);
  populationStress.add(popOptimal);
  populationStress.add(popHigh);
  fuzzy.addFLV('populationStress', populationStress);

  // Predator Threat (density)
  const predatorThreat = new FuzzyVariable();
  const threatSafe = new LeftShoulderFuzzySet(0, 0.1, 0.3);
  const threatCaution = new TriangularFuzzySet(0.2, 0.4, 0.6);
  const threatDanger = new RightShoulderFuzzySet(0.5, 0.7, 1.0); // > 0.7 is very dangerous

  predatorThreat.add(threatSafe);
  predatorThreat.add(threatCaution);
  predatorThreat.add(threatDanger);
  fuzzy.addFLV('predatorThreat', predatorThreat);

  // Resource Abundance (food density or energy ratio)
  const resourceAbundance = new FuzzyVariable();
  const resScarce = new LeftShoulderFuzzySet(0, 0.2, 0.4);
  const resModerate = new TriangularFuzzySet(0.3, 0.5, 0.7);
  const resPlentiful = new RightShoulderFuzzySet(0.6, 0.8, 1.0);

  resourceAbundance.add(resScarce);
  resourceAbundance.add(resModerate);
  resourceAbundance.add(resPlentiful);
  fuzzy.addFLV('resourceAbundance', resourceAbundance);

  // --- OUTPUTS ---

  // Action Magnitude (Intensity)
  const actionMagnitude = new FuzzyVariable();
  const magLow = new LeftShoulderFuzzySet(0, 0.2, 0.4);
  const magMedium = new TriangularFuzzySet(0.3, 0.5, 0.7);
  const magHigh = new RightShoulderFuzzySet(0.6, 0.8, 1.0);

  actionMagnitude.add(magLow);
  actionMagnitude.add(magMedium);
  actionMagnitude.add(magHigh);
  fuzzy.addFLV('actionMagnitude', actionMagnitude);

  // Action Confidence
  const actionConfidence = new FuzzyVariable();
  const confLow = new LeftShoulderFuzzySet(0, 0.2, 0.4);
  const confMedium = new TriangularFuzzySet(0.3, 0.6, 0.8);
  const confHigh = new RightShoulderFuzzySet(0.7, 0.9, 1.0);

  actionConfidence.add(confLow);
  actionConfidence.add(confMedium);
  actionConfidence.add(confHigh);
  fuzzy.addFLV('actionConfidence', actionConfidence);

  // --- RULES ---

  // 1. High Threat -> High Magnitude (Smite) & High Confidence
  fuzzy.addRule(new FuzzyRule(threatDanger, magHigh));
  fuzzy.addRule(new FuzzyRule(threatDanger, confHigh));

  // 2. Low Resources -> High Magnitude (Nurture) & High Confidence
  fuzzy.addRule(new FuzzyRule(resScarce, magHigh));
  fuzzy.addRule(new FuzzyRule(resScarce, confHigh));

  // 3. High Population -> Medium Magnitude (Pressure/Migrate)
  fuzzy.addRule(new FuzzyRule(popHigh, magMedium));

  // 4. Safe & Plentiful -> Low Magnitude (Maintenance)
  fuzzy.addRule(new FuzzyRule(new FuzzyAND(threatSafe, resPlentiful), magLow));

  // 5. Caution & Moderate -> Medium Magnitude
  fuzzy.addRule(new FuzzyRule(new FuzzyAND(threatCaution, resModerate), magMedium));

  return fuzzy;
}
