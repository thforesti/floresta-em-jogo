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
// Modo dev — detecta ?dev=1 na URL
// ---------------------------------------------------------------------------
const DEV_MODE = new URLSearchParams(window.location.search).get('dev') === '1';

function ativarDevMode() {
  dadosJogo.nome        = 'Dev';
  dadosJogo.ong         = 'ONG Teste';
  dadosJogo.dificuldade = 'medio';
  dadosJogo.saldo       = 1000000;
  estadoJogo.dinheiro   = 1000000;
  estadoJogo.mudas      = 500;
}

// ---------------------------------------------------------------------------
// TelaInicial
// ---------------------------------------------------------------------------
class TelaInicial extends Phaser.Scene {
  constructor() { super({ key: 'TelaInicial' }); }

  create() {
    if (DEV_MODE) {
      ativarDevMode();
      this.scene.start('Jogo');
      return;
    }

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
  solo:              { label: 'Solo degradado',        emoji: '🟫', cor: 0x8B6914, hex: '#8B6914' },
  garimpo:           { label: 'Garimpo',               emoji: '⛏️',  cor: 0x6B6B6B, hex: '#6B6B6B' },
  nascente:          { label: 'Nascente degradada',    emoji: '💧', cor: 0x4A90D9, hex: '#4A90D9' },
  queimada:          { label: 'Queimada',              emoji: '🔥', cor: 0xC1440E, hex: '#C1440E' },
  indigena:          { label: 'Área indígena',         emoji: '🪶', cor: 0x7B4FA6, hex: '#7B4FA6' },
  pecuaria:          { label: 'Pecuária/Soja',         emoji: '🐄', cor: 0xC8A951, hex: '#C8A951' },
  floresta:          { label: 'Floresta estabelecida', emoji: '🌳', cor: 0x52b788, hex: '#52b788' },
  solo_preparado:    { label: 'Solo Preparado',        emoji: '⛏️',  cor: 0x5C4A1E, hex: '#5C4A1E' },
  floresta_pioneira: { label: 'Floresta Pioneira',     emoji: '🌿', cor: 0x74c69d, hex: '#74c69d' },
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
// Estado global do jogo
// ---------------------------------------------------------------------------
const estadoJogo = {
  dinheiro: 0,
  agua:     null,
  equipe:   [],
  mudas:    0,
  energia:  null,
  climax:   0,
};

// ---------------------------------------------------------------------------
// Ações e descrições por tipo de terreno
// ---------------------------------------------------------------------------
const ACOES = {
  solo:     [{ label: 'Preparar a terra',          custo: 15000 }],
  garimpo:  [{ label: 'Negociar saída',            custo: 0     }],
  nascente: [{ label: 'Bioengenharia das margens', custo: 45000 },
             { label: 'Plantar mudas nativas',     custo: 10000 }],
  queimada: [{ label: 'Apagar incêndio',           custo: 30000 }],
  indigena: [{ label: 'Iniciar diálogo',           custo: 0     }],
  pecuaria: [{ label: 'Iniciar contato',           custo: 0     }],
  floresta: [{ label: 'Ver detalhes',              custo: 0     }],
};

const DESCRICOES = {
  solo:     'Terra erodida e improdutiva.',
  garimpo:  'Área com extração ilegal de minérios.',
  nascente: 'Fonte hídrica em estado crítico.',
  queimada: 'Área devastada por incêndio.',
  indigena: 'Território de comunidade indígena.',
  pecuaria: 'Área de pastagem ou cultivo extensivo.',
  floresta: 'Trecho de floresta nativa preservada.',
};

// ---------------------------------------------------------------------------
// Jogo — mapa hexagonal + painel de recursos + interação + mecânicas
// ---------------------------------------------------------------------------
class Jogo extends Phaser.Scene {
  constructor() { super({ key: 'Jogo' }); }

  create() {
    const { width, height } = this.scale;

    // Inicializa estado (mudas já pode ter sido ajustado pelo devMode)
    estadoJogo.dinheiro = dadosJogo.saldo;
    estadoJogo.agua     = null;
    estadoJogo.equipe   = [];
    if (!DEV_MODE) estadoJogo.mudas = 0;
    estadoJogo.energia  = null;
    estadoJogo.climax   = 0;

    addFundo(this);

    // -----------------------------------------------------------------------
    // Painel HUD — topo, 70px
    // -----------------------------------------------------------------------
    const HUD_H = 70;

    const hudG = this.add.graphics();
    hudG.fillStyle(0x0d2818, 1);
    hudG.fillRect(0, 0, width, HUD_H);
    hudG.lineStyle(1, 0x2d6a4f, 1);
    hudG.lineBetween(0, HUD_H, width, HUD_H);

    this.add.text(20, 14, dadosJogo.ong, {
      fontSize: '14px', color: '#52b788',
      fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
    });
    this.add.text(20, 34, dadosJogo.nome, {
      fontSize: '12px', color: '#74c69d',
      fontFamily: 'Inter, sans-serif',
    });

    const RECURSOS = [
      { icone: '💰', labelKey: 'dinheiro', label: 'Dinheiro', cor: '#d8f3dc' },
      { icone: '💧', labelKey: 'agua',     label: 'Água',      cor: '#4A90D9' },
      { icone: '👥', labelKey: 'equipe',   label: 'Equipe',    cor: '#74c69d' },
      { icone: '🌱', labelKey: 'mudas',    label: 'Mudas',     cor: '#74c69d' },
      { icone: '⚡', labelKey: 'energia',  label: 'Energia',   cor: '#C8A951' },
    ];

    const BLOCO_W = 160, BLOCO_H = 50, BLOCO_GAP = 8;
    const blocoInicioX = (width - (RECURSOS.length * BLOCO_W + (RECURSOS.length - 1) * BLOCO_GAP)) / 2;
    const blocoY = (HUD_H - BLOCO_H) / 2;

    this.hudTextos = {};

    RECURSOS.forEach(({ icone, labelKey, label, cor }, i) => {
      const bx = blocoInicioX + i * (BLOCO_W + BLOCO_GAP);
      const bg = this.add.graphics();
      bg.fillStyle(0x1b4332, 1);
      bg.fillRoundedRect(bx, blocoY, BLOCO_W, BLOCO_H, 6);
      this.add.text(bx + 12, blocoY + BLOCO_H / 2, icone, {
        fontSize: '18px', fontFamily: 'sans-serif',
      }).setOrigin(0, 0.5);
      const txtValor = this.add.text(bx + BLOCO_W - 10, blocoY + 14,
        this._formatarRecurso(labelKey), {
        fontSize: '18px', color: cor,
        fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
      }).setOrigin(1, 0.5);
      this.add.text(bx + BLOCO_W - 10, blocoY + 36, label.toUpperCase(), {
        fontSize: '11px', color: '#74c69d',
        fontFamily: 'Inter, sans-serif', letterSpacing: 1,
      }).setOrigin(1, 0.5);
      this.hudTextos[labelKey] = txtValor;
    });

    const barW = 200, barH = 10;
    const barX = width - barW - 20, barY = 20;
    this.add.text(barX + barW, barY - 4, 'FLORESTA CLÍMAX', {
      fontSize: '11px', color: '#74c69d',
      fontFamily: 'Inter, sans-serif', letterSpacing: 1,
    }).setOrigin(1, 1);
    const barG = this.add.graphics();
    barG.fillStyle(0x1b4332, 1);
    barG.fillRoundedRect(barX, barY, barW, barH, 4);
    this.barraClimax = this.add.graphics();
    this._atualizarBarra();
    this.txtClimax = this.add.text(barX + barW / 2, barY + barH + 8, '0%', {
      fontSize: '11px', color: '#74c69d',
      fontFamily: 'Inter, sans-serif',
    }).setOrigin(0.5, 0);

    // -----------------------------------------------------------------------
    // Mapa hexagonal
    // -----------------------------------------------------------------------
    const R = 36, COLS = 6, ROWS = 5;
    const colStep = R * Math.sqrt(3);
    const rowStep = R * 1.5;

    const tipos = gerarTipos(dadosJogo.dificuldade);
    this.hexagonos = [];

    const hexes = [];
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        hexes.push({
          x: col * colStep + (row % 2 === 1 ? colStep / 2 : 0),
          y: row * rowStep, row, col,
        });
      }
    }

    const xs    = hexes.map(h => h.x);
    const ys    = hexes.map(h => h.y);
    const halfW = R * Math.sqrt(3) / 2;
    const gridW = Math.max(...xs) - Math.min(...xs) + R * Math.sqrt(3);
    const gridH = Math.max(...ys) - Math.min(...ys) + R * 2;
    const offX  = (width  - gridW) / 2 + halfW - Math.min(...xs);
    const offY  = HUD_H + (height - HUD_H - gridH) / 2 + R - Math.min(...ys);

    // Camadas de desenho (profundidade crescente)
    const fillG        = this.add.graphics().setDepth(0); // fills iniciais (estático)
    this.hexChangeG    = this.add.graphics().setDepth(1); // fills de hexs modificados
    this.hoverG        = this.add.graphics().setDepth(2); // overlay de hover
    this.selectG       = this.add.graphics().setDepth(3); // borda de seleção

    hexes.forEach(({ x, y, row, col }, idx) => {
      const tipo = tipos[idx];
      const info = TIPOS[tipo];
      const cx   = x + offX;
      const cy   = y + offY;

      const pts = Array.from({ length: 6 }, (_, i) => {
        const a = Math.PI / 6 + (Math.PI / 3) * i;
        return { x: cx + R * Math.cos(a), y: cy + R * Math.sin(a) };
      });

      fillG.fillStyle(info.cor, 1);
      fillG.beginPath();
      fillG.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < 6; i++) fillG.lineTo(pts[i].x, pts[i].y);
      fillG.closePath();
      fillG.fillPath();

      fillG.lineStyle(2, 0x2d6a4f, 1);
      fillG.beginPath();
      fillG.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < 6; i++) fillG.lineTo(pts[i].x, pts[i].y);
      fillG.closePath();
      fillG.strokePath();

      // Emoji — referência armazenada para atualização dinâmica
      const emojiTxt = this.add.text(cx, cy, info.emoji, {
        fontSize: '20px', fontFamily: 'sans-serif',
      }).setOrigin(0.5).setDepth(4);

      const polygon = new Phaser.Geom.Polygon(pts.flatMap(p => [p.x, p.y]));

      this.hexagonos.push({ tipo, info, row, col, cx, cy, pts, polygon, emojiTxt, bloqueado: false });
    });

    // -----------------------------------------------------------------------
    // Estado de interação
    // -----------------------------------------------------------------------
    this.hoveredIdx  = -1;
    this.selectedIdx = -1;
    this.menuObjs    = [];
    this.menuBounds  = null;

    this.input.on('pointermove', this._onMove,  this);
    this.input.on('pointerdown', this._onClick, this);
  }

  // -------------------------------------------------------------------------
  // Handlers de input
  // -------------------------------------------------------------------------
  _onMove(pointer) {
    const idx = this.hexagonos.findIndex(h =>
      Phaser.Geom.Polygon.Contains(h.polygon, pointer.x, pointer.y));
    if (idx !== this.hoveredIdx) {
      this.hoveredIdx = idx;
      this._desenharHover();
    }
  }

  _onClick(pointer) {
    if (this.menuBounds) {
      const { x, y, w, h } = this.menuBounds;
      if (pointer.x >= x && pointer.x <= x + w &&
          pointer.y >= y && pointer.y <= y + h) return;
    }

    const idx = this.hexagonos.findIndex(h =>
      Phaser.Geom.Polygon.Contains(h.polygon, pointer.x, pointer.y));

    if (idx >= 0) {
      const hex = this.hexagonos[idx];
      if (hex.bloqueado) return;

      this.selectedIdx = idx;
      this._desenharSelecao();

      // Despacha para o builder correto por tipo
      switch (hex.tipo) {
        case 'solo':           this._menuSoloDegradado(idx); break;
        case 'solo_preparado': this._menuSoloPreparado(idx); break;
        default:               this._abrirMenu(idx);
      }
    } else {
      this.selectedIdx = -1;
      this._desenharSelecao();
      this._fecharMenu();
    }
  }

  // -------------------------------------------------------------------------
  // Feedback visual
  // -------------------------------------------------------------------------
  _desenharHover() {
    this.hoverG.clear();
    if (this.hoveredIdx < 0) return;
    const { pts } = this.hexagonos[this.hoveredIdx];
    this.hoverG.fillStyle(0xffffff, 0.12);
    this.hoverG.beginPath();
    this.hoverG.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < 6; i++) this.hoverG.lineTo(pts[i].x, pts[i].y);
    this.hoverG.closePath();
    this.hoverG.fillPath();
  }

  _desenharSelecao() {
    this.selectG.clear();
    if (this.selectedIdx < 0) return;
    const { pts } = this.hexagonos[this.selectedIdx];
    this.selectG.lineStyle(3, 0xffffff, 1);
    this.selectG.beginPath();
    this.selectG.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < 6; i++) this.selectG.lineTo(pts[i].x, pts[i].y);
    this.selectG.closePath();
    this.selectG.strokePath();
  }

  // Redesenha o fill de um hexágono no layer de mudanças
  _mudarEstadoHex(idx, novoTipo) {
    const hex  = this.hexagonos[idx];
    const info = TIPOS[novoTipo];
    hex.tipo = novoTipo;
    hex.info = info;

    this.hexChangeG.fillStyle(info.cor, 1);
    this.hexChangeG.beginPath();
    this.hexChangeG.moveTo(hex.pts[0].x, hex.pts[0].y);
    for (let i = 1; i < 6; i++) this.hexChangeG.lineTo(hex.pts[i].x, hex.pts[i].y);
    this.hexChangeG.closePath();
    this.hexChangeG.fillPath();

    this.hexChangeG.lineStyle(2, 0x2d6a4f, 1);
    this.hexChangeG.beginPath();
    this.hexChangeG.moveTo(hex.pts[0].x, hex.pts[0].y);
    for (let i = 1; i < 6; i++) this.hexChangeG.lineTo(hex.pts[i].x, hex.pts[i].y);
    this.hexChangeG.closePath();
    this.hexChangeG.strokePath();

    hex.emojiTxt.setText(info.emoji);
  }

  // -------------------------------------------------------------------------
  // Timer visual
  // -------------------------------------------------------------------------
  _iniciarTimer(idx, durSeg, onComplete) {
    const hex     = this.hexagonos[idx];
    hex.bloqueado = true;

    const BAR_W = 62, BAR_H = 6;
    const bx = hex.cx - BAR_W / 2;
    const by = hex.cy + 34;

    const bgG = this.add.graphics().setDepth(5);
    bgG.fillStyle(0x1b4332, 1);
    bgG.fillRoundedRect(bx, by, BAR_W, BAR_H, 3);

    const barG  = this.add.graphics().setDepth(6);
    const totalMs = durSeg * 1000;
    const startTime = this.time.now;
    let   concluido = false;

    const evt = this.time.addEvent({
      delay: 50, loop: true,
      callback: () => {
        if (concluido) return;
        const pct = Math.max(0, 1 - (this.time.now - startTime) / totalMs);
        barG.clear();
        barG.fillStyle(0x52b788, 1);
        if (pct > 0) barG.fillRoundedRect(bx, by, BAR_W * pct, BAR_H, 3);
      },
    });

    this.time.delayedCall(totalMs, () => {
      concluido = true;
      evt.remove();
      bgG.destroy();
      barG.destroy();
      hex.bloqueado = false;
      onComplete();
    });
  }

  // -------------------------------------------------------------------------
  // Menus por tipo
  // -------------------------------------------------------------------------
  _menuSoloDegradado(idx) {
    const custo    = 15000;
    const semSaldo = estadoJogo.dinheiro < custo;

    this._abrirMenu(idx, {
      titulo:    'Solo Degradado',
      descricao: DESCRICOES['solo'],
      acoes: [{
        label:       'Preparar a terra',
        custoStr:    `R$ ${custo.toLocaleString('pt-BR')}`,
        desabilitado: semSaldo,
        aviso:       semSaldo ? 'Saldo insuficiente' : null,
        onPress: () => {
          estadoJogo.dinheiro -= custo;
          this.atualizarPainel();
          this._fecharMenu();
          this.selectedIdx = -1;
          this._desenharSelecao();

          const dur = DEV_MODE ? 5 : 30;
          this._iniciarTimer(idx, dur, () => {
            this._mudarEstadoHex(idx, 'solo_preparado');
            this._menuSoloPreparado(idx);
          });
        },
      }],
    });
  }

  _menuSoloPreparado(idx) {
    const custo1     = 10000;
    const mudasReq   = 1000;
    const semSaldo1  = estadoJogo.dinheiro < custo1;
    const semMudas1  = estadoJogo.mudas < mudasReq;
    const bloq1      = semSaldo1 || semMudas1;
    const aviso1     = semMudas1
      ? `Você precisa de ${mudasReq.toLocaleString('pt-BR')} mudas. Instale um viveiro primeiro.`
      : semSaldo1 ? 'Saldo insuficiente' : null;

    this._abrirMenu(idx, {
      titulo:    'Solo Preparado',
      descricao: 'Escolha como restaurar esta área.',
      acoes: [
        {
          label:        '🌿 Restaurar com vegetação nativa',
          custoStr:     `R$ ${custo1.toLocaleString('pt-BR')} + ${mudasReq.toLocaleString('pt-BR')} mudas`,
          desabilitado: bloq1,
          aviso:        aviso1,
          onPress: () => {
            estadoJogo.dinheiro -= custo1;
            estadoJogo.mudas    -= mudasReq;
            this.atualizarPainel();
            this._fecharMenu();
            this.selectedIdx = -1;
            this._desenharSelecao();

            const dur = DEV_MODE ? 10 : 90;
            this._iniciarTimer(idx, dur, () => {
              if (Math.random() < 0.6) {
                this._mudarEstadoHex(idx, 'floresta_pioneira');
              } else {
                this._mudarEstadoHex(idx, 'solo');
                this._mostrarCartaoFalha(idx,
                  'O plantio não pegou. O solo ainda estava instável. Tente novamente.');
              }
            });
          },
        },
        {
          label: '🌾 Implementar Sistema Agroflorestal (SAF)', custoStr: 'R$ 80.000',
          desabilitado: false, aviso: null,
          onPress: () => this._mostrarToast('Em breve — funcionalidade em desenvolvimento'),
        },
        {
          label: '🪴 Criar viveiro de mudas', custoStr: 'R$ 50.000',
          desabilitado: false, aviso: null,
          onPress: () => this._mostrarToast('Em breve — funcionalidade em desenvolvimento'),
        },
        {
          label: '🪵 Área de Manejo Florestal', custoStr: 'R$ 60.000',
          desabilitado: false, aviso: null,
          onPress: () => this._mostrarToast('Em breve — funcionalidade em desenvolvimento'),
        },
      ],
    });
  }

  // -------------------------------------------------------------------------
  // Menu flutuante genérico
  // -------------------------------------------------------------------------
  _abrirMenu(idx, config = {}) {
    this._fecharMenu();

    const hex      = this.hexagonos[idx];
    const titulo   = config.titulo   ?? hex.info.label;
    const descricao = config.descricao ?? (DESCRICOES[hex.tipo] ?? '');
    const acoes    = config.acoes    ?? (ACOES[hex.tipo] ?? []).map(({ label, custo }) => ({
      label,
      custoStr:     custo === 0 ? 'Gratuito' : `R$ ${custo.toLocaleString('pt-BR')}`,
      desabilitado: false,
      aviso:        null,
      onPress: () => console.log(`[Jogo] ${label} [${hex.row},${hex.col}]`),
    }));

    const MENU_W   = 280;
    const MENU_PAD = 16;
    const TITLE_H  = 72;   // cabeçalho + separador
    const ACTION_H = 50;   // altura do botão (duas linhas: label + custo)
    const AVISO_H  = 20;
    const GAP      = 10;   // espaço entre botões
    const BOT_PAD  = 16;
    const DEPTH    = 10;

    // Altura dinâmica
    let menuH = TITLE_H + BOT_PAD;
    acoes.forEach((a, i) => {
      menuH += ACTION_H;
      if (a.aviso) menuH += 4 + AVISO_H;
      if (i < acoes.length - 1) menuH += GAP;
    });

    // Posição — tenta à direita, depois à esquerda, depois clamp
    let mx = hex.cx + 44;
    if (mx + MENU_W > this.scale.width - 8) mx = hex.cx - 44 - MENU_W;
    mx = Math.max(8, Math.min(mx, this.scale.width - MENU_W - 8));

    let my = hex.cy - menuH / 2;
    if (my < 78) my = 78;
    if (my + menuH > this.scale.height - 8) my = this.scale.height - 8 - menuH;

    this.menuBounds = { x: mx, y: my, w: MENU_W, h: menuH };
    const objs = [];

    // Fundo
    const bgG = this.add.graphics().setDepth(DEPTH);
    bgG.fillStyle(0x0d2818, 1);
    bgG.fillRoundedRect(mx, my, MENU_W, menuH, 8);
    bgG.lineStyle(1, 0x2d6a4f, 1);
    bgG.strokeRoundedRect(mx, my, MENU_W, menuH, 8);
    objs.push(bgG);

    // Título
    objs.push(this.add.text(mx + MENU_PAD, my + 14, titulo, {
      fontSize: '16px', color: '#d8f3dc',
      fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
    }).setDepth(DEPTH));

    // Descrição
    objs.push(this.add.text(mx + MENU_PAD, my + 36, descricao, {
      fontSize: '12px', color: '#74c69d', fontFamily: 'Inter, sans-serif',
      wordWrap: { width: MENU_W - MENU_PAD * 2 - 24 },
    }).setDepth(DEPTH));

    // Fechar
    const closeTxt = this.add.text(mx + MENU_W - MENU_PAD, my + 14, '✕', {
      fontSize: '14px', color: '#74c69d', fontFamily: 'Inter, sans-serif',
    }).setOrigin(1, 0).setDepth(DEPTH).setInteractive({ useHandCursor: true });
    closeTxt.on('pointerover',  () => closeTxt.setColor('#d8f3dc'));
    closeTxt.on('pointerout',   () => closeTxt.setColor('#74c69d'));
    closeTxt.on('pointerdown',  () => {
      this.selectedIdx = -1;
      this._desenharSelecao();
      this._fecharMenu();
    });
    objs.push(closeTxt);

    // Separador
    const divG = this.add.graphics().setDepth(DEPTH);
    divG.lineStyle(1, 0x2d6a4f, 0.7);
    divG.lineBetween(mx + MENU_PAD, my + TITLE_H - 4,
                     mx + MENU_W - MENU_PAD, my + TITLE_H - 4);
    objs.push(divG);

    let ay = my + TITLE_H;
    acoes.forEach(({ label, custoStr, desabilitado, aviso, onPress }, i) => {
      // *** captura o valor atual de ay para a closure — evita closure-em-loop ***
      const buttonY = ay;
      const bx = mx + MENU_PAD;
      const bw = MENU_W - MENU_PAD * 2;

      const btnG = this.add.graphics().setDepth(DEPTH);
      const desenhaBtn = (hover) => {
        btnG.clear();
        btnG.fillStyle(desabilitado ? 0x132b1f : (hover ? 0x2d6a4f : 0x1b4332), 1);
        btnG.fillRoundedRect(bx, buttonY, bw, ACTION_H, 6);
      };
      desenhaBtn(false);
      objs.push(btnG);

      // Label — linha superior do botão
      objs.push(this.add.text(bx + 10, buttonY + 14, label, {
        fontSize: '13px', color: desabilitado ? '#4a6b5a' : '#d8f3dc',
        fontFamily: 'Inter, sans-serif',
      }).setOrigin(0, 0.5).setDepth(DEPTH));

      // Custo — linha inferior do botão (sem sobreposição com o label)
      if (custoStr) {
        objs.push(this.add.text(bx + 10, buttonY + 34, custoStr, {
          fontSize: '11px', color: desabilitado ? '#2d6a4f' : '#52b788',
          fontFamily: 'Inter, sans-serif',
        }).setOrigin(0, 0.5).setDepth(DEPTH));
      }

      if (!desabilitado) {
        const zone = this.add.zone(bx + bw / 2, buttonY + ACTION_H / 2, bw, ACTION_H)
          .setDepth(DEPTH).setInteractive({ useHandCursor: true });
        zone.on('pointerover', () => desenhaBtn(true));
        zone.on('pointerout',  () => desenhaBtn(false));
        zone.on('pointerdown', onPress);
        objs.push(zone);
      }

      ay += ACTION_H;

      if (aviso) {
        objs.push(this.add.text(bx + 8, ay + 4, aviso, {
          fontSize: '11px', color: desabilitado ? '#e76f51' : '#74c69d',
          fontFamily: 'Inter, sans-serif',
          wordWrap: { width: bw - 16 },
        }).setDepth(DEPTH));
        ay += 4 + AVISO_H;
      }

      if (i < acoes.length - 1) ay += GAP;
    });

    this.menuObjs = objs;
  }

  _fecharMenu() {
    this.menuObjs.forEach(o => o.destroy());
    this.menuObjs   = [];
    this.menuBounds = null;
  }

  // -------------------------------------------------------------------------
  // Cartão de falha e toast
  // -------------------------------------------------------------------------
  _mostrarCartaoFalha(idx, msg) {
    const hex    = this.hexagonos[idx];
    const CARD_W = 280, DEPTH = 10;

    let cx = hex.cx + 44;
    if (cx + CARD_W > this.scale.width - 8) cx = hex.cx - 44 - CARD_W;

    const tituloTxt  = '⚠️ Falha no plantio';
    const objs = [];

    const bgG = this.add.graphics().setDepth(DEPTH);

    // Altura calculada com wordWrap aproximado
    const CARD_H = 90;
    let cy = hex.cy - CARD_H / 2;
    if (cy < 78) cy = 78;
    if (cy + CARD_H > this.scale.height - 8) cy = this.scale.height - 8 - CARD_H;

    bgG.fillStyle(0x3d1a0a, 1);
    bgG.fillRoundedRect(cx, cy, CARD_W, CARD_H, 8);
    bgG.lineStyle(1.5, 0xc1440e, 1);
    bgG.strokeRoundedRect(cx, cy, CARD_W, CARD_H, 8);
    objs.push(bgG);

    objs.push(this.add.text(cx + 14, cy + 14, tituloTxt, {
      fontSize: '14px', color: '#e76f51',
      fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
    }).setDepth(DEPTH));

    objs.push(this.add.text(cx + 14, cy + 38, msg, {
      fontSize: '11px', color: '#d8f3dc', fontFamily: 'Inter, sans-serif',
      wordWrap: { width: CARD_W - 28 },
    }).setDepth(DEPTH));

    const fechar = () => objs.forEach(o => o.destroy());
    this.time.delayedCall(4000, fechar);
    this.input.once('pointerdown', fechar);
  }

  _mostrarToast(msg) {
    const txt = this.add.text(this.scale.width / 2, this.scale.height - 30, msg, {
      fontSize: '13px', color: '#d8f3dc', fontFamily: 'Inter, sans-serif',
      backgroundColor: '#1b4332', padding: { x: 14, y: 8 },
    }).setOrigin(0.5, 1).setDepth(20);

    this.tweens.add({
      targets: txt, alpha: 0, delay: 1500, duration: 500,
      onComplete: () => txt.destroy(),
    });
  }

  // -------------------------------------------------------------------------
  // HUD helpers
  // -------------------------------------------------------------------------
  _formatarRecurso(key) {
    const v = estadoJogo[key];
    if (key === 'dinheiro') return `R$ ${v.toLocaleString('pt-BR')}`;
    if (key === 'equipe')   return `${v.length} membro${v.length !== 1 ? 's' : ''}`;
    if (v === null || v === undefined) return '—';
    return String(v);
  }

  atualizarHUD(key) {
    if (this.hudTextos[key]) this.hudTextos[key].setText(this._formatarRecurso(key));
    if (key === 'climax') this._atualizarBarra();
  }

  // Atualiza todos os blocos do painel de uma vez
  atualizarPainel() {
    Object.keys(this.hudTextos).forEach(key => this.atualizarHUD(key));
  }

  _atualizarBarra() {
    const barW = 200, barH = 10;
    const barX = this.scale.width - barW - 20, barY = 20;
    const pct  = Math.min(estadoJogo.climax / 100, 1);
    this.barraClimax.clear();
    if (pct > 0) {
      this.barraClimax.fillStyle(0x52b788, 1);
      this.barraClimax.fillRoundedRect(barX, barY, barW * pct, barH, 4);
    }
    if (this.txtClimax) this.txtClimax.setText(`${Math.round(estadoJogo.climax)}%`);
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
