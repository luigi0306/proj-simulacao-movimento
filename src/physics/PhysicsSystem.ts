import { DT, G, M_DRY, F0, BURN_RATE_PER_FRAME, ROTATION_ANGLE, INITIAL_HEIGHT, M_FUEL0, X_LIMIT } from '../constants';
import { RocketState, InputState } from '../types';

export function getInitialState(): RocketState {
  return {
    x: 0,
    y: INITIAL_HEIGHT,
    vx: 0,
    vy: 0,
    theta: 0,
    fuel: M_FUEL0,
    time: 0,
    phase: 'READY',
    scoreTime: 0,
    impactVelocity: 0,
    currentThrust: 0,
    currentMass: M_DRY + M_FUEL0,
    ax: 0,
    ay: 0
  };
}

export function physicsStep(state: RocketState, input: InputState): RocketState {
  if (state.phase === 'LANDED') return state; // Não atualiza se já caiu
  if (state.phase === 'READY') {
    // Se está na tela de início, apenas mantemos o estado inicial sem avançar o tempo
    return state;
  }

  // Novo estado clonado para evitar mutação indesejada
  const next = { ...state };

  // 1. Ângulo
  next.theta = input.rotateDir * ROTATION_ANGLE;

  // 2. Massa atual antes da queima
  const m = M_DRY + next.fuel;
  next.currentMass = m;

  // 3. Queima de combustível
  let burned = 0;
  let throttle = 0;
  if (input.thrust && next.fuel > 0) {
    burned = Math.min(BURN_RATE_PER_FRAME, next.fuel);
    throttle = burned / BURN_RATE_PER_FRAME;
  }

  // 4. Força resultante
  const thrustForce = F0 * throttle;
  next.currentThrust = thrustForce;
  
  // T = F * (sin(theta), cos(theta)) - O ângulo 0 é para cima (y positivo)
  const Tx = thrustForce * Math.sin(next.theta);
  const Ty = thrustForce * Math.cos(next.theta);

  // W = m * (0, -g)
  const Wx = 0;
  const Wy = -m * G;

  const sumFx = Tx + Wx;
  const sumFy = Ty + Wy;

  // 5. Aceleração
  const ax = sumFx / m;
  const ay = sumFy / m;
  next.ax = ax;
  next.ay = ay;

  // 6. Integração cinemática (MRUV exato para aceleração constante no frame)
  next.x += next.vx * DT + 0.5 * ax * DT * DT;
  next.y += next.vy * DT + 0.5 * ay * DT * DT;
  
  next.vx += ax * DT;
  next.vy += ay * DT;

  // Parede lateral da arena (restrição de jogabilidade): colisão inelástica
  if (next.x > X_LIMIT) {
    next.x = X_LIMIT;
    next.vx = Math.min(next.vx, 0);
  } else if (next.x < -X_LIMIT) {
    next.x = -X_LIMIT;
    next.vx = Math.max(next.vx, 0);
  }

  // 7. Atualização da massa
  next.fuel -= burned;

  // 8. Tempo
  next.time += DT;

  // 9. Colisão com o chão
  if (next.y <= 0) {
    next.phase = 'LANDED';
    
    // Interpolação para encontrar o instante exato do toque (y=0)
    // Usando semelhança de triângulos / regra de três com a posição Y
    const f = state.y / (state.y - next.y);
    next.scoreTime = state.time + f * DT;
    
    next.y = 0;
    
    // Velocidade de impacto (magnitude da velocidade ao tocar)
    const exactVx = state.vx + ax * (f * DT);
    const exactVy = state.vy + ay * (f * DT);
    next.impactVelocity = Math.sqrt(exactVx * exactVx + exactVy * exactVy);
  }

  return next;
}
