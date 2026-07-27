# Living Character — Plano de Implementação (preparação para a Sprint 2)

**Status:** 🚧 Preparação — nenhum código deste plano foi escrito ainda. Escrito imediatamente após a Sprint "Idle Loop Implementation Phase I" (`docs/design/idle-experience-redesign.md`, Sprint 1 do roadmap), pra que a próxima Sprint (Living Character, Sprint 2) comece direto na implementação, sem rediscutir conceito.

Este documento não implementa nada — define COMO a tela de Personagem deve consumir o Idle Loop que a Sprint 1 acabou de entregar, com detalhe suficiente pra a próxima Sprint não precisar voltar a `idle-experience-redesign.md` Seção 5 pra tomar decisão nenhuma.

---

## 1. O que a Sprint 1 já entregou (base pronta pra usar)

- `useAdventureSession()` já expõe `hudState` completo (região, encontro, estatísticas, timeline, `sessionStatus`) — o mesmo hook que `AdventurePage` usa, e que **já sobrevive a qualquer navegação** (Adventure Session Persistence, Sprint anterior ao Idle Loop).
- `useIdleDriver()` (`apps/web/src/hooks/useIdleDriver.ts`) expõe `status: "running" | "paused" | "stopped"` — mas hoje só é instanciado DENTRO de `AdventurePage`. Ao navegar pra Personagem, essa instância é desmontada (o timer para) mesmo que a sessão (dados) continue viva.
- **Implicação direta pra Sprint 2**: a tela de Personagem pode ler `hudState` livremente (dado sempre atual, igual `AdventurePage` já faz) — mas se quiser também MOSTRAR/CONTROLAR o status do driver (rodando/pausado), vai precisar que o driver em si seja instanciado num nível que sobreviva à troca de página (ver Seção 4).

## 2. Painel "Em Aventura" — o que exibir

Direto da Seção 5 de `idle-experience-redesign.md`, já concretizado nos campos reais de `HudState` (nenhum campo novo necessário pro MVP):

| Elemento do painel | Campo de `HudState` já existente |
| --- | --- |
| Estado atual (explorando/combatendo/loot/boss/dungeon) | `hudState.sessionStatus` (`"explorando"` \| `"em-combate"` \| `"vitoria"` \| `"derrota"` \| `"encerrada"`) + `hudState.encounter` pra distinguir combate normal de chefe/dungeon |
| Região atual | `hudState.region` |
| Último loot | `hudState.recentEvents` (mesma timeline que `EventFeed` já usa na Aventura — filtrar pelo evento `LootDropped` mais recente) |
| Progresso até o próximo encontro | `hudState.expedition` (checkpoint atual/total) quando existe expedição ativa; caso contrário, `hudState.statistics.encountersCompleted` da sessão |
| Último combate | `hudState.recentEvents` filtrado pelos últimos eventos de combate (`AttackHit`/`EncounterCompleted`) |

Nenhum destes exige nova query, novo endpoint, ou novo campo em `HudState` — é reaproveitamento direto do que `AdventurePage` já lê.

## 3. Estados a Cobrir (mapeamento comportamental)

| Estado percebido | Como detectar | Onde já existe hoje |
| --- | --- | --- |
| Explorando | `sessionStatus === "explorando"` | Já existe |
| Combatendo | `sessionStatus === "em-combate"` | Já existe |
| Recebendo Loot | Evento `LootDropped` no tick mais recente de `recentEvents` | Já existe (`LootPopup` na Aventura usa a mesma fonte) |
| Boss | `hudState.expedition?.finalBoss` presente + encontro atual correspondente | Já existe (`FinalBossBanner`) |
| Dungeon | `hudState.expedition` com `isDungeon`/masmorra ativa | Já existe (`ExpeditionCard`) |
| Derrota | `sessionStatus === "derrota"` | Já existe |
| Pausado | **Novo pra este painel** — precisa do `status` do `IdleDriver` (ver Seção 4), não vem de `HudState` | Não existe fora de `AdventurePage` ainda |

Únicos dois estados que exigem trabalho novo na Sprint 2: **Pausado** (depende de expor o driver — Seção 4) e a **composição visual** dos estados acima num painel compacto (não uma cópia da HUD completa).

## 4. Decisão de Arquitetura Necessária Antes de Implementar

A Sprint 2 vai bater numa decisão que a Sprint 1 deliberadamente não tomou (fora de escopo dela): **onde o `IdleDriver` deve viver** pra que seu `status` (rodando/pausado) seja visível também na tela de Personagem.

Duas opções, ambas compatíveis com tudo que a Sprint 1 e as anteriores já construíram:

- **Opção A — Elevar o driver pra fora de `AdventurePage`** (ex.: um Context Provider no nível do `App`, ou um segundo módulo-singleton igual ao padrão já usado em `useAdventureSession.ts` pro estado da sessão). Prós: painel de Personagem reflete pause/resume em tempo real, mesmo padrão arquitetural já validado (singleton de módulo) pra persistência entre rotas. Contras: any lugar que hoje só lia `hudState` (read-only) passaria a também poder acionar o driver — precisa decidir se a tela de Personagem deve ou não ter seu próprio botão de pausar (provavelmente sim, dado o Princípio 3 do documento de design: "toda tela comunica o estado em <3s" inclui o controle, não só a leitura).
- **Opção B — Painel de Personagem só LÊ `hudState`, nunca consulta o driver.** Mais simples: mostra "Explorando"/"Combatendo"/etc. normalmente, mas NUNCA mostra "Pausado" enquanto o jogador estiver fora da Aventura (porque tecnicamente, fora da Aventura, não existe driver rodando pra pausar). Isso é honesto (não finge saber algo que não sabe) mas quebra a promessa do documento de design de que o painel deveria refletir "Pausado" também.

**Recomendação**: Opção A, pelo mesmo motivo que motivou mover `session`/`timeline` pra um singleton de módulo na Sprint "Adventure Session Persistence" — é o padrão já comprovado deste projeto pra "estado que precisa sobreviver a navegação". Não é uma mudança de escopo grande: é mover ~15 linhas de `useIdleDriver()` de dentro de `AdventurePage` pra um nível compartilhado, sem alterar a lógica do próprio `IdleDriver` (packages/shared, já pura e testada).

## 5. Princípios a Manter (do documento de UX, reafirmados aqui)

- **Nunca duplicar a HUD completa da Aventura.** O painel de Personagem é um resumo — região, estado, último loot, próxima ação. Nada de timeline completa, nada de barra de vida do inimigo.
- **Atualização em segundos, nunca manual.** Se o jogador está no Personagem enquanto o aventureiro luta, o painel reflete isso sem precisar de um "atualizar" — mesma garantia de tempo real que `HudState` já entrega na Aventura.
- **Nunca mostrar um estado desatualizado silenciosamente.** Se não existe sessão (nunca jogou, ou morreu e não reiniciou), o painel diz isso explicitamente — nunca fica em branco.

## 6. O Que NÃO Fazer Nesta Preparação (lembrete de escopo)

- Não desenhar a interface (cores, layout, componente React específico) — isso é implementação, pertence à Sprint 2 em si.
- Não implementar o Context/singleton da Seção 4 — só a decisão está registrada aqui.
- Não tocar Inventário/Cidade — pertencem às Sprints 3/4 do roadmap.

---

*Referência: `docs/design/idle-experience-redesign.md` Seção 5 (Personagem Vivo) e Seção 13 (Roadmap, Sprint 2). Esta preparação existe pra que a Sprint 2 comece direto na Fase de implementação.*
