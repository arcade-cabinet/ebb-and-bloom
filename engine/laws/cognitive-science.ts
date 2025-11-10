/**
 * Cognitive Science & Intelligence Laws
 *
 * Brain size, learning, memory, problem-solving from neuroscience.
 * Jerison, Dunbar, Reader & Laland, and others.
 */

/**
 * Encephalization
 * Jerison (1973) "Evolution of the Brain and Intelligence"
 */
export const Encephalization = {
  /**
   * Expected brain mass from body mass
   * Brain = k × M^0.75 (allometric)
   *
   * k varies by taxon:
   * - Mammals: k = 0.01
   * - Birds: k = 0.0074
   * - Fish: k = 0.0007
   * - Reptiles: k = 0.0005
   */
  expectedBrainMass: (
    bodyMass_kg: number,
    taxon: 'mammal' | 'bird' | 'fish' | 'reptile'
  ): number => {
    const k = {
      mammal: 0.01,
      bird: 0.0074,
      fish: 0.0007,
      reptile: 0.0005,
    }[taxon];

    return k * Math.pow(bodyMass_kg, 0.75); // kg
  },

  /**
   * Encephalization Quotient (EQ)
   * Actual brain / Expected brain
   *
   * EQ values:
   * - 0.5: Below average (most reptiles)
   * - 1.0: Average for taxon
   * - 2-3: Above average (dogs, pigs)
   * - 4-5: High intelligence (elephants, cetaceans)
   * - 7+: Human-level
   */
  EQ: (
    actualBrain_kg: number,
    bodyMass_kg: number,
    taxon: 'mammal' | 'bird' | 'fish' | 'reptile'
  ): number => {
    const expected = Encephalization.expectedBrainMass(bodyMass_kg, taxon);
    return actualBrain_kg / expected;
  },

  /**
   * Tool use threshold
   * Reader & Laland (2002): Requires EQ > 2.5 + neophilia
   */
  canUseTool: (EQ: number, neophilia: number = 0.5): boolean => {
    return EQ > 2.5 - neophilia;
  },

  /**
   * Innovation rate
   * How often does species invent new behaviors?
   *
   * Based on Reader & Laland (2002) database of primate innovations
   */
  innovationRate_perYear: (EQ: number, populationSize: number): number => {
    const baseRate = 0.01 * Math.pow(EQ, 2); // per individual per year
    return baseRate * populationSize; // total innovations per year
  },
};

/**
 * Learning & Memory
 * Shettleworth (2010) "Cognition, Evolution, and Behavior"
 */
export const LearningCapacity = {
  /**
   * Learning rate from brain size
   * Larger brains learn faster (more neurons = more synapses)
   */
  learningRate: (brainMass_kg: number): number => {
    return 0.1 * Math.sqrt(brainMass_kg / 0.001); // per exposure
  },

  /**
   * Memory capacity
   * How many distinct items can be remembered?
   *
   * Roughly proportional to neuron count
   */
  memoryCapacity: (brainMass_kg: number): number => {
    const neuronCount = brainMass_kg * 1e11; // ~100 billion neurons per kg
    const itemsPerNeuron = 0.00001; // Very rough estimate
    return neuronCount * itemsPerNeuron;
  },

  /**
   * Forgetting curve (Ebbinghaus)
   * R = e^(-t/S)
   *
   * Where:
   * - R = Retention
   * - t = Time since learning
   * - S = Memory strength (depends on repetitions)
   */
  retention: (
    timeSinceLearning_days: number,
    repetitions: number,
    importance: number = 1.0
  ): number => {
    const S = 1 * Math.sqrt(repetitions) * importance; // days
    return Math.exp(-timeSinceLearning_days / S);
  },

  /**
   * Cultural transmission fidelity
   * How accurately is knowledge passed on?
   *
   * Depends on:
   * - Intelligence (EQ)
   * - Teaching investment
   * - Number of exposures
   */
  transmissionFidelity: (
    teacherEQ: number,
    studentEQ: number,
    teachingTime_hours: number,
    repetitions: number
  ): number => {
    const intelligenceFactor = Math.sqrt(teacherEQ * studentEQ) / 3;
    const exposureFactor = 1 - Math.exp(-repetitions / 5);
    const timeFactor = Math.min(1, teachingTime_hours / 10);

    return intelligenceFactor * exposureFactor * timeFactor; // 0-1
  },
};

/**
 * Problem Solving
 * Byrne & Whiten (1988) "Machiavellian Intelligence"
 */
export const ProblemSolving = {
  /**
   * Can solve problem of complexity N?
   *
   * Complexity levels:
   * 1: Trial and error (all animals)
   * 2: Associative learning (most vertebrates)
   * 3: Insight learning (smart birds, mammals)
   * 4: Tool use (apes, corvids, cetaceans)
   * 5: Teaching (humans, some apes)
   * 6: Cumulative culture (humans only?)
   */
  canSolve: (EQ: number, problemComplexity: number): boolean => {
    const threshold = [0, 0.5, 1.5, 2.5, 4.0, 6.5, 10.0];
    return EQ > threshold[problemComplexity];
  },

  /**
   * Time to solve problem
   * Smarter = faster solutions
   */
  timeToSolve_hours: (
    problemComplexity: number,
    EQ: number,
    priorExperience: number = 0
  ): number => {
    const baseTime = Math.pow(2, problemComplexity); // Exponential with complexity
    const intelligenceFactor = 5 / EQ; // Smarter = faster
    const experienceFactor = 1 / (1 + priorExperience); // Experience helps

    return baseTime * intelligenceFactor * experienceFactor;
  },

  /**
   * Social learning: Can learn by observation?
   */
  canSociallyLearn: (EQ: number): boolean => {
    return EQ > 1.5; // Threshold for observational learning
  },
};

/**
 * Communication Complexity
 * How complex can communication be?
 */
export const CommunicationComplexity = {
  /**
   * Vocabulary size from brain mass
   *
   * Based on known vocabularies:
   * - Alex (parrot): ~150 words, brain ~6g
   * - Chimpanzee: ~200 signs, brain ~400g
   * - Human child: ~10,000 words, brain ~1400g
   */
  vocabularySize: (brainMass_kg: number, EQ: number): number => {
    const basePotential = Math.pow(brainMass_kg * 1000, 1.2); // ~M^1.2
    return Math.floor(basePotential * Math.sqrt(EQ));
  },

  /**
   * Recursion depth
   * Can produce nested structures? ("The cat that the dog chased ran")
   *
   * Requires EQ > 3 and large brain
   */
  canRecurse: (EQ: number): boolean => {
    return EQ > 3.0;
  },

  /**
   * Information transmission rate
   * Bits per second in communication
   */
  transmissionRate_bps: (
    vocabularySize: number,
    signalSpeed_Hz: number // How fast can produce signs
  ): number => {
    const bitsPerSymbol = Math.log2(vocabularySize);
    return bitsPerSymbol * signalSpeed_Hz;
  },
};

/**
 * Theory of Mind
 * Can understand that others have mental states?
 */
export const TheoryOfMind = {
  /**
   * First-order ToM: "I know X"
   * Requires EQ > 2.0
   */
  hasFirstOrder: (EQ: number): boolean => {
    return EQ > 2.0;
  },

  /**
   * Second-order ToM: "I know that you know X"
   * Requires EQ > 3.5
   */
  hasSecondOrder: (EQ: number): boolean => {
    return EQ > 3.5;
  },

  /**
   * Third-order ToM: "I know that you know that he knows X"
   * Requires EQ > 5.0 (great apes, some humans)
   */
  hasThirdOrder: (EQ: number): boolean => {
    return EQ > 5.0;
  },

  /**
   * Deception capability
   * Requires theory of mind to manipulate others' beliefs
   */
  canDeceive: (EQ: number): boolean => {
    return TheoryOfMind.hasSecondOrder(EQ);
  },

  /**
   * Strategic depth in social interactions
   * "I know that you know that I know..."
   */
  strategicDepth: (EQ: number): number => {
    if (!TheoryOfMind.hasFirstOrder(EQ)) return 0;
    if (!TheoryOfMind.hasSecondOrder(EQ)) return 1;
    if (!TheoryOfMind.hasThirdOrder(EQ)) return 2;
    return Math.floor(EQ / 2.5); // Higher EQ = deeper reasoning
  },
};

/**
 * Complete cognitive science laws
 */
export const CognitiveScienceLaws = {
  encephalization: Encephalization,
  learning: LearningCapacity,
  problemSolving: ProblemSolving,
  communication: CommunicationComplexity,
  theoryOfMind: TheoryOfMind,
} as const;
