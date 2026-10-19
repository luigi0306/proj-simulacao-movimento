# Estudante: Luigi Calovi Fonini

# Simulador de Foguete 2D

Simulação física bidimensional de um foguete, feita em **TypeScript + HTML5 Canvas puro** (sem engines de física), empacotada com **Vite**. O objetivo do jogo é manter o foguete no ar pelo maior tempo possível, administrando um combustível finito. O jogo termina quando o foguete toca o chão, e a pontuação é o tempo de voo em segundos.

O foco do trabalho é o **laço de física** e a **aplicação correta dos vetores** (empuxo, peso, aceleração), e não os gráficos.

> **🔗 Repositório GitHub:** `<COLE AQUI O LINK DO REPOSITÓRIO>`

---

## 💻 Como Executar o Projeto (Guia para Windows)

O projeto foi construído com tecnologias web modernas (TypeScript + Vite) e roda em qualquer navegador moderno. Para executar o código-fonte, é necessário ter o ambiente **Node.js** instalado.

---

### 1️⃣ Pré-requisito: Node.js

#### Como verificar se você já tem o Node.js:

1. Pressione as teclas `Windows + R` no teclado, digite `cmd` e aperte **Enter** para abrir o Prompt de Comando.
2. Digite o comando:
   ```cmd
   node -v
   ```
3. Se exibir uma versão (ex: `v18.x.x`, `v20.x.x` ou superior), o Node.js já está pronto para uso. Prossiga para o passo seguinte.

#### Caso NÃO tenha o Node.js instalado (Passo a passo no Windows):

1. Acesse o site oficial: **[nodejs.org](https://nodejs.org/)**.
2. Baixe a versão recomendada rotulada como **LTS** (instalador `.msi` para Windows).
3. Abra o arquivo `.msi` baixado e clique em **Next** (Avançar) até a conclusão da instalação (pode manter as opções padrão).
4. Ao finalizar, **feche todas as janelas do terminal (Prompt de Comando ou PowerShell)** e abra uma nova janela para que o Windows reconheça o comando `node` e `npm`.

---

### 2️⃣ Como obter os arquivos do projeto

Escolha **uma** das opções abaixo:

#### 📁 Opção A: A partir do arquivo `entrega.zip` (Moodle / Envio)

1. Localize o arquivo `entrega.zip` que você recebeu.
2. Clique com o **botão direito** sobre o arquivo e escolha **"Extrair Tudo..."** (ou use programas como WinRAR / 7-Zip).
3. Abra a pasta resultante da descompactação.
4. **Dica prática no Windows:** Na barra de endereços superior do Explorador de Arquivos (onde mostra o caminho da pasta), clique com o mouse, digite `cmd` e pressione **Enter**. Isso abrirá o terminal diretamente dentro da pasta do projeto.

---

#### 🐙 Opção B: Clonando pelo Repositório GitHub

Se você tiver o `git` instalado e preferir clonar o código diretamente do repositório:

1. Abra o terminal (Prompt de Comando ou PowerShell).
2. Execute o comando de clonagem:
   ```bash
   git clone <COLE AQUI O LINK DO REPOSITÓRIO>
   ```
3. Acesse a pasta do projeto:
   ```bash
   cd proj-simulacao-movimento
   ```

---

### 3️⃣ Instalando dependências e iniciando o simulador

Com o terminal aberto dentro da pasta do projeto, execute os comandos:

1. **Baixar as dependências do projeto:**

   ```cmd
   npm install
   ```

   _(Este comando recria a pasta `node_modules` em poucos segundos, baixando as bibliotecas de desenvolvimento necessárias)._

2. **Iniciar o servidor de desenvolvimento:**

   ```cmd
   npm run dev
   ```

   _(O terminal exibirá uma mensagem indicando o endereço local, geralmente `http://localhost:5173/`)._

3. **Abrir no Navegador:**
   - Segure a tecla `Ctrl` e clique no link no terminal, ou abra seu navegador de preferência (Chrome, Edge, Firefox, Brave) e acesse:
     **`http://localhost:5173/`**
   - Dê um clique com o mouse na tela para **iniciar a simulação e ativar o modo de tela cheia**.

---

### 4️⃣ Como rodar os testes analíticos (Validação da Física no Terminal)

Se desejar validar as equações e o rigor matemático do motor de física sem depender da interface gráfica:

No mesmo terminal (ou em uma nova aba do terminal na mesma pasta), execute:

```cmd
npm run validate
```

O script testará 5 cenários físicos fundamentais e imprimirá no console a comparação entre os valores calculados numericamente no jogo e as fórmulas analíticas fechadas da Física (tempo exato de queda livre, conservação da 1ª lei de Newton, equação de foguetes de Tsiolkovsky e aceleração sob ângulos de 30°).

---

### 🛠️ Outros comandos úteis:

```cmd
npm run build        # Faz a checagem rigorosa de tipos TypeScript e compila o projeto
npm run pack         # Gera um novo arquivo entrega.zip limpo e otimizado para submissão
```

## 🎮 Controles

| Tecla                   | Ação                                                                         |
| ----------------------- | ---------------------------------------------------------------------------- |
| **Espaço** (segurar)    | Liga o motor: consome combustível e aplica o empuxo na direção do nariz      |
| **←** / **→** (segurar) | Inclina o empuxo em −30° / +30° em relação à vertical. Ao soltar, volta a 0° |
| **R**                   | Reinicia a simulação                                                         |

A primeira tecla ou clique inicia o jogo e entra em tela cheia (ver "Fullscreen" na seção de requisitos).

---

## ✅ Atendimento aos requisitos

| Requisito                                                           | Como foi atendido                                                                                                                                                                                                                                                               | Onde                                                 |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| **Δt = 1/60 s estrito**                                             | `DT = 1/60` é a única base de tempo da física. O laço usa um _acumulador_: `requestAnimationFrame` só acumula tempo real, e a física avança em passos de exatamente `DT`. Em monitores de 120/144 Hz a física continua a 60 passos/s. A física nunca lê o relógio do navegador. | `constants.ts`, `core/GameLoop.ts`                   |
| **g = 9,8 m/s²**                                                    | Peso `W = m·(0, −g)` com `g = 9,8`. Campo uniforme, apontando para o chão.                                                                                                                                                                                                      | `constants.ts`, `PhysicsSystem.ts`                   |
| **Massas em kg (SI)**                                               | Foguete vazio = 100 t = `100 000 kg`. Combustível = 100 t = `100 000 kg`. A massa total `m = M_dry + combustível` é **recalculada a cada frame**.                                                                                                                               | `constants.ts`, `PhysicsSystem.ts`                   |
| **Propulsão: 0,1 % do combustível inicial por frame e F = 2·10⁶ N** | Com a barra de espaço pressionada, cada frame queima `100 kg` (= 0,1 % de 100 000 kg) e aplica `2·10⁶ N` na direção do nariz. O combustível dura exatamente **1000 frames (16,67 s)**.                                                                                          | `constants.ts`, `PhysicsSystem.ts`                   |
| **Rotação ±30° em torno do centro de massa**                        | Seta pressionada define θ = ±30° em relação à vertical. Sem seta, θ = 0. O desenho gira em torno do centro de massa (marcado por um ponto preto no foguete).                                                                                                                    | `InputManager.ts`, `PhysicsSystem.ts`, `Renderer.ts` |
| **Início em tela cheia, foguete no ar**                             | O foguete inicia em `y₀ = 122,5 m`, em repouso. Tela cheia é ativada na primeira interação do usuário (limitação de segurança dos navegadores, ver nota abaixo).                                                                                                                | `constants.ts`, `main.ts`                            |
| **Score = tempo no ar até tocar o chão**                            | O score é o tempo simulado (contagem de passos × Δt) com **interpolação** dentro do último frame para achar o instante exato em que `y = 0`. Também é exibida a velocidade de impacto.                                                                                          | `PhysicsSystem.ts`                                   |
| **Arquitetura separada**                                            | Loop, física, input e renderização são módulos independentes. A física não conhece o Canvas nem o DOM.                                                                                                                                                                          | ver "Estrutura"                                      |
| **Vite + TS, README, `.gitignore`**                                 | Scaffolding Vite + TypeScript estrito. `.gitignore` exclui `node_modules/`, `dist/` e `entrega.zip`.                                                                                                                                                                            | raiz do projeto                                      |

> **Nota sobre fullscreen:** os navegadores só permitem `requestFullscreen()` após um gesto do usuário (clique ou tecla). Por isso o jogo mostra uma tela inicial e entra em tela cheia no primeiro clique/tecla. Se o navegador recusar, o jogo funciona normalmente em janela.

---

## 🧮 Modelo físico

### Convenções

- Unidades do SI. Eixo `y` para cima, chão em `y = 0`.
- θ = 0 aponta para cima. θ > 0 inclina para a direita.
- Estado: posição `(x, y)`, velocidade `(vx, vy)`, ângulo `θ`, combustível, tempo.

### Atualização de estado (uma vez por Δt = 1/60 s, nesta ordem)

1. **Ângulo:** `θ = ±30°` conforme a seta pressionada, ou `0`.
2. **Massa:** `m = M_dry + combustível`.
3. **Queima:** com espaço e combustível disponível, `queimado = min(100 kg, combustível)` e `throttle = queimado / 100`.
4. **Forças (vetoriais):**
   ```text
   T = F₀ · throttle · ( sin θ , cos θ )      (empuxo, na direção do nariz)
   W = m · ( 0 , −g )                          (peso)
   ΣF = T + W
   ```
5. **Aceleração (2ª lei de Newton):** `a = ΣF / m`, ou seja
   ```text
   aₓ = F₀·throttle·sin θ / m
   a_y = F₀·throttle·cos θ / m − g
   ```
6. **Cinemática exata do MRUV.** Como `a` é constante dentro de um frame, vale a equação exata, sem a aproximação de Euler:
   ```text
   x  ← x  + vₓ·Δt + ½·aₓ·Δt²        y  ← y  + v_y·Δt + ½·a_y·Δt²
   vₓ ← vₓ + aₓ·Δt                   v_y ← v_y + a_y·Δt
   ```
7. **Massa:** `combustível ← combustível − queimado`.
8. **Tempo:** `t ← t + Δt`.
9. **Chão:** se `y ≤ 0`, a simulação termina. O instante exato do toque é obtido por interpolação linear no último frame: `f = y_ant / (y_ant − y_novo)`, `score = t_ant + f·Δt`.

### Decisões de modelagem (onde o enunciado deixa margem)

- **Massa no frame:** a aceleração usa a massa **antes** da queima daquele frame. O combustível é descontado depois. O erro é de ordem Δt e aparece nos resultados da validação (0,12 %).
- **Último frame de combustível:** se restar menos de 100 kg, o empuxo é proporcional à quantidade queimada (`throttle < 1`), conservando a relação impulso/combustível.
- **Rotação:** o ângulo é uma **variável cinemática** definida pelo jogador (±30°). Não há torque nem momento de inércia, pois o enunciado fixa o ângulo. O centro de massa é tratado como o centro geométrico do desenho.
- **Sem resistência do ar:** o modelo só tem gravidade e empuxo, como no enunciado. O foguete se comporta como no vácuo.
- **Parede lateral (restrição de jogabilidade):** o centro de massa é limitado a `|x| ≤ 80 m`, com colisão inelástica (`vₓ` é zerado ao tocar). Serve só para o foguete nunca sair da tela. Não altera forças, massas nem acelerações. É a única regra do jogo que **não** vem do enunciado.
- **Interpolação visual:** o desenho interpola a posição entre dois passos físicos para ficar suave em telas de alta taxa. Isso é só visual e não afeta a física nem o score.

---

## 🔬 Validação numérica

`npm run validate` compara o motor com soluções analíticas. Resultados:

| Verificação                            | Simulado     | Teórico                        |
| -------------------------------------- | ------------ | ------------------------------ |
| Queda livre de 122,5 m: tempo          | 5,0000 s     | `√(2h/g)` = 5 s                |
| Queda livre: velocidade de impacto     | 49,0000 m/s  | `g·t` = 49 m/s                 |
| Queima total (θ = 0): frames de empuxo | 1000         | 100 000 kg ÷ 100 kg/frame      |
| Queima total: Δv                       | 67,63 m/s    | 67,72 m/s (equação do foguete) |
| θ = 30° no início: `a_y`               | −1,1397 m/s² | `F₀·cos30°/m − g`              |
| θ = 30° no início: `aₓ`                | +5,0000 m/s² | `F₀·sin30°/m`                  |
| Soltar a seta (sem empuxo): `vₓ`       | constante    | 1ª lei de Newton               |

Na queima total, a **equação do foguete** (Tsiolkovsky com gravidade) é `Δv = vₑ·ln(m₀/m_f) − g·t_b`. A velocidade efetiva de exaustão é `vₑ = F₀ / ṁ = 2·10⁶ / 6000 ≈ 333,3 m/s`, pois `ṁ = 100 kg × 60 = 6000 kg/s`. Isso dá `333,3·ln 2 − 9,8·16,67 ≈ 67,7 m/s`.

Como referência (não é o ótimo), uma queima contínua de 16,67 s seguida de queda livre leva o foguete a cerca de **699 m** de altitude máxima e **35,5 s** de tempo total no ar.

---

## 🔭 Fenômenos que podem ser observados no jogo

- **Razão empuxo/peso ≈ 1,02 no início.** `T/P = 2·10⁶ / (200 000 · 9,8)`. Mesmo com o espaço pressionado, o foguete mal consegue subir no começo (`a_y ≈ +0,2 m/s²`). Conforme a massa cai, a aceleração aumenta e chega a `≈ +10,2 m/s²` com o tanque vazio.
- **Inclinar atrapalha a subida.** Só a componente vertical `F₀·cos θ` sustenta o peso. Com θ = 30° no início, `a_y = −1,14 m/s²` e o foguete cai. Ele só volta a ganhar altura inclinado quando `m < F₀·cos30°/g ≈ 176,7 t`, depois de queimar ~23,3 t (≈ 3,9 s de empuxo contínuo). O HUD mostra `Emp.vert/Peso` para acompanhar isso.
- **Inércia horizontal.** A única força horizontal é `F₀·sin θ`. Ao soltar a seta, `aₓ = 0` e `vₓ` permanece constante (não há atrito). Para frear, é preciso inclinar para o lado oposto com o motor ligado.
- **Fim do combustível.** Depois de 1000 frames de empuxo, a massa fica em 100 t e o foguete passa a cair em queda livre com a velocidade e a direção que já tinha.

O HUD mostra tempo, altitude, `v` vertical e horizontal, `a` vertical, massa, combustível, ângulo, empuxo e `Emp.vert/Peso`. Uma seta no foguete indica o vetor velocidade e o indicador no topo diz se ele está subindo ou caindo.

---

## 📁 Estrutura

```text
src/
├── main.ts                  composição: input + física + renderer + loop
├── constants.ts             constantes do SI e parâmetros do jogo
├── types.ts                 RocketState, InputState
├── core/GameLoop.ts         requestAnimationFrame + passo fixo (acumulador)
├── physics/PhysicsSystem.ts força, massa, aceleração, integração, colisão (função pura)
├── input/InputManager.ts    estado do teclado
└── render/Renderer.ts       Canvas: câmera, cenário, foguete, vetor velocidade, HUD
scripts/validate-physics.ts  validação numérica (npm run validate)
```

A física (`PhysicsSystem.ts`) é uma função pura `physicsStep(estado, entrada) → novo estado`, sem dependência de DOM ou Canvas. Por isso ela é testável isoladamente, como faz o `validate`.
