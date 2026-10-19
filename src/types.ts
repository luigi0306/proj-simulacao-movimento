export type Phase = 'READY' | 'RUNNING' | 'LANDED';

export interface RocketState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  theta: number; // Ângulo em radianos. 0 = vertical (cima), positivo = direita.
  
  fuel: number; // Em kg
  time: number; // Tempo simulado (s)
  
  phase: Phase;
  scoreTime: number; // Tempo exato de impacto com o chão (s)
  impactVelocity: number; // Velocidade escalar de impacto
  
  // Apenas para HUD e renderização:
  currentThrust: number; // Força atual aplicada no frame (N)
  currentMass: number; // Massa total no frame (kg)
  ax: number; // Aceleração horizontal no frame (m/s²)
  ay: number; // Aceleração vertical no frame (m/s²)
}

export interface InputState {
  thrust: boolean; // Espaço
  rotateDir: number; // -1 (esquerda), 0 (nenhum), 1 (direita)
}
