/**
 * Validação numérica do motor de física contra soluções analíticas.
 * Uso: npm run validate
 */
import { getInitialState, physicsStep } from '../src/physics/PhysicsSystem';
import { DT, G, F0, M_DRY, M_FUEL0, BURN_RATE_PER_FRAME, ROTATION_ANGLE } from '../src/constants';
import type { InputState, RocketState } from '../src/types';

const NO_INPUT: InputState = { thrust: false, rotateDir: 0 };
const THRUST: InputState = { thrust: true, rotateDir: 0 };

function start(): RocketState {
  const s = getInitialState();
  s.phase = 'RUNNING';
  return s;
}

let failures = 0;
function check(name: string, got: number, expected: number, tol: number, unit = '') {
  const err = Math.abs(got - expected);
  const ok = err <= tol;
  if (!ok) failures++;
  console.log(
    `${ok ? 'OK  ' : 'FAIL'} ${name}: simulado = ${got.toFixed(4)}${unit} | esperado = ${expected.toFixed(4)}${unit} | erro = ${err.toExponential(2)}`
  );
}

// 1. Queda livre de 122,5 m a partir do repouso: t = sqrt(2h/g) = 5 s, v = g·t = 49 m/s
{
  let s = start();
  while (s.phase === 'RUNNING') s = physicsStep(s, NO_INPUT);
  check('Queda livre - tempo de queda', s.scoreTime, 5, 1e-6, ' s');
  check('Queda livre - velocidade de impacto', s.impactVelocity, G * 5, 1e-6, ' m/s');
}

// 2. Queima total na vertical (equação do foguete): Δv = ve·ln(m0/mf) − g·t_b
{
  let s = start();
  let frames = 0;
  while (s.fuel > 0) {
    s = physicsStep(s, THRUST);
    frames++;
  }
  const mdot = BURN_RATE_PER_FRAME / DT; // kg/s
  const ve = F0 / mdot; // velocidade efetiva de exaustão (m/s)
  const analytic = ve * Math.log((M_DRY + M_FUEL0) / M_DRY) - G * frames * DT;
  check('Queima total - número de frames', frames, 1000, 0);
  check('Queima total - combustível restante', s.fuel, 0, 1e-9, ' kg');
  // Tolerância 0,5 %: diferença esperada pela convenção "massa antes da queima do frame"
  check('Queima total - Δv vs. equação do foguete', s.vy, analytic, 0.005 * analytic, ' m/s');
}

// 3. Inclinado 30° no instante inicial: a_y = F0·cos30°/m − g ; a_x = F0·sin30°/m
{
  let s = start();
  s = physicsStep(s, { thrust: true, rotateDir: 1 });
  const m0 = M_DRY + M_FUEL0;
  check('Inclinado - a_y', s.ay, (F0 * Math.cos(ROTATION_ANGLE)) / m0 - G, 1e-9, ' m/s²');
  check('Inclinado - a_x', s.ax, (F0 * Math.sin(ROTATION_ANGLE)) / m0, 1e-9, ' m/s²');
}

// 4. Sem empuxo não há força horizontal: vx permanece constante (1ª lei de Newton)
{
  let s = start();
  s = physicsStep(s, { thrust: true, rotateDir: 1 });
  const vx0 = s.vx;
  for (let i = 0; i < 60; i++) s = physicsStep(s, NO_INPUT);
  check('Inércia horizontal - vx após 1 s sem empuxo', s.vx, vx0, 1e-12, ' m/s');
}

// 5. Massa nunca fica abaixo da massa seca e o combustível nunca é negativo
{
  let s = start();
  let minFuel = Infinity;
  for (let i = 0; i < 1500 && s.phase === 'RUNNING'; i++) {
    s = physicsStep(s, THRUST);
    minFuel = Math.min(minFuel, s.fuel);
  }
  check('Combustível mínimo (nunca negativo)', Math.max(0, -minFuel), 0, 0, ' kg');
}

console.log(failures === 0 ? '\nTodas as verificações passaram.' : `\n${failures} verificação(ões) falharam.`);
process.exit(failures === 0 ? 0 : 1);
