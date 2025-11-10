/**
 * STELLAR BEHAVIOR
 * 
 * Star lifecycle and evolution for stellar agents.
 */

export class StellarEvolutionSystem {
    /**
     * Main sequence luminosity from mass
     * L ∝ M^3.5
     */
    static luminosity(mass: number): number {
        if (mass < 0.43) return 0.23 * Math.pow(mass, 2.3);
        if (mass < 2) return Math.pow(mass, 4);
        if (mass < 55) return 1.4 * Math.pow(mass, 3.5);
        return 32000 * mass;
    }

    /**
     * Main sequence lifetime
     * t ∝ M / L ∝ M^(-2.5)
     */
    static lifetime(mass: number): number {
        const t_sun = 10e9; // 10 billion years
        return (t_sun * mass) / this.luminosity(mass);
    }

    /**
     * Surface temperature from mass
     */
    static temperature(mass: number): number {
        const T_sun = 5778; // K
        return T_sun * Math.pow(mass, 0.505);
    }

    /**
     * Radius from mass
     */
    static radius(mass: number): number {
        if (mass < 1) return Math.pow(mass, 0.8);
        return Math.pow(mass, 0.57);
    }

    /**
     * Habitable zone inner edge
     */
    static habitableZoneInner(luminosity: number): number {
        return Math.sqrt(luminosity / 1.1); // AU
    }

    /**
     * Habitable zone outer edge
     */
    static habitableZoneOuter(luminosity: number): number {
        return Math.sqrt(luminosity / 0.53); // AU
    }

    /**
     * Update star state
     */
    static evolve(star: any, delta: number): void {
        if (!star.age) star.age = 0;
        if (!star.mass) star.mass = 1.0;

        star.age += delta / (365.25 * 24 * 3600); // seconds → years

        const lifetime = this.lifetime(star.mass);
        const ageRatio = star.age / lifetime;

        if (ageRatio < 0.9) {
            // Main sequence
            star.luminosity = this.luminosity(star.mass);
            star.radius = this.radius(star.mass);
            star.temperature = this.temperature(star.mass);
        } else if (ageRatio < 1.0) {
            // Red giant phase
            star.luminosity = this.luminosity(star.mass) * 100;
            star.radius = this.radius(star.mass) * 50;
            star.temperature = 3000; // Cooler surface
        } else {
            // Death
            if (star.mass < 8) {
                // White dwarf
                star.luminosity = 0.001;
                star.radius = 0.01;
            } else {
                // Supernova
                if (star.onSupernova) star.onSupernova();
            }
        }
    }
}

