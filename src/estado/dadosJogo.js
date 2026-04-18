const dadosJogo = {
  saldo: 12000,
  agua: 0,
  energia: 0,
  mudas: 0,
  cicloAtual: 0,
  mesAtual: 1,
  dificuldade: 'medio',
  emprestimoUsado: false,
  emprestimoAtivo: false,
  parcelasRestantes: 0,
  celulas: [],
  npcs: {},
  equipe: { tecnicos: 0, negociadores: 0, brigadistas: 0 },
  construcoes: [],
  faunaDesbloqueada: [],
  receitaPorCiclo: 0,
  custoPorCiclo: 0,
  jogoAtivo: false,
  estadoFarol: {}
};

export default dadosJogo;
