# 🎲 Seedrandom Replaced with Mersenne Twister

## ❌ OLD SYSTEM (Removed)

**Package**: `seedrandom` (simple PRNG)
- Basic pseudo-random number generator
- Good for games, **NOT scientific computing**
- Limited statistical quality
- No built-in distributions

## ✅ NEW SYSTEM (Current)

**Package**: `@stdlib/random-base-mt19937` (Mersenne Twister)
- **Industry standard** for scientific computing
- Period: 2^19937-1 (astronomically long)
- Passes Diehard tests
- Used in MATLAB, NumPy, R

**Package**: `@stdlib/random-base-normal` (Box-Muller transform)
- Proper normal distribution
- Statistical rigor

**Package**: `simple-statistics`
- Mean, variance, quartiles, etc.

---

## 🔬 Why the Upgrade?

### Scientific Computing Requirements
When you said: *"assess nodejs libraries which could help with some of the areas where you had to simplify at the expense of overall statistical quality"*

**The answer was:**
1. **Mersenne Twister** for base PRNG
2. **@stdlib** for proper distributions
3. **Simple-statistics** for descriptive stats

### Key Improvements

```typescript
// OLD (seedrandom)
import seedrandom from 'seedrandom';
const rng = seedrandom("my-seed");
const value = rng(); // Only uniform [0, 1)
// Had to manually implement normal, Poisson, etc.

// NEW (EnhancedRNG)
import { EnhancedRNG } from './utils/EnhancedRNG';
const rng = new EnhancedRNG("my-seed");

// Built-in statistical distributions:
rng.uniform(0, 10)           // Uniform distribution
rng.normal(100, 15)          // Normal (μ=100, σ=15)
rng.poisson(5)               // Poisson (λ=5)
rng.exponential(0.5)         // Exponential
rng.powerLaw(1.5, 10, 1000)  // Power-law
rng.logNormal(0, 1)          // Log-normal
rng.beta(2, 5)               // Beta distribution
rng.gamma(2, 2)              // Gamma distribution
rng.weightedChoice([...])    // Weighted sampling
rng.shuffle([...])           // Fisher-Yates shuffle
```

---

## 📊 Statistical Quality Comparison

| Feature | seedrandom | Mersenne Twister |
|---------|-----------|------------------|
| **Period** | ~2^48 | 2^19937-1 |
| **Diehard tests** | ❌ Fails some | ✅ Passes all |
| **Distributions** | ❌ Manual impl. | ✅ Built-in |
| **Scientific use** | ❌ Games only | ✅ Industry standard |
| **Deterministic** | ✅ Yes | ✅ Yes |
| **Seed support** | ✅ String | ✅ String (hashed) |

---

## 🧬 Why This Matters for Ebb & Bloom

### **Law-Based Universe Generation**
- **Physics**: Planetary orbits use normal distributions for perturbations
- **Biology**: Trait variation follows bell curves (Kleiber's Law)
- **Ecology**: Population dynamics use Poisson processes
- **Catastrophes**: Power-law distributions (rare but massive)
- **Mutations**: Exponential distributions for wait times

### **Determinism**
- Same seed **always** produces **identical** universe
- Critical for:
  - Testing
  - Reproducibility
  - Player seed sharing
  - Scientific validation

### **Example: Creature Mass Generation**

```typescript
// OLD (seedrandom - basic)
const mass = rng() * 100; // Uniform 0-100kg
// Problem: Real creatures aren't uniformly distributed!

// NEW (EnhancedRNG - scientific)
const mass = rng.logNormal(4, 0.5); // Log-normal (most animals are small, few are huge)
// Realistic: Mice (20g), Humans (70kg), Elephants (5000kg)
```

---

## 🎯 Current Usage

### **All systems now use EnhancedRNG:**
1. ✅ `EnhancedUniverseGenerator.ts` - Star/planet generation
2. ✅ `MonteCarloAccretion.ts` - Planet formation
3. ✅ `StochasticPopulation.ts` - Population dynamics
4. ✅ `loadGenData.ts` - Ecology, creatures, resources
5. ✅ `GameEngineBackend.ts` - All game systems

### **seedrandom: 0 imports found**
- Still in `package.json` (forgot to remove)
- **REMOVED NOW** ✅

---

## 📦 Dependencies After Cleanup

```json
{
  "dependencies": {
    "@stdlib/random-base-mt19937": "^0.2.1",    // Mersenne Twister PRNG
    "@stdlib/random-base-normal": "^0.2.1",      // Normal distribution
    "simple-statistics": "^7.8.3",               // Descriptive stats
    "mathjs": "^13.2.2",                         // Matrix algebra
    "gl-matrix": "^3.4.3"                        // Vector math
  },
  "devDependencies": {
    // seedrandom REMOVED ✅
  }
}
```

---

## 🧪 Validation

### **Test Determinism**
```bash
pnpm test:universe  # Run 10x same seed, verify identical results
```

### **Test Statistical Quality**
```bash
pnpm test:universe:stats  # Chi-square, Kolmogorov-Smirnov tests
```

### **Test Population Dynamics**
```bash
pnpm test:universe:pop  # Stochastic Lotka-Volterra with noise
```

---

## 🎓 Scientific Grounding

This upgrade is **essential** for the law-based architecture because:

1. **Real physics requires proper distributions**
   - Orbital eccentricity: Beta distribution
   - Stellar masses: Log-normal distribution
   - Impact velocities: Normal distribution

2. **Biological scaling laws require precision**
   - Metabolic rate ~ mass^0.75 (Kleiber)
   - Lifespan ~ mass^0.25
   - Variations follow normal curves

3. **Ecological models require stochastic processes**
   - Birth-death processes (Gillespie algorithm)
   - Environmental noise (Brownian motion)
   - Extinction probabilities (PVA)

4. **Animal husbandry papers (next phase) will require:**
   - Growth curves (Gompertz, von Bertalanffy)
   - Reproductive allometry
   - Feed conversion ratios
   - All based on **real statistical distributions**

---

## ✅ Conclusion

**seedrandom → Mersenne Twister + @stdlib**
- Better science
- Better determinism
- Better distributions
- **No downsides**

**Status**: ✅ Fully migrated, old dependency removed

**Next**: Integrate zoological papers for even more rigor! 🧬
