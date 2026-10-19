export const DT = 1 / 60; // 60 updates por segundo estrito (segundos)
export const G = 9.8; // Gravidade na Terra (m/s^2)

export const M_DRY = 100_000; // Massa seca do foguete (kg)
export const M_FUEL0 = 100_000; // Massa de combustível inicial (kg)

// O foguete queima 0,1% da massa inicial por frame. 
// 0.1% de 100_000 kg = 100 kg por frame
export const BURN_RATE_PER_FRAME = 100; // kg/frame

export const F0 = 2_000_000; // Força de propulsão (N)

// Ângulo de rotação (radianos)
export const ROTATION_ANGLE = 30 * (Math.PI / 180);

// Altura inicial calculada para uma queda livre de exatos 5 segundos
// y = 1/2 * g * t^2 = 0.5 * 9.8 * 25 = 122.5 metros
export const INITIAL_HEIGHT = 122.5; 

// Limite horizontal da arena (m): o centro de massa do foguete não ultrapassa |x| = X_LIMIT.
// É uma restrição de jogabilidade (parede inelástica: ao tocar, vx = 0) para manter o
// foguete sempre visível na tela. Não altera nenhuma força, massa ou aceleração.
export const X_LIMIT = 80;
