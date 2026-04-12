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
  saf:                  { label: 'Sistema Agroflorestal',  emoji: '🌾',  cor: 0x5C7A2E, hex: '#5C7A2E' },
  floresta_secundaria:  { label: 'Floresta Secundária',   emoji: '🌲',  cor: 0x2d9e6b, hex: '#2d9e6b' },
  floresta_climax:      { label: 'Floresta Clímax',       emoji: '🌳',  cor: 0x1a6b3a, hex: '#1a6b3a' },
  viveiro:              { label: 'Viveiro de Mudas',       emoji: '🪴',  cor: 0x2d6a4f, hex: '#2d6a4f' },
  manejo:               { label: 'Manejo Florestal',       emoji: '🪵',  cor: 0x4a7c4e, hex: '#4a7c4e' },
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
};

// ---------------------------------------------------------------------------
// Catálogo de membros da equipe
// ---------------------------------------------------------------------------
const CATALOGO_EQUIPE = [
  {
    tipo:   'tecnico',
    emoji:  '🔬',
    nome:   'Técnico Ambiental',
    custo:  8000,
    funcao: 'Aumenta chance de negociação em +15% no hex designado.',
  },
  {
    tipo:   'brigadista',
    emoji:  '🚒',
    nome:   'Brigadista Florestal',
    custo:  6000,
    funcao: 'Reduz tempo de combate a incêndios em 30% no hex designado.',
  },
  {
    tipo:   'agronomo',
    emoji:  '🌾',
    nome:   'Engenheiro Agrônomo',
    custo:  9000,
    funcao: 'Reduz tempo de implantação de SAF/Viveiro/Manejo em 25%.',
  },
  {
    tipo:   'hidrologista',
    emoji:  '💧',
    nome:   'Hidrologista',
    custo:  7000,
    funcao: 'Reduz tempo de recuperação de nascentes em 30%.',
  },
  {
    tipo:   'ecologista',
    emoji:  '🌳',
    nome:   'Ecologista',
    custo:  10000,
    funcao: 'Acelera a sucessão florestal em 20% no hex designado.',
  },
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

const PERFIS_GARIMPEIRO = [
  { nome: 'O Migrante',          descricao: 'Veio de longe em busca de sustento. Aberto a alternativas.',   bonus: 0.10 },
  { nome: 'O Veterano',          descricao: 'Conhece bem a região e resiste fortemente à negociação.',       bonus: -0.10 },
  { nome: 'O Jovem Desesperado', descricao: 'Situação precária, mas mais receptivo ao diálogo e às leis.', bonus: 0.05 },
];

const PERFIS_LIDERANCA = [
  { nome: 'Liderança Tradicional', descricao: 'Mais fechada inicialmente, mas a aliança conquistada é poderosa e duradoura.', chanceBase: 0.40 },
  { nome: 'Liderança Jovem',       descricao: 'Mais aberta e pragmática, focada no futuro da comunidade e das próximas gerações.', chanceBase: 0.60 },
];

const PERFIS_FAZENDEIRO = [
  { id: 'endividado',  nome: 'O Endividado',  frase: 'Tô devendo pro banco há 3 anos. Preciso de uma saída.',                bonusContato:  0.15, bonusSAF:  0.20, bonusPSA: 0    },
  { id: 'herdeiro',   nome: 'O Herdeiro',    frase: 'Meu pai deixou essa terra pra mim. Quero fazer algo bom com ela.',      bonusContato:  0.10, bonusSAF:  0,    bonusPSA: 0    },
  { id: 'resistente', nome: 'O Resistente',  frase: 'Minha família vive aqui há 40 anos. Não vou mudar por qualquer conversa.', bonusContato: -0.10, bonusSAF:  0,    bonusPSA: 0    },
  { id: 'oportunista',nome: 'O Oportunista', frase: 'Ouvi falar desse negócio de carbono. Me conta mais.',                  bonusContato:  0,    bonusSAF:  0,    bonusPSA: 0.20 },
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
class Jogo extends Phaser.Scene {
  constructor() { super({ key: 'Jogo' }); }

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
      if (labelKey === 'dinheiro') this._dinheiroHudCx = bx + BLOCO_W / 2;
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
      });
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
    // Equipe — mapa de sprites (id → Phaser.GameObjects.Text)
    // -----------------------------------------------------------------------
    this._membros = new Map();
    this._criarBaseONG();
    this._configurarDragEquipe();

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

      // Fumaça detectada — abre menu de reação antes do menu normal
      if (hex._fumacaAtiva) { this._menuFumaca(idx); return; }

      // Despacha para o builder correto por tipo
      switch (hex.tipo) {
        case 'solo':                 this._menuSoloDegradado(idx);     break;
        case 'solo_preparado':       this._menuSoloPreparado(idx);     break;
        case 'garimpo':              this._cardGarimpeiro(idx);          break;
        case 'garimpo_neutralizado': this._menuGarimpoNeutralizado(idx); break;
        case 'nascente':             this._menuNascenteDegradada(idx);   break;
        case 'nascente_ativa':       this._menuNascenteAtiva(idx);       break;
        case 'queimada':             this._menuQueimada(idx);            break;
        case 'indigena':             this._menuIndigena(idx);            break;
        case 'pecuaria':             this._menuPecuaria(idx);            break;
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

    // Cards educativos por tipo
    if (novoTipo === 'saf')
      this._mostrarCardEducativo('saf', '🌾', 'O que é SAF?',
        'Sistemas Agroflorestais combinam árvores, cultivos e criação animal na mesma área. Produzem alimento E restauram o solo ao mesmo tempo.');
    if (novoTipo === 'garimpo_neutralizado')
      this._mostrarCardEducativo('garimpo_merc', '⚗️', 'Garimpo e mercúrio',
        'O garimpo ilegal contamina rios e solos com mercúrio — um metal tóxico que entra na cadeia alimentar e afeta comunidades ribeirinhas por décadas.');
    if (novoTipo === 'nascente_ativa')
      this._mostrarCardEducativo('bioengenharia', '💧', 'Bioengenharia de margens',
        'Técnica que usa plantas e estruturas naturais para estabilizar margens de rios e nascentes, prevenindo erosão e recuperando o fluxo de água.');

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
      fontSize: '16px', color: config.tituloColor ?? '#d8f3dc',
      fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
    }).setDepth(DEPTH));

    // Descrição
    objs.push(this.add.text(mx + MENU_PAD, my + 36, descricao, {
      fontSize: '12px', color: config.descricaoColor ?? '#74c69d',
      fontFamily: 'Inter, sans-serif',
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

  // -------------------------------------------------------------------------
  // Garimpo — card de perfil do garimpeiro
  // -------------------------------------------------------------------------
  _cardGarimpeiro(idx) {
    this._fecharMenu();
    this._fecharCard();

    const hex    = this.hexagonos[idx];
    const perfil = hex.perfil;
    const chance = this._calcularChance(hex);
    const pct    = Math.round(chance * 100);

    const { width, height } = this.scale;
    const CARD_W = 380, CARD_H = 270;
    const cx = width  / 2 - CARD_W / 2;
    const cy = height / 2 - CARD_H / 2;
    const DEPTH = 20;
    const objs  = [];

    // Fundo escurecido
    const overlay = this.add.graphics().setDepth(DEPTH - 1);
    overlay.fillStyle(0x000000, 0.55);
    overlay.fillRect(0, 0, width, height);
    objs.push(overlay);

    // Card
    const bgG = this.add.graphics().setDepth(DEPTH);
    bgG.fillStyle(0x0d2818, 1);
    bgG.fillRoundedRect(cx, cy, CARD_W, CARD_H, 10);
    bgG.lineStyle(1.5, 0x2d6a4f, 1);
    bgG.strokeRoundedRect(cx, cy, CARD_W, CARD_H, 10);
    objs.push(bgG);

    // Cabeçalho
    objs.push(this.add.text(cx + 20, cy + 18, '⛏️  Garimpo Ilegal', {
      fontSize: '16px', color: '#d8f3dc',
      fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
    }).setDepth(DEPTH));

    objs.push(this.add.text(cx + 20, cy + 44, 'Garimpeiro identificado:', {
      fontSize: '11px', color: '#74c69d', fontFamily: 'Inter, sans-serif',
    }).setDepth(DEPTH));

    objs.push(this.add.text(cx + 20, cy + 62, perfil.nome, {
      fontSize: '18px', color: '#52b788',
      fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
    }).setDepth(DEPTH));

    objs.push(this.add.text(cx + 20, cy + 90, perfil.descricao, {
      fontSize: '12px', color: '#d8f3dc', fontFamily: 'Inter, sans-serif',
      wordWrap: { width: CARD_W - 40 },
    }).setDepth(DEPTH));

    // Separador
    const divG = this.add.graphics().setDepth(DEPTH);
    divG.lineStyle(1, 0x2d6a4f, 0.6);
    divG.lineBetween(cx + 20, cy + 128, cx + CARD_W - 20, cy + 128);
    objs.push(divG);

    // Chance
    objs.push(this.add.text(cx + 20, cy + 142, `Chance de negociação bem-sucedida: ${pct}%`, {
      fontSize: '13px', color: '#74c69d', fontFamily: 'Inter, sans-serif',
    }).setDepth(DEPTH));

    if (hex.bonusNegociacao > 0) {
      objs.push(this.add.text(cx + 20, cy + 162,
        `(+${Math.round(hex.bonusNegociacao * 100)}% acumulado de tentativas anteriores)`, {
        fontSize: '11px', color: '#52b788', fontFamily: 'Inter, sans-serif',
      }).setDepth(DEPTH));
    }

    // Botões
    const btnY    = cy + CARD_H - 52;
    const BTN_W   = 160, BTN_H = 38;

    // Negociar
    const btnNegG = this.add.graphics().setDepth(DEPTH);
    const desenhaNeG = (h) => {
      btnNegG.clear();
      btnNegG.fillStyle(h ? 0x2d6a4f : 0x1b4332, 1);
      btnNegG.fillRoundedRect(cx + 20, btnY, BTN_W, BTN_H, 6);
    };
    desenhaNeG(false);
    objs.push(btnNegG);

    objs.push(this.add.text(cx + 20 + BTN_W / 2, btnY + BTN_H / 2, 'Tentar negociar', {
      fontSize: '13px', color: '#d8f3dc',
      fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(DEPTH));

    const zoneNeg = this.add.zone(cx + 20 + BTN_W / 2, btnY + BTN_H / 2, BTN_W, BTN_H)
      .setDepth(DEPTH).setInteractive({ useHandCursor: true });
    zoneNeg.on('pointerover', () => desenhaNeG(true));
    zoneNeg.on('pointerout',  () => desenhaNeG(false));
    zoneNeg.on('pointerdown', () => {
      this._fecharCard();
      this._executarNegociacao(idx);
    });
    objs.push(zoneNeg);

    // Fechar
    const btnFchG = this.add.graphics().setDepth(DEPTH);
    const desenhFch = (h) => {
      btnFchG.clear();
      btnFchG.fillStyle(h ? 0x2d1a0a : 0x1b0e06, 1);
      btnFchG.fillRoundedRect(cx + CARD_W - 20 - BTN_W, btnY, BTN_W, BTN_H, 6);
    };
    desenhFch(false);
    objs.push(btnFchG);

    objs.push(this.add.text(cx + CARD_W - 20 - BTN_W / 2, btnY + BTN_H / 2, 'Fechar', {
      fontSize: '13px', color: '#74c69d', fontFamily: 'Inter, sans-serif',
    }).setOrigin(0.5).setDepth(DEPTH));

    const zoneFch = this.add.zone(cx + CARD_W - 20 - BTN_W / 2, btnY + BTN_H / 2, BTN_W, BTN_H)
      .setDepth(DEPTH).setInteractive({ useHandCursor: true });
    zoneFch.on('pointerover', () => desenhFch(true));
    zoneFch.on('pointerout',  () => desenhFch(false));
    zoneFch.on('pointerdown', () => {
      this._fecharCard();
      this.selectedIdx = -1;
      this._desenharSelecao();
    });
    objs.push(zoneFch);

    this.cardObjs = objs;
  }

  _fecharCard() {
    this.cardObjs.forEach(o => o.destroy());
    this.cardObjs = [];
  }

  _calcularChance(hex) {
    const base  = 0.45;
    const hexIdx = this.hexagonos.indexOf(hex);
    const tecnico = hexIdx >= 0 ? this._membroNoHex(hexIdx, 'tecnico') : null;
    const bonusTecnico = tecnico ? 0.15 : 0;
    const bonus = (hex.perfil?.bonus ?? 0) + hex.bonusNegociacao + bonusTecnico;
    return Math.min(0.90, Math.max(0.05, base + bonus));
  }

  // -------------------------------------------------------------------------
  // Garimpo — rolar dados e despachar resultado
  // -------------------------------------------------------------------------
  _executarNegociacao(idx) {
    const hex    = this.hexagonos[idx];
    const chance = this._calcularChance(hex);

    if (Math.random() < chance) {
      // Sucesso
      hex.bonusNegociacao = 0;
      estadoJogo.negociacoesBemSucedidas++;
      this._mudarEstadoHex(idx, 'garimpo_neutralizado');
      this._mostrarToast('✅ Negociação bem-sucedida! Garimpeiros saíram da área.');
      this.selectedIdx = -1;
      this._desenharSelecao();
    } else {
      // Falha
      this._mostrarFalhaOpcoes(idx);
    }
  }

  // -------------------------------------------------------------------------
  // Garimpo — opções após falha na negociação
  // -------------------------------------------------------------------------
  _mostrarFalhaOpcoes(idx) {
    this._fecharCard();

    const hex = this.hexagonos[idx];
    // Custo escala com número de garimpos ativos (+R$15k por hex adicional)
    const nGarimpos = this.hexagonos.filter(h => h.tipo === 'garimpo').length;
    const custoExtra = Math.max(0, nGarimpos - 1) * 15000;
    const custoAguardar = 5000 + custoExtra;
    const custoIbama    = 20000 + custoExtra;

    const { width, height } = this.scale;
    const CARD_W = 380, CARD_H = 240;
    const cx = width  / 2 - CARD_W / 2;
    const cy = height / 2 - CARD_H / 2;
    const DEPTH = 20;
    const objs  = [];

    const overlay = this.add.graphics().setDepth(DEPTH - 1);
    overlay.fillStyle(0x000000, 0.55);
    overlay.fillRect(0, 0, width, height);
    objs.push(overlay);

    const bgG = this.add.graphics().setDepth(DEPTH);
    bgG.fillStyle(0x1a0a0a, 1);
    bgG.fillRoundedRect(cx, cy, CARD_W, CARD_H, 10);
    bgG.lineStyle(1.5, 0xc1440e, 1);
    bgG.strokeRoundedRect(cx, cy, CARD_W, CARD_H, 10);
    objs.push(bgG);

    objs.push(this.add.text(cx + 20, cy + 18, '❌ Negociação falhou', {
      fontSize: '16px', color: '#e76f51',
      fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
    }).setDepth(DEPTH));

    const avisoEscala = nGarimpos > 1
      ? `⚠️ ${nGarimpos} garimpos ativos — +R$ ${custoExtra.toLocaleString('pt-BR')} nos custos`
      : 'Os garimpeiros recusaram o diálogo. O que fazer?';
    objs.push(this.add.text(cx + 20, cy + 46, avisoEscala, {
      fontSize: '12px', color: nGarimpos > 1 ? '#C8A951' : '#d8f3dc',
      fontFamily: 'Inter, sans-serif', wordWrap: { width: CARD_W - 40 },
    }).setDepth(DEPTH));

    const BTN_W = CARD_W - 40, BTN_H = 48;

    // Opção 1: Aguardar
    const btn1Y = cy + 92;
    const btn1G = this.add.graphics().setDepth(DEPTH);
    const desBt1 = (h) => {
      btn1G.clear();
      const semSaldo = estadoJogo.dinheiro < 5000;
      btn1G.fillStyle(semSaldo ? 0x132b1f : (h ? 0x2d6a4f : 0x1b4332), 1);
      btn1G.fillRoundedRect(cx + 20, btn1Y, BTN_W, BTN_H, 6);
    };
    desBt1(false);
    objs.push(btn1G);

    objs.push(this.add.text(cx + 30, btn1Y + 15, 'Aguardar e tentar novamente', {
      fontSize: '13px', color: '#d8f3dc',
      fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
    }).setDepth(DEPTH));
    objs.push(this.add.text(cx + 30, btn1Y + 33,
      `R$ ${custoAguardar.toLocaleString('pt-BR')} — +10% na próxima tentativa`, {
      fontSize: '11px', color: '#52b788', fontFamily: 'Inter, sans-serif',
    }).setDepth(DEPTH));

    if (estadoJogo.dinheiro >= custoAguardar) {
      const z1 = this.add.zone(cx + 20 + BTN_W / 2, btn1Y + BTN_H / 2, BTN_W, BTN_H)
        .setDepth(DEPTH).setInteractive({ useHandCursor: true });
      z1.on('pointerover', () => desBt1(true));
      z1.on('pointerout',  () => desBt1(false));
      z1.on('pointerdown', () => {
        estadoJogo.dinheiro -= custoAguardar;
        hex.bonusNegociacao = Math.min(0.30, hex.bonusNegociacao + 0.10);
        this.atualizarPainel();
        this._fecharCard();
        this._mostrarToast('Equipe aguardando... bonus acumulado para próxima tentativa.');
        this.selectedIdx = -1;
        this._desenharSelecao();
      });
      objs.push(z1);
    }

    // Opção 2: Denunciar ao Ibama
    const btn2Y = btn1Y + BTN_H + 10;
    const btn2G = this.add.graphics().setDepth(DEPTH);
    const desBt2 = (h) => {
      btn2G.clear();
      btn2G.fillStyle(h ? 0x4a1a06 : 0x2d1008, 1);
      btn2G.fillRoundedRect(cx + 20, btn2Y, BTN_W, BTN_H, 6);
    };
    desBt2(false);
    objs.push(btn2G);

    objs.push(this.add.text(cx + 30, btn2Y + 15, '🚨 Denunciar ao Ibama', {
      fontSize: '13px', color: '#e76f51',
      fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
    }).setDepth(DEPTH));
    objs.push(this.add.text(cx + 30, btn2Y + 33, 'Gratuito — resultado incerto (45s)', {
      fontSize: '11px', color: '#74c69d', fontFamily: 'Inter, sans-serif',
    }).setDepth(DEPTH));

    const z2 = this.add.zone(cx + 20 + BTN_W / 2, btn2Y + BTN_H / 2, BTN_W, BTN_H)
      .setDepth(DEPTH).setInteractive({ useHandCursor: true });
    z2.on('pointerover', () => desBt2(true));
    z2.on('pointerout',  () => desBt2(false));
    z2.on('pointerdown', () => {
      this._fecharCard();
      this._fluxoIbama(idx);
    });
    objs.push(z2);

    this.cardObjs = objs;
  }

  // -------------------------------------------------------------------------
  // Garimpo — fluxo Ibama (timer + resultado aleatório)
  // -------------------------------------------------------------------------
  _fluxoIbama(idx) {
    const hex = this.hexagonos[idx];
    hex.bloqueado = true;

    const dur = DEV_MODE ? 8 : 45;
    this.selectedIdx = -1;
    this._desenharSelecao();

    this._mostrarToast(`🚨 Denúncia registrada. Aguardando resposta do Ibama... (${dur}s)`);
    this._piscarHex(idx);

    this._iniciarTimer(idx, dur, () => {
      const r = Math.random();
      if (r < 0.40) {
        // Sucesso: garimpeiros removidos
        hex.bonusNegociacao = 0;
        this._mudarEstadoHex(idx, 'garimpo_neutralizado');
        this._mostrarToast('✅ Ibama atuou! Garimpeiros removidos da área.');
      } else if (r < 0.75) {
        // Represália: -R$20k, sem mudança
        estadoJogo.dinheiro -= 20000;
        this.atualizarPainel();
        this._mostrarCartaoFalha(idx,
          'Represália dos garimpeiros! Equipamentos danificados. -R$ 20.000');
      } else {
        // Sem ação
        this._mostrarCartaoFalha(idx,
          'Ibama não teve recursos para atuar. Área continua com garimpo ativo.');
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
            this._cardFitorremediacao(idx);
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
  // Garimpo — card educativo da fitorremediação
  // -------------------------------------------------------------------------
  _cardFitorremediacao(idx) {
    this._fecharCard();

    const { width, height } = this.scale;
    const CARD_W = 420, CARD_H = 300;
    const cx = width  / 2 - CARD_W / 2;
    const cy = height / 2 - CARD_H / 2;
    const DEPTH = 20;
    const objs  = [];

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

    objs.push(this.add.text(cx + 20, cy + 18, '🌱  Fitorremediação Concluída', {
      fontSize: '16px', color: '#52b788',
      fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
    }).setDepth(DEPTH));

    objs.push(this.add.text(cx + 20, cy + 50,
      'A fitorremediação usa plantas hiperacumuladoras para extrair metais pesados do solo — como mercúrio e arsênio — deixados pelo garimpo. Este processo biorremediou o terreno e o preparou para receber vegetação nativa.',
      {
        fontSize: '12px', color: '#d8f3dc', fontFamily: 'Inter, sans-serif',
        wordWrap: { width: CARD_W - 40 }, lineSpacing: 4,
      }
    ).setDepth(DEPTH));

    const divG = this.add.graphics().setDepth(DEPTH);
    divG.lineStyle(1, 0x2d6a4f, 0.6);
    divG.lineBetween(cx + 20, cy + 162, cx + CARD_W - 20, cy + 162);
    objs.push(divG);

    objs.push(this.add.text(cx + 20, cy + 176,
      '🌿 Impacto: Espécies como a Brassica napus e a Helianthus annuus absorvem contaminantes e estabilizam o pH, tornando o solo fértil novamente.',
      {
        fontSize: '12px', color: '#74c69d', fontFamily: 'Inter, sans-serif',
        wordWrap: { width: CARD_W - 40 }, lineSpacing: 4,
      }
    ).setDepth(DEPTH));

    // Botão OK
    const btnY  = cy + CARD_H - 54;
    const BTN_W = 200, BTN_H = 38;
    const btnG  = this.add.graphics().setDepth(DEPTH);
    const desBt = (h) => {
      btnG.clear();
      btnG.fillStyle(h ? 0x2d6a4f : 0x1b4332, 1);
      btnG.fillRoundedRect(cx + CARD_W / 2 - BTN_W / 2, btnY, BTN_W, BTN_H, 6);
    };
    desBt(false);
    objs.push(btnG);

    objs.push(this.add.text(cx + CARD_W / 2, btnY + BTN_H / 2,
      '✅ Avançar para plantio', {
      fontSize: '13px', color: '#d8f3dc',
      fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(DEPTH));

    const zOk = this.add.zone(cx + CARD_W / 2, btnY + BTN_H / 2, BTN_W, BTN_H)
      .setDepth(DEPTH).setInteractive({ useHandCursor: true });
    zOk.on('pointerover', () => desBt(true));
    zOk.on('pointerout',  () => desBt(false));
    zOk.on('pointerdown', () => {
      this._fecharCard();
      this._mudarEstadoHex(idx, 'solo_preparado');
      this._mostrarToast('Solo preparado! Agora você pode plantar vegetação nativa.');
      this.selectedIdx = -1;
      this._desenharSelecao();
    });
    objs.push(zOk);

    this.cardObjs = objs;
  }

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
            this._cardErroPlantioNascente(idx);
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
              this._menuNascenteEtapa2(idx);
            }, 0x4A90D9);
          },
        },
      ],
    });
  }

  // -------------------------------------------------------------------------
  // Nascente — card educativo de erro no plantio
  // -------------------------------------------------------------------------
  _cardErroPlantioNascente(idx) {
    this._fecharCard();

    const { width, height } = this.scale;
    const CARD_W = 400, CARD_H = 220;
    const cx = width  / 2 - CARD_W / 2;
    const cy = height / 2 - CARD_H / 2;
    const DEPTH = 20;
    const objs  = [];

    const overlay = this.add.graphics().setDepth(DEPTH - 1);
    overlay.fillStyle(0x000000, 0.55);
    overlay.fillRect(0, 0, width, height);
    objs.push(overlay);

    const bgG = this.add.graphics().setDepth(DEPTH);
    bgG.fillStyle(0x1b2a1b, 1);
    bgG.fillRoundedRect(cx, cy, CARD_W, CARD_H, 10);
    bgG.lineStyle(1.5, 0xe76f51, 1);
    bgG.strokeRoundedRect(cx, cy, CARD_W, CARD_H, 10);
    objs.push(bgG);

    objs.push(this.add.text(cx + 20, cy + 18, 'Ops! Você aprendeu algo importante', {
      fontSize: '15px', color: '#e76f51',
      fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
    }).setDepth(DEPTH));

    objs.push(this.add.text(cx + 20, cy + 52,
      'Você tentou plantar antes de estabilizar o solo. A erosão destruiu as mudas. É necessário fazer a bioengenharia das margens primeiro para conter o assoreamento.',
      {
        fontSize: '13px', color: '#d8f3dc', fontFamily: 'Inter, sans-serif',
        wordWrap: { width: CARD_W - 40 }, lineSpacing: 4,
      }
    ).setDepth(DEPTH));

    const divG = this.add.graphics().setDepth(DEPTH);
    divG.lineStyle(1, 0x2d6a4f, 0.5);
    divG.lineBetween(cx + 20, cy + 138, cx + CARD_W - 20, cy + 138);
    objs.push(divG);

    objs.push(this.add.text(cx + 20, cy + 150,
      '💡 Dica: -R$ 10.000 perdidos. Recomece com a opção correta.', {
      fontSize: '11px', color: '#74c69d', fontFamily: 'Inter, sans-serif',
    }).setDepth(DEPTH));

    // Botão Entendido
    const btnY  = cy + CARD_H - 52;
    const BTN_W = 160, BTN_H = 36;
    const btnG  = this.add.graphics().setDepth(DEPTH);
    const desBt = (h) => {
      btnG.clear();
      btnG.fillStyle(h ? 0x2d6a4f : 0x1b4332, 1);
      btnG.fillRoundedRect(cx + CARD_W / 2 - BTN_W / 2, btnY, BTN_W, BTN_H, 6);
    };
    desBt(false);
    objs.push(btnG);

    objs.push(this.add.text(cx + CARD_W / 2, btnY + BTN_H / 2, 'Entendido', {
      fontSize: '13px', color: '#d8f3dc',
      fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(DEPTH));

    const zOk = this.add.zone(cx + CARD_W / 2, btnY + BTN_H / 2, BTN_W, BTN_H)
      .setDepth(DEPTH).setInteractive({ useHandCursor: true });
    zOk.on('pointerover', () => desBt(true));
    zOk.on('pointerout',  () => desBt(false));
    zOk.on('pointerdown', () => {
      this._fecharCard();
      this._menuNascenteDegradada(idx);
    });
    objs.push(zOk);

    this.cardObjs = objs;
  }

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
            this._cardNascenteRecuperada(idx);
          }, 0x4A90D9);
        },
      }],
    });
  }

  // -------------------------------------------------------------------------
  // Nascente — card comemorativo
  // -------------------------------------------------------------------------
  _cardNascenteRecuperada(idx) {
    this._fecharCard();

    const { width, height } = this.scale;
    const CARD_W = 400, CARD_H = 220;
    const cx = width  / 2 - CARD_W / 2;
    const cy = height / 2 - CARD_H / 2;
    const DEPTH = 20;
    const objs  = [];

    const overlay = this.add.graphics().setDepth(DEPTH - 1);
    overlay.fillStyle(0x000000, 0.55);
    overlay.fillRect(0, 0, width, height);
    objs.push(overlay);

    const bgG = this.add.graphics().setDepth(DEPTH);
    bgG.fillStyle(0x0a1a2a, 1);
    bgG.fillRoundedRect(cx, cy, CARD_W, CARD_H, 10);
    bgG.lineStyle(1.5, 0x4A90D9, 1);
    bgG.strokeRoundedRect(cx, cy, CARD_W, CARD_H, 10);
    objs.push(bgG);

    objs.push(this.add.text(cx + 20, cy + 18, '💧 Nascente recuperada!', {
      fontSize: '17px', color: '#4A90D9',
      fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
    }).setDepth(DEPTH));

    objs.push(this.add.text(cx + 20, cy + 56,
      'Esta nascente agora produz 500L de água por ciclo. A água é essencial para o viveiro de mudas e para combater incêndios.',
      {
        fontSize: '13px', color: '#d8f3dc', fontFamily: 'Inter, sans-serif',
        wordWrap: { width: CARD_W - 40 }, lineSpacing: 4,
      }
    ).setDepth(DEPTH));

    const divG = this.add.graphics().setDepth(DEPTH);
    divG.lineStyle(1, 0x1a3a5a, 1);
    divG.lineBetween(cx + 20, cy + 136, cx + CARD_W - 20, cy + 136);
    objs.push(divG);

    objs.push(this.add.text(cx + 20, cy + 150,
      '💡 Instale uma bomba d\'água ou microcentral para ampliar os benefícios.', {
      fontSize: '11px', color: '#74c69d', fontFamily: 'Inter, sans-serif',
      wordWrap: { width: CARD_W - 40 },
    }).setDepth(DEPTH));

    const btnY  = cy + CARD_H - 52;
    const BTN_W = 200, BTN_H = 36;
    const btnG  = this.add.graphics().setDepth(DEPTH);
    const desBt = (h) => {
      btnG.clear();
      btnG.fillStyle(h ? 0x1a4a7a : 0x0e2d4a, 1);
      btnG.fillRoundedRect(cx + CARD_W / 2 - BTN_W / 2, btnY, BTN_W, BTN_H, 6);
    };
    desBt(false);
    objs.push(btnG);

    objs.push(this.add.text(cx + CARD_W / 2, btnY + BTN_H / 2, '✅ Excelente!', {
      fontSize: '13px', color: '#d8f3dc',
      fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(DEPTH));

    const zOk = this.add.zone(cx + CARD_W / 2, btnY + BTN_H / 2, BTN_W, BTN_H)
      .setDepth(DEPTH).setInteractive({ useHandCursor: true });
    zOk.on('pointerover', () => desBt(true));
    zOk.on('pointerout',  () => desBt(false));
    zOk.on('pointerdown', () => {
      this._fecharCard();
      this.selectedIdx = -1;
      this._desenharSelecao();
    });
    objs.push(zOk);

    this.cardObjs = objs;
  }

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
          this._mostrarToast('💪 Bomba instalada! Produção de água dobrou para 1.000L/ciclo.');
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
          this._mostrarToast('⚡ Microcentral ativa! +200kWh/ciclo de energia limpa.');
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
    const temPSA       = estadoJogo.psaAtivo;
    const temSAFViz    = this._vizinhosHex(idx).some(vi => this.hexagonos[vi].tipo === 'saf');
    const temTecnico   = estadoJogo.equipe.some(m => m.tipo === 'tecnico_negociacao');
    let chance = 0.40 + (pf ? pf.bonusContato : 0) + hex.bonusContatoPec;
    if (temPSA)    chance += 0.20;
    if (temSAFViz) chance += 0.15;
    if (temTecnico) chance += 0.10;
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
    else                                     this._menuPecuariaPropostas(idx);
  }

  _menuPecuariaVermelho(idx) {
    const hex     = this.hexagonos[idx];
    const chance  = this._calcularChanceContatoPec(idx);
    const pct     = Math.round(chance * 100);
    const bloq    = hex.contatoBloqueado;
    const semDin  = estadoJogo.dinheiro < 0; // gratuito, nunca bloqueado por saldo

    this._abrirMenu(idx, {
      titulo:      '🐄 Pecuária / Soja',
      descricao:   `Propriedade sem contato. Chance de abertura: ${pct}%`,
      tituloColor: '#C8A951',
      acoes: [{
        label:        bloq ? '⏳ Aguardar cooldown...' : '📞 Iniciar contato',
        custoStr:     'Gratuito',
        desabilitado: bloq,
        aviso:        bloq ? 'Fazendeiro não atendeu. Aguarde antes de tentar de novo.' : null,
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

    const { width, height } = this.scale;
    const CARD_W = 400, CARD_H = 260;
    const cx = width / 2 - CARD_W / 2, cy = height / 2 - CARD_H / 2;
    const DEPTH = 20, objs = [];

    const overlay = this.add.graphics().setDepth(DEPTH - 1);
    overlay.fillStyle(0x000000, 0.55);
    overlay.fillRect(0, 0, width, height);
    objs.push(overlay);

    const bgG = this.add.graphics().setDepth(DEPTH);
    bgG.fillStyle(0x1a1200, 1);
    bgG.fillRoundedRect(cx, cy, CARD_W, CARD_H, 10);
    bgG.lineStyle(1.5, 0xC8A951, 1);
    bgG.strokeRoundedRect(cx, cy, CARD_W, CARD_H, 10);
    objs.push(bgG);

    // Emoji grande
    objs.push(this.add.text(cx + 30, cy + CARD_H / 2, '🧑‍🌾', {
      fontSize: '52px', fontFamily: 'sans-serif',
    }).setOrigin(0.5).setDepth(DEPTH));

    objs.push(this.add.text(cx + 70, cy + 20, `${pf.nomePropio}, ${pf.idade} anos`, {
      fontSize: '15px', color: '#C8A951',
      fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
    }).setDepth(DEPTH));

    objs.push(this.add.text(cx + 70, cy + 42, pf.nome, {
      fontSize: '12px', color: '#d8f3dc', fontFamily: 'Inter, sans-serif',
    }).setDepth(DEPTH));

    const divG = this.add.graphics().setDepth(DEPTH);
    divG.lineStyle(1, 0x3a2a00, 1);
    divG.lineBetween(cx + 70, cy + 62, cx + CARD_W - 20, cy + 62);
    objs.push(divG);

    objs.push(this.add.text(cx + 70, cy + 74, `"${pf.frase}"`, {
      fontSize: '12px', color: '#d8f3dc', fontFamily: 'Inter, sans-serif',
      fontStyle: 'italic', wordWrap: { width: CARD_W - 90 }, lineSpacing: 3,
    }).setDepth(DEPTH));

    objs.push(this.add.text(cx + 70, cy + 156,
      'Contato estabelecido! Agora você pode fazer propostas.', {
      fontSize: '11px', color: '#74c69d', fontFamily: 'Inter, sans-serif',
      wordWrap: { width: CARD_W - 90 },
    }).setDepth(DEPTH));

    const btnY = cy + CARD_H - 54, BTN_W = 200, BTN_H = 36;
    const btnG = this.add.graphics().setDepth(DEPTH);
    const desBt = h => { btnG.clear(); btnG.fillStyle(h ? 0x3a2a00 : 0x2a1e00, 1);
      btnG.fillRoundedRect(cx + CARD_W / 2 - BTN_W / 2, btnY, BTN_W, BTN_H, 6); };
    desBt(false); objs.push(btnG);

    objs.push(this.add.text(cx + CARD_W / 2, btnY + BTN_H / 2, 'Ver propostas', {
      fontSize: '13px', color: '#C8A951',
      fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(DEPTH));

    const z = this.add.zone(cx + CARD_W / 2, btnY + BTN_H / 2, BTN_W, BTN_H)
      .setDepth(DEPTH).setInteractive({ useHandCursor: true });
    z.on('pointerover', () => desBt(true)); z.on('pointerout', () => desBt(false));
    z.on('pointerdown', () => { this._fecharCard(); this._menuPecuariaPropostas(idx); });
    objs.push(z);
    this.cardObjs = objs;
  }

  _menuPecuariaPropostas(idx) {
    const hex      = this.hexagonos[idx];
    const pf       = hex.perfilFazendeiro;
    const temPSA   = estadoJogo.psaAtivo;
    const verde    = hex.semaforoPecuaria === 'verde';
    const sem80    = estadoJogo.dinheiro < 80000;
    const sem20    = estadoJogo.dinheiro < 20000;
    const sem60    = estadoJogo.dinheiro < 60000;
    const conBloq  = hex.contatoBloqueado;

    // Calcula chances das propostas
    let chanceSAF = 0.55 + (pf?.id === 'endividado' ? pf.bonusSAF : 0);
    if (temPSA && pf?.id === 'oportunista') chanceSAF += pf.bonusPSA;
    chanceSAF = Math.min(0.90, chanceSAF);
    const pctSAF  = Math.round(chanceSAF * 100);
    const pctInt  = 70;
    const pctMan  = 45;
    const pctRef  = 65;

    const _proposta = (tipo, custo, dur) => {
      estadoJogo.negociacoesBemSucedidas++;
      estadoJogo.dinheiro -= custo;
      this.atualizarPainel();
      this._fecharMenu();
      this.selectedIdx = -1; this._desenharSelecao();

      if (tipo === 'saf') {
        this._iniciarTimer(idx, dur, () => {
          hex.receitaSAF       = 10000;
          hex.parceiriaPec     = 'saf';
          hex.semaforoPecuaria = 'verde';
          this._mudarEstadoHex(idx, 'saf');
          this._mostrarToast('🌾 SAF estabelecido! +R$ 10.000/ciclo.');
        }, 0x5C7A2E);
      } else if (tipo === 'intensiva') {
        this._iniciarTimer(idx, dur, () => {
          hex.parceiriaPec     = 'intensiva';
          hex.semaforoPecuaria = 'verde';
          this._redesenharSemaforos();
          this._adicionarIconeHex(idx, '💪', 0);
          this._mostrarToast('🐄 Pecuária intensiva adotada. Relação melhorada.');
        }, 0xC8A951);
      } else if (tipo === 'manejo') {
        this._iniciarTimer(idx, dur, () => {
          hex.receitaSAF       = 5000;
          hex.parceiriaPec     = 'manejo';
          hex.semaforoPecuaria = 'verde';
          this._redesenharSemaforos();
          this._adicionarIconeHex(idx, '🪵', 0);
          this._mostrarToast('🪵 Manejo florestal iniciado. +R$ 5.000/ciclo.');
        }, 0x8B6914);
      } else if (tipo === 'reflorestamento') {
        this._iniciarTimer(idx, dur, () => {
          this._mudarEstadoHex(idx, 'floresta_pioneira');
          this._mostrarToast('🌳 Reflorestamento concluído! Área restaurada com espécies nativas.');
        }, 0x52b788);
      }
    };

    const acoes = [
      {
        label:        `🌾 Sugerir SAF (${pctSAF}% aceite)`,
        custoStr:     `R$ 80.000 — gera R$ 10.000/ciclo`,
        desabilitado: sem80 || conBloq,
        aviso:        sem80 ? 'Saldo insuficiente' : conBloq ? 'Aguarde antes de nova proposta' : null,
        onPress: () => {
          if (Math.random() < chanceSAF / 100 * 100 / 100) {
            // Compat: use float
          }
          const aceite = Math.random() < chanceSAF;
          if (aceite) _proposta('saf', 80000, DEV_MODE ? 10 : 60);
          else this._recusaFazendeiro(idx);
        },
      },
      {
        label:        `🐄 Sugerir pecuária intensiva (${pctInt}% aceite)`,
        custoStr:     `R$ 20.000`,
        desabilitado: sem20 || conBloq,
        aviso:        sem20 ? 'Saldo insuficiente' : conBloq ? 'Aguarde antes de nova proposta' : null,
        onPress: () => {
          if (Math.random() < 0.70) _proposta('intensiva', 20000, DEV_MODE ? 5 : 30);
          else this._recusaFazendeiro(idx);
        },
      },
      {
        label:        `🪵 Plantio para manejo florestal (${pctMan}% aceite)`,
        custoStr:     `R$ 60.000 — gera R$ 5.000/ciclo`,
        desabilitado: sem60 || conBloq,
        aviso:        sem60 ? 'Saldo insuficiente' : conBloq ? 'Aguarde antes de nova proposta' : null,
        onPress: () => {
          if (Math.random() < 0.45) _proposta('manejo', 60000, DEV_MODE ? 8 : 45);
          else this._recusaFazendeiro(idx);
        },
      },
    ];

    if (verde && temPSA) {
      acoes.push({
        label:        `🌳 Reflorestamento com nativas (${pctRef}% aceite)`,
        custoStr:     `Objetivo final — sem custo direto`,
        desabilitado: conBloq,
        aviso:        conBloq ? 'Aguarde antes de nova proposta' : null,
        onPress: () => {
          if (Math.random() < 0.65) _proposta('reflorestamento', 0, DEV_MODE ? 10 : 75);
          else this._recusaFazendeiro(idx);
        },
      });
    }

    this._abrirMenu(idx, {
      titulo:      `🐄 ${pf?.nomePropio ?? 'Fazendeiro'} — Propostas`,
      descricao:   pf?.nome ?? 'Pecuária / Soja',
      tituloColor: '#C8A951',
      acoes,
    });
  }

  _recusaFazendeiro(idx) {
    const hex = this.hexagonos[idx];
    hex.contatoBloqueado = true;
    const dur = DEV_MODE ? 8000 : 45000;
    this.time.delayedCall(dur, () => { hex.contatoBloqueado = false; });
    this._mostrarToast('O fazendeiro não aceitou a proposta. Tente novamente em breve.');
    this._iniciarInvasaoPasto(idx);
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
    const { width } = this.scale;
    const H = 36;
    const bgG = this.add.graphics().setDepth(25);
    bgG.fillStyle(0x3a2a00, 1);
    bgG.fillRect(0, 70, width, H);
    const txt = this.add.text(width / 2, 70 + H / 2, msg, {
      fontSize: '13px', color: '#C8A951',
      fontFamily: 'Inter, sans-serif',
    }).setOrigin(0.5).setDepth(25);
    this.tweens.add({
      targets: [bgG, txt], alpha: 0, delay: 3000, duration: 600,
      onComplete: () => { bgG.destroy(); txt.destroy(); },
    });
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
  // SISTEMA DE EQUIPE
  // =========================================================================

  _criarBaseONG() {
    const { height } = this.scale;
    const bx = 60, by = height - 85;

    const g = this.add.graphics().setDepth(0.5);
    g.fillStyle(0x1b4332, 1);
    g.fillRoundedRect(bx - 48, by - 36, 96, 72, 8);
    g.lineStyle(1.5, 0x52b788, 1);
    g.strokeRoundedRect(bx - 48, by - 36, 96, 72, 8);

    this.add.text(bx, by - 12, '🏠', {
      fontSize: '22px', fontFamily: 'sans-serif',
    }).setOrigin(0.5).setDepth(1);

    this.add.text(bx, by + 18, 'Base da ONG', {
      fontSize: '10px', color: '#74c69d',
      fontFamily: 'Inter, sans-serif',
    }).setOrigin(0.5).setDepth(1);

    const zona = this.add.zone(bx, by, 96, 72).setInteractive({ useHandCursor: true }).setDepth(1);
    zona.on('pointerdown', () => {
      if (this.cardObjs.length > 0) return;
      this._cardContratacao();
    });
    zona.on('pointerover',  () => { g.clear(); g.fillStyle(0x2d5a42, 1); g.fillRoundedRect(bx - 48, by - 36, 96, 72, 8); g.lineStyle(1.5, 0x74c69d, 1); g.strokeRoundedRect(bx - 48, by - 36, 96, 72, 8); });
    zona.on('pointerout',   () => { g.clear(); g.fillStyle(0x1b4332, 1); g.fillRoundedRect(bx - 48, by - 36, 96, 72, 8); g.lineStyle(1.5, 0x52b788, 1); g.strokeRoundedRect(bx - 48, by - 36, 96, 72, 8); });

    this._baseX = bx;
    this._baseY = by;
  }

  _cardContratacao() {
    this._fecharCard();
    const { width, height } = this.scale;
    const CARD_W = 460, CARD_H = 60 + CATALOGO_EQUIPE.length * 80 + 20;
    const cx = width / 2 - CARD_W / 2;
    const cy = height / 2 - CARD_H / 2;
    const DEPTH = 20;
    const objs = [];

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

    objs.push(this.add.text(cx + 20, cy + 18, '👥 Contratar Membro da Equipe', {
      fontSize: '16px', color: '#d8f3dc',
      fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
    }).setDepth(DEPTH + 1));

    CATALOGO_EQUIPE.forEach((cat, i) => {
      const rowY = cy + 52 + i * 80;
      const rowBg = this.add.graphics().setDepth(DEPTH);
      rowBg.fillStyle(0x1b4332, 1);
      rowBg.fillRoundedRect(cx + 12, rowY, CARD_W - 24, 66, 6);
      objs.push(rowBg);

      objs.push(this.add.text(cx + 28, rowY + 10, `${cat.emoji} ${cat.nome}`, {
        fontSize: '14px', color: '#d8f3dc',
        fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
      }).setDepth(DEPTH + 1));

      objs.push(this.add.text(cx + 28, rowY + 32, cat.funcao, {
        fontSize: '11px', color: '#74c69d',
        fontFamily: 'Inter, sans-serif', wordWrap: { width: CARD_W - 150 },
      }).setDepth(DEPTH + 1));

      const custoStr = `R$ ${cat.custo.toLocaleString('pt-BR')}/ciclo`;
      const semSaldo = estadoJogo.dinheiro < cat.custo;
      const btnW = 110, btnH = 28;
      const btnX = cx + CARD_W - btnW - 18;
      const btnY = rowY + 19;

      const btnG = this.add.graphics().setDepth(DEPTH + 1);
      const desenhaBtn = (alpha) => {
        btnG.clear();
        btnG.fillStyle(semSaldo ? 0x3a3a3a : 0x52b788, alpha);
        btnG.fillRoundedRect(btnX, btnY, btnW, btnH, 6);
      };
      desenhaBtn(1);
      objs.push(btnG);

      const btnTxt = this.add.text(btnX + btnW / 2, btnY + btnH / 2,
        semSaldo ? '❌ ' + custoStr : '✅ Contratar', {
        fontSize: '11px', color: semSaldo ? '#888' : '#0d2818',
        fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(DEPTH + 2);
      objs.push(btnTxt);

      if (!semSaldo) {
        const zona = this.add.zone(btnX + btnW / 2, btnY + btnH / 2, btnW, btnH)
          .setInteractive({ useHandCursor: true }).setDepth(DEPTH + 3);
        zona.on('pointerover',  () => desenhaBtn(0.78));
        zona.on('pointerout',   () => desenhaBtn(1));
        zona.on('pointerdown',  () => {
          this._fecharCard();
          this._contratarMembro(cat.tipo);
        });
        objs.push(zona);
      }
    });

    // Botão fechar
    const btnFechX = cx + CARD_W - 40, btnFechY = cy + 12;
    const fechG = this.add.graphics().setDepth(DEPTH + 1);
    fechG.fillStyle(0x3a3a3a, 1); fechG.fillCircle(btnFechX + 12, btnFechY + 12, 12);
    objs.push(fechG);
    const fechTxt = this.add.text(btnFechX + 12, btnFechY + 12, '✕', {
      fontSize: '14px', color: '#d8f3dc', fontFamily: 'Inter, sans-serif',
    }).setOrigin(0.5).setDepth(DEPTH + 2);
    objs.push(fechTxt);
    const fechZona = this.add.zone(btnFechX + 12, btnFechY + 12, 28, 28)
      .setInteractive({ useHandCursor: true }).setDepth(DEPTH + 3);
    fechZona.on('pointerdown', () => this._fecharCard());
    objs.push(fechZona);

    this.cardObjs = objs;
  }

  _contratarMembro(tipo) {
    const cat = CATALOGO_EQUIPE.find(c => c.tipo === tipo);
    if (!cat || estadoJogo.dinheiro < cat.custo) return;

    const id = `membro_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const membro = { id, tipo: cat.tipo, emoji: cat.emoji, nome: cat.nome, custo: cat.custo, hexIdx: null };
    estadoJogo.equipe.push(membro);

    // Cria sprite de emoji flutuando na base
    const txt = this.add.text(this._baseX, this._baseY, cat.emoji, {
      fontSize: '22px', fontFamily: 'sans-serif',
    }).setOrigin(0.5).setDepth(4.3).setInteractive({ draggable: true, useHandCursor: true });

    txt.setData('membroId', id);
    this._membros.set(id, txt);

    // Registra hover tooltip
    txt.on('pointerover', () => {
      if (!txt.getData('dragging')) {
        txt.setAlpha(0.8);
      }
    });
    txt.on('pointerout', () => txt.setAlpha(1));

    // Click sem drag → mini-menu
    txt.on('pointerdown', () => txt.setData('clickX', txt.x));

    this.atualizarPainel();
    this._mostrarTextoFlutuante(this._baseX, this._baseY - 40,
      `+${cat.emoji} ${cat.nome} contratado!`, '#52b788');
  }

  _demitirMembro(id) {
    const idx = estadoJogo.equipe.findIndex(m => m.id === id);
    if (idx < 0) return;
    const membro = estadoJogo.equipe[idx];
    estadoJogo.equipe.splice(idx, 1);

    const txt = this._membros.get(id);
    if (txt) { txt.destroy(); this._membros.delete(id); }

    this.atualizarPainel();
    this._mostrarToast(`${membro.emoji} ${membro.nome} foi dispensado da equipe.`);
  }

  _configurarDragEquipe() {
    this.input.on('drag', (pointer, obj, dragX, dragY) => {
      const id = obj.getData('membroId');
      if (!id) return;
      obj.setData('dragging', true);
      obj.x = dragX;
      obj.y = dragY;
    });

    this.input.on('dragend', (pointer, obj) => {
      const id = obj.getData('membroId');
      if (!id) return;
      obj.setData('dragging', false);

      const membro = estadoJogo.equipe.find(m => m.id === id);
      if (!membro) return;

      // Testa se caiu em cima de um hexágono
      const hexIdx = this.hexagonos.findIndex(h =>
        Phaser.Geom.Polygon.Contains(h.polygon, pointer.x, pointer.y));

      if (hexIdx >= 0) {
        // Remove do hex anterior se havia
        if (membro.hexIdx !== null && membro.hexIdx !== hexIdx) {
          const ant = this.hexagonos[membro.hexIdx];
          // sem nada extra a limpar, posição visual define tudo
        }
        membro.hexIdx = hexIdx;
        const hex = this.hexagonos[hexIdx];
        obj.x = hex.cx;
        obj.y = hex.cy + 18; // levemente abaixo do centro para não sobrepor emoji principal
        this._mostrarTextoFlutuante(hex.cx, hex.cy - 40,
          `${membro.emoji} ${membro.nome} alocado`, '#74c69d');
      } else {
        // Soltou no vazio — volta para a base
        membro.hexIdx = null;
        obj.x = this._baseX + (Math.random() - 0.5) * 30;
        obj.y = this._baseY + (Math.random() - 0.5) * 20;
      }
    });

    // Click simples (sem mover) — mini-menu de ação
    this.input.on('pointerup', (pointer) => {
      const objs = this.input.hitTestPointer(pointer);
      for (const o of objs) {
        const id = o.getData && o.getData('membroId');
        if (!id) continue;
        if (o.getData('dragging')) break;
        // Abrir mini-menu de demissão
        this._miniMenuMembro(id, pointer.x, pointer.y);
        break;
      }
    });
  }

  _miniMenuMembro(id, px, py) {
    if (this.cardObjs.length > 0) return;
    const membro = estadoJogo.equipe.find(m => m.id === id);
    if (!membro) return;
    this._fecharCard();

    const { width, height } = this.scale;
    const CARD_W = 240, CARD_H = 110;
    let cx = px - CARD_W / 2;
    let cy = py - CARD_H - 10;
    cx = Math.max(8, Math.min(cx, width  - CARD_W - 8));
    cy = Math.max(8, Math.min(cy, height - CARD_H - 8));
    const DEPTH = 20;
    const objs = [];

    const bgG = this.add.graphics().setDepth(DEPTH);
    bgG.fillStyle(0x0d2818, 1);
    bgG.fillRoundedRect(cx, cy, CARD_W, CARD_H, 10);
    bgG.lineStyle(1.5, 0x52b788, 1);
    bgG.strokeRoundedRect(cx, cy, CARD_W, CARD_H, 10);
    objs.push(bgG);

    objs.push(this.add.text(cx + 12, cy + 12, `${membro.emoji} ${membro.nome}`, {
      fontSize: '13px', color: '#d8f3dc',
      fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
    }).setDepth(DEPTH + 1));

    objs.push(this.add.text(cx + 12, cy + 34, `Custo: R$ ${membro.custo.toLocaleString('pt-BR')}/ciclo`, {
      fontSize: '11px', color: '#74c69d', fontFamily: 'Inter, sans-serif',
    }).setDepth(DEPTH + 1));

    // Botão Demitir
    const btnW = CARD_W - 24, btnH = 32;
    const btnX = cx + 12, btnY = cy + CARD_H - btnH - 12;
    const btnG = this.add.graphics().setDepth(DEPTH + 1);
    const desenhaBtn = (alpha) => {
      btnG.clear();
      btnG.fillStyle(0x8B2020, alpha);
      btnG.fillRoundedRect(btnX, btnY, btnW, btnH, 6);
    };
    desenhaBtn(1);
    objs.push(btnG);
    objs.push(this.add.text(btnX + btnW / 2, btnY + btnH / 2, '🔥 Demitir', {
      fontSize: '13px', color: '#fff', fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(DEPTH + 2));

    const zona = this.add.zone(btnX + btnW / 2, btnY + btnH / 2, btnW, btnH)
      .setInteractive({ useHandCursor: true }).setDepth(DEPTH + 3);
    zona.on('pointerover',  () => desenhaBtn(0.78));
    zona.on('pointerout',   () => desenhaBtn(1));
    zona.on('pointerdown',  () => { this._fecharCard(); this._demitirMembro(id); });
    objs.push(zona);

    // Fechar ao clicar fora — overlay transparente
    const overlay = this.add.graphics().setDepth(DEPTH - 1);
    overlay.fillStyle(0x000000, 0.01);
    overlay.fillRect(0, 0, width, height);
    overlay.setInteractive();
    overlay.on('pointerdown', () => this._fecharCard());
    objs.push(overlay);

    this.cardObjs = objs;
  }

  _cicloSalarios() {
    const dur = DEV_MODE ? 15000 : 60000;
    this.time.addEvent({
      delay: dur, loop: true,
      callback: () => {
        const equipe = estadoJogo.equipe;
        if (equipe.length === 0) return;
        const totalCusto = equipe.reduce((s, m) => s + m.custo, 0);
        if (estadoJogo.dinheiro >= totalCusto) {
          estadoJogo.dinheiro -= totalCusto;
          this.atualizarPainel();
          this._mostrarTextoFlutuante(
            this._dinheiroHudCx ?? 300, 80,
            `-R$ ${totalCusto.toLocaleString('pt-BR')} (salários)`, '#e76f51'
          );
        } else {
          // Auto-demite o mais caro
          const maisCaroIdx = equipe.reduce((best, m, i) =>
            m.custo > equipe[best].custo ? i : best, 0);
          const maiscaro = equipe[maisCaroIdx];
          this._demitirMembro(maiscaro.id);
          this._mostrarAlerta(
            `💸 Saldo insuficiente! ${maiscaro.emoji} ${maiscaro.nome} foi dispensado.`,
            'critico'
          );
          // Paga o resto se possível
          const restante = equipe.reduce((s, m) => s + m.custo, 0);
          if (estadoJogo.dinheiro >= restante) {
            estadoJogo.dinheiro -= restante;
            this.atualizarPainel();
          }
        }
      },
    });
  }

  // -------------------------------------------------------------------------
  // Equipe — helpers de consulta por hex
  // -------------------------------------------------------------------------
  _membroNoHex(hexIdx, tipo) {
    return estadoJogo.equipe.find(m => m.hexIdx === hexIdx && m.tipo === tipo) ?? null;
  }

  _duracaoComEquipe(hexIdx, durSeg, tipoAcao) {
    let dur = durSeg;
    if (tipoAcao === 'saf' || tipoAcao === 'viveiro' || tipoAcao === 'manejo') {
      if (this._membroNoHex(hexIdx, 'agronomo')) dur = Math.round(dur * 0.75);
    }
    if (tipoAcao === 'queimada') {
      if (this._membroNoHex(hexIdx, 'brigadista')) dur = Math.round(dur * 0.70);
    }
    if (tipoAcao === 'nascente') {
      if (this._membroNoHex(hexIdx, 'hidrologista')) dur = Math.round(dur * 0.70);
    }
    if (tipoAcao === 'sucessao') {
      if (this._membroNoHex(hexIdx, 'ecologista')) dur = Math.round(dur * 0.80);
    }
    return Math.max(1, dur);
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

      const niv = this._brigadistaNivel(idx);
      const baseDur = DEV_MODE
        ? (niv === 'indigena' ? 7 : niv === 'normal' ? 10 : 15)
        : (niv === 'indigena' ? 50 : niv === 'normal' ? 80 : 120);
      const dur = this._duracaoComEquipe(idx, baseDur, 'queimada');

      this._iniciarTimer(idx, dur, () => {
        this._mudarEstadoHex(idx, 'solo');
        this._cardIncendioControlado(idx);
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

  // Retorna 'indigena', 'normal' ou 'none' conforme equipe — prioriza membro no hex
  _brigadistaNivel(hexIdx = null) {
    const eq = estadoJogo.equipe;
    // Primeiro verifica se há brigadista alocado no hex específico
    if (hexIdx !== null) {
      if (eq.some(m => m.hexIdx === hexIdx && m.tipo === 'brigadista')) return 'normal';
    }
    // Fallback: brigadista indígena global (parceria indígena)
    if (eq.some(m => m.tipo === 'brigadista_indigena')) return 'indigena';
    // Fallback: qualquer brigadista na equipe
    if (eq.some(m => m.tipo === 'brigadista'))          return 'normal';
    return 'none';
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
      if (eraMata) this._cardFlorestaDestruida();
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
      this._mostrarCardEducativo('psa', '🌿', 'O que é PSA?',
        'Pagamento por Serviços Ambientais — o governo e empresas pagam proprietários para manter e restaurar florestas. Conservar também é um negócio.');
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
      this._mostrarCardEducativo('corredor', '🦋', 'O que é corredor ecológico?',
        'Faixas de floresta conectada que permitem que animais se movam entre áreas. Sem corredores, a fauna fica isolada e perde diversidade genética.');
    }

    // Crédito de Carbono — primeiro hex de clímax
    if (!obj.carbono && this.hexagonos.some(h => h.tipo === 'floresta_climax')) {
      obj.carbono = true;
      this._cardCreditoCarbono();
    }
  }

  // -------------------------------------------------------------------------
  // Card educativo — Crédito de Carbono
  // -------------------------------------------------------------------------
  _cardCreditoCarbono() {
    this._fecharCard();
    const { width, height } = this.scale;
    const CARD_W = 440, CARD_H = 260;
    const cx = width / 2 - CARD_W / 2, cy = height / 2 - CARD_H / 2;
    const DEPTH = 20, objs = [];

    const overlay = this.add.graphics().setDepth(DEPTH - 1);
    overlay.fillStyle(0x000000, 0.6);
    overlay.fillRect(0, 0, width, height);
    objs.push(overlay);

    const bgG = this.add.graphics().setDepth(DEPTH);
    bgG.fillStyle(0x0d2818, 1);
    bgG.fillRoundedRect(cx, cy, CARD_W, CARD_H, 12);
    bgG.lineStyle(2, 0xC8A951, 1);
    bgG.strokeRoundedRect(cx, cy, CARD_W, CARD_H, 12);
    objs.push(bgG);

    objs.push(this.add.text(cx + CARD_W / 2, cy + 28, '🌍 Crédito de Carbono', {
      fontSize: '18px', color: '#C8A951',
      fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(DEPTH));

    objs.push(this.add.text(cx + 24, cy + 68,
      'Parabéns! Sua floresta clímax já captura carbono de forma mensurável.\n\n' +
      'Cada hectare de floresta clímax sequestra ~10 t CO₂/ano. Com certificação, isso pode ser vendido em mercados voluntários de carbono por R$ 50–300 por tonelada.\n\n' +
      'O Brasil tem potencial de ser o maior exportador de créditos de carbono do mundo.',
      { fontSize: '13px', color: '#d8f3dc', fontFamily: 'Inter, sans-serif',
        wordWrap: { width: CARD_W - 48 }, lineSpacing: 5 }
    ).setDepth(DEPTH));

    const btnY = cy + CARD_H - 52, BTN_W = 200, BTN_H = 36;
    const btnG = this.add.graphics().setDepth(DEPTH);
    const desBt = h => {
      btnG.clear();
      btnG.fillStyle(h ? 0x9a7d2a : 0x6b551a, 1);
      btnG.fillRoundedRect(cx + CARD_W / 2 - BTN_W / 2, btnY, BTN_W, BTN_H, 6);
    };
    desBt(false); objs.push(btnG);

    objs.push(this.add.text(cx + CARD_W / 2, btnY + BTN_H / 2, 'Incrível! Continuar', {
      fontSize: '13px', color: '#ffffff',
      fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(DEPTH));

    const z = this.add.zone(cx + CARD_W / 2, btnY + BTN_H / 2, BTN_W, BTN_H)
      .setDepth(DEPTH + 1).setInteractive({ useHandCursor: true });
    z.on('pointerover', () => desBt(true));
    z.on('pointerout',  () => desBt(false));
    z.on('pointerdown', () => {
      this._fecharCard();
      this._mostrarCardEducativo('carbono', '💨', 'Como funciona o crédito de carbono?',
        'Florestas absorvem CO₂ da atmosfera. Empresas pagam para compensar suas emissões. Sua floresta vira receita.');
    });
    objs.push(z);
    this.cardObjs = objs;
  }

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

  _mostrarCardEducativo(id, icone, titulo, texto) {
    if (estadoJogo.cardsVistos.includes(id)) return;
    const tentar = () => {
      if (this.cardObjs.length > 0) { this.time.delayedCall(3500, tentar); return; }
      estadoJogo.cardsVistos.push(id);
      this._exibirCardEducativo(icone, titulo, texto);
    };
    this.time.delayedCall(900, tentar);
  }

  _exibirCardEducativo(icone, titulo, texto) {
    this._fecharCard();
    const { width, height } = this.scale;
    const CARD_W = 400, CARD_H = 200;
    const cx = width / 2 - CARD_W / 2, cy = height / 2 - CARD_H / 2;
    const DEPTH = 22, objs = [];

    const ov = this.add.graphics().setDepth(DEPTH - 1);
    ov.fillStyle(0x000000, 0.5); ov.fillRect(0, 0, width, height);
    objs.push(ov);

    const bg = this.add.graphics().setDepth(DEPTH);
    bg.fillStyle(0x0d1f0d, 1);
    bg.fillRoundedRect(cx, cy, CARD_W, CARD_H, 10);
    bg.lineStyle(1, 0x52b788, 1);
    bg.strokeRoundedRect(cx, cy, CARD_W, CARD_H, 10);
    objs.push(bg);

    objs.push(this.add.text(cx + CARD_W / 2, cy + 24, icone, { fontSize: '28px' })
      .setOrigin(0.5).setDepth(DEPTH));

    objs.push(this.add.text(cx + CARD_W / 2, cy + 60, titulo, {
      fontSize: '16px', color: '#d8f3dc',
      fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(DEPTH));

    objs.push(this.add.text(cx + 20, cy + 90, texto, {
      fontSize: '13px', color: '#74c69d', fontFamily: 'Inter, sans-serif',
      wordWrap: { width: CARD_W - 40 }, lineSpacing: 4,
    }).setDepth(DEPTH));

    const btnY = cy + CARD_H - 46, BTN_W = 160, BTN_H = 32;
    const btnG = this.add.graphics().setDepth(DEPTH);
    const desBt = h => { btnG.clear(); btnG.fillStyle(h ? 0x2d6a4f : 0x1b4332, 1);
      btnG.fillRoundedRect(cx + CARD_W / 2 - BTN_W / 2, btnY, BTN_W, BTN_H, 6); };
    desBt(false); objs.push(btnG);

    objs.push(this.add.text(cx + CARD_W / 2, btnY + BTN_H / 2, 'Entendido →', {
      fontSize: '12px', color: '#d8f3dc', fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(DEPTH));

    const z = this.add.zone(cx + CARD_W / 2, btnY + BTN_H / 2, BTN_W, BTN_H)
      .setDepth(DEPTH + 1).setInteractive({ useHandCursor: true });
    z.on('pointerover', () => desBt(true)); z.on('pointerout', () => desBt(false));
    z.on('pointerdown', () => this._fecharCard());
    objs.push(z);
    this.cardObjs = objs;
  }

  // =========================================================================
  // SISTEMA DE EVENTOS
  // =========================================================================

  // -------------------------------------------------------------------------
  // Alertas empilhados — canto inferior direito
  // -------------------------------------------------------------------------
  _mostrarAlerta(msg, corBorda = '#52b788', critico = false) {
    if (!this._alertasObjs) this._alertasObjs = [];
    this._alertasObjs = this._alertasObjs.filter(a => a.alive);
    if (this._alertasObjs.length >= 3) return;

    const { width, height } = this.scale;
    const W = 310, H = 52, GAP = 8;
    const ax = width - W - 16;
    const slot = this._alertasObjs.length;
    const ay = height - 16 - (slot + 1) * (H + GAP);
    const DEPTH = 22;
    const cor = parseInt(corBorda.replace('#', ''), 16);

    const bg = this.add.graphics().setDepth(DEPTH);
    bg.fillStyle(0x071810, 0.94);
    bg.fillRoundedRect(ax, ay, W, H, 6);
    bg.lineStyle(1.5, cor, 1);
    bg.strokeRoundedRect(ax, ay, W, H, 6);

    const txt = this.add.text(ax + 10, ay + H / 2, msg, {
      fontSize: '12px', color: '#d8f3dc', fontFamily: 'Inter, sans-serif',
      wordWrap: { width: W - 20 }, lineSpacing: 2,
    }).setOrigin(0, 0.5).setDepth(DEPTH);

    const entry = { alive: true, objs: [bg, txt] };
    this._alertasObjs.push(entry);

    const destruir = () => {
      entry.alive = false;
      if (bg.active) bg.destroy();
      if (txt.active) txt.destroy();
      this._alertasObjs = this._alertasObjs.filter(a => a !== entry);
    };

    if (!critico) {
      this.time.delayedCall(5000, destruir);
    } else {
      if (txt.active) txt.setText(msg + '\n[clique para fechar]');
      const z = this.add.zone(ax + W / 2, ay + H / 2, W, H)
        .setDepth(DEPTH + 1).setInteractive({ useHandCursor: true });
      z.on('pointerdown', () => { destruir(); if (z.active) z.destroy(); });
      entry.objs.push(z);
    }
  }

  // -------------------------------------------------------------------------
  // Banner piscante de aviso no topo
  // -------------------------------------------------------------------------
  _mostrarBannerAviso(msg) {
    const { width } = this.scale;
    const H = 34;
    const bg = this.add.graphics().setDepth(30);
    bg.fillStyle(0xC8A951, 1);
    bg.fillRect(0, 70, width, H);
    const txt = this.add.text(width / 2, 70 + H / 2, msg, {
      fontSize: '13px', color: '#071810',
      fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(31);
    this.tweens.add({
      targets: [bg, txt], alpha: 0.25, duration: 380,
      yoyo: true, repeat: 7,
      onComplete: () => { if (bg.active) bg.destroy(); if (txt.active) txt.destroy(); },
    });
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
      this._mostrarAlerta('🌧️ A seca passou. Produção de água normalizada.', '#4A90D9');
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

    this._mostrarAlerta(
      '🐄 Invasão de pasto iminente! Inicie negociação para evitar.',
      '#C8A951', true
    );

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
      this._mostrarAlerta('🐄 Invasão de pasto! Um hexágono foi convertido em pecuária.', '#C8A951', true);
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
            this._mostrarToast('⚠️ Garimpeiros voltaram a ocupar uma área neutralizada!');
          }
        });
      },
    });
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
  width: 1280,
  height: 720,
  backgroundColor: '#0d2818',
  scene: [TelaInicial, Onboarding1, Onboarding2, Onboarding3, Jogo, TelaVitoria],
};

new Phaser.Game(config);
