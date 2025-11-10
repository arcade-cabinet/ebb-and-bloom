/**
 * Type declarations for Yuka library
 * Yuka is a JavaScript library without official TypeScript types
 * These are minimal declarations for what we use
 */

declare module 'yuka' {
  export class Vector3 {
    x: number;
    y: number;
    z: number;
    
    constructor(x?: number, y?: number, z?: number);
    
    set(x: number, y: number, z: number): this;
    copy(v: Vector3): this;
    clone(): Vector3;
    add(v: Vector3): this;
    sub(v: Vector3): this;
    multiplyScalar(scalar: number): this;
    divideScalar(scalar: number): this;
    length(): number;
    distanceTo(v: Vector3): number;
    squaredDistanceTo(v: Vector3): number;
    normalize(): this;
    dot(v: Vector3): number;
    cross(v: Vector3): this;
    
    static Zero(): Vector3;
  }
  
  export class Matrix4 {
    elements: Float32Array;
    
    constructor();
    
    getInverse(m: Matrix4): this;
    applyMatrix4(m: Matrix4): this;
  }
  
  export class GameEntity {
    uuid: string;
    name: string;
    active: boolean;
    position: Vector3;
    rotation: any;
    scale: Vector3;
    worldMatrix: Matrix4;
    manager: EntityManager | null;
    
    constructor();
    
    update(delta: number): this;
    handleMessage(telegram: Telegram): boolean;
    sendMessage(receiver: GameEntity, message: string, data?: any, delay?: number): void;
  }
  
  export class MovingEntity extends GameEntity {
    velocity: Vector3;
    maxSpeed: number;
    
    constructor();
    
    getSpeed(): number;
    getSpeedSquared(): number;
  }
  
  export class Vehicle extends MovingEntity {
    mass: number;
    maxForce: number;
    maxTurnRate: number;
    steering: SteeringManager;
    brain: Think | null;
    scale?: Vector3;
    
    // Allow additional properties (for our extended agent types)
    [key: string]: any;
    
    constructor();
    
    rotateTo(target: Vector3, delta: number): boolean;
  }
  
  export class EntityManager {
    entities: any[]; // Allow our extended types
    
    constructor();
    
    add(entity: any): this;
    remove(entity: any): this;
    clear(): this;
    update(delta: number): this;
    getEntityByName(name: string): any;
  }
  
  export class Goal {
    static readonly STATUS: {
      INACTIVE: symbol;
      ACTIVE: symbol;
      COMPLETED: symbol;
      FAILED: symbol;
    };
    
    owner: any; // Can be Vehicle or subclass
    status: symbol;
    
    constructor(owner?: any);
    
    activate(): void;
    execute(): void;
    terminate(): void;
    handleMessage(telegram: Telegram): boolean;
    active(): boolean;
    inactive(): boolean;
    completed(): boolean;
    failed(): boolean;
    activateIfInactive(): void;
    replanIfFailed(): void;
  }
  
  export class CompositeGoal extends Goal {
    subgoals: Goal[];
    
    constructor(owner?: any);
    
    addSubgoal(goal: Goal): this;
    removeSubgoal(goal: Goal): boolean;
    clearSubgoals(): this;
    currentSubgoal(): Goal | null;
    executeSubgoals(): symbol;
    hasSubgoals(): boolean;
  }
  
  export class GoalEvaluator {
    characterBias: number;
    
    constructor(characterBias?: number);
    
    calculateDesirability(entity: any): number;
    setGoal(entity: any): void;
  }
  
  export class Think {
    owner: any; // Can be Vehicle or subclass
    subgoals: Goal[];
    evaluators: GoalEvaluator[];
    
    constructor(owner?: any);
    
    addGoal(goal: Goal): this;
    addSubgoal(goal: Goal): this;
    removeSubgoal(goal: Goal): boolean;
    clearSubgoals(): this;
    currentSubgoal(): Goal | null;
    addEvaluator(evaluator: GoalEvaluator): this;
    removeEvaluator(evaluator: GoalEvaluator): this;
    execute(): void;
    arbitrate(): void;
    handleMessage(telegram: Telegram): boolean;
  }
  
  export class SteeringManager {
    behaviors: SteeringBehavior[];
    
    constructor(vehicle?: Vehicle);
    
    add(behavior: SteeringBehavior): this;
    remove(behavior: SteeringBehavior): this;
    clear(): this;
    calculate(delta: number, result: Vector3): Vector3;
  }
  
  export class SteeringBehavior {
    active: boolean;
    weight: number;
    
    constructor();
    
    calculate(vehicle: Vehicle, force: Vector3, delta: number): Vector3;
  }
  
  export class ArriveBehavior extends SteeringBehavior {
    target: Vector3;
    deceleration: number;
    
    constructor(target?: Vector3, deceleration?: number);
  }
  
  export class WanderBehavior extends SteeringBehavior {
    radius: number;
    distance: number;
    jitter: number;
    
    constructor();
  }
  
  export class Telegram {
    sender: GameEntity;
    receiver: GameEntity;
    message: string;
    delay: number;
    data: any;
    
    constructor(sender: GameEntity, receiver: GameEntity, message: string, delay: number, data?: any);
  }
  
  export class MessageDispatcher {
    constructor();
    
    deliver(telegram: Telegram): void;
    dispatch(telegram: Telegram): void;
  }
}
