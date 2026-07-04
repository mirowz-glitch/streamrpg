# Game Design Bible — Perguntas em aberto

Backlog de perguntas de design ainda sem resposta, organizado por capítulo.
Só organiza — nenhuma pergunta é respondida aqui. Débitos técnicos já
documentados com plano de resolução (bug do RNG compartilhado, UI-001,
exceção do `isChannelLive`) não entram nesta lista — eles já têm um destino
registrado nos capítulos 2, 5 e 10; isto aqui é só para o que ainda não tem
nem uma direção.

## Personagens (capítulo 3)

- Existem atributos além de level (força, sorte, etc.)?
- Múltiplos personagens por conta?
- Identidade visual/customização do personagem?

## Classes (capítulo 4)

**Resolvido — Sprint "Classes Architecture (Final Design)".** As 3
perguntas que estavam aqui (via de obtenção além do Hero Token; classes
desde o início ou desbloqueio progressivo; peso na fórmula de dano de
Boss) estão todas respondidas em
[`docs/design/classes-final-architecture.md`](../design/classes-final-architecture.md).
Removidas desta lista.

## Bosses (capítulo 6)

Design fechado (todos os 6 blocos decididos, MVP consolidado). Resta apenas:

- Valores reais dos tiers de escala (vida/recompensa por faixa) — os
  números atuais são ilustrativos, a calibrar com dados de playtest.

A fórmula final de dano (`Base × Equipamentos × Classe × Critical`) não
está mais em aberto — `Classe_mult` tem valores reais definidos em
`docs/design/classes-final-architecture.md`, Etapa 7. Falta apenas a
implementação (ver `docs/design/technical-roadmap.md`), não mais design.

## Quests (capítulo 7)

Capítulo inteiro em aberto — nenhuma pergunta de design foi formulada
ainda. Precisa do mesmo processo bloco a bloco usado em Bosses.

## Kingdoms (capítulo 8)

- Kingdom precisa de outro agregado de dados (sharding)?
- Capítulo inteiro em aberto além dessa — nenhuma outra pergunta de design
  foi formulada ainda.

## Seasons (capítulo 9)

Capítulo inteiro em aberto — nenhuma pergunta de design foi formulada
ainda.

## Economia (capítulo 10)

- Como corrigir exatamente o bug de RNG compartilhado (dois rolls
  independentes — detalhes de implementação não definidos)?
- Quais os novos valores de `DROP_CHANCE` e pesos de raridade?
- Quais mecanismos de sink existem (craft, fusão, taxa de listagem, etc.)?
- Como medir e controlar inflação?

Hero Token (circulação no Marketplace, "classe exclusiva") não está mais
em aberto — resolvido em
`docs/design/classes-final-architecture.md`, Etapa 8.

## Marketplace (capítulo 11)

- Como o preço é definido — leilão, preço fixo pelo vendedor, ou outro
  modelo?
- Existe taxa do reino? Qual percentual?
- Existe formato de leilão, ou só venda direta?
- O que constitui manipulação de preço/lavagem de ouro, e que sinais
  auditar (ligado à frente de Exploits da Auditoria de Plataforma,
  capítulo 12)?
