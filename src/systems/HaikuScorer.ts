/**
 * Haiku Scorer - Prevents narrative repetition
 * From Grok design doc: Jaccard similarity with Jaro-Winkler fallback
 * Ensures journal haikus stay fresh (<20% overlap)
 */

/**
 * Jaro-Winkler similarity for string comparison
 * Better than pure Jaccard for short poetic phrases
 */
function jaroWinkler(s1: string, s2: string): number {
  const m1 = s1.length;
  const m2 = s2.length;
  
  if (m1 === 0 && m2 === 0) return 1.0;
  if (m1 === 0 || m2 === 0) return 0.0;
  
  const matchWindow = Math.floor(Math.max(m1, m2) / 2) - 1;
  const s1Matches = new Array(m1).fill(false);
  const s2Matches = new Array(m2).fill(false);
  
  let matches = 0;
  let transpositions = 0;
  
  // Find matches
  for (let i = 0; i < m1; i++) {
    const start = Math.max(0, i - matchWindow);
    const end = Math.min(i + matchWindow + 1, m2);
    
    for (let j = start; j < end; j++) {
      if (s2Matches[j] || s1[i] !== s2[j]) continue;
      s1Matches[i] = true;
      s2Matches[j] = true;
      matches++;
      break;
    }
  }
  
  if (matches === 0) return 0.0;
  
  // Find transpositions
  let k = 0;
  for (let i = 0; i < m1; i++) {
    if (!s1Matches[i]) continue;
    while (!s2Matches[k]) k++;
    if (s1[i] !== s2[k]) transpositions++;
    k++;
  }
  
  const jaro = (matches / m1 + matches / m2 + (matches - transpositions / 2) / matches) / 3;
  
  // Winkler prefix bonus (up to 4 chars)
  let prefix = 0;
  for (let i = 0; i < Math.min(4, m1, m2); i++) {
    if (s1[i] === s2[i]) prefix++;
    else break;
  }
  
  return jaro + prefix * 0.1 * (1 - jaro);
}

/**
 * Jaccard similarity (set-based word overlap)
 */
function jaccardSimilarity(s1: string, s2: string): number {
  const words1 = new Set(s1.toLowerCase().split(/\s+/));
  const words2 = new Set(s2.toLowerCase().split(/\s+/));
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return union.size === 0 ? 0 : intersection.size / union.size;
}

/**
 * Score a collection of haikus for diversity
 * @param haikus - Array of haiku strings
 * @param threshold - Max acceptable similarity (default 0.2 = 20%)
 * @returns Scoring result with recommendations
 */
export function scoreHaikus(haikus: string[], threshold: number = 0.2) {
  if (haikus.length < 2) {
    return {
      averageSimilarity: 0,
      maxSimilarity: 0,
      flaggedPairs: [],
      diverse: true,
      recommendation: 'Not enough haikus to compare'
    };
  }
  
  const similarities: number[] = [];
  const flaggedPairs: Array<{ i: number; j: number; similarity: number; samples: [string, string] }> = [];
  let maxSim = 0;
  
  for (let i = 0; i < haikus.length; i++) {
    for (let j = i + 1; j < haikus.length; j++) {
      // Use Jaro-Winkler for poetic phrases (better than pure word overlap)
      const sim = jaroWinkler(haikus[i], haikus[j]);
      similarities.push(sim);
      
      if (sim > maxSim) maxSim = sim;
      
      if (sim > threshold) {
        flaggedPairs.push({
          i,
          j,
          similarity: sim,
          samples: [haikus[i], haikus[j]]
        });
      }
    }
  }
  
  const avgSim = similarities.length > 0 
    ? similarities.reduce((a, b) => a + b, 0) / similarities.length 
    : 0;
  
  const diverse = avgSim <= threshold;
  
  let recommendation = diverse
    ? 'Haikus are diverse - evo aches fresh'
    : 'Repetition detected: Use unlikely metaphors (e.g., "thorn as lover", not "thorn wakes again")';
  
  if (flaggedPairs.length > 0) {
    recommendation += ` | ${flaggedPairs.length} pair(s) flagged for high similarity`;
  }
  
  return {
    averageSimilarity: avgSim,
    maxSimilarity: maxSim,
    flaggedPairs,
    diverse,
    recommendation
  };
}

/**
 * Generate diverse haiku variations
 * Uses procedural metaphor bank to avoid repetition
 */
const METAPHOR_BANK = [
  { subject: 'flipper', verbs: ['wakes', 'stirs', 'remembers', 'calls'], objects: ['the vein', 'forgotten echoes', 'tidal scars'] },
  { subject: 'thorn', verbs: ['pierces', 'guards', 'blooms as', 'whispers'], objects: ['the ache', 'lover\'s grudge', 'wound-light'] },
  { subject: 'chainsaw', verbs: ['carves', 'echoes', 'fells', 'scars'], objects: ['ancient oak', 'thorny defiance', 'memory veins'] },
  { subject: 'water', verbs: ['flows through', 'cleanses', 'drowns', 'births'], objects: ['copper dreams', 'pollution haze', 'life sparks'] }
];

export function generateDiverseHaiku(trait: string, action: string, world: string): string {
  // Find relevant metaphor or use generic
  const metaphor = METAPHOR_BANK.find(m => m.subject.toLowerCase() === trait.toLowerCase()) 
    || METAPHOR_BANK[0];
  
  const verb = metaphor.verbs[Math.floor(Math.random() * metaphor.verbs.length)];
  const object = metaphor.objects[Math.floor(Math.random() * metaphor.objects.length)];
  
  // 5-7-5 haiku structure (approximate syllables)
  return `${trait} ${verb}\n${object} ${action}\n${world} responds`;
}

// Export all functions individually for named imports
export { jaroWinkler, jaccardSimilarity };
