import { RocketState } from '../types';
import { F0, G, M_FUEL0, X_LIMIT } from '../constants';

// Dimensões VISUAIS do foguete (m). Não participam da física.
const ROCKET_W = 8;
const ROCKET_H = 24;

// Parede desenhada logo além do limite do centro de massa, para o corpo encostar nela.
const WALL_X = X_LIMIT + ROCKET_W / 2;

// Altitude (m) em que o céu fica totalmente escuro.
const SPACE_ALTITUDE = 2000;

function hash(n: number): number {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

function mixRgb(a: number[], b: number[], t: number): string {
  const c = a.map((v, i) => Math.round(v + (b[i] - v) * t));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private width = 0;
  private height = 0;
  private dpr = 1;

  // Escala de visualização (pixels por metro): calculada para (1) mostrar ~120 m na
  // vertical, o que deixa o movimento bem perceptível, e (2) caber a arena inteira na largura.
  private ppm = 8;

  // Câmera (m): segue o foguete na vertical; na horizontal a arena é fixa e centrada.
  private camY = 0;

  constructor(private canvas: HTMLCanvasElement) {
    this.ctx = this.canvas.getContext('2d')!;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  private resize() {
    this.dpr = window.devicePixelRatio || 1;
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;

    const byHeight = this.height / 120;
    const byWidth = (this.width / 2 - 70) / WALL_X;
    this.ppm = Math.max(1, Math.min(byHeight, byWidth));
  }

  // Conversão mundo (m, y para cima) -> tela (px, y para baixo)
  private sx(xw: number): number {
    return this.width / 2 + xw * this.ppm;
  }
  private sy(yw: number): number {
    return this.height / 2 - (yw - this.camY) * this.ppm;
  }

  public draw(state: RocketState) {
    const ctx = this.ctx;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, this.width, this.height);

    this.camY = state.y;
    const visibleHalf = this.height / 2 / this.ppm;

    this.drawSky();
    this.drawStars(visibleHalf);
    this.drawClouds(visibleHalf);
    this.drawGuides(visibleHalf);
    this.drawGround();
    this.drawWalls();
    this.drawRocket(state);
    this.drawVelocityVector(state);
    this.drawRuler(visibleHalf);
    this.drawVerticalIndicator(state);
    this.drawHUD(state);
  }

  private spaceFactor(): number {
    return clamp(this.camY / SPACE_ALTITUDE, 0, 1);
  }

  private drawSky() {
    const t = this.spaceFactor();
    const low = [120, 196, 240];
    const high = [4, 6, 24];
    const grad = this.ctx.createLinearGradient(0, 0, 0, this.height);
    grad.addColorStop(0, mixRgb(low, high, clamp(t + 0.25, 0, 1)));
    grad.addColorStop(1, mixRgb(low, high, t));
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  // Estrelas em posições fixas do mundo (referência de movimento em grandes altitudes).
  private drawStars(visibleHalf: number) {
    const t = this.spaceFactor();
    if (t < 0.15) return;
    const ctx = this.ctx;
    ctx.fillStyle = `rgba(255,255,255,${clamp(t * 1.2, 0, 0.9)})`;
    const cell = 12;
    const k0 = Math.floor((this.camY - visibleHalf) / cell);
    const k1 = Math.ceil((this.camY + visibleHalf) / cell);
    for (let k = k0; k <= k1; k++) {
      const x = (hash(k) * 2 - 1) * WALL_X;
      const y = k * cell + hash(k + 51) * cell;
      const r = 0.8 + hash(k + 7) * 1.4;
      ctx.beginPath();
      ctx.arc(this.sx(x), this.sy(y), r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Nuvens em posições fixas do mundo: ao subir/descer elas rolam na tela e mostram o sentido.
  private drawClouds(visibleHalf: number) {
    const t = this.spaceFactor();
    if (t > 0.9) return;
    const ctx = this.ctx;
    const band = 45;
    const k0 = Math.max(0, Math.floor((this.camY - visibleHalf) / band) - 1);
    const k1 = Math.ceil((this.camY + visibleHalf) / band);
    ctx.fillStyle = `rgba(255,255,255,${0.8 * (1 - t)})`;
    for (let k = k0; k <= k1; k++) {
      for (let j = 0; j < 2; j++) {
        const seed = k * 2 + j;
        const x = (hash(seed + 3) * 2 - 1) * WALL_X * 1.05;
        const y = k * band + hash(seed + 99) * band + 15;
        const w = (14 + hash(seed + 17) * 22) * this.ppm;
        const px = this.sx(x);
        const py = this.sy(y);
        ctx.beginPath();
        ctx.ellipse(px, py, w / 2, w / 6, 0, 0, Math.PI * 2);
        ctx.ellipse(px - w * 0.2, py - w * 0.08, w / 4, w / 8, 0, 0, Math.PI * 2);
        ctx.ellipse(px + w * 0.18, py - w * 0.1, w / 3.4, w / 8, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // Linhas horizontais tracejadas a cada 25 m (50 m = mais fortes).
  private drawGuides(visibleHalf: number) {
    const ctx = this.ctx;
    const step = 25;
    const k0 = Math.max(0, Math.floor((this.camY - visibleHalf) / step));
    const k1 = Math.ceil((this.camY + visibleHalf) / step);
    ctx.save();
    ctx.setLineDash([10, 10]);
    ctx.lineWidth = 1;
    for (let k = k0; k <= k1; k++) {
      const major = k % 2 === 0;
      ctx.strokeStyle = major ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.12)';
      const y = this.sy(k * step);
      ctx.beginPath();
      ctx.moveTo(this.sx(-WALL_X), y);
      ctx.lineTo(this.sx(WALL_X), y);
      ctx.stroke();
    }
    ctx.restore();
  }

  private drawGround() {
    const gy = this.sy(0);
    if (gy > this.height) return;
    const ctx = this.ctx;
    ctx.fillStyle = '#3f7d3a';
    ctx.fillRect(0, gy, this.width, this.height - gy + 1);
    ctx.fillStyle = '#2b5a28';
    ctx.fillRect(0, gy, this.width, Math.max(3, this.ppm * 0.6));
  }

  // Paredes laterais da arena: o foguete não passa delas.
  private drawWalls() {
    const ctx = this.ctx;
    const left = this.sx(-WALL_X);
    const right = this.sx(WALL_X);
    ctx.fillStyle = 'rgba(255, 70, 70, 0.14)';
    ctx.fillRect(0, 0, left, this.height);
    ctx.fillRect(right, 0, this.width - right, this.height);
    ctx.strokeStyle = 'rgba(255, 110, 90, 0.9)';
    ctx.lineWidth = 3;
    ctx.shadowColor = 'rgba(255, 90, 70, 0.9)';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.moveTo(left, 0);
    ctx.lineTo(left, this.height);
    ctx.moveTo(right, 0);
    ctx.lineTo(right, this.height);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  private drawRocket(state: RocketState) {
    const ctx = this.ctx;
    ctx.save();

    // Origem no centro de massa (posição do estado); gira em torno dele.
    ctx.translate(this.sx(state.x), this.sy(state.y));
    ctx.rotate(state.theta); // canvas: positivo = horário na tela = inclina para a direita
    ctx.scale(this.ppm, -this.ppm); // a partir daqui: metros, y para cima

    const hw = ROCKET_W / 2;
    const hh = ROCKET_H / 2;

    // Chama (proporcional ao empuxo aplicado no frame)
    const throttle = state.currentThrust / F0;
    if (throttle > 0) {
      const len = (12 + Math.random() * 7) * throttle;
      ctx.fillStyle = '#ff8a1f';
      ctx.beginPath();
      ctx.moveTo(-hw * 0.8, -hh);
      ctx.lineTo(hw * 0.8, -hh);
      ctx.lineTo(0, -hh - len);
      ctx.fill();
      ctx.fillStyle = '#ffe36b';
      ctx.beginPath();
      ctx.moveTo(-hw * 0.4, -hh);
      ctx.lineTo(hw * 0.4, -hh);
      ctx.lineTo(0, -hh - len * 0.6);
      ctx.fill();
    }

    // Aletas
    ctx.fillStyle = '#d9382c';
    ctx.beginPath();
    ctx.moveTo(-hw, -hh);
    ctx.lineTo(-hw - 3.5, -hh - 3.5);
    ctx.lineTo(-hw, -hh + 6);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(hw, -hh);
    ctx.lineTo(hw + 3.5, -hh - 3.5);
    ctx.lineTo(hw, -hh + 6);
    ctx.fill();

    // Corpo
    ctx.fillStyle = '#e8ecf1';
    ctx.fillRect(-hw, -hh, ROCKET_W, ROCKET_H);

    // Janela
    ctx.fillStyle = '#4aa8ff';
    ctx.beginPath();
    ctx.arc(0, hh * 0.35, hw * 0.45, 0, Math.PI * 2);
    ctx.fill();

    // Nariz (aponta para a direção do empuxo)
    ctx.fillStyle = '#d9382c';
    ctx.beginPath();
    ctx.moveTo(-hw, hh);
    ctx.lineTo(hw, hh);
    ctx.lineTo(0, hh + 8);
    ctx.fill();

    ctx.restore();

    // Marcador do centro de massa
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(this.sx(state.x), this.sy(state.y), 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Seta do vetor velocidade (verde = subindo, vermelho = caindo).
  private drawVelocityVector(state: RocketState) {
    if (state.phase === 'LANDED') return;
    const speed = Math.hypot(state.vx, state.vy);
    if (speed < 0.5) return;
    const ctx = this.ctx;
    const scale = 2.2; // px por (m/s)
    const len = Math.min(speed * scale, this.height * 0.35);
    const ux = state.vx / speed;
    const uy = -state.vy / speed; // tela: y para baixo
    const x0 = this.sx(state.x);
    const y0 = this.sy(state.y);
    const x1 = x0 + ux * len;
    const y1 = y0 + uy * len;
    const color = state.vy >= 0 ? '#3ddc84' : '#ff5252';
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    const ang = Math.atan2(y1 - y0, x1 - x0);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x1 - 14 * Math.cos(ang - 0.4), y1 - 14 * Math.sin(ang - 0.4));
    ctx.lineTo(x1 - 14 * Math.cos(ang + 0.4), y1 - 14 * Math.sin(ang + 0.4));
    ctx.fill();
  }

  // Régua de altitude na borda direita (rola junto com a câmera).
  private drawRuler(visibleHalf: number) {
    const ctx = this.ctx;
    const step = 10;
    const k0 = Math.max(0, Math.floor((this.camY - visibleHalf) / step));
    const k1 = Math.ceil((this.camY + visibleHalf) / step);
    const x = this.width - 14;
    ctx.font = '13px monospace';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let k = k0; k <= k1; k++) {
      const alt = k * step;
      const y = this.sy(alt);
      const major = alt % 50 === 0;
      ctx.strokeStyle = 'rgba(255,255,255,0.85)';
      ctx.lineWidth = major ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - (major ? 18 : 9), y);
      ctx.stroke();
      if (major) {
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = 'rgba(0,0,0,0.6)';
        ctx.lineWidth = 3;
        ctx.strokeText(`${alt} m`, x - 24, y);
        ctx.fillText(`${alt} m`, x - 24, y);
      }
    }
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
  }

  // Indicador grande SUBINDO / CAINDO no topo da tela.
  private drawVerticalIndicator(state: RocketState) {
    if (state.phase !== 'RUNNING') return;
    const rising = state.vy >= 0;
    const ctx = this.ctx;
    const text = `${rising ? '▲ SUBINDO' : '▼ CAINDO'}  ${state.vy >= 0 ? '+' : ''}${state.vy.toFixed(1)} m/s`;
    ctx.font = 'bold 28px monospace';
    ctx.textAlign = 'center';
    const w = ctx.measureText(text).width + 40;
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(this.width / 2 - w / 2, 16, w, 48);
    ctx.fillStyle = rising ? '#3ddc84' : '#ff5252';
    ctx.fillText(text, this.width / 2, 49);
    ctx.textAlign = 'left';
  }

  private drawHUD(state: RocketState) {
    const ctx = this.ctx;
    const x = 22;
    let y = 36;
    const lh = 21;

    const m = state.currentMass;
    const cosT = Math.cos(state.theta);
    // Razão empuxo vertical (máximo) / peso, com a massa atual: > 1 permite subir
    const verticalTwr = (F0 * cosT) / (m * G);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(10, 10, 300, 288);

    ctx.font = '14px monospace';
    const line = (label: string, value: string, color = '#fff') => {
      ctx.fillStyle = 'rgba(255,255,255,0.65)';
      ctx.fillText(label, x, y);
      ctx.fillStyle = color;
      ctx.fillText(value, x + 128, y);
      y += lh;
    };

    line('Tempo', `${state.time.toFixed(2)} s`);
    line('Altitude', `${state.y.toFixed(1)} m`);
    line('v vertical', `${state.vy.toFixed(1)} m/s`, state.vy >= 0 ? '#3ddc84' : '#ff5252');
    line('v horizontal', `${state.vx.toFixed(1)} m/s`);
    line('a vertical', `${state.ay.toFixed(2)} m/s²`, state.ay >= 0 ? '#3ddc84' : '#ff5252');
    line('Massa total', `${m.toFixed(0)} kg`);
    line('Combustível', `${state.fuel.toFixed(0)} kg`);
    line('Ângulo', `${((state.theta * 180) / Math.PI).toFixed(0)}°`);
    line('Empuxo', `${(state.currentThrust / 1000).toFixed(0)} kN`);
    line('Emp.vert/Peso', verticalTwr.toFixed(3), verticalTwr > 1 ? '#3ddc84' : '#ff5252');

    // Barra de combustível
    const frac = clamp(state.fuel / M_FUEL0, 0, 1);
    const bx = x;
    const by = y - 6;
    const bw = 270;
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillRect(bx, by, bw, 14);
    ctx.fillStyle = frac > 0.25 ? '#ffb300' : '#ff5252';
    ctx.fillRect(bx, by, bw * frac, 14);
    ctx.fillStyle = '#fff';
    ctx.font = '11px monospace';
    ctx.fillText(`${(frac * 100).toFixed(1)}%`, bx + 4, by + 11);
  }
}
