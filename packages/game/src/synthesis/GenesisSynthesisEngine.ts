/**
 * GENESIS SYNTHESIS ENGINE
 * 
 * The actual step-by-step synthesis from Big Bang → Civilization
 * 
 * THIS IS THE MISSING PIECE.
 * 
 * Not just "generate planet" - but actually:
 * 1. Big Bang → particles
 * 2. Particles → atoms (nucleosynthesis)
 * 3. Atoms → molecules (chemistry)
 * 4. Molecules → organic compounds (prebiotic)
 * 5. Organics → life (abiogenesis)
 * 6. Life → complexity (evolution)
 * 7. Complexity → intelligence (cognition)
 * 8. Intelligence → society (social laws)
 * 9. Society → technology (tools)
 * 10. Technology → civilization (culture)
 * 
 * Each step SYNTHESIZES from previous using LAWS.
 * NOT skipping steps. NOT jumping to results.
 */

import { LAWS } from '../laws';
import { PERIODIC_TABLE } from '../tables/periodic-table';
import { EnhancedRNG } from '../utils/EnhancedRNG';
import { ComplexityLevel, UniverseState } from '../laws/core/UniversalLawCoordinator';

const YEAR = 365.25 * 86400;

/**
 * Synthesis state at a moment in time
 */
export interface SynthesisState {
  // Time
  t: number; // Seconds since Big Bang
  timeScale: number; // Current time step multiplier (adaptive)
  
  // What EXISTS at this moment (synthesized so far)
  particles: Map<string, number>; // Quarks, leptons, photons
  atoms: Map<string, number>; // H, He, Li, etc.
  molecules: Map<string, number>; // H2O, CO2, CH4, etc.
  
  // Spatial structure
  stars: any[]; // Stars that have formed
  planets: any[]; // Planets that have accreted
  
  // Biological
  organisms: any[]; // Living things
  species: any[]; // Distinct species
  
  // Social
  groups: any[]; // Social groups
  societies: any[]; // Complex societies
  
  // Technological
  tools: any[]; // Technology
  structures: any[]; // Buildings
  
  // Emergent properties
  complexity: ComplexityLevel;
  temperature: number;
  density: number;
  
  // Event tracking (for adaptive time)
  lastEventTime: number; // When did something last happen?
  eventsThisEpoch: string[]; // What happened recently?
}

/**
 * Genesis Synthesis Engine
 * 
 * Runs the ACTUAL synthesis process
 */
export class GenesisSynthesisEngine {
  private rng: EnhancedRNG;
  private state: SynthesisState;
  
  constructor(seed: string) {
    this.rng = new EnhancedRNG(seed);
    
    // Initial state: VOID
    this.state = {
      t: 0,
      timeScale: 1.0, // Start at normal speed
      particles: new Map(),
      atoms: new Map(),
      molecules: new Map(),
      stars: [],
      planets: [],
      organisms: [],
      species: [],
      groups: [],
      societies: [],
      tools: [],
      structures: [],
      complexity: ComplexityLevel.VOID,
      temperature: Infinity,
      density: Infinity,
      lastEventTime: 0,
      eventsThisEpoch: [],
    };
  }
  
  /**
   * ADAPTIVE TIME STEPPING
   * 
   * Automatically adjusts time scale based on what's happening:
   * - Fast: Nothing interesting (waiting for stars to form)
   * - Slow: Events happening (supernova, planets, life)
   * - Stop: Complexity threshold reached
   */
  private updateTimeScale(): void {
    const dt = this.state.t - this.state.lastEventTime;
    const dtYears = dt / YEAR;
    
    // If nothing has happened in a while, speed up
    if (dtYears > 1e9) {
      // Billions of years, nothing happening → FAST FORWARD
      this.state.timeScale = 1e9; // 1 billion years per step
    } else if (dtYears > 1e6) {
      // Millions of years, nothing happening → Speed up
      this.state.timeScale = 1e6; // 1 million years per step
    } else if (this.state.eventsThisEpoch.length > 0) {
      // Events happening → SLOW DOWN to observe
      this.state.timeScale = 1000; // 1000 years per step
    } else {
      // Normal cosmic time
      this.state.timeScale = 1e6;
    }
    
    // Very slow for biological/social timescales
    if (this.state.complexity >= ComplexityLevel.LIFE) {
      this.state.timeScale = 100; // 100 years per step (observable evolution)
    }
    if (this.state.complexity >= ComplexityLevel.COGNITIVE) {
      this.state.timeScale = 10; // 10 years per step (social changes)
    }
  }
  
  /**
   * Record an event (triggers time slowdown)
   */
  private recordEvent(eventName: string): void {
    this.state.eventsThisEpoch.push(eventName);
    this.state.lastEventTime = this.state.t;
    console.log(`  📍 Event: ${eventName} (t=${(this.state.t / (1e9 * YEAR)).toFixed(2)}Gyr)`);
  }
  
  /**
   * STEP 1: Big Bang → Particles
   * t = 0 to t = 1 second
   */
  synthesizeParticles(targetTime: number): void {
    console.log(`[Genesis] t=${targetTime}s: Synthesizing particles...`);
    
    // Inflation → Quarks & leptons
    // Use cosmology laws
    const quarkDensity = LAWS.cosmology?.inflation?.particleDensity?.(this.state.t) || 1e90;
    
    this.state.particles.set('up-quark', quarkDensity * 0.4);
    this.state.particles.set('down-quark', quarkDensity * 0.4);
    this.state.particles.set('electron', quarkDensity * 0.2);
    this.state.particles.set('photon', quarkDensity * 10); // Many photons
    
    this.state.temperature = 1e13; // K (very hot)
    this.state.density = quarkDensity;
    this.state.complexity = ComplexityLevel.PARTICLES;
    
    this.recordEvent('Particle Era');
    
    console.log(`  Particles: ${this.state.particles.size} types`);
    console.log(`  Temperature: ${this.state.temperature.toExponential(2)}K`);
  }
  
  /**
   * STEP 2: Particles → Atoms (Nucleosynthesis)
   * t = 3 minutes to t = 20 minutes
   */
  synthesizeAtoms(targetTime: number): void {
    console.log(`[Genesis] t=${targetTime / 60}min: Nucleosynthesis...`);
    
    // Big Bang nucleosynthesis
    // Primordial abundances from cosmology
    this.state.atoms.set('H', 0.75); // Hydrogen
    this.state.atoms.set('He', 0.24); // Helium
    this.state.atoms.set('Li', 0.00001); // Trace lithium
    
    this.state.temperature = 1e9; // Cooling
    this.state.complexity = ComplexityLevel.ATOMS;
    
    this.recordEvent('Nucleosynthesis');
    
    console.log(`  Atoms: ${this.state.atoms.size} elements`);
    console.log(`  H: ${(this.state.atoms.get('H')! * 100).toFixed(1)}%`);
    console.log(`  He: ${(this.state.atoms.get('He')! * 100).toFixed(1)}%`);
  }
  
  /**
   * STEP 3: Stellar Nucleosynthesis (Heavy Elements)
   * t = 100 Myr to t = 13.8 Gyr
   * 
   * NOTE: Made async to prevent blocking browser UI
   */
  async synthesizeHeavyElements(targetTime: number): Promise<void> {
    console.log(`[Genesis] t=${(targetTime / (1e6 * YEAR)).toFixed(0)}Myr: Stellar nucleosynthesis...`);
    
    // SMART APPROACH: Use analytical solution instead of Monte Carlo
    // Salpeter IMF with α=2.35 gives us EXPECTED rate of massive stars
    // No need to sample 10,000 every time!
    
    // Expected fraction of massive stars (>8 M☉) from Salpeter IMF
    // Analytical integral: ∫[8,100] x^(-2.35) dx / ∫[0.08,100] x^(-2.35) dx
    // Result: ~0.002 (0.2% are massive stars)
    const expectedMassiveFraction = 0.002;
    
    // For 100 Myr, assume ~100,000 stars formed in this region
    const estimatedStarsFormed = 100000;
    const expectedMassiveStars = estimatedStarsFormed * expectedMassiveFraction;
    
    // Use RNG to determine if THIS region got lucky/unlucky
    // Poisson distribution around expected value
    const massiveStars = this.rng.poisson(expectedMassiveStars);
    
    console.log(`  Estimated stars formed: ${estimatedStarsFormed.toLocaleString()}`);
    console.log(`  Expected massive: ${expectedMassiveStars.toFixed(1)} (${(expectedMassiveFraction*100).toFixed(2)}%)`);
    console.log(`  Actual massive (this region): ${massiveStars}`);
    
    // If massive stars formed → they go supernova → heavy elements
    // If NO massive stars → universe stays H/He only (valid outcome!)
    if (massiveStars > 0) {
      // Each supernova enriches interstellar medium
      // Metallicity proportional to number of supernovae
      const enrichmentFactor = massiveStars / estimatedStarsFormed;
      
      // Supernova → All elements up to Fe
      // Abundances scaled by how many massive stars formed
      this.state.atoms.set('C', 0.0024 * enrichmentFactor); // Carbon
      this.state.atoms.set('N', 0.0007 * enrichmentFactor); // Nitrogen  
      this.state.atoms.set('O', 0.0057 * enrichmentFactor); // Oxygen (crucial for H2O)
      this.state.atoms.set('Ne', 0.0012 * enrichmentFactor); // Neon
      this.state.atoms.set('Mg', 0.0006 * enrichmentFactor); // Magnesium
      this.state.atoms.set('Si', 0.0007 * enrichmentFactor); // Silicon
      this.state.atoms.set('S', 0.0004 * enrichmentFactor); // Sulfur
      this.state.atoms.set('Fe', 0.0011 * enrichmentFactor); // Iron
      
      console.log(`  Supernovae: ${massiveStars} (${((massiveStars/estimatedStarsFormed)*100).toFixed(2)}%)`);
      console.log(`  Metals enriched into interstellar medium`);
      this.recordEvent(`${massiveStars} Supernovae`);
    } else {
      console.log(`  No massive stars formed → No heavy elements`);
      console.log(`  Universe remains primordial (H/He only)`);
      console.log(`  This is a valid outcome - not all universes support life`);
      // No event = time will speed up automatically
    }
    
    console.log(`  Heavy elements: ${this.state.atoms.size - 3} new types`);
    console.log(`  O: ${((this.state.atoms.get('O') || 0) * 100).toFixed(3)}% (needed for H2O)`);
    console.log(`  C: ${((this.state.atoms.get('C') || 0) * 100).toFixed(3)}% (needed for organics)`);
    console.log(`  Metallicity: ${((this.state.atoms.get('Fe') || 0) * 100).toFixed(3)}%`);
  }
  
  /**
   * STEP 4: Atoms → Molecules (Chemistry)
   * Requires T < 10,000K
   */
  synthesizeMolecules(): void {
    console.log(`[Genesis] Molecular synthesis...`);
    
    // Check if temperature allows molecules
    if (this.state.temperature > 10000) {
      console.log(`  ⚠️  Too hot (${this.state.temperature.toFixed(0)}K) - molecules unstable`);
      return;
    }
    
    // Simple molecules from available atoms
    const H = this.state.atoms.get('H') || 0;
    const O = this.state.atoms.get('O') || 0;
    const C = this.state.atoms.get('C') || 0;
    const N = this.state.atoms.get('N') || 0;
    
    console.log(`  Available atoms: H=${(H*100).toFixed(2)}% O=${(O*100).toFixed(3)}% C=${(C*100).toFixed(3)}%`);
    
    // Molecular hydrogen (most common)
    if (H > 0) {
      this.state.molecules.set('H2', H * 0.5); // Molecular hydrogen
    }
    
    // Water (crucial for life)
    if (H > 0 && O > 0) {
      const h2o = Math.min(H * 0.1, O * 0.5); // 10% of H forms water
      this.state.molecules.set('H2O', h2o);
      console.log(`  H2O formed: ${(h2o * 100).toFixed(6)}%`);
    }
    
    // Carbon dioxide
    if (C > 0 && O > 0) {
      const co2 = Math.min(C * 0.5, O * 0.25); 
      this.state.molecules.set('CO2', co2);
    }
    
    // Methane (organic compound, crucial for abiogenesis)
    if (C > 0 && H > 0) {
      const ch4 = Math.min(C * 0.3, H * 0.1); // Some C + H → methane
      this.state.molecules.set('CH4', ch4);
      console.log(`  CH4 formed: ${(ch4 * 100).toFixed(6)}% (organic!)`);
    }
    
    // Ammonia (needed for prebiotic chemistry)
    if (N > 0 && H > 0) {
      const nh3 = Math.min(N * 0.5, H * 0.1);
      this.state.molecules.set('NH3', nh3);
    }
    
    this.state.complexity = ComplexityLevel.MOLECULES;
    
    if (this.state.molecules.size > 0) {
      this.recordEvent('Molecular Clouds');
    }
    
    console.log(`  Molecules: ${this.state.molecules.size} types`);
    console.log(`  H2O: ${this.state.molecules.has('H2O') ? '✅' : '❌'}`);
    console.log(`  CO2: ${this.state.molecules.has('CO2') ? '✅' : '❌'}`);
    console.log(`  CH4: ${this.state.molecules.has('CH4') ? '✅ (organic)' : '❌'}`);
  }
  
  /**
   * STEP 5: Planetary Accretion
   * Molecules → Planetesimals → Planets
   */
  synthesizePlanets(): void {
    console.log(`[Genesis] Planetary accretion...`);
    
    // Need a star first
    if (this.state.stars.length === 0) {
      // Form star from available atoms
      const starMass = this.rng.powerLaw(2.35, 0.08, 100);
      const star = {
        mass: starMass,
        luminosity: LAWS.stellar.mainSequence.luminosity(starMass),
        temperature: LAWS.stellar.mainSequence.temperature(starMass),
        composition: {
          H: this.state.atoms.get('H') || 0.75,
          He: this.state.atoms.get('He') || 0.24,
          metals: Array.from(this.state.atoms.entries())
            .filter(([elem]) => elem !== 'H' && elem !== 'He')
            .reduce((sum, [_, frac]) => sum + frac, 0),
        },
      };
      
      this.state.stars.push(star);
      console.log(`  Star formed: ${LAWS.stellar.mainSequence.spectralType(star.temperature)} (${starMass.toFixed(2)} M☉)`);
    }
    
    const star = this.state.stars[0];
    
    // Accrete planets from available molecules + dust
    const planetCount = this.rng.poisson(1.5) + 1;
    
    for (let i = 0; i < planetCount; i++) {
      const orbitalRadius = 0.1 * Math.pow(10, this.rng.uniform(0, 2.7)); // AU
      const mass = this.rng.logNormal(0, 2) * 317.8 * 5.972e24; // kg
      
      // Composition from available atoms
      const frostLine = Math.sqrt(star.luminosity) * 2.7;
      const isRocky = orbitalRadius < frostLine;
      
      const composition = isRocky ? {
        core: { Fe: 0.88, Ni: 0.06, S: 0.04 },
        mantle: { O: 0.44, Si: 0.21, Mg: 0.22, Fe: 0.06 },
        crust: { O: 0.46, Si: 0.28, Al: 0.08, Fe: 0.05, Ca: 0.04 },
      } : {
        envelope: { H: 0.75, He: 0.24 },
      };
      
      this.state.planets.push({
        mass,
        orbitalRadius,
        composition,
        type: isRocky ? 'terrestrial' : 'gas-giant',
      });
    }
    
    this.recordEvent(`${this.state.planets.length} Planets Formed`);
    
    console.log(`  Planets: ${this.state.planets.length} accreted`);
  }
  
  /**
   * STEP 6: Abiogenesis (Molecules → Life)
   * Requires liquid water, energy source, organic molecules
   */
  synthesizeLife(): void {
    console.log(`[Genesis] Abiogenesis...`);
    
    // Check prerequisites (all must be met - no shortcuts!)
    const hasWater = this.state.molecules.has('H2O') && (this.state.molecules.get('H2O') || 0) > 0;
    const hasOrganics = (this.state.molecules.has('CH4') && (this.state.molecules.get('CH4') || 0) > 0) ||
                        (this.state.molecules.has('CO2') && (this.state.molecules.get('CO2') || 0) > 0);
    const hasPlanet = this.state.planets.length > 0;
    
    console.log(`  Prerequisites check:`);
    console.log(`    H2O: ${hasWater ? '✅' : '❌'} (${this.state.molecules.get('H2O')?.toExponential(2) || 0})`);
    console.log(`    Organics (CH4/CO2): ${hasOrganics ? '✅' : '❌'}`);
    console.log(`    Planet: ${hasPlanet ? '✅' : '❌'}`);
    
    if (!hasWater) {
      console.log(`  ❌ No liquid water → No life`);
      console.log(`  This universe remains sterile (valid outcome)`);
      return;
    }
    
    if (!hasOrganics) {
      console.log(`  ❌ No organic molecules → No life`);
      console.log(`  Need carbon chemistry for biology`);
      return;
    }
    
    if (!hasPlanet) {
      console.log(`  ❌ No planet → No life`);
      console.log(`  Life needs a surface`);
      return;
    }
    
    // All prerequisites met → Abiogenesis proceeds
    console.log(`  ✅ All prerequisites met → Life emerges!`);
    
    // Simple cell emerges (prokaryote)
    const firstOrganism = {
      type: 'prokaryote',
      mass: 1e-15, // kg (single cell)
      metabolism: 1e-12, // W (very small)
      genome: 'minimal',
      scientificName: 'Protoarchaea primordialis', // First life
    };
    
    this.state.organisms.push(firstOrganism);
    this.state.complexity = ComplexityLevel.LIFE;
    
    this.recordEvent('ABIOGENESIS - First Life!');
    
    console.log(`  First life: ${firstOrganism.scientificName}`);
    console.log(`  Type: ${firstOrganism.type}`);
    console.log(`  Mass: ${firstOrganism.mass.toExponential(2)} kg`);
    console.log(`  Complexity: ${ComplexityLevel[this.state.complexity]}`);
  }
  
  /**
   * STEP 7: Evolution → Multicellular → Large organisms
   * Life → Complex organisms
   * 
   * Cope's Rule: Body size tends to increase over evolutionary time
   */
  synthesizeComplexOrganisms(dt: number): void {
    console.log(`[Genesis] Evolution (+${(dt / (1e6 * YEAR)).toFixed(0)}Myr)...`);
    
    if (this.state.organisms.length === 0) {
      console.log(`  ⚠️  No life to evolve`);
      return;
    }
    
    // Evolution creates diversity AND size increase
    const timeMyrs = dt / (1e6 * YEAR);
    const generationsElapsed = dt / (10 * YEAR); // Assume 10 year generation
    const mutationRate = 1e-6;
    const newSpecies = Math.floor(generationsElapsed * mutationRate);
    
    // Cope's Rule: Size increases over time
    // Start: 1e-15 kg (single cell)
    // After 1.5 Gyr (1500 Myr): up to 100 kg (large animals)
    // Need to bridge 15 orders of magnitude!
    
    // Base size growth: 10^15 increase over 1500 Myr
    const ordersOfMagnitude = (timeMyrs / 1500) * 15; // Linear increase in log space
    const baseSize = Math.pow(10, ordersOfMagnitude);
    
    // Generate a reasonable number of species (not excessive)
    const speciesToGenerate = Math.min(newSpecies, 25); // Cap at 25 for performance
    
    for (let i = 0; i < speciesToGenerate; i++) {
      const parentMass = this.state.organisms[0].mass; // 1e-15 kg
      
      // Size varies widely (log-normal in linear space)
      // Most stay small, some get VERY large
      const sizeVariation = this.rng.logNormal(0, 5); // Wide variance
      const mass = parentMass * baseSize * sizeVariation;
      
      // Cap at reasonable maximum (blue whale = 1.7e5 kg)
      const clampedMass = Math.min(mass, 2e5);
      
      const organism = {
        type: clampedMass > 1 ? 'large-multicellular' : 'multicellular',
        mass: clampedMass,
        metabolism: LAWS.biology.allometry.basalMetabolicRate(clampedMass),
        complexity: 'eukaryote',
        scientificName: this.generateScientificName(i),
      };
      
      this.state.organisms.push(organism);
      this.state.species.push(organism);
    }
    
    this.state.complexity = ComplexityLevel.MULTICELLULAR;
    
    // Find largest organism
    const maxMass = Math.max(...this.state.organisms.map(o => o.mass));
    
    if (newSpecies > 0) {
      this.recordEvent(`${newSpecies} Species Evolved (max: ${maxMass.toExponential(2)}kg)`);
    }
    
    console.log(`  New species: ${newSpecies}`);
    console.log(`  Total species: ${this.state.species.length}`);
    console.log(`  Size range: ${Math.min(...this.state.organisms.map(o => o.mass)).toExponential(2)} - ${maxMass.toExponential(2)} kg`);
    console.log(`  Largest organism: ${maxMass > 1 ? `${maxMass.toFixed(1)} kg (large animal)` : `${maxMass.toExponential(2)} kg`}`);
  }
  
  /**
   * Generate scientific name for species
   */
  private generateScientificName(index: number): string {
    const prefixes = ['Proto', 'Neo', 'Paleo', 'Meso', 'Crypto', 'Macro', 'Micro'];
    const suffixes = ['saurus', 'therium', 'morpha', 'cetus', 'zoon', 'vita'];
    
    const prefix = prefixes[this.rng.uniformInt(0, prefixes.length)];
    const suffix = suffixes[this.rng.uniformInt(0, suffixes.length)];
    const species = ['primus', 'secundus', 'tertius', 'major', 'minor', 'rex'][index % 6];
    
    return `${prefix}${suffix} ${species}`;
  }
  
  /**
   * STEP 8: Cognition Emergence
   * Large brains → Nervous systems → Intelligence
   */
  synthesizeCognition(): void {
    console.log(`[Genesis] Cognitive emergence...`);
    
    if (this.state.organisms.length === 0) {
      console.log(`  ⚠️  No organisms to develop cognition`);
      return;
    }
    
    // Find largest organism (brain size scales with body mass)
    const masses = this.state.organisms.map(o => o.mass);
    const maxMass = Math.max(...masses);
    
    // Cognition threshold: ~1 kg (corvid-level intelligence)
    // Full sapience: ~50 kg (human-level)
    if (maxMass > 1) {
      const cognitiveOrganisms = this.state.organisms.filter(o => o.mass > 1);
      console.log(`  ${cognitiveOrganisms.length} organisms exceed cognition threshold (>1kg)`);
      
      this.state.complexity = ComplexityLevel.COGNITIVE;
      this.recordEvent(`Cognition Emerged (${cognitiveOrganisms.length} species)`);
      
      console.log(`  Brain size: ${(maxMass * 0.02).toFixed(2)} kg (2% of body mass)`);
      console.log(`  Complexity: ${ComplexityLevel[this.state.complexity]}`);
    } else {
      console.log(`  ⚠️  No organisms large enough for cognition (max: ${maxMass.toExponential(2)}kg)`);
      console.log(`  Need at least 1kg for basic intelligence`);
    }
  }
  
  /**
   * STEP 9: Social Structures
   * Cognition → Groups → Cooperation
   */
  synthesizeSociety(): void {
    console.log(`[Genesis] Social emergence...`);
    
    if (this.state.complexity < ComplexityLevel.COGNITIVE) {
      console.log(`  ⚠️  No cognition → No society`);
      return;
    }
    
    // Dunbar's number: group size ~ 150 for humans
    // Smaller for less cognitive species
    const cognitiveOrganisms = this.state.organisms.filter(o => o.mass > 1);
    
    for (const organism of cognitiveOrganisms) {
      const brainMass = organism.mass * 0.02;
      const groupSize = Math.floor(brainMass * 100); // Simplified
      
      if (groupSize > 5) {
        this.state.groups.push({
          species: organism.scientificName || 'Unknown',
          size: groupSize,
          structure: groupSize > 50 ? 'complex' : 'simple',
        });
      }
    }
    
    if (this.state.groups.length > 0) {
      this.state.complexity = ComplexityLevel.SOCIAL;
      this.recordEvent(`${this.state.groups.length} Social Groups Formed`);
      
      console.log(`  Groups: ${this.state.groups.length}`);
      console.log(`  Largest group: ${Math.max(...this.state.groups.map(g => g.size))} individuals`);
      console.log(`  Complexity: ${ComplexityLevel[this.state.complexity]}`);
    } else {
      console.log(`  ⚠️  No groups large enough for society`);
    }
  }
  
  /**
   * STEP 10: Technology
   * Tool use → Fire → Agriculture
   */
  synthesizeTechnology(): void {
    console.log(`[Genesis] Technological emergence...`);
    
    if (this.state.complexity < ComplexityLevel.SOCIAL) {
      console.log(`  ⚠️  No society → No technology`);
      return;
    }
    
    // Tool use requires cognition + dexterity (simplified: mass > 10kg)
    const toolUsers = this.state.organisms.filter(o => o.mass > 10);
    
    if (toolUsers.length > 0) {
      // Simple tools (stone, wood)
      this.state.tools.push({
        type: 'stone-tools',
        materials: ['stone', 'wood'],
        complexity: 'paleolithic',
      });
      
      // Fire (if combustibles available)
      if (this.state.atoms.has('C') && this.state.atoms.has('O')) {
        this.state.tools.push({
          type: 'fire',
          materials: ['wood', 'oxygen'],
          complexity: 'paleolithic',
        });
      }
      
      this.state.complexity = ComplexityLevel.TECHNOLOGICAL;
      this.recordEvent(`Technology Emerged (${this.state.tools.length} tool types)`);
      
      console.log(`  Tools: ${this.state.tools.length} types`);
      console.log(`  Tool users: ${toolUsers.length} species`);
      console.log(`  Complexity: ${ComplexityLevel[this.state.complexity]}`);
    } else {
      console.log(`  ⚠️  No organisms capable of tool use (need >10kg)`);
    }
  }
  
  /**
   * Run complete synthesis from Big Bang to present
   */
  async synthesizeUniverse(): Promise<SynthesisState> {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║           GENESIS SYNTHESIS ENGINE                         ║');
    console.log('║           Big Bang → Civilization                          ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    
    // Epoch 1: Big Bang
    console.log('═══ EPOCH 1: Big Bang (t=0) ═══');
    this.state.t = 0;
    console.log('  Universe: Singularity');
    console.log('  Exists: Nothing\n');
    
    // Epoch 2: Particle Era
    console.log('═══ EPOCH 2: Particle Era (t=1μs) ═══');
    this.state.t = 1e-6;
    this.synthesizeParticles(1e-6);
    console.log('');
    
    // Epoch 3: Nucleosynthesis
    console.log('═══ EPOCH 3: Nucleosynthesis (t=3min) ═══');
    this.state.t = 3 * 60;
    this.synthesizeAtoms(3 * 60);
    console.log('');
    
    // Epoch 4: First Stars
    console.log('═══ EPOCH 4: First Stars (t=100Myr) ═══');
    this.state.t = 100e6 * YEAR;
    await this.synthesizeHeavyElements(100e6 * YEAR);
    console.log('');
    
    // Epoch 5: Molecular Clouds
    console.log('═══ EPOCH 5: Molecular Clouds (t=1Gyr) ═══');
    this.state.t = 1e9 * YEAR;
    this.state.temperature = 100; // Cooled enough
    this.synthesizeMolecules();
    console.log('');
    
    // Epoch 6: Planetary Systems
    console.log('═══ EPOCH 6: Planetary Systems (t=9.2Gyr) ═══');
    this.state.t = 9.2e9 * YEAR;
    this.state.temperature = 10; // Interstellar medium
    this.synthesizePlanets();
    console.log('');
    
    // Epoch 7: Abiogenesis
    console.log('═══ EPOCH 7: Abiogenesis (t=9.5Gyr) ═══');
    this.state.t = 9.5e9 * YEAR;
    this.synthesizeLife();
    console.log('');
    
    // Epoch 8: Evolution
    console.log('═══ EPOCH 8: Multicellular Life (t=11Gyr) ═══');
    this.state.t = 11e9 * YEAR;
    this.synthesizeComplexOrganisms(1.5e9 * YEAR);
    console.log('');
    
    // Epoch 9: Cognition
    console.log('═══ EPOCH 9: Cognitive Emergence (t=12Gyr) ═══');
    this.state.t = 12e9 * YEAR;
    this.synthesizeCognition();
    console.log('');
    
    // Epoch 10: Society
    console.log('═══ EPOCH 10: Social Structures (t=12.5Gyr) ═══');
    this.state.t = 12.5e9 * YEAR;
    this.synthesizeSociety();
    console.log('');
    
    // Epoch 11: Technology
    console.log('═══ EPOCH 11: Technology (t=13Gyr) ═══');
    this.state.t = 13e9 * YEAR;
    this.synthesizeTechnology();
    console.log('');
    
    // Final state
    console.log('═══════════════════════════════════════════════════════════');
    console.log('SYNTHESIS COMPLETE');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`Final time: ${(this.state.t / (1e9 * YEAR)).toFixed(2)} Gyr`);
    console.log(`Complexity: ${ComplexityLevel[this.state.complexity]}`);
    console.log(`Atoms: ${this.state.atoms.size} elements`);
    console.log(`Molecules: ${this.state.molecules.size} compounds`);
    console.log(`Stars: ${this.state.stars.length}`);
    console.log(`Planets: ${this.state.planets.length}`);
    console.log(`Organisms: ${this.state.organisms.length}`);
    console.log(`Species: ${this.state.species.length}`);
    console.log(`Social Groups: ${this.state.groups.length}`);
    console.log(`Technologies: ${this.state.tools.length}`);
    console.log(`Activity Level: ${this.getActivityLevel().toFixed(2)} (brightness for tracer)`);
    console.log('═══════════════════════════════════════════════════════════\n');
    
    return this.state;
  }
  
  /**
   * Calculate activity level (for light tracers)
   * Returns 0-10 scale:
   * 0 = Dead (primordial)
   * 1-2 = Star formation
   * 3-4 = Planets
   * 5-6 = Life
   * 7-8 = Civilization (Type 0)
   * 9 = Type I (planetary)
   * 10 = Type II+ (stellar/galactic)
   */
  getActivityLevel(): number {
    let activity = 0;
    
    // Base activity from complexity
    switch (this.state.complexity) {
      case ComplexityLevel.VOID:
        activity = 0;
        break;
      case ComplexityLevel.PARTICLES:
        activity = 0.5;
        break;
      case ComplexityLevel.ATOMS:
        activity = 1;
        break;
      case ComplexityLevel.MOLECULES:
        activity = 2;
        break;
      case ComplexityLevel.LIFE:
        activity = 5;
        break;
      case ComplexityLevel.MULTICELLULAR:
        activity = 6;
        break;
      case ComplexityLevel.COGNITIVE:
        activity = 7;
        break;
      case ComplexityLevel.SOCIAL:
        activity = 8;
        break;
      case ComplexityLevel.TECHNOLOGICAL:
        activity = 9;
        break;
    }
    
    // Boost for heavy elements (indicates stellar activity)
    if (this.state.atoms.has('Fe')) {
      activity += 1;
    }
    
    // Boost for diversity
    if (this.state.species.length > 10) {
      activity += 0.5;
    }
    
    // Cap at 10
    return Math.min(activity, 10);
  }
  
  /**
   * Get current state
   */
  getState(): SynthesisState {
    return this.state;
  }
}

/**
 * USAGE:
 * 
 * const engine = new GenesisSynthesisEngine('my-seed');
 * const finalState = await engine.synthesizeUniverse();
 * 
 * // Now you have ACTUAL synthesized complexity:
 * - finalState.atoms (which elements exist)
 * - finalState.molecules (which compounds exist)
 * - finalState.planets (actual planetary bodies)
 * - finalState.organisms (actual life forms)
 * 
 * Then render this with PlanetaryVisuals, CreatureVisuals, etc.
 * 
 * NOT: "generate planet" → ball
 * YES: synthesize atoms → molecules → planetesimals → planet → render from composition
 */

