import dadosJogo from './dadosJogo.js';

const FIRE_RISK_BASE = {
  pioneira: 0.25, secundaria: 0.15, climax: 0.05,
  saf_proprio: 0.20, degradado: 0.10, preparado: 0.10,
  pecuaria: 0.35, garimpo: 0.15, queimada: 0,
  rio_degradado: 0, rio_recuperado: 0, rio_poluido: 0,
  indigena: 0.05, viveiro: 0.15,
};

function vizinhosMoore(cell) {
  return dadosJogo.celulas.filter(c =>
    Math.abs(c.x - cell.x) <= 1 && Math.abs(c.y - cell.y) <= 1 &&
    !(c.x === cell.x && c.y === cell.y)
  );
}

export function iniciarIncendio(cellId) {
  const cell = dadosJogo.celulas.find(c => c.id === cellId);
  if (!cell) return;
  cell.type = 'queimada';
  cell.fireRisk = 0;
  document.dispatchEvent(new CustomEvent('celulaAtualizada', { detail: { celulaId: cellId } }));
  document.dispatchEvent(new CustomEvent('alertaIncendio', { detail: { cellId } }));
}

export function combaterIncendio(cellId) {
  const cell = dadosJogo.celulas.find(c => c.id === cellId);
  if (!cell || cell.type !== 'queimada') return { erro: 'Célula não está em chamas' };
  if (dadosJogo.agua < 20)   return { erro: 'Água insuficiente (20 un)' };
  if (dadosJogo.saldo < 400) return { erro: 'Saldo insuficiente (R$400)' };

  const brig = dadosJogo.equipe.brigadistas;
  const duracao = brig >= 2 ? 4 : brig === 1 ? 6 : 8;

  cell.actionQueue.push({
    acao: 'apagar_fogo', timerRestante: duracao,
    proximoType: 'degradado', proximoState: 'idle',
  });
  dadosJogo.saldo -= 400;
  dadosJogo.agua  -= 20;
  return { ok: true };
}

export function ativarSeca() {
  dadosJogo.secaAtiva = true;
  dadosJogo.ciclosFimSeca = dadosJogo.cicloAtual + 30;
  document.dispatchEvent(new CustomEvent('alertaSeca'));
}

export function verificarFimSeca() {
  if (!dadosJogo.secaAtiva) return;
  if (dadosJogo.cicloAtual >= dadosJogo.ciclosFimSeca) {
    dadosJogo.secaAtiva = false;
    document.dispatchEvent(new CustomEvent('secaEncerrada'));
  }
}

function ativarPraga() {
  const tec = dadosJogo.equipe.tecnicos;
  if (tec >= 4) return;
  const limite = tec === 0 ? 3 : 1;
  let afetadas = 0;
  for (const cell of dadosJogo.celulas) {
    if (afetadas >= limite) break;
    if (cell.type !== 'pioneira' && cell.type !== 'saf_proprio') continue;
    cell.type = 'degradado';
    afetadas++;
    document.dispatchEvent(new CustomEvent('celulaAtualizada', { detail: { celulaId: cell.id } }));
  }
  if (afetadas > 0)
    document.dispatchEvent(new CustomEvent('alertaPraga', { detail: { afetadas } }));
}

function dispararEdital() {
  dadosJogo.saldo += 15000;
  document.dispatchEvent(new CustomEvent('alertaEdital'));
}

export function verificarEventos() {
  if (dadosJogo.cicloAtual < 18) return;
  if (dadosJogo.secaAtiva === undefined)    dadosJogo.secaAtiva = false;
  if (dadosJogo.ciclosFimSeca === undefined) dadosJogo.ciclosFimSeca = 0;

  const temBrigadista = dadosJogo.equipe.brigadistas > 0;

  // 1. Incêndio espontâneo
  dadosJogo.celulas.forEach(cell => {
    const base = FIRE_RISK_BASE[cell.type];
    if (!base) return;
    let r = base;
    if (dadosJogo.secaAtiva) r += 0.30;
    if (temBrigadista)       r -= 0.15;
    if (Math.random() < r * 0.01) iniciarIncendio(cell.id);
  });

  // 2. Propagação Moore
  dadosJogo.celulas.filter(c => c.type === 'queimada').forEach(cell => {
    vizinhosMoore(cell).forEach(viz => {
      if (viz.type.startsWith('rio') || viz.type === 'queimada') return;
      if (Math.random() < 0.40) iniciarIncendio(viz.id);
    });
  });

  // 3. Seca
  if (dadosJogo.cicloAtual >= 30 && !dadosJogo.secaAtiva && Math.random() < 0.005)
    ativarSeca();

  // 4. Praga
  if (dadosJogo.cicloAtual >= 30 && Math.random() < 0.003)
    ativarPraga();

  // 5. Edital
  if (dadosJogo.saldo < 2000 && dadosJogo.cicloAtual >= 30 && Math.random() < 0.02)
    dispararEdital();
}
