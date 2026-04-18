import dadosJogo from './dadosJogo.js';

export const PERFIS_PECUARISTA = [
  { id: 'p1', nome: 'Tradicionalista', emoji: '🤠',
    chanceSAF: 45, chancePecuariaIntensiva: 70, chanceManejo: 55, chanceReflorestamento: 30,
    falas: { vermelho: ['Essa terra é de trabalho, não é jardim de cidade.'],
             amarelo:  ['A sombra das árvores ajuda mesmo no calor?'],
             verde:    ['As vacas estão mais gordas. Faz sentido.'] } },
  { id: 'p2', nome: 'Visionária', emoji: '👩‍🌾',
    chanceSAF: 65, chancePecuariaIntensiva: 40, chanceManejo: 50, chanceReflorestamento: 50,
    falas: { vermelho: ['Dizem que vou morrer de fome plantando floresta.'],
             amarelo:  ['Sistemas que misturam banana e café... funciona?'],
             verde:    ['A nascente voltou a minar água. Eu chorei.'] } },
  { id: 'p3', nome: 'Herdeiro Endividado', emoji: '👨‍💼',
    chanceSAF: 60, chancePecuariaIntensiva: 80, chanceManejo: 45, chanceReflorestamento: 25,
    falas: { vermelho: ['O juro do banco não espera a árvore crescer.'],
             amarelo:  ['SAF dá pra colher rápido? Preciso de resultado.'],
             verde:    ['Esse consórcio de culturas salvou o mês.'] } },
  { id: 'p4', nome: 'Político Local', emoji: '🏛️',
    chanceSAF: 50, chancePecuariaIntensiva: 45, chanceManejo: 60, chanceReflorestamento: 55,
    falas: { vermelho: ['Você sabe com quem está falando?'],
             amarelo:  ['Uma reserva modelo seria ótimo para minha campanha.'],
             verde:    ['Somos referência regional agora!'] } },
  { id: 'p5', nome: 'Cooperativa Técnica', emoji: '📊',
    chanceSAF: 55, chancePecuariaIntensiva: 50, chanceManejo: 60, chanceReflorestamento: 40,
    falas: { vermelho: ['Planilha não aceita boas intenções.'],
             amarelo:  ['Mercado europeu exige rastreabilidade. Atende?'],
             verde:    ['Produtividade +12%, pegada dentro do ESG. Aprovado.'] } },
];

export const PERFIS_GARIMPEIRO = [
  { id: 'g1', nome: 'Novato', emoji: '⛏️', custoParcearia: 600, chanceAceite: 75,
    falas: { vermelho: ['Sei que não devia tar aqui, mas não tem emprego.'],
             amarelo:  ['SAF dá dinheiro mesmo? Quanto eu ganharia?'],
             verde:    ['Melhor do que medo da PF todo dia.'] } },
  { id: 'g2', nome: 'Sem Opção', emoji: '😔', custoParcearia: 900, chanceAceite: 55,
    falas: { vermelho: ['Quem paga minha feira amanhã?'],
             amarelo:  ['Renda fixa... eu penso. As crianças ficam na escola?'],
             verde:    ['Minhas filhas vão poder dizer que a mãe trabalhou direito.'] } },
  { id: 'g3', nome: 'Veterano', emoji: '👴', custoParcearia: 1500, chanceAceite: 35,
    falas: { vermelho: ['Eu tava aqui antes do IBAMA, da ONG, de você nascer.'],
             amarelo:  ['Se for migalha, nem perca meu tempo.'],
             verde:    ['Dinheiro entrando limpo. É diferente, mas é melhor.'] } },
];

export const PERFIS_TI = [
  { id: 'ti_tradicional', nome: 'Liderança Tradicional', emoji: '🪶', chanceParcearia: 40,
    falas: { vermelho: ['Vocês chegam prometendo. Depois somem.'],
             amarelo:  ['Se a floresta do entorno voltar, a nossa se fortalece.'],
             verde:    ['Você entendeu: a floresta é de todos.'] } },
  { id: 'ti_jovem', nome: 'Liderança Jovem', emoji: '🌿', chanceParcearia: 60,
    falas: { vermelho: ['Confiei antes e me decepcionei. Prove que é diferente.'],
             amarelo:  ['Extrativismo medicinal pode financiar nossa escola.'],
             verde:    ['A floresta canta de novo. O boto voltou.'] } },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const SOBRENOMES = ['Silva','Santos','Oliveira','Souza','Lima',
                    'Costa','Ferreira','Alves','Pereira','Rodrigues'];

function nomeAleatorio() {
  return SOBRENOMES[Math.floor(Math.random() * SOBRENOMES.length)];
}

function getPerfil(npc) {
  if (npc.tipo === 'indigena') return PERFIS_TI.find(p => p.id === npc.perfilId) || PERFIS_TI[0];
  const arr = npc.tipo === 'pecuarista' ? PERFIS_PECUARISTA : PERFIS_GARIMPEIRO;
  return arr.find(p => p.id === npc.perfilId) || arr[0];
}

export function temAcaoBeneficaNoEntorno(cellId) {
  const cell = dadosJogo.celulas.find(c => c.id === cellId);
  if (!cell) return false;
  const tipos = ['pioneira', 'secundaria', 'climax', 'rio_recuperado'];
  return dadosJogo.celulas.some(c =>
    Math.abs(c.x - cell.x) + Math.abs(c.y - cell.y) === 1 && tipos.includes(c.type)
  );
}

export function getFala(npcId, estadoFarol) {
  const npc = Object.values(dadosJogo.npcs).find(n => n.id === npcId);
  if (!npc) return '';
  const lista = getPerfil(npc).falas[estadoFarol] || [];
  return lista[Math.floor(Math.random() * lista.length)] || '';
}

export function mudarFarol(cellId, novoEstado) {
  const npc = dadosJogo.npcs[cellId];
  if (!npc) return;
  npc.farol = novoEstado;
  dadosJogo.estadoFarol[cellId] = novoEstado;
  document.dispatchEvent(new CustomEvent('farolAtualizado', { detail: { cellId, estado: novoEstado } }));
}

// ── Inicialização ─────────────────────────────────────────────────────────────

export function inicializarNPCs() {
  dadosJogo.celulas.forEach(cell => {
    if (cell.type === 'indigena') {
      const p = PERFIS_TI[Math.floor(Math.random() * PERFIS_TI.length)];
      const npc = { id: 'npc_ti', tipo: 'indigena', perfilId: p.id,
        nome: p.nome, emoji: p.emoji, farol: 'vermelho',
        passoDialogo: 0, acordoAtivo: false, receitaPorCiclo: 0 };
      dadosJogo.npcs[cell.id] = npc;
      dadosJogo.estadoFarol[cell.id] = 'vermelho';
      cell.npcRef = npc.id;
      return;
    }
    if (cell.type !== 'pecuaria' && cell.type !== 'garimpo') return;
    const tipo = cell.type === 'pecuaria' ? 'pecuarista' : 'garimpeiro';
    const arr  = tipo === 'pecuarista' ? PERFIS_PECUARISTA : PERFIS_GARIMPEIRO;
    const p    = arr[Math.floor(Math.random() * arr.length)];
    const npc  = {
      id: 'npc_' + cell.id, tipo, perfilId: p.id,
      nome: p.nome + ' ' + nomeAleatorio(), emoji: p.emoji,
      farol: 'vermelho', ciclosSemSupporte: 0,
      acordoAtivo: false, receitaPorCiclo: 0,
      cicloUltimaExpansao: 0, custoParcearia: p.custoParcearia || 0,
    };
    dadosJogo.npcs[cell.id] = npc;
    dadosJogo.estadoFarol[cell.id] = 'vermelho';
    cell.npcRef = npc.id;
  });
}

// ── Ações de diálogo ──────────────────────────────────────────────────────────

export function iniciarDialogo(cellId) {
  const npc = dadosJogo.npcs[cellId];
  if (!npc) return null;
  if (npc.farol === 'vermelho') mudarFarol(cellId, 'amarelo');
  return npc;
}

export function fazerProposta(cellId, tipoProposta) {
  const npc = dadosJogo.npcs[cellId];
  if (!npc) return { resultado: 'erro' };
  const p = getPerfil(npc);
  const chances = {
    saf_parceiro: p.chanceSAF, pecuaria_intensiva: p.chancePecuariaIntensiva,
    manejo_florestal: p.chanceManejo, reflorestamento: p.chanceReflorestamento,
    parceria_garimpo: p.chanceAceite,
  };
  const chance = (chances[tipoProposta] || 0) + (dadosJogo.equipe.negociadores > 0 ? 10 : 0);
  if (Math.random() * 100 <= chance) {
    mudarFarol(cellId, 'verde');
    npc.acordoAtivo = true;
    npc.receitaPorCiclo = { saf_parceiro: 40, pecuaria_intensiva: 20, manejo_florestal: 30, parceria_garimpo: 0 }[tipoProposta] || 0;
    if (tipoProposta === 'parceria_garimpo') {
      const cell = dadosJogo.celulas.find(c => c.id === cellId);
      if (cell) cell.type = 'contaminado';
      document.dispatchEvent(new CustomEvent('celulaAtualizada', { detail: { celulaId: cellId } }));
    }
    return { resultado: 'aceite' };
  }
  return { resultado: 'rejeicao' };
}

// ── Terra Indígena ────────────────────────────────────────────────────────────

export function iniciarDialogoTI(cellId) {
  const npc = dadosJogo.npcs[cellId];
  if (!npc || npc.tipo !== 'indigena') return null;
  if (dadosJogo.equipe.negociadores < 1) return { erro: 'Requer Negociador' };
  if (!temAcaoBeneficaNoEntorno(cellId)) return { erro: 'Requer ação benéfica no entorno' };
  mudarFarol(cellId, 'amarelo');
  return npc;
}

export function avancarDialogoTI(cellId, passo) {
  const npc = dadosJogo.npcs[cellId];
  if (!npc || npc.tipo !== 'indigena') return { resultado: 'erro' };

  if (passo === 'apresentar') {
    npc.passoDialogo = 1;
    dadosJogo.bonusNegociacaoTI = 5;
    return { resultado: 'ok', mensagem: 'Projeto apresentado. +5% nas negociações.' };
  }
  if (passo === 'comprar_castanhas') {
    if (dadosJogo.saldo < 200) return { resultado: 'erro', mensagem: 'Saldo insuficiente (R$200)' };
    dadosJogo.saldo -= 200;
    npc.passoDialogo = 2;
    return { resultado: 'ok', mensagem: 'Castanhas compradas. Confiança aumentou.' };
  }
  if (passo === 'propor_parceria') {
    if (dadosJogo.saldo < 400) return { resultado: 'erro', mensagem: 'Saldo insuficiente (R$400)' };
    if (npc.passoDialogo < 2) return { resultado: 'erro', mensagem: 'Compre as castanhas primeiro.' };
    dadosJogo.saldo -= 400;
    const perfil = getPerfil(npc);
    const cell = dadosJogo.celulas.find(c => c.id === cellId);
    const benef = cell ? dadosJogo.celulas.filter(c =>
      Math.abs(c.x - cell.x) + Math.abs(c.y - cell.y) === 1 &&
      ['pioneira','secundaria','climax','rio_recuperado'].includes(c.type)
    ).length : 0;
    const chance = perfil.chanceParcearia + (dadosJogo.equipe.negociadores > 0 ? 10 : 0) + benef * 20;
    if (Math.random() * 100 <= chance) {
      mudarFarol(cellId, 'verde');
      npc.acordoAtivo = true;
      npc.passoDialogo = 3;
      npc.receitaPorCiclo = 20;
      dadosJogo.receitaPorCiclo += 20;
      return { resultado: 'aceite' };
    }
    return { resultado: 'rejeicao' };
  }
  return { resultado: 'erro' };
}

// ── Loop ──────────────────────────────────────────────────────────────────────

export function verificarNPCs() {
  Object.entries(dadosJogo.npcs).forEach(([cellId, npc]) => {
    if (npc.tipo === 'indigena') {
      if (npc.farol === 'verde' && npc.acordoAtivo) dadosJogo.saldo += npc.receitaPorCiclo;
      const cell = dadosJogo.celulas.find(c => c.id === cellId);
      if (cell) {
        const rioPoluido = dadosJogo.celulas.some(c =>
          Math.abs(c.x - cell.x) + Math.abs(c.y - cell.y) === 1 && c.type === 'rio_poluido'
        );
        if (rioPoluido || dadosJogo.construcoes.filter(c => c.type === 'pch').length >= 3)
          mudarFarol(cellId, 'vermelho');
      }
      return;
    }
    if (npc.farol === 'verde' && npc.acordoAtivo) {
      dadosJogo.saldo += npc.receitaPorCiclo;
      return;
    }
    if (npc.farol !== 'vermelho') return;
    if (dadosJogo.cicloAtual - npc.cicloUltimaExpansao < 4) return;
    if (Math.random() < 0.25) {
      npc.cicloUltimaExpansao = dadosJogo.cicloAtual;
      const cell = dadosJogo.celulas.find(c => c.id === cellId);
      if (!cell) return;
      const adj = dadosJogo.celulas.find(c =>
        Math.abs(c.x - cell.x) + Math.abs(c.y - cell.y) === 1 && c.type === 'degradado'
      );
      if (adj) {
        adj.type = cell.type;
        document.dispatchEvent(new CustomEvent('celulaAtualizada', { detail: { celulaId: adj.id } }));
      }
    }
  });
}
