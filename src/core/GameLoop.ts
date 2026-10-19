import { DT } from '../constants';

export class GameLoop {
  private lastTime: number = 0;
  private accumulator: number = 0;
  private requestRef: number = 0;

  constructor(
    private updateFn: () => void,
    private renderFn: (alpha: number) => void
  ) {}

  private loop = (time: number) => {
    if (this.lastTime === 0) {
      this.lastTime = time;
    }
    
    const frameTime = (time - this.lastTime) / 1000;
    this.lastTime = time;
    
    // Evita a "espiral da morte" caso o usuário mude de aba e volte
    this.accumulator += Math.min(frameTime, 0.25);

    while (this.accumulator >= DT) {
      this.updateFn();
      this.accumulator -= DT;
    }

    const alpha = this.accumulator / DT;
    this.renderFn(alpha);

    this.requestRef = requestAnimationFrame(this.loop);
  };

  public start() {
    this.lastTime = performance.now();
    this.accumulator = 0;
    this.requestRef = requestAnimationFrame(this.loop);
  }

  public stop() {
    cancelAnimationFrame(this.requestRef);
  }
}
