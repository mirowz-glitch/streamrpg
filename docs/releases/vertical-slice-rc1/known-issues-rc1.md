# Known Issues — Vertical Slice RC1

Documento oficial de limitações conhecidas na baseline `2a5bfc4` (branch `release/vertical-slice-rc1`), registrado **antes** de qualquer distribuição a participantes externos, conforme exigido pelo Princípio Fundamental desta Sprint.

Cada item é classificado em exatamente uma categoria:

- **Bug** — comportamento que diverge do que o sistema deveria fazer, sem exceção (ver definição em [Issue Classification](../../playtesting/05-issue-classification-and-success-criteria.md)).
- **Limitação Conhecida** — o sistema funciona como projetado, mas tem um alcance/precisão menor do que o ideal.
- **Feature Futura** — funcionalidade planejada, ainda não implementada, honestamente sinalizada na interface como indisponível.

---

## Bugs

| # | Descrição | Onde | Impacto |
| --- | --- | --- | --- |
| ~~B1~~ | ~~RESOLVIDO (2026-07-26, Sprint "Adventure Session Persistence — RC1 Blocker"): o estado da sessão de Aventura (região, expedição/masmorra, timeline, estado de morte) agora vive num singleton a nível de módulo em `useAdventureSession.ts`, não mais num `useRef` local a `AdventurePage`. Navegação normal (Personagem/Inventário/Crônicas/Ranking/Mundo/Streamer e volta) preserva 100% do estado — verificado em navegador real com Dungeon ativa e com personagem morto. Um F5/reload de verdade (recarrega o módulo JS do zero) continua reiniciando região/masmorra — comportamento aceito e documentado, já que corrigir isso exigiria um novo sistema de save no backend, fora do escopo desta Sprint. Só a fidelidade de afixos de item em casos raros de troca de aba permanece como limitação menor, não crítica.~~ | `apps/web/src/hooks/useAdventureSession.ts` | ~~Crítico~~ → Resolvido |
| B2 | `apps/api` falha no typecheck em arquivos de um sistema de Engine em migração (`EventBus.test.ts`, `GameEngine.test.ts`, `SQLiteBossRepository.ts`, `SQLiteBossParticipationRepository.ts`, `SQLiteCharacterRepository.test.ts`) | `apps/api/src/engine/*`, `apps/api/src/infrastructure/SQLiteBoss*` | Nenhum impacto no jogo testado — pré-existente ao commit de congelamento (confirmado via `git diff`), não faz parte do código exercido pelo Vertical Slice, servidor roda normalmente via `tsx` |

## Limitações Conhecidas

| # | Descrição | Onde | Impacto esperado no playtest |
| --- | --- | --- | --- |
| L1 | Região Picos Congelados tem ~82% de mortalidade em condições normais | Aventura, regiões de dificuldade "Alta"/"Muito Alta" | Participantes provavelmente morrerão ao chegar lá — rotulado "Muito Alta" na ficha da região, mas a transição de risco é abrupta (achado do Player Retention Loop Sprint). Já rastreado como "Endgame Funnel Fix" no roadmap comercial |
| L2 | "Deserto de loot": trechos longos (~30 checkpoints observados) sem upgrade de equipamento sentido, mesmo com XP/checkpoints constantes | Aventura, meio de uma expedição longa | Participante pode sentir estagnação de recompensa mesmo continuando a progredir em nível |
| L3 | Diferenciação visual/textual entre "Elite" e "Mini-Boss" é sutil no HUD | Banners de encontro especial na Aventura | Um objetivo "Derrote um Mini-Boss" pode parecer não progredir enquanto Elites aparecem, gerando confusão sobre o que conta |
| L4 | Ranking global e Mundo mostram dados agregados do mesmo servidor de teste compartilhado entre participantes | `/app/ranking`, `/app/world` (só para quem fizer login) | Se dois participantes logarem com Twitch no mesmo ciclo, cada um verá vestígios da sessão do outro (Ranking, notícias do Reino) — não afeta quem testar sem login (maioria esperada, ver [Distribution Package](distribution-package.md)) |
| L5 | Ouro não tem função de gasto real (Mercador/Alquimista incompletos) | Cidade | Participante pode notar e perguntar "pra que serve o ouro" — resposta esperada: sistema de gasto ainda não implementado |
| L6 | Mensagem de login da página Crônicas é mais seca que a de Inventário/Mundo (não explica o que a página mostra) | `/app/chronicle` sem login | Fricção pequena — participante entende que precisa de login, mas não por quê |

## Features Futuras (honestamente sinalizadas na interface)

| # | Descrição | Como é comunicado hoje |
| --- | --- | --- |
| F1 | Mercador (comércio do Reino) | Prédio da Cidade rotulado "em construção" |
| F2 | Alquimista (poções e reagentes) | Prédio da Cidade rotulado "em construção" |
| F3 | Integração Twitch ativa (XP automático assistindo a uma live, Reino/Prestígio da comunidade) | Comunicado na Landing Page como "requer login Twitch", nunca apresentado como obrigatório |
| F4 | Identidade visual própria (hoje 100% emoji, sem paleta/fonte/logo dedicados) | Não comunicado explicitamente na interface — registrar aqui para que o moderador saiba responder se um participante perguntar |
| F5 | Efeitos sonoros e música | Ausentes, sem indicação na interface — mesmo tratamento que F4 |

## Known Integration Gaps (congelados — RC-1, Fase 3 de Integração)

Achados reais da Fase 3 (Integração) do Sprint RC-1 — Vertical Slice / Live Test (2026-08-07), que **não são bugs corrigíveis com uma mudança pontual**: cada um exigiria um novo sistema, um redesenho de modelo de dados, ou infraestrutura ainda não construída. Diferente da tabela de Bugs acima (achados do freeze audit de 2026-07-26), esta seção é específica da Fase 3 e existe para que nenhuma Sprint futura os redescubra do zero ou tente "corrigir" com um patch pontual fora de escopo.

**Regra**: estes itens ficam **congelados** até que uma Sprint dedicada os aborde explicitamente. Nenhuma Sprint deve reportá-los como "bug novo encontrado" nem tentar uma correção pontual — a correção real de cada um está descrita na coluna "O que a correção real exige".

| # | Descrição | Onde | O que a correção real exige |
| --- | --- | --- | --- |
| G1 | Multi-tab/multi-dispositivo duplica XP/Gold/Loot — `useAdventureSession.ts` dedupe é só por-módulo (uma aba); `/api/character/adventure/xp`, `/gold` e `/api/items/loot` aceitam qualquer delta do cliente sem token de idempotência nem trava de sessão ativa | `apps/web/src/hooks/useAdventureSession.ts`, `apps/api/src/routes/character.ts`, `apps/api/src/routes/items.ts` | Infraestrutura de sessão exclusiva por personagem + idempotência nas rotas de sync — um novo sistema, não um fix pontual |
| G2 | `BossSpawnSystem` (World Boss) falha em todo `world.tick` com `FOREIGN KEY constraint failed` para qualquer sessão cujo `channelId` não existe em `streamer_channels` — confirmado ao vivo, repete continuamente durante toda a sessão | `apps/api/src/systems/BossSpawnSystem.ts`, `apps/api/src/infrastructure/SQLiteBossRepository.ts` | Redesenho do modelo de canal do World Boss pós-desacoplamento do Twitch — já nomeado como gap da "World Events Sprint" desde World Autonomy Phase II (2026-08-01) |
| G3 | UI usa um objeto `Equipment` local desatualizado para textos de feedback ("loot rejeitado", power score mostrado) — nunca é sincronizado após transações de Cidade (Blacksmith/Merchant/Salvage); combate real não é afetado (usa `realCombatSnapshot`, sempre correto) | `apps/web/src/hooks/useAdventureSession.ts` (`session.character.equipment`) | Sincronizar o objeto Equipment local com o estado real do personagem, ou eliminar essa cópia local em favor do Combat Snapshot em todo lugar — mudança arquitetural, não um fix pontual |
| G4 | Sincronização de XP/Gold com o servidor é fire-and-forget sem retry — uma falha de rede pontual descarta o delta daquele tick permanentemente | `apps/web/src/hooks/useAdventureSession.ts` (`persistTick`) | Fila de retry ou sincronização baseada em confirmação — já documentado no próprio código como gap conhecido |
| G5 | Janela residual "Boss derrotado mas Dungeon marca Falha" em Fortaleza Sombria — já reduzida de ~90 para ~12 encontros numa Sprint anterior, não eliminada; morrer nesse trecho pós-boss faz perder o banner/bônus de conclusão da Dungeon mesmo já tendo a recompensa do boss | `packages/shared/src/expeditions/expeditionDefinitions.ts`, `packages/shared/src/dungeon/dungeonController.ts` | Desacoplar "Boss derrotado" de "Dungeon completada" no estado da expedição — mudança de modelo de estado, não um ajuste de número |

---

## Como usar este documento

- **Antes de distribuir a build**: o moderador deve ler este documento por completo (ver [Distribution Package](distribution-package.md) e [Communication Guide](distribution-package.md#communication-guide)).
- **Durante um playtest**: se um participante encontrar algo que pareça um bug novo (não listado aqui), classificar segundo [Issue Classification](../../playtesting/05-issue-classification-and-success-criteria.md) e nunca corrigir na hora (ver Princípio Fundamental: "Não deve misturar funcionalidades parcialmente concluídas").
- **Ao final de um ciclo**: revisar se algum item aqui foi confirmado, contradito ou tornou-se irrelevante, e atualizar este documento antes de definir a próxima RC (ver [Acceptance Criteria](acceptance-criteria.md)).
