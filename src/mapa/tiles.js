const CORES = {
  degradado:      { topo: '#BC6C25', lateral: '#7A3E0F' },
  preparado:      { topo: '#6B4423', lateral: '#3D2010' },
  contaminado:    { topo: '#5C6672', lateral: '#2E333A' },
  pioneira:       { topo: '#74C69D', lateral: '#2D6A4F' },
  secundaria:     { topo: '#40916C', lateral: '#1B4332' },
  climax:         { topo: '#1B4332', lateral: '#0D2218' },
  saf_proprio:    { topo: '#95D5B2', lateral: '#2D6A4F' },
  garimpo:        { topo: '#8B7355', lateral: '#4A3728' },
  pecuaria:       { topo: '#A7C957', lateral: '#5A7A1A' },
  rio_degradado:  { topo: '#8B9DAA', lateral: '#3D5060' },
  rio_recuperado: { topo: '#48CAE4', lateral: '#1A7A8A' },
  rio_poluido:    { topo: '#4A4E69', lateral: '#1E2035' },
  indigena:       { topo: '#C77DFF', lateral: '#6A2FA0' },
  queimada:       { topo: '#E63946', lateral: '#8B0000' },
  viveiro:        { topo: '#B7E4C7', lateral: '#2D6A4F' },
};

const FALLBACK = { topo: '#BC6C25', lateral: '#7A3E0F' };

export function getCorTile(type) {
  return CORES[type] || FALLBACK;
}
