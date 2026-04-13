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
  solo_preparado:       { label: 'Solo Preparado',        emoji: '⛏️',  cor: 0x5C4A1E, hex: '#5C4A1E' },
  floresta_pioneira:    { label: 'Floresta Pioneira',     emoji: '🌿', cor: 0x74c69d, hex: '#74c69d' },
  garimpo_neutralizado: { label: 'Garimpo Neutralizado',  emoji: '🟫',   cor: 0x8B6914, hex: '#8B6914' },
  nascente_ativa:       { label: 'Nascente Ativa',        emoji: '💧✨', cor: 0x1a6b8a, hex: '#1a6b8a' },
  saf:                  { label: 'Sistema Agroflorestal',  emoji: '🌾',  cor: 0x8B7355, hex: '#8B7355' },
  floresta_secundaria:  { label: 'Floresta Secundária',   emoji: '🌲',  cor: 0x2d9e6b, hex: '#2d9e6b' },
  floresta_climax:      { label: 'Floresta Clímax',       emoji: '🌳',  cor: 0x1a6b3a, hex: '#1a6b3a' },
  viveiro:              { label: 'Viveiro de Mudas',       emoji: '🪴',  cor: 0x2d6a4f, hex: '#2d6a4f' },
  manejo:               { label: 'Manejo Florestal',       emoji: '🪵',  cor: 0x4a7c4e, hex: '#4a7c4e' },
  nascente_bioengenharia: { label: 'Nascente Preparada',   emoji: '💧',  cor: 0x2a5f7a, hex: '#2a5f7a' },
  pecuaria_intensiva:     { label: 'Pasto Organizado',     emoji: '🐄',  cor: 0x9aaf5a, hex: '#9aaf5a' },
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
  dinheiro:        0,
  agua:            null,
  equipe:          [],
  mudas:           0,
  energia:         null,
  climax:          0,
  aliancaIndigena: false,
  psa:             false,
  psaAtivo:        false,
  receitaPassiva:  0,
  fauna:                    [],
  temCisterna:              false,
  cardsVistos:              [],
  negociacoesBemSucedidas:  0,
  eventosSobrevividos:      0,
  tempoInicio:              0,
  creditoCarbono:           false,
  temTrator:                false,
};

// ---------------------------------------------------------------------------
// Catálogo de membros da equipe
// ---------------------------------------------------------------------------
// Largura do painel lateral direito (px) — 0 porque o canvas já exclui o painel via CSS (#game-container right: 280px)
const PANEL_W = 0;

const CATALOGO_EQUIPE = [
  { tipo: 'tecnico_florestal',  emoji: '👨‍🌾', nome: 'Técnico Florestal',     custo: 5000, funcao: '-10% tempo ecológico por técnico (máx 50%); acumula até 70% com trator.' },
  { tipo: 'tecnico_negociacao', emoji: '🤝',  nome: 'Técnico em Negociação', custo: 6000, funcao: 'Necessário para iniciar negociações. +10% chance por técnico.' },
  { tipo: 'brigadista',         emoji: '🔥',  nome: 'Brigadista',            custo: 4000, funcao: '-10% tempo de combate a incêndio por brigadista (máx 50%).' },
];

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
  solo:                 'Terra erodida e improdutiva.',
  garimpo:              'Área com extração ilegal de minérios.',
  nascente:             'Fonte hídrica em estado crítico.',
  queimada:             'Área devastada por incêndio.',
  indigena:             'Território de comunidade indígena.',
  pecuaria:             'Área de pastagem ou cultivo extensivo.',
  floresta:             'Trecho de floresta nativa preservada.',
  garimpo_neutralizado: 'Área com extração encerrada. Requer fitorremediação.',
  nascente_ativa:       'Nascente recuperada e produtiva. Gera água por ciclo.',
  saf:                  'Sistema agroflorestal em operação. Gera renda e restaura o solo.',
  floresta_secundaria:  'Floresta jovem em processo de maturação. Fauna em expansão.',
  floresta_climax:      'Floresta madura plena. Gera créditos de carbono e abriga fauna rara.',
};

const NOMES_GARIMPEIROS = ['Manoel', 'Raimundo', 'Valdecir', 'Cícero', 'Benedito', 'Zé Maria'];

const PERFIS_GARIMPEIRO = [
  {
    id: 'migrante', nome: 'O Migrante',
    descricao: 'Veio de longe em busca de sustento. Aberto a alternativas.',
    bonus: 0.10, corAvatar: 0x8B6914,
    falas: {
      abertura: 'Vim de longe pra cá. Não é vida boa não, mas é o que tem. O que você quer?',
      aceitou:  'Tá bom. Aqui não tinha futuro mesmo. Vou tentar a vida em outro lugar.',
      recusou:  'Não tô convencido não. Precisaria de algo mais concreto pra eu largar tudo isso.',
      reabriu:  'De novo você? Fala logo o que quer.',
    },
  },
  {
    id: 'veterano', nome: 'O Veterano',
    descricao: 'Conhece bem a região e resiste fortemente à negociação.',
    bonus: -0.10, corAvatar: 0x5a5a5a,
    falas: {
      abertura: 'Tô aqui há 30 anos. Já vi muito verde-de-fora chegar querendo me tirar daqui. O que você quer dessa vez?',
      aceitou:  'Nunca pensei que ia falar isso, mas... tá na hora de parar. Meu corpo já não aguenta mais.',
      recusou:  'Você está maluco? Eu tenho mercúrio nas veias. Isso aqui é minha vida, minha identidade. Nunca.',
      reabriu:  'De novo você? Fala logo o que quer.',
    },
  },
  {
    id: 'jovem', nome: 'O Jovem Desesperado',
    descricao: 'Situação precária, mas mais receptivo ao diálogo e às leis.',
    bonus: 0.05, corAvatar: 0x8B2500,
    falas: {
      abertura: 'Eu sei que não tá certo o que faço. Mas não tinha outra saída. Me fala o que você quer.',
      aceitou:  'Graças a Deus. Eu precisava de uma saída. Obrigado mesmo.',
      recusou:  'Eu queria aceitar, juro. Mas não tenho pra onde ir. Não dá.',
      reabriu:  'De novo você? Fala logo o que quer.',
    },
  },
];

const PERFIS_LIDERANCA = [
  { nome: 'Liderança Tradicional', descricao: 'Mais fechada inicialmente, mas a aliança conquistada é poderosa e duradoura.', chanceBase: 0.40 },
  { nome: 'Liderança Jovem',       descricao: 'Mais aberta e pragmática, focada no futuro da comunidade e das próximas gerações.', chanceBase: 0.60 },
];

const PERFIS_FAZENDEIRO = [
  {
    id: 'endividado', nome: 'O Endividado',
    frase: 'Tô devendo pro banco há 3 anos. Preciso de uma saída.',
    bonusContato: 0.15, bonusSAF: 0.20, bonusPSA: 0, corAvatar: 0x8B2500,
    falas: {
      abertura:           'Olha, tô devendo pro banco há 3 anos. Se você tiver uma proposta que me ajude a pagar as contas, eu ouço.',
      proposta:           'Tá bom, me fala. O que você me oferece pra eu mudar minha atividade aqui?',
      aceitaSAF:          'SAF dá renda todo mês? Então tô dentro. Quando começa?',
      recusaSAF:          'SAF demora muito pra dar retorno. Preciso de dinheiro agora, não daqui a 2 anos.',
      aceitaIntensiva:    'Isso eu conheço. E ainda melhora minha renda? Tô dentro.',
      recusaIntensiva:    'Isso não resolve minha dívida não.',
      aceitaManejo:       'Madeira dá dinheiro bom. Desde que seja legal, tô dentro.',
      recusaManejo:       'Demora muito pra dar retorno. Preciso de algo mais rápido.',
      aceitaReflorestamento: 'A floresta voltando pra minha terra. Isso ajuda minha situação com o banco.',
      recusaReflorestamento: 'Floresta não dá lucro. Ainda não tô convencido.',
      aceitaCarbono:      'Dinheiro de carbono? Isso sim resolve meu problema com o banco.',
      recusaCarbono:      'Não entendo bem isso de carbono. Parece coisa de faz de conta.',
      encerrou:           'Por hoje chega. Volte outro dia.',
    },
  },
  {
    id: 'herdeiro', nome: 'O Herdeiro',
    frase: 'Meu pai deixou essa terra pra mim. Quero fazer algo bom com ela.',
    bonusContato: 0.10, bonusSAF: 0, bonusPSA: 0, corAvatar: 0xC8A951,
    falas: {
      abertura:           'Meu pai deixou essa terra pra mim. Tenho pensado muito no que fazer com ela. Me fala sua ideia.',
      proposta:           'Que tipo de projeto você tem em mente pra essa terra?',
      aceitaSAF:          'Isso parece certo pra essa terra. Vamos fazer.',
      recusaSAF:          'Não sei não. Parece complicado demais pra mim.',
      aceitaIntensiva:    'Menos impacto e mais organizado? Faz sentido.',
      recusaIntensiva:    'Queria algo mais diferente pra essa terra.',
      aceitaManejo:       'A floresta do meu pai ainda tá aqui. Faz sentido cuidar dela assim.',
      recusaManejo:       'Não sei trabalhar com floresta assim não.',
      aceitaReflorestamento: 'A floresta voltando pra minha terra. Meu pai ia gostar de ver isso.',
      recusaReflorestamento: 'Floresta não dá lucro. Ainda não tô convencido.',
      aceitaCarbono:      'Preservar e ainda ganhar dinheiro? Meu pai ia adorar isso.',
      recusaCarbono:      'Isso de carbono parece complicado demais.',
      encerrou:           'Por hoje chega. Volte outro dia.',
    },
  },
  {
    id: 'resistente', nome: 'O Resistente',
    frase: 'Minha família vive aqui há 40 anos. Não vou mudar por qualquer conversa.',
    bonusContato: -0.10, bonusSAF: 0, bonusPSA: 0, corAvatar: 0x6B4226,
    falas: {
      abertura:           'Minha família vive aqui há 40 anos. Já tentaram me convencer de muita coisa. Pode falar, mas não prometo nada.',
      proposta:           'Pode falar. Mas saiba que não é qualquer coisa que me convence.',
      aceitaSAF:          'Vi o vizinho fazer isso e deu certo. Vou tentar.',
      recusaSAF:          'Essa coisa de SAF dá muito trabalho e não serve pra mim. Eu gosto de boi.',
      aceitaIntensiva:    'Boi eu entendo. Isso aqui eu aceito.',
      recusaIntensiva:    'Já faço isso. Não preciso de você pra me dizer como criar boi.',
      aceitaManejo:       'Madeira eu entendo. Isso é trabalho de verdade.',
      recusaManejo:       'Não confio nessa história de manejo não. Parece enrolação.',
      aceitaReflorestamento: 'A floresta voltando pra minha terra. Meu pai ia gostar de ver isso.',
      recusaReflorestamento: 'Floresta não dá lucro. Ainda não tô convencido.',
      aceitaCarbono:      'Se tem dinheiro nisso e não preciso mudar muito, pode ser.',
      recusaCarbono:      'Isso de carbono parece coisa de gente da cidade. Não me interessa.',
      encerrou:           'Por hoje chega. Volte outro dia.',
    },
  },
  {
    id: 'oportunista', nome: 'O Oportunista',
    frase: 'Ouvi falar desse negócio de carbono. Me conta mais.',
    bonusContato: 0, bonusSAF: 0, bonusPSA: 0.20, corAvatar: 0x1b4332,
    falas: {
      abertura:           'Ouvi falar desse negócio de crédito de carbono. Se tiver dinheiro nisso, me interessa. Fala mais.',
      proposta:           'Vai logo, qual é o negócio?',
      aceitaSAF:          'SAF mais carbono? Isso sim é negócio. Fechado.',
      recusaSAF:          'SAF sozinho não me interessa. Se tiver carbono junto, aí sim.',
      aceitaIntensiva:    'Não é o que eu queria mas tá bom por enquanto.',
      recusaIntensiva:    'Pecuária intensiva não tem carbono. Não me interessa.',
      aceitaManejo:       'Madeira mais carbono no futuro? Pode ser.',
      recusaManejo:       'Só manejo sem carbono não me interessa.',
      aceitaReflorestamento: 'A floresta voltando pra minha terra. Meu pai ia gostar de ver isso.',
      recusaReflorestamento: 'Floresta não dá lucro. Ainda não tô convencido.',
      aceitaCarbono:      'Agora sim. Isso é o que eu queria desde o começo.',
      recusaCarbono:      'Não tô entendendo os números. Me mostra mais.',
      encerrou:           'Por hoje chega. Volte outro dia.',
    },
  },
];

const NOMES_FAZENDEIROS = ['João', 'Carlos', 'Antônio', 'Sebastião', 'Raimundo', 'Pedro'];

const FAUNA_CATALOGO = [
  { id: 'abelha', emoji: '🐝', nome: 'Abelha Jataí',  raridade: 'Comum',    corRar: '#74c69d',
    funcao: 'Polinizadora — +20% reprodução de todas as espécies.',
    dado:   'Abelhas nativas polinizam 70% das espécies vegetais da Amazônia.' },
  { id: 'cutia',  emoji: '🦔', nome: 'Cutia',         raridade: 'Incomum',  corRar: '#52b788',
    funcao: 'Dispersora exclusiva da castanha-do-pará. Sem ela, a castanheira não se reproduz.',
    dado:   'Relação de 8 milhões de anos entre cutia e castanheira.' },
  { id: 'tucano', emoji: '🐦', nome: 'Tucano',        raridade: 'Raro',     corRar: '#4A90D9',
    funcao: 'Dispersa copaíba e outras espécies. Desbloqueia crescimento passivo de climácicas.',
    dado:   'Um tucano pode dispersar sementes a até 2km da árvore-mãe.' },
  { id: 'pacu',   emoji: '🐟', nome: 'Pacu',          raridade: 'Incomum',  corRar: '#52b788',
    funcao: 'Superdispersor nas matas ciliares. Essencial para a bacia hidrográfica.',
    dado:   'Pacus dispersam mais sementes nas matas ciliares do que qualquer ave.' },
  { id: 'anta',   emoji: '🦌', nome: 'Anta',          raridade: 'Raro',     corRar: '#4A90D9',
    funcao: 'Dispersora de sementes grandes. Desbloqueia o sub-bosque.',
    dado:   'A anta dispersa mais de 50 espécies que nenhum outro animal consegue carregar.' },
  { id: 'onca',   emoji: '🐆', nome: 'Onça-pintada',  raridade: 'Lendária', corRar: '#C8A951',
    funcao: 'Predador de topo. Confirma ecossistema maduro.',
    dado:   'Onde há onça, há ecossistema completo.' },
];

// ---------------------------------------------------------------------------
// Jogo — mapa hexagonal + painel de recursos + interação + mecânicas
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// Mapa de texturas — tipo de hexágono → chave de imagem carregada no preload
// ---------------------------------------------------------------------------
const HEX_TEXTURE_MAP = {
  solo:                 'hex-solo-degradado',
  solo_preparado:       'hex-solo-degradado',
  garimpo:              'hex-garimpo',
  garimpo_neutralizado: 'hex-solo-degradado',
  floresta:             'hex-floresta-climax',
  floresta_pioneira:    'hex-floresta-pioneira',
  floresta_secundaria:  'hex-floresta-secundaria',
  floresta_climax:      'hex-floresta-climax',
  queimada:             'hex-queimada',
  indigena:             'hex-area-indigena',
  pecuaria:             'hex-pecuaria',
  pecuaria_intensiva:   'hex-pecuaria',
};

const EMOJI_TIPO = {
  solo:                    '',
  solo_preparado:          '',
  garimpo:                 '⛏',
  garimpo_neutralizado:    '',
  nascente:                '💧',
  nascente_ativa:          '💧',
  nascente_bioengenharia:  '💧',
  queimada:                '🔥',
  indigena:                '🪶',
  pecuaria:                '🐄',
  pecuaria_intensiva:      '🐄',
  floresta_pioneira:       '🌿',
  floresta_secundaria:     '🌲',
  floresta_climax:         '🌳',
  floresta:                '🌳',
  viveiro:                 '🪴',
  saf:                     '🌾',
  manejo:                  '🪵',
};

class Jogo extends Phaser.Scene {
  constructor() { super({ key: 'Jogo' }); }

  preload() {
    // PNGs desativados — texturas agora são desenhadas proceduralmente em _desenharTexturaHex
    // this.load.image('hex-solo-degradado',      'assets/hexagonos/solo-degradado.png');
    // this.load.image('hex-floresta-climax',     'assets/hexagonos/floresta-climax.png');
    // this.load.image('hex-floresta-pioneira',   'assets/hexagonos/floresta-pioneira.png');
    // this.load.image('hex-floresta-secundaria', 'assets/hexagonos/floresta-secundaria.png');
    // this.load.image('hex-garimpo',             'assets/hexagonos/garimpo.png');
    // this.load.image('hex-pecuaria',            'assets/hexagonos/pecuaria.png');
    // this.load.image('hex-queimada',            'assets/hexagonos/queimada.png');
    // this.load.image('hex-area-indigena',       'assets/hexagonos/area-indigena.png');
  }

  create() {
    const { width, height } = this.scale;

    // Inicializa estado (mudas já pode ter sido ajustado pelo devMode)
    estadoJogo.dinheiro        = dadosJogo.saldo;
    estadoJogo.agua            = null;
    estadoJogo.equipe          = [];
    if (!DEV_MODE) estadoJogo.mudas = 0;
    estadoJogo.energia         = null;
    estadoJogo.climax          = 0;
    estadoJogo.aliancaIndigena = false;
    estadoJogo.psa             = false;
    estadoJogo.psaAtivo        = false;
    estadoJogo.receitaPassiva  = 0;
    estadoJogo.fauna           = [];

    addFundo(this);

    // -----------------------------------------------------------------------
    // Painel HUD — HTML (flutua sobre o canvas via #hud-superior)
    // -----------------------------------------------------------------------
    const HUD_H = 64;
    this.hudTextos = {};                      // mantido para compatibilidade
    this.barraClimax = this.add.graphics();   // stub vazio (não renderiza nada)
    this.txtClimax   = null;
    this._dinheiroHudCx = Math.round(width * 0.38);
    this.criarHUDHTML();
    this.criarBarraInferiorHTML();

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
    const mapAreaW = width - PANEL_W;  // 1000px
    const offX  = (mapAreaW - gridW) / 2 + halfW - Math.min(...xs);
    const offY  = HUD_H + (height - HUD_H - gridH) / 2 + R - Math.min(...ys);
    this._offX = offX;
    this._offY = offY;

    // Camadas de desenho (profundidade crescente)
    const fillG        = this.add.graphics().setDepth(0);   // fills iniciais (estático)
    this.hexChangeG    = this.add.graphics().setDepth(1);   // fills de hexs modificados
    this.bordaFireG    = this.add.graphics().setDepth(1.5); // borda pulsante de queimada
    this.hoverG        = this.add.graphics().setDepth(2);   // overlay de hover
    this.selectG       = this.add.graphics().setDepth(3);   // borda de seleção
    this.semaforoG     = this.add.graphics().setDepth(4.5); // semáforos das áreas indígenas

    hexes.forEach(({ x, y, row, col }, idx) => {
      const tipo = tipos[idx];
      const info = TIPOS[tipo];
      const cx   = x + offX;
      const cy   = y + offY;

      const pts = Array.from({ length: 6 }, (_, i) => {
        const a = Math.PI / 6 + (Math.PI / 3) * i;
        return { x: cx + R * Math.cos(a), y: cy + R * Math.sin(a) };
      });

      this._desenharTexturaHex(fillG, cx, cy, tipo);

      // Emoji — referência armazenada para atualização dinâmica
      const emojiTxt = this.add.text(cx, cy, EMOJI_TIPO[tipo] ?? '', {
        fontSize: '16px', fontFamily: 'sans-serif',
      }).setOrigin(0.5).setDepth(4);

      const polygon = new Phaser.Geom.Polygon(pts.flatMap(p => [p.x, p.y]));

      // Garimpo: sorteio de perfil do garimpeiro e bonus acumulado de tentativas
      const perfil           = tipo === 'garimpo'
        ? PERFIS_GARIMPEIRO[Math.floor(Math.random() * PERFIS_GARIMPEIRO.length)]
        : null;
      const bonusNegociacao  = 0;
      const vigilancia       = false;
      // Nascente: produção de água (L/ciclo), melhorias instaladas
      const producaoAgua      = 0;
      const temBomba          = false;
      const temHidroeletrica  = false;
      // Queimada: timer de propagação (Phaser.TimerEvent)
      const propagacaoTimer   = null;
      // Indígena: semáforo, liderança, parcerias, diálogo
      const estaFacil         = dadosJogo.dificuldade === 'Fácil';
      const semaforoIndigena  = tipo === 'indigena' ? (estaFacil ? 'amarelo' : 'vermelho') : null;
      const perfilLideranca   = tipo === 'indigena'
        ? PERFIS_LIDERANCA[Math.floor(Math.random() * PERFIS_LIDERANCA.length)]
        : null;
      const bonusDialogo      = 0;
      const parcerias         = [];   // 'sementes' | 'brigadistas'
      const dialogoBloqueado  = false;
      const aliancaCompleta   = false;
      // Pecuária: semáforo, perfil do fazendeiro, parceria, receita, timer de expansão
      const semaforoPecuaria  = tipo === 'pecuaria' ? 'vermelho' : null;
      const perfilFazendeiro  = tipo === 'pecuaria'
        ? (() => {
            const p = PERFIS_FAZENDEIRO[Math.floor(Math.random() * PERFIS_FAZENDEIRO.length)];
            const nomeP = NOMES_FAZENDEIROS[Math.floor(Math.random() * NOMES_FAZENDEIROS.length)];
            return { ...p, nomePropio: nomeP, idade: 35 + Math.floor(Math.random() * 34) };
          })()
        : null;
      const bonusContatoPec   = 0;
      const contatoBloqueado  = false;
      const parceiriaPec      = null;  // 'saf' | 'intensiva' | 'manejo'
      const receitaSAF        = 0;
      const expansaoTimer     = null;
      const clusterBonus      = false;
      // Sucessão ecológica
      const evolucaoTimer     = null;
      const evolucaoTimestamp = 0;
      // Eventos por consequência
      const garimpoExpansaoTimer = null;
      const queimadaCrimTimer    = null;
      const fumaçaTimer          = null;
      const fumaçaObj            = null;
      const invasaoTimer         = null;

      this.hexagonos.push({
        tipo, info, row, col, cx, cy, pts, polygon, emojiTxt,
        bloqueado: false, perfil, bonusNegociacao, vigilancia,
        producaoAgua, temBomba, temHidroeletrica, propagacaoTimer,
        semaforoIndigena, perfilLideranca, bonusDialogo,
        parcerias, dialogoBloqueado, aliancaCompleta,
        semaforoPecuaria, perfilFazendeiro, bonusContatoPec,
        contatoBloqueado, parceiriaPec, receitaSAF, expansaoTimer, clusterBonus,
        evolucaoTimer, evolucaoTimestamp,
        garimpoExpansaoTimer, queimadaCrimTimer, fumaçaTimer, fumaçaObj, invasaoTimer,
        _fumacaAtiva: false,
        _texImg: null, _texMaskG: null,
      });
    });

    // -----------------------------------------------------------------------
    // Texturas + borda permanente acima das texturas
    // -----------------------------------------------------------------------
    {
      const HEX_R   = 36;
      const HEX_TEX_DEPTH    = 1.2;   // acima de fillG (0) e hexChangeG (1)
      const HEX_BORDER_DEPTH = 1.45;  // acima das texturas, abaixo do hover (2)

      // Borda permanente — um Graphics por hexágono, cor por tipo
      const COR_BORDA_HEX = {
        queimada:       0xc1440e,
        nascente_ativa: 0x4A90D9,
        floresta_climax: 0x52b788,
        indigena:       0x9b6fc6,
      };
      this.hexagonos.forEach(hex => {
        const bG   = this.add.graphics().setDepth(HEX_BORDER_DEPTH);
        const corB = COR_BORDA_HEX[hex.tipo] || 0x1e4030;
        bG.lineStyle(1.5, corB, 0.8);
        bG.beginPath();
        bG.moveTo(hex.pts[0].x, hex.pts[0].y);
        for (let i = 1; i < 6; i++) bG.lineTo(hex.pts[i].x, hex.pts[i].y);
        bG.closePath();
        bG.strokePath();
        hex._borderG = bG;
      });

      // PNG desativado — textura procedural já aplicada via _desenharTexturaHex em fillG
      // this.hexagonos.forEach(hex => { this._setHexTexture(hex, HEX_R, HEX_TEX_DEPTH); });
    }

    // -----------------------------------------------------------------------
    // Centro do mapa + resposta a resize
    // -----------------------------------------------------------------------
    this.mapaCentroX = offX + (Math.max(...xs) + Math.min(...xs)) / 2;
    this.mapaCentroY = offY + (Math.max(...ys) + Math.min(...ys)) / 2;
    this.cameras.main.centerOn(this.mapaCentroX, this.mapaCentroY);
    this.scale.on('resize', (gameSize) => {
      this.cameras.main.centerOn(
        this.mapaCentroX ?? gameSize.width  / 2,
        this.mapaCentroY ?? gameSize.height / 2
      );
    });

    // -----------------------------------------------------------------------
    // Estado de interação
    // -----------------------------------------------------------------------
    this.hoveredIdx         = -1;
    this.selectedIdx        = -1;
    this.menuObjs           = [];
    this.menuBounds         = null;
    this.cardObjs           = [];
    this._faunaQueue        = [];
    this._objetivosAtivados = { psa: false, ecoturismo: false, corredor: false, carbono: false };
    this._alertasObjs       = [];
    this._secaAtiva         = false;
    this._gameOverAtivado   = false;
    this._vitoriaAtivada    = false;
    estadoJogo.cardsVistos              = [];
    estadoJogo.negociacoesBemSucedidas  = 0;
    estadoJogo.eventosSobrevividos      = 0;
    estadoJogo.tempoInicio              = Date.now();

    // -----------------------------------------------------------------------
    // Equipe + Painel Lateral
    // -----------------------------------------------------------------------
    this._secoesAbertas      = [true, true, true, false, true];
    this._equipeScrollOffset = 0;
    this._painelConteudoObjs = [];
    this._painelRedrawPending = false;
    this._criarPainelLateral();

    this.input.on('pointermove', this._onMove,  this);
    this.input.on('pointerdown', this._onClick, this);

    this._redesenharSemaforos();

    this._cicloReocupacao();
    this._cicloAgua();
    this._iniciarPulsoQueimadas();
    this._iniciarPropagacoesIniciais();
    this._cicloQueimadas();
    this._cicloParcerias();
    this._iniciarExpansoesPastos();
    this._cicloReceitaSAF();
    this._cicloViveiro();
    this._iniciarEventosAleatorios();
    this._monitorarCrimeFlorestal();
    this._verificarGameOver();
    this._cicloSalarios();
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
    // Card modal aberto — bloqueia qualquer outra interação
    if (this.cardObjs.length > 0) return;

    // Fecha menu HTML antes de qualquer outra ação
    this.fecharMenuHTML();

    const idx = this.hexagonos.findIndex(h =>
      Phaser.Geom.Polygon.Contains(h.polygon, pointer.x, pointer.y));

    if (idx >= 0) {
      const hex = this.hexagonos[idx];
      if (hex.bloqueado) return;

      this.selectedIdx = idx;
      this._desenharSelecao();

      // Fumaça detectada — abre menu de reação antes do menu normal
      if (hex._fumacaAtiva) { this._menuFumaca(idx); return; }

      // Despacha para o builder correto por tipo
      switch (hex.tipo) {
        case 'solo':                 this._menuSoloDegradado(idx);     break;
        case 'solo_preparado':       this._menuSoloPreparado(idx);     break;
        case 'garimpo':              this._dialogoGarimpeiro(idx);       break;
        case 'garimpo_neutralizado': this._menuGarimpoNeutralizado(idx); break;
        case 'nascente':             this._menuNascenteDegradada(idx);   break;
        case 'nascente_bioengenharia': this._menuNascenteBio(idx);       break;
        case 'nascente_ativa':       this._menuNascenteAtiva(idx);       break;
        case 'queimada':             this._menuQueimada(idx);            break;
        case 'indigena':             this._menuIndigena(idx);            break;
        case 'pecuaria':             this._menuPecuaria(idx);            break;
        case 'pecuaria_intensiva':   this._menuPecuaria(idx);            break;
        case 'saf':                  this._menuSAF(idx);                 break;
        case 'viveiro':              this._menuViveiro(idx);             break;
        case 'manejo':               this._menuManejo(idx);              break;
        case 'floresta_pioneira':    this._menuFlorestaEstagio(idx);     break;
        case 'floresta_secundaria':  this._menuFlorestaEstagio(idx);     break;
        case 'floresta_climax':      this._menuFlorestaEstagio(idx);     break;
        default:                     this._abrirMenu(idx);
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

    this._desenharTexturaHex(this.hexChangeG, hex.cx, hex.cy, novoTipo);

    // Atualiza borda por tipo
    if (hex._borderG) {
      const COR_BORDA_HEX = {
        queimada:        0xc1440e,
        nascente_ativa:  0x4A90D9,
        floresta_climax: 0x52b788,
        indigena:        0x9b6fc6,
      };
      const corB = COR_BORDA_HEX[novoTipo] || 0x1e4030;
      hex._borderG.clear();
      hex._borderG.lineStyle(1.5, corB, 0.8);
      hex._borderG.beginPath();
      hex._borderG.moveTo(hex.pts[0].x, hex.pts[0].y);
      for (let i = 1; i < 6; i++) hex._borderG.lineTo(hex.pts[i].x, hex.pts[i].y);
      hex._borderG.closePath();
      hex._borderG.strokePath();
    }

    hex.emojiTxt.setText(EMOJI_TIPO[novoTipo] ?? '');

    // PNG desativado — textura procedural aplicada em _desenharTexturaHex acima
    // this._setHexTexture(hex, 36, 1.2);

    // Avalia upgrades/downgrades de semáforos indígenas após qualquer mudança
    this._verificarSemaforosIndigenas();
    // Verifica cluster de SAFs
    if (novoTipo === 'saf') this._verificarClusterSAF(idx);
    // Redesenha semáforos de pecuária
    this._redesenharSemaforos();

    // Sucessão ecológica — inicia timer automático para florestas
    const ESTAGIOS_FLORESTA = ['floresta_pioneira', 'floresta_secundaria'];
    if (ESTAGIOS_FLORESTA.includes(novoTipo)) {
      this._iniciarSucessao(idx);
    } else {
      // Cancela timer de sucessão se o hex mudar para outro tipo
      if (hex.evolucaoTimer) { hex.evolucaoTimer.remove(); hex.evolucaoTimer = null; }
    }

    // Atualiza % clímax
    const nClimax = this.hexagonos.filter(h => h.tipo === 'floresta_climax').length;
    estadoJogo.climax = (nClimax / this.hexagonos.length) * 100;
    this._atualizarBarra();

    // Receita de clímax
    if (novoTipo === 'floresta_climax') hex.receitaSAF = 8000;

    // Verifica objetivos e fauna
    this._verificarObjetivosEcologicos();
    this._verificarFauna();
    this._verificarVitoria();

    // Cards educativos — desativados temporariamente (serão reaproveitados)
    // if (novoTipo === 'saf')
    //   this._mostrarCardEducativo('saf', '🌾', 'O que é SAF?',
    //     'Sistemas Agroflorestais combinam árvores, cultivos e criação animal na mesma área. Produzem alimento E restauram o solo ao mesmo tempo.');
    // if (novoTipo === 'garimpo_neutralizado')
    //   this._mostrarCardEducativo('garimpo_merc', '⚗️', 'Garimpo e mercúrio',
    //     'O garimpo ilegal contamina rios e solos com mercúrio — um metal tóxico que entra na cadeia alimentar e afeta comunidades ribeirinhas por décadas.');
    // if (novoTipo === 'nascente_ativa')
    //   this._mostrarCardEducativo('bioengenharia', '💧', 'Bioengenharia de margens',
    //     'Técnica que usa plantas e estruturas naturais para estabilizar margens de rios e nascentes, prevenindo erosão e recuperando o fluxo de água.');

    // Limpa fumaça se hex muda de tipo
    if (hex._fumacaAtiva) {
      if (hex.fumaçaTimer)  { hex.fumaçaTimer.remove(); hex.fumaçaTimer = null; }
      if (hex.fumaçaObj && hex.fumaçaObj.active) { hex.fumaçaObj.destroy(); hex.fumaçaObj = null; }
      hex._fumacaAtiva = false;
    }

    // Consequência — garimpo: inicia timer de expansão
    if (novoTipo === 'garimpo') {
      this._monitorarGarimpoExpansao(idx);
    } else {
      if (hex.garimpoExpansaoTimer) { hex.garimpoExpansaoTimer.remove(); hex.garimpoExpansaoTimer = null; }
    }

    // Consequência — pecuária com semáforo vermelho: inicia timer de queimada criminosa
    if (novoTipo === 'pecuaria') {
      this._monitorarQueimadaCriminosa(idx);
    } else {
      if (hex.queimadaCrimTimer) { hex.queimadaCrimTimer.remove(); hex.queimadaCrimTimer = null; }
    }

    // Rastreia timestamp de floresta_pioneira para seca
    if (novoTipo === 'floresta_pioneira') {
      hex.evolucaoTimestamp = this.time.now;
    }

    // Game over check
    if (estadoJogo.dinheiro <= 0 && !this._gameOverAtivado) {
      this._gameOverAtivado = true;
      this.time.delayedCall(200, () => this._mostrarGameOver());
    }
  }

  // -------------------------------------------------------------------------
  // Textura procedural por tipo (Graphics)
  // -------------------------------------------------------------------------
  _desenharTexturaHex(g, cx, cy, tipo) {
    console.log('desenhando textura:', tipo);
    const R   = 36;
    const pts = [];
    for (let i = 0; i < 6; i++) {
      const ang = Math.PI / 6 + (Math.PI / 3) * i;
      pts.push({ x: cx + R * Math.cos(ang), y: cy + R * Math.sin(ang) });
    }

    switch (tipo) {

      case 'solo':
      case 'solo_preparado':
      case 'garimpo_neutralizado': {
        g.fillStyle(tipo === 'solo_preparado' ? 0x3d2b0f : 0x6b4c1a, 1);
        g.fillPoints(pts, true);
        g.fillStyle(tipo === 'solo_preparado' ? 0x2a1d08 : 0x4a3210, 0.6);
        for (let i = 0; i < 6; i++) {
          const px = cx + (Math.random() - 0.5) * 40;
          const py = cy + (Math.random() - 0.5) * 40;
          g.fillCircle(px, py, 4 + Math.random() * 5);
        }
        g.lineStyle(1, tipo === 'solo_preparado' ? 0x1a0e04 : 0x3a2508, 0.5);
        g.beginPath();
        g.moveTo(cx - 10, cy - 8); g.lineTo(cx + 5,  cy + 3);
        g.moveTo(cx + 8,  cy - 12); g.lineTo(cx - 2, cy + 8);
        g.strokePath();
        break;
      }

      case 'garimpo': {
        g.fillStyle(0x4a4a4a, 1);
        g.fillPoints(pts, true);
        g.fillStyle(0x2e2e2e, 0.7);
        g.fillCircle(cx - 8, cy + 5, 10);
        g.fillCircle(cx + 10, cy - 8, 7);
        g.fillStyle(0x6e6e6e, 0.4);
        g.fillCircle(cx, cy - 5, 5);
        g.fillStyle(0xaaaacc, 0.6);
        g.fillEllipse(cx + 6, cy + 10, 12, 6);
        break;
      }

      case 'nascente': {
        g.fillStyle(0x7a5c2e, 1);
        g.fillPoints(pts, true);
        g.fillStyle(0x5a3e1a, 0.5);
        g.fillEllipse(cx, cy + 5, 30, 15);
        g.lineStyle(1, 0x3a2508, 0.6);
        g.beginPath();
        g.moveTo(cx - 5, cy - 10); g.lineTo(cx, cy); g.lineTo(cx + 8, cy + 12);
        g.strokePath();
        break;
      }

      case 'nascente_ativa': {
        g.fillStyle(0x1a5f8a, 1);
        g.fillPoints(pts, true);
        g.fillStyle(0x2a8fba, 0.5);
        g.fillEllipse(cx, cy, 40, 30);
        g.fillStyle(0x4ab8d8, 0.3);
        g.fillEllipse(cx - 5, cy - 5, 20, 12);
        g.lineStyle(1, 0x7dd4ec, 0.5);
        g.beginPath();
        g.moveTo(cx - 12, cy); g.lineTo(cx - 6, cy - 3); g.lineTo(cx, cy);
        g.lineTo(cx + 6, cy - 3); g.lineTo(cx + 12, cy);
        g.strokePath();
        break;
      }

      case 'nascente_bioengenharia': {
        g.fillStyle(0x1e4f6a, 1);
        g.fillPoints(pts, true);
        g.fillStyle(0x2d7a5a, 0.4);
        g.fillEllipse(cx, cy + 8, 35, 18);
        break;
      }

      case 'queimada': {
        g.fillStyle(0x1a0a00, 1);
        g.fillPoints(pts, true);
        g.fillStyle(0x3d1500, 0.8);
        g.fillCircle(cx, cy + 5, 18);
        const brasaCores = [0xff6b00, 0xff4400, 0xcc3300];
        for (let i = 0; i < 8; i++) {
          const bx = cx + (Math.random() - 0.5) * 44;
          const by = cy + (Math.random() - 0.5) * 44;
          g.fillStyle(brasaCores[Math.floor(Math.random() * 3)], 0.4 + Math.random() * 0.4);
          g.fillCircle(bx, by, 1 + Math.random() * 2);
        }
        break;
      }

      case 'indigena': {
        g.fillStyle(0x5a2d82, 1);
        g.fillPoints(pts, true);
        g.fillStyle(0x7b4fa6, 0.5);
        g.fillCircle(cx, cy, 20);
        g.fillStyle(0x3d1f5a, 0.4);
        g.lineStyle(1, 0x9b6fc6, 0.4);
        g.beginPath();
        g.moveTo(cx, cy - 18); g.lineTo(cx + 16, cy + 9); g.lineTo(cx - 16, cy + 9);
        g.closePath();
        g.strokePath();
        break;
      }

      case 'pecuaria': {
        g.fillStyle(0x8a7a20, 1);
        g.fillPoints(pts, true);
        g.fillStyle(0xb8a030, 0.5);
        g.fillEllipse(cx, cy, 50, 35);
        g.fillStyle(0x6b5c10, 0.3);
        g.fillCircle(cx - 12, cy + 8, 8);
        g.fillCircle(cx + 14, cy - 5, 6);
        break;
      }

      case 'pecuaria_intensiva': {
        g.fillStyle(0x5a7a1a, 1);
        g.fillPoints(pts, true);
        g.fillStyle(0x7aaa2a, 0.5);
        g.fillEllipse(cx, cy, 50, 35);
        break;
      }

      case 'floresta':
      case 'floresta_pioneira': {
        g.fillStyle(0x3a7a3a, 1);
        g.fillPoints(pts, true);
        g.fillStyle(0x5aa85a, 0.6);
        g.fillCircle(cx - 8, cy - 5, 12);
        g.fillCircle(cx + 10, cy + 8, 9);
        g.fillStyle(0x4a6a1a, 0.3);
        g.fillCircle(cx + 2, cy - 10, 7);
        break;
      }

      case 'floresta_secundaria': {
        g.fillStyle(0x1e6b3a, 1);
        g.fillPoints(pts, true);
        g.fillStyle(0x2d9e5a, 0.6);
        g.fillCircle(cx, cy - 5, 18);
        g.fillCircle(cx - 12, cy + 8, 12);
        g.fillCircle(cx + 12, cy + 6, 10);
        g.fillStyle(0x1a5a2a, 0.5);
        g.fillCircle(cx + 5, cy - 12, 8);
        break;
      }

      case 'floresta_climax': {
        g.fillStyle(0x0d3d1e, 1);
        g.fillPoints(pts, true);
        g.fillStyle(0x1a6b35, 0.8);
        g.fillCircle(cx, cy, 22);
        g.fillStyle(0x0f4a22, 1);
        g.fillCircle(cx - 10, cy - 8,  14);
        g.fillCircle(cx + 10, cy - 5,  12);
        g.fillCircle(cx - 5,  cy + 12, 10);
        g.fillCircle(cx + 8,  cy + 10, 11);
        g.fillStyle(0x2d9e5a, 0.2);
        g.fillCircle(cx - 6, cy - 10, 6);
        break;
      }

      case 'viveiro': {
        g.fillStyle(0x1a4a2a, 1);
        g.fillPoints(pts, true);
        g.fillStyle(0x2d7a4a, 0.6);
        g.fillRect(cx - 15, cy - 10, 12, 8);
        g.fillRect(cx + 3,  cy - 10, 12, 8);
        g.fillRect(cx - 15, cy + 4,  12, 8);
        g.fillRect(cx + 3,  cy + 4,  12, 8);
        break;
      }

      case 'saf': {
        g.fillStyle(0x4a5a1a, 1);
        g.fillPoints(pts, true);
        g.fillStyle(0x6a8a2a, 0.5);
        g.fillEllipse(cx, cy, 45, 30);
        g.fillStyle(0x3a7a2a, 0.6);
        g.fillCircle(cx - 10, cy - 8, 9);
        g.fillCircle(cx + 10, cy + 5, 8);
        break;
      }

      case 'manejo': {
        g.fillStyle(0x2a4a1a, 1);
        g.fillPoints(pts, true);
        g.fillStyle(0x3a6a2a, 0.6);
        g.fillCircle(cx, cy, 16);
        g.fillStyle(0x4a8a3a, 0.4);
        g.fillCircle(cx - 12, cy + 5,  10);
        g.fillCircle(cx + 10, cy - 8,  9);
        break;
      }

      default: {
        g.fillStyle(0x2d6a4f, 1);
        g.fillPoints(pts, true);
      }
    }
  }

  // -------------------------------------------------------------------------
  // Textura PNG hexagonal (overlay clipado)
  // -------------------------------------------------------------------------
  _setHexTexture(hex, R, depth) {
    const texKey = HEX_TEXTURE_MAP[hex.tipo];

    if (!texKey) {
      // Sem textura mapeada — oculta imagem existente e sai
      if (hex._texImg) hex._texImg.setVisible(false);
      return;
    }

    if (hex._texImg) {
      // Reutiliza imagem já criada — só troca textura
      hex._texImg.setTexture(texKey).setVisible(true);
      return;
    }

    // Primeira vez: cria máscara geométrica e imagem
    const maskG = this.add.graphics();
    maskG.fillStyle(0xffffff, 1);
    maskG.beginPath();
    maskG.moveTo(hex.pts[0].x, hex.pts[0].y);
    for (let i = 1; i < 6; i++) maskG.lineTo(hex.pts[i].x, hex.pts[i].y);
    maskG.closePath();
    maskG.fillPath();
    maskG.setVisible(false); // não renderiza na cena — usado só como clip

    const geoMask = maskG.createGeometryMask();

    // Pointy-top hex com raio R: width = R*sqrt(3), height = R*2
    const img = this.add.image(hex.cx, hex.cy, texKey)
      .setDisplaySize(R * Math.sqrt(3), R * 2)
      .setDepth(depth)
      .setMask(geoMask);

    hex._texImg  = img;
    hex._texMaskG = maskG;
  }

  // -------------------------------------------------------------------------
  // Timer visual
  // -------------------------------------------------------------------------
  _iniciarTimer(idx, durSeg, onComplete, cor = 0x52b788) {
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
        barG.fillStyle(cor, 1);
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

          const dur = this._duracaoComEquipe(idx, DEV_MODE ? 5 : 30, 'mecanica');
          this._iniciarTimer(idx, dur, () => {
            this._mudarEstadoHex(idx, 'solo_preparado');
            this._notificar('🌱 Solo preparado! Clique no hexágono para escolher o plantio.', 'positivo');
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
          label:        '🌾 Implementar Sistema Agroflorestal (SAF)',
          custoStr:     'R$ 80.000',
          desabilitado: estadoJogo.dinheiro < 80000,
          aviso:        estadoJogo.dinheiro < 80000 ? 'Saldo insuficiente' : null,
          onPress: () => {
            estadoJogo.dinheiro -= 80000;
            this.atualizarPainel();
            this._fecharMenu();
            this.selectedIdx = -1;
            this._desenharSelecao();
            const dur = this._duracaoComEquipe(idx, DEV_MODE ? 8 : 60, 'saf');
            this._iniciarTimer(idx, dur, () => {
              const hex = this.hexagonos[idx];
              hex.receitaSAF = 10000;
              this._mudarEstadoHex(idx, 'saf');
              this._mostrarToast('🌾 SAF implantado! Gerando R$ 10.000/ciclo.');
            }, 0xC8A951);
          },
        },
        {
          label:        '🪴 Criar viveiro de mudas',
          custoStr:     'R$ 50.000',
          desabilitado: estadoJogo.dinheiro < 50000,
          aviso:        estadoJogo.dinheiro < 50000 ? 'Saldo insuficiente' : null,
          onPress: () => {
            estadoJogo.dinheiro -= 50000;
            this.atualizarPainel();
            this._fecharMenu();
            this.selectedIdx = -1;
            this._desenharSelecao();
            const dur = this._duracaoComEquipe(idx, DEV_MODE ? 10 : 90, 'viveiro');
            this._iniciarTimer(idx, dur, () => {
              this._mudarEstadoHex(idx, 'viveiro');
              this._mostrarToast('🪴 Viveiro instalado! Produzindo 1.000 mudas/ciclo.');
            }, 0x74c69d);
          },
        },
        {
          label:        '🪵 Área de Manejo Florestal',
          custoStr:     'R$ 60.000',
          desabilitado: estadoJogo.dinheiro < 60000,
          aviso:        estadoJogo.dinheiro < 60000 ? 'Saldo insuficiente' : null,
          onPress: () => {
            estadoJogo.dinheiro -= 60000;
            this.atualizarPainel();
            this._fecharMenu();
            this.selectedIdx = -1;
            this._desenharSelecao();
            const dur = this._duracaoComEquipe(idx, DEV_MODE ? 10 : 75, 'manejo');
            this._iniciarTimer(idx, dur, () => {
              const hex = this.hexagonos[idx];
              hex.receitaSAF = 8000;
              this._mudarEstadoHex(idx, 'manejo');
              this._mostrarToast('🪵 Área de manejo ativa! Gerando R$ 8.000/ciclo.');
            }, 0x4a7c4e);
          },
        },
      ],
    });
  }

  // -------------------------------------------------------------------------
  // Menu flutuante genérico — adaptador: converte formato Phaser → HTML
  // -------------------------------------------------------------------------
  _abrirMenu(idx, config = {}) {
    const hex       = this.hexagonos[idx];
    const titulo    = config.titulo    ?? hex.info.label;
    const descricao = config.descricao ?? (DESCRICOES[hex.tipo] ?? '');
    const acoes     = config.acoes     ?? (ACOES[hex.tipo] ?? []).map(({ label, custo }) => ({
      label,
      custoStr:     custo === 0 ? 'Gratuito' : `R$ ${custo.toLocaleString('pt-BR')}`,
      desabilitado: false,
      aviso:        null,
      onPress: () => console.log(`[Jogo] ${label} [${hex.row},${hex.col}]`),
    }));

    // Extrai emoji inicial do label como ícone do botão
    const splitEmoji = (txt) => {
      const m = txt.match(/^([\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}]\uFE0F?|[\uD800-\uDBFF][\uDC00-\uDFFF])\s*/u);
      if (m) return { icone: m[0].trim(), texto: txt.slice(m[0].length) };
      if (txt.charCodeAt(0) > 255) {
        const sp = txt.indexOf(' ');
        if (sp > 0) return { icone: txt.slice(0, sp), texto: txt.slice(sp + 1) };
      }
      return { icone: '🌿', texto: txt };
    };

    // Converte acoes[] → botoes[] para abrirMenuHTML
    const botoes = acoes.map(({ label, custoStr, desabilitado, aviso, onPress }) => {
      const { icone, texto } = splitEmoji(label);
      return { icone, label: texto, custo: custoStr, bloqueado: desabilitado, msgBloqueio: aviso, acao: onPress };
    });

    this.abrirMenuHTML({ titulo, descricao, x: hex.cx, y: hex.cy, botoes });
  }

  // -------------------------------------------------------------------------
  // Menu HTML — renderização DOM sobre o canvas
  // -------------------------------------------------------------------------
  abrirMenuHTML(config) {
    this.fecharMenuHTML();

    const overlay = document.getElementById('ui-overlay');
    if (!overlay) return;

    // Converte coordenadas canvas → tela
    const rect     = this.sys.game.canvas.getBoundingClientRect();
    const scaleX   = rect.width  / this.scale.width;
    const scaleY   = rect.height / this.scale.height;
    const MENU_W   = 320;
    const MENU_H_EST = 80 + (config.botoes?.length ?? 0) * 76; // estimativa para clamp vertical

    let menuX = rect.left + config.x * scaleX + 24;
    if (menuX + MENU_W > window.innerWidth - 12) menuX = rect.left + config.x * scaleX - MENU_W - 24;
    menuX = Math.max(8, Math.min(menuX, window.innerWidth - MENU_W - 8));

    let menuY = rect.top + config.y * scaleY - MENU_H_EST / 2;
    menuY = Math.max(70, Math.min(menuY, window.innerHeight - MENU_H_EST - 8));

    // ── Estrutura raiz ────────────────────────────────────────────────────────
    const menu = document.createElement('div');
    menu.id = 'hex-menu';
    menu.style.left = `${menuX}px`;
    menu.style.top  = `${menuY}px`;

    // ── Header ────────────────────────────────────────────────────────────────
    const header = document.createElement('div');
    header.style.cssText = 'display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:0;';

    const headerLeft = document.createElement('div');
    headerLeft.innerHTML = `
      <div class="hm-title">${config.titulo}</div>
      <div class="hm-desc">${config.descricao || ''}</div>
    `;

    const btnFechar = document.createElement('button');
    btnFechar.className = 'hm-close';
    btnFechar.textContent = '×';
    btnFechar.onclick = () => {
      this.selectedIdx = -1;
      this._desenharSelecao();
      this.fecharMenuHTML();
    };

    header.appendChild(headerLeft);
    header.appendChild(btnFechar);
    menu.appendChild(header);

    // ── Separador ─────────────────────────────────────────────────────────────
    const sep = document.createElement('div');
    sep.className = 'hm-sep';
    menu.appendChild(sep);

    // ── Botões ────────────────────────────────────────────────────────────────
    const lista = document.createElement('div');
    lista.className = 'hm-list';

    (config.botoes ?? []).forEach(btn => {
      const bloqueado = btn.bloqueado ?? false;

      const el = document.createElement('button');
      el.className = 'hm-btn' + (bloqueado ? ' hm-btn--bloq' : '');

      // Ícone
      const icoEl = document.createElement('div');
      icoEl.className = 'hm-ico';
      icoEl.textContent = btn.icone || '🌿';

      // Corpo
      const corpo = document.createElement('div');
      corpo.className = 'hm-body';
      corpo.innerHTML = `
        <div class="hm-label">${btn.label}</div>
        ${btn.desc ? `<div class="hm-bdesc">${btn.desc}</div>` : ''}
      `;

      // Custo
      const custoEl = document.createElement('div');
      custoEl.className = 'hm-custo';
      custoEl.innerHTML = `
        ${btn.custo ? `<div class="hm-custo-val">${btn.custo}</div>` : ''}
        ${btn.receita ? `<div class="hm-receita">${btn.receita}</div>` : ''}
      `;

      el.appendChild(icoEl);
      el.appendChild(corpo);
      el.appendChild(custoEl);

      if (!bloqueado && btn.acao) {
        el.onclick = () => {
          this.fecharMenuHTML();
          btn.acao();
        };
      }

      lista.appendChild(el);

      // Aviso de bloqueio
      if (bloqueado && btn.msgBloqueio) {
        const aviso = document.createElement('div');
        aviso.className = 'hm-aviso';
        aviso.textContent = btn.msgBloqueio;
        lista.appendChild(aviso);
      }
    });

    menu.appendChild(lista);
    overlay.appendChild(menu);
  }

  fecharMenuHTML() {
    const el = document.getElementById('hex-menu');
    if (el) el.remove();
  }

  // -------------------------------------------------------------------------
  // =========================================================================
  // HELPER: card de diálogo estilo RPG
  // cfg: { nome, perfilLabel, idade?, corAvatar, fala, tomFala, botoes[] }
  // botao: { label, sublabel?, cor, corHover, corLabel?, desabilitado?, onPress }
  // =========================================================================
  _cardDialogo(cfg) {
    this._fecharCard();
    const { nome, perfilLabel, idade, corAvatar, fala, tomFala = 'neutro', botoes = [], chance } = cfg;
    const { width, height } = this.scale;
    const DEPTH = 20;
    const objs  = [];

    // ── Layout constants ──────────────────────────────────────────────────
    const CARD_W   = 560, M = 24;
    const HEADER_H = 80, AV = 56;
    const FOOTER_H = 52;

    // Button height helpers
    const isPropBtn = (b) => 'icone' in b;
    const bH = (b) => isPropBtn(b) ? 68 : (b.sublabel ? 54 : 44);
    const hasProp   = botoes.some(isPropBtn);
    const btnsH     = botoes.reduce((s, b) => s + bH(b) + 8, 0);

    // Speech bubble height
    const FALA_W       = CARD_W - M * 2 - 3;
    const charsPerLine = Math.floor((FALA_W - 26) / 7.2);
    const nLines       = Math.max(2, Math.ceil((fala.length + 2) / charsPerLine));
    const FALA_H       = nLines * 22 + 28;

    const PROP_LABEL_H = hasProp ? 30 : 8;
    const CARD_H = HEADER_H + 20 + FALA_H + 16 + PROP_LABEL_H + btnsH + FOOTER_H;

    const cx = width / 2 - CARD_W / 2;
    const cy = Math.max(10, height / 2 - CARD_H / 2);

    // ── Overlay ───────────────────────────────────────────────────────────
    const ov = this.add.graphics().setDepth(DEPTH - 1);
    ov.fillStyle(0x000000, 0.55); ov.fillRect(0, 0, width, height);
    objs.push(ov);

    // ── Card background ───────────────────────────────────────────────────
    const bg = this.add.graphics().setDepth(DEPTH);
    bg.fillStyle(0x122a1c, 1);
    bg.fillRoundedRect(cx, cy, CARD_W, CARD_H, 16);
    bg.lineStyle(1, 0x2d6a4f, 1);
    bg.strokeRoundedRect(cx, cy, CARD_W, CARD_H, 16);
    objs.push(bg);

    // ── Zone 1: Header ────────────────────────────────────────────────────
    const hdrG = this.add.graphics().setDepth(DEPTH + 0.5);
    hdrG.fillStyle(0x0d2818, 1);
    hdrG.fillRoundedRect(cx, cy, CARD_W, HEADER_H, { tl: 16, tr: 16, bl: 0, br: 0 });
    objs.push(hdrG);
    const hdrLine = this.add.graphics().setDepth(DEPTH + 0.5);
    hdrLine.lineStyle(1, 0x1e4030, 1);
    hdrLine.lineBetween(cx, cy + HEADER_H, cx + CARD_W, cy + HEADER_H);
    objs.push(hdrLine);

    // Avatar
    const avX = cx + M, avY = cy + (HEADER_H - AV) / 2;
    const avG = this.add.graphics().setDepth(DEPTH + 1);
    avG.fillStyle(0x1b4332, 1);
    avG.fillRoundedRect(avX, avY, AV, AV, 12);
    avG.lineStyle(1.5, 0x2d6a4f, 1);
    avG.strokeRoundedRect(avX, avY, AV, AV, 12);
    objs.push(avG);
    objs.push(this.add.text(avX + AV / 2, avY + AV / 2,
      (nome[0] ?? '?').toUpperCase(), {
      fontSize: '22px', color: '#52b788',
      fontFamily: 'Syne, Inter, sans-serif', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(DEPTH + 2));

    // Identity: name
    const idX = avX + AV + 14;
    objs.push(this.add.text(idX, avY + 6, nome, {
      fontSize: '18px', color: '#d8f3dc',
      fontFamily: 'Syne, Inter, sans-serif', fontStyle: 'bold',
    }).setDepth(DEPTH + 2));

    // Profile tag
    const tagLabel = perfilLabel.toUpperCase();
    const tagW     = Math.max(56, tagLabel.length * 6.0 + 14);
    const tagG = this.add.graphics().setDepth(DEPTH + 1);
    tagG.fillStyle(0x1b4332, 1); tagG.fillRoundedRect(idX, avY + 33, tagW, 18, 9);
    tagG.lineStyle(1, 0x2d6a4f, 1); tagG.strokeRoundedRect(idX, avY + 33, tagW, 18, 9);
    objs.push(tagG);
    objs.push(this.add.text(idX + tagW / 2, avY + 42, tagLabel, {
      fontSize: '9px', color: '#74c69d',
      fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(DEPTH + 2));

    // Age
    if (idade) {
      objs.push(this.add.text(idX + tagW + 8, avY + 42, `${idade} anos`, {
        fontSize: '13px', color: '#52b788', fontFamily: 'Inter, sans-serif',
      }).setOrigin(0, 0.5).setDepth(DEPTH + 2));
    }

    // Chance block (header right) — depth 23 garante visibilidade sobre tudo no header
    if (chance !== undefined) {
      const chRX = cx + CARD_W - M;
      objs.push(this.add.text(chRX, avY + 4, 'CHANCE', {
        fontSize: '10px', color: '#52b788',
        fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
      }).setOrigin(1, 0).setDepth(DEPTH + 3));
      objs.push(this.add.text(chRX, avY + 18, `${Math.round(chance * 100)}%`, {
        fontSize: '22px', color: '#95d5b2',
        fontFamily: 'Syne, Inter, sans-serif', fontStyle: 'bold',
      }).setOrigin(1, 0).setDepth(DEPTH + 3));
    }

    // ── Zone 2: Speech bubble ─────────────────────────────────────────────
    const falaY = cy + HEADER_H + 20, falaX = cx + M;
    const falaG = this.add.graphics().setDepth(DEPTH + 1);
    falaG.fillStyle(0x1b4332, 1);
    falaG.fillRoundedRect(falaX + 3, falaY, FALA_W, FALA_H, { tl: 0, tr: 8, bl: 8, br: 8 });
    falaG.fillStyle(0x52b788, 1);
    falaG.fillRect(falaX, falaY, 3, FALA_H);
    objs.push(falaG);
    objs.push(this.add.text(falaX + 3 + 12, falaY + 12, `\u201c${fala}\u201d`, {
      fontSize: '14px', color: '#d8f3dc',
      fontFamily: 'Inter, sans-serif', fontStyle: 'italic',
      wordWrap: { width: FALA_W - 28 }, lineSpacing: 5,
    }).setDepth(DEPTH + 2));

    // ── Zone 3: Buttons / proposals ───────────────────────────────────────
    let btnY = falaY + FALA_H + 16;
    if (hasProp) {
      objs.push(this.add.text(cx + M, btnY, 'ESCOLHA SUA PROPOSTA', {
        fontSize: '11px', color: '#52b788',
        fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
      }).setDepth(DEPTH + 2));
    }
    btnY += PROP_LABEL_H;

    const BTN_W = CARD_W - M * 2;
    botoes.forEach(btn => {
      // ── Captura snapY ANTES de qualquer modificação de btnY ───────────────
      // Correção: closures capturando btnY por referência causam hover bugado
      // após a 1ª interação (o redesenho ocorria na posição do último botão).
      const snapY  = btnY;
      const bh     = bH(btn);
      const isProp = isPropBtn(btn);
      const corN   = btn.recomendado ? 0x163828 : (btn.cor ?? 0x0d2818);
      const corBrd = btn.recomendado ? 0x52b788 : (btn.desabilitado ? 0x1a2e1a : 0x1e4030);
      const corHov = btn.recomendado ? 0x1d4a30 : (btn.corHover ?? 0x1b4332);

      const bG = this.add.graphics().setDepth(DEPTH + 1);
      // draw usa snapY (valor imutável) em vez de btnY (que muda a cada iteração)
      const draw = (hov) => {
        bG.clear();
        bG.fillStyle(btn.desabilitado ? 0x0d1e14 : (hov ? corHov : corN), 1);
        bG.fillRoundedRect(cx + M, snapY, BTN_W, bh, 10);
        bG.lineStyle(1, btn.desabilitado ? 0x1a2e1a : (hov && !btn.recomendado ? 0x52b788 : corBrd), 1);
        bG.strokeRoundedRect(cx + M, snapY, BTN_W, bh, 10);
      };
      draw(false);
      objs.push(bG);

      if (isProp) {
        // Icon square 40×40
        const ICO = 40, icoX = cx + M + 14, icoY = snapY + (bh - ICO) / 2;
        const icoG = this.add.graphics().setDepth(DEPTH + 2);
        icoG.fillStyle(0x1b4332, 1);
        icoG.fillRoundedRect(icoX, icoY, ICO, ICO, 8);
        icoG.lineStyle(1, 0x2d6a4f, 1);
        icoG.strokeRoundedRect(icoX, icoY, ICO, ICO, 8);
        objs.push(icoG);
        if (btn.icone) {
          objs.push(this.add.text(icoX + ICO / 2, icoY + ICO / 2, btn.icone, {
            fontSize: '18px', fontFamily: 'sans-serif',
          }).setOrigin(0.5).setDepth(DEPTH + 3));
        }

        // Body
        const bodyX = icoX + ICO + 12, bodyW = BTN_W - ICO - 14 - 12 - 96;
        objs.push(this.add.text(bodyX, snapY + 14, btn.label, {
          fontSize: '14px', color: btn.desabilitado ? '#3a5040' : (btn.corLabel ?? '#d8f3dc'),
          fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
          wordWrap: { width: bodyW },
        }).setDepth(DEPTH + 3));
        if (btn.sublabel) {
          objs.push(this.add.text(bodyX, snapY + 36, btn.sublabel, {
            fontSize: '12px', color: btn.desabilitado ? '#2a4030' : '#74c69d',
            fontFamily: 'Inter, sans-serif', wordWrap: { width: bodyW },
          }).setDepth(DEPTH + 3));
        }

        // Right block: cost + chance
        const rX = cx + CARD_W - M - 8;
        if (btn.custo) {
          objs.push(this.add.text(rX, snapY + 14, btn.custo, {
            fontSize: '13px', color: btn.desabilitado ? '#3a4030' : '#e76f51',
            fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
          }).setOrigin(1, 0).setDepth(DEPTH + 3));
        }
        if (btn.chanceBase !== undefined) {
          objs.push(this.add.text(rX, snapY + 34, `${Math.round(btn.chanceBase * 100)}% chance`, {
            fontSize: '11px', color: btn.desabilitado ? '#2a4030' : '#52b788',
            fontFamily: 'Inter, sans-serif',
          }).setOrigin(1, 0).setDepth(DEPTH + 3));
        }
      } else {
        // Simple button
        const tY = btn.sublabel ? snapY + 12 : snapY + bh / 2;
        objs.push(this.add.text(cx + M + 14, tY, btn.label, {
          fontSize: '13px', color: btn.desabilitado ? '#4a6a4a' : (btn.corLabel ?? '#d8f3dc'),
          fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
        }).setOrigin(0, btn.sublabel ? 0 : 0.5).setDepth(DEPTH + 2));
        if (btn.sublabel) {
          objs.push(this.add.text(cx + M + 14, snapY + 32, btn.sublabel, {
            fontSize: '11px', color: btn.desabilitado ? '#3a5a3a' : '#74c69d',
            fontFamily: 'Inter, sans-serif',
          }).setDepth(DEPTH + 2));
        }
      }

      if (!btn.desabilitado && btn.onPress) {
        const z = this.add.zone(cx + M + BTN_W / 2, snapY + bh / 2, BTN_W, bh)
          .setInteractive({ useHandCursor: true }).setDepth(DEPTH + 4);
        z.on('pointerover', () => draw(true));
        z.on('pointerout',  () => draw(false));
        z.on('pointerdown', btn.onPress);
        objs.push(z);
      }
      btnY += bh + 8;
    });

    // ── Zone 4: Footer ────────────────────────────────────────────────────
    const footerY  = cy + CARD_H - FOOTER_H;
    const ftrLine  = this.add.graphics().setDepth(DEPTH + 1);
    ftrLine.lineStyle(1, 0x1e4030, 1);
    ftrLine.lineBetween(cx, footerY, cx + CARD_W, footerY);
    objs.push(ftrLine);

    const ftrMidY = footerY + FOOTER_H / 2;
    const nTecNeg = this._contarMembros('tecnico_negociacao');
    if (nTecNeg > 0) {
      const t = this.add.text(cx + M, ftrMidY,
        `Técnico em negociação ativo · +${nTecNeg * 10}% em todas as propostas`, {
        fontSize: '11px', color: '#52b788', fontFamily: 'Inter, sans-serif',
      }).setOrigin(0, 0.5).setAlpha(0.7).setDepth(DEPTH + 2);
      objs.push(t);
    } else {
      objs.push(this.add.text(cx + M, ftrMidY,
        'Sem técnico em negociação · chances reduzidas', {
        fontSize: '11px', color: '#e76f51', fontFamily: 'Inter, sans-serif',
      }).setOrigin(0, 0.5).setDepth(DEPTH + 2));
    }

    // Voltar button (shown when multiple buttons, i.e. player has a real choice)
    if (botoes.length > 1) {
      const VW = 80, VH = 28, voltarX = cx + CARD_W - M - VW;
      const voltarG = this.add.graphics().setDepth(DEPTH + 1);
      const voltarTxt = this.add.text(voltarX + VW / 2, ftrMidY, 'Voltar', {
        fontSize: '12px', color: '#74c69d', fontFamily: 'Inter, sans-serif',
      }).setOrigin(0.5).setDepth(DEPTH + 2);
      const drawV = (hov) => {
        voltarG.clear();
        voltarG.lineStyle(1, hov ? 0x52b788 : 0x2d6a4f, 1);
        voltarG.strokeRoundedRect(voltarX, ftrMidY - VH / 2, VW, VH, 6);
      };
      drawV(false);
      objs.push(voltarG, voltarTxt);
      const zV = this.add.zone(voltarX + VW / 2, ftrMidY, VW, VH)
        .setInteractive({ useHandCursor: true }).setDepth(DEPTH + 4);
      zV.on('pointerover', () => { drawV(true); voltarTxt.setColor('#d8f3dc'); });
      zV.on('pointerout',  () => { drawV(false); voltarTxt.setColor('#74c69d'); });
      zV.on('pointerdown', () => { this._fecharCard(); this.selectedIdx = -1; this._desenharSelecao(); });
      objs.push(zV);
    }

    this.cardObjs = objs;
  }

  // -------------------------------------------------------------------------
  // Garimpo — card de perfil do garimpeiro
  // -------------------------------------------------------------------------
  _fecharCard() {
    this.cardObjs.forEach(o => { if (o.active) o.destroy(); });
    this.cardObjs = [];
  }

  _calcularChance(hex) {
    const base   = 0.45;
    const nTec   = this._contarMembros('tecnico_negociacao');
    const bonus  = (hex.perfil?.bonus ?? 0) + hex.bonusNegociacao + (nTec * 0.10);
    return Math.min(0.90, Math.max(0.05, base + bonus));
  }

  _cardGarimpeiro(idx) { this._dialogoGarimpeiro(idx); }  // alias legado

  _dialogoGarimpeiro(idx) {
    if (!estadoJogo.equipe.some(m => m.tipo === 'tecnico_negociacao')) {
      this._notificar('🤝 Contrate um Técnico em Negociação para iniciar negociações.', 'informativo');
      return;
    }
    this._fecharMenu();
    const hex    = this.hexagonos[idx];
    const perfil = hex.perfil;
    if (!hex.nomeGarimpeiro) {
      hex.nomeGarimpeiro = NOMES_GARIMPEIROS[Math.floor(Math.random() * NOMES_GARIMPEIROS.length)];
    }
    const chanceGar = this._calcularChance(hex);
    this._cardDialogo({
      nome:        hex.nomeGarimpeiro,
      perfilLabel: perfil.nome,
      corAvatar:   perfil.corAvatar ?? 0x5a5a5a,
      fala:        perfil.falas?.abertura ?? perfil.descricao,
      tomFala:     'neutro',
      chance:      chanceGar,
      botoes: [{
        label:    'Apresentar proposta de saída',
        cor:      0x1b4332, corHover: 0x2d6a4f,
        onPress:  () => this._tentarNegociacaoGarimpeiro(idx),
      }],
    });
  }

  _tentarNegociacaoGarimpeiro(idx) {
    const hex    = this.hexagonos[idx];
    const perfil = hex.perfil;
    const chance = this._calcularChance(hex);

    if (Math.random() < chance) {
      hex.bonusNegociacao = 0;
      estadoJogo.negociacoesBemSucedidas++;
      this._cardDialogo({
        nome:        hex.nomeGarimpeiro,
        perfilLabel: perfil.nome,
        corAvatar:   perfil.corAvatar ?? 0x5a5a5a,
        fala:        perfil.falas?.aceitou ?? 'Tá bom. Vou embora.',
        tomFala:     'positivo',
        botoes: [{
          label:   'Fechar',
          cor:     0x1b4332, corHover: 0x2d6a4f,
          onPress: () => {
            this._fecharCard();
            this._mudarEstadoHex(idx, 'garimpo_neutralizado');
            this._notificar('✅ Garimpeiro aceitou a proposta.', 'positivo');
            this.selectedIdx = -1;
            this._desenharSelecao();
          },
        }],
      });
    } else {
      const nGarimpos     = this.hexagonos.filter(h => h.tipo === 'garimpo').length;
      const custoExtra    = Math.max(0, nGarimpos - 1) * 15000;
      const custoAguardar = 5000 + custoExtra;
      const semSaldo      = estadoJogo.dinheiro < custoAguardar;

      const chanceAtual = this._calcularChance(hex);
      this._cardDialogo({
        nome:        hex.nomeGarimpeiro,
        perfilLabel: perfil.nome,
        corAvatar:   perfil.corAvatar ?? 0x5a5a5a,
        fala:        perfil.falas?.recusou ?? 'Não vou sair daqui.',
        tomFala:     'negativo',
        chance:      chanceAtual,
        botoes: [
          {
            label:        '⏳ Aguardar e tentar novamente',
            sublabel:     `R$ ${custoAguardar.toLocaleString('pt-BR')} — +5% de chance na próxima`,
            cor:          0x1b4332, corHover: 0x2d6a4f,
            desabilitado: semSaldo,
            onPress: () => {
              estadoJogo.dinheiro -= custoAguardar;
              hex.bonusNegociacao = Math.min(0.30, hex.bonusNegociacao + 0.05);
              this.atualizarPainel();
              this._fecharCard();
              this.selectedIdx = -1;
              this._desenharSelecao();
              this._notificar('Equipe aguardando... bônus acumulado para próxima tentativa.', 'informativo');
              const durReab = DEV_MODE ? 5000 : 30000;
              this.time.delayedCall(durReab, () => {
                if (this.hexagonos[idx]?.tipo !== 'garimpo') return;
                this._cardDialogo({
                  nome:        hex.nomeGarimpeiro,
                  perfilLabel: perfil.nome,
                  corAvatar:   perfil.corAvatar ?? 0x5a5a5a,
                  fala:        perfil.falas?.reabriu ?? 'Fala logo o que quer.',
                  tomFala:     'neutro',
                  chance:      this._calcularChance(hex),
                  botoes: [{
                    label:   'Apresentar proposta de saída',
                    cor:     0x1b4332, corHover: 0x2d6a4f,
                    onPress: () => this._tentarNegociacaoGarimpeiro(idx),
                  }],
                });
              });
            },
          },
          {
            label:    '🚨 Denunciar ao Ibama',
            sublabel: 'Gratuito — resultado incerto, pode haver reação',
            cor:      0x2d1008, corHover: 0x4a1a0a, corLabel: '#e76f51',
            onPress:  () => this._fluxoIbamaConfirmar(idx),
          },
        ],
      });
    }
  }

  // Alias legado chamado de alguns caminhos antigos
  _executarNegociacao(idx) { this._tentarNegociacaoGarimpeiro(idx); }
  _mostrarFalhaOpcoes(idx) { this._tentarNegociacaoGarimpeiro(idx); }

  _fluxoIbamaConfirmar(idx) {
    this._cardDialogo({
      nome:        'Ibama',
      perfilLabel: 'Órgão Federal',
      corAvatar:   0x1b4332,
      fala:        'Você acionou o Ibama. O resultado é incerto e pode haver reação dos garimpeiros à fiscalização.',
      tomFala:     'neutro',
      botoes: [
        {
          label:    'Confirmar denúncia',
          cor:      0x2d1008, corHover: 0x4a1a0a, corLabel: '#e76f51',
          onPress:  () => this._fluxoIbama(idx),
        },
        {
          label:    'Cancelar',
          cor:      0x1b4332, corHover: 0x2d6a4f,
          onPress:  () => { this._fecharCard(); this.selectedIdx = -1; this._desenharSelecao(); },
        },
      ],
    });
  }

  // -------------------------------------------------------------------------
  // Garimpo — fluxo Ibama (timer + resultado aleatório)
  // -------------------------------------------------------------------------
  _fluxoIbama(idx) {
    const hex = this.hexagonos[idx];
    hex.bloqueado = true;
    this._fecharCard();
    this.selectedIdx = -1;
    this._desenharSelecao();
    this._notificar('🚨 Denúncia registrada. Aguardando resposta do Ibama...', 'informativo');
    this._piscarHex(idx);

    const dur = DEV_MODE ? 8 : 45;
    this._iniciarTimer(idx, dur, () => {
      hex.bloqueado = false;
      const r = Math.random();
      if (r < 0.40) {
        hex.bonusNegociacao = 0;
        this._mudarEstadoHex(idx, 'garimpo_neutralizado');
        this._cardDialogo({
          nome: 'Ibama', perfilLabel: 'Órgão Federal', corAvatar: 0x1b4332,
          fala: 'A operação foi bem-sucedida. O garimpo foi desativado.',
          tomFala: 'positivo',
          botoes: [{
            label: 'Fechar', cor: 0x1b4332, corHover: 0x2d6a4f,
            onPress: () => { this._fecharCard(); this.selectedIdx = -1; this._desenharSelecao(); },
          }],
        });
      } else if (r < 0.75) {
        estadoJogo.dinheiro -= 20000;
        let membroMsg = '';
        if (estadoJogo.equipe.length > 0) {
          const mIdx = Math.floor(Math.random() * estadoJogo.equipe.length);
          const m = estadoJogo.equipe[mIdx];
          this._demitirMembro(m.id);
          membroMsg = ` ${m.emoji} ${m.nome} saiu da equipe.`;
        }
        this.atualizarPainel();
        this._cardDialogo({
          nome: 'Ibama', perfilLabel: 'Órgão Federal', corAvatar: 0x8B2500,
          fala: `Os garimpeiros resistiram à fiscalização. Houve confronto. -R$ 20.000.${membroMsg}`,
          tomFala: 'negativo',
          botoes: [{
            label: 'Entendido', cor: 0x2d1008, corHover: 0x4a1a0a,
            onPress: () => { this._fecharCard(); this.selectedIdx = -1; this._desenharSelecao(); },
          }],
        });
      } else {
        this._cardDialogo({
          nome: 'Ibama', perfilLabel: 'Órgão Federal', corAvatar: 0x5a5a5a,
          fala: 'O Ibama registrou a denúncia mas não tomou providências desta vez.',
          tomFala: 'neutro',
          botoes: [{
            label: 'Fechar', cor: 0x1b4332, corHover: 0x2d6a4f,
            onPress: () => { this._fecharCard(); this.selectedIdx = -1; this._desenharSelecao(); },
          }],
        });
      }
    });
  }

  // -------------------------------------------------------------------------
  // Garimpo — piscada visual no hex durante espera Ibama
  // -------------------------------------------------------------------------
  _piscarHex(idx) {
    const hex = this.hexagonos[idx];
    let  vis  = true;
    const ev  = this.time.addEvent({
      delay: 400, loop: true,
      callback: () => {
        if (!hex.bloqueado) { ev.remove(); return; }
        vis = !vis;
        this.hoverG.clear();
        if (vis) {
          this.hoverG.fillStyle(0xe76f51, 0.35);
          this.hoverG.beginPath();
          this.hoverG.moveTo(hex.pts[0].x, hex.pts[0].y);
          for (let i = 1; i < 6; i++) this.hoverG.lineTo(hex.pts[i].x, hex.pts[i].y);
          this.hoverG.closePath();
          this.hoverG.fillPath();
        }
      },
    });
  }

  // -------------------------------------------------------------------------
  // Garimpo Neutralizado — menu pós-neutralização
  // -------------------------------------------------------------------------
  _menuGarimpoNeutralizado(idx) {
    const hex         = this.hexagonos[idx];
    const custoFito   = 35000;
    const custoVigia  = 20000;
    const semSaldo    = estadoJogo.dinheiro < custoFito;

    const acoes = [
      {
        label:        '🌱 Fitorremediação',
        custoStr:     `R$ ${custoFito.toLocaleString('pt-BR')} — ${DEV_MODE ? '12s' : '90s'}`,
        desabilitado: semSaldo,
        aviso:        semSaldo ? 'Saldo insuficiente' : null,
        onPress: () => {
          estadoJogo.dinheiro -= custoFito;
          this.atualizarPainel();
          this._fecharMenu();
          this.selectedIdx = -1;
          this._desenharSelecao();

          const dur = DEV_MODE ? 12 : 90;
          this._iniciarTimer(idx, dur, () => {
            this._mudarEstadoHex(idx, 'solo_preparado');
            this._notificar('🌱 Fitorremediação concluída! Solo preparado para vegetação nativa.', 'positivo');
          });
        },
      },
      {
        label:        hex.vigilancia ? '🔓 Desativar Vigilância' : '🔒 Ativar Vigilância',
        custoStr:     `R$ ${custoVigia.toLocaleString('pt-BR')}/ciclo`,
        desabilitado: !hex.vigilancia && estadoJogo.dinheiro < custoVigia,
        aviso:        (!hex.vigilancia && estadoJogo.dinheiro < custoVigia) ? 'Saldo insuficiente' : null,
        onPress: () => {
          if (!hex.vigilancia) {
            estadoJogo.dinheiro -= custoVigia;
            this.atualizarPainel();
          }
          hex.vigilancia = !hex.vigilancia;
          this._fecharMenu();
          this._mostrarToast(hex.vigilancia
            ? '🔒 Vigilância ativada. Área protegida contra reocupação.'
            : '🔓 Vigilância desativada.');
          // Redesenha lock emoji se vigilância ativa
          this._atualizarEmojiVigilancia(idx);
        },
      },
    ];

    this._abrirMenu(idx, {
      titulo:    'Garimpo Neutralizado',
      descricao: DESCRICOES['garimpo_neutralizado'],
      acoes,
    });
  }

  _atualizarEmojiVigilancia(idx) {
    const hex = this.hexagonos[idx];
    if (hex.tipo !== 'garimpo_neutralizado') return;
    hex.emojiTxt.setText(hex.vigilancia ? '🔒' : TIPOS['garimpo_neutralizado'].emoji);
  }

  // -------------------------------------------------------------------------
  // Garimpo — card educativo da fitorremediação (desativado temporariamente)
  // -------------------------------------------------------------------------
  // _cardFitorremediacao(idx) {
  //   // Card educativo sobre fitorremediação — será reaproveitado depois
  // }

  // -------------------------------------------------------------------------
  // Nascente degradada — menu com armadilha educativa
  // -------------------------------------------------------------------------
  _menuNascenteDegradada(idx) {
    const hex      = this.hexagonos[idx];
    const sem10    = estadoJogo.dinheiro < 10000;
    const sem45    = estadoJogo.dinheiro < 45000;

    this._abrirMenu(idx, {
      titulo:    'Nascente Degradada',
      descricao: DESCRICOES['nascente'],
      acoes: [
        {
          label:        '🌱 Plantar mudas nativas',
          custoStr:     'R$ 10.000',
          desabilitado: sem10,
          aviso:        sem10 ? 'Saldo insuficiente' : null,
          onPress: () => {
            estadoJogo.dinheiro -= 10000;
            this.atualizarPainel();
            this._fecharMenu();
            this.selectedIdx = -1;
            this._desenharSelecao();
            this._notificar('⚠️ Plantio falhou. O solo ainda não foi estabilizado — faça a bioengenharia primeiro. -R$ 10.000.', 'alerta');
          },
        },
        {
          label:        '⚙️ Bioengenharia das margens',
          custoStr:     'R$ 45.000',
          desabilitado: sem45,
          aviso:        sem45 ? 'Saldo insuficiente' : null,
          onPress: () => {
            estadoJogo.dinheiro -= 45000;
            this.atualizarPainel();
            this._fecharMenu();
            this.selectedIdx = -1;
            this._desenharSelecao();

            const dur = this._duracaoComEquipe(idx, DEV_MODE ? 10 : 75, 'nascente');
            this._iniciarTimer(idx, dur, () => {
              this._mudarEstadoHex(idx, 'nascente_bioengenharia');
              this._notificar('⚙️ Bioengenharia concluída! Clique na nascente para plantar.', 'agua');
            }, 0x4A90D9);
          },
        },
      ],
    });
  }

  // -------------------------------------------------------------------------
  // Nascente — card educativo de erro no plantio (desativado temporariamente)
  // -------------------------------------------------------------------------
  // _cardErroPlantioNascente(idx) {
  //   // Card educativo sobre erro de sequência no plantio — será reaproveitado depois
  // }

  // -------------------------------------------------------------------------
  // Nascente — Etapa 2: plantio de espécies hídricas
  // -------------------------------------------------------------------------
  _menuNascenteEtapa2(idx) {
    const custo    = 25000;
    const semSaldo = estadoJogo.dinheiro < custo;

    this._abrirMenu(idx, {
      titulo:    'Nascente — Etapa 2',
      descricao: 'Solo estabilizado. Plante espécies nativas hídricas.',
      acoes: [{
        label:        '🌿 Plantar espécies hídricas',
        custoStr:     `R$ ${custo.toLocaleString('pt-BR')}`,
        desabilitado: semSaldo,
        aviso:        semSaldo ? 'Saldo insuficiente' : null,
        onPress: () => {
          estadoJogo.dinheiro -= custo;
          this.atualizarPainel();
          this._fecharMenu();
          this.selectedIdx = -1;
          this._desenharSelecao();

          const dur = DEV_MODE ? 8 : 45;
          this._iniciarTimer(idx, dur, () => {
            const hex = this.hexagonos[idx];
            hex.producaoAgua = 500;
            if (estadoJogo.agua === null) estadoJogo.agua = 0;
            estadoJogo.agua += 500;
            this.atualizarPainel();
            this._mudarEstadoHex(idx, 'nascente_ativa');
            this._notificar('💧 Nascente recuperada! Esta nascente produz +500L/ciclo de água pura.', 'agua');
          }, 0x4A90D9);
        },
      }],
    });
  }

  // -------------------------------------------------------------------------
  // Nascente — menu após bioengenharia (estado nascente_bioengenharia)
  // -------------------------------------------------------------------------
  _menuNascenteBio(idx) {
    const custo    = 25000;
    const semSaldo = estadoJogo.dinheiro < custo;

    this._abrirMenu(idx, {
      titulo:    'Nascente Preparada',
      descricao: 'Solo estabilizado. Plante espécies nativas hídricas para recuperar a nascente.',
      acoes: [{
        label:        '🌿 Plantar espécies hídricas',
        custoStr:     `R$ ${custo.toLocaleString('pt-BR')}`,
        desabilitado: semSaldo,
        aviso:        semSaldo ? 'Saldo insuficiente' : null,
        onPress: () => {
          estadoJogo.dinheiro -= custo;
          this.atualizarPainel();
          this._fecharMenu();
          this.selectedIdx = -1;
          this._desenharSelecao();

          const dur = this._duracaoComEquipe(idx, DEV_MODE ? 8 : 45, 'nascente');
          this._iniciarTimer(idx, dur, () => {
            const hex = this.hexagonos[idx];
            hex.producaoAgua = 500;
            if (estadoJogo.agua === null) estadoJogo.agua = 0;
            estadoJogo.agua += 500;
            this.atualizarPainel();
            this._mudarEstadoHex(idx, 'nascente_ativa');
            this._notificar('💧 Nascente recuperada! Esta nascente produz +500L/ciclo de água pura.', 'agua');
          }, 0x4A90D9);
        },
      }],
    });
  }

  // -------------------------------------------------------------------------
  // Nascente — card comemorativo (desativado temporariamente)
  // -------------------------------------------------------------------------
  // _cardNascenteRecuperada(idx) {
  //   // Card comemorativo sobre nascente recuperada — será reaproveitado depois
  // }

  // -------------------------------------------------------------------------
  // Nascente ativa — menu de infraestrutura
  // -------------------------------------------------------------------------
  _menuNascenteAtiva(idx) {
    const hex       = this.hexagonos[idx];
    const custoBomba = 25000;
    const custoHidro = 60000;
    const semBomba   = estadoJogo.dinheiro < custoBomba;
    const semHidro   = estadoJogo.dinheiro < custoHidro;

    const acoes = [
      {
        label:        hex.temBomba
          ? '✅ Bomba d\'água instalada'
          : '💪 Instalar bomba d\'água',
        custoStr:     hex.temBomba
          ? 'Produção: 1.000L/ciclo'
          : `R$ ${custoBomba.toLocaleString('pt-BR')} — dobra a produção de água`,
        desabilitado: hex.temBomba || semBomba,
        aviso:        (!hex.temBomba && semBomba) ? 'Saldo insuficiente' : null,
        onPress: () => {
          estadoJogo.dinheiro -= custoBomba;
          hex.temBomba     = true;
          hex.producaoAgua = 1000;
          this.atualizarPainel();
          this._fecharMenu();
          this._notificar('💪 Bomba instalada! Produção de água dobrou para 1.000L/ciclo.', 'agua');
          // Ícone complementar sobre o hex
          this._adicionarIconeHex(idx, '⚙️', -20);
        },
      },
      {
        label:        hex.temHidroeletrica
          ? '✅ Microcentral instalada'
          : '⚡ Microcentral hidrelétrica',
        custoStr:     hex.temHidroeletrica
          ? 'Gerando 200kWh/ciclo'
          : `R$ ${custoHidro.toLocaleString('pt-BR')} — gera energia elétrica`,
        desabilitado: hex.temHidroeletrica || semHidro,
        aviso:        (!hex.temHidroeletrica && semHidro) ? 'Saldo insuficiente' : null,
        onPress: () => {
          estadoJogo.dinheiro -= custoHidro;
          hex.temHidroeletrica = true;
          if (estadoJogo.energia === null) estadoJogo.energia = 0;
          estadoJogo.energia += 200;
          this.atualizarPainel();
          this._fecharMenu();
          this._notificar('⚡ Microcentral ativa! +200kWh/ciclo de energia limpa.', 'agua');
          this._adicionarIconeHex(idx, '⚡', 20);
        },
      },
    ];

    this._abrirMenu(idx, {
      titulo:    'Nascente Ativa',
      descricao: `Produção: ${hex.producaoAgua.toLocaleString('pt-BR')}L/ciclo`,
      acoes,
    });
  }

  // Adiciona um emoji extra flutuando sobre o hex (para melhorias visuais)
  _adicionarIconeHex(idx, emoji, offsetX = 0) {
    const hex = this.hexagonos[idx];
    this.add.text(hex.cx + offsetX, hex.cy - 28, emoji, {
      fontSize: '14px', fontFamily: 'sans-serif',
    }).setOrigin(0.5).setDepth(4);
  }

  // -------------------------------------------------------------------------
  // Texto flutuante (produção de água, etc.)
  // -------------------------------------------------------------------------
  _mostrarTextoFlutuante(x, y, msg, cor = '#d8f3dc') {
    const txt = this.add.text(x, y, msg, {
      fontSize: '14px', color: cor,
      fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(15);

    this.tweens.add({
      targets: txt, y: y - 30, alpha: 0,
      duration: 1500, ease: 'Power1',
      onComplete: () => txt.destroy(),
    });
  }

  // -------------------------------------------------------------------------
  // Ciclo de água (produção periódica das nascentes ativas)
  // -------------------------------------------------------------------------
  _cicloAgua() {
    const dur = DEV_MODE ? 15000 : 60000;
    this.time.addEvent({
      delay: dur, loop: true,
      callback: () => {
        let producaoTotal = 0;
        this.hexagonos.forEach(hex => {
          if (hex.tipo !== 'nascente_ativa') return;
          producaoTotal += hex.producaoAgua;
          this._mostrarTextoFlutuante(
            hex.cx, hex.cy - 40,
            `+${hex.producaoAgua.toLocaleString('pt-BR')}L`,
            '#4A90D9'
          );
        });
        if (producaoTotal > 0) {
          if (estadoJogo.agua === null) estadoJogo.agua = 0;
          estadoJogo.agua += producaoTotal;
          this.atualizarPainel();
        }
      },
    });
  }

  // -------------------------------------------------------------------------
  // Área Indígena — helpers de vizinhança
  // -------------------------------------------------------------------------
  _vizinhosHexRaio(idx, raio) {
    const visitados = new Set([idx]);
    let fronteira = [idx];
    for (let r = 0; r < raio; r++) {
      const proxima = [];
      fronteira.forEach(i => {
        this._vizinhosHex(i).forEach(vi => {
          if (!visitados.has(vi)) { visitados.add(vi); proxima.push(vi); }
        });
      });
      fronteira = proxima;
    }
    visitados.delete(idx);
    return [...visitados];
  }

  _contarVizinhosRestaurados(idx) {
    const RESTAURADOS = ['solo_preparado', 'floresta_pioneira', 'floresta', 'nascente_ativa', 'garimpo_neutralizado'];
    return this._vizinhosHex(idx).filter(vi => RESTAURADOS.includes(this.hexagonos[vi].tipo)).length;
  }

  // -------------------------------------------------------------------------
  // Área Indígena — semáforo visual
  // -------------------------------------------------------------------------
  _redesenharSemaforos() {
    this.semaforoG.clear();
    const COR_SEM = { vermelho: 0xC1440E, amarelo: 0xC8A951, verde: 0x52b788 };

    const _desenhar = (hex, estado, marcador = false) => {
      const cor = COR_SEM[estado];
      const sx = hex.cx + 26, sy = hex.cy - 22;
      this.semaforoG.fillStyle(0x0d2818, 1);
      this.semaforoG.fillCircle(sx, sy, 9);
      this.semaforoG.fillStyle(cor, 1);
      this.semaforoG.fillCircle(sx, sy, 7);
      if (marcador) {
        this.semaforoG.fillStyle(0xFFD700, 1);
        this.semaforoG.fillCircle(sx, sy, 3);
      }
    };

    this.hexagonos.forEach(hex => {
      if (hex.tipo === 'indigena' && hex.semaforoIndigena)
        _desenhar(hex, hex.semaforoIndigena, hex.aliancaCompleta);
      if (hex.tipo === 'pecuaria' && hex.semaforoPecuaria)
        _desenhar(hex, hex.semaforoPecuaria, false);
    });
  }

  // -------------------------------------------------------------------------
  // Área Indígena — avaliação automática de upgrades/downgrades
  // -------------------------------------------------------------------------
  _verificarSemaforosIndigenas() {
    const RESTAURADOS = ['solo_preparado', 'floresta_pioneira', 'floresta', 'nascente_ativa', 'garimpo_neutralizado'];
    const temNascenteAtiva = this.hexagonos.some(h => h.tipo === 'nascente_ativa');

    this.hexagonos.forEach((hex, idx) => {
      if (hex.tipo !== 'indigena') return;

      // Ameaça: garimpo ativo num raio de 2 → regride
      const vizR2 = this._vizinhosHexRaio(idx, 2);
      const temGarimpoProximo = vizR2.some(vi => this.hexagonos[vi].tipo === 'garimpo');
      if (temGarimpoProximo) {
        if (hex.semaforoIndigena === 'verde' && !hex.aliancaCompleta) {
          hex.semaforoIndigena = 'amarelo';
          this._mostrarNotificacaoIndigena('⚠️ O garimpo próximo está ameaçando a comunidade indígena.');
        } else if (hex.semaforoIndigena === 'amarelo') {
          hex.semaforoIndigena = 'vermelho';
          this._mostrarNotificacaoIndigena('⚠️ O garimpo próximo está ameaçando a comunidade indígena.');
        }
        this._redesenharSemaforos();
        return;
      }

      // Upgrade: vermelho → amarelo
      if (hex.semaforoIndigena === 'vermelho') {
        const vizR1 = this._vizinhosHex(idx);
        const temRestauracaoVizinha = vizR1.some(vi => RESTAURADOS.includes(this.hexagonos[vi].tipo));
        if (temRestauracaoVizinha || temNascenteAtiva) {
          hex.semaforoIndigena = 'amarelo';
          this._mostrarNotificacaoIndigena('🪶 A comunidade indígena está observando suas ações. O diálogo agora é possível.');
        }
      }

      // Upgrade: amarelo → verde
      if (hex.semaforoIndigena === 'amarelo' && !hex.aliancaCompleta) {
        const temDuasParcerias       = hex.parcerias.length >= 2;
        const vizinhosRestaurados    = this._contarVizinhosRestaurados(idx) >= 3;
        if (temDuasParcerias && vizinhosRestaurados) {
          hex.semaforoIndigena = 'verde';
          this._mostrarNotificacaoIndigena('🌿 Aliança consolidada! O Plano de Gestão Territorial agora está disponível.');
        }
      }
    });

    this._redesenharSemaforos();
  }

  _mostrarNotificacaoIndigena(msg) {
    const { width } = this.scale;
    const H = 36;
    const bgG = this.add.graphics().setDepth(25);
    bgG.fillStyle(0x3a1a5a, 1);
    bgG.fillRect(0, 70, width, H);
    const txt = this.add.text(width / 2, 70 + H / 2, msg, {
      fontSize: '13px', color: '#d4b8f0',
      fontFamily: 'Inter, sans-serif',
    }).setOrigin(0.5).setDepth(25);
    this.tweens.add({
      targets: [bgG, txt], alpha: 0, delay: 3500, duration: 600,
      onComplete: () => { bgG.destroy(); txt.destroy(); },
    });
  }

  // -------------------------------------------------------------------------
  // Área Indígena — dispatcher e menus
  // -------------------------------------------------------------------------
  _menuIndigena(idx) {
    const hex = this.hexagonos[idx];
    if (hex.semaforoIndigena === 'vermelho') {
      this._abrirMenu(idx, {
        titulo:      '🪶 Área Indígena',
        descricao:   'Esta comunidade ainda não confia em você. Restaure áreas próximas para abrir o diálogo.',
        tituloColor: '#7B4FA6',
        acoes:       [],
      });
    } else {
      this._cardIndigena(idx);
    }
  }

  _cardIndigena(idx) {
    this._fecharMenu();
    this._fecharCard();

    const hex    = this.hexagonos[idx];
    const perfil = hex.perfilLideranca;
    const vizBon = this._vizinhosHex(idx).filter(vi =>
      ['solo_preparado','floresta_pioneira','floresta','nascente_ativa','garimpo_neutralizado']
        .includes(this.hexagonos[vi].tipo)
    ).length;
    const temTecnico = estadoJogo.equipe.some(m => m.tipo === 'tecnico_negociacao');

    const chance = Math.min(0.90, perfil.chanceBase + hex.bonusDialogo
      + (vizBon > 0 ? 0.15 : 0)
      + (temTecnico ? 0.10 : 0));
    const pct = Math.round(chance * 100);

    const { width, height } = this.scale;
    const CARD_W = 400, CARD_H = 310;
    const cx = width / 2 - CARD_W / 2, cy = height / 2 - CARD_H / 2;
    const DEPTH = 20, objs = [];

    const overlay = this.add.graphics().setDepth(DEPTH - 1);
    overlay.fillStyle(0x000000, 0.55);
    overlay.fillRect(0, 0, width, height);
    objs.push(overlay);

    const bgG = this.add.graphics().setDepth(DEPTH);
    bgG.fillStyle(0x0d1a2a, 1);
    bgG.fillRoundedRect(cx, cy, CARD_W, CARD_H, 10);
    bgG.lineStyle(1.5, 0x7B4FA6, 1);
    bgG.strokeRoundedRect(cx, cy, CARD_W, CARD_H, 10);
    objs.push(bgG);

    objs.push(this.add.text(cx + 20, cy + 18, '🪶  Área Indígena', {
      fontSize: '16px', color: '#7B4FA6',
      fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
    }).setDepth(DEPTH));

    objs.push(this.add.text(cx + 20, cy + 50, perfil.nome, {
      fontSize: '18px', color: '#d4b8f0',
      fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
    }).setDepth(DEPTH));

    objs.push(this.add.text(cx + 20, cy + 76, perfil.descricao, {
      fontSize: '12px', color: '#d8f3dc', fontFamily: 'Inter, sans-serif',
      wordWrap: { width: CARD_W - 40 }, lineSpacing: 3,
    }).setDepth(DEPTH));

    const divG = this.add.graphics().setDepth(DEPTH);
    divG.lineStyle(1, 0x3a1a5a, 1);
    divG.lineBetween(cx + 20, cy + 132, cx + CARD_W - 20, cy + 132);
    objs.push(divG);

    objs.push(this.add.text(cx + 20, cy + 144, `Chance de diálogo bem-sucedido: ${pct}%`, {
      fontSize: '13px', color: '#74c69d', fontFamily: 'Inter, sans-serif',
    }).setDepth(DEPTH));

    const modLines = [];
    if (vizBon > 0) modLines.push(`+15% por benfeitoria no entorno (${vizBon} vizinho${vizBon > 1 ? 's' : ''} restaurado${vizBon > 1 ? 's' : ''})`);
    if (temTecnico)  modLines.push('+10% com técnico de negociação');
    if (hex.bonusDialogo > 0) modLines.push(`+${Math.round(hex.bonusDialogo * 100)}% de tentativas anteriores`);

    if (modLines.length > 0) {
      objs.push(this.add.text(cx + 20, cy + 164, modLines.join('\n'), {
        fontSize: '11px', color: '#52b788', fontFamily: 'Inter, sans-serif',
        lineSpacing: 3,
      }).setDepth(DEPTH));
    }

    // Estado: bloqueado por tentativa recente?
    const bloqueado = hex.dialogoBloqueado;

    // Botão diálogo
    const btn1Y = cy + CARD_H - 56, BTN_W = 170, BTN_H = 38;
    const btn1G = this.add.graphics().setDepth(DEPTH);
    const desB1 = h => {
      btn1G.clear();
      btn1G.fillStyle(bloqueado ? 0x1a0e2a : (h ? 0x4a2a6a : 0x2d1a4a), 1);
      btn1G.fillRoundedRect(cx + 20, btn1Y, BTN_W, BTN_H, 6);
    };
    desB1(false); objs.push(btn1G);

    objs.push(this.add.text(cx + 20 + BTN_W / 2, btn1Y + BTN_H / 2,
      bloqueado ? '⏳ Aguardar...' : 'Iniciar diálogo', {
      fontSize: '13px', color: bloqueado ? '#4a3060' : '#d4b8f0',
      fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(DEPTH));

    if (!bloqueado) {
      const z1 = this.add.zone(cx + 20 + BTN_W / 2, btn1Y + BTN_H / 2, BTN_W, BTN_H)
        .setDepth(DEPTH).setInteractive({ useHandCursor: true });
      z1.on('pointerover', () => desB1(true)); z1.on('pointerout', () => desB1(false));
      z1.on('pointerdown', () => { this._fecharCard(); this._executarDialogo(idx); });
      objs.push(z1);
    }

    // Botão fechar
    const btn2G = this.add.graphics().setDepth(DEPTH);
    const desB2 = h => {
      btn2G.clear();
      btn2G.fillStyle(h ? 0x1a1a2a : 0x0e0e1a, 1);
      btn2G.fillRoundedRect(cx + CARD_W - 20 - BTN_W, btn1Y, BTN_W, BTN_H, 6);
    };
    desB2(false); objs.push(btn2G);

    objs.push(this.add.text(cx + CARD_W - 20 - BTN_W / 2, btn1Y + BTN_H / 2, 'Fechar', {
      fontSize: '13px', color: '#74c69d', fontFamily: 'Inter, sans-serif',
    }).setOrigin(0.5).setDepth(DEPTH));

    const z2 = this.add.zone(cx + CARD_W - 20 - BTN_W / 2, btn1Y + BTN_H / 2, BTN_W, BTN_H)
      .setDepth(DEPTH).setInteractive({ useHandCursor: true });
    z2.on('pointerover', () => desB2(true)); z2.on('pointerout', () => desB2(false));
    z2.on('pointerdown', () => { this._fecharCard(); this.selectedIdx = -1; this._desenharSelecao(); });
    objs.push(z2);

    this.cardObjs = objs;
  }

  _executarDialogo(idx) {
    const hex    = this.hexagonos[idx];
    const vizBon = this._vizinhosHex(idx).filter(vi =>
      ['solo_preparado','floresta_pioneira','floresta','nascente_ativa','garimpo_neutralizado']
        .includes(this.hexagonos[vi].tipo)
    ).length;
    const temTecnico = estadoJogo.equipe.some(m => m.tipo === 'tecnico_negociacao');
    const chance = Math.min(0.90, hex.perfilLideranca.chanceBase + hex.bonusDialogo
      + (vizBon > 0 ? 0.15 : 0) + (temTecnico ? 0.10 : 0));

    if (Math.random() < chance) {
      // Sucesso
      hex.bonusDialogo = 0;
      this._mostrarToast('✅ Diálogo bem-sucedido! A liderança aceitou conversar.');
      this._menuParceriasIndigenas(idx);
    } else {
      // Falha — bloqueia por 45s/8s
      hex.bonusDialogo = Math.min(0.40, hex.bonusDialogo + 0.10);
      hex.dialogoBloqueado = true;
      this._mostrarToast('A liderança não está pronta para conversar. Tente novamente em breve.');
      const dur = DEV_MODE ? 8000 : 45000;
      this.time.delayedCall(dur, () => { hex.dialogoBloqueado = false; });
    }
  }

  _menuParceriasIndigenas(idx) {
    const hex        = this.hexagonos[idx];
    const temSem     = hex.parcerias.includes('sementes');
    const temBrig    = hex.parcerias.includes('brigadistas');
    const podePGT    = hex.semaforoIndigena === 'verde';
    const semSaldo15 = estadoJogo.dinheiro < 15000;
    const semSaldo7  = estadoJogo.dinheiro < 7000;
    const semSaldo150 = estadoJogo.dinheiro < 150000;

    const acoes = [
      {
        label:        temSem ? '✅ Sementes ativas' : '🌰 Comprar sementes e castanhas',
        custoStr:     temSem ? 'R$ 15.000/ciclo ativo' : 'R$ 15.000/ciclo',
        desabilitado: temSem || semSaldo15,
        aviso:        (!temSem && semSaldo15) ? 'Saldo insuficiente' : null,
        onPress: () => {
          estadoJogo.dinheiro -= 15000;
          hex.parcerias.push('sementes');
          this.atualizarPainel();
          this._fecharMenu();
          this._adicionarIconeHex(idx, '🌰', -20);
          this._verificarSemaforosIndigenas();
          this._mostrarToast('🌰 Parceria de sementes ativa! R$ 15.000/ciclo.');
        },
      },
      {
        label:        temBrig ? '✅ Brigadistas ativos' : '🔥 Contratar brigadistas indígenas',
        custoStr:     temBrig ? 'R$ 7.000/ciclo ativo' : 'R$ 7.000/ciclo por brigadista',
        desabilitado: temBrig || semSaldo7,
        aviso:        (!temBrig && semSaldo7) ? 'Saldo insuficiente' : null,
        onPress: () => {
          estadoJogo.dinheiro -= 7000;
          hex.parcerias.push('brigadistas');
          estadoJogo.equipe.push({ tipo: 'brigadista_indigena', origem: idx });
          this.atualizarPainel();
          this._fecharMenu();
          this._adicionarIconeHex(idx, '🛡️', 20);
          this._verificarSemaforosIndigenas();
          this._mostrarToast('🔥 Brigadistas contratados! Combate a incêndio 50% mais rápido.');
        },
      },
    ];

    if (podePGT) {
      acoes.push({
        label:        '📋 Plano de Gestão Territorial',
        custoStr:     `R$ 150.000 — aliança permanente`,
        desabilitado: semSaldo150,
        aviso:        semSaldo150 ? 'Saldo insuficiente' : null,
        onPress: () => {
          estadoJogo.dinheiro -= 150000;
          this.atualizarPainel();
          this._fecharMenu();
          this.selectedIdx = -1; this._desenharSelecao();
          const dur = DEV_MODE ? 15 : 120;
          this._iniciarTimer(idx, dur, () => {
            hex.aliancaCompleta   = true;
            hex.semaforoIndigena  = 'verde';
            estadoJogo.aliancaIndigena = true;
            estadoJogo.negociacoesBemSucedidas++;
            this._redesenharSemaforos();
            this._cardAliancaHistorica(idx);
          }, 0x7B4FA6);
        },
      });
    }

    this._abrirMenu(idx, {
      titulo:      '🪶 Parcerias com a comunidade',
      descricao:   'Escolha como colaborar com a liderança indígena.',
      tituloColor: '#7B4FA6',
      acoes,
    });
  }

  // -------------------------------------------------------------------------
  // Área Indígena — card de aliança histórica
  // -------------------------------------------------------------------------
  _cardAliancaHistorica(idx) {
    this._fecharCard();
    const { width, height } = this.scale;
    const CARD_W = 420, CARD_H = 240;
    const cx = width / 2 - CARD_W / 2, cy = height / 2 - CARD_H / 2;
    const DEPTH = 20, objs = [];

    const overlay = this.add.graphics().setDepth(DEPTH - 1);
    overlay.fillStyle(0x000000, 0.55);
    overlay.fillRect(0, 0, width, height);
    objs.push(overlay);

    const bgG = this.add.graphics().setDepth(DEPTH);
    bgG.fillStyle(0x0d0d1a, 1);
    bgG.fillRoundedRect(cx, cy, CARD_W, CARD_H, 10);
    bgG.lineStyle(1.5, 0x7B4FA6, 1);
    bgG.strokeRoundedRect(cx, cy, CARD_W, CARD_H, 10);
    objs.push(bgG);

    objs.push(this.add.text(cx + 20, cy + 18, '🪶 Aliança histórica!', {
      fontSize: '18px', color: '#d4b8f0',
      fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
    }).setDepth(DEPTH));

    objs.push(this.add.text(cx + 20, cy + 56,
      'A comunidade indígena é agora guardiã permanente deste território. Um raio de 2 hexágonos está protegido com 80% menos risco de garimpo e queimada criminosa. Todas as negociações na região ganham +20% de bônus.',
      { fontSize: '12px', color: '#d8f3dc', fontFamily: 'Inter, sans-serif',
        wordWrap: { width: CARD_W - 40 }, lineSpacing: 4 }
    ).setDepth(DEPTH));

    const btnY = cy + CARD_H - 52, BTN_W = 200, BTN_H = 36;
    const btnG = this.add.graphics().setDepth(DEPTH);
    const desBt = h => { btnG.clear(); btnG.fillStyle(h ? 0x4a2a6a : 0x2d1a4a, 1);
      btnG.fillRoundedRect(cx + CARD_W / 2 - BTN_W / 2, btnY, BTN_W, BTN_H, 6); };
    desBt(false); objs.push(btnG);

    objs.push(this.add.text(cx + CARD_W / 2, btnY + BTN_H / 2, '⭐ Celebrar!', {
      fontSize: '14px', color: '#d4b8f0',
      fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(DEPTH));

    const z = this.add.zone(cx + CARD_W / 2, btnY + BTN_H / 2, BTN_W, BTN_H)
      .setDepth(DEPTH).setInteractive({ useHandCursor: true });
    z.on('pointerover', () => desBt(true)); z.on('pointerout', () => desBt(false));
    z.on('pointerdown', () => { this._fecharCard(); this.selectedIdx = -1; this._desenharSelecao(); });
    objs.push(z);
    this.cardObjs = objs;
  }

  // -------------------------------------------------------------------------
  // Pecuária — helpers de cálculo
  // -------------------------------------------------------------------------
  _calcularChanceContatoPec(idx) {
    const hex = this.hexagonos[idx];
    const pf  = hex.perfilFazendeiro;
    const temPSA    = estadoJogo.psaAtivo;
    const temSAFViz = this._vizinhosHex(idx).some(vi => this.hexagonos[vi].tipo === 'saf');
    const nTec      = this._contarMembros('tecnico_negociacao');
    let chance = 0.40 + (pf ? pf.bonusContato : 0) + hex.bonusContatoPec;
    if (temPSA)    chance += 0.20;
    if (temSAFViz) chance += 0.15;
    chance += nTec * 0.10;
    if (pf?.id === 'oportunista' && temPSA) chance += pf.bonusPSA;
    return Math.min(0.90, Math.max(0.05, chance));
  }

  // -------------------------------------------------------------------------
  // Pecuária — menus
  // -------------------------------------------------------------------------
  _menuPecuaria(idx) {
    const hex = this.hexagonos[idx];
    // Cancela invasão pendente — jogador está interagindo
    if (hex.invasaoTimer) { hex.invasaoTimer.remove(); hex.invasaoTimer = null; }
    if (hex.semaforoPecuaria === 'vermelho') this._menuPecuariaVermelho(idx);
    else if (hex.semaforoPecuaria === 'verde') this._menuPecuariaVerde(idx);
    else {
      // amarelo — contato estabelecido, oferece propostas via diálogo
      if (hex.contatoBloqueado) {
        this._notificar('O fazendeiro pediu prazo. Aguarde antes de nova tentativa.', 'informativo');
        return;
      }
      this._fecharMenu();
      this._dialogoFazendeiroPropostas(idx, 0);
    }
  }

  _menuPecuariaVermelho(idx) {
    const hex     = this.hexagonos[idx];
    const chance  = this._calcularChanceContatoPec(idx);
    const pct     = Math.round(chance * 100);
    const bloq    = hex.contatoBloqueado;
    const temTec  = estadoJogo.equipe.some(m => m.tipo === 'tecnico_negociacao');

    this._abrirMenu(idx, {
      titulo:      '🐄 Pecuária / Soja',
      descricao:   `Propriedade sem contato. Chance de abertura: ${pct}%`,
      tituloColor: '#C8A951',
      acoes: [{
        label:        bloq ? '⏳ Aguardar cooldown...' : !temTec ? '🔒 Iniciar contato' : '📞 Iniciar contato',
        custoStr:     'Gratuito',
        desabilitado: bloq || !temTec,
        aviso:        !temTec
          ? 'Contrate um Técnico em Negociação para iniciar contato.'
          : bloq ? 'Fazendeiro não atendeu. Aguarde antes de tentar de novo.' : null,
        onPress: () => {
          this._fecharMenu();
          this._executarContatoPecuaria(idx);
        },
      }],
    });
  }

  _executarContatoPecuaria(idx) {
    const hex    = this.hexagonos[idx];
    const chance = this._calcularChanceContatoPec(idx);

    if (Math.random() < chance) {
      hex.semaforoPecuaria = 'amarelo';
      hex.bonusContatoPec  = 0;
      // Cancela timer de expansão
      if (hex.expansaoTimer) { hex.expansaoTimer.remove(); hex.expansaoTimer = null; }
      this._redesenharSemaforos();
      this._cardApresentacaoFazendeiro(idx);
    } else {
      hex.bonusContatoPec = Math.min(0.30, hex.bonusContatoPec + 0.10);
      hex.contatoBloqueado = true;
      const dur = DEV_MODE ? 8000 : 45000;
      this.time.delayedCall(dur, () => { hex.contatoBloqueado = false; });
      this._mostrarToast('O fazendeiro não atendeu. Tente novamente em breve.');
    }
  }

  _cardApresentacaoFazendeiro(idx) {
    this._fecharCard();
    const hex = this.hexagonos[idx];
    const pf  = hex.perfilFazendeiro;
    // Redireciona para o novo sistema de diálogo RPG
    this._cardDialogo({
      nome:        pf.nomePropio,
      perfilLabel: pf.nome,
      idade:       pf.idade,
      corAvatar:   pf.corAvatar ?? 0xC8A951,
      fala:        pf.falas?.abertura ?? pf.frase,
      tomFala:     'neutro',
      botoes: [{
        label:    'Apresentar proposta',
        cor:      0x1a1200, corHover: 0x3a2a00, corLabel: '#C8A951',
        onPress:  () => this._dialogoFazendeiroPropostas(idx, 0),
      }],
    });
  }

  _dialogoFazendeiroPropostas(idx, tentativas) {
    const hex    = this.hexagonos[idx];
    const pf     = hex.perfilFazendeiro;
    const temPSA = estadoJogo.psaAtivo;
    const verde  = hex.semaforoPecuaria === 'verde';
    const temCC  = estadoJogo.creditoCarbono;
    const sem80  = estadoJogo.dinheiro < 80000;
    const sem20  = estadoJogo.dinheiro < 20000;
    const sem60  = estadoJogo.dinheiro < 60000;
    const sem30  = estadoJogo.dinheiro < 30000;
    const semMud = estadoJogo.mudas < 1000;
    const nTec   = this._contarMembros('tecnico_negociacao');

    // Compute displayed final chances (base + perfil bonus + técnico)
    const ch = (base, extra = 0) => Math.min(0.90, base + nTec * 0.10 + extra);
    const chSAF  = ch(0.55,
      (pf?.id === 'endividado' ? pf.bonusSAF ?? 0 : 0) +
      (pf?.id === 'oportunista' && temPSA ? pf.bonusPSA ?? 0 : 0));
    const chInt  = ch(0.70);
    const chMan  = ch(0.45);
    const chRef  = ch(0.65);
    const chCarb = pf?.id === 'oportunista' ? ch(0.85) : ch(0.55);

    const botoes = [
      {
        icone:        '🌾',
        label:        'SAF — Sistema Agroflorestal',
        sublabel:     sem80 ? 'Saldo insuficiente' : 'Gera R$ 10.000/ciclo',
        custo:        sem80 ? '— sem saldo' : 'R$ 80.000',
        chanceBase:   sem80 ? undefined : chSAF,
        recomendado:  !sem80,
        desabilitado: sem80,
        onPress:      () => this._tentarPropostaFazendeiro(idx, 'saf', tentativas),
      },
      {
        icone:        '🐄',
        label:        'Pecuária Organizada',
        sublabel:     sem20 ? 'Saldo insuficiente' : 'Organiza o rebanho, reduz impacto',
        custo:        sem20 ? '— sem saldo' : 'R$ 20.000',
        chanceBase:   sem20 ? undefined : chInt,
        desabilitado: sem20,
        onPress:      () => this._tentarPropostaFazendeiro(idx, 'intensiva', tentativas),
      },
      {
        icone:        '🪵',
        label:        'Manejo Florestal',
        sublabel:     sem60 ? 'Saldo insuficiente' : 'Gera R$ 5.000/ciclo',
        custo:        sem60 ? '— sem saldo' : 'R$ 60.000',
        chanceBase:   sem60 ? undefined : chMan,
        desabilitado: sem60,
        onPress:      () => this._tentarPropostaFazendeiro(idx, 'manejo', tentativas),
      },
    ];

    if (verde && temPSA) {
      const bloq = sem30 || semMud;
      botoes.push({
        icone:        '🌳',
        label:        'Reflorestamento Nativo',
        sublabel:     bloq ? (sem30 ? 'Saldo insuficiente' : 'Mudas insuficientes') : 'R$ 30.000 + 1.000 mudas',
        custo:        bloq ? '— sem recursos' : 'R$ 30.000',
        chanceBase:   bloq ? undefined : chRef,
        desabilitado: bloq,
        onPress:      () => this._tentarPropostaFazendeiro(idx, 'reflorestamento', tentativas),
      });
    }

    if (temCC) {
      botoes.push({
        icone:        '💨',
        label:        'Crédito de Carbono',
        sublabel:     sem20 ? 'Saldo insuficiente' : 'Floresta pioneira + bônus carbono',
        custo:        sem20 ? '— sem saldo' : 'R$ 20.000',
        chanceBase:   sem20 ? undefined : chCarb,
        cor:          sem20 ? undefined : 0x0d2030,
        desabilitado: sem20,
        onPress:      () => this._tentarPropostaFazendeiro(idx, 'carbono', tentativas),
      });
    }

    // Melhor chance disponível entre as propostas habilitadas → header
    const habBotoes = botoes.filter(b => !b.desabilitado && b.chanceBase !== undefined);
    const melhorChance = habBotoes.length > 0
      ? Math.max(...habBotoes.map(b => b.chanceBase))
      : undefined;

    this._cardDialogo({
      nome:        pf.nomePropio,
      perfilLabel: pf.nome,
      idade:       pf.idade,
      corAvatar:   pf.corAvatar ?? 0xC8A951,
      fala:        pf.falas?.proposta ?? 'Fala o que você tem pra oferecer.',
      tomFala:     'neutro',
      chance:      melhorChance,
      botoes,
    });
  }

  _tentarPropostaFazendeiro(idx, tipo, tentativas) {
    const hex = this.hexagonos[idx];
    const pf  = hex.perfilFazendeiro;
    const nTec = this._contarMembros('tecnico_negociacao');

    let chance = { saf: 0.55, intensiva: 0.70, manejo: 0.45, reflorestamento: 0.65, carbono: 0.55 }[tipo] ?? 0.50;
    if (tipo === 'saf' && pf?.id === 'endividado') chance += (pf.bonusSAF ?? 0);
    if (tipo === 'saf' && pf?.id === 'oportunista' && estadoJogo.psaAtivo) chance += (pf.bonusPSA ?? 0);
    if (tipo === 'carbono' && pf?.id === 'oportunista') chance = 0.85;
    chance += nTec * 0.10;
    chance = Math.min(0.90, chance);

    if (Math.random() < chance) {
      this._executarPropostaFazendeiro(idx, tipo);
    } else {
      const FALAS = {
        saf: pf.falas?.recusaSAF, intensiva: pf.falas?.recusaIntensiva,
        manejo: pf.falas?.recusaManejo, reflorestamento: pf.falas?.recusaReflorestamento,
        carbono: pf.falas?.recusaCarbono,
      };
      const fala = FALAS[tipo] ?? 'Não me convenceu. Tente outra coisa.';
      const novasTentativas = tentativas + 1;

      if (novasTentativas >= 2) {
        this._cardDialogo({
          nome: pf.nomePropio, perfilLabel: pf.nome, idade: pf.idade,
          corAvatar: pf.corAvatar ?? 0xC8A951,
          fala: pf.falas?.encerrou ?? 'Por hoje chega. Volte outro dia.',
          tomFala: 'negativo',
          botoes: [{
            label: 'Fechar', cor: 0x2d1008, corHover: 0x4a1a0a,
            onPress: () => {
              this._fecharCard();
              hex.contatoBloqueado = true;
              const dur = DEV_MODE ? 8000 : 45000;
              this.time.delayedCall(dur, () => { hex.contatoBloqueado = false; });
              this.selectedIdx = -1; this._desenharSelecao();
              this._iniciarInvasaoPasto(idx);
            },
          }],
        });
      } else {
        this._cardDialogo({
          nome: pf.nomePropio, perfilLabel: pf.nome, idade: pf.idade,
          corAvatar: pf.corAvatar ?? 0xC8A951, fala, tomFala: 'negativo',
          botoes: [{
            label:    'Tentar outra proposta',
            cor:      0x1a1200, corHover: 0x3a2a00, corLabel: '#C8A951',
            onPress:  () => this._dialogoFazendeiroPropostas(idx, novasTentativas),
          }],
        });
      }
    }
  }

  _executarPropostaFazendeiro(idx, tipo) {
    const hex = this.hexagonos[idx];
    const pf  = hex.perfilFazendeiro;
    const FALAS = {
      saf: pf.falas?.aceitaSAF, intensiva: pf.falas?.aceitaIntensiva,
      manejo: pf.falas?.aceitaManejo, reflorestamento: pf.falas?.aceitaReflorestamento,
      carbono: pf.falas?.aceitaCarbono,
    };
    const fala = FALAS[tipo] ?? 'Tá bom. Vamos fazer.';

    estadoJogo.negociacoesBemSucedidas++;
    let custo = 0, dur = 0;
    if (tipo === 'saf')            { custo = 80000; dur = DEV_MODE ? 10 : 60; }
    if (tipo === 'intensiva')      { custo = 20000; dur = DEV_MODE ? 5  : 30; }
    if (tipo === 'manejo')         { custo = 60000; dur = DEV_MODE ? 8  : 45; }
    if (tipo === 'reflorestamento'){ custo = 30000; dur = DEV_MODE ? 10 : 75; estadoJogo.mudas -= 1000; }
    if (tipo === 'carbono')        { custo = 20000; dur = DEV_MODE ? 8  : 60; }
    estadoJogo.dinheiro -= custo;
    this.atualizarPainel();

    this._cardDialogo({
      nome: pf.nomePropio, perfilLabel: pf.nome, idade: pf.idade,
      corAvatar: pf.corAvatar ?? 0xC8A951, fala, tomFala: 'positivo',
      botoes: [{
        label:    'Fechar e iniciar trabalho',
        cor:      0x1a1200, corHover: 0x3a2a00, corLabel: '#C8A951',
        onPress:  () => {
          this._fecharCard();
          this.selectedIdx = -1; this._desenharSelecao();
          this._executarConversaoPecuaria(idx, tipo, dur);
        },
      }],
    });
  }

  _executarConversaoPecuaria(idx, tipo, dur) {
    const hex = this.hexagonos[idx];
    if (tipo === 'saf') {
      this._iniciarTimer(idx, dur, () => {
        hex.receitaSAF = 10000; hex.parceiriaPec = 'saf'; hex.semaforoPecuaria = 'verde';
        this._mudarEstadoHex(idx, 'saf');
        this._notificar('🌾 SAF estabelecido! +R$ 10.000/ciclo.', 'positivo');
      }, 0x8B7355);
    } else if (tipo === 'intensiva') {
      this._iniciarTimer(idx, dur, () => {
        hex.parceiriaPec = 'intensiva'; hex.semaforoPecuaria = 'verde'; hex.receitaSAF = 3000;
        this._mudarEstadoHex(idx, 'pecuaria_intensiva');
        this._notificar('🐄 Pecuária intensiva adotada! +R$ 3.000/ciclo.', 'positivo');
      }, 0x9aaf5a);
    } else if (tipo === 'manejo') {
      this._iniciarTimer(idx, dur, () => {
        hex.receitaSAF = 5000; hex.parceiriaPec = 'manejo'; hex.semaforoPecuaria = 'verde';
        this._mudarEstadoHex(idx, 'manejo');
        this._notificar('🪵 Manejo florestal iniciado. +R$ 5.000/ciclo.', 'positivo');
      }, 0x4a7c4e);
    } else if (tipo === 'reflorestamento') {
      this._iniciarTimer(idx, dur, () => {
        this._mudarEstadoHex(idx, 'floresta_pioneira');
        this._notificar('🌳 Reflorestamento concluído! Área restaurada com espécies nativas.', 'positivo');
      }, 0x52b788);
    } else if (tipo === 'carbono') {
      this._iniciarTimer(idx, dur, () => {
        hex.bonusCarbonoExtra = true;
        this._mudarEstadoHex(idx, 'floresta_pioneira');
        this._notificar('💨 Crédito de carbono aplicado! Área restaurada com bônus carbono.', 'positivo');
      }, 0x4A90D9);
    }
  }

  // legado — mantido por compatibilidade com código externo
  _menuPecuariaPropostas(idx) { this._dialogoFazendeiroPropostas(idx, 0); }
  _recusaFazendeiro(idx) {
    const hex = this.hexagonos[idx];
    hex.contatoBloqueado = true;
    const dur = DEV_MODE ? 8000 : 45000;
    this.time.delayedCall(dur, () => { hex.contatoBloqueado = false; });
    this._iniciarInvasaoPasto(idx);
  }


  // -------------------------------------------------------------------------
  // Pecuária verde — menu para semáforo verde (parceiro estabelecido)
  // -------------------------------------------------------------------------
  _menuPecuariaVerde(idx) {
    const hex    = this.hexagonos[idx];
    const pf     = hex.perfilFazendeiro;
    const sem30  = estadoJogo.dinheiro < 30000;
    const sem20  = estadoJogo.dinheiro < 20000;
    const temCC  = estadoJogo.creditoCarbono;

    const acoes = [
      {
        label:        '📊 Ver parceria atual',
        custoStr:     hex.receitaSAF > 0 ? `Gerando R$ ${hex.receitaSAF.toLocaleString('pt-BR')}/ciclo` : 'Pasto organizado',
        desabilitado: true,
        aviso:        null,
        onPress:      () => {},
      },
      {
        label:        '🌳 Reflorestamento nativo',
        custoStr:     'R$ 30.000 + 1.000 mudas → floresta pioneira',
        desabilitado: sem30 || estadoJogo.mudas < 1000,
        aviso:        sem30 ? 'Saldo insuficiente' : estadoJogo.mudas < 1000 ? 'Mudas insuficientes' : null,
        onPress: () => {
          estadoJogo.dinheiro -= 30000;
          estadoJogo.mudas    -= 1000;
          this.atualizarPainel();
          this._fecharMenu();
          this.selectedIdx = -1; this._desenharSelecao();
          const dur = this._duracaoComEquipe(idx, DEV_MODE ? 10 : 75, 'saf');
          this._iniciarTimer(idx, dur, () => {
            this._mudarEstadoHex(idx, 'floresta_pioneira');
            this._notificar('🌳 Reflorestamento concluído! Área transformada em floresta pioneira.', 'positivo');
          }, 0x52b788);
        },
      },
    ];

    if (temCC) {
      acoes.push({
        label:        '💨 Crédito de carbono',
        custoStr:     'R$ 20.000 → floresta pioneira + bônus carbono',
        desabilitado: sem20,
        aviso:        sem20 ? 'Saldo insuficiente' : null,
        onPress: () => {
          estadoJogo.dinheiro -= 20000;
          this.atualizarPainel();
          this._fecharMenu();
          this.selectedIdx = -1; this._desenharSelecao();
          const dur = this._duracaoComEquipe(idx, DEV_MODE ? 8 : 60, 'saf');
          this._iniciarTimer(idx, dur, () => {
            const h = this.hexagonos[idx];
            h.bonusCarbonoExtra = true;
            this._mudarEstadoHex(idx, 'floresta_pioneira');
            this._notificar('💨 Crédito de carbono aplicado! Área restaurada com bônus carbono.', 'positivo');
          }, 0x4A90D9);
        },
      });
    }

    this._abrirMenu(idx, {
      titulo:      `🐄 ${pf?.nomePropio ?? 'Fazendeiro'} — Parceiro Verde`,
      descricao:   'Parceiro engajado. Explore opções de restauração avançada.',
      tituloColor: '#9aaf5a',
      acoes,
    });
  }

  // -------------------------------------------------------------------------
  // SAF — menu pós-conversão
  // -------------------------------------------------------------------------
  _menuSAF(idx) {
    const hex    = this.hexagonos[idx];
    const temPSA = estadoJogo.psaAtivo;
    const verde  = hex.semaforoPecuaria === 'verde';
    const sem0   = false; // reflorestamento sem custo direto

    const acoes = [{
      label:    '📊 Ver produção',
      custoStr: `Gerando R$ ${hex.receitaSAF.toLocaleString('pt-BR')}/ciclo`,
      desabilitado: true,
      aviso: null,
      onPress: () => {},
    }];

    if (verde && temPSA) {
      acoes.push({
        label:        '🌳 Reflorestamento com espécies nativas',
        custoStr:     'Objetivo final — sem custo adicional',
        desabilitado: false, aviso: null,
        onPress: () => {
          this._fecharMenu();
          this.selectedIdx = -1; this._desenharSelecao();
          const dur = DEV_MODE ? 10 : 75;
          this._iniciarTimer(idx, dur, () => {
            this._mudarEstadoHex(idx, 'floresta_pioneira');
            this._mostrarToast('🌳 Reflorestamento concluído! Área transformada em floresta nativa.');
          }, 0x52b788);
        },
      });
    } else if (!temPSA) {
      acoes.push({
        label: '🌳 Reflorestamento (requer PSA ativo)', custoStr: '',
        desabilitado: true, aviso: 'Ative o PSA para desbloquear esta opção.', onPress: () => {},
      });
    }

    acoes.push({
      label:        '🗑️ Desmontar SAF',
      custoStr:     'Sem reembolso',
      desabilitado: false,
      aviso:        null,
      onPress: () => {
        const h = this.hexagonos[idx];
        h.receitaSAF = 0;
        this._fecharMenu();
        this.selectedIdx = -1;
        this._desenharSelecao();
        this._mudarEstadoHex(idx, 'solo');
        this._mostrarToast('🌾 SAF desmontado. Área retornou ao solo degradado.');
      },
    });

    this._abrirMenu(idx, {
      titulo:    '🌾 Sistema Agroflorestal',
      descricao: DESCRICOES['saf'],
      acoes,
    });
  }

  // -------------------------------------------------------------------------
  // Viveiro de Mudas — menu
  // -------------------------------------------------------------------------
  _menuViveiro(idx) {
    const hex       = this.hexagonos[idx];
    const temAgua   = estadoJogo.agua !== null && estadoJogo.agua > 0;
    const statusStr = temAgua ? 'Produção: 1.000 mudas/ciclo' : 'Inativo — sem água';
    const avisoStr  = temAgua ? null : 'Viveiro inativo — sem água disponível. Recupere uma nascente.';

    this._abrirMenu(idx, {
      titulo:         '🪴 Viveiro de Mudas',
      descricao:      statusStr,
      tituloColor:    '#74c69d',
      descricaoColor: temAgua ? '#d8f3dc' : '#e76f51',
      acoes: [
        {
          label:        '📊 Status',
          custoStr:     temAgua ? '+1.000 mudas/ciclo' : 'Inativo',
          desabilitado: true,
          aviso:        avisoStr,
          onPress:      () => {},
        },
        {
          label:        '🗑️ Desmontar viveiro',
          custoStr:     'Sem reembolso',
          desabilitado: false,
          aviso:        null,
          onPress: () => {
            this._fecharMenu();
            this.selectedIdx = -1;
            this._desenharSelecao();
            this._mudarEstadoHex(idx, 'solo');
            this._mostrarToast('🪴 Viveiro desmontado. Área retornou ao solo degradado.');
          },
        },
      ],
    });
  }

  // -------------------------------------------------------------------------
  // Manejo Florestal — menu
  // -------------------------------------------------------------------------
  _menuManejo(idx) {
    const hex = this.hexagonos[idx];
    const receita = hex.receitaSAF || 8000;

    this._abrirMenu(idx, {
      titulo:         '🪵 Manejo Florestal',
      descricao:      `Receita: R$ ${receita.toLocaleString('pt-BR')}/ciclo`,
      tituloColor:    '#74c69d',
      descricaoColor: '#d8f3dc',
      acoes: [
        {
          label:        '📊 Produção',
          custoStr:     `R$ ${receita.toLocaleString('pt-BR')}/ciclo`,
          desabilitado: true,
          aviso:        null,
          onPress:      () => {},
        },
        {
          label:        '🗑️ Desmontar manejo',
          custoStr:     'Sem reembolso',
          desabilitado: false,
          aviso:        null,
          onPress: () => {
            hex.receitaSAF = 0;
            this._fecharMenu();
            this.selectedIdx = -1;
            this._desenharSelecao();
            this._mudarEstadoHex(idx, 'solo');
            this._mostrarToast('🪵 Manejo desmontado. Área retornou ao solo degradado.');
          },
        },
      ],
    });
  }

  // -------------------------------------------------------------------------
  // Pecuária — expansão do pasto
  // -------------------------------------------------------------------------
  _iniciarExpansoesPastos() {
    this.hexagonos.forEach((hex, idx) => {
      if (hex.tipo === 'pecuaria') this._iniciarExpansaoPasto(idx);
    });
  }

  _iniciarExpansaoPasto(idx) {
    const hex = this.hexagonos[idx];
    if (hex.expansaoTimer) { hex.expansaoTimer.remove(); hex.expansaoTimer = null; }
    if (hex.semaforoPecuaria !== 'vermelho') return;
    const dur = DEV_MODE ? 20000 : 90000;
    hex.expansaoTimer = this.time.delayedCall(dur, () => {
      if (hex.tipo !== 'pecuaria' || hex.semaforoPecuaria !== 'vermelho') return;
      this._mostrarNotificacaoPecuaria('⚠️ O pasto está se expandindo! Inicie contato em 30s.');
      this.time.delayedCall(DEV_MODE ? 8000 : 30000, () => {
        if (hex.tipo !== 'pecuaria' || hex.semaforoPecuaria !== 'vermelho') return;
        const candidatos = this._vizinhosHex(idx).filter(vi => {
          const t = this.hexagonos[vi].tipo;
          return t === 'solo' || t === 'solo_preparado' || t === 'floresta_pioneira';
        });
        if (candidatos.length > 0) {
          const alvoIdx = candidatos[Math.floor(Math.random() * candidatos.length)];
          this._expandirPasto(alvoIdx);
          this._mostrarNotificacaoPecuaria('🐄 O pasto se expandiu para uma nova área!');
        }
      });
    });
  }

  _expandirPasto(idx) {
    const hex = this.hexagonos[idx];
    const p = PERFIS_FAZENDEIRO[Math.floor(Math.random() * PERFIS_FAZENDEIRO.length)];
    const nomeP = NOMES_FAZENDEIROS[Math.floor(Math.random() * NOMES_FAZENDEIROS.length)];
    hex.semaforoPecuaria = 'vermelho';
    hex.perfilFazendeiro = { ...p, nomePropio: nomeP, idade: 35 + Math.floor(Math.random() * 34) };
    hex.bonusContatoPec  = 0;
    hex.contatoBloqueado = false;
    hex.parceiriaPec     = null;
    hex.receitaSAF       = 0;
    hex.expansaoTimer    = null;
    this._mudarEstadoHex(idx, 'pecuaria');
    this._iniciarExpansaoPasto(idx);
  }

  _mostrarNotificacaoPecuaria(msg) {
    this._notificar(msg, 'alerta');
  }

  // -------------------------------------------------------------------------
  // Pecuária — cluster de SAFs e receita passiva
  // -------------------------------------------------------------------------
  _verificarClusterSAF(origemIdx) {
    const vizinhosSAF = this._vizinhosHex(origemIdx).filter(vi => this.hexagonos[vi].tipo === 'saf');
    if (vizinhosSAF.length < 2) return;
    const hex = this.hexagonos[origemIdx];
    if (hex.clusterBonus) return; // já contado
    hex.clusterBonus = true;
    estadoJogo.receitaPassiva += 20000;
    this._mostrarNotificacaoPecuaria('🌾 Cluster de SAFs formado! +R$ 20.000/ciclo automático.');
    // Fazendeiros vizinhos ficam mais receptivos
    this._vizinhosHex(origemIdx).forEach(vi => {
      if (this.hexagonos[vi].tipo === 'pecuaria')
        this.hexagonos[vi].bonusContatoPec = Math.min(0.40, this.hexagonos[vi].bonusContatoPec + 0.20);
    });
  }

  // =========================================================================
  // PAINEL LATERAL DIREITO
  // =========================================================================

  _criarPainelLateral() {
    this.criarPainelHTML();
  }

  _redesenharPainel() {
    this.atualizarPainelHTML();
  }

  // =========================================================================
  // EQUIPE — contratação, alocação, demissão, salários
  // =========================================================================

  _cardContratacao() {
    this._fecharCard();
    const { width, height } = this.scale;
    const CARD_W = 460, CARD_H = 58 + CATALOGO_EQUIPE.length * 74 + 16;
    const cx = (width - PANEL_W) / 2 - CARD_W / 2;
    const cy = height / 2 - CARD_H / 2;
    const DEPTH = 20;
    const objs = [];

    const overlay = push2(this.add.graphics().setDepth(DEPTH - 1));
    overlay.fillStyle(0x000000, 0.55);
    overlay.fillRect(0, 0, width, height);

    const bgG = push2(this.add.graphics().setDepth(DEPTH));
    bgG.fillStyle(0x0d2818, 1);
    bgG.fillRoundedRect(cx, cy, CARD_W, CARD_H, 10);
    bgG.lineStyle(1.5, 0x52b788, 1);
    bgG.strokeRoundedRect(cx, cy, CARD_W, CARD_H, 10);

    push2(this.add.text(cx + 20, cy + 16, '👥 Contratar Membro da Equipe', {
      fontSize: '15px', color: '#d8f3dc',
      fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
    }).setDepth(DEPTH + 1));

    CATALOGO_EQUIPE.forEach((cat, i) => {
      const rowY = cy + 50 + i * 74;
      const rowBg = push2(this.add.graphics().setDepth(DEPTH));
      rowBg.fillStyle(0x1b4332, 1);
      rowBg.fillRoundedRect(cx + 12, rowY, CARD_W - 24, 60, 5);

      push2(this.add.text(cx + 26, rowY + 8, `${cat.emoji}  ${cat.nome}`, {
        fontSize: '13px', color: '#d8f3dc',
        fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
      }).setDepth(DEPTH + 1));
      push2(this.add.text(cx + 26, rowY + 28, cat.funcao, {
        fontSize: '10px', color: '#74c69d',
        fontFamily: 'Inter, sans-serif', wordWrap: { width: CARD_W - 160 },
      }).setDepth(DEPTH + 1));

      const semSaldo = estadoJogo.dinheiro < cat.custo;
      const btnW = 108, btnH = 26;
      const btnX = cx + CARD_W - btnW - 18, btnY = rowY + 17;

      const btnG = push2(this.add.graphics().setDepth(DEPTH + 1));
      const desBtn = (a) => { btnG.clear(); btnG.fillStyle(semSaldo ? 0x333 : 0x52b788, a); btnG.fillRoundedRect(btnX, btnY, btnW, btnH, 5); };
      desBtn(1);
      push2(this.add.text(btnX + btnW / 2, btnY + btnH / 2,
        semSaldo ? `R$${(cat.custo/1000).toFixed(0)}k — sem saldo` : `✅  R$${(cat.custo/1000).toFixed(0)}k/ciclo`, {
        fontSize: '10px', color: semSaldo ? '#666' : '#0d2818',
        fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(DEPTH + 2));

      if (!semSaldo) {
        const z = push2(this.add.zone(btnX + btnW / 2, btnY + btnH / 2, btnW, btnH)
          .setInteractive({ useHandCursor: true }).setDepth(DEPTH + 3));
        z.on('pointerover', () => desBtn(0.78));
        z.on('pointerout',  () => desBtn(1));
        z.on('pointerdown', () => { this._fecharCard(); this._contratarMembro(cat.tipo); });
      }
    });

    // Fechar
    const fX = cx + CARD_W - 36, fY = cy + 10;
    const fG = push2(this.add.graphics().setDepth(DEPTH + 1));
    fG.fillStyle(0x3a3a3a, 1); fG.fillCircle(fX + 12, fY + 12, 12);
    push2(this.add.text(fX + 12, fY + 12, '✕', { fontSize: '13px', color: '#d8f3dc', fontFamily: 'Inter, sans-serif' }).setOrigin(0.5).setDepth(DEPTH + 2));
    const fZ = push2(this.add.zone(fX + 12, fY + 12, 26, 26).setInteractive({ useHandCursor: true }).setDepth(DEPTH + 3));
    fZ.on('pointerdown', () => this._fecharCard());

    this.cardObjs = objs;

    function push2(o) { objs.push(o); return o; }
  }

  _contratarMembro(tipo) {
    const cat = CATALOGO_EQUIPE.find(c => c.tipo === tipo);
    if (!cat || estadoJogo.dinheiro < cat.custo) return;
    const id = `m_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    estadoJogo.dinheiro -= cat.custo;
    estadoJogo.equipe.push({ id, tipo: cat.tipo, emoji: cat.emoji, nome: cat.nome, custo: cat.custo });
    this.atualizarPainel();
    this._notificar(`${cat.emoji} ${cat.nome} contratado!`, 'positivo');
  }

  _demitirMembro(id) {
    const i = estadoJogo.equipe.findIndex(m => m.id === id);
    if (i < 0) return;
    const m = estadoJogo.equipe[i];
    estadoJogo.equipe.splice(i, 1);
    this.atualizarPainel();
    this._notificar(`${m.emoji} ${m.nome} foi dispensado.`, 'informativo');
  }

  _comprarTrator() {
    if (estadoJogo.temTrator || estadoJogo.dinheiro < 80000) return;
    estadoJogo.dinheiro -= 80000;
    estadoJogo.temTrator = true;
    this.atualizarPainel();
    this._notificar('🚜 Trator adquirido! Ações ecológicas até 70% mais rápidas com técnicos florestais.', 'positivo');
  }

  _venderTrator() {
    if (!estadoJogo.temTrator) return;
    estadoJogo.temTrator = false;
    estadoJogo.dinheiro += 56000;
    this.atualizarPainel();
    this._notificar('🔄 Trator vendido por R$ 56.000.', 'informativo');
  }

  _cicloSalarios() {
    const dur = DEV_MODE ? 15000 : 60000;
    this.time.addEvent({
      delay: dur, loop: true,
      callback: () => {
        const eq = estadoJogo.equipe;
        const manutTrator = estadoJogo.temTrator ? 2000 : 0;
        const total = eq.reduce((s, m) => s + m.custo, 0) + manutTrator;
        if (total === 0) return;
        if (estadoJogo.dinheiro >= total) {
          estadoJogo.dinheiro -= total;
          this.atualizarPainel();
          this._mostrarTextoFlutuante(
            this._dinheiroHudCx ?? 300, 80,
            `-R$ ${total.toLocaleString('pt-BR')} (salários)`, '#e76f51'
          );
        } else {
          if (eq.length > 0) {
            const maisCaroIdx = eq.reduce((bi, m, i) => m.custo > eq[bi].custo ? i : bi, 0);
            const mc = eq[maisCaroIdx];
            this._demitirMembro(mc.id);
            this._notificar(`💸 Saldo insuficiente! ${mc.emoji} ${mc.nome} dispensado.`, 'emergencia');
          }
          const resto = eq.reduce((s, m) => s + m.custo, 0) + (estadoJogo.temTrator ? 2000 : 0);
          if (estadoJogo.dinheiro >= resto) { estadoJogo.dinheiro -= resto; this.atualizarPainel(); }
        }
      },
    });
  }

  // -------------------------------------------------------------------------
  // Equipe — helpers de consulta (globais, sem alocação por hex)
  // -------------------------------------------------------------------------
  _contarMembros(tipo) {
    return estadoJogo.equipe.filter(m => m.tipo === tipo).length;
  }

  _duracaoComEquipe(_hexIdx, durSeg, tipoAcao) {
    let reducao = 0;
    if (['saf', 'viveiro', 'manejo', 'nascente', 'sucessao', 'mecanica'].includes(tipoAcao)) {
      // Técnicos florestais: 10% cada, cap 50%
      const nTec = this._contarMembros('tecnico_florestal');
      reducao = Math.min(0.50, nTec * 0.10);
      // Trator: +20%, combinado cap 70%
      if (estadoJogo.temTrator) reducao = Math.min(0.70, reducao + 0.20);
      const final = Math.max(1, Math.round(durSeg * (1 - reducao)));
      console.log(`[Equipe] Timer base: ${durSeg}s | Bônus equipe: ${Math.round(reducao * 100)}% | Timer final: ${final}s`);
      return final;
    }
    if (tipoAcao === 'queimada') {
      // Brigadistas (regulares e indígenas via parceria): 10% cada, cap 50%
      const nBrig = estadoJogo.equipe.filter(m => m.tipo === 'brigadista' || m.tipo === 'brigadista_indigena').length;
      reducao = Math.min(0.50, nBrig * 0.10);
    }
    return Math.max(1, Math.round(durSeg * (1 - reducao)));
  }

  // -------------------------------------------------------------------------
  // Tamanho do maior grupo conectado de um tipo (para barra de progresso)
  // -------------------------------------------------------------------------
  _tamanhoMaiorGrupo(tipo) {
    const visited = new Set();
    let maior = 0;
    for (let i = 0; i < this.hexagonos.length; i++) {
      if (this.hexagonos[i].tipo !== tipo || visited.has(i)) continue;
      const queue = [i], cluster = new Set([i]);
      while (queue.length) {
        const cur = queue.shift();
        for (const nb of this._vizinhosHex(cur)) {
          if (!cluster.has(nb) && this.hexagonos[nb].tipo === tipo) {
            cluster.add(nb); queue.push(nb);
          }
        }
      }
      cluster.forEach(n => visited.add(n));
      if (cluster.size > maior) maior = cluster.size;
    }
    return maior;
  }

  // -------------------------------------------------------------------------
  // Card de fauna para visualização no painel (sem unlock, sem fila)
  // -------------------------------------------------------------------------
  _cardFaunaInfo(id) {
    this._fecharCard();
    const animal = FAUNA_CATALOGO.find(a => a.id === id);
    if (!animal) return;
    const { width, height } = this.scale;
    const CARD_W = 360, CARD_H = 290;
    const cx = (width - PANEL_W) / 2 - CARD_W / 2;
    const cy = height / 2 - CARD_H / 2;
    const DEPTH = 25, objs = [];

    const push3 = (o) => { objs.push(o); return o; };

    const ov = push3(this.add.graphics().setDepth(DEPTH - 1));
    ov.fillStyle(0x000000, 0.6); ov.fillRect(0, 0, width, height);

    const bg = push3(this.add.graphics().setDepth(DEPTH));
    bg.fillStyle(0x071a0e, 1); bg.fillRoundedRect(cx, cy, CARD_W, CARD_H, 12);
    bg.lineStyle(2, 0xC8A951, 1); bg.strokeRoundedRect(cx, cy, CARD_W, CARD_H, 12);

    push3(this.add.text(cx + CARD_W / 2, cy + 18, animal.emoji, { fontSize: '52px' }).setOrigin(0.5).setDepth(DEPTH));
    push3(this.add.text(cx + CARD_W / 2, cy + 82, animal.nome, {
      fontSize: '17px', color: '#d8f3dc', fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(DEPTH));
    push3(this.add.text(cx + CARD_W / 2, cy + 104, animal.raridade, {
      fontSize: '11px', color: animal.corRar, fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(DEPTH));
    push3(this.add.text(cx + 20, cy + 128, animal.funcao, {
      fontSize: '11px', color: '#74c69d', fontFamily: 'Inter, sans-serif',
      wordWrap: { width: CARD_W - 40 }, lineSpacing: 3,
    }).setDepth(DEPTH));
    push3(this.add.text(cx + 20, cy + 188, `"${animal.dado}"`, {
      fontSize: '10px', color: '#a8c5b0', fontStyle: 'italic',
      fontFamily: 'Inter, sans-serif', wordWrap: { width: CARD_W - 40 }, lineSpacing: 3,
    }).setDepth(DEPTH));

    const btnW = 180, btnH = 32, btnY = cy + CARD_H - 46;
    const bG = push3(this.add.graphics().setDepth(DEPTH));
    const desBt = (h) => { bG.clear(); bG.fillStyle(h ? 0x2d6a4f : 0x1b4332, 1); bG.fillRoundedRect(cx + CARD_W / 2 - btnW / 2, btnY, btnW, btnH, 5); };
    desBt(false);
    push3(this.add.text(cx + CARD_W / 2, btnY + btnH / 2, 'Fechar', {
      fontSize: '12px', color: '#d8f3dc', fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(DEPTH));
    const bZ = push3(this.add.zone(cx + CARD_W / 2, btnY + btnH / 2, btnW, btnH)
      .setInteractive({ useHandCursor: true }).setDepth(DEPTH + 1));
    bZ.on('pointerover', () => desBt(true)); bZ.on('pointerout', () => desBt(false));
    bZ.on('pointerdown', () => this._fecharCard());

    this.cardObjs = objs;
  }

  _cicloReceitaSAF() {
    const dur = DEV_MODE ? 15000 : 60000;
    this.time.addEvent({
      delay: dur, loop: true,
      callback: () => {
        let total = estadoJogo.receitaPassiva;
        this.hexagonos.forEach(hex => {
          if (hex.receitaSAF > 0) {
            total += hex.receitaSAF;
            this._mostrarTextoFlutuante(hex.cx, hex.cy - 40,
              `+R$ ${hex.receitaSAF.toLocaleString('pt-BR')}`, '#C8A951');
          }
        });
        if (total > 0) {
          estadoJogo.dinheiro += total;
          this.atualizarPainel();
          this._mostrarTextoFlutuante(
            this._dinheiroHudCx ?? 300, 80,
            `+R$ ${total.toLocaleString('pt-BR')}`, '#52b788'
          );
        }
      },
    });
  }

  // -------------------------------------------------------------------------
  // Viveiro — produção de mudas por ciclo
  // -------------------------------------------------------------------------
  _cicloViveiro() {
    const dur = DEV_MODE ? 15000 : 60000;
    this.time.addEvent({
      delay: dur, loop: true,
      callback: () => {
        this.hexagonos.forEach(hex => {
          if (hex.tipo !== 'viveiro') return;
          const temAgua = estadoJogo.agua !== null && estadoJogo.agua > 0;
          if (!temAgua) return;
          estadoJogo.mudas += 1000;
          this.atualizarPainel();
          this._mostrarTextoFlutuante(hex.cx, hex.cy - 40, '+1.000 mudas', '#74c69d');
        });
      },
    });
  }

  // -------------------------------------------------------------------------
  // Área Indígena — custo de parcerias por ciclo
  // -------------------------------------------------------------------------
  _cicloParcerias() {
    const dur = DEV_MODE ? 15000 : 60000;
    this.time.addEvent({
      delay: dur, loop: true,
      callback: () => {
        let custo = 0;
        this.hexagonos.forEach(hex => {
          if (hex.tipo !== 'indigena') return;
          if (hex.parcerias.includes('sementes'))    custo += 15000;
          if (hex.parcerias.includes('brigadistas')) custo += 7000;
        });
        if (custo > 0) {
          estadoJogo.dinheiro -= custo;
          this.atualizarPainel();
          this._mostrarTextoFlutuante(
            this.scale.width / 2, 120,
            `-R$ ${custo.toLocaleString('pt-BR')} (parcerias indígenas)`,
            '#7B4FA6'
          );
        }
      },
    });
  }

  // -------------------------------------------------------------------------
  // Queimada — menu de urgência
  // -------------------------------------------------------------------------
  _menuQueimada(idx) {
    const hex        = this.hexagonos[idx];
    const custoBase  = 30000;
    const custoAgua  = 1000;
    const custoPipa  = 40000;
    const temDinheiro = estadoJogo.dinheiro >= custoBase;
    const temAgua     = estadoJogo.agua !== null && estadoJogo.agua >= custoAgua;
    const temPipa     = estadoJogo.dinheiro >= custoPipa;

    const _combater = (custoD, usaAgua) => {
      estadoJogo.dinheiro -= custoD;
      if (usaAgua) estadoJogo.agua -= custoAgua;
      this.atualizarPainel();
      this._fecharMenu();
      this.selectedIdx = -1;
      this._desenharSelecao();

      if (hex.propagacaoTimer) { hex.propagacaoTimer.remove(); hex.propagacaoTimer = null; }

      const baseDur = DEV_MODE ? 15 : 120;
      const dur = this._duracaoComEquipe(idx, baseDur, 'queimada');

      this._iniciarTimer(idx, dur, () => {
        this._mudarEstadoHex(idx, 'solo');
        this._notificar('✅ Incêndio controlado! A área pode agora ser restaurada.', 'positivo');
      }, 0xC1440E);
    };

    this._abrirMenu(idx, {
      titulo:         '⚠️ ÁREA EM CHAMAS',
      descricao:      'Ação imediata necessária!',
      tituloColor:    '#e76f51',
      descricaoColor: '#e76f51',
      acoes: [
        {
          label:        '🚒 Apagar incêndio',
          custoStr:     `R$ 30.000 + 1.000L água`,
          desabilitado: !temDinheiro || !temAgua,
          aviso:        !temDinheiro
            ? 'Saldo insuficiente'
            : !temAgua
              ? 'Água insuficiente. Recupere uma nascente primeiro.'
              : null,
          onPress: () => _combater(custoBase, true),
        },
        {
          label:        '🚛 Acionar caminhão-pipa',
          custoStr:     `R$ ${custoPipa.toLocaleString('pt-BR')} — sem água`,
          desabilitado: !temPipa,
          aviso:        !temPipa ? 'Saldo insuficiente' : null,
          onPress: () => _combater(custoPipa, false),
        },
      ],
    });
  }

  // Retorna 'normal' ou 'none' — presença global de brigadistas
  _brigadistaNivel() {
    return estadoJogo.equipe.some(m => m.tipo === 'brigadista') ? 'normal' : 'none';
  }

  // -------------------------------------------------------------------------
  // Queimada — card incêndio controlado
  // -------------------------------------------------------------------------
  _cardIncendioControlado(idx) {
    this._fecharCard();
    const { width, height } = this.scale;
    const CARD_W = 400, CARD_H = 180;
    const cx = width / 2 - CARD_W / 2, cy = height / 2 - CARD_H / 2;
    const DEPTH = 20, objs = [];

    const overlay = this.add.graphics().setDepth(DEPTH - 1);
    overlay.fillStyle(0x000000, 0.55);
    overlay.fillRect(0, 0, width, height);
    objs.push(overlay);

    const bgG = this.add.graphics().setDepth(DEPTH);
    bgG.fillStyle(0x0d2818, 1);
    bgG.fillRoundedRect(cx, cy, CARD_W, CARD_H, 10);
    bgG.lineStyle(1.5, 0x52b788, 1);
    bgG.strokeRoundedRect(cx, cy, CARD_W, CARD_H, 10);
    objs.push(bgG);

    objs.push(this.add.text(cx + 20, cy + 18, '✅ Incêndio controlado!', {
      fontSize: '16px', color: '#52b788',
      fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
    }).setDepth(DEPTH));

    objs.push(this.add.text(cx + 20, cy + 52,
      'A área agora pode ser restaurada. Considere instalar vigilância para prevenir novos incêndios.',
      { fontSize: '13px', color: '#d8f3dc', fontFamily: 'Inter, sans-serif',
        wordWrap: { width: CARD_W - 40 }, lineSpacing: 4 }
    ).setDepth(DEPTH));

    const btnY = cy + CARD_H - 50, BTN_W = 180, BTN_H = 34;
    const btnG = this.add.graphics().setDepth(DEPTH);
    const desBt = h => { btnG.clear(); btnG.fillStyle(h ? 0x2d6a4f : 0x1b4332, 1);
      btnG.fillRoundedRect(cx + CARD_W / 2 - BTN_W / 2, btnY, BTN_W, BTN_H, 6); };
    desBt(false); objs.push(btnG);

    objs.push(this.add.text(cx + CARD_W / 2, btnY + BTN_H / 2, 'Continuar', {
      fontSize: '13px', color: '#d8f3dc',
      fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(DEPTH));

    const z = this.add.zone(cx + CARD_W / 2, btnY + BTN_H / 2, BTN_W, BTN_H)
      .setDepth(DEPTH).setInteractive({ useHandCursor: true });
    z.on('pointerover', () => desBt(true)); z.on('pointerout', () => desBt(false));
    z.on('pointerdown', () => this._fecharCard());
    objs.push(z);
    this.cardObjs = objs;
  }

  // -------------------------------------------------------------------------
  // Queimada — card floresta destruída pela propagação
  // -------------------------------------------------------------------------
  _cardFlorestaDestruida() {
    this._fecharCard();
    const { width, height } = this.scale;
    const CARD_W = 420, CARD_H = 210;
    const cx = width / 2 - CARD_W / 2, cy = height / 2 - CARD_H / 2;
    const DEPTH = 20, objs = [];

    const overlay = this.add.graphics().setDepth(DEPTH - 1);
    overlay.fillStyle(0x000000, 0.55);
    overlay.fillRect(0, 0, width, height);
    objs.push(overlay);

    const bgG = this.add.graphics().setDepth(DEPTH);
    bgG.fillStyle(0x1a0505, 1);
    bgG.fillRoundedRect(cx, cy, CARD_W, CARD_H, 10);
    bgG.lineStyle(1.5, 0xC1440E, 1);
    bgG.strokeRoundedRect(cx, cy, CARD_W, CARD_H, 10);
    objs.push(bgG);

    objs.push(this.add.text(cx + 20, cy + 18, '💔 Sua floresta foi destruída!', {
      fontSize: '16px', color: '#e76f51',
      fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
    }).setDepth(DEPTH));

    objs.push(this.add.text(cx + 20, cy + 52,
      'O incêndio se propagou e destruiu uma área restaurada. Todo o investimento nessa área foi perdido. Considere instalar vigilância nas áreas vizinhas para evitar novas perdas.',
      { fontSize: '13px', color: '#d8f3dc', fontFamily: 'Inter, sans-serif',
        wordWrap: { width: CARD_W - 40 }, lineSpacing: 4 }
    ).setDepth(DEPTH));

    const btnY = cy + CARD_H - 52, BTN_W = 180, BTN_H = 34;
    const btnG = this.add.graphics().setDepth(DEPTH);
    const desBt = h => { btnG.clear(); btnG.fillStyle(h ? 0x4a1a06 : 0x2d1008, 1);
      btnG.fillRoundedRect(cx + CARD_W / 2 - BTN_W / 2, btnY, BTN_W, BTN_H, 6); };
    desBt(false); objs.push(btnG);

    objs.push(this.add.text(cx + CARD_W / 2, btnY + BTN_H / 2, 'Entendido', {
      fontSize: '13px', color: '#d8f3dc',
      fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(DEPTH));

    const z = this.add.zone(cx + CARD_W / 2, btnY + BTN_H / 2, BTN_W, BTN_H)
      .setDepth(DEPTH).setInteractive({ useHandCursor: true });
    z.on('pointerover', () => desBt(true)); z.on('pointerout', () => desBt(false));
    z.on('pointerdown', () => this._fecharCard());
    objs.push(z);
    this.cardObjs = objs;
  }

  // -------------------------------------------------------------------------
  // Queimada — alerta banner no topo (abaixo do HUD)
  // -------------------------------------------------------------------------
  _mostrarAlertaIncendio(msg) {
    const { width } = this.scale;
    const H = 36;
    const bgG = this.add.graphics().setDepth(25);
    bgG.fillStyle(0xC1440E, 1);
    bgG.fillRect(0, 70, width, H);
    const txt = this.add.text(width / 2, 70 + H / 2, msg, {
      fontSize: '14px', color: '#ffffff',
      fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(25);
    this.tweens.add({
      targets: [bgG, txt], alpha: 0, delay: 2500, duration: 600,
      onComplete: () => { bgG.destroy(); txt.destroy(); },
    });
  }

  // -------------------------------------------------------------------------
  // Queimada — pulsação visual de borda (loop permanente)
  // -------------------------------------------------------------------------
  _iniciarPulsoQueimadas() {
    let fase = 0;
    this.time.addEvent({
      delay: 400, loop: true,
      callback: () => {
        fase = 1 - fase;
        this.bordaFireG.clear();
        const cor = fase === 0 ? 0xC1440E : 0xff6b35;
        this.hexagonos.forEach(hex => {
          if (hex.tipo !== 'queimada') return;
          this.bordaFireG.lineStyle(3, cor, 1);
          this.bordaFireG.beginPath();
          this.bordaFireG.moveTo(hex.pts[0].x, hex.pts[0].y);
          for (let i = 1; i < 6; i++) this.bordaFireG.lineTo(hex.pts[i].x, hex.pts[i].y);
          this.bordaFireG.closePath();
          this.bordaFireG.strokePath();
        });
      },
    });
  }

  // -------------------------------------------------------------------------
  // Queimada — propagação
  // -------------------------------------------------------------------------
  _iniciarPropagacoesIniciais() {
    this.hexagonos.forEach((hex, idx) => {
      if (hex.tipo === 'queimada') this._iniciarPropagacao(idx);
    });
  }

  _iniciarPropagacao(idx) {
    const hex = this.hexagonos[idx];
    const dur = DEV_MODE ? 20000 : 90000;
    hex.propagacaoTimer = this.time.delayedCall(dur, () => {
      if (hex.tipo !== 'queimada') return;
      this._propagarIncendio(idx);
    });
  }

  _propagarIncendio(idx) {
    const vizinhos  = this._vizinhosHex(idx);
    const candidatos = vizinhos.filter(i => {
      const t = this.hexagonos[i].tipo;
      return t !== 'nascente_ativa' && t !== 'indigena' && t !== 'queimada';
    });

    if (candidatos.length > 0) {
      const alvoIdx = candidatos[Math.floor(Math.random() * candidatos.length)];
      const alvo    = this.hexagonos[alvoIdx];
      const eraMata = ['floresta', 'floresta_pioneira'].includes(alvo.tipo);
      this._mudarEstadoHex(alvoIdx, 'queimada');
      this._iniciarPropagacao(alvoIdx);
      this._mostrarAlertaIncendio('🔥 O incêndio se propagou!');
      if (eraMata) this._notificar('💔 Floresta destruída pelo incêndio! Invista em vigilância nas áreas vizinhas.', 'emergencia');
    }

    // O foco original continua ativo — reinicia o timer de propagação
    this._iniciarPropagacao(idx);
  }

  _vizinhosHex(idx) {
    const { row, col } = this.hexagonos[idx];
    const ROWS = 5, COLS = 6;
    const offsets = row % 2 === 0
      ? [[-1, -1], [-1, 0], [0, -1], [0, 1], [1, -1], [1, 0]]
      : [[-1,  0], [-1, 1], [0, -1], [0, 1], [1,  0], [1, 1]];

    return offsets
      .map(([dr, dc]) => {
        const r = row + dr, c = col + dc;
        if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return -1;
        return this.hexagonos.findIndex(h => h.row === r && h.col === c);
      })
      .filter(i => i >= 0);
  }

  // -------------------------------------------------------------------------
  // Queimada — ciclo de novos incêndios espontâneos
  // -------------------------------------------------------------------------
  _cicloQueimadas() {
    const dur = DEV_MODE ? 30000 : 120000;
    this.time.addEvent({
      delay: dur, loop: true,
      callback: () => {
        const candidatos = [];
        this.hexagonos.forEach((hex, idx) => {
          if (hex.tipo === 'queimada' || hex.bloqueado) return;
          if (hex.tipo === 'nascente_ativa' || hex.tipo === 'indigena') return;
          if (hex.vigilancia) return;
          const temRisco = this._vizinhosHex(idx).some(vi => {
            const t = this.hexagonos[vi].tipo;
            return t === 'garimpo' || t === 'pecuaria';
          });
          if (temRisco) candidatos.push(idx);
        });

        if (candidatos.length > 0 && Math.random() < 0.25) {
          const alvoIdx = candidatos[Math.floor(Math.random() * candidatos.length)];
          this._mudarEstadoHex(alvoIdx, 'queimada');
          this._iniciarPropagacao(alvoIdx);
          this._mostrarAlertaIncendio('🔥 Fogo detectado em nova área!');
        }
      },
    });
  }

  // =========================================================================
  // FASE 12 — Sucessão Ecológica + Fauna
  // =========================================================================

  // -------------------------------------------------------------------------
  // Menu informativo para hexágonos em sucessão
  // -------------------------------------------------------------------------
  _menuFlorestaEstagio(idx) {
    const hex = this.hexagonos[idx];
    const info = TIPOS[hex.tipo];
    const emSuccessao = hex.evolucaoTimer !== null && hex.evolucaoTimer !== undefined;

    const descricoes = {
      floresta_pioneira:   'Espécies pioneiras colonizando o solo. Em sucessão automática → Floresta Secundária.',
      floresta_secundaria: 'Floresta jovem com dossel em formação. Em sucessão → Floresta Clímax.',
      floresta_climax:     'Ecossistema maduro. Gera R$ 8.000/ciclo e suporta fauna de topo.',
    };

    const acoes = [];
    if (hex.tipo !== 'floresta_climax') {
      acoes.push({
        label: '⏩ Verificar sucessão',
        custoStr: emSuccessao ? 'Em andamento...' : 'Inativa',
        desabilitado: true,
        aviso: emSuccessao ? 'A floresta está evoluindo automaticamente.' : null,
        onPress: () => {},
      });
    } else {
      const receita = hex.receitaSAF || 8000;
      acoes.push({
        label: '💰 Receita passiva',
        custoStr: `R$ ${receita.toLocaleString('pt-BR')}/ciclo`,
        desabilitado: true,
        aviso: null,
        onPress: () => {},
      });
    }

    this._abrirMenu(idx, {
      titulo:         `${info.emoji} ${info.label}`,
      descricao:      descricoes[hex.tipo] || '',
      tituloColor:    '#74c69d',
      descricaoColor: '#d8f3dc',
      acoes,
    });
  }

  // -------------------------------------------------------------------------
  // Inicia timer de sucessão automática para floresta_pioneira / secundária
  // -------------------------------------------------------------------------
  _iniciarSucessao(idx) {
    const hex = this.hexagonos[idx];
    if (hex.evolucaoTimer) { hex.evolucaoTimer.remove(); hex.evolucaoTimer = null; }

    let durMs, proximoTipo, txtCrescendo, txtConcluido;
    if (hex.tipo === 'floresta_pioneira') {
      durMs       = DEV_MODE ? 10000 : 60000;
      proximoTipo = 'floresta_secundaria';
      txtCrescendo = '🌱 Crescendo...';
      txtConcluido = '🌲 Floresta Secundária estabelecida!';
    } else if (hex.tipo === 'floresta_secundaria') {
      durMs       = DEV_MODE ? 12000 : 90000;
      proximoTipo = 'floresta_climax';
      txtCrescendo = '🌲 Maturando...';
      txtConcluido = '🌳 Floresta Clímax!';
    } else {
      return;
    }

    // Ecologista no hex acelera sucessão em 20%
    const durSeg = this._duracaoComEquipe(idx, durMs / 1000, 'sucessao');
    durMs = durSeg * 1000;

    this._mostrarTextoFlutuante(hex.cx, hex.cy - 30, txtCrescendo, '#74c69d');

    hex.evolucaoTimer = this.time.delayedCall(durMs, () => {
      hex.evolucaoTimer = null;
      this._mudarEstadoHex(idx, proximoTipo);
      this._mostrarTextoFlutuante(hex.cx, hex.cy - 30, txtConcluido, '#52b788');
      if (proximoTipo === 'floresta_climax') {
        this._mostrarTextoFlutuante(hex.cx, hex.cy - 55, '🎉 Floresta Clímax!', '#C8A951');
      }
    });
  }

  // -------------------------------------------------------------------------
  // BFS — verifica se há N hexágonos do tipo conectados entre si
  // -------------------------------------------------------------------------
  _temGrupoConectado(tipo, minTamanho) {
    const visited = new Set();
    for (let i = 0; i < this.hexagonos.length; i++) {
      if (this.hexagonos[i].tipo !== tipo) continue;
      if (visited.has(i)) continue;
      // BFS deste cluster
      const queue = [i], cluster = new Set([i]);
      while (queue.length) {
        const cur = queue.shift();
        for (const nb of this._vizinhosHex(cur)) {
          if (!cluster.has(nb) && this.hexagonos[nb].tipo === tipo) {
            cluster.add(nb);
            queue.push(nb);
          }
        }
      }
      cluster.forEach(n => visited.add(n));
      if (cluster.size >= minTamanho) return true;
    }
    return false;
  }

  // -------------------------------------------------------------------------
  // Verifica objetivos ecológicos (PSA, Ecoturismo, Corredor, Carbono)
  // -------------------------------------------------------------------------
  _verificarObjetivosEcologicos() {
    const obj = this._objetivosAtivados;

    // PSA — 3 floresta_pioneira conectadas
    if (!obj.psa && this._temGrupoConectado('floresta_pioneira', 3)) {
      obj.psa = true;
      estadoJogo.psa    = true;
      estadoJogo.psaAtivo = true;
      estadoJogo.receitaPassiva += 12000;
      this._mostrarToast('🌿 PSA ativado! +R$ 12.000/ciclo. +25% chance de aceite dos fazendeiros.');
      // this._mostrarCardEducativo('psa', '🌿', 'O que é PSA?',
      //   'Pagamento por Serviços Ambientais — o governo e empresas pagam proprietários para manter e restaurar florestas. Conservar também é um negócio.');
    }

    // Ecoturismo — 3 floresta_secundaria conectadas
    if (!obj.ecoturismo && this._temGrupoConectado('floresta_secundaria', 3)) {
      obj.ecoturismo = true;
      estadoJogo.receitaPassiva += 25000;
      this._mostrarToast('🏕️ Ecoturismo ativado! +R$ 25.000/ciclo.');
    }

    // Corredor Ecológico — 3 floresta_climax conectadas: +40% na receitaSAF de cada clímax
    if (!obj.corredor && this._temGrupoConectado('floresta_climax', 3)) {
      obj.corredor = true;
      this.hexagonos.forEach(h => {
        if (h.tipo === 'floresta_climax' && h.receitaSAF > 0) {
          h.receitaSAF = Math.round(h.receitaSAF * 1.4);
        }
      });
      this._mostrarToast('🌿 Corredor ecológico completo! Carbono +40% em todos os clímax.');
      // this._mostrarCardEducativo('corredor', '🦋', 'O que é corredor ecológico?',
      //   'Faixas de floresta conectada que permitem que animais se movam entre áreas. Sem corredores, a fauna fica isolada e perde diversidade genética.');
    }

    // Crédito de Carbono — primeiro hex de clímax
    if (!obj.carbono && this.hexagonos.some(h => h.tipo === 'floresta_climax')) {
      obj.carbono = true;
      estadoJogo.creditoCarbono = true;
      this._notificar('💨 Floresta clímax ativa! Créditos de carbono agora disponíveis para negociação.', 'positivo');
    }
  }

  // -------------------------------------------------------------------------
  // Card educativo — Crédito de Carbono (desativado temporariamente)
  // -------------------------------------------------------------------------
  // _cardCreditoCarbono() {
  //   this._fecharCard();
  //   const { width, height } = this.scale;
  //   const CARD_W = 440, CARD_H = 260;
  //   const cx = width / 2 - CARD_W / 2, cy = height / 2 - CARD_H / 2;
  //   const DEPTH = 20, objs = [];
  //   const overlay = this.add.graphics().setDepth(DEPTH - 1);
  //   overlay.fillStyle(0x000000, 0.6);
  //   overlay.fillRect(0, 0, width, height);
  //   objs.push(overlay);
  //   // ... card content ...
  //   this.cardObjs = objs;
  // }

  // -------------------------------------------------------------------------
  // Verifica condições de desbloqueio de fauna
  // -------------------------------------------------------------------------
  _verificarFauna() {
    const f = estadoJogo.fauna;
    const hexos = this.hexagonos;
    const nClimax   = hexos.filter(h => h.tipo === 'floresta_climax').length;
    const nSecund   = hexos.filter(h => h.tipo === 'floresta_secundaria').length;
    const nNascente = hexos.filter(h => h.tipo === 'nascente_ativa').length;
    const temSAF    = hexos.some(h => h.tipo === 'saf');

    // Abelha Jataí — primeiro SAF ativo
    if (!f.includes('abelha') && temSAF) this._desbloquearFauna('abelha');

    // Cutia — primeira floresta_secundaria
    if (!f.includes('cutia') && nSecund >= 1) this._desbloquearFauna('cutia');

    // Tucano — 3 hexágonos secundários conectados
    if (!f.includes('tucano') && this._temGrupoConectado('floresta_secundaria', 3)) {
      this._desbloquearFauna('tucano');
    }

    // Pacu — nascente_ativa com vizinho em floresta (qualquer)
    if (!f.includes('pacu') && nNascente >= 1) {
      const temVizinhanca = hexos.some((h, idx) => {
        if (h.tipo !== 'nascente_ativa') return false;
        return this._vizinhosHex(idx).some(nb => {
          const t = hexos[nb].tipo;
          return t === 'floresta_pioneira' || t === 'floresta_secundaria' ||
                 t === 'floresta_climax'   || t === 'floresta';
        });
      });
      if (temVizinhanca) this._desbloquearFauna('pacu');
    }

    // Anta — primeira floresta_climax
    if (!f.includes('anta') && nClimax >= 1) this._desbloquearFauna('anta');

    // Onça-pintada — 80% do mapa em clímax
    const pctClimax = nClimax / hexos.length;
    if (!f.includes('onca') && pctClimax >= 0.8) this._desbloquearFauna('onca');
  }

  // -------------------------------------------------------------------------
  // Desbloqueia uma espécie e enfileira o card
  // -------------------------------------------------------------------------
  _desbloquearFauna(id) {
    if (estadoJogo.fauna.includes(id)) return;
    estadoJogo.fauna.push(id);
    this._faunaQueue.push(id);
    if (this._faunaQueue.length === 1) {
      this.time.delayedCall(400, () => this._mostrarProximaFauna());
    }
  }

  // -------------------------------------------------------------------------
  // Mostra o próximo card da fila de fauna
  // -------------------------------------------------------------------------
  _mostrarProximaFauna() {
    if (!this._faunaQueue.length) return;
    const id = this._faunaQueue[0];
    this._cardFauna(id);
  }

  // -------------------------------------------------------------------------
  // Card colecionável de fauna
  // -------------------------------------------------------------------------
  _cardFauna(id) {
    this._fecharCard();
    const animal = FAUNA_CATALOGO.find(a => a.id === id);
    if (!animal) return;

    const { width, height } = this.scale;
    const CARD_W = 380, CARD_H = 320;
    const cx = width / 2 - CARD_W / 2, cy = height / 2 - CARD_H / 2;
    const DEPTH = 25, objs = [];

    const overlay = this.add.graphics().setDepth(DEPTH - 1);
    overlay.fillStyle(0x000000, 0.65);
    overlay.fillRect(0, 0, width, height);
    objs.push(overlay);

    const bgG = this.add.graphics().setDepth(DEPTH);
    bgG.fillStyle(0x071a0e, 1);
    bgG.fillRoundedRect(cx, cy, CARD_W, CARD_H, 14);
    bgG.lineStyle(3, 0xC8A951, 1);
    bgG.strokeRoundedRect(cx, cy, CARD_W, CARD_H, 14);
    objs.push(bgG);

    // Cabeçalho "Nova espécie desbloqueada!"
    objs.push(this.add.text(cx + CARD_W / 2, cy + 20, '✨ Nova espécie desbloqueada!', {
      fontSize: '13px', color: '#C8A951',
      fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(DEPTH));

    // Emoji grande
    objs.push(this.add.text(cx + CARD_W / 2, cy + 80, animal.emoji, {
      fontSize: '72px',
    }).setOrigin(0.5).setDepth(DEPTH));

    // Nome
    objs.push(this.add.text(cx + CARD_W / 2, cy + 140, animal.nome, {
      fontSize: '18px', color: '#d8f3dc',
      fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(DEPTH));

    // Raridade
    objs.push(this.add.text(cx + CARD_W / 2, cy + 163, animal.raridade, {
      fontSize: '12px', color: animal.corRar,
      fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(DEPTH));

    // Função ecológica
    objs.push(this.add.text(cx + 24, cy + 190, animal.funcao, {
      fontSize: '12px', color: '#74c69d',
      fontFamily: 'Inter, sans-serif',
      wordWrap: { width: CARD_W - 48 }, lineSpacing: 3,
    }).setDepth(DEPTH));

    // Dado científico
    objs.push(this.add.text(cx + 24, cy + 238, `"${animal.dado}"`, {
      fontSize: '11px', color: '#a8c5b0', fontStyle: 'italic',
      fontFamily: 'Inter, sans-serif',
      wordWrap: { width: CARD_W - 48 }, lineSpacing: 3,
    }).setDepth(DEPTH));

    const btnY = cy + CARD_H - 50, BTN_W = 200, BTN_H = 34;
    const btnG = this.add.graphics().setDepth(DEPTH);
    const desBt = h => {
      btnG.clear();
      btnG.fillStyle(h ? 0x2d6a4f : 0x1b4332, 1);
      btnG.fillRoundedRect(cx + CARD_W / 2 - BTN_W / 2, btnY, BTN_W, BTN_H, 6);
    };
    desBt(false); objs.push(btnG);

    const totalAnimais = estadoJogo.fauna.length;
    const btnLabel = `Incrível! (${totalAnimais}/${FAUNA_CATALOGO.length})`;
    objs.push(this.add.text(cx + CARD_W / 2, btnY + BTN_H / 2, btnLabel, {
      fontSize: '13px', color: '#d8f3dc',
      fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(DEPTH));

    const z = this.add.zone(cx + CARD_W / 2, btnY + BTN_H / 2, BTN_W, BTN_H)
      .setDepth(DEPTH + 1).setInteractive({ useHandCursor: true });
    z.on('pointerover', () => desBt(true));
    z.on('pointerout',  () => desBt(false));
    z.on('pointerdown', () => {
      this._fecharCard();
      this._faunaQueue.shift();
      if (id === 'onca') {
        this.time.delayedCall(400, () => this.scene.start('TelaVitoria'));
        return;
      }
      if (this._faunaQueue.length > 0) {
        this.time.delayedCall(300, () => this._mostrarProximaFauna());
      }
    });
    objs.push(z);
    this.cardObjs = objs;
  }

  // -------------------------------------------------------------------------
  // Regredir hexágono para solo (desflorestamento, incêndio tardio, etc.)
  // -------------------------------------------------------------------------
  _regredirHexagono(idx, motivo) {
    const hex = this.hexagonos[idx];
    if (hex.evolucaoTimer) { hex.evolucaoTimer.remove(); hex.evolucaoTimer = null; }
    if (hex.receitaSAF)    hex.receitaSAF = 0;

    this._mudarEstadoHex(idx, 'solo');

    // Card de perda
    this._fecharCard();
    const { width, height } = this.scale;
    const CARD_W = 420, CARD_H = 200;
    const cx = width / 2 - CARD_W / 2, cy = height / 2 - CARD_H / 2;
    const DEPTH = 20, objs = [];

    const overlay = this.add.graphics().setDepth(DEPTH - 1);
    overlay.fillStyle(0x000000, 0.55);
    overlay.fillRect(0, 0, width, height);
    objs.push(overlay);

    const bgG = this.add.graphics().setDepth(DEPTH);
    bgG.fillStyle(0x1a0505, 1);
    bgG.fillRoundedRect(cx, cy, CARD_W, CARD_H, 10);
    bgG.lineStyle(1.5, 0xC1440E, 1);
    bgG.strokeRoundedRect(cx, cy, CARD_W, CARD_H, 10);
    objs.push(bgG);

    objs.push(this.add.text(cx + 20, cy + 20, '💔 Área perdida!', {
      fontSize: '16px', color: '#e76f51',
      fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
    }).setDepth(DEPTH));

    objs.push(this.add.text(cx + 20, cy + 55,
      motivo || 'A área foi degradada e retornou ao estado inicial. Todo o progresso de sucessão foi perdido.',
      { fontSize: '13px', color: '#d8f3dc', fontFamily: 'Inter, sans-serif',
        wordWrap: { width: CARD_W - 40 }, lineSpacing: 4 }
    ).setDepth(DEPTH));

    const btnY = cy + CARD_H - 48, BTN_W = 180, BTN_H = 34;
    const btnG = this.add.graphics().setDepth(DEPTH);
    const desBt = h => {
      btnG.clear();
      btnG.fillStyle(h ? 0x6b2424 : 0x3d1515, 1);
      btnG.fillRoundedRect(cx + CARD_W / 2 - BTN_W / 2, btnY, BTN_W, BTN_H, 6);
    };
    desBt(false); objs.push(btnG);

    objs.push(this.add.text(cx + CARD_W / 2, btnY + BTN_H / 2, 'Entendido', {
      fontSize: '13px', color: '#d8f3dc',
      fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(DEPTH));

    const z = this.add.zone(cx + CARD_W / 2, btnY + BTN_H / 2, BTN_W, BTN_H)
      .setDepth(DEPTH + 1).setInteractive({ useHandCursor: true });
    z.on('pointerover', () => desBt(true));
    z.on('pointerout',  () => desBt(false));
    z.on('pointerdown', () => this._fecharCard());
    objs.push(z);
    this.cardObjs = objs;
  }

  // =========================================================================
  // VITÓRIA
  // =========================================================================

  _condicoesVitoria() {
    const h = this.hexagonos;
    const n = h.length;
    const nClimax = h.filter(x => x.tipo === 'floresta_climax').length;
    return (
      nClimax / n >= 0.80 &&
      !h.some(x => x.tipo === 'garimpo') &&
      !h.some(x => x.tipo === 'nascente') &&
      !h.some(x => x.tipo === 'queimada') &&
      !h.some(x => x.tipo === 'solo')
    );
  }

  _verificarVitoria() {
    if (this._vitoriaAtivada || this._gameOverAtivado) return;
    if (!this._condicoesVitoria()) return;
    this._vitoriaAtivada = true;
    this.time.delayedCall(600, () => this._sequenciaVitoria());
  }

  _sequenciaVitoria() {
    this._fecharCard();
    this._fecharMenu();
    this.time.removeAllEvents();

    // Passo 1: hexágonos piscam em verde 3×
    const ov = this.add.graphics().setDepth(8);
    const desenhar = () => {
      ov.clear();
      ov.fillStyle(0x52b788, 0.55);
      this.hexagonos.forEach(h => {
        ov.beginPath();
        ov.moveTo(h.pts[0].x, h.pts[0].y);
        for (let i = 1; i < 6; i++) ov.lineTo(h.pts[i].x, h.pts[i].y);
        ov.closePath();
        ov.fillPath();
      });
    };
    desenhar();

    this.tweens.add({
      targets: ov, alpha: 0, duration: 350,
      yoyo: true, repeat: 2, ease: 'Linear',
      onComplete: () => {
        ov.destroy();
        // Texto central de vitória
        const cx = this.scale.width / 2;
        const cy = this.scale.height / 2;
        const txt = this.add.text(cx, cy, '🌳 Território restaurado!', {
          fontSize: '32px', color: '#d8f3dc',
          fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
        }).setOrigin(0.5).setDepth(9).setAlpha(0);
        this.tweens.add({ targets: txt, alpha: 1, duration: 700 });
        // Passo 2: fauna após 3s
        this.time.delayedCall(3000, () => {
          if (txt.active) txt.destroy();
          this._sequenciaFaunaVitoria();
        });
      },
    });
  }

  _sequenciaFaunaVitoria() {
    const ORDEM = { Comum: 0, Incomum: 1, Raro: 2, Lendária: 3 };
    const coletados = estadoJogo.fauna
      .filter(id => id !== 'onca')
      .sort((a, b) => {
        const ra = FAUNA_CATALOGO.find(f => f.id === a)?.raridade ?? 'Comum';
        const rb = FAUNA_CATALOGO.find(f => f.id === b)?.raridade ?? 'Comum';
        return ORDEM[ra] - ORDEM[rb];
      });
    if (estadoJogo.fauna.includes('onca')) coletados.push('onca');

    if (!coletados.length) { this.scene.start('TelaVitoria'); return; }

    let i = 0;
    const mostrar = () => {
      if (i >= coletados.length) { this.scene.start('TelaVitoria'); return; }
      const id = coletados[i++];
      this._cardFaunaVitoria(id, id === 'onca', () => mostrar());
    };
    mostrar();
  }

  _cardFaunaVitoria(id, isOnca, onNext) {
    this._fecharCard();
    const animal = FAUNA_CATALOGO.find(a => a.id === id);
    if (!animal) { onNext(); return; }

    const { width, height } = this.scale;
    const CARD_W = 380, CARD_H = 320;
    const cx = width / 2 - CARD_W / 2, cy = height / 2 - CARD_H / 2;
    const DEPTH = 25, objs = [];
    let autoTimer = null;

    const ov = this.add.graphics().setDepth(DEPTH - 1);
    ov.fillStyle(0x000000, 0.65); ov.fillRect(0, 0, width, height);
    objs.push(ov);

    const bgG = this.add.graphics().setDepth(DEPTH);
    bgG.fillStyle(0x071a0e, 1);
    bgG.fillRoundedRect(cx, cy, CARD_W, CARD_H, 14);
    objs.push(bgG);

    // Borda: onça = dourada pulsante, demais = padrão
    const bordaG = this.add.graphics().setDepth(DEPTH);
    bordaG.lineStyle(isOnca ? 3 : 2, isOnca ? 0xC8A951 : 0x52b788, 1);
    bordaG.strokeRoundedRect(cx, cy, CARD_W, CARD_H, 14);
    objs.push(bordaG);
    if (isOnca) {
      this.tweens.add({ targets: bordaG, alpha: 0.2, duration: 400, yoyo: true, repeat: -1 });
    }

    objs.push(this.add.text(cx + CARD_W / 2, cy + 20,
      isOnca ? '🏆 Espécie lendária!' : '✨ ' + animal.raridade,
      { fontSize: '13px', color: isOnca ? '#C8A951' : '#74c69d',
        fontFamily: 'Inter, sans-serif', fontStyle: 'bold' }
    ).setOrigin(0.5).setDepth(DEPTH));

    objs.push(this.add.text(cx + CARD_W / 2, cy + 80, animal.emoji, { fontSize: '72px' })
      .setOrigin(0.5).setDepth(DEPTH));

    objs.push(this.add.text(cx + CARD_W / 2, cy + 140, animal.nome, {
      fontSize: '18px', color: '#d8f3dc',
      fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(DEPTH));

    objs.push(this.add.text(cx + 24, cy + 175, animal.funcao, {
      fontSize: '12px', color: '#74c69d', fontFamily: 'Inter, sans-serif',
      wordWrap: { width: CARD_W - 48 }, lineSpacing: 3,
    }).setDepth(DEPTH));

    objs.push(this.add.text(cx + 24, cy + 228, `"${animal.dado}"`, {
      fontSize: '11px', color: '#a8c5b0', fontStyle: 'italic',
      fontFamily: 'Inter, sans-serif', wordWrap: { width: CARD_W - 48 }, lineSpacing: 3,
    }).setDepth(DEPTH));

    const btnY = cy + CARD_H - 50, BTN_W = 200, BTN_H = 34;
    const btnG = this.add.graphics().setDepth(DEPTH);
    const desBt = h => { btnG.clear();
      btnG.fillStyle(h ? 0x2d6a4f : 0x1b4332, 1);
      btnG.fillRoundedRect(cx + CARD_W / 2 - BTN_W / 2, btnY, BTN_W, BTN_H, 6); };
    desBt(false); objs.push(btnG);

    objs.push(this.add.text(cx + CARD_W / 2, btnY + BTN_H / 2, 'Continuar →', {
      fontSize: '13px', color: '#d8f3dc',
      fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(DEPTH));

    const avançar = () => {
      if (autoTimer) { autoTimer.remove(); autoTimer = null; }
      objs.forEach(o => { if (o.active) o.destroy(); });
      this.cardObjs = [];
      onNext();
    };

    const z = this.add.zone(cx + CARD_W / 2, btnY + BTN_H / 2, BTN_W, BTN_H)
      .setDepth(DEPTH + 1).setInteractive({ useHandCursor: true });
    z.on('pointerover', () => desBt(true));
    z.on('pointerout',  () => desBt(false));
    z.on('pointerdown', avançar);
    objs.push(z);

    this.cardObjs = objs;
    autoTimer = this.time.delayedCall(2000, avançar);
  }

  // =========================================================================
  // CARDS EDUCATIVOS
  // =========================================================================

  // _mostrarCardEducativo e _exibirCardEducativo — desativados temporariamente
  // Serão reaproveitados de outra forma
  _mostrarCardEducativo(_id, _icone, _titulo, _texto) {
    // Cards educativos desativados — retorna sem fazer nada
  }
  // _exibirCardEducativo(icone, titulo, texto) { ... }

  // =========================================================================
  // SISTEMA DE EVENTOS
  // =========================================================================

  // -------------------------------------------------------------------------
  // Alertas empilhados — canto inferior direito
  // -------------------------------------------------------------------------
  _mostrarAlerta(msg, corBorda = '#52b788', critico = false) {
    let tipo = 'positivo';
    if (critico || corBorda === 'critico') tipo = 'critico';
    else if (corBorda === '#4A90D9') tipo = 'informativo';
    this._notificar(msg, tipo);
  }

  // -------------------------------------------------------------------------
  // Banner piscante de aviso no topo (delegated to _notificar)
  // -------------------------------------------------------------------------
  _mostrarBannerAviso(msg) {
    this._notificar(msg, 'emergencia');
  }

  // -------------------------------------------------------------------------
  // Sistema de notificações — canto inferior esquerdo, empilhado
  // Tipos: positivo (verde), agua (azul), atencao (amarelo),
  //        alerta (laranja), emergencia (vermelho), critico (vermelho persistente)
  //        informativo → alias de agua para compatibilidade
  // -------------------------------------------------------------------------
  _notificar(msg, tipo = 'positivo') {
    if (!this._notifObjs) this._notifObjs = [];
    // Remove expiradas
    this._notifObjs = this._notifObjs.filter(n => n.alive);
    if (this._notifObjs.length >= 4) {
      const oldest = this._notifObjs.shift();
      oldest.alive = false;
      oldest.objs.forEach(o => { if (o.active) o.destroy(); });
    }

    const COR_MAP = {
      positivo:   0x52b788,  // verde   — progresso e conquistas
      agua:       0x4A90D9,  // azul    — água
      informativo:0x4A90D9,  // azul    — alias de agua
      atencao:    0xf4a261,  // amarelo — atenção / avisos
      alerta:     0xe76f51,  // laranja — reocupação, fumaça
      emergencia: 0xe63946,  // vermelho— queimada ativa, saldo crítico
      critico:    0xe63946,  // vermelho— alias persistente de emergencia
    };
    const cor = COR_MAP[tipo] ?? COR_MAP.positivo;
    const isPersistente = tipo === 'critico' || tipo === 'emergencia';

    const { height } = this.scale;
    const W = 340, H = 44, GAP = 6, BORDA = 3;
    const ax = 12;
    const DEPTH = 22;

    // Reposiciona todas as existentes para cima, preservando cor original de cada uma
    this._notifObjs.forEach((n, i) => {
      const targetY = height - 12 - (this._notifObjs.length - i) * (H + GAP);
      n.objs.forEach(o => {
        if (!o.active) return;
        if (o.type === 'Text') { o.y = targetY + H / 2; return; }
        if (o === n.bgObj) {
          o.clear();
          o.fillStyle(0x1b4332, 1);
          o.fillRoundedRect(ax, targetY, W, H, 5);
          o.lineStyle(1, 0x2d6a4f, 0.6);
          o.strokeRoundedRect(ax, targetY, W, H, 5);
        }
        if (o === n.accentObj) {
          o.clear();
          o.fillStyle(n.cor, 1);
          o.fillRect(ax, targetY + 4, BORDA, H - 8);
        }
      });
    });

    const slot = this._notifObjs.length;
    const ay   = height - 12 - (slot + 1) * (H + GAP);

    const bg = this.add.graphics().setDepth(DEPTH);
    bg.fillStyle(0x1b4332, 1);
    bg.fillRoundedRect(ax, ay, W, H, 5);
    bg.lineStyle(1, 0x2d6a4f, 0.6);
    bg.strokeRoundedRect(ax, ay, W, H, 5);

    const accent = this.add.graphics().setDepth(DEPTH + 0.5);
    accent.fillStyle(cor, 1);
    accent.fillRect(ax, ay + 4, BORDA, H - 8);

    const txt = this.add.text(ax + BORDA + 10, ay + H / 2, msg, {
      fontSize: '12px', color: '#d8f3dc', fontFamily: 'Inter, sans-serif',
      wordWrap: { width: W - BORDA - 22 }, lineSpacing: 2,
    }).setOrigin(0, 0.5).setDepth(DEPTH + 1);

    const entry = { alive: true, cor, bgObj: bg, accentObj: accent, objs: [bg, accent, txt] };
    this._notifObjs.push(entry);

    const destruir = () => {
      entry.alive = false;
      entry.objs.forEach(o => { if (o.active) o.destroy(); });
      this._notifObjs = this._notifObjs.filter(n => n !== entry);
    };

    if (isPersistente) {
      const z = this.add.zone(ax + W / 2, ay + H / 2, W, H)
        .setDepth(DEPTH + 2).setInteractive({ useHandCursor: true });
      z.on('pointerdown', () => { destruir(); if (z.active) z.destroy(); });
      entry.objs.push(z);
      this.time.delayedCall(8000, destruir);
    } else {
      this.tweens.add({
        targets: entry.objs, alpha: 0, delay: 3500, duration: 500,
        onComplete: destruir,
      });
    }
  }

  // -------------------------------------------------------------------------
  // Eventos aleatórios periódicos
  // -------------------------------------------------------------------------
  _iniciarEventosAleatorios() {
    // Seca Extrema — 15% a cada 3 min (45s dev)
    const durSeca = DEV_MODE ? 45000 : 180000;
    this.time.addEvent({ delay: durSeca, loop: true, callback: () => {
      if (Math.random() > 0.15) return;
      this._mostrarBannerAviso('⚠️ SECA EXTREMA SE APROXIMANDO — Verifique suas reservas de água!');
      this.time.delayedCall(10000, () => this._aplicarSeca());
    }});

    // Edital Aprovado — 20-35% a cada 4 min (60s dev)
    const durEdital = DEV_MODE ? 60000 : 240000;
    this.time.addEvent({ delay: durEdital, loop: true, callback: () => {
      const temParcerias = this.hexagonos.some(h =>
        h.aliancaCompleta || h.parceiriaPec != null || h.tipo === 'saf'
      );
      const chance = temParcerias ? 0.35 : 0.20;
      if (Math.random() > chance) return;
      estadoJogo.dinheiro += 200000;
      estadoJogo.eventosSobrevividos++;
      this.atualizarPainel();
      this._mostrarTextoFlutuante(
        this._dinheiroHudCx ?? 300, 88, '+R$ 200.000', '#52b788'
      );
      this._cardEditalAprovado();
    }});
  }

  _aplicarSeca() {
    this._secaAtiva = true;
    estadoJogo.eventosSobrevividos++;
    const temCisterna = estadoJogo.temCisterna;
    const fator = temCisterna ? 0.80 : 0.50;

    // Reduz produção das nascentes ativas
    this.hexagonos.forEach(hex => {
      if (hex.tipo !== 'nascente_ativa') return;
      hex._producaoAguaOriginal = hex._producaoAguaOriginal ?? hex.producaoAgua;
      hex.producaoAgua = Math.round(hex.producaoAgua * fator);
    });

    // Morte de mudas recentes (pioneira com menos de 30s real / 30s)
    if (!temCisterna) {
      const agora = this.time.now;
      this.hexagonos.forEach((hex, i) => {
        if (hex.tipo !== 'floresta_pioneira') return;
        const idadeSeg = (agora - hex.evolucaoTimestamp) / 1000;
        if (idadeSeg < 30 && Math.random() < 0.4) {
          this._regredirHexagono(i, 'A seca extrema matou as mudas recém-plantadas antes de se estabelecerem.');
        }
      });
    }

    this._cardSecaExtrema(temCisterna);

    // Normaliza após 2 ciclos (2 min real / 30s dev)
    const durNorm = DEV_MODE ? 30000 : 120000;
    this.time.delayedCall(durNorm, () => {
      this._secaAtiva = false;
      this.hexagonos.forEach(hex => {
        if (hex.tipo === 'nascente_ativa' && hex._producaoAguaOriginal != null) {
          hex.producaoAgua = hex._producaoAguaOriginal;
          delete hex._producaoAguaOriginal;
        }
      });
      this._notificar('🌧️ A seca passou. Produção de água normalizada.', 'agua');
    });
  }

  _cardSecaExtrema(temCisterna) {
    this._fecharCard();
    const { width, height } = this.scale;
    const CARD_W = 420, CARD_H = 190;
    const cx = width / 2 - CARD_W / 2, cy = height / 2 - CARD_H / 2;
    const DEPTH = 20, objs = [];

    const ov = this.add.graphics().setDepth(DEPTH - 1);
    ov.fillStyle(0x000000, 0.55); ov.fillRect(0, 0, width, height);
    objs.push(ov);

    const bg = this.add.graphics().setDepth(DEPTH);
    bg.fillStyle(0x4a2800, 1);
    bg.fillRoundedRect(cx, cy, CARD_W, CARD_H, 10);
    bg.lineStyle(2, 0xC8A951, 1);
    bg.strokeRoundedRect(cx, cy, CARD_W, CARD_H, 10);
    objs.push(bg);

    objs.push(this.add.text(cx + 20, cy + 18, '☀️ Seca Extrema!', {
      fontSize: '16px', color: '#C8A951', fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
    }).setDepth(DEPTH));

    const corpo = temCisterna
      ? 'Sua cisterna reduziu o impacto em 60%. A produção de água caiu 20% por 2 ciclos. As mudas estão protegidas.'
      : 'A produção de água caiu 50% por 2 ciclos. Florestas jovens estão em risco — mudas recém-plantadas podem morrer.';
    objs.push(this.add.text(cx + 20, cy + 54, corpo, {
      fontSize: '13px', color: '#d8f3dc', fontFamily: 'Inter, sans-serif',
      wordWrap: { width: CARD_W - 40 }, lineSpacing: 4,
    }).setDepth(DEPTH));

    const btnY = cy + CARD_H - 50, BTN_W = 180, BTN_H = 34;
    const btnG = this.add.graphics().setDepth(DEPTH);
    const desBt = h => { btnG.clear(); btnG.fillStyle(h ? 0x7a4f10 : 0x4a2800, 1);
      btnG.fillRoundedRect(cx + CARD_W / 2 - BTN_W / 2, btnY, BTN_W, BTN_H, 6); };
    desBt(false); objs.push(btnG);

    objs.push(this.add.text(cx + CARD_W / 2, btnY + BTN_H / 2, 'Entendido', {
      fontSize: '13px', color: '#d8f3dc', fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(DEPTH));

    const z = this.add.zone(cx + CARD_W / 2, btnY + BTN_H / 2, BTN_W, BTN_H)
      .setDepth(DEPTH + 1).setInteractive({ useHandCursor: true });
    z.on('pointerover', () => desBt(true)); z.on('pointerout', () => desBt(false));
    z.on('pointerdown', () => this._fecharCard());
    objs.push(z);
    this.cardObjs = objs;
  }

  _cardEditalAprovado() {
    this._fecharCard();
    const { width, height } = this.scale;
    const CARD_W = 420, CARD_H = 190;
    const cx = width / 2 - CARD_W / 2, cy = height / 2 - CARD_H / 2;
    const DEPTH = 20, objs = [];

    const ov = this.add.graphics().setDepth(DEPTH - 1);
    ov.fillStyle(0x000000, 0.55); ov.fillRect(0, 0, width, height);
    objs.push(ov);

    const bg = this.add.graphics().setDepth(DEPTH);
    bg.fillStyle(0x0d2818, 1);
    bg.fillRoundedRect(cx, cy, CARD_W, CARD_H, 10);
    bg.lineStyle(2, 0x52b788, 1);
    bg.strokeRoundedRect(cx, cy, CARD_W, CARD_H, 10);
    objs.push(bg);

    objs.push(this.add.text(cx + 20, cy + 18, '🎉 Edital Aprovado!', {
      fontSize: '18px', color: '#52b788', fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
    }).setDepth(DEPTH));

    objs.push(this.add.text(cx + 20, cy + 54,
      'Sua ONG foi contemplada com recursos adicionais.\nO trabalho de parceria está rendendo frutos.',
      { fontSize: '13px', color: '#d8f3dc', fontFamily: 'Inter, sans-serif', lineSpacing: 4 }
    ).setDepth(DEPTH));

    objs.push(this.add.text(cx + 20, cy + 110, '+R$ 200.000', {
      fontSize: '24px', color: '#52b788', fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
    }).setDepth(DEPTH));

    const btnY = cy + CARD_H - 50, BTN_W = 180, BTN_H = 34;
    const btnG = this.add.graphics().setDepth(DEPTH);
    const desBt = h => { btnG.clear(); btnG.fillStyle(h ? 0x2d6a4f : 0x1b4332, 1);
      btnG.fillRoundedRect(cx + CARD_W / 2 - BTN_W / 2, btnY, BTN_W, BTN_H, 6); };
    desBt(false); objs.push(btnG);

    objs.push(this.add.text(cx + CARD_W / 2, btnY + BTN_H / 2, 'Excelente!', {
      fontSize: '13px', color: '#d8f3dc', fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(DEPTH));

    const z = this.add.zone(cx + CARD_W / 2, btnY + BTN_H / 2, BTN_W, BTN_H)
      .setDepth(DEPTH + 1).setInteractive({ useHandCursor: true });
    z.on('pointerover', () => desBt(true)); z.on('pointerout', () => desBt(false));
    z.on('pointerdown', () => this._fecharCard());
    objs.push(z);
    this.cardObjs = objs;
  }

  // -------------------------------------------------------------------------
  // Consequência — Expansão do Garimpo
  // -------------------------------------------------------------------------
  _monitorarGarimpoExpansao(idx) {
    const hex = this.hexagonos[idx];
    if (hex.garimpoExpansaoTimer) { hex.garimpoExpansaoTimer.remove(); hex.garimpoExpansaoTimer = null; }

    const dur = DEV_MODE ? 40000 : 180000;
    hex.garimpoExpansaoTimer = this.time.delayedCall(dur, () => {
      hex.garimpoExpansaoTimer = null;
      if (hex.tipo !== 'garimpo') return;
      this._garimpoExpandiu(idx);
    });
  }

  _garimpoExpandiu(idx) {
    const candidatos = this._vizinhosHex(idx).filter(vi => {
      const h = this.hexagonos[vi];
      return h.tipo !== 'garimpo' && h.tipo !== 'indigena' &&
             !h.vigilancia && !h.bloqueado && h.tipo !== 'queimada';
    });
    if (!candidatos.length) return;

    const alvoIdx = candidatos[Math.floor(Math.random() * candidatos.length)];
    const alvo = this.hexagonos[alvoIdx];
    alvo.perfil = PERFIS_GARIMPEIRO[Math.floor(Math.random() * PERFIS_GARIMPEIRO.length)];
    alvo.bonusNegociacao = 0;
    alvo.vigilancia = false;
    estadoJogo.eventosSobrevividos++;
    this._mudarEstadoHex(alvoIdx, 'garimpo');
    this._mostrarAlerta(
      '⛏️ O garimpo se expandiu! Neutralize-o antes que tome conta do território.',
      '#6B6B6B', true
    );
  }

  // -------------------------------------------------------------------------
  // Consequência — Queimada Criminosa (fumaça → incêndio)
  // -------------------------------------------------------------------------
  _monitorarQueimadaCriminosa(idx) {
    const hex = this.hexagonos[idx];
    if (hex.queimadaCrimTimer) { hex.queimadaCrimTimer.remove(); hex.queimadaCrimTimer = null; }

    const dur = DEV_MODE ? 30000 : 120000;
    hex.queimadaCrimTimer = this.time.delayedCall(dur, () => {
      hex.queimadaCrimTimer = null;
      if (hex.tipo !== 'pecuaria' || hex.semaforoPecuaria !== 'vermelho') return;

      // Procura hexágono restaurado vizinho para atacar
      const RESTAURADOS = ['floresta_pioneira', 'floresta_secundaria', 'floresta_climax',
                           'floresta', 'saf', 'nascente_ativa', 'viveiro', 'manejo'];
      const candidatos = this._vizinhosHex(idx).filter(vi =>
        RESTAURADOS.includes(this.hexagonos[vi].tipo)
      );
      if (!candidatos.length) return;

      const alvoIdx = candidatos[Math.floor(Math.random() * candidatos.length)];
      this._iniciarFumaca(alvoIdx);
    });
  }

  _iniciarFumaca(idx) {
    const hex = this.hexagonos[idx];
    if (hex._fumacaAtiva) return; // já em andamento
    hex._fumacaAtiva = true;
    estadoJogo.eventosSobrevividos++;

    hex.fumaçaObj = this.add.text(hex.cx, hex.cy, '💨', {
      fontSize: '22px',
    }).setOrigin(0.5).setDepth(4.6);

    this.tweens.add({
      targets: hex.fumaçaObj, alpha: 0.2, duration: 450,
      yoyo: true, repeat: -1,
    });

    const durFumaca = hex.vigilancia
      ? (DEV_MODE ? 8000 : 40000)
      : (DEV_MODE ? 5000 : 20000);

    this._mostrarAlerta(
      '💨 Fumaça detectada! Aja rápido para evitar o incêndio. [clique no hex]',
      '#C1440E', true
    );

    hex.fumaçaTimer = this.time.delayedCall(durFumaca, () => {
      hex.fumaçaTimer = null;
      if (!hex._fumacaAtiva) return; // jogador agiu
      if (hex.fumaçaObj && hex.fumaçaObj.active) { hex.fumaçaObj.destroy(); hex.fumaçaObj = null; }
      hex._fumacaAtiva = false;
      // Vira queimada
      this._mudarEstadoHex(idx, 'queimada');
      this._iniciarPropagacao(idx);
      this._mostrarAlertaIncendio('🔥 Queimada criminosa se alastrou!');
    });
  }

  // Menu de reação quando hex tem fumaça ativa
  _menuFumaca(idx) {
    const hex = this.hexagonos[idx];
    const custoD = 30000;
    const custoA = 1000;
    const temD = estadoJogo.dinheiro >= custoD;
    const temA = estadoJogo.agua !== null && estadoJogo.agua >= custoA;

    this._abrirMenu(idx, {
      titulo:         '💨 Fumaça Detectada!',
      descricao:      'Aja agora para evitar o incêndio.',
      tituloColor:    '#C1440E',
      descricaoColor: '#e76f51',
      acoes: [{
        label:        '🚒 Sufocar incipiente',
        custoStr:     `R$ 30.000 + 1.000L`,
        desabilitado: !temD || !temA,
        aviso:        !temD ? 'Saldo insuficiente' : !temA ? 'Água insuficiente' : null,
        onPress: () => {
          estadoJogo.dinheiro -= custoD;
          estadoJogo.agua     -= custoA;
          this.atualizarPainel();
          this._fecharMenu();
          this.selectedIdx = -1; this._desenharSelecao();
          // Cancela o timer de queimada
          if (hex.fumaçaTimer)  { hex.fumaçaTimer.remove(); hex.fumaçaTimer = null; }
          if (hex.fumaçaObj && hex.fumaçaObj.active) { hex.fumaçaObj.destroy(); hex.fumaçaObj = null; }
          hex._fumacaAtiva = false;
          this._mostrarToast('✅ Fumaça controlada! Incêndio evitado.');
        },
      }],
    });
  }

  // -------------------------------------------------------------------------
  // Consequência — Invasão de Pasto (após recusa do fazendeiro)
  // -------------------------------------------------------------------------
  _iniciarInvasaoPasto(idx) {
    const hex = this.hexagonos[idx];
    if (hex.invasaoTimer) { hex.invasaoTimer.remove(); hex.invasaoTimer = null; }

    // Candidatos: hexágonos vizinhos sem proteção
    const VAZIOS = ['solo', 'solo_preparado'];
    const candidatos = this._vizinhosHex(idx).filter(vi =>
      VAZIOS.includes(this.hexagonos[vi].tipo)
    );
    if (!candidatos.length) return;

    const alvoIdx = candidatos[Math.floor(Math.random() * candidatos.length)];
    const alvoHex = this.hexagonos[alvoIdx];

    // Aviso visual sobre o alvo
    const avisoObj = this.add.text(alvoHex.cx, alvoHex.cy - 28, '⚠️', {
      fontSize: '18px',
    }).setOrigin(0.5).setDepth(4.6);
    this.tweens.add({ targets: avisoObj, alpha: 0.2, duration: 400, yoyo: true, repeat: -1 });

    this._notificar('🐄 Invasão de pasto iminente! Inicie negociação para evitar.', 'alerta');

    const durAviso = DEV_MODE ? 8000 : 30000;
    hex.invasaoTimer = this.time.delayedCall(durAviso, () => {
      hex.invasaoTimer = null;
      if (avisoObj.active) avisoObj.destroy();
      if (hex.tipo !== 'pecuaria') return; // já foi resolvido

      // Converte para pecuária
      const p = PERFIS_FAZENDEIRO[Math.floor(Math.random() * PERFIS_FAZENDEIRO.length)];
      const nome = NOMES_FAZENDEIROS[Math.floor(Math.random() * NOMES_FAZENDEIROS.length)];
      alvoHex.semaforoPecuaria  = 'vermelho';
      alvoHex.perfilFazendeiro  = { ...p, nomePropio: nome, idade: 35 + Math.floor(Math.random() * 34) };
      alvoHex.bonusContatoPec   = 0;
      alvoHex.contatoBloqueado  = false;
      alvoHex.parceiriaPec      = null;
      alvoHex.receitaSAF        = 0;
      alvoHex.expansaoTimer     = null;
      this._mudarEstadoHex(alvoIdx, 'pecuaria');
      this._notificar('🐄 Invasão de pasto! Um hexágono foi convertido em pecuária.', 'alerta');
    });
  }

  // -------------------------------------------------------------------------
  // Consequência — Crime Florestal (ciclo periódico)
  // -------------------------------------------------------------------------
  _monitorarCrimeFlorestal() {
    const dur = DEV_MODE ? 60000 : 300000; // 5 min / 60s dev
    this.time.addEvent({ delay: dur, loop: true, callback: () => {
      this.hexagonos.forEach((hex, i) => {
        if (!['floresta_secundaria', 'floresta_climax'].includes(hex.tipo)) return;
        if (hex.vigilancia) return;
        if (Math.random() > 0.20) return;

        const novoTipo = hex.tipo === 'floresta_climax' ? 'floresta_secundaria' : 'floresta_pioneira';
        if (hex.evolucaoTimer) { hex.evolucaoTimer.remove(); hex.evolucaoTimer = null; }
        this._mudarEstadoHex(i, novoTipo);
        this._mostrarAlerta(
          '🪓 Crime florestal detectado! Uma área foi degradada ilegalmente.',
          '#C1440E', true
        );
      });
    }});
  }

  // -------------------------------------------------------------------------
  // Game Over — monitoramento contínuo
  // -------------------------------------------------------------------------
  _verificarGameOver() {
    this.time.addEvent({ delay: 1000, loop: true, callback: () => {
      if (estadoJogo.dinheiro > 0 || this._gameOverAtivado) return;
      this._gameOverAtivado = true;
      this._mostrarGameOver();
    }});
  }

  _mostrarGameOver() {
    this.time.removeAllEvents();
    const { width, height } = this.scale;
    const DEPTH = 50;

    const ov = this.add.graphics().setDepth(DEPTH);
    ov.fillStyle(0x0d2818, 0.97);
    ov.fillRect(0, 0, width, height);

    this.add.text(width / 2, height / 2 - 160, '💸', { fontSize: '72px' })
      .setOrigin(0.5).setDepth(DEPTH);

    this.add.text(width / 2, height / 2 - 80, 'Recursos esgotados', {
      fontSize: '36px', color: '#e76f51',
      fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(DEPTH);

    this.add.text(width / 2, height / 2 - 32,
      'Sua ONG ficou sem recursos para continuar a restauração.',
      { fontSize: '16px', color: '#d8f3dc', fontFamily: 'Inter, sans-serif' }
    ).setOrigin(0.5).setDepth(DEPTH);

    // Estatísticas simples
    const nClimax    = this.hexagonos.filter(h => h.tipo === 'floresta_climax').length;
    const nSecund    = this.hexagonos.filter(h => h.tipo === 'floresta_secundaria').length;
    const nFauna     = estadoJogo.fauna.length;
    this.add.text(width / 2, height / 2 + 14,
      `🌳 ${nClimax} clímax · 🌲 ${nSecund} secundárias · 🐾 ${nFauna}/${FAUNA_CATALOGO.length} espécies`,
      { fontSize: '14px', color: '#74c69d', fontFamily: 'Inter, sans-serif' }
    ).setOrigin(0.5).setDepth(DEPTH);

    // Botões
    const BTN_W = 220, BTN_H = 44, GAP = 20;
    const totalBtnW = BTN_W * 2 + GAP;
    const btn1X = width / 2 - totalBtnW / 2;
    const btn2X = btn1X + BTN_W + GAP;
    const btnY  = height / 2 + 80;

    const _btn = (bx, label, cor, onPress) => {
      const g = this.add.graphics().setDepth(DEPTH);
      const des = h => { g.clear(); g.fillStyle(h ? cor + 0x222222 : cor, 1);
        g.fillRoundedRect(bx, btnY, BTN_W, BTN_H, 8); };
      des(false);
      this.add.text(bx + BTN_W / 2, btnY + BTN_H / 2, label, {
        fontSize: '14px', color: '#ffffff',
        fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(DEPTH);
      const z = this.add.zone(bx + BTN_W / 2, btnY + BTN_H / 2, BTN_W, BTN_H)
        .setDepth(DEPTH + 1).setInteractive({ useHandCursor: true });
      z.on('pointerdown', onPress);
    };

    _btn(btn1X, 'Tentar novamente',   0x1b4332, () => this.scene.start('Jogo'));
    _btn(btn2X, 'Mudar dificuldade',  0x3d1515, () => this.scene.start('Onboarding2'));
  }

  // -------------------------------------------------------------------------
  // Reocupação do garimpo (ciclo automático)
  // -------------------------------------------------------------------------
  _cicloReocupacao() {
    const dur = DEV_MODE ? 15000 : 60000;
    this.time.addEvent({
      delay: dur, loop: true,
      callback: () => {
        this.hexagonos.forEach((hex, idx) => {
          if (hex.tipo !== 'garimpo_neutralizado') return;
          if (hex.vigilancia) return;
          if (hex.bloqueado)  return;
          if (Math.random() < 0.30) {
            // Reocupação — gera novo perfil
            hex.perfil           = PERFIS_GARIMPEIRO[Math.floor(Math.random() * PERFIS_GARIMPEIRO.length)];
            hex.bonusNegociacao  = 0;
            hex.vigilancia       = false;
            this._mudarEstadoHex(idx, 'garimpo');
            this._notificar('⚠️ Garimpeiros voltaram a ocupar uma área neutralizada!', 'alerta');
          }
        });
      },
    });
  }

  _fecharMenu() {
    this.fecharMenuHTML();
    this.menuObjs   = [];
    this.menuBounds = null;
  }

  // -------------------------------------------------------------------------
  // Cartão de falha e toast
  // -------------------------------------------------------------------------
  _mostrarCartaoFalha(idx, msg) {
    this._notificar('⚠️ ' + msg, 'critico');
  }

  _mostrarToast(msg) {
    this._notificar(msg, 'positivo');
  }

  // -------------------------------------------------------------------------
  // HUD helpers
  // -------------------------------------------------------------------------
  _formatarRecurso(key) {
    const v = estadoJogo[key];
    if (key === 'dinheiro') return `R$ ${v.toLocaleString('pt-BR')}`;
    if (key === 'equipe') {
      const n = v.length;
      const custo = v.reduce((s, m) => s + m.custo, 0);
      return custo > 0
        ? `${n} — R$${(custo / 1000).toFixed(0)}k/ciclo`
        : `${n} membro${n !== 1 ? 's' : ''}`;
    }
    if (v === null || v === undefined) return '—';
    if (key === 'agua')    return `${v.toLocaleString('pt-BR')}L`;
    if (key === 'energia') return `${v}kWh`;
    return String(v);
  }

  // Alias de compatibilidade — qualquer atualização de recurso redesenha o HUD HTML
  atualizarHUD(_key) { this.atualizarHUDHTML(); }

  // Atualiza HUD HTML + painel lateral
  atualizarPainel() {
    this.atualizarHUDHTML();
    // Painel lateral — redesenha com throttle para não travar no ciclo
    if (this._painelConteudoObjs !== undefined && !this._painelRedrawPending) {
      this._painelRedrawPending = true;
      this.time.delayedCall(60, () => {
        this._painelRedrawPending = false;
        this._redesenharPainel();
      });
    }
  }

  // Stub mantido para compatibilidade (barra de clímax agora é HTML)
  _atualizarBarra() { this.atualizarHUDHTML(); }

  // -------------------------------------------------------------------------
  // HUD HTML
  // -------------------------------------------------------------------------
  criarHUDHTML() {
    const hud = document.getElementById('hud-superior');
    if (!hud) return;

    hud.innerHTML = `
      <div style="display:flex;align-items:center;width:100%;padding:0 20px;gap:0;height:100%;overflow:hidden;">

        <!-- Identidade -->
        <div style="min-width:140px;padding-right:20px;border-right:1px solid #1e4030;flex-shrink:0;">
          <div id="hud-ong"     style="font-family:'Syne',sans-serif;font-size:15px;font-weight:700;color:#d8f3dc;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:130px;"></div>
          <div id="hud-jogador" style="font-family:'Inter',sans-serif;font-size:12px;color:#74c69d;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:130px;"></div>
        </div>

        <!-- Recursos -->
        <div style="display:flex;align-items:center;flex:1;justify-content:center;gap:0;">

          <div style="padding:0 22px;border-right:1px solid #1e4030;text-align:center;">
            <div style="display:flex;align-items:center;justify-content:center;gap:5px;">
              <span style="font-size:13px;">💰</span>
              <span id="hud-dinheiro" style="font-family:'Syne',sans-serif;font-size:15px;font-weight:700;color:#d8f3dc;white-space:nowrap;"></span>
            </div>
            <div style="display:flex;align-items:center;justify-content:center;gap:5px;margin-top:1px;">
              <span style="font-family:'Inter',sans-serif;font-size:10px;color:#52b788;text-transform:uppercase;letter-spacing:0.06em;">Dinheiro</span>
              <span id="hud-dinheiro-delta" style="font-family:'Inter',sans-serif;font-size:10px;"></span>
            </div>
          </div>

          <div style="padding:0 22px;border-right:1px solid #1e4030;text-align:center;">
            <div style="display:flex;align-items:center;justify-content:center;gap:5px;">
              <span style="font-size:13px;">💧</span>
              <span id="hud-agua" style="font-family:'Syne',sans-serif;font-size:15px;font-weight:700;color:#4A90D9;white-space:nowrap;"></span>
            </div>
            <div style="font-family:'Inter',sans-serif;font-size:10px;color:#52b788;text-transform:uppercase;letter-spacing:0.06em;margin-top:1px;">Água</div>
          </div>

          <div style="padding:0 22px;border-right:1px solid #1e4030;text-align:center;">
            <div style="display:flex;align-items:center;justify-content:center;gap:5px;">
              <span style="font-size:13px;">👥</span>
              <span id="hud-equipe" style="font-family:'Syne',sans-serif;font-size:15px;font-weight:700;color:#d8f3dc;white-space:nowrap;"></span>
            </div>
            <div style="display:flex;align-items:center;justify-content:center;gap:4px;margin-top:1px;">
              <span style="font-family:'Inter',sans-serif;font-size:10px;color:#52b788;text-transform:uppercase;letter-spacing:0.06em;">Equipe</span>
              <span id="hud-equipe-custo" style="font-family:'Inter',sans-serif;font-size:10px;color:#e76f51;"></span>
            </div>
          </div>

          <div style="padding:0 22px;border-right:1px solid #1e4030;text-align:center;">
            <div style="display:flex;align-items:center;justify-content:center;gap:5px;">
              <span style="font-size:13px;">🌱</span>
              <span id="hud-mudas" style="font-family:'Syne',sans-serif;font-size:15px;font-weight:700;color:#52b788;white-space:nowrap;"></span>
            </div>
            <div style="font-family:'Inter',sans-serif;font-size:10px;color:#52b788;text-transform:uppercase;letter-spacing:0.06em;margin-top:1px;">Mudas</div>
          </div>

          <div style="padding:0 22px;text-align:center;">
            <div style="display:flex;align-items:center;justify-content:center;gap:5px;">
              <span style="font-size:13px;">⚡</span>
              <span id="hud-energia" style="font-family:'Syne',sans-serif;font-size:15px;font-weight:700;color:#f4a261;white-space:nowrap;"></span>
            </div>
            <div style="font-family:'Inter',sans-serif;font-size:10px;color:#52b788;text-transform:uppercase;letter-spacing:0.06em;margin-top:1px;">Energia</div>
          </div>

        </div>

        <!-- Clímax -->
        <div style="min-width:180px;padding-left:20px;border-left:1px solid #1e4030;flex-shrink:0;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
            <span style="font-family:'Inter',sans-serif;font-size:10px;color:#52b788;text-transform:uppercase;letter-spacing:0.08em;">Clímax</span>
            <span id="hud-climax-pct" style="font-family:'Syne',sans-serif;font-size:14px;font-weight:700;color:#d8f3dc;">0%</span>
          </div>
          <div style="height:6px;background:#1e4030;border-radius:3px;overflow:hidden;">
            <div id="hud-climax-barra" style="height:100%;width:0%;background:#52b788;border-radius:3px;transition:width 0.5s ease;"></div>
          </div>
        </div>

      </div>
    `;

    // Identidade
    const elOng     = document.getElementById('hud-ong');
    const elJogador = document.getElementById('hud-jogador');
    if (elOng)     elOng.textContent     = dadosJogo.ong  || '';
    if (elJogador) elJogador.textContent = dadosJogo.nome || '';

    // Valores iniciais
    this.atualizarHUDHTML();
  }

  atualizarHUDHTML() {
    const el = (id) => document.getElementById(id);

    // Dinheiro
    const din = estadoJogo.dinheiro ?? 0;
    const fmtDin = din >= 1000000
      ? 'R$ ' + (din / 1000000).toFixed(1) + 'M'
      : din >= 1000
        ? 'R$ ' + Math.round(din / 1000) + 'k'
        : 'R$ ' + din;
    if (el('hud-dinheiro')) el('hud-dinheiro').textContent = fmtDin;

    // Delta dinheiro/ciclo: receitas - custos de equipe - trator
    let receitas = estadoJogo.receitaPassiva ?? 0;
    if (this.hexagonos) {
      this.hexagonos.forEach(h => { if (h.receitaSAF > 0) receitas += h.receitaSAF; });
    }
    if (estadoJogo.psaAtivo) receitas += 12000;
    if (this._objetivosAtivados?.ecoturismo) receitas += 25000;
    const custoEq     = (estadoJogo.equipe ?? []).reduce((s, m) => s + (m.custo ?? 0), 0);
    const custoTrator = estadoJogo.temTrator ? 2000 : 0;
    const delta       = receitas - custoEq - custoTrator;
    const elDelta = el('hud-dinheiro-delta');
    if (elDelta) {
      if (delta !== 0) {
        elDelta.textContent = (delta > 0 ? '+' : '') + Math.round(delta / 1000) + 'k/ciclo';
        elDelta.style.color = delta >= 0 ? '#52b788' : '#e76f51';
      } else {
        elDelta.textContent = '';
      }
    }

    // Água
    const agua = estadoJogo.agua;
    if (el('hud-agua')) el('hud-agua').textContent = agua != null ? agua.toLocaleString('pt-BR') + 'L' : '—';

    // Equipe
    const nEq = (estadoJogo.equipe ?? []).length;
    if (el('hud-equipe')) el('hud-equipe').textContent = nEq + (nEq === 1 ? ' membro' : ' membros');
    const elCusto = el('hud-equipe-custo');
    if (elCusto) {
      elCusto.textContent = custoEq > 0
        ? '-R$' + Math.round(custoEq / 1000) + 'k/ciclo'
        : '';
    }

    // Mudas
    const mudas = estadoJogo.mudas ?? 0;
    if (el('hud-mudas')) el('hud-mudas').textContent = mudas.toLocaleString('pt-BR');

    // Energia
    const energia = estadoJogo.energia;
    if (el('hud-energia')) el('hud-energia').textContent = energia != null ? energia + ' kWh' : '—';

    // Clímax
    const pct = Math.min(estadoJogo.climax ?? 0, 100);
    if (el('hud-climax-pct'))   el('hud-climax-pct').textContent   = Math.round(pct) + '%';
    if (el('hud-climax-barra')) el('hud-climax-barra').style.width = pct + '%';
  }

  // =========================================================================
  // BARRA INFERIOR MOBILE HTML
  // =========================================================================

  criarBarraInferiorHTML() {
    const barra = document.getElementById('barra-inferior');
    if (!barra) return;
    barra.innerHTML = `
      <button class="barra-btn" onclick="abrirGaveta('receitas')">
        <span>💰</span><span>Receitas</span>
      </button>
      <button class="barra-btn" onclick="abrirGaveta('parcerias')">
        <span>🤝</span><span>Parcerias</span>
      </button>
      <button class="barra-btn" onclick="abrirGaveta('objetivos')">
        <span>🎯</span><span>Objetivos</span>
      </button>
      <button class="barra-btn" onclick="abrirGaveta('fauna')">
        <span>🦜</span><span>Fauna</span>
      </button>
      <button class="barra-btn" onclick="abrirGaveta('equipe')">
        <span>👥</span><span>Equipe</span>
      </button>
    `;
  }

  // =========================================================================
  // PAINEL DIREITO HTML
  // =========================================================================

  criarPainelHTML() {
    const painel = document.getElementById('painel-direito');
    if (!painel) return;

    painel.innerHTML = `
      <div class="pd-secao">
        <div class="pd-header">
          <span style="font-size:13px;">💰</span>
          <span class="pd-label">Receitas Ativas</span>
        </div>
        <div id="pd-receitas" class="pd-conteudo"></div>
      </div>

      <div class="pd-secao">
        <div class="pd-header">
          <span style="font-size:13px;">🤝</span>
          <span class="pd-label">Parcerias</span>
        </div>
        <div id="pd-parcerias" class="pd-conteudo"></div>
      </div>

      <div class="pd-secao">
        <div class="pd-header">
          <span style="font-size:13px;">🎯</span>
          <span class="pd-label">Objetivos</span>
        </div>
        <div id="pd-objetivos" class="pd-conteudo"></div>
      </div>

      <div class="pd-secao">
        <div class="pd-header pd-header-toggle" onclick="toggleSecao('pd-fauna-conteudo', this)">
          <span style="font-size:13px;">🦜</span>
          <span class="pd-label">Fauna</span>
          <span class="pd-chevron">▼</span>
        </div>
        <div id="pd-fauna-conteudo" class="pd-conteudo"></div>
      </div>

      <div class="pd-secao">
        <div class="pd-header">
          <span style="font-size:13px;">👥</span>
          <span class="pd-label">Equipe</span>
        </div>
        <div class="pd-sublabel">Equipe Ativa</div>
        <div id="pd-equipe-ativa" class="pd-conteudo"></div>
        <div id="pd-bonus-equipe" style="margin:8px 0;"></div>
        <div id="pd-aviso-negociacao" style="display:none;background:#1a0f0f;border-left:3px solid #e76f51;border-radius:0 6px 6px 0;padding:8px 12px;margin-bottom:10px;">
          <span style="font-size:12px;color:#e76f51;">⚠ Negociação bloqueada — contrate um técnico</span>
        </div>
        <div class="pd-sublabel" style="margin-top:12px;">Contratar</div>
        <div id="pd-contratar" class="pd-conteudo"></div>
        <div class="pd-sublabel" style="margin-top:12px;">Maquinário</div>
        <div id="pd-maquinario" class="pd-conteudo"></div>
      </div>
    `;

    // Injetar estilos uma vez
    if (!document.getElementById('pd-estilos')) {
      const style = document.createElement('style');
      style.id = 'pd-estilos';
      style.textContent = `
        #painel-direito::-webkit-scrollbar { width: 4px; }
        #painel-direito::-webkit-scrollbar-track { background: #0d2818; }
        #painel-direito::-webkit-scrollbar-thumb { background: #2d6a4f; border-radius: 2px; }
        .pd-secao { margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid #1e4030; }
        .pd-secao:last-child { border-bottom: none; }
        .pd-header { display: flex; align-items: center; gap: 6px; padding: 6px 0; }
        .pd-header-toggle { cursor: pointer; user-select: none; }
        .pd-header-toggle:hover .pd-label { color: #d8f3dc; }
        .pd-label { font-family: Inter, sans-serif; font-size: 11px; font-weight: 500; color: #52b788; text-transform: uppercase; letter-spacing: 0.08em; flex: 1; }
        .pd-chevron { font-size: 10px; color: #52b788; }
        .pd-sublabel { font-family: Inter, sans-serif; font-size: 10px; color: #52b788; text-transform: uppercase; letter-spacing: 0.08em; margin: 6px 0 4px; }
        .pd-conteudo { padding-left: 2px; }
        .pd-vazio { font-family: Inter, sans-serif; font-size: 13px; color: #74c69d; font-style: italic; }
        .pd-item { font-family: Inter, sans-serif; font-size: 13px; color: #d8f3dc; line-height: 1.7; }
        .pd-objetivo { margin-bottom: 10px; }
        .pd-objetivo-linha { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
        .pd-objetivo-nome { font-family: Inter, sans-serif; font-size: 13px; color: #d8f3dc; }
        .pd-objetivo-count { font-family: Inter, sans-serif; font-size: 11px; color: #74c69d; }
        .pd-barra-fundo { height: 3px; background: #1e4030; border-radius: 2px; }
        .pd-barra-fill { height: 100%; background: #52b788; border-radius: 2px; transition: width 0.4s ease; }
        .pd-membro { display: flex; align-items: center; justify-content: space-between; padding: 7px 10px; background: #0d2818; border: 1px solid #1e4030; border-radius: 8px; margin-bottom: 6px; }
        .pd-membro-nome { font-family: Inter, sans-serif; font-size: 13px; font-weight: 500; color: #d8f3dc; }
        .pd-membro-custo { font-family: Inter, sans-serif; font-size: 11px; color: #74c69d; margin-top: 2px; }
        .pd-btn-demitir { background: #3d0f0f; border: 1px solid #7a1f1f; border-radius: 6px; padding: 4px 10px; font-family: Inter, sans-serif; font-size: 11px; color: #e76f51; cursor: pointer; flex-shrink: 0; }
        .pd-btn-demitir:hover { background: #5a1515; border-color: #e76f51; }
        .pd-btn-contratar { display: flex; align-items: center; justify-content: space-between; padding: 9px 12px; background: #0d2818; border: 1px solid #1e4030; border-radius: 8px; margin-bottom: 6px; cursor: pointer; width: 100%; }
        .pd-btn-contratar:hover { border-color: #52b788; background: #1b4332; }
        .pd-btn-contratar:disabled { opacity: 0.45; cursor: not-allowed; }
        .pd-btn-contratar:disabled:hover { border-color: #1e4030; background: #0d2818; }
        .pd-btn-contratar-nome { font-family: Inter, sans-serif; font-size: 13px; font-weight: 500; color: #d8f3dc; }
        .pd-btn-contratar-custo { font-family: Inter, sans-serif; font-size: 12px; color: #74c69d; }
        .pd-btn-trator { width: 100%; padding: 12px 14px; background: #2d1f00; border: 1px solid #8B5E00; border-radius: 8px; cursor: pointer; text-align: center; }
        .pd-btn-trator:hover { background: #3d2a00; border-color: #f4a261; }
        .pd-btn-trator:disabled { opacity: 0.45; cursor: not-allowed; }
        .pd-btn-trator:disabled:hover { background: #2d1f00; border-color: #8B5E00; }
        .pd-btn-trator-titulo { font-family: Syne, sans-serif; font-size: 13px; font-weight: 700; color: #f4a261; display: block; }
        .pd-btn-trator-sub { font-family: Inter, sans-serif; font-size: 11px; color: #74c69d; display: block; margin-top: 3px; }
        .pd-fauna-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
        .pd-fauna-cel { background: #0d1f0d; border-radius: 6px; padding: 8px 4px; text-align: center; }
        .pd-fauna-cel.desbloqueada { background: #1b4332; border: 1px solid #2d6a4f; cursor: pointer; }
        .pd-fauna-cel.desbloqueada:hover { background: #2d6a4f; }
        .pd-fauna-emoji { font-size: 20px; display: block; margin-bottom: 4px; }
        .pd-fauna-nome { font-family: Inter, sans-serif; font-size: 9px; color: #74c69d; }
      `;
      document.head.appendChild(style);
    }

    this.atualizarPainelHTML();
  }

  atualizarPainelHTML() {
    this._pdReceitas();
    this._pdParcerias();
    this._pdObjetivos();
    this._pdFauna();
    this._pdEquipe();
  }

  _pdReceitas() {
    const el = document.getElementById('pd-receitas');
    if (!el) return;
    const lista = [];
    this.hexagonos.forEach(h => {
      if (h.receitaSAF <= 0) return;
      const rotulo = h.tipo === 'saf' ? 'SAF' : h.tipo === 'manejo' ? 'Manejo' : h.tipo === 'floresta_climax' ? 'Carbono' : 'Receita';
      const ex = lista.find(r => r.nome === rotulo);
      if (ex) { ex.valor += h.receitaSAF; ex.n++; }
      else lista.push({ nome: rotulo, valor: h.receitaSAF, n: 1 });
    });
    if (estadoJogo.psaAtivo) lista.push({ nome: 'PSA', valor: 12000, n: 0 });
    if (this._objetivosAtivados?.ecoturismo) lista.push({ nome: 'Ecoturismo', valor: 25000, n: 0 });
    if (estadoJogo.receitaPassiva > 0) lista.push({ nome: 'Outros', valor: estadoJogo.receitaPassiva, n: 0 });

    if (lista.length === 0) {
      el.innerHTML = '<span class="pd-vazio">Nenhuma receita ativa ainda.</span>';
      return;
    }
    const total = lista.reduce((s, r) => s + r.valor, 0);
    el.innerHTML = lista.map(r => `
      <div style="display:flex;justify-content:space-between;margin-bottom:3px;">
        <span class="pd-item">${r.n > 1 ? r.nome + ' ×' + r.n : r.nome}</span>
        <span style="font-family:Inter,sans-serif;font-size:12px;color:#52b788;">+R$${Math.round(r.valor / 1000)}k</span>
      </div>
    `).join('') + `
      <div style="display:flex;justify-content:space-between;margin-top:5px;padding-top:5px;border-top:1px solid #1e4030;">
        <span style="font-family:Inter,sans-serif;font-size:12px;color:#74c69d;">Total/ciclo</span>
        <span style="font-family:'Syne',sans-serif;font-size:13px;font-weight:700;color:#52b788;">+R$${Math.round(total / 1000)}k</span>
      </div>
    `;
  }

  _pdParcerias() {
    const el = document.getElementById('pd-parcerias');
    if (!el) return;
    const itens = [];
    this.hexagonos.forEach(h => {
      if (h.parceiriaPec && h.perfilFazendeiro) {
        const t = { saf: 'SAF', reflorestamento: 'Reflorest.', manejo: 'Manejo', intensiva: 'Intensiva' }[h.parceiriaPec] ?? h.parceiriaPec;
        itens.push({ txt: `🐄 ${h.perfilFazendeiro.nomePropio} — ${t}`, cor: '#C8A951' });
      }
    });
    this.hexagonos.filter(h => h.tipo === 'indigena').forEach(h => {
      const cor = h.semaforoIndigena === 'verde' ? '#52b788' : h.semaforoIndigena === 'amarelo' ? '#C8A951' : '#e76f51';
      const st  = h.semaforoIndigena === 'verde' ? 'Aliados' : h.semaforoIndigena === 'amarelo' ? 'Em diálogo' : 'Sem contato';
      itens.push({ txt: `🪶 Indígenas — ${st}`, cor });
    });
    const nN = this.hexagonos.filter(h => h.tipo === 'garimpo_neutralizado').length;
    if (nN > 0) itens.push({ txt: `⛏️ ${nN} garimpo(s) neutralizado(s)`, cor: '#74c69d' });

    if (itens.length === 0) {
      el.innerHTML = '<span class="pd-vazio">Nenhuma parceria estabelecida.</span>';
      return;
    }
    el.innerHTML = itens.map(p => `<div class="pd-item" style="color:${p.cor};margin-bottom:3px;">${p.txt}</div>`).join('');
  }

  _pdObjetivos() {
    const el = document.getElementById('pd-objetivos');
    if (!el) return;
    const meta80 = Math.ceil(this.hexagonos.length * 0.8);
    const nClimax = this.hexagonos.filter(h => h.tipo === 'floresta_climax').length;
    const feito = (nome) => `<div class="pd-item" style="color:#52b788;margin-bottom:6px;">✅ ${nome}</div>`;
    const barra = (nome, cur, meta) => {
      const pct = Math.min(100, (cur / meta) * 100);
      return `<div class="pd-objetivo">
        <div class="pd-objetivo-linha">
          <span class="pd-objetivo-nome">${nome}</span>
          <span class="pd-objetivo-count">${cur}/${meta}</span>
        </div>
        <div class="pd-barra-fundo"><div class="pd-barra-fill" style="width:${pct}%"></div></div>
      </div>`;
    };
    let html = '';
    html += this._objetivosAtivados?.psa
      ? feito('PSA — 3 pioneiras conectadas')
      : barra('PSA — pioneiras', this._tamanhoMaiorGrupo('floresta_pioneira'), 3);
    html += this._objetivosAtivados?.ecoturismo
      ? feito('Ecoturismo — 3 secundárias')
      : barra('Ecoturismo — secundárias', this._tamanhoMaiorGrupo('floresta_secundaria'), 3);
    html += this._objetivosAtivados?.corredor
      ? feito('Corredor — 3 clímax')
      : barra('Corredor — clímax', this._tamanhoMaiorGrupo('floresta_climax'), 3);
    html += barra('Floresta Clímax (80%)', nClimax, meta80);
    el.innerHTML = html;
  }

  _pdFauna() {
    const el = document.getElementById('pd-fauna-conteudo');
    if (!el) return;
    const desbloqueados = estadoJogo.fauna ?? [];
    el.innerHTML = `<div class="pd-fauna-grid">` +
      FAUNA_CATALOGO.map(f => {
        const des = desbloqueados.includes(f.id);
        return `<div class="pd-fauna-cel${des ? ' desbloqueada' : ''}"
          ${des ? `onclick="window.gameScene._cardFaunaInfo('${f.id}')" title="${f.nome}"` : ''}>
          <span class="pd-fauna-emoji" style="${des ? '' : 'opacity:0.25;filter:grayscale(1)'}">${des ? f.emoji : '?'}</span>
          <div class="pd-fauna-nome">${des ? f.nome.split(' ')[0] : '???'}</div>
        </div>`;
      }).join('') +
    `</div>`;
  }

  _pdEquipe() {
    const elAtiva     = document.getElementById('pd-equipe-ativa');
    const elContratar = document.getElementById('pd-contratar');
    const elMaq       = document.getElementById('pd-maquinario');
    const elAviso     = document.getElementById('pd-aviso-negociacao');
    const elBonus     = document.getElementById('pd-bonus-equipe');
    if (!elAtiva) return;

    const eq = estadoJogo.equipe ?? [];

    // ── Equipe ativa ─────────────────────────────────────────────────────────
    if (eq.length === 0) {
      elAtiva.innerHTML = '<span class="pd-vazio">Nenhum membro contratado.</span>';
    } else {
      elAtiva.innerHTML = eq.map(m => `
        <div class="pd-membro">
          <div>
            <div class="pd-membro-nome">${m.emoji} ${m.nome}</div>
            <div class="pd-membro-custo">R$ ${m.custo.toLocaleString('pt-BR')}/ciclo</div>
          </div>
          <button class="pd-btn-demitir" onclick="window.gameScene._demitirMembro('${m.id}')">Demitir</button>
        </div>
      `).join('');
    }

    // ── Aviso negociação ─────────────────────────────────────────────────────
    const temNeg = eq.some(m => m.tipo === 'tecnico_negociacao');
    if (elAviso) elAviso.style.display = temNeg ? 'none' : 'block';

    // ── Bônus ────────────────────────────────────────────────────────────────
    if (elBonus) {
      const nTec  = eq.filter(m => m.tipo === 'tecnico_florestal').length;
      const nBrig = eq.filter(m => m.tipo === 'brigadista' || m.tipo === 'brigadista_indigena').length;
      const pctEco  = Math.min(70, nTec * 10 + (estadoJogo.temTrator ? 20 : 0));
      const pctFogo = Math.min(50, nBrig * 10);
      let html = '';
      if (pctEco  > 0) html += `<div style="font-family:Inter,sans-serif;font-size:12px;color:#52b788;margin-bottom:3px;">⚡ Restauração: ${pctEco}% mais rápida</div>`;
      if (pctFogo > 0) html += `<div style="font-family:Inter,sans-serif;font-size:12px;color:#e76f51;">🔥 Combate incêndio: ${pctFogo}% mais rápido</div>`;
      elBonus.innerHTML = html;
    }

    // ── Contratar ─────────────────────────────────────────────────────────────
    if (elContratar) {
      elContratar.innerHTML = CATALOGO_EQUIPE.map(cat => {
        const pode = estadoJogo.dinheiro >= cat.custo;
        return `<button class="pd-btn-contratar" ${pode ? '' : 'disabled'} onclick="window.gameScene._contratarMembro('${cat.tipo}')">
          <span class="pd-btn-contratar-nome">${cat.emoji} ${cat.nome}</span>
          <span class="pd-btn-contratar-custo">R$${Math.round(cat.custo / 1000)}k/ciclo</span>
        </button>`;
      }).join('');
    }

    // ── Maquinário ────────────────────────────────────────────────────────────
    if (elMaq) {
      if (estadoJogo.temTrator) {
        elMaq.innerHTML = `
          <div class="pd-membro">
            <div>
              <div class="pd-membro-nome">🚜 Trator</div>
              <div class="pd-membro-custo">R$ 2.000/ciclo · +20% ações ecológicas</div>
            </div>
            <button class="pd-btn-demitir" onclick="window.gameScene._venderTrator()">Vender</button>
          </div>`;
      } else {
        const pode = estadoJogo.dinheiro >= 80000;
        elMaq.innerHTML = `
          <button class="pd-btn-trator" ${pode ? '' : 'disabled'} onclick="window.gameScene._comprarTrator()">
            <span class="pd-btn-trator-titulo">🚜 Comprar Trator — R$ 80.000</span>
            <span class="pd-btn-trator-sub">Manutenção: R$ 2.000/ciclo · +20% ações ecológicas</span>
          </button>`;
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Tela de Vitória
// ---------------------------------------------------------------------------
class TelaVitoria extends Phaser.Scene {
  constructor() { super({ key: 'TelaVitoria' }); }

  create() {
    const { width, height } = this.scale;
    const cx = width / 2;

    // Fundo
    const bg = this.add.graphics();
    bg.fillStyle(0x0d2818, 1);
    bg.fillRect(0, 0, width, height);

    // Estrelas decorativas
    for (let i = 0; i < 14; i++) {
      const star = this.add.text(
        Phaser.Math.Between(20, width - 20),
        Phaser.Math.Between(20, height - 20),
        '✨', { fontSize: '12px' }
      ).setAlpha(0);
      this.tweens.add({
        targets: star, alpha: 0.8, duration: 500 + i * 60,
        delay: i * 100, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      });
    }

    // Topo — ONG
    const ong = dadosJogo.nomeONG || 'Sua ONG';
    this.add.text(cx, 36, ong, {
      fontSize: '18px', color: '#52b788',
      fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
    }).setOrigin(0.5);
    this.add.text(cx, 60, 'restaurou a Amazônia', {
      fontSize: '14px', color: '#74c69d', fontFamily: 'Inter, sans-serif',
    }).setOrigin(0.5);

    // ── Cards de dados ──────────────────────────────────────────────────────
    const CARD_W = 185, CARD_H = 88, GAP = 14;
    const totalW = 3 * CARD_W + 2 * GAP;
    const startX = cx - totalW / 2;
    const row1Y   = 90, row2Y = row1Y + CARD_H + GAP;

    // Tempo jogado
    const ms = Date.now() - (estadoJogo.tempoInicio || Date.now());
    const min = Math.floor(ms / 60000), sec = Math.floor((ms % 60000) / 1000);
    const tempoStr = `${min}m ${sec}s`;

    const dados = [
      { icon: '⏱️', label: 'Tempo jogado',       valor: tempoStr },
      { icon: '💰', label: 'Saldo final',         valor: `R$ ${estadoJogo.dinheiro.toLocaleString('pt-BR')}` },
      { icon: '🎯', label: 'Dificuldade',         valor: dadosJogo.dificuldade || '—' },
      { icon: '🤝', label: 'Negociações',         valor: String(estadoJogo.negociacoesBemSucedidas) },
      { icon: '🔥', label: 'Eventos enfrentados', valor: String(estadoJogo.eventosSobrevividos) },
      { icon: '🌳', label: 'Floresta Clímax',     valor: `${Math.round(estadoJogo.climax)}%` },
    ];

    dados.forEach(({ icon, label, valor }, i) => {
      const col  = i % 3;
      const rowY = i < 3 ? row1Y : row2Y;
      const bx   = startX + col * (CARD_W + GAP);
      const by   = rowY;

      const g = this.add.graphics();
      g.fillStyle(0x1b4332, 1);
      g.fillRoundedRect(bx, by, CARD_W, CARD_H, 8);
      g.lineStyle(1, 0x2d6a4f, 1);
      g.strokeRoundedRect(bx, by, CARD_W, CARD_H, 8);

      this.add.text(bx + CARD_W / 2, by + 20, icon, { fontSize: '20px' }).setOrigin(0.5);
      this.add.text(bx + CARD_W / 2, by + 46, valor, {
        fontSize: '16px', color: '#d8f3dc',
        fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
      }).setOrigin(0.5);
      this.add.text(bx + CARD_W / 2, by + 68, label, {
        fontSize: '11px', color: '#74c69d',
        fontFamily: 'Inter, sans-serif', letterSpacing: 0.5,
      }).setOrigin(0.5);
    });

    // ── Fauna desbloqueada ──────────────────────────────────────────────────
    const faunaY = row2Y + CARD_H + 22;
    this.add.text(cx, faunaY, 'Fauna desbloqueada', {
      fontSize: '12px', color: '#74c69d', fontFamily: 'Inter, sans-serif', letterSpacing: 1,
    }).setOrigin(0.5);

    const faunaEmojiW = 56;
    const totalFaunaW = FAUNA_CATALOGO.length * faunaEmojiW;
    const faunaStartX = cx - totalFaunaW / 2 + faunaEmojiW / 2;
    FAUNA_CATALOGO.forEach((animal, i) => {
      const coletado = estadoJogo.fauna.includes(animal.id);
      const ex = faunaStartX + i * faunaEmojiW;
      const ey = faunaY + 28;
      const txt = this.add.text(ex, ey, animal.emoji, { fontSize: '26px' }).setOrigin(0.5);
      if (!coletado) txt.setAlpha(0.18);
    });

    // ── Mensagem final ──────────────────────────────────────────────────────
    const nFauna = estadoJogo.fauna.length;
    const saldo  = estadoJogo.dinheiro;
    let msg, msgCor;
    if (saldo > 500000 && nFauna === FAUNA_CATALOGO.length) {
      msg = 'Gestão excepcional. Você demonstrou que restauração florestal e bioeconomia andam juntas.';
      msgCor = '#52b788';
    } else if (saldo >= 100000 && nFauna >= 4) {
      msg = 'Missão cumprida. O território está restaurado e a biodiversidade retornou.';
      msgCor = '#74c69d';
    } else {
      msg = 'Você chegou lá. Foi difícil, mas a floresta está de pé.';
      msgCor = '#C8A951';
    }

    const msgY = faunaY + 72;
    this.add.text(cx, msgY, msg, {
      fontSize: '14px', color: msgCor, fontFamily: 'Inter, sans-serif',
      fontStyle: 'italic', wordWrap: { width: 700 }, align: 'center',
    }).setOrigin(0.5);

    // ── Botões ──────────────────────────────────────────────────────────────
    const BTN_W = 220, BTN_H = 44, BTN_GAP = 20;
    const btnRowY  = msgY + 52;
    const btn1X    = cx - BTN_W - BTN_GAP / 2;
    const btn2X    = cx + BTN_GAP / 2;

    const _botao = (bx, label, cor, onPress) => {
      const g = this.add.graphics();
      const des = h => {
        g.clear();
        g.fillStyle(h ? cor + 0x111111 : cor, 1);
        g.fillRoundedRect(bx, btnRowY, BTN_W, BTN_H, 8);
      };
      des(false);
      this.add.text(bx + BTN_W / 2, btnRowY + BTN_H / 2, label, {
        fontSize: '14px', color: '#ffffff',
        fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
      }).setOrigin(0.5);
      const z = this.add.zone(bx + BTN_W / 2, btnRowY + BTN_H / 2, BTN_W, BTN_H)
        .setInteractive({ useHandCursor: true });
      z.on('pointerover', () => des(true));
      z.on('pointerout',  () => des(false));
      z.on('pointerdown', onPress);
    };

    _botao(btn1X, '🔄 Jogar novamente',  0x1b4332, () => this.scene.start('Onboarding1'));
    _botao(btn2X, '📊 Ver ranking',       0x4a3808, () => {
      // Fase 15 — placeholder
      this.add.text(cx, btnRowY + BTN_H + 20, 'Ranking disponível na Fase 15!', {
        fontSize: '12px', color: '#74c69d', fontFamily: 'Inter, sans-serif',
      }).setOrigin(0.5);
    });
  }
}

// ---------------------------------------------------------------------------
// Config Phaser
// ---------------------------------------------------------------------------
const config = {
  type: Phaser.AUTO,
  backgroundColor: '#0d2818',
  scale: {
    mode: Phaser.Scale.RESIZE,
    parent: 'game-container',
    width: '100%',
    height: '100%',
  },
  scene: [TelaInicial, Onboarding1, Onboarding2, Onboarding3, Jogo, TelaVitoria],
};

new Phaser.Game(config);
