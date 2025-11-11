import { Motion, MotionOrientationEventResult } from '@capacitor/motion';

export interface GyroscopeOffset {
  x: number;
  y: number;
  z: number;
}

export class GyroscopeCamera {
  private enabled: boolean = false;
  private listening: boolean = false;
  private currentOffset: GyroscopeOffset = { x: 0, y: 0, z: 0 };
  private sensitivity: number;
  private smoothing: number;
  private listener: { remove: () => Promise<void> } | null = null;
  private mouseListener: ((e: MouseEvent) => void) | null = null;

  constructor(sensitivity: number = 0.5, smoothing: number = 0.15) {
    this.sensitivity = Math.max(0, Math.min(1, sensitivity));
    this.smoothing = Math.max(0, Math.min(1, smoothing));
  }

  async start(): Promise<void> {
    if (this.listening) {
      return;
    }

    const available = await this.isAvailable();
    
    if (available) {
      try {
        this.listener = await Motion.addListener('orientation', (event) => {
          this.handleOrientation(event);
        });
        this.listening = true;
      } catch (error) {
        console.warn('Failed to start gyroscope:', error);
        this.setupDevSimulation();
      }
    } else {
      this.setupDevSimulation();
    }
  }

  async stop(): Promise<void> {
    if (this.listener) {
      await this.listener.remove();
      this.listener = null;
    }
    
    if (this.mouseListener && typeof window !== 'undefined') {
      window.removeEventListener('mousemove', this.mouseListener);
      this.mouseListener = null;
    }
    
    this.listening = false;
  }

  getOffset(): GyroscopeOffset {
    return { ...this.currentOffset };
  }

  setSensitivity(value: number): void {
    this.sensitivity = Math.max(0, Math.min(1, value));
  }

  setSmoothing(value: number): void {
    this.smoothing = Math.max(0, Math.min(1, value));
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.currentOffset = { x: 0, y: 0, z: 0 };
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      if (typeof window === 'undefined') {
        return false;
      }

      if (typeof DeviceOrientationEvent !== 'undefined' && 
          typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        return permission === 'granted';
      }

      return typeof DeviceOrientationEvent !== 'undefined';
    } catch (error) {
      console.warn('Gyroscope not available:', error);
      return false;
    }
  }

  private handleOrientation(event: MotionOrientationEventResult): void {
    if (!this.enabled) {
      return;
    }

    const beta = event.beta ?? 0;
    const gamma = event.gamma ?? 0;
    const alpha = event.alpha ?? 0;

    const targetX = this.clamp(gamma / 30, -1, 1);
    const targetY = this.clamp(beta / 30, -1, 1);
    const targetZ = this.clamp((alpha - 180) / 180, -1, 1);

    this.currentOffset.x = this.lerp(
      this.currentOffset.x,
      targetX * this.sensitivity,
      this.smoothing
    );
    
    this.currentOffset.y = this.lerp(
      this.currentOffset.y,
      targetY * this.sensitivity,
      this.smoothing
    );
    
    this.currentOffset.z = this.lerp(
      this.currentOffset.z,
      targetZ * this.sensitivity * 0.5,
      this.smoothing
    );
  }

  private setupDevSimulation(): void {
    if (typeof window === 'undefined' || typeof import.meta.env === 'undefined') {
      return;
    }

    if (import.meta.env.DEV) {
      this.mouseListener = (e: MouseEvent) => {
        if (!this.enabled) {
          return;
        }

        const x = (e.clientX / window.innerWidth) * 2 - 1;
        const y = (e.clientY / window.innerHeight) * 2 - 1;
        
        this.currentOffset.x = this.lerp(
          this.currentOffset.x,
          x * this.sensitivity,
          this.smoothing
        );
        
        this.currentOffset.y = this.lerp(
          this.currentOffset.y,
          -y * this.sensitivity,
          this.smoothing
        );
        
        this.currentOffset.z = 0;
      };
      
      window.addEventListener('mousemove', this.mouseListener);
      this.listening = true;
      console.info('Gyroscope simulation enabled: move your mouse to simulate device tilt');
    }
  }

  private lerp(current: number, target: number, factor: number): number {
    return current + (target - current) * factor;
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }
}
