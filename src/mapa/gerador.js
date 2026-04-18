import dadosJogo from '../estado/dadosJogo.js';

function dist(a, b) {
  return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
}

function criarCelula(x, y, type) {
  return {
    id: `cel_${x}_${y}`, x, y, type, state: 'idle',
    waterLevel: 0, contaminated: false, fireRisk: 0.1,
    vigilance: false, npcRef: null,
    infraList: [], actionQueue: [], faunaUnlocked: []
  };
}

function gerarRio(grid) {
  const startCol = 1 + Math.floor(Math.random() * 8);
  const path = [{ x: startCol, y: 0 }];
  const dirs = [{ x: 0, y: 1 }, { x: 1, y: 0 }, { x: -1, y: 0 }];

  while (path.length < 7) {
    const last = path[path.length - 1];
    const shuffled = [...dirs].sort(() => Math.random() - 0.35);
    const prox = shuffled.find(d => {
      const nx = last.x + d.x, ny = last.y + d.y;
      return nx >= 0 && nx < 10 && ny >= 0 && ny < 10
        && grid[ny][nx].type === 'degradado'
        && !path.some(p => p.x === nx && p.y === ny);
    });
    if (!prox) break;
    path.push({ x: last.x + prox.x, y: last.y + prox.y });
  }

  path.forEach(p => { grid[p.y][p.x].type = 'rio_degradado'; });
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function colocar(grid, type, count, pred) {
  const pos = shuffle(
    Array.from({ length: 100 }, (_, i) => ({ x: i % 10, y: Math.floor(i / 10) }))
  );
  let placed = 0;
  for (const p of pos) {
    if (placed >= count) break;
    if (grid[p.y][p.x].type !== 'degradado') continue;
    if (pred && !pred(p)) continue;
    grid[p.y][p.x].type = type;
    placed++;
  }
}

export function gerarMapa(dificuldade = 'medio') {
  const grid = Array.from({ length: 10 }, (_, y) =>
    Array.from({ length: 10 }, (_, x) => criarCelula(x, y, 'degradado'))
  );

  gerarRio(grid);

  colocar(grid, 'indigena', 1, p => p.y >= 5 && p.x >= 2 && p.x <= 7);

  let tiPos = null;
  for (let y = 0; y < 10; y++)
    for (let x = 0; x < 10; x++)
      if (grid[y][x].type === 'indigena') tiPos = { x, y };

  colocar(grid, 'garimpo',    2, p => !tiPos || dist(p, tiPos) >= 2);
  colocar(grid, 'pecuaria',   4, p => !tiPos || dist(p, tiPos) > 1);
  colocar(grid, 'queimada',   1);
  colocar(grid, 'pioneira',   2);
  colocar(grid, 'secundaria', 1);
  colocar(grid, 'climax',     1);

  dadosJogo.celulas = grid.flat();
  return dadosJogo.celulas;
}
