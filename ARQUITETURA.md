# Floresta em Jogo — Arquitetura Técnica

## Regras Invioláveis
- Toda interface (HUD, menus, modais, cards) em HTML/CSS
- Phaser renderiza APENAS tiles do mapa — zero interface
- Nenhum arquivo ultrapassa 400 linhas
- Botões inseridos dinamicamente usam onclick="window.funcao()" — nunca addEventListener após innerHTML
- dadosJogo é importado, nunca redefinido em outro arquivo
- loop.js chama os sistemas — sistemas não se chamam entre si

## Estrutura de Arquivos
floresta-em-jogo/
├── index.html
├── design-system.css
├── ARQUITETURA.md
├── DESIGN_SYSTEM.md
├── GDD_RESUMO.md
├── src/
│   ├── main.js              — inicializa Phaser, máx 50 linhas
│   ├── loop.js              — loop de ciclos, chama sistemas em ordem
│   ├── estado/
│   │   ├── dadosJogo.js     — objeto central de estado (export default)
│   │   ├── recursos.js      — produção/consumo/salários
│   │   ├── celulas.js       — ações no mapa, sucessão ecológica
│   │   ├── npcs.js          — perfis, farol, negociação
│   │   ├── eventos.js       — eventos aleatórios, incêndios
│   │   └── fauna.js         — cards e condições de desbloqueio
│   ├── mapa/
│   │   ├── cena.js          — cena Phaser, só renderiza tiles
│   │   ├── gerador.js       — geração procedural do mapa
│   │   └── tiles.js         — mapeamento tipo/estado → cor
│   └── interface/
│       ├── hud.js           — atualiza HTML do HUD
│       ├── menuCelula.js    — menu flutuante ao clicar célula
│       ├── modalNpc.js      — modal de diálogo NPC
│       └── cards.js         — animação de cards de fauna
└── assets/

## O Objeto dadosJogo (fonte única de verdade)
```javascript
{
  saldo: 12000,          // Capital atual
  agua: 0,               // Estoque global de água
  energia: 0,            // Energia disponível/ciclo
  mudas: 0,              // Estoque de mudas
  cicloAtual: 0,         // Contador de ciclos (1 ciclo = 10s)
  mesAtual: 1,           // 6 ciclos = 1 mês
  dificuldade: 'medio',  // 'facil' | 'medio' | 'dificil'
  emprestimoUsado: false,
  emprestimoAtivo: false,
  parcelasRestantes: 0,
  celulas: [],           // Array[100] — estado de cada célula
  npcs: {},              // NPCs por id
  equipe: { tecnicos: 0, negociadores: 0, brigadistas: 0 },
  construcoes: [],
  faunaDesbloqueada: [],
  receitaPorCiclo: 0,
  custoPorCiclo: 0,
  jogoAtivo: false,
  estadoFarol: {}        // estado do farol de cada NPC
}
```

## Loop de Ciclos — Ordem Obrigatória
1. processarProducao()    — recursos.js
2. processarConsumo()     — recursos.js
3. pagarSalarios()        — recursos.js
4. avançarTimers()        — celulas.js
5. verificarSucessao()    — celulas.js
6. verificarNPCs()        — npcs.js
7. verificarEventos()     — eventos.js
8. verificarFauna()       — fauna.js
9. verificarVitoria()     — loop.js
10. atualizarInterface()  — hud.js

## Comunicação Phaser ↔ HTML
- Phaser → HTML: document.dispatchEvent(new CustomEvent('celulaSelecionada', { detail: { celulaId, x, y } }))
- HTML → Phaser: window.executarAcao(acao, celulaId)

## Fases de Desenvolvimento
- Fase 1 ✅ — Esqueleto e HUD
- Fase 2 — Mapa 10x10 clicável
- Fase 3 — Recursos e ciclo econômico
- Fase 4 — Ações no mapa
- Fase 5 — NPCs e sistema de farol
- Fase 6 — Terra Indígena
- Fase 7 — Incêndios e eventos
- Fase 8 — Fauna
- Fase 9 — Vitória, derrota e pontuação
- Fase 10 — Polimento e balanceamento
