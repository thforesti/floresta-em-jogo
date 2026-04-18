import dadosJogo from './dadosJogo.js';

export function getCelula(celulaId) {
  return dadosJogo.celulas.find(c => c.id === celulaId);
}

function despachar(celulaId) {
  document.dispatchEvent(new CustomEvent('celulaAtualizada', { detail: { celulaId } }));
}

function enfileirar(cell, acao, timerRestante, proximoType, proximoState) {
  cell.actionQueue.push({ acao, timerRestante, proximoType, proximoState });
}

// ── Timer e Sucessão ──────────────────────────────────────────────────────────

export function avançarTimers() {
  dadosJogo.celulas.forEach(cell => {
    if (cell.actionQueue.length === 0) return;
    const acao = cell.actionQueue[0];
    acao.timerRestante -= 1;
    if (acao.timerRestante <= 0) {
      cell.type  = acao.proximoType;
      cell.state = acao.proximoState;
      cell.actionQueue.shift();
      despachar(cell.id);
    }
  });
}

const TIPOS_MATA = new Set(['pioneira', 'secundaria']);

export function verificarSucessao() {
  dadosJogo.celulas.forEach(cell => {
    if (!TIPOS_MATA.has(cell.type) || cell.actionQueue.length > 0) return;
    if (cell.ciclosNoEstado === undefined) cell.ciclosNoEstado = 0;
    cell.ciclosNoEstado += 1;

    if (cell.type === 'pioneira' && cell.ciclosNoEstado >= 36) {
      cell.type = 'secundaria';
      cell.ciclosNoEstado = 0;
      despachar(cell.id);
    } else if (cell.type === 'secundaria' && cell.ciclosNoEstado >= 60) {
      cell.type = 'climax';
      cell.ciclosNoEstado = 0;
      despachar(cell.id);
    }
  });
}

// ── Ações ─────────────────────────────────────────────────────────────────────

export function prepararTerra(celulaId) {
  const cell = getCelula(celulaId);
  if (!cell || cell.type !== 'degradado')  return { erro: 'Célula precisa ser Solo Degradado' };
  if (dadosJogo.saldo < 200)               return { erro: 'Saldo insuficiente (R$200)' };
  dadosJogo.saldo -= 200;
  enfileirar(cell, 'preparar', 2, 'preparado', 'idle');
  return null;
}

export function plantarMudas(celulaId) {
  const cell = getCelula(celulaId);
  if (!cell || cell.type !== 'preparado')  return { erro: 'Célula precisa ser Solo Preparado' };
  if (dadosJogo.mudas < 10)               return { erro: 'Mudas insuficientes (10 un)' };
  dadosJogo.mudas -= 10;
  cell.type  = 'pioneira';
  cell.state = 'crescendo';
  cell.ciclosNoEstado = 0;
  despachar(celulaId);
  return null;
}

export function descontaminar(celulaId) {
  const cell = getCelula(celulaId);
  if (!cell || cell.type !== 'garimpo')    return { erro: 'Célula precisa ser Garimpo' };
  if (dadosJogo.saldo < 400)               return { erro: 'Saldo insuficiente (R$400)' };
  dadosJogo.saldo -= 400;
  enfileirar(cell, 'descontaminar', 3, 'degradado', 'idle');
  return null;
}

export function construirViveiro(celulaId) {
  const cell = getCelula(celulaId);
  if (!cell || cell.type !== 'preparado')  return { erro: 'Célula precisa ser Solo Preparado' };
  if (dadosJogo.saldo < 600)               return { erro: 'Saldo insuficiente (R$600)' };
  dadosJogo.saldo -= 600;
  cell.type = 'viveiro';
  dadosJogo.construcoes.push({ type: 'viveiro', celulaId, ativo: true });
  despachar(celulaId);
  return null;
}

export function construirBomba(celulaId) {
  const cell = getCelula(celulaId);
  if (!cell || cell.type !== 'rio_recuperado') return { erro: 'Célula precisa ser Rio Recuperado' };
  if (dadosJogo.saldo < 400)                   return { erro: 'Saldo insuficiente (R$400)' };
  dadosJogo.saldo -= 400;
  cell.infraList.push('bomba');
  dadosJogo.construcoes.push({ type: 'bomba', celulaId, ativo: true });
  despachar(celulaId);
  return null;
}

export function construirGerador(celulaId) {
  const cell = getCelula(celulaId);
  if (!cell || cell.type.startsWith('rio')) return { erro: 'Não é possível construir em rio' };
  if (dadosJogo.saldo < 150)                return { erro: 'Saldo insuficiente (R$150)' };
  dadosJogo.saldo -= 150;
  dadosJogo.construcoes.push({ type: 'gerador_diesel', celulaId, ativo: true });
  despachar(celulaId);
  return null;
}

export function recuperarRio(celulaId) {
  const cell = getCelula(celulaId);
  if (!cell || cell.type !== 'rio_degradado') return { erro: 'Célula precisa ser Rio Degradado' };
  if (dadosJogo.saldo < 600)                  return { erro: 'Saldo insuficiente (R$600)' };
  dadosJogo.saldo -= 600;
  enfileirar(cell, 'recuperar_rio', 3, 'rio_recuperado', 'idle');
  return null;
}
