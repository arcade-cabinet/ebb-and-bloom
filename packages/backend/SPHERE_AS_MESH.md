# THE SPHERE AS A TRAVERSABLE MESH

## The Critical Insight

The planetary surface isn't just a mathematical abstraction you query.

**It's a physical space that entities WALK ON.**

Every coordinate is a NODE in a navigation graph.

Creatures move from node to node.

Yuka pathfinding traverses the mesh.

**The sphere must be TRAVERSABLE.**

---

## What This Means

### 1. Surface is a Graph

```typescript
interface SurfaceNode {
  latitude: number;
  longitude: number;
  
  // Materials at this coordinate (from accretion)
  materials: MaterialLayer[];
  
  // CRITICAL: Neighbors for traversal
  neighbors: {
    north: SurfaceNode;
    south: SurfaceNode;
    east: SurfaceNode;
    west: SurfaceNode;
    northeast: SurfaceNode;
    northwest: SurfaceNode;
    southeast: SurfaceNode;
    southwest: SurfaceNode;
  };
  
  // Movement cost (terrain difficulty)
  movementCost: number;  // Based on hardness, slope, water
  
  // Visibility (for line-of-sight)
  elevation: number;
  blocksVision: boolean;
}
```

**Every node knows its neighbors.**

**Entities can traverse node → neighbor → neighbor.**

---

### 2. Pathfinding Works

```typescript
import { AStar, Graph } from 'yuka';

class PlanetaryNavGraph extends Graph {
  constructor(planet: Planet) {
    super();
    
    // Build graph from planet coordinates
    const resolution = 1000;  // 1km per node
    
    for (let lat = -90; lat <= 90; lat += resolution) {
      for (let lon = -180; lon <= 180; lon += resolution) {
        const coord = planet.getCoordinate(lat, lon);
        const node = new GraphNode(coord);
        
        this.addNode(node);
      }
    }
    
    // Connect neighbors
    for (const node of this.nodes) {
      const neighbors = this.findNeighbors(node, resolution);
      
      for (const neighbor of neighbors) {
        const distance = this.calculateArcDistance(node, neighbor);
        const cost = this.calculateMovementCost(node, neighbor);
        
        this.addEdge(node, neighbor, distance * cost);
      }
    }
  }
  
  calculateMovementCost(from: GraphNode, to: GraphNode): number {
    // Terrain difficulty based on materials
    const fromMaterial = from.coordinate.surfaceMaterial;
    const toMaterial = to.coordinate.surfaceMaterial;
    
    const avgHardness = (fromMaterial.hardness + toMaterial.hardness) / 2;
    
    // Harder terrain = higher movement cost
    // Water = very low cost
    // Rock = high cost
    
    if (toMaterial.type === 'water') return 0.5;
    if (toMaterial.type === 'sand') return 1.0;
    if (toMaterial.type === 'limestone') return 1.5;
    if (toMaterial.type === 'granite') return 3.0;
    
    return avgHardness;
  }
  
  calculateArcDistance(from: GraphNode, to: GraphNode): number {
    // Great circle distance on sphere
    const R = 6371000;  // Earth radius in meters
    
    const lat1 = from.coordinate.latitude * Math.PI / 180;
    const lat2 = to.coordinate.latitude * Math.PI / 180;
    const deltaLat = (to.coordinate.latitude - from.coordinate.latitude) * Math.PI / 180;
    const deltaLon = (to.coordinate.longitude - from.coordinate.longitude) * Math.PI / 180;
    
    const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(deltaLon/2) * Math.sin(deltaLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    return R * c;  // Distance in meters
  }
}
```

**Pathfinding uses A* on the navigation graph.**

**Movement cost = distance × terrain difficulty.**

---

### 3. Creature Movement

```typescript
class CreatureMovementGoal extends Goal {
  private path: GraphNode[] = [];
  private currentTarget: GraphNode;
  
  activate(creature: Creature, planet: Planet) {
    // Find path from current position to goal
    const navGraph = planet.getNavigationGraph();
    
    const start = navGraph.getNodeAt(creature.position);
    const goal = navGraph.getNodeAt(this.targetPosition);
    
    const pathfinder = new AStar(navGraph);
    this.path = pathfinder.search(start, goal);
    
    if (this.path.length === 0) {
      // No path exists!
      this.status = Goal.STATUS_FAILED;
      return;
    }
    
    this.currentTarget = this.path[0];
  }
  
  execute(creature: Creature, planet: Planet, deltaTime: number) {
    // Move along path
    const distance = creature.speed * deltaTime;
    
    // Move towards current target node
    const direction = this.currentTarget.position.clone()
      .subtract(creature.position)
      .normalize();
    
    creature.position.add(direction.multiplyScalar(distance));
    
    // Reached target node?
    if (creature.position.distanceTo(this.currentTarget.position) < 1) {
      // Move to next node in path
      this.path.shift();
      
      if (this.path.length === 0) {
        // Reached goal!
        this.status = Goal.STATUS_COMPLETED;
      } else {
        this.currentTarget = this.path[0];
      }
    }
    
    // Deduct energy based on terrain difficulty
    const node = planet.getNavigationGraph().getNodeAt(creature.position);
    const movementCost = node.movementCost;
    
    creature.energy -= distance * movementCost * 0.01;
  }
}
```

**Creature follows path node by node.**

**Energy cost = distance × terrain difficulty.**

---

### 4. Steering Behaviors

```typescript
import { Vehicle, SeekBehavior, FleeBehavior } from 'yuka';

class CreatureVehicle extends Vehicle {
  constructor(creature: Creature, navGraph: PlanetaryNavGraph) {
    super();
    
    this.position.copy(creature.position);
    this.maxSpeed = creature.speed;
    
    // Constrain movement to surface mesh
    this.navGraph = navGraph;
  }
  
  update(deltaTime: number) {
    super.update(deltaTime);
    
    // Snap to nearest surface node
    const nearestNode = this.navGraph.getNodeAt(this.position);
    this.position.copy(nearestNode.position);
    
    // Ensure creature stays on surface (doesn't float or sink)
    this.position.y = nearestNode.elevation;
  }
}

// Use with steering behaviors
const creature = new CreatureVehicle(myCreature, planet.navGraph);

const seekFood = new SeekBehavior(foodPosition);
creature.steering.add(seekFood);

const fleePredator = new FleeBehavior(predatorPosition);
creature.steering.add(fleePredator);

creature.update(deltaTime);
```

**Steering behaviors work on traversable mesh.**

**Creatures constrained to surface nodes.**

---

### 5. Vision & Line-of-Sight

```typescript
import { Vision } from 'yuka';

class CreatureVision extends Vision {
  constructor(creature: Creature, navGraph: PlanetaryNavGraph) {
    super(creature);
    
    this.range = creature.visionRange;
    this.fieldOfView = Math.PI;  // 180 degrees
    
    this.navGraph = navGraph;
  }
  
  update() {
    super.update();
    
    // Filter visible entities by line-of-sight
    this.visibleEntities = this.visibleEntities.filter(entity => {
      return this.hasLineOfSight(this.owner.position, entity.position);
    });
  }
  
  hasLineOfSight(from: Vector3, to: Vector3): boolean {
    // Raycast along surface mesh
    const direction = to.clone().subtract(from).normalize();
    const distance = from.distanceTo(to);
    
    const ray = new Ray(from, direction);
    const hits = this.navGraph.raycast(ray, distance);
    
    // Check if any terrain blocks vision
    for (const hit of hits) {
      if (hit.node.elevation > from.y && hit.node.blocksVision) {
        return false;  // Terrain blocking
      }
    }
    
    return true;
  }
}
```

**Vision uses raycasting along mesh.**

**Terrain elevation blocks line-of-sight.**

---

### 6. Territory & Regions

```typescript
class TerritorySystem {
  findConnectedRegion(startNode: GraphNode, maxSize: number): GraphNode[] {
    // Flood-fill algorithm to find connected region
    const region: GraphNode[] = [];
    const visited = new Set<GraphNode>();
    const queue = [startNode];
    
    while (queue.length > 0 && region.length < maxSize) {
      const node = queue.shift()!;
      
      if (visited.has(node)) continue;
      visited.add(node);
      region.push(node);
      
      // Add unvisited neighbors
      for (const neighbor of node.neighbors) {
        if (!visited.has(neighbor) && this.isTraversable(neighbor)) {
          queue.push(neighbor);
        }
      }
    }
    
    return region;
  }
  
  isTraversable(node: GraphNode): boolean {
    // Can creatures walk on this terrain?
    return node.movementCost < 5.0 &&  // Not too hard
           !node.isWater;               // Not deep water
  }
  
  claimTerritory(tribe: Tribe, startNode: GraphNode): Territory {
    // Tribe claims connected region as territory
    const region = this.findConnectedRegion(startNode, tribe.size * 100);
    
    return {
      tribe,
      nodes: region,
      center: this.calculateCentroid(region),
      area: region.length,
    };
  }
}
```

**Territory = connected region of traversable nodes.**

**Flood-fill finds contiguous areas.**

---

### 7. Pack Formation

```typescript
import { CohesionBehavior, SeparationBehavior, AlignmentBehavior } from 'yuka';

class PackFormation {
  members: CreatureVehicle[];
  
  formPack(creatures: Creature[], navGraph: PlanetaryNavGraph) {
    this.members = creatures.map(c => new CreatureVehicle(c, navGraph));
    
    // Add flocking behaviors
    for (const member of this.members) {
      const cohesion = new CohesionBehavior(this.members);
      const separation = new SeparationBehavior(this.members);
      const alignment = new AlignmentBehavior(this.members);
      
      member.steering.add(cohesion);
      member.steering.add(separation);
      member.steering.add(alignment);
    }
  }
  
  update(deltaTime: number) {
    // Update all pack members
    for (const member of this.members) {
      member.update(deltaTime);
      
      // Ensure pack stays on traversable mesh
      const node = navGraph.getNodeAt(member.position);
      if (!node.isTraversable) {
        // Push back to last valid position
        member.position.copy(member.lastValidPosition);
      } else {
        member.lastValidPosition.copy(member.position);
      }
    }
  }
}
```

**Pack flocking constrained to traversable mesh.**

**Creatures can't flock off cliffs or into lava.**

---

## Why This Is Critical

### Without Traversable Mesh

```typescript
// Creature wants to move to food
const goal = new FindFoodGoal();
goal.targetPosition = foodPosition;

// But HOW does it get there?
// - Can't pathfind (no graph)
// - Can't calculate distance (no edges)
// - Can't avoid obstacles (no terrain data)
// - Just teleports? Flies in straight line?

// Breaks immersion
// Breaks Yuka navigation
// Breaks spatial gameplay
```

### With Traversable Mesh

```typescript
// Creature wants to move to food
const goal = new FindFoodGoal();
goal.targetPosition = foodPosition;

// Pathfind along mesh
const path = aStar.search(creature.position, foodPosition);

// Follow path node by node
for (const node of path) {
  creature.moveTo(node);
  
  // Energy cost based on terrain
  creature.energy -= node.movementCost * distance;
  
  // Check for obstacles along the way
  if (node.hasPredator) {
    creature.flee();
    break;
  }
}

// Realistic movement
// Real energy costs
// Real pathfinding
// Real spatial strategy
```

---

## Integration with Accretion

The accretion simulation produces the mesh:

```typescript
class AccretionSimulation {
  finalize(): PlanetData {
    // After accretion completes, generate surface mesh
    const mesh = this.generateSurfaceMesh();
    
    return {
      stellarSystem: this.stellarSystem,
      compositionHistory: this.history,
      layers: this.layers,
      
      // NEW: Navigation mesh
      surfaceMesh: mesh,
    };
  }
  
  generateSurfaceMesh(): PlanetaryNavGraph {
    const graph = new PlanetaryNavGraph();
    
    // Discretize surface into nodes
    const resolution = 1000;  // 1km per node
    
    for (let lat = -90; lat <= 90; lat += resolution) {
      for (let lon = -180; lon <= 180; lon += resolution) {
        // Query accretion data at this coordinate
        const coord = this.queryCoordinate(lat, lon);
        
        const node = new GraphNode({
          latitude: lat,
          longitude: lon,
          materials: coord.layers,
          elevation: coord.surfaceElevation,
          movementCost: this.calculateMovementCost(coord.surfaceMaterial),
          blocksVision: coord.surfaceMaterial.opacity > 0.5,
        });
        
        graph.addNode(node);
      }
    }
    
    // Connect neighbors
    graph.connectNeighbors();
    
    return graph;
  }
}
```

**Accretion generates materials at every coordinate.**

**Mesh generation creates traversable graph from those materials.**

**One feeds the other.**

---

## REST API for Mesh

```typescript
// Get navigation graph
GET /api/game/:id/planet/mesh
Response: {
  resolution: 1000,  // meters per node
  nodeCount: 510000,  // Total nodes (earth-like)
  nodes: [
    {
      id: 'lat45_lon120',
      latitude: 45,
      longitude: 120,
      elevation: 1234,
      movementCost: 1.5,
      materials: [...],
      neighbors: ['lat45_lon121', 'lat46_lon120', ...]
    },
    ...
  ]
}

// Pathfinding request
POST /api/game/:id/planet/pathfind
Body: {
  from: { latitude: 45, longitude: 120 },
  to: { latitude: 50, longitude: 130 }
}
Response: {
  path: [
    { latitude: 45, longitude: 120 },
    { latitude: 45.1, longitude: 120.5 },
    { latitude: 45.5, longitude: 121 },
    ...
    { latitude: 50, longitude: 130 }
  ],
  totalDistance: 556789,  // meters
  totalCost: 834000,      // distance * avg movement cost
  estimatedEnergy: 834    // energy units needed
}

// Get traversable region from point
POST /api/game/:id/planet/region
Body: {
  start: { latitude: 45, longitude: 120 },
  maxSize: 10000  // max nodes
}
Response: {
  nodes: [...],
  area: 10000,  // km²
  center: { latitude: 46, longitude: 121 },
  perimeter: [...]  // Border nodes
}
```

---

## Summary

**The sphere is a MESH.**

- Every coordinate = node
- Nodes have neighbors
- Edges have costs (terrain difficulty)
- Pathfinding traverses graph
- Creatures walk node to node
- Energy depletes by terrain
- Vision raycasts along mesh
- Territory = connected regions
- Packs flock on surface

**Yuka navigation systems require this.**

**Without mesh = no spatial gameplay.**

**With mesh = realistic movement, pathfinding, territory, vision.**

**Accretion generates the mesh data.**

**REST API exposes pathfinding.**

**Frontend/CLI renders movement along mesh.**

**The sphere is TRAVERSABLE.**
