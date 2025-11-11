import { describe, it, expect } from 'vitest';
import { 
  PERIODIC_TABLE, 
  getElementByNumber,
  getElementsByPhase,
  PRIMORDIAL_ABUNDANCES 
} from '../../../agents/tables/periodic-table';

describe('PERIODIC_TABLE', () => {
  it('should have hydrogen as first element', () => {
    const hydrogen = PERIODIC_TABLE.H;
    expect(hydrogen).toBeDefined();
    expect(hydrogen.atomicNumber).toBe(1);
    expect(hydrogen.symbol).toBe('H');
    expect(hydrogen.name).toBe('Hydrogen');
  });

  it('should have correct atomic masses', () => {
    expect(PERIODIC_TABLE.H.atomicMass).toBeCloseTo(1.008, 2);
    expect(PERIODIC_TABLE.He.atomicMass).toBeCloseTo(4.003, 2);
    expect(PERIODIC_TABLE.C.atomicMass).toBeCloseTo(12.011, 2);
    expect(PERIODIC_TABLE.O.atomicMass).toBeCloseTo(15.999, 2);
  });

  it('should have correct phases at STP', () => {
    expect(PERIODIC_TABLE.H.phase).toBe('gas');
    expect(PERIODIC_TABLE.C.phase).toBe('solid');
    expect(PERIODIC_TABLE.Fe.phase).toBe('solid');
  });

  it('should have correct valence electrons', () => {
    expect(PERIODIC_TABLE.H.valenceElectrons).toBe(1);
    expect(PERIODIC_TABLE.He.valenceElectrons).toBe(2);
    expect(PERIODIC_TABLE.C.valenceElectrons).toBe(4);
    expect(PERIODIC_TABLE.O.valenceElectrons).toBe(6);
  });

  it('should have bond energies', () => {
    expect(PERIODIC_TABLE.H.bondEnergies.H).toBeGreaterThan(0);
    expect(PERIODIC_TABLE.C.bondEnergies.C).toBeGreaterThan(0);
    expect(PERIODIC_TABLE.O.bondEnergies.O).toBeGreaterThan(0);
  });

  it('should have cosmic abundances', () => {
    expect(PERIODIC_TABLE.H.universeAbundance).toBeGreaterThan(0);
    expect(PERIODIC_TABLE.He.universeAbundance).toBeGreaterThan(0);
    
    expect(PERIODIC_TABLE.H.universeAbundance).toBeGreaterThan(
      PERIODIC_TABLE.He.universeAbundance
    );
  });

  describe('getElementByNumber', () => {
    it('should get element by atomic number', () => {
      const hydrogen = getElementByNumber(1);
      expect(hydrogen?.symbol).toBe('H');
      
      const carbon = getElementByNumber(6);
      expect(carbon?.symbol).toBe('C');
    });

    it('should return undefined for invalid atomic number', () => {
      const element = getElementByNumber(999);
      expect(element).toBeUndefined();
    });
  });

  describe('getElementsByPhase', () => {
    it('should get elements by phase at given temperature', () => {
      const roomTemp = 298.15;
      const gases = getElementsByPhase(roomTemp).filter(e => e.phase === 'gas');
      const solids = getElementsByPhase(roomTemp).filter(e => e.phase === 'solid');
      
      expect(gases.length).toBeGreaterThan(0);
      expect(solids.length).toBeGreaterThan(0);
    });

    it('should handle high temperatures', () => {
      const highTemp = 5000;
      const elements = getElementsByPhase(highTemp);
      
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  describe('PRIMORDIAL_ABUNDANCES', () => {
    it('should have hydrogen as most abundant', () => {
      expect(PRIMORDIAL_ABUNDANCES.H).toBe(0.75);
      expect(PRIMORDIAL_ABUNDANCES.H).toBeGreaterThan(PRIMORDIAL_ABUNDANCES.He);
    });

    it('should have helium as second most abundant', () => {
      expect(PRIMORDIAL_ABUNDANCES.He).toBe(0.23);
    });

    it('should have trace amounts of heavier elements', () => {
      expect(PRIMORDIAL_ABUNDANCES.C).toBeLessThan(0.01);
      expect(PRIMORDIAL_ABUNDANCES.O).toBeLessThan(0.02);
    });
  });
});
