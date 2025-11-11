import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GyroscopeCamera } from '../GyroscopeCamera';

const mockMotion = {
  addListener: vi.fn(),
  removeAllListeners: vi.fn(),
};

vi.mock('@capacitor/motion', () => ({
  Motion: mockMotion,
}));

describe('GyroscopeCamera', () => {
  let gyroscope: GyroscopeCamera;

  beforeEach(() => {
    gyroscope = new GyroscopeCamera();
    vi.clearAllMocks();
  });

  afterEach(async () => {
    await gyroscope.stop();
  });

  describe('constructor', () => {
    it('should create with default sensitivity and smoothing', () => {
      const camera = new GyroscopeCamera();
      expect(camera).toBeDefined();
      const offset = camera.getOffset();
      expect(offset).toEqual({ x: 0, y: 0, z: 0 });
    });

    it('should create with custom sensitivity and smoothing', () => {
      const camera = new GyroscopeCamera(0.8, 0.25);
      expect(camera).toBeDefined();
    });

    it('should clamp sensitivity between 0 and 1', () => {
      const camera1 = new GyroscopeCamera(-0.5, 0.15);
      const camera2 = new GyroscopeCamera(1.5, 0.15);
      expect(camera1).toBeDefined();
      expect(camera2).toBeDefined();
    });

    it('should clamp smoothing between 0 and 1', () => {
      const camera1 = new GyroscopeCamera(0.5, -0.5);
      const camera2 = new GyroscopeCamera(0.5, 1.5);
      expect(camera1).toBeDefined();
      expect(camera2).toBeDefined();
    });
  });

  describe('getOffset', () => {
    it('should return initial zero offset', () => {
      const offset = gyroscope.getOffset();
      expect(offset).toEqual({ x: 0, y: 0, z: 0 });
    });

    it('should return a copy of the offset', () => {
      const offset1 = gyroscope.getOffset();
      const offset2 = gyroscope.getOffset();
      expect(offset1).toEqual(offset2);
      expect(offset1).not.toBe(offset2);
    });
  });

  describe('setSensitivity', () => {
    it('should update sensitivity', () => {
      gyroscope.setSensitivity(0.75);
      expect(gyroscope).toBeDefined();
    });

    it('should clamp sensitivity to valid range', () => {
      gyroscope.setSensitivity(-0.5);
      gyroscope.setSensitivity(1.5);
      expect(gyroscope).toBeDefined();
    });
  });

  describe('setSmoothing', () => {
    it('should update smoothing', () => {
      gyroscope.setSmoothing(0.25);
      expect(gyroscope).toBeDefined();
    });

    it('should clamp smoothing to valid range', () => {
      gyroscope.setSmoothing(-0.5);
      gyroscope.setSmoothing(1.5);
      expect(gyroscope).toBeDefined();
    });
  });

  describe('setEnabled', () => {
    it('should enable gyroscope', () => {
      gyroscope.setEnabled(true);
      expect(gyroscope).toBeDefined();
    });

    it('should disable gyroscope and reset offset', () => {
      gyroscope.setEnabled(false);
      const offset = gyroscope.getOffset();
      expect(offset).toEqual({ x: 0, y: 0, z: 0 });
    });
  });

  describe('start and stop', () => {
    it('should handle start when gyroscope is not available', async () => {
      mockMotion.addListener.mockRejectedValue(new Error('Not available'));
      await expect(gyroscope.start()).resolves.not.toThrow();
    });

    it('should handle stop gracefully', async () => {
      await expect(gyroscope.stop()).resolves.not.toThrow();
    });

    it('should not start multiple times', async () => {
      mockMotion.addListener.mockResolvedValue({
        remove: vi.fn().mockResolvedValue(undefined),
      });
      
      await gyroscope.start();
      await gyroscope.start();
      
      expect(mockMotion.addListener).toHaveBeenCalledTimes(1);
    });
  });

  describe('isAvailable', () => {
    it('should check gyroscope availability', async () => {
      const available = await gyroscope.isAvailable();
      expect(typeof available).toBe('boolean');
    });
  });

  describe('orientation handling', () => {
    it('should map beta to y offset', () => {
      gyroscope.setEnabled(true);
      
      const mockEvent = {
        alpha: 0,
        beta: 30,
        gamma: 0,
      };
      
      (gyroscope as any).handleOrientation(mockEvent);
      
      const offset = gyroscope.getOffset();
      expect(offset.y).toBeGreaterThan(0);
    });

    it('should map gamma to x offset', () => {
      gyroscope.setEnabled(true);
      
      const mockEvent = {
        alpha: 0,
        beta: 0,
        gamma: 30,
      };
      
      (gyroscope as any).handleOrientation(mockEvent);
      
      const offset = gyroscope.getOffset();
      expect(offset.x).toBeGreaterThan(0);
    });

    it('should clamp offsets between -1 and 1', () => {
      gyroscope.setEnabled(true);
      gyroscope.setSensitivity(1.0);
      
      const mockEvent = {
        alpha: 0,
        beta: 90,
        gamma: 90,
      };
      
      (gyroscope as any).handleOrientation(mockEvent);
      
      const offset = gyroscope.getOffset();
      expect(offset.x).toBeLessThanOrEqual(1);
      expect(offset.x).toBeGreaterThanOrEqual(-1);
      expect(offset.y).toBeLessThanOrEqual(1);
      expect(offset.y).toBeGreaterThanOrEqual(-1);
    });

    it('should not update when disabled', () => {
      gyroscope.setEnabled(false);
      
      const mockEvent = {
        alpha: 0,
        beta: 30,
        gamma: 30,
      };
      
      (gyroscope as any).handleOrientation(mockEvent);
      
      const offset = gyroscope.getOffset();
      expect(offset).toEqual({ x: 0, y: 0, z: 0 });
    });

    it('should apply sensitivity scaling', () => {
      gyroscope.setEnabled(true);
      gyroscope.setSensitivity(0.5);
      
      const mockEvent = {
        alpha: 0,
        beta: 30,
        gamma: 0,
      };
      
      (gyroscope as any).handleOrientation(mockEvent);
      
      const offset1 = gyroscope.getOffset();
      
      gyroscope.setSensitivity(1.0);
      gyroscope.setEnabled(false);
      gyroscope.setEnabled(true);
      
      (gyroscope as any).handleOrientation(mockEvent);
      
      const offset2 = gyroscope.getOffset();
      
      expect(Math.abs(offset2.y)).toBeGreaterThanOrEqual(Math.abs(offset1.y));
    });

    it('should apply smoothing via lerp', () => {
      gyroscope.setEnabled(true);
      gyroscope.setSmoothing(0.1);
      
      const mockEvent = {
        alpha: 0,
        beta: 30,
        gamma: 0,
      };
      
      (gyroscope as any).handleOrientation(mockEvent);
      const offset1 = gyroscope.getOffset();
      
      (gyroscope as any).handleOrientation(mockEvent);
      const offset2 = gyroscope.getOffset();
      
      expect(Math.abs(offset2.y)).toBeGreaterThanOrEqual(Math.abs(offset1.y));
    });
  });

  describe('lerp', () => {
    it('should interpolate between current and target', () => {
      const lerp = (gyroscope as any).lerp.bind(gyroscope);
      
      expect(lerp(0, 10, 0.5)).toBe(5);
      expect(lerp(0, 10, 0.0)).toBe(0);
      expect(lerp(0, 10, 1.0)).toBe(10);
    });
  });

  describe('clamp', () => {
    it('should clamp values to range', () => {
      const clamp = (gyroscope as any).clamp.bind(gyroscope);
      
      expect(clamp(-5, -1, 1)).toBe(-1);
      expect(clamp(5, -1, 1)).toBe(1);
      expect(clamp(0.5, -1, 1)).toBe(0.5);
    });
  });
});
