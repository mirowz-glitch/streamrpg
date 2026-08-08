# StreamRPG — Game Design Bible v1

> Em qualquer matéria de mundo/lore/narrativa, a
> [Constituição do Mundo](../world-constitution/README.md) tem prioridade
> absoluta sobre este documento. Esta Bible continua sendo a fonte de
> verdade para arquitetura/sistemas de código.

Documento vivo, dividido em capítulos. Cada capítulo cresce de forma
independente — capítulos de features ainda não construídas (Bosses, Quests,
Kingdoms, Seasons) começam como placeholder com poucas linhas e ganham corpo
conforme forem definidos, não antes.

Regra de uso: antes de começar o código de qualquer feature nova, as
perguntas de design daquela feature são respondidas e registradas no
capítulo correspondente. O código só começa depois. Se uma decisão de design
conflitar com um Princípio Permanente (capítulo 2), o princípio vence — ou é
revisto explicitamente ali, nunca contornado silenciosamente no código. Se
uma decisão conflitar com a Filosofia (capítulo 0), a Filosofia vence sempre
— ela está acima até do capítulo 2, não ao lado dele.

**Nota (2026-07-31):** o capítulo 0 (Filosofia) foi escrito depois da Sprint
"Foundation Refactor" que redefiniu StreamRPG como um MMORPG Idle
independente da Twitch (ver `docs/design/world-foundation-4.0.md` e os 13
documentos irmãos dele). Os capítulos 1 (Visão), 8 (Kingdoms), 9 (Seasons) e
12 (Roadmap) ainda descrevem, total ou parcialmente, o estado anterior a
essa Sprint e estão marcados como desatualizados/históricos — não foram
reescritos por completo nesta passagem porque não fazia parte do escopo
pedido; uma futura passagem de consistência da Bible (no mesmo espírito da
auditoria de 2026-07-01, ver `consistency-report.md`) deveria reconciliá-los
com o capítulo 0 e com `docs/design/kingdom-domain-2.0.md`.

**A sequência oficial de Sprints da era Kingdom/World-Foundation (tudo a
partir de Identity Core) vive exclusivamente em
[`docs/design/new-roadmap.md`](../design/new-roadmap.md).** Nenhum capítulo
desta Bible declara essa ordem de forma independente — o capítulo 12
(Roadmap) cobre só a sequência histórica até Marco 1.0 e aponta
explicitamente para o documento acima a partir dali. Se algum capítulo
futuro precisar mencionar em que ordem um sistema é construído, ele deve
citar `new-roadmap.md`, nunca reafirmar uma ordem própria.

## Capítulos

| # | Capítulo | Status |
|---|---|---|
| 0 | [Filosofia](00-philosophy.md) | ✅ Estável |
| 1 | [Visão do jogo](01-vision.md) | ⚠️ Desatualizado — escrito antes do pivot de independência da Twitch (2026-07-31); ver nota abaixo |
| 2 | [Princípios permanentes](02-principles.md) | ✅ Estável |
| 3 | [Personagens](03-characters.md) | 🚧 Em discussão |
| 4 | [Classes](04-classes.md) | 📌 Placeholder |
| 5 | [Progressão](05-progression.md) | ✅ Estável |
| 6 | [Bosses](06-bosses.md) | ✅ Estável (MVP fechado) |
| 7 | [Quests](07-quests.md) | 📌 Placeholder |
| 8 | [Kingdoms](08-kingdoms.md) | 📌 Placeholder |
| 9 | [Seasons](09-seasons.md) | 📌 Placeholder |
| 10 | [Economia](10-economy.md) | 🚧 Em discussão |
| 11 | [Marketplace](11-marketplace.md) | 🚧 Em discussão |
| 12 | [Roadmap](12-roadmap.md) | 🗂️ Histórico — vigente só até Marco 1.0; sequência atual em `docs/design/new-roadmap.md` |
| 13 | [Eventos](13-events.md) | ✅ Estável |
| 14 | [Arquitetura](14-architecture.md) | ✅ Estável |

Legenda: ✅ Estável (decisão permanente) · 🚧 Em discussão (parcialmente
decidido, pode mudar) · 📌 Placeholder (nada decidido ainda) · ⚠️
Desatualizado (descreve um estado que já mudou, precisa de revisão) · 🗂️
Histórico (válido como registro do passado, não como guia atual).

## Documentos de apoio

- [open-questions.md](open-questions.md) — backlog de perguntas de design
  ainda sem resposta, organizado por capítulo. Só lista, não responde.
- [consistency-report.md](consistency-report.md) — auditoria de
  consistência entre capítulos: o que está sólido, o que depende de outro
  capítulo, o que pode gerar retrabalho, o que já é regra permanente, o
  que ainda é hipótese. Refeita sempre que fizer sentido revalidar a Bible
  inteira, não só quando um capítulo novo for escrito.

## Três fontes da verdade

1. **Código** → como o sistema funciona.
2. **Game Design Bible** (este documento) → como o jogo funciona.
3. **Princípios de Arquitetura** (capítulo 2) → por que o código foi
   construído dessa forma.

## Como manter este documento

- Capítulo por assunto, nunca um arquivo único — é assim que ele fica
  legível conforme cresce.
- Cada feature nova ganha conteúdo no seu capítulo só quando for
  efetivamente desenhada, não antes por especulação.
- Princípios Permanentes (capítulo 2) só mudam por decisão explícita, nunca
  por acúmulo silencioso de exceções no código.
- Atualize o **Status** de um capítulo sempre que uma decisão amadurecer ou
  for revista.
