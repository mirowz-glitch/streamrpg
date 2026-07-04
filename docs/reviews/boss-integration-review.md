# Boss Integration Review

**Status: ✅ Integrado.** Primeira execução real do BossSystem em
runtime, através do EventBus registrado em `server.ts`. Nenhuma mecânica,
atributo, fórmula ou decisão de arquitetura nova — só conexão do que já
existia.

---

## 1. Resumo Executivo

O `BossSystem` (Sprints B1-B4) tinha implementação completa, Repositories,
schema e harnesses isolados validando cada peça — mas nunca era
registrado no `EventBus` real de `server.ts`, confirmado pela MVP
Readiness Review. Esta Sprint fez exatamente uma coisa: instanciar os
quatro Systems (`BossSpawnSystem`, `BossParticipationSystem`,
`BossCombatSystem`, `BossRewardSystem`) e seus três Repositories em
`server.ts`, reaproveitando o que já existia (`characterRepository`,
`itemRepository`, `randomProvider`). Nenhuma outra mudança de código foi
feita. Um harness contra um banco isolado (não o de desenvolvimento)
provou o ciclo completo — nascimento, ativação, participação, combate,
derrota, distribuição de XP e item, e persistência — rodando através do
`EventBus` real, não de um harness que monta os Systems por fora.

---

## 2. Arquitetura encontrada

| Componente | Onde é criado (antes desta Sprint) | Quem deveria registrar | Estado antes |
|---|---|---|---|
| `BossSpawnSystem` | Nunca instanciado fora de harness | `server.ts` | Código pronto, zero execução |
| `BossParticipationSystem` | Nunca instanciado fora de harness | `server.ts` | Código pronto, zero execução |
| `BossCombatSystem` | Nunca instanciado fora de harness | `server.ts` | Código pronto, zero execução |
| `BossRewardSystem` | Nunca instanciado fora de harness | `server.ts` | Código pronto, zero execução |
| `SQLiteBossRepository` / `SQLiteBossParticipationRepository` / `SQLiteBossRewardRepository` | Implementadas, nunca instanciadas em produção | `server.ts` | Código pronto, zero execução |

Confirmado por busca em todo o repositório antes da mudança: as quatro
classes de System só apareciam nos próprios arquivos que as definem e em
`engine/types.ts` (interfaces) — nenhum outro arquivo de produção as
referenciava.

---

## 3. Mudanças realizadas (menor diff possível)

**Um único arquivo de produção alterado: `apps/api/src/server.ts`.**

- 7 imports novos (4 Systems + 3 Repositories de Boss).
- 3 linhas instanciando os Repositories.
- 4 pares `new XSystem(...); xSystem.register(bus);`, no mesmo padrão já
  usado para `XPSystem`/`WelcomeRewardSystem`/`DropSystem` logo acima.
- Nenhuma linha removida, nenhuma linha de código existente reescrita,
  nenhuma rota HTTP nova, nenhum schema alterado (as tabelas `bosses`,
  `boss_participation`, `boss_rewards` já existiam desde as Sprints B1-B4).

**Documentação técnica:** uma entrada nova adicionada ao final da seção 6
de `docs/technical-design/boss-system.md`, confirmando a conexão e
registrando explicitamente o que continua fora do escopo (rota HTTP de
invocação manual). Nenhuma seção histórica (B1-B4) foi reescrita — elas
descrevem corretamente o estado de cada Sprint no momento em que foram
escritas.

**Nenhum arquivo de Bible, Gameplay Design, Combat Model, World Design ou
Economia foi tocado**, conforme restrição da Sprint.

---

## 4. Fluxo final

```
server.ts inicia
   → EventBus criado
   → BossSpawnSystem.register(bus)          [reage a world.tick]
   → BossParticipationSystem.register(bus)  [reage a world.tick]
   → BossCombatSystem.register(bus)         [reage a world.tick]
   → BossRewardSystem.register(bus)         [reage a boss.defeated/boss.escaped]

world.tick (a cada 60s em produção real)
   → BossSpawnSystem: nasce Boss (cooldown+atividade+live) ou ativa por timeout
   → BossParticipationSystem: registra presença em Bosses "active"
   → BossCombatSystem: aplica dano coletivo, decide derrota/fuga

boss.defeated / boss.escaped
   → BossRewardSystem: distribui XP (sempre) e item (só vitória), persiste
```

Etapa a etapa, contra a pergunta "já existe?":

| Etapa | Estado após esta Sprint |
|---|---|
| Servidor inicia → EventBus | Já existia |
| Boss Systems registrados | **Novo nesta Sprint** |
| Spawn | Já existia (código), agora executa de verdade |
| Boss ativo | Já existia (código + `invoke()`), agora executa de verdade |
| Participação | Já existia (código), agora executa de verdade |
| Combate | Já existia (código), agora executa de verdade |
| Vitória/Derrota | Já existia (código), agora executa de verdade |
| Recompensa | Já existia (código), agora executa de verdade |
| Persistência | Já existia (schema), agora recebe escrita real pela primeira vez |
| Logs | Já existiam (`console.log` em cada System) — nunca haviam impresso nada em produção; agora imprimem |

---

## 5. Harness

Harness temporário (`boss-integration-harness.ts`, executado via `tsx`,
não commitado — mesma disciplina das Sprints P0-P3), rodando contra um
banco SQLite isolado (`DB_PATH` apontado para um arquivo em scratch,
nunca o banco de desenvolvimento).

**Metodologia, registrada com transparência:** `BossSpawnSystem.trySpawn()`
(caminho automático via tick) exige `isChannelLive() == true`, que faz uma
chamada de rede real à Twitch — fora do escopo desta Sprint de integração
(não foi tocado, não foi mockado). O harness prova o nascimento chamando
`bossRepository.create(...)` diretamente (o mesmo efeito que `trySpawn()`
produz internamente após passar no gate de live) e, a partir daí, exercita
`invoke()` → participação → combate → recompensa inteiramente através do
`EventBus` real, com os quatro Systems registrados exatamente como estão
em `server.ts`.

**Passos provados, com evidência:**

1. **Boss nasce.** `bossRepository.create()` → linha em `bosses` com
   `status='awaiting'`, `max_hp=500`.
2. **Boss ativado.** `spawnSystem.invoke(bossId, "harness-streamer")` →
   `status='active'`, `boss.activated` emitido.
3. **Participação funciona.** A cada `world.tick` emitido manualmente (2
   sessões simultâneas), `BossParticipationSystem` grava presença —
   confirmado por `ticksPresent=5` para os dois personagens ao final.
4. **Combate acontece.** `BossCombatSystem` aplica 100 de dano por tick (2
   presentes × 50) — HP: 500→400→300→200→100→0 em 5 ticks.
5. **Boss termina.** HP≤0 no tick 5 → `status='defeated'`, `boss.defeated`
   emitido.
6. **Recompensas concedidas.** `BossRewardSystem` reage a `boss.defeated`:
   XP dividido proporcionalmente (100 para cada, ticksPresent igual);
   loteria de item rodou para os dois — `char-1` rolou raridade `rare`
   sem item elegível no nível 1 (comportamento correto, itens raros do
   catálogo exigem nível 10+), `char-2` recebeu o item id `6`
   ("Armadura de Couro Cru").
7. **Dados persistem.** `boss_rewards` com as duas linhas corretas;
   `characters.xp` confirmado em 100 para os dois personagens via
   `characterRepository.findById()` (leitura real do banco, não do
   objeto em memória).
8. **Nenhuma etapa quebrou o EventBus.** Checagem final:
   `listeners world.tick=3 boss.defeated=1 boss.escaped=1` — nenhum
   handler lançou exceção não tratada, nenhum listener foi perdido.

**Reprodutibilidade:** rodado duas vezes (uma sem `seedItems()`, uma com)
— resultado determinístico e consistente em ambas quanto a HP/participação/
persistência; a única variação foi a raridade sorteada pela loteria de
item (aleatória por design, não um defeito).

---

## 6. Evidências (log real do harness, segunda execução)

```
=== BOSS SPAWN ===
Boss 2a34c5cd-db17-42fb-bbaf-d1a5ca3ba537 criado | status=awaiting | maxHp=500

=== BOSS ACTIVATED (invoke, simulando clique do streamer) ===
[BossSpawnSystem] Channel: harnesschannel | Boss 2a34c5cd-... ativado | Por: harness-streamer
Boss 2a34c5cd-... | status=active | endsAt=1783077467

=== PLAYERS REGISTERED / COMBAT TICKS ===
[BossCombatSystem] Boss 2a34c5cd-... | Dano: 100 (2 presentes) | HP restante: 400
Tick 1: HP=400/500 | status=active
...
[BossCombatSystem] Boss 2a34c5cd-... | Dano: 100 (2 presentes) | HP restante: 0
[BossCombatSystem] Boss 2a34c5cd-... | DERROTADO
[BossRewardSystem] Character: char-1 | Rarity: rare | No eligible item found (Boss 2a34c5cd-...)
[BossRewardSystem] Boss 2a34c5cd-... | Character: char-1 | XP: 100 | Item: none | Outcome: defeated
[BossRewardSystem] Boss 2a34c5cd-... | Character: char-2 | XP: 100 | Item: 6 | Outcome: defeated
Tick 5: HP=0/500 | status=defeated

=== PERSISTENCE CHECK (characters) ===
char-1: xp=100
char-2: xp=100

=== BOSS CLOSED ===
bosses row: { "status": "defeated", "current_hp": 0, "resolved_at": 1783076867, ... }

=== EVENTBUS HEALTH CHECK ===
listeners world.tick=3 boss.defeated=1 boss.escaped=1

=== HARNESS OK ===
```

Log completo (todas as linhas, sem corte) disponível na execução original
— reproduzido aqui de forma resumida por brevidade, sem omitir nenhum
resultado relevante.

---

## 7. Código morto encontrado

| Item | Classificação | Justificativa |
|---|---|---|
| `boss.spawned` (evento emitido, zero subscribers em produção) | **Aguardando integração** | Documentado desde o design técnico como reservado para o Frontend Event Bridge futuro — não é descuido |
| `BossSpawnSystem.invoke()` | **Aguardando integração** | Agora registrado e funcional (provado pelo harness), mas nenhuma rota HTTP o chama ainda — próxima peça natural (Sprint de rota/Frontend Event Bridge), não desta Sprint |
| `DebugEventSubscriber` sem assinatura a eventos de Boss | **Aguardando integração** | Ferramenta de observação existente nunca foi escopada para Boss; não é regressão desta Sprint, não foi tocada (fora do escopo: "não aproveitar para melhorar código") |
| `drop_log` (tabela órfã desde Sprint E4) | **Realmente morta** | Achado anterior, não novo — nenhum caminho de código escreve nela desde a remoção do legado |

Nenhum item novo de código genuinamente morto foi encontrado como
resultado desta integração — só peças que já esperavam por uma conexão
futura, exatamente como a documentação já registrava.

---

## 8. Compatibilidade com MVP

Não foi implementado Combat Model, Builds, Equipamentos, nem alterado
World Design/Gameplay Design/Economia, conforme restrição. O `BossSystem`
continua usando a fórmula temporária da Sprint B3
(`DAMAGE_PER_CHARACTER_PER_TICK` fixo, sem crítico/Equipamentos/Classe) —
essa lacuna já era conhecida e não foi o objeto desta Sprint. O que muda
para o MVP: a lacuna deixa de ser "o sistema nem roda" e passa a ser "o
sistema roda com uma fórmula simplificada, aguardando o Combat Model" —
exatamente a categoria de débito que a MVP Readiness Review já
recomendava como próximo passo natural (item 4 da ordem sugerida:
"implementar a fórmula canônica dentro de `BossCombatSystem`").

---

## 9. Veredito

**Critério de sucesso atingido.** O Boss é registrado em runtime
(confirmado em `server.ts`), percorre o ciclo completo nascimento →
ativação → participação → combate → derrota → recompensa → persistência
(provado pelo harness contra o `EventBus` real), distribui recompensas
corretamente (XP proporcional sempre, item por loteria só em vitória,
incluindo o caso correto de "nenhum item elegível" para raridades acima
do nível do personagem), persiste os dados corretamente (confirmado por
leitura direta do banco após o ciclo, não do estado em memória), e pode
ser executado novamente sem intervenção manual (rodado duas vezes nesta
Sprint, mesmo resultado estrutural nas duas).

O próximo passo natural, já identificado pela MVP Readiness Review e
reafirmado aqui, é implementar a fórmula canônica do Combat Model dentro
de `BossCombatSystem` — mas isso é, deliberadamente, trabalho de uma
próxima Sprint, não desta.
