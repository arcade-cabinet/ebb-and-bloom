export abstract class BaseScene {
  abstract enter(): Promise<void>;
  abstract exit(): Promise<void>;
  abstract update(deltaTime: number): void;
  abstract render(): React.ReactNode;
}
