export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface AABB {
  min: Vec3;
  max: Vec3;
}

export interface SpatialEntity {
  entityId: string;
  position: Vec3;
  radius?: number;
}

interface OctreeNode {
  bounds: AABB;
  entities: SpatialEntity[];
  children: OctreeNode[] | null;
  depth: number;
}

export class SpatialIndex {
  private root: OctreeNode | null = null;
  private readonly maxEntitiesPerNode = 8;
  private readonly maxDepth = 8;
  private worldBounds: AABB;
  private entityMap: Map<string, SpatialEntity> = new Map();

  constructor(worldBounds: AABB = {
    min: { x: -10000, y: -10000, z: -10000 },
    max: { x: 10000, y: 10000, z: 10000 }
  }) {
    this.worldBounds = worldBounds;
    this.root = this.createNode(worldBounds, 0);
  }

  clear(): void {
    this.root = this.createNode(this.worldBounds, 0);
    this.entityMap.clear();
  }

  insert(entity: SpatialEntity): void {
    if (!this.root) {
      this.root = this.createNode(this.worldBounds, 0);
    }

    this.entityMap.set(entity.entityId, entity);
    this.insertIntoNode(this.root, entity);
  }

  remove(entityId: string): void {
    const entity = this.entityMap.get(entityId);
    if (!entity || !this.root) return;

    this.entityMap.delete(entityId);
    this.removeFromNode(this.root, entity);
  }

  update(entity: SpatialEntity): void {
    this.remove(entity.entityId);
    this.insert(entity);
  }

  queryRadius(center: Vec3, radius: number): SpatialEntity[] {
    if (!this.root) return [];

    const results: SpatialEntity[] = [];
    const radiusSquared = radius * radius;

    this.queryRadiusInNode(this.root, center, radiusSquared, results);

    return results;
  }

  queryAABB(bounds: AABB): SpatialEntity[] {
    if (!this.root) return [];

    const results: SpatialEntity[] = [];
    this.queryAABBInNode(this.root, bounds, results);

    return results;
  }

  queryNearest(position: Vec3, count: number = 1): SpatialEntity[] {
    const allEntities = Array.from(this.entityMap.values());

    const entitiesWithDistance = allEntities.map(entity => ({
      entity,
      distanceSquared: this.distanceSquared(position, entity.position)
    }));

    entitiesWithDistance.sort((a, b) => a.distanceSquared - b.distanceSquared);

    return entitiesWithDistance.slice(0, count).map(item => item.entity);
  }

  rebuild(entities: SpatialEntity[]): void {
    this.clear();
    for (const entity of entities) {
      this.insert(entity);
    }
  }

  getStatistics() {
    return {
      totalEntities: this.entityMap.size,
      treeDepth: this.calculateMaxDepth(this.root),
      nodesCount: this.countNodes(this.root),
    };
  }

  private createNode(bounds: AABB, depth: number): OctreeNode {
    return {
      bounds,
      entities: [],
      children: null,
      depth
    };
  }

  private insertIntoNode(node: OctreeNode, entity: SpatialEntity): void {
    if (!this.boundsContainPoint(node.bounds, entity.position)) {
      return;
    }

    if (node.children === null) {
      node.entities.push(entity);

      if (node.entities.length > this.maxEntitiesPerNode && node.depth < this.maxDepth) {
        this.subdivideNode(node);
      }
    } else {
      for (const child of node.children) {
        this.insertIntoNode(child, entity);
      }
    }
  }

  private removeFromNode(node: OctreeNode, entity: SpatialEntity): void {
    const index = node.entities.findIndex(e => e.entityId === entity.entityId);
    if (index !== -1) {
      node.entities.splice(index, 1);
    }

    if (node.children !== null) {
      for (const child of node.children) {
        this.removeFromNode(child, entity);
      }
    }
  }

  private subdivideNode(node: OctreeNode): void {
    const { min, max } = node.bounds;
    const mid: Vec3 = {
      x: (min.x + max.x) / 2,
      y: (min.y + max.y) / 2,
      z: (min.z + max.z) / 2
    };

    node.children = [
      this.createNode({ min: { x: min.x, y: min.y, z: min.z }, max: { x: mid.x, y: mid.y, z: mid.z } }, node.depth + 1),
      this.createNode({ min: { x: mid.x, y: min.y, z: min.z }, max: { x: max.x, y: mid.y, z: mid.z } }, node.depth + 1),
      this.createNode({ min: { x: min.x, y: mid.y, z: min.z }, max: { x: mid.x, y: max.y, z: mid.z } }, node.depth + 1),
      this.createNode({ min: { x: mid.x, y: mid.y, z: min.z }, max: { x: max.x, y: max.y, z: mid.z } }, node.depth + 1),
      this.createNode({ min: { x: min.x, y: min.y, z: mid.z }, max: { x: mid.x, y: mid.y, z: max.z } }, node.depth + 1),
      this.createNode({ min: { x: mid.x, y: min.y, z: mid.z }, max: { x: max.x, y: mid.y, z: max.z } }, node.depth + 1),
      this.createNode({ min: { x: min.x, y: mid.y, z: mid.z }, max: { x: mid.x, y: max.y, z: max.z } }, node.depth + 1),
      this.createNode({ min: { x: mid.x, y: mid.y, z: mid.z }, max: { x: max.x, y: max.y, z: max.z } }, node.depth + 1)
    ];

    const entities = [...node.entities];
    node.entities = [];

    for (const entity of entities) {
      for (const child of node.children) {
        this.insertIntoNode(child, entity);
      }
    }
  }

  private queryRadiusInNode(node: OctreeNode, center: Vec3, radiusSquared: number, results: SpatialEntity[]): void {
    if (!this.boundsIntersectsSphere(node.bounds, center, radiusSquared)) {
      return;
    }

    for (const entity of node.entities) {
      const distSq = this.distanceSquared(center, entity.position);
      if (distSq <= radiusSquared) {
        results.push(entity);
      }
    }

    if (node.children !== null) {
      for (const child of node.children) {
        this.queryRadiusInNode(child, center, radiusSquared, results);
      }
    }
  }

  private queryAABBInNode(node: OctreeNode, bounds: AABB, results: SpatialEntity[]): void {
    if (!this.boundsIntersectsBounds(node.bounds, bounds)) {
      return;
    }

    for (const entity of node.entities) {
      if (this.boundsContainPoint(bounds, entity.position)) {
        results.push(entity);
      }
    }

    if (node.children !== null) {
      for (const child of node.children) {
        this.queryAABBInNode(child, bounds, results);
      }
    }
  }

  private boundsContainPoint(bounds: AABB, point: Vec3): boolean {
    return point.x >= bounds.min.x && point.x <= bounds.max.x &&
           point.y >= bounds.min.y && point.y <= bounds.max.y &&
           point.z >= bounds.min.z && point.z <= bounds.max.z;
  }

  private boundsIntersectsBounds(a: AABB, b: AABB): boolean {
    return a.min.x <= b.max.x && a.max.x >= b.min.x &&
           a.min.y <= b.max.y && a.max.y >= b.min.y &&
           a.min.z <= b.max.z && a.max.z >= b.min.z;
  }

  private boundsIntersectsSphere(bounds: AABB, center: Vec3, radiusSquared: number): boolean {
    let distSquared = 0;

    if (center.x < bounds.min.x) distSquared += (bounds.min.x - center.x) ** 2;
    else if (center.x > bounds.max.x) distSquared += (center.x - bounds.max.x) ** 2;

    if (center.y < bounds.min.y) distSquared += (bounds.min.y - center.y) ** 2;
    else if (center.y > bounds.max.y) distSquared += (center.y - bounds.max.y) ** 2;

    if (center.z < bounds.min.z) distSquared += (bounds.min.z - center.z) ** 2;
    else if (center.z > bounds.max.z) distSquared += (center.z - bounds.max.z) ** 2;

    return distSquared <= radiusSquared;
  }

  private distanceSquared(a: Vec3, b: Vec3): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dz = a.z - b.z;
    return dx * dx + dy * dy + dz * dz;
  }

  private calculateMaxDepth(node: OctreeNode | null): number {
    if (!node) return 0;
    if (!node.children) return node.depth;

    let maxChildDepth = 0;
    for (const child of node.children) {
      maxChildDepth = Math.max(maxChildDepth, this.calculateMaxDepth(child));
    }

    return maxChildDepth;
  }

  private countNodes(node: OctreeNode | null): number {
    if (!node) return 0;
    if (!node.children) return 1;

    let count = 1;
    for (const child of node.children) {
      count += this.countNodes(child);
    }

    return count;
  }
}
