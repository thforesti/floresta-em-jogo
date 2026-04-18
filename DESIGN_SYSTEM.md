# Floresta em Jogo — Design System

## Estilo Visual
HQ/Ilustrado + Stardew Valley: bordas espessas escuras, 
sombra com deslocamento (offset), paleta quente e orgânica.

## Fontes (Google Fonts — já no index.html)
- Títulos: 'Fredoka One' → var(--fonte-titulo)
- Corpo: 'Nunito' 400/600/700/800 → var(--fonte-corpo)
- NUNCA usar Arial, Inter, Roboto ou outras fontes

## Regras Visuais HQ
- Toda borda usa --borda-hq (2.5px) ou --borda-hq-forte (3.5px)
- Toda sombra usa --sombra-hq-sm/md/lg (offset fixo, sem blur)
- Botões: hover = translate(-1px,-1px) + sombra maior
- Botões: active = translate(2px,2px) + sombra some

## Paleta Principal
--floresta-profunda: #1B4332  (HUD, painéis escuros)
--floresta-media:    #2D6A4F  (bordas, separadores)
--floresta-viva:     #40916C  (botão primário)
--floresta-clara:    #74C69D  (hover, destaques)
--floresta-palida:   #D8F3DC  (fundos claros)
--solo-queimado:     #6B2D0A  (botão perigo)
--solo-seco:         #BC6C25  (terra degradada, avisos)
--solo-preparado:    #DDA15E  (neutros quentes)
--solo-palido:       #FEFAE0  (fundo geral)

## Cores Semânticas (uso exclusivo)
--farol-verde:    #2DC653  (NPC parceiro — só farol)
--farol-amarelo:  #FFD166  (NPC negociando — só farol)
--farol-vermelho: #EF233C  (NPC hostil / alerta crítico)

## Cores dos Tiles (placeholder até arte chegar)
--tile-degradado:      #BC6C25
--tile-preparado:      #6B4423
--tile-contaminado:    #5C6672
--tile-pioneira:       #74C69D
--tile-secundaria:     #40916C
--tile-climax:         #1B4332
--tile-saf-proprio:    #95D5B2
--tile-garimpo:        #8B7355
--tile-pecuaria:       #A7C957
--tile-rio-degradado:  #8B9DAA
--tile-rio-recuperado: #48CAE4
--tile-rio-poluido:    #4A4E69
--tile-indigena:       #C77DFF
--tile-queimada:       #E63946
--tile-viveiro:        #B7E4C7

## Classes de Componentes (definidas em design-system.css)
- HUD: #hud-container, .hud-recurso, .hud-recurso__icone, 
       .hud-recurso__label, .hud-recurso__valor, .hud-recurso__delta
- Botões: .btn-primario, .btn-perigo, .btn-neutro
- Menu célula: #menu-celula, .menu-celula__titulo, 
               .menu-celula__estado, .menu-celula__acoes
- Modal NPC: #modal-npc, .modal-npc__card, .modal-npc__cabecalho,
             .modal-npc__avatar, .modal-npc__nome, .modal-npc__perfil,
             .modal-npc__farol (+ --verde/--amarelo/--vermelho),
             .modal-npc__fala, .modal-npc__opcoes
- Cards fauna: .card-fauna, .card-fauna__topo, .card-fauna__corpo,
               .card-fauna__nome, .card-fauna__cientifico, 
               .card-fauna__bonus, .card-fauna__raridade
               (+ --comum/--incomum/--raro/--lendario)
- Alertas: .alerta (+ --incendio/--seca/--saldo)
- Painel: #painel-lateral, .painel__secao-titulo

## Z-index (hierarquia)
--z-mapa:        0
--z-hud:       100
--z-painel:    200
--z-menu-celula:300
--z-modal:     400
--z-card-fauna:500
--z-alerta:    600
--z-game-over: 700
