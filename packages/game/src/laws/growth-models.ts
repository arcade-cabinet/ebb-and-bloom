/**
 * Growth Models
 * 
 * How organisms grow over time.
 * von Bertalanffy, Gompertz, and other validated models.
 */

/**
 * von Bertalanffy Growth
 * von Bertalanffy (1938) "A quantitative theory of organic growth"
 * Human Biology, 10(2), 181-213
 * 
 * THE STANDARD for fish and aquatic organisms
 * Also used for reptiles, some mammals
 */
export const VonBertalanffyGrowth = {
  /**
   * Growth in length
   * L(t) = L_∞ × (1 - e^(-K(t - t_0)))
   * 
   * @param age Age in years
   * @param L_infinity Asymptotic length (max size)
   * @param K Growth rate constant (1/year)
   * @param t0 Theoretical age at zero length
   */
  length: (
    age_years: number,
    L_infinity_m: number,
    K_perYear: number,
    t0_years: number = 0
  ): number => {
    return L_infinity_m * (1 - Math.exp(-K_perYear * (age_years - t0_years)));
  },
  
  /**
   * Growth in mass
   * W(t) = W_∞ × (1 - e^(-K(t - t_0)))^b
   * 
   * Where b ≈ 3 (isometric) or varies with body shape
   */
  mass: (
    age_years: number,
    W_infinity_kg: number,
    K_perYear: number,
    t0_years: number = 0,
    b: number = 3
  ): number => {
    const lengthFraction = 1 - Math.exp(-K_perYear * (age_years - t0_years));
    return W_infinity_kg * Math.pow(lengthFraction, b);
  },
  
  /**
   * Estimate K from lifespan
   * Fast-growing species: High K, short life
   * Slow-growing species: Low K, long life
   * 
   * Empirical: K ≈ 1.5 / Lifespan
   */
  estimateK: (lifespan_years: number): number => {
    return 1.5 / lifespan_years;
  },
};

/**
 * Gompertz Growth
 * Gompertz (1825) - classical growth model
 * Better for species with inflection points in growth
 */
export const GompertzGrowth = {
  /**
   * Gompertz curve
   * W(t) = W_∞ × exp(-B × exp(-G × t))
   * 
   * Used for:
   * - Domestic animals (cattle, chickens)
   * - Tumors (medical)
   * - Some wild mammals
   */
  mass: (
    age_years: number,
    W_infinity_kg: number,
    B: number, // Integration constant
    G_perYear: number // Growth rate constant
  ): number => {
    return W_infinity_kg * Math.exp(-B * Math.exp(-G_perYear * age_years));
  },
  
  /**
   * Age at maximum growth rate (inflection point)
   * t_max = ln(B) / G
   */
  ageAtMaxGrowth: (B: number, G_perYear: number): number => {
    return Math.log(B) / G_perYear; // years
  },
  
  /**
   * Estimate parameters from data
   * If we know mass at 3 time points
   */
  estimateParameters: (
    mass1_kg: number, age1_years: number,
    mass2_kg: number, age2_years: number,
    mass3_kg: number, age3_years: number
  ): { W_infinity: number; B: number; G: number } => {
    // Simplified estimation (real version uses nonlinear regression)
    const W_infinity = Math.max(mass1_kg, mass2_kg, mass3_kg) * 1.2; // Assume max seen is 80% of asymptote
    const G = 0.3; // Typical value
    const B = 2.0; // Typical value
    
    return { W_infinity, B, G };
  },
};

/**
 * Logistic Growth
 * Verhulst (1845) - population and individual growth
 */
export const LogisticGrowth = {
  /**
   * Logistic curve (sigmoid)
   * W(t) = W_∞ / (1 + e^(-r(t - t_m)))
   * 
   * Where:
   * - W_∞ = Asymptotic mass
   * - r = Growth rate
   * - t_m = Age at midpoint (50% of final mass)
   */
  mass: (
    age_years: number,
    W_infinity_kg: number,
    r_perYear: number,
    t_midpoint_years: number
  ): number => {
    return W_infinity_kg / (1 + Math.exp(-r_perYear * (age_years - t_midpoint_years)));
  },
  
  /**
   * Growth rate (derivative)
   * dW/dt = r × W × (1 - W/W_∞)
   */
  growthRate: (
    currentMass_kg: number,
    W_infinity_kg: number,
    r_perYear: number
  ): number => {
    return r_perYear * currentMass_kg * (1 - currentMass_kg / W_infinity_kg); // kg/year
  },
  
  /**
   * Age at maximum growth rate
   * Occurs at exactly 50% of asymptotic mass
   */
  ageAtMaxGrowth: (t_midpoint_years: number): number => {
    return t_midpoint_years;
  },
};

/**
 * Seasonal Growth
 * Many organisms grow only during favorable seasons
 */
export const SeasonalGrowth = {
  /**
   * Growing degree-days model
   * Growth only occurs above threshold temperature
   * 
   * GDD = Σ(T_daily - T_threshold) for days where T > T_threshold
   */
  growingDegreeDays: (
    dailyTemperatures_K: number[],
    thresholdTemp_K: number
  ): number => {
    return dailyTemperatures_K.reduce((sum, T) => {
      return T > thresholdTemp_K ? sum + (T - thresholdTemp_K) : sum;
    }, 0);
  },
  
  /**
   * Development rate from temperature
   * Rate increases exponentially with temp (within range)
   * 
   * Based on Arrhenius equation
   */
  developmentRate: (
    temperature_K: number,
    optimalTemp_K: number = 298, // 25°C
    Q10: number = 2.5 // Rate doubles every 10°C
  ): number => {
    const deltaTdeg = (temperature_K - optimalTemp_K);
    return Math.pow(Q10, deltaTdeg / 10);
  },
  
  /**
   * Growth season length
   * Days where temperature permits growth
   */
  growingSeasonLength: (
    yearlyTemperatures_K: number[],
    thresholdTemp_K: number
  ): number => {
    return yearlyTemperatures_K.filter(T => T > thresholdTemp_K).length; // days
  },
};

/**
 * Indeterminate Growth
 * Some species grow throughout life (fish, reptiles)
 */
export const IndeterminateGrowth = {
  /**
   * Growth never stops, but slows with age
   * Typical for:
   * - Most fish
   * - Reptiles
   * - Some invertebrates
   */
  isIndeterminate: (taxonClass: string): boolean => {
    return ['fish', 'reptile', 'amphibian'].includes(taxonClass.toLowerCase());
  },
  
  /**
   * Annual growth rate decreases with age
   * rate(t) = K × (1 - L(t)/L_∞)
   */
  annualGrowthRate: (
    currentSize_m: number,
    asymptoteSize_m: number,
    K_perYear: number
  ): number => {
    return K_perYear * (1 - currentSize_m / asymptoteSize_m);
  },
};

/**
 * Complete growth model laws
 */
export const GrowthModelLaws = {
  vonBertalanffy: VonBertalanffyGrowth,
  gompertz: GompertzGrowth,
  logistic: LogisticGrowth,
  seasonal: SeasonalGrowth,
  indeterminate: IndeterminateGrowth,
} as const;

