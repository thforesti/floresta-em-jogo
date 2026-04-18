import dadosJogo from './dadosJogo.js';

export function processarProducao() {
  dadosJogo.receitaPorCiclo = 0;

  // Água: rio_recuperado por célula (seca reduz 50%)
  dadosJogo.celulas.forEach(c => {
    if (c.type !== 'rio_recuperado') return;
    let prod = c.infraList.includes('bomba') ? 10 : 5;
    if (dadosJogo.secaAtiva) prod = Math.floor(prod * 0.5);
    dadosJogo.agua += prod;
  });

  // Energia: construções globais
  dadosJogo.construcoes.forEach(c => {
    if (c.type === 'gerador_diesel') dadosJogo.energia += 10;
    if (c.type === 'placa_solar')    dadosJogo.energia += 5;
    if (c.type === 'pch')            dadosJogo.energia += 15;
  });

  // Receitas passivas: SAF e crédito de carbono
  const saf     = dadosJogo.celulas.filter(c => c.type === 'saf_proprio').length * 80
                + dadosJogo.celulas.filter(c => c.type === 'saf_parceiro').length * 40;
  const climax  = dadosJogo.celulas.filter(c => c.type === 'climax').length;
  const carbono = climax >= 3 ? climax * 25 : 0;
  dadosJogo.saldo += saf + carbono;
  dadosJogo.receitaPorCiclo = saf + carbono;

  // Mudas: viveiro a cada 6 ciclos
  if (dadosJogo.cicloAtual % 6 === 0
      && dadosJogo.energia > 0
      && dadosJogo.equipe.tecnicos > 0) {
    dadosJogo.mudas = Math.min(1000, dadosJogo.mudas + 100);
  }
}

export function processarConsumo() {
  dadosJogo.custoPorCiclo = 0;

  // Água consumida por tipo de célula
  dadosJogo.celulas.forEach(c => {
    if (c.type === 'pioneira')    dadosJogo.agua = Math.max(0, dadosJogo.agua - 1);
    if (c.type === 'secundaria')  dadosJogo.agua = Math.max(0, dadosJogo.agua - 1);
    if (c.type === 'saf_proprio') dadosJogo.agua = Math.max(0, dadosJogo.agua - 3);
  });

  // Energia/água consumidas por construção
  dadosJogo.construcoes.forEach(c => {
    if (c.type === 'viveiro') {
      dadosJogo.energia = Math.max(0, dadosJogo.energia - 5);
      dadosJogo.agua    = Math.max(0, dadosJogo.agua - 2);
    }
    if (c.type === 'bomba') {
      dadosJogo.energia = Math.max(0, dadosJogo.energia - 3);
    }
  });
}

export function verificarEmprestimo() {
  if (!dadosJogo.emprestimoUsado) {
    document.dispatchEvent(new CustomEvent('ofertaEmprestimo'));
  } else {
    document.dispatchEvent(new CustomEvent('gameOver', { detail: { tipo: 'financeiro' } }));
  }
}

export function pagarSalarios() {
  const { tecnicos, negociadores, brigadistas } = dadosJogo.equipe;
  const salarios  = tecnicos * 30 + negociadores * 35 + brigadistas * 25;
  const geradores = dadosJogo.construcoes.filter(c => c.type === 'gerador_diesel').length * 20;
  dadosJogo.saldo -= salarios + geradores;
  dadosJogo.custoPorCiclo += salarios + geradores;

  if (dadosJogo.saldo <= 0) verificarEmprestimo();
}

const LIMITES  = { tecnico: 5, negociador: 3, brigadista: 4 };
const CAMPOS   = { tecnico: 'tecnicos', negociador: 'negociadores', brigadista: 'brigadistas' };
const SALARIOS = { tecnico: 30, negociador: 35, brigadista: 25 };

export function contratarProfissional(tipo) {
  const campo = CAMPOS[tipo];
  if (!campo) return { erro: 'Tipo inválido' };
  if (dadosJogo.equipe[campo] >= LIMITES[tipo]) return { erro: 'Limite atingido' };
  dadosJogo.equipe[campo] += 1;
  dadosJogo.custoPorCiclo += SALARIOS[tipo];
  return { ok: true };
}

export function demitirProfissional(tipo) {
  const campo = CAMPOS[tipo];
  if (!campo || dadosJogo.equipe[campo] <= 0) return { erro: 'Nenhum para demitir' };
  dadosJogo.equipe[campo] -= 1;
  dadosJogo.custoPorCiclo = Math.max(0, dadosJogo.custoPorCiclo - SALARIOS[tipo]);
  return { ok: true };
}

export function processarParcelas() {
  if (!dadosJogo.emprestimoAtivo) return;
  if (dadosJogo.cicloAtual % 6 !== 0) return;

  dadosJogo.saldo -= 650;
  dadosJogo.parcelasRestantes -= 1;

  if (dadosJogo.saldo < 0) {
    document.dispatchEvent(new CustomEvent('gameOver', { detail: { tipo: 'financeiro' } }));
    return;
  }
  if (dadosJogo.parcelasRestantes === 0) dadosJogo.emprestimoAtivo = false;
}
