import { gerarMapa } from './gerador.js';
import { getCorTile } from './tiles.js';
import dadosJogo from '../estado/dadosJogo.js';
import { inicializarNPCs } from '../estado/npcs.js';

const TILE_W = 96;
const TILE_H = 48;
const TILE_D = 24;

const COR_FAROL = { verde: 0x2DC653, amarelo: 0xFFD166, vermelho: 0xEF233C };

function hexToInt(hex) {
  return parseInt(hex.replace('#', ''), 16);
}

export default class CenaMapa extends Phaser.Scene {
  constructor() {
    super({ key: 'CenaMapa' });
    this.celulas = [];
    this.g = null;
    this.origemX = 0;
    this.origemY = 0;
  }

  create() {
    this.celulas = gerarMapa('medio');
    inicializarNPCs();
    this.g = this.add.graphics();
    this.origemX = this.cameras.main.width / 2;
    const alturaCanvas = this.cameras.main.height;
    this.origemY = 64 + (alturaCanvas - 64 - 504) / 2 + TILE_H;
    this.cameras.main.setBackgroundColor('#1B4332');
    this.desenharMapa();

    // Zoom com scroll / trackpad pinça
    this.input.on('wheel', (pointer, objects, deltaX, deltaY) => {
      const novoZoom = Phaser.Math.Clamp(
        this.cameras.main.zoom - deltaY * 0.001, 0.4, 2.0
      );
      this.cameras.main.setZoom(novoZoom);
    });

    // Pan com arrastar + clique simples para selecionar
    let arrastando = false;
    let iniciouArraste = false;
    let pointerInicioX = 0;
    let pointerInicioY = 0;
    const LIMIAR_ARRASTE = 5;

    this.input.on('pointerdown', (pointer) => {
      pointerInicioX = pointer.x;
      pointerInicioY = pointer.y;
      iniciouArraste = false;
    });

    this.input.on('pointermove', (pointer) => {
      if (!pointer.isDown) return;
      const dx = pointer.x - pointerInicioX;
      const dy = pointer.y - pointerInicioY;
      if (!iniciouArraste && Math.abs(dx) + Math.abs(dy) > LIMIAR_ARRASTE) {
        iniciouArraste = true;
        arrastando = true;
      }
      if (arrastando) {
        this.cameras.main.scrollX -= (pointer.x - pointer.prevPosition.x) / this.cameras.main.zoom;
        this.cameras.main.scrollY -= (pointer.y - pointer.prevPosition.y) / this.cameras.main.zoom;
      }
    });

    this.input.on('pointerup', (pointer) => {
      if (!arrastando) this.detectarCelulaClicada(pointer);
      arrastando = false;
      iniciouArraste = false;
    });

    document.addEventListener('celulaAtualizada', (e) => {
      this.redesenharTile(e.detail.celulaId);
    });
    document.addEventListener('farolAtualizado', (e) => {
      this.redesenharTile(e.detail.cellId);
    });
  }

  isoPos(col, row) {
    return {
      cx: this.origemX + (col - row) * (TILE_W / 2),
      cy: this.origemY + (col + row) * (TILE_H / 2)
    };
  }

  desenharTile(col, row, cores) {
    const { cx, cy } = this.isoPos(col, row);
    const lat = hexToInt(cores.lateral);

    this.g.fillStyle(hexToInt(cores.topo), 1);
    this.g.beginPath();
    this.g.moveTo(cx,              cy);
    this.g.lineTo(cx + TILE_W / 2, cy + TILE_H / 2);
    this.g.lineTo(cx,              cy + TILE_H);
    this.g.lineTo(cx - TILE_W / 2, cy + TILE_H / 2);
    this.g.closePath();
    this.g.fillPath();

    this.g.fillStyle(lat, 0.6);
    this.g.beginPath();
    this.g.moveTo(cx - TILE_W / 2, cy + TILE_H / 2);
    this.g.lineTo(cx,              cy + TILE_H);
    this.g.lineTo(cx,              cy + TILE_H + TILE_D);
    this.g.lineTo(cx - TILE_W / 2, cy + TILE_H / 2 + TILE_D);
    this.g.closePath();
    this.g.fillPath();

    this.g.fillStyle(lat, 0.8);
    this.g.beginPath();
    this.g.moveTo(cx,              cy + TILE_H);
    this.g.lineTo(cx + TILE_W / 2, cy + TILE_H / 2);
    this.g.lineTo(cx + TILE_W / 2, cy + TILE_H / 2 + TILE_D);
    this.g.lineTo(cx,              cy + TILE_H + TILE_D);
    this.g.closePath();
    this.g.fillPath();

    this.g.lineStyle(1, 0xffffff, 0.3);
    this.g.beginPath();
    this.g.moveTo(cx,              cy);
    this.g.lineTo(cx + TILE_W / 2, cy + TILE_H / 2);
    this.g.lineTo(cx,              cy + TILE_H);
    this.g.lineTo(cx - TILE_W / 2, cy + TILE_H / 2);
    this.g.closePath();
    this.g.strokePath();
  }

  desenharFarois() {
    dadosJogo.celulas.forEach(cell => {
      if (!cell.npcRef) return;
      const estado = dadosJogo.estadoFarol[cell.id];
      if (!estado) return;
      const { cx, cy } = this.isoPos(cell.x, cell.y);
      this.g.fillStyle(COR_FAROL[estado] || COR_FAROL.vermelho, 1);
      this.g.fillCircle(cx + TILE_W * 0.35, cy + TILE_H * 0.2, 6);
    });
  }

  redesenharTile(celulaId) {
    const cell = dadosJogo.celulas.find(c => c.id === celulaId);
    if (!cell) return;
    this.celulas = dadosJogo.celulas;
    this.desenharMapa();
  }

  desenharMapa() {
    this.g.clear();
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        const celula = this.celulas[row * 10 + col];
        this.desenharTile(col, row, getCorTile(celula.type));
      }
    }
    this.desenharFarois();
  }

  detectarCelulaClicada(pointer) {
    const worldX = pointer.worldX;
    const worldY = pointer.worldY;
    const dx = worldX - this.origemX;
    const dy = worldY - this.origemY - TILE_H / 2;
    const col = Math.floor((dx / (TILE_W / 2) + dy / (TILE_H / 2)) / 2);
    const row = Math.floor((dy / (TILE_H / 2) - dx / (TILE_W / 2)) / 2);

    if (col < 0 || col > 9 || row < 0 || row > 9) return;

    const celula = this.celulas[row * 10 + col];
    document.dispatchEvent(new CustomEvent('celulaSelecionada', {
      detail: { celulaId: celula.id, x: pointer.x, y: pointer.y }
    }));
  }

  update() {}
}
