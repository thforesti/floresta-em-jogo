import dadosJogo from './estado/dadosJogo.js';
import { processarProducao, processarConsumo, pagarSalarios, processarParcelas } from './estado/recursos.js';
import { avançarTimers, verificarSucessao } from './estado/celulas.js';
import { verificarNPCs } from './estado/npcs.js';
import { verificarEventos, verificarFimSeca } from './estado/eventos.js';
import { atualizarHUD } from './interface/hud.js';
import { atualizarPainel } from './interface/painelLateral.js';

const CICLOS_POR_MES = 6;
let intervalo = null;

function tick() {
  if (!dadosJogo.jogoAtivo) return;
  dadosJogo.cicloAtual += 1;
  dadosJogo.mesAtual = Math.floor(dadosJogo.cicloAtual / CICLOS_POR_MES) + 1;

  processarProducao();
  processarConsumo();
  pagarSalarios();
  processarParcelas();
  avançarTimers();
  verificarSucessao();
  verificarNPCs();
  verificarEventos();
  verificarFimSeca();
  // verificarFauna()    — fase 8
  // verificarVitoria()  — fase 9
  atualizarHUD();
  atualizarPainel();

  console.log(
    'Ciclo', dadosJogo.cicloAtual,
    '| Saldo:', dadosJogo.saldo,
    '| Água:', dadosJogo.agua,
    '| Energia:', dadosJogo.energia
  );
}

export function iniciarLoop() {
  if (intervalo !== null) return;
  dadosJogo.jogoAtivo = true;
  atualizarHUD();
  intervalo = setInterval(tick, 10000);
}

export function pausarLoop() {
  if (intervalo === null) return;
  clearInterval(intervalo);
  intervalo = null;
}

export function resumirLoop() {
  if (intervalo !== null) return;
  intervalo = setInterval(tick, 10000);
}
