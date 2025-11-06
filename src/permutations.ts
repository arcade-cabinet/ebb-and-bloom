// permutations.js - Import to world.js
const AFFINITIES = {
    heat: 1, flow: 2, bind: 4, power: 8, life: 16, metal: 32, void: 64, wild: 128
};
const BASE_RESOURCES = {
    ore: AFFINITIES.heat,
    water: AFFINITIES.flow,
    wood: AFFINITIES.bind,
    // ... expand to 10+
};

function generateAffinity(type) {
    return BASE_RESOURCES[type] || 0; // Procedural: + noise2D(typeSeed) * 256 for variants
}

function combineResources(aff1, aff2, demands = { ore: 0, power: 0 }) {
    const overlap = aff1 & aff2;
    if (bitCount(overlap) < 2) return 0; // No snap
    let newAff = aff1 | aff2;
    // Demand bias: If high oreDemand, +metal chance
    if (demands.ore > 5 && (newAff & AFFINITIES.heat)) {
        newAff |= AFFINITIES.metal;
    }
    // Noise twist
    const hash = noise.noise2D(aff1 + aff2 + Date.now() * 0.01, behavior.conquest);
    if (hash > 0.9) newAff |= AFFINITIES.wild; // Exotic
    if (behavior.conquest > 0.6) newAff |= AFFINITIES.void; // Risk
    return newAff;
}

// Count set bits in a number (Brian Kernighan's algorithm)
function bitCount(n: number): number {
  let count = 0;
  while (n) {
    n &= n - 1; // Clear lowest set bit
    count++;
  }
  return count;
}

// In snapCheck() - world.js diff
function snapCheck() {
    // ... existing
    for (let a of adj) {
        const aff1 = Resource.affinity[id] || generateAffinity(Biome.type[id]); // Dynamic
        const aff2 = Resource.affinity[a] || generateAffinity(Biome.type[a]);
        const newAff = combineResources(aff1, aff2, playerDemands); // From Trait
        if (newAff) {
            const newId = bitecs.addEntity(world, [Position, Resource]);
            // ... pos
            Resource.affinity[newId] = newAff;
            Resource.type[newId] = hashToType(newAff); // Map to sprite/effect
            pollution += bitCount(newAff & AFFINITIES.void ? 3 : 1);
            // Chain spawn: Recurse shallow (depth<3)
            setTimeout(() => snapCheck(), 100); // Async for perf
        }
    }
}

// playerDemands getter in player.js
function getDemands() {
    return { ore: Trait.chainsaw[player] * 2, power: Trait.drill[player] || 0 /* expand */ };
}