# MVP Readiness Review

**Status: 🟠 Auditoria final antes de implementação contínua.** Baseada em
leitura completa de `docs/game-design-bible/`, `docs/technical-design/`,
`docs/gameplay-design/`, `docs/combat-model/`, `docs/world-design/`,
`docs/reviews/` e do código real em `apps/api/src`, `apps/web/src`,
`packages/shared/src` — nada aqui foi assumido por memória de conversas
anteriores sem reconfirmação linha a linha no código atual.

---

## 1. Resumo Executivo

A arquitetura (Engine/EventBus/GameClock/SessionManager) é sólida, testada
e não tem nenhuma contradição com a documentação. XP, Gold, Welcome
Reward, Drop, Inventário, Ranking, Sessão e OAuth estão implementados e
batem com o que a Bible descreve, incluindo os débitos já conhecidos
(bug de RNG do drop, UI-001, Gold no caminho legado).

**O achado mais importante desta auditoria não é uma contradição entre
documentos — é uma contradição entre o que a documentação técnica afirma
e o que o código realmente executa em qualquer ambiente:** o BossSystem
inteiro (`BossSpawnSystem`, `BossParticipationSystem`, `BossCombatSystem`,
`BossRewardSystem`) existe, compila, tem Repository e tabelas de banco
reais, e foi validado via harness isolado — mas **nunca foi registrado no
EventBus de `server.ts`**. Nenhuma dessas quatro classes é instanciada em
nenhum lugar do código de produção. Isso significa que, hoje, em qualquer
ambiente (local ou Railway), **um Boss nunca nasce, nunca é invocado, e
nunca gera recompensa** — apesar de toda a documentação (Bible capítulo 6,
Technical Design, Gameplay Design, Combat Model) tratar Boss como "MVP
fechado" e usá-lo como base de comparação repetidamente.

Isso não é um bug de lógica — é uma decisão de escopo que ficou aberta
demais: cada Sprint de Boss (B1-B4) documentou explicitamente "não
conectado a server.ts ainda", com a intenção declarada de conectar "quando
o ciclo completo B1-B5 for revisado em conjunto". Essa revisão nunca
aconteceu, e nenhuma Sprint de design subsequente (Gameplay Design,
Combat Model, os dois reviews cruzados) percebeu isso, porque nenhuma
delas releu o código de produção — todas compararam documento com
documento, ou documento com o Technical Design (que já dizia "implementado
e validado", uma afirmação verdadeira só dentro do harness isolado).

---

## 2. Estado atual do projeto (evidência, não opinião)

| Camada | Estado real, confirmado em código |
|---|---|
| Engine (Clock/Bus/SessionManager) | Rodando, testada (`GameClock.test.ts`, `GameEngine.test.ts`, `EventBus.test.ts`), sem mudança pendente |
| XP/Level/Welcome/Drop | Rodando via Engine desde Marco 1.0, confirmado em `server.ts` linhas 40-56 |
| Gold | Rodando via caminho legado (`applyPing()`), decisão deliberada e documentada |
| Boss | **Código completo, zero execução em qualquer ambiente** — não instanciado em `server.ts`, sem rota HTTP |
| Combat Model / Gameplay Design (Classes, Resistência, SUS, UTI) | 100% documentação, 0% código — nenhum schema, nenhum System |
| World Design (regiões, cidades, expedições) | 100% documentação, 0% código |

---

## 3. Arquitetura

### Fluxo do jogador (confirmado em código)

```
Login (Twitch OAuth, routes/auth.ts)
   → callback cria profile + character (se novo, character.ts:createCharacter)
   → cookie de sessão (tabela `sessions`, middleware/auth.ts)
Ping (routes/ping.ts)
   → sessionManager.reportPresent() [emite session.started se novo]
   → applyPing() [gold direto, cooldown, live check — services/xp.service.ts]
world.tick (GameClock, a cada 60s)
   → XPSystemV2 [checa live por canal, aplica XP, emite xp.granted source="tick"]
   → DropSystem [reage a xp.granted source="tick", rola drop, emite drop.granted]
session.started
   → WelcomeRewardSystem [reivindicação atômica, aplica XP, emite xp.granted source="welcome"]
Inventário/Equipar (routes/items.ts → services/drop.service.ts) — real, funcional
Ranking (routes/ranking.ts → services/xp.service.ts:getRanking) — real, corrigido
Boss (systems/Boss*.ts) — código completo, ZERO wiring em server.ts, ZERO rota HTTP
```

### Salto lógico identificado

**Boss: "isso acontece" segundo a documentação, mas ninguém o dispara no
código real.** `server.ts` (linhas 37-56) instancia `SQLiteCharacterRepository`,
`EventBus`, `GameEngine`, `XPSystem`, `WelcomeRewardSystem`, `SQLiteItemRepository`,
`RandomProviderImpl`, `DropSystem` — e para por aí. Nenhum import de
`BossSpawnSystem`/`BossParticipationSystem`/`BossCombatSystem`/`BossRewardSystem`
existe em `server.ts`. Confirmado via busca em todo o repositório: essas
quatro classes só aparecem nos próprios arquivos que as definem e em
`engine/types.ts` (interfaces) — nenhum outro arquivo de produção as
referencia.

### Fluxo da economia

Confirmado: XP/Level/Drop via Engine (assíncrono, por tick); Gold via
`applyPing()` (síncrono, incremento atômico `gold = gold + ?`); nenhuma
das duas camadas se sobrepõe ou contradiz a outra.

### Fluxo do inventário

Real e completo: `GET /api/items`, `POST /api/items/equip`,
`POST /api/items/unequip` — todos batem com o schema de 6 slots
(`weapon, armor, helmet, boots, amulet, ring`) confirmado em
`packages/shared/src/types.ts` e `config/schema.ts`.

---

## 4. Documento × Código

| Sistema | Classificação | Evidência |
|---|---|---|
| XP | 🟢 | `XPSystemV2.ts` bate com capítulo 5 da Bible, testado |
| Gold | 🟢 | Caminho legado documentado como exceção deliberada (capítulo 5), `xp.service.ts` confirma |
| Welcome | 🟢 | Reivindicação atômica confirmada em `SQLiteCharacterRepository.markWelcomeRewardGranted` |
| Drop | 🟡 | Implementado, mas com o bug de RNG já documentado (`DropSystem.ts` reaproveita `rng` do gate para `pickRarity`) — código bate exatamente com o que a doc diz que está quebrado |
| Ranking | 🟢 | Subquery live confirmada em `xp.service.ts:135-143`, corrige a staleness já documentada |
| Combat (Combat Model) | 🔴 **Documento muito adiantado** | Zero linha de código implementa físico/mágico, Resistência, Penetração, Blooqueio, SUS, UTI |
| Boss | 🔴 **Documento adiantado, mas de forma enganosa** | Código existe e passa em harness isolado — a lacuna não é "não escrito", é "escrito e nunca ligado" |
| Inventory | 🟢 | `routes/items.ts` + `services/drop.service.ts`, real |
| Character | 🟢 | `routes/character.ts`, bate com capítulo 3 |
| Overlay | 🟡 | Backend corrigido (90s), frontend (`OverlayPage.tsx:33`) ainda diz "últimos 5 minutos" — divergência entre camadas do próprio código |
| Session | 🟢 | `SessionManager.ts`, 90s, bate com toda a documentação |
| OAuth | 🟢 | Investigado anteriormente (sem await entre SELECT/INSERT), reconfirmado no código atual |

---

## 5. Contradições

### C1 — Boss "implementado e validado" vs. Boss nunca executado (🔴 mais grave)

**Origem:** cada Sprint B1-B4 adiou conscientemente a conexão a `server.ts`,
prometendo revisar "quando o ciclo completo existir" — isso nunca
aconteceu, e nenhuma Sprint de design posterior notou, porque nenhuma
releu `server.ts`. **Consequência:** toda comparação "Combat Model vs.
Boss real" feita nos reviews anteriores (Sprint 4) estava tecnicamente
certa sobre a fórmula (`DAMAGE_PER_CHARACTER_PER_TICK` fixo), mas incompleta
sobre o quadro maior (o sistema nem roda). **Custo futuro:** baixo para
corrigir (wiring + uma rota de invocação), mas cresce a cada Sprint de
design que continuar assumindo Boss como referência funcional. **Urgência:**
média-alta — não quebra nada hoje (nada depende de Boss rodando), mas
bloqueia qualquer validação real de 4 Sprints de trabalho já feito.

### C2 — `OVERLAY_ACTIVE_SECONDS` nomeada, mas não é a fonte de verdade (🟡, já conhecida)

Declarada em `packages/shared/src/xp.ts:6`, reexportada por
`routes/overlay.ts:76`, nunca lida por `getOverlayViewers()` (que usa `90`
hardcoded, `xp.service.ts:199`). Achado anterior (grep de constantes
duplicadas), ainda não corrigido.

### C3 — `channel.service.ts` e `xp.service.ts` usam janelas diferentes para "ativo" (🟡, já conhecida)

`getStreamerDashboard()` usa `cutoff = nowUnix() - 300` (`channel.service.ts:75`);
`getOverlayViewers()` usa `90` (`xp.service.ts:199`). Painel do streamer e
Overlay público mostram contagens de "ativos" com critérios diferentes.

### C4 — Frontend descreve um comportamento que o backend já mudou (🟡, já conhecida)

`OverlayPage.tsx:33`: "Nenhum viewer ativo nos últimos 5 minutos" — texto
não atualizado desde a correção do backend para 90s.

### C5 — Configuração morta pode ser lida como configuração real (🟢, baixo risco)

`sessionSecret`/`JWT_SECRET` (`config/env.ts:30`) declarado, nunca
consumido em nenhum outro arquivo — sessões usam cookie opaco + tabela
`sessions`, não JWT assinado. Confirmado via busca: único hit é a própria
declaração.

### C6 — URL do Twitch Helix não escapa `channelLogin` (🟢, baixo risco prático)

`twitch.service.ts:51`: `` `...streams?user_login=${channelLogin}` `` sem
`encodeURIComponent()`. Risco prático baixo (valor vem de login já
validado via OAuth ou input de canal), mas tecnicamente não sanitizado.

---

## 6. Fluxos

Percorrendo o ciclo pedido:

```
Login ✅ → Criar personagem ✅ → Entrar no canal ✅ → Ping ✅ → XP ✅ →
Gold ✅ → Drop ✅ (com bug de raridade conhecido) → Inventário ✅ →
Equipar ✅ → Exploração 🛑 PARA AQUI → Combate 🛑 → Boss 🛑 (código
existe, nunca executa) → Recompensa 🛑 → Ranking ✅ (inatingível no
fluxo real, mas funcional isoladamente) → Logout ✅
```

O fluxo real e executável hoje termina em **Equipar**. Tudo a partir de
**Exploração** não existe em nenhuma forma executável — é integralmente
World Design/Gameplay Design em documento. **Boss é um caso à parte:** não
é "não escrito" como Exploração/Combate, é "escrito, testado, e nunca
ligado" — categoria diferente, tratada separadamente na seção 5/C1.

---

## 7. Débitos

**Débito técnico:**
- `isChannelLive()` chamado sem cache compartilhado por tick (débito já
  registrado, hoje só afeta `XPSystemV2`, dobraria se Boss for conectado
  sem resolver isso primeiro).
- Índice ausente para `findAwaitingPastDeadline` (`BossRepository`).
- `nowUnix()` chamado direto no handler de tick em vez de derivado de
  `event.timestamp` (violação documentada, efeito hoje desprezível).
- `tsconfig` sem `composite`, bloqueando typecheck completo do monorepo.
- `channelLogin` sem `encodeURIComponent()` (seção 5/C6).
- `sessionSecret` morto (seção 5/C5).

**Débito de produto:**
- Boss nunca conectado ao servidor (o maior item desta lista inteira).
- UI-001: `drop`/`leveled_up` sempre `null`/`false` na resposta do ping —
  popups de "Level up!"/"Drop" nunca aparecem, apesar do dado estar
  correto no banco.
- Overlay/Streamer Dashboard com janelas de "ativo" divergentes (seção
  5/C3) e texto desatualizado (seção 5/C4).

**Débito de conteúdo:**
- RNG do Drop sempre resolve `common` — lógica correta, parâmetros
  incompatíveis entre si (bug de balanceamento, não técnico).
- Nenhuma região/mapa/monstro do World Design existe como dado — 100%
  ainda é texto.
- Boss só tem Tier 1 calibrado (`TIER_MAX_HP = {1: 500}`).

**Débito documental:**
- A "Documentation Constitution" discutida e "promovida" em sessão
  anterior nunca foi escrita em nenhum arquivo real — continua só em
  histórico de conversa.
- Vento e Escuridão (`docs/world-design/environmental-mechanics.md`)
  seguem dependendo implicitamente de precisão/chance, com a correção já
  recomendada (Sprint 4) mas não aplicada, por restrição de escopo
  daquela Sprint.

---

## 8. Riscos de implementação

Se a equipe entrar em seis semanas seguidas só implementando funcionalidades:

1. **Implementar Combat Model "dentro" do Boss sem primeiro ligar o Boss
   existente ao servidor** é o risco mais concreto — o time pode escrever
   a fórmula canônica corretamente e só descobrir problemas de integração
   (rotas, EventBus, Frontend Event Bridge) na hora de efetivamente testar
   em produção, tarde demais para ser barato.
2. **Onde mora a Classe do personagem** nunca foi decidido no schema —
   qualquer Sprint de Combat Model vai precisar responder isso antes de
   escrever a primeira linha, ou vai improvisar uma decisão de schema sem
   revisão.
3. **`ItemSlot` precisa crescer** (arma mágica, Escudo) — decisão de
   "estender o enum atual" vs. "criar um sub-tipo novo" afeta todo código
   que já assume os 6 slots atuais (frontend, seed de itens, `getItemPower()`).
4. **Região/Expedição exige um tipo de estado que a Engine não tem hoje**
   — `GameContext` só sabe de sessões por canal; posição/expedição por
   personagem é um conceito genuinamente novo, não uma tabela a mais.
5. **Converter `SLOT_DEFENSE_WEIGHT` de peso plano para percentual de
   Resistência quebra `comparePower()` do frontend silenciosamente** se
   feito sem ajustar os dois lados juntos — o badge "melhor/pior" do
   Inventário soma `attack + defense`, o que deixa de fazer sentido se
   `defense` virar percentual.
6. **`SessionManager` é singleton em memória, single-process** — qualquer
   Sprint que aumente o estado por-personagem-por-tick (expedições)
   aumenta a pressão sobre essa decisão antes de qualquer plano de escala
   real existir.

---

## 9. Ordem das próximas implementações

Só implementação, sem novos documentos:

1. **Conectar Boss a `server.ts`** (instanciar os 4 Systems, registrar no
   `EventBus`, criar a rota HTTP de invocação manual) — destrava a
   validação real de 4 Sprints já escritas e testadas isoladamente.
2. **Corrigir as divergências de texto/janela já conhecidas** (Overlay
   "5 minutos", `channel.service.ts` 300s) — baixo custo, remove ruído
   documentado há várias Sprints.
3. **Adicionar um campo mínimo de Classe a `Character`** (mesmo que só uma
   classe default por enquanto) — destrava qualquer Sprint de Combat
   Model.
4. **Implementar a fórmula canônica dentro de `BossCombatSystem`**,
   substituindo `DAMAGE_PER_CHARACTER_PER_TICK` — primeira aplicação real
   do Combat Model, sobre um sistema que (depois do passo 1) já roda de
   verdade.
5. **Decidir e migrar o schema de item** para suportar tipo físico/mágico
   e o slot de Escudo — feito depois de já existir um consumidor real
   (passo 4) para validar contra, não antes.
6. **Só depois, abrir a primeira Sprint de Região/Expedição** (novo
   `GameContext`, novo System) — a peça estruturalmente mais nova de
   todas, corretamente por último.

---

## 10. Veredito Final

**Sim — o StreamRPG pode entrar em implementação contínua sem expectativa
de redesenho arquitetural significativo — com uma condição sequencial
explícita, não uma ressalva vaga: conectar Boss ao servidor precisa ser
tratado como a primeira Sprint, não uma continuação implícita de algo
que "já está pronto".**

Nenhuma contradição encontrada nesta auditoria exige jogar fora ou
redesenhar uma decisão de arquitetura já tomada — Engine, EventBus,
GameClock e SessionManager continuam corretos e testados, e o Combat
Model/Gameplay Design, embora inteiramente não implementados, não
contradizem o que já roda: eles simplesmente ainda não se encontraram com
o código. A única descoberta desta auditoria que muda a leitura do
projeto é que **Boss, tratado em toda a documentação recente como "MVP
fechado" e usado repetidamente como ponto de comparação, nunca executou
em nenhum ambiente** — isso não invalida o design nem o código já escrito,
mas significa que a primeira Sprint de implementação contínua precisa ser
"ligar o que já existe", não "construir a fórmula canônica em cima de um
sistema que já roda" — porque, hoje, esse sistema não roda.
