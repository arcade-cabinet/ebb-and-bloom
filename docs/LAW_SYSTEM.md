# Law System

**57 scientific laws** generating deterministic procedural content

---

## Philosophy

Instead of AI or hardcoded data, the engine implements mathematical laws from established sciences.

**Input → Law → Output** (deterministic, repeatable, scientifically rigorous)

---

## Law Categories

### Universal (3 laws)
- `00-universal/complexity-theory.ts`
- `00-universal/cosmology.ts`
- `00-universal/quantum-basics.ts`

### Physics (1 + base)
- `01-physics/haptics.ts`
- `physics.ts` - Gravity, thermodynamics, orbital mechanics

### Planetary (11 laws)
- Geology, atmospheric science, climate, hydrology, oceanography, seismology, etc.

### Chemical (1 law)
- `03-chemical/biochemistry.ts`

### Biological (8 laws)
- Anatomy, genetics, evolutionary dynamics, neuroscience, immunology, etc.

### Cognitive (1 law)
- `05-cognitive/linguistics.ts`

### Social (7 laws)
- Demographics, kinship, law & justice, political science, religion, warfare, epidemiology

### Technological (9 laws)
- Agriculture, architecture, ceramics, combustion, energy, metallurgy, navigation, textiles, transportation

### Core Laws (6 base files)
- `physics.ts` - Core physics
- `stellar.ts` - Star formation
- `biology.ts` - Kleiber's Law, allometric scaling
- `ecology.ts` - Lotka-Volterra, carrying capacity
- `social.ts` - Dunbar's number, Service typology
- `taxonomy.ts` - Linnaean classification

---

## Usage Examples

### Physics Laws
```typescript
import { calculateGravity, calculateOrbitalVelocity } from 'engine/laws/physics';

const F = calculateGravity(mass1, mass2, distance);
const v = calculateOrbitalVelocity(starMass, orbitRadius);
```

### Biology Laws
```typescript
import { calculateMetabolicRate, calculateLifespan } from 'engine/laws/biology';

const metabolicRate = calculateMetabolicRate(bodyMass); // Kleiber's Law: M = 70 * mass^0.75
const lifespan = calculateLifespan(bodyMass); // Allometric scaling
```

### Ecology Laws
```typescript
import { lotkaVolterra, calculateCarryingCapacity } from 'engine/laws/ecology';

const [dPrey, dPred] = lotkaVolterra(preyPop, predPop, alpha, beta);
const capacity = calculateCarryingCapacity(area, resources);
```

---

## Legal Broker System

**Central routing** for all law invocations:
- **LegalBroker.ts** - Routes requests to regulators
- **7 Domain Regulators** - Validate and execute laws

### Regulators:
1. **EntropyRegulator** - Universe-wide thermodynamics
2. **PhysicsRegulator** - Gravity, orbits, forces
3. **PlanetaryRegulator** - Geology, climate, atmosphere
4. **BiologyRegulator** - Metabolism, scaling, evolution
5. **EcologyRegulator** - Populations, niches, competition
6. **SocialRegulator** - Groups, hierarchy, cooperation
7. **TechnologyRegulator** - Tools, materials, innovation

See: `docs/LEGAL_BROKER_ARCHITECTURE.md`

---

## Scientific Citations

All laws based on peer-reviewed research.

See: `docs/PEER_REVIEWED_LAWS.md` for complete citations

---

## File Locations

All law files in: `engine/laws/`

Import via: `'ebb-and-bloom-engine/laws'` or `'@engine/laws'` (in demo)

