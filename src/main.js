// ---------------------------------------------------------------------------
// Paleta
// ---------------------------------------------------------------------------
const COR = {
  fundo:       0x0d2818,
  card:        0x1b4332,
  borda:       0x2d6a4f,
  primario:    0x52b788,
  textoPrinc:  '#d8f3dc',
  textoSec:    '#74c69d',
  alerta:      '#e76f51',
  fundoEscuro: '#0d2818',
};

// ---------------------------------------------------------------------------
// Estado global
// ---------------------------------------------------------------------------
const dadosJogo = {
  nome: '',
  ong:  '',
  dificuldade: '',
  saldo: 0,
};

// ---------------------------------------------------------------------------
// Helpers visuais
// ---------------------------------------------------------------------------
function addFundo(scene) {
  const { width, height } = scene.scale;
  scene.add.rectangle(width / 2, height / 2, width, height, COR.fundo);
}

function addCard(scene, cx, cy, w, h) {
  const g = scene.add.graphics();
  g.fillStyle(COR.card, 1);
  g.fillRoundedRect(cx - w / 2, cy - h / 2, w, h, 8);
  g.lineStyle(1.5, COR.borda, 1);
  g.strokeRoundedRect(cx - w / 2, cy - h / 2, w, h, 8);
  return g;
}

function addBotao(scene, cx, cy, w, h, label, corFundo, corTexto) {
  corFundo = corFundo ?? COR.primario;
  corTexto = corTexto ?? COR.fundo;

  const g = scene.add.graphics();
  const desenha = (alpha) => {
    g.clear();
    g.fillStyle(corFundo, alpha);
    g.fillRoundedRect(cx - w / 2, cy - h / 2, w, h, 8);
  };
  desenha(1);

  const zona = scene.add.zone(cx, cy, w, h).setInteractive({ useHandCursor: true });
  zona.on('pointerover',  () => desenha(0.78));
  zona.on('pointerout',   () => desenha(1));

  scene.add.text(cx, cy, label, {
    fontSize: '17px',
    color: typeof corTexto === 'string' ? corTexto : '#0d2818',
    fontFamily: 'Inter, sans-serif',
    fontStyle: 'bold',
  }).setOrigin(0.5);

  return zona;
}

function addTitulo(scene, cx, cy, txt) {
  return scene.add.text(cx, cy, txt, {
    fontSize: '32px',
    color: COR.textoPrinc,
    fontFamily: 'Inter, sans-serif',
    fontStyle: 'bold',
  }).setOrigin(0.5);
}

function addSubtitulo(scene, cx, cy, txt) {
  return scene.add.text(cx, cy, txt.toUpperCase(), {
    fontSize: '14px',
    color: COR.textoSec,
    fontFamily: 'Inter, sans-serif',
    letterSpacing: 2,
  }).setOrigin(0.5);
}

// ---------------------------------------------------------------------------
// TelaInicial
// ---------------------------------------------------------------------------
class TelaInicial extends Phaser.Scene {
  constructor() { super({ key: 'TelaInicial' }); }

  create() {
    const { width, height } = this.scale;
    addFundo(this);

    addCard(this, width / 2, height / 2, 560, 240);

    addTitulo(this, width / 2, height / 2 - 50, 'Floresta em Jogo');

    addSubtitulo(this, width / 2, height / 2 + 10, 'Restauração florestal na Amazônia');

    this.add.text(width / 2, height / 2 + 70, 'Clique para começar', {
      fontSize: '14px',
      color: COR.textoSec,
      fontFamily: 'Inter, sans-serif',
    }).setOrigin(0.5).setAlpha(0.6);

    this.input.once('pointerdown', () => this.scene.start('Onboarding1'));
  }
}

// ---------------------------------------------------------------------------
// Onboarding1 — nome e ONG
// ---------------------------------------------------------------------------
class Onboarding1 extends Phaser.Scene {
  constructor() {
    super({ key: 'Onboarding1' });
    this._els = [];
  }

  create() {
    const { width, height } = this.scale;
    addFundo(this);
    addCard(this, width / 2, height / 2 - 20, 560, 420);

    addTitulo(this, width / 2, height / 2 - 185, 'Vamos começar');

    const canvas = this.sys.game.canvas;
    const rect   = canvas.getBoundingClientRect();
    const sx     = rect.width  / width;
    const sy     = rect.height / height;

    const criarLabel = (txt, y) => {
      this.add.text(width / 2 - 220, y, txt, {
        fontSize: '13px',
        color: COR.textoSec,
        fontFamily: 'Inter, sans-serif',
      });
    };

    const criarInput = (placeholder, y) => {
      const el = document.createElement('input');
      el.type        = 'text';
      el.placeholder = placeholder;
      el.style.cssText = `
        position: fixed;
        left:     ${rect.left + (width / 2 - 220) * sx}px;
        top:      ${rect.top  + y * sy}px;
        width:    ${440 * sx}px;
        height:   ${48 * sy}px;
        font-size: ${15 * sy}px;
        font-family: Inter, sans-serif;
        padding: 0 ${14 * sx}px;
        border: 1.5px solid #2d6a4f;
        border-radius: 6px;
        background: #0d2818;
        color: #d8f3dc;
        outline: none;
      `;
      el.addEventListener('focus', () => el.style.borderColor = '#52b788');
      el.addEventListener('blur',  () => el.style.borderColor = '#2d6a4f');
      document.body.appendChild(el);
      this._els.push(el);
      return el;
    };

    criarLabel('Qual é o seu nome?', height / 2 - 115);
    const inputNome = criarInput('Digite seu nome', height / 2 - 95);

    criarLabel('Qual é o nome da sua ONG?', height / 2 - 15);
    const inputOng  = criarInput('Digite o nome da ONG', height / 2 + 5);

    // Botão Continuar
    const btnG = this.add.graphics();
    const btnY = height / 2 + 145;
    const btnW = 220, btnH = 48;

    const desenhaBtn = (ativo) => {
      btnG.clear();
      btnG.fillStyle(COR.primario, ativo ? 1 : 0.25);
      btnG.fillRoundedRect(width / 2 - btnW / 2, btnY - btnH / 2, btnW, btnH, 8);
    };
    desenhaBtn(false);

    const btnZona = this.add.zone(width / 2, btnY, btnW, btnH);
    const btnTxt  = this.add.text(width / 2, btnY, 'Continuar', {
      fontSize: '17px',
      color: '#0d2818',
      fontFamily: 'Inter, sans-serif',
      fontStyle: 'bold',
    }).setOrigin(0.5).setAlpha(0.35);

    let ativo = false;

    const verificar = () => {
      const ok = inputNome.value.trim() !== '' && inputOng.value.trim() !== '';
      if (ok === ativo) return;
      ativo = ok;
      desenhaBtn(ok);
      btnTxt.setAlpha(ok ? 1 : 0.35);
      if (ok) {
        btnZona.setInteractive({ useHandCursor: true });
        btnG.setInteractive(new Phaser.Geom.Rectangle(
          width / 2 - btnW / 2, btnY - btnH / 2, btnW, btnH
        ), Phaser.Geom.Rectangle.Contains);
      } else {
        btnZona.disableInteractive();
      }
    };

    inputNome.addEventListener('input', verificar);
    inputOng.addEventListener('input',  verificar);

    btnZona.on('pointerover',  () => { if (ativo) desenhaBtn(false); });
    btnZona.on('pointerout',   () => { if (ativo) desenhaBtn(true); });
    btnZona.on('pointerdown',  () => {
      if (!ativo) return;
      dadosJogo.nome = inputNome.value.trim();
      dadosJogo.ong  = inputOng.value.trim();
      this._limpar();
      this.scene.start('Onboarding2');
    });

    this.events.once('shutdown', () => this._limpar());
  }

  _limpar() {
    this._els.forEach(el => el.remove());
    this._els = [];
  }
}

// ---------------------------------------------------------------------------
// Onboarding2 — dificuldade
// ---------------------------------------------------------------------------
class Onboarding2 extends Phaser.Scene {
  constructor() { super({ key: 'Onboarding2' }); }

  create() {
    const { width, height } = this.scale;
    addFundo(this);

    addTitulo(this, width / 2, 90, 'Escolha a dificuldade');
    addSubtitulo(this, width / 2, 135, 'Selecione o nível de desafio');

    const opcoes = [
      { label: 'Fácil',   saldo: 1200000, recomendado: false },
      { label: 'Médio',   saldo: 1000000, recomendado: true  },
      { label: 'Difícil', saldo:  800000, recomendado: false },
    ];

    const btnW = 400, btnH = 80, gap = 20;
    const totalH = opcoes.length * btnH + (opcoes.length - 1) * gap;
    let y = height / 2 - totalH / 2 + btnH / 2 + 20;

    opcoes.forEach(({ label, saldo, recomendado }) => {
      const cy      = y;   // captura o valor atual — evita closure-em-loop
      const eDificil = label === 'Difícil';
      const corSaldo = eDificil ? COR.alerta : COR.textoSec;
      const bordaCor = recomendado ? 0x52b788 : COR.borda;

      const g = this.add.graphics();

      const desenha = (hover) => {
        g.clear();
        g.fillStyle(hover ? 0x22543d : COR.card, 1);
        g.fillRoundedRect(width / 2 - btnW / 2, cy - btnH / 2, btnW, btnH, 8);
        g.lineStyle(2, bordaCor, 1);
        g.strokeRoundedRect(width / 2 - btnW / 2, cy - btnH / 2, btnW, btnH, 8);
      };
      desenha(false);

      // Badge RECOMENDADO — dentro do card, centralizado acima do texto
      if (recomendado) {
        this.add.text(width / 2, cy - 22, 'RECOMENDADO', {
          fontSize: '10px',
          color: '#0d2818',
          fontFamily: 'Inter, sans-serif',
          fontStyle: 'bold',
          backgroundColor: '#52b788',
          padding: { x: 7, y: 3 },
        }).setOrigin(0.5);
      }

      // Label da dificuldade
      const labelY = recomendado ? cy + 4 : cy - 10;
      this.add.text(width / 2, labelY, label, {
        fontSize: '20px',
        color: COR.textoPrinc,
        fontFamily: 'Inter, sans-serif',
        fontStyle: 'bold',
      }).setOrigin(0.5);

      // Saldo
      this.add.text(width / 2, labelY + 24, `R$ ${saldo.toLocaleString('pt-BR')}`, {
        fontSize: '14px',
        color: corSaldo,
        fontFamily: 'Inter, sans-serif',
      }).setOrigin(0.5);

      const zona = this.add.zone(width / 2, cy, btnW, btnH)
        .setInteractive({ useHandCursor: true });
      zona.on('pointerover',  () => desenha(true));
      zona.on('pointerout',   () => desenha(false));
      zona.on('pointerdown',  () => {
        dadosJogo.dificuldade = label;
        dadosJogo.saldo       = saldo;
        this.scene.start('Onboarding3');
      });

      y += btnH + gap;
    });
  }
}

// ---------------------------------------------------------------------------
// Onboarding3 — briefing
// ---------------------------------------------------------------------------
class Onboarding3 extends Phaser.Scene {
  constructor() { super({ key: 'Onboarding3' }); }

  create() {
    const { width, height } = this.scale;
    addFundo(this);
    addCard(this, width / 2, height / 2 - 20, 700, 440);

    // Nome da ONG
    this.add.text(width / 2, height / 2 - 185, dadosJogo.ong.toUpperCase(), {
      fontSize: '13px',
      color: COR.textoSec,
      fontFamily: 'Inter, sans-serif',
      letterSpacing: 2,
    }).setOrigin(0.5);

    // Divisor
    const div = this.add.graphics();
    div.lineStyle(1, COR.borda, 0.8);
    div.lineBetween(width / 2 - 280, height / 2 - 165, width / 2 + 280, height / 2 - 165);

    const briefing =
      'Seu objetivo é restaurar esse território da Amazônia.\n\n' +
      'Você e sua ONG acabam de conseguir um recurso para essa restauração.\n\n' +
      'Agora cabe a você elaborar as estratégias e parcerias necessárias.\n\n' +
      'Boa sorte.';

    this.add.text(width / 2, height / 2 - 30, briefing, {
      fontSize: '18px',
      color: COR.textoPrinc,
      fontFamily: 'Inter, sans-serif',
      align: 'center',
      lineSpacing: 6,
      wordWrap: { width: 620 },
    }).setOrigin(0.5);

    // Botão Começar
    const btnY = height / 2 + 175;
    const btnW = 220, btnH = 48;
    const btnG = this.add.graphics();
    const desenha = (hover) => {
      btnG.clear();
      btnG.fillStyle(COR.primario, hover ? 0.78 : 1);
      btnG.fillRoundedRect(width / 2 - btnW / 2, btnY - btnH / 2, btnW, btnH, 8);
    };
    desenha(false);

    const zona = this.add.zone(width / 2, btnY, btnW, btnH)
      .setInteractive({ useHandCursor: true });
    zona.on('pointerover',  () => desenha(true));
    zona.on('pointerout',   () => desenha(false));
    zona.on('pointerdown',  () => this.scene.start('Jogo'));

    this.add.text(width / 2, btnY, 'Começar', {
      fontSize: '17px',
      color: '#0d2818',
      fontFamily: 'Inter, sans-serif',
      fontStyle: 'bold',
    }).setOrigin(0.5);
  }
}

// ---------------------------------------------------------------------------
// Tipos de terreno
// ---------------------------------------------------------------------------
const TIPOS = {
  solo:     { label: 'Solo degradado',      emoji: '🟫', cor: 0x8B6914, hex: '#8B6914' },
  garimpo:  { label: 'Garimpo',             emoji: '⛏️',  cor: 0x6B6B6B, hex: '#6B6B6B' },
  nascente: { label: 'Nascente degradada',  emoji: '💧', cor: 0x4A90D9, hex: '#4A90D9' },
  queimada: { label: 'Queimada',            emoji: '🔥', cor: 0xC1440E, hex: '#C1440E' },
  indigena: { label: 'Área indígena',       emoji: '🪶', cor: 0x7B4FA6, hex: '#7B4FA6' },
  pecuaria: { label: 'Pecuária/Soja',       emoji: '🐄', cor: 0xC8A951, hex: '#C8A951' },
  floresta: { label: 'Floresta estabelecida', emoji: '🌳', cor: 0x52b788, hex: '#52b788' },
};

const DISTRIBUICAO = {
  'Fácil':   { solo: 12, garimpo: 1, nascente: 2, queimada: 1, indigena: 1, pecuaria: 2, floresta: 3 },
  'Médio':   { solo: 10, garimpo: 2, nascente: 2, queimada: 2, indigena: 1, pecuaria: 3, floresta: 1 },
  'Difícil': { solo:  8, garimpo: 4, nascente: 3, queimada: 3, indigena: 2, pecuaria: 4, floresta: 0 },
};

function gerarTipos(dificuldade) {
  const dist = DISTRIBUICAO[dificuldade] ?? DISTRIBUICAO['Médio'];
  const lista = [];

  // Adiciona os tipos especificados
  for (const [tipo, qtd] of Object.entries(dist)) {
    for (let i = 0; i < qtd; i++) lista.push(tipo);
  }

  // Completa até 30 com solo degradado se necessário
  while (lista.length < 30) lista.push('solo');

  // Embaralha (Fisher-Yates)
  for (let i = lista.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [lista[i], lista[j]] = [lista[j], lista[i]];
  }

  return lista;
}

// ---------------------------------------------------------------------------
// Jogo — mapa hexagonal (pointy-top) com tipos de terreno
// ---------------------------------------------------------------------------
class Jogo extends Phaser.Scene {
  constructor() { super({ key: 'Jogo' }); }

  create() {
    const { width, height } = this.scale;
    addFundo(this);

    const R       = 36;
    const COLS    = 6;
    const ROWS    = 5;                    // 6×5 = 30 hexágonos
    const colStep = R * Math.sqrt(3);    // ~62.4 px — espaçamento horizontal
    const rowStep = R * 1.5;             //  54 px — espaçamento vertical

    const tipos = gerarTipos(dadosJogo.dificuldade);
    this.hexagonos = [];

    // Centros da grade (pointy-top, linhas ímpares deslocadas)
    const hexes = [];
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        hexes.push({
          x: col * colStep + (row % 2 === 1 ? colStep / 2 : 0),
          y: row * rowStep,
          row,
          col,
        });
      }
    }

    // Bounding box → offset de centralização
    const xs    = hexes.map(h => h.x);
    const ys    = hexes.map(h => h.y);
    const halfW = R * Math.sqrt(3) / 2;
    const gridW = Math.max(...xs) - Math.min(...xs) + R * Math.sqrt(3);
    const gridH = Math.max(...ys) - Math.min(...ys) + R * 2;
    const offX  = (width  - gridW) / 2 + halfW - Math.min(...xs);
    const offY  = (height - gridH) / 2 + R     - Math.min(...ys);

    const g = this.add.graphics();

    hexes.forEach(({ x, y, row, col }, idx) => {
      const tipo  = tipos[idx];
      const info  = TIPOS[tipo];
      const cx    = x + offX;
      const cy    = y + offY;

      // Vértices pointy-top: 30°, 90°, 150°, 210°, 270°, 330°
      const pts = Array.from({ length: 6 }, (_, i) => {
        const a = Math.PI / 6 + (Math.PI / 3) * i;
        return { x: cx + R * Math.cos(a), y: cy + R * Math.sin(a) };
      });

      // Preenchimento com cor do tipo
      g.fillStyle(info.cor, 1);
      g.beginPath();
      g.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < 6; i++) g.lineTo(pts[i].x, pts[i].y);
      g.closePath();
      g.fillPath();

      // Borda
      g.lineStyle(2, 0x2d6a4f, 1);
      g.beginPath();
      g.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < 6; i++) g.lineTo(pts[i].x, pts[i].y);
      g.closePath();
      g.strokePath();

      // Emoji centralizado
      this.add.text(cx, cy, info.emoji, {
        fontSize: '20px',
        fontFamily: 'sans-serif',
      }).setOrigin(0.5);

      // Armazena dados para uso futuro
      this.hexagonos.push({ tipo, info, row, col, cx, cy });
    });
  }
}

// ---------------------------------------------------------------------------
// Config Phaser
// ---------------------------------------------------------------------------
const config = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  backgroundColor: '#0d2818',
  scene: [TelaInicial, Onboarding1, Onboarding2, Onboarding3, Jogo],
};

new Phaser.Game(config);
