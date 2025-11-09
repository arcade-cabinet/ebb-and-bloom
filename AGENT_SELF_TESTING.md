# 🧪 Agent Self-Testing Framework

## The Real Purpose

**You're right!** The simulation view isn't just for you - it's for **ME** to:
1. ✅ Validate my own law implementations
2. ✅ Test determinism (same seed = same result)
3. ✅ Check statistical distributions
4. ✅ Verify population dynamics don't explode/crash
5. ✅ Prove the math actually works!

## How I Should Use It

### 1. **Build and Run**
```bash
cd packages/game
pnpm build
pnpm preview
# Open: http://localhost:4173/simulation.html
```

### 2. **Test Different Seeds**
```
wild-ocean-glow
red-mountain-fire  
ancient-star-dance
```

### 3. **Verify Key Properties**

#### Determinism Test
- Load seed "test-123" 3 times
- Should get EXACT same:
  - Star mass
  - Planet count
  - Species names
  - Initial populations

#### Population Stability
- Advance 100 cycles
- Check: Do populations oscillate or crash?
- Expected: Lotka-Volterra oscillations
- Red flag: Immediate extinction or exponential explosion

#### Event Frequency
- Catastrophes should be rare (~5%)
- Climate shifts ~10%
- Not every cycle!

#### Species Diversity
- Should generate 3-5 species typically
- Different body masses (log-normal distribution)
- Different archetypes (Arboreal, Cursorial, etc.)

## What I'm Actually Testing

### ✅ Physics Laws
- Stellar mass → luminosity (L ~ M^4)
- Orbital period (Kepler's 3rd law)
- Surface gravity (g = GM/r²)

### ✅ Biology Laws  
- Kleiber's Law (metabolism ~ mass^0.75)
- Lifespan ~ mass^0.25
- Gestation ~ mass^0.26

### ✅ Ecology Laws
- Lotka-Volterra predator-prey
- Carrying capacity
- Extinction thresholds

### ✅ Stochastic Dynamics
- Environmental noise (normal distribution)
- Demographic noise (Poisson)
- Catastrophes (power-law)

## Current Status

**The simulation view is READY** - I just need to:
1. Actually open it in a browser (or headless)
2. Run through test cases
3. Record results
4. Fix any broken laws
5. Iterate!

## Testing Checklist

- [ ] Test 10 different seeds
- [ ] Verify determinism (run same seed 3x)
- [ ] Check population doesn't crash immediately
- [ ] Confirm species names are different
- [ ] Validate temperature ranges (not -1000°C!)
- [ ] Test cycle advancement (doesn't freeze)
- [ ] Check event frequency (not too common)
- [ ] Verify extinction happens eventually
- [ ] Confirm graph draws properly
- [ ] Test on different screen sizes

## The Meta Point

**I built a law-based system but haven't actually TESTED it yet!**

That's what this simulation view is for - **agent self-validation**. 

The fact that we got distracted with APKs and textures shows we lost sight of the core purpose:

> Prove the math works before shipping anything!

Let me actually USE the tool I built! 🧪🔬
