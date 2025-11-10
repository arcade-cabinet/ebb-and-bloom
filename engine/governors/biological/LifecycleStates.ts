/**
 * LIFECYCLE STATES
 * 
 * Biological aging as Yuka FSM (Finite State Machine).
 * 
 * Implements:
 * - Juvenile → Adult → Elder state transitions
 * - Age-based thresholds from allometric laws
 * - State-specific behaviors (growth, reproduction, senescence)
 * 
 * Based on: biology.ts AllometricScaling (generationTime, maxLifespan)
 * Pattern: State + StateMachine (like examples/fsm/)
 */

import { State, StateMachine } from 'yuka';

// Allometric scaling (from biology laws)
const AllometricScaling = {
    generationTime: (mass: number) => 2.5 * Math.pow(mass, 0.25),
    maxLifespan: (mass: number) => 10.5 * Math.pow(mass, 0.25)
};

/**
 * JUVENILE STATE
 * 
 * - Growing (mass increases)
 * - No reproduction
 * - High vulnerability
 */
export class JuvenileState extends State {
    enter(agent: any): void {
        agent.canReproduce = false;
        agent.growthRate = 1.0; // Full growth
        agent.vulnerabilityMultiplier = 1.5; // More vulnerable
    }

    execute(agent: any): void {
        // Growth (mass increases toward adult mass)
        if (agent.mass < agent.adultMass) {
            const growthIncrement = agent.growthRate * 0.01; // 1% per update
            agent.mass = Math.min(agent.adultMass, agent.mass + growthIncrement);
        }

        // Check for transition to adult
        if (agent.age >= agent.maturityAge) {
            agent.stateMachine.changeTo('adult');
        }
    }

    exit(agent: any): void {
        agent.growthRate = 0; // Stop growing
    }
}

/**
 * ADULT STATE
 * 
 * - Prime reproductive years
 * - Peak physical performance
 * - Territory defense
 */
export class AdultState extends State {
    enter(agent: any): void {
        agent.canReproduce = true;
        agent.vulnerabilityMultiplier = 1.0; // Normal vulnerability
        agent.strengthMultiplier = 1.0; // Peak strength
    }

    execute(agent: any): void {
        // Check for transition to elder
        const elderAge = agent.maxLifespan * 0.75; // Last 25% of life
        if (agent.age >= elderAge) {
            agent.stateMachine.changeTo('elder');
        }
    }

    exit(agent: any): void {
        // Moving to elder state
    }
}

/**
 * ELDER STATE
 * 
 * - Declining physical abilities
 * - Reduced metabolism
 * - Eventually death
 */
export class ElderState extends State {
    enter(agent: any): void {
        agent.canReproduce = false; // Post-reproductive
        agent.vulnerabilityMultiplier = 1.3; // More vulnerable
        agent.strengthMultiplier = 0.7; // Weaker
    }

    execute(agent: any): void {
        // Senescence (declining performance)
        const ageRatio = agent.age / agent.maxLifespan;
        
        // Gradual decline
        agent.strengthMultiplier = Math.max(0.3, 1.0 - (ageRatio - 0.75) * 2);
        
        // Store original maxSpeed if not already stored
        if (!agent.originalMaxSpeed) {
            agent.originalMaxSpeed = agent.maxSpeed;
        }
        agent.maxSpeed = agent.originalMaxSpeed * agent.strengthMultiplier;

        // Check for death
        if (agent.age >= agent.maxLifespan) {
            if (agent.onDeath) {
                agent.onDeath('old_age');
            }
        }
    }

    exit(agent: any): void {
        // Death
    }
}

/**
 * LIFECYCLE STATE MACHINE
 * 
 * Manages transitions between life stages.
 */
export class LifecycleStateMachine extends StateMachine {
    constructor(agent: any) {
        super(agent);

        // Calculate age thresholds from allometric laws
        const mass = agent.mass || 10; // kg
        const maturityAge = AllometricScaling.generationTime(mass); // years
        const maxLifespan = AllometricScaling.maxLifespan(mass); // years

        // Store on agent
        agent.maturityAge = maturityAge;
        agent.maxLifespan = maxLifespan;
        // Don't overwrite existing age! Agent may start at any age
        if (agent.age === undefined) {
            agent.age = 0; // Only set if not already set
        }
        agent.adultMass = mass; // Target adult mass

        // If spawned as juvenile, start at fraction of adult mass
        if (agent.startAsJuvenile) {
            agent.mass = mass * 0.2; // 20% of adult mass
        }

        // Add states
        const juvenileState = new JuvenileState();
        const adultState = new AdultState();
        const elderState = new ElderState();

        this.add('juvenile', juvenileState);
        this.add('adult', adultState);
        this.add('elder', elderState);

        // Set initial state based on age
        if (agent.age < maturityAge) {
            this.changeTo('juvenile');
        } else if (agent.age < maxLifespan * 0.75) {
            this.changeTo('adult');
        } else {
            this.changeTo('elder');
        }
    }

    /**
     * Update age and execute current state
     */
    update(delta: number): void {
        const agent = this.owner;
        
        // Age the agent (delta is in seconds, convert to years)
        agent.age += delta / (365.25 * 24 * 3600); // seconds → years

        // Execute current state
        super.update();
    }
}

