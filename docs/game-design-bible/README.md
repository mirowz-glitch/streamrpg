# StreamRPG — Game Design Bible v1

Documento vivo, dividido em capítulos. Cada capítulo cresce de forma
independente — capítulos de features ainda não construídas (Bosses, Quests,
Kingdoms, Seasons) começam como placeholder com poucas linhas e ganham corpo
conforme forem definidos, não antes.

Regra de uso: antes de começar o código de qualquer feature nova, as
perguntas de design daquela feature são respondidas e registradas no
capítulo correspondente. O código só começa depois. Se uma decisão de design
conflitar com um Princípio Permanente (capítulo 2), o princípio vence — ou é
revisto explicitamente ali, nunca contornado silenciosamente no código.

## Capítulos

| # | Capítulo | Status |
|---|---|---|
| 1 | [Visão do jogo](01-vision.md) | ✅ Estável |
| 2 | [Princípios permanentes](02-principles.md) | ✅ Estável |
| 3 | [Personagens](03-characters.md) | 🚧 Em discussão |
| 4 | [Classes](04-classes.md) | 📌 Placeholder |
| 5 | [Progressão](05-progression.md) | ✅ Estável |
| 6 | [Bosses](06-bosses.md) | 🚧 Em discussão |
| 7 | [Quests](07-quests.md) | 📌 Placeholder |
| 8 | [Kingdoms](08-kingdoms.md) | 📌 Placeholder |
| 9 | [Seasons](09-seasons.md) | 📌 Placeholder |
| 10 | [Economia](10-economy.md) | 🚧 Em discussão |
| 11 | [Marketplace](11-marketplace.md) | 🚧 Em discussão |
| 12 | [Roadmap](12-roadmap.md) | ✅ Estável |
| 13 | [Eventos](13-events.md) | ✅ Estável |
| 14 | [Arquitetura](14-architecture.md) | ✅ Estável |

Legenda: ✅ Estável (decisão permanente) · 🚧 Em discussão (parcialmente
decidido, pode mudar) · 📌 Placeholder (nada decidido ainda).

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
