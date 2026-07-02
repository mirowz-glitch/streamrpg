# Design Técnico — BossSystem

**Status:** proposta para revisão. Nenhum código, nenhuma migration, nenhum
arquivo TypeScript foi criado. Este documento é a arquitetura, não a
implementação.

Baseado inteiramente no capítulo 6 (Bosses) da Game Design Bible, já
fechado, e na arquitetura real existente (EventBus, GameClock, GameEngine,
SessionManager, `engine/types.ts`, schema atual). Nada aqui foi inventado
sem base — cada decisão referencia o que já existe no código ou no
capítulo 6.

---

## 0. Achado crítico encontrado durante este design — ✅ RESOLVIDO (2026-07-01)

**Corrigido como sprint própria, isolada, antes da B4** (não misturado com
a implementação de recompensa — mesma disciplina de "uma sprint, uma
responsabilidade" usada em toda a migração). `XPGrantedEvent` agora tem
`source: "tick" | "welcome" | "boss"`; `DropSystem` só reage quando
`source === "tick"`. `XPSystemV2`/`WelcomeRewardSystem` atualizados para
declarar sua origem. Validado via harness isolado: `source="tick"` aciona
o `DropSystem` normalmente; `source="welcome"` e `source="boss"` não
acionam mais — 4/4 asserções, 0 erros. O bug real do Welcome Reward em
produção (duplo-roll de drop) está corrigido. A B4 já pode assumir que o
contrato existe, sem nenhuma lógica de compatibilidade própria.

Texto original do achado, mantido como histórico:

Ao desenhar como o BossSystem concederia XP de participação, encontrei uma
lacuna real e **pré-existente**, não causada por este design, mas que ele
expõe: `XPGrantedEvent` (`engine/types.ts`) não tem nenhum campo de origem.
`DropSystem` se inscreve em `xp.granted` **incondicionalmente** — qualquer
emissor desse evento aciona o roll de drop normal (15% de chance), além de
qualquer recompensa própria que esse emissor já dê.

Isso significa que **`WelcomeRewardSystem`, hoje, em produção, já causa um
roll de drop bônus toda vez que concede o XP de boas-vindas** — ninguém
notou isso até agora porque nunca foi verificado sob esse ângulo. Se o
`BossRewardSystem` também emitir `xp.granted` da forma óbvia, todo
personagem que ganhar XP de participação em uma luta de Boss também
rolaria um segundo drop do pool comum, além do loot dedicado do Boss —
efetivamente duplicando a chance de item para quem participa de Boss.

**Recomendação (não implementada, pendente de decisão):** adicionar um
campo `source: "tick" | "welcome" | "boss"` a `XPGrantedEvent`, e fazer
`DropSystem` só reagir quando `source === "tick"`. Isso resolve o caso do
Boss e corrige, de brinde, o caso do Welcome Reward que já está em
produção. Alternativa seria aceitar o duplo-roll como uma mecânica
intencional ("qualquer XP tem chance de item bônus") — mas isso nunca foi
decidido em nenhum capítulo da Bible, então não posso assumir que é
desejado.

Este achado bloqueia o Sprint B4 (Recompensas) até ser decidido — não
bloqueia B1-B3.

**Auditoria de consumidores feita (2026-07-01):** busquei todos os
`bus.subscribe("xp.granted", ...)` no código de produção. Resultado:
**`DropSystem` é o único consumidor real hoje.** Os únicos outros hits são
`EventBus.test.ts` (testes do próprio EventBus, não consumidores de
jogo) e os dois emissores já conhecidos (`XPSystemV2`, `WelcomeRewardSystem`).
Não existe nenhum terceiro System escondido dependendo do formato atual do
evento — a mudança proposta (adicionar `source`) tem exatamente um
consumidor a ajustar.

---

## 1. Fluxo completo de eventos

### Eventos novos

| Evento | Escopo | Payload | Publica | Consome |
|---|---|---|---|---|
| `boss.spawned` | World | `channelId, bossId, tier, spawnedAt, invocationDeadline` | `BossSpawnSystem` | Nenhum no MVP — existe para o Frontend Event Bridge futuro (botão "Invocar Boss") |
| `boss.defeated` | World | `channelId, bossId, timestamp` | `BossCombatSystem` | `BossRewardSystem` |
| `boss.escaped` | World | `channelId, bossId, timestamp` | `BossCombatSystem` | `BossRewardSystem` |

### Evento já existente, reaproveitado sem alteração

`boss.activated` (`BossActivatedEvent`, já em `engine/types.ts` desde
antes desta Sprint) — publica `BossSpawnSystem` quando o streamer invoca
ou o timeout de invocação expira. Consome `BossCombatSystem` (começa a
processar a luta).

### Eventos de Gameplay reaproveitados, não novos

`xp.granted` e `drop.granted` — a concessão de recompensa de Boss usa
exatamente os mesmos eventos que XP/Drop normais já usam (ver ressalva na
seção 0). Não criei `boss.rewarded`: a recompensa já é observável através
desses dois eventos existentes: um evento agregador só teria valor para o
Frontend Event Bridge, que não existe ainda — fica como candidato na seção
7, não como parte do MVP.

### Deliberadamente sem evento

**Dano por tick não emite evento.** Cada `world.tick`, o dano de cada
personagem presente é calculado e aplicado diretamente ao HP do Boss
(`BossRepository`) e à participação acumulada (`BossParticipationRepository`)
— isso é acumulação interna, não uma transição de estado que outro System
precise observar. Emitir um evento por personagem por tick seria ruído
puro (em uma luta de 20 minutos, um canal com 500 participantes geraria
milhares de eventos sem nenhum consumidor). Só as *consequências*
observáveis (Boss morreu, Boss fugiu) são eventos.

### Diagrama de fluxo

```
world.tick (existente)
   │
   ├─→ BossSpawnSystem
   │     ├─ decide nascimento (cooldown + atividade) → boss.spawned
   │     ├─ checa timeout de invocação → boss.activated (auto)
   │     └─ [ação do streamer, fora do EventBus] → boss.activated (manual)
   │
   └─→ BossCombatSystem (só bosses com boss.activated já processado)
         ├─ calcula dano coletivo, atualiza HP (BossRepository)
         ├─ atualiza participação (BossParticipationRepository)
         ├─ checa thresholds de ultimate (75/50/25%)
         ├─ HP ≤ 0 → boss.defeated
         └─ duração excedida → boss.escaped

boss.defeated / boss.escaped
   │
   └─→ BossRewardSystem
         ├─ lê BossParticipationRepository
         ├─ CharacterRepository.applyXP() → xp.granted (todos)
         └─ ItemRepository.grantToCharacter() → drop.granted (só em boss.defeated)
```

---

## 2. Novos Systems

**`BossSpawnSystem`** — reage a `world.tick`. Decide quando um Boss nasce
(condição de cooldown + atividade do canal, capítulo 6/Nascimento), cria o
registro em `awaiting`, e controla a transição `awaiting → active`: ou por
ação explícita do streamer (chamada por uma rota HTTP futura, fora deste
documento — análoga a como `sessionManager.reportPresent()` é chamada hoje
pela rota de ping), ou automaticamente ao expirar o timeout de invocação.
Também calcula o tier de escala no momento da ativação (capítulo
6/Escala), gravando `max_hp` e o pool de recompensa correspondente.

**`BossParticipationSystem` — Sprint B2. ✅ Implementado e validado
(2026-07-01).** Reage a `world.tick`, só processa canais com Boss
`active`. Responsabilidade única: registrar presença (`ticksPresent`) por
personagem via `BossParticipationRepository`. Não sabe nada de dano, HP,
recompensa, timeout de luta ou fuga — isso ficou explicitamente fora desta
Sprint. Usa exclusivamente `event.sessions` (o mesmo snapshot que
`SessionManager` já fornece a `XPSystemV2` e `BossSpawnSystem`) para
definir quem está presente — nenhuma definição própria de "jogador
ativo". Nenhum evento novo emitido: presença por tick é acumulação
interna, mesmo raciocínio já usado para "dano por tick" nesta seção.

> **Decisão resolvida na B3 (2026-07-01):** `BossCombatSystem` é uma
> classe própria, separada de `BossParticipationSystem` — não a estende,
> não lê `boss_participation`. As duas reagem independentemente ao mesmo
> `world.tick`, cada uma derivando presença de `event.sessions` por conta
> própria. Motivo: responsabilidades diferentes (presença acumulada vs.
> HP e fim de luta), mesmo padrão de Systems estreitos já usado no resto
> da Engine.

**`BossCombatSystem` — Sprint B3. ✅ Implementado e validado
(2026-07-01).** Reage a `world.tick`, só processa Bosses com status
`active` (via `findAllActive()`, uma query global por tick — não repete
o padrão de N queries por canal). Aplica dano coletivo (fórmula
temporária: `DAMAGE_PER_CHARACTER_PER_TICK` fixo por personagem presente
— sem crítico, sem Equipamentos/Classe, que ainda não existem como
valor numérico), verifica HP, verifica duração, decide quando a luta
termina. Derrota tem prioridade sobre fuga quando as duas condições são
verdadeiras no mesmo tick. Não decide recompensa, não ataca personagens,
não aplica Modifiers — tudo isso ficou explicitamente fora do escopo.

> **Divisão explícita de responsabilidade sobre `ends_at` (decidido
> 2026-07-01, após revisão da Sprint B1):** quem **escreve** `ends_at` é
> o `BossSpawnSystem`, no momento da ativação (`awaiting → active`) —
> continua assim, provisoriamente, para evitar mais um System mexendo na
> mesma transição. Quem **lê e age** sobre `ends_at` (comparar com `now` a
> cada tick, decidir que a luta acabou por tempo, emitir `boss.escaped`)
> é o `BossCombatSystem`, quando existir (B3) — ele nunca escreve esse
> campo, só consulta. Ou seja: a *escrita* fica com Nascimento, a
> *leitura/decisão* fica com Combate. Revisitar isso só se a duração
> passar a depender de algo que só o `BossCombatSystem` sabe (ex.: um
> Modifier aplicado durante a luta) — não antes.

**`BossRewardSystem`** — reage a `boss.defeated` e `boss.escaped`. Lê a
participação acumulada, distribui XP sempre (proporcional) e chance de
item só em vitória (proporcional), usando `CharacterRepository` e
`ItemRepository` diretamente — nunca chamando `XPSystem`/`DropSystem`.

### Deliberadamente NÃO criado: `BossTimeoutSystem`

O exemplo do prompt sugeria um System dedicado a timeouts. Não criei —
avaliei e decidi contra. Um System de timeout dedicado teria duas opções
ruins: (a) ele mesmo efetuar a transição de estado do Boss, duplicando
responsabilidade que já pertence a `BossSpawnSystem`/`BossCombatSystem`,
ou (b) só detectar e emitir mais um evento avisando o dono real da
transição — complexidade extra sem benefício claro no MVP. Mantive a
lógica de timeout dentro de quem já é dono da transição correspondente
(invocação → `BossSpawnSystem`; duração da luta → `BossCombatSystem`).
Sinalizando isso explicitamente porque é uma mudança em relação ao exemplo
dado, com justificativa, não uma omissão.

---

## 3. Repositories

**`BossRepository`** — persiste o estado de cada instância de Boss: id,
channelId, status, tier, max_hp, current_hp, invocation_deadline,
activated_at, ends_at, resolved_at, created_at. Só leitura/escrita de
estado — nenhuma regra de jogo aqui (cooldown, cálculo de tier, condição
de nascimento vivem em `BossSpawnSystem`).

*(Correção pós-implementação: a versão original desta seção listava um
campo `spawned_at` separado de `created_at` — redundante, já que uma
linha de `bosses` só é criada no momento do nascimento, os dois teriam
sempre o mesmo valor. A implementação real usa só `created_at`,
reaproveitando a mesma convenção de `characters`/`profiles`/
`streamer_channels`. Removido daqui para refletir o código.)*

**`BossParticipationRepository` — Sprint B2. ✅ Implementado e validado
(2026-07-01).** Persiste, por (bossId, characterId): `ticksPresent`,
`firstSeenAt`, `lastSeenAt`. **Sem dano** — a versão original desta seção
previa um campo de dano acumulado aqui; a B2 decidiu explicitamente não
incluir nada de combate (regra "uma responsabilidade" da própria Sprint).
Dano, se vier a existir, é decisão da B3, em cima desta mesma tabela ou
numa nova — não decidido agora. Hoje é a fonte de verdade só para "quem
participou" e "quanto tempo" — a base da distribuição proporcional
(capítulo 6/Participação), mas ainda sem o componente de dano que o
capítulo também prevê.

**`BossRewardRepository` — Sprint B4. ✅ Implementado e validado
(2026-07-02).** Persiste o registro de recompensas já distribuídas por
(bossId, characterId), com `PRIMARY KEY (boss_id, character_id)`
composta no banco (não `id INTEGER AUTOINCREMENT` + `UNIQUE` como a
proposta original desta seção previa — mesma correção de estilo já
aplicada em `boss_participation` na B2: a chave composta já é o índice
natural e a guarda de idempotência ao mesmo tempo, um `id` próprio seria
redundante). `hasRewarded()` é a checagem de idempotência (não é possível
conceder recompensa duas vezes para o mesmo personagem na mesma luta,
mesmo se `boss.defeated`/`boss.escaped` for processado mais de uma vez).
Cumpre também o papel que `drop_log` cumpria antes de ficar órfão (Sprint
E4) — um registro auditável de concessão, específico de Boss.

### Deliberadamente NÃO criado: `BossDamageRepository`

O exemplo sugeria um repository de dano separado. Avaliei e decidi contra
no MVP: nenhuma decisão do MVP precisa de log granular por golpe (ranking
está fora do MVP — capítulo 6). Criar uma tabela de log detalhado agora
seria dado sem consumidor — o oposto do que o Princípio 6 já orienta.
Reforçado na B2: nem sequer um campo agregado de dano entrou em
`boss_participation` ainda — só presença. Dano fica inteiramente para a
B3.

---

## 4. Banco de dados

Convenções seguidas do schema atual: `TEXT PRIMARY KEY` para entidades com
id gerado pela aplicação (como `characters`), `INTEGER PRIMARY KEY
AUTOINCREMENT` para tabelas de registro/log (como `character_items`),
índice em toda foreign key usada em filtro/ordenação frequente.

```sql
CREATE TABLE IF NOT EXISTS bosses (
  id TEXT PRIMARY KEY,
  channel_id TEXT NOT NULL REFERENCES streamer_channels(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'awaiting', -- awaiting | active | defeated | escaped
  tier INTEGER NOT NULL,
  max_hp INTEGER NOT NULL,
  current_hp INTEGER NOT NULL,
  invocation_deadline INTEGER NOT NULL,
  activated_at INTEGER,
  ends_at INTEGER,
  resolved_at INTEGER,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);

CREATE INDEX IF NOT EXISTS idx_bosses_channel_status
  ON bosses(channel_id, status);

-- Garante um único Boss não-resolvido por canal a qualquer momento
-- (nunca decidido explicitamente no capítulo 6, ver seção 8, item 9).
CREATE UNIQUE INDEX IF NOT EXISTS idx_bosses_one_active_per_channel
  ON bosses(channel_id) WHERE status IN ('awaiting', 'active');
```

`created_at` cumpre o papel de "quando o Boss nasceu" — sem coluna
`spawned_at` separada (ver correção na seção 3).

```sql
-- Sprint B2. ✅ Implementado — versão real, mais enxuta que a proposta
-- original desta seção. Sem damage_dealt, sem is_defeated (ambos são B3,
-- não implementados ainda) e sem índice extra em boss_id: a PRIMARY KEY
-- (boss_id, character_id) já serve "listar participantes de um Boss"
-- via leftmost prefix, um índice dedicado seria redundante.
CREATE TABLE IF NOT EXISTS boss_participation (
  boss_id TEXT NOT NULL REFERENCES bosses(id) ON DELETE CASCADE,
  character_id TEXT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  ticks_present INTEGER NOT NULL DEFAULT 0,
  first_seen_at INTEGER NOT NULL,
  last_seen_at INTEGER NOT NULL,
  PRIMARY KEY (boss_id, character_id)
);
```

```sql
-- Sprint B4. ✅ Implementado — PRIMARY KEY composta em vez de
-- id AUTOINCREMENT + UNIQUE (ver correção na seção 3). granted_at em vez
-- de created_at, pra nomear o que o timestamp realmente significa aqui
-- (quando a recompensa foi concedida, não quando a linha foi criada —
-- são o mesmo instante neste caso, mas o nome importa para leitura futura).
CREATE TABLE IF NOT EXISTS boss_rewards (
  boss_id TEXT NOT NULL REFERENCES bosses(id) ON DELETE CASCADE,
  character_id TEXT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  xp_granted INTEGER NOT NULL,
  item_id INTEGER REFERENCES items(id) ON DELETE SET NULL,
  outcome TEXT NOT NULL CHECK (outcome IN ('defeated', 'escaped')),
  granted_at INTEGER NOT NULL,
  PRIMARY KEY (boss_id, character_id)
);
```

Itens concedidos por Boss usam `character_items.obtained_channel_id =
NULL`, mesmo padrão já decidido para `ItemRepository.grantToCharacter()`
na Sprint D4 — nenhuma decisão nova aqui, só confirmando consistência.

Sem migrations criadas — isso é proposta de schema, não execução.

---

## 5. Integração com a Engine existente

| Componente | Reaproveitado como | Observação |
|---|---|---|
| `GameClock`/`GameEngine` | `world.tick` continua sendo o único heartbeat | Ver ressalva de cadência na seção 8 |
| `SessionManager` | `WorldTickEvent.sessions` (já recebido por `world.tick`) informa quem está presente por canal | Mesmo dado que `XPSystemV2` já usa, nenhuma mudança |
| `EventBus` | Mesmo `subscribe`/`emit`, mesmo padrão fire-and-forget | Nenhuma mudança |
| `CharacterRepository` | `applyXP()` para XP de participação | Ver achado da seção 0 |
| `ItemRepository` | `findEligible()`/`grantToCharacter()` para loot de vitória | Herda o bug de RNG compartilhado, como já decidido no capítulo 6 |
| `XPSystem`/`DropSystem` | **Não reaproveitados por chamada direta** | `BossRewardSystem` usa os mesmos Repositories e emite os mesmos tipos de evento — reaproveitamento pela camada de dados/contrato, nunca por um System chamando outro (Princípio 4) |
| `isChannelLive` (twitch.service.ts) | `BossSpawnSystem` provavelmente precisa saber se o canal está ao vivo antes de deixar um Boss nascer | Ver seção 8, item 5 — é a mesma exceção ao Princípio 3 que `XPSystemV2` já tem, não uma nova |

---

## 6. Ordem de implementação

Cada sprint termina compilando e funcionando, testável isoladamente (mesmo
padrão de harness usado em E2/E3/E4 — sem HTTP/Twitch real, módulos
instanciados diretamente).

**Sprint B1 — Nascimento. ✅ Implementado e validado (2026-07-01).** Tabela
`bosses` (com índice único parcial garantindo um Boss `awaiting`/`active`
por canal), `BossRepository`/`SQLiteBossRepository`, `BossSpawnSystem`
(condição de nascimento por cooldown+atividade+live, estado `awaiting`,
timeout de invocação automático, invocação manual via `invoke()`, emissão
de `boss.spawned`/`boss.activated`). Sem combate ainda — um Boss nasce, é
invocado, e nada mais acontece. Validado via harness isolado (mesmo padrão
de E2/E3/E4): nascimento independente por canal, sem duplicação com Boss
já `awaiting`, invocação manual com `activatedBy` correto, timeout
automático com `activatedBy: "auto"`, constraint do banco testada
diretamente (tentativa de inserir um segundo Boss não-resolvido no mesmo
canal falha), cooldown bloqueando e depois liberando novo nascimento. 0
erros.

**Deliberadamente NÃO conectado a `server.ts` ainda.** Se `BossSpawnSystem`
rodasse em produção agora, um Boss ativado (por invocação ou timeout)
ficaria em `active` para sempre — nada existe ainda para tirá-lo desse
estado (isso só chega na B3). Como o índice único impede um segundo Boss
enquanto um `active` existir, isso bloquearia permanentemente novos
Bosses naquele canal até uma correção manual no banco. Conectar ao
`server.ts` fica para quando pelo menos a B3 (Combate) existir,
garantindo que `active` sempre tenha uma saída real.

**Sprint B2 — Participação. ✅ Implementado e validado (2026-07-01).**
Tabela `boss_participation`, `BossParticipationRepository`,
`BossParticipationSystem` — rastreia presença (`ticksPresent`) por
personagem para Bosses `active`, usando exclusivamente `event.sessions`
(nenhuma definição própria de presença). Sem dano, sem HP, sem
recompensa, sem timeout de luta, sem fuga — nada disso entrou, por
decisão explícita de escopo. Sem eventos novos (presença por tick é
acumulação interna, mesmo raciocínio já usado para dano). Validado via
harness isolado usando o `SessionManager` real (não uma definição
própria): entrada, múltiplas sessões (mesma conta, 2 "abas", dedupadas
pelo próprio `SessionManager`), saída, reconexão (soma na mesma linha,
não cria linha nova) e dois canais simultâneos independentes — 9/9
asserções, 0 erros. "Timeout de presença" não foi testado com uma espera
real de 90s — tratado como equivalente a "saída" por desenho (o System só
reage ao que `SessionManager` reporta, não distingue a causa da ausência),
e o timeout de 90s em si já é comportamento pré-existente do
`SessionManager`, não algo que a B2 precisasse re-testar. Também não
conectado a `server.ts` — sem `BossCombatSystem`, ainda não há motivo
para rodar em produção.

**Sprint B3 — Combate. ✅ Implementado e validado (2026-07-01).** Cálculo
de dano (fórmula temporária e simples, sem crítico), HP em
`bosses.current_hp`, emissão de `boss.defeated`/`boss.escaped` por
HP/duração, com derrota tendo prioridade sobre fuga. **Sem** thresholds
de ultimate e **sem** `is_defeated` de personagem — não fazem parte do
combate coletivo Boss-vs-HP que esta Sprint implementou (o Boss não ataca
de volta ainda; ultimate e "personagem derrotado" são sobre o Boss
atacando jogadores, explicitamente fora do escopo desta B3). Validado via
harness isolado: derrota gradual, fuga sem ninguém presente, prioridade
derrota-sobre-fuga no mesmo tick, Boss `awaiting` intocado, Boss já
resolvido não recebe mais dano nem reemite evento — 16/16 asserções, 0
erros. Não conectado a `server.ts` ainda (sem `BossRewardSystem`, um
Boss derrotado/fugido não gera consequência nenhuma pro jogador).

**Sprint B4 — Recompensas. ✅ Implementado e validado (2026-07-02).**
Tabela `boss_rewards`, `BossRewardRepository`, `BossRewardSystem`.
Desbloqueada pela correção da seção 0 (`source` em `XPGrantedEvent`).

XP: `XP_BUDGET_PER_BOSS` (hoje 200, placeholder) dividido proporcionalmente
por `ticksPresent` via `distributeXpBudget()` — função pura, recebe o
budget como parâmetro. Quando a B5 (Escala) existir, trocar "200 fixo" por
"budget por tier" é substituir o valor passado a essa função, não
reescrever o algoritmo — decisão explícita do usuário antes da
implementação.

Item: `ITEM_SLOTS_PER_BOSS` (hoje 3, mesmo placeholder) vagas sorteadas
entre os participantes via `drawItemWinners()` — loteria ponderada por
`ticksPresent`, sem reposição (um personagem não ganha duas vagas do mesmo
Boss). Só quem ganha uma vaga rola a raridade do item (`pickRarity()`, a
mesma tabela `RARITY_WEIGHTS` do DropSystem) — não existe um segundo
DROP_CHANCE aqui, ganhar a vaga já é o "gate". Analogia deliberada com o
XP: XP é contínuo e divide, item é discreto e sorteia — mesmo princípio
("budget proporcional à participação"), duas formas, porque o recurso
muda de natureza.

**Achado durante o design, resolvido em conversa antes da implementação:**
como o roll de raridade do Boss usa um `RandomProvider.next()` novo e
independente (não existe gate anterior pra reaproveitar, diferente do
DropSystem), ele não herda o bug do RNG compartilhado documentado em
`DropSystem.ts` — amostra `RARITY_WEIGHTS` fielmente desde já. Decisão
explícita do usuário: isso **não é uma segunda economia de raridade**, é a
mesma tabela (`RARITY_WEIGHTS`) sendo lida corretamente pela primeira vez
no código — o DropSystem é quem está fora de conformidade com o modelo,
por um bug de implementação já registrado, não o Boss. Regra de projeto
fixada nesta conversa: **nenhum System novo deve replicar um bug antigo só
por consistência aparente** — o Boss não deve nem pode imitar o bug do
DropSystem (a imitação exigiria inventar um gate artificial só para
descartar entropia, fabricando o defeito de propósito). A divergência
observável entre Boss e drop passivo é tratada como consequência temporária
do débito já registrado do DropSystem (seção 7/Economia 1.0) — quando esse
bug for corrigido, os dois convergem sozinhos, sem mexer na B4.

Validado via harness isolado, 7 cenários / 25 asserções, 0 erros: (1)
distribuição proporcional de XP + todos ganham vaga quando vagas =
participantes; (2) sorteio ponderado com mais participantes que vagas,
resultado conferido contra uma previsão calculada a partir da mesma ordem
observada; (3) prova concreta de que o Boss não herda o bug do RNG
compartilhado (rng alto força raridade "epic", não "common"); (4) outcome
`escaped` concede XP e zero itens; (5) idempotência sob reprocessamento do
mesmo evento; (6) Boss sem nenhum participante — no-op seguro; (7)
level up cruzando fronteira de nível, evento `level.up` correto.
`tsc --noEmit` (via tsconfig temporário sem `references`, ver débito de
`composite` na seção 8) confirma **zero erros de tipo** nos dois arquivos
novos. Não conectado a `server.ts` — mesma razão das Sprints anteriores,
decisão de conectar tudo fica para quando o ciclo completo (B1-B5) for
revisado em conjunto.

**Sprint B5 — Escala.** Lógica de tier em `BossSpawnSystem` (participantes
no momento da ativação → tier → `max_hp`/pool de recompensa). Tabela de
tiers pode ser uma constante no código para o MVP — não precisa de tabela
própria enquanto os valores forem os mesmos para todos os canais.

---

## 7. Dependências futuras

**Frontend Event Bridge** — necessário para: botão "Invocar Boss" (reage a
`boss.spawned`), barra de vida em tempo real, notificação de
vitória/fuga, e o ranking/MVP de jogador (capítulo 6 — dado já vai existir
em `boss_participation`, só falta expor).

**Classes** — a fórmula de dano (`Base × Equipamentos × Classe`) não pode
ser implementada de verdade até Classes existir. No MVP, o multiplicador
de Classe fica fixo em `1` — documentar isso explicitamente no código como
placeholder, não just deixar implícito.

**Economia 1.0** — Gold como recompensa de Boss fica bloqueado até a
decisão mais ampla de migração de gold (já confirmado no capítulo 6). O
bug de RNG compartilhado do drop de item é herdado até ser corrigido lá.

**Marketplace** — nenhuma dependência direta do `BossSystem` em si, só
indireta via os itens que ele concede.

**Kingdoms** — nenhuma dependência conhecida ainda.

---

## 8. Auditoria arquitetural

1. **Achado crítico (já detalhado na seção 0):** `xp.granted` sem campo de
   origem causa dupla-concessão de drop — afeta Boss e já afeta
   `WelcomeRewardSystem` em produção hoje.

2. **Cadência de combate vs. `world.tick` de 60s.** "Ataque especial a
   cada X segundos" (capítulo 6/Combate) não encaixa naturalmente num
   heartbeat de 60s — uma luta de ~10 minutos são só ~10 ticks.
   Recomendação para o MVP: reinterpretar "X segundos" como "a cada tick"
   em vez de criar um clock secundário só para combate. Documentar como
   limitação conhecida do MVP, não como bug — se o ritmo de combate
   parecer lento demais em playtest, aí sim vale considerar um clock
   dedicado (mais infraestrutura, evento novo `boss.tick` distinto de
   `world.tick`).

3. **`BossTimeoutSystem` do exemplo, deliberadamente não criado** — ver
   seção 2. Evita duplicar responsabilidade de transição de estado entre
   dois Systems.

4. **`BossDamageRepository` do exemplo, deliberadamente não criado** — ver
   seção 3. Sem consumidor no MVP.

5. **Acoplamento com Twitch — herdado, não introduzido. Confirmado após
   implementação, não é mais hipotético.** `BossSpawnSystem` chama
   `isChannelLive()` diretamente, mesma exceção ao Princípio 3 que
   `XPSystemV2` já tem documentada (capítulo 2). Já são 2 Systems fazendo
   a mesma checagem **no mesmo tick**, cada um com sua própria chamada de
   rede à Twitch — dobra o tráfego de liveness-check por canal a cada 60s,
   sem cache compartilhado. Ver débito registrado abaixo.

6. **Repository "gordo" — risco baixo, vale monitorar.**
   `BossRepository` acumula estado de nascimento e de combate no mesmo
   registro. Não viola o Princípio 6 (é só leitura/escrita, nenhuma regra
   de jogo), mas se crescer mais (histórico de Modifiers aplicados, log de
   habilidades usadas pelo Boss) pode valer separar. Não é um problema
   agora.

7. **Eventos redundantes evitados:** sem `boss.rewarded` (reaproveita
   `xp.granted`/`drop.granted`), sem evento por tick de dano (ruído sem
   consumidor). Só 3 eventos genuinamente novos: `boss.spawned`,
   `boss.defeated`, `boss.escaped`.

8. **Decisão que faltava no capítulo 6, agora resolvida (2026-07-01):**
   duas perguntas distintas, que este documento originalmente misturou
   numa só. (a) Pode haver mais de um Boss ativo ao mesmo tempo **no
   mesmo canal**? Não — um único Boss por canal por vez, garantido pelo
   índice único parcial (seção 4). (b) Podem existir Bosses ativos
   **em canais diferentes, ao mesmo tempo**? Sim — cada canal tem seu
   próprio ciclo de vida de Boss, totalmente independente (cooldown,
   vida, participação, recompensa — nada é compartilhado entre canais).
   Confirmado também no capítulo 6/Nascimento da Bible.

9. **Nenhuma outra violação de princípio encontrada.** Nenhum System novo
   chama outro System diretamente; toda concessão de progressão passa por
   Repository + evento existente; nenhum Repository decide regra de jogo;
   nenhum novo dado de plataforma vaza para eventos de Gameplay.

### Débitos técnicos registrados após revisão crítica da B1 (2026-07-01)

Encontrados na revisão pós-implementação da Sprint B1. Nenhum corrigido
agora — só registrados, para tratar quando fizer sentido, não
antecipadamente.

- **Duplicação de `isChannelLive()`** (item 5 acima) — `XPSystemV2` e
  `BossSpawnSystem` chamam a Twitch independentemente para os mesmos
  canais no mesmo tick. Aguardando um terceiro consumidor antes de
  abstrair atrás de um Presence Provider — não abstrair com só 2.
- **Índice ausente para `findAwaitingPastDeadline`.** A query
  (`status = 'awaiting' AND invocation_deadline <= ?`, sem `channel_id`)
  não é servida por nenhum índice existente — ambos começam por
  `channel_id`. Falta um `CREATE INDEX ON bosses(status,
  invocation_deadline)` (ou parcial, `WHERE status = 'awaiting'`).
  Irrelevante na escala atual; vira full scan a cada tick conforme o
  histórico de `bosses` crescer.
- **`nowUnix()` chamado diretamente no handler de `world.tick`**, em vez
  de derivado de `event.timestamp` — viola o princípio já documentado em
  `GameClock.ts` ("nenhum sistema deve chamar Date.now() diretamente").
  Efeito prático hoje é desprezível (drift de milissegundos), mas é uma
  violação real, não cosmética. (`Date.now()` dentro de `invoke()` é
  diferente e está correto — ação externa fora do ciclo de tick, mesmo
  padrão de `SessionManager.reportPresent()`.)

### Débitos técnicos registrados após revisão crítica da B2 (2026-07-01)

- **Segunda instância do mesmo padrão de duplicação por tick, agora em
  `findActiveOrAwaiting()`.** `BossSpawnSystem` e `BossParticipationSystem`
  chamam `bossRepo.findActiveOrAwaiting(channelId)` independentemente,
  para o mesmo canal, no mesmo tick — mesma categoria de problema que a
  duplicação de `isChannelLive()` (débito da B1). Mesma decisão: aguardar
  um terceiro consumidor antes de introduzir qualquer cache/abstração
  compartilhada — não resolver com só 2 Systems fazendo isso.

### Débitos técnicos registrados após revisão crítica da B3 (2026-07-01)

- **`BossRepository` tem dois padrões diferentes para "transição de
  estado + timestamp".** `activate()` (B1) calcula `now` internamente
  (o próprio débito de `nowUnix()` já registrado acima); `resolve()`
  (B3, novo) recebe `resolvedAt` como parâmetro, derivado corretamente
  pelo `BossCombatSystem` a partir de `event.timestamp`. O padrão do
  `resolve()` está certo — vale migrar `activate()` pra ele quando o
  débito do `nowUnix()` for endereçado, não antes.
- **Inconsistência de leitura em `BossCombatSystem.advance()`.** O check
  de HP lê do snapshot atualizado (`current.currentHp`); o check de
  `endsAt` lê do snapshot original (`boss.endsAt`). Funcionalmente
  idêntico hoje (`applyDamage()` nunca toca `ends_at`), mas
  estilisticamente inconsistente — vale padronizar pra sempre ler de
  `current` numa próxima passada, não é urgente.
- **Observação, não um débito formal:** `BossCombatSystem` e
  `BossParticipationSystem` derivam "quem está presente por canal" de
  `event.sessions` cada um por conta própria — mas isso é trabalho em
  memória (O(n), sem I/O), categoria bem mais barata que as duplicações
  de rede/banco acima. Não abre débito, só registra que os dois fazem
  esse agrupamento de forma independente.

### Débitos técnicos registrados após revisão crítica da B4 (2026-07-02)

- **Custo de reprocessamento não guardado por idempotência agregada.**
  `hasRewarded()` só é checado *por participante*, dentro do loop —
  `listByBoss`, `distributeXpBudget()` e principalmente `drawItemWinners()`
  (que consome `RandomProvider`) rodam incondicionalmente antes disso,
  mesmo quando o Boss inteiro já foi processado. Confirmado no harness:
  reprocessar um Boss já recompensado ainda dispara chamadas de RNG à
  toa. Consequência mais séria: se esse trecho compartilhado lançar uma
  exceção, o `catch` externo aborta o Boss inteiro — inclusive o XP, que é
  sempre garantido e não deveria depender do sorteio de item. Uma
  checagem agregada ("este Boss já tem alguma linha em `boss_rewards`?")
  antes de computar budget/sorteio resolveria os dois problemas. Não
  corrigido agora.
- **`xp.granted` + emissão condicional de `level.up` duplicado pela 3ª
  vez.** `XPSystemV2`, `WelcomeRewardSystem` e agora `BossRewardSystem`
  têm exatamente a mesma forma (aplicar XP → montar evento → checar
  `leveledUp` → emitir `level.up`). Cruza o limiar de "2-3 consumidores"
  que o próprio projeto usa como gatilho de abstração — registrado, não
  extraído (nenhum consumidor pediu, cada System ainda é pequeno o
  suficiente pra copiar).
- **Fluxo de concessão de item duplicado 2x.** `findEligible()` →
  `grantToCharacter()` → montar `DropGrantedEvent` → emitir, igual em
  `DropSystem` e `BossRewardSystem`. Um degrau abaixo do limiar acima —
  mesma decisão: aguardar um terceiro consumidor.
- **`Extract` sem `<` em `EventOfType` (`engine/types.ts`) — ✅
  CORRIGIDO (2026-07-02), como micro-correção isolada, fora do escopo da
  B4.** Erro de sintaxe presente desde o primeiro commit que criou o tipo
  (confirmado via `git show`/leitura de bytes crus) — nunca detectado
  porque todo consumidor usa `import type`, que o esbuild/tsx apaga sem
  nunca carregar o arquivo; só um `tsc --noEmit` real expõe isso, e
  nenhuma Sprint anterior rodou um. Corrigido como um único caractere,
  sem nenhuma outra alteração, antes de validar a B4.
- **`packages/shared/tsconfig.json` sem `"composite": true`** — bloqueia
  `tsc --noEmit -p .` no `apps/api` inteiro (`references` exige isso do
  projeto referenciado). Pré-existente, não relacionado à B4. Decisão
  explícita: não corrigir agora — é uma mudança de configuração de
  monorepo com efeitos colaterais potenciais em build/pipeline, fica para
  uma Sprint própria de infraestrutura TypeScript. A validação da B4 usou
  um `tsconfig` temporário sem `references` (criado e apagado no mesmo
  passo, nunca commitado) para confirmar tipagem real dos arquivos novos
  sem essa barreira.
- **28 erros de tipo pré-existentes, não relacionados à B4**, encontrados
  pela mesma checagem temporária: fixtures de teste com `channelId` que
  não existe mais em `XPGrantedEvent` (já era débito conhecido,
  `EventBus.test.ts`), handlers de teste retornando `number` em vez de
  `void`/`Promise<void>` (`EventBus.test.ts`, `GameEngine.test.ts`), casts
  `as ParticipationRow`/`as BossRow` que o `strict` do TS rejeita por
  overlap insuficiente com `Record<string, SQLOutputValue>`
  (`SQLiteBossParticipationRepository.ts`, `SQLiteBossRepository.ts`,
  débito da B1/B2 nunca antes visível), e um `await` de nível incorreto em
  `SQLiteCharacterRepository.test.ts`. Nenhum nos dois arquivos novos da
  B4 (`BossRewardSystem.ts`, `SQLiteBossRewardRepository.ts`, que
  passaram limpos). Não corrigidos — mesma decisão do item acima, ficam
  para a Sprint de infraestrutura TypeScript.

---

## 9. Máquina de estados

Quatro estados, todos já usados nas seções anteriores — esta seção só
torna as transições explícitas e nomeia quem é responsável por cada uma.

```
                    ┌──────────┐
   (nascimento)  →  │ awaiting │
                    └────┬─────┘
                         │ invocação manual (streamer)
                         │   OU invocation_deadline expirado (automático)
                         │        [BossSpawnSystem → emite boss.activated]
                         ▼
                    ┌──────────┐
                    │  active  │
                    └────┬─────┘
                         │
              ┌──────────┴──────────┐
              │                     │
   current_hp ≤ 0          duração máxima excedida
   [BossCombatSystem       [BossCombatSystem
    → boss.defeated]        → boss.escaped]
              │                     │
              ▼                     ▼
        ┌───────────┐        ┌───────────┐
        │ defeated  │        │ escaped   │
        └───────────┘        └───────────┘
         (terminal)            (terminal)
```

**Tabela de transições:**

| De | Para | Gatilho | Quem decide | Evento emitido |
|---|---|---|---|---|
| *(nenhum)* | `awaiting` | condição de nascimento atingida (cooldown + atividade) | `BossSpawnSystem` | `boss.spawned` |
| `awaiting` | `active` | streamer invoca, ou `invocation_deadline` expira | `BossSpawnSystem` | `boss.activated` |
| `active` | `defeated` | `current_hp ≤ 0` | `BossCombatSystem` | `boss.defeated` |
| `active` | `escaped` | duração máxima excedida sem `current_hp ≤ 0` | `BossCombatSystem` | `boss.escaped` |

**Invariantes (o que NÃO pode acontecer):**
- Não existe transição direta `awaiting → defeated` ou `awaiting →
  escaped` — um Boss não invocado não pode morrer nem fugir, precisa
  passar por `active` primeiro.
- `defeated` e `escaped` são terminais — nenhuma transição sai deles. Um
  novo ciclo é sempre um novo registro em `bosses` (nova linha), nunca a
  reutilização de uma linha já resolvida.
- Só `BossSpawnSystem` escreve a transição `awaiting → active`; só
  `BossCombatSystem` escreve as transições que saem de `active`. Nenhum
  outro System muta `bosses.status`.

**Caso de borda identificado, não decidido:** o que acontece se o canal
ficar offline enquanto o Boss está em `awaiting`? O capítulo 6 não cobre
isso. Duas opções razoáveis — nenhuma escolhida: (a) o timeout de
invocação continua contando normalmente, o Boss ativa sozinho mesmo
offline (ninguém vai participar, a luta expira por duração e ele foge);
(b) o timer pausa enquanto o canal está offline. Recomendo (a) por
simplicidade (zero estado extra, o pior caso é uma luta que ninguém
participa e que termina em fuga sem custo real) — mas isso é uma decisão
de design, não técnica, e deveria voltar para o capítulo 6 antes da
Sprint B1 incluir esse caso.
