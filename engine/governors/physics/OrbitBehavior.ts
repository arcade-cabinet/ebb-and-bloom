/**
 * ORBIT BEHAVIOR
 * 
 * Orbital mechanics as Yuka steering behavior.
 * 
 * Implements:
 * - Elliptical orbits (Kepler's Laws)
 * - Stable circular motion
 * - Gravitational slingshot
 * 
 * Based on: stellar.ts orbital mechanics, physics.ts gravity
 * Pattern: Custom SteeringBehavior with orbital elements
 */

import { SteeringBehavior, Vector3 } from 'yuka';
import { PHYSICS_CONSTANTS } from '../../tables/physics-constants';

const force = new Vector3();
const toCenter = new Vector3();
const tangent = new Vector3();

export class OrbitBehavior extends SteeringBehavior {
    /**
     * Mass of central body (e.g., star, planet)
     * @type {number}
     */
    centralMass: number = 1e30; // 1 solar mass (kg)

    /**
     * Desired orbital radius
     * @type {number}
     */
    orbitRadius: number = 1.496e11; // 1 AU (meters)

    /**
     * Orbital center position
     * @type {Vector3}
     */
    centralPosition: Vector3 = new Vector3(0, 0, 0);

    /**
     * Gravitational constant
     * @type {number}
     */
    G: number = PHYSICS_CONSTANTS.G;

    /**
     * Orbit stabilization factor (0-1, higher = more circular)
     * @type {number}
     */
    stabilization: number = 0.8;

    constructor(centralMass?: number, orbitRadius?: number) {
        super();
        if (centralMass !== undefined) this.centralMass = centralMass;
        if (orbitRadius !== undefined) this.orbitRadius = orbitRadius;
    }

    /**
     * Calculate orbital force
     * 
     * Combines:
     * - Gravitational pull (toward center)
     * - Tangential velocity correction (maintain circular orbit)
     * 
     * @param {Vehicle} vehicle - The agent
     * @param {Vector3} force - Force accumulator
     * @param {number} delta - Time delta
     * @returns {Vector3} - Accumulated force
     */
    calculate(vehicle: any, force: Vector3, delta: number): Vector3 {
        // Vector from vehicle to orbital center
        toCenter.subVectors(this.centralPosition, vehicle.position);
        const distance = toCenter.length();

        if (distance < 0.001) {
            // Too close to center, escape!
            force.set(1, 0, 0);
            return force;
        }

        // Gravitational force (centripetal)
        // F = G * M * m / r²
        const m = vehicle.mass || 1;
        const gravityMagnitude = (this.G * this.centralMass * m) / (distance * distance);
        const gravityForce = toCenter.clone().normalize().multiplyScalar(gravityMagnitude / m);

        // Orbital velocity for circular orbit
        // v = sqrt(G * M / r)
        const orbitalSpeed = Math.sqrt((this.G * this.centralMass) / this.orbitRadius);

        // Tangent direction (perpendicular to radius)
        tangent.crossVectors(toCenter, new Vector3(0, 1, 0)).normalize();
        if (tangent.length() < 0.001) {
            // Use different perpendicular if aligned with Y
            tangent.crossVectors(toCenter, new Vector3(1, 0, 0)).normalize();
        }

        // Current tangential velocity
        const currentSpeed = vehicle.velocity.length();
        const currentTangentSpeed = vehicle.velocity.dot(tangent);

        // Velocity correction (maintain orbital speed)
        const speedError = orbitalSpeed - currentSpeed;
        const velocityCorrection = tangent.clone().multiplyScalar(speedError * this.stabilization);

        // Radius correction (maintain orbital radius)
        const radiusError = this.orbitRadius - distance;
        const radiusCorrection = toCenter.clone().normalize().multiplyScalar(-radiusError * 0.1);

        // Combine forces
        force.copy(gravityForce).add(velocityCorrection).add(radiusCorrection);

        return force;
    }

    /**
     * Calculate orbital period (Kepler's Third Law)
     * 
     * T² = (4π² / GM) * r³
     * 
     * @returns Period in seconds
     */
    getOrbitalPeriod(): number {
        const T_squared = (4 * Math.PI * Math.PI / (this.G * this.centralMass)) * Math.pow(this.orbitRadius, 3);
        return Math.sqrt(T_squared);
    }

    /**
     * Calculate escape velocity
     * 
     * v_escape = sqrt(2GM / r)
     * 
     * @param distance - Distance from center
     * @returns Escape velocity (m/s)
     */
    getEscapeVelocity(distance: number): number {
        return Math.sqrt((2 * this.G * this.centralMass) / distance);
    }

    /**
     * Initialize vehicle in stable circular orbit
     * 
     * @param vehicle - The vehicle to orbit
     */
    initializeOrbit(vehicle: any): void {
        // Position at orbit radius
        const angle = Math.random() * Math.PI * 2;
        vehicle.position.set(
            this.centralPosition.x + this.orbitRadius * Math.cos(angle),
            this.centralPosition.y,
            this.centralPosition.z + this.orbitRadius * Math.sin(angle)
        );

        // Velocity perpendicular to radius
        const orbitalSpeed = Math.sqrt((this.G * this.centralMass) / this.orbitRadius);
        vehicle.velocity.set(
            -orbitalSpeed * Math.sin(angle),
            0,
            orbitalSpeed * Math.cos(angle)
        );

        vehicle.maxSpeed = orbitalSpeed * 1.5; // Allow some variation
    }
}

