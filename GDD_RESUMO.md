# Floresta em Jogo — GDD Resumo

## Conceito
Simulador de estratégia e gestão ambiental na Amazônia.
Mapa 10x10 = 100 células. Objetivo: recuperar 80% do território.
Sem limite de tempo. 1 ciclo = 10 segundos reais. 6 ciclos = 1 mês.

## Condição de Vitória
- 80%+ células em estado Recuperado
- Zero garimpos ativos
- Zero queimadas ativas

## Condições de Derrota
- Financeira: saldo zero sem empréstimo disponível
- Ecológica: 60%+ território destruído
- Social: Terra Indígena dizimada

## Capital Inicial por Dificuldade
- Fácil: $15.000
- Médio: $12.000
- Difícil: $9.000

## Distribuição do Mapa (Médio)
- 81 Degradado, 2 Garimpo, 4 Pecuária, 1 Queimada
- 1 Terra Indígena, 7 Rio, 2 Pioneira, 1 Secundária, 1 Clímax

## Tipos de Célula
degradado | preparado | contaminado | pioneira | secundaria | 
climax | saf_proprio | saf_parceiro | garimpo | pecuaria | 
rio_degradado | rio_recuperado | rio_poluido | indigena | 
queimada | viveiro

## Fluxo de Restauração
1. Preparar Terra: $200, 2 ciclos → Preparado
2. Plantar Mudas: 10 mudas → Pioneira
3. Automático: 36 ciclos → Secundária
4. Automático: 60 ciclos → Clímax

## Célula Contaminada (ex-garimpo)
1. Descontaminar: $400, 3 ciclos → Degradado
2. Seguir fluxo normal

## Recursos
- Água: global, produzida por rio recuperado (+5/ciclo) e bomba (+10)
- Energia: gerador diesel (+10, custa $20/ciclo), solar (+5), PCH (+15)
- Mudas: produzidas pelo viveiro (100 a cada 6 ciclos)
- Energia consome: viveiro (5/ciclo), bomba (3/ciclo)

## Equipe (salário/ciclo)
- Técnico Florestal: $30 — -15% tempo sucessão, obrigatório no viveiro
- Negociador: $35 — obrigatório para garimpo e TI
- Brigadista: $25 — -25% tempo combate incêndio

## Sistema de Farol
- Vermelho: hostil, expande 25% chance a cada 4 ciclos
- Amarelo: negociando, expansão pausada
- Verde: parceiro, gera receita

## NPCs — Perfis
Pecuaristas (5 perfis): Tradicionalista, Visionária, Herdeiro, 
Político, Cooperativa
Garimpeiros (3 perfis): Novato, Sem Opção, Veterano
Terra Indígena (2 perfis): Liderança Tradicional, Liderança Jovem

## Receitas Passivas
- SAF Próprio: $80/ciclo
- SAF Parceiro: $40/ciclo
- Crédito de Carbono: $25/ciclo por célula Clímax (mín. 3 conectadas)
- Edital (evento): $15.000 único

## Empréstimo Único
- Valor: $5.000 quando saldo = zero
- 10 parcelas de $650 a cada 6 ciclos
- Recusar = Game Over imediato

## Fauna (12 cards)
Comuns: Saúva, Abelha Jataí, Morcego Fruteiro, Jacaré-açu, Preguiça
Incomuns: Cutia, Tucano, Pacu/Tambaqui, Harpia
Raros: Anta, Boto
Lendário: Onça-pintada (aparece com vitória)

## Incêndios
- fireRisk por célula (0.0 a 1.0)
- Propagação Moore (8 vizinhos), 40%/ciclo
- Combate: $400 + 20 água
