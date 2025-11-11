export interface ConservedQuantities {
  mass: number;
  energy: number;
  charge: number;
  momentum: { x: number; y: number; z: number };
}

export interface ConservationViolation {
  timestamp: number;
  quantityType: keyof ConservedQuantities;
  expected: number | { x: number; y: number; z: number };
  actual: number | { x: number; y: number; z: number };
  drift: number;
  context: string;
}

export interface AuditEntry {
  timestamp: number;
  operation: 'add' | 'remove' | 'aggregate' | 'disaggregate' | 'reaction';
  entityIds: string[];
  beforeTotals: ConservedQuantities;
  afterTotals: ConservedQuantities;
  delta: ConservedQuantities;
}

export class ConservationLedger {
  private totals: ConservedQuantities = {
    mass: 0,
    energy: 0,
    charge: 0,
    momentum: { x: 0, y: 0, z: 0 },
  };

  private violations: ConservationViolation[] = [];
  private auditTrail: AuditEntry[] = [];
  private readonly maxAuditEntries = 10000;
  private readonly maxViolations = 1000;
  private readonly energyDriftThreshold = 0.05;

  constructor() {}

  getTotals(): Readonly<ConservedQuantities> {
    return { ...this.totals };
  }

  getViolations(): ReadonlyArray<ConservationViolation> {
    return [...this.violations];
  }

  getAuditTrail(): ReadonlyArray<AuditEntry> {
    return [...this.auditTrail];
  }

  addEntity(
    entityId: string,
    mass: number,
    energy: number,
    charge: number = 0,
    momentum: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 }
  ): void {
    const beforeTotals = { ...this.totals };

    this.totals.mass += mass;
    this.totals.energy += energy;
    this.totals.charge += charge;
    this.totals.momentum.x += momentum.x;
    this.totals.momentum.y += momentum.y;
    this.totals.momentum.z += momentum.z;

    this.recordAudit('add', [entityId], beforeTotals, {
      mass,
      energy,
      charge,
      momentum,
    });
  }

  removeEntity(
    entityId: string,
    mass: number,
    energy: number,
    charge: number = 0,
    momentum: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 }
  ): void {
    const beforeTotals = { ...this.totals };

    this.totals.mass -= mass;
    this.totals.energy -= energy;
    this.totals.charge -= charge;
    this.totals.momentum.x -= momentum.x;
    this.totals.momentum.y -= momentum.y;
    this.totals.momentum.z -= momentum.z;

    this.recordAudit('remove', [entityId], beforeTotals, {
      mass: -mass,
      energy: -energy,
      charge: -charge,
      momentum: { x: -momentum.x, y: -momentum.y, z: -momentum.z },
    });
  }

  validateAggregation(
    childIds: string[],
    childrenTotals: ConservedQuantities,
    aggregateTotals: ConservedQuantities,
    context: string
  ): boolean {
    const beforeTotals = { ...this.totals };

    let valid = true;

    const massDrift = Math.abs(aggregateTotals.mass - childrenTotals.mass);
    if (massDrift > 1e-10) {
      this.recordViolation(
        'mass',
        childrenTotals.mass,
        aggregateTotals.mass,
        massDrift,
        `${context} - Mass not conserved in aggregation`
      );
      valid = false;
    }

    const chargeDrift = Math.abs(aggregateTotals.charge - childrenTotals.charge);
    if (chargeDrift > 1e-10) {
      this.recordViolation(
        'charge',
        childrenTotals.charge,
        aggregateTotals.charge,
        chargeDrift,
        `${context} - Charge not conserved in aggregation`
      );
      valid = false;
    }

    const energyDrift = Math.abs(
      (aggregateTotals.energy - childrenTotals.energy) / Math.max(childrenTotals.energy, 1)
    );
    if (energyDrift > this.energyDriftThreshold) {
      this.recordViolation(
        'energy',
        childrenTotals.energy,
        aggregateTotals.energy,
        energyDrift,
        `${context} - Energy drift ${(energyDrift * 100).toFixed(2)}% exceeds threshold`
      );
      valid = false;
    }

    const delta: ConservedQuantities = {
      mass: aggregateTotals.mass - childrenTotals.mass,
      energy: aggregateTotals.energy - childrenTotals.energy,
      charge: aggregateTotals.charge - childrenTotals.charge,
      momentum: {
        x: aggregateTotals.momentum.x - childrenTotals.momentum.x,
        y: aggregateTotals.momentum.y - childrenTotals.momentum.y,
        z: aggregateTotals.momentum.z - childrenTotals.momentum.z,
      },
    };

    this.recordAudit('aggregate', childIds, beforeTotals, delta);

    return valid;
  }

  validateReaction(
    reactantIds: string[],
    productIds: string[],
    reactantTotals: ConservedQuantities,
    productTotals: ConservedQuantities,
    context: string
  ): boolean {
    const beforeTotals = { ...this.totals };

    let valid = true;

    const massDrift = Math.abs(productTotals.mass - reactantTotals.mass);
    if (massDrift > 1e-10) {
      this.recordViolation(
        'mass',
        reactantTotals.mass,
        productTotals.mass,
        massDrift,
        `${context} - Mass not conserved in reaction`
      );
      valid = false;
    }

    const chargeDrift = Math.abs(productTotals.charge - reactantTotals.charge);
    if (chargeDrift > 1e-10) {
      this.recordViolation(
        'charge',
        reactantTotals.charge,
        productTotals.charge,
        chargeDrift,
        `${context} - Charge not conserved in reaction`
      );
      valid = false;
    }

    const energyDrift = Math.abs(
      (productTotals.energy - reactantTotals.energy) / Math.max(reactantTotals.energy, 1)
    );
    if (energyDrift > this.energyDriftThreshold) {
      this.recordViolation(
        'energy',
        reactantTotals.energy,
        productTotals.energy,
        energyDrift,
        `${context} - Energy drift ${(energyDrift * 100).toFixed(2)}% exceeds threshold`
      );
      valid = false;
    }

    const delta: ConservedQuantities = {
      mass: productTotals.mass - reactantTotals.mass,
      energy: productTotals.energy - reactantTotals.energy,
      charge: productTotals.charge - reactantTotals.charge,
      momentum: {
        x: productTotals.momentum.x - reactantTotals.momentum.x,
        y: productTotals.momentum.y - reactantTotals.momentum.y,
        z: productTotals.momentum.z - reactantTotals.momentum.z,
      },
    };

    this.recordAudit('reaction', [...reactantIds, ...productIds], beforeTotals, delta);

    return valid;
  }

  reset(): void {
    this.totals = {
      mass: 0,
      energy: 0,
      charge: 0,
      momentum: { x: 0, y: 0, z: 0 },
    };
    this.violations = [];
    this.auditTrail = [];
  }

  clearViolations(): void {
    this.violations = [];
  }

  private recordViolation(
    quantityType: keyof ConservedQuantities,
    expected: number | { x: number; y: number; z: number },
    actual: number | { x: number; y: number; z: number },
    drift: number,
    context: string
  ): void {
    this.violations.push({
      timestamp: Date.now(),
      quantityType,
      expected,
      actual,
      drift,
      context,
    });

    if (this.violations.length > this.maxViolations) {
      this.violations.shift();
    }

    console.warn(`[ConservationLedger] VIOLATION: ${context}`, {
      quantityType,
      expected,
      actual,
      drift,
    });
  }

  private recordAudit(
    operation: AuditEntry['operation'],
    entityIds: string[],
    beforeTotals: ConservedQuantities,
    delta: ConservedQuantities
  ): void {
    const afterTotals = { ...this.totals };

    this.auditTrail.push({
      timestamp: Date.now(),
      operation,
      entityIds,
      beforeTotals,
      afterTotals,
      delta,
    });

    if (this.auditTrail.length > this.maxAuditEntries) {
      this.auditTrail.shift();
    }
  }

  getStatistics() {
    return {
      totalViolations: this.violations.length,
      violationsByType: {
        mass: this.violations.filter((v) => v.quantityType === 'mass').length,
        energy: this.violations.filter((v) => v.quantityType === 'energy').length,
        charge: this.violations.filter((v) => v.quantityType === 'charge').length,
        momentum: this.violations.filter((v) => v.quantityType === 'momentum').length,
      },
      auditTrailSize: this.auditTrail.length,
      currentTotals: this.getTotals(),
    };
  }
}
