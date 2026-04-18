import dadosJogo from '../estado/dadosJogo.js';
import { contratarProfissional, demitirProfissional } from '../estado/recursos.js';

const EQUIPE_DEF = [
  { tipo: 'tecnico',    label: 'Técnico Florestal', campo: 'tecnicos',    salario: 30, limite: 5 },
  { tipo: 'negociador', label: 'Negociador',         campo: 'negociadores', salario: 35, limite: 3 },
  { tipo: 'brigadista', label: 'Brigadista',          campo: 'brigadistas',  salario: 25, limite: 4 },
];

function alertaPainel(msg) {
  document.getElementById('alerta-acao')?.remove();
  const el = document.createElement('div');
  el.id = 'alerta-acao';
  el.className = 'alerta';
  el.innerHTML = `<span class="alerta__icone">⚠️</span><span class="alerta__titulo">${msg}</span>`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

function htmlEquipe() {
  return EQUIPE_DEF.map(({ tipo, label, campo, salario, limite }) => {
    const qtd   = dadosJogo.equipe[campo];
    const maxed = qtd >= limite;
    return `<div class="painel__item">
      <span>${label}</span>
      <span class="painel__qtd">${qtd}/${limite}</span>
      <button class="btn-neutro painel__btn-sm" ${maxed ? 'disabled' : ''} onclick="window.contratar('${tipo}')">+</button>
      <button class="btn-neutro painel__btn-sm" ${qtd <= 0 ? 'disabled' : ''} onclick="window.demitir('${tipo}')">−</button>
    </div>
    <div class="painel__item--muted">R$${salario}/ciclo cada</div>`;
  }).join('');
}

function htmlStatus() {
  const liquido = dadosJogo.receitaPorCiclo - dadosJogo.custoPorCiclo;
  const cor = liquido >= 0 ? 'painel__item--positivo' : 'painel__item--negativo';
  return `<div class="painel__item--muted">Receita: R$${dadosJogo.receitaPorCiclo}/ciclo</div>
    <div class="painel__item--muted">Custo: R$${dadosJogo.custoPorCiclo}/ciclo</div>
    <div class="painel__item ${cor}">Líquido: R$${liquido}/ciclo</div>`;
}

function htmlInfra() {
  return `<div class="painel__item">
    <button class="btn-primario painel__btn-bloco" onclick="window.construirInfra('gerador')">Gerador Diesel — R$150</button>
  </div>
  <div class="painel__item--muted">Selecione uma célula no mapa</div>
  <div class="painel__item">
    <button class="btn-primario painel__btn-bloco" onclick="window.construirInfra('solar')">Placa Solar — R$1.800</button>
  </div>`;
}

export function iniciarPainelLateral() {
  const el = document.getElementById('painel-lateral');
  if (!el) return;
  el.innerHTML = `
    <div class="painel__secao-titulo">👥 Equipe</div>
    <div id="painel-equipe">${htmlEquipe()}</div>
    <div class="painel__secao-titulo">🏗️ Infraestrutura</div>
    ${htmlInfra()}
    <div class="painel__secao-titulo">📊 Status</div>
    <div id="painel-status">${htmlStatus()}</div>`;
}

export function atualizarPainel() {
  const statusEl = document.getElementById('painel-status');
  if (statusEl) statusEl.innerHTML = htmlStatus();
  const equipeEl = document.getElementById('painel-equipe');
  if (equipeEl) equipeEl.innerHTML = htmlEquipe();
}

window.contratar = (tipo) => {
  const r = contratarProfissional(tipo);
  if (r.erro) { alertaPainel(r.erro); return; }
  atualizarPainel();
};

window.demitir = (tipo) => {
  demitirProfissional(tipo);
  atualizarPainel();
};

window.construirInfra = (tipo) => {
  alertaPainel('Selecione uma célula no mapa para instalar o ' + tipo + '.');
};
