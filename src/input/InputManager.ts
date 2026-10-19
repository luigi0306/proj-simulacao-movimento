import { InputState } from '../types';

export class InputManager {
  private keys: Set<string> = new Set();
  public onAnyKey: (() => void) | null = null;
  public onReset: (() => void) | null = null;

  constructor() {
    window.addEventListener('keydown', (e) => this.handleKeyDown(e));
    window.addEventListener('keyup', (e) => this.handleKeyUp(e));
  }

  private handleKeyDown(e: KeyboardEvent) {
    // Evita rolagem da página ao apertar Espaço ou Setas
    if (['Space', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key) || e.code === 'Space') {
      e.preventDefault();
    }
    
    const key = e.code;
    this.keys.add(key);

    if (key.toLowerCase() === 'keyr' && this.onReset) {
      this.onReset();
    }

    if (this.onAnyKey) {
      this.onAnyKey();
    }
  }

  private handleKeyUp(e: KeyboardEvent) {
    this.keys.delete(e.code);
  }

  public getState(): InputState {
    const left = this.keys.has('ArrowLeft');
    const right = this.keys.has('ArrowRight');
    
    let rotateDir = 0;
    if (left && !right) rotateDir = -1;
    if (right && !left) rotateDir = 1;

    return {
      thrust: this.keys.has('Space'),
      rotateDir
    };
  }
}
