# Inventário de Objetivos (Parte 3)

Tudo que hoje pode virar um objetivo de jogador de longo prazo. Sem
implementar nada — apenas organizar o que já existe (código ou design) e
marcar honestamente o que ainda não existe em lugar nenhum.

| Categoria | Estado hoje | Potencial como objetivo de 500h | Depende de |
|---|---|---|---|
| **Equipamentos** | 🟢 Existe: 6 slots, 5 raridades, comparação detalhada, "Poder Total" | Alto — já é o objetivo mais imediato e visível do jogo | Economia 1.0 (RNG bug trava raridade acima de comum) |
| **Coleções** | 🔴 Não existe nenhum conceito de "coletar todos os X" | Alto potencial, zero implementação — risco de "coleção sem valor" se não tiver propósito além de exibir (ver riscos) | Marketplace (dar valor de troca) e/ou Kingdom (exibição social) |
| **Bosses** | 🟢 Existe e é visível; só Tier 1 calibrado | Alto — já é o único evento coletivo do jogo | Escala (Sprint B5, nunca implementada) para Tiers 2+; Classes para a fórmula de dano completa |
| **Exploração** | 🔴 0% código; 🟠 design maduro (11 regiões, grafo, cidades, NPCs, lore) | Muito alto — é o conteúdo com mais volume já desenhado e pronto para virar Sprint | Combat Model precisa de Classes reais para a fórmula valer a pena |
| **Kingdom** | 🟡 Conceito real ("1 instância por canal"), mas nunca virou seu próprio documento; painel `/app/world` já expõe métricas agregadas reais | Muito alto — é o que diferencia StreamRPG de qualquer RPG solo (ver identity-and-differentiation.md) | Precisa que capítulo 8 da Bible saia de Placeholder; pergunta em aberto "Kingdom é só por canal ou pode cruzar canais" trava Seasons/Eventos globais |
| **Eventos** | 🔴 Não implementados; 🟠 105 eventos locais + ~11 eventos de mundo desenhados (World Design) | Médio-alto — risco real de repetição já auto-identificado no próprio World Design ("mundo vivo depende de frequência/mistura, não de quantidade") | Kingdom (escopo) e Seasons (eventos verdadeiramente globais) |
| **Ranking** | 🟢 Existe (posição, gap de XP, barra de progresso); espaço reservado para título futuro | Médio — bom para competição, risco real de toxicidade em escala (ver riscos) | Nada tecnicamente, mas precisa de mitigação de design antes de crescer |
| **Economia** | 🟡 Existe (Gold, Drop) mas com bug conhecido (RNG sempre comum) e zero sinks | Fundamental — quase todo outro objetivo desta lista depende de Economia 1.0 fechar primeiro | Nenhuma — é o próprio bloqueador de tudo abaixo dela |
| **Marketplace** | 🔴 Não existe | Alto para jogadores de 300h+ (trocar decisões antigas) | Economia 1.0 (ordem já decidida, Bible cap. 11 — nunca antes) |
| **Classes** | 🔴 Não existe (`class` não é coluna); 🟠 4 arquétipos em rascunho | Fundamental — bloqueia a fórmula de dano completa, a diferenciação real de build, e o "Hero Token → classe exclusiva" | Nenhuma técnica — é o gargalo mais citado em toda a documentação lida |
| **Craft** | 🔴 Não existe; mencionado 6+ vezes no World Design sem nenhuma receita/sistema definido | Médio — sink de itens/recursos, mas hoje é só uma palavra repetida, nunca desenhada | Economia 1.0 (sinks) |
| **Temporadas (Seasons)** | 🔴 Placeholder total | Alto para retenção de 1000h+ | Risco arquitetural real: eventos verdadeiramente globais colidem com "Kingdom = instância por canal" (ver riscos) |
| **Legado** | 🔴 Não existe em nenhum documento lido (hipótese só na memória do projeto, "Character Legacy") | Alto potencial para jogadores de 1000h+, mas 0 implementações reais até hoje — não deve ser promovido a decisão de design nesta Sprint | Economia 1.0 / Marketplace (valor de mercado de um personagem "com história") |

## Observações que não cabem na tabela

- **Equipamentos, Bosses e Ranking** são os únicos três desta lista que
  já são jogáveis hoje — todo o resto é, na melhor das hipóteses, design
  maduro sem código, ou apenas uma palavra repetida sem design nenhum
  (Craft).
- **Classes é o gargalo estrutural mais citado em toda a documentação
  pesquisada** — bloqueia o multiplicador de dano da fórmula canônica,
  os 4 arquétipos propostos, a diferenciação real de build, e o destino
  do Hero Token. Nenhum outro item desta lista tem tantas dependências
  apontando para ele. Ver [progression-tree.md](progression-tree.md).
- **Coleções** não aparece em nenhum documento existente como conceito —
  é a única categoria desta lista sem nenhum rascunho prévio. Antes de
  virar uma Sprint de design, precisa responder "coleção de quê" (itens?
  Bosses derrotados? regiões visitadas?) e "por que importa" (o próprio
  risco "coleções sem valor" da Parte 5 se aplica diretamente aqui).
- **Legado** é deliberadamente listado mas não expandido — já é uma
  hipótese registrada e propositalmente não promovida (ver memória do
  projeto). Esta Sprint não muda esse status.
