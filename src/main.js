import CenaMapa from './mapa/cena.js';
import { iniciarLoop } from './loop.js';
import { abrirMenuCelula } from './interface/menuCelula.js';
import { mostrarModalEmprestimo, mostrarGameOver, mostrarAlertaEvento } from './interface/modalNpc.js';
import { iniciarPainelLateral } from './interface/painelLateral.js';
import dadosJogo from './estado/dadosJogo.js';

window.dadosJogo = dadosJogo;

const config = {
  type: Phaser.AUTO,
  parent: 'canvas-container',
  width: window.innerWidth - 240,
  height: window.innerHeight,
  scene: [CenaMapa]
};

const jogo = new Phaser.Game(config);

jogo.events.on('ready', () => {
  iniciarLoop();
  iniciarPainelLateral();
});

document.addEventListener('celulaSelecionada', (e) => {
  abrirMenuCelula(e.detail.celulaId, e.detail.x, e.detail.y);
});

document.addEventListener('ofertaEmprestimo', () => {
  mostrarModalEmprestimo();
});

document.addEventListener('gameOver', (e) => {
  mostrarGameOver(e.detail.tipo);
});

window.aceitarEmprestimo = () => {
  dadosJogo.saldo += 5000;
  dadosJogo.emprestimoUsado = true;
  dadosJogo.emprestimoAtivo = true;
  dadosJogo.parcelasRestantes = 10;
  document.getElementById('modal-npc')?.remove();
};

window.recusarEmprestimo = () => {
  document.dispatchEvent(new CustomEvent('gameOver', { detail: { tipo: 'financeiro' } }));
};

document.addEventListener('alertaIncendio', () =>
  mostrarAlertaEvento('incendio', 'Incêndio detectado! Clique na célula para combater.'));
document.addEventListener('alertaSeca', () =>
  mostrarAlertaEvento('seca', 'Seca Extrema! Produção de água -50% por 30 ciclos.'));
document.addEventListener('alertaPraga', (e) =>
  mostrarAlertaEvento('praga', 'Praga! ' + e.detail.afetadas + ' células afetadas.'));
document.addEventListener('alertaEdital', () =>
  mostrarAlertaEvento('edital', 'Edital aprovado! +R$15.000 no caixa.'));
document.addEventListener('secaEncerrada', () =>
  mostrarAlertaEvento('seca_fim', 'Seca encerrada. Produção de água normalizada.'));

window.zoomIn = () => {
  const cam = jogo.scene.scenes[0].cameras.main;
  cam.setZoom(Phaser.Math.Clamp(cam.zoom + 0.2, 0.4, 2.0));
};
window.zoomOut = () => {
  const cam = jogo.scene.scenes[0].cameras.main;
  cam.setZoom(Phaser.Math.Clamp(cam.zoom - 0.2, 0.4, 2.0));
};
window.resetCamera = () => {
  const cam = jogo.scene.scenes[0].cameras.main;
  cam.setZoom(1);
  cam.scrollX = 0;
  cam.scrollY = 0;
};
