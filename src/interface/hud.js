import dadosJogo from '../estado/dadosJogo.js';

let snapAgua = 0, snapEnergia = 0;

function set(id, valor) {
  const el = document.getElementById(id);
  if (el) el.innerText = valor;
}

function setDelta(valorId, delta) {
  const valorEl = document.getElementById(valorId);
  if (!valorEl) return;
  const container = valorEl.parentElement;

  let el = container.querySelector('.hud-recurso__delta');
  if (!el) {
    el = document.createElement('span');
    el.className = 'hud-recurso__delta';
    container.appendChild(el);
  }

  if (delta === 0) { el.innerText = ''; return; }
  const classe = delta > 0 ? 'hud-recurso__delta--positivo' : 'hud-recurso__delta--negativo';
  el.className = `hud-recurso__delta ${classe}`;
  el.innerText  = (delta > 0 ? '+' : '') + delta;
}

export function atualizarHUD() {
  set('hud-saldo',   'R$ ' + dadosJogo.saldo.toLocaleString('pt-BR'));
  set('hud-agua',    dadosJogo.agua + ' un');
  set('hud-energia', dadosJogo.energia + ' kWh');
  set('hud-mudas',   dadosJogo.mudas + ' un');
  set('hud-ciclo',   'Mês ' + dadosJogo.mesAtual + ' · Ciclo ' + dadosJogo.cicloAtual);

  setDelta('hud-saldo',   dadosJogo.receitaPorCiclo - dadosJogo.custoPorCiclo);
  setDelta('hud-agua',    dadosJogo.agua - snapAgua);
  setDelta('hud-energia', dadosJogo.energia - snapEnergia);

  snapAgua    = dadosJogo.agua;
  snapEnergia = dadosJogo.energia;
}
