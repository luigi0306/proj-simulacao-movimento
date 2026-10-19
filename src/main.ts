import { getInitialState, physicsStep } from './physics/PhysicsSystem';
import { InputManager } from './input/InputManager';
import { GameLoop } from './core/GameLoop';
import { Renderer } from './render/Renderer';
import { RocketState } from './types';

const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const overlay = document.getElementById('overlay')!;
const gameoverScreen = document.getElementById('gameover')!;
const scoreDisplay = document.getElementById('score')!;
const impactVelocityDisplay = document.getElementById('impactVelocity')!;

const input = new InputManager();
const renderer = new Renderer(canvas);

let currentState: RocketState = getInitialState();
let prevState: RocketState = currentState;

function update() {
  if (currentState.phase === 'LANDED') {
    return;
  }
  
  const inpt = input.getState();
  const nextState = physicsStep(currentState, inpt);
  
  // Transição de estado para fim de jogo
  if (currentState.phase === 'RUNNING' && nextState.phase === 'LANDED') {
    showGameOver(nextState);
  }
  
  prevState = currentState;
  currentState = nextState;
}

function draw(alpha: number) {
  // Interpolação APENAS visual entre o passo anterior e o atual (alpha = fração do próximo Δt
  // já acumulada). A física continua avançando em Δt = 1/60 s fixo; isto só suaviza a
  // exibição em monitores de 120/144 Hz.
  let view = currentState;
  if (currentState.phase === 'RUNNING' && prevState.phase === 'RUNNING') {
    view = {
      ...currentState,
      x: prevState.x + (currentState.x - prevState.x) * alpha,
      y: prevState.y + (currentState.y - prevState.y) * alpha,
    };
  }
  renderer.draw(view);
}

const loop = new GameLoop(update, draw);

function showGameOver(state: RocketState) {
  scoreDisplay.innerText = state.scoreTime.toFixed(3);
  impactVelocityDisplay.innerText = state.impactVelocity.toFixed(1);
  gameoverScreen.classList.remove('hidden');
}

function resetGame() {
  currentState = getInitialState();
  currentState.phase = 'RUNNING'; // Já inicia em execução para a simulação fluir
  prevState = currentState;
  gameoverScreen.classList.add('hidden');
  overlay.classList.add('hidden');
}

// Interação inicial para permitir tela cheia e iniciar a música/loop se necessário.
overlay.addEventListener('click', () => {
  if (currentState.phase === 'READY') {
    document.documentElement.requestFullscreen().catch(() => {
      // Ignora erro caso navegador bloqueie (ex: iframe)
    });
    resetGame();
  }
});

input.onAnyKey = () => {
  if (currentState.phase === 'READY') {
    document.documentElement.requestFullscreen().catch(() => {});
    resetGame();
  }
};

input.onReset = () => {
  if (currentState.phase !== 'READY') {
    resetGame();
  }
};

// Render inicial para mostrar algo antes do primeiro input
renderer.draw(currentState);
loop.start();
