# Integration Readiness Review — 2026-07-02

**Escopo:** Ping, SessionManager, XPSystemV2, WelcomeRewardSystem, DropSystem,
Gold/Ranking (caminho legado em `xp.service.ts`), auth/criação de personagem,
GameClock/EventBus, e a observabilidade adicionada nesta sessão — todos
rodando **juntos**, não isolados em harness. Boss fica fora deste documento
por decisão já tomada (Cenário A da live).

Todo achado abaixo tem referência a arquivo/linha. Nenhum foi corrigido —
este documento é auditoria, não correção.

---

## 1. Pronto para produção limitada

- **Loop Ping → SessionManager → world.tick → XP**, incluindo a redução
  "ao vivo em pelo menos um canal, XP concedido uma vez por personagem por
  tick" (`XPSystemV2.ts`). Lógica clara, testada, sem ambiguidade encontrada.
- **DropSystem ignorando `source !== "tick"`** — o bug de duplo-drop do
  Welcome Reward está corrigido e continua correto sob esta revisão.
- **Isolamento de erro do EventBus** — um handler quebrado não derruba os
  outros nem o tick. Verificado, sem exceção.
- **Constraints `UNIQUE` do banco** (`profiles.twitch_id`,
  `characters.profile_id`) protegem contra duplicação de dado real mesmo
  quando a lógica de aplicação tem uma corrida (ver 3.3) — a integridade dos
  dados está garantida mesmo quando a experiência do usuário não está.

## 2. Ainda experimental (nunca validado em conjunto)

- **Gold/Ranking** (`xp.service.ts`) — nunca rodou sob concorrência real
  consigo mesmo; toda validação anterior foi sequencial.
- **Overlay vs. Engine** — duas definições independentes de "quem está
  presente" (ver 3.9), nunca reconciliadas.
- **A observabilidade adicionada hoje** — validada isoladamente (smoke test),
  nunca sob carga simultânea real com todos os Systems ativos ao mesmo tempo.

## 3. Riscos concretos (bugs reais, com evidência)

### 3.1 Gold: lost update sob ping duplicado
`applyPing()` (`xp.service.ts:83-100`) lê `character.gold`, faz `await
isChannelLive(...)`, e só depois escreve `gold = character.gold + goldGain`.
Entre a leitura e a escrita existe um `await` real. Duas chamadas de
`/api/ping` para o mesmo personagem chegando perto o suficiente (duplo
clique, retry de rede, app mobile reenviando) leem o mesmo saldo antigo e a
segunda escrita sobrescreve a primeira — um dos dois ganhos de Gold
simplesmente some, sem erro, sem log de conflito. `viewer_sessions` e
`channel_rankings` não têm esse problema (usam `ON CONFLICT ... SET x = x +
?`, incremento atômico no próprio SQL) — só `characters.gold` está exposto.

### 3.2 Welcome Reward: concessão dupla sob sessão inicial em dois canais
Mesmo formato de bug que 3.1, lugar diferente. `WelcomeRewardSystem.ts`
verifica `hasReceivedWelcomeReward()`, depois `await isChannelLive()`, só
então concede XP e chama `markWelcomeRewardGranted()`
(`SQLiteCharacterRepository.ts:146-155`) — que é um `UPDATE` incondicional,
**não** guardado por `WHERE first_join_reward_at IS NULL`. Um personagem
novo que abra dois streams (dois canais) na primeira vez que usa o app
dispara `session.started` duas vezes quase simultaneamente; as duas
verificações de `hasReceivedWelcomeReward` podem ler "ainda não" antes de
qualquer uma escrever — resultado: Welcome Reward concedida duas vezes para
quem tecnicamente só devia receber uma. Baixa probabilidade (exige um
personagem genuinamente novo abrindo duas streams ao mesmo tempo), mas real.

**3.1 e 3.2 são o mesmo padrão**: checar-depois-agir atravessando um
`await`, sem guarda atômica no banco. Vale lembrar isso — é a segunda vez
que aparece nesta auditoria, registrando como observação, não como
princípio.

### 3.3 Callback de OAuth duplicado → 500 visível
`routes/auth.ts:41-59` — `SELECT` por `twitch_id`, e só se não encontrar,
`INSERT`. Existem dois `await` de rede (`exchangeTwitchCode`,
`fetchTwitchUser`) entre o `SELECT` e o `INSERT`. Duplo clique em "Entrar
com a Twitch", ou o navegador reenviando o callback, faz as duas requisições
passarem pelo `SELECT` como "perfil não existe" antes de qualquer uma
inserir — a segunda `INSERT` viola `profiles.twitch_id UNIQUE`, cai no
`catch` do handler, e essa requisição recebe um 500 puro
("Authentication failed"). Não corrompe dado (a constraint protege o
banco), mas é uma falha real e visível pro usuário na pior hora possível: o
primeiro login.

### 3.4 `refreshChannelPositions()` — reescrita completa a cada ping
`xp.service.ts:134-151` — toda vez que `applyPing()` termina com sucesso,
recalcula e reescreve a posição de **todos** os personagens já rankeados
naquele canal, um `UPDATE` por linha, síncrono (`node:sqlite` bloqueia a
única thread do Node durante cada chamada). Com poucos viewers, irrelevante.
Num canal com histórico de milhares de viewers rankeados, cada ping
individual passa a custar um full table scan + N updates, bloqueando
literalmente todas as outras requisições (inclusive pings de outras pessoas)
pela duração disso.

### 3.5 `isChannelLive()` sem nenhum cache, 4 chamadores reais
Confirmado na revisão arquitetural anterior, revisitado aqui com peso
operacional: `XPSystemV2` (uma vez por canal único por tick), `WelcomeRewardSystem`
(uma vez por `session.started`), `xp.service.ts` (uma vez por ping),
`BossSpawnSystem` (inativo hoje). Cada chamada é uma requisição HTTP real à
Twitch. Sem nenhum cache de resultado (só o token OAuth é cacheado). Em
escala, este é o candidato mais concreto a esbarrar em rate limit da Twitch
antes de qualquer coisa dentro do próprio StreamRPG quebrar.

### 3.6 `SessionManager` é um singleton em memória de processo único
Documentado no próprio código (`SessionManager.ts:122-133`) como correto
só em processo único. Se "5.000 streamers" algum dia exigir mais de uma
réplica do processo Node, cada réplica passa a ter sua própria visão
desconectada de "quem está presente" — XP, Welcome e Ranking ficam
incompletos silenciosamente para sessões vistas por uma réplica diferente
da que processa aquele tick.

### 3.7 `GameClock` sem guarda contra sobreposição de tick
Já encontrado num playtest anterior (registrado em memória, nunca
endereçado no código). `setInterval` dispara no relógio de parede,
independente de o tick anterior ainda ter trabalho assíncrono em andamento
(ex: `Promise.all` de `isChannelLive` por vários canais). Com poucos canais,
o tick sempre termina bem antes dos 60s. Em escala — muitos canais únicos
por tick, ou a própria Twitch respondendo devagar — dois ticks podem
sobrepor.

### 3.8 Ponto único de falha: credencial da Twitch
Se o token OAuth (app access token) expirar ou as credenciais estiverem
erradas, `isChannelLive()` cai no `catch` e retorna `false` para todo mundo,
silenciosamente. Nenhum XP, Gold, Welcome ou Drop é concedido para
ninguém, a rota de ping continua respondendo 200 normalmente (só com
ganhos zerados) — nada quebra visivelmente, o jogo só "para de dar
recompensa" pra audiência inteira ao mesmo tempo, sem nenhum erro visível
fora do log do servidor.

### 3.9 Overlay e Engine usam duas janelas de presença diferentes
`getOverlayViewers()` (`xp.service.ts`) usa um corte de 5 minutos sobre
`channel_rankings.last_ping_at`. O `SessionManager` (o que realmente decide
quem ganha XP) usa 90 segundos. Um viewer que parou de pingar há 2 minutos
ainda aparece na lista pública do overlay como "presente", mas já não está
mais recebendo XP do Engine há mais de meio minuto. Duas definições
independentes de presença, nunca reconciliadas, construídas em momentos
diferentes do projeto.

## 4. O que observar durante a live de hoje

Ligado direto às perguntas de retenção já definidas:
- Se 3.1 ou 3.2 acontecerem de verdade, os logs de hoje (Tick Summary,
  `applyPing`, Session End) têm dado suficiente pra confirmar — observar sem
  precisar reproduzir de propósito.
- 3.3 só importa se houver mais de uma pessoa nova entrando pela primeira
  vez — improvável com poucos espectadores, mas se acontecer um 500 no
  login, já sabemos a causa.
- 3.8 é o único item desta lista que merece checagem **ativa antes** da
  live começar (token/credenciais válidos) — se isso falhar durante a live,
  é indistinguível de "o jogo não está engajando", quando na verdade é uma
  falha de configuração.
- 3.9 é só para não estranhar: se o overlay mostrar alguém que parece não
  estar ganhando XP, essa é a explicação, não um bug novo.

## 5. O que pode esperar

Tudo que só importa em escala muito além da live de hoje: 3.4
(`refreshChannelPositions`), 3.5 (dedup de `isChannelLive`), 3.6
(`SessionManager` horizontal), 3.7 (guarda de tick). Nenhum desses afeta uma
live de um canal com audiência normal.

Mais a lista de limpeza, na ordem que você já definiu — `XPSystem.ts` morto,
`drop_log` órfã, `composite:true`, erros antigos de `tsc`, índices
pendentes, débitos pequenos de B1-B4: todos ficam explicitamente depois de
Estabilidade → Integração → Operação, como você já decidiu.

## 6. O que não pode esperar

- **Confirmar credenciais da Twitch antes da live** (3.8) — único item
  desta revisão com prazo real de hoje.
- **3.1 e 3.2 (as duas corridas de checar-depois-agir)** — não bloqueiam a
  live de hoje (baixa probabilidade, baixo dano), mas são o candidato mais
  forte a virar a próxima Sprint de Estabilidade depois da live, exatamente
  porque são causadas por comportamento real de usuário (duplo clique,
  retry, duas abas), não por cenário artificial de teste.
