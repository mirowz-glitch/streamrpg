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

- Como uma classe é obtida, além do Hero Token?
- Existem múltiplas classes desde o início, ou uma progressão de
  desbloqueio?
- Classes afetam a fórmula de dano de Bosses (capítulo 6) — com que peso?

## Bosses (capítulo 6)

- Quem sai antes do Boss morrer recebe a recompensa de "vitória completa"
  (loot principal), ou só quem participou até o momento da morte?
- O timeout padrão de 90s do `SessionManager` é suficiente para a duração
  de uma luta de Boss, ou o combate precisa de tolerância própria a
  reconexão?
- Existe recompensa coletiva/de canal, além da individual?
- Quais tipos de recompensa entram no MVP: XP, Gold (seria o primeiro caso
  de gold saindo do caminho legado), Itens, Cosméticos, Hero Token?
- Confirmar: XP/gold seguem proporcionais à participação independente do
  resultado (fuga ou vitória), e só a chance de item depende de vitória?
- Qual modelo de escala (linear, logarítmica, por faixas) para vida do
  Boss, dano do Boss, e recompensa total?
- O dano do Boss contra jogadores escala com espectadores, não escala, ou
  escala parcialmente?
- Existe teto na recompensa total, independente do tamanho do canal?
- Existe ranking de contribuição na luta?
- Existe um "MVP" (jogador) com recompensa própria, além da distribuição
  proporcional?
- Qual a fórmula final de dano (`Base × Equipamentos × Classe × Critical`)
  quando Equipamentos/Classe tiverem valores numéricos definidos?

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
- Hero Token pode circular no Marketplace antes do resgate, ou é
  intransferível até resgatar?
- Como funciona exatamente o "token de classe"?
- Como medir e controlar inflação?
- Hero Token pode ser recompensa de Boss (ver capítulo 6), ou fica
  reservado só para referral?

## Marketplace (capítulo 11)

- Como o preço é definido — leilão, preço fixo pelo vendedor, ou outro
  modelo?
- Existe taxa do reino? Qual percentual?
- Existe formato de leilão, ou só venda direta?
- O que constitui manipulação de preço/lavagem de ouro, e que sinais
  auditar (ligado à frente de Exploits da Auditoria de Plataforma,
  capítulo 12)?
