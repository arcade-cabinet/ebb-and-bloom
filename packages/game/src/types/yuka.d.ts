/**
 * Yuka type declarations
 * Yuka doesn't ship with TypeScript types, so we declare them here
 */

declare module 'yuka' {
  export class Vector3 {
    x: number;
    y: number;
    z: number;
    length(): number;
    constructor(x?: number, y?: number, z?: number);
    copy(v: Vector3): Vector3;
    clone(): Vector3;
    add(v: Vector3): Vector3;
    multiplyScalar(s: number): Vector3;
    divideScalar(s: number): Vector3;
    subVectors(a: Vector3, b: Vector3): Vector3;
    crossVectors(a: Vector3, b: Vector3): Vector3;
    normalize(): Vector3;
    distanceTo(v: Vector3): number;
  }

  export class Vehicle {
    position: Vector3;
    velocity: Vector3;
    maxSpeed: number;
    steering: SteeringManager;
    update(delta: number): void;
  }

  export class SteeringManager {
    behaviors: SteeringBehavior[];
    add(behavior: SteeringBehavior): void;
    clear?(): void; // Optional - may not exist in all versions
  }

  export class SteeringBehavior {
    active: boolean;
  }

  export class CohesionBehavior extends SteeringBehavior {
    weight: number;
    neighborhoodRadius: number;
    constructor(neighbors: Vehicle[], distance?: number);
  }

  export class SeparationBehavior extends SteeringBehavior {
    weight: number;
    neighborhoodRadius: number;
    constructor(neighbors: Vehicle[], distance?: number);
  }

  export class FuzzyModule {
    addFLV(variable: FuzzyVariable): void;
    addRule(rule: FuzzyRule): void;
    fuzzify(name: string, value: number): void;
    defuzzify(name: string): number;
    evaluate(...inputs: number[]): number;
  }

  export class FuzzyVariable {
    constructor(name: string);
    add(set: FuzzySet): void;
  }

  export class FuzzySet {
    constructor(name: string, left: number, peak: number, right: number);
  }

  export class LeftShoulderFuzzySet extends FuzzySet {
    constructor(name: string, left: number, peak: number, right: number);
  }

  export class RightShoulderFuzzySet extends FuzzySet {
    constructor(name: string, left: number, peak: number, right: number);
  }

  export class TriangularFuzzySet extends FuzzySet {
    constructor(name: string, left: number, peak: number, right: number);
  }

  export class FuzzyRule {
    constructor(antecedent: FuzzyAND, consequent: FuzzySet);
  }

  export class FuzzyAND {
    constructor(...sets: FuzzySet[]);
  }

  export class Goal {
    static readonly STATUS_INACTIVE: number;
    static readonly STATUS_ACTIVE: number;
    static readonly STATUS_COMPLETED: number;
    static readonly STATUS_FAILED: number;
    status: number;
    activate(): void;
    execute(): number;
    terminate(): void;
  }
}
