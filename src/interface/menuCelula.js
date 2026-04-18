import dadosJogo from '../estado/dadosJogo.js';
import {
  prepararTerra, plantarMudas, descontaminar,
  construirViveiro, construirBomba, construirGerador, recuperarRio
} from '../estado/celulas.js';
import { combaterIncendio } from '../estado/eventos.js';
import { mostrarDialogoNpc } from './modalNpc.js';

const NOMES = {
  degradado: 'Solo Degradado', preparado: 'Solo Preparado',
  contaminado: 'Solo Contaminado', pioneira: 'Mata Pioneira',
  secundaria: 'Mata Secundária', climax: 'Mata Clímax',
  garimpo: 'Garimpo', pecuaria: 'Pecuária',
  rio_degradado: 'Rio Degradado', rio_recuperado: 'Rio Recuperado',
  rio_poluido: 'Rio Poluído', indigena: 'Terra Indígena',
  queimada: 'Queimada Ativa', viveiro: 'Viveiro',
};

const ACOES_POR_TIPO = {
  degradado:      [['Preparar Terra',    'prepararTerra',    'R$200 · 2 ciclos']],
  preparado:      [['Plantar Mudas',     'plantarMudas',     '10🌱'],
                   ['Construir Viveiro', 'construirViveiro', 'R$600']],
  contaminado:    [['Descontaminar',     'descontaminar',    'R$400 · 3 ciclos']],
  queimada:       [['🚒 Combater Incêndio', 'combaterIncendio', 'R$400 + 20💧', 'btn-perigo']],
  garimpo:        [],
  indigena:       [],
  rio_degradado:  [['Recuperar Rio',     'recuperarRio',     'R$600 · 3 ciclos']],
  rio_recuperado: [['Instalar Bomba',    'construirBomba',   'R$400']],
  pecuaria:       [],
};

const ACOES_FN = {
  prepararTerra, plantarMudas, descontaminar,
  construirViveiro, construirBomba, construirGerador, recuperarRio,
  combaterIncendio,
};

function mostrarAlerta(msg) {
  document.getElementById('alerta-acao')?.remove();
  const el = document.createElement('div');
  el.id = 'alerta-acao';
  el.className = 'alerta';
  el.innerHTML = `<span class="alerta__icone">⚠️</span>
    <span class="alerta__titulo">${msg}</span>`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

function botaoDialogar(celula) {
  if (!celula.npcRef) return '';
  const temNegociador = dadosJogo.equipe.negociadores > 0;
  if (temNegociador || celula.type === 'pecuaria' || celula.type === 'indigena') {
    return `<button class="btn-primario" onclick="window.abrirDialogoNpc('${celula.id}')">Dialogar</button>`;
  }
  return `<div class="menu-celula__acao-custo">⚠️ Requer Negociador</div>`;
}

export function fecharMenuCelula() {
  document.getElementById('menu-celula')?.remove();
}

export function abrirMenuCelula(celulaId, x, y) {
  fecharMenuCelula();
  const celula = dadosJogo.celulas.find(c => c.id === celulaId);
  if (!celula) return;

  const acoes = ACOES_POR_TIPO[celula.type] || [];
  const botoes = acoes.map(([label, acao, custo, cls = 'btn-primario']) =>
    `<button class="${cls}" onclick="window.executarAcao('${acao}','${celula.id}')">
      ${label} <span class="menu-celula__acao-custo">${custo}</span>
    </button>`
  ).join('');

  const el = document.createElement('div');
  el.id = 'menu-celula';
  el.innerHTML = `
    <div class="menu-celula__titulo">${NOMES[celula.type] || celula.type}</div>
    <div class="menu-celula__estado">Estado: ${celula.state}</div>
    <div class="menu-celula__acoes">
      ${botoes}
      ${botaoDialogar(celula)}
      <button class="btn-neutro" onclick="window.fecharMenuCelula()">Fechar</button>
    </div>`;
  document.body.appendChild(el);

  const menuW = 260, menuH = 60 + (acoes.length + (celula.npcRef ? 1 : 0)) * 44, margin = 8;
  let px = x + margin, py = y + margin;
  if (px + menuW > window.innerWidth)  px = x - menuW - margin;
  if (py + menuH > window.innerHeight) py = y - menuH - margin;
  el.style.left = px + 'px';
  el.style.top  = py + 'px';
}

window.fecharMenuCelula = fecharMenuCelula;

window.executarAcao = (acao, celulaId) => {
  const resultado = ACOES_FN[acao]?.(celulaId);
  fecharMenuCelula();
  if (resultado?.erro) mostrarAlerta(resultado.erro);
};

window.abrirDialogoNpc = (cellId) => {
  fecharMenuCelula();
  mostrarDialogoNpc(cellId);
};
