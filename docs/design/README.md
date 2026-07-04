# StreamRPG — Long-Term Progression Design

Sprint: **Long-Term Progression (Design Bible)**. Documentação pura — nenhuma
linha de gameplay, schema, componente ou rota foi alterada para produzir
estes documentos.

## O que esta pasta é, e o que ela não é

`docs/game-design-bible/` continua sendo a fonte da verdade **por sistema**
(Vision, Principles, Characters, Classes, Progression, Bosses, Quests,
Kingdoms, Seasons, Economy, Marketplace, Roadmap, Events, Architecture).
Esta pasta, `docs/design/`, não substitui nenhum capítulo dela — é uma
**lente horizontal** sobre todos eles, respondendo a uma pergunta que
nenhum capítulo individual responde sozinho:

> "Por que alguém jogaria StreamRPG durante 500 horas?"

Onde um capítulo da Bible já é ✅ Estável (Vision, Principles, Progression,
Bosses, Roadmap, Events, Architecture), estes documentos **nunca o
contradizem** — apenas o leem através do eixo tempo/horas de jogo. Onde um
capítulo ainda é 🚧 Em discussão ou 📌 Placeholder (Classes, Quests,
Kingdoms, Seasons, Economy, Marketplace), estes documentos propõem
estrutura e ordem, mas nunca fecham a decisão em nome desses capítulos —
isso continua sendo trabalho de uma Sprint de Design dedicada a cada um,
seguindo o mesmo processo bloco-a-bloco já usado em Bosses (capítulo 6).

## Documentos desta Sprint

| # | Documento | Responde |
|---|---|---|
| 1-2 | [progression-map.md](progression-map.md) | Mapa completo da progressão + fases (primeiras horas → 1000h) |
| 3 | [goals-inventory.md](goals-inventory.md) | Tudo que hoje pode virar objetivo de longo prazo |
| 4 | [progression-tree.md](progression-tree.md) | Árvore de dependência: o que vem antes de quê, o que é MVP vs. DLC |
| 5-6 | [risks-and-mitigations.md](risks-and-mitigations.md) | Riscos de progressão de 500+ horas e soluções arquiteturais |
| 7 | [identity-and-differentiation.md](identity-and-differentiation.md) | O que torna StreamRPG diferente de Taskbar Hero/Melvor/RuneScape/Ragnarok/PoE/Diablo/IdleMMO |
| 8 | [vision-2.0.md](vision-2.0.md) | "O que é StreamRPG?", em poucas linhas |
| 9 | [long-term-roadmap.md](long-term-roadmap.md) | MVP → MVP+ → Season 1 → Season 2 → Expansion 1 → Expansion 2 (ordem, não datas) |
| 10 | [streamrpg-core-pillars.md](streamrpg-core-pillars.md) | Pilares que nunca podem ser quebrados |

## Sprint seguinte: Classes Architecture (Final Design)

O gargalo nomeado nesta Sprint (Classes bloqueando Boss/builds/Hero Token)
foi fechado em design na Sprint seguinte:

| Documento | Responde |
|---|---|
| [classes-final-architecture.md](classes-final-architecture.md) | Arquitetura final de Classes — identidade, arquétipos, `Classe_mult`, Hero Token, tudo fechado |
| [class-dependency-map.md](class-dependency-map.md) | Diagrama de dependência + análise documento-a-documento do que precisa/não precisa mudar |

Classes deixou de ser Placeholder em design (não em código) — ver a
auditoria final desses dois documentos.

## Método

Antes de escrever qualquer linha, os seguintes documentos foram relidos
por completo: as 17 páginas de `game-design-bible/` (incluindo
`consistency-report.md` e `open-questions.md`), as 9 de `gameplay-design/`,
as 3 de `combat-model/`, as 12 de `world-design/` (incluindo
`world-design-review.md` e `future-expansion.md`), e as 21 de
`reviews/`+`technical-design/` — 62 documentos no total. Nenhum fato deste
documento foi inventado; onde uma lacuna real foi encontrada (ex.: Classes
ainda Placeholder bloqueando o multiplicador de dano do Boss), ela é
citada como lacuna, não preenchida com um número arbitrário.

## Auditoria final

**Pergunta:** "Se eu contratar cinco programadores amanhã, eles
conseguiriam desenvolver o jogo inteiro usando apenas esta documentação?"

**Resposta:** Para o próximo passo real do Roadmap (Sprint Boss Tier
Scaling → Classes → Quests, nessa ordem — ver
[progression-tree.md](progression-tree.md) e
[long-term-roadmap.md](long-term-roadmap.md)), **sim**: a ordem de
dependência é inequívoca, os riscos têm mitigação arquitetural proposta
(não só o nome do risco), e os 6 pilares em
[streamrpg-core-pillars.md](streamrpg-core-pillars.md) dão critério
objetivo para julgar qualquer decisão futura sem precisar me perguntar de
novo.

Para o jogo **inteiro** dos próximos 2 anos (Season 2/Expansion 2), a
resposta honesta é **ainda não, e não deveria ser** — pelo próprio
princípio que a Game Design Bible já segue (README dela: "funcionalidades
que ainda não existem começam como placeholder e só ganham conteúdo real
quando entram de fato numa Sprint, nunca especulativamente"). Cinco
programadores não deveriam começar a implementar Marketplace ou Season 2
hoje mesmo se pudessem — a ordem correta (documentada em
[progression-tree.md](progression-tree.md)) é BossSystem → Classes →
QuestSystem → Kingdoms → Economia 1.0 → Marketplace, cada um desenhado
bloco-a-bloco no seu momento, não todos de uma vez agora. **Isso não é uma
lacuna desta Sprint — é a mesma disciplina que já rege todo o resto do
projeto.** O critério de sucesso real não é "documentar os próximos 2 anos
em detalhe de implementação," e sim "garantir que ninguém precisa
adivinhar a ordem, os riscos, ou os limites" — isso este conjunto de
documentos entrega.
