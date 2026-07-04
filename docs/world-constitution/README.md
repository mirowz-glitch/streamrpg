# StreamRPG — Constituição do Mundo v0.1

**Documento de Prioridade Máxima.**

Este documento possui prioridade absoluta sobre qualquer decisão de design,
lore, narrativa, criaturas, cidades, reinos, sistemas ou quests — inclusive
sobre a [Game Design Bible](../game-design-bible/README.md), que continua
sendo a fonte de verdade para *arquitetura de código* (Progressão pertence
ao Character, EventBus, Repositories, etc.), mas nunca pode contradizer esta
Constituição em matéria de mundo/lore/narrativa.

Caso uma nova ideia entre em conflito com este documento, a ideia deve ser
adaptada para respeitá-lo — nunca o contrário.

## Filosofia em uma frase

> O objetivo do StreamRPG não é criar apenas um MMORPG. É criar um mundo que
> pareça existir muito antes do jogador nascer. Não queremos apenas
> jogadores. Queremos moradores.

## Capítulos

| # | Capítulo | Conteúdo |
|---|---|---|
| 1 | [Missão e Filosofia](01-missao-e-filosofia.md) | Missão, Filosofia Central, A Regra Mais Importante, O Jogador |
| 2 | [Magia e Evolução](02-magia-e-evolucao.md) | A Magia, Evolução |
| 3 | [Eras, Feras e Dragões](03-eras-feras-dragoes.md) | As Grandes Eras, As Grandes Feras, Os Dragões |
| 4 | [Conhecimento, História e Ciência](04-conhecimento-historia-ciencia.md) | O Conhecimento, A História, A Ciência |
| 5 | [Quests e Narrativa](05-quests-e-narrativa.md) | As Quests, A Emoção, O Humor |
| 6 | [Cidades e Aldeias](06-cidades-e-aldeias.md) | As Cidades, As Aldeias |
| 7 | [NPCs, Tempo, Profissões e Famílias](07-npcs-tempo-profissoes-familias.md) | Os NPCs, O Tempo, As Profissões, As Famílias |
| 8 | [Títulos e Ditados](08-titulos-e-ditados.md) | Os Títulos, Os Ditados |

Todos os capítulos têm o mesmo status: **✅ Fundacional** — não são hipóteses
de design, são regras permanentes. Uma regra só muda por revisão explícita
deste documento, nunca contornada silenciosamente em outro lugar (lore
ambiental, NPC design, código).

## Como isto se conecta ao resto do projeto

- [`docs/world-design/`](../world-design/) (rascunhos de regiões, cidades,
  NPCs, eventos, lore ambiental) deve respeitar esta Constituição. Onde um
  rascunho já existente conflitar com uma regra daqui, o rascunho é quem
  precisa ser ajustado.
- [`docs/game-design-bible/`](../game-design-bible/) continua sendo a fonte
  de verdade de arquitetura/sistemas (código). Esta Constituição nunca
  decide como o EventBus funciona — mas decide, por exemplo, que nenhuma
  quest pode existir só para gerar XP, ou que nenhum título pode ser
  genérico.

## Prompt Permanente (papel do Claude)

Você é o Diretor de Lore do StreamRPG. Sua função não é criar conteúdo
rapidamente — é construir uma civilização que pareça existir há milhares de
anos.

Antes de responder qualquer tarefa de lore/narrativa/mundo, reflita:

1. Isso parece algo criado para um videogame ou algo que realmente poderia existir?
2. Isso fortalece a identidade do mundo?
3. Isso cria memória ou apenas conteúdo?
4. Isso poderia acontecer em qualquer MMORPG? Se sim, reescreva.
5. Existe cultura, tradição e consequência?
6. O jogador sentirá que esse mundo continua vivendo sem ele?

Sempre priorize coerência, humanidade, profundidade cultural e continuidade
histórica. Nunca escolha a solução mais fácil se existir uma solução mais
memorável.
